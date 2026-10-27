import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogueOptions } from '@/lib/catalogue';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Clock, Globe, Sparkles, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { MOODS, movies, pickByMood } from "@/lib/data";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  loader: ({context}) => context.queryClient.ensureQueryData(catalogueOptions),
  head: () => ({
    meta: [
      { title: "RYZENX Cinema — Big stories. Better nights." },
      { name: "description", content: "Discover what's showing at RYZENX Cinema, find your seat, and make a night of it. Book movie tickets in Nepal." },
      { property: "og:title", content: "RYZENX Cinema — Big stories. Better nights." },
      { property: "og:description", content: "Discover what's showing, find your seat, and make a night of it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const {data:{movies}}=useSuspenseQuery(catalogueOptions);
  const f = movies[0];
  const now = movies.filter((m) => m.status === "now");
  const soon = movies.filter((m) => m.status === "soon");
  const [mood, setMood] = useState<string | null>(null);
  const picks = mood ? movies.filter(m=>m.status==='now'&&(mood==='short'?m.minutes<120:m.moods.includes(mood))) : [];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero — featured film */}
      <section className="relative h-[560px] overflow-hidden">
        <img src={hero} alt="" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col justify-center px-4 md:px-8">
          <p className="mb-4 text-[11px] font-semibold tracking-[0.35em] text-gold">NOW SHOWING</p>
          <h1 className="max-w-xl text-5xl leading-[1.05] tracking-tight md:text-7xl">Big stories. Better nights.</h1>
          <p className="mt-5 max-w-sm text-foreground/85">{f?.tagline ?? 'Find your next favorite.'}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground/80">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{f?.duration}</span>
            <span>{f?.genres[0]}</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />{f?.language}</span>
            <span>{f?.rating}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {f && <Link to="/movies/$id" params={{ id: f.id }} className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-glow hover:opacity-90">
              Pick your seats <ArrowRight className="h-4 w-4" />
            </Link>}
            <Link to="/movies" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-gold hover:text-gold">
              Explore Movies
            </Link>
          </div>
        </div>
      </section>

      {/* Movie Night Picker */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="text-2xl md:text-3xl">The Movie Night Picker</h2>
          </div>
          <p className="mt-2 max-w-[600px] text-sm text-muted-foreground">Tell us the mood and we'll point you at the right screen. No algorithms — just good picks.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button key={m.id} onClick={() => setMood(mood === m.id ? null : m.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${mood === m.id ? "border-gold bg-gold text-gold-foreground font-semibold" : "border-border hover:border-gold hover:text-gold"}`}>
                {m.label}
              </button>
            ))}
          </div>
          {mood && (
            <div className="mt-6">
              {picks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing matches that mood right now. Try another.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {picks.map((m) => (
                    <Link key={m.id} to="/movies/$id" params={{ id: m.id }} className="group w-36 shrink-0">
                      <img src={m.poster} alt={m.title} loading="lazy" className="aspect-[2/3] w-full rounded-lg border border-border object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      <p className="mt-2 text-sm font-semibold leading-tight">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.duration} · {m.rating}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Now Showing */}
      <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl">Now Showing</h2>
          <Link to="/movies" className="text-sm text-gold hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {now.map((m) => (
            <Link key={m.id} to="/movies/$id" params={{ id: m.id }} className="group">
              <div className="overflow-hidden rounded-lg border border-border">
                <img src={m.poster} alt={m.title} loading="lazy" width={672} height={992} className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold leading-tight">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.genres.join(" · ")}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-gold"><Star className="h-3 w-3 fill-current" />{m.score}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-cream text-cream-foreground">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
          <h2 className="mb-1 text-3xl">Coming Soon</h2>
          <p className="mb-6 text-sm opacity-70">Coming to the big screen.</p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {soon.map((m) => (
              <Link key={m.id} to="/movies/$id" params={{ id: m.id }} className="group">
                <div className="overflow-hidden rounded-lg border border-cream-border">
                  <img src={m.poster} alt={m.title} loading="lazy" width={672} height={992} className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-3 font-semibold leading-tight">{m.title}</p>
                <p className="text-xs opacity-60">{m.genres.join(" · ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h2 className="text-3xl">Golden Tuesdays</h2>
            <p className="mt-1 max-w-[600px] text-sm opacity-85">Every Tuesday, Standard seats are NPR 250 all day, every cinema. Book early — they go fast.</p>
          </div>
          <Link to="/movies" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground hover:opacity-90">Book Tickets</Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
