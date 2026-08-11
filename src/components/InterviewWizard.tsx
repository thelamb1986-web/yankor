"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MATURITY_SCALE, RISK_OPTIONS, IMPACT_OPTIONS } from "@/lib/scoring";

type IndicatorItem = {
  id: string;
  code: string;
  name: string;
  question: string;
  description: string | null;
  expectedEvidence: string | null;
  recommendation: string | null;
  relatedService: string | null;
  dimension: {
    code: string;
    name: string;
    sortOrder: number;
    description: string | null;
  };
};

type ResponseItem = {
  indicatorId: string;
  score: number | null;
  evidence: string | null;
  observations: string | null;
  risk: string | null;
  impact: string | null;
};

export function InterviewWizard({
  assessmentId,
  companyName,
  indicators,
  initialResponses,
}: {
  assessmentId: string;
  companyName: string;
  indicators: IndicatorItem[];
  initialResponses: ResponseItem[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(() => {
    const firstEmpty = indicators.findIndex((ind) => {
      const r = initialResponses.find((x) => x.indicatorId === ind.id);
      return !r || r.score == null;
    });
    return firstEmpty >= 0 ? firstEmpty : 0;
  });
  const [responses, setResponses] = useState<Record<string, ResponseItem>>(() => {
    const map: Record<string, ResponseItem> = {};
    for (const ind of indicators) {
      const existing = initialResponses.find((r) => r.indicatorId === ind.id);
      map[ind.id] = existing ?? {
        indicatorId: ind.id,
        score: null,
        evidence: "",
        observations: "",
        risk: null,
        impact: null,
      };
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const current = indicators[index];
  const currentResponse = responses[current.id];
  const total = indicators.length;
  const answered = Object.values(responses).filter((r) => r.score != null && r.risk && r.impact).length;
  const progress = Math.round((answered / total) * 100);

  const dimensionMeta = useMemo(() => {
    const codes = Array.from(new Set(indicators.map((i) => i.dimension.code)));
    const dimIndex = codes.indexOf(current.dimension.code) + 1;
    return { dimIndex, dimTotal: codes.length };
  }, [indicators, current]);

  function updateField<K extends keyof ResponseItem>(key: K, value: ResponseItem[K]) {
    setResponses((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], [key]: value },
    }));
  }

  async function saveCurrent() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = responses[current.id];
      const res = await fetch(`/api/assessments/${assessmentId}/responses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return false;
      }
      setMessage("Guardado");
      return true;
    } catch {
      setError("Error de conexión");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function goNext() {
    const ok = await saveCurrent();
    if (!ok) return;
    if (index < total - 1) setIndex((i) => i + 1);
  }

  async function goPrev() {
    await saveCurrent();
    if (index > 0) setIndex((i) => i - 1);
  }

  async function complete() {
    const ok = await saveCurrent();
    if (!ok) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo completar");
        return;
      }
      router.push(`/diagnosticos/${assessmentId}`);
      router.refresh();
    } catch {
      setError("Error al finalizar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Entrevista Business Scan™</h2>
        <p>
          {companyName} · Dimensión {dimensionMeta.dimIndex} de {dimensionMeta.dimTotal} · Indicador{" "}
          {index + 1} de {total} · Progreso {progress}%
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="interview-layout">
        <aside className="interview-sidebar card">
          <h3 className="card-title">Indicadores</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 520, overflow: "auto" }}>
            {indicators.map((ind, i) => {
              const r = responses[ind.id];
              const done = r.score != null && r.risk && r.impact;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={async () => {
                    await saveCurrent();
                    setIndex(i);
                  }}
                  style={{
                    textAlign: "left",
                    border: i === index ? "1px solid var(--yankor-green)" : "1px solid transparent",
                    background: i === index ? "rgba(40,167,69,0.08)" : "transparent",
                    borderRadius: 8,
                    padding: "0.45rem 0.55rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--yankor-navy)" }}>
                    {ind.code} · {ind.name}
                  </div>
                  <div style={{ color: "var(--yankor-gray-soft)" }}>
                    {done ? `✓ ${r.score}/5` : "Pendiente"}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="card">
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
            <span className="chip">{current.dimension.code} — {current.dimension.name}</span>
            <span className="chip">{current.code}</span>
            {current.relatedService && <span className="chip">{current.relatedService}</span>}
          </div>

          <h3 style={{ margin: "0 0 0.5rem", color: "var(--yankor-navy)", fontSize: "1.25rem" }}>
            {current.name}
          </h3>
          <p style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.45 }}>
            {current.question}
          </p>

          {current.description && (
            <div style={{ marginBottom: "0.85rem" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--yankor-gray-soft)", textTransform: "uppercase" }}>
                Qué se evalúa
              </div>
              <p style={{ margin: "0.25rem 0 0", lineHeight: 1.5 }}>{current.description}</p>
            </div>
          )}

          {current.expectedEvidence && (
            <div
              style={{
                marginBottom: "1.1rem",
                background: "rgba(13,27,61,0.04)",
                borderRadius: 10,
                padding: "0.75rem 0.9rem",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--yankor-navy)" }}>
                Evidencia esperada
              </div>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", lineHeight: 1.45 }}>
                {current.expectedEvidence}
              </p>
            </div>
          )}

          <div style={{ marginBottom: "1.1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--yankor-navy)", marginBottom: "0.55rem" }}>
              Calificación (1–5)
            </div>
            <div className="maturity-scale">
              {MATURITY_SCALE.map((level) => (
                <button
                  key={level.level}
                  type="button"
                  className={`maturity-option ${currentResponse.score === level.level ? "selected" : ""}`}
                  onClick={() => updateField("score", level.level)}
                  title={level.description}
                >
                  <div className="num">{level.level}</div>
                  <div className="name">{level.name}</div>
                </button>
              ))}
            </div>
            {currentResponse.score != null && (
              <p style={{ marginTop: "0.65rem", fontSize: "0.85rem", color: "var(--yankor-gray-soft)" }}>
                {MATURITY_SCALE[currentResponse.score - 1].description}
              </p>
            )}
          </div>

          <div className="field">
            <label>Evidencia</label>
            <textarea
              value={currentResponse.evidence || ""}
              onChange={(e) => updateField("evidence", e.target.value)}
              placeholder="Describe la evidencia observada o referida..."
            />
          </div>

          <div className="field">
            <label>Observaciones</label>
            <textarea
              value={currentResponse.observations || ""}
              onChange={(e) => updateField("observations", e.target.value)}
              placeholder="Notas del consultor, matices, contexto..."
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="field">
              <label>Riesgo</label>
              <select
                value={currentResponse.risk || ""}
                onChange={(e) => updateField("risk", e.target.value || null)}
              >
                <option value="">Seleccionar...</option>
                {RISK_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === "Critico" ? "Crítico" : r}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Impacto</label>
              <select
                value={currentResponse.impact || ""}
                onChange={(e) => updateField("impact", e.target.value || null)}
              >
                <option value="">Seleccionar...</option>
                {IMPACT_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(message || error) && (
            <p style={{ color: error ? "var(--yankor-red)" : "var(--yankor-green-dark)", fontSize: "0.88rem" }}>
              {error || message}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={goPrev} disabled={index === 0 || saving}>
              Anterior
            </button>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-secondary" onClick={saveCurrent} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
              {index < total - 1 ? (
                <button type="button" className="btn btn-primary" onClick={goNext} disabled={saving}>
                  Siguiente
                </button>
              ) : (
                <button type="button" className="btn btn-navy" onClick={complete} disabled={saving}>
                  Finalizar diagnóstico
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
