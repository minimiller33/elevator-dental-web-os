import http from 'node:http';
import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { load } from 'cheerio';
import { publicAddress } from './core.mjs';
import { analyzeLighthouse } from './lighthouse.mjs';
import { reportScope, reportLimitation } from './report-copy.mjs';
import { inspectDiscovery } from './discovery.mjs';

export async function resolveTarget(value, resolver = lookup) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) throw new Error('unsafe_target');
  const host = url.hostname.replace(/[\[\]]/g, '');
  const addresses = await resolver(host, { all: true });
  if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error('unsafe_target');
  return { url, address: addresses[0] };
}

async function download(target) {
  const { url, address } = target;
  return new Promise((resolve, reject) => {
    // Pin the validated address to this socket, preventing DNS rebinding.
    const transport = url.protocol === 'https:' ? https : http;
    let timer;
    const request = transport.get(url, {
      agent: false,
      lookup: (_hostname, options, callback) => options.all
        ? callback(null, [address]) : callback(null, address.address, address.family),
      headers: { 'User-Agent': 'ElevatorDentalAudit/1.0 (+https://elevatordental.com/diagnostico-seo)', Accept: 'text/html', 'Accept-Encoding': 'identity' },
    }, (response) => {
      const status = response.statusCode || 0;
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        response.destroy(); resolve({ redirect: new URL(response.headers.location, url).href }); return;
      }
      if (status !== 200 || !String(response.headers['content-type'] || '').includes('text/html') ||
        (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity')) {
        response.destroy(); reject(new Error('page_unavailable')); return;
      }
      const chunks = []; let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > 2_000_000) { request.destroy(new Error('page_too_large')); return; }
        chunks.push(chunk);
      });
      response.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), headers: response.headers }));
      response.on('error', reject);
      response.on('aborted', () => reject(new Error('page_aborted')));
    });
    timer = setTimeout(() => request.destroy(new Error('page_timeout')), 15_000);
    request.on('error', reject);
    request.on('close', () => clearTimeout(timer));
  });
}

export async function fetchPage(website, resolver = lookup, downloader = download) {
  let current = website;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const target = await resolveTarget(current, resolver);
    const page = await downloader(target);
    if (page.redirect) { current = page.redirect; continue; }
    return { ...page, resolvedUrl: target.url.href };
  }
  throw new Error('too_many_redirects');
}

export function inspectHtml(html, website, resolvedUrl, headers = {}, city = '') {
  const $ = load(html);
  const title = $('title').first().text().trim();
  const description = $('meta[name="description" i]').attr('content')?.trim() || '';
  const robots = `${$('meta[name="robots" i]').attr('content') || ''} ${$('meta[name="googlebot" i]').attr('content') || ''} ${headers['x-robots-tag'] || ''}`;
  const h1Count = $('h1').length;
  const images = $('img');
  const missingAlt = images.filter((_index, image) => $(image).attr('alt') === undefined && $(image).attr('role') !== 'presentation' && $(image).attr('aria-hidden') !== 'true').length;
  const canonical = $('link[rel="canonical" i]').attr('href') || '';
  const viewport = $('meta[name="viewport" i]').attr('content') || '';
  const checks = [
    { key: 'https', label: 'Conexión HTTPS', passed: new URL(resolvedUrl).protocol === 'https:', action: 'Activa HTTPS para proteger la conexión a la web.' },
    { key: 'title', label: 'Título presente', passed: !!title, action: 'Añade un título que identifique la clínica y su ubicación.' },
    { key: 'description', label: 'Descripción presente', passed: !!description, action: 'Escribe una descripción que explique los servicios de la clínica.' },
    { key: 'h1', label: 'Un encabezado principal H1', passed: h1Count === 1, action: 'Revisa los encabezados para que la página tenga un H1 principal claro.' },
    { key: 'noindex', label: 'Sin directiva noindex detectada', passed: !/\b(noindex|none)\b/i.test(robots), action: 'Revisa la directiva noindex: puede impedir que esta página aparezca en buscadores.' },
    { key: 'alt', label: 'Imágenes sin alt ausente', passed: missingAlt === 0, action: `Revisa ${missingAlt} imágenes sin atributo alt; describe las informativas y marca las decorativas.` },
    { key: 'viewport', label: 'Configuración de ancho móvil', passed: /width\s*=\s*device-width/i.test(viewport), action: 'Configura el viewport para adaptar el ancho de la página a dispositivos móviles.' },
  ];
  const discovery = inspectDiscovery($, resolvedUrl);
  $('script, style, noscript, template').remove();
  const visibleText = $('body').text().replace(/\s+/g, ' ').trim();
  const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const issues = checks.filter((check) => !check.passed).map(({ key, action }) => ({ key, action }));
  return {
    source: 'Elevator Dental', scope: reportScope, discovery,
    analyzedAt: new Date().toISOString(), website, resolvedUrl, score: null,
    passedChecks: checks.filter((check) => check.passed).length, totalChecks: checks.length, checks,
    title: title || null, description: description || null, h1Count,
    words: visibleText ? visibleText.split(/\s+/).length : 0,
    images: images.length, missingAlt, canonical: canonical || null,
    cityMentioned: city ? normalize(visibleText).includes(normalize(city)) : null,
    issues, priorities: issues.slice(0, 3),
    limitation: reportLimitation,
  };
}

export async function auditWebsite(website, lighthouseAnalyzer = analyzeLighthouse) {
  const page = await fetchPage(website);
  const report = inspectHtml(page.html, website, page.resolvedUrl, page.headers);
  try { report.lighthouse = await lighthouseAnalyzer(page.resolvedUrl); }
  catch { report.lighthouse = null; }
  return report;
}
