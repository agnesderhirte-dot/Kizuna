const test=require('node:test');
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');

test('malformed ICE candidates are rejected before they trigger browser negotiation',async()=>{
 const {Mesh,validIceCandidate}=await meshModule;
 assert.equal(validIceCandidate({candidate:'candidate:1 1 udp 1 127.0.0.1 9 typ host',sdpMid:'0',sdpMLineIndex:0}),true);
 for(const raw of [null,'oops',{},[],{candidate:5},{candidate:'x'.repeat(8193)},{candidate:'abc',sdpMLineIndex:-1},{candidate:'abc',sdpMLineIndex:999},{candidate:'abc',sdpMid:'X'.repeat(129)},{candidate:'abc',usernameFragment:[]}])assert.equal(validIceCandidate(raw),false);
 let applied=0;
 class FakePC{
  connectionState='new';signalingState='stable';remoteDescription={type:'offer'};
  addIceCandidate(){applied++;return Promise.resolve();}
  close(){this.connectionState='closed';}getSenders(){return [];}restartIce(){}
 }
 global.RTCPeerConnection=FakePC;
 const m=new Mesh({turnUrl:''});
 try{
  m.self='self';m.add('peer-id','Friend',false);
  await m.receive('peer-id',{candidate:{candidate:'x'.repeat(8193)}});
  await m.receive('peer-id',{candidate:{candidate:'abc',sdpMLineIndex:-4}});
  assert.equal(applied,0);
  await m.receive('peer-id',{candidate:{candidate:'valid',sdpMid:'0',sdpMLineIndex:0}});
  assert.equal(applied,1);
 }finally{m.close();delete global.RTCPeerConnection;}
});

function createCloud(){
 class Connection extends EventEmitter{
  peer='guest-123';open=true;closeCalls=0;sent=[];
  close(){this.closeCalls++;this.open=false;this.emit('close');}
  send(x){this.sent.push(x);}
 }
 global.__FakePeer=class extends EventEmitter{
  destroyed=false;
  connect(){return new Connection();}
  destroy(){this.destroyed=true;}
 };
 const source=fs.readFileSync(path.join(__dirname,'../src/cloud.ts'),'utf8')
  .replace(/import Peer,\{type DataConnection\} from 'peerjs';/,'type DataConnection=any; const Peer=globalThis.__FakePeer;');
 const compiled=require('node:module').stripTypeScriptTypes(source,{mode:'transform'});
 return import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64')).then(({CloudRoom})=>({CloudRoom,Connection}));
}

test('cloud signaling bounds both queued input and output even before decrypting',async()=>{
 const {CloudRoom,Connection}=await createCloud();
 const spec={room:'room',token:'secret',self:'host-123',host:'host-123',name:'Host'};
 const host=new CloudRoom(spec,{turnUrl:''},()=>{});
 try{
  const inbound=new Connection();
  host.peer.emit('connection',inbound);
  for(let i=0;i<7;i++)inbound.emit('data','X'.repeat(100000));
  assert.ok(inbound.closeCalls>=1,'oversized queued signaling must close the connection');
  const outbound=new Connection();
  host.peer.emit('connection',outbound);
  const link=host.links.get(outbound.peer);
  assert.ok(link);
  for(let i=0;i<10;i++)host.send(link,{type:'signal',data:'X'.repeat(65000)});
  assert.ok(outbound.closeCalls>=1,'outbound queue must be bounded while encryption is pending');
 }finally{host.close();delete global.__FakePeer;}
});
