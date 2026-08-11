import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAssessmentResults, recalculateAndPersist, toCsv } from "@/lib/assessment";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const result = await getAssessmentResults(id);
  if (!result) return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });

  if (format === "csv") {
    const rows = result.assessment.responses.map((r) => ({
      codigo: r.indicator.code,
      dimension: r.indicator.dimension.name,
      indicador: r.indicator.name,
      calificacion: r.score,
      porcentaje: r.score ? (r.score / 5) * 100 : "",
      riesgo: r.risk,
      impacto: r.impact,
      evidencia: r.evidence,
      observaciones: r.observations,
      recomendacion: r.indicator.recommendation,
      servicio: r.indicator.relatedService,
    }));

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="yankor-scan-${id}.csv"`,
      },
    });
  }

  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.assessment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  if (body.action === "complete") {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { responses: true },
    });
    if (!assessment) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const incomplete = assessment.responses.filter((r) => r.score == null || !r.risk || !r.impact);
    if (incomplete.length > 0) {
      return NextResponse.json(
        { error: `Faltan ${incomplete.length} indicadores por completar (calificación, riesgo e impacto).` },
        { status: 400 },
      );
    }

    const computation = await recalculateAndPersist(id);
    await prisma.assessment.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });

    return NextResponse.json({ ok: true, computation });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
