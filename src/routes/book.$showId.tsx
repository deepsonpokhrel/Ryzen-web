import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Timer } from "lucide-react";
import { cinemas, COLS, CONVENIENCE_FEE, fmtDate, movies, npr, parseShowId, PRICES, ROWS, seatCategory, seatPrice, soldSeats } from "@/lib/data";
import { addBooking, bookedSeatsFor, newRef, type Booking } from "@/lib/bookings";
import { Logo } from "@/components/SiteHeader";

export const Route = createFileRoute("/book/$showId")({
  loader: ({ params }) => {
    const show = parseShowId(params.showId);
    if (!show) throw notFound();
    return { show };
  },
  head: () => ({
    meta: [
      { title: "Select Seats | QFX Cinemas" },
      { name: "description", content: "Choose your seats and complete your QFX Cinemas booking." },
      { property: "og:title", content: "Select Seats | QFX Cinemas" },
      { property: "og:description", content: "Choose seats and check out securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookPage,
});

const HOLD = 10 * 60;
const MAX = 10;

function BookPage() {
  const { show } = Route.useLoaderData();
  const movie = movies.find((m) => m.id === show.movieId)!;
  const cinema = cinemas.find((c) => c.id === show.cinemaId)!;
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [left, setLeft] = useState(HOLD);
  const [taken, setTaken] = useState<Set<string>>(() => soldSeats(show.id));
  const [form, setForm] = useState({ name: "", email: "", phone: "", payment: "eSewa" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Booking | null>(null);

  useEffect(() => { setTaken(new Set([...soldSeats(show.id), ...bookedSeatsFor(show.id)])); }, [show.id]);
  useEffect(() => {
    if (!sel.length || done) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [sel.length, done]);
  useEffect(() => { if (left <= 0) { setSel([]); setStep(1); setLeft(HOLD); setErr("Your seat hold expired. Please choose seats again."); } }, [left]);

  const subtotal = useMemo(() => sel.reduce((s, id) => s + seatPrice(id[0]!, show.format), 0), [sel, show.format]);
  const fees = sel.length * CONVENIENCE_FEE;
  const total = subtotal + fees;

  const toggle = (id: string) => {
    setErr("");
    if (taken.has(id)) return;
    setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length >= MAX ? (setErr(`Max ${MAX} seats per booking.`), s) : [...s, id]);
  };

  const pay = () => {
    if (form.name.trim().length < 2) return setErr("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Please enter a valid email.");
    if (!/^9[78]\d{8}$/.test(form.phone)) return setErr("Enter a 10-digit Nepali mobile number (98XXXXXXXX).");
    const fresh = bookedSeatsFor(show.id);
    if (sel.some((s) => fresh.has(s))) return setErr("Some seats were just taken. Please reselect.");
    const b: Booking = { ref: newRef(), showId: show.id, movieId: movie.id, cinemaId: cinema.id, date: show.date, time: show.time, format: show.format, seats: [...sel].sort(), total, ...form, status: "Confirmed", createdAt: new Date().toISOString() };
    addBooking(b); setDone(b); setStep(3);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const steps = ["Select Seats", "Checkout", "Confirmation"];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <Logo />
          <ol className="mx-auto flex gap-4 text-xs md:gap-10">
            {steps.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${step >= i + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${step >= i + 1 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {step < 3 && (
          <button onClick={() => (step === 2 ? setStep(1) : nav({ to: "/movies/$id", params: { id: movie.id } }))} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        {step === 3 && done ? (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 text-4xl">Booking confirmed</h1>
            <p className="mt-1 text-sm text-muted-foreground">Reference <b className="text-foreground">{done.ref}</b> · sent to {done.email}</p>
            <div className="my-6 border-y border-dashed border-border py-5 text-left text-sm">
              <p className="font-display text-2xl">{movie.title}</p>
              <p className="text-muted-foreground">{cinema.name} · {fmtDate(show.date)} · {show.time} · {show.format}</p>
              <p className="mt-2">Seats: <b>{done.seats.join(", ")}</b></p>
              <p>Paid: <b>{npr(done.total)}</b> via {done.payment}</p>
            </div>
            <div className="flex justify-center gap-3">
              <Link to="/tickets" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">View My Tickets</Link>
              <Link to="/" className="rounded-md border border-border px-5 py-2.5 text-sm">Home</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[280px_1fr_280px]">
            <aside className="space-y-5 rounded-xl border border-border bg-card p-5">
              <div className="flex gap-3">
                <img src={movie.poster} alt="" className="h-20 w-14 rounded object-cover" />
                <div className="text-xs text-muted-foreground">
                  <p className="text-sm font-semibold text-foreground">{movie.title}</p>
                  <p>{cinema.name}</p><p>{fmtDate(show.date)} · {show.time}</p><p>{show.format} · {movie.language}</p>
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Selected Seats</span>{sel.length > 0 && step === 1 && <button onClick={() => setSel([])} className="text-xs text-primary">Remove all</button>}</div>
                <div className="flex flex-wrap gap-2">{sel.length ? sel.map((s) => <span key={s} className="rounded border border-border px-2 py-1 text-xs">{s}</span>) : <span className="text-xs text-muted-foreground">None yet</span>}</div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>{sel.length} × tickets</span><span>{npr(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Convenience fee</span><span>{npr(fees)}</span></div>
                <div className="flex justify-between pt-2 font-semibold"><span>Total</span><span>{npr(total)}</span></div>
              </div>
              {sel.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-border p-3 text-xs">
                  <Timer className="h-6 w-6 text-primary" />
                  <div><p className="font-semibold">Seats held for {mm}:{ss}</p><p className="text-muted-foreground">Complete booking before seats are released.</p></div>
                </div>
              )}
            </aside>

            {step === 1 ? (
              <section className="overflow-x-auto rounded-xl border border-border bg-card p-5">
                <div className="mx-auto mb-8 w-4/5 border-t-4 border-foreground/40 pt-2 text-center text-[10px] tracking-[0.4em] text-muted-foreground" style={{ borderRadius: "50% 50% 0 0 / 20px 20px 0 0" }}>SCREEN</div>
                <div className="mx-auto w-fit space-y-2">
                  {ROWS.map((r) => (
                    <div key={r} className="flex items-center gap-1.5">
                      <span className="w-4 text-xs text-muted-foreground">{r}</span>
                      {Array.from({ length: COLS }, (_, i) => {
                        const id = `${r}${i + 1}`; const cat = seatCategory(r);
                        const isT = taken.has(id), isS = sel.includes(id);
                        const base = cat === "Recliner" ? "bg-seat-recliner" : cat === "Premium" ? "bg-seat-premium" : "bg-seat";
                        return (
                          <button key={id} disabled={isT} onClick={() => toggle(id)} aria-label={`Seat ${id} ${cat}${isT ? " unavailable" : ""}`} aria-pressed={isS}
                            className={`h-6 w-6 rounded-t-md text-[9px] transition ${i === 6 ? "mr-4" : ""} ${isT ? "cursor-not-allowed bg-seat-taken" : isS ? "bg-primary text-primary-foreground" : `${base} text-background/70 opacity-80 hover:opacity-100`}`}>
                            {isS ? i + 1 : ""}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
                  {[["bg-seat", "Available"], ["bg-primary", "Selected"], ["bg-seat-taken", "Unavailable"]].map(([c, l]) => <span key={l} className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${c}`} />{l}</span>)}
                </div>
                {err && <p className="mt-4 text-center text-sm text-destructive">{err}</p>}
              </section>
            ) : (
              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-3xl">Your details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([["name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Mobile (98XXXXXXXX)", "tel"]] as const).map(([k, l, t]) => (
                    <label key={k} className="text-sm">
                      <span className="mb-1 block text-muted-foreground">{l}</span>
                      <input type={t} value={form[k]} maxLength={100} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-ring" />
                    </label>
                  ))}
                </div>
                <h3 className="mb-3 mt-6 text-sm font-semibold">Payment method</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["eSewa", "Khalti", "Card"].map((p) => (
                    <button key={p} onClick={() => setForm({ ...form, payment: p })} className={`rounded-md border px-4 py-3 text-sm ${form.payment === p ? "border-primary bg-primary/10" : "border-border"}`}>{p}</button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Demo mode: no real payment is taken. Live eSewa/Khalti integration comes later.</p>
                {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
              </section>
            )}

            <aside className="rounded-xl border border-border bg-card p-5 text-sm">
              <p className="mb-3 font-semibold">Seat category</p>
              {(Object.keys(PRICES) as (keyof typeof PRICES)[]).map((c) => (
                <div key={c} className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${c === "Recliner" ? "bg-seat-recliner" : c === "Premium" ? "bg-seat-premium" : "bg-seat"}`} />{c}</span>
                  <span>{npr(PRICES[c])}</span>
                </div>
              ))}
              {show.format !== "2D" && <p className="text-xs text-muted-foreground">+ {show.format} surcharge included in seat price</p>}
              <p className="mb-2 mt-5 font-semibold">Selected seats</p>
              {sel.map((s) => <div key={s} className="flex justify-between text-xs text-muted-foreground"><span>{s} · {seatCategory(s[0]!)}</span><span>{npr(seatPrice(s[0]!, show.format))}</span></div>)}
              <div className="mt-4 flex justify-between border-t border-border pt-3 font-semibold"><span>Total</span><span>{npr(total)}</span></div>
              <button disabled={!sel.length} onClick={() => (step === 1 ? (setErr(""), setStep(2)) : pay())} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40">
                {step === 1 ? "Continue to Checkout" : `Pay ${npr(total)}`} <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
