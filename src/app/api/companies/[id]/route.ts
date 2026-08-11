import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      assessments: {
        orderBy: { startedAt: "desc" },
        include: { consultant: true },
      },
    },
  });

  if (!company) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  return NextResponse.json({ company });
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const company = await prisma.company.update({
    where: { id },
    data: {
      tradeName: body.tradeName,
      legalName: body.legalName || null,
      sector: body.sector || null,
      companyType: body.companyType,
      employees: body.employees ? Number(body.employees) : null,
      city: body.city || null,
      contactName: body.contactName || null,
      contactRole: body.contactRole || null,
      phone: body.phone || null,
      email: body.email || null,
    },
  });

  return NextResponse.json({ company });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
