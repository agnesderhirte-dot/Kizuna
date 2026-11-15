const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
function loadTs(rel){
 const file=path.join(__dirname,'..',rel);
 const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m=new Module(file,module);m.filename=file;m.paths=module.paths;
 const originalRequire=m.require.bind(m);
 m.require=request=>request==='./reactions'?loadTs('src/reactions.ts'):originalRequire(request);
 m._compile(output,file);
 return m.exports;
}
module.exports={loadTs};
