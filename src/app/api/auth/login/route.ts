import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
    }

    const user = await login(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas o usuario inactivo. Si es el admin demo, usa admin@yankor.com / yankor2026." },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
