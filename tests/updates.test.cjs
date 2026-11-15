const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {verify,payload,registerUpdates}=require('../desktop/updates.cjs');
const key=path.join(__dirname,'../build/private/update-key.pem');
test('updates reject untrusted manifests and invalid limits',()=>{assert.throws(()=>verify({version:'0.3.1',size:300000000,sha256:'a'.repeat(64),signature:'fake'}));assert.throws(()=>verify({version:'0.3.1',size:100,sha256:'a'.repeat(64),signature:'fake'}));});
test('signed updates enforce offsets, exact length and content hash before installation',{skip:!fs.existsSync(key)},async()=>{
 const bytes=Buffer.from('MZ signed test fixture, never executed');const manifest={version:'0.3.1',size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};manifest.signature=crypto.sign(null,Buffer.from(payload(manifest)),fs.readFileSync(key)).toString('base64');assert.equal(verify(manifest).version,'0.3.1');assert.throws(()=>verify({...manifest,version:'99.0.0'}));
 const folder=path.join(__dirname,'../.test-data/update-unit-'+crypto.randomUUID());fs.mkdirSync(folder,{recursive:true});const handlers={};let opened=false;
 registerUpdates({handle:(name,fn)=>handlers[name]=fn,app:{getPath:()=>folder,on:()=>{}},dialog:{},win:()=>null,shell:{openPath:async()=>{opened=true;return '';}},Notification:{isSupported:()=>false}});
 handlers.beginUpdate(manifest);assert.throws(()=>handlers.writeUpdate({hash:manifest.sha256,offset:1,bytes}));assert.throws(()=>handlers.finishUpdate(manifest.sha256));handlers.writeUpdate({hash:manifest.sha256,offset:0,bytes:new Uint8Array(bytes)});assert.equal(handlers.finishUpdate(manifest.sha256),manifest.sha256);assert.equal(opened,false);
 const file=path.join(folder,'updates',fs.readdirSync(path.join(folder,'updates'))[0]);fs.writeFileSync(file,'tampered');await assert.rejects(()=>handlers.installUpdate(manifest.sha256));assert.equal(opened,false);
});
