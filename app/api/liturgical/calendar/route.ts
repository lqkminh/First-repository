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
function vietnamTodayUtc() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "01";
  return new Date(Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day"))));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const calendar = codeMap[params.get("calendar") ?? ""];
  const from = parseDate(params.get("from"));
  const to = parseDate(params.get("to"));
  if (!calendar || !from || !to || from > to) return NextResponse.json({ error: "Invalid calendar or date range." }, { status: 400 });
  if (to.getTime() - from.getTime() > 367 * 24 * 60 * 60 * 1000) return NextResponse.json({ error: "Date range is too large." }, { status: 400 });

  const session = await getServerSession(authOptions);
  const fullAccess = await canReadFullCalendar(session?.user?.id ?? null, session?.user?.role, calendar);
  const today = vietnamTodayUtc();
  if (!fullAccess && (today < from || today > to)) return NextResponse.json({ days: [], access: "FREE_TODAY" });

  const days = await prisma.liturgicalDay.findMany({
    where: {
      calendar: { code: calendar },
      status: ContentStatus.PUBLISHED,
      civilDate: fullAccess ? { gte: from, lte: to } : today,
      ...(fullAccess ? {} : { isFreeToday: true })
    },
    orderBy: { civilDate: "asc" },
    select: { id: true, civilDate: true, titleVi: true, titleLa: true, rankVi: true, liturgicalColor: true, isSunday: true, isSolemnity: true, lectionaryCycle: true }
  });
  return NextResponse.json({
    access: fullAccess ? "MEMBER" : "FREE_TODAY",
    days: days.map((day) => ({ ...day, civilDate: day.civilDate.toISOString().slice(0, 10) }))
  });
}
