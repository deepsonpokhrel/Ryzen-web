import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogueOptions } from '@/lib/catalogue';
import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { movies } from "@/lib/data";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/movies")({
  loader: ({context}) => context.queryClient.ensureQueryData(catalogueOptions),
  head: () => ({
    meta: [
      { title: "Movies — Now Showing & Coming Soon | RYZENX Cinema" },
      { name: "description", content: "Browse movies now showing and coming soon at RYZENX Cinema. Search by title and filter by genre." },
      { property: "og:title", content: "Movies | RYZENX Cinema" },
      { property: "og:description", content: "Find your next favorite at RYZENX Cinema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  // /movies is also the parent layout of /movies/$id — render the child when one matches.
  const {data:{movies}}=useSuspenseQuery(catalogueOptions);
  const child = useChildMatches();
  const [tab, setTab] = useState<"now" | "soon">("now");
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");

  const genres = useMemo(() => ["All", ...new Set(movies.flatMap((m) => m.genres))], [movies]);
  const list = movies.filter((m) =>
    m.status === tab &&
    (genre === "All" || m.genres.includes(genre)) &&
    m.title.toLowerCase().includes(q.trim().toLowerCase()),
  );

  if (child.length > 0) return <Outlet />;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-[1200px] px-4 py-10 md:px-8">
        <h1 className="text-4xl md:text-5xl">Find your next favorite.</h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-6 border-b border-border/60">
            {(["now", "soon"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 text-sm ${tab === t ? "border-gold font-semibold text-gold" : "border-transparent text-muted-foreground"}`}>
                {t === "now" ? "Now Showing" : "Coming Soon"}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <label className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies" className="w-36 bg-transparent outline-none" aria-label="Search movies" />
            </label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm" aria-label="Filter by genre">
              {genres.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No movies match your search. Try another title or genre.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((m) => (
              <Link key={m.id} to="/movies/$id" params={{ id: m.id }} className="group">
                <div className="overflow-hidden rounded-lg border border-border">
                  <img src={m.poster} alt={m.title} loading="lazy" width={672} height={992} className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-tight">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.genres.join(" · ")} · {m.duration} · {m.rating}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gold"><Star className="h-3 w-3 fill-current" />{m.score}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
