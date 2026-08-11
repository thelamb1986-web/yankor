require("dotenv").config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();

async function main() {
  const rest = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  const spec = await rest.json();
  const users = spec.definitions?.users || spec.definitions?.user;
  console.log("definitions keys:", Object.keys(spec.definitions || {}));
  console.log("users def:", JSON.stringify(users, null, 2));

  const sample = await fetch(`${url}/rest/v1/users?select=*&limit=1`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` },
  });
  console.log("users sample status", sample.status);
  console.log(await sample.text());
}

main();
