"use client";

import MultiStepFormFrame from "@/components/annnimate/MultiStepFormFrame";
import JigglyButton from "@/components/annnimate/JigglyButton";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { classify } from "@/lib/lead-qualification";
import Script from "next/script";
import { postForm, revealFormElement, showInvalidField } from "@/lib/form-feedback";
import { normalizeWebsite, validContactName } from "@/lib/contact-validation";
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
  triedBefore: { ads: "Anuncios", seo: "Aparecer en Google (SEO)", social: "Redes sociales", ai: "Asistente automático de atención (IA)", website: "Web nueva", none: "Nada" },
  hasWebsite: { yes: "Sí", no: "No" },
  hasLab: { yes: "Sí", no: "No", planning: "Lo estoy planeando" },
  technology: { cadcam: "CAD/CAM", scanner: "Escáner intraoral", tomography: "Tomógrafo 3D", printer: "Impresora 3D", none: "Ninguna" },
  decisionMaker: { sole: "Sí, solo yo", shared: "Sí, con un socio", no: "No" },
  decisionMakerAttends: { yes: "Sí, estará en la llamada", no: "No" },
  timeline: { under30: "En menos de 30 días", one3: "En 1 a 3 meses", exploring: "Solo estoy explorando" },
  organicExpectation: { yes: "Sí, lo entiendo", no: "Quiero que me lo expliquen" },
};

const currencies: Record<string, number[]> = {
  USD: [500, 1500, 4000], CRC: [250000, 750000, 2000000], MXN: [10000, 30000, 80000],
  COP: [2000000, 6000000, 16000000], PEN: [2000, 6000, 16000], CLP: [500000, 1500000, 4000000],
  BRL: [2500, 7500, 20000], ARS: [500000, 1500000, 4000000], UYU: [20000, 60000, 160000],
  GTQ: [4000, 12000, 32000], HNL: [12000, 36000, 96000], NIO: [18000, 54000, 144000],
  PAB: [500, 1500, 4000], DOP: [30000, 90000, 240000], BOB: [3500, 10500, 28000], PYG: [3500000, 10500000, 28000000],
};

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


async function sendToCrm(payload: Record<string, unknown>) {
  return postForm("/api/contact", { ...captureLeadAttribution(), ...payload });
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
  const [leadId, setLeadId] = useState(() => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `edw-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("CO");
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const validatePhone = () => {
    const valid = Boolean(normalizeWhatsApp(phoneNational, phoneCountry));
    setPhoneError(valid ? "" : "Revisa el número: está incompleto o no corresponde al país seleccionado.");
    return valid;
  };
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const completedPayload = useRef<Record<string, unknown>>({});
  const [savedContact, setSavedContact] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorHeading = useRef<HTMLParagraphElement>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<"qualified" | "manual_review" | "not_qualified" | "">("");
  const [bookingUrl, setBookingUrl] = useState("");

  const [currencyOverride, setCurrencyOverride] = useState("");
  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("edw-contact-draft-v1") || "null");
      if (draft && Date.now() - draft.at < 86_400_000 && Number.isInteger(draft.step) && draft.step >= 1 && draft.step <= 5 && typeof draft.leadId === "string" && Object.entries(initialAnswers).every(([key, value]) => Array.isArray(value) ? Array.isArray(draft.answers?.[key]) && draft.answers[key].every((item: unknown) => typeof item === "string") : typeof draft.answers?.[key] === "string")) {
        // Browser-only session data must be restored after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAnswers(draft.answers); setStep(draft.step); setLeadId(draft.leadId);
        setPhoneCountry(draft.phoneCountry || "CO"); setPhoneNational(draft.phoneNational || "");
        setCurrencyOverride(draft.currencyOverride || ""); setSavedContact(draft.savedContact || ""); setDraftRestored(true);
      } else sessionStorage.removeItem("edw-contact-draft-v1");
    } catch { /* The form also works when browser storage is unavailable. */ }
    setDraftLoaded(true);
  }, []);
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      if (result) sessionStorage.removeItem("edw-contact-draft-v1");
      else sessionStorage.setItem("edw-contact-draft-v1", JSON.stringify({ at: Date.now(), step, answers, leadId, phoneCountry, phoneNational, currencyOverride, savedContact }));
    } catch { /* Storage is an optional convenience. */ }
  }, [draftLoaded, step, answers, leadId, phoneCountry, phoneNational, currencyOverride, savedContact, result]);
  useEffect(() => { if (result) revealFormElement(resultHeading.current); }, [result]);
  useEffect(() => { if (error) revealFormElement(errorHeading.current?.closest("form")?.querySelector<HTMLElement>("input:invalid, select:invalid, textarea:invalid") || errorHeading.current); }, [error]);

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
    if (busyRef.current) return;
    if (step === 1 && !validContactName(answers.fullName)) { setError("Escribe tu nombre, sin símbolos como < o >."); return; }
    if (step === 1 && !validatePhone()) {
      revealFormElement(event.currentTarget.querySelector<HTMLInputElement>("[name=whatsappNational]"));
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      if (step === 2 && answers.profile === "other") {
        await sendToCrm({ event_type: "lead_completed", lead_id: leadId, lead_status: "not_qualified", name: answers.fullName, full_name: answers.fullName, phone: answers.whatsapp, whatsapp: answers.whatsapp, email: answers.email, profile: labels.profile[answers.profile], source: "Elevator Dental Web" });
        setResult("not_qualified");
        return;
      }

      const missingByStep = step === 2
        ? !answers.profile || !answers.specialty.length || !answers.cityCountry.trim() || !answers.yearsPracticing
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

      const contactSignature = JSON.stringify([answers.fullName.trim(), answers.whatsapp, answers.email.trim().toLowerCase()]);
      if (step === 1 && contactSignature !== savedContact) {
        await sendToCrm({ event_type: "lead_started", lead_id: leadId, name: answers.fullName, full_name: answers.fullName, whatsapp: answers.whatsapp, phone: answers.whatsapp, email: answers.email, source: "Elevator Dental Web" });
        setSavedContact(contactSignature);
      }
      if (step === 4 && answers.hasWebsite === "yes" && !normalizeWebsite(answers.website)) { setError("Escribe una dirección web válida que empiece con https:// o http://, por ejemplo https://tuclinica.com."); return; }

      if (step < 5) {
        setStep((current) => current + 1);
        return;
      }

      const qualification = classify(answers);
      const finalResult = qualification.status as "qualified" | "manual_review" | "not_qualified";
      completedPayload.current = {
        event_type: "lead_completed", lead_id: leadId, lead_status: finalResult, score: qualification.points, lead_priority: qualification.priority,
        name: answers.fullName, full_name: answers.fullName, phone: answers.whatsapp, whatsapp: answers.whatsapp, email: answers.email,
        profile: labels.profile[answers.profile], specialty: answers.specialty.map((item) => labels.specialty[item]).join(", "), city_country: answers.cityCountry,
        currency, years_practicing: labels.yearsPracticing[answers.yearsPracticing], chairs: labels.chairs[answers.chairs],
        treatment_value: treatmentOptions.find(([key]) => key === answers.treatmentValue)?.[1] ?? "", patients_goal: labels.patientGoal[answers.patientGoal],
        monthly_revenue: revenueOptions.find(([key]) => key === answers.revenue)?.[1] ?? "", patient_sources: answers.patientSources.map((item) => labels.patientSources[item]).join(", "),
        previous_marketing: answers.triedBefore.map((item) => labels.triedBefore[item]).join(", "), frustration: answers.frustration,
        has_website: labels.hasWebsite[answers.hasWebsite], website: answers.hasWebsite === "yes" ? normalizeWebsite(answers.website) : "",
        in_house_lab: labels.hasLab[answers.hasLab], technology: answers.technology.map((item) => labels.technology[item]).join(", "),
        decision_maker: labels.decisionMaker[answers.decisionMaker], decision_maker_attends: labels.decisionMakerAttends[answers.decisionMakerAttends], timeline: labels.timeline[answers.timeline],
        organic_expectation: labels.organicExpectation[answers.organicExpectation], partner_attends: answers.decisionMaker === "shared" || answers.decisionMakerAttends === "yes" ? "Sí" : "No",
        currency_symbol: formatCurrency(treatmentThresholds[0], currency), source: "Elevator Dental Web",
      };
      const booking = await sendToCrm(completedPayload.current);
      setResult(finalResult);
      setBookingUrl(booking.bookingUrl ?? "");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No pudimos enviar tu información. Revisa la conexión e inténtalo de nuevo.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const statusCopy = {
    qualified: { title: "El siguiente paso es una llamada.", body: "Tu clínica puede avanzar a una conversación con el equipo de Elevator. Reserva una hora para revisar tus objetivos y los siguientes pasos." },
    manual_review: { title: "Solicitud recibida. La revisaremos contigo.", body: "El equipo revisará tus respuestas y te contactará por el email o WhatsApp que compartiste para aclarar los detalles. No necesitas compartir tu facturación para solicitar esta revisión." },
    not_qualified: { title: "Recibimos tus respuestas. Este es tu siguiente paso.", body: answers.profile === "other" ? "Este servicio está dirigido a clínicas y consultorios dentales. Si tu caso necesita una explicación, puedes pedir una revisión personal." : answers.timeline === "exploring" ? "Nos indicaste que estás explorando. Puedes revisar tus opciones con calma y pedir una revisión personal cuando quieras aclarar si el servicio encaja contigo." : ["under500", "five1500"].includes(answers.treatmentValue) ? "Según el rango de precio de tratamiento que elegiste, necesitamos revisar si este servicio encaja con tu clínica antes de ofrecerte una llamada." : "Según el rango de facturación que elegiste, necesitamos revisar el contexto de tu clínica antes de ofrecerte una llamada." },
  };

  if (result) {
    const copy = statusCopy[result];
    return (
      <div className="qual-result" role="status">
        <span className="qual-result__icon"><Check /></span>
        <small>{result === "qualified" ? "PERFIL COMPLETO" : result === "manual_review" ? "REVISIÓN PERSONAL" : "GRACIAS POR TU TIEMPO"}</small>
        <h3 ref={resultHeading} tabIndex={-1}>{copy.title}</h3>
        <p>{copy.body}</p>
        {result === "qualified" && (answers.decisionMaker === "shared" || answers.decisionMakerAttends === "yes") && <p className="qual-result__hint">Como la decisión es compartida, te recomendamos que tu socio o la persona responsable también asista a la llamada.</p>}
        {result === "qualified" && bookingUrl && <div className="qual-booking"><iframe id="ZSMvG1HV5HndrINClSTq_1791155990786" title="Agenda tu llamada con Elevator" src={bookingUrl} allow="payment" scrolling="no" /><Script src="https://api.leadconnectorhq.com/js/form_embed.js" strategy="afterInteractive" /><a href={bookingUrl} target="_blank" rel="noreferrer">Abrir la agenda en otra pestaña <ArrowUpRight /></a></div>}
        {result === "qualified" && !bookingUrl && <p className="qual-result__hint">La agenda aún no está conectada. El equipo te compartirá el enlace para reservar tu llamada.</p>}
        {result === "not_qualified" && <>
          <JigglyButton type="button" className="er-button er-button--primary" disabled={busy} aria-busy={busy} onClick={async () => {
            if (busyRef.current) return;
            busyRef.current = true; setBusy(true); setError("");
            try { await sendToCrm({ ...completedPayload.current, event_type: "lead_completed", lead_id: leadId, lead_status: "manual_review", name: answers.fullName, phone: answers.whatsapp, email: answers.email, city_country: answers.cityCountry, frustration: answers.frustration, manual_review_requested: true }); setResult("manual_review"); }
            catch (failure) { setError(failure instanceof Error ? failure.message : "Vuelve a intentarlo."); }
            finally { busyRef.current = false; setBusy(false); }
          }}>{busy ? "Enviando tu revisión…" : "Pedir revisión al equipo"}</JigglyButton>
          {answers.hasWebsite === "yes" && <a href="/diagnostico-seo">Solicitar un diagnóstico gratuito de mi web →</a>}
          <JigglyButton type="button" className="qual-back" disabled={busy} onClick={() => { setResult(""); setStep(answers.profile === "other" ? 2 : 5); setError(""); }}>Revisar mis respuestas</JigglyButton>
        </>}
        {result === "manual_review" && <p>Si necesitas añadir algo, escríbenos a <a href="mailto:support@elevatordental.com">support@elevatordental.com</a>.</p>}
        <p className="qual-privacy">Usaremos tus datos para atender esta solicitud. <a href="/privacidad" target="_blank" rel="noopener noreferrer">Cómo usamos tus datos (abre otra pestaña)</a>.</p>
        {error && <p ref={errorHeading} tabIndex={-1} className="qual-error" role="alert">{error}</p>}
        <JigglyButton type="button" className="qual-start-over" disabled={busy} onClick={() => { setResult(""); setStep(1); setAnswers(initialAnswers); setLeadId(crypto.randomUUID()); setSavedContact(""); setCurrencyOverride(""); setDraftRestored(false); setError(""); setPhoneCountry("CO"); setPhoneNational(""); setPhoneError(""); }}>Enviar otra solicitud</JigglyButton>
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
      <p className="qual-privacy">Al continuar, aceptas que el equipo de Elevator use estos datos para responder a tu solicitud por email o WhatsApp. <a href="/privacidad" target="_blank" rel="noopener noreferrer">Cómo usamos tus datos (abre otra pestaña)</a>.</p>
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
      <ChoiceGroup name="treatmentValue" legend="¿Cuánto cobras, en promedio, por un tratamiento completo como implantes, alineadores o diseño de sonrisa?" options={treatmentOptions} value={answers.treatmentValue} onChange={(value) => update("treatmentValue", value as string)} />
      <p className="qual-hint">Los rangos se muestran en {currency} y nos ayudan a entender el contexto de tus tratamientos.</p>
      <label className="qual-field qual-currency"><span>Moneda de los rangos</span><select value={currency} onChange={(event) => setCurrencyOverride(event.currentTarget.value)}><option value="USD">USD · dólar estadounidense</option><option value="CRC">CRC · colón costarricense</option><option value="MXN">MXN · peso mexicano</option><option value="COP">COP · peso colombiano</option><option value="PEN">PEN · sol peruano</option><option value="CLP">CLP · peso chileno</option><option value="BRL">BRL · real brasileño</option><option value="ARS">ARS · peso argentino</option></select></label>
      <ChoiceGroup name="patientGoal" legend="¿Cuántos pacientes nuevos para esos tratamientos te gustaría sumar al mes?" options={choice("patientGoal")} value={answers.patientGoal} onChange={(value) => update("patientGoal", value as string)} />
      <ChoiceGroup name="revenue" legend="¿Cuál es tu facturación mensual aproximada?" options={revenueOptions} value={answers.revenue} onChange={(value) => update("revenue", value as string)} />
      <p className="qual-hint">Estos datos nos ayudan a entender la capacidad y los objetivos actuales de tu clínica.</p>
    </>;
  } else if (step === 4) {
    content = <>
      <ChoiceGroup name="patientSources" legend="¿De dónde vienen hoy la mayoría de tus pacientes? (puedes elegir varias)" options={choice("patientSources")} value={answers.patientSources} onChange={(value) => update("patientSources", value as string[])} multi />
      <ChoiceGroup name="triedBefore" legend="¿Qué has probado antes para conseguir pacientes? (puedes elegir varias)" options={choice("triedBefore")} value={answers.triedBefore} onChange={(value) => update("triedBefore", value as string[])} multi />
      <label className="qual-field"><span>¿Cuál es tu mayor frustración al conseguir pacientes?</span><textarea maxLength={240} rows={3} value={answers.frustration} onChange={(event) => update("frustration", event.currentTarget.value)} placeholder="Cuéntanos en una o dos frases" required /></label>
      <ChoiceGroup name="hasWebsite" legend="¿Tienes una página web hoy?" options={choice("hasWebsite")} value={answers.hasWebsite} onChange={(value) => { update("hasWebsite", value as string); if (value === "no") update("website", ""); }} />
      {answers.hasWebsite === "yes" && <label className="qual-field"><span>¿Cuál es el enlace?</span><input name="website" inputMode="url" autoCapitalize="none" autoCorrect="off" maxLength={300} value={answers.website} onChange={(event) => update("website", event.currentTarget.value)} placeholder="https://tusitio.com" required /></label>}
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
      <ChoiceGroup name="organicExpectation" legend="Trabajamos para que más personas encuentren tu clínica en Google y otros buscadores. Las mejoras toman tiempo; no se garantizan posiciones ni pacientes. ¿Te queda claro o quieres que lo conversemos?" options={choice("organicExpectation")} value={answers.organicExpectation} onChange={(value) => update("organicExpectation", value as string)} />
    </>;
  }

  const earlyDisqualified = step === 2 && answers.profile === "other";

  return (
    <form className="lead-form qual-form mstf_form" onInvalid={event => showInvalidField(event, setError)} onSubmit={next} aria-busy={busy}>
      <MultiStepFormFrame enabled={draftLoaded} step={step} stage={stages[step - 1]} title={step === 1 ? "Empecemos por ti." : step === 2 ? "¿Quién está detrás de la clínica?" : step === 3 ? "Conozcamos el negocio." : step === 4 ? "¿Cómo consigues pacientes hoy?" : "La decisión y el momento."}>
      {error && <p ref={errorHeading} tabIndex={-1} className="qual-error" role="alert">{error}</p>}
      <div className="qual-content">{draftRestored && <p className="qual-hint" role="status">Retomamos tus respuestas guardadas en esta pestaña.</p>}{content}</div>
      {busy && <p className="qual-hint" role="status">Guardando tus respuestas…</p>}
      <div className="qual-actions">
        {step > 1 && <JigglyButton className="qual-back" type="button" disabled={busy} onClick={() => { setError(""); setStep((current) => current - 1); }}>Volver</JigglyButton>}
        <JigglyButton className="button button--light mstf_submit" type="submit" disabled={busy} aria-busy={busy} aria-label={busy ? "Guardando tus respuestas" : undefined}>{busy ? "Guardando…" : earlyDisqualified ? "Finalizar" : step === 1 ? "Guardar y continuar" : step === 5 ? "Ver mis siguientes pasos" : "Continuar"} {!busy && <ArrowUpRight />}</JigglyButton>
      </div>
      {earlyDisqualified ? <p className="qual-inline-note">Gracias por responder con honestidad. En este momento el servicio está dirigido a dueños y profesionales independientes de clínicas dentales.</p> : step === 1 ? <p className="form-note">Tus datos se guardan ahora para responderte aunque no termines. Conservamos un borrador en esta pestaña hasta enviarlo, cerrarla o durante un máximo de 24 horas.</p> : <p className="qual-hint">Tu información se comparte con el equipo de Elevator para revisar tu solicitud.</p>}
      </MultiStepFormFrame>
    </form>
  );
}
