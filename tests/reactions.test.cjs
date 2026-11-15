const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const {Mesh}=loadTs('src/mesh.ts');
const {REACTION_GROUPS,isAllowedReaction}=loadTs('src/reactions.ts');

test('football and classic reaction catalog has safe bounded whitelist',()=>{
 const all=REACTION_GROUPS.flatMap(g=>g.items);
 assert.ok(all.includes('⚽')&&all.includes('🏆')&&all.includes('😂'));
 assert.equal(isAllowedReaction('TOR!'),true);
 assert.equal(isAllowedReaction('<script>alert(1)</script>'),false);
 assert.equal(isAllowedReaction('unknown'),false);
 assert.equal(new Set(all).size,all.length);
});
test('sender limits reactions to six per three seconds',()=>{
 const m=new Mesh({});
 let sent=0;
 m.broadcast=()=>sent++;
 for(let i=0;i<6;i++)assert.equal(m.sendReaction('⚽'),true);
 assert.equal(m.sendReaction('⚽'),false);
 assert.equal(sent,6);
 assert.equal(m.sendReaction('<svg/>'),false);
 assert.equal(sent,6);
});
test('receiver rejects spoofed and excessive reactions',async()=>{
 const m=new Mesh({});
 const received=[];m.onReaction=(id,name,emoji)=>received.push({id,name,emoji});
 const peer={id:'peer-a',name:'Friend',reactionStart:0,reactionCount:0,count:0,chatCount:0,since:Date.now()};
 const message=emoji=>JSON.stringify({v:1,type:'reaction',emoji});
 await m.data(peer,message('<iframe>'));
 assert.equal(received.length,0);
 for(let i=0;i<10;i++)await m.data(peer,message('⚽'));
 assert.equal(received.length,6);
 assert.deepEqual(received[0],{id:'peer-a',name:'Friend',emoji:'⚽'});
});
test('stream control and overlay are connected',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const stage=fs.readFileSync(path.join(__dirname,'../src/VideoStage.tsx'),'utf8');
 assert.ok(main.includes('<ReactionPicker send={'));
 assert.ok(main.includes('reactions={reactions}'));
 assert.ok(stage.includes('className="stream-reaction-overlay"'));
});
