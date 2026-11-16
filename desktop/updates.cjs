const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const MAX_SIZE=250*1024*1024;
function payload(m){return JSON.stringify({version:m.version,size:m.size,sha256:m.sha256});}
function verifyWithPublicKey(m,publicKey){
 if(!m||typeof m.version!=='string'||!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(m.version)||!Number.isSafeInteger(m.size)||m.size<2||m.size>MAX_SIZE||typeof m.sha256!=='string'||!/^[a-f0-9]{64}$/.test(m.sha256)||typeof m.signature!=='string'||m.signature.length>128)throw Error('Ungültiges Update');
 if(!crypto.verify(null,Buffer.from(payload(m)),publicKey,Buffer.from(m.signature,'base64')))throw Error('Dieses Update stammt nicht vom KIZUNA-Entwicklerschlüssel');
 return {version:m.version,size:m.size,sha256:m.sha256,signature:m.signature};
}
function verify(m){return verifyWithPublicKey(m,fs.readFileSync(path.join(__dirname,'update-public.pem')));}
async function hashFile(file){const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))hash.update(chunk);return hash.digest('hex');}
function registerUpdates({handle,app,dialog,win,shell,Notification,isBusy=()=>true,verifyManifest=verify}){
 let outgoing,incoming,ready;const folder=path.join(app.getPath('userData'),'updates');fs.mkdirSync(folder,{recursive:true});
 const abort=()=>{if(incoming){fs.closeSync(incoming.fd);fs.rmSync(incoming.file,{force:true});incoming=null;}};
 app.on('will-quit',abort);
 handle('verifyUpdateOffer',manifest=>verifyManifest(manifest));
 handle('selectUpdate',async()=>{const picked=await dialog.showOpenDialog(win(),{title:'KIZUNA-Update für Freunde auswählen',properties:['openFile'],filters:[{name:'KIZUNA Installer',extensions:['exe']}]});if(picked.canceled)return null;const file=picked.filePaths[0],manifestPath=file+'.update.json';if(fs.statSync(manifestPath).size>2048)throw Error('Ungültige Updatebeschreibung');const manifest=verifyManifest(JSON.parse(fs.readFileSync(manifestPath,'utf8')));if(fs.statSync(file).size!==manifest.size||await hashFile(file)!==manifest.sha256)throw Error('Update-Datei stimmt nicht mit der Signatur überein');outgoing={file,manifest};return manifest;});
 handle('readUpdate',arg=>{if(!outgoing||arg?.hash!==outgoing.manifest.sha256||!Number.isSafeInteger(arg.offset)||arg.offset<0||arg.offset>=outgoing.manifest.size)throw Error('Update nicht verfügbar');const bytes=Buffer.alloc(Math.min(32768,outgoing.manifest.size-arg.offset));const fd=fs.openSync(outgoing.file,'r');try{fs.readSync(fd,bytes,0,bytes.length,arg.offset);}finally{fs.closeSync(fd);}return new Uint8Array(bytes);});
 handle('beginUpdate',arg=>{const manifest=verifyManifest(arg);abort();const file=path.join(folder,crypto.randomUUID()+'.part');incoming={manifest,file,fd:fs.openSync(file,'wx'),offset:0,hash:crypto.createHash('sha256')};return true;});
 handle('writeUpdate',arg=>{if(!incoming||arg?.hash!==incoming.manifest.sha256||arg.offset!==incoming.offset||!(arg.bytes instanceof Uint8Array)||arg.bytes.length<1||arg.bytes.length>32768||incoming.offset+arg.bytes.length>incoming.manifest.size)throw Error('Ungültiger Updateblock');fs.writeSync(incoming.fd,arg.bytes);incoming.hash.update(arg.bytes);incoming.offset+=arg.bytes.length;return incoming.offset;});
 handle('finishUpdate',hash=>{if(!incoming||hash!==incoming.manifest.sha256||incoming.offset!==incoming.manifest.size)throw Error('Update unvollständig');const matches=incoming.hash.digest('hex')===hash;if(!matches){abort();throw Error('Update-Prüfsumme stimmt nicht');}fs.closeSync(incoming.fd);const file=path.join(folder,'KIZUNA-Setup-'+incoming.manifest.version+'-'+hash.slice(0,12)+'.exe');fs.renameSync(incoming.file,file);ready={file,manifest:incoming.manifest};incoming=null;return hash;});
 handle('abortUpdate',()=>{abort();return true;});
 handle('installUpdate',async hash=>{if(isBusy())throw Error('Beende zuerst Raum und Streams, bevor du das Update installierst.');if(!ready||hash!==ready.manifest.sha256||await hashFile(ready.file)!==hash)throw Error('Kein geprüftes Update vorhanden');verifyManifest(ready.manifest);if(isBusy())throw Error('Raum oder Stream ist noch aktiv.');const error=await shell.openPath(ready.file);if(error)throw Error(error);setTimeout(()=>app.quit(),500);return true;});
 handle('notifyUpdate',arg=>{if(typeof arg?.version!=='string'||!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(arg.version))throw Error('Updateversion');if(Notification.isSupported()){const notification=new Notification({title:'KIZUNA-Update verfügbar',body:`Version ${arg.version}: Öffne KIZUNA, um das Update anzufordern oder zu installieren.`});notification.on('click',()=>{win()?.show();win()?.focus();});notification.show();}return true;});
}
module.exports={payload,verify,verifyWithPublicKey,hashFile,registerUpdates};
