const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTs}=require('./load-ts.cjs');

async function loadUpdates(){
 global.__APP_VERSION__='0.3.2';
 const {RoomUpdates}=await loadTs('src/updates.ts');
 return RoomUpdates;
}
function channel(){
 return {readyState:'open',binaryType:'',sent:[],onopen:null,onmessage:null,onclose:null,
  send(value){this.sent.push(value);},
  close(){if(this.readyState==='closed')return;this.readyState='closed';this.onclose?.();}
 };
}
const manifest={version:'0.3.3',size:32000,sha256:'c'.repeat(64),signature:'A'.repeat(88)};

test('an interrupted binary update transfer stops immediately rather than waiting 15 seconds',async()=>{
 const RoomUpdates=await loadUpdates();
 let reads=0;
 global.window={vox:{readUpdate:async()=>{reads++;return new Uint8Array(32000);},abortUpdate:async()=>true}};
 const updates=new RoomUpdates();
 const dc=channel();updates.bind('person','Friend',dc);
 const transfer=updates.transfer(updates.links.get('person'),manifest);
 for(let i=0;i<10&&dc.sent.length===0;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(reads,1);assert.equal(dc.sent.length,1);
 dc.close();
 await assert.rejects(transfer,/getrennt/);
 assert.equal(updates.links.size,0);
 updates.close();
 delete global.window;delete global.__APP_VERSION__;
});

test('replacing a peer update channel cancels old transfer and ignores its old messages',async()=>{
 const RoomUpdates=await loadUpdates();
 global.window={vox:{readUpdate:async()=>new Uint8Array(32000),abortUpdate:async()=>true}};
 const updates=new RoomUpdates();
 const before=channel();updates.bind('person','Friend',before);
 const link=updates.links.get('person');
 const transfer=updates.transfer(link,manifest);
 for(let i=0;i<10&&before.sent.length===0;i++)await new Promise(resolve=>setImmediate(resolve));
 const after=channel();updates.bind('person','Friend',after);
 await assert.rejects(transfer,/ersetzt/);
 assert.equal(before.readyState,'closed');
 const initial=updates.availableVersion;
 before.onmessage({data:JSON.stringify({type:'version',version:'100.0.0'})});
 assert.equal(updates.availableVersion,initial);
 assert.equal(updates.links.get('person').dc,after);
 updates.close();
 delete global.window;delete global.__APP_VERSION__;
});
