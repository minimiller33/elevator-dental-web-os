import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { timingSafeEqual } from 'node:crypto';
import { validateLead } from './core.mjs';
import { Store } from './store.mjs';
import { processJob } from './runner.mjs';

const env = process.env;
for (const key of ['SEO_SERVICE_TOKEN', 'PUBLIC_SITE_URL']) {
  if (!env[key]) throw new Error(`Missing configuration: ${key}`);
}
if (env.SEO_SERVICE_TOKEN.length < 32) throw new Error('SEO_SERVICE_TOKEN must have at least 32 characters');
if (env.RESEND_API_KEY && !env.RESEND_FROM) throw new Error('RESEND_FROM is required when Resend is enabled');
if (!!env.GHL_API_TOKEN !== !!env.GHL_LOCATION_ID) throw new Error('GHL_API_TOKEN and GHL_LOCATION_ID must be configured together');
const publicUrl = new URL(env.PUBLIC_SITE_URL);
if (publicUrl.protocol !== 'https:') throw new Error('PUBLIC_SITE_URL must use HTTPS');
env.PUBLIC_SITE_URL = publicUrl.origin;
const dailyLimit = Number(env.DAILY_JOB_LIMIT ?? 50);
if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) throw new Error('Invalid DAILY_JOB_LIMIT');
const dataDir = env.DATA_DIR || './data';
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const store = new Store(`${dataDir}/seo.sqlite`);

function reply(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
function authorized(req) {
  const actual = Buffer.from(req.headers.authorization || '');
  const expected = Buffer.from(`Bearer ${env.SEO_SERVICE_TOKEN}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') return reply(res, 200, { ok: true });
  if (!authorized(req)) return reply(res, 401, { ok: false });
  if (req.method === 'GET' && url.pathname === '/reports') {
    const token = url.searchParams.get('token') || '';
    if (!/^[a-f0-9]{64}$/.test(token)) return reply(res, 404, { ok: false });
    const report = store.report(token);
    return reply(res, report ? 200 : 404, report ? { ok: true, report } : { ok: false });
  }
  if (req.method !== 'POST' || url.pathname !== '/jobs') return reply(res, 404, { ok: false });
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return reply(res, 503, { ok: false, error: 'Email delivery is not configured.' });
  if (!req.headers['content-type']?.includes('application/json')) return reply(res, 415, { ok: false });
  try {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 8192) { reply(res, 413, { ok: false }); return; }
      chunks.push(chunk);
    }
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const lead = validateLead(input);
    if (input.honeypot) return reply(res, 400, { ok: false, error: 'Solicitud no válida.' });
    const ip = req.headers['x-elevator-client-ip'];
    if (typeof ip !== 'string' || !ip) return reply(res, 400, { ok: false });
    store.enqueue(lead, ip, dailyLimit);
    return reply(res, 202, { ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'rate_limit') return reply(res, 429, { ok: false, error: 'Alcanzamos el límite de solicitudes. Inténtalo más tarde.' });
    return reply(res, 400, { ok: false, error: 'Revisa el formulario y la dirección de tu web.' });
  }
});
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.listen(Number(env.PORT || 3100), '0.0.0.0', () => console.log('SEO service ready'));
let busy = false;
const timer = setInterval(async () => {
  if (busy) return;
  busy = true;
  try { store.prune(); const job = store.next(); if (job) await processJob(store, job, env); }
  catch { console.error('SEO queue unavailable'); }
  finally { busy = false; }
}, 2000);
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { clearInterval(timer); server.close(); });
