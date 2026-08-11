import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canUploadCsf, isCliente, isConsultor, isAdmin } from "@/lib/roles";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { CSF_BUCKET, ensureCsfBucket, rfcFromCsfFilename } from "@/lib/csf";
import { CsfUploadForm } from "@/components/CsfUploadForm";
import { formatDate } from "@/lib/utils";

function rfcFromCliente(row: { rfc?: unknown; direccion?: unknown }) {
  if (row.rfc) return String(row.rfc);
  const direccion = String(row.direccion || "");
  return direccion.replace(/^RFC SAT:\s*/i, "") || null;
}

function clienteNameFromPath(path: string, clientes: Array<{ id: string; nombre: string }>) {
  const match = path.match(/^clientes\/([^/]+)\//);
  if (!match) return null;
  return clientes.find((c) => c.id === match[1])?.nombre ?? "Cliente";
}

export default async function ConstanciasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canUploadCsf(user)) redirect("/dashboard");

  const admin = isSupabaseConfigured() ? getSupabaseAdminClient() : null;
  let clientes: Array<{ id: string; nombre: string; email?: string | null; rfc?: string | null }> = [];
  const files: Array<{
    name: string;
    path: string;
    createdAt: string | null;
    rfc: string | null;
    clienteNombre: string | null;
  }> = [];

  if (admin) {
    await ensureCsfBucket();
    if (!isCliente(user)) {
      const { data } = await admin.from("clientes").select("id, nombre, email, direccion").order("nombre");
      clientes = (data || []).map((c) => ({
        id: String(c.id),
        nombre: String(c.nombre),
        email: c.email ? String(c.email) : null,
        rfc: rfcFromCliente(c),
      }));
    }

    const prefixes = isCliente(user) ? [`usuarios/${user.id}`] : [`usuarios/${user.id}`, "clientes"];
    for (const prefix of prefixes) {
      const { data } = await admin.storage.from(CSF_BUCKET).list(prefix, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      for (const item of data || []) {
        if (!item.name.toLowerCase().endsWith(".pdf")) {
          const nested = await admin.storage.from(CSF_BUCKET).list(`${prefix}/${item.name}`, { limit: 100 });
          for (const child of nested.data || []) {
            if (!child.name.toLowerCase().endsWith(".pdf")) continue;
            const path = `${prefix}/${item.name}/${child.name}`;
            files.push({
              name: child.name,
              path,
              createdAt: child.created_at ?? null,
              rfc: rfcFromCsfFilename(child.name),
              clienteNombre: clienteNameFromPath(path, clientes),
            });
          }
          continue;
        }
        files.push({
          name: item.name,
          path: `${prefix}/${item.name}`,
          createdAt: item.created_at ?? null,
          rfc: rfcFromCsfFilename(item.name),
          clienteNombre: clienteNameFromPath(`${prefix}/${item.name}`, clientes),
        });
      }
    }
  }

  const canAssignCliente = isConsultor(user) || isAdmin(user);

  return (
    <div>
      <div className="page-header">
        <h2>Constancias CSF</h2>
        <p>
          {canAssignCliente
            ? "Selecciona el cliente al que le estás agregando el documento y carga su constancia en PDF (máximo 10 MB)."
            : "Carga tu constancia de situación fiscal en PDF (máximo 10 MB)."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1rem" }}>
        <section className="card">
          <h3 className="card-title">Archivos cargados</h3>
          {files.length === 0 ? (
            <div className="empty-state">Aún no hay constancias en PDF.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {canAssignCliente && <th>Cliente</th>}
                  <th>Archivo</th>
                  <th>RFC</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.path}>
                    {canAssignCliente && <td>{f.clienteNombre || "—"}</td>}
                    <td>{f.name}</td>
                    <td>{f.rfc || "—"}</td>
                    <td>{formatDate(f.createdAt)}</td>
                    <td>
                      <a
                        className="btn btn-secondary"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                        href={`/api/constancias/file/${f.path.split("/").map(encodeURIComponent).join("/")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h3 className="card-title">{canAssignCliente ? "Agregar documento al cliente" : "Subir constancia"}</h3>
          <p style={{ marginTop: 0, color: "var(--yankor-gray-soft)", fontSize: "0.88rem" }}>
            {canAssignCliente
              ? "Elige primero el cliente y luego el PDF. Ejemplo: "
              : "Ejemplo de nombre: "}
            <code>Csf_XXAX211010X01.pdf</code>
          </p>
          <CsfUploadForm clientes={clientes} requireCliente={canAssignCliente} />
        </section>
      </div>
    </div>
  );
}
