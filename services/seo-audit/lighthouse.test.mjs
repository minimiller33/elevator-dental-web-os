import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeLighthouse, collectReport } from './lighthouse.mjs';

const fakeLhr = {
  categories: {
    performance: { score: 0.81 }, seo: { score: 0.92 }, accessibility: { score: 0.96 }, 'best-practices': { score: 0.88 },
  },
  audits: {
    'largest-contentful-paint': { numericValue: 2444 },
    'cumulative-layout-shift': { numericValue: 0.1279 },
    'total-blocking-time': { numericValue: 210 },
    'unused-css-rules': { score: 0, title: 'Reduce el CSS sin uso', details: { type: 'opportunity', overallSavingsMs: 500 }, displayValue: 'Ahorro estimado: 500 ms' },
    'unused-js': { score: 0.5, title: 'Reduce el JavaScript', details: { type: 'opportunity', overallSavingsMs: 100 }, displayValue: 'Ahorro estimado: 100 ms' },
  },
};

test('normalizes Lighthouse scores, metrics and top opportunities for the report', () => {
  const report = collectReport(fakeLhr);
  assert.equal(report.performance, 81);
  assert.equal(report.seo, 92);
  assert.equal(report.lcpMs, 2444);
  assert.equal(report.cls, 0.128);
  assert.equal(report.opportunities[0].title, 'Reduce el CSS sin uso');
});

test('runs one mobile Lighthouse pass through the safe egress proxy and closes resources', async () => {
  let launchOptions; let runOptions; let killed = 0; let closed = 0;
  const result = await analyzeLighthouse('https://example.com/path', {
    proxyFactory: async () => ({ port: 43123, close: async () => { closed++; } }),
    launcher: { launch: async (options) => { launchOptions = options; return { port: 9222, kill: async () => { killed++; } }; } },
    runner: async (url, options) => { runOptions = { url, options }; return { lhr: fakeLhr }; },
  });
  assert.equal(runOptions.url, 'https://example.com/path');
  assert.equal(runOptions.options.formFactor, 'mobile');
  assert.ok(runOptions.options.onlyCategories.includes('seo'));
  assert.ok(launchOptions.chromeFlags.includes('--proxy-bypass-list=<-loopback>'));
  assert.ok(!launchOptions.chromeFlags.some((flag) => flag.includes('host-resolver-rules')));
  assert.ok(launchOptions.chromeFlags.some((flag) => flag.includes('127.0.0.1:43123')));
  assert.equal(result.performance, 81);
  assert.equal(killed, 1);
  assert.equal(closed, 1);
});

test('treats a Lighthouse navigation error as unavailable instead of zero scores', async () => {
  await assert.rejects(analyzeLighthouse('https://example.com', {
    proxyFactory: async () => ({ port: 43123, close: async () => {} }),
    launcher: { launch: async () => ({ port: 9222, kill: async () => {} }) },
    runner: async () => ({ lhr: { runtimeError: { message: 'navigation failed' }, categories: {} } }),
  }), /lighthouse_navigation_failed/);
});
