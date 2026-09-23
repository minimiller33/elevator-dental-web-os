export const FIT_SCAN_VERSION = "fit-v1";

export const FLOORS = [
  { number: "01", label: "Clínica", short: "Identidad" },
  { number: "02", label: "Capacidad", short: "Operación" },
  { number: "03", label: "Huella digital", short: "Internet" },
  { number: "04", label: "Tecnología", short: "Autoridad" },
  { number: "05", label: "Crecimiento", short: "Oportunidad" },
  { number: "06", label: "Activación", short: "Decisión" },
] as const;

export type FitScanAnswers = {
  clinicName: string;
  country: string;
  city: string;
  yearsOperating: string;
  role: string;
  operatories: string;
  branches: string;
  patientCapacity: string;
  websiteStatus: string;
  websiteAge: string;
  searchVisibility: string;
  domainAccess: string;
  dentalTech: string[];
  treatments: string[];
  revenueBand: string;
  growthGoal: string;
  primaryPain: string;
  timeline: string;
  decisionAuthority: string;
  priceAccepted: string;
  scopeAccepted: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactConsent: boolean;
  adsConsent: boolean;
};

export const INITIAL_FIT_SCAN_ANSWERS: FitScanAnswers = {
  clinicName: "",
  country: "",
  city: "",
  yearsOperating: "",
  role: "",
  operatories: "",
  branches: "",
  patientCapacity: "",
  websiteStatus: "",
  websiteAge: "",
  searchVisibility: "",
  domainAccess: "",
  dentalTech: [],
  treatments: [],
  revenueBand: "",
  growthGoal: "",
  primaryPain: "",
  timeline: "",
  decisionAuthority: "",
  priceAccepted: "",
  scopeAccepted: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  contactConsent: false,
  adsConsent: false,
};

export type FitBand = "fast" | "guided" | "foundation";

export type FitResult = {
  band: FitBand;
  label: string;
  eyebrow: string;
  summary: string;
  score: number;
  dimensions: Array<{ label: string; value: number; level: "Alta" | "Media" | "Inicial" }>;
  insights: string[];
  blockers: string[];
};

const points: Record<string, number> = {
  yes: 1,
  partial: 0.55,
  no: 0,
};

function scale(value: number, maximum: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * maximum);
}

function level(value: number): "Alta" | "Media" | "Inicial" {
  if (value >= 72) return "Alta";
  if (value >= 45) return "Media";
  return "Inicial";
}

function displayTreatment(value: string) {
  const labels: Record<string, string> = {
    implants: "implantes",
    allOnX: "All-on-X",
    veneers: "carillas",
    aligners: "alineadores",
    orthodontics: "ortodoncia",
    rehabilitation: "rehabilitación",
    general: "odontología general",
  };
  return labels[value] ?? value;
}

function displayTech(value: string) {
  const labels: Record<string, string> = {
    cerec: "CEREC/CAD-CAM",
    scanner: "escáner intraoral",
    cbct: "tomografía 3D/CBCT",
    smileDesign: "diseño digital de sonrisa",
    printing: "impresión 3D",
    guided: "cirugía guiada",
    lab: "laboratorio digital",
  };
  return labels[value] ?? value;
}

export function isFloorComplete(floor: number, answers: FitScanAnswers) {
  switch (floor) {
    case 1:
      return Boolean(
        answers.clinicName.trim().length > 1 &&
        answers.country.trim().length > 1 &&
        answers.city.trim().length > 1 &&
        answers.yearsOperating &&
        answers.role,
      );
    case 2:
      return Boolean(answers.operatories && answers.branches && answers.patientCapacity);
    case 3:
      return Boolean(
        answers.websiteStatus &&
        (answers.websiteStatus === "none" || answers.websiteAge) &&
        answers.searchVisibility &&
        answers.domainAccess,
      );
    case 4:
      return answers.dentalTech.length > 0 && answers.treatments.length > 0;
    case 5:
      return Boolean(answers.revenueBand && answers.growthGoal && answers.primaryPain);
    case 6:
      return Boolean(
        answers.timeline &&
        answers.decisionAuthority &&
        answers.priceAccepted &&
        answers.scopeAccepted &&
        answers.firstName.trim().length > 1 &&
        answers.lastName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(answers.email) &&
        answers.phone.replace(/\D/g, "").length >= 8 &&
        answers.contactConsent,
      );
    default:
      return false;
  }
}

export function getFitResult(answers: FitScanAnswers): FitResult {
  let capacity = 0;
  capacity += scale(points[answers.patientCapacity] ?? 0, 14);
  capacity += ({ one: 2, twoThree: 5, fourSix: 8, sevenPlus: 10 }[answers.operatories] ?? 0);
  capacity += ({ one: 2, two: 4, threeFive: 5, sixPlus: 6 }[answers.branches] ?? 0);

  let opportunity = 0;
  opportunity += ({ none: 9, stale: 9, functional: 5, leads: 2 }[answers.websiteStatus] ?? 0);
  opportunity += ({ underSix: 1, sixTwelve: 3, oneThree: 5, overThree: 7 }[answers.websiteAge] ?? (answers.websiteStatus === "none" ? 7 : 0));
  opportunity += ({ topThree: 1, firstPage: 3, no: 7, unknown: 7 }[answers.searchVisibility] ?? 0);
  opportunity += answers.primaryPain ? 2 : 0;

  let readiness = 0;
  readiness += ({ yes: 8, shared: 5, no: 1 }[answers.decisionAuthority] ?? 0);
  readiness += ({ now: 6, thirty: 5, ninety: 2, exploring: 1 }[answers.timeline] ?? 0);
  readiness += ({ yes: 7, discuss: 3, no: 0 }[answers.priceAccepted] ?? 0);
  readiness += ({ yes: 4, transfer: 2, no: 0 }[answers.domainAccess] ?? 0);

  let alignment = 0;
  alignment += answers.treatments.length > 0 ? 5 : 0;
  alignment += answers.growthGoal ? 5 : 0;
  alignment += answers.scopeAccepted === "yes" ? 6 : 0;
  alignment += answers.firstName && answers.email && answers.phone ? 4 : 0;

  const blockers: string[] = [];
  if (answers.patientCapacity === "no") blockers.push("La capacidad para recibir nuevos pacientes necesita revisión.");
  if (answers.priceAccepted === "no") blockers.push("La inversión todavía no está alineada.");
  if (answers.scopeAccepted === "no") blockers.push("La clínica busca un alcance distinto al producto estandarizado.");
  if (answers.decisionAuthority === "no") blockers.push("Falta involucrar a la persona que decide.");

  const score = capacity + opportunity + readiness + alignment;
  const band: FitBand = blockers.length > 1 || score < 50 ? "foundation" : score >= 75 && blockers.length === 0 ? "fast" : "guided";

  const insights: string[] = [];
  if (answers.yearsOperating === "tenPlus") {
    insights.push("Hay una década de autoridad clínica que internet quizá todavía no está viendo.");
  } else if (answers.yearsOperating === "fourNine") {
    insights.push("Tu trayectoria ya puede convertirse en una señal digital de confianza más fuerte.");
  }

  if (answers.websiteStatus === "none") {
    insights.push("La clínica tiene la oportunidad de nacer con una infraestructura preparada para búsqueda e IA.");
  } else if (answers.websiteStatus === "stale" || answers.websiteAge === "overThree") {
    insights.push("Detectamos antigüedad digital: la web existe, pero no está acumulando mejoras de forma visible.");
  } else if (answers.searchVisibility === "unknown" || answers.searchVisibility === "no") {
    insights.push("Existe un punto ciego: hoy no está claro qué entiende Google sobre la clínica en su zona.");
  }

  const firstTech = answers.dentalTech.find((item) => item !== "none");
  if (firstTech) {
    insights.push(`La inversión en ${displayTech(firstTech)} debería convertirse también en una señal pública de autoridad.`);
  }

  const firstTreatment = answers.treatments[0];
  if (answers.patientCapacity === "yes" && firstTreatment) {
    insights.push(`Hay capacidad para convertir más búsquedas locales en oportunidades de ${displayTreatment(firstTreatment)}.`);
  }

  if (insights.length < 3) {
    insights.push("La mayor oportunidad está en conectar información clínica, demanda local y mejora continua.");
  }

  const copy: Record<FitBand, Pick<FitResult, "label" | "eyebrow" | "summary">> = {
    fast: {
      label: "Fast Track",
      eyebrow: "TU CLÍNICA ESTÁ LISTA PARA ASCENDER",
      summary: "La combinación de capacidad, necesidad digital y preparación permite avanzar directamente a activación.",
    },
    guided: {
      label: "Guided Fit",
      eyebrow: "ENCONTRAMOS UNA OPORTUNIDAD REAL",
      summary: "Existe buen encaje, pero conviene resolver uno o dos puntos antes de activar la construcción.",
    },
    foundation: {
      label: "Foundation",
      eyebrow: "PRIMERO, PREPAREMOS LA BASE",
      summary: "La oportunidad existe, aunque hoy hay condiciones operativas o comerciales que conviene ordenar primero.",
    },
  };

  return {
    band,
    ...copy[band],
    score,
    blockers,
    insights: insights.slice(0, 3),
    dimensions: [
      { label: "Capacidad clínica", value: Math.round((capacity / 30) * 100), level: level((capacity / 30) * 100) },
      { label: "Oportunidad digital", value: Math.round((opportunity / 25) * 100), level: level((opportunity / 25) * 100) },
      { label: "Preparación", value: Math.round(((readiness + alignment) / 45) * 100), level: level(((readiness + alignment) / 45) * 100) },
    ],
  };
}

export function safeAnswersForLocalStorage(answers: FitScanAnswers) {
  return {
    ...answers,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    contactConsent: false,
    adsConsent: false,
  };
}
