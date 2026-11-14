import { prisma } from "@/lib/prisma";
import type { CalendarCode } from "@prisma/client";

export async function hasCalendarEntitlement(userId: string, calendarCode: CalendarCode, now = new Date()) {
  const entitlement = await prisma.entitlement.findFirst({
    where: { userId, calendar: { code: calendarCode }, validFrom: { lte: now }, OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
    select: { id: true }
  });
  return Boolean(entitlement);
}

export async function canReadFullCalendar(userId: string | null, role: string | null | undefined, calendarCode: CalendarCode) {
  if (role === "ADMIN" || role === "EDITOR") return true;
  if (!userId) return false;
  return hasCalendarEntitlement(userId, calendarCode);
}
