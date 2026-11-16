const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');

test('remote game audio mute is independent of voice and soundboard',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const stage=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 assert.ok(app.includes('screenMuted={screenMuted}'));
 assert.ok(app.includes("r.kind!=='screen'&&r.stream.getAudioTracks()"));
 assert.ok(app.includes('muted={deaf} volume={peerVoiceVolume(volume.voice,r.peer,voiceLevels)}'));
 assert.ok(app.includes('audio.volume=prefs.current.volume.sound'));
 assert.ok(stage.includes("const playsScreenAudio=!tile.local&&tile.kind==='screen'"));
 assert.ok(stage.includes('muted={!playsScreenAudio||sound.muted}'));
 assert.ok(stage.includes('audio.volume=sound.volume'));
 assert.ok(stage.includes('aria-pressed={!!screenMuted[t.id]}'));
 assert.ok(stage.includes('OffscreenAudio'));
});
test('screen sound and video use the same media element in grid and focus',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 assert.ok(source.includes('video.srcObject=tile.stream'));
 assert.ok(source.includes('playsScreenAudio'));
 assert.ok(source.includes('sound={soundFor(focused)}'));
 assert.ok(source.includes('sound={soundFor(tile)}'));
 assert.ok(source.includes('t.id!==focused.id'));
});

test('sound transfer is acknowledged and cached, so second playback skips bytes',async()=>{
 const {Mesh}=await meshModule;
 const mesh=new Mesh({});
 const tx=[];
 const peer={id:'p1',name:'Friend',soundAck:true,readySounds:new Set(),pendingSoundReady:new Map(),count:0,chatCount:0,since:Date.now(),soundAt:0,soundTransferAt:0,reactionStart:0,reactionCount:0,offset:0,pc:{close(){}},dc:{readyState:'open',bufferedAmount:0,send(raw){
  const data=JSON.parse(raw);
  tx.push(data);
  if(data.type==='sound-end')void mesh.data(peer,JSON.stringify({v:1,type:'sound-ready',hash:tx.find(x=>x.type==='sound-start').hash}));
 }}};
 mesh.peers.set('p1',peer);
 const blob=new Blob([new Uint8Array([82,73,70,70,0,0,0,0,87,65,86,69])],{type:'audio/wav'});
 await mesh.sound(blob);
 assert.ok(tx.some(x=>x.type==='sound-start'));
 assert.ok(tx.some(x=>x.type==='sound-part'));
 assert.ok(tx.some(x=>x.type==='sound-end'));
 assert.ok(tx.some(x=>x.type==='sound-play'));
 assert.equal(peer.readySounds.size,1);
 tx.length=0;
 await mesh.sound(blob);
 assert.deepEqual(tx.map(x=>x.type),['sound-play']);
 assert.equal(tx[0].delayMs,160);
 mesh.remove('p1');
});
test('an early ready acknowledgement from a pre-cached peer avoids a timeout',async()=>{
 const {Mesh}=await meshModule;
 const mesh=new Mesh({});
 let hash='';
 const peer={id:'p3',name:'Friend',soundAck:true,readySounds:new Set(),pendingSoundReady:new Map(),count:0,chatCount:0,since:Date.now(),soundAt:0,soundTransferAt:0,reactionStart:0,reactionCount:0,offset:0,pc:{close(){}},dc:{readyState:'open',bufferedAmount:0,send(raw){
  const data=JSON.parse(raw);
  if(data.type==='sound-start'){hash=data.hash;void mesh.data(peer,JSON.stringify({v:1,type:'sound-ready',hash}));}
 }}};
 mesh.peers.set('p3',peer);
 const start=Date.now();
 await mesh.sound(new Blob([new Uint8Array([82,73,70,70])],{type:'audio/wav'}));
 assert.ok(hash);
 assert.ok(Date.now()-start<1000,'unnecessary 2.5-second ready timeout');
 mesh.remove('p3');
});
test('receiver honors relative low-latency sound scheduling and reports missing cache',async()=>{
 const {Mesh}=await meshModule;
 const mesh=new Mesh({});
 const messages=[];
 const peer={id:'p2',name:'Friend',count:0,chatCount:0,since:Date.now(),soundAt:0,offset:0,pc:{close(){}},dc:{readyState:'open',bufferedAmount:0,send(x){messages.push(JSON.parse(x));}}};
 mesh.peers.set('p2',peer);
 const hash='a'.repeat(64);
 await mesh.data(peer,JSON.stringify({v:1,type:'sound-play',hash,at:Date.now()+160,delayMs:160}));
 assert.ok(messages.some(m=>m.type==='sound-missing'&&m.hash===hash));
 mesh.remove('p2');
});
