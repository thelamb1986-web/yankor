import Image from "next/image";

type LogoProps = {
  variant?: "horizontal" | "mark";
  inverted?: boolean;
  height?: number;
};

const SRC = "/brand/yankor-logo.png";
const INTRINSIC_W = 723;
const INTRINSIC_H = 226;

export function YankorLogo({ inverted = false, height = 48 }: LogoProps) {
  const width = Math.round((height * INTRINSIC_W) / INTRINSIC_H);

  return (
    <span className={`yankor-logo-wrap ${inverted ? "on-dark" : ""}`}>
      <Image
        src={SRC}
        alt="YANKOR — Menos caos. Más control. Mejores resultados. Automatización, logística e inteligencia artificial para PyMES."
        width={width}
        height={height}
        priority
        className="yankor-logo-img"
      />
    </span>
  );
}

export function YankorSlogan({ inverted = false }: { inverted?: boolean }) {
  return (
    <p className={`yankor-slogan ${inverted ? "inverted" : ""}`}>
      <span>— MENOS CAOS. </span>
      <strong>MÁS CONTROL.</strong>
      <span> MEJORES RESULTADOS. —</span>
    </p>
  );
}

export function YankorDescriptor({ inverted = false }: { inverted?: boolean }) {
  return (
    <p className={`yankor-descriptor ${inverted ? "inverted" : ""}`}>
      AUTOMATIZACIÓN, LOGÍSTICA E INTELIGENCIA ARTIFICIAL PARA PyMES.
    </p>
  );
}
