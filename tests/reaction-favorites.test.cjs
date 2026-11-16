const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const reactionsModule=loadTs('src/reactions.ts');
const {settings}=require('../desktop/security.cjs');

test('expanded emoji library includes football, emotions and gaming without duplicates',async()=>{
 const {REACTION_GROUPS,isAllowedReaction}=await reactionsModule;
 const all=REACTION_GROUPS.flatMap(g=>[...g.items]);
 assert.ok(all.length>=100);
 assert.equal(new Set(all).size,all.length);
 for(const reaction of ['TOR!','ABSEITS!','VAR!','ELFMETER!','⚽','🏟️','🎮','😂','😡']){
  assert.equal(isAllowedReaction(reaction),true);
 }
 assert.equal(isAllowedReaction('<img src=x>'),false);
});
test('legacy clients get default favorites and bound count',()=>{
 const base={name:'Tester',skin:'original',theme:'dark',accent:'#123456',mic:'',output:'',profile:'auto',resolution:'1080',fps:'30',bitrate:10,noise:true,echo:true,gain:false,systemAudio:false,background:'',turnUrl:'',turnUser:'',turnPassword:''};
 assert.deepEqual(settings.parse(base).favoriteReactions,['⚽','🏆','😂']);
 assert.equal(settings.safeParse({...base,favoriteReactions:Array(13).fill('⚽')}).success,false);
});
test('favorite toggling updates saved settings while closed picker renders nothing',()=>{
 const picker=fs.readFileSync(path.join(__dirname,'../src/ReactionPicker.tsx'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 assert.ok(picker.includes('onlyFavorites'));
 assert.ok(picker.includes('onToggleFavorite(emoji)'));
 assert.ok(picker.includes('{open&&'));
 assert.ok(app.includes('favorites={settings.favoriteReactions}'));
 assert.ok(app.includes('await window.vox.save(next);setSettings(next)'));
});
