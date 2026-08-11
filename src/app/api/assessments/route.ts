import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInterviewQueue } from "@/lib/assessment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const assessments = await prisma.assessment.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      company: true,
      consultant: true,
    },
  });

  return NextResponse.json({ assessments });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const companyId = String(body.companyId ?? "");
  if (!companyId) {
    return NextResponse.json({ error: "Selecciona una empresa." }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return NextResponse.json({ error: "Empresa no encontrada." }, { status: 404 });

  const indicators = await getInterviewQueue(company.companyType);

  const assessment = await prisma.assessment.create({
    data: {
      companyId: company.id,
      consultantId: user.id,
      status: "in_progress",
      companyType: company.companyType,
      assessmentType: "express",
      notes: body.notes || null,
      responses: {
        create: indicators.map((ind) => ({
          indicatorId: ind.id,
        })),
      },
    },
  });

  return NextResponse.json({ assessment });
}
