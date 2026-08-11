import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dimensions = await prisma.dimension.findMany({
    include: { indicators: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ dimensions });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores pueden editar el catálogo." }, { status: 403 });
  }

  const body = await request.json();

  if (body.type === "indicator") {
    const indicator = await prisma.indicator.update({
      where: { id: body.id },
      data: {
        name: body.name,
        question: body.question,
        description: body.description,
        expectedEvidence: body.expectedEvidence,
        recommendation: body.recommendation,
        relatedService: body.relatedService,
        weight: body.weight != null ? Number(body.weight) : undefined,
        active: body.active,
        companyTypeScope: body.companyTypeScope,
      },
    });
    return NextResponse.json({ indicator });
  }

  if (body.type === "dimension") {
    const dimension = await prisma.dimension.update({
      where: { id: body.id },
      data: {
        name: body.name,
        weight: body.weight != null ? Number(body.weight) : undefined,
        description: body.description,
        active: body.active,
      },
    });
    return NextResponse.json({ dimension });
  }

  return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
}
