export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canUploadCsf, isAdmin, isCliente, isConsultor } from "@/lib/roles";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { CSF_BUCKET, CSF_MAX_BYTES, csfStoragePath, ensureCsfBucket, isPdfFile, rfcFromCsfFilename } from "@/lib/csf";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!canUploadCsf(user)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ constancias: [] });

  const admin = getSupabaseAdminClient();
  await ensureCsfBucket();

  const prefixes = isCliente(user)
    ? [`usuarios/${user.id}`]
    : [`usuarios/${user.id}`, "clientes"];

  const files: Array<{
    name: string;
    path: string;
    createdAt: string | null;
    rfc: string | null;
  }> = [];

  for (const prefix of prefixes) {
    const { data } = await admin.storage.from(CSF_BUCKET).list(prefix, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
    for (const item of data || []) {
      if (item.id == null && !item.name.toLowerCase().endsWith(".pdf")) {
        const nested = await admin.storage.from(CSF_BUCKET).list(`${prefix}/${item.name}`, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });
        for (const child of nested.data || []) {
          const path = `${prefix}/${item.name}/${child.name}`;
          files.push({
            name: child.name,
            path,
            createdAt: child.created_at ?? null,
            rfc: rfcFromCsfFilename(child.name),
          });
        }
        continue;
      }
      if (!item.name.toLowerCase().endsWith(".pdf")) continue;
      const path = `${prefix}/${item.name}`;
      files.push({
        name: item.name,
        path,
        createdAt: item.created_at ?? null,
        rfc: rfcFromCsfFilename(item.name),
      });
    }
  }

  return NextResponse.json({ constancias: files });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!canUploadCsf(user)) {
    return NextResponse.json({ error: "Solo consultor o cliente pueden subir constancias." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const clienteId = String(form.get("clienteId") || "").trim() || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjunta un PDF de constancia de situación fiscal." }, { status: 400 });
  }
  if (file.size > CSF_MAX_BYTES) {
    return NextResponse.json({ error: "El PDF no debe superar 10 MB." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdfFile(file, bytes)) {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF." }, { status: 400 });
  }

  if (isCliente(user) && clienteId) {
    return NextResponse.json({ error: "Un cliente solo puede subir su propia constancia." }, { status: 403 });
  }

  if ((isConsultor(user) || isAdmin(user)) && !clienteId) {
    return NextResponse.json(
      { error: "Selecciona el cliente al que le estás agregando la constancia." },
      { status: 400 },
    );
  }

  await ensureCsfBucket();
  const admin = getSupabaseAdminClient();

  if (clienteId) {
    const { data: cliente } = await admin.from("clientes").select("id, nombre").eq("id", clienteId).maybeSingle();
    if (!cliente) {
      return NextResponse.json({ error: "El cliente seleccionado no existe." }, { status: 400 });
    }
  }

  const path = csfStoragePath({
    uploaderId: user.id,
    clienteId: isCliente(user) ? null : clienteId,
    filename: file.name,
  });

  const { error } = await admin.storage.from(CSF_BUCKET).upload(path, bytes, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    path,
    rfc: rfcFromCsfFilename(file.name),
    name: file.name,
  });
}
