import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { inspectDiscovery } from './discovery.mjs';
import { inspectHtml } from './audit.mjs';
import { presentReport } from './report-copy.mjs';
import { reportEmail } from './core.mjs';
import { seoCrmPayload, processJob } from './runner.mjs';
import { syncSeoContact } from './crm.mjs';
import { Store } from './store.mjs';

const url = 'https://example.com/';
const html = `<html><head><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': ['Organization', 'Dentist'], name: 'Clínica Prueba', address: { '@type': 'PostalAddress', streetAddress: 'Calle Uno' } }, { '@type': 'Person', name: 'Dra. Prueba' }] })}</script></head><body><p>${'Introducción '.repeat(60)}</p><h1>Clínica Prueba</h1><address>Calle Uno, San José</address><a href="tel:+50622222222">Llámanos</a><a href="#cita">Agendar cita</a><section id="cita">Formulario</section><h2>¿Cómo es la primera consulta?</h2><p>El equipo revisa tu situación y explica las opciones durante la valoración.</p><a href="https://external.example.org/">Referencia</a><iframe src="https://www.youtube.com/embed/example"></iframe></body></html>`;
const report = inspectHtml(html, url, url);
const find = (result, key) => result.findings.find(item => item.key === key);

test('reads graph and multi-type schema, matches body beyond first 240 characters and reports evidence without AI score', () => {
  for (const key of ['structured_data', 'identity', 'location', 'contact', 'booking', 'questions']) assert.equal(find(report.discovery, key).status, 'detected', key);
  assert.equal(find(report.discovery, 'professional').status, 'requires_review');
  assert.equal(find(report.discovery, 'sources').status, 'requires_review');
  assert.equal(find(report.discovery, 'media').status, 'requires_review');
  assert.equal(report.passedChecks, 4); // New observations do not alter the seven basic checks.
  assert.equal(report.totalChecks, 7);
  assert.equal(report.score, null);
  assert.equal(report.discovery.score, undefined);
  assert.match(find(report.discovery, 'identity').evidence, /Clínica Prueba/);
});

test('malformed JSON, hidden markup, unrelated identity and dead anchor cannot produce positive evidence', () => {
  const result = inspectDiscovery(load(`<script type="application/ld+json">{invalid}</script><script type="application/ld+json">{"@type":"Dentist","name":"Otra Clínica"}</script><body><div hidden><address>Dirección oculta</address><a href="tel:123">Teléfono</a><h2>¿Pregunta?</h2><p>Respuesta larga que no debe contar porque está oculta.</p></div><a href="#missing">Reservar cita</a><a href="javascript:alert(1)">Agendar</a><a href="">Reservar</a><h1>Clínica real</h1></body>`), url);
  assert.equal(find(result, 'structured_data').status, 'requires_review');
  assert.equal(find(result, 'identity').status, 'requires_review');
  assert.equal(find(result, 'location').status, 'requires_review');
  assert.equal(find(result, 'contact').status, 'not_detected');
  assert.equal(find(result, 'booking').status, 'requires_review');
  assert.equal(find(result, 'questions').status, 'not_detected');
});

test('optional media, authorship and sources never become automatic recommendations to add every feature', () => {
  const discovery = inspectDiscovery(load('<body><h1>Una página</h1></body>'), url);
  assert.equal(find(discovery, 'media').priority, false);
  assert.match(find(discovery, 'media').evidence, /opcional/);
  const copy = presentReport({ discovery });
  assert.equal(copy.priorities.length, 3);
  assert.equal(copy.priorities.some(item => /professional|sources|media/.test(item.key)), false);
  assert.equal(presentReport({ checks: [] }).discovery, null);
  assert.match(presentReport({ checks: [] }).scope, /anterior/);
});

test('email and CRM carry evidence and priorities without unescaped HTML or resending messages', async () => {
  const lead = { firstName: 'Ana', clinic: 'Prueba', email: 'test@example.com', website: url, marketingConsent: false };
  const poisoned = structuredClone(report);
  poisoned.discovery.findings[0].label = '<img src=x onerror=alert(1)>';
  const mail = reportEmail(lead, poisoned, `${url}report`);
  assert.match(mail.text, /Claridad para buscadores e IA/);
  assert.match(mail.html, /&lt;img/);
  assert.doesNotMatch(mail.html, /<img/);
  const payload = seoCrmPayload(lead, { id: 'job', token: 'a'.repeat(64), created: Date.now() }, report, url);
  const calls = [];
  await syncSeoContact(payload, { GHL_API_TOKEN: 'test', GHL_LOCATION_ID: 'location' }, async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(url.endsWith('/upsert') ? { contact: { id: 'one' } } : { notes: [] });
  });
  const note = JSON.parse(calls.at(-1).body).body;
  assert.match(note, /Nombre coincidente: Clínica Prueba/);
  assert.match(note, /Prioridades del informe/);
  assert.match(note, /\[seo_report_ready\/job\]/);
  assert.ok(calls.every(call => !/messages|workflow/.test(call.url)));
  assert.deepEqual(payload.tags, ['seo-lead-magnet']);
});

test('new requests do not reuse old cached reports, while saved reports remain frozen for email retries', async () => {
  const store = new Store(':memory:');
  const lead = { firstName: 'Ana', lastName: 'Rojas', clinic: 'Prueba', email: 'test@example.com', website: url };
  store.cache(url, { ...report, discovery: undefined });
  store.enqueue(lead, 'ip');
  let audits = 0;
  const audit = async () => { audits++; return report; };
  const job = store.next();
  const env = { PUBLIC_SITE_URL: url, RESEND_FROM: 'test@example.com', RESEND_API_KEY: 'test' };
  await processJob(store, job, env, async () => new Response('', { status: 503 }), audit);
  store.update(job.id, { next: 0 });
  await processJob(store, store.next(), env, async () => Response.json({ id: 'accepted' }), audit);
  assert.equal(audits, 1);
  assert.equal(store.db.prepare('SELECT status FROM jobs').get().status, 'completed');
  store.db.close();
});
