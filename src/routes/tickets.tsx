import { createFileRoute, Link } from "@tanstack/react-router";
import { cinemas, fmtDate, movies, npr } from "@/lib/data";
import { cancelBooking, useBookings } from "@/lib/bookings";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "My Tickets | QFX Cinemas" },
      { name: "description", content: "View and manage your QFX Cinemas bookings and digital tickets." },
      { property: "og:title", content: "My Tickets | QFX Cinemas" },
      { property: "og:description", content: "Your QFX digital tickets in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tickets,
});

function Tickets() {
  const list = useBookings();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-5xl">My Tickets</h1>
        {list.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            No bookings yet. <Link to="/" className="text-primary">Browse movies</Link>
          </div>
        )}
        <div className="space-y-4">
          {list.map((b) => {
            const m = movies.find((x) => x.id === b.movieId); const c = cinemas.find((x) => x.id === b.cinemaId);
            const past = new Date(b.date + "T23:59:59") < new Date();
            return (
              <div key={b.ref} className={`flex gap-4 rounded-xl border border-border bg-card p-4 ${b.status === "Cancelled" ? "opacity-50" : ""}`}>
                <img src={m?.poster} alt="" className="h-28 w-20 rounded object-cover" />
                <div className="flex-1 text-sm">
                  <div className="flex items-start justify-between">
                    <p className="font-display text-2xl">{m?.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${b.status === "Confirmed" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>{b.status}</span>
                  </div>
                  <p className="text-muted-foreground">{c?.name} · {fmtDate(b.date)} · {b.time} · {b.format}</p>
                  <p className="mt-1">Seats <b>{b.seats.join(", ")}</b> · {npr(b.total)} · Ref <b>{b.ref}</b></p>
                  {b.status === "Confirmed" && !past && (
                    <button onClick={() => confirm("Cancel this booking? Refunds follow the cinema policy.") && cancelBooking(b.ref)} className="mt-2 text-xs text-primary">Cancel booking</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
