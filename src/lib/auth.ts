import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";
import { isDatabaseConfigured, prisma } from "./prisma";
import {
  normalizeEmail,
  normalizeRfc,
  validateEmailConfirmation,
  validateRfcSat,
} from "./validation";

const SESSION_COOKIE = "yankor_session";
const SESSION_DAYS = 14;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function sessionSecret() {
  return process.env.SESSION_SECRET || "yankor-business-scan-mvp-secret-change-in-production";
}

function signSession(userId: string) {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const data = Buffer.from(JSON.stringify({ id: userId, exp })).toString("base64url");
  const sig = createHmac("sha256", sessionSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function readSession(token: string | undefined): { id: string; exp: number } | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", sessionSecret()).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as { id: string; exp: number };
    if (!payload?.id || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  });
}

const DEMO_ADMIN_EMAIL = "admin@yankor.com";
const DEMO_ADMIN_PASSWORD = "yankor2026";
const CONSULTOR_EMAILS = new Set(["bruno@yukti.mx"]);

export type Perfil = "consultor" | "cliente" | "admin";

function mapRole(rol: string | null | undefined, email?: string): Perfil {
  const normalized = (email || "").toLowerCase().trim();
  if (normalized === DEMO_ADMIN_EMAIL) return "admin";
  if (CONSULTOR_EMAILS.has(normalized) || rol === "consultor") return "consultor";
  if (rol === "admin") return "admin";
  return "cliente";
}

async function insertClienteRecord(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  input: {
    userId: string;
    nombre: string;
    email: string;
    telefono?: string;
    rfc: string;
  },
) {
  const attempts = [
    {
      user_id: input.userId,
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono || null,
      rfc: input.rfc,
      direccion: `RFC SAT: ${input.rfc}`,
    },
    {
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono || null,
      rfc: input.rfc,
      direccion: `RFC SAT: ${input.rfc}`,
    },
    {
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono || null,
      direccion: `RFC SAT: ${input.rfc}`,
    },
  ];

  let lastError = null;
  for (const payload of attempts) {
    const { error } = await admin.from("clientes").insert(payload);
    if (!error) return null;
    lastError = error;
  }
  return lastError;
}

async function passwordMatches(password: string, stored: string | null | undefined) {
  const hash = String(stored || "");
  if (!hash) return false;
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compare(password, hash);
  }
  return password === hash;
}

async function findSupabaseUserByEmail(email: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("users").select("*").ilike("email", email).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Garantiza el admin demo en la tabla public.users de Supabase. */
export async function ensureYankorAdmin() {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseAdminClient();
  const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  const existing = await findSupabaseUserByEmail(DEMO_ADMIN_EMAIL);

  if (!existing) {
    const { error } = await client.from("users").insert({
      nombre: "Administrador YANKOR",
      email: DEMO_ADMIN_EMAIL,
      password_hash: passwordHash,
      rol: "admin",
      activo: true,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await client
    .from("users")
    .update({
      rol: "admin",
      activo: true,
      password_hash: passwordHash,
    })
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
}

async function findSupabaseUserById(id: string) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

function toAuthUser(row: { id: string; nombre?: string; name?: string; email: string; rol?: string; role?: string }): AuthUser {
  return {
    id: row.id,
    name: row.nombre || row.name || row.email,
    email: row.email,
    role: mapRole(row.rol || row.role, row.email),
  };
}

export async function login(email: string, password: string): Promise<AuthUser | null> {
  const normalized = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    if (normalized === DEMO_ADMIN_EMAIL) {
      await ensureYankorAdmin();
    }

    if (CONSULTOR_EMAILS.has(normalized)) {
      await getSupabaseAdminClient().from("users").update({ rol: "consultor" }).ilike("email", normalized);
    }

    const row = await findSupabaseUserByEmail(normalized);
    if (!row || row.activo === false) return null;
    const ok = await passwordMatches(password, row.password_hash);
    if (!ok) return null;
    await setSessionCookie(row.id);
    return toAuthUser(row);
  }

  if (!isDatabaseConfigured()) return null;

  const user = await prisma.consultant.findUnique({ where: { email: normalized } });
  if (!user || user.status !== "active") return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  await setSessionCookie(user.id);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function createClienteAccount(
  input: {
    name: string;
    email: string;
    emailConfirm?: string;
    rfc: string;
    telefono?: string;
    password: string;
  },
  options: { signIn?: boolean } = {},
): Promise<{ user: AuthUser } | { error: string }> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  const rfc = normalizeRfc(input.rfc);
  const telefono = (input.telefono || "").trim();

  if (!name || name.length < 2) {
    return { error: "El nombre o razón social debe tener al menos 2 caracteres." };
  }

  const emailError = validateEmailConfirmation(input.email, input.emailConfirm ?? "");
  if (emailError) return { error: emailError };

  const rfcError = validateRfcSat(rfc);
  if (rfcError) return { error: rfcError };

  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (isSupabaseConfigured()) {
    const existing = await findSupabaseUserByEmail(email);
    if (existing) {
      return { error: "Ya existe una cuenta con ese correo." };
    }

    const admin = getSupabaseAdminClient();

    const { data: existingCliente } = await admin
      .from("clientes")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existingCliente) {
      return { error: "Ya existe un cliente con ese correo." };
    }

    const { data: rfcDirect } = await admin.from("clientes").select("id").eq("direccion", rfc).maybeSingle();
    const { data: rfcLabeled } = await admin
      .from("clientes")
      .select("id")
      .eq("direccion", `RFC SAT: ${rfc}`)
      .maybeSingle();
    if (rfcDirect || rfcLabeled) {
      return { error: "Ya existe un cliente con ese RFC." };
    }

    const { data, error } = await admin
      .from("users")
      .insert({
        nombre: name,
        email,
        telefono: telefono || null,
        empresa: name,
        password_hash: passwordHash,
        rol: "cliente",
        activo: true,
      })
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message || "No se pudo crear la cuenta en Supabase." };
    }

    const clienteError = await insertClienteRecord(admin, {
      userId: data.id,
      nombre: name,
      email,
      telefono,
      rfc,
    });

    if (clienteError) {
      await admin.from("users").delete().eq("id", data.id);
      return { error: `La cuenta no se creó: ${clienteError.message}` };
    }

    if (options.signIn) {
      await setSessionCookie(data.id);
    }
    return { user: toAuthUser(data) };
  }

  if (!isDatabaseConfigured()) {
    return { error: "Supabase no está configurado. Revisa URL y keys en .env." };
  }

  const existing = await prisma.consultant.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const user = await prisma.consultant.create({
    data: {
      name,
      email,
      passwordHash,
      role: "consultant",
      status: "active",
    },
  });

  if (options.signIn) {
    await setSessionCookie(user.id);
  }
  return { user: { id: user.id, name: user.name, email: user.email, role: "cliente" } };
}

/** Alta pública o auto-registro: siempre queda como cliente e inicia sesión. */
export async function register(input: {
  name: string;
  email: string;
  emailConfirm?: string;
  rfc: string;
  telefono?: string;
  password: string;
}): Promise<{ user: AuthUser } | { error: string }> {
  return createClienteAccount(input, { signIn: true });
}

/** Alta de perfil consultor (sin ficha de cliente / RFC). */
export async function registerConsultor(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser } | { error: string }> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!name || name.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };
  const emailError = validateEmailConfirmation(email, email);
  if (emailError) return { error: emailError };
  if (!password || password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!isSupabaseConfigured()) return { error: "Supabase no está configurado." };

  const existing = await findSupabaseUserByEmail(email);
  if (existing) return { error: "Ya existe una cuenta con ese correo." };

  const admin = getSupabaseAdminClient();
  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await admin
    .from("users")
    .insert({
      nombre: name,
      email,
      password_hash: passwordHash,
      rol: "consultor",
      activo: true,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      error:
        error?.message?.includes("users_rol_check")
          ? "Falta aplicar la clasificación SQL (rol consultor/cliente). Ejecuta supabase/clasificacion_usuarios.sql en el SQL Editor."
          : error?.message || "No se pudo crear el consultor.",
    };
  }

  return { user: toAuthUser(data) };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const payload = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  if (isSupabaseConfigured()) {
    const row = await findSupabaseUserById(payload.id);
    if (!row || row.activo === false) return null;
    return toAuthUser(row);
  }

  if (!isDatabaseConfigured()) return null;

  const user = await prisma.consultant.findUnique({ where: { id: payload.id } });
  if (!user || user.status !== "active") return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
