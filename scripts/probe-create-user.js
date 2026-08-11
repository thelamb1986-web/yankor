require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

async function tryRole(admin, rol) {
  const email = `yankor.probe.${rol}.${Date.now()}@example.com`;
  const hash = await bcrypt.hash("probe12345", 10);
  const { data, error } = await admin
    .from("users")
    .insert({
      nombre: "Probe YANKOR",
      email,
      password_hash: hash,
      rol,
      activo: true,
    })
    .select("id, rol")
    .single();
  if (error) {
    console.log(`rol=${rol} FAIL: ${error.message}`);
    return;
  }
  console.log(`rol=${rol} OK`);
  await admin.from("users").delete().eq("id", data.id);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const rol of ["cliente", "admin", "consultor", "consultant", "usuario", "operador"]) {
    await tryRole(admin, rol);
  }
}

main();
