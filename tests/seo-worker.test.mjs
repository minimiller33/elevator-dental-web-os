import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function handler(fetcher) {
  const context = { exports: {}, URL, Request, Response, AbortSignal, TextEncoder, fetch: fetcher };
  vm.runInNewContext(ts.transpile(fs.readFileSync('worker/seo.ts', 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }), context);
  return context.exports.handleSeo;
}
const env = { SEO_SERVICE_URL: 'https://audit.example.com', SEO_SERVICE_TOKEN: 'secret', TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret' };
const request = (origin = 'https://elevatordental.com') => new Request('https://elevatordental.com/api/seo-diagnosis', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' }, body: JSON.stringify({ firstName: 'Ana', turnstileToken: 'captcha' }) });
test('disabled configuration and cross-origin requests never enqueue work', async () => {
  const handle = handler(() => { throw new Error('Unexpected external request'); });
  assert.equal((await handle(request(), {})).status, 503);
  assert.equal((await handle(request('https://other.com'), env)).status, 403);
});
test('configuration only enables the form when the VPS health endpoint is reachable', async () => {
  const configRequest = new Request('https://elevatordental.com/api/seo-config');
  const online = handler(async (url, options) => {
    assert.equal(String(url), 'https://audit.example.com/health');
    assert.equal(options.redirect, 'manual');
    return Response.json({ ok: true });
  });
  assert.deepEqual(await (await online(configRequest, env)).json(), { ready: true, siteKey: 'site', serviceReachable: true });
  const offline = handler(async () => { throw new TypeError('fetch failed'); });
  const result = await (await offline(configRequest, env)).json();
  assert.equal(result.ready, false);
  assert.equal(result.serviceReachable, false);
});
test('invalid captcha hostname or action never enqueue work', async () => {
  for (const result of [{ success: false }, { success: true, hostname: 'other.com', action: 'seo_diagnosis' }, { success: true, hostname: 'elevatordental.com', action: 'other' }]) {
    let calls = 0;
    const handle = handler(async () => { calls++; return Response.json(result); });
    assert.equal((await handle(request(), env)).status, 400);
    assert.equal(calls, 1);
  }
});
test('accepted work carries service auth and client IP without captcha token', async () => {
  let forwarded;
  const handle = handler(async (url, options) => {
    if (String(url).includes('siteverify')) return Response.json({ success: true, hostname: 'elevatordental.com', action: 'seo_diagnosis' });
    forwarded = options;
    return Response.json({ ok: true }, { status: 202 });
  });
  assert.equal((await handle(request(), env)).status, 202);
  assert.equal(forwarded.headers.Authorization, 'Bearer secret');
  assert.equal(forwarded.headers['X-Elevator-Client-IP'], '1.2.3.4');
  assert.equal(forwarded.redirect, 'manual');
  assert.equal(JSON.parse(forwarded.body).turnstileToken, undefined);
});
