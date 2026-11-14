import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ContentStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function editor() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && ["ADMIN", "EDITOR"].includes(session.user.role) ? session : null;
}

export async function GET(_request: NextRequest, context: { params: { dayId: string } }) {
  const session = await editor();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const day = await prisma.liturgicalDay.findUnique({
    where: { id: context.params.dayId },
    include: { calendar: true, sections: { orderBy: { position: "asc" } }, saints: { include: { saint: true } } }
  });
  if (!day) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ day });
}

export async function DELETE(_request: NextRequest, context: { params: { dayId: string } }) {
  const session = await editor();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  await prisma.liturgicalDay.delete({ where: { id: context.params.dayId } });
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "DELETE_LITURGICAL_DAY", entity: "LiturgicalDay", entityId: context.params.dayId } });
  return NextResponse.json({ ok: true });
}
