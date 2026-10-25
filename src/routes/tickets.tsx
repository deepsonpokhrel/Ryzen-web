import { createFileRoute, Link } from "@tanstack/react-router";
import { cancelBooking, useBookings } from "@/lib/bookings";
import { GoldenTicket } from "@/components/GoldenTicket";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "My Tickets | RYZENX Cinema" },
      { name: "description", content: "View and manage your RYZENX Cinema bookings and Golden Tickets." },
      { property: "og:title", content: "My Tickets | RYZENX Cinema" },
      { property: "og:description", content: "Your RYZENX Golden Tickets in one place." },
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
        <h1 className="mb-6 text-4xl md:text-5xl">My Tickets</h1>
        {list.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            No bookings yet. <Link to="/movies" className="text-gold hover:underline">Find your next favorite</Link>
          </div>
        )}
        <div className="space-y-4">
          {list.map((b) => {
            const past = new Date(b.date + "T23:59:59") < new Date();
            return (
              <div key={b.ref}>
                <GoldenTicket booking={b} />
                {b.status === "Confirmed" && !past && (
                  <button onClick={() => confirm("Cancel this booking? Refunds follow the cinema policy.") && cancelBooking(b.ref)} className="mt-2 text-xs text-muted-foreground hover:text-destructive">
                    Cancel booking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
