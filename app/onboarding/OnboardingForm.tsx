"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./onboarding.module.css";

const services = ["Implantes", "All-on-X", "Carillas", "Alineadores", "Ortodoncia", "Rehabilitación", "Odontología general", "Otro"];
const stepNames = ["Tu clínica", "Tus pacientes", "Materiales y salida"];

type Brief = {
  contactName: string;
  contactEmail: string;
  role: string;
  clinicName: string;
  country: string;
  city: string;
  locations: string;
  mainAddress: string;
  otherAddresses: string;
  currentWebsite: string;
  priorityServices: string[];
  idealPatient: string;
  differentiator: string;
  mainPhone: string;
  whatsapp: string;
  bookingLink: string;
  businessHours: string;
  teamCredentials: string;
  assetFolder: string;
  domainStatus: string;
  googleProfile: string;
  contactConsent: boolean;
};

const emptyBrief: Brief = {
  contactName: "", contactEmail: "", role: "", clinicName: "", country: "", city: "", locations: "one", mainAddress: "", otherAddresses: "", currentWebsite: "",
  priorityServices: [], idealPatient: "", differentiator: "", mainPhone: "", whatsapp: "", bookingLink: "",
  businessHours: "", teamCredentials: "", assetFolder: "", domainStatus: "", googleProfile: "", contactConsent: false,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className={styles.field}><span className={styles.label}>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const progress = useMemo(() => Math.round(((step + 1) / stepNames.length) * 100), [step]);

  function update<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggleService(service: string) {
    setBrief((current) => {
      const selected = current.priorityServices.includes(service);
      if (!selected && current.priorityServices.length >= 3) return current;
      return { ...current, priorityServices: selected ? current.priorityServices.filter((item) => item !== service) : [...current.priorityServices, service] };
    });
    setError("");
  }

  function canContinue() {
    if (step === 0) return Boolean(brief.contactName.trim() && /^\S+@\S+\.\S+$/.test(brief.contactEmail) && brief.role && brief.clinicName.trim() && brief.country.trim() && brief.city.trim() && brief.mainAddress.trim());
    if (step === 1) return Boolean(brief.priorityServices.length && brief.idealPatient.trim() && brief.differentiator.trim());
    return Boolean(brief.mainPhone.trim() && brief.whatsapp.trim() && brief.businessHours.trim() && brief.domainStatus && brief.contactConsent);
  }

  function next() {
    if (!canContinue()) {
      setError(step === 2 ? "Completa los datos de contacto y confirma el permiso para usar esta información." : "Completa los campos obligatorios para continuar.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, stepNames.length - 1));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue()) {
      setError("Completa los datos de contacto y confirma el permiso para usar esta información.");
      return;
    }
    setSubmitted(true);
  }

  function downloadBrief() {
    const file = new Blob([JSON.stringify({ ...brief, submittedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `elevator-brief-${brief.clinicName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") || "clinica"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>✓</span>
        <p className={styles.eyebrow}>BRIEF LISTO PARA REVISIÓN</p>
        <h2>Ya tenemos el mapa inicial de <span>{brief.clinicName}.</span></h2>
        <p>En la versión local, los datos no se envían al equipo. Descarga una copia para revisar el contenido del brief.</p>
        <button className={styles.primaryButton} type="button" onClick={downloadBrief}>Descargar brief <span>↧</span></button>
        <button className={styles.resetButton} type="button" onClick={() => { setBrief(emptyBrief); setStep(0); setSubmitted(false); }}>Completar otro brief</button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.progressHeader}><span>{String(step + 1).padStart(2, "0")} <i>/ 03</i> · {stepNames[step]}</span><span>{progress}%</span></div>
      <div className={styles.progressTrack} role="progressbar" aria-label="Progreso del brief" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div>
      <div className={styles.stepLabels}>{stepNames.map((name, index) => <span key={name} className={index === step ? styles.activeStep : index < step ? styles.doneStep : ""}>{name}</span>)}</div>

      {step === 0 ? <div className={styles.stepBody}>
        <h2>Primero, <span>la clínica.</span></h2>
        <p>¿Con quién coordinaremos y qué información debe encontrar un paciente?</p>
        <div className={styles.fieldGrid}>
          <Field label="Tu nombre *"><input autoComplete="name" value={brief.contactName} onChange={(event) => update("contactName", event.currentTarget.value)} placeholder="Nombre y apellido" required /></Field>
          <Field label="Email de contacto *"><input type="email" autoComplete="email" value={brief.contactEmail} onChange={(event) => update("contactEmail", event.currentTarget.value)} placeholder="nombre@clinica.com" required /></Field>
          <Field label="Tu rol *"><select value={brief.role} onChange={(event) => update("role", event.currentTarget.value)} required><option value="">Selecciona</option><option>Propietario/a</option><option>Socio/a</option><option>Dirección clínica</option><option>Marketing</option><option>Coordinación</option><option>Otro</option></select></Field>
          <Field label="Nombre público de la clínica *"><input autoComplete="organization" value={brief.clinicName} onChange={(event) => update("clinicName", event.currentTarget.value)} placeholder="Como debe aparecer en la web" required /></Field>
          <Field label="País *"><input autoComplete="country-name" value={brief.country} onChange={(event) => update("country", event.currentTarget.value)} placeholder="México" required /></Field>
          <Field label="Ciudad principal *"><input autoComplete="address-level2" value={brief.city} onChange={(event) => update("city", event.currentTarget.value)} placeholder="Guadalajara" required /></Field>
          <Field label="Número de sedes"><select value={brief.locations} onChange={(event) => update("locations", event.currentTarget.value)}><option value="one">Una sede</option><option value="two-three">2–3 sedes</option><option value="four-plus">4 o más sedes</option></select></Field>
          <Field label="Dirección pública de la sede principal *" hint="La dirección que los pacientes deben encontrar en Google."><input autoComplete="street-address" value={brief.mainAddress} onChange={(event) => update("mainAddress", event.currentTarget.value)} placeholder="Calle, número, colonia o barrio, código postal" required /></Field>
          <Field label="Otras sedes" hint="Si aplica, indica ciudad y dirección de cada una."><textarea rows={2} value={brief.otherAddresses} onChange={(event) => update("otherAddresses", event.currentTarget.value)} placeholder="Sede 2 — ciudad y dirección…" /></Field>
          <Field label="Web actual (si existe)" hint="Pega el enlace completo, por ejemplo https://…"><input type="url" value={brief.currentWebsite} onChange={(event) => update("currentWebsite", event.currentTarget.value)} placeholder="https://" /></Field>
        </div>
      </div> : null}

      {step === 1 ? <div className={styles.stepBody}>
        <h2>¿A quién quieres <span>ayudar?</span></h2>
        <p>Priorizamos el contenido para las personas y tratamientos más importantes para tu clínica.</p>
        <fieldset className={styles.serviceFieldset}><legend>¿Qué tratamientos quieres destacar? * <small>Elige hasta 3</small></legend><div className={styles.serviceGrid}>{services.map((service) => <label className={`${styles.serviceChoice} ${brief.priorityServices.includes(service) ? styles.selectedChoice : ""}`} key={service}><input type="checkbox" checked={brief.priorityServices.includes(service)} onChange={() => toggleService(service)} /><span>{brief.priorityServices.includes(service) ? "✓" : "+"}</span>{service}</label>)}</div></fieldset>
        <Field label="¿Qué tipo de paciente quieres atraer? *" hint="Por ejemplo: personas que buscan recuperar piezas dentales o familias de la zona."><textarea rows={3} value={brief.idealPatient} onChange={(event) => update("idealPatient", event.currentTarget.value)} placeholder="Descríbenos a quién atiendes mejor…" required /></Field>
        <Field label="¿Qué hace diferente a tu clínica? *" hint="Experiencia, tecnología, enfoque de atención, equipo o trayectoria."><textarea rows={3} value={brief.differentiator} onChange={(event) => update("differentiator", event.currentTarget.value)} placeholder="¿Qué debería recordar un paciente después de conocerlos?" required /></Field>
      </div> : null}

      {step === 2 ? <div className={styles.stepBody}>
        <h2>Contenido y <span>salida.</span></h2>
        <p>Reunimos cómo contactarte, cuándo atienden y qué materiales ya tienen listos.</p>
        <div className={styles.fieldGrid}>
          <Field label="Teléfono principal *"><input type="tel" autoComplete="tel" value={brief.mainPhone} onChange={(event) => update("mainPhone", event.currentTarget.value)} placeholder="+52 …" required /></Field>
          <Field label="WhatsApp para pacientes *"><input type="tel" value={brief.whatsapp} onChange={(event) => update("whatsapp", event.currentTarget.value)} placeholder="+52 …" required /></Field>
          <Field label="Enlace para reservar cita" hint="Si usan un calendario o sistema de reservas."><input type="url" value={brief.bookingLink} onChange={(event) => update("bookingLink", event.currentTarget.value)} placeholder="https://" /></Field>
          <Field label="Perfil de Google Maps" hint="Pega el enlace público de la ficha de tu clínica."><input type="url" value={brief.googleProfile} onChange={(event) => update("googleProfile", event.currentTarget.value)} placeholder="https://maps.app.goo.gl/…" /></Field>
          <Field label="Horario de atención *"><textarea rows={3} value={brief.businessHours} onChange={(event) => update("businessHours", event.currentTarget.value)} placeholder="Lun–Vie 9:00–18:00; sábados 9:00–13:00" required /></Field>
          <Field label="Equipo y credenciales" hint="Nombres de doctores, especialidades y certificaciones que podemos publicar."><textarea rows={3} value={brief.teamCredentials} onChange={(event) => update("teamCredentials", event.currentTarget.value)} placeholder="Dra. …, especialista en …" /></Field>
          <Field label="Carpeta de marca y fotografías" hint="Comparte un enlace a Drive, Dropbox u otra carpeta accesible."><input type="url" value={brief.assetFolder} onChange={(event) => update("assetFolder", event.currentTarget.value)} placeholder="https://" /></Field>
          <Field label="Dominio de la clínica *"><select value={brief.domainStatus} onChange={(event) => update("domainStatus", event.currentTarget.value)} required><option value="">Selecciona</option><option value="owned">Tenemos dominio y acceso</option><option value="owned-no-access">Tenemos dominio, sin acceso todavía</option><option value="none">Aún no tenemos dominio</option><option value="unknown">No estoy seguro/a</option></select></Field>
        </div>
        <div className={styles.securityNote}><span>↗</span><p><strong>Nunca compartas contraseñas aquí.</strong> Si necesitamos acceso a un servicio, te indicaremos cómo invitarnos de forma segura.</p></div>
        <label className={styles.consent}><input type="checkbox" checked={brief.contactConsent} onChange={(event) => update("contactConsent", event.currentTarget.checked)} /><span>Confirmo que puedo compartir esta información y autorizo que se use para preparar el contenido de la web de mi clínica. *</span></label>
      </div> : null}

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.actions}>
        <button className={styles.backButton} type="button" onClick={() => { setStep((current) => Math.max(0, current - 1)); setError(""); }} disabled={step === 0}>← Atrás</button>
        {step < stepNames.length - 1 ? <button className={styles.primaryButton} type="button" onClick={next}>Continuar <span>→</span></button> : <button className={styles.primaryButton} type="submit">Revisar mi brief <span>↗</span></button>}
      </div>
      <p className={styles.requiredNote}>* Campos necesarios para preparar la primera versión de tu web.</p>
    </form>
  );
}
