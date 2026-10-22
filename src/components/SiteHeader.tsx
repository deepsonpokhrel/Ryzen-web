import { Link } from "@tanstack/react-router";
import { MapPin, Ticket } from "lucide-react";
import { cities } from "@/lib/data";
import { useCity } from "@/lib/bookings";

export function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none">
      <span className="font-sans text-2xl font-extrabold tracking-tight"><span className="text-primary">Q</span>FX</span>
      <span className="text-[9px] tracking-[0.45em] text-muted-foreground">CINEMAS</span>
    </Link>
  );
}

export function SiteHeader() {
  const [city, setCity] = useCity();
  const nav = "text-sm text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
        <Logo />
        <nav className="hidden gap-6 md:flex">
          <Link to="/" className={nav} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>Movies</Link>
          <Link to="/cinemas" className={nav} activeProps={{ className: "text-foreground" }}>Cinemas</Link>
          <Link to="/tickets" className={nav} activeProps={{ className: "text-foreground" }}>My Tickets</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5" />
            <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent outline-none" aria-label="City">
              {cities.map((c) => <option key={c} className="bg-card">{c}</option>)}
            </select>
          </label>
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
      © {new Date().getFullYear()} QFX Cinemas · Kathmandu, Nepal · Prices in NPR incl. VAT
    </footer>
  );
}
