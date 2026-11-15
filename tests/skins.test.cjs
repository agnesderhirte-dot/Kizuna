const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {settings}=require('../desktop/security.cjs');
const skins=['original','classic18','purple22','matchday24','portal27','winamp90','messenger03','neonwave','glassmodern'];

test('legacy and new skins are accepted by settings validation',()=>{
 for(const id of skins)assert.equal(settings.shape.skin.safeParse(id).success,true,id);
 assert.equal(settings.shape.skin.safeParse('invalid').success,false);
 assert.equal(settings.shape.skin.safeParse(undefined).data,'original');
});

test('all nine skins are selectable, and every new skin has CSS styling',()=>{
 const picker=fs.readFileSync(path.join(__dirname,'../src/SkinPicker.tsx'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../src/style.css'),'utf8');
 for(const id of skins)assert.ok(picker.includes("id:'"+id+"'"),id);
 for(const id of skins.slice(5))assert.ok(css.includes('.skin-'+id),id);
});

test('streaming focus mode retains stage toolbar and media-control footer',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../src/style.css'),'utf8');
 assert.ok(app.includes("focusMode&&room&&view==='room'"));
 assert.ok(app.includes('aria-pressed={focusMode}'));
 assert.ok(css.includes('.focus-ui .video-stage'));
 assert.ok(css.includes('.focus-ui footer'));
});
