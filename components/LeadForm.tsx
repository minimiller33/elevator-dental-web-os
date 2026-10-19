"use client";

import MultiStepFormFrame from "@/components/annnimate/MultiStepFormFrame";
import JigglyButton from "@/components/annnimate/JigglyButton";

import { FormEvent, ReactNode, useState } from "react";
import Script from "next/script";
import type { CountryCode } from "libphonenumber-js/min";
import { normalizeWhatsApp } from "@/lib/phone";
import { WhatsAppField } from "@/components/WhatsAppField";
import { captureLeadAttribution } from "@/lib/lead-attribution";
import { ArrowUpRight, Check } from "./Icons";

type LeadAnswers = {
  fullName: string;
  whatsapp: string;
  email: string;
  profile: string;
  specialty: string[];
  cityCountry: string;
  currency: string;
  yearsPracticing: string;
  chairs: string;
  treatmentValue: string;
  patientGoal: string;
  revenue: string;
  patientSources: string[];
  triedBefore: string[];
  frustration: string;
  hasWebsite: string;
  website: string;
  hasLab: string;
  technology: string[];
  decisionMaker: string;
  decisionMakerAttends: string;
  timeline: string;
  organicExpectation: string;
};

const initialAnswers: LeadAnswers = {
  fullName: "", whatsapp: "", email: "", profile: "", specialty: [], cityCountry: "", currency: "USD", yearsPracticing: "",
  chairs: "", treatmentValue: "", patientGoal: "", revenue: "", patientSources: [], triedBefore: [], frustration: "",
  hasWebsite: "", website: "", hasLab: "", technology: [], decisionMaker: "", decisionMakerAttends: "", timeline: "", organicExpectation: "",
};

const stages = ["Contacto", "Tu clínica", "El negocio", "Situación actual", "La decisión"];
const labels: Record<string, Record<string, string>> = {
  profile: { owner: "Dueño o socio de clínica dental", independent: "Dentista con consultorio propio", associate: "Dentista asociado o empleado", marketing: "Marketing o administración de clínica", other: "Otro" },
  specialty: { smile: "Diseño de sonrisa", implants: "Implantes", rehabilitation: "Rehabilitación", orthodontics: "Ortodoncia o alineadores", general: "Odontología general", other: "Otro" },
  yearsPracticing: { under1: "Menos de un año", one3: "1 a 3 años", four7: "4 a 7 años", eight15: "8 a 15 años", sixteenPlus: "Más de 15 años" },
  chairs: { one: "1", two: "2", threeFive: "3 a 5", sixPlus: "6 o más" },
  patientGoal: { one3: "1 a 3", four10: "4 a 10", over10: "Más de 10" },
  patientSources: { referrals: "Referidos", google: "Google", social: "Redes sociales", ads: "Anuncios", other: "Otro" },
  triedBefore: { ads: "Anuncios", seo: "SEO", social: "Redes sociales", ai: "Agente de IA", website: "Web nueva", none: "Nada" },
  hasWebsite: { yes: "Sí", no: "No" },
  hasLab: { yes: "Sí", no: "No", planning: "Lo estoy planeando" },
  technology: { cadcam: "CAD/CAM", scanner: "Escáner intraoral", tomography: "Tomógrafo 3D", printer: "Impresora 3D", none: "Ninguna" },
  decisionMaker: { sole: "Sí, solo yo", shared: "Sí, con un socio", no: "No" },
  decisionMakerAttends: { yes: "Sí, estará en la llamada", no: "No" },
  timeline: { under30: "En menos de 30 días", one3: "En 1 a 3 meses", exploring: "Solo estoy explorando" },
  organicExpectation: { yes: "Sí, lo entiendo", no: "No" },
};

const currencies: Record<string, number[]> = {
  USD: [500, 1500, 4000], CRC: [250000, 750000, 2000000], MXN: [10000, 30000, 80000],
  COP: [2000000, 6000000, 16000000], PEN: [2000, 6000, 16000], CLP: [500000, 1500000, 4000000],
  BRL: [2500, 7500, 20000], ARS: [500000, 1500000, 4000000], UYU: [20000, 60000, 160000],
  GTQ: [4000, 12000, 32000], HNL: [12000, 36000, 96000], NIO: [18000, 54000, 144000],
  PAB: [500, 1500, 4000], DOP: [30000, 90000, 240000], BOB: [3500, 10500, 28000], PYG: [3500000, 10500000, 28000000],
};

const servedMarkets = ["colombia", "usa", "united states", "estados unidos", "mexico"];

function currencyForLocation(value: string) {
  const location = value.toLocaleLowerCase("es");
  if (/costa rica|\bcrc\b|\bcr\b/.test(location)) return "CRC";
  if (/méxico|mexico|\bmxn\b|\bmx\b/.test(location)) return "MXN";
  if (/colombia|\bcop\b|\bco\b/.test(location)) return "COP";
  if (/perú|peru|\bpen\b/.test(location)) return "PEN";
  if (/chile|\bclp\b/.test(location)) return "CLP";
  if (/brasil|brazil|\bbrl\b/.test(location)) return "BRL";
  if (/argentina|\bars\b/.test(location)) return "ARS";
  if (/uruguay|\b uyu\b/.test(location)) return "UYU";
  if (/guatemala|\bgtq\b/.test(location)) return "GTQ";
  if (/honduras|\bhnl\b/.test(location)) return "HNL";
  if (/nicaragua|\bnio\b/.test(location)) return "NIO";
  if (/panamá|panama|\bpab\b/.test(location)) return "PAB";
  if (/república dominicana|dominican republic|\brd\b|\bdop\b/.test(location)) return "DOP";
  if (/bolivia|\bbob\b/.test(location)) return "BOB";
  if (/paraguay|\bpyg\b/.test(location)) return "PYG";
  return "USD";
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function classify(answers: LeadAnswers) {
  const declined = answers.profile === "other" || ["under500", "five1500"].includes(answers.treatmentValue) || answers.timeline === "exploring";
  if (declined) return { status: "not_qualified", points: 0, priority: "none" };

  const hasSpecialty = answers.specialty.length > 0;
  const normalizedLocation = answers.cityCountry.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const marketSupported = servedMarkets.some((market) => normalizedLocation.includes(market));
  const manualReview =
    !marketSupported ||
    (answers.decisionMaker === "no" && answers.decisionMakerAttends === "no");

  if (!["ten25", "twentyFive60", "over60"].includes(answers.revenue)) return { status: "not_qualified", points: 0, priority: "none" };

  let points = 0;
  if (hasSpecialty) points += 3;
  if (["owner", "independent", "associate", "marketing"].includes(answers.profile)) points += 2;
  if (["ten25", "twentyFive60", "over60"].includes(answers.revenue)) points += 2;
  if (["fifteen4k", "over4k"].includes(answers.treatmentValue)) points += 2;
  if (["one3", "four10", "over10"].includes(answers.patientGoal)) points += 1;
  if (answers.chairs) points += 1;
  if (answers.hasLab === "yes") points += 1;
  points += ["cadcam", "scanner", "tomography", "printer"].filter((technology) => answers.technology.includes(technology)).length;
  if (answers.decisionMaker === "sole") points += 2;
  if (answers.decisionMaker === "shared") points += 1;

  if (answers.timeline === "under30") points += 10;
  if (answers.timeline === "one3") points += 3;

  return { status: manualReview ? "manual_review" : "qualified", points, priority: answers.timeline === "under30" ? "high" : "normal" };
}

async function sendToCrm(payload: Record<string, unknown>) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...captureLeadAttribution(), ...payload }),
  });
  const result = await response.json() as { ok?: boolean; bookingUrl?: string; error?: string };
  if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo guardar la información. Revisa la conexión e inténtalo de nuevo.");
  return result;
}

function ChoiceGroup({
  name, legend, options, value, onChange, multi = false,
}: {
  name: keyof LeadAnswers;
  legend: string;
  options: [string, string][];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
}) {
  if (!multi) return <label className="qual-field qual-field--question"><span>{legend}</span><select name={name} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.currentTarget.value)} required><option value="" disabled>Elige una opción</option>{options.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>;
  const selected = Array.isArray(value) ? value : [value];
  return (
    <fieldset className="qual-group">
      <legend>{legend}</legend>
      <div className={multi ? "qual-options qual-options--multi" : "qual-options"}>
        {options.map(([id, label]) => (
          <label className={selected.includes(id) ? "qual-option is-selected" : "qual-option"} key={id}>
            <input
              type={multi ? "checkbox" : "radio"}
              name={name}
              value={id}
              checked={selected.includes(id)}
              onChange={() => {
                if (!multi) return onChange(id);
                const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
                onChange(id === "none" && !selected.includes(id) ? [id] : next.filter((item) => item !== "none" || item === id));
              }}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LeadForm() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<LeadAnswers>(initialAnswers);
  const [leadId] = useState(() => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `edw-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("CO");
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const validatePhone = () => {
    const valid = Boolean(normalizeWhatsApp(phoneNational, phoneCountry));
    setPhoneError(valid ? "" : "Revisa el número: está incompleto o no corresponde al país seleccionado.");
    return valid;
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<"qualified" | "manual_review" | "not_qualified" | "">("");
  const [bookingUrl, setBookingUrl] = useState("");

  const [currencyOverride, setCurrencyOverride] = useState("");
  const currency = currencyOverride || currencyForLocation(answers.cityCountry);
  const treatmentThresholds = currencies[currency] ?? currencies.USD;
  const revenueThresholds = [10, 20, 50, 120].map((factor) => treatmentThresholds[0] * factor);
  const treatmentOptions: [string, string][] = [
    ["under500", `Menos de ${formatCurrency(treatmentThresholds[0], currency)}`], ["five1500", `${formatCurrency(treatmentThresholds[0], currency)} a menos de ${formatCurrency(treatmentThresholds[1], currency)}`],
    ["fifteen4k", `${formatCurrency(treatmentThresholds[1], currency)} a ${formatCurrency(treatmentThresholds[2], currency)}`], ["over4k", `Más de ${formatCurrency(treatmentThresholds[2], currency)}`],
  ];
  const revenueOptions: [string, string][] = [
    ["under5", `Menos de ${formatCurrency(revenueThresholds[0], currency)}`], ["five10", `${formatCurrency(revenueThresholds[0], currency)} a menos de ${formatCurrency(revenueThresholds[1], currency)}`],
    ["ten25", `${formatCurrency(revenueThresholds[1], currency)} a ${formatCurrency(revenueThresholds[2], currency)}`], ["twentyFive60", `${formatCurrency(revenueThresholds[2], currency)} a ${formatCurrency(revenueThresholds[3], currency)}`],
    ["over60", `Más de ${formatCurrency(revenueThresholds[3], currency)}`], ["private", "Prefiero no decir"],
  ];
  const update = <K extends keyof LeadAnswers>(key: K, value: LeadAnswers[K]) => setAnswers((current) => ({ ...current, [key]: value }));
  const choice = (key: keyof typeof labels): [string, string][] => Object.entries(labels[key]);

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (step === 1 && !validatePhone()) {
      event.currentTarget.querySelector<HTMLInputElement>("[name=whatsappNational]")?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (step === 2 && answers.profile === "other") {
        await sendToCrm({ event_type: "lead_completed", lead_id: leadId, lead_status: "not_qualified", name: answers.fullName, full_name: answers.fullName, phone: answers.whatsapp, whatsapp: answers.whatsapp, email: answers.email, profile: labels.profile[answers.profile], source: "Elevator Dental Web" });
        setResult("not_qualified");
        return;
      }

      const missingByStep = step === 2
        ? !answers.profile || !answers.specialty.length || !answers.cityCountry || !answers.yearsPracticing
        : step === 3
          ? !answers.chairs || !answers.treatmentValue || !answers.patientGoal || !answers.revenue
          : step === 4
            ? !answers.patientSources.length || !answers.triedBefore.length || !answers.frustration.trim() || !answers.hasWebsite || (answers.hasWebsite === "yes" && !answers.website)
            : step === 5
              ? !answers.hasLab || !answers.technology.length || !answers.decisionMaker || (answers.decisionMaker === "no" && !answers.decisionMakerAttends) || !answers.timeline || !answers.organicExpectation
              : false;
      if (missingByStep) {
        setError("Completa las respuestas de este paso para continuar.");
        return;
      }

      if (step === 1) {
        await sendToCrm({ event_type: "lead_started", lead_id: leadId, name: answers.fullName, full_name: answers.fullName, whatsapp: answers.whatsapp, phone: answers.whatsapp, email: answers.email, source: "Elevator Dental Web" });
      }

      if (step < 5) {
        setStep((current) => current + 1);
        return;
      }

      const qualification = classify(answers);
      const finalResult = qualification.status as "qualified" | "manual_review" | "not_qualified";
      const booking = await sendToCrm({
        event_type: "lead_completed", lead_id: leadId, lead_status: finalResult, score: qualification.points, lead_priority: qualification.priority,
        name: answers.fullName, full_name: answers.fullName, phone: answers.whatsapp, whatsapp: answers.whatsapp, email: answers.email,
        profile: labels.profile[answers.profile], specialty: answers.specialty.map((item) => labels.specialty[item]).join(", "), city_country: answers.cityCountry,
        currency, years_practicing: labels.yearsPracticing[answers.yearsPracticing], chairs: labels.chairs[answers.chairs],
        treatment_value: treatmentOptions.find(([key]) => key === answers.treatmentValue)?.[1] ?? "", patients_goal: labels.patientGoal[answers.patientGoal],
        monthly_revenue: revenueOptions.find(([key]) => key === answers.revenue)?.[1] ?? "", patient_sources: answers.patientSources.map((item) => labels.patientSources[item]).join(", "),
        previous_marketing: answers.triedBefore.map((item) => labels.triedBefore[item]).join(", "), frustration: answers.frustration,
        has_website: labels.hasWebsite[answers.hasWebsite], website: answers.website,
        in_house_lab: labels.hasLab[answers.hasLab], technology: answers.technology.map((item) => labels.technology[item]).join(", "),
        decision_maker: labels.decisionMaker[answers.decisionMaker], decision_maker_attends: labels.decisionMakerAttends[answers.decisionMakerAttends], timeline: labels.timeline[answers.timeline],
        organic_expectation: labels.organicExpectation[answers.organicExpectation], partner_attends: answers.decisionMaker === "shared" || answers.decisionMakerAttends === "yes" ? "Sí" : "No",
        currency_symbol: formatCurrency(treatmentThresholds[0], currency), source: "Elevator Dental Web",
      });
      setResult(finalResult);
      setBookingUrl(booking.bookingUrl ?? "");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No pudimos enviar tu información. Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const statusCopy = {
    qualified: { title: "El siguiente paso es una llamada.", body: "Tu clínica puede avanzar a una conversación con el equipo de Elevator. Reserva una hora para revisar tus objetivos y los siguientes pasos." },
    manual_review: { title: "Queremos revisar algunos detalles contigo.", body: "Recibimos tu información. El equipo de Elevator la revisará antes de recomendarte el mejor siguiente paso." },
    not_qualified: { title: "Gracias por contarnos sobre tu clínica.", body: "Por ahora, Elevator Web quizá no sea el paso más adecuado. Guardamos tus datos para compartirte recursos que puedan servirte." },
  };

  if (result) {
    const copy = statusCopy[result];
    return (
      <div className="qual-result" role="status">
        <span className="qual-result__icon"><Check /></span>
        <small>{result === "qualified" ? "PERFIL COMPLETO" : result === "manual_review" ? "REVISIÓN PERSONAL" : "GRACIAS POR TU TIEMPO"}</small>
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
        {result === "qualified" && (answers.decisionMaker === "shared" || answers.decisionMakerAttends === "yes") && <p className="qual-result__hint">Como la decisión es compartida, te recomendamos que tu socio o la persona responsable también asista a la llamada.</p>}
        {result === "qualified" && bookingUrl && <div className="qual-booking"><iframe id="ZSMvG1HV5HndrINClSTq_1791155990786" title="Agenda tu llamada con Elevator" src={bookingUrl} allow="payment" scrolling="no" /><Script src="https://api.leadconnectorhq.com/js/form_embed.js" strategy="afterInteractive" /><a href={bookingUrl} target="_blank" rel="noreferrer">Abrir la agenda en otra pestaña <ArrowUpRight /></a></div>}
        {result === "qualified" && !bookingUrl && <p className="qual-result__hint">La agenda aún no está conectada. El equipo te compartirá el enlace para reservar tu llamada.</p>}
        <JigglyButton type="button" className="qual-start-over" onClick={() => { setResult(""); setStep(1); setAnswers(initialAnswers); setPhoneCountry("CO"); setPhoneNational(""); setPhoneError(""); }}>Volver al inicio</JigglyButton>
      </div>
    );
  }

  let content: ReactNode;
  if (step === 1) {
    content = <>
      <p className="qual-intro">Primero guardaremos tus datos de contacto para poder responderte.</p>
      <div className="qual-fields">
        <label className="qual-field qual-field--floating"><input autoComplete="name" name="fullName" maxLength={120} value={answers.fullName} onChange={(event) => update("fullName", event.currentTarget.value)} placeholder=" " required /><span>Nombre completo</span></label>
        <WhatsAppField country={phoneCountry} number={phoneNational} error={phoneError} onBlur={() => { if (phoneNational.trim()) validatePhone(); }} onChange={(country, number, international) => { setPhoneCountry(country); setPhoneNational(number); update("whatsapp", international); setPhoneError(""); setError(""); }} />
        <label className="qual-field qual-field--floating"><input autoComplete="email" type="email" name="email" maxLength={254} value={answers.email} onChange={(event) => update("email", event.currentTarget.value)} placeholder=" " required /><span>Email</span></label>
      </div>
      <p className="qual-privacy">Al continuar, aceptas que el equipo de Elevator use estos datos para responder a tu solicitud.</p>
    </>;
  } else if (step === 2) {
    content = <>
      <ChoiceGroup name="profile" legend="¿Cuál describe mejor tu situación?" options={choice("profile")} value={answers.profile} onChange={(value) => update("profile", value as string)} />
      {answers.profile === "other" ? <p className="qual-inline-note">Gracias por aclararlo. Elevator Web está pensada para clínicas y profesionales que dirigen su propio consultorio.</p> : <>
        <ChoiceGroup name="specialty" legend="¿A qué te dedicas principalmente? (puedes elegir varias)" options={choice("specialty")} value={answers.specialty} onChange={(value) => update("specialty", value as string[])} multi />
        <label className="qual-field"><span>¿En qué ciudad y país está tu clínica?</span><input autoComplete="address-level2" maxLength={140} value={answers.cityCountry} onChange={(event) => update("cityCountry", event.currentTarget.value)} placeholder="Bogotá, Colombia" required /></label>
        <label className="qual-field"><span>¿Cuántos años llevas ejerciendo?</span><select value={answers.yearsPracticing} onChange={(event) => update("yearsPracticing", event.currentTarget.value)} required><option value="">Elige una opción</option>{choice("yearsPracticing").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </>}
    </>;
  } else if (step === 3) {
    content = <>
      <ChoiceGroup name="chairs" legend="¿Cuántos sillones o consultorios tienes?" options={choice("chairs")} value={answers.chairs} onChange={(value) => update("chairs", value as string)} />
      <ChoiceGroup name="treatmentValue" legend="¿Cuál es el valor promedio de un tratamiento de alto valor?" options={treatmentOptions} value={answers.treatmentValue} onChange={(value) => update("treatmentValue", value as string)} />
      <p className="qual-hint">Los rangos se muestran en {currency} y nos ayudan a entender el contexto de tus tratamientos.</p>
      <label className="qual-field qual-currency"><span>Moneda de los rangos</span><select value={currency} onChange={(event) => setCurrencyOverride(event.currentTarget.value)}><option value="USD">USD · dólar estadounidense</option><option value="CRC">CRC · colón costarricense</option><option value="MXN">MXN · peso mexicano</option><option value="COP">COP · peso colombiano</option><option value="PEN">PEN · sol peruano</option><option value="CLP">CLP · peso chileno</option><option value="BRL">BRL · real brasileño</option><option value="ARS">ARS · peso argentino</option></select></label>
      <ChoiceGroup name="patientGoal" legend="¿Cuántos pacientes nuevos de alto valor te gustaría sumar al mes?" options={choice("patientGoal")} value={answers.patientGoal} onChange={(value) => update("patientGoal", value as string)} />
      <ChoiceGroup name="revenue" legend="¿Cuál es tu facturación mensual aproximada?" options={revenueOptions} value={answers.revenue} onChange={(value) => update("revenue", value as string)} />
      <p className="qual-hint">Estos datos nos ayudan a entender la capacidad y los objetivos actuales de tu clínica.</p>
    </>;
  } else if (step === 4) {
    content = <>
      <ChoiceGroup name="patientSources" legend="¿De dónde vienen hoy la mayoría de tus pacientes? (puedes elegir varias)" options={choice("patientSources")} value={answers.patientSources} onChange={(value) => update("patientSources", value as string[])} multi />
      <ChoiceGroup name="triedBefore" legend="¿Qué has probado antes para conseguir pacientes? (puedes elegir varias)" options={choice("triedBefore")} value={answers.triedBefore} onChange={(value) => update("triedBefore", value as string[])} multi />
      <label className="qual-field"><span>¿Cuál es tu mayor frustración al conseguir pacientes?</span><textarea maxLength={240} rows={3} value={answers.frustration} onChange={(event) => update("frustration", event.currentTarget.value)} placeholder="Cuéntanos en una o dos frases" required /></label>
      <ChoiceGroup name="hasWebsite" legend="¿Tienes una página web hoy?" options={choice("hasWebsite")} value={answers.hasWebsite} onChange={(value) => { update("hasWebsite", value as string); if (value === "no") update("website", ""); }} />
      {answers.hasWebsite === "yes" && <label className="qual-field"><span>¿Cuál es el enlace?</span><input type="url" maxLength={300} value={answers.website} onChange={(event) => update("website", event.currentTarget.value)} placeholder="https://tusitio.com" required /></label>}
    </>;
  } else {
    content = <>
      <div className="qual-investment"><small>ALCANCE E INVERSIÓN</small><strong>Lo conversamos en la llamada</strong><span>Te explicaremos las etapas y la operación de la web para tu clínica.</span></div>
      <ChoiceGroup name="hasLab" legend="¿Tu clínica cuenta con laboratorio interno?" options={choice("hasLab")} value={answers.hasLab} onChange={(value) => update("hasLab", value as string)} />
      <ChoiceGroup name="technology" legend="¿Con qué tecnología cuentas hoy? (puedes elegir varias)" options={choice("technology")} value={answers.technology} onChange={(value) => update("technology", value as string[])} multi />
      <ChoiceGroup name="decisionMaker" legend="¿Eres la persona que decide la inversión?" options={choice("decisionMaker")} value={answers.decisionMaker} onChange={(value) => update("decisionMaker", value as string)} />
      {answers.decisionMaker === "no" && <ChoiceGroup name="decisionMakerAttends" legend="¿La persona que decide podrá asistir a la llamada?" options={choice("decisionMakerAttends")} value={answers.decisionMakerAttends} onChange={(value) => update("decisionMakerAttends", value as string)} />}
      {answers.decisionMaker === "shared" && <p className="qual-inline-note">Invita a tu socio para que también pueda participar en la llamada.</p>}
      <ChoiceGroup name="timeline" legend="¿Cuándo quieres empezar?" options={choice("timeline")} value={answers.timeline} onChange={(value) => update("timeline", value as string)} />
      <ChoiceGroup name="organicExpectation" legend="Una Elevator Dental Web atrae tráfico orgánico de posibles pacientes para tu clínica o consultorio. Sin embargo, toma tiempo en consolidarse y aprender a conseguir nuevo tráfico calificado. Los resultados no son inmediatos, pero es tu mejor opción para escalar en la nueva era digital sin depender de anuncios. ¿Lo entiendes?" options={choice("organicExpectation")} value={answers.organicExpectation} onChange={(value) => update("organicExpectation", value as string)} />
    </>;
  }

  const earlyDisqualified = step === 2 && answers.profile === "other";

  return (
    <form className="lead-form qual-form mstf_form" onSubmit={next} aria-busy={busy}>
      <MultiStepFormFrame step={step} stage={stages[step - 1]} title={step === 1 ? "Empecemos por ti." : step === 2 ? "¿Quién está detrás de la clínica?" : step === 3 ? "Conozcamos el negocio." : step === 4 ? "¿Cómo consigues pacientes hoy?" : "La decisión y el momento."}>
      <div className="qual-content">{content}</div>
      {error && <p className="qual-error" role="alert">{error}</p>}
      <div className="qual-actions">
        {step > 1 && <JigglyButton className="qual-back" type="button" disabled={busy} onClick={() => { setError(""); setStep((current) => current - 1); }}>Volver</JigglyButton>}
        <JigglyButton className="button button--light mstf_submit" type="submit" disabled={busy} aria-busy={busy} aria-label={busy ? "Guardando tus respuestas" : undefined}>{busy ? "Guardando…" : earlyDisqualified ? "Finalizar" : step === 1 ? "Guardar y continuar" : step === 5 ? "Ver mis siguientes pasos" : "Continuar"} {!busy && <ArrowUpRight />}</JigglyButton>
      </div>
      {earlyDisqualified ? <p className="qual-inline-note">Gracias por responder con honestidad. En este momento el servicio está dirigido a dueños y profesionales independientes de clínicas dentales.</p> : step === 1 ? <p className="form-note">Tus datos se guardan ahora para que podamos responderte aunque dejes el cuestionario a medias.</p> : <p className="qual-hint">Tu información se comparte con el equipo de Elevator para revisar tu solicitud.</p>}
      </MultiStepFormFrame>
    </form>
  );
}
