import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";

export type Movie = {
  id: string; title: string; tagline: string; synopsis: string; genres: string[];
  duration: string; language: string; rating: string; score: number; poster: string;
};

export const movies: Movie[] = [
  { id: "the-last-horizon", title: "The Last Horizon", tagline: "A team of explorers. A forgotten world. One last chance to save what matters.", synopsis: "A team of explorers embarks on a dangerous mission to a distant planet, where they discover a secret that could change the fate of humanity.", genres: ["Action", "Adventure"], duration: "2h 18m", language: "English", rating: "PG-13", score: 8.4, poster: p1 },
  { id: "the-silent-city", title: "The Silent City", tagline: "Every street keeps a secret.", synopsis: "A disgraced detective returns to the city that exiled him to solve a string of disappearances no one wants solved.", genres: ["Thriller", "Mystery"], duration: "1h 58m", language: "English", rating: "PG-13", score: 7.6, poster: p2 },
  { id: "beneath-the-waves", title: "Beneath the Waves", tagline: "The deep remembers.", synopsis: "A marine archaeologist uncovers a sunken city — and the reason it was lost.", genres: ["Drama", "Adventure"], duration: "2h 05m", language: "English", rating: "PG", score: 7.8, poster: p3 },
  { id: "the-final-chapter", title: "The Final Chapter", tagline: "Some wars end with a whisper.", synopsis: "A lone soldier fights through a burning frontier to deliver one last message.", genres: ["Action", "Sci-Fi"], duration: "2h 22m", language: "Hindi", rating: "A", score: 8.2, poster: p4 },
  { id: "roads-of-tomorrow", title: "Roads of Tomorrow", tagline: "Home is a direction, not a place.", synopsis: "A young woman leaves Kathmandu to chase a future her family never imagined.", genres: ["Drama", "Sci-Fi"], duration: "2h 01m", language: "Nepali", rating: "PG", score: 7.1, poster: p5 },
];

export const cinemas = [
  { id: "civil-mall", name: "QFX Civil Mall", area: "Civil Mall, Kathmandu", city: "Kathmandu" },
  { id: "labim", name: "QFX Labim Mall", area: "Pulchowk, Lalitpur", city: "Kathmandu" },
  { id: "bhaktapur", name: "QFX Bhaktapur", area: "Bhaktapur", city: "Bhaktapur" },
  { id: "pokhara", name: "QFX Pokhara", area: "Lakeside, Pokhara", city: "Pokhara" },
];
export const cities = ["Kathmandu", "Bhaktapur", "Pokhara"];

export type Show = { id: string; movieId: string; cinemaId: string; date: string; time: string; format: "2D" | "3D" | "IMAX" };

export function nextDays(n = 5) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

const TIMES = ["10:30 AM", "1:15 PM", "4:00 PM", "6:45 PM", "9:30 PM"];
export function getShows(movieId: string, date: string): Show[] {
  const mi = movies.findIndex((m) => m.id === movieId);
  return cinemas.flatMap((c, ci) =>
    TIMES.filter((_, ti) => (ti + mi + ci) % 4 !== 3).map((time, ti) => ({
      id: `${movieId}__${c.id}__${date}__${ti}`,
      movieId, cinemaId: c.id, date, time,
      format: (ti === 2 && ci === 0 ? "IMAX" : ti === 3 && ci === 1 ? "3D" : "2D") as Show["format"],
    })),
  );
}

export function parseShowId(id: string): Show | null {
  const [movieId, cinemaId, date, ti] = id.split("__");
  const t = TIMES[Number(ti)];
  if (!movies.find((m) => m.id === movieId) || !cinemas.find((c) => c.id === cinemaId) || !t) return null;
  return getShows(movieId, date).find((s) => s.id === id) ?? { id, movieId, cinemaId, date, time: t, format: "2D" };
}

export type SeatCategory = "Standard" | "Premium" | "Recliner";
export const PRICES: Record<SeatCategory, number> = { Standard: 300, Premium: 450, Recliner: 600 };
export const FORMAT_SURCHARGE: Record<Show["format"], number> = { "2D": 0, "3D": 100, IMAX: 200 };
export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const COLS = 14;
export function seatCategory(row: string): SeatCategory {
  if (row === "I" || row === "J") return "Recliner";
  if (row === "G" || row === "H") return "Premium";
  return "Standard";
}
export function seatPrice(row: string, format: Show["format"]) {
  return PRICES[seatCategory(row)] + FORMAT_SURCHARGE[format];
}
export const CONVENIENCE_FEE = 25; // per ticket, NPR

/** Deterministic "already sold" seats per show for demo. */
export function soldSeats(showId: string): Set<string> {
  let h = 0; for (const ch of showId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const s = new Set<string>();
  for (let i = 0; i < 22; i++) { h = (h * 1103515245 + 12345) >>> 0; s.add(`${ROWS[h % ROWS.length]}${(h >> 8) % COLS + 1}`); }
  return s;
}

export const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;
export const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
