import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function moduleAt(file, globals={}) {
  const context={exports:{},URL,AbortSignal,...globals};
  vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}),context);
  return context.exports;
}
const {validContactName,normalizeWebsite}=moduleAt('lib/contact-validation.ts');
const {classify}=moduleAt('lib/lead-qualification.ts');
const owner={profile:'owner',treatmentValue:'fifteen4k',timeline:'under30',specialty:['implants'],cityCountry:'Ciudad de México, México',decisionMaker:'sole',decisionMakerAttends:'',revenue:'ten25',organicExpectation:'yes',patientGoal:'four10',chairs:'two',hasLab:'no',technology:['none']};
test('rejects junk while preserving international real names',()=>{
  for(const name of ['María José de la Cruz','李明','أحمد','D’Angelo']) assert.equal(validContactName(name),true,name);
  for(const name of ['   ','123<>!!!','12345','<script>']) assert.equal(validContactName(name),false,name);
});
test('accepts ordinary clinic addresses and rejects executable/credential URLs',()=>{
  assert.equal(normalizeWebsite(' www.clinica.com/tratamiento '),'https://www.clinica.com/tratamiento');
  assert.equal(normalizeWebsite('https://clinica.com/'),'https://clinica.com/');
  for(const url of ['javascript:alert(1)','data:text/html,x','ftp://clinica.com','https://user:secret@clinica.com','not a site']) assert.equal(normalizeWebsite(url),'',url);
});
test('private income and requests for clarification retain a personal-review path',()=>{
  assert.equal(classify({...owner,revenue:'private'}).status,'manual_review');
  assert.equal(classify({...owner,organicExpectation:'no'}).status,'manual_review');
});
test('Costa Rica is supported, while existing qualification thresholds remain',()=>{
  assert.equal(classify({...owner,cityCountry:'San José, Costa Rica'}).status,'qualified');
  assert.equal(classify({...owner,timeline:'exploring'}).status,'not_qualified');
  assert.equal(classify({...owner,treatmentValue:'under500'}).status,'not_qualified');
  assert.equal(classify({...owner,revenue:'under5'}).status,'not_qualified');
});
test('offline and non-JSON errors show recoverable Spanish feedback',async()=>{
  const offline=moduleAt('lib/form-feedback.ts',{fetch:async()=>{throw new TypeError('Failed to fetch')}});
  await assert.rejects(()=>offline.postForm('/api/contact',{}),/Revisa tu conexión.*respuestas siguen aquí/);
  const htmlFailure=moduleAt('lib/form-feedback.ts',{fetch:async()=>new Response('<html>gateway</html>',{status:502})});
  await assert.rejects(()=>htmlFailure.postForm('/api/contact',{}),/Tus respuestas siguen aquí/);
  const vendorFailure=moduleAt('lib/form-feedback.ts',{fetch:async()=>Response.json({error:'QA simulated server error'},{status:500})});
  await assert.rejects(()=>vendorFailure.postForm('/api/contact',{}),error=>/Tus respuestas siguen aquí/.test(error.message) && !/simulated|server error/.test(error.message));
  const ok=moduleAt('lib/form-feedback.ts',{fetch:async()=>Response.json({ok:true,bookingUrl:'/agenda'})});
  assert.equal((await ok.postForm('/api/contact',{})).bookingUrl,'/agenda');
});
