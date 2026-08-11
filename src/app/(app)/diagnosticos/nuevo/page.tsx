"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Company = { id: string; tradeName: string; companyType: string };

function NuevoDiagnosticoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState(searchParams.get("companyId") || "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((d) => setCompanies(d.companies || []));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo crear el diagnóstico");
        return;
      }
      router.push(`/diagnosticos/${data.assessment.id}/entrevista`);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const selected = companies.find((c) => c.id === companyId);

  return (
    <div>
      <div className="page-header">
        <h2>Nuevo diagnóstico</h2>
        <p>Business Scan™ Express — entrevista guiada de 35 indicadores (45–60 min).</p>
      </div>

      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div className="field">
          <label>Empresa *</label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} required>
            <option value="">Seleccionar empresa...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradeName} ({c.companyType})
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div style={{ marginBottom: "1rem" }}>
            <span className="chip">Tipo: {selected.companyType}</span>
            <span className="chip" style={{ marginLeft: 8 }}>
              Nivel: Express
            </span>
            <p style={{ marginTop: "0.75rem", fontSize: "0.88rem", color: "var(--yankor-gray-soft)" }}>
              Arquitectura preparada para activar preguntas específicas de Manufactura o Servicios en
              assessments especializados posteriores. Este Express usa el catálogo base de 35 indicadores.
            </p>
          </div>
        )}

        <div className="field">
          <label>Notas de la sesión</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contexto de la reunión, asistentes, objetivo del diagnóstico..."
          />
        </div>

        <div
          style={{
            background: "rgba(13,27,61,0.04)",
            borderRadius: 12,
            padding: "0.9rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.88rem",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--yankor-navy)" }}>Recordatorio metodológico:</strong> esta herramienta
          es un diagnóstico de madurez empresarial y operativa. No es una auditoría financiera, fiscal, legal o
          contable. Su finalidad es detectar dónde conviene profundizar.
        </div>

        {error && <p style={{ color: "var(--yankor-red)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary" disabled={loading || !companyId}>
            {loading ? "Preparando..." : "Iniciar entrevista"}
          </button>
          <Link href="/empresas/nueva" className="btn btn-secondary">
            Registrar empresa
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NuevoDiagnosticoPage() {
  return (
    <Suspense fallback={<div className="card">Cargando...</div>}>
      <NuevoDiagnosticoForm />
    </Suspense>
  );
}
