# YANKOR Business Scan™ Express

**Menos caos. Más control. Mejores resultados.**

Herramienta profesional de diagnóstico de madurez empresarial y operativa para PyMES.
Diseñada para que un consultor YANKOR conduzca una entrevista de 45–60 minutos (35 indicadores).

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma + Supabase (PostgreSQL)
- Recharts (radar y evolución histórica)
- Autenticación por sesión (cookies httpOnly)
- Cliente `@supabase/supabase-js` preparado

## Arranque rápido

```bash
npm install
# Configura .env con tus credenciales de Supabase (ver .env.example)
npm run db:setup
npm run dev
```

### Supabase

1. En el dashboard: **Connect** → copia **Session pooler** y **Direct connection**.
2. En `.env` reemplaza `[YOUR-PASSWORD]` y pega la **Publishable key**.
3. Ejecuta `npx prisma db push` y `npm run db:seed`.

Abre [http://localhost:3000](http://localhost:3000)

### Credenciales demo

- **Admin:** `admin@yankor.com` / `yankor2026`
- **Consultor:** `ana.lopez@yankor.com` / `consultor123`

## MVP incluido

- Login
- Empresas (CRUD básico + ficha)
- Nuevo diagnóstico + entrevista guiada (35 indicadores)
- Calificación 1–5, evidencia, observaciones, riesgo e impacto
- Cálculo automático del Índice de Madurez YANKOR (0–100)
- Dashboard ejecutivo: radar, dimensiones, fortalezas, oportunidades, priorización, recomendaciones
- Ruta de Transformación YANKOR
- Historial / comparación
- Configuración editable del catálogo (preguntas, recomendaciones, servicios)
- Consultores
- Exportación CSV
- Vista imprimible (base para PDF ejecutivo)
- Datos demo eliminables

## Arquitectura preparada (sin construir aún)

- Assessments especializados por dimensión (`assessmentLevel`, `specializedModule`)
- Alcance Manufactura / Servicios (`companyTypeScope`)
- Roadmap 90 días / implementación
- Reevaluación y comparación multi-periodo
- PDF nativo y múltiples consultores a escala

## Filosofía

> No vendemos tecnología. Resolvemos problemas operativos mediante tecnología, procesos y conocimiento.

Business Scan Express **detecta** dónde vale la pena profundizar.
