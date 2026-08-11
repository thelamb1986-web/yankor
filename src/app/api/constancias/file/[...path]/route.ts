import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canUploadCsf, isCliente } from "@/lib/roles";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { CSF_BUCKET } from "@/lib/csf";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!canUploadCsf(user)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { path } = await params;
  const storagePath = path.map(decodeURIComponent).join("/");
  if (!storagePath || storagePath.includes("..")) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  if (isCliente(user) && !storagePath.startsWith(`usuarios/${user.id}/`)) {
    return NextResponse.json({ error: "No puedes ver constancias de otros." }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.storage.from(CSF_BUCKET).createSignedUrl(storagePath, 60);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || "No se pudo abrir el PDF" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
