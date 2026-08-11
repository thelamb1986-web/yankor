"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ClienteOption = { id: string; nombre: string; email?: string | null; rfc?: string | null };

export function CsfUploadForm({
  clientes = [],
  requireCliente = false,
}: {
  clientes?: ClienteOption[];
  requireCliente?: boolean;
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (requireCliente && !clienteId) {
      setError("Selecciona el cliente al que pertenece esta constancia.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Selecciona un PDF de constancia de situación fiscal.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("El archivo debe ser PDF.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/constancias", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo subir");
        return;
      }
      const cliente = clientes.find((c) => c.id === clienteId);
      setMessage(
        `Constancia agregada${cliente ? ` para ${cliente.nombre}` : ""}${json.rfc ? ` · RFC ${json.rfc}` : ""}.`,
      );
      form.reset();
      setFileName("");
      setClienteId("");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {requireCliente && (
        <div className="field">
          <label htmlFor="clienteId">Cliente al que agregas el documento *</label>
          <select
            id="clienteId"
            name="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">Selecciona un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.email ? ` · ${c.email}` : ""}
                {c.rfc ? ` · ${c.rfc}` : ""}
              </option>
            ))}
          </select>
          {clientes.length === 0 && (
            <span className="field-hint">Primero da de alta un cliente para poder cargar su constancia.</span>
          )}
        </div>
      )}
      <div className="field">
        <label htmlFor="file">Constancia de situación fiscal (PDF)</label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf,.pdf"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
        />
        {fileName && <span className="field-help">{fileName}</span>}
      </div>
      {error && <p className="field-hint">{error}</p>}
      {message && <p style={{ color: "var(--yankor-green-dark)", fontSize: "0.88rem" }}>{message}</p>}
      <button className="btn btn-primary" disabled={loading || (requireCliente && clientes.length === 0)}>
        {loading ? "Subiendo..." : "Subir PDF al cliente"}
      </button>
    </form>
  );
}
