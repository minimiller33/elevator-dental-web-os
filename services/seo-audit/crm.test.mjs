import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncSeoContact } from './crm.mjs';

const payload = { firstName: 'Prueba', lastName: 'SEO', email: 'test@example.com', clinic: 'Clínica de prueba', website: 'https://example.com/', country: 'México', city: 'CDMX', source: 'Elevator Dental SEO', tags: ['seo-lead-magnet'], consent: true, marketingConsent: false, consent_at: '2026-10-15T00:00:00.000Z', event_id: 'seo_report_ready/test-job', report_url: 'https://example.com/report', passed_checks: 7, total_checks: 7 };
const env = { GHL_API_TOKEN: 'mock-token', GHL_LOCATION_ID: 'mock-location' };

test('API merges SEO tags without replacing other tags or enrolling in marketing', async () => {
  const calls = [];
  await syncSeoContact(payload, env, async (url, options) => {
    calls.push({ url, ...options, body: options.body && JSON.parse(options.body) });
    return Response.json(url.endsWith('/upsert') ? { contact: { id: 'contact-1' } } : url.endsWith('/notes') && options.method === 'GET' ? { notes: [] } : {});
  });
  assert.equal(calls[0].body.country, 'MX');
  assert.equal(calls[0].body.locationId, 'mock-location');
  assert.equal(calls[0].body.createNewIfDuplicateAllowed, false);
  assert.equal(calls[0].body.tags, undefined);
  assert.deepEqual(calls[1].body.tags, ['seo-lead-magnet']);
  assert.match(calls[3].body.body, /No aceptado en esta solicitud/);
  assert.match(calls[3].body.body, /\[seo_report_ready\/test-job\]/);
  assert.equal(calls.length, 4);
});

test('retry finds the existing event note and does not create a duplicate', async () => {
  const calls = [];
  await syncSeoContact(payload, env, async (url, options) => {
    calls.push({ url, method: options.method });
    return Response.json(url.endsWith('/upsert') ? { contact: { id: 'contact-1' } } : { notes: [{ body: 'Report [seo_report_ready/test-job]' }] });
  });
  assert.equal(calls.length, 3);
  assert.equal(calls.some(call => call.url.endsWith('/notes') && call.method === 'POST'), false);
});

test('CRM HTTP errors do not expose provider bodies or tokens', async () => {
  await assert.rejects(syncSeoContact(payload, env, async () => new Response('secret provider details', { status: 401 })), { message: 'crm_http_401' });
});
