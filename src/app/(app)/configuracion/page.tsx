import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { CatalogEditor } from "@/components/CatalogEditor";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";

export default async function ConfiguracionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard");
  const dimensions = isDatabaseConfigured()
    ? await prisma.dimension.findMany({
        include: { indicators: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return (
    <div>
      <div className="page-header">
        <h2>Configuración del catálogo</h2>
        <p>
          Administra preguntas, pesos, recomendaciones y servicios relacionados sin modificar código. Fuente de
          verdad en base de datos.
        </p>
      </div>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Clasificación SQL de usuarios</h3>
        <p style={{ marginTop: 0, color: "var(--yankor-gray-soft)", lineHeight: 1.5 }}>
          Ejecuta una vez en el SQL Editor de Supabase el archivo <code>supabase/clasificacion_usuarios.sql</code>.
          Activa <strong>consultor</strong> y <strong>cliente</strong>. El perfil cliente usa el resto de la tabla
          <code>clientes</code> (RFC, teléfono, dirección).
        </p>
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="card-title">Arquitectura de niveles</h3>
        <ol style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.6 }}>
          <li>
            <strong>Nivel 1 — Business Scan™ Express</strong> (activo): 35 indicadores.
          </li>
          <li>
            <strong>Nivel 2 — Assessments especializados</strong>: campo <code>assessmentLevel</code> /
            <code>specializedModule</code> listo.
          </li>
          <li>
            <strong>Nivel 3 — Roadmap</strong>: ruta de transformación visual en resultados.
          </li>
          <li>
            <strong>Nivel 4 — Implementación</strong>: pendiente (acciones, responsables, fechas).
          </li>
          <li>
            <strong>Nivel 5 — Reevaluación</strong>: historial y comparación preparados.
          </li>
        </ol>
      </section>

      <CatalogEditor dimensions={dimensions} canEdit={user?.role === "admin"} />
    </div>
  );
}
