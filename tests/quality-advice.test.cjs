const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const modulePromise=loadTs('src/QualityAdvisor.ts');

test('audio issues warn only after three consecutive abnormal measurements',async()=>{
 const {QualityAdvisor}=await modulePromise;
 const a=new QualityAdvisor();
 const issue={lines:[],audioLossPct:5,audioPlayoutBufferMs:160};
 assert.equal(a.assess('p',issue),undefined);
 assert.equal(a.assess('p',issue),undefined);
 assert.match(a.assess('p',issue),/Audio/);
 assert.equal(a.assess('p',{lines:[],audioLossPct:0,audioPlayoutBufferMs:20}),undefined);
 assert.equal(a.assess('p',issue),undefined);
});
test('video loss and high RTT get separate, sustained advice',async()=>{
 const {QualityAdvisor}=await modulePromise;
 const a=new QualityAdvisor();
 for(let i=0;i<2;i++)assert.equal(a.assess('v',{lines:[],videoLossPct:10}),undefined);
 assert.match(a.assess('v',{lines:[],videoLossPct:10}),/Videopakete/);
 for(let i=0;i<2;i++)assert.equal(a.assess('rtt',{lines:[],roundTripMs:280}),undefined);
 assert.match(a.assess('rtt',{lines:[],roundTripMs:280}),/Netzwerklatenz/);
 a.forget('v');
 assert.equal(a.assess('v',{lines:[],videoLossPct:10}),undefined);
 a.clear();
 assert.equal(a.assess('rtt',{lines:[],roundTripMs:280}),undefined);
});
test('static screen FPS alone must not be treated as failure',async()=>{
 const {QualityAdvisor}=await modulePromise;
 const a=new QualityAdvisor();
 for(let i=0;i<100;i++)assert.equal(a.assess('fm',{lines:[],videoReceiveFps:1}),undefined);
});
test('quality measurement and UI use passive advice without changing streams',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const q=fs.readFileSync(path.join(__dirname,'../src/QualityDiagnostics.ts'),'utf8');
 assert.ok(app.includes('adviceRef.current.assess(p.id,measurement)'));
 assert.ok(app.includes('adviceRef.current.forget(e.id)'));
 assert.ok(app.includes('adviceRef.current.clear()'));
 assert.ok(q.includes('videoLossPct'));
 assert.ok(q.includes('roundTripMs'));
});
