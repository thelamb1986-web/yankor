const EMAIL_REGEX =
  /^(?![.])[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

const DISPOSABLE = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
]);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  const value = normalizeEmail(email);
  if (!value) return "El correo es obligatorio.";
  if (value.length > 120) return "El correo es demasiado largo.";
  if (value.includes(" ")) return "El correo no debe contener espacios.";
  if (!EMAIL_REGEX.test(value)) return "Ingresa un correo electrónico válido.";
  const domain = value.split("@")[1];
  if (DISPOSABLE.has(domain)) return "Usa un correo empresarial o personal, no temporal.";
  return null;
}

export function validateEmailConfirmation(email: string, confirmation: string): string | null {
  const formatError = validateEmail(email);
  if (formatError) return formatError;
  if (!confirmation.trim()) return "Confirma tu correo electrónico.";
  if (normalizeEmail(email) !== normalizeEmail(confirmation)) {
    return "El correo y su confirmación no coinciden.";
  }
  return null;
}

/** RFC SAT: persona moral 12, persona física 13. */
export function normalizeRfc(rfc: string) {
  return rfc.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function validateRfcSat(rfc: string): string | null {
  const value = normalizeRfc(rfc);
  if (!value) return "El RFC del SAT es obligatorio.";
  if (value.length !== 12 && value.length !== 13) {
    return "El RFC debe tener 12 caracteres (persona moral) o 13 (persona física).";
  }
  if (!/^([A-ZÑ&]{3,4})(\d{6})([A-Z0-9]{3})$/.test(value)) {
    return "El RFC no tiene el formato del SAT.";
  }

  const isMoral = value.length === 12;
  const datePart = isMoral ? value.slice(3, 9) : value.slice(4, 10);
  const yy = Number(datePart.slice(0, 2));
  const mm = Number(datePart.slice(2, 4));
  const dd = Number(datePart.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return "La fecha dentro del RFC no es válida.";
  }
  const year = yy >= 30 ? 1900 + yy : 2000 + yy;
  const date = new Date(year, mm - 1, dd);
  if (date.getMonth() !== mm - 1 || date.getDate() !== dd) {
    return "La fecha dentro del RFC no es válida.";
  }

  return null;
}
