import { getSupabaseAdminClient } from "./supabase";

export const CSF_BUCKET = "constancias";
export const CSF_MAX_BYTES = 10 * 1024 * 1024;

export function isPdfFile(file: { type: string; name: string }, bytes?: Uint8Array) {
  const mimeOk = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!mimeOk) return false;
  if (!bytes || bytes.length < 4) return true;
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
}

export function rfcFromCsfFilename(name: string) {
  const match = name
    .toUpperCase()
    .replace(/\s+/g, "")
    .match(/([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})/);
  return match?.[1] ?? null;
}

export async function ensureCsfBucket() {
  const admin = getSupabaseAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.name === CSF_BUCKET)) return;

  const { error } = await admin.storage.createBucket(CSF_BUCKET, {
    public: false,
    fileSizeLimit: CSF_MAX_BYTES,
    allowedMimeTypes: ["application/pdf"],
  });
  if (error && !String(error.message).toLowerCase().includes("already")) {
    throw new Error(error.message);
  }
}

export function csfStoragePath(input: {
  uploaderId: string;
  clienteId?: string | null;
  filename: string;
}) {
  const safe = input.filename.replace(/[^\w.\-]+/g, "_");
  const folder = input.clienteId ? `clientes/${input.clienteId}` : `usuarios/${input.uploaderId}`;
  return `${folder}/${Date.now()}_${safe}`;
}
