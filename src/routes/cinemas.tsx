import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { cinemas } from "@/lib/data";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/cinemas")({
  head: () => ({
    meta: [
      { title: "Cinemas & Locations | QFX Cinemas" },
      { name: "description", content: "Find QFX Cinemas locations across Kathmandu, Bhaktapur and Pokhara." },
      { property: "og:title", content: "QFX Cinemas Locations" },
      { property: "og:description", content: "QFX halls across Nepal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-5xl">Our Cinemas</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {cinemas.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <p className="font-display text-2xl">{c.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{c.area}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
});
