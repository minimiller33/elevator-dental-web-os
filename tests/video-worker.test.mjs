import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context={exports:{},Request,Response,Headers,ReadableStream};
vm.runInNewContext(ts.transpile(fs.readFileSync('worker/video.ts','utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}),context);
const {serveVideo}=context.exports;
const data=Uint8Array.from({length:100},(_,i)=>i);
const assets={fetch:async req=>new Response(req.method==='HEAD'?null:new ReadableStream({start(c){for(let i=0;i<100;i+=13)c.enqueue(data.slice(i,i+13));c.close();}}),{headers:{'Content-Length':'100','Content-Type':'video/mp4','ETag':'"v1"'}})};
const request=(range,extra={})=>new Request('https://elevatordental.com/video/elevator-v41.mp4',{headers:{...(range?{Range:range}:{}),...extra}});
test('video ranges return exact bytes across chunk boundaries, suffixes and open ends',async()=>{
 for(const [range,start,end] of [['bytes=0-1',0,1],['bytes=10-40',10,40],['bytes=85-',85,99],['bytes=-12',88,99],['bytes=95-200',95,99]]){
  const res=await serveVideo(request(range),assets,100);assert.equal(res.status,206);assert.equal(res.headers.get('Content-Range'),`bytes ${start}-${end}/100`);assert.equal(res.headers.get('Content-Length'),String(end-start+1));assert.deepEqual(new Uint8Array(await res.arrayBuffer()),data.slice(start,end+1));
 }
});
test('unsatisfied ranges and stale validators cannot serve incorrect fragments',async()=>{
 for(const range of ['bytes=100-','bytes=80-20','bytes=-0']){const res=await serveVideo(request(range),assets,100);assert.equal(res.status,416);assert.equal(res.headers.get('Content-Range'),'bytes */100');}
 for(const [range,extra] of [['bytes=0-1',{'If-Range':'"old"'}],['bytes=0-1,8-9',{}],[null,{}]]){const res=await serveVideo(request(range,extra),assets,100);assert.equal(res.status,200);assert.deepEqual(new Uint8Array(await res.arrayBuffer()),data);}
});
test('HEAD advertises seek support without a body and other methods are rejected',async()=>{
 const res=await serveVideo(new Request(request(null),{method:'HEAD'}),assets,100);assert.equal(res.status,200);assert.equal(res.headers.get('Accept-Ranges'),'bytes');assert.equal((await res.arrayBuffer()).byteLength,0);
 assert.equal((await serveVideo(new Request(request(null),{method:'POST'}),assets,100)).status,405);
});

test('the deployed MP4 size matches the byte range manifest when the binding omits Content-Length',async()=>{
 const manifest={exports:{}};vm.runInNewContext(ts.transpile(fs.readFileSync('lib/brand-video.ts','utf8'),{module:ts.ModuleKind.CommonJS}),manifest);
 assert.equal(manifest.exports.brandVideo.byteLength,fs.statSync('public/video/elevator-v41.mp4').size);
 const binding={fetch:async()=>new Response(data,{headers:{'Content-Type':'video/mp4'}})};
 const res=await serveVideo(request('bytes=20-30'),binding,100);assert.equal(res.status,206);assert.deepEqual(new Uint8Array(await res.arrayBuffer()),data.slice(20,31));
});
