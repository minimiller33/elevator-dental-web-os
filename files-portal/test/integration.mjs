import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=process.env.PORTAL_TEST_URL||'http://localhost:8791';
if(!base.startsWith('http://localhost:'))throw Error('Integration mutations are restricted to local development');
const access=JSON.parse(await fs.readFile(new URL('../.wrangler/access.json',import.meta.url),'utf8')).keys;
async function signIn(role){const r=await fetch(base+'/api/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({access:access[role]})});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]}
const client=await signIn('client'),admin=await signIn('admin');
async function request(path,{cookie=client,method='GET',body}={}){return fetch(base+path,{method,headers:{Cookie:cookie,...(method!=='GET'?{Origin:base}:{}),...(body&&!Buffer.isBuffer(body)?{'Content-Type':'application/json'}:{})},body:body&&(!Buffer.isBuffer(body)?JSON.stringify(body):body)})}
assert.equal((await fetch(base+'/api/project')).status,401);assert.equal((await fetch(base+'/brief.pdf')).status,401);
const answer={answer:'Respuesta sintética de QA',links:['https://drive.google.com/drive/folders/qa-fixture'],status:'complete'};
assert.equal((await request('/api/answers/01.01',{method:'PUT',body:answer})).status,200);
assert.equal((await request('/api/answers/01.01',{cookie:admin,method:'PUT',body:answer})).status,403);
assert.equal((await request('/api/answers/99.99',{method:'PUT',body:answer})).status,400);
assert.equal((await request('/api/answers/01.02',{method:'PUT',body:{answer:'',links:[],status:'complete'}})).status,400);
assert.equal((await request('/api/answers/01.02',{method:'PUT',body:{...answer,links:['javascript:alert(1)']}})).status,400);
let project=await (await request('/api/project',{cookie:admin})).json();assert.deepEqual(project.answers.find(a=>a.item_id==='01.01').links,answer.links);assert.equal(project.sections.flatMap(s=>s.items).length,28);
const file=Buffer.alloc(9*1024*1024,37);const started=await (await request('/api/uploads',{method:'POST',body:{itemId:'01.02',name:'QA-multipart.bin',size:file.length,mime:'application/octet-stream'}})).json();assert(started.id);
assert.equal((await request(`/api/uploads/${started.id}/complete`,{method:'POST',body:{}})).status,409);
assert.equal((await request(`/api/uploads/${started.id}/parts/1`,{method:'PUT',body:Buffer.from('wrong-size')})).status,400);
for(let part=1;part<=2;part++){const blob=file.subarray((part-1)*started.chunk,Math.min(part*started.chunk,file.length));const r=await request(`/api/uploads/${started.id}/parts/${part}`,{method:'PUT',body:blob});assert.equal(r.status,200,await r.text())}
assert.equal((await request(`/api/uploads/${started.id}/complete`,{method:'POST',body:{}})).status,200);
assert.equal((await request(`/api/uploads/${started.id}/complete`,{method:'POST',body:{}})).status,200);
const downloaded=await request('/api/files/'+started.id,{cookie:admin});assert.equal(downloaded.status,200);const bytes=Buffer.from(await downloaded.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),createHash('sha256').update(file).digest('hex'));
assert.equal((await fetch(base+'/api/files/'+started.id)).status,401);
const sent=await (await request('/api/submit',{method:'POST',body:{}})).json();assert(sent.id);assert.equal(sent.completed,1);
assert.equal((await request('/api/submit',{cookie:admin,method:'POST',body:{}})).status,403);
assert.equal((await request('/api/files/'+started.id,{method:'DELETE'})).status,200);
assert.equal((await request('/api/files/'+started.id)).status,404);
const abort=await (await request('/api/uploads',{method:'POST',body:{itemId:'01.02',name:'QA-abort.txt',size:50,mime:'text/plain'}})).json();assert.equal((await request('/api/uploads/'+abort.id,{method:'DELETE'})).status,200);
const exported=await request('/api/export',{cookie:admin});assert.equal(exported.status,200);assert.match(exported.headers.get('content-disposition'),/attachment/);
console.log('Local integration passed: authentication, roles, cloud links, durable answers, multi-part upload, exact download, submission, removal and abort.');
