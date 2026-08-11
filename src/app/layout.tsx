import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YANKOR Business Scan™ Express",
  description:
    "Diagnóstico de madurez empresarial y operativa para PyMES. Menos caos. Más control. Mejores resultados.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
