const STORAGE_KEY = "elevator-lead-attribution-v1";
const SESSION_KEY = "elevator-pages-visited-v1";
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ttclid", "ab_hero"] as const;
type Touch = { source: string; url: string; date: string; params: Record<string, string> };
type Attribution = { externalId: string; first: Touch; last: Touch };
let cached: Attribution | undefined;
let pages: string[] = [];
let previousUrl = "";

function readStorage(key: string, session = false) {
  try { return JSON.parse((session ? sessionStorage : localStorage).getItem(key) || "null"); } catch { return null; }
}
function writeStorage(key: string, value: unknown, session = false) {
  try { (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(value)); } catch { /* Capture still works when storage is unavailable. */ }
}
function cookie(name: string) {
  const value = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
  try { return decodeURIComponent(value).slice(0, 1000); } catch { return value.slice(0, 1000); }
}
function validTouch(value: unknown): value is Touch {
  if (!value || typeof value !== "object") return false;
  const touch = value as Touch;
  return typeof touch.source === "string" && typeof touch.url === "string" && typeof touch.date === "string" && !!touch.params && typeof touch.params === "object";
}
export function trackLeadVisit() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!cached) {
    const saved = readStorage(STORAGE_KEY);
    if (saved && typeof saved.externalId === "string" && validTouch(saved.first) && validTouch(saved.last)) cached = saved;
  }
  const params: Record<string, string> = {};
  for (const key of attributionKeys) params[key] = (url.searchParams.get(key) || "").slice(0, 1000);
  let referrer = "";
  try { const ref = new URL(document.referrer); if (ref.origin !== url.origin) referrer = ref.hostname; } catch { /* No external referrer. */ }
  const hasCampaign = ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "ttclid"].some((key) => params[key]);
  const source = params.utm_source
    ? `${params.utm_source} / ${params.utm_medium || "unknown"}`
    : params.gclid ? "google / cpc" : params.fbclid ? "facebook / referral" : params.ttclid ? "tiktok / referral" : referrer ? `${referrer} / referral` : "direct / none";
  const touch: Touch = { source, url: url.href.slice(0, 2000), date: new Date().toISOString(), params };
  if (!cached) cached = { externalId: crypto.randomUUID(), first: touch, last: touch };
  else if (previousUrl !== url.href && (hasCampaign || (!previousUrl && referrer))) cached.last = touch;
  for (const key of ["ab_hero"]) {
    if (params[key]) cached.last.params[key] = params[key];
  }
  previousUrl = url.href;
  const savedPages = readStorage(SESSION_KEY, true);
  if (Array.isArray(savedPages)) pages = savedPages.filter((path): path is string => typeof path === "string").slice(-30);
  if (pages[pages.length - 1] !== url.pathname) pages = [...pages, url.pathname.slice(0, 200)].slice(-30);
  writeStorage(STORAGE_KEY, cached);
  writeStorage(SESSION_KEY, pages, true);
}
export function captureLeadAttribution() {
  trackLeadVisit();
  if (!cached) return {};
  const fbc = cookie("_fbc") || (cached.last.params.fbclid ? `fb.1.${new Date(cached.last.date).getTime()}.${cached.last.params.fbclid}` : "");
  return {
    ...Object.fromEntries(attributionKeys.map((key) => [key, cached!.last.params[key] || ""])),
    first_touch_source: cached.first.source,
    first_touch_landing_page: cached.first.url,
    first_touch_date: cached.first.date,
    last_touch_source: cached.last.source,
    last_touch_landing_page: cached.last.url,
    last_touch_date: cached.last.date,
    external_id: cached.externalId,
    event_id: crypto.randomUUID(),
    fbp: cookie("_fbp"), fbc,
    lead_lang: document.documentElement.lang || navigator.language || "",
    user_agent: navigator.userAgent.slice(0, 1000),
    landing_page_url: window.location.href.slice(0, 2000),
    conversion_timestamp: new Date().toISOString(),
    pages_visited: pages.join(" → ").slice(0, 2000),
    device: /iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent) ? "tablet" : /Mobi|iPhone|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
  };
}
