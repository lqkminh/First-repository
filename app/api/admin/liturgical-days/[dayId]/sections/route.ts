import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AccessScope, ContentStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sectionSchema = z.object({
  position: z.number().int().min(0),
  sectionKey: z.string().regex(/^[a-z0-9_]+$/),
  labelVi: z.string().min(1).max(150),
  labelLa: z.string().max(150).optional().nullable(),
  referenceVi: z.string().max(200).optional().nullable(),
  referenceLa: z.string().max(200).optional().nullable(),
  textVi: z.string().optional().nullable(),
  textLa: z.string().optional().nullable(),
  accessScope: z.nativeEnum(AccessScope).optional(),
  status: z.nativeEnum(ContentStatus).optional()
});

export async function POST(request: NextRequest, context: { params: { dayId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "EDITOR"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = sectionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const day = await prisma.liturgicalDay.findUnique({ where: { id: context.params.dayId }, select: { id: true } });
  if (!day) return NextResponse.json({ error: "Liturgical day not found." }, { status: 404 });
  const section = await prisma.liturgicalSection.create({
    data: { ...parsed.data, dayId: day.id, createdById: session.user.id }
  });
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "CREATE_LITURGICAL_SECTION", entity: "LiturgicalSection", entityId: section.id } });
  return NextResponse.json({ section }, { status: 201 });
}
