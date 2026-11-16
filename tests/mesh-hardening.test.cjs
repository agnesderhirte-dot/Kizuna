const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');
const h=n=>n.toString(16).padStart(64,'0');

test('a malicious peer cannot fill the acknowledged sound cache with unoffered hashes',async()=>{
 const {Mesh}=await meshModule;
 const m=new Mesh({});
 const peer={id:'peer1',name:'Friend',count:0,chatCount:0,since:Date.now(),readySounds:new Set(),offeredSounds:new Set(),pendingSoundReady:new Map(),pc:{close(){}}};
 m.peers.set(peer.id,peer);
 for(let i=1;i<=50;i++)await m.data(peer,JSON.stringify({v:1,type:'sound-ready',hash:h(i)}));
 assert.equal(peer.readySounds.size,0);
 for(let i=1;i<=40;i++){peer.offeredSounds.add(h(i));await m.data(peer,JSON.stringify({v:1,type:'sound-ready',hash:h(i)}));}
 assert.equal(peer.readySounds.size,32);
 assert.equal(peer.readySounds.has(h(40)),true);
 assert.equal(peer.readySounds.has(h(1)),false);
 m.remove(peer.id);
});

test('duplicate KIZUNA message/update channels are rejected for a connected peer',async()=>{
 const {Mesh}=await meshModule;
 class FakePC{
  connectionState='new';signalingState='stable';remoteDescription=null;
  createDataChannel(label){return {label,readyState:'open',bufferedAmount:0,send(){},close(){this.readyState='closed';}};}
  getSenders(){return [];}addTrack(){}close(){this.connectionState='closed';}restartIce(){}
 }
 global.RTCPeerConnection=FakePC;
 const m=new Mesh({turnUrl:''});
 m.add('friend','Friend',true);
 try{
  const p=m.peers.get('friend');
  const originalControl=p.dc;
  const originalUpdates=p.updatesDc;
  let closed=0;
  for(const label of ['voxrally-v1','voxrally-updates-v1']){
   const channel={label,readyState:'open',close(){closed++;}};
   p.pc.ondatachannel({channel});
  }
  assert.equal(closed,2);
  assert.equal(p.dc,originalControl);
  assert.equal(p.updatesDc,originalUpdates);
 }finally{m.close();delete global.RTCPeerConnection;}
});

test('closed peers ignore late callbacks; closing session discards caches and scheduled sounds',async()=>{
 const {Mesh}=await meshModule;
 class FakePC{
  connectionState='new';signalingState='stable';
  createDataChannel(label){return {label,readyState:'open',bufferedAmount:0,send(){},close(){this.readyState='closed';}};}
  getSenders(){return [];}addTrack(){}close(){this.connectionState='closed';}restartIce(){}
 }
 global.RTCPeerConnection=FakePC;
 const m=new Mesh({turnUrl:''});let reactions=0,playbacks=0;
 m.onReaction=()=>reactions++;m.onSound=()=>playbacks++;
 m.add('friend','Friend',true);
 const p=m.peers.get('friend');const oldOnMessage=p.dc.onmessage;
 m.sounds.set(h(1),new Blob([new Uint8Array([82,73,70,70])],{type:'audio/wav'}));
 await m.sound(new Blob([new Uint8Array([82,73,70,70])],{type:'audio/wav'}));
 m.close();
 oldOnMessage({data:JSON.stringify({v:1,type:'reaction',emoji:'⚽'})});
 await new Promise(resolve=>setTimeout(resolve,220));
 assert.equal(reactions,0);
 assert.equal(playbacks,0);
 assert.equal(m.sounds.size,0);
 assert.equal(m.peers.size,0);
 delete global.RTCPeerConnection;
});
