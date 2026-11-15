const test=require('node:test');const assert=require('node:assert/strict');const {once}=require('node:events');const {WebSocket}=require('ws');const {createSignaling}=require('../desktop/signaling.cjs');
const token='x'.repeat(43),key='k'.repeat(43),room='testroom123';
function next(ws,type){return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{ws.off('message',receive);reject(Error('timeout'));},4000);function receive(raw){const m=JSON.parse(raw.toString());if(type&&m.type!==type)return;clearTimeout(timeout);ws.off('message',receive);resolve(m);}ws.on('message',receive);});}
async function join(url,extra={}){const ws=new WebSocket(url);await once(ws,'open');const reply=next(ws);ws.send(JSON.stringify({v:1,type:'join',name:'Tester',room,token,...extra}));return {ws,message:await reply};}
test('private room authorization, discovery, relay identity, capacity and malformed JSON',async()=>{const s=createSignaling({port:0,createKey:key});await once(s.wss,'listening');const url=`ws://127.0.0.1:${s.wss.address().port}`;try{
 const denied=await join(url,{create:true,createKey:'wrong'});assert.equal(denied.message.type,'error');denied.ws.terminate();
 const a=await join(url,{create:true,createKey:key});assert.equal(a.message.type,'welcome');
 const wrong=await join(url,{token:'y'.repeat(43)});assert.equal(wrong.message.type,'error');wrong.ws.terminate();
 const b=await join(url);assert.equal(b.message.peers[0].id,a.message.self);
 const relay=next(a.ws,'signal');b.ws.send(JSON.stringify({v:1,type:'signal',to:a.message.self,from:'forged-peer',data:{description:{type:'offer',sdp:'fake'}}}));const msg=await relay;assert.equal(msg.from,b.message.self);
 for(let n=0;n<140;n++)b.ws.send(JSON.stringify({v:1,type:'signal',to:a.message.self,data:{candidate:{}}}));
 const burst=new Promise(resolve=>{const handler=raw=>{const value=JSON.parse(raw);if(value.data?.marker==='burst-end'){a.ws.off('message',handler);resolve(value);}};a.ws.on('message',handler);});b.ws.send(JSON.stringify({v:1,type:'signal',to:a.message.self,data:{marker:'burst-end'}}));assert.equal((await burst).from,b.message.self);
 const c=await join(url),d=await join(url);assert.equal(c.message.type,'welcome');assert.equal(d.message.type,'welcome');const full=await join(url);assert.equal(full.message.type,'error');full.ws.terminate();
 const left=next(a.ws,'left');d.ws.close();await left;const afterLeave=next(c.ws,'signal');a.ws.send(JSON.stringify({v:1,type:'signal',to:d.message.self,data:{candidate:{}}}));a.ws.send(JSON.stringify({v:1,type:'signal',to:c.message.self,data:{candidate:{}}}));assert.equal((await afterLeave).from,a.message.self);
 const invalid=next(b.ws,'error');b.ws.send('{not json');assert.equal((await invalid).type,'error');
}finally{await s.close();}});
