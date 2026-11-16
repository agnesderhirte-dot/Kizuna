const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');

test('fresh clock measurements compensate for one-way delivery when scheduling goal sounds',async()=>{
 const {soundStartDelay}=await meshModule;
 const now=1000000;
 assert.equal(soundStartDelay(now,now+160,20,now-1000,160),140);
 assert.equal(soundStartDelay(now,now+60,20,now-1000,160),40);
 assert.equal(soundStartDelay(now,now-50,20,now-1000,160),0);
 assert.equal(soundStartDelay(now,now+3000,20,now-1000,160),null);
});

test('stale or unavailable peer clock measurements use bounded relative scheduling',async()=>{
 const {soundStartDelay}=await meshModule;
 const now=1000000;
 assert.equal(soundStartDelay(now,now+160,20,now-120000,160),160);
 assert.equal(soundStartDelay(now,now+160,0,0,160),160);
 assert.equal(soundStartDelay(now,now+160,0,0,undefined),0);
 assert.equal(soundStartDelay(now,now+160,0,0,700),0);
 assert.equal(soundStartDelay(now,Infinity,0,now,160),null);
});

test('only the latest echoed ping can update the receiver clock offset',async()=>{
 const {Mesh}=await meshModule;
 const mesh=new Mesh({});
 const now=Date.now(),peer={
  id:'friend',name:'Friend',count:0,chatCount:0,since:now,offset:0,
  lastPingAt:now-100,clockObservedAt:0,pc:{close(){}}
 };
 mesh.peers.set(peer.id,peer);
 try{
  await mesh.data(peer,JSON.stringify({v:1,type:'pong',time:now-200,remote:now}));
  assert.equal(peer.clockObservedAt,0);
  await mesh.data(peer,JSON.stringify({v:1,type:'pong',time:now-100,remote:now-40}));
  assert.ok(peer.clockObservedAt>=now);
  assert.ok(Number.isFinite(peer.offset));
 }finally{mesh.close();}
});
