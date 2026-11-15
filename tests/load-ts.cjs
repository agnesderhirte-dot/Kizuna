const fs=require('node:fs');
const path=require('node:path');
const {stripTypeScriptTypes}=require('node:module');

/** Node 24's native TS transform: does not rely on TypeScript 7's removed JS API. */
function asDataUrl(rel){
 const file=path.join(__dirname,'..',rel);
 let src=fs.readFileSync(file,'utf8');
 if(src.includes("from './reactions'"))src=src.replace("from './reactions'",'from '+JSON.stringify(asDataUrl('src/reactions.ts')));
 const output=stripTypeScriptTypes(src,{mode:'transform'});
 return 'data:text/javascript;base64,'+Buffer.from(output).toString('base64');
}
async function loadTs(rel){return import(asDataUrl(rel));}
module.exports={loadTs};
