import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CalendarCode, ContentStatus, LiturgicalColor } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const daySchema = z.object({
  calendar: z.nativeEnum(CalendarCode), civilDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  titleVi: z.string().min(1).max(300), titleLa: z.string().max(300).optional().nullable(),
  rankVi: z.string().max(120).optional().nullable(), rankLa: z.string().max(120).optional().nullable(),
  liturgicalColor: z.nativeEnum(LiturgicalColor).optional().nullable(), seasonVi: z.string().max(120).optional().nullable(),
  seasonLa: z.string().max(120).optional().nullable(), isSunday: z.boolean().optional(), isSolemnity: z.boolean().optional(),
  isFreeToday: z.boolean().optional(), status: z.nativeEnum(ContentStatus).optional()
});
async function editorOnly() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && ["EDITOR", "ADMIN"].includes(session.user.role) ? session : null;
}
export async function GET(request: NextRequest) {
  const session = await editorOnly();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const calendar = request.nextUrl.searchParams.get("calendar");
  const where = calendar && Object.values(CalendarCode).includes(calendar as CalendarCode) ? { calendar: { code: calendar as CalendarCode } } : {};
  const days = await prisma.liturgicalDay.findMany({ where, orderBy: { civilDate: "desc" }, take: 100, include: { calendar: true } });
  return NextResponse.json({ days });
}
export async function POST(request: NextRequest) {
  const session = await editorOnly();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = daySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { calendar: calendarCode, civilDate, ...fields } = parsed.data;
  if (session.user.role === "EDITOR" && fields.status === "PUBLISHED") return NextResponse.json({ error: "Editor phải gửi nội dung để Admin duyệt." }, { status: 403 });
  const calendar = await prisma.liturgicalCalendar.findUnique({ where: { code: calendarCode } });
  if (!calendar) return NextResponse.json({ error: "Calendar not seeded." }, { status: 409 });
  const date = new Date(civilDate + "T00:00:00.000Z");
  const day = await prisma.liturgicalDay.upsert({
    where: { calendarId_civilDate: { calendarId: calendar.id, civilDate: date } },
    update: { ...fields, createdById: session.user.id },
    create: { ...fields, calendarId: calendar.id, civilDate: date, createdById: session.user.id }
  });
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "UPSERT_LITURGICAL_DAY", entity: "LiturgicalDay", entityId: day.id } });
  return NextResponse.json({ day }, { status: 201 });
}
