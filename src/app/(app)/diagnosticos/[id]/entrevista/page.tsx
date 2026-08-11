import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InterviewWizard } from "@/components/InterviewWizard";

type Props = { params: Promise<{ id: string }> };

export default async function EntrevistaPage({ params }: Props) {
  const { id } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      company: true,
      responses: true,
    },
  });

  if (!assessment) notFound();
  if (assessment.status === "completed") redirect(`/diagnosticos/${id}`);

  const indicators = await prisma.indicator.findMany({
    where: {
      active: true,
      assessmentLevel: "express",
      OR: [{ companyTypeScope: "ALL" }, { companyTypeScope: assessment.companyType }],
    },
    include: { dimension: true },
    orderBy: [{ dimension: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  return (
    <InterviewWizard
      assessmentId={assessment.id}
      companyName={assessment.company.tradeName}
      indicators={indicators.map((i) => ({
        id: i.id,
        code: i.code,
        name: i.name,
        question: i.question,
        description: i.description,
        expectedEvidence: i.expectedEvidence,
        recommendation: i.recommendation,
        relatedService: i.relatedService,
        dimension: {
          code: i.dimension.code,
          name: i.dimension.name,
          sortOrder: i.dimension.sortOrder,
          description: i.dimension.description,
        },
      }))}
      initialResponses={assessment.responses.map((r) => ({
        indicatorId: r.indicatorId,
        score: r.score,
        evidence: r.evidence,
        observations: r.observations,
        risk: r.risk,
        impact: r.impact,
      }))}
    />
  );
}
