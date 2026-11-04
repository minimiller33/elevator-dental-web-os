import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function handler(fetcher) { const context = { exports: {}, URL, Request, Response, AbortSignal, TextEncoder, fetch: fetcher }; vm.runInNewContext(ts.transpile(fs.readFileSync('worker/optins.ts', 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }), context); return context.exports.handleOptin; }
const env = { SEO_SERVICE_URL: 'https://service.example.com', SEO_SERVICE_TOKEN: 'secret', TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret' };
const request = (patch = {}, origin = 'https://elevatordental.com') => new Request('https://elevatordental.com/api/optin', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' }, body: JSON.stringify({ nombre: 'Ana', turnstileToken: 'captcha', ...patch }) });
test('config stays unavailable without configured service; wrong origin and honeypot never forward', async () => {
  const handle = handler(() => { throw new Error('unexpected request'); });
  assert.equal((await handle(request(), {})).status, 503);
  assert.equal((await handle(request({}, 'https://evil.com'), env)).status, 403);
  assert.equal((await handle(request({ honeypot: 'bot' }), env)).status, 400);
});
test('only verified hostname and action can enqueue; token never reaches service', async () => {
  for (const verification of [{ success: false }, { success: true, hostname: 'other.com', action: 'lead_magnet' }, { success: true, hostname: 'elevatordental.com', action: 'seo_diagnosis' }]) {
    let calls = 0; const handle = handler(async () => { calls++; return Response.json(verification); });
    assert.equal((await handle(request(), env)).status, 400); assert.equal(calls, 1);
  }
  let forwarded;
  const handle = handler(async (url, options) => { if (String(url).includes('siteverify')) return Response.json({ success: true, hostname: 'elevatordental.com', action: 'lead_magnet' }); forwarded = options; return Response.json({ ok: true }, { status: 202 }); });
  assert.equal((await handle(request(), env)).status, 202);
  assert.equal(JSON.parse(forwarded.body).turnstileToken, undefined); assert.equal(forwarded.headers.Authorization, 'Bearer secret'); assert.equal(forwarded.headers['X-Elevator-Client-IP'], '1.2.3.4');
});
test('config checks CRM readiness and upstream errors remain recoverable', async () => {
  for (const ready of [true, false]) { const handle = handler(async () => Response.json({ ready })); const data = await (await handle(new Request('https://elevatordental.com/api/optin-config'), env)).json(); assert.equal(data.ready, ready); assert.equal(data.siteKey, ready ? 'site' : ''); }
  const handle = handler(async url => String(url).includes('siteverify') ? Response.json({ success: true, hostname: 'elevatordental.com', action: 'lead_magnet' }) : new Response('', { status: 503 }));
  const result = await handle(request(), env); assert.equal(result.status, 502); assert.match((await result.json()).error, /Tus datos siguen aquí/);
});
