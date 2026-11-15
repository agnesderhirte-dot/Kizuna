const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {loadTs}=require('./load-ts.cjs');
const {SpeechGate}=loadTs('src/VoiceActivity.ts');
const {Mesh}=loadTs('src/mesh.ts');

test('speaking requires consecutive microphone peaks and has hangover',()=>{
 const gate=new SpeechGate(-43,420);
 assert.equal(gate.sample(-60,0),false);
 assert.equal(gate.sample(-30,100),false);
 assert.equal(gate.sample(-31,200),true);
 assert.equal(gate.sample(-60,400),true);
 assert.equal(gate.sample(-60,650),false);
 assert.equal(gate.sample(-80,800),false);
 gate.reset();
 assert.equal(gate.active,false);
 assert.equal(gate.sample(-30,900),false);
});
test('speaking does not react to silence or invalid audio measurements',()=>{
 const gate=new SpeechGate();
 for(let t=0;t<=2000;t+=100)assert.equal(gate.sample(-70,t),false);
 assert.equal(gate.sample(NaN,2100),false);
 assert.equal(gate.sample(-20,2200),false);
 assert.equal(gate.sample(-20,2300),true);
});
test('remote speaking messages validate booleans and notify only on transitions',async()=>{
 const m=new Mesh({});
 let changes=0;
 m.onSpeaking=()=>changes++;
 const peer={id:'p1',name:'Test',speaking:false,count:0,chatCount:0,since:Date.now(),dc:{close(){}},pc:{close(){}}};
 m.peers.set(peer.id,peer);
 const raw=active=>JSON.stringify({v:1,type:'speaking',active});
 await m.data(peer,raw('true'));
 assert.equal(peer.speaking,false);
 await m.data(peer,raw(true));
 assert.equal(peer.speaking,true);
 await m.data(peer,raw(true));
 assert.equal(changes,1);
 await m.data(peer,raw(false));
 assert.equal(peer.speaking,false);
 assert.equal(changes,2);
 m.remove(peer.id);
});
test('local speaking sends heartbeat without unnecessary UI updates',()=>{
 const m=new Mesh({});
 const outgoing=[];let changes=0;
 m.broadcast=value=>outgoing.push(value);
 m.onSpeaking=()=>changes++;
 m.setSpeaking(true);
 m.setSpeaking(true);
 m.setSpeaking(false);
 assert.deepEqual(outgoing.map(x=>x.active),[true,true,false]);
 assert.equal(changes,2);
});
test('all streaming tile layouts and participant list use speaking state',()=>{
 const stage=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../src/style.css'),'utf8');
 assert.equal((stage.match(/data-speaking=\{/g)||[]).length,3);
 assert.ok(app.includes("m.setSpeaking(active)"));
 assert.ok(css.includes('figure[data-speaking="true"]'));
 assert.ok(css.includes('.skin-winamp90{--speaker-accent:'));
});
