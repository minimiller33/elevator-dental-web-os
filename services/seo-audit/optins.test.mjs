import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OptinStore, validateOptin, processOptin, optinCrmPayload, syncOptinContact, optinConfigured } from './optins.mjs';
const input = { nombre: 'Dra. Ana López', email: 'ANA@example.com', perfil: 'dueno_clinica', telefono: '', lead_magnet: 'WEB', acepta_privacidad: true };
const env = { GHL_API_TOKEN: 'mock', GHL_LOCATION_ID: 'x0nGR8XQgQcKfNmKAhLj' };
function crmMock() {
  const state = { calls: [], notes: [], failAfterNote: false, failTag: false };
  state.fetcher = async (url, options) => {
    assert.ok(url.startsWith('https://services.leadconnectorhq.com/'), 'Only CRM requests are allowed; never email or messaging');
    const body = options.body ? JSON.parse(options.body) : null;
    state.calls.push({ url, ...options, body });
    if (url.endsWith('/contacts/upsert')) return Response.json({ contact: { id: 'contact-1', locationId: env.GHL_LOCATION_ID } });
    if (url.endsWith('/notes') && options.method === 'GET') return Response.json({ notes: state.notes });
    if (url.endsWith('/notes') && options.method === 'POST') {
      state.notes.push({ body: body.body });
      if (state.failAfterNote) { state.failAfterNote = false; throw new Error('Connection lost after commit'); }
      return Response.json({ id: 'note-1' });
    }
    if (url.endsWith('/tags') && state.failTag) return new Response('', { status: 503 });
    return Response.json({ ok: true });
  };
  return state;
}
test('validates consent, identity, magnet, optional phone and Mexico default', () => {
  assert.equal(validateOptin(input).email, 'ana@example.com');
  assert.equal(validateOptin({ ...input, telefono: '55 1234 5678' }).telefono, '+525512345678');
  assert.equal(validateOptin({ ...input, telefono: '+506 8888 8888' }).telefono, '+50688888888');
  for (const patch of [{ acepta_privacidad: false }, { perfil: 'x' }, { lead_magnet: 'X' }, { email: 'a\nb@example.com' }, { nombre: '<script>' }, { telefono: '123' }, { honeypot: 'bot' }]) assert.throws(() => validateOptin({ ...input, ...patch }));
});
test('upsert preserves an existing phone when omitted and appends tags without replacing other tags', async () => {
  const mock = crmMock(), payload = optinCrmPayload(validateOptin(input), 'test-id');
  await syncOptinContact(payload, env, mock.fetcher, { perfil: 'profile-field', lead_magnet: 'magnet-field' });
  const upsert = mock.calls[0].body;
  assert.equal(upsert.email, 'ana@example.com'); assert.equal(upsert.locationId, env.GHL_LOCATION_ID);
  assert.equal(Object.hasOwn(upsert, 'phone'), false); assert.equal(Object.hasOwn(upsert, 'tags'), false);
  assert.deepEqual(upsert.customFields, [{ id: 'profile-field', fieldValue: 'dueno_clinica' }, { id: 'magnet-field', fieldValue: 'WEB' }]);
  assert.deepEqual(mock.calls.filter(c => c.url.endsWith('/tags')).map(c => c.body.tags), [['edw-optin-web'], ['edw-optin-pending']]);
  assert.match(mock.notes[0].body, /\[edw_optin\/test-id\]/); assert.match(mock.notes[0].body, /Sin envío de email/);
});
test('queue deduplicates one resource but preserves separate requests for different resources', () => {
  const store = new OptinStore(':memory:');
  const a = store.enqueue(validateOptin(input), 'ip');
  assert.equal(store.enqueue(validateOptin(input), 'ip'), a);
  assert.notEqual(store.enqueue(validateOptin({ ...input, lead_magnet: 'IA' }), 'ip'), a);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM optins').get().n, 2);
  store.db.close();
});
test('v3 custom fields use key and fieldValue for UI field keys', async () => {
  const mock = crmMock();
  await syncOptinContact(optinCrmPayload(validateOptin(input), 'key-test'), env, mock.fetcher, { perfil: 'contact.edw_optin_perfil' });
  assert.deepEqual(mock.calls[0].body.customFields, [{ key: 'edw_optin_perfil', fieldValue: 'dueno_clinica' }]);
});
test('there is no global quota of 20 and email configuration is unnecessary', () => {
  const store = new OptinStore(':memory:');
  for (let i = 0; i < 25; i++) store.enqueue(validateOptin({ ...input, email: 'test' + i + '@example.com' }), 'ip' + i);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM optins').get().n, 25);
  assert.equal(optinConfigured({ ...env, GHL_LOCATION_ID: 'another-clinic' }), false);
  store.db.close();
});
test('a retry after a note was committed keeps one event note and makes no email request', async () => {
  const store = new OptinStore(':memory:'), mock = crmMock();
  const id = store.enqueue(validateOptin(input), 'ip'); mock.failAfterNote = true;
  await processOptin(store, store.next(), env, mock.fetcher);
  assert.equal(store.db.prepare('SELECT status FROM optins WHERE id=?').get(id).status, 'queued');
  store.update(id, { next: 0 });
  await processOptin(store, store.next(), env, mock.fetcher);
  const row = store.db.prepare('SELECT * FROM optins WHERE id=?').get(id);
  assert.equal(row.status, 'completed'); assert.equal(row.crm_done, 1); assert.equal(row.contact_id, 'contact-1');
  assert.equal(mock.notes.length, 1); assert.equal(mock.calls.filter(c => c.url.endsWith('/notes') && c.method === 'POST').length, 1);
  store.db.close();
});
test('resubmission converts a historical email-only record to CRM without resending emails', async () => {
  const store = new OptinStore(':memory:'), mock = crmMock();
  const id = store.enqueue(validateOptin(input), 'ip');
  store.db.prepare("UPDATE optins SET status='completed',crm_payload=NULL,guide_id='old-guide',notice_id='old-notice' WHERE id=?").run(id);
  assert.equal(store.enqueue(validateOptin(input), 'ip'), id);
  await processOptin(store, store.next(), env, mock.fetcher);
  const row = store.db.prepare('SELECT * FROM optins WHERE id=?').get(id);
  assert.equal(row.crm_done, 1); assert.equal(row.guide_id, 'old-guide'); assert.equal(row.notice_id, 'old-notice');
  store.db.close();
});
test('wrong location and a failed CRM never report completion or start the workflow', async () => {
  const mock = crmMock();
  await assert.rejects(() => syncOptinContact(optinCrmPayload(validateOptin(input), 'x'), { ...env, GHL_LOCATION_ID: 'other' }, mock.fetcher), /configuration/);
  assert.equal(mock.calls.length, 0);
  const store = new OptinStore(':memory:'); const id = store.enqueue(validateOptin(input), 'ip');
  mock.failTag = true;
  await processOptin(store, { ...store.next(), attempts: 5 }, env, mock.fetcher);
  assert.equal(store.db.prepare('SELECT status FROM optins WHERE id=?').get(id).status, 'failed');
  assert.equal(mock.calls.some(c => c.body?.tags?.includes('edw-optin-pending')), false); store.db.close();
});
