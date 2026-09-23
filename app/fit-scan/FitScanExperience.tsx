"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { ArrowUpRight, Check, Spark } from "@/components/Icons";
import {
  FIT_SCAN_VERSION,
  FLOORS,
  FitScanAnswers,
  getFitResult,
  INITIAL_FIT_SCAN_ANSWERS,
  isFloorComplete,
  safeAnswersForLocalStorage,
} from "@/lib/fit-scan";
import styles from "./fit-scan.module.css";

const STORAGE_KEY = "elevator-fit-scan:preview:v1";

const floorCopy = [
  {
    eyebrow: "LOBBY · ELEVATOR FIT SCAN",
    title: "Descubramos cuánto potencial digital está dejando tu clínica sin activar.",
    description: "Seis pisos. Menos de cuatro minutos. Un diagnóstico diseñado específicamente para clínicas dentales.",
    signal: "No es un formulario genérico. Cada respuesta cambia el diagnóstico y la ruta recomendada.",
  },
  {
    eyebrow: "PISO 01 · IDENTIDAD CLÍNICA",
    title: "Primero, entendamos la autoridad que tu clínica ya construyó.",
    description: "La trayectoria y el mercado importan porque internet necesita contexto para comprender quién eres.",
    signal: "La autoridad clínica existe antes de aparecer en Google. Nuestro trabajo es hacerla entendible.",
  },
  {
    eyebrow: "PISO 02 · CAPACIDAD",
    title: "Una web solo puede generar valor si la clínica puede recibirlo.",
    description: "Medimos la capacidad operativa sin asumir que una clínica grande es automáticamente una clínica preparada.",
    signal: "Más pacientes sin capacidad pueden crear un problema. Primero comprobamos que el ascenso sea sostenible.",
  },
  {
    eyebrow: "PISO 03 · HUELLA DIGITAL",
    title: "Ahora veamos qué está entendiendo internet sobre tu clínica.",
    description: "La web publicada es solo el punto de partida. Lo decisivo es si mide, aprende y mejora.",
    signal: "Una web antigua no siempre está rota. A menudo está detenida.",
  },
  {
    eyebrow: "PISO 04 · ODONTOLOGÍA DIGITAL",
    title: "Tu tecnología clínica también debería trabajar para posicionarte.",
    description: "Estas señales nos permiten traducir innovación clínica en información pública clara y verificable.",
    signal: "No calificamos mejor a una clínica por tener más equipos. Los usamos para comprender su verdadera diferenciación.",
  },
  {
    eyebrow: "PISO 05 · MOTOR DE CRECIMIENTO",
    title: "Busquemos dónde está el mayor ascenso posible.",
    description: "Conectamos capacidad, tratamientos prioritarios y el problema digital que más está frenando a la clínica.",
    signal: "La facturación segmenta la estrategia; no decide por sí sola quién puede ser un gran cliente.",
  },
  {
    eyebrow: "PISO 06 · ACTIVACIÓN",
    title: "Último piso: comprobemos si este es el momento correcto.",
    description: "Sin letra pequeña: alcance, inversión, autoridad de decisión y velocidad para comenzar.",
    signal: "El mejor cliente no es quien responde perfecto. Es quien entiende el modelo y está preparado para ejecutarlo.",
  },
] as const;

type ScalarField = Exclude<keyof FitScanAnswers, "dentalTech" | "treatments" | "contactConsent" | "adsConsent">;

type Choice = { value: string; label: string; detail?: string; icon?: string };

function TextField({
  label,
  name,
  value,
  placeholder,
  autoComplete,
  type = "text",
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  type?: "text" | "email" | "tel";
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.textField}>
      <span>{label}</span>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        type={type}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function ChoiceGroup({
  legend,
  name,
  value,
  choices,
  onChange,
  compact = false,
}: {
  legend: string;
  name: string;
  value: string;
  choices: readonly Choice[];
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>{legend}</legend>
      <div className={`${styles.choiceGrid} ${compact ? styles.choiceGridCompact : ""}`}>
        {choices.map((choice) => (
          <label className={`${styles.choice} ${value === choice.value ? styles.choiceSelected : ""}`} key={choice.value}>
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <span className={styles.choiceMark} aria-hidden="true">{choice.icon ?? "↗"}</span>
            <span className={styles.choiceCopy}>
              <strong>{choice.label}</strong>
              {choice.detail ? <small>{choice.detail}</small> : null}
            </span>
            <span className={styles.choiceCheck} aria-hidden="true"><Check /></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function MultiChoiceGroup({
  legend,
  name,
  values,
  choices,
  onToggle,
  max,
}: {
  legend: string;
  name: string;
  values: string[];
  choices: readonly Choice[];
  onToggle: (value: string) => void;
  max?: number;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>{legend} {max ? <small>· MÁXIMO {max}</small> : null}</legend>
      <div className={`${styles.choiceGrid} ${styles.choiceGridCompact}`}>
        {choices.map((choice) => {
          const selected = values.includes(choice.value);
          const disabled = !selected && Boolean(max && values.length >= max);
          return (
            <label
              className={`${styles.choice} ${styles.choiceCompact} ${selected ? styles.choiceSelected : ""} ${disabled ? styles.choiceDisabled : ""}`}
              key={choice.value}
            >
              <input
                type="checkbox"
                name={name}
                value={choice.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(choice.value)}
              />
              <span className={styles.choiceMark} aria-hidden="true">{choice.icon ?? "+"}</span>
              <span className={styles.choiceCopy}><strong>{choice.label}</strong></span>
              <span className={styles.choiceCheck} aria-hidden="true"><Check /></span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FloorRail({ stage }: { stage: number }) {
  return (
    <aside className={styles.floorRail} aria-label="Pisos del diagnóstico">
      <div className={styles.floorRailHead}>
        <small>RECORRIDO</small>
        <span>{stage === 0 ? "LOBBY" : stage > 6 ? "AZOTEA" : `PISO ${stage}`}</span>
      </div>
      <div className={styles.shaft} aria-hidden="true">
        <i style={{ transform: `translateY(${Math.max(0, Math.min(stage - 1, 5)) * 100}%)` }}><span>↑</span></i>
      </div>
      <ol>
        {FLOORS.map((floor, index) => {
          const floorNumber = index + 1;
          const state = floorNumber < stage ? styles.floorComplete : floorNumber === stage ? styles.floorActive : "";
          return (
            <li className={state} key={floor.number}>
              <span>{floor.number}</span>
              <div><strong>{floor.label}</strong><small>{floor.short}</small></div>
              <i aria-hidden="true">{floorNumber < stage ? <Check /> : null}</i>
            </li>
          );
        })}
      </ol>
      <div className={styles.floorRailFoot}><span /><small>AUTOGUARDADO LOCAL</small></div>
    </aside>
  );
}

function PreviewNotice() {
  return (
    <div className={styles.previewNotice} role="note">
      <span><i /> VISTA DE ARQUITECTURA</span>
      <p>No envía datos, no reserva llamadas y no procesa pagos.</p>
    </div>
  );
}

function ResultScreen({ answers, onReset }: { answers: FitScanAnswers; onReset: () => void }) {
  const result = getFitResult(answers);
  const actionCopy = result.band === "fast"
    ? "Activar mi Elevator Web — $2,194"
    : result.band === "guided"
      ? "Reservar diagnóstico Elevator"
      : "Recibir mi plan de preparación";

  return (
    <section className={`${styles.result} ${styles[`result${result.band[0].toUpperCase()}${result.band.slice(1)}`]}`} aria-labelledby="fit-result-title">
      <div className={styles.resultGlow} aria-hidden="true" />
      <span className={styles.resultEyebrow}><i /> {result.eyebrow}</span>
      <div className={styles.resultTitleRow}>
        <div>
          <small>ELEVATOR READINESS</small>
          <h1 id="fit-result-title" tabIndex={-1}>{result.label}</h1>
        </div>
        <span className={styles.resultSeal} aria-hidden="true"><Spark /><i /><b>READY</b></span>
      </div>
      <p className={styles.resultSummary}>{result.summary}</p>

      <div className={styles.dimensionGrid}>
        {result.dimensions.map((dimension) => (
          <article key={dimension.label}>
            <span><small>{dimension.label}</small><strong>{dimension.level}</strong></span>
            <i aria-hidden="true"><b style={{ width: `${dimension.value}%` }} /></i>
          </article>
        ))}
      </div>

      <div className={styles.findings}>
        <header><span>03</span><div><small>SEÑALES DETECTADAS</small><strong>Lo que encontramos en tu clínica</strong></div></header>
        <ol>
          {result.insights.map((insight, index) => (
            <li key={insight}><span>0{index + 1}</span><p>{insight}</p></li>
          ))}
        </ol>
      </div>

      {result.blockers.length > 0 ? (
        <div className={styles.reviewFlags}>
          <strong>Puntos para revisar antes de activar</strong>
          {result.blockers.map((blocker) => <p key={blocker}>— {blocker}</p>)}
        </div>
      ) : null}

      <div className={styles.resultAction}>
        <div>
          <small>SIGUIENTE RUTA</small>
          <strong>{actionCopy}</strong>
          <p>Se habilitará cuando Stripe, Elevator CRM y el calendario estén conectados.</p>
        </div>
        <button type="button" disabled>{actionCopy} <ArrowUpRight /></button>
      </div>

      <div className={styles.resultFooter}>
        <button type="button" onClick={onReset}>Reiniciar diagnóstico</button>
        <Link href="/">Volver a Elevator Dental OS</Link>
      </div>
    </section>
  );
}

export function FitScanExperience() {
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<FitScanAnswers>(INITIAL_FIT_SCAN_ANSWERS);
  const [hydrated, setHydrated] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { version?: string; answers?: Partial<FitScanAnswers>; stage?: number };
          if (parsed.version === FIT_SCAN_VERSION && parsed.answers) {
            setAnswers((current) => ({ ...current, ...parsed.answers }));
            setStage(Math.max(0, Math.min(parsed.stage ?? 0, 6)));
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: FIT_SCAN_VERSION,
      stage: Math.min(stage, 6),
      answers: safeAnswersForLocalStorage(answers),
    }));
  }, [answers, hydrated, stage]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    if (stage > 0 && stage <= 6) headingRef.current?.focus({ preventScroll: true });
  }, [stage]);

  const completedFloors = useMemo(
    () => FLOORS.filter((_, index) => isFloorComplete(index + 1, answers)).length,
    [answers],
  );
  const progress = stage === 0 ? 0 : stage > 6 ? 100 : Math.round(((stage - 1) / 6) * 100);
  const currentCopy = floorCopy[Math.min(stage, 6)];

  function setScalar(field: ScalarField, value: string) {
    setAnswers((current) => ({ ...current, [field]: value }));
  }

  function toggleMulti(field: "dentalTech" | "treatments", value: string, max?: number) {
    setAnswers((current) => {
      const values = current[field];
      if (value === "none") return { ...current, [field]: ["none"] };
      const withoutNone = values.filter((item) => item !== "none");
      const next = withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : max && withoutNone.length >= max
          ? withoutNone
          : [...withoutNone, value];
      return { ...current, [field]: next };
    });
  }

  function goNext() {
    if (stage === 0 || isFloorComplete(stage, answers)) {
      setDirection("up");
      setStage((current) => Math.min(current + 1, 7));
    }
  }

  function goBack() {
    setDirection("down");
    setStage((current) => Math.max(current - 1, 0));
  }

  function resetScan() {
    window.localStorage.removeItem(STORAGE_KEY);
    setAnswers(INITIAL_FIT_SCAN_ANSWERS);
    setDirection("down");
    setStage(0);
  }

  let floorFields: React.ReactNode = null;

  if (stage === 1) {
    floorFields = (
      <>
        <div className={styles.textGrid}>
          <TextField label="Nombre de la clínica" name="clinicName" value={answers.clinicName} placeholder="Clínica Dental…" autoComplete="organization" onChange={(value) => setScalar("clinicName", value)} />
          <TextField label="Ciudad" name="city" value={answers.city} placeholder="Madrid, CDMX…" autoComplete="address-level2" onChange={(value) => setScalar("city", value)} />
          <TextField label="País" name="country" value={answers.country} placeholder="España, México…" autoComplete="country-name" onChange={(value) => setScalar("country", value)} />
        </div>
        <ChoiceGroup legend="¿Cuánto tiempo lleva operando?" name="yearsOperating" value={answers.yearsOperating} onChange={(value) => setScalar("yearsOperating", value)} compact choices={[
          { value: "underOne", label: "Menos de 1 año" }, { value: "oneThree", label: "1–3 años" }, { value: "fourNine", label: "4–9 años" }, { value: "tenPlus", label: "10+ años" },
        ]} />
        <ChoiceGroup legend="¿Cuál es tu rol?" name="role" value={answers.role} onChange={(value) => setScalar("role", value)} compact choices={[
          { value: "owner", label: "Propietario/a" }, { value: "partner", label: "Socio/a" }, { value: "director", label: "Dirección" }, { value: "marketing", label: "Marketing" },
        ]} />
      </>
    );
  }

  if (stage === 2) {
    floorFields = (
      <>
        <ChoiceGroup legend="¿Cuántos cubículos o sillones están activos?" name="operatories" value={answers.operatories} onChange={(value) => setScalar("operatories", value)} choices={[
          { value: "one", label: "1", detail: "Operación compacta", icon: "01" }, { value: "twoThree", label: "2–3", detail: "Capacidad estable", icon: "03" }, { value: "fourSix", label: "4–6", detail: "Clínica en expansión", icon: "06" }, { value: "sevenPlus", label: "7+", detail: "Alta capacidad", icon: "07+" },
        ]} />
        <ChoiceGroup legend="¿Cuántas sucursales tiene la clínica?" name="branches" value={answers.branches} onChange={(value) => setScalar("branches", value)} compact choices={[
          { value: "one", label: "1" }, { value: "two", label: "2" }, { value: "threeFive", label: "3–5" }, { value: "sixPlus", label: "6+" },
        ]} />
        <ChoiceGroup legend="¿Podrían recibir más pacientes durante los próximos 30 días?" name="patientCapacity" value={answers.patientCapacity} onChange={(value) => setScalar("patientCapacity", value)} choices={[
          { value: "yes", label: "Sí", detail: "Tenemos espacio y equipo", icon: "↑" }, { value: "partial", label: "Parcialmente", detail: "Depende del tratamiento", icon: "↗" }, { value: "no", label: "Todavía no", detail: "Primero debemos ampliar", icon: "—" },
        ]} />
      </>
    );
  }

  if (stage === 3) {
    floorFields = (
      <>
        <ChoiceGroup legend="¿Cómo describirías la web actual?" name="websiteStatus" value={answers.websiteStatus} onChange={(value) => setScalar("websiteStatus", value)} choices={[
          { value: "none", label: "No tenemos web", detail: "Empezamos desde la base", icon: "Ø" }, { value: "stale", label: "Existe, pero está detenida", detail: "Desactualizada o difícil de editar", icon: "Ⅱ" }, { value: "functional", label: "Funciona", detail: "Informa, pero no sabemos si crece", icon: "✓" }, { value: "leads", label: "Genera solicitudes", detail: "Podemos medir resultados", icon: "↗" },
        ]} />
        {answers.websiteStatus && answers.websiteStatus !== "none" ? (
          <ChoiceGroup legend="¿Hace cuánto está operativa?" name="websiteAge" value={answers.websiteAge} onChange={(value) => setScalar("websiteAge", value)} compact choices={[
            { value: "underSix", label: "< 6 meses" }, { value: "sixTwelve", label: "6–12 meses" }, { value: "oneThree", label: "1–3 años" }, { value: "overThree", label: "3+ años" },
          ]} />
        ) : null}
        <ChoiceGroup legend="Al buscar “dentista + tu zona”, ¿qué ocurre?" name="searchVisibility" value={answers.searchVisibility} onChange={(value) => setScalar("searchVisibility", value)} compact choices={[
          { value: "topThree", label: "Top 3" }, { value: "firstPage", label: "Primera página" }, { value: "no", label: "No aparecemos" }, { value: "unknown", label: "No lo sé" },
        ]} />
        <ChoiceGroup legend="¿Quién controla el dominio y la web?" name="domainAccess" value={answers.domainAccess} onChange={(value) => setScalar("domainAccess", value)} choices={[
          { value: "yes", label: "La clínica", detail: "Tenemos los accesos", icon: "✓" }, { value: "transfer", label: "Un proveedor", detail: "Podemos solicitarlos", icon: "↔" }, { value: "no", label: "No está claro", detail: "Hay que investigarlo", icon: "?" },
        ]} />
      </>
    );
  }

  if (stage === 4) {
    floorFields = (
      <>
        <MultiChoiceGroup legend="¿Qué tecnología de odontología digital utilizas?" name="dentalTech" values={answers.dentalTech} onToggle={(value) => toggleMulti("dentalTech", value)} choices={[
          { value: "cerec", label: "CEREC / CAD-CAM", icon: "C" }, { value: "scanner", label: "Escáner intraoral", icon: "S" }, { value: "cbct", label: "Tomografía 3D / CBCT", icon: "3D" }, { value: "smileDesign", label: "Diseño digital de sonrisa", icon: "D" }, { value: "printing", label: "Impresión 3D", icon: "P" }, { value: "guided", label: "Cirugía guiada", icon: "G" }, { value: "lab", label: "Laboratorio digital", icon: "L" }, { value: "none", label: "Ninguna por ahora", icon: "—" },
        ]} />
        <MultiChoiceGroup legend="¿Qué tratamientos quieres hacer crecer?" name="treatments" values={answers.treatments} onToggle={(value) => toggleMulti("treatments", value, 2)} max={2} choices={[
          { value: "implants", label: "Implantes" }, { value: "allOnX", label: "All-on-X" }, { value: "veneers", label: "Carillas" }, { value: "aligners", label: "Alineadores" }, { value: "orthodontics", label: "Ortodoncia" }, { value: "rehabilitation", label: "Rehabilitación" }, { value: "general", label: "Odontología general" },
        ]} />
      </>
    );
  }

  if (stage === 5) {
    floorFields = (
      <>
        <ChoiceGroup legend="Facturación mensual aproximada" name="revenueBand" value={answers.revenueBand} onChange={(value) => setScalar("revenueBand", value)} compact choices={[
          { value: "under10", label: "< $10K USD" }, { value: "ten25", label: "$10K–$25K" }, { value: "twentyFive60", label: "$25K–$60K" }, { value: "sixty150", label: "$60K–$150K" }, { value: "over150", label: "$150K+" }, { value: "private", label: "Prefiero no decir" },
        ]} />
        <ChoiceGroup legend="¿Qué te gustaría lograr durante los próximos 90 días?" name="growthGoal" value={answers.growthGoal} onChange={(value) => setScalar("growthGoal", value)} choices={[
          { value: "visibility", label: "Aumentar visibilidad", detail: "Aparecer más en búsquedas", icon: "◎" }, { value: "patients", label: "Generar oportunidades", detail: "Convertir demanda local", icon: "+" }, { value: "authority", label: "Construir autoridad", detail: "Ser entendida y citada", icon: "A" }, { value: "replace", label: "Reemplazar la web", detail: "Salir de una infraestructura obsoleta", icon: "↻" },
        ]} />
        <ChoiceGroup legend="¿Cuál es el dolor que más te pesa hoy?" name="primaryPain" value={answers.primaryPain} onChange={(value) => setScalar("primaryPain", value)} choices={[
          { value: "google", label: "No aparecemos en Google", detail: "Y nadie explica por qué", icon: "G" }, { value: "ai", label: "La IA no nos recomienda", detail: "ChatGPT, Gemini o Perplexity", icon: "AI" }, { value: "seo", label: "Ya pagamos SEO sin éxito", detail: "Mucho reporte, poco avance", icon: "↘" }, { value: "team", label: "Todo parece complicado", detail: "No queremos otro equipo que gestionar", icon: "∞" },
        ]} />
      </>
    );
  }

  if (stage === 6) {
    floorFields = (
      <>
        <div className={styles.priceBrief}>
          <span><small>ACTIVACIÓN</small><strong>$1,497</strong></span>
          <i aria-hidden="true">+</i>
          <span><small>PRIMER MES</small><strong>$697</strong></span>
          <div><small>TOTAL INICIAL</small><strong>$2,194 USD</strong><p>Después, $697/mes mientras la Membership esté activa.</p></div>
        </div>
        <ChoiceGroup legend="¿Cuándo te gustaría comenzar?" name="timeline" value={answers.timeline} onChange={(value) => setScalar("timeline", value)} compact choices={[
          { value: "now", label: "Ahora" }, { value: "thirty", label: "En 30 días" }, { value: "ninety", label: "1–3 meses" }, { value: "exploring", label: "Explorando" },
        ]} />
        <ChoiceGroup legend="¿Participas en la decisión final?" name="decisionAuthority" value={answers.decisionAuthority} onChange={(value) => setScalar("decisionAuthority", value)} compact choices={[
          { value: "yes", label: "Sí, decido" }, { value: "shared", label: "Decidimos en equipo" }, { value: "no", label: "Debo involucrar a alguien" },
        ]} />
        <ChoiceGroup legend="¿La inversión encaja con la clínica?" name="priceAccepted" value={answers.priceAccepted} onChange={(value) => setScalar("priceAccepted", value)} compact choices={[
          { value: "yes", label: "Sí, podemos activar" }, { value: "discuss", label: "Quiero hablarlo" }, { value: "no", label: "No por ahora" },
        ]} />
        <ChoiceGroup legend="Elevator Web es un producto estandarizado, sin cambios ilimitados ni garantías de ranking. ¿Encaja contigo?" name="scopeAccepted" value={answers.scopeAccepted} onChange={(value) => setScalar("scopeAccepted", value)} compact choices={[
          { value: "yes", label: "Sí, quiero simplicidad" }, { value: "no", label: "Busco algo personalizado" },
        ]} />

        <div className={styles.contactCapture}>
          <header><span><i /> DIAGNÓSTICO CASI COMPLETO</span><p>¿Dónde lo enviaríamos cuando la conexión esté activa?</p></header>
          <div className={styles.textGrid}>
            <TextField label="Nombre" name="firstName" value={answers.firstName} placeholder="Tu nombre" autoComplete="given-name" onChange={(value) => setScalar("firstName", value)} />
            <TextField label="Apellido" name="lastName" value={answers.lastName} placeholder="Tu apellido" autoComplete="family-name" onChange={(value) => setScalar("lastName", value)} />
            <TextField label="Email profesional" name="email" type="email" value={answers.email} placeholder="nombre@clinica.com" autoComplete="email" onChange={(value) => setScalar("email", value)} />
            <TextField label="Teléfono" name="phone" type="tel" value={answers.phone} placeholder="+34 / +52…" autoComplete="tel" onChange={(value) => setScalar("phone", value)} />
          </div>
          <label className={`${styles.consent} ${answers.contactConsent ? styles.consentChecked : ""}`}>
            <input
              type="checkbox"
              checked={answers.contactConsent}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setAnswers((current) => ({ ...current, contactConsent: checked }));
              }}
            />
            <span><Check /></span>
            <p>Acepto que Elevator utilice estos datos para evaluar esta solicitud y contactarme sobre Elevator Web.</p>
          </label>
          <label className={`${styles.consent} ${answers.adsConsent ? styles.consentChecked : ""}`}>
            <input
              type="checkbox"
              checked={answers.adsConsent}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setAnswers((current) => ({ ...current, adsConsent: checked }));
              }}
            />
            <span><Check /></span>
            <p>Autorizo medición publicitaria para mejorar la calidad de futuras campañas. Opcional.</p>
          </label>
          <small className={styles.legalPreview}>Texto provisional para revisión legal. Esta vista no transmite información.</small>
        </div>
      </>
    );
  }

  const canContinue = stage === 0 || (stage >= 1 && stage <= 6 && isFloorComplete(stage, answers));

  return (
    <main className={styles.shell}>
      <div className={styles.ambient} aria-hidden="true"><i /><i /><i /></div>
      <header className={styles.header}>
        <Link href="/" aria-label="Volver a Elevator Dental OS"><BrandMark /></Link>
        <PreviewNotice />
        <div className={styles.headerProgress}>
          <span>{stage > 6 ? "ESCANEO COMPLETO" : `${completedFloors}/6 PISOS LISTOS`}</span>
          <i aria-hidden="true"><b style={{ width: `${stage > 6 ? 100 : (completedFloors / 6) * 100}%` }} /></i>
        </div>
      </header>

      <div className={styles.mobileProgress}>
        <span>{stage === 0 ? "LOBBY" : stage > 6 ? "AZOTEA" : `PISO ${stage} DE 6`}</span>
        <i aria-hidden="true"><b style={{ width: `${progress}%` }} /></i>
        <strong>{progress}%</strong>
      </div>

      <div className={styles.layout}>
        <FloorRail stage={stage} />

        <div className={styles.mainColumn}>
          {stage <= 6 ? (
            <section className={`${styles.stage} ${direction === "up" ? styles.stageUp : styles.stageDown}`} key={stage}>
              <div className={styles.stageHead}>
                <span className={styles.eyebrow}><i /> {currentCopy.eyebrow}</span>
                <h1 ref={headingRef} tabIndex={-1}>{currentCopy.title}</h1>
                <p>{currentCopy.description}</p>
              </div>

              {stage === 0 ? (
                <div className={styles.lobbyVisual} aria-hidden="true">
                  <div className={styles.lobbyCore}><BrandMark compact /><span>FIT SCAN</span><strong>6</strong><small>PISOS</small></div>
                  {FLOORS.map((floor, index) => <i key={floor.number} style={{ "--floor-index": index } as React.CSSProperties}><b>{floor.number}</b><span>{floor.label}</span></i>)}
                </div>
              ) : (
                <form className={styles.form} onSubmit={(event) => { event.preventDefault(); goNext(); }}>
                  {floorFields}
                </form>
              )}

              <div className={styles.signalCard}>
                <Spark />
                <span><small>SEÑAL ELEVATOR</small><strong>{currentCopy.signal}</strong></span>
              </div>
            </section>
          ) : <ResultScreen answers={answers} onReset={resetScan} />}

          {stage <= 6 ? (
            <nav className={styles.navigation} aria-label="Navegación del diagnóstico">
              <button type="button" className={styles.backButton} onClick={goBack} disabled={stage === 0}>← Atrás</button>
              <span><small>{stage === 0 ? "4 MIN APROX." : `PISO ${stage} / 6`}</small><strong>{stage === 0 ? "Empezar diagnóstico" : canContinue ? "Piso listo" : "Completa este piso"}</strong></span>
              <button type="button" className={styles.nextButton} onClick={goNext} disabled={!canContinue}>
                {stage === 0 ? "Iniciar Fit Scan" : stage === 6 ? "Ver mi diagnóstico" : "Subir de piso"} <ArrowUpRight />
              </button>
            </nav>
          ) : null}
        </div>

        <aside className={styles.contextPanel}>
          <span className={styles.contextLive}><i /> DIAGNÓSTICO EN VIVO</span>
          <div className={styles.contextMetric}>
            <small>PROGRESO</small><strong>{progress}<span>%</span></strong>
            <i aria-hidden="true"><b style={{ height: `${Math.max(8, progress)}%` }} /></i>
          </div>
          <div className={styles.contextSignals}>
            <small>SEÑALES CAPTURADAS</small>
            <span className={answers.clinicName ? styles.contextReady : ""}><i>{answers.clinicName ? <Check /> : "01"}</i> Autoridad clínica</span>
            <span className={answers.patientCapacity ? styles.contextReady : ""}><i>{answers.patientCapacity ? <Check /> : "02"}</i> Capacidad operativa</span>
            <span className={answers.websiteStatus ? styles.contextReady : ""}><i>{answers.websiteStatus ? <Check /> : "03"}</i> Oportunidad digital</span>
            <span className={answers.timeline ? styles.contextReady : ""}><i>{answers.timeline ? <Check /> : "04"}</i> Readiness</span>
          </div>
          <p><span /> Tus datos de contacto no se guardan en esta vista previa.</p>
        </aside>
      </div>
    </main>
  );
}
