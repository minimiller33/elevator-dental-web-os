import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{makeSession,verifySession,validAnswer,digest} from '../worker.mjs';
test('sessions reject tampering, expiration and wrong signing keys',async()=>{
 const token=await makeSession('client','test-signing-secret',1000);
 assert.equal((await verifySession(token,'test-signing-secret',2000)).role,'client');
 assert.equal(await verifySession(token+'x','test-signing-secret',2000),null);
 assert.equal(await verifySession(token,'other-secret',2000),null);
 assert.equal(await verifySession(token,'test-signing-secret',31*86400000),null);
 const modified=token.replace(token.slice(0,8),'ABCDEFGH');assert.equal(await verifySession(modified,'test-signing-secret',2000),null);
});
test('answers allow cloud links and reject script URLs and unexplained not-applicable',()=>{
 const body={answer:'Material adjunto',links:['https://drive.google.com/test'],status:'complete'};assert.equal(validAnswer(body),body);
 assert.throws(()=>validAnswer({...body,links:['javascript:alert(1)']}));
 assert.throws(()=>validAnswer({...body,links:['not-a-url']}));
 assert.throws(()=>validAnswer({...body,links:new Array(21).fill('https://example.com')}));
 assert.throws(()=>validAnswer({...body,status:'not_applicable',answer:''}));
});
test('unauthenticated project and PDF requests are rejected',async()=>{
 const env={SESSION_SECRET:'test'};
 for(const path of ['/api/project','/brief.pdf','/api/files/fake']){const res=await worker.fetch(new Request('https://files.example.test'+path),env);assert.equal(res.status,401)}
});
test('cross-origin mutations are rejected before authorization',async()=>{
 const res=await worker.fetch(new Request('https://files.example.test/api/session',{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}),{});assert.equal(res.status,403);
});
test('client and reviewer access keys grant separate server-verified roles',async()=>{
 const env={SESSION_SECRET:'test',CLIENT_ACCESS_HASH:await digest('client'),ADMIN_ACCESS_HASH:await digest('reviewer'),LOGIN_LIMIT:{limit:async()=>({success:true})}};
 for(const [key,role] of [['client','client'],['reviewer','admin']]){
  const r=await worker.fetch(new Request('https://files.example.test/api/session',{method:'POST',headers:{Origin:'https://files.example.test'},body:JSON.stringify({access:key})}),env);assert.equal(r.status,200);assert.equal((await r.json()).role,role);assert.match(r.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);assert.match(r.headers.get('set-cookie'),/Secure/);
 }
 const wrong=await worker.fetch(new Request('https://files.example.test/api/session',{method:'POST',headers:{Origin:'https://files.example.test'},body:'{"access":"wrong"}'}),env);assert.equal(wrong.status,401);
});
