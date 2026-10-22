import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Globe, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { movies } from "@/lib/data";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QFX Cinemas — Book Movie Tickets in Nepal" },
      { name: "description", content: "Browse movies now showing at QFX Cinemas, pick showtimes and seats, and get digital tickets in NPR." },
      { property: "og:title", content: "QFX Cinemas — Book Movie Tickets in Nepal" },
      { property: "og:description", content: "Now showing at QFX: pick a showtime, choose seats, get your ticket instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const f = movies[0]!;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative h-[560px] overflow-hidden">
        <img src={hero} alt="" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 md:px-8">
          <p className="mb-4 text-[11px] tracking-[0.35em] text-muted-foreground">NOW SHOWING</p>
          <h1 className="max-w-xl text-6xl uppercase leading-[0.9] md:text-8xl">{f.title}</h1>
          <p className="mt-5 max-w-sm text-foreground/85">{f.tagline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground/80">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{f.duration}</span>
            <span>{f.genres[0]}</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />{f.language}</span>
            <span>{f.rating}</span>
          </div>
          <Link to="/movies/$id" params={{ id: f.id }} className="mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90">
            Book Tickets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <h2 className="mb-6 text-3xl">Currently Showing</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {movies.map((m) => (
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
      <SiteFooter />
    </div>
  );
}
