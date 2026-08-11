"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeRfc, validateEmail, validateEmailConfirmation, validateRfcSat } from "@/lib/validation";

export function ClienteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [rfc, setRfc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");

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
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/clientes", {
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
        setError(data.error || "No se pudo crear el cliente");
        return;
      }
      setName("");
      setEmail("");
      setEmailConfirm("");
      setRfc("");
      setTelefono("");
      setPassword("");
      setMessage("Cliente creado");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label>Nombre o razón social</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
      </div>
      <div className="field">
        <label>Correo</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {emailHint && <span className="field-hint">{emailHint}</span>}
      </div>
      <div className="field">
        <label>Confirma el correo</label>
        <input type="email" value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} required />
        {emailMatchHint && <span className="field-hint">{emailMatchHint}</span>}
      </div>
      <div className="field">
        <label>RFC del SAT</label>
        <input
          value={rfc}
          onChange={(e) => setRfc(e.target.value.toUpperCase())}
          required
          minLength={12}
          maxLength={13}
          placeholder="XXAX211010X01"
        />
        {rfcHint && <span className="field-hint">{rfcHint}</span>}
      </div>
      <div className="field">
        <label>Teléfono</label>
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="field">
        <label>Contraseña temporal</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      {error && <p className="field-hint">{error}</p>}
      {message && <p style={{ color: "var(--yankor-green-dark)", fontSize: "0.88rem" }}>{message}</p>}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Guardando..." : "Crear cliente"}
      </button>
    </form>
  );
}
