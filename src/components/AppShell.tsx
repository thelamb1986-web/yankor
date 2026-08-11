"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  History,
  Users,
  PlusCircle,
  Contact,
  FileText,
} from "lucide-react";
import { YankorLogo } from "@/components/YankorLogo";
import { isAdmin, isConsultor } from "@/lib/roles";

const allLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/clientes", label: "Clientes", icon: Contact },
  { href: "/constancias", label: "Constancias CSF", icon: FileText },
  { href: "/diagnosticos", label: "Diagnósticos", icon: ClipboardList },
  { href: "/diagnosticos/nuevo", label: "Nuevo diagnóstico", icon: PlusCircle },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/consultores", label: "Consultores", icon: Users },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = isAdmin(user)
    ? allLinks
    : isConsultor(user)
      ? allLinks.filter((l) => l.href !== "/consultores" && l.href !== "/configuracion")
      : allLinks.filter((l) =>
          ["/dashboard", "/constancias", "/empresas", "/diagnosticos", "/historial"].includes(l.href),
        );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="yankor-shell">
      <aside className="yankor-sidebar no-print">
        <div className="yankor-brand">
          <YankorLogo inverted height={52} />
          <p className="product">Business Scan™ Express</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={`nav-link ${active ? "active" : ""}`}>
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "1rem" }}>
          <div style={{ padding: "0 0.75rem 0.85rem", fontSize: "0.82rem" }}>
            <div style={{ fontWeight: 700 }}>{user.name}</div>
            <div style={{ opacity: 0.7, marginTop: 2 }}>{user.email}</div>
            <div style={{ opacity: 0.55, marginTop: 4, textTransform: "capitalize" }}>{user.role}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="nav-link"
            style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="yankor-main">{children}</main>
    </div>
  );
}
