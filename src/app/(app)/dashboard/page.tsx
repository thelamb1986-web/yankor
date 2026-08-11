import Link from "next/link";
import { redirect } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Building2, ClipboardList, AlertCircle, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";
  const mine = isAdmin ? {} : { consultantId: user.id };
  const companyFilter = isAdmin
    ? undefined
    : {
        OR: [{ createdById: user.id }, { assessments: { some: { consultantId: user.id } } }],
      };

  const dbReady = isDatabaseConfigured();
  const [companyCount, assessments, pending, completed, pendingList] = dbReady
    ? await Promise.all([
        prisma.company.count({ where: companyFilter }),
        prisma.assessment.count({ where: mine }),
        prisma.assessment.count({ where: { ...mine, status: "in_progress" } }),
        prisma.assessment.findMany({
          where: { ...mine, status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 5,
          include: { company: true, consultant: true },
        }),
        prisma.assessment.findMany({
          where: { ...mine, status: "in_progress" },
          orderBy: { startedAt: "desc" },
          take: 5,
          include: { company: true },
        }),
      ])
    : [0, 0, 0, [] as Awaited<ReturnType<typeof prisma.assessment.findMany>>, [] as Awaited<ReturnType<typeof prisma.assessment.findMany>>];

  return (
    <div>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
      >
        <div>
          <h2>Hola, {user.name.split(" ")[0]}</h2>
          <p>
            {isAdmin
              ? "Dashboard general YANKOR — vista de toda la operación."
              : "Tu dashboard de consultor — empresas y diagnósticos a tu cargo."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/empresas/nueva" className="btn btn-secondary">
            Nueva empresa
          </Link>
          <Link href="/diagnosticos/nuevo" className="btn btn-primary">
            Nuevo diagnóstico
          </Link>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: "1.25rem" }}>
        <div className="stat-card">
          <div className="label">{isAdmin ? "Empresas" : "Mis empresas"}</div>
          <div className="value">{companyCount}</div>
          <div
            style={{
              marginTop: 8,
              color: "var(--yankor-gray-soft)",
              fontSize: "0.82rem",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Building2 size={14} /> {isAdmin ? "Portafolio activo" : "Tu portafolio"}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">{isAdmin ? "Diagnósticos" : "Mis diagnósticos"}</div>
          <div className="value">{assessments}</div>
          <div
            style={{
              marginTop: 8,
              color: "var(--yankor-gray-soft)",
              fontSize: "0.82rem",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <ClipboardList size={14} /> Totales registrados
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Pendientes</div>
          <div className="value">{pending}</div>
          <div
            style={{
              marginTop: 8,
              color: "var(--yankor-gray-soft)",
              fontSize: "0.82rem",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <AlertCircle size={14} /> En entrevista
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Último índice</div>
          <div className="value">{completed[0]?.globalScore ?? "—"}</div>
          <div
            style={{
              marginTop: 8,
              color: "var(--yankor-gray-soft)",
              fontSize: "0.82rem",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <TrendingUp size={14} /> {completed[0]?.globalLevel ?? "Sin resultados"}
          </div>
        </div>
      </div>

      {assessments === 0 && (
        <section className="card" style={{ marginBottom: "1.1rem" }}>
          <h3 className="card-title">Empieza aquí</h3>
          <p style={{ marginTop: 0, color: "var(--yankor-gray-soft)", lineHeight: 1.5 }}>
            Tu cuenta ya está lista. Registra una empresa y lanza tu primer Business Scan™ Express para ver
            resultados en este panel.
          </p>
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <Link href="/empresas/nueva" className="btn btn-navy">
              1. Registrar empresa
            </Link>
            <Link href="/diagnosticos/nuevo" className="btn btn-primary">
              2. Iniciar diagnóstico
            </Link>
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.1rem" }}>
        <section className="card">
          <h3 className="card-title">{isAdmin ? "Últimos resultados" : "Mis últimos resultados"}</h3>
          {completed.length === 0 ? (
            <div className="empty-state">Aún no hay diagnósticos completados.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Fecha</th>
                  <th>Índice</th>
                  <th>Nivel</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {completed.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.company.tradeName}</div>
                      {isAdmin && (
                        <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)" }}>
                          {a.consultant.name}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(a.completedAt)}</td>
                    <td style={{ fontWeight: 800, color: "var(--yankor-navy)" }}>{a.globalScore}/100</td>
                    <td>
                      <span className="badge badge-navy">{a.globalLevel}</span>
                    </td>
                    <td>
                      <Link
                        href={`/diagnosticos/${a.id}`}
                        className="btn btn-secondary"
                        style={{ padding: "0.4rem 0.7rem", fontSize: "0.8rem" }}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h3 className="card-title">Diagnósticos pendientes</h3>
          {pendingList.length === 0 ? (
            <div className="empty-state">No hay entrevistas en curso.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pendingList.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    alignItems: "center",
                    padding: "0.75rem",
                    border: "1px solid var(--yankor-border)",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--yankor-navy)" }}>{a.company.tradeName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--yankor-gray-soft)" }}>
                      Iniciado {formatDate(a.startedAt)} · {a.companyType}
                    </div>
                  </div>
                  <Link
                    href={`/diagnosticos/${a.id}/entrevista`}
                    className="btn btn-navy"
                    style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    Continuar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
