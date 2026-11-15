const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {EventEmitter}=require('node:events');
test('cloud uses chunked transport; failed unopened handshake retries; host registration keeps live room',async()=>{
 let options;class Connection extends EventEmitter{open=false;peer='host-123';close(){if(this.open){this.open=false;this.emit('close');}}}
 global.__FakePeer=class extends EventEmitter{connect(_id,o){options=o;return new Connection();}destroy(){}};
 const text=fs.readFileSync(require('node:path').join(__dirname,'../src/cloud.ts'),'utf8').replace(/import Peer,\{type DataConnection\} from 'peerjs';/, 'type DataConnection=any; const Peer=globalThis.__FakePeer;');
 const code=require('node:module').stripTypeScriptTypes(text,{mode:'transform'});
 const {CloudRoom}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const timers=[];const original=global.setTimeout;global.setTimeout=(fn,ms)=>{timers.push({fn,ms});return original(()=>{},60000);};
 let guest,host;try{
  guest=new CloudRoom({room:'room',token:'secret',self:'guest-123',host:'host-123',name:'G'},{turnUrl:''},()=>{});
  guest.peer.emit('open');assert.equal(options.serialization,'binary');assert.equal(guest.links.size,1);
  timers.find(t=>t.ms===20000).fn();assert.equal(guest.links.size,0);assert.equal(guest.attempt,1);assert.ok(guest.retry);
  let welcomes=0;host=new CloudRoom({room:'room',token:'secret',self:'host-123',host:'host-123',name:'H'},{turnUrl:''},e=>{if(e.type==='welcome')welcomes++;});
  host.peer.emit('open');host.peer.emit('open');assert.equal(welcomes,1);
 }finally{guest?.close();host?.close();global.setTimeout=original;delete global.__FakePeer;}
});
