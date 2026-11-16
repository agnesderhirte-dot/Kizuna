const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTs}=require('./load-ts.cjs');
let cached;
async function Updates(){global.__APP_VERSION__='0.4.0';cached??=loadTs('src/updates.ts');return(await cached).RoomUpdates;}
const mockChannel=()=>({readyState:'open',sent:[],onclose:null,onopen:null,onmessage:null,
 send(message){this.sent.push(message);},close(){if(this.readyState==='closed')return;this.readyState='closed';this.onclose?.();}
});
const offer=(version)=>({version,size:32000,sha256:'b'.repeat(64),signature:'A'.repeat(88)});
test('binding the identical update data channel twice does not replace its state',async()=>{
 const RoomUpdates=await Updates();global.window={vox:{abortUpdate:async()=>true}};
 const u=new RoomUpdates(),channel=mockChannel();u.bind('friend','Friend',channel);
 const first=u.links.get('friend');first.offer=offer('0.4.2');u.bind('friend','Friend',channel);
 assert.equal(u.links.get('friend'),first);assert.equal(channel.readyState,'open');
 assert.deepEqual(u.links.get('friend').offer,offer('0.4.2'));
 u.close();delete global.window;
});
test('a delayed update selection cannot publish an installer into another room',async()=>{
 const RoomUpdates=await Updates();let complete;
 global.window={vox:{selectUpdate:()=>new Promise(resolve=>{complete=resolve;}),abortUpdate:async()=>true}};
 const u=new RoomUpdates(),previous=mockChannel();u.bind('p','First room',previous);
 const task=u.publish();u.close();
 const next=mockChannel();u.bind('q','New room',next);
 complete(offer('0.4.9'));await task;
 assert.equal(u.offer,undefined);assert.equal(next.sent.length,0);assert.equal(u.progress,'');
 u.close();delete global.window;
});
test('late update-download authorization aborts after the room was closed',async()=>{
 const RoomUpdates=await Updates();let complete,abort=0;
 global.window={vox:{beginUpdate:()=>new Promise(resolve=>{complete=resolve;}),abortUpdate:async()=>{abort++;return true;}}};
 const u=new RoomUpdates(),c=mockChannel();u.bind('p','Friend',c);u.links.get('p').offer=offer('0.4.1');
 const task=u.accept('p');u.close();complete(true);await task;
 assert.equal(abort,1);assert.equal(u.receiving,undefined);
 u.close();delete global.window;
});
test('departing peers no longer leave stale update version banners',async()=>{
 const RoomUpdates=await Updates();global.window={vox:{notifyUpdate:async()=>true,verifyUpdateOffer:async x=>x,abortUpdate:async()=>true}};
 const u=new RoomUpdates(),a=mockChannel(),b=mockChannel();u.bind('a','A',a);u.bind('b','B',b);
 await u.receive('a',u.links.get('a'),JSON.stringify({type:'offer',manifest:offer('0.4.2')}));
 await u.receive('b',u.links.get('b'),JSON.stringify({type:'offer',manifest:offer('0.5.0')}));
 assert.equal(u.availableVersion,'0.5.0');
 b.close();assert.equal(u.availableVersion,'0.4.2');
 a.close();assert.equal(u.availableVersion,'');
 u.close();delete global.window;
});
test('leaving clears per-room offers but a verified installer remains available for manual installation',async()=>{
 const RoomUpdates=await Updates();global.window={vox:{abortUpdate:async()=>true}};
 const u=new RoomUpdates(),a=mockChannel();u.bind('a','A',a);
 u.offer=offer('0.4.5');u.availableVersion='0.4.5';u.ready='a'.repeat(64);
 u.close();
 assert.equal(u.offer,undefined);assert.equal(u.availableVersion,'');
 assert.equal(u.ready,'a'.repeat(64));
 assert.match(u.progress,/Update geprüft/);
 delete global.window;
});
