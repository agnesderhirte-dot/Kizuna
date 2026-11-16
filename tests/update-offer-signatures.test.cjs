const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
let mod;
async function updates(){
 global.__APP_VERSION__='0.3.2';
 mod??=loadTs('src/updates.ts');
 return (await mod).RoomUpdates;
}
const manifest={version:'0.3.3',size:32000,sha256:'a'.repeat(64),signature:'A'.repeat(88)};
const mockChannel=()=>({readyState:'open',sent:[],onclose:null,onopen:null,onmessage:null,
 close(){this.readyState='closed';this.onclose?.();},send(v){this.sent.push(v);}
});

test('unsigned peer version strings never trigger update notifications',async()=>{
 const RoomUpdates=await updates();
 const notices=[];
 global.window={vox:{notifyUpdate:async x=>notices.push(x),verifyUpdateOffer:async()=>{throw Error('Unsigned');}}};
 const instance=new RoomUpdates(),channel=mockChannel();
 instance.bind('peer','Guest',channel);
 const link=instance.links.get('peer');
 await instance.receive('peer',link,JSON.stringify({type:'version',version:'100.0.0'}));
 await instance.receive('peer',link,JSON.stringify({type:'offer',manifest}));
 assert.equal(instance.availableVersion,'');
 assert.equal(link.offer,undefined);
 assert.equal(notices.length,0);
 instance.close();delete global.window;delete global.__APP_VERSION__;
});

test('valid offers are announced only after publisher signature has been checked',async()=>{
 const RoomUpdates=await updates();
 const calls=[],notices=[];
 global.window={vox:{
  notifyUpdate:async x=>notices.push(x),
  verifyUpdateOffer:async incoming=>{calls.push(incoming);return {...manifest};}
 }};
 const instance=new RoomUpdates(),channel=mockChannel();
 instance.bind('peer','Guest',channel);const link=instance.links.get('peer');
 await instance.receive('peer',link,JSON.stringify({type:'offer',manifest}));
 assert.deepEqual(calls,[manifest]);assert.equal(link.offer.sha256,manifest.sha256);
 assert.equal(instance.availableVersion,'0.3.3');
 assert.deepEqual(notices,[{version:'0.3.3'}]);
 instance.close();delete global.window;delete global.__APP_VERSION__;
});

test('a signature that finishes verification after peer disconnect cannot create a phantom update',async()=>{
 const RoomUpdates=await updates();
 let unlock;
 const notices=[];
 global.window={vox:{
  notifyUpdate:async x=>notices.push(x),
  verifyUpdateOffer:()=>new Promise(resolve=>{unlock=resolve;})
 }};
 const instance=new RoomUpdates(),channel=mockChannel();
 instance.bind('peer','Guest',channel);
 const pending=instance.receive('peer',instance.links.get('peer'),JSON.stringify({type:'offer',manifest}));
 channel.close();unlock({...manifest});await pending;
 assert.equal(instance.availableVersion,'');assert.deepEqual(notices,[]);
 instance.close();delete global.window;delete global.__APP_VERSION__;
});

test('native verification handler uses the pinned developer signing key',()=>{
 const {verify}=require('../desktop/updates.cjs');
 assert.throws(()=>verify(manifest),/KIZUNA-Entwicklerschlüssel/);
 const native=fs.readFileSync(path.join(__dirname,'../desktop/updates.cjs'),'utf8');
 const bridge=fs.readFileSync(path.join(__dirname,'../desktop/preload.cjs'),'utf8');
 assert.ok(native.includes("handle('verifyUpdateOffer',manifest=>verify(manifest))"));
 assert.ok(bridge.includes("'verifyUpdateOffer'"));
});
