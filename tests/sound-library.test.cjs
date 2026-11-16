const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('only sound assets may be removed, using validated hash IDs',()=>{
 const backend=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const pos=backend.indexOf("handle('deleteSound'");
 assert.ok(pos!==-1);
 const handler=backend.slice(pos,backend.indexOf("handle('asset'",pos));
 assert.match(handler,/\^\[0-9a-f\]\{64\}\$/);
 assert.ok(handler.includes("item.kind!=='sound'"));
 assert.ok(handler.includes('fs.rmSync(assetFile(id),{force:true})'));
 assert.ok(handler.includes("DELETE FROM assets WHERE id=?"));
 assert.ok(handler.indexOf('fs.rmSync(')<handler.indexOf("DELETE FROM assets"));
});

test('deletion requires two clicks and updates only the removed sound',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const bridge=fs.readFileSync(path.join(__dirname,'../desktop/preload.cjs'),'utf8');
 assert.ok(main.includes('pendingSoundRemoval===a.id'));
 assert.ok(main.includes('Löschen bestätigen'));
 assert.ok(main.includes('Sound entfernen'));
 assert.ok(main.includes('Abbrechen'));
 assert.ok(main.includes('await window.vox.deleteSound(a.id)'));
 assert.ok(main.includes('setAssets(old=>old.filter(x=>x.id!==a.id))'));
 assert.ok(bridge.includes("'deleteSound'"));
});

test('sound removal leaves linked backgrounds, profile and settings out of scope',()=>{
 const backend=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const handler=backend.slice(backend.indexOf("handle('deleteSound'"),backend.indexOf("handle('asset'"));
 assert.ok(!handler.includes("UPDATE kv"));
 assert.ok(!handler.includes("DELETE FROM kv"));
 assert.ok(!handler.includes("DELETE FROM messages"));
});
