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

