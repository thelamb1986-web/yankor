require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function main() {
  const url = process.env.DATABASE_URL || "";
  const direct = process.env.DIRECT_URL || "";

  console.log("DATABASE_URL configurada:", Boolean(url) && !url.includes("[YOUR-PASSWORD]"));
  console.log("DIRECT_URL configurada:", Boolean(direct) && !direct.includes("[YOUR-PASSWORD]"));
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "(vacía)");
  console.log(
    "ANON_KEY configurada:",
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
      !String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).includes("REEMPLAZAR"),
  );

  if (url.includes("[YOUR-PASSWORD]") || direct.includes("[YOUR-PASSWORD]")) {
    console.error("RESULTADO: Falta reemplazar [YOUR-PASSWORD] en DATABASE_URL / DIRECT_URL");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRaw`SELECT 1::int AS ok, current_database() AS db, version() AS version`;
    console.log("RESULTADO: Conexión exitosa");
    console.log(rows);
  } catch (error) {
    console.error("RESULTADO: Falló la conexión");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
