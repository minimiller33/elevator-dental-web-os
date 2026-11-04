import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import catalog from './optin-catalog.json' with { type: 'json' };

import fields from './optin-fields.json' with { type: 'json' };
const LOCATION = 'x0nGR8XQgQcKfNmKAhLj';
const digest = value => createHash('sha256').update(value).digest('hex');
const clean = (value, max = 200) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function validateOptin(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid_input');
  const magnet = catalog.find(m => m.kw === input.lead_magnet);
  const nombre = clean(input.nombre, 120), email = clean(input.email, 254).toLowerCase();
  let telefono = clean(input.telefono, 40);
  if (!magnet || nombre.length < 2 || !/\p{L}/u.test(nombre) || /[<>\r\n\u0000-\u001f]/.test(nombre) || !emailPattern.test(email) || /[\r\n]/.test(email) || !['independiente', 'dueno_clinica'].includes(input.perfil) || input.acepta_privacidad !== true || input.honeypot) throw new Error('invalid_input');
  if (telefono) {
    if (!/^[+\d\s().-]+$/.test(telefono)) throw new Error('invalid_phone');
    const digits = telefono.replace(/\D/g, '');
    telefono = !telefono.startsWith('+') && digits.length === 10 ? `+52${digits}` : `+${digits}`;
    if (!/^\+[1-9]\d{7,14}$/.test(telefono)) throw new Error('invalid_phone');
  }
  return { nombre, email, telefono, perfil: input.perfil, lead_magnet: magnet.kw, landing_page: magnet.slug, utm_source: clean(input.utm_source), utm_medium: clean(input.utm_medium), utm_campaign: clean(input.utm_campaign), acepta_privacidad: true, consent_version: 'recursos-ghl-2026-11-03', consent_at: new Date().toISOString() };
}
export function optinConfigured(env) {
  return !!(env.GHL_API_TOKEN && env.GHL_LOCATION_ID === LOCATION && fields.perfil && fields.lead_magnet);
}
export function optinCrmPayload(lead, id) {
  const m = catalog.find(item => item.kw === lead.lead_magnet);
  return { ...lead, event_id: `edw_optin/${id}`, resource_name: m.name, tags: [`edw-optin-${m.id}`] };
}
export class OptinStore {
  constructor(path) {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS optins(id TEXT PRIMARY KEY,email TEXT NOT NULL,magnet TEXT NOT NULL,ip TEXT NOT NULL,lead TEXT NOT NULL,created INTEGER NOT NULL,status TEXT NOT NULL,attempts INTEGER DEFAULT 0,next INTEGER DEFAULT 0,messages TEXT NOT NULL,guide_id TEXT,notice_id TEXT);
      CREATE INDEX IF NOT EXISTS optins_created ON optins(created);
      CREATE INDEX IF NOT EXISTS optins_identity ON optins(email,magnet,created);`);
    const columns = new Set(this.db.prepare('PRAGMA table_info(optins)').all().map(column => column.name));
    for (const [name, type] of [['crm_payload', 'TEXT'], ['crm_done', 'INTEGER DEFAULT 0'], ['contact_id', 'TEXT']]) {
      if (!columns.has(name)) this.db.exec(`ALTER TABLE optins ADD COLUMN ${name} ${type}`);
    }
    this.db.exec("UPDATE optins SET status='queued' WHERE status='processing'; UPDATE optins SET status='failed' WHERE status='queued' AND attempts>=6;");
  }
  enqueue(lead, ip) {
    const now = Date.now();
    const existing = this.db.prepare('SELECT id,status,crm_done FROM optins WHERE email=? AND magnet=? AND created>? ORDER BY created DESC LIMIT 1').get(digest(lead.email), lead.lead_magnet, now - 86400000);
    if (existing) {
      if (existing.status === 'failed') throw new Error('delivery_unavailable');
      // Resubmitting a previous email-only record explicitly opts into the new capture.
      if (existing.status === 'completed' && !existing.crm_done) this.db.prepare("UPDATE optins SET status='queued',attempts=0,next=0,lead=?,crm_payload=? WHERE id=?").run(JSON.stringify(lead), JSON.stringify(optinCrmPayload(lead, existing.id)), existing.id);
      return existing.id;
    }
    // Abuse controls only; no global daily cap tied to email quotas.
    if (this.db.prepare('SELECT count(*) AS n FROM optins WHERE ip=? AND created>?').get(digest(ip), now - 3600000).n >= 14 || this.db.prepare('SELECT count(*) AS n FROM optins WHERE email=? AND created>?').get(digest(lead.email), now - 86400000).n >= 7) throw new Error('rate_limit');
    const id = randomUUID();
    this.db.prepare('INSERT INTO optins(id,email,magnet,ip,lead,created,status,messages,crm_payload) VALUES(?,?,?,?,?,?,?,?,?)').run(id, digest(lead.email), lead.lead_magnet, digest(ip), JSON.stringify(lead), now, 'queued', '{}', JSON.stringify(optinCrmPayload(lead, id)));
    return id;
  }
  next() { return this.db.prepare("SELECT * FROM optins WHERE status='queued' AND next<=? ORDER BY created LIMIT 1").get(Date.now()); }
  update(id, patch) {
    const entries = Object.entries(patch);
    if (!entries.length || entries.some(([key]) => !['status', 'attempts', 'next', 'crm_payload', 'crm_done', 'contact_id'].includes(key))) throw new Error('invalid_patch');
    this.db.prepare(`UPDATE optins SET ${entries.map(([key]) => `${key}=?`).join(',')} WHERE id=?`).run(...entries.map(([, value]) => value), id);
  }
  prune() { this.db.prepare('DELETE FROM optins WHERE created<?').run(Date.now() - 30 * 86400000); }
}
export async function syncOptinContact(payload, env, fetcher = fetch, fieldMap = fields) {
  if (!env.GHL_API_TOKEN || env.GHL_LOCATION_ID !== LOCATION) throw new Error('crm_configuration');
  async function api(path, method = 'GET', body) {
    const response = await fetcher(`https://services.leadconnectorhq.com${path}`, { method, headers: { Authorization: `Bearer ${env.GHL_API_TOKEN}`, Version: 'v3', 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000), ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!response.ok) throw new Error(`crm_http_${response.status}`);
    return response.json();
  }
  const names = payload.nombre.split(/\s+/);
  const result = await api('/contacts/upsert', 'POST', {
    locationId: LOCATION, firstName: names[0], lastName: names.slice(1).join(' '), email: payload.email,
    ...(payload.telefono ? { phone: payload.telefono } : {}),
    source: 'Elevator Dental Web · Recursos', createNewIfDuplicateAllowed: false,
    customFields: Object.entries(fieldMap).map(([key, reference]) => ({
      ...(reference.startsWith('contact.') ? { key: reference.slice('contact.'.length) } : { id: reference }),
      fieldValue: key === 'acepta_privacidad' ? 'Sí' : String(payload[key] ?? ''),
    })),
  });
  const contactId = result.contact?.id;
  if (typeof contactId !== 'string' || !contactId) throw new Error('crm_contact_missing');
  if (result.contact.locationId && result.contact.locationId !== LOCATION) throw new Error('crm_location_mismatch');
  const path = `/contacts/${encodeURIComponent(contactId)}`;
  await api(`${path}/tags`, 'POST', { tags: payload.tags });
  const marker = `[${payload.event_id}]`;
  const notes = await api(`${path}/notes`);
  if (!Array.isArray(notes.notes)) throw new Error('crm_notes_unavailable');
  if (!notes.notes.some(note => typeof note.body === 'string' && note.body.includes(marker))) {
    const labels = { nombre: 'Nombre', email: 'Correo', telefono: 'WhatsApp', lead_magnet: 'Palabra clave', resource_name: 'Recurso', landing_page: 'Página', utm_source: 'UTM origen', utm_medium: 'UTM medio', utm_campaign: 'UTM campaña', consent_at: 'Consentimiento (UTC)', consent_version: 'Versión del consentimiento' };
    const body = ['Elevator Dental Web · Opt-in de recurso gratuito', ...Object.entries(labels).map(([key, label]) => `${label}: ${payload[key] || 'No indicado'}`), `Perfil: ${payload.perfil === 'independiente' ? 'Dentista independiente con consultorio' : 'Dueño o dueña de clínica'}`, 'Consentimiento: aceptó registrar su solicitud y acceder al recurso.', 'Entrega: descarga en la página. Sin envío de email, SMS o WhatsApp.', marker].join('\n');
    await api(`${path}/notes`, 'POST', { body });
  }
  // Start the dedicated workflow only after identity, fields and history are saved.
  await api(`${path}/tags`, 'POST', { tags: ['edw-optin-pending'] });
  return { contactId };
}
export async function processOptin(store, job, env, fetcher = fetch) {
  const attempts = job.attempts + 1;
  store.update(job.id, { status: 'processing', attempts });
  try {
    const payload = job.crm_payload ? JSON.parse(job.crm_payload) : optinCrmPayload(JSON.parse(job.lead), job.id);
    if (!job.crm_payload) store.update(job.id, { crm_payload: JSON.stringify(payload) });
    const { contactId } = await syncOptinContact(payload, env, fetcher);
    store.update(job.id, { status: 'completed', crm_done: 1, contact_id: contactId });
  } catch (error) {
    store.update(job.id, { status: attempts >= 6 ? 'failed' : 'queued', next: Date.now() + Math.min(60, 2 ** attempts) * 60000 });
    console.error('Opt-in CRM sync failed', job.id, error instanceof Error && /^crm_[a-z_]+(?:_\d+)?$/.test(error.message) ? error.message : 'sync_error');
  }
}
