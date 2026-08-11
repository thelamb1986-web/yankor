require("dotenv").config();

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const publishable = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();
const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const databaseUrl = process.env.DATABASE_URL || "";

function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

async function hit(path, key) {
  const res = await fetch(`${url}${path}`, { headers: headers(key) });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, text, json };
}

async function main() {
  console.log("=== Validación YANKOR ↔ Supabase ===\n");

  console.log("1) Variables .env");
  console.log("   URL:", url || "(vacía)");
  console.log("   Publishable:", publishable ? "sí" : "no");
  console.log("   Service role:", service ? "sí" : "no");
  console.log(
    "   DATABASE_URL (Prisma/Postgres):",
    databaseUrl && !databaseUrl.includes("[PASSWORD]") ? "sí" : "NO",
  );

  console.log("\n2) API Auth (publishable key)");
  const settings = await hit("/auth/v1/settings", publishable);
  console.log("   /auth/v1/settings:", settings.status === 200 ? "OK" : `FALLO ${settings.status}`);

  console.log("\n3) API REST (service role)");
  const rest = await hit("/rest/v1/", service);
  const okRest = rest.status === 200;
  console.log("   /rest/v1/:", okRest ? "OK" : `FALLO ${rest.status}`);

  const paths = rest.json && rest.json.paths ? Object.keys(rest.json.paths) : [];
  const tables = paths
    .map((p) => p.replace(/^\//, "").split("{")[0].replace(/\/$/, ""))
    .filter((p) => p && !p.includes("rpc"));
  const uniqueTables = [...new Set(tables)].sort();
  console.log("   Tablas visibles en schema public:", uniqueTables.length ? uniqueTables.join(", ") : "(ninguna o schema vacío)");

  console.log("\n4) Tablas del SQL Editor (departamentos / clientes / procesos)");
  for (const table of ["departamentos", "clientes", "procesos"]) {
    const r = await hit(`/rest/v1/${table}?select=*&limit=1`, service);
    if (r.status === 200) console.log(`   ${table}: OK (accesible)`);
    else if (r.status === 404 || (r.json && String(r.json.message || "").includes("Could not find")))
      console.log(`   ${table}: no existe en public (o no expuesta a PostgREST)`);
    else console.log(`   ${table}: HTTP ${r.status} ${r.json?.message || r.text.slice(0, 80)}`);
  }

  console.log("\n5) Tablas del Business Scan (Prisma)");
  for (const table of ["Consultant", "Company", "Assessment", "Indicator", "Dimension"]) {
    const r = await hit(`/rest/v1/${table}?select=id&limit=1`, service);
    const alt = await hit(`/rest/v1/${table.toLowerCase()}s?select=id&limit=1`, service);
    const ok = r.status === 200 || alt.status === 200;
    console.log(`   ${table}: ${ok ? "OK" : "no existe aún (falta prisma db push)"}`);
  }

  console.log("\n6) Prisma (conexión PostgreSQL directa)");
  if (!databaseUrl || databaseUrl.includes("[PASSWORD]")) {
    console.log("   NO CONFIGURADA — el SQL Editor de Supabase no configura Prisma.");
    console.log("   Falta pegar la Connection string en DATABASE_URL del .env");
  } else {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const rows = await prisma.$queryRaw`SELECT 1::int AS ok, current_database() AS db`;
      console.log("   OK", rows);
      await prisma.$disconnect();
    } catch (e) {
      console.log("   FALLO:", e instanceof Error ? e.message : e);
    }
  }

  console.log("\n=== Resumen ===");
  const apiOk = settings.status === 200 && okRest;
  const prismaOk = Boolean(databaseUrl) && !databaseUrl.includes("[PASSWORD]");
  console.log("   Dashboard/SQL Editor Supabase: activo (según tu captura)");
  console.log("   App → API Supabase:", apiOk ? "CONECTADA" : "FALLA");
  console.log("   App → Postgres (Prisma):", prismaOk ? "configurada (ver prueba 6)" : "NO CONECTADA");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
