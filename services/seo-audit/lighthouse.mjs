import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { startSafeProxy } from './safe-proxy.mjs';

const round = (value, digits = 0) => Number.isFinite(value) ? Number(value.toFixed(digits)) : null;

function collectReport(lhr) {
  const audits = lhr.audits || {};
  const categoryScore = (id) => {
    const score = lhr.categories?.[id]?.score;
    return typeof score === 'number' ? Math.round(score * 100) : null;
  };
  const metric = (id, digits = 0) => round(audits[id]?.numericValue, digits);
  const opportunities = Object.values(audits)
    .filter((audit) => audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 1 && audit.title)
    .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
    .slice(0, 3)
    .map((audit) => ({ title: audit.title, displayValue: audit.displayValue || '', savingsMs: round(audit.details?.overallSavingsMs) }));
  return {
    performance: categoryScore('performance'), seo: categoryScore('seo'), accessibility: categoryScore('accessibility'), bestPractices: categoryScore('best-practices'),
    lcpMs: metric('largest-contentful-paint'), cls: metric('cumulative-layout-shift', 3), tbtMs: metric('total-blocking-time'), fcpMs: metric('first-contentful-paint'), speedIndexMs: metric('speed-index'),
    opportunities,
  };
}

export async function analyzeLighthouse(website, { runner = lighthouse, launcher = chromeLauncher, proxyFactory = startSafeProxy, timeoutMs = 110_000 } = {}) {
  const proxy = await proxyFactory();
  let chrome;
  let timer;
  try {
    chrome = await launcher.launch({
      chromeFlags: [
        '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-extensions',
        '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-quic',
        '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
        `--proxy-server=http://127.0.0.1:${proxy.port}`, '--proxy-bypass-list=<-loopback>',
      ],
    });
    const run = runner(website, {
      port: chrome.port, output: 'json', logLevel: 'error', formFactor: 'mobile',
      throttlingMethod: 'simulate', onlyCategories: ['performance', 'seo', 'accessibility', 'best-practices'],
    });
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => { chrome.kill(); reject(new Error('lighthouse_timeout')); }, timeoutMs);
    });
    const { lhr } = await Promise.race([run, timeout]);
    if (lhr.runtimeError) throw new Error('lighthouse_navigation_failed');
    const report = collectReport(lhr);
    if (report.performance === null && report.seo === null) throw new Error('lighthouse_scores_unavailable');
    return report;
  } finally {
    clearTimeout(timer);
    if (chrome) await chrome.kill();
    await proxy.close();
  }
}

export { collectReport };
