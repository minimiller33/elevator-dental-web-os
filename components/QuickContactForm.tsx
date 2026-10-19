"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import type { CountryCode } from "libphonenumber-js/min";
import { WhatsAppField } from "@/components/WhatsAppField";
import { normalizeWhatsApp } from "@/lib/phone";
import { captureLeadAttribution } from "@/lib/lead-attribution";
import "@/components/annnimate/multi-step-form.css";

const subscribePreview = () => () => {};
const localHostSnapshot = () => ["localhost", "127.0.0.1"].includes(window.location.hostname);
const demoSnapshot = () => localHostSnapshot() && new URLSearchParams(window.location.search).get("demo") === "contacto";
const serverPreviewSnapshot = () => false;
class ContactSubmissionError extends Error {}

export function QuickContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<CountryCode>("CO");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [location, setLocation] = useState("");
  const [hasWebsite, setHasWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const localHost = useSyncExternalStore(subscribePreview, localHostSnapshot, serverPreviewSnapshot);
  const demo = useSyncExternalStore(subscribePreview, demoSnapshot, serverPreviewSnapshot);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const whatsapp = normalizeWhatsApp(phone, country);
    if (!whatsapp) { setPhoneError("Revisa el número de WhatsApp y el país seleccionado."); return; }
    setError("");
    if (demo) { setSubmitted(true); return; }
    if (localHost) { setError("El envío está desactivado en esta vista local."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...captureLeadAttribution(),
          event_type: "lead_completed",
          lead_status: "manual_review",
          lead_id: crypto.randomUUID(),
          name: name.trim(), email: email.trim(), phone: whatsapp,
          city_country: location.trim(),
          has_website: hasWebsite === "yes" ? "Sí" : hasWebsite === "no" ? "No" : "",
          source: "Elevator Dental Web",
        }),
      });
      const result = response.headers.get("Content-Type")?.includes("application/json")
        ? await response.json().catch(() => null) as { ok?: boolean; error?: string } | null
        : null;
      if (!response.ok || result?.ok !== true) {
        const fallback = response.status === 404
          ? "El formulario todavía no está disponible en este sitio. Inténtalo más tarde."
          : "No pudimos confirmar el envío. Inténtalo de nuevo.";
        throw new ContactSubmissionError(typeof result?.error === "string" ? result.error : fallback);
      }
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof ContactSubmissionError ? caught.message : "No pudimos conectar con el servicio. Inténtalo de nuevo.");
    } finally { setBusy(false); }
  }

  if (submitted) return <div className="er-quick-form__result" role="status"><h3>{demo ? "Así se vería la confirmación." : "Recibimos tu solicitud."}</h3><p>{demo ? "Este es un ensayo local: no se enviaron tus datos." : "Revisaremos la información de tu clínica y te responderemos para conversar sobre el siguiente paso."}</p></div>;

  return <form className="er-quick-form" onSubmit={submit} aria-busy={busy}>
    <div><h3>Solicitar conversación</h3><p>Comparte tus datos y dónde atiendes para que podamos revisar tu caso.</p></div>
    <div className="er-quick-form__fields">
      <label className="qual-field"><span>Nombre completo</span><input name="fullName" autoComplete="name" maxLength={120} value={name} onChange={event => setName(event.currentTarget.value)} required /></label>
      <label className="qual-field"><span>Email</span><input name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.currentTarget.value)} required /></label>
      <WhatsAppField country={country} number={phone} error={phoneError} onBlur={() => { if (phone.trim() && !normalizeWhatsApp(phone, country)) setPhoneError("Revisa el número de WhatsApp y el país seleccionado."); }} onChange={(nextCountry, nextPhone) => { setCountry(nextCountry); setPhone(nextPhone); setPhoneError(""); }} />
      <label className="qual-field"><span>Ciudad y país de la clínica</span><input name="cityCountry" autoComplete="address-level2" maxLength={140} placeholder="Bogotá, Colombia" value={location} onChange={event => setLocation(event.currentTarget.value)} required /></label>
      <label className="qual-field"><span>¿Ya tienes una web? (opcional)</span><select name="hasWebsite" value={hasWebsite} onChange={event => setHasWebsite(event.currentTarget.value)}><option value="">Podemos hablarlo después</option><option value="yes">Sí, quiero mejorarla</option><option value="no">No, necesito una</option></select></label>
    </div>
    {error && <p className="er-quick-form__error" role="alert">{error}</p>}
    <div className="er-quick-form__actions"><button type="submit" disabled={busy || (localHost && !demo)}>{busy ? "Enviando…" : "Solicitar conversación →"}</button></div>
    <p className="er-quick-form__note">Usaremos tus datos para revisar y responder a tu solicitud. {localHost && (demo ? <strong>Modo demo local: este formulario no envía datos.</strong> : <strong>Envío desactivado en localhost. <a href="?demo=contacto#contacto">Activar ensayo sin envío.</a></strong>)}</p>
  </form>;
}
