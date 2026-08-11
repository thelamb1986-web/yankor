"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDemoButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar la empresa demo y sus diagnósticos?")) return;
    setLoading(true);
    await fetch(`/api/companies/${companyId}`, { method: "DELETE" });
    router.push("/empresas");
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
      {loading ? "Eliminando..." : "Eliminar demo"}
    </button>
  );
}
