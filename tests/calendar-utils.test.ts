import { describe, expect, it } from "vitest";
import { dateKey, getMonthGrid, getWeekRange } from "../lib/calendar-utils";

describe("calendar utilities", () => {
  it("creates a Monday-first month grid", () => {
    const days = getMonthGrid(2026, 10);
    expect(days[0].getDay()).toBe(1);
    expect(days.at(-1)?.getDay()).toBe(0);
    expect(days.some((day) => dateKey(day) === "2026-11-14")).toBe(true);
  });
  it("returns Monday through Sunday", () => {
    const { from, to } = getWeekRange(new Date(2026, 10, 14));
    expect(dateKey(from)).toBe("2026-11-09");
    expect(dateKey(to)).toBe("2026-11-15");
  });
});
