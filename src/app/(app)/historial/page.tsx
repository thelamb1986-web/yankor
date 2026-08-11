import Link from "next/link";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ComparisonChart } from "@/components/ComparisonChart";

type Props = { searchParams: Promise<{ companyId?: string }> };

export default async function HistorialPage({ searchParams }: Props) {
  const { companyId } = await searchParams;

  const companies = isDatabaseConfigured()
    ? await prisma.company.findMany({
        orderBy: { tradeName: "asc" },
        include: {
          assessments: {
            where: { status: "completed" },
            orderBy: { completedAt: "asc" },
            include: { dimensionScores: true },
          },
        },
      })
    : [];

  const selected =
    companies.find((c) => c.id === companyId) ||
    companies.find((c) => c.assessments.length > 0) ||
    companies[0];

  const series =
    selected?.assessments.map((a, idx) => ({
      label:
        idx === 0
          ? "Inicial"
          : formatDate(a.completedAt),
      score: a.globalScore ?? 0,
      date: a.completedAt,
      id: a.id,
      level: a.globalLevel,
    })) ?? [];

  return (
    <div>
      <div className="page-header">
        <h2>Historial y comparación</h2>
        <p>Compara diagnóstico inicial vs. reevaluaciones (3, 6 o 12 meses).</p>
      </div>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <form method="get" style={{ display: "flex", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }}>
          <div className="field" style={{ marginBottom: 0, minWidth: 280 }}>
            <label htmlFor="companyId">Empresa</label>
            <select id="companyId" name="companyId" defaultValue={selected?.id || ""}>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradeName} ({c.assessments.length} diagnósticos)
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Ver evolución
          </button>
        </form>
      </section>

      {!selected || series.length === 0 ? (
        <section className="card">
          <div className="empty-state">
            No hay diagnósticos completados para comparar. Completa al menos uno para ver la evolución.
          </div>
        </section>
      ) : (
        <>
          <section className="card" style={{ marginBottom: "1rem" }}>
            <h3 className="card-title">Evolución del Índice YANKOR — {selected.tradeName}</h3>
            <ComparisonChart data={series.map((s) => ({ name: s.label, score: s.score }))} />
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              {series.map((s) => (
                <div key={s.id} className="chip">
                  {s.label}: <strong>{s.score}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Detalle de evaluaciones</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Momento</th>
                  <th>Fecha</th>
                  <th>Índice</th>
                  <th>Nivel</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.id}>
                    <td>{s.label}</td>
                    <td>{formatDate(s.date)}</td>
                    <td style={{ fontWeight: 800 }}>{s.score}/100</td>
                    <td>{s.level}</td>
                    <td>
                      <Link href={`/diagnosticos/${s.id}`} className="btn btn-secondary" style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {series.length === 1 && (
              <p style={{ marginTop: "0.85rem", color: "var(--yankor-gray-soft)", fontSize: "0.88rem" }}>
                Arquitectura lista para reevaluación: al completar un nuevo Business Scan de la misma empresa,
                esta vista mostrará la evolución (inicial vs. 6 meses vs. 12 meses).
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
