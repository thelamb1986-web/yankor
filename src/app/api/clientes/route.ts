import { NextResponse } from "next/server";
import { createClienteAccount, getCurrentUser } from "@/lib/auth";
import { canCreateCliente } from "@/lib/roles";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!canCreateCliente(user) && user.role !== "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) return NextResponse.json({ clientes: [] });
  const admin = getSupabaseAdminClient();
  const query = admin.from("clientes").select("*").order("creado_en", { ascending: false });
  const { data, error } = user.role === "cliente" ? await query.ilike("email", user.email) : await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clientes: data || [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!canCreateCliente(user)) {
    return NextResponse.json(
      { error: "Solo el administrador o un consultor pueden dar de alta clientes desde el portal." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const result = await createClienteAccount(
    {
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      emailConfirm: String(body.emailConfirm ?? body.email ?? ""),
      rfc: String(body.rfc ?? ""),
      telefono: String(body.telefono ?? ""),
      password: String(body.password ?? ""),
    },
    { signIn: false },
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ cliente: result.user });
}
