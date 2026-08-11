import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type IndicatorSeed = {
  code: string;
  name: string;
  question: string;
  description: string;
  expectedEvidence: string;
  recommendation: string;
  relatedService: string;
  sortOrder: number;
};

type DimensionSeed = {
  code: string;
  name: string;
  weight: number;
  sortOrder: number;
  description: string;
  indicators: IndicatorSeed[];
};

const dimensions: DimensionSeed[] = [
  {
    code: "Y1",
    name: "Liderazgo y Dirección",
    weight: 0.1,
    sortOrder: 1,
    description: "Capacidad de la dirección para planear, organizar, comunicar y decidir con claridad.",
    indicators: [
      {
        code: "Y1-01",
        name: "Planeación",
        question: "¿Existe una planeación clara de objetivos y prioridades de la empresa?",
        description: "Evalúa si hay metas definidas, horizontes de planeación y alineación del equipo.",
        expectedEvidence: "Plan anual, objetivos documentados, reuniones de planeación, tablero de prioridades.",
        recommendation: "Definir objetivos anuales y trimestrales con responsables y fechas de revisión.",
        relatedService: "YANKOR Strategy",
        sortOrder: 1,
      },
      {
        code: "Y1-02",
        name: "Organización",
        question: "¿La estructura organizacional está definida y es entendida por el equipo?",
        description: "Evalúa claridad de estructura, jerarquías y coordinación entre áreas.",
        expectedEvidence: "Organigrama actualizado, descripciones de puestos, flujo de autoridad.",
        recommendation: "Actualizar el organigrama y aclarar líneas de reporte y responsabilidades clave.",
        relatedService: "YANKOR Operations",
        sortOrder: 2,
      },
      {
        code: "Y1-03",
        name: "Comunicación",
        question: "¿La dirección comunica prioridades y cambios de forma oportuna y consistente?",
        description: "Evalúa canales, frecuencia y claridad de la comunicación directiva.",
        expectedEvidence: "Reuniones periódicas, comunicados internos, actas, canales formales.",
        recommendation: "Establecer una rutina semanal de comunicación de prioridades y acuerdos.",
        relatedService: "YANKOR Talent",
        sortOrder: 3,
      },
      {
        code: "Y1-04",
        name: "Seguimiento",
        question: "¿Se da seguimiento sistemático a compromisos, proyectos y resultados?",
        description: "Evalúa disciplina de seguimiento y cierre de acciones.",
        expectedEvidence: "Minutas con responsables, tableros de seguimiento, revisiones periódicas.",
        recommendation: "Implementar un tablero simple de compromisos con revisión semanal.",
        relatedService: "YANKOR Analytics",
        sortOrder: 4,
      },
      {
        code: "Y1-05",
        name: "Toma de decisiones",
        question: "¿Las decisiones importantes se toman con información y criterios definidos?",
        description: "Evalúa si las decisiones se basan en datos, criterios y responsabilidad clara.",
        expectedEvidence: "Criterios documentados, uso de indicadores, registros de decisiones clave.",
        recommendation: "Definir criterios mínimos de decisión y fuentes de información para temas críticos.",
        relatedService: "YANKOR Analytics",
        sortOrder: 5,
      },
    ],
  },
  {
    code: "Y2",
    name: "Excelencia Operativa",
    weight: 0.2,
    sortOrder: 2,
    description: "Madurez de procesos, estandarización, calidad, productividad y mejora continua.",
    indicators: [
      {
        code: "Y2-01",
        name: "Procesos",
        question: "¿Los procesos clave de la operación están identificados y documentados?",
        description: "Evalúa mapeo y claridad de procesos críticos del negocio.",
        expectedEvidence: "Mapas de proceso, flujogramas, procedimientos de operaciones clave.",
        recommendation: "Mapear los 5 procesos críticos y documentar el flujo actual vs. deseado.",
        relatedService: "YANKOR Operations",
        sortOrder: 1,
      },
      {
        code: "Y2-02",
        name: "Estandarización",
        question: "¿Existen estándares de trabajo conocidos y aplicados por el equipo?",
        description: "Evalúa consistencia en la forma de ejecutar el trabajo.",
        expectedEvidence: "Instrucciones de trabajo, checklists, estándares visuales, auditoría de cumplimiento.",
        recommendation: "Crear estándares simples (checklists) para las actividades de mayor variabilidad.",
        relatedService: "YANKOR Operations",
        sortOrder: 2,
      },
      {
        code: "Y2-03",
        name: "Calidad",
        question: "¿Existen controles de calidad que prevengan errores y reclamos?",
        description: "Evalúa prevención, detección y corrección de defectos o fallas de servicio.",
        expectedEvidence: "Controles de calidad, registros de no conformidades, métricas de defectos/reclamos.",
        recommendation: "Definir puntos de control de calidad en el proceso y un registro básico de incidencias.",
        relatedService: "YANKOR Operations",
        sortOrder: 3,
      },
      {
        code: "Y2-04",
        name: "Productividad",
        question: "¿Se mide y gestiona la productividad de la operación?",
        description: "Evalúa medición de rendimiento, capacidad y uso de recursos.",
        expectedEvidence: "Indicadores de productividad, tiempos estándar, carga de trabajo, capacidad.",
        recommendation: "Establecer 2–3 indicadores de productividad y revisar semanalmente con el equipo.",
        relatedService: "YANKOR Analytics",
        sortOrder: 4,
      },
      {
        code: "Y2-05",
        name: "Mejora continua",
        question: "¿Existe una práctica recurrente para identificar y resolver problemas operativos?",
        description: "Evalúa cultura y método de mejora (kaizen, PDCA, resolución de problemas).",
        expectedEvidence: "Tablero de mejoras, reuniones de problemas, acciones implementadas, lecciones aprendidas.",
        recommendation: "Instalar una rutina semanal de mejora con 1–2 problemas priorizados por área.",
        relatedService: "YANKOR Operations",
        sortOrder: 5,
      },
    ],
  },
  {
    code: "Y3",
    name: "Cadena de Suministro",
    weight: 0.15,
    sortOrder: 3,
    description: "Gestión de compras, inventarios, almacén, producción/servicio y entrega.",
    indicators: [
      {
        code: "Y3-01",
        name: "Compras",
        question: "¿El proceso de compras es controlado, oportuno y con criterios claros de proveedores?",
        description: "Evalúa planeación de compras, evaluación de proveedores y control de costos.",
        expectedEvidence: "Lista de proveedores, criterios de selección, órdenes de compra, lead times.",
        recommendation: "Definir criterios de proveedores críticos y un calendario básico de compras.",
        relatedService: "YANKOR Supply Chain",
        sortOrder: 1,
      },
      {
        code: "Y3-02",
        name: "Inventarios",
        question: "¿Los inventarios se conocen, controlan y alinean con la demanda?",
        description: "Evalúa exactitud, rotación y control de inventarios.",
        expectedEvidence: "Kardex, conteos cíclicos, rotación, niveles mínimo/máximo, mermas.",
        recommendation: "Implementar conteos cíclicos y niveles mínimo/máximo para los SKU críticos.",
        relatedService: "YANKOR Supply Chain",
        sortOrder: 2,
      },
      {
        code: "Y3-03",
        name: "Almacén",
        question: "¿El almacén está organizado, con flujos claros de entrada, ubicación y salida?",
        description: "Evalúa layout, identificación, picking y control de movimientos.",
        expectedEvidence: "Layout, ubicaciones, etiquetado, registros de entrada/salida, tiempos de surtido.",
        recommendation: "Organizar ubicaciones, etiquetar y estandarizar entradas y salidas de almacén.",
        relatedService: "YANKOR Supply Chain",
        sortOrder: 3,
      },
      {
        code: "Y3-04",
        name: "Producción / prestación del servicio",
        question: "¿La producción o prestación del servicio se planea y ejecuta con control de capacidad?",
        description: "Evalúa planeación de capacidad, secuencia y cumplimiento de compromisos.",
        expectedEvidence: "Plan de producción/agenda, capacidad, OTIF interno, cuellos de botella.",
        recommendation: "Definir un plan semanal de capacidad y prioridades de producción o servicio.",
        relatedService: "YANKOR Operations",
        sortOrder: 4,
      },
      {
        code: "Y3-05",
        name: "Distribución / entrega",
        question: "¿Las entregas se cumplen en tiempo, forma y con costos controlados?",
        description: "Evalúa confiabilidad de entrega, tracking y costo logístico.",
        expectedEvidence: "OTIF, rutas, costos de envío, incidencias de entrega, tiempos de tránsito.",
        recommendation: "Medir OTIF y revisar causas de entregas fallidas o retrasadas cada semana.",
        relatedService: "YANKOR Supply Chain",
        sortOrder: 5,
      },
    ],
  },
  {
    code: "Y4",
    name: "Desarrollo Comercial",
    weight: 0.15,
    sortOrder: 4,
    description: "Marketing, ventas, atención, seguimiento comercial y fidelización.",
    indicators: [
      {
        code: "Y4-01",
        name: "Marketing",
        question: "¿Existe una estrategia comercial básica para atraer y posicionar la oferta?",
        description: "Evalúa definición de propuesta de valor, canales y generación de demanda.",
        expectedEvidence: "Propuesta de valor, canales activos, campañas, pipeline de leads.",
        recommendation: "Clarificar propuesta de valor y priorizar 1–2 canales de atracción medibles.",
        relatedService: "YANKOR Commercial",
        sortOrder: 1,
      },
      {
        code: "Y4-02",
        name: "Ventas",
        question: "¿El proceso de ventas está definido y se gestiona de forma consistente?",
        description: "Evalúa etapas de venta, conversión y disciplina comercial.",
        expectedEvidence: "Pipeline, etapas de venta, tasas de conversión, metas comerciales.",
        recommendation: "Definir etapas del embudo de ventas y revisar conversión semanalmente.",
        relatedService: "YANKOR Commercial",
        sortOrder: 2,
      },
      {
        code: "Y4-03",
        name: "Atención al cliente",
        question: "¿La atención al cliente es consistente, medible y orientada a resolver?",
        description: "Evalúa tiempos de respuesta, calidad de atención y resolución de casos.",
        expectedEvidence: "SLA, tickets, encuestas, tiempos de respuesta, tipificación de quejas.",
        recommendation: "Establecer tiempos de respuesta y un registro simple de solicitudes y quejas.",
        relatedService: "YANKOR Commercial",
        sortOrder: 3,
      },
      {
        code: "Y4-04",
        name: "Seguimiento comercial",
        question: "¿Se da seguimiento estructurado a cotizaciones, oportunidades y clientes?",
        description: "Evalúa disciplina de follow-up y cierre de oportunidades.",
        expectedEvidence: "CRM o bitácora, recordatorios, historial de contactos, tasa de seguimiento.",
        recommendation: "Implementar una bitácora o CRM ligero con seguimiento semanal de oportunidades.",
        relatedService: "YANKOR Commercial",
        sortOrder: 4,
      },
      {
        code: "Y4-05",
        name: "Fidelización",
        question: "¿Existen acciones para retener, reactivar y profundizar relación con clientes?",
        description: "Evalúa recurrencia, retención y valor del cliente en el tiempo.",
        expectedEvidence: "Tasa de recompra, programa de clientes, NPS, visitas de seguimiento.",
        recommendation: "Identificar clientes clave y definir un plan simple de contacto y recompra.",
        relatedService: "YANKOR Commercial",
        sortOrder: 5,
      },
    ],
  },
  {
    code: "Y5",
    name: "Finanzas y Control",
    weight: 0.2,
    sortOrder: 5,
    description: "Presupuesto, costos, rentabilidad, KPIs y flujo de efectivo.",
    indicators: [
      {
        code: "Y5-01",
        name: "Presupuesto",
        question: "¿La empresa opera con un presupuesto y lo compara contra resultados reales?",
        description: "Evalúa existencia y uso del presupuesto como herramienta de control.",
        expectedEvidence: "Presupuesto anual/mensual, variación vs. real, reuniones de revisión.",
        recommendation: "Construir un presupuesto mensual simple y revisarlo contra resultados reales.",
        relatedService: "YANKOR Finance",
        sortOrder: 1,
      },
      {
        code: "Y5-02",
        name: "Costos",
        question: "¿Se conocen y controlan los costos principales del negocio?",
        description: "Evalúa visibilidad de estructura de costos y control de desviaciones.",
        expectedEvidence: "Estructura de costos, costos unitarios, análisis de variaciones, merma.",
        recommendation: "Identificar los 10 costos más relevantes y definir responsables de control.",
        relatedService: "YANKOR Finance",
        sortOrder: 2,
      },
      {
        code: "Y5-03",
        name: "Rentabilidad",
        question: "¿Se conoce la rentabilidad por producto, servicio, cliente o línea?",
        description: "Evalúa claridad de márgenes y decisiones basadas en rentabilidad.",
        expectedEvidence: "Márgenes por línea, contribución, análisis de clientes/productos.",
        recommendation: "Calcular margen de contribución de las líneas principales y priorizar las más rentables.",
        relatedService: "YANKOR Finance",
        sortOrder: 3,
      },
      {
        code: "Y5-04",
        name: "KPIs",
        question: "¿Existe un sistema básico de indicadores operativos y financieros revisados con frecuencia?",
        description: "Evalúa selección, medición y uso de KPIs para dirigir el negocio.",
        expectedEvidence: "Tablero de KPIs, frecuencia de revisión, responsables, umbrales.",
        recommendation: "Diseñar un sistema básico de indicadores operativos y establecer una rutina semanal de revisión.",
        relatedService: "YANKOR Analytics",
        sortOrder: 4,
      },
      {
        code: "Y5-05",
        name: "Flujo de efectivo",
        question: "¿Se proyecta y controla el flujo de efectivo para evitar crisis de liquidez?",
        description: "Evalúa proyección de caja, cobranzas y pagos.",
        expectedEvidence: "Flujo de caja semanal/mensual, cuentas por cobrar/pagar, proyecciones.",
        recommendation: "Implementar un flujo de caja semanal con proyección a 4–8 semanas.",
        relatedService: "YANKOR Finance",
        sortOrder: 5,
      },
    ],
  },
  {
    code: "Y6",
    name: "Transformación Digital",
    weight: 0.1,
    sortOrder: 6,
    description: "Sistemas, automatización, IA, gestión documental y seguridad de la información.",
    indicators: [
      {
        code: "Y6-01",
        name: "Sistemas",
        question: "¿Los sistemas de información soportan adecuadamente la operación diaria?",
        description: "Evalúa uso, integración y utilidad de sistemas (ERP, CRM, hojas de cálculo, etc.).",
        expectedEvidence: "Inventario de sistemas, uso real, duplicidades, fuente de verdad de datos.",
        recommendation: "Inventariar sistemas actuales y definir la fuente de verdad por proceso crítico.",
        relatedService: "YANKOR Digital",
        sortOrder: 1,
      },
      {
        code: "Y6-02",
        name: "Automatización",
        question: "¿Se han automatizado tareas administrativas o operativas repetitivas?",
        description: "Evalúa madurez en automatización de tareas de alto volumen y bajo valor.",
        expectedEvidence: "Flujos automatizados, bots, integraciones, tiempo liberado.",
        recommendation: "Identificar tareas administrativas repetitivas y priorizar aquellas con mayor potencial de automatización.",
        relatedService: "YANKOR AI",
        sortOrder: 2,
      },
      {
        code: "Y6-03",
        name: "Inteligencia Artificial",
        question: "¿La empresa utiliza o está preparada para aplicar IA en procesos de valor?",
        description: "Evalúa adopción y casos de uso de IA para productividad o decisión.",
        expectedEvidence: "Casos de uso, pilotos, políticas de uso, resultados medidos.",
        recommendation: "Seleccionar 1–2 casos de uso de IA de alto impacto y bajo riesgo para un piloto.",
        relatedService: "YANKOR AI",
        sortOrder: 3,
      },
      {
        code: "Y6-04",
        name: "Gestión documental",
        question: "¿La información y documentos críticos están organizados, accesibles y controlados?",
        description: "Evalúa orden, versionado y acceso a documentos operativos.",
        expectedEvidence: "Repositorio documental, nomenclatura, control de versiones, permisos.",
        recommendation: "Definir un repositorio único y una nomenclatura simple para documentos críticos.",
        relatedService: "YANKOR Digital",
        sortOrder: 4,
      },
      {
        code: "Y6-05",
        name: "Seguridad de la información",
        question: "¿Existen prácticas básicas de seguridad y respaldo de la información?",
        description: "Evalúa backups, accesos, contraseñas y continuidad básica.",
        expectedEvidence: "Backups, control de accesos, políticas básicas, recuperación de información.",
        recommendation: "Asegurar respaldos periódicos y control básico de accesos a información crítica.",
        relatedService: "YANKOR Digital",
        sortOrder: 5,
      },
    ],
  },
  {
    code: "Y7",
    name: "Talento y Cultura",
    weight: 0.1,
    sortOrder: 7,
    description: "Roles, capacitación, evaluación, comunicación interna y cultura de mejora.",
    indicators: [
      {
        code: "Y7-01",
        name: "Roles y responsabilidades",
        question: "¿Cada persona conoce claramente su rol, responsabilidades y resultados esperados?",
        description: "Evalúa claridad de puestos y accountability.",
        expectedEvidence: "Descripciones de puesto, RACI, objetivos por rol, acuerdos de desempeño.",
        recommendation: "Documentar roles críticos con responsabilidades y resultados esperados.",
        relatedService: "YANKOR Talent",
        sortOrder: 1,
      },
      {
        code: "Y7-02",
        name: "Capacitación",
        question: "¿Existe un plan de capacitación alineado a las necesidades del negocio?",
        description: "Evalúa desarrollo de competencias clave del equipo.",
        expectedEvidence: "Plan de capacitación, matriz de skills, registros de entrenamiento.",
        recommendation: "Crear una matriz de habilidades críticas y un plan de capacitación trimestral.",
        relatedService: "YANKOR Talent",
        sortOrder: 2,
      },
      {
        code: "Y7-03",
        name: "Evaluación del desempeño",
        question: "¿Se evalúa el desempeño con criterios claros y retroalimentación periódica?",
        description: "Evalúa formalidad y utilidad de la evaluación de desempeño.",
        expectedEvidence: "Evaluaciones, objetivos individuales, feedback, planes de mejora.",
        recommendation: "Definir criterios simples de desempeño y una revisión trimestral con el equipo.",
        relatedService: "YANKOR Talent",
        sortOrder: 3,
      },
      {
        code: "Y7-04",
        name: "Comunicación interna",
        question: "¿La comunicación interna facilita coordinación y reduce confusión operativa?",
        description: "Evalúa canales, claridad y efectividad de la comunicación entre áreas.",
        expectedEvidence: "Reuniones de equipo, canales internos, claridad de mensajes, clima laboral.",
        recommendation: "Estandarizar reuniones cortas de coordinación y un canal único de comunicación operativa.",
        relatedService: "YANKOR Talent",
        sortOrder: 4,
      },
      {
        code: "Y7-05",
        name: "Cultura de mejora",
        question: "¿El equipo participa activamente en identificar y mejorar problemas del día a día?",
        description: "Evalúa ownership, apertura al cambio y hábitos de mejora.",
        expectedEvidence: "Ideas implementadas, reconocimiento, participación en mejoras, clima de confianza.",
        recommendation: "Instalar un mecanismo simple para capturar ideas de mejora y reconocer su implementación.",
        relatedService: "YANKOR Talent",
        sortOrder: 5,
      },
    ],
  },
];

async function main() {
  console.log("Seeding YANKOR Business Scan™ Express...");

  await prisma.assessmentResponse.deleteMany();
  await prisma.dimensionScore.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.dimension.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.consultant.deleteMany();

  const passwordHash = await bcrypt.hash("yankor2026", 10);

  const admin = await prisma.consultant.create({
    data: {
      name: "Consultor YANKOR",
      email: "admin@yankor.com",
      passwordHash,
      role: "admin",
      status: "active",
    },
  });

  await prisma.consultant.create({
    data: {
      name: "Ana López",
      email: "ana.lopez@yankor.com",
      passwordHash: await bcrypt.hash("consultor123", 10),
      role: "consultant",
      status: "active",
    },
  });

  for (const dim of dimensions) {
    const created = await prisma.dimension.create({
      data: {
        code: dim.code,
        name: dim.name,
        weight: dim.weight,
        sortOrder: dim.sortOrder,
        description: dim.description,
        active: true,
      },
    });

    for (const ind of dim.indicators) {
      await prisma.indicator.create({
        data: {
          code: ind.code,
          dimensionId: created.id,
          name: ind.name,
          question: ind.question,
          description: ind.description,
          expectedEvidence: ind.expectedEvidence,
          recommendation: ind.recommendation,
          relatedService: ind.relatedService,
          weight: 1,
          companyTypeScope: "ALL",
          assessmentLevel: "express",
          sortOrder: ind.sortOrder,
          active: true,
        },
      });
    }
  }

  const company = await prisma.company.create({
    data: {
      tradeName: "Empresa Demo YANKOR",
      legalName: "Empresa Demo YANKOR S.A. de C.V.",
      sector: "Manufactura ligera",
      companyType: "Manufactura",
      employees: 50,
      city: "Guadalajara",
      contactName: "Carlos Mendoza",
      contactRole: "Director General",
      phone: "33 1234 5678",
      email: "contacto@empresademo.mx",
      isDemo: true,
    },
  });

  const indicators = await prisma.indicator.findMany({
    include: { dimension: true },
    orderBy: [{ dimension: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  // Demo scores designed to land around "Operación Controlada" (~58)
  const demoScores: Record<string, { score: number; risk: string; impact: string }> = {
    "Y1-01": { score: 3, risk: "Medio", impact: "Alto" },
    "Y1-02": { score: 4, risk: "Bajo", impact: "Medio" },
    "Y1-03": { score: 3, risk: "Medio", impact: "Medio" },
    "Y1-04": { score: 2, risk: "Alto", impact: "Alto" },
    "Y1-05": { score: 3, risk: "Medio", impact: "Alto" },
    "Y2-01": { score: 2, risk: "Alto", impact: "Alto" },
    "Y2-02": { score: 3, risk: "Medio", impact: "Alto" },
    "Y2-03": { score: 4, risk: "Bajo", impact: "Alto" },
    "Y2-04": { score: 3, risk: "Medio", impact: "Alto" },
    "Y2-05": { score: 2, risk: "Alto", impact: "Medio" },
    "Y3-01": { score: 4, risk: "Bajo", impact: "Medio" },
    "Y3-02": { score: 3, risk: "Medio", impact: "Alto" },
    "Y3-03": { score: 3, risk: "Medio", impact: "Medio" },
    "Y3-04": { score: 3, risk: "Medio", impact: "Alto" },
    "Y3-05": { score: 2, risk: "Alto", impact: "Alto" },
    "Y4-01": { score: 2, risk: "Medio", impact: "Medio" },
    "Y4-02": { score: 4, risk: "Bajo", impact: "Alto" },
    "Y4-03": { score: 5, risk: "Bajo", impact: "Alto" },
    "Y4-04": { score: 3, risk: "Medio", impact: "Medio" },
    "Y4-05": { score: 3, risk: "Medio", impact: "Medio" },
    "Y5-01": { score: 3, risk: "Medio", impact: "Alto" },
    "Y5-02": { score: 3, risk: "Medio", impact: "Alto" },
    "Y5-03": { score: 2, risk: "Alto", impact: "Alto" },
    "Y5-04": { score: 2, risk: "Critico", impact: "Alto" },
    "Y5-05": { score: 2, risk: "Alto", impact: "Alto" },
    "Y6-01": { score: 3, risk: "Medio", impact: "Medio" },
    "Y6-02": { score: 2, risk: "Alto", impact: "Alto" },
    "Y6-03": { score: 1, risk: "Critico", impact: "Medio" },
    "Y6-04": { score: 3, risk: "Medio", impact: "Bajo" },
    "Y6-05": { score: 2, risk: "Alto", impact: "Alto" },
    "Y7-01": { score: 3, risk: "Medio", impact: "Alto" },
    "Y7-02": { score: 2, risk: "Medio", impact: "Medio" },
    "Y7-03": { score: 2, risk: "Medio", impact: "Medio" },
    "Y7-04": { score: 3, risk: "Bajo", impact: "Medio" },
    "Y7-05": { score: 3, risk: "Medio", impact: "Medio" },
  };

  const assessment = await prisma.assessment.create({
    data: {
      companyId: company.id,
      consultantId: admin.id,
      status: "completed",
      companyType: "Manufactura",
      assessmentType: "express",
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 55),
      isDemo: true,
      notes: "Diagnóstico demo para visualización del dashboard.",
    },
  });

  const scoreToPercent = (s: number) => (s / 5) * 100;
  const levelFromScore = (pct: number) => {
    if (pct <= 20) return "Operación Crítica";
    if (pct <= 40) return "Operación Reactiva";
    if (pct <= 60) return "Operación Controlada";
    if (pct <= 80) return "Operación Eficiente";
    return "Operación de Alto Desempeño";
  };

  const dimMap = new Map<string, { name: string; weight: number; scores: number[] }>();

  for (const ind of indicators) {
    const demo = demoScores[ind.code] ?? { score: 3, risk: "Medio", impact: "Medio" };
    await prisma.assessmentResponse.create({
      data: {
        assessmentId: assessment.id,
        indicatorId: ind.id,
        score: demo.score,
        evidence: `Evidencia demo para ${ind.name}.`,
        observations: `Observación demo del consultor sobre ${ind.name.toLowerCase()}.`,
        risk: demo.risk,
        impact: demo.impact,
      },
    });

    const bucket = dimMap.get(ind.dimension.code) ?? {
      name: ind.dimension.name,
      weight: ind.dimension.weight,
      scores: [],
    };
    bucket.scores.push(scoreToPercent(demo.score));
    dimMap.set(ind.dimension.code, bucket);
  }

  let global = 0;
  for (const [code, data] of dimMap.entries()) {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const weighted = avg * data.weight;
    global += weighted;
    await prisma.dimensionScore.create({
      data: {
        assessmentId: assessment.id,
        dimensionCode: code,
        dimensionName: data.name,
        weight: data.weight,
        averageScore: Math.round(avg * 10) / 10,
        weightedScore: Math.round(weighted * 10) / 10,
        level: levelFromScore(avg),
      },
    });
  }

  const globalRounded = Math.round(global);
  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      globalScore: globalRounded,
      globalLevel: levelFromScore(globalRounded),
    },
  });

  console.log("Seed complete.");
  console.log("Login: admin@yankor.com / yankor2026");
  console.log(`Demo assessment score: ${globalRounded}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
