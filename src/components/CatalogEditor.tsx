"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Indicator = {
  id: string;
  code: string;
  name: string;
  question: string;
  description: string | null;
  expectedEvidence: string | null;
  recommendation: string | null;
  relatedService: string | null;
  weight: number;
  active: boolean;
  companyTypeScope: string;
};

type Dimension = {
  id: string;
  code: string;
  name: string;
  weight: number;
  description: string | null;
  active: boolean;
  indicators: Indicator[];
};

export function CatalogEditor({
  dimensions,
  canEdit,
}: {
  dimensions: Dimension[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(dimensions[0]?.indicators[0]?.id || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const allIndicators = dimensions.flatMap((d) =>
    d.indicators.map((i) => ({ ...i, dimensionCode: d.code, dimensionName: d.name, dimensionWeight: d.weight })),
  );
  const selected = allIndicators.find((i) => i.id === selectedId);
  const [form, setForm] = useState<Indicator | null>(null);

  const current = form && form.id === selectedId ? form : selected;

  function load(id: string) {
    setSelectedId(id);
    const found = allIndicators.find((i) => i.id === id);
    setForm(found ? { ...found } : null);
    setMessage("");
  }

  async function save() {
    if (!current || !canEdit) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "indicator", ...current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Error al guardar");
        return;
      }
      setMessage("Indicador actualizado");
      router.refresh();
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  if (!current) {
    return <div className="card empty-state">No hay indicadores en el catálogo.</div>;
  }

  return (
    <div className="interview-layout">
      <aside className="card" style={{ maxHeight: 700, overflow: "auto" }}>
        <h3 className="card-title">35 indicadores</h3>
        {dimensions.map((d) => (
          <div key={d.id} style={{ marginBottom: "0.85rem" }}>
            <div style={{ fontWeight: 800, color: "var(--yankor-navy)", fontSize: "0.85rem", marginBottom: 4 }}>
              {d.code} · {d.name} ({Math.round(d.weight * 100)}%)
            </div>
            {d.indicators.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => load(i.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: selectedId === i.id ? "1px solid var(--yankor-green)" : "1px solid transparent",
                  background: selectedId === i.id ? "rgba(40,167,69,0.08)" : "transparent",
                  borderRadius: 8,
                  padding: "0.4rem 0.5rem",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  marginBottom: 2,
                }}
              >
                {i.code} · {i.name}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <section className="card">
        <h3 className="card-title">
          Editar {current.code} — {current.name}
        </h3>
        {!canEdit && (
          <p style={{ color: "var(--yankor-amber)", fontSize: "0.88rem" }}>
            Solo el administrador puede modificar el catálogo. Vista de lectura.
          </p>
        )}

        <div className="field">
          <label>Nombre del indicador</label>
          <input
            disabled={!canEdit}
            value={(form ?? current).name}
            onChange={(e) => setForm({ ...(form ?? current), name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Pregunta</label>
          <textarea
            disabled={!canEdit}
            value={(form ?? current).question}
            onChange={(e) => setForm({ ...(form ?? current), question: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Descripción</label>
          <textarea
            disabled={!canEdit}
            value={(form ?? current).description || ""}
            onChange={(e) => setForm({ ...(form ?? current), description: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Evidencia esperada</label>
          <textarea
            disabled={!canEdit}
            value={(form ?? current).expectedEvidence || ""}
            onChange={(e) => setForm({ ...(form ?? current), expectedEvidence: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Recomendación asociada</label>
          <textarea
            disabled={!canEdit}
            value={(form ?? current).recommendation || ""}
            onChange={(e) => setForm({ ...(form ?? current), recommendation: e.target.value })}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <div className="field">
            <label>Servicio YANKOR</label>
            <input
              disabled={!canEdit}
              value={(form ?? current).relatedService || ""}
              onChange={(e) => setForm({ ...(form ?? current), relatedService: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Peso relativo</label>
            <input
              type="number"
              step="0.1"
              disabled={!canEdit}
              value={(form ?? current).weight}
              onChange={(e) => setForm({ ...(form ?? current), weight: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>Alcance tipo empresa</label>
            <select
              disabled={!canEdit}
              value={(form ?? current).companyTypeScope}
              onChange={(e) => setForm({ ...(form ?? current), companyTypeScope: e.target.value })}
            >
              <option value="ALL">Todos</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Servicios">Servicios</option>
            </select>
          </div>
        </div>

        {message && <p style={{ color: "var(--yankor-green-dark)" }}>{message}</p>}

        {canEdit && (
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </section>
    </div>
  );
}
