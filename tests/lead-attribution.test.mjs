import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const nativeRequire = createRequire(import.meta.url);
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
const compile = path => ts.transpile(fs.readFileSync(path, 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
}
function browser(local = storage(), session = storage()) {
  const context = { exports: {}, URL, localStorage: local, sessionStorage: session,
    window: { location: { href: 'https://example.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=click123' } },
    document: { cookie: '_fbp=fb.1.123.456', referrer: '', documentElement: { lang: 'es' } },
    navigator: { language: 'es', userAgent: 'Mozilla/5.0 iPhone Mobile' },
    crypto: webcrypto, Date,
  };
  vm.runInNewContext(compile('lib/lead-attribution.ts'), context);
  return context;
}
test('first touch persists and internal navigation retains campaign and click IDs', () => {
  const b = browser();
  b.exports.trackLeadVisit();
  const first = b.exports.captureLeadAttribution();
  b.window.location.href = 'https://example.com/contacto';
  const contact = b.exports.captureLeadAttribution();
  assert.equal(contact.utm_source, 'ig');
  assert.equal(contact.fbclid, 'click123');
  assert.equal(contact.first_touch_source, 'ig / social');
  assert.equal(contact.pages_visited, '/ → /contacto');
  assert.equal(contact.external_id, first.external_id);
  assert.notEqual(contact.event_id, first.event_id);
  assert.equal(contact.fbp, 'fb.1.123.456');
  assert.match(contact.fbc, /^fb\.1\.\d+\.click123$/);
  assert.equal(contact.device, 'mobile');
  const returning = browser(b.localStorage, b.sessionStorage);
  returning.window.location.href = 'https://example.com/?utm_source=google&utm_medium=cpc&gclid=google123';
  const next = returning.exports.captureLeadAttribution();
  assert.equal(next.first_touch_source, 'ig / social');
  assert.equal(next.last_touch_source, 'google / cpc');
  assert.equal(next.gclid, 'google123');
  assert.equal(next.external_id, first.external_id);
});
test('blocked or malformed storage does not prevent capturing a lead', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  for (const local of [blocked, { getItem: () => '{bad json', setItem() {} }]) {
    const b = browser(local, blocked);
    const data = b.exports.captureLeadAttribution();
    assert.equal(data.utm_source, 'ig');
    assert(data.external_id);
  }
});
test('server forwards every status, preserves attribution and uses trusted request IP/geolocation', async () => {
  let forwarded;
  const context = { exports: {}, Response, Request, URL, TextEncoder, AbortSignal, console,
    fetch: async (_, options) => { forwarded = JSON.parse(options.body); return new Response('{}'); },
    require: (path) => {
      if (path === '../lib/phone') {
        const phoneModule = { exports: {}, require: nativeRequire };
        vm.runInThisContext(`(function(exports, require) { ${compile('lib/phone.ts')} })`)(phoneModule.exports, phoneModule.require);
        return phoneModule.exports;
      }
      if (path === '../lib/contact-validation') {
        const validation = { exports: {}, URL };
        vm.runInNewContext(compile('lib/contact-validation.ts'), validation);
        return validation.exports;
      }
      assert.equal(path, './seo');
      const seoModule = { exports: {}, Response, Request, URL, TextEncoder, AbortSignal };
      vm.runInNewContext(compile('worker/seo.ts'), seoModule);
      return seoModule.exports;
    },
  };
  vm.runInNewContext(compile('worker/index.ts'), context);
  for (const status of ['started', 'qualified', 'manual_review', 'not_qualified']) {
    const input = { lead_id: 'test', event_type: status === 'started' ? 'lead_started' : 'lead_completed', lead_status: status,
      name: 'Test Lead', email: 'test@example.com', phone: '+50688888888', utm_source: 'ig',
      pages_visited: '/ → /contacto', client_ip: 'forged', geo_country: 'forged', frustration: 'Quiero crecer',
      first_touch_source: 'ig / social', landing_page_url: 'https://example.com/contacto',
      sucursal_interes: 'old', servicio_interes: 'old', otro_servicio: 'old', como_nos_conocio: 'old', mensaje_lead: 'old', tags: ['fake'], user_agent: 'forged', specialty: 'Odontología general',
    };
    const request = new Request('https://example.com/api/contact', { method: 'POST',
      headers: { Origin: 'https://example.com', 'Content-Type': 'application/json', 'CF-Connecting-IP': '201.202.14.7', 'User-Agent': 'Actual Browser' },
      body: JSON.stringify(input),
    });
    request.cf = { country: 'CR', regionCode: 'SJ', city: 'San José' };
    const response = await context.exports.default.fetch(request, { GHL_WEBHOOK_URL: 'https://example.com/mock', GHL_CALENDAR_URL: 'https://example.com/book' });
    assert.equal(response.status, 200);
    assert.equal(forwarded.lead_status, status);
    assert.equal(forwarded.utm_source, 'ig');
    assert.equal(forwarded.firstName, 'Test');
    assert.equal(forwarded.lastName, 'Lead');
    assert.equal(forwarded.first_name, 'Test');
    assert.equal(forwarded.client_ip, '201.202.14.7');
    assert.equal(forwarded.geo_country, 'CR');
    assert.equal(forwarded.geo_city, 'San José');
    assert.equal(forwarded.user_agent, 'Actual Browser');
    assert.equal(forwarded.specialty, 'Odontología general');
    assert.deepEqual(forwarded.tags, ['web-form', 'elevator-dental-web', ...(status === 'not_qualified' ? ['No califica'] : [])]);
    assert.equal(forwarded.is_qualified, status === 'qualified');
    for (const key of ['sucursal_interes', 'servicio_interes', 'otro_servicio', 'como_nos_conocio', 'mensaje_lead']) assert.equal(key in forwarded, false);
    assert.equal(forwarded.frustration, 'Quiero crecer');
    assert(forwarded.qualification_summary.includes('Primer origen: ig / social'));
    assert.equal((await response.json()).bookingUrl, status === 'qualified' ? 'https://example.com/book' : '');
  }
  for (const invalid of [{ name: '123<>!!!' }, { website: 'javascript:alert(1)' }]) {
    const before = forwarded;
    const request = new Request('https://example.com/api/contact', { method: 'POST', headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: 'invalid-test', event_type: 'lead_started', name: 'Ana Mora', email: 'qa@example.com', phone: '+50688887777', ...invalid }) });
    const response = await context.exports.default.fetch(request, { GHL_WEBHOOK_URL: 'https://example.com/mock' });
    assert.equal(response.status, 400);
    assert.equal(forwarded, before, 'invalid inputs never reach the CRM');
  }
});
