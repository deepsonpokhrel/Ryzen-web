import { Clapperboard } from "lucide-react";
import { cinemas, fmtDate, movies, npr } from "@/lib/data";
import type { Booking } from "@/lib/bookings";

/** The Golden Ticket — RYZENX's signature digital ticket. */
export function GoldenTicket({ booking: b }: { booking: Booking }) {
  const m = movies.find((x) => x.id === b.movieId);
  const c = cinemas.find((x) => x.id === b.cinemaId);
  return (
    <div className={`overflow-hidden rounded-xl border border-gold/60 bg-card shadow-glow ${b.status === "Cancelled" ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between bg-gold px-5 py-2.5 text-gold-foreground">
        <span className="flex items-center gap-2 font-display text-sm font-bold tracking-wide"><Clapperboard className="h-4 w-4" />RYZENX GOLDEN TICKET</span>
        <span className="text-xs font-semibold">{b.ref}</span>
      </div>
      <div className="flex gap-4 p-5">
        {m && <img src={m.poster} alt="" className="h-28 w-20 rounded object-cover" />}
        <div className="flex-1 text-sm">
          <p className="font-display text-2xl">{m?.title}</p>
          <p className="text-muted-foreground">{c?.name} · {fmtDate(b.date)} · {b.time} · {b.format}</p>
          <p className="mt-2">Seats <b>{b.seats.join(", ")}</b></p>
          <p className="text-muted-foreground">{npr(b.total)} · {b.payment}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-gold/50 px-5 py-3 text-xs text-muted-foreground">
        <span>{b.name}</span>
        <span className={b.status === "Confirmed" ? "font-semibold text-success" : "font-semibold text-destructive"}>{b.status}</span>
      </div>
    </div>
  );
}
