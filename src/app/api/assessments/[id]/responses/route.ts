import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateAndPersist } from "@/lib/assessment";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const indicatorId = String(body.indicatorId ?? "");

  if (!indicatorId) {
    return NextResponse.json({ error: "indicatorId requerido" }, { status: 400 });
  }

  const score = body.score == null || body.score === "" ? null : Number(body.score);
  if (score != null && (score < 1 || score > 5 || !Number.isInteger(score))) {
    return NextResponse.json({ error: "La calificación debe ser un entero de 1 a 5." }, { status: 400 });
  }

  const response = await prisma.assessmentResponse.upsert({
    where: {
      assessmentId_indicatorId: {
        assessmentId: id,
        indicatorId,
      },
    },
    create: {
      assessmentId: id,
      indicatorId,
      score,
      evidence: body.evidence ?? null,
      observations: body.observations ?? null,
      risk: body.risk ?? null,
      impact: body.impact ?? null,
    },
    update: {
      score,
      evidence: body.evidence ?? null,
      observations: body.observations ?? null,
      risk: body.risk ?? null,
      impact: body.impact ?? null,
    },
  });

  // Soft recalculation while in progress (only scored items)
  await recalculateAndPersist(id);

  return NextResponse.json({ response });
}
