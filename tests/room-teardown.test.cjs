const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {once}=require('node:events');
const {createSignaling}=require('../desktop/signaling.cjs');

test('Kizuna closes its local signaling listener instead of leaving an unattended room on leave',async()=>{
 const server=createSignaling({host:'127.0.0.1',port:0,createKey:'k'.repeat(43)});
 await once(server.wss,'listening');
 const port=server.wss.address().port;
 assert.ok(port>0);
 await server.close();
 assert.equal(server.wss.address(),null);
});

test('all room-change paths close the local server and discard stale capture tickets',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 assert.ok(main.includes('pendingCapture=null;if(socket)'));
 assert.ok(main.includes('async function stopHosting()'));
 assert.ok(main.includes('await old.close()'));
 assert.ok(main.includes("handle('leave',async()=>{disconnect();await stopHosting();return true;})"));
 assert.ok(main.includes("disconnect();await stopHosting();if(spec.server==='peerjs')"));
 assert.ok(main.includes("if(cfg.online){disconnect();await stopHosting()"));
});
