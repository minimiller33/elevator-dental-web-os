import { handleSeo } from "./seo";
import { normalizeWhatsApp } from "../lib/phone";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  GHL_WEBHOOK_URL: string;
  GHL_CALENDAR_URL?: string;
  SEO_SERVICE_URL?: string;
  SEO_SERVICE_TOKEN?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

const MAX_BODY_BYTES = 32_768;

function json(body: Record<string, unknown>, status: number, origin: string) {
  return Response.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const answerLabels: Record<string, string> = {
  utm_source: "UTM origen", utm_medium: "UTM medio", utm_campaign: "UTM campaña", utm_term: "UTM término", utm_content: "UTM contenido",
  first_touch_source: "Primer origen", first_touch_landing_page: "Primera página", first_touch_date: "Primera visita",
  last_touch_source: "Último origen", last_touch_landing_page: "Última página de origen", last_touch_date: "Última visita de origen",
  gclid: "Google Click ID", fbclid: "Meta Click ID", ttclid: "TikTok Click ID", fbp: "Meta Browser ID", fbc: "Meta Click Cookie",
  external_id: "ID del visitante", event_id: "ID del evento", lead_lang: "Idioma", landing_page_url: "Página de envío",
  conversion_timestamp: "Fecha de envío", pages_visited: "Páginas visitadas", device: "Dispositivo", user_agent: "Navegador",
  client_ip: "IP del visitante", geo_country: "País de conexión", geo_region: "Región de conexión", geo_city: "Ciudad de conexión",
  ab_hero: "Variante del hero", qualification_tag: "Etiqueta de calificación",
  lead_priority: "Prioridad", profile: "Perfil", specialty: "Especialidad", city_country: "Ciudad y país", currency: "Moneda",
  years_practicing: "Años ejerciendo", chairs: "Sillones o consultorios", treatment_value: "Valor del tratamiento",
  patients_goal: "Pacientes nuevos deseados por mes", monthly_revenue: "Facturación mensual",
  patient_sources: "Origen de los pacientes", previous_marketing: "Marketing probado", frustration: "Mayor frustración",
  has_website: "Tiene web", website: "Enlace de la web", commitment: "Disponibilidad para invertir",
  in_house_lab: "Laboratorio interno", technology: "Tecnología", decision_maker: "Quién decide",
  decision_maker_attends: "Asiste quien decide", partner_attends: "Asiste socio o responsable",
  timeline: "Cuándo quiere empezar", organic_expectation: "Entiende los tiempos del tráfico orgánico",
};

function qualificationSummary(input: Record<string, unknown>, status: string, name: string, leadId: string) {
  const statusLabel: Record<string, string> = {
    started: "Contacto capturado; formulario pendiente", qualified: "Calificado: puede agendar",
    manual_review: "Requiere revisión manual", not_qualified: "No calificado: sin llamada",
  };
  return [
    "Elevator Dental Web · Calificación de lead", `Nombre: ${name}`, `ID: ${leadId}`,
    `Estado: ${statusLabel[status]}`, `Puntuación: ${Number(input.score) || 0}`,
    ...Object.entries(answerLabels).flatMap(([key, label]) => {
      const rawValue = text(input[key], 2000);
      const value = key === "lead_priority"
        ? ({ high: "Alta · Lead caliente (menos de 30 días)", normal: "Normal", none: "Sin prioridad · No calificado" }[rawValue] ?? rawValue)
        : rawValue;
      return value ? [`${label}: ${value}`] : [];
    }),
  ].join("\n");
}

function validOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  try {
    return new URL(origin).origin === new URL(request.url).origin ? origin : null;
  } catch {
    return null;
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (["/api/seo-diagnosis", "/api/seo-config", "/api/seo-report"].includes(url.pathname)) {
      return handleSeo(request, env);
    }

    if (url.pathname !== "/api/contact") {
      return env.ASSETS.fetch(request);
    }

    const origin = validOrigin(request);
    if (!origin) {
      return Response.json({ ok: false, error: "Origen no permitido." }, { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Método no permitido." }, 405, origin);
    }

    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json({ ok: false, error: "Formato de solicitud no válido." }, 415, origin);
    }

    const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
    if (declaredLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: "La solicitud es demasiado grande." }, 413, origin);
    }

    let input: Record<string, unknown>;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return json({ ok: false, error: "La solicitud es demasiado grande." }, 413, origin);
      }

      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return json({ ok: false, error: "Los datos no son válidos." }, 400, origin);
      }
      input = parsed as Record<string, unknown>;
    } catch {
      return json({ ok: false, error: "Los datos no son válidos." }, 400, origin);
    }

    const eventType = text(input.event_type, 40);
    const leadId = text(input.lead_id, 100);
    const name = text(input.name ?? input.full_name, 120);
    const email = text(input.email, 254).toLowerCase();
    const rawPhone = text(input.phone ?? input.whatsapp, 40);
    const phone = normalizeWhatsApp(rawPhone);

    if (!leadId || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Revisa tu nombre, WhatsApp y correo para continuar." }, 400, origin);
    }
    if (!phone) {
      return json({ ok: false, error: "Revisa tu WhatsApp: selecciona el país e introduce un número completo." }, 400, origin);
    }
    if (eventType !== "lead_started" && eventType !== "lead_completed") {
      return json({ ok: false, error: "Tipo de envío no válido." }, 400, origin);
    }

    const leadStatus = eventType === "lead_started" ? "started" : text(input.lead_status, 30);
    if (!["started", "qualified", "manual_review", "not_qualified"].includes(leadStatus)) {
      return json({ ok: false, error: "Estado de calificación no válido." }, 400, origin);
    }

    const qualificationTag = leadStatus === "not_qualified" ? "No califica" : "";
    const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
    const elevatorInput = { ...input };
    for (const key of ["sucursal_interes", "servicio_interes", "otro_servicio", "como_nos_conocio", "mensaje_lead"]) {
      delete elevatorInput[key];
    }
    const payload = {
      ...elevatorInput,
      lead_id: leadId,
      event_type: eventType,
      lead_status: leadStatus,
      is_qualified: leadStatus === "qualified",
      qualification_tag: qualificationTag,
      tags: ["web-form", "elevator-dental-web", ...(qualificationTag ? [qualificationTag] : [])],
      score: Number(input.score) || 0,
      name,
      full_name: name,
      first_name: name.split(/\s+/)[0],
      last_name: name.split(/\s+/).slice(1).join(" "),
      firstName: name.split(/\s+/)[0],
      lastName: name.split(/\s+/).slice(1).join(" "),
      email,
      phone,
      whatsapp: phone,
      source: "Elevator Dental Web",
      client_ip: request.headers.get("CF-Connecting-IP") || "",
      geo_country: text(cf?.country, 10),
      geo_region: text(cf?.regionCode, 100),
      geo_city: text(cf?.city, 120),
      user_agent: text(request.headers.get("User-Agent"), 1000),
      conversion_timestamp: new Date().toISOString(),
      qualification_summary: "",
    };

    payload.qualification_summary = qualificationSummary(payload, leadStatus, name, leadId);

    try {
      const webhookResponse = await fetch(env.GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json, text/plain, */*" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });

      if (!webhookResponse.ok) {
        console.error("GHL webhook returned HTTP status", webhookResponse.status);
        return json({ ok: false, error: "No pudimos enviar tu solicitud. Inténtalo de nuevo." }, 502, origin);
      }

      const bookingUrl = eventType === "lead_completed" && leadStatus === "qualified"
        ? env.GHL_CALENDAR_URL ?? ""
        : "";
      return json({ ok: true, bookingUrl }, 200, origin);
    } catch (error) {
      const detail = error instanceof Error
        ? `${error.name}: ${error.message.replace(env.GHL_WEBHOOK_URL, "[redacted webhook URL]")}`
        : "unknown error";
      const cause = error instanceof Error && error.cause instanceof Error
        ? `${error.cause.name}: ${error.cause.message.replace(env.GHL_WEBHOOK_URL, "[redacted webhook URL]")}`
        : "";
      console.error("GHL webhook request failed", detail, cause);
      return json({ ok: false, error: "No pudimos conectar con el servicio. Inténtalo de nuevo." }, 502, origin);
    }
  },
};

export default worker;
