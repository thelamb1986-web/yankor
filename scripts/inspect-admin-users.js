require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { count, error: countError } = await admin.from("users").select("id", { count: "exact", head: true });
  if (countError) {
    console.error("count error:", countError.message);
    process.exit(1);
  }

  const { data: admins, error: adminError } = await admin
    .from("users")
    .select("email, rol, activo, password_hash")
    .eq("rol", "admin");
  if (adminError) {
    console.error("admin query error:", adminError.message);
    process.exit(1);
  }

  const { data: demo } = await admin
    .from("users")
    .select("email, rol, activo, password_hash")
    .eq("email", "admin@yankor.com")
    .maybeSingle();

  console.log("totalUsers:", count);
  console.log("adminRoleCount:", (admins || []).length);
  console.log("demoAdminExists:", Boolean(demo));

  const target = demo || (admins && admins[0]);
  if (!target) {
    console.log("status: no-admin-row");
    return;
  }

  const hash = String(target.password_hash || "");
  const kind = hash.startsWith("$2") ? "bcrypt" : hash.length === 0 ? "empty" : "not-bcrypt";
  let matches = false;
  if (kind === "bcrypt") matches = await bcrypt.compare("yankor2026", hash);
  else if (kind === "not-bcrypt") matches = hash === "yankor2026";

  console.log("adminActivo:", target.activo);
  console.log("passwordKind:", kind);
  console.log("matchesKnownDemoPassword:", matches);
}

main();
