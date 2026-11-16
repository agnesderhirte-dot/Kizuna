const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {verify,verifyWithPublicKey,payload,registerUpdates}=require('../desktop/updates.cjs');

test('updates reject untrusted manifests and invalid limits',()=>{
 assert.throws(()=>verify({version:'0.3.1',size:300000000,sha256:'a'.repeat(64),signature:'fake'}));
 assert.throws(()=>verify({version:'0.3.1',size:100,sha256:'a'.repeat(64),signature:'fake'}));
});

test('signed P2P updates enforce Ed25519, offsets, exact hash and never execute tampered installers',async()=>{
 // Generate temporary keys for the unit test; the app keeps its real, pinned key.
 const pair=crypto.generateKeyPairSync('ed25519');
 const trusted=m=>verifyWithPublicKey(m,pair.publicKey);
 const bytes=Buffer.from('MZ signed test fixture, never executed');
 const unsigned={version:'0.3.3',size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 const manifest={...unsigned,signature:crypto.sign(null,Buffer.from(payload(unsigned)),pair.privateKey).toString('base64')};
 assert.equal(trusted(manifest).version,'0.3.3');
 assert.throws(()=>verify(manifest),'ephemeral signer cannot replace production developer key');
 assert.throws(()=>trusted({...manifest,version:'99.0.0'}));
 assert.throws(()=>trusted({...manifest,sha256:'c'.repeat(64)}));
 assert.throws(()=>trusted({...manifest,size:manifest.size+1}));
 const folder=path.join(__dirname,'../.test-data/update-unit-'+crypto.randomUUID());
 fs.mkdirSync(folder,{recursive:true});
 const handlers={};let opened=false;
 try{
  registerUpdates({
   handle:(name,fn)=>handlers[name]=fn,
   app:{getPath:()=>folder,on:()=>{}},
   dialog:{},win:()=>null,
   shell:{openPath:async()=>{opened=true;return '';}},
   Notification:{isSupported:()=>false},
   isBusy:()=>false,
   verifyManifest:trusted
  });
  assert.deepEqual(handlers.verifyUpdateOffer(manifest),manifest);
  handlers.beginUpdate(manifest);
  assert.throws(()=>handlers.writeUpdate({hash:manifest.sha256,offset:1,bytes}));
  assert.throws(()=>handlers.finishUpdate(manifest.sha256));
  handlers.writeUpdate({hash:manifest.sha256,offset:0,bytes:new Uint8Array(bytes)});
  assert.equal(handlers.finishUpdate(manifest.sha256),manifest.sha256);
  assert.equal(opened,false);
  const updatePath=path.join(folder,'updates',fs.readdirSync(path.join(folder,'updates'))[0]);
  fs.writeFileSync(updatePath,'tampered');
  await assert.rejects(()=>handlers.installUpdate(manifest.sha256),/Kein geprüftes Update/);
  assert.equal(opened,false);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
