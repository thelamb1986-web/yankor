"use client";

import Link from "next/link";

export function ResultsToolbar({ assessmentId }: { assessmentId: string }) {
  return (
    <div className="no-print" style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", flexWrap: "wrap" }}>
      <a href={`/api/assessments/${assessmentId}?format=csv`} className="btn btn-secondary">
        Exportar CSV / Excel
      </a>
      <button type="button" className="btn btn-navy" onClick={() => window.print()}>
        Vista PDF / Imprimir
      </button>
      <Link href={`/historial?focus=${assessmentId}`} className="btn btn-secondary">
        Ver en historial
      </Link>
      <span className="chip">PDF ejecutivo: preparado vía impresión; export nativo en roadmap</span>
    </div>
  );
}
