import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AccessScope, ContentStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  position: z.number().int().min(0).optional(),
  sectionKey: z.string().regex(/^[a-z0-9_]+$/).optional(),
  labelVi: z.string().min(1).max(150).optional(),
  labelLa: z.string().max(150).nullable().optional(),
  referenceVi: z.string().max(200).nullable().optional(),
  referenceLa: z.string().max(200).nullable().optional(),
  textVi: z.string().nullable().optional(),
  textLa: z.string().nullable().optional(),
  accessScope: z.nativeEnum(AccessScope).optional(),
  status: z.nativeEnum(ContentStatus).optional()
});

async function editor() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && ["ADMIN", "EDITOR"].includes(session.user.role) ? session : null;
}

export async function PATCH(request: NextRequest, context: { params: { sectionId: string } }) {
  const session = await editor();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const section = await prisma.liturgicalSection.update({ where: { id: context.params.sectionId }, data: parsed.data });
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "UPDATE_LITURGICAL_SECTION", entity: "LiturgicalSection", entityId: section.id } });
  return NextResponse.json({ section });
}

export async function DELETE(_request: NextRequest, context: { params: { sectionId: string } }) {
  const session = await editor();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.liturgicalSection.delete({ where: { id: context.params.sectionId } });
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "DELETE_LITURGICAL_SECTION", entity: "LiturgicalSection", entityId: context.params.sectionId } });
  return NextResponse.json({ ok: true });
}
