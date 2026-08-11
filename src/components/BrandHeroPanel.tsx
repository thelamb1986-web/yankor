import { YankorLogo } from "@/components/YankorLogo";

export function BrandHeroPanel({ children }: { children?: React.ReactNode }) {
  return (
    <section className="login-hero">
      <div>
        <YankorLogo inverted height={92} />
        {children}
      </div>
      <div className="brand-values">
        <div>
          <span>Menos caos</span>
          <small>Procesos claros</small>
        </div>
        <div>
          <span>Más control</span>
          <small>Indicadores y seguimiento</small>
        </div>
        <div>
          <span>Mejores resultados</span>
          <small>Decisiones con evidencia</small>
        </div>
      </div>
    </section>
  );
}
