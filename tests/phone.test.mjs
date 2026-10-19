import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const context = { exports: {}, require: createRequire(import.meta.url) };
vm.runInThisContext(`(function(exports, require) { ${ts.transpile(fs.readFileSync('lib/phone.ts', 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 })} })`)(context.exports, context.require);
const { normalizeWhatsApp } = context.exports;

test('local numbers become international for the four main markets', () => {
  for (const [country, local, expected] of [
    ['CO', '300 123 4567', '+573001234567'], ['MX', '55 1234 5678', '+525512345678'],
    ['CR', '8888-8888', '+50688888888'], ['US', '(415) 555-2671', '+14155552671'],
  ]) assert.equal(normalizeWhatsApp(local, country), expected);
});
test('international paste retains its country code without duplicating it', () => {
  assert.equal(normalizeWhatsApp('+506 8888 8888', 'CO'), '+50688888888');
  assert.equal(normalizeWhatsApp('0057 300 123 4567', 'CO'), '+573001234567');
});
test('incomplete numbers and extensions cannot be sent to the CRM', () => {
  for (const value of ['+57222', '+506888', '+1415', '+525512', '', '+999123456789', '+573001234567 ext. 5']) assert.equal(normalizeWhatsApp(value), null);
  assert.equal(normalizeWhatsApp('222', 'CO'), null);
  assert.equal(normalizeWhatsApp('3001234567'), null);
});
