import { useEffect, useState } from "react";

export type Booking = {
  ref: string; showId: string; movieId: string; cinemaId: string; date: string; time: string; format: string;
  seats: string[]; total: number; name: string; email: string; phone: string; payment: string;
  status: "Confirmed" | "Cancelled"; createdAt: string;
};

const KEY = "ryzenx-bookings";
const read = (): Booking[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (b: Booking[]) => { localStorage.setItem(KEY, JSON.stringify(b)); window.dispatchEvent(new Event("ryzenx-bookings")); };

export function addBooking(b: Booking) { write([b, ...read()]); }
export function cancelBooking(ref: string) { write(read().map((b) => (b.ref === ref ? { ...b, status: "Cancelled" } : b))); }
export function bookedSeatsFor(showId: string) {
  return new Set(read().filter((b) => b.showId === showId && b.status === "Confirmed").flatMap((b) => b.seats));
}
export const newRef = () => "RYX-" + Math.floor(10000 + Math.random() * 90000);

export function useBookings() {
  const [list, setList] = useState<Booking[]>([]);
  useEffect(() => {
    const s = () => setList(read()); s();
    window.addEventListener("ryzenx-bookings", s);
    return () => window.removeEventListener("ryzenx-bookings", s);
  }, []);
  return list;
}

const CITY = "ryzenx-city";
export function useCity() {
  const [city, setC] = useState("Kathmandu");
  useEffect(() => { setC(localStorage.getItem(CITY) || "Kathmandu"); }, []);
  return [city, (c: string) => { localStorage.setItem(CITY, c); setC(c); }] as const;
}
