const API = 'https://services.leadconnectorhq.com';
import { discoveryStatusLabels } from './discovery.mjs';

function countryCode(value = '') {
  const name = value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
  return ({ mexico: 'MX', mx: 'MX', colombia: 'CO', co: 'CO', 'costa rica': 'CR', cr: 'CR', 'estados unidos': 'US', 'united states': 'US', usa: 'US', us: 'US', eeuu: 'US' })[name];
}

export async function syncSeoContact(payload, env, fetcher = fetch) {
  async function api(path, method = 'GET', body) {
    const response = await fetcher(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${env.GHL_API_TOKEN}`, Version: 'v3', 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw new Error(`crm_http_${response.status}`);
    return response.json();
  }

  const country = countryCode(payload.country);
  const result = await api('/contacts/upsert', 'POST', {
    locationId: env.GHL_LOCATION_ID,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    companyName: payload.clinic,
    website: payload.website,
    ...(payload.city ? { city: payload.city } : {}),
    ...(country ? { country } : {}),
    source: payload.source,
    createNewIfDuplicateAllowed: false,
    // Never pass tags here: upsert would replace the contact's other tags.
  });
  const contactId = result.contact?.id;
  if (typeof contactId !== 'string' || !contactId) throw new Error('crm_contact_missing');
  const contactPath = `/contacts/${encodeURIComponent(contactId)}`;
  await api(`${contactPath}/tags`, 'POST', { tags: payload.tags });

  // A response can be lost after GHL commits a note. Look for the stable event
  // marker before appending, so retries keep one note per report.
  const marker = `[${payload.event_id}]`;
  const notes = await api(`${contactPath}/notes`);
  if (!Array.isArray(notes.notes)) throw new Error('crm_notes_unavailable');
  if (!notes.notes.some(note => typeof note.body === 'string' && note.body.includes(marker))) {
    const body = [
      'Elevator Dental · Diagnóstico SEO solicitado',
      `Clínica: ${payload.clinic}`,
      `Ubicación: ${[payload.city, payload.country].filter(Boolean).join(', ')}`,
      `Página analizada: ${payload.website}`,
      `Informe: ${payload.report_url}`,
      `Controles básicos correctos: ${payload.passed_checks}/${payload.total_checks}`,
      ...(payload.discovery ? [
        'Claridad para buscadores e IA (observaciones de una página, sin puntuación de visibilidad):',
        ...payload.discovery.findings.map(finding => `${discoveryStatusLabels[finding.status] || 'Requiere revisión'} · ${finding.label}: ${finding.evidence}\nAcción: ${finding.action}`),
        payload.discovery.limitation,
      ] : []),
      ...(payload.priorities?.length ? ['Prioridades del informe:', ...payload.priorities.map((item, index) => `${index + 1}. ${item.action}`)] : []),
      `Autorización para procesar el diagnóstico: ${payload.consent === true ? 'Sí' : 'No'}`,
      `Consejos y novedades por email: ${payload.marketingConsent === true ? 'Sí, aceptado' : 'No aceptado en esta solicitud'}`,
      `Fecha de autorización: ${payload.consent_at}`,
      `Versión del consentimiento: ${payload.consentVersion || 'seo-diagnosis-v1'}`,
      marker,
    ].join('\n');
    await api(`${contactPath}/notes`, 'POST', { body });
  }
  return { contactId };
}
