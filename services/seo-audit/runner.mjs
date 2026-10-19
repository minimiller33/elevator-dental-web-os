import { reportEmail } from './core.mjs';
import { auditWebsite } from './audit.mjs';
import { syncSeoContact } from './crm.mjs';
import { discoveryVersion } from './discovery.mjs';
import { presentReport } from './report-copy.mjs';

export async function apiJson(url, options, fetcher = fetch) {
  const response = await fetcher(url, { ...options, signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`provider_http_${response.status}`);
  return response.json();
}

export function seoCrmPayload(lead, job, report, publicSiteUrl) {
  return {
    ...lead,
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    full_name: `${lead.firstName} ${lead.lastName}`.trim(),
    first_name: lead.firstName,
    last_name: lead.lastName,
    companyName: lead.clinic,
    lead_id: job.id,
    event_id: `seo_report_ready/${job.id}`,
    event_type: 'seo_report_ready',
    source: 'Elevator Dental SEO',
    tags: ['seo-lead-magnet', ...(lead.marketingConsent === true ? ['seo-marketing-consent'] : [])],
    marketingConsent: lead.marketingConsent === true,
    consent_at: new Date(job.created).toISOString(),
    passed_checks: report.passedChecks,
    total_checks: report.totalChecks,
    discovery: report.discovery || null,
    priorities: presentReport(report).priorities,
    lighthouse_performance: report.lighthouse?.performance ?? null,
    lighthouse_seo: report.lighthouse?.seo ?? null,
    report_url: `${publicSiteUrl}/informe-seo#token=${job.token}`,
  };
}

export async function processJob(store, job, env, fetcher = fetch, audit = auditWebsite) {
  const lead = JSON.parse(job.lead);
  store.update(job.id, { status: 'processing', attempts: job.attempts + 1 });
  try {
    let report = job.report ? JSON.parse(job.report) : store.cached(lead.website);
    // Recompute old cache entries for new requests; preserve reports already in flight.
    if (!job.report && report?.discovery?.version !== discoveryVersion) report = null;
    if (!report) {
      report = await audit(lead.website);
      store.cache(lead.website, report);
    }
    store.update(job.id, { report: JSON.stringify(report) });
    if (!job.email_id) {
      // Freeze payload before sending so an interrupted retry has the same body.
      const mail = job.mail ? JSON.parse(job.mail) : {
        from: `Elevator Dental <${env.RESEND_FROM.match(/<([^<>]+)>/)?.[1] || env.RESEND_FROM}>`, reply_to: 'soporte@elevatordental.com', to: [lead.email], subject: `Diagnóstico SEO de ${lead.clinic}`,
        ...reportEmail(lead, report, `${env.PUBLIC_SITE_URL}/informe-seo#token=${job.token}`),
      };
      store.update(job.id, { mail: JSON.stringify(mail) });
      if (Date.now() - job.created > 20 * 3_600_000) throw new Error('email_retry_window_expired');
      const sent = await apiJson('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `seo-report/${job.id}` },
        body: JSON.stringify(mail),
      }, fetcher);
      if (!sent.id) throw new Error('email_not_accepted');
      store.update(job.id, { email_id: sent.id });
    }
    if (env.GHL_API_TOKEN && env.GHL_LOCATION_ID && !job.crm_done) {
      await syncSeoContact(seoCrmPayload(lead, job, report, env.PUBLIC_SITE_URL), env, fetcher);
      store.update(job.id, { crm_done: 1 });
    } else if (env.GHL_SEO_WEBHOOK_URL && !job.crm_done) {
      const response = await fetcher(env.GHL_SEO_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000),
        body: JSON.stringify(seoCrmPayload(lead, job, report, env.PUBLIC_SITE_URL)),
      });
      if (!response.ok) throw new Error(`crm_http_${response.status}`);
      store.update(job.id, { crm_done: 1 });
    }
    store.update(job.id, { status: 'completed' });
  } catch (error) {
    const attempts = job.attempts + 1;
    store.update(job.id, { status: attempts >= 3 ? 'failed' : 'queued', next: Date.now() + attempts * 60_000 });
    // No clinic information, email addresses, tokens or provider response bodies in logs.
    console.error('SEO job failed', job.id, error instanceof Error && /^[a-z_]+(?:_\d+)?$/.test(error.message) ? error.message : 'processing_error');
  }
}
