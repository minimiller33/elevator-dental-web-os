import { test } from 'node:test';
import assert from 'node:assert/strict';
import { processJob, seoCrmPayload } from './runner.mjs';

const lead = { firstName: 'Prueba', lastName: 'Elevator', email: 'test@example.com', clinic: 'Clínica de prueba', website: 'https://example.com/', country: 'México', city: 'CDMX', consent: true, marketingConsent: false };
const report = { website: lead.website, passedChecks: 7, totalChecks: 7, checks: [], priorities: [], lighthouse: null };
const env = { PUBLIC_SITE_URL: 'https://elevatordental.com', RESEND_FROM: 'Elevator Dental <soporte@elevatordental.com>', RESEND_API_KEY: 'mock', GHL_SEO_WEBHOOK_URL: 'https://crm.example.com/webhook' };
const job = { id: 'test-job', token: 'a'.repeat(64), created: Date.now(), lead: JSON.stringify(lead), report: JSON.stringify(report), email_id: 'already-sent', attempts: 0, crm_done: 0 };

test('CRM payload includes identity, report and stable event id without inventing a phone number', () => {
  const payload = seoCrmPayload(lead, job, report, env.PUBLIC_SITE_URL);
  assert.equal(payload.first_name, lead.firstName);
  assert.equal(payload.last_name, lead.lastName);
  assert.equal(payload.companyName, lead.clinic);
  assert.equal(payload.event_id, `seo_report_ready/${job.id}`);
  assert.equal(payload.report_url, `${env.PUBLIC_SITE_URL}/informe-seo#token=${job.token}`);
  assert.equal(payload.phone, undefined);
});

test('marketing tag is only sent for explicit opt-in', () => {
  for (const marketingConsent of [false, undefined, 'true']) {
    const payload = seoCrmPayload({ ...lead, marketingConsent }, job, report, env.PUBLIC_SITE_URL);
    assert.deepEqual(payload.tags, ['seo-lead-magnet']);
    assert.equal(payload.marketingConsent, false);
  }
  assert.deepEqual(seoCrmPayload({ ...lead, marketingConsent: true }, job, report, env.PUBLIC_SITE_URL).tags, ['seo-lead-magnet', 'seo-marketing-consent']);
});

test('failed CRM delivery is retried without resending an accepted email', async () => {
  const patches = [];
  const store = { update: (_id, patch) => patches.push(patch) };
  const urls = [];
  await processJob(store, job, env, async url => { urls.push(url); return new Response('', { status: 503 }); });
  assert.deepEqual(urls, [env.GHL_SEO_WEBHOOK_URL]);
  assert.equal(patches.at(-1).status, 'queued');
  assert.equal(patches[0].attempts, 1);
  assert.equal(patches.some(patch => patch.crm_done), false);
});

test('accepted CRM delivery is marked completed and is not repeated', async () => {
  const patches = [];
  let calls = 0;
  const store = { update: (_id, patch) => patches.push(patch) };
  await processJob(store, job, env, async () => { calls++; return new Response('{}', { status: 200 }); });
  assert.equal(calls, 1);
  assert.equal(patches.some(patch => patch.crm_done === 1), true);
  assert.equal(patches.at(-1).status, 'completed');
  await processJob(store, { ...job, crm_done: 1 }, env, () => { throw Error('unexpected webhook'); });
});
