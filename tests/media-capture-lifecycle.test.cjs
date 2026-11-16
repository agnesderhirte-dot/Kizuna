const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
function app(){return fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');}
test('microphone capture checks session identity immediately after user permission resolves',()=>{
 const code=app();
 const start=code.indexOf('async function voice(){');
 const end=code.indexOf('async function screen(',start);
 const section=code.slice(start,end);
 assert.ok(section.includes('const m=mesh.current!,epoch=sessionEpoch.current'));
 assert.ok(section.includes('await navigator.mediaDevices.getUserMedia('));
 assert.match(section,/if\(sessionEpoch\.current!==epoch\|\|mesh\.current!==m\|\|!currentRoom\.current\)\{stream\.getTracks\(\)\.forEach\(t=>t\.stop\(\)\);return;\}/);
 assert.ok(section.indexOf('getUserMedia(')<section.indexOf('stream.getTracks().forEach(t=>t.stop())'));
 assert.ok(section.indexOf('stream.getTracks().forEach(t=>t.stop())')<section.indexOf("m.setLocal('voice',stream)"));
 assert.ok(section.includes('sessionEpoch.current===epoch&&mesh.current===m'));
});
test('screen share drops stale streams and ignores ended events from older streams',()=>{
 const code=app();
 const start=code.indexOf('async function screen(');
 const end=code.indexOf('async function camera(',start);
 const section=code.slice(start,end);
 assert.ok(section.includes('await navigator.mediaDevices.getDisplayMedia('));
 assert.equal((section.match(/stream\.getTracks\(\)\.forEach\(t=>t\.stop\(\)\)/g)||[]).length,3);
 assert.ok(section.includes("m.local.get('screen')===stream"));
 assert.ok(section.includes('sessionEpoch.current===epoch'));
 assert.ok(section.includes("throw Error('Bildschirmfreigabe enthält kein Videosignal.')"));
});
test('leaving, entering and unmount invalidate pending media permission requests',()=>{
 const code=app();
 assert.ok(code.includes('async function enter(host:boolean){sessionEpoch.current++;'));
 assert.ok(code.includes("async function leave(){sessionEpoch.current++;currentRoom.current='';"));
 assert.ok(code.includes('return()=>{alive=false;sessionEpoch.current++;'));
});
