import { NextResponse } from "next/server";
import { register } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await register({
      // Alta externa al portal: siempre cliente. Ignora cualquier rol enviado.
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      emailConfirm: String(body.emailConfirm ?? ""),
      rfc: String(body.rfc ?? ""),
      telefono: String(body.telefono ?? ""),
      password: String(body.password ?? ""),
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
