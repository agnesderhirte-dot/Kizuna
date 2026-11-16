const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');

test('peer identity is preserved for delayed remote soundboard playback',async()=>{
 const {Mesh}=await meshModule;
 const m=new Mesh({});
 const hash='c'.repeat(64);
 const blob=new Blob([new Uint8Array([82,73,70,70])],{type:'audio/wav'});
 m.sounds.set(hash,blob);
 const events=[];
 m.onSound=(value,peerId)=>events.push({value,peerId});
 const peer={id:'peer-123',name:'Freund',soundAt:0,offset:0,count:0,chatCount:0,since:Date.now(),pc:{close(){}}};
 m.peers.set(peer.id,peer);
 await m.data(peer,JSON.stringify({v:1,type:'sound-play',hash,at:Date.now(),delayMs:0}));
 await new Promise(r=>setTimeout(r,20));
 assert.equal(events.length,1);
 assert.equal(events[0].peerId,'peer-123');
 assert.equal(events[0].value,blob);
 m.remove(peer.id);
});

test('incoming effects are filtered locally, never by mutating voice, game or source tracks',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const panel=fs.readFileSync(path.join(__dirname,'../src/ParticipantAudio.tsx'),'utf8');
 const mesh=fs.readFileSync(path.join(__dirname,'../src/mesh.ts'),'utf8');
 assert.ok(app.includes("if(!prefs.current.hiddenReactions[id])showReaction(emoji,name)"));
 assert.ok(app.includes("peerId&&prefs.current.mutedSounds[peerId]"));
 assert.ok(app.includes("setHiddenReactions({});"));
 assert.ok(app.includes("setMutedSounds({});"));
 assert.ok(panel.includes('Reaktionen von {peer.name} anzeigen'));
 assert.ok(panel.includes('Soundboard von {peer.name} hören'));
 assert.ok(mesh.includes('this.onSound(b,p.id)'));
});
