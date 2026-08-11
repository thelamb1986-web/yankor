import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canCreateCliente, isCliente } from "@/lib/roles";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ClienteForm } from "@/components/ClienteForm";

export default async function ClientesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canAdd = canCreateCliente(user);
  const admin = isSupabaseConfigured() ? getSupabaseAdminClient() : null;
  let clientes: Record<string, unknown>[] = [];

  if (admin) {
    const query = admin.from("clientes").select("*").order("creado_en", { ascending: false });
    const { data } = isCliente(user) ? await query.ilike("email", user.email) : await query;
    clientes = data || [];
  }

  return (
    <div>
      <div className="page-header">
        <h2>Clientes</h2>
        <p>
          {canAdd
            ? "El consultor y el administrador pueden dar de alta clientes. El registro público también crea cliente."
            : "Tu ficha de cliente."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: canAdd ? "1.2fr 0.8fr" : "1fr", gap: "1rem" }}>
        <section className="card">
          <h3 className="card-title">Listado</h3>
          {clientes.length === 0 ? (
            <div className="empty-state">No hay clientes registrados.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre / razón social</th>
                  <th>Correo</th>
                  <th>RFC</th>
                  <th>Teléfono</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={String(c.id)}>
                    <td style={{ fontWeight: 700, color: "var(--yankor-navy)" }}>{String(c.nombre)}</td>
                    <td>{String(c.email || "—")}</td>
                    <td>{String(c.rfc || String(c.direccion || "—").replace("RFC SAT: ", ""))}</td>
                    <td>{String(c.telefono || "—")}</td>
                    <td>{formatDate(c.creado_en as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {canAdd && (
          <section className="card">
            <h3 className="card-title">Nuevo cliente</h3>
            <ClienteForm />
          </section>
        )}
      </div>
    </div>
  );
}
