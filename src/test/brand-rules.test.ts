import { describe, expect, it } from "vitest";
import { movies, pickByMood } from "@/lib/data";
import { newRef } from "@/lib/bookings";

describe("Movie Night Picker", () => {
  it("'Under two hours' only returns movies shorter than 120 minutes", () => {
    const picks = pickByMood("short");
    expect(picks.length).toBeGreaterThan(0);
    for (const m of picks) expect(m.minutes).toBeLessThan(120);
  });

  it("only suggests movies that are now showing, never coming soon", () => {
    for (const mood of ["fun", "thriller", "date", "family", "short"]) {
      for (const m of pickByMood(mood)) expect(m.status).toBe("now");
    }
  });

  it("the catalogue has both now-showing and coming-soon movies", () => {
    expect(movies.some((m) => m.status === "now")).toBe(true);
    expect(movies.some((m) => m.status === "soon")).toBe(true);
  });
});

describe("Golden Ticket booking reference", () => {
  it("uses the RYX- prefix with a 5-digit number", () => {
    expect(newRef()).toMatch(/^RYX-\d{5}$/);
  });
});
