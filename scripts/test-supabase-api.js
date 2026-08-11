require("dotenv").config();

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const publishable = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();
const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

async function hit(path, key, label) {
  const res = await fetch(`${url}${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  const text = await res.text();
  const snippet = text.slice(0, 180).replace(/\s+/g, " ");
  console.log(`[${label}] ${path} → ${res.status} ${res.statusText} | ${snippet}`);
  return res.status;
}

async function main() {
  console.log("Proyecto:", url);

  const health = await fetch(`${url}/auth/v1/health`);
  const healthBody = await health.text();
  console.log(`[sin key] /auth/v1/health → ${health.status} | ${healthBody.slice(0, 120)}`);

  await hit("/auth/v1/settings", publishable, "publishable");
  await hit("/rest/v1/", publishable, "publishable");
  if (service) {
    await hit("/rest/v1/", service, "service");
    await hit("/auth/v1/settings", service, "service");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
