/** Marca en users.empresa cuando el CHECK de Postgres aún no admite rol=consultor. */
export const CONSULTOR_EMPRESA_MARKER = "YANKOR_CONSULTOR";

const DEMO_ADMIN_EMAIL = "admin@yankor.com";
const CONSULTOR_EMAILS = new Set(["bruno@yukti.mx"]);

export type Perfil = "consultor" | "cliente" | "admin";

export function resolvePerfil(row: {
  rol?: string | null;
  role?: string | null;
  email?: string | null;
  empresa?: string | null;
}): Perfil {
  const email = String(row.email || "").toLowerCase().trim();
  const rol = String(row.rol || row.role || "").toLowerCase();
  if (email === DEMO_ADMIN_EMAIL || rol === "admin") return "admin";
  if (
    CONSULTOR_EMAILS.has(email) ||
    rol === "consultor" ||
    rol === "consultant" ||
    row.empresa === CONSULTOR_EMPRESA_MARKER
  ) {
    return "consultor";
  }
  return "cliente";
}

export function isAdmin(user: { role: string } | null | undefined) {
  return user?.role === "admin";
}

export function isConsultor(user: { role: string } | null | undefined) {
  return user?.role === "consultor";
}

export function isCliente(user: { role: string } | null | undefined) {
  return user?.role === "cliente";
}

export function canCreateConsultor(user: { role: string } | null | undefined) {
  return isAdmin(user);
}

export function canCreateCliente(user: { role: string } | null | undefined) {
  return isAdmin(user) || isConsultor(user);
}

export function canUploadCsf(user: { role: string } | null | undefined) {
  return isAdmin(user) || isConsultor(user) || isCliente(user);
}

