import { NextResponse } from "next/server";
import { getCurrentUser, registerConsultor } from "@/lib/auth";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Solo el administrador puede consultar consultores." }, { status: 403 });
  }

  if (isSupabaseConfigured()) {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.from("users").select("*").order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      consultants: (data || []).map((c) => ({
        id: c.id,
        name: c.nombre,
        email: c.email,
        role: c.rol,
        status: c.activo ? "active" : "inactive",
        assessmentsCount: 0,
        createdAt: c.created_at,
      })),
    });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ consultants: [] });
  }

  const consultants = await prisma.consultant.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assessments: true } } },
  });

  return NextResponse.json({
    consultants: consultants.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      status: c.status,
      assessmentsCount: c._count.assessments,
      createdAt: c.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Solo el administrador puede agregar consultores." }, { status: 403 });
  }

  const body = await request.json();
  const result = await registerConsultor({
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    password: String(body.password ?? "consultor123"),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ consultant: result.user });
}
