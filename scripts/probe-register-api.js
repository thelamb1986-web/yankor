require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const email = `yankor.api.${Date.now()}@example.com`;
  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Usuario Prueba API",
      email,
      password: "yankor123",
    }),
  });
  const body = await res.json();
  console.log("HTTP", res.status, JSON.stringify(body));

  if (body?.user?.id) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
    const admin = createClient(url, service, { auth: { persistSession: false } });
    await admin.from("users").delete().eq("id", body.user.id);
    console.log("Probe user deleted");
  }
}

main();
