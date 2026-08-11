import { prisma } from "./prisma";
import { computeAssessment, type IndicatorInput } from "./scoring";

export async function getCatalog() {
  const dimensions = await prisma.dimension.findMany({
    where: { active: true },
    include: {
      indicators: {
        where: { active: true, assessmentLevel: "express" },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  return dimensions;
}

export async function getInterviewQueue(companyType?: string) {
  const dimensions = await getCatalog();
  const indicators = dimensions.flatMap((d) =>
    d.indicators
      .filter((i) => i.companyTypeScope === "ALL" || !companyType || i.companyTypeScope === companyType)
      .map((i) => ({
        ...i,
        dimensionCode: d.code,
        dimensionName: d.name,
        dimensionWeight: d.weight,
        dimensionDescription: d.description,
      })),
  );
  return indicators;
}

export async function recalculateAndPersist(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      responses: {
        include: {
          indicator: { include: { dimension: true } },
        },
      },
    },
  });

  if (!assessment) throw new Error("Assessment not found");

  const inputs: IndicatorInput[] = assessment.responses.map((r) => ({
    indicatorId: r.indicatorId,
    code: r.indicator.code,
    name: r.indicator.name,
    dimensionCode: r.indicator.dimension.code,
    dimensionName: r.indicator.dimension.name,
    dimensionWeight: r.indicator.dimension.weight,
    recommendation: r.indicator.recommendation,
    relatedService: r.indicator.relatedService,
    score: r.score,
    risk: r.risk,
    impact: r.impact,
    evidence: r.evidence,
    observations: r.observations,
  }));

  const result = computeAssessment(inputs);

  await prisma.dimensionScore.deleteMany({ where: { assessmentId } });
  await prisma.dimensionScore.createMany({
    data: result.dimensions.map((d) => ({
      assessmentId,
      dimensionCode: d.code,
      dimensionName: d.name,
      weight: d.weight,
      averageScore: d.averageScore,
      weightedScore: d.weightedScore,
      level: d.level,
    })),
  });

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      globalScore: result.globalScore,
      globalLevel: result.globalLevel,
    },
  });

  return result;
}

export async function getAssessmentResults(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      company: true,
      consultant: true,
      dimensionScores: { orderBy: { dimensionCode: "asc" } },
      responses: {
        include: {
          indicator: { include: { dimension: true } },
        },
      },
    },
  });

  if (!assessment) return null;

  const inputs: IndicatorInput[] = assessment.responses.map((r) => ({
    indicatorId: r.indicatorId,
    code: r.indicator.code,
    name: r.indicator.name,
    dimensionCode: r.indicator.dimension.code,
    dimensionName: r.indicator.dimension.name,
    dimensionWeight: r.indicator.dimension.weight,
    recommendation: r.indicator.recommendation,
    relatedService: r.indicator.relatedService,
    score: r.score,
    risk: r.risk,
    impact: r.impact,
    evidence: r.evidence,
    observations: r.observations,
  }));

  const computation = computeAssessment(inputs);
  return { assessment, computation };
}

export function toCsv(rows: Record<string, string | number | null | undefined>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}
