import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canCreateConsultor } from "@/lib/roles";
import { ConsultantForm } from "@/components/ConsultantForm";
import { formatDate } from "@/lib/utils";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  assessmentsCount: number;
  createdAt: Date | string;
};

export default async function ConsultoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canCreateConsultor(user)) redirect("/clientes");

  let consultants: TeamMember[] = [];

  if (isSupabaseConfigured()) {
    const admin = getSupabaseAdminClient();
    const { data } = await admin.from("users").select("*").order("created_at", { ascending: true });
    consultants = (data || [])
      .filter((row) => {
        const email = String(row.email || "").toLowerCase();
        return row.rol === "consultor" || row.rol === "admin" || email === "bruno@yukti.mx" || email === "admin@yankor.com";
      })
      .map((row) => ({
        id: row.id,
        name: row.nombre,
        email: row.email,
        role: row.rol === "admin" ? "admin" : "consultor",
        status: row.activo ? "active" : "inactive",
        assessmentsCount: 0,
        createdAt: row.created_at,
      }));
  } else if (isDatabaseConfigured()) {
    const rows = await prisma.consultant.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assessments: true } } },
    });
    consultants = rows.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      status: c.status,
      assessmentsCount: c._count.assessments,
      createdAt: c.createdAt,
    }));
  }

  return (
    <div>
      <div className="page-header">
        <h2>Consultores</h2>
          <p>Solo el administrador puede agregar consultores. Los clientes se dan de alta en Clientes.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
        <section className="card">
          <h3 className="card-title">Equipo</h3>
          {consultants.length === 0 ? (
            <div className="empty-state">Aún no hay consultores.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Diagnósticos</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {consultants.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>
                      <span className="badge badge-navy">{c.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === "active" ? "badge-green" : "badge-medium"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.assessmentsCount}</td>
                    <td>{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h3 className="card-title">Nuevo consultor</h3>
          <ConsultantForm />
        </section>
      </div>
    </div>
  );
}
