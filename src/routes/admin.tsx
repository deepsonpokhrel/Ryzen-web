import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Film, LayoutDashboard, MapPin, Ticket, TrendingUp, Armchair } from "lucide-react";
import { cinemas, getShows, movies, npr, nextDays } from "@/lib/data";
import { useBookings } from "@/lib/bookings";
import { Logo } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | QFX Cinemas" },
      { name: "description", content: "QFX Cinemas operations dashboard for staff." },
      { property: "og:title", content: "QFX Admin Dashboard" },
      { property: "og:description", content: "Cinema operations overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const NAV = [["Dashboard", LayoutDashboard], ["Movies", Film], ["Cinemas & Locations", MapPin], ["Showtimes", Calendar], ["Bookings & Tickets", Ticket], ["Reports", TrendingUp]] as const;

function Admin() {
  const bookings = useBookings();
  const conf = bookings.filter((b) => b.status === "Confirmed");
  const sales = conf.reduce((s, b) => s + b.total, 0);
  const seats = conf.reduce((s, b) => s + b.seats.length, 0);
  const today = nextDays(1)[0]!;
  const upcoming = movies.flatMap((m) => getShows(m.id, today).filter((s) => s.cinemaId === "civil-mall").slice(0, 1)).sort((a, b) => a.time.localeCompare(b.time));
  const pop = movies.map((m) => ({ m, n: conf.filter((b) => b.movieId === m.id).reduce((s, b) => s + b.seats.length, 0) })).sort((a, b) => b.n - a.n);

  return (
    <div className="flex min-h-screen bg-cream text-cream-foreground">
      <aside className="hidden w-60 shrink-0 flex-col bg-background p-4 text-foreground md:flex">
        <div className="mb-8 px-2"><Logo /></div>
        <nav className="space-y-1 text-sm">
          {NAV.map(([l, I], i) => (
            <div key={l} className={`flex items-center gap-3 rounded-md px-3 py-2 ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <I className="h-4 w-4" />{l}{i > 0 && <span className="ml-auto text-[9px] uppercase opacity-60">soon</span>}
            </div>
          ))}
        </nav>
        <Link to="/" className="mt-auto px-3 text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-4xl">Dashboard</h1>
        <p className="mb-6 text-sm opacity-60">Overview of your cinema operations (demo data from bookings on this device)</p>
        <div className="grid gap-4 md:grid-cols-3">
          {[["Ticket Sales", npr(sales), TrendingUp], ["Bookings", conf.length, Ticket], ["Seats Sold", seats, Armchair]].map(([l, v, I]) => {
            const Icon = I as typeof Ticket;
            return (
              <div key={l as string} className="flex items-center gap-4 rounded-xl border border-cream-border bg-cream-card p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <div><p className="text-xs opacity-60">{l as string}</p><p className="text-2xl font-semibold">{v as string}</p></div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-cream-border bg-cream-card p-5">
            <p className="mb-3 font-semibold">Upcoming Shows · Civil Mall</p>
            <table className="w-full text-sm">
              <thead className="text-left text-xs opacity-60"><tr><th className="py-2">Time</th><th>Movie</th><th>Format</th><th>Status</th></tr></thead>
              <tbody>{upcoming.map((s) => <tr key={s.id} className="border-t border-cream-border"><td className="py-2">{s.time}</td><td>{movies.find((m) => m.id === s.movieId)?.title}</td><td>{s.format}</td><td className="text-success">On time</td></tr>)}</tbody>
            </table>
          </div>
          <div className="rounded-xl border border-cream-border bg-cream-card p-5">
            <p className="mb-3 font-semibold">Recent Bookings</p>
            {conf.length === 0 && <p className="text-sm opacity-60">No bookings yet.</p>}
            {bookings.slice(0, 6).map((b) => (
              <div key={b.ref} className="border-t border-cream-border py-2 text-sm first:border-0">
                <p className="font-medium">{b.status === "Confirmed" ? "Booking confirmed" : "Booking cancelled"} · {b.ref}</p>
                <p className="text-xs opacity-60">{b.seats.length} seats · {npr(b.total)} · {cinemas.find((c) => c.id === b.cinemaId)?.name}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mb-3 mt-6 font-semibold">Popular Movies</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {pop.map(({ m, n }) => (
            <div key={m.id} className="flex gap-3"><img src={m.poster} alt="" className="h-16 w-11 rounded object-cover" /><div className="text-xs"><p className="font-semibold">{m.title}</p><p className="opacity-60">{n} tickets</p></div></div>
          ))}
        </div>
      </main>
    </div>
  );
}
