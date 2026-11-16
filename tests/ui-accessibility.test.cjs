const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');

test('own profile photo is visible in sidebar while initials remain a fallback',()=>{
 assert.ok(app.includes('<div className="side-bottom"><div className="avatar">{avatar.id===settings.profilePhoto&&avatar.url?<img src={avatar.url} alt="Dein Profilbild"/>:settings.name.slice(0,2).toUpperCase()}</div>'));
});

test('calendar page has its own header and navigation label',()=>{
 assert.ok(app.includes("view==='calendar'?'SPIELKALENDER'"));
 assert.ok(app.includes("view==='calendar'?'Deine nächsten Spielabende.'"));
});
