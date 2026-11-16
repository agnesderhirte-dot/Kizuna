const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTs}=require('./load-ts.cjs');
const meshModule=loadTs('src/mesh.ts');

test('incoming sound cache stays below 24 MiB and evicts least-recently-used clips',async()=>{
 const {Mesh}=await meshModule;
 const mesh=new Mesh({});
 const big=new Blob([new Uint8Array(9*1024*1024)],{type:'audio/wav'});
 try{
  mesh.cacheSound('one',big);
  mesh.cacheSound('two',big);
  mesh.cacheSound('three',big);
  assert.equal(mesh.sounds.size,2);
  assert.deepEqual([...mesh.sounds.keys()],['two','three']);
  mesh.cacheSound('two',big);
  assert.deepEqual([...mesh.sounds.keys()],['three','two']);
  mesh.cacheSound('four',big);
  assert.deepEqual([...mesh.sounds.keys()],['two','four']);
  const total=[...mesh.sounds.values()].reduce((sum,blob)=>sum+blob.size,0);
  assert.ok(total<=24*1024*1024);
  assert.throws(()=>mesh.cacheSound('over',new Blob([new Uint8Array(11*1024*1024)])),/zu groß/);
 }finally{mesh.close();}
});

test('small clips stay bounded by clip count and cached data disappears at exit',async()=>{
 const {Mesh}=await meshModule;
 const mesh=new Mesh({});
 for(let i=0;i<20;i++)mesh.cacheSound('sound-'+i,new Blob(['RIFF'+i],{type:'audio/wav'}));
 assert.equal(mesh.sounds.size,8);
 assert.deepEqual([...mesh.sounds.keys()][0],'sound-12');
 mesh.close();
 assert.equal(mesh.sounds.size,0);
});
