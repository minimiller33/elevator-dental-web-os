import { presentReport } from './report-copy.mjs';
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

export function publicAddress(address) {
  try { return ipaddr.parse(address).range() === 'unicast'; }
  catch { return false; }
}

export function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Revisa los datos del formulario.');
  const lead = {};
  for (const [key, max] of Object.entries({ firstName: 80, lastName: 100, email: 254, clinic: 160, website: 2048 })) {
    if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > max || /[\u0000-\u001f]/.test(input[key])) throw new Error('Completa todos los campos con datos válidos.');
    lead[key] = input[key].trim();
  }
  for (const [key, max] of Object.entries({ country: 100, city: 120 })) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f]/.test(value)) throw new Error('Revisa la ubicación de la clínica.');
    lead[key] = value.trim();
  }
  if (!lead.country && !lead.city) throw new Error('Completa el país o la ciudad de tu clínica.');
  lead.email = lead.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error('Revisa tu email.');
  if (input.consent !== true) throw new Error('Autoriza el procesamiento para recibir el diagnóstico.');
  const url = new URL(/^https?:\/\//i.test(lead.website) ? lead.website : `https://${lead.website}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      (url.port && !['80', '443'].includes(url.port)) || !url.hostname.includes('.') ||
      ipaddr.isValid(url.hostname.replace(/[\[\]]/g, '')) || /\.(local|internal|localhost|test|invalid)$/i.test(url.hostname)) throw new Error('Usa el dominio público de la clínica.');
  url.hash = ''; url.search = '';
  // Audit exactly one submitted page; discard tracking parameters and fragments.
  lead.website = url.href;
  lead.consent = true;
  lead.marketingConsent = input.marketingConsent === true;
  lead.consentVersion = 'seo-diagnosis-v1';
  return lead;
}

export async function validatePublicHost(website, resolver = lookup) {
  const addresses = await resolver(new URL(website).hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error('El dominio no resuelve a una web pública.');
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function reportEmail(lead, report, link) {
  const copy = presentReport(report);
  const priorities = copy.priorities.length ? copy.priorities.map(({ action }) => action) : ['Revisa si tus páginas de tratamientos explican tus servicios y facilitan pedir una cita.'];
  const mobile = report.lighthouse?.performance == null ? 'No pudimos medir la velocidad de carga en esta visita.' : `Velocidad de carga en celular: ${report.lighthouse.performance}/100.`;
  const clarityText = copy.discovery ? `\n\nClaridad para buscadores e IA:\n${copy.discovery.findings.map(item => `${item.statusLabel}: ${item.label}`).join('\n')}\nEstas observaciones no miden si una IA recomienda tu clínica. Abre el informe para ver la evidencia.` : '';
  const clarityHtml = copy.discovery ? `<h2>Claridad para buscadores e IA</h2><ul>${copy.discovery.findings.map(item => `<li>${escapeHtml(item.statusLabel)}: ${escapeHtml(item.label)}</li>`).join('')}</ul><p>Estas observaciones no miden si una IA recomienda tu clínica. Abre el informe para ver la evidencia.</p>` : '';
  const text = `Hola ${lead.firstName},\n\nTu diagnóstico de ${lead.clinic} está listo.\nPágina revisada: ${report.website}\n${report.passedChecks} de ${report.totalChecks} comprobaciones básicas correctas.\n${mobile}\n\n${copy.summary}${clarityText}\n\nPor dónde empezar:\n${priorities.join('\n')}\n\nVer mi diagnóstico: ${link}\n\n${copy.limitation}\n\nElevator Dental`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#142036;padding:32px"><p>ELEVATOR DENTAL</p><h1>Tu diagnóstico está listo.</h1><p>Hola ${escapeHtml(lead.firstName)}, revisamos la página que compartiste de ${escapeHtml(lead.clinic)}.</p><p><strong>${escapeHtml(report.passedChecks)} de ${escapeHtml(report.totalChecks)} comprobaciones básicas correctas.</strong></p><p>${escapeHtml(mobile)}</p><p>${escapeHtml(copy.summary)}</p>${clarityHtml}<h2>Por dónde empezar</h2><ol>${priorities.map((action) => `<li style="margin-bottom:14px">${escapeHtml(action)}</li>`).join('')}</ol><p><a href="${escapeHtml(link)}" style="display:inline-block;background:#1858fb;color:white;padding:16px 22px;border-radius:8px">Ver mi diagnóstico</a></p><p style="font-size:12px;color:#5b6576">${escapeHtml(copy.limitation)}</p><p>Elevator Dental</p></div>`;
  return { text, html };
}
