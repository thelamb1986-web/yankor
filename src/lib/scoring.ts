export type RiskLevel = "Bajo" | "Medio" | "Alto" | "Critico";
export type ImpactLevel = "Bajo" | "Medio" | "Alto";
export type PriorityLevel = "critica" | "alta" | "media" | "baja";

export const RISK_OPTIONS: RiskLevel[] = ["Bajo", "Medio", "Alto", "Critico"];
export const IMPACT_OPTIONS: ImpactLevel[] = ["Bajo", "Medio", "Alto"];

export const MATURITY_SCALE = [
  {
    level: 1,
    name: "Inexistente",
    description: "No existe una práctica definida. La actividad se realiza de manera improvisada o no se realiza.",
  },
  {
    level: 2,
    name: "Inicial",
    description: "Existe parcialmente, pero depende principalmente de personas y experiencia individual.",
  },
  {
    level: 3,
    name: "Definido",
    description: "Existe una forma de trabajo establecida, aunque presenta inconsistencias o no siempre se aplica.",
  },
  {
    level: 4,
    name: "Gestionado",
    description: "La práctica está implementada, se utiliza consistentemente y existen mecanismos de seguimiento.",
  },
  {
    level: 5,
    name: "Optimizado",
    description: "La práctica está consolidada, se mide, se revisa y mejora continuamente.",
  },
] as const;

export function scoreToPercent(score: number): number {
  return (score / 5) * 100;
}

export function classifyGlobal(score: number): { level: string; description: string } {
  if (score <= 20) {
    return {
      level: "Operación Crítica",
      description: "Existe un alto nivel de improvisación y riesgo operativo.",
    };
  }
  if (score <= 40) {
    return {
      level: "Operación Reactiva",
      description: "La empresa funciona principalmente reaccionando a problemas.",
    };
  }
  if (score <= 60) {
    return {
      level: "Operación Controlada",
      description: "Existen prácticas y controles, pero todavía presentan brechas importantes.",
    };
  }
  if (score <= 80) {
    return {
      level: "Operación Eficiente",
      description: "La empresa cuenta con procesos y controles relativamente sólidos.",
    };
  }
  return {
    level: "Operación de Alto Desempeño",
    description: "La empresa cuenta con prácticas consolidadas, medición y mejora continua.",
  };
}

export function classifyDimension(score: number): string {
  return classifyGlobal(score).level;
}

const riskWeight: Record<string, number> = {
  Bajo: 1,
  Medio: 2,
  Alto: 3,
  Critico: 4,
};

const impactWeight: Record<string, number> = {
  Bajo: 1,
  Medio: 2,
  Alto: 3,
};

/** Prioridad = baja madurez + alto riesgo + alto impacto */
export function calculatePriority(score: number | null | undefined, risk?: string | null, impact?: string | null): {
  level: PriorityLevel;
  label: string;
  action: string;
  points: number;
} {
  const pct = score ? scoreToPercent(score) : 100;
  const maturityGap = (100 - pct) / 20; // 0–4
  const r = riskWeight[risk ?? "Bajo"] ?? 1;
  const i = impactWeight[impact ?? "Bajo"] ?? 1;
  const points = maturityGap * 2 + r * 1.5 + i;

  if (points >= 12 || (pct <= 40 && r >= 3 && i >= 3)) {
    return { level: "critica", label: "Prioridad crítica", action: "Atender inmediatamente.", points };
  }
  if (points >= 9 || (pct <= 60 && r >= 3)) {
    return { level: "alta", label: "Prioridad alta", action: "Atender en corto plazo.", points };
  }
  if (points >= 6) {
    return { level: "media", label: "Prioridad media", action: "Planificar.", points };
  }
  return { level: "baja", label: "Prioridad baja", action: "Monitorear.", points };
}

export type IndicatorInput = {
  indicatorId: string;
  code: string;
  name: string;
  dimensionCode: string;
  dimensionName: string;
  dimensionWeight: number;
  recommendation?: string | null;
  relatedService?: string | null;
  score: number | null;
  risk?: string | null;
  impact?: string | null;
  evidence?: string | null;
  observations?: string | null;
};

export type DimensionResult = {
  code: string;
  name: string;
  weight: number;
  averageScore: number;
  weightedScore: number;
  level: string;
};

export type AssessmentComputation = {
  globalScore: number;
  globalLevel: string;
  globalDescription: string;
  dimensions: DimensionResult[];
  strengths: Array<{ code: string; name: string; percent: number; dimensionName: string }>;
  opportunities: Array<{
    code: string;
    name: string;
    percent: number;
    dimensionName: string;
    score: number;
    risk?: string | null;
    impact?: string | null;
    recommendation?: string | null;
    relatedService?: string | null;
    priority: ReturnType<typeof calculatePriority>;
  }>;
  recommendations: Array<{
    code: string;
    name: string;
    score: number;
    percent: number;
    recommendation: string;
    relatedService?: string | null;
    priority: PriorityLevel;
  }>;
  roadmap: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
    phase4: string[];
  };
  specializedSuggestions: Array<{ dimensionCode: string; dimensionName: string; module: string; reason: string }>;
};

const SPECIALIZED_MODULES: Record<string, string> = {
  Y1: "YANKOR Leadership Assessment",
  Y2: "YANKOR Operations Assessment",
  Y3: "YANKOR Supply Chain Assessment",
  Y4: "YANKOR Commercial Assessment",
  Y5: "YANKOR Finance & KPI Assessment",
  Y6: "YANKOR Digital Transformation Assessment",
  Y7: "YANKOR Talent Assessment",
};

export function computeAssessment(inputs: IndicatorInput[]): AssessmentComputation {
  const byDimension = new Map<string, { name: string; weight: number; scores: number[] }>();

  for (const item of inputs) {
    if (item.score == null) continue;
    const bucket = byDimension.get(item.dimensionCode) ?? {
      name: item.dimensionName,
      weight: item.dimensionWeight,
      scores: [],
    };
    bucket.scores.push(scoreToPercent(item.score));
    byDimension.set(item.dimensionCode, bucket);
  }

  const dimensions: DimensionResult[] = [];
  let global = 0;

  for (const [code, data] of byDimension.entries()) {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const weighted = avg * data.weight;
    global += weighted;
    dimensions.push({
      code,
      name: data.name,
      weight: data.weight,
      averageScore: Math.round(avg * 10) / 10,
      weightedScore: Math.round(weighted * 10) / 10,
      level: classifyDimension(avg),
    });
  }

  dimensions.sort((a, b) => a.code.localeCompare(b.code));

  const scored = inputs
    .filter((i) => i.score != null)
    .map((i) => ({
      ...i,
      score: i.score as number,
      percent: scoreToPercent(i.score as number),
      priority: calculatePriority(i.score, i.risk, i.impact),
    }));

  const strengths = [...scored]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5)
    .map((i) => ({
      code: i.code,
      name: i.name,
      percent: Math.round(i.percent),
      dimensionName: i.dimensionName,
    }));

  const opportunities = [...scored]
    .sort((a, b) => {
      if (b.priority.points !== a.priority.points) return b.priority.points - a.priority.points;
      return a.percent - b.percent;
    })
    .slice(0, 8)
    .map((i) => ({
      code: i.code,
      name: i.name,
      percent: Math.round(i.percent),
      dimensionName: i.dimensionName,
      score: i.score,
      risk: i.risk,
      impact: i.impact,
      recommendation: i.recommendation,
      relatedService: i.relatedService,
      priority: i.priority,
    }));

  const recommendations = scored
    .filter((i) => i.percent <= 60 && i.recommendation)
    .sort((a, b) => b.priority.points - a.priority.points)
    .slice(0, 8)
    .map((i) => ({
      code: i.code,
      name: i.name,
      score: i.score,
      percent: Math.round(i.percent),
      recommendation: i.recommendation as string,
      relatedService: i.relatedService,
      priority: i.priority.level,
    }));

  const weakNames = opportunities.slice(0, 6).map((o) => o.name);
  const roadmap = {
    phase1: weakNames.filter((n) =>
      ["KPIs", "Procesos", "Flujo de efectivo", "Seguimiento", "Presupuesto"].includes(n),
    ).length
      ? weakNames.filter((n) =>
          ["KPIs", "Procesos", "Flujo de efectivo", "Seguimiento", "Presupuesto", "Costos"].includes(n),
        ).slice(0, 3)
      : weakNames.slice(0, 2),
    phase2: weakNames.filter((n) =>
      ["Estandarización", "Productividad", "Calidad", "Inventarios", "Organización"].includes(n),
    ).slice(0, 3),
    phase3: weakNames.filter((n) =>
      ["Automatización", "Inteligencia Artificial", "Sistemas", "Gestión documental"].includes(n),
    ).slice(0, 3),
    phase4: ["Indicadores", "Mejora continua"].concat(
      weakNames.filter((n) => ["Mejora continua", "Cultura de mejora", "Fidelización"].includes(n)).slice(0, 1),
    ),
  };

  if (roadmap.phase2.length === 0) roadmap.phase2 = ["Estandarización", "Productividad"];
  if (roadmap.phase3.length === 0) roadmap.phase3 = ["Automatización", "Inteligencia Artificial"];

  const specializedSuggestions = dimensions
    .filter((d) => d.averageScore < 60)
    .map((d) => ({
      dimensionCode: d.code,
      dimensionName: d.name,
      module: SPECIALIZED_MODULES[d.code] ?? `Assessment ${d.code}`,
      reason: `Madurez ${Math.round(d.averageScore)}/100 — conviene profundizar.`,
    }));

  const globalScore = Math.round(global);
  const classification = classifyGlobal(globalScore);

  return {
    globalScore,
    globalLevel: classification.level,
    globalDescription: classification.description,
    dimensions,
    strengths,
    opportunities: opportunities.slice(0, 5),
    recommendations,
    roadmap,
    specializedSuggestions,
  };
}

export function priorityBadgeClass(level: PriorityLevel): string {
  switch (level) {
    case "critica":
      return "badge-critical";
    case "alta":
      return "badge-high";
    case "media":
      return "badge-medium";
    default:
      return "badge-low";
  }
}

export function scoreColor(score: number): string {
  if (score <= 40) return "#C0392B";
  if (score <= 60) return "#D68910";
  if (score <= 80) return "#1F7A3F";
  return "#28A745";
}
