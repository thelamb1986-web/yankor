import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentResults } from "@/lib/assessment";
import { MaturityRadar } from "@/components/MaturityRadar";
import { ResultsToolbar } from "@/components/ResultsToolbar";
import { formatDate, formatPercent } from "@/lib/utils";
import { priorityBadgeClass, scoreColor } from "@/lib/scoring";

type Props = { params: Promise<{ id: string }> };

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params;
  const result = await getAssessmentResults(id);
  if (!result) notFound();

  const { assessment, computation } = result;
  const isComplete = assessment.status === "completed";

  return (
    <div>
      <div
        className="page-header no-print"
        style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
      >
        <div>
          <h2>Resultado ejecutivo</h2>
          <p>
            {assessment.company.tradeName} · {formatDate(assessment.completedAt || assessment.startedAt)} ·{" "}
            {assessment.consultant.name}
          </p>
        </div>
        {!isComplete && (
          <Link href={`/diagnosticos/${id}/entrevista`} className="btn btn-navy">
            Continuar entrevista
          </Link>
        )}
      </div>

      <ResultsToolbar assessmentId={id} />

      {!isComplete && (
        <div className="card" style={{ marginBottom: "1rem", borderColor: "#f0c36d" }}>
          Diagnóstico en progreso. Los resultados parciales se actualizan conforme se capturan indicadores.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <section className="card" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
          <div className="score-ring" style={{ ["--pct" as string]: computation.globalScore }}>
            <div className="score-ring-inner">
              <strong>{computation.globalScore}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <h3 style={{ margin: "1rem 0 0.35rem", color: "var(--yankor-navy)" }}>Índice de Madurez YANKOR</h3>
          <span className="badge badge-navy" style={{ fontSize: "0.85rem", padding: "0.35rem 0.8rem" }}>
            {computation.globalLevel}
          </span>
          <p style={{ marginTop: "0.75rem", fontSize: "0.88rem", color: "var(--yankor-gray-soft)", lineHeight: 1.45 }}>
            {computation.globalDescription}
          </p>
        </section>

        <section className="card">
          <h3 className="card-title">Radar YANKOR</h3>
          <MaturityRadar
            data={computation.dimensions.map((d) => ({ name: d.name, score: d.averageScore }))}
          />
        </section>
      </div>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Resultados por dimensión</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.85rem" }}>
          {computation.dimensions.map((d) => (
            <div key={d.code} className="dim-card">
              <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)", fontWeight: 700 }}>
                {d.code} · Peso {Math.round(d.weight * 100)}%
              </div>
              <div style={{ fontWeight: 700, color: "var(--yankor-navy)", margin: "0.35rem 0" }}>{d.name}</div>
              <div className="score" style={{ color: scoreColor(d.averageScore) }}>
                {formatPercent(d.averageScore)}/100
              </div>
              <div style={{ margin: "0.55rem 0" }} className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${d.averageScore}%`, background: scoreColor(d.averageScore) }}
                />
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)" }}>{d.level}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <section className="card">
          <h3 className="card-title">Top 5 Fortalezas</h3>
          <ol style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {computation.strengths.map((s) => (
              <li key={s.code} style={{ marginBottom: "0.55rem" }}>
                <strong>{s.name}</strong> — {s.percent}
                <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)" }}>{s.dimensionName}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h3 className="card-title">Top 5 Oportunidades</h3>
          <ol style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {computation.opportunities.map((o) => (
              <li key={o.code} style={{ marginBottom: "0.55rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong>{o.name}</strong> — {o.percent}
                  <span className={`badge ${priorityBadgeClass(o.priority.level)}`}>{o.priority.label}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)" }}>
                  {o.dimensionName} · Riesgo {o.risk === "Critico" ? "Crítico" : o.risk} · Impacto {o.impact}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Priorización</h3>
        <p style={{ marginTop: 0, color: "var(--yankor-gray-soft)", fontSize: "0.9rem" }}>
          Ordenada por puntuación + riesgo + impacto.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Madurez</th>
              <th>Riesgo</th>
              <th>Impacto</th>
              <th>Prioridad</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {computation.opportunities.map((o) => (
              <tr key={o.code}>
                <td>
                  <strong>{o.name}</strong>
                  <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)" }}>{o.code}</div>
                </td>
                <td>{o.percent}/100</td>
                <td>{o.risk === "Critico" ? "Crítico" : o.risk}</td>
                <td>{o.impact}</td>
                <td>
                  <span className={`badge ${priorityBadgeClass(o.priority.level)}`}>{o.priority.label}</span>
                </td>
                <td>{o.priority.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Recomendaciones</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {computation.recommendations.map((r) => (
            <div
              key={r.code}
              style={{ border: "1px solid var(--yankor-border)", borderRadius: 12, padding: "0.9rem 1rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <strong style={{ color: "var(--yankor-navy)" }}>
                  {r.name} — {r.score}/5
                </strong>
                {r.relatedService && <span className="chip">{r.relatedService}</span>}
              </div>
              <p style={{ margin: "0.45rem 0 0", lineHeight: 1.5 }}>{r.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Ruta de Transformación YANKOR</h3>
        <div className="roadmap-phase">
          <h4>Fase 1 — Control</h4>
          <p style={{ margin: 0 }}>{computation.roadmap.phase1.join(" + ") || "KPIs + procesos"}</p>
        </div>
        <div className="roadmap-phase">
          <h4>Fase 2 — Optimización</h4>
          <p style={{ margin: 0 }}>{computation.roadmap.phase2.join(" + ")}</p>
        </div>
        <div className="roadmap-phase">
          <h4>Fase 3 — Automatización</h4>
          <p style={{ margin: 0 }}>{computation.roadmap.phase3.join(" + ")}</p>
        </div>
        <div className="roadmap-phase">
          <h4>Fase 4 — Escalamiento</h4>
          <p style={{ margin: 0 }}>{computation.roadmap.phase4.join(" + ")}</p>
        </div>
      </section>

      {computation.specializedSuggestions.length > 0 && (
        <section className="card" style={{ marginBottom: "1rem" }}>
          <h3 className="card-title">Áreas para diagnóstico especializado</h3>
          <p style={{ marginTop: 0, color: "var(--yankor-gray-soft)", fontSize: "0.9rem" }}>
            Express detecta. Assessment especializado entiende. Módulos futuros (20–30 preguntas) listos en
            arquitectura.
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {computation.specializedSuggestions.map((s) => (
              <li key={s.dimensionCode} style={{ marginBottom: "0.45rem" }}>
                <strong>{s.module}</strong> — {s.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Las cinco preguntas del diagnóstico</h3>
        <ol style={{ lineHeight: 1.6 }}>
          <li>
            <strong>¿Dónde está mi empresa actualmente?</strong> — {computation.globalLevel} (
            {computation.globalScore}/100)
          </li>
          <li>
            <strong>¿Cuáles son mis principales fortalezas?</strong> —{" "}
            {computation.strengths.map((s) => s.name).join(", ")}
          </li>
          <li>
            <strong>¿Dónde están mis principales problemas?</strong> —{" "}
            {computation.opportunities.map((o) => o.name).join(", ")}
          </li>
          <li>
            <strong>¿Qué debería atender primero?</strong> —{" "}
            {computation.opportunities[0]
              ? `${computation.opportunities[0].name} (${computation.opportunities[0].priority.label})`
              : "—"}
          </li>
          <li>
            <strong>¿Cuál debería ser mi siguiente paso?</strong> — Fase 1 Control:{" "}
            {computation.roadmap.phase1.join(" + ")}
            {computation.specializedSuggestions[0]
              ? `. Profundizar con ${computation.specializedSuggestions[0].module}.`
              : "."}
          </li>
        </ol>
      </section>

      <section className="closing-message">
        <h3>Menos caos. Más control. Mejores resultados.</h3>
        <p>Tu diagnóstico YANKOR identifica las áreas donde tu empresa tiene mayor oportunidad de mejorar.</p>
        <p>El siguiente paso no es hacer más cosas.</p>
        <p>Es hacer mejor las cosas que realmente importan.</p>
      </section>
    </div>
  );
}
