import Link from "next/link";
import { redirect } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function DiagnosticosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";
  const assessments = isDatabaseConfigured()
    ? await prisma.assessment.findMany({
        where: isAdmin ? undefined : { consultantId: user.id },
        orderBy: { startedAt: "desc" },
        include: { company: true, consultant: true },
      })
    : [];

  return (
    <div>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
      >
        <div>
          <h2>{isAdmin ? "Diagnósticos" : "Mis diagnósticos"}</h2>
          <p>
            {isAdmin
              ? "Business Scan™ Express — historial de todas las evaluaciones."
              : "Tus evaluaciones Business Scan™ Express."}
          </p>
        </div>
        <Link href="/diagnosticos/nuevo" className="btn btn-primary">
          Nuevo diagnóstico
        </Link>
      </div>

      <section className="card">
        {assessments.length === 0 ? (
          <div className="empty-state">
            <p>Aún no tienes diagnósticos.</p>
            <Link href="/diagnosticos/nuevo" className="btn btn-primary" style={{ marginTop: "0.75rem" }}>
              Iniciar mi primer diagnóstico
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                {isAdmin && <th>Consultor</th>}
                <th>Tipo</th>
                <th>Estado</th>
                <th>Índice</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{a.company.tradeName}</div>
                    {a.isDemo && <span className="badge badge-medium">Demo</span>}
                  </td>
                  {isAdmin && <td>{a.consultant.name}</td>}
                  <td>{a.companyType}</td>
                  <td>
                    <span className={`badge ${a.status === "completed" ? "badge-green" : "badge-high"}`}>
                      {a.status === "completed" ? "Completado" : "En progreso"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: "var(--yankor-navy)" }}>
                    {a.globalScore != null ? `${a.globalScore}/100` : "—"}
                  </td>
                  <td>{formatDate(a.completedAt || a.startedAt)}</td>
                  <td>
                    <Link
                      href={
                        a.status === "completed" ? `/diagnosticos/${a.id}` : `/diagnosticos/${a.id}/entrevista`
                      }
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.7rem", fontSize: "0.8rem" }}
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
