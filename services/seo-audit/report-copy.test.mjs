import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presentReport } from './report-copy.mjs';
import { reportEmail } from './core.mjs';

test('existing technical reports become readable and flag slow pages despite all basic checks passing', () => {
  const report = { website: 'https://example.com', passedChecks: 7, totalChecks: 7, source: 'Lighthouse', limitation: 'Lighthouse HTML', checks: [{ key: 'h1', label: 'H1', passed: true }], issues: [], priorities: [], lighthouse: { performance: 51, opportunities: [{ title: 'Reduce unused JavaScript', displayValue: 'Est savings of 237 KiB' }, { title: 'Reduce unused CSS' }] } };
  const copy = presentReport(report);
  assert.match(copy.summary, /velocidad.*puede mejorar/);
  assert.equal(copy.priorities.length, 2);
  assert.doesNotMatch(JSON.stringify(copy), /Lighthouse|JavaScript|CSS|KiB|H1|HTML|noindex/);
  const mail = reportEmail({ firstName: '<Ana>', clinic: 'Clínica' }, report, 'https://example.com/informe');
  assert.doesNotMatch(mail.text + mail.html, /Lighthouse|JavaScript|CSS|KiB|H1|HTML|noindex/);
  assert.match(mail.html, /&lt;Ana&gt;/);
  assert.match(mail.text, /Por dónde empezar/);
});
