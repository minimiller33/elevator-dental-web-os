import sections from './questions.json' with {type:'json'};
const itemIds=new Set(sections.flatMap(s=>s.items.map(i=>i.id)));
const CHUNK=8*1024*1024,MAX_FILE=2*1024**3,MAX_TOTAL=25*1024**3;
const encoder=new TextEncoder();
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
function response(body,status=200,extra={}){return new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}})}
function fail(message,status=400){throw Object.assign(new Error(message),{status})}
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
export async function digest(text){return b64(await crypto.subtle.digest('SHA-256',encoder.encode(text)))}
async function mac(secret,text){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(await crypto.subtle.sign('HMAC',key,encoder.encode(text)))}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
export async function makeSession(role,secret,now=Date.now()){const payload=b64(encoder.encode(JSON.stringify({role,project:'be-smile',expires:now+30*86400000})));return payload+'.'+await mac(secret,payload)}
export async function verifySession(value,secret,now=Date.now()){
 try{const [payload,signature,...extra]=value.split('.');if(extra.length||!equal(await mac(secret,payload),signature))return null;const data=JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));return data.project==='be-smile'&&['client','admin'].includes(data.role)&&data.expires>now?data:null}catch{return null}
}
async function auth(request,env){const cookie=request.headers.get('cookie')||'';const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('elevator_files='))?.slice(15);const session=token&&await verifySession(token,env.SESSION_SECRET);if(!session)fail('Abre tu enlace privado para entrar.',401);return session}
async function json(request,max=40000){if(!request.body)fail('Datos no válidos.');const reader=request.body.getReader();const chunks=[];let length=0;while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>max*4){await reader.cancel();fail('La respuesta es demasiado larga.',413)}chunks.push(value)}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}const text=new TextDecoder().decode(bytes);if(text.length>max)fail('La respuesta es demasiado larga.',413);try{return JSON.parse(text)}catch{fail('Datos no válidos.')}}
function now(){return new Date().toISOString()}
export function validAnswer(body){if(!body||typeof body.answer!=='string'||body.answer.length>20000||!['pending','complete','not_applicable'].includes(body.status))fail('Respuesta no válida.');if(!Array.isArray(body.links)||body.links.length>20||body.links.some(link=>{try{return typeof link!=='string'||link.length>2048||!['https:','http:'].includes(new URL(link).protocol)}catch{return true}}))fail('Usa enlaces completos que comiencen con https://.');if(body.status==='not_applicable'&&!body.answer.trim())fail('Explica por qué este punto no aplica.');return body}
async function project(env,role){const [answers,files,submission]=await Promise.all([env.DB.prepare('SELECT * FROM answers').all(),env.DB.prepare("SELECT id,item_id,name,size,mime,created_at FROM files WHERE state='ready' ORDER BY created_at DESC").all(),env.DB.prepare('SELECT id,created_at,completed,total FROM submissions ORDER BY created_at DESC LIMIT 1').first()]);return {name:'BE SMILE',domain:'besmile.mx',currency:'MXN',role,sections,answers:answers.results.map(a=>({...a,links:JSON.parse(a.links||'[]')})),files:files.results,submission,limits:{maxFile:MAX_FILE,chunk:CHUNK,maxTotal:MAX_TOTAL},total:itemIds.size}}
async function uploadRecord(env,id){const row=await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(id).first();if(!row)fail('Archivo no encontrado.',404);if(row.state!=='uploading')fail('Esta carga ya no está activa.',409);if(Date.now()-Date.parse(row.created_at)>86400000)fail('Esta carga expiró. Vuelve a seleccionar el archivo.',410);return row}
async function api(request,env,url){
 if(!['GET','HEAD'].includes(request.method)&&request.headers.get('Origin')!==url.origin)fail('Origen no permitido.',403);
 const route=url.pathname;
 if(route==='/api/session'&&request.method==='POST'){
  const limit=await env.LOGIN_LIMIT.limit({key:request.headers.get('CF-Connecting-IP')||'local'});if(!limit.success)fail('Demasiados intentos. Espera un minuto.',429);
  const body=await json(request,1000);if(!body||typeof body.access!=='string'||body.access.length>200)fail('Enlace o código no válido.',401);
  const hash=await digest(body.access);const role=equal(hash,env.ADMIN_ACCESS_HASH)?'admin':equal(hash,env.CLIENT_ACCESS_HASH)?'client':null;if(!role)fail('Enlace o código no válido.',401);
  const token=await makeSession(role,env.SESSION_SECRET);const secure=url.protocol==='https:'?'; Secure':'';return response({ok:true,role},200,{'Set-Cookie':`elevator_files=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}`});
 }
 const session=await auth(request,env);
 if(route==='/api/session'&&request.method==='DELETE')return response({ok:true},200,{'Set-Cookie':'elevator_files=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
 if(route==='/api/project'&&request.method==='GET')return response(await project(env,session.role));
 if(route==='/api/export'&&request.method==='GET'){
  const data=await project(env,session.role);return response(data,200,{'Content-Disposition':'attachment; filename="BE-SMILE-respuestas.json"'});
 }
 const answer=route.match(/^\/api\/answers\/(\d{2}\.\d{2})$/);
 if(answer&&request.method==='PUT'){
  if(session.role!=='client')fail('El acceso de revisión no modifica respuestas.',403);const id=answer[1];if(!itemIds.has(id))fail('Punto no válido.');const body=validAnswer(await json(request));
  if(body.status==='complete'&&!body.answer.trim()&&!body.links.length){
   const hasFile=await env.DB.prepare("SELECT id FROM files WHERE item_id=? AND state='ready' LIMIT 1").bind(id).first();if(!hasFile)fail('Añade una respuesta o un archivo antes de marcarlo listo.');
  }
  const date=now();await env.DB.prepare('INSERT INTO answers(item_id,answer,links,status,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(item_id) DO UPDATE SET answer=excluded.answer,links=excluded.links,status=excluded.status,updated_at=excluded.updated_at').bind(id,body.answer,JSON.stringify(body.links),body.status,date).run();return response({saved:true,updatedAt:date});
 }
 if(route==='/api/uploads'&&request.method==='POST'){
  if(session.role!=='client')fail('El acceso de revisión no sube archivos.',403);const body=await json(request,2000);
  if(!itemIds.has(body.itemId)||typeof body.name!=='string'||!body.name.trim()||body.name.length>240||!Number.isSafeInteger(body.size)||body.size<1||body.size>MAX_FILE)fail('Archivo no válido o mayor a 2 GB.');
  const id=crypto.randomUUID(),key='be-smile/'+id,name=body.name.replace(/[\u0000-\u001f\u007f]/g,'').trim(),mime=typeof body.mime==='string'&&body.mime.length<150?body.mime:'application/octet-stream';
  const upload=await env.FILES.createMultipartUpload(key,{httpMetadata:{contentType:'application/octet-stream'}});
  try{
   const date=now();const result=await env.DB.prepare("INSERT INTO files(id,item_id,name,size,mime,object_key,upload_id,state,created_at,updated_at) SELECT ?,?,?,?,?,?,?,'uploading',?,? WHERE (SELECT COALESCE(SUM(size),0) FROM files WHERE state IN ('uploading','ready','removed'))+?<=? AND (SELECT COUNT(*) FROM files WHERE state IN ('uploading','ready','removed'))<2000").bind(id,body.itemId,name,body.size,mime,key,upload.uploadId,date,date,body.size,MAX_TOTAL).run();if(result.meta.changes!==1){await upload.abort();fail('La carpeta alcanzó su capacidad. Contacta a Elevator.',413)}
  }catch(e){await upload.abort().catch(()=>{});throw e}
  return response({id,chunk:CHUNK,parts:Math.ceil(body.size/CHUNK)},201);
 }
 const part=route.match(/^\/api\/uploads\/([\w-]+)\/parts\/(\d+)$/);
 if(part&&request.method==='PUT'){
  if(session.role!=='client')fail('No permitido.',403);const file=await uploadRecord(env,part[1]);const number=Number(part[2]),total=Math.ceil(file.size/CHUNK);if(!Number.isInteger(number)||number<1||number>total)fail('Parte no válida.');
  const length=Number(request.headers.get('Content-Length')),expected=number===total?file.size-(number-1)*CHUNK:CHUNK;if(!Number.isSafeInteger(length)||length!==expected||!request.body)fail('Tamaño de parte no válido.');
  const upload=env.FILES.resumeMultipartUpload(file.object_key,file.upload_id);const uploaded=await upload.uploadPart(number,request.body);
  await env.DB.prepare('INSERT INTO parts(file_id,part_number,etag,size) VALUES(?,?,?,?) ON CONFLICT(file_id,part_number) DO UPDATE SET etag=excluded.etag,size=excluded.size').bind(file.id,number,uploaded.etag,length).run();return response({partNumber:number});
 }
 const complete=route.match(/^\/api\/uploads\/([\w-]+)\/complete$/);
 if(complete&&request.method==='POST'){
  if(session.role!=='client')fail('No permitido.',403);
  const existing=await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(complete[1]).first();if(existing?.state==='ready')return response({saved:true,id:existing.id});
  const file=await uploadRecord(env,complete[1]);const parts=await env.DB.prepare('SELECT part_number AS partNumber,etag,size FROM parts WHERE file_id=? ORDER BY part_number').bind(file.id).all();const expected=Math.ceil(file.size/CHUNK);
  if(parts.results.length!==expected||parts.results.some((p,i)=>p.partNumber!==i+1)||parts.results.reduce((sum,p)=>sum+p.size,0)!==file.size)fail('La carga está incompleta.',409);
  const upload=env.FILES.resumeMultipartUpload(file.object_key,file.upload_id);let object;try{object=await upload.complete(parts.results.map(({partNumber,etag})=>({partNumber,etag})))}catch(e){object=await env.FILES.head(file.object_key);if(!object)throw e}
  if(object.size!==file.size){await env.FILES.delete(file.object_key);fail('El tamaño del archivo no coincide.',409)}
  await env.DB.batch([env.DB.prepare("UPDATE files SET state='ready',updated_at=? WHERE id=?").bind(now(),file.id),env.DB.prepare('DELETE FROM parts WHERE file_id=?').bind(file.id)]);return response({saved:true,id:file.id});
 }
 const uploadRoute=route.match(/^\/api\/uploads\/([\w-]+)$/);
 if(uploadRoute&&request.method==='GET'){
  const done=await env.DB.prepare("SELECT * FROM files WHERE id=? AND state='ready'").bind(uploadRoute[1]).first();if(done)return response({id:done.id,name:done.name,size:done.size,state:'ready',parts:[]});const file=await uploadRecord(env,uploadRoute[1]);const parts=await env.DB.prepare('SELECT part_number AS partNumber FROM parts WHERE file_id=? ORDER BY part_number').bind(file.id).all();return response({id:file.id,name:file.name,size:file.size,state:'uploading',parts:parts.results.map(x=>x.partNumber)});
 }
 if(uploadRoute&&request.method==='DELETE'){
  if(session.role!=='client')fail('No permitido.',403);const file=await uploadRecord(env,uploadRoute[1]);await env.FILES.resumeMultipartUpload(file.object_key,file.upload_id).abort();await env.DB.batch([env.DB.prepare("UPDATE files SET state='failed',updated_at=? WHERE id=?").bind(now(),file.id),env.DB.prepare('DELETE FROM parts WHERE file_id=?').bind(file.id)]);return response({ok:true});
 }
 const preview=route.match(/^\/api\/files\/([\w-]+)\/preview$/);
 if(preview&&request.method==='GET'){
  const file=await env.DB.prepare("SELECT * FROM files WHERE id=? AND state='ready'").bind(preview[1]).first();if(!file)fail('Archivo no encontrado.',404);if(file.size>12*1024**2)fail('Vista previa no disponible para este tamaño.',413);
  const head=await env.FILES.get(file.object_key,{range:{offset:0,length:16}});if(!head)fail('Archivo no disponible.',404);const bytes=new Uint8Array(await head.arrayBuffer());const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));
  const type=bytes[0]===137&&ascii(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':['GIF87a','GIF89a'].includes(ascii(0,6))?'image/gif':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'image/webp':null;
  if(!type)fail('Formato de vista previa no permitido.',415);const object=await env.FILES.get(file.object_key);if(!object)fail('Archivo no disponible.',404);return new Response(object.body,{headers:{...headers,'Content-Type':type,'Content-Length':String(object.size),'Content-Disposition':'inline','Cross-Origin-Resource-Policy':'same-origin'}});
 }
 const download=route.match(/^\/api\/files\/([\w-]+)$/);
 if(download&&request.method==='GET'){
  const file=await env.DB.prepare("SELECT * FROM files WHERE id=? AND state='ready'").bind(download[1]).first();if(!file)fail('Archivo no encontrado.',404);const object=await env.FILES.get(file.object_key);if(!object)fail('Archivo no disponible.',404);
  return new Response(object.body,{headers:{...headers,'Content-Type':'application/octet-stream','Content-Length':String(object.size),'Content-Disposition':`attachment; filename="archivo"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g,'%27')}`}});
 }
 if(download&&request.method==='DELETE'){
  if(session.role!=='client')fail('No permitido.',403);const file=await env.DB.prepare("SELECT * FROM files WHERE id=? AND state='ready'").bind(download[1]).first();if(!file)fail('Archivo no encontrado.',404);
  await env.DB.batch([env.DB.prepare("UPDATE files SET state='removed',updated_at=? WHERE id=?").bind(now(),file.id),env.DB.prepare("UPDATE answers SET status='pending',updated_at=? WHERE item_id=?").bind(now(),file.item_id)]);return response({ok:true});
 }
 if(route==='/api/submit'&&request.method==='POST'){
  if(session.role!=='client')fail('El acceso de revisión no envía entregas.',403);const data=await project(env,session.role);const completed=data.answers.filter(a=>a.status!=='pending').length;
  if(!completed&&!data.files.length&&!data.answers.some(a=>a.answer.trim()||a.links.length))fail('Añade tus respuestas o archivos antes de enviar.');
  const id=crypto.randomUUID(),date=now();await env.DB.prepare('INSERT INTO submissions(id,created_at,completed,total,snapshot) VALUES(?,?,?,?,?)').bind(id,date,completed,itemIds.size,JSON.stringify(data)).run();return response({saved:true,id,date,completed,total:itemIds.size});
 }
 fail('No encontrado.',404);
}
export default {
 async fetch(request,env){
  try{
   const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return await api(request,env,url);
   if(url.pathname==='/brief.pdf')await auth(request,env);
   const result=await env.ASSETS.fetch(request);const secured=new Response(result.body,result);for(const [k,v] of Object.entries(headers))secured.headers.set(k,v);return secured;
  }catch(e){if(!e.status)console.error('Portal request failed:',e.name);return response({error:e.status?e.message:'No se pudo completar la operación. Intenta de nuevo.'},e.status||500)}
 },
 async scheduled(event,env){
  const expired=await env.DB.prepare("SELECT * FROM files WHERE state='uploading' AND created_at<? LIMIT 500").bind(new Date(Date.now()-86400000).toISOString()).all();
  for(const file of expired.results){const completed=await env.FILES.head(file.object_key);if(completed?.size===file.size){await env.DB.batch([env.DB.prepare("UPDATE files SET state='ready',updated_at=? WHERE id=?").bind(now(),file.id),env.DB.prepare('DELETE FROM parts WHERE file_id=?').bind(file.id)]);continue}await env.FILES.resumeMultipartUpload(file.object_key,file.upload_id).abort().catch(()=>{});await env.DB.batch([env.DB.prepare("UPDATE files SET state='failed',updated_at=? WHERE id=?").bind(now(),file.id),env.DB.prepare('DELETE FROM parts WHERE file_id=?').bind(file.id)])}
 }
};
