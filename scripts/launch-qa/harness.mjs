import path from 'node:path';
const {chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright');
import {mkdir,writeFile} from 'node:fs/promises';
export const base=process.env.QA_BASE_URL || 'http://127.0.0.1:4330';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname)) throw new Error('QA submissions are restricted to a local fixture server.');
export async function launch(persona,round='before',{mobile=false,slow=false}={}){
 const dir=path.join(process.env.QA_OUTPUT_DIR || '/tmp/elevator-launch-qa-results',round,persona);await mkdir(dir,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_EXECUTABLE || undefined});
 const context=await browser.newContext({viewport:mobile?{width:375,height:812}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,locale:'es-MX'});
 await context.addCookies([{name:'qa_persona',value:persona+'-'+round,url:base}]);
 await context.route('**/*',route=>{const r=route.request();if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!r.url().startsWith(base+'/')&&!r.url().startsWith('https://challenges.cloudflare.com/'))return route.abort('blockedbyclient');return route.continue()});
 const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url().replace(/\?.*/,''),error:r.failure()?.errorText}));
 if(slow){const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:2000,downloadThroughput:50*1024,uploadThroughput:50*1024,connectionType:'cellular3g'});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4})}
 async function shot(name){const p=dir+'/'+name+'.png';await page.screenshot({path:p,fullPage:false});return p}
 async function report(value){await writeFile(dir+'/report.json',JSON.stringify({...value,errors,failed},null,2))}
 return {browser,context,page,dir,shot,report,errors,failed,base};
}
