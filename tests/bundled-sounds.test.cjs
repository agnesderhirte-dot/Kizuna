const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {synth,tracks}=require('../desktop/bundled-sounds.cjs');
test('bundled original sounds are valid mono PCM WAV with bounded size',()=>{
 assert.equal(tracks.length,3);
 for(const {id} of tracks){
  const {name,mime,bytes}=synth(id);
  assert.match(name,/KIZUNA/);
  assert.equal(mime,'audio/wav');
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WAVE');
  assert.equal(bytes.toString('ascii',36,40),'data');
  assert.equal(bytes.readUInt16LE(22),1);
  assert.equal(bytes.readUInt32LE(24),22050);
  assert.equal(bytes.readUInt16LE(34),16);
  assert.equal(bytes.readUInt32LE(40)+44,bytes.length);
  assert.ok(bytes.length>2000&&bytes.length<150000);
  assert.deepEqual(synth(id).bytes,bytes);
 }
});
test('only synthesized, opt-in sounds are packaged; no external downloads',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../desktop/bundled-sounds.cjs'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 assert.ok(!source.includes('fetch(')&&!source.includes('https://')&&!source.includes('request('));
 assert.ok(app.includes("handle('installBuiltinSounds'"));
 assert.ok(app.includes("INSERT OR IGNORE INTO assets"));
});
