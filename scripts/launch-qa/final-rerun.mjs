import {launch} from './harness.mjs';
import assert from 'node:assert/strict';
const persona=process.argv[2];
const configs={
 impatient:{name:'Persona Impaciente',treatment:'fifteen4k',goal:'four10',technology:'none',timeline:'under30',expectation:'yes'},
 skeptic:{name:'QA Dueña Escéptica',treatment:'five1500',goal:'one3',technology:'none',timeline:'exploring',expectation:'no'},
 mobile:{name:'Mariana QA Móvil',treatment:'five1500',goal:'four10',technology:'scanner',timeline:'under30',expectation:'yes'},
 literal:{name:'Ana Mora QA',country:'CR',phone:'88887777',city:'San José, Costa Rica',chairs:'one',treatment:'under500',goal:'one3',technology:'none',timeline:'exploring',expectation:'no'},
 breaker:{name:'María José de la Cruz',treatment:'five1500',goal:'four10',technology:'none',timeline:'one3',expectation:'yes',website:'https://example.com'},
};
const c=configs[persona];assert(c,'valid persona');
const h=await launch(persona,'final',{mobile:persona==='mobile',slow:persona==='mobile'});
const {page}=h;page.setDefaultTimeout(persona==='mobile'?60000:15000);const requests=[],checks=[];
page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/api/contact')){const b=r.postDataJSON();requests.push({event:b.event_type,id:b.lead_id,status:b.lead_status})}});
const select=(name,value)=>page.locator(`[name="${name}"]`).selectOption(value);
async function next(stage){await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.locator('.mstf_stage_name').filter({hasText:stage}).waitFor();await page.waitForTimeout(450)}
async function contact(p,name,email){await p.locator('[name=fullName]').fill(name);await p.locator('[name=whatsappCountry]').selectOption(c.country||'MX');await p.locator('[name=whatsappNational]').fill(c.phone||'5512345678');await p.locator('[name=email]').fill(email)}
try{
 if(persona==='breaker'){const noJS=await h.browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const p=await noJS.newPage();await p.goto(h.base,{waitUntil:'domcontentloaded'});assert.equal(await p.locator('[name=fullName]').isDisabled(),true);assert.equal(await p.getByRole('button',{name:'Guardar y continuar',exact:true}).isDisabled(),true);await p.locator('[name=fullName]').scrollIntoViewIfNeeded();await p.screenshot({path:h.dir+'/00-no-js-safe.png'});checks.push({name:'pre-hydration-form-cannot-navigate-or-submit',pass:true});await noJS.close()}
 // This supplementary failure injection is separate from the first-time persona journey.
 const failurePage=await h.context.newPage();failurePage.setDefaultTimeout(persona==='mobile'?60000:15000);
 await failurePage.goto(h.base,{waitUntil:'domcontentloaded',timeout:120000});
 await contact(failurePage,'QA Reintento',`qa-${persona}@example.com`);
 await failurePage.route('**/api/contact',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'QA simulated server error'})}),{times:1});
 await failurePage.getByRole('button',{name:'Guardar y continuar',exact:true}).click();
 const alert=failurePage.locator('.qual-error');await alert.waitFor();const error=await alert.innerText();assert.match(error,/No pudimos confirmar el envío.*Tus respuestas siguen aquí.*vuelve a intentarlo/);assert(!error.includes('simulated'));
 await failurePage.screenshot({path:h.dir+'/01-localized-server-error.png'});assert.equal(await failurePage.locator('[name=fullName]').inputValue(),'QA Reintento');await failurePage.close();checks.push({name:'unexpected-500-localized-and-data-retained',pass:true});
 await page.goto(h.base,{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByRole('link',{name:'Solicitar conversación',exact:true}).first().click();
 if(persona==='mobile'){await page.getByRole('button',{name:'Guardar y continuar',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[name=fullName]').getBoundingClientRect().top>64);assert((await page.locator('[name=fullName]').boundingBox()).y>64);await h.shot('02-validation-visible')}
 await contact(page,c.name,`qa-${persona}@example.com`);
 console.log('CONTACT_BEFORE_SAVE',JSON.stringify(await page.evaluate(()=>({url:location.href,fields:[...document.querySelectorAll('form input')].map(e=>({name:e.name,value:e.value})),ready:document.readyState,client:!!Object.keys(document.querySelector('form')).find(k=>k.startsWith('__reactProps'))}))));
 await page.getByRole('button',{name:'Guardar y continuar',exact:true}).click();await page.locator('[name=profile]').waitFor();
 await select('profile','owner');await page.locator('[name=specialty][value=general]').check();await page.getByLabel('¿En qué ciudad y país está tu clínica?').fill(c.city||'Ciudad de México, México');await page.getByLabel('¿Cuántos años llevas ejerciendo?').selectOption('eight15');await next('El negocio');
 await select('chairs',c.chairs||'two');await select('treatmentValue',c.treatment);await select('patientGoal',c.goal);await select('revenue','private');
 if(persona==='breaker'){await page.reload({waitUntil:'domcontentloaded'});await page.locator('[name=treatmentValue]').waitFor();assert.equal(await page.locator('[name=treatmentValue]').inputValue(),c.treatment);checks.push({name:'pending-draft-retained-on-reload',pass:true})}
 await next('Situación actual');await page.locator('[name=patientSources][value=referrals]').check();await page.locator('[name=triedBefore][value=none]').check();await page.getByLabel('¿Cuál es tu mayor frustración al conseguir pacientes?').fill('Quiero entender cómo presentar mi clínica y sus tratamientos. Prueba QA sintética.');await select('hasWebsite',c.website?'yes':'no');if(c.website)await page.locator('[name=website]').fill(c.website);await next('La decisión');
 await select('hasLab','no');await page.locator(`[name=technology][value=${c.technology}]`).check();await select('decisionMaker','sole');await select('timeline',c.timeline);await select('organicExpectation',c.expectation);
 await page.getByRole('button',{name:'Ver mis siguientes pasos',exact:true}).click();await page.locator('.qual-result h3').waitFor();await h.shot('03-original-answers-result');
 const review=page.getByRole('button',{name:'Pedir revisión al equipo',exact:true});if(await review.count()){if(persona==='breaker')await review.dblclick();else await review.click()}
 const heading=page.getByRole('heading',{name:'Solicitud recibida. La revisaremos contigo.',exact:true});await heading.waitFor();await page.waitForTimeout(500);const box=await heading.boundingBox();assert(box.y>=95&&box.y+box.height<page.viewportSize().height);assert.equal(await heading.evaluate(e=>document.activeElement===e),true);const result=await page.locator('.qual-result').innerText();assert.match(result,/email o WhatsApp/);await h.shot('04-first-success-visible');
 assert.equal(requests.filter(r=>r.event==='lead_started').length,1);assert.equal(requests.filter(r=>r.event==='lead_completed'&&r.status==='manual_review').length,1);assert.equal(new Set(requests.map(r=>r.id)).size,1);checks.push({name:'same-qualification-answers-reach-accepted-review',pass:true,heading:box});
 if(persona==='breaker'){const oldId=requests[0].id;await page.getByRole('button',{name:'Enviar otra solicitud',exact:true}).click();await page.locator('[name=fullName]').waitFor();assert.equal(await page.locator('[name=fullName]').inputValue(),'');await contact(page,c.name,'qa-breaker@example.com');await page.getByRole('button',{name:'Guardar y continuar',exact:true}).click();await page.locator('[name=profile]').waitFor();assert.notEqual(requests.at(-1).id,oldId);checks.push({name:'explicit-new-request-uses-new-id',pass:true})}
 await h.report({persona,round:'final',success:true,exactQualificationAnswers:c,revenue:'private',checks,requests,unresolved:[],environment:'Actual built Next + Worker; fixture downstream; unexpected 500 injected in separate tab; main journey clean context, original business choices. Mobile remains375x812slow3GCPU4x.'});console.log(JSON.stringify({persona,success:true,checks}));
}catch(e){await h.shot('failure').catch(()=>{});await h.report({persona,round:'final',success:false,checks,requests,error:e.stack,debug:await page.evaluate(()=>({url:location.href,fields:[...document.querySelectorAll('form input')].map(e=>({name:e.name,value:e.value})),ready:document.readyState,client:!!document.querySelector('form')&&!!Object.keys(document.querySelector('form')).find(k=>k.startsWith('__reactProps'))})).catch(()=>null)});console.error(e.stack);process.exitCode=1}finally{await h.browser.close()}
