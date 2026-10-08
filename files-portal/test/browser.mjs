import {chromium} from '/tmp/mailflare-mobile-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const base=process.env.PORTAL_TEST_URL||'http://localhost:8791';
if(!base.startsWith('http://localhost:'))throw Error('Browser mutations are restricted to local development');
const keys=JSON.parse(await fs.readFile(new URL('../.wrangler/access.json',import.meta.url),'utf8')).keys;
const browser=await chromium.launch({headless:true,executablePath:'/Users/cashkade/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
await fs.mkdir(new URL('../.wrangler/screenshots/',import.meta.url),{recursive:true});
try{
 for(const width of (process.env.PORTAL_REVIEW_ONLY?[]:[320,390,768,1440])){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('401'))errors.push(m.text())});
  await page.goto(base);await page.getByRole('heading',{name:'Entrega de materiales',exact:true}).waitFor();
  await page.screenshot({path:fileURLToPath(new URL(`../.wrangler/screenshots/login-${width}.png`,import.meta.url))});
  await page.goto(base+'/#access='+keys.client);await page.getByRole('heading',{name:'Marca y contacto',exact:true}).waitFor();assert.equal(new URL(page.url()).hash,'');
  await page.locator('[data-item="01.01"] summary').click();
  if(!await page.locator('[data-answer="01.01"]').isVisible())await page.locator('[data-item="01.01"] summary').click();
  await page.locator('[data-answer="01.01"]').fill('Respuesta de navegador QA '+width);
  await page.locator('[data-links="01.01"]').fill('https://drive.google.com/drive/folders/qa-browser-'+width);
  await page.getByText('Todo guardado',{exact:true}).waitFor({timeout:12000});
  await page.reload();await page.getByRole('heading',{name:'Marca y contacto',exact:true}).waitFor();await page.locator('[data-item="01.01"] summary').click();
  if(!await page.locator('[data-answer="01.01"]').isVisible())await page.locator('[data-item="01.01"] summary').click();
  assert.equal(await page.locator('[data-answer="01.01"]').inputValue(),'Respuesta de navegador QA '+width);assert.equal(await page.locator('[data-links="01.01"]').inputValue(),'https://drive.google.com/drive/folders/qa-browser-'+width);
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(overflow.scroll<=overflow.width+1,JSON.stringify(overflow));
  await page.screenshot({path:fileURLToPath(new URL(`../.wrangler/screenshots/answers-${width}.png`,import.meta.url))});
  if(width<760){await page.getByRole('button',{name:'Abrir menú'}).click();await page.getByRole('button',{name:/Fotos, videos y resultados/}).click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'false')}else await page.getByRole('button',{name:/Fotos, videos y resultados/}).click();
  await page.getByRole('heading',{name:'Fotos, videos y resultados',exact:true}).waitFor();
  await page.locator('[data-file-input="06.01"]').setInputFiles({name:'QA-browser-'+width+'.txt',mimeType:'text/plain',buffer:Buffer.from('Archivo sintético para QA '+width)});
  await page.getByRole('link',{name:'QA-browser-'+width+'.txt',exact:true}).waitFor({timeout:15000});
  await page.screenshot({path:fileURLToPath(new URL(`../.wrangler/screenshots/files-${width}.png`,import.meta.url))});
  assert(!errors.length,errors.join('; '));console.log('Browser passed:',width,'save, cloud links, reload, menu, file upload and no horizontal overflow');await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();await page.goto(base+'/#access='+keys.admin);await page.getByText('Vista de revisión · Elevator',{exact:true}).waitFor();assert.equal(await page.locator('textarea').count(),0);await page.locator('[data-item="01.01"] summary').click();assert(await page.getByRole('link',{name:'https://drive.google.com/drive/folders/qa-browser-1440',exact:true}).count());await page.screenshot({path:fileURLToPath(new URL('../.wrangler/screenshots/reviewer.png',import.meta.url))});await context.close();console.log('Reviewer read-only UI passed');
}finally{await browser.close()}
