import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { publicAddress, validateLead, validatePublicHost, reportEmail } from './core.mjs';
import { Store } from './store.mjs';
import { processJob } from './runner.mjs';
import { inspectHtml, fetchPage } from './audit.mjs';

const lead = { firstName: 'Ana', lastName: 'Rojas', clinic: 'Clínica Dental', email: 'ANA@example.com', website: 'example.com/tratamientos?utm_source=x', country: 'Costa Rica', city: 'San José', consent: true };
const html = '<html><head><title>Clínica</title><meta name="viewport" content="width=device-width"></head><body><h1>Clínica</h1><img src="foto.jpg"><p>Odontología</p></body></html>';
const fixture = inspectHtml(html, 'https://example.com/', 'https://example.com/');
const env = { RESEND_API_KEY: 'test', RESEND_FROM: 'test@example.com', PUBLIC_SITE_URL: 'https://elevatordental.com' };

test('validates consent and public website; keeps the submitted page path and strips tracking', () => {
  assert.equal(validateLead(lead).website, 'https://example.com/tratamientos');
  assert.equal(validateLead(lead).email, 'ana@example.com');
  assert.equal(validateLead(lead).marketingConsent, false);
  assert.equal(validateLead({ ...lead, city: '', country: 'Costa Rica' }).country, 'Costa Rica');
  assert.equal(validateLead({ ...lead, city: 'San José', country: '' }).city, 'San José');
  assert.throws(() => validateLead({ ...lead, city: '', country: '' }), /país o la ciudad/);
  for (const website of ['http://127.0.0.1', 'http://[::1]', 'https://user:pass@example.com', 'http://x.local', 'https://example.com:22', 'http://2130706433', 'http://0x7f000001']) assert.throws(() => validateLead({ ...lead, website }));
  assert.throws(() => validateLead({ ...lead, consent: false }));
  assert.throws(() => validateLead({ ...lead, email: 'bad' }));
});
test('rejects nonpublic and mixed DNS records', async () => {
  for (const address of ['127.0.0.1', '10.1.2.3', '169.254.169.254', '192.168.1.1', '192.0.2.1', '198.51.100.1', '198.18.0.1', '203.0.113.1', '100.64.0.1', '240.0.0.1', '::1', '::ffff:127.0.0.1', 'fc00::1', '2001:db8::1']) assert.equal(publicAddress(address), false, address);
  await assert.rejects(validatePublicHost('https://example.com', async () => [{ address: '8.8.8.8' }, { address: '10.0.0.1' }]));
});
test('HTML checks reflect evidence without a global SEO score', () => {
  const report = fixture;
  assert.equal(report.score, null);
  assert.equal(report.priorities.length, 2);
  assert.equal(report.h1Count, 1);
  assert.equal(report.missingAlt, 1);
  assert.equal(report.passedChecks, 5);
  assert.match(report.limitation, /No mide tu posición en Google/);
  assert.ok(!reportEmail({ ...lead, firstName: '<script>bad</script>' }, report, 'https://example.com').html.includes('<script>'));
  const blocked = inspectHtml('<meta name="robots" content="noindex"><h1>A</h1>', 'https://example.com', 'https://example.com');
  assert.equal(blocked.checks.find(c => c.key === 'noindex').passed, false);
});
test('redirects are validated before fetching; private redirects are blocked', async () => {
  let downloaded = 0;
  const resolver = async hostname => [{ address: hostname === 'internal.example.com' ? '127.0.0.1' : '8.8.8.8', family: 4 }];
  await assert.rejects(fetchPage('https://example.com/', resolver, async () => { downloaded++; return { redirect: 'http://internal.example.com/' }; }), /unsafe_target/);
  assert.equal(downloaded, 1);
  await assert.rejects(fetchPage('https://example.com/', resolver, async () => ({ redirect: 'https://example.com/again' })), /too_many_redirects/);
});
test('durable queue resumes and enforces limits and report expiration', () => {
  const dir = mkdtempSync(join(tmpdir(), 'elevator-seo-'));
  try {
    let store = new Store(join(dir, 'test.sqlite'));
    const clean = validateLead(lead);
    const id = store.enqueue(clean, 'ip', 2);
    assert.equal(store.enqueue(clean, 'ip', 2), id);
    store.enqueue({ ...clean, email: 'second@example.com' }, 'ip', 2);
    assert.throws(() => store.enqueue({ ...clean, email: 'third@example.com' }, 'other', 2), /rate_limit/);
    const job = store.next();
    store.update(id, { status: 'processing', report: JSON.stringify(fixture) });
    store.db.close();
    store = new Store(join(dir, 'test.sqlite'));
    assert.equal(store.next().status, 'queued');
    assert.equal(store.report(job.token).clinic, lead.clinic);
    assert.equal(store.report('wrong'), null);
    store.db.prepare('UPDATE jobs SET created=0 WHERE id=?').run(id);
    assert.equal(store.report(job.token), null);
    store.prune();
    store.db.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('email retry uses saved audit, stable payload and idempotency key', async () => {
  const store = new Store(':memory:');
  store.enqueue(validateLead(lead), 'ip');
  let auditCalls = 0; let mailCalls = 0; const mails = [];
  const fetcher = async (url, options) => {
    mailCalls++; mails.push(options);
    return mailCalls === 1 ? new Response('', { status: 503 }) : Response.json({ id: 'email-1' });
  };
  const job = store.next();
  await processJob(store, job, env, fetcher, async () => { auditCalls++; return fixture; });
  store.update(job.id, { next: 0 });
  await processJob(store, store.next(), env, fetcher, async () => { auditCalls++; return fixture; });
  assert.equal(auditCalls, 1);
  assert.equal(mailCalls, 2);
  assert.equal(JSON.parse(mails[0].body).from, 'Elevator Dental <test@example.com>');
  assert.equal(JSON.parse(mails[0].body).reply_to, 'soporte@elevatordental.com');
  assert.equal(mails[0].body, mails[1].body);
  assert.equal(mails[0].headers['Idempotency-Key'], mails[1].headers['Idempotency-Key']);
  assert.equal(store.db.prepare('SELECT status FROM jobs').get().status, 'completed');
  store.db.close();
});
test('CRM retry does not resend email and cache serves a second clinic', async () => {
  const store = new Store(':memory:');
  let auditCalls = 0; let mailCalls = 0; let crmCalls = 0;
  const fetcher = async (url) => {
    if (url.includes('resend')) { mailCalls++; return Response.json({ id: `email-${mailCalls}` }); }
    crmCalls++; return new Response('', { status: crmCalls === 1 ? 503 : 200 });
  };
  const settings = { ...env, GHL_SEO_WEBHOOK_URL: 'https://crm.example.com' };
  store.enqueue(validateLead(lead), 'ip');
  const job = store.next();
  await processJob(store, job, settings, fetcher, async () => { auditCalls++; return fixture; });
  store.update(job.id, { next: 0 });
  await processJob(store, store.next(), settings, fetcher, async () => { auditCalls++; return fixture; });
  assert.equal(mailCalls, 1);
  store.enqueue(validateLead({ ...lead, email: 'another@example.com' }), 'other');
  await processJob(store, store.next(), settings, fetcher, async () => { auditCalls++; return fixture; });
  assert.equal(auditCalls, 1);
  assert.equal(mailCalls, 2);
  store.db.close();
});
