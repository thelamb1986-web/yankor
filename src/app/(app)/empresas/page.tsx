import Link from "next/link";
import { redirect } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function EmpresasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";
  const companies = isDatabaseConfigured()
    ? await prisma.company.findMany({
        where: isAdmin
          ? undefined
          : {
              OR: [{ createdById: user.id }, { assessments: { some: { consultantId: user.id } } }],
            },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { assessments: true } } },
      })
    : [];

  return (
    <div>
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
      >
        <div>
          <h2>{isAdmin ? "Empresas" : "Mis empresas"}</h2>
          <p>
            {isAdmin
              ? "Portafolio completo de PyMES evaluadas o en seguimiento."
              : "Empresas que registraste o en las que tienes diagnósticos."}
          </p>
        </div>
        <Link href="/empresas/nueva" className="btn btn-primary">
          Nueva empresa
        </Link>
      </div>

      <section className="card">
        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No hay empresas en tu portafolio.</p>
            <Link href="/empresas/nueva" className="btn btn-primary" style={{ marginTop: "0.75rem" }}>
              Registrar mi primera empresa
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Sector</th>
                <th>Empleados</th>
                <th>Ciudad</th>
                <th>Diagnósticos</th>
                <th>Alta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--yankor-navy)" }}>{c.tradeName}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--yankor-gray-soft)" }}>
                      {c.contactName || "Sin contacto"}
                      {c.isDemo ? " · Demo" : ""}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-navy">{c.companyType}</span>
                  </td>
                  <td>{c.sector || "—"}</td>
                  <td>{c.employees ?? "—"}</td>
                  <td>{c.city || "—"}</td>
                  <td>{c._count.assessments}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    <Link
                      href={`/empresas/${c.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.7rem", fontSize: "0.8rem" }}
                    >
                      Ficha
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
