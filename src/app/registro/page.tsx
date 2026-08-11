"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizeRfc, validateEmail, validateEmailConfirmation, validateRfcSat } from "@/lib/validation";
import { BrandHeroPanel } from "@/components/BrandHeroPanel";
import { YankorLogo } from "@/components/YankorLogo";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [rfc, setRfc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailHint = useMemo(() => (email ? validateEmail(email) : null), [email]);
  const emailMatchHint = useMemo(
    () => (emailConfirm ? validateEmailConfirmation(email, emailConfirm) : null),
    [email, emailConfirm],
  );
  const rfcHint = useMemo(() => (rfc ? validateRfcSat(rfc) : null), [rfc]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const emailError = validateEmailConfirmation(email, emailConfirm);
    if (emailError) {
      setError(emailError);
      return;
    }

    const rfcError = validateRfcSat(rfc);
    if (rfcError) {
      setError(rfcError);
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          emailConfirm,
          rfc: normalizeRfc(rfc),
          telefono,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar");
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
          Alta de cliente con correo validado y RFC del SAT.
        </p>
      </BrandHeroPanel>

      <section className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <div style={{ marginBottom: "1.1rem" }}>
            <YankorLogo height={56} />
          </div>
          <h2 style={{ margin: "0 0 0.35rem" }}>Nuevo cliente</h2>
          <p style={{ margin: "0 0 1.4rem", color: "var(--yankor-gray-soft)", fontSize: "0.9rem" }}>
            El alta desde fuera del portal siempre crea un perfil <strong>cliente</strong>. Confirma tu correo y RFC del SAT.
          </p>

          <div className="field">
            <label htmlFor="name">Nombre o razón social</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="organization"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
            {emailHint && <span className="field-hint">{emailHint}</span>}
          </div>

          <div className="field">
            <label htmlFor="emailConfirm">Confirma tu correo electrónico</label>
            <input
              id="emailConfirm"
              type="email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
            {emailMatchHint && <span className="field-hint">{emailMatchHint}</span>}
          </div>

          <div className="field">
            <label htmlFor="rfc">RFC del SAT</label>
            <input
              id="rfc"
              value={rfc}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              required
              minLength={12}
              maxLength={13}
              placeholder="XXAX211010X01"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="field-help">12 caracteres persona moral o 13 persona física.</span>
            {rfcHint && <span className="field-hint">{rfcHint}</span>}
          </div>

          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? "Registrando cliente..." : "Crear cliente"}
          </button>

          <p style={{ marginTop: "1.1rem", fontSize: "0.88rem", color: "var(--yankor-gray-soft)", textAlign: "center" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "var(--yankor-navy)", fontWeight: 700 }}>
              Iniciar sesión
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
