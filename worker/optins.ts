type OptinEnv = { SEO_SERVICE_URL?: string; SEO_SERVICE_TOKEN?: string; TURNSTILE_SITE_KEY?: string; TURNSTILE_SECRET_KEY?: string };
export async function handleOptin(request: Request, env: OptinEnv): Promise<Response> {
  const url = new URL(request.url);
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  const configured = !!(env.SEO_SERVICE_URL && env.SEO_SERVICE_TOKEN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
  if (url.pathname === "/api/optin-config") {
    if (request.method !== "GET") return json({ ok: false }, 405);
    if (!configured) return json({ ready: false, siteKey: "" });
    try {
      const result = await fetch(new URL("/optins/health", env.SEO_SERVICE_URL), { headers: { Authorization: `Bearer ${env.SEO_SERVICE_TOKEN}` }, signal: AbortSignal.timeout(5000), redirect: "manual" });
      const ready = result.ok && (await result.json() as { ready?: boolean }).ready === true;
      if (!ready) console.warn("Opt-in health unavailable", { status: result.status });
      return json({ ready, siteKey: ready ? env.TURNSTILE_SITE_KEY : "" });
    } catch (error) { console.warn("Opt-in health connection failed", error instanceof Error ? error.name : "UnknownError"); return json({ ready: false, siteKey: "" }); }
  }
  if (request.method !== "POST") return json({ ok: false }, 405);
  if (request.headers.get("Origin") !== url.origin) return json({ ok: false, error: "Origen no permitido." }, 403);
  if (!configured) return json({ ok: false, error: "No podemos recibir solicitudes ahora. Inténtalo más tarde." }, 503);
  if (!request.headers.get("Content-Type")?.includes("application/json")) return json({ ok: false }, 415);
  if (Number(request.headers.get("Content-Length") || 0) > 8192) return json({ ok: false }, 413);
  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return json({ ok: false }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ ok: false }, 400);
    input = parsed as Record<string, unknown>;
  } catch { return json({ ok: false }, 400); }
  if (input.honeypot || typeof input.turnstileToken !== "string" || !input.turnstileToken || input.turnstileToken.length > 2048) return json({ ok: false, error: "Completa la verificación para continuar." }, 400);
  try {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: input.turnstileToken, remoteip: request.headers.get("CF-Connecting-IP") || undefined }), signal: AbortSignal.timeout(10000) });
    const result = await verification.json() as { success?: boolean; hostname?: string; action?: string };
    if (!verification.ok || !result.success || result.hostname !== url.hostname || result.action !== "lead_magnet") return json({ ok: false, error: "La verificación expiró. Inténtalo de nuevo." }, 400);
    delete input.turnstileToken;
    const upstream = new URL("/optins", env.SEO_SERVICE_URL);
    if (upstream.protocol !== "https:") throw new Error("config");
    const response = await fetch(upstream, { method: "POST", headers: { Authorization: `Bearer ${env.SEO_SERVICE_TOKEN}`, "Content-Type": "application/json", "X-Elevator-Client-IP": request.headers.get("CF-Connecting-IP") || "unknown" }, body: JSON.stringify(input), signal: AbortSignal.timeout(10000), redirect: "manual" });
    if (response.status === 202) return json({ ok: true }, 202);
    if (response.status === 429) return json({ ok: false, error: "Alcanzamos el límite de solicitudes. Inténtalo más tarde." }, 429);
    if (response.status === 400) return json({ ok: false, error: "Revisa tu nombre, correo, perfil, WhatsApp y aviso de privacidad." }, 400);
    return json({ ok: false, error: "No pudimos registrar tu solicitud. Tus datos siguen aquí; vuelve a intentarlo." }, 502);
  } catch { return json({ ok: false, error: "No pudimos conectar. Tus datos siguen aquí; vuelve a intentarlo." }, 502); }
}
