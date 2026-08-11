require("dotenv").config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();

async function main() {
  const rest = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  const spec = await rest.json();
  console.log("rpc paths:", Object.keys(spec.paths || {}).filter((p) => p.includes("rpc")).slice(0, 40).join(", "));
  console.log("users props:", Object.keys(spec.definitions?.users?.properties || {}));
  console.log("clientes props:", Object.keys(spec.definitions?.clientes?.properties || {}));
}

main();
