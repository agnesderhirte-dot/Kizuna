const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');

test('webRTC negotiation queue rejects a flood without unbounded pending work',async()=>{
 const {Mesh}=await meshModule;
 let finish;
 class SlowPeer{
  connectionState='new';signalingState='stable';remoteDescription=null;
  async setRemoteDescription(d){await new Promise(resolve=>{finish=resolve;});this.remoteDescription=d;}
  async addIceCandidate(){}
  close(){this.connectionState='closed';}
  getSenders(){return [];}restartIce(){}
 }
 global.RTCPeerConnection=SlowPeer;
 const mesh=new Mesh({turnUrl:''});
 const errors=[];mesh.onError=value=>errors.push(value);
 mesh.add('peer','Friend',false);
 try{
  const first=mesh.receive('peer',{description:{type:'answer',sdp:'v=0\r\n'}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(typeof finish,'function');
  const arrivals=[];
  for(let i=0;i<134;i++)arrivals.push(mesh.receive('peer',{candidate:{candidate:'candidate:'+i,sdpMid:'0',sdpMLineIndex:0}}));
  assert.equal(mesh.peers.has('peer'),false);
  assert.ok(errors.some(value=>value.includes('Zu viele Signaling-Nachrichten')));
  finish();
  await Promise.all([first,...arrivals]);
 }finally{mesh.close();delete global.RTCPeerConnection;}
});

test('webRTC signaling rejects oversized or cyclic packets without parsing browser SDP',async()=>{
 const {Mesh}=await meshModule;
 class FakePC{
  connectionState='new';signalingState='stable';remoteDescription=null;
  close(){this.connectionState='closed';}
  getSenders(){return [];}restartIce(){}
 }
 global.RTCPeerConnection=FakePC;
 const mesh=new Mesh({turnUrl:''});mesh.add('peer','Friend',false);
 try{
  const cyclic={};cyclic.self=cyclic;
  await mesh.receive('peer',cyclic);
  assert.ok(mesh.peers.has('peer'),'cyclic object ignored without breaking room');
  await mesh.receive('peer',{description:{type:'offer',sdp:'x'.repeat(61000)}});
  assert.equal(mesh.peers.has('peer'),false,'oversized packet disconnects hostile link');
 }finally{mesh.close();delete global.RTCPeerConnection;}
});
