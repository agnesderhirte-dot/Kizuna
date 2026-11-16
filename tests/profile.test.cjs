const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const modulePromise=loadTs('src/mesh.ts');
const security=require('../desktop/security.cjs');

test('legacy settings default profile fields and reject forged avatar paths',()=>{
 const original={
  name:'Tester',skin:'original',theme:'dark',accent:'#123456',mic:'',output:'',profile:'auto',
  resolution:'1080',fps:'30',bitrate:10,noise:true,echo:true,gain:false,systemAudio:false,
  background:'',turnUrl:'',turnUser:'',turnPassword:''
 };
 const parsed=security.settings.parse(original);
 assert.equal(parsed.profilePhoto,'');
 assert.equal(parsed.profileBio,'');
 assert.equal(parsed.favoriteGame,'');
 assert.throws(()=>security.settings.parse({...original,profilePhoto:'../../secret'}));
 assert.throws(()=>security.settings.parse({...original,profileBio:'a'.repeat(161)}));
});
test('profile payload is strictly validated before display',async()=>{
 const {Mesh}=await modulePromise;const mesh=new Mesh({});
 let changes=0;mesh.onChange=()=>changes++;
 const peer={id:'p',name:'Friend',count:0,chatCount:0,since:Date.now(),pc:{close(){}}};
 mesh.peers.set('p',peer);
 const send=msg=>mesh.data(peer,JSON.stringify({v:1,type:'profile',...msg}));
 const image='data:image/jpeg;base64,'+Buffer.from([255,216,255,217]).toString('base64');
 await send({name:'Friend',photo:image,bio:'FM',game:'Football Manager'});
 assert.equal(peer.profile?.photo,image);
 const old=changes;
 await send({name:'Friend',photo:'data:image/svg+xml,<script/>',bio:'',game:''});
 assert.equal(changes,old);
 await send({name:'A',photo:image,bio:'z'.repeat(161),game:''});
 assert.equal(changes,old);
 mesh.remove('p');
});
test('local photo changes stay bounded and use existing data channel',async()=>{
 const {Mesh}=await modulePromise;const mesh=new Mesh({name:'Player'});
 const calls=[];mesh.broadcast=p=>calls.push(p);
 const photo='data:image/jpeg;base64,'+'A'.repeat(800);
 mesh.setProfile({name:'Player',photo,bio:'Hello',game:'FM'});
 assert.equal(calls[0].type,'profile');
 assert.equal(calls[0].photo,photo);
 assert.throws(()=>mesh.setProfile({name:'P',photo:'data:text/html;base64,AAA',bio:'',game:''}));
 assert.throws(()=>mesh.setProfile({name:'P',photo:'',bio:'x'.repeat(161),game:''}));
});
test('app loads and renders local/remote photos without new external provider',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const desktop=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const stage=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 assert.ok(desktop.includes("if(kind==='avatar')"));
 assert.ok(desktop.includes('resize({width:96,height:96'));
 assert.ok(desktop.includes("mime:'image/jpeg'"));
 assert.ok(main.includes("importFile('avatar')"));
 assert.ok(main.includes('mesh.current.setProfile('));
 assert.ok(main.includes('<ProfilePanel'));
 assert.ok(stage.includes('tile.avatar'));
});
