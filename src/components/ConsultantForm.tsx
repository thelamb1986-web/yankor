"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ConsultantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("consultor123");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Error");
        return;
      }
      setName("");
      setEmail("");
      setMessage("Consultor creado");
      router.refresh();
    } catch {
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="field">
        <label>Correo</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="field">
        <label>Contraseña temporal</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {message && <p style={{ fontSize: "0.88rem" }}>{message}</p>}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Guardando..." : "Crear consultor"}
      </button>
    </form>
  );
}
