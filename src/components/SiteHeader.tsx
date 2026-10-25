import { Link } from "@tanstack/react-router";
import { Clapperboard, MapPin, Ticket } from "lucide-react";
import { cities } from "@/lib/data";
import { useCity } from "@/lib/bookings";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="RYZENX Cinema home">
      <Clapperboard className="h-6 w-6 text-gold" />
      <span className="font-display text-xl font-bold tracking-tight">RYZENX</span>
    </Link>
  );
}

export function SiteHeader() {
  const [city, setCity] = useCity();
  const nav = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-4 md:px-8">
        <Logo />
        <nav className="hidden gap-6 md:flex">
          <Link to="/movies" className={nav} activeProps={{ className: "text-foreground" }}>Movies</Link>
          <Link to="/cinemas" className={nav} activeProps={{ className: "text-foreground" }}>Cinemas & Showtimes</Link>
          <Link to="/tickets" className={nav} activeProps={{ className: "text-foreground" }}>My Tickets</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs sm:flex">
            <MapPin className="h-3.5 w-3.5" />
            <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent outline-none" aria-label="City">
              {cities.map((c) => <option key={c} className="bg-card">{c}</option>)}
            </select>
          </label>
          <Link to="/movies" className="hidden rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:opacity-90 md:block">Book Tickets</Link>
          <Link to="/tickets" className="md:hidden" aria-label="My tickets"><Ticket className="h-5 w-5" /></Link>
          <Link to="/admin" className="hidden text-xs text-muted-foreground hover:text-foreground sm:block">Staff</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} RYZENX Cinema · Kathmandu, Nepal · Prices in NPR incl. VAT
    </footer>
  );
}
