import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CalendarCode, ContentStatus, AccessScope } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canReadFullCalendar } from "@/lib/permissions";

const codeMap: Record<string, CalendarCode> = { ROMAN_1962: CalendarCode.ROMAN_1962, PRE_1955: CalendarCode.PRE_1955 };
function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return new Date(value + "T00:00:00.000Z");
}
function vietnamTodayUtc() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "01";
  return new Date(Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day"))));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const calendarCode = codeMap[params.get("calendar") ?? ""];
  const civilDate = parseDate(params.get("date"));
  if (!calendarCode || !civilDate) return NextResponse.json({ error: "Invalid calendar or date." }, { status: 400 });
  const session = await getServerSession(authOptions);
  const fullAccess = await canReadFullCalendar(session?.user?.id ?? null, session?.user?.role, calendarCode);
  const day = await prisma.liturgicalDay.findFirst({
    where: { calendar: { code: calendarCode }, civilDate, status: ContentStatus.PUBLISHED },
    include: { sections: { where: { status: ContentStatus.PUBLISHED }, orderBy: { position: "asc" } }, saints: { include: { saint: { select: { nameVi: true, nameLa: true } } } } }
  });
  if (!day) return NextResponse.json({ day: null }, { status: 404 });
  const isToday = civilDate.getTime() === vietnamTodayUtc().getTime();
  if (!fullAccess && !isToday) return NextResponse.json({ error: "Membership required for this date." }, { status: 403 });
  const visibleSections = fullAccess ? day.sections : day.sections.filter((section) =>
    section.accessScope === AccessScope.PUBLIC_TODAY && ["bai_tho", "phuc_am_thu"].includes(section.sectionKey)
  );
  return NextResponse.json({ day: {
    id: day.id, civilDate: day.civilDate.toISOString().slice(0, 10), titleVi: day.titleVi, titleLa: day.titleLa,
    rankVi: day.rankVi, liturgicalColor: day.liturgicalColor, seasonVi: day.seasonVi, isSunday: day.isSunday, isSolemnity: day.isSolemnity,
    accessLimited: !fullAccess && visibleSections.length < day.sections.length,
    sections: visibleSections.map(({ id, labelLa, labelVi, referenceLa, referenceVi, textLa, textVi }) => ({ id, labelLa, labelVi, referenceLa, referenceVi, textLa, textVi })),
    saints: day.saints.map((item) => ({ saint: item.saint }))
  }});
}
