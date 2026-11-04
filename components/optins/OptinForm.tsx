"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Download } from "lucide-react";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { postForm } from "@/lib/form-feedback";
import styles from "./optin.module.css";

export function OptinForm({ magnet: m }: { magnet: LeadMagnet }) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const busy = useRef(false);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (email) heading.current?.focus(); }, [email]);
  useEffect(() => {
    let alive = true;
    const script = document.createElement("script");
    void (async () => {
      try {
        const response = await fetch("/api/optin-config", { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error("config");
        const config = await response.json() as { ready: boolean; siteKey: string };
        if (!alive) return;
        setReady(config.ready);
        if (!config.ready || email) return;
        const render = () => {
          if (!alive || !widget.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(widget.current, { sitekey: config.siteKey, action: "lead_magnet", theme: "light", size: widget.current.clientWidth < 300 ? "compact" : "flexible", callback: (value: string) => { if (alive) setToken(value); }, "expired-callback": () => { if (alive) setToken(""); }, "error-callback": () => { if (alive) { setToken(""); setError("No pudimos cargar la verificación. Recarga la página para volver a intentarlo."); } } });
        };
        if (window.turnstile) render();
        else { script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.async = true; script.onload = render; script.onerror = () => { if (alive) setError("No pudimos cargar la verificación. Recarga la página."); }; document.head.appendChild(script); }
      } catch { if (alive) setReady(false); }
    })();
    return () => { alive = false; if (widgetId.current) window.turnstile?.remove(widgetId.current); widgetId.current = null; script.remove(); };
  }, [email]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !ready || !token) return;
    const data = new FormData(event.currentTarget);
    const utm = new URLSearchParams(window.location.search);
    busy.current = true; setSending(true); setError("");
    try {
      await postForm("/api/optin", { ...Object.fromEntries(data), lead_magnet: m.kw, acepta_privacidad: data.get("acepta_privacidad") === "on", turnstileToken: token, utm_source: utm.get("utm_source") || "", utm_medium: utm.get("utm_medium") || "", utm_campaign: utm.get("utm_campaign") || "", landing_page: m.slug });
      setEmail(String(data.get("email")));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No pudimos registrar tu solicitud. Tus datos siguen aquí; vuelve a intentarlo."); }
    finally { busy.current = false; setSending(false); setToken(""); if (widgetId.current) window.turnstile?.reset(widgetId.current); }
  }

  if (email) return <div className={styles.thanks}><Check size={36} /><p className={styles.eyebrow}>Ya puedes empezar</p><h2 ref={heading} tabIndex={-1}>Tu recurso está aquí.</h2><p>Registramos tu solicitud. Abre o descarga el recurso con los botones de abajo.</p>{m.kw === "CAJA" && <p>Primero haz tu copia. Toca «Hacer una copia» y la hoja queda en tu Drive.</p>}<div className={styles.downloads}>{m.downloads.map(file => <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer"><Download size={18} />{file.label}</a>)}</div><div className={styles.bridge}><h3>¿Y cómo está la web de tu clínica?</h3><p>Recibe un diagnóstico gratuito con observaciones y próximos pasos.</p><Link href="/diagnostico-seo">Revisar mi web <ArrowUpRight size={17} /></Link></div></div>;
  return <form onSubmit={submit} className={styles.form}>
    <div><p className={styles.eyebrow}>Gratis · Sin tarjeta</p><h2>{m.kw === "CAJA" ? "Accede a la hoja gratis." : m.kw === "CHAT" ? "Accede al kit gratis." : "Accede a la guía gratis."}</h2></div>
    <label>Tu nombre<input name="nombre" autoComplete="name" placeholder="Ej. Dra. Ana López" required minLength={2} maxLength={120} /></label>
    <label>Tu correo<input name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required maxLength={254} /></label>
    <fieldset><legend>¿Cuál es tu caso?</legend><label className={styles.radio}><input type="radio" name="perfil" value="independiente" required /><span>Soy dentista independiente con consultorio</span></label><label className={styles.radio}><input type="radio" name="perfil" value="dueno_clinica" required /><span>Soy dueño o dueña de clínica</span></label></fieldset>
    <label>WhatsApp <small>(opcional)</small><input name="telefono" type="tel" autoComplete="tel" placeholder="+52 55 1234 5678" maxLength={40} /><small>Incluye el código de país si estás fuera de México.</small></label>
    <div className={styles.honeypot} aria-hidden="true"><label>Deja este campo vacío<input name="honeypot" tabIndex={-1} autoComplete="off" /></label></div>
    <label className={styles.consent}><input name="acepta_privacidad" type="checkbox" required /><span>Acepto el <Link href="/privacidad#recursos" target="_blank" rel="noopener noreferrer">aviso de privacidad</Link> y el uso de mis datos para registrar mi solicitud y acceder a este recurso.</span></label>
    <input type="hidden" name="lead_magnet" value={m.kw} />
    <div ref={widget} className={styles.widget} />
    {error && <p className={styles.error} role="alert">{error}</p>}
    {ready === false && <p className={styles.error} role="status">No podemos recibir solicitudes ahora. Inténtalo más tarde o escribe a <a href="mailto:mail@elevatordental.com">mail@elevatordental.com</a>.</p>}
    <button type="submit" disabled={!ready || !token || sending} aria-busy={sending}>{sending ? "Registrando solicitud…" : m.cta}<ArrowUpRight size={20} /></button>
    <p className={styles.note}>{ready === null ? "Comprobando disponibilidad…" : "También podrás abrir el recurso al completar el formulario."}</p>
    <noscript>Activa JavaScript para solicitar el recurso o escribe a mail@elevatordental.com.</noscript>
  </form>;
}
