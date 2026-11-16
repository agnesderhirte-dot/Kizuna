const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const modulePromise=loadTs('src/audio-mix.ts');

test('individual voice volumes stay separate from global voice level',async()=>{
 const {peerVoiceVolume}=await modulePromise;
 assert.equal(peerVoiceVolume(1,'alice',{}),1);
 assert.equal(peerVoiceVolume(.8,'alice',{alice:.5,bob:1}),.4);
 assert.equal(peerVoiceVolume(.8,'bob',{alice:.5,bob:1}),.8);
 assert.equal(peerVoiceVolume(.8,'alice',{alice:0,bob:1}),0);
 assert.equal(peerVoiceVolume(3,'alice',{alice:2}),1);
 assert.equal(peerVoiceVolume(-2,'bob',{}),0);
 assert.equal(peerVoiceVolume(1,'bob',{bob:NaN}),1);
});

test('voice mixing only affects peer microphone receiver elements',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const panel=fs.readFileSync(path.join(__dirname,'../src/ParticipantAudio.tsx'),'utf8');
 const stage=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 assert.ok(main.includes("peerVoiceVolume(volume.voice,r.peer,voiceLevels)"));
 assert.ok(main.includes("r.kind!=='screen'"));
 assert.ok(main.includes("screenVolume={volume.screen}"));
 assert.ok(main.includes("audio.volume=prefs.current.volume.sound"));
 assert.ok(main.includes("setVoiceLevels({});"));
 assert.ok(main.includes("delete next[e.id]"));
 assert.ok(panel.includes("Stelle Stimmen einzeln ein."));
 assert.ok(panel.includes('previousNonZero.current[peer.id]??1'));
 assert.ok(panel.includes('previousNonZero.current[peer.id]=volume'));
 assert.ok(panel.includes('onChange(peer.id,0)'));
 assert.ok(stage.includes("const playsScreenAudio=!tile.local&&tile.kind==='screen'"));
});

test('mixer leaves active network tracks, sending and soundboard packets untouched',()=>{
 const m=fs.readFileSync(path.join(__dirname,'../src/audio-mix.ts'),'utf8');
 for(const disallowed of ['RTCPeerConnection','getSenders(','setParameters(','broadcast(','capture(','send(','fetch('])assert.ok(!m.includes(disallowed),disallowed);
});
