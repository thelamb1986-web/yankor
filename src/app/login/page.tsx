"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandHeroPanel } from "@/components/BrandHeroPanel";
import { YankorLogo } from "@/components/YankorLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <BrandHeroPanel>
        <p className="descriptor" style={{ marginTop: "1.25rem" }}>
          Diagnóstico de madurez empresarial para detectar dónde vale la pena profundizar.
        </p>
      </BrandHeroPanel>

      <section className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <div style={{ marginBottom: "1.1rem" }}>
            <YankorLogo height={56} />
          </div>
          <h2 style={{ margin: "0 0 0.35rem" }}>Acceso consultor</h2>
          <p style={{ margin: "0 0 1.4rem", color: "var(--yankor-gray-soft)", fontSize: "0.9rem" }}>
            Herramienta profesional de diagnóstico. El consultor conduce la entrevista.
          </p>

          <div className="field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              style={{
                background: "#fdecea",
                color: "#c0392b",
                padding: "0.7rem 0.85rem",
                borderRadius: 10,
                marginBottom: "0.9rem",
                fontSize: "0.88rem",
              }}
            >
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p style={{ marginTop: "1.1rem", fontSize: "0.88rem", color: "var(--yankor-gray-soft)", textAlign: "center" }}>
            ¿Nuevo cliente?{" "}
            <Link href="/registro" style={{ color: "var(--yankor-navy)", fontWeight: 700 }}>
              Crear cuenta
            </Link>
          </p>

          <p style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--yankor-gray-soft)", textAlign: "center" }}>
            Demo admin: admin@yankor.com / yankor2026
          </p>
        </form>
      </section>
    </div>
  );
}
