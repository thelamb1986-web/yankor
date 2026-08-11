require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data, error } = await admin
    .from("users")
    .update({ rol: "cliente" })
    .ilike("email", "bruno@yukti.mx")
    .select("email, rol");

  if (error) {
    console.error("UPDATE FAIL:", error.message);
    process.exit(1);
  }
  console.log("updated:", (data || []).length, "rol=cliente (app lo muestra como consultor)");
}

main();
