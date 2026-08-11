"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tradeName: "",
    legalName: "",
    sector: "",
    companyType: "Manufactura",
    employees: "",
    city: "",
    contactName: "",
    contactRole: "",
    phone: "",
    email: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      router.push(`/empresas/${data.company.id}`);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Nueva empresa</h2>
        <p>Registra los datos generales de la PyME antes del diagnóstico.</p>
      </div>

      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 820 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1rem" }}>
          <div className="field">
            <label>Nombre comercial *</label>
            <input value={form.tradeName} onChange={(e) => update("tradeName", e.target.value)} required />
          </div>
          <div className="field">
            <label>Razón social</label>
            <input value={form.legalName} onChange={(e) => update("legalName", e.target.value)} />
          </div>
          <div className="field">
            <label>Tipo *</label>
            <select value={form.companyType} onChange={(e) => update("companyType", e.target.value)}>
              <option>Manufactura</option>
              <option>Servicios</option>
            </select>
          </div>
          <div className="field">
            <label>Sector</label>
            <input value={form.sector} onChange={(e) => update("sector", e.target.value)} />
          </div>
          <div className="field">
            <label>Número de empleados</label>
            <input type="number" min={1} value={form.employees} onChange={(e) => update("employees", e.target.value)} />
          </div>
          <div className="field">
            <label>Ciudad</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div className="field">
            <label>Contacto</label>
            <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
          </div>
          <div className="field">
            <label>Puesto</label>
            <input value={form.contactRole} onChange={(e) => update("contactRole", e.target.value)} />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="field">
            <label>Correo</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </div>

        {error && <p style={{ color: "var(--yankor-red)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar empresa"}
          </button>
          <Link href="/empresas" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
