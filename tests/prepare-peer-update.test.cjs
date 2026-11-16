const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {preparePeerUpdate}=require('../scripts/prepare-peer-update.cjs');
const {verifyWithPublicKey}=require('../desktop/updates.cjs');

async function withFixture(callback){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kizuna-signed-update-'));
 const installer=path.join(dir,'KIZUNA-Setup-x64.exe');
 const checksum=installer+'.sha256';
 const privateKey=path.join(dir,'private.pem'),publicKey=path.join(dir,'public.pem');
 const {privateKey:priv,publicKey:pub}=crypto.generateKeyPairSync('ed25519');
 fs.writeFileSync(privateKey,priv.export({type:'pkcs8',format:'pem'}));
 fs.writeFileSync(publicKey,pub.export({type:'spki',format:'pem'}));
 fs.writeFileSync(installer,crypto.randomBytes(100));
 const hash=crypto.createHash('sha256').update(fs.readFileSync(installer)).digest('hex');
 fs.writeFileSync(checksum,hash+'  KIZUNA-Setup-x64.exe\n');
 try{return await callback({dir,installer,checksum,privateKey,publicKey,hash});}
 finally{fs.rmSync(dir,{recursive:true,force:true});}
}
test('signed package metadata is verified with the existing pinned update public key',async()=>{
 await withFixture(async info=>{
  const first=await preparePeerUpdate({...info,versionString:'0.4.0'});
  assert.equal(first.created,true);
  assert.equal(first.manifest.sha256,info.hash);
  assert.equal(first.manifest.version,'0.4.0');
  assert.deepEqual(verifyWithPublicKey(first.manifest,fs.readFileSync(info.publicKey)),first.manifest);
  assert.equal(JSON.parse(fs.readFileSync(first.file,'utf8')).signature,first.manifest.signature);
  const second=await preparePeerUpdate({...info,versionString:'0.4.0'});
  assert.equal(second.created,false);
 });
});
test('signing fails if installer differs from original GitHub checksummed artifact',async()=>{
 await withFixture(async info=>{
  fs.appendFileSync(info.installer,'tampered');
  await assert.rejects(()=>preparePeerUpdate(info),/entspricht nicht/);
  assert.equal(fs.existsSync(info.installer+'.update.json'),false);
 });
});
test('a missing old signing key is never silently replaced',async()=>{
 await withFixture(async info=>{
  const absent=path.join(info.dir,'nonexistent.pem');
  await assert.rejects(()=>preparePeerUpdate({...info,privateKey:absent}),/Bestehender privater Updateschlüssel fehlt/);
  assert.equal(fs.existsSync(absent),false);
  assert.equal(fs.existsSync(info.installer+'.update.json'),false);
 });
});
test('a different signing identity is rejected by previously installed clients',async()=>{
 await withFixture(async info=>{
  const {publicKey}=crypto.generateKeyPairSync('ed25519');
  const wrong=path.join(info.dir,'different-public.pem');
  fs.writeFileSync(wrong,publicKey.export({type:'spki',format:'pem'}));
  await assert.rejects(()=>preparePeerUpdate({...info,publicKey:wrong}),/Entwicklerschlüssel/);
  assert.equal(fs.existsSync(info.installer+'.update.json'),false);
 });
});
test('existing signed manifests are never overwritten on a repeat attempt',async()=>{
 await withFixture(async info=>{
  fs.writeFileSync(info.installer+'.update.json','do-not-replace');
  await assert.rejects(()=>preparePeerUpdate(info),/Nicht überschreiben/);
  assert.equal(fs.readFileSync(info.installer+'.update.json','utf8'),'do-not-replace');
 });
});
