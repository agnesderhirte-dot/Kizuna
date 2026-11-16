const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const gatePromise=loadTs('src/MediaActivityGate.ts');
const poolPromise=loadTs('src/SoundPlaybackPool.ts');

test('media activity only notifies Electron when the live state changes',async()=>{
 const {MediaActivityGate}=await gatePromise;
 const calls=[];
 const gate=new MediaActivityGate(async value=>{calls.push(value);},err=>{throw err;});
 assert.equal(gate.update(false),true);
 for(let i=0;i<1000;i++)assert.equal(gate.update(false),false);
 assert.equal(gate.update(true),true);
 for(let i=0;i<1000;i++)assert.equal(gate.update(true),false);
 assert.deepEqual(calls,[false,true]);
 gate.reset();
 assert.equal(gate.update(true),true);
 assert.deepEqual(calls,[false,true,true]);
});

test('media activity IPC may retry after a failed notification',async()=>{
 const {MediaActivityGate}=await gatePromise;
 let failures=0,calls=0;
 const gate=new MediaActivityGate(async()=>{calls++;if(calls===1)throw Error('test');},()=>{failures++;});
 assert.equal(gate.update(true),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(failures,1);
 assert.equal(gate.update(true),true);
 assert.equal(calls,2);
});

function fakeAudio(){
 return {paused:0,removed:0,onended:null,onerror:null,
  pause(){this.paused++;},removeAttribute(key){assert.equal(key,'src');this.removed++;}
 };
}

test('soundboard pool revokes audio URLs on finish, manual stop and error',async()=>{
 const {SoundPlaybackPool}=await poolPromise;
 const revoked=[];
 const pool=new SoundPlaybackPool(url=>revoked.push(url));
 const a=fakeAudio(),b=fakeAudio(),c=fakeAudio();
 pool.add(a,'blob:a');pool.add(b,'blob:b');pool.add(c,'blob:c');
 assert.equal(pool.size,3);
 a.onended();
 assert.equal(pool.has(a),false);
 assert.deepEqual(revoked,['blob:a']);
 b.onerror();
 assert.equal(pool.size,1);
 pool.stopAll();
 pool.stopAll();
 assert.deepEqual(revoked,['blob:a','blob:b','blob:c']);
 assert.equal(c.paused,1);
 assert.equal(c.removed,1);
 assert.equal(pool.size,0);
});

test('reusing an audio object never leaks its previous URL',async()=>{
 const {SoundPlaybackPool}=await poolPromise;
 const urls=[];const pool=new SoundPlaybackPool(url=>urls.push(url));
 const audio=fakeAudio();
 pool.add(audio,'blob:old');pool.add(audio,'blob:new');
 assert.deepEqual(urls,['blob:old']);
 pool.stopAll();
 assert.deepEqual(urls,['blob:old','blob:new']);
});

test('game volume adjustment no longer reroutes an output device on every update',()=>{
 const stage=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 assert.ok(stage.includes('useEffect(()=>{ref.current!.volume=sound.volume;},[sound.volume])'));
 assert.ok(stage.includes('[sound.output,sound.onError,playsScreenAudio]'));
 assert.ok(stage.includes('[sound.output,sound.onError]'));
 assert.ok(app.includes('useEffect(()=>{ref.current!.volume=volume;},[volume])'));
 assert.ok(app.includes('[output,onError]'));
 assert.ok(app.includes('mediaGate.update('));
 assert.ok(app.includes('playing.stopAll()'));
 assert.ok(app.includes('if(!active)return;'));
});
