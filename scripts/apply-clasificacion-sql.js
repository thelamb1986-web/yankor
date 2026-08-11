require("dotenv").config();
const fs = require("fs");
const path = require("path");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const service = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
const sql = fs.readFileSync(path.join(__dirname, "../supabase/clasificacion_usuarios.sql"), "utf8");

async function tryEndpoint(name, endpoint, init) {
  try {
    const res = await fetch(endpoint, init);
    const text = await res.text();
    console.log(`${name}: ${res.status} ${text.slice(0, 120).replace(/\s+/g, " ")}`);
    return res.ok;
  } catch (e) {
    console.log(`${name}: FAIL ${e.message}`);
    return false;
  }
}

async function main() {
  const headers = {
    apikey: service,
    Authorization: `Bearer ${service}`,
    "Content-Type": "application/json",
  };

  const ok =
    (await tryEndpoint("pg/query", `${url}/pg/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: sql }),
    })) ||
    (await tryEndpoint("database/query", `${url}/database/v1/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: sql }),
    }));

  if (!ok) {
    console.log("NO_SQL_API: aplica el archivo supabase/clasificacion_usuarios.sql en el SQL Editor.");
  }
}

main();
