import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogueOptions } from '@/lib/catalogue';
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Globe, Play } from "lucide-react";
import { cinemas, fmtDate, getShows, movies, nextDays } from "@/lib/data";
import { useCity } from "@/lib/bookings";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/movies/$id")({
  loader: async ({ params,context }) => {
    const {movies}=await context.queryClient.ensureQueryData(catalogueOptions);
    const movie = movies.find((m) => m.id === params.id);
    if (!movie) throw notFound();
    return { movie };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.movie.title} — Showtimes | RYZENX Cinema` : "Movie | RYZENX Cinema" },
      { name: "description", content: loaderData?.movie.synopsis ?? "Movie showtimes at RYZENX Cinema." },
      { property: "og:title", content: loaderData ? `${loaderData.movie.title} at RYZENX Cinema` : "RYZENX Cinema" },
      { property: "og:description", content: loaderData?.movie.synopsis ?? "Showtimes and tickets." },
      { property: "og:type", content: "video.movie" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.movie.poster.startsWith('https://') ? [{property:'og:image',content:loaderData.movie.poster},{name:'twitter:image',content:loaderData.movie.poster}] : []),
    ],
  }),
  component: MoviePage,
});

function MoviePage() {
  const { movie: m } = Route.useLoaderData();
  const {data:{shows:allShows}}=useSuspenseQuery(catalogueOptions);
  const days = nextDays(5);
  const [date, setDate] = useState(days[0] ?? '');
  const [city, setCity] = useCity();
  const [format, setFormat] = useState("All");
  const [tab, setTab] = useState<"show" | "about">("show");
  const shows = allShows.filter(s=>s.movieId===m.id&&s.date===date).filter((s) => format === "All" || s.format === format);
  const list = cinemas.filter((c) => c.city === city).map((c) => ({ c, shows: shows.filter((s) => s.cinemaId === c.id) })).filter((x) => x.shows.length);
  const comingSoon = m.status === "soon";

  return (
    <div className="min-h-screen bg-cream text-cream-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden bg-background text-foreground">
        <img src={m.poster} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 md:flex-row md:px-8">
          <img src={m.poster} alt={m.title} width={672} height={992} className="w-44 rounded-lg border border-border shadow-2xl md:w-56" />
          <div className="flex flex-col justify-center">
            {comingSoon && <p className="mb-2 text-[11px] font-semibold tracking-[0.35em] text-gold">COMING TO THE BIG SCREEN</p>}
            <h1 className="text-4xl md:text-6xl">{m.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-foreground/80">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{m.duration}</span>
              <span>{m.genres.join(", ")}</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />{m.language}</span>
              <span>{m.rating}</span>
            </div>
            <p className="mt-4 max-w-xl text-foreground/85">{m.synopsis}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {!comingSoon && (
                <a href="#showtimes" className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground hover:opacity-90">
                  Book Tickets
                </a>
              )}
              <button onClick={() => alert("Trailers will be embedded from an authorised video partner — coming soon.")} className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-gold hover:text-gold">
                <Play className="h-4 w-4 fill-current" /> Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="showtimes" className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <div className="mb-6 flex gap-8 border-b border-cream-border">
          {(["show", "about"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 text-sm ${tab === t ? "border-primary font-semibold" : "border-transparent opacity-60"}`}>
              {t === "show" ? "Showtimes" : "About"}
            </button>
          ))}
        </div>

        {tab === "about" ? (
          <div className="max-w-[600px] space-y-2 text-sm">
            <p>{m.synopsis}</p>
            <p><b>Language:</b> {m.language} · <b>Certificate:</b> {m.rating} · <b>Runtime:</b> {m.duration}</p>
          </div>
        ) : comingSoon ? (
          <p className="rounded-lg border border-cream-border bg-cream-card p-6 text-sm opacity-70">Showtimes aren't out yet. Check back soon.</p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {days.map((d) => (
                <button key={d} onClick={() => setDate(d)} className={`rounded-md border px-4 py-2 text-sm ${d === date ? "border-primary bg-primary text-primary-foreground" : "border-cream-border bg-cream-card"}`}>{fmtDate(d)}</button>
              ))}
              <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-md border border-cream-border bg-cream-card px-3 text-sm" aria-label="City">
                {["Kathmandu", "Bhaktapur", "Pokhara"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-md border border-cream-border bg-cream-card px-3 text-sm" aria-label="Format">
                {["All", "2D", "3D", "IMAX"].map((c) => <option key={c} value={c}>{c === "All" ? "All Formats" : c}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              {list.length === 0 && <p className="rounded-lg border border-cream-border bg-cream-card p-6 text-sm opacity-70">No shows match these filters. Try another date or format.</p>}
              {list.map(({ c, shows }) => (
                <div key={c.id} className="flex flex-col gap-4 rounded-lg border border-cream-border bg-cream-card p-4 md:flex-row md:items-center">
                  <div className="md:w-56">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs opacity-60">{c.area}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {shows.map((s) => (
                      <Link key={s.id} to="/book/$showId" params={{ showId: s.id }} className="rounded-md border border-cream-border px-4 py-2 text-center text-sm hover:border-primary hover:text-primary">
                        <div className="font-semibold">{s.time}</div>
                        <div className="text-[10px] opacity-60">{s.format}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
