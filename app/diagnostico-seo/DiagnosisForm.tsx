"use client";

import Link from "next/link";
import JigglyButton from "@/components/annnimate/JigglyButton";
import MultiStepFormFrame from "@/components/annnimate/MultiStepFormFrame";
import { ArrowUpRight } from "lucide-react";
import "@/app/contact-spotlight.css";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./diagnosis.module.css";

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global { interface Window { turnstile?: Turnstile } }

export function DiagnosisForm() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "" });
  const [clinic, setClinic] = useState({ clinic: "", website: "", country: "", city: "", consent: false, marketingConsent: false });
  const [ready, setReady] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  useEffect(() => {
    let alive = true;
    const script = document.createElement("script");
    async function setup() {
      try {
        const response = await fetch("/api/seo-config");
        if (!response.ok) throw new Error("unavailable");
        const config = await response.json() as { ready: boolean; siteKey: string };
        if (!alive) return;
        setReady(config.ready);
        if (!config.ready || step !== 2 || email) return;
        const render = () => {
          if (!alive || !widget.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(widget.current, {
            sitekey: config.siteKey, action: "seo_diagnosis", theme: "light",
            size: widget.current.clientWidth < 300 ? "compact" : "flexible",
            callback: (value: string) => setToken(value),
            "expired-callback": () => setToken(""),
            "error-callback": () => { setToken(""); setError("No pudimos cargar la verificación. Recarga la página."); },
          });
        };
        if (window.turnstile) render();
        else {
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          script.async = true; script.onload = render;
          script.onerror = () => { if (alive) setError("No pudimos cargar la verificación. Recarga la página."); };
          document.head.appendChild(script);
        }
      } catch { if (alive) setReady(false); }
    }
    void setup();
    return () => { alive = false; if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); script.remove(); };
  }, [step, email]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) { setError(""); setStep(2); return; }
    if (sending || !ready || !token) return;
    const form = new FormData(event.currentTarget);
    if (!String(form.get("country") || "").trim() && !String(form.get("city") || "").trim()) {
      setError("Completa el país o la ciudad de tu clínica.");
      return;
    }
    setSending(true); setError("");
    try {
      const response = await fetch("/api/seo-diagnosis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, ...Object.fromEntries(form), consent: form.get("consent") === "on", marketingConsent: form.get("marketingConsent") === "on", turnstileToken: token }),
        signal: AbortSignal.timeout(25_000),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "No pudimos registrar tu solicitud. Inténtalo de nuevo.");
      setEmail(contact.email);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No pudimos enviar la solicitud."); }
    finally { setSending(false); setToken(""); if (widgetId.current) window.turnstile?.reset(widgetId.current); }
  }

  return <main className={styles.page}>
    <div className={`${styles.spotlight} er-contact--spotlight`}>
      <section className={`${styles.spotlightIntro} er-contact__intro`}>
        <p className="er-label">Diagnóstico gratuito · Clínicas dentales</p>
        <h1>¿Qué tan clara es<br />la web de tu clínica?</h1>
        <p>Revisamos cómo carga una página de tu web y qué información pueden identificar los buscadores y asistentes de IA. Recibe evidencia y acciones concretas por email.</p>
        <span>Analizamos una sola página e incluimos hasta tres prioridades. No mide posiciones, tráfico, Google Maps ni si una IA recomienda tu clínica.</span>
        <small>Gratis · Sin tarjeta ni cuenta</small>
        <div className="er-contact__visual" aria-hidden="true"><ArrowUpRight size={72} strokeWidth={1.15} /></div>
      </section>
      <section id="solicitar-diagnostico" className="er-contact__form edw-form" aria-label="Solicitar diagnóstico">
        {email ? <div className={styles.success} role="status"><p className={styles.eyebrow}>Solicitud recibida</p><h2>Tu web está en la cola.</h2><p>Prepararemos el diagnóstico y lo enviaremos a <strong>{email}</strong> cuando esté listo.</p><p>Revisa también la carpeta de spam. Algunas webs pueden requerir una revisión adicional.</p><Link href="/">Volver a Elevator →</Link></div> :
          <form className="mstf_form" onSubmit={submit}>
            <MultiStepFormFrame step={step} totalSteps={2} stage={step === 1 ? "Contacto" : "Tu clínica"} title={step === 1 ? "Empecemos por ti." : "Ahora, tu clínica."}>
              <p className="qual-intro">{step === 1 ? "Cuéntanos a quién enviaremos el diagnóstico de tu web." : "Comparte la página que quieres revisar y dónde atiendes."}</p>
              {step === 1 ? <div className="qual-fields">
                <label className="qual-field qual-field--floating"><input name="firstName" autoComplete="given-name" maxLength={80} placeholder=" " required value={contact.firstName} onChange={event => setContact({ ...contact, firstName: event.currentTarget.value })} /><span>Nombre</span></label>
                <label className="qual-field qual-field--floating"><input name="lastName" autoComplete="family-name" maxLength={100} placeholder=" " required value={contact.lastName} onChange={event => setContact({ ...contact, lastName: event.currentTarget.value })} /><span>Apellido</span></label>
                <label className="qual-field qual-field--floating"><input name="email" type="email" autoComplete="email" maxLength={254} placeholder=" " required value={contact.email} onChange={event => setContact({ ...contact, email: event.currentTarget.value })} /><span>Email</span></label>
              </div> : <>
                <label className="qual-field qual-field--floating"><input name="clinic" autoComplete="organization" maxLength={160} placeholder=" " required value={clinic.clinic} onChange={event => setClinic({ ...clinic, clinic: event.currentTarget.value })} /><span>Nombre de la clínica</span></label>
                <label className="qual-field"><span>URL de la página a analizar</span><input name="website" inputMode="url" autoCapitalize="none" autoCorrect="off" maxLength={2048} placeholder="www.tuclinica.com/tratamientos" required value={clinic.website} onChange={event => setClinic({ ...clinic, website: event.currentTarget.value })} /><small>Puede ser tu landing, una página de tratamiento o la página principal.</small></label>
                <div className={styles.pair}><label className="qual-field qual-field--floating"><input name="country" autoComplete="country-name" maxLength={100} placeholder=" " value={clinic.country} onChange={event => setClinic({ ...clinic, country: event.currentTarget.value })} /><span>País</span></label><label className="qual-field qual-field--floating"><input name="city" autoComplete="address-level2" maxLength={120} placeholder=" " value={clinic.city} onChange={event => setClinic({ ...clinic, city: event.currentTarget.value })} /><span>Ciudad</span></label></div>
                <p className="qual-hint">Completa al menos el país o la ciudad para contextualizar el diagnóstico.</p>
                <div className={styles.honeypot} aria-hidden="true"><label>Deja este campo vacío<input name="honeypot" tabIndex={-1} autoComplete="off" /></label></div>
                <label className={styles.spotlightConsent}><input name="consent" type="checkbox" required checked={clinic.consent} onChange={event => setClinic({ ...clinic, consent: event.currentTarget.checked })} /><span>Autorizo a Elevator a procesar mis datos y la URL de mi web para preparar y enviarme este diagnóstico. <Link href="/diagnostico-seo/privacidad">Cómo usamos tus datos</Link>.</span></label>
                <label className={styles.spotlightConsent}><input name="marketingConsent" type="checkbox" checked={clinic.marketingConsent} onChange={event => setClinic({ ...clinic, marketingConsent: event.currentTarget.checked })} /><span>También quiero recibir consejos y novedades de Elevator por email. Opcional.</span></label>
                <div ref={widget} className={styles.widget} />
                {ready === false && <p className={styles.notice} role="status">El diagnóstico aún no está disponible. Vuelve a intentarlo más tarde.</p>}
              </>}
              {error && <p className={styles.error} role="alert">{error}</p>}
              <div className="qual-actions">
                {step === 2 && <JigglyButton className="qual-back" type="button" disabled={sending} onClick={() => { setToken(""); setError(""); setStep(1); }}>Atrás</JigglyButton>}
                <JigglyButton className={`${styles.spotlightSubmit} mstf_submit`} type="submit" aria-busy={sending} disabled={step === 2 && (!ready || !token || sending)}>{step === 1 ? "Continuar →" : sending ? "Registrando solicitud…" : "Enviar diagnóstico →"}</JigglyButton>
              </div>
              <p className="form-note">{step === 1 ? "Gratis. Sin tarjeta ni cuenta." : ready === null ? "Comprobando disponibilidad…" : "Te enviaremos el resultado cuando termine el análisis."}</p>
            </MultiStepFormFrame>
          </form>}
      </section>
    </div>
    <section className={styles.spotlightFeatures} aria-label="Qué incluye el diagnóstico">
      <div><span>01</span><h2>Rendimiento móvil</h2><p>Descubre cuánto tarda en cargar tu página y cómo se siente usarla en el celular.</p></div>
      <div><span>02</span><h2>Salud de la página</h2><p>SEO técnico, accesibilidad, buenas prácticas y contenido.</p></div>
      <div><span>03</span><h2>Claridad para buscadores e IA</h2><p>Identidad, ubicación, contacto, datos estructurados y preguntas, con evidencia de la página.</p></div>
    </section>
    <section className={styles.guide} aria-labelledby="diagnosis-guide-title">
      <p className={styles.eyebrow}>Antes de solicitarlo</p>
      <h2 id="diagnosis-guide-title">¿Qué puede decirte un diagnóstico SEO dental?</h2>
      <p>La web de tu clínica es el lugar donde una persona puede conocer tus tratamientos y decidir si quiere contactar. Si la página tarda en mostrar la información o resulta difícil de usar en el celular, esa primera visita puede complicarse. Esta revisión te ayuda a detectar ajustes concretos en la página que compartas.</p>
      <div className={styles.guideColumns}>
        <div>
          <h3>Elige la página que más te importa</h3>
          <p>Puedes enviar la página principal, una landing o una página de tratamiento. Utiliza una dirección pública que abra sin contraseña. Revisamos únicamente esa URL, así que conviene elegir la página a la que llegan tus posibles pacientes.</p>
          <h3>Recibe una explicación por email</h3>
          <p>El informe reúne los controles básicos, una visita móvil simulada y señales de claridad para buscadores e IA. Cada observación indica qué detectamos, la evidencia y qué requiere revisión; después propone hasta tres prioridades. No necesitas conocimientos técnicos para compartir los hallazgos con quien mantiene tu web.</p>
        </div>
        <div>
          <h3>Información que se puede contrastar</h3><p>Buscamos el nombre del negocio en sus datos y contenido, ubicación marcada, enlaces de contacto y cita, preguntas con explicaciones y referencias a profesionales. Detectar una señal no verifica su exactitud ni las credenciales. El video es opcional.</p><h3>Entiende qué queda fuera</h3>
          <p>Una página que supera estos controles aún puede necesitar trabajo de contenido, relevancia local o visibilidad. Este diagnóstico no revisa toda la web ni mide posiciones en Google, visitas, reputación de enlaces externos o Google Maps. Tampoco comprueba si ChatGPT u otra IA menciona o recomienda tu clínica. Los tiempos de carga también pueden variar entre pruebas.</p>
          <h3>Decide el siguiente paso</h3>
          <p>Empieza por las prioridades del informe. Si quieres revisar la estructura y el contenido de tu web con más detalle, conoce nuestro <Link href="/#sistema">servicio de diseño web y SEO para clínicas dentales</Link>. El diagnóstico gratuito es una revisión puntual y no requiere contratar una membresía.</p>
        </div>
      </div>
    </section>
  </main>;
}
