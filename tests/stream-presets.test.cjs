const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('profile choices expose manager clarity and smooth 1440p60 without instant application',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/StreamQuality.tsx'),'utf8');
 assert.match(source,/Football Manager · 1440p30/);
 assert.match(source,/Gaming · 1440p60/);
 assert.match(source,/Sparsam · 1080p30/);
 assert.match(source,/resolution:'1440',fps:'60',profile:'motion',bitrate:20/);
 assert.match(source,/resolution:'1440',fps:'30',profile:'detail',bitrate:12/);
 assert.match(source,/Qualität jetzt anwenden/);
 assert.ok(source.includes('onChange({...settings'));
});
