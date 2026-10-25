import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { cinemas, fmtDate, getShows, movies, nextDays } from "@/lib/data";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/cinemas")({
  head: () => ({
    meta: [
      { title: "Cinemas & Showtimes | RYZENX Cinema" },
      { name: "description", content: "Find RYZENX Cinema branches across Kathmandu, Bhaktapur and Pokhara, with today's showtimes." },
      { property: "og:title", content: "Cinemas & Showtimes | RYZENX Cinema" },
      { property: "og:description", content: "RYZENX branches and showtimes across Nepal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CinemasPage,
});

function CinemasPage() {
  const days = nextDays(3);
  const [date, setDate] = useState(days[0]!);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-[1200px] px-4 py-10 md:px-8">
        <h1 className="text-4xl md:text-5xl">Cinemas & Showtimes</h1>
        <p className="mt-2 max-w-[600px] text-sm text-muted-foreground">Pick a branch, pick a time, and you're set. All prices in NPR.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {days.map((d) => (
            <button key={d} onClick={() => setDate(d)} className={`rounded-md border px-4 py-2 text-sm ${d === date ? "border-gold bg-gold font-semibold text-gold-foreground" : "border-border bg-card"}`}>{fmtDate(d)}</button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {cinemas.map((c) => {
            const shows = movies.filter((m) => m.status === "now").flatMap((m) => getShows(m.id, date).filter((s) => s.cinemaId === c.id).map((s) => ({ ...s, movie: m })));
            return (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl">{c.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{c.area}</p>
                  </div>
                  <a href={c.map} target="_blank" rel="noreferrer" className="text-sm text-gold hover:underline">Get directions</a>
                </div>
                <div className="mt-4 space-y-2">
                  {movies.filter((m) => m.status === "now").map((m) => {
                    const ms = shows.filter((s) => s.movieId === m.id);
                    if (!ms.length) return null;
                    return (
                      <div key={m.id} className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center">
                        <p className="text-sm font-semibold sm:w-44">{m.title} <span className="font-normal text-muted-foreground">· {m.language}</span></p>
                        <div className="flex flex-wrap gap-2">
                          {ms.map((s) => (
                            <Link key={s.id} to="/book/$showId" params={{ showId: s.id }} className="rounded-md border border-border px-3 py-1.5 text-center text-xs hover:border-gold hover:text-gold">
                              <span className="font-semibold">{s.time}</span> <span className="opacity-60">{s.format}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
