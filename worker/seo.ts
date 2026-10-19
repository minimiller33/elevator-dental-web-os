type SeoEnv = {
  SEO_SERVICE_URL?: string;
  SEO_SERVICE_TOKEN?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

function logUpstreamFailure(stage: string, error: unknown) {
  const scrub = (value: string) => value.replace(/https?:\/\/\S+/gi, "[url]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 180);
  const cause = error instanceof Error ? error.cause : undefined;
  console.warn("SEO upstream request failed", {
    stage,
    error: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? scrub(error.message) : undefined,
    causeType: cause instanceof Error ? cause.name : typeof cause,
    causeMessage: cause instanceof Error ? scrub(cause.message) : typeof cause === "string" ? scrub(cause) : undefined,
    code: cause && typeof cause === "object" && "code" in cause ? String(cause.code).slice(0, 40) : undefined,
  });
}

export async function handleSeo(request: Request, env: SeoEnv): Promise<Response> {
  const url = new URL(request.url);
  const configured = !!(env.SEO_SERVICE_URL && env.SEO_SERVICE_TOKEN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
  if (url.pathname === "/api/seo-config") {
    if (request.method !== "GET") return json({ ok: false }, 405);
    if (!configured) return json({ ready: false, siteKey: "", serviceReachable: false });
    try {
      const health = await fetch(new URL("/health", env.SEO_SERVICE_URL), { signal: AbortSignal.timeout(5_000), redirect: "manual" });
      const reachable = health.ok;
      return json({ ready: reachable, siteKey: reachable ? env.TURNSTILE_SITE_KEY : "", serviceReachable: reachable });
    } catch (error) {
      logUpstreamFailure("health_check", error);
      return json({ ready: false, siteKey: "", serviceReachable: false });
    }
  }
  if (!configured) return json({ ok: false, error: "El diagnóstico aún no está disponible. Inténtalo más tarde." }, 503);
  const report = url.pathname === "/api/seo-report";
  if (request.method !== (report ? "GET" : "POST")) return json({ ok: false }, 405);
  let body: Record<string, unknown> | undefined;
  if (!report) {
    if (request.headers.get("Origin") !== url.origin) return json({ ok: false }, 403);
    if (!request.headers.get("Content-Type")?.includes("application/json")) return json({ ok: false }, 415);
    if (Number(request.headers.get("Content-Length") || 0) > 8192) return json({ ok: false }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 8192) return json({ ok: false }, 413);
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ ok: false }, 400);
      body = parsed as Record<string, unknown>;
    } catch { return json({ ok: false }, 400); }
    if (body.honeypot || typeof body.turnstileToken !== "string" || body.turnstileToken.length > 2048) return json({ ok: false, error: "Completa la verificación para continuar." }, 400);
    try {
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: body.turnstileToken, remoteip: request.headers.get("CF-Connecting-IP") || undefined }),
        signal: AbortSignal.timeout(10_000),
      });
      const result = await verification.json() as { success?: boolean; hostname?: string; action?: string };
      if (!verification.ok || !result.success || result.hostname !== url.hostname || result.action !== "seo_diagnosis") return json({ ok: false, error: "La verificación expiró. Inténtalo de nuevo." }, 400);
    } catch { return json({ ok: false, error: "No pudimos verificar la solicitud. Inténtalo de nuevo." }, 502); }
    delete body.turnstileToken;
  }
  const token = url.searchParams.get("token") || "";
  if (report && !/^[a-f0-9]{64}$/.test(token)) return json({ ok: false }, 404);
  let upstreamStage = "prepare";
  try {
    const base = new URL(env.SEO_SERVICE_URL!);
    if (base.protocol !== "https:") throw new Error("Invalid service URL");
    const upstream = new URL(report ? `/reports?token=${token}` : "/jobs", base);
    upstreamStage = "fetch";
    const response = await fetch(upstream, {
      method: report ? "GET" : "POST",
      headers: { Authorization: `Bearer ${env.SEO_SERVICE_TOKEN}`, "Content-Type": "application/json", "X-Elevator-Client-IP": request.headers.get("CF-Connecting-IP") || "unknown" },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15_000), redirect: "manual",
    });
    if (report && response.status === 404) return json({ ok: false }, 404);
    if (response.status === 429) return json({ ok: false, error: "Alcanzamos el límite de solicitudes. Inténtalo más tarde." }, 429);
    if (response.status === 400) return json({ ok: false, error: "Revisa los datos y la dirección de tu web." }, 400);
    if (!response.ok) return json({ ok: false, error: "No pudimos registrar tu solicitud. Inténtalo de nuevo." }, 502);
    upstreamStage = "response_json";
    return json(await response.json(), report ? 200 : 202);
  } catch (error) {
    logUpstreamFailure(upstreamStage, error);
    return json({ ok: false, error: "No pudimos conectar con el diagnóstico. Inténtalo de nuevo." }, 502);
  }
}
