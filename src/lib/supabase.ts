import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
}

function publishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();
}

function serviceRoleKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && (publishableKey() || serviceRoleKey()));
}

export function getSupabaseBrowserClient() {
  const url = supabaseUrl();
  const key = publishableKey();
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o la publishable/anon key en .env");
  }
  return createClient(url, key);
}

/** Cliente servidor con service role (solo en API / server). */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = supabaseUrl();
  const serviceKey = serviceRoleKey();
  if (!url || !serviceKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
