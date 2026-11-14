export type CalendarView = "today" | "week" | "month" | "year";

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Monday-first calendar grid padded to full weeks. */
export function getMonthGrid(year: number, monthIndex: number): Date[] {
  const first = new Date(year, monthIndex, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - mondayOffset);
  const last = new Date(year, monthIndex + 1, 0);
  const total = Math.ceil((mondayOffset + last.getDate()) / 7) * 7;
  return Array.from({ length: total }, (_, index) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
  );
}

export function getWeekRange(date: Date) {
  const offset = (date.getDay() + 6) % 7;
  const from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6);
  return { from, to };
}

export function getYearRange(year: number) {
  return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) };
}

export function getLiturgicalYearCycle(date: Date): "A" | "B" | "C" {
  // Sunday lectionary cycle is optional metadata; it is not applied to 1962/Pre-1955 propers.
  const offset = ((date.getFullYear() - 2025) % 3 + 3) % 3;
  return (["A", "B", "C"] as const)[offset];
}
