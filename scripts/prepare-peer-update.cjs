/** Prepare a signed KIZUNA peer-update manifest locally, never in CI or a repository commit.
 * The installer is a transport payload for the existing in-app update flow, not a new app.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {hashFile,payload,verifyWithPublicKey}=require('../desktop/updates.cjs');
const {version}=require('../package.json');
const repoRoot=path.resolve(__dirname,'..');
const MAX_SIZE=250*1024*1024;
async function preparePeerUpdate({installer,checksum,privateKey=path.join(repoRoot,'build/private/update-key.pem'),
 publicKey=path.join(repoRoot,'desktop/update-public.pem'),versionString=version}){
 if(typeof installer!=='string'||path.basename(installer)!=='KIZUNA-Setup-x64.exe')throw Error('Nur das geprüfte KIZUNA-Setup-x64.exe kann vorbereitet werden.');
 if(typeof checksum!=='string'||!fs.existsSync(checksum))throw Error('SHA-256-Prüfsummendatei des GitHub-Builds fehlt.');
 if(!fs.existsSync(privateKey))throw Error('Bestehender privater Updateschlüssel fehlt. Keinen neuen Schlüssel erzeugen oder Vertrauensprüfung umgehen.');
 if(!fs.existsSync(publicKey))throw Error('Öffentlicher Updateschlüssel fehlt.');
 const stat=fs.statSync(installer);
 if(!stat.isFile()||stat.size<2||stat.size>MAX_SIZE)throw Error('Update-Dateigröße ungültig oder größer als 250 MiB.');
 if(!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(versionString))throw Error('Ungültige Updateversion.');
 const checksumText=fs.readFileSync(checksum,'utf8').replace(/^\uFEFF/,'').trim();
 const match=/^([a-fA-F0-9]{64})\s+\*?KIZUNA-Setup-x64\.exe$/.exec(checksumText);
 if(!match)throw Error('GitHub-Prüfsummendatei hat ein unerwartetes Format.');
 const sha256=await hashFile(installer);
 if(sha256!==match[1].toLowerCase())throw Error('Installer entspricht nicht dem geprüften GitHub-Download. Kein Update signiert.');
 const candidate={version:versionString,size:stat.size,sha256};
 const signingKey=crypto.createPrivateKey(fs.readFileSync(privateKey));
 if(signingKey.asymmetricKeyType!=='ed25519')throw Error('Privater Updateschlüssel ist kein Ed25519-Schlüssel.');
 const pinned=crypto.createPublicKey(fs.readFileSync(publicKey));
 const signature=crypto.sign(null,Buffer.from(payload(candidate)),signingKey).toString('base64');
 const manifest={...candidate,signature};
 verifyWithPublicKey(manifest,pinned);
 const file=installer+'.update.json';
 if(fs.existsSync(file)){
  const old=fs.readFileSync(file,'utf8');
  if(old!==JSON.stringify(manifest,null,2)+'\n')throw Error('Anders signiertes Update-Manifest existiert bereits. Nicht überschreiben.');
  return {manifest,file,created:false};
 }
 fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
 return {manifest,file,created:true};
}
async function main(args){
 if(args.length!==2||args[0].startsWith('--')||args[1].startsWith('--')){
  throw Error('Verwendung: node scripts/prepare-peer-update.cjs "PFAD\\KIZUNA-Setup-x64.exe" "PFAD\\KIZUNA-Setup-x64.exe.sha256"');
 }
 const result=await preparePeerUpdate({installer:path.resolve(args[0]),checksum:path.resolve(args[1])});
 console.log('KIZUNA-Update '+result.manifest.version+' lokal vorbereitet. SHA-256: '+result.manifest.sha256);
 console.log('Signierte Beschreibung: '+result.file);
 console.log('Privater Schlüssel bleibt ausschließlich auf diesem PC. Kein Update wurde veröffentlicht oder installiert.');
}
if(require.main===module)main(process.argv.slice(2)).catch(err=>{console.error('Updatevorbereitung blockiert: '+err.message);process.exitCode=1;});
module.exports={preparePeerUpdate};
