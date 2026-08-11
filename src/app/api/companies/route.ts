import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const isAdmin = user.role === "admin";
  const companies = await prisma.company.findMany({
    where: isAdmin
      ? undefined
      : {
          OR: [{ createdById: user.id }, { assessments: { some: { consultantId: user.id } } }],
        },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const tradeName = String(body.tradeName ?? "").trim();
  const companyType = String(body.companyType ?? "").trim();

  if (!tradeName || !["Manufactura", "Servicios"].includes(companyType)) {
    return NextResponse.json(
      { error: "Nombre comercial y tipo (Manufactura/Servicios) son obligatorios." },
      { status: 400 },
    );
  }

  const company = await prisma.company.create({
    data: {
      tradeName,
      legalName: body.legalName || null,
      sector: body.sector || null,
      companyType,
      employees: body.employees ? Number(body.employees) : null,
      city: body.city || null,
      contactName: body.contactName || null,
      contactRole: body.contactRole || null,
      phone: body.phone || null,
      email: body.email || null,
      createdById: user.id,
    },
  });

  return NextResponse.json({ company });
}
