import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CalendarCode, ContentStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReadFullCalendar } from "@/lib/permissions";

const codeMap: Record<string, CalendarCode> = { ROMAN_1962: CalendarCode.ROMAN_1962, PRE_1955: CalendarCode.PRE_1955 };
function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00.000Z");
  return Number.isNaN(date.valueOf()) ? null : date;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const calendar = codeMap[params.get("calendar") ?? ""];
  const from = parseDate(params.get("from"));
  const to = parseDate(params.get("to"));
  if (!calendar || !from || !to || from > to) return NextResponse.json({ error: "Invalid calendar or date range." }, { status: 400 });
  const maxRange = 367 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRange) return NextResponse.json({ error: "Date range is too large." }, { status: 400 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const role = session?.user?.role;
  const fullAccess = await canReadFullCalendar(userId, role, calendar);
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const where: Record<string, unknown> = {
    calendar: { code: calendar },
    status: ContentStatus.PUBLISHED,
    civilDate: fullAccess ? { gte: from, lte: to } : { equals: todayUTC },
  };
  if (!fullAccess) {
    if (todayUTC < from || todayUTC > to) return NextResponse.json({ days: [], access: "FREE_TODAY" });
    where.isFreeToday = true;
  }

  const days = await prisma.liturgicalDay.findMany({
    where,
    orderBy: { civilDate: "asc" },
    select: { id: true, civilDate: true, titleVi: true, titleLa: true, rankVi: true, liturgicalColor: true, isSunday: true, isSolemnity: true }
  });
  return NextResponse.json({
    access: fullAccess ? "MEMBER" : "FREE_TODAY",
    days: days.map((day) => ({ ...day, civilDate: day.civilDate.toISOString().slice(0, 10) }))
  });
}
