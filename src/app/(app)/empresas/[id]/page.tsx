import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DeleteDemoButton } from "@/components/DeleteDemoButton";

type Props = { params: Promise<{ id: string }> };

export default async function EmpresaDetallePage({ params }: Props) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      assessments: {
        orderBy: { startedAt: "desc" },
        include: { consultant: true },
      },
    },
  });

  if (!company) notFound();

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2>{company.tradeName}</h2>
          <p>
            {company.legalName || "Sin razón social"} · {company.companyType}
            {company.isDemo ? " · Datos demo" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href={`/diagnosticos/nuevo?companyId=${company.id}`} className="btn btn-primary">
            Nuevo diagnóstico
          </Link>
          <Link href={`/historial?companyId=${company.id}`} className="btn btn-secondary">
            Comparar historial
          </Link>
          {company.isDemo && <DeleteDemoButton companyId={company.id} />}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <section className="card">
          <h3 className="card-title">Datos generales</h3>
          <table className="table">
            <tbody>
              <tr><td>Sector</td><td>{company.sector || "—"}</td></tr>
              <tr><td>Empleados</td><td>{company.employees ?? "—"}</td></tr>
              <tr><td>Ciudad</td><td>{company.city || "—"}</td></tr>
              <tr><td>Fecha de alta</td><td>{formatDate(company.createdAt)}</td></tr>
            </tbody>
          </table>
        </section>
        <section className="card">
          <h3 className="card-title">Contacto</h3>
          <table className="table">
            <tbody>
              <tr><td>Nombre</td><td>{company.contactName || "—"}</td></tr>
              <tr><td>Puesto</td><td>{company.contactRole || "—"}</td></tr>
              <tr><td>Teléfono</td><td>{company.phone || "—"}</td></tr>
              <tr><td>Correo</td><td>{company.email || "—"}</td></tr>
            </tbody>
          </table>
        </section>
      </div>

      <section className="card">
        <h3 className="card-title">Diagnósticos de la empresa</h3>
        {company.assessments.length === 0 ? (
          <div className="empty-state">Sin diagnósticos aún.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Consultor</th>
                <th>Estado</th>
                <th>Índice</th>
                <th>Nivel</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {company.assessments.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.completedAt || a.startedAt)}</td>
                  <td>{a.consultant.name}</td>
                  <td>
                    <span className={`badge ${a.status === "completed" ? "badge-green" : "badge-high"}`}>
                      {a.status === "completed" ? "Completado" : "En progreso"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800 }}>{a.globalScore != null ? `${a.globalScore}/100` : "—"}</td>
                  <td>{a.globalLevel || "—"}</td>
                  <td>
                    <Link
                      href={a.status === "completed" ? `/diagnosticos/${a.id}` : `/diagnosticos/${a.id}/entrevista`}
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
