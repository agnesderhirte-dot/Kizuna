const fs = require('node:fs');
const path = require('node:path');
const {execFile} = require('node:child_process');
function validConfig(c) {
  return c?.enabled === true && /^[a-zA-Z0-9-]+$/.test(c.owner) && /^[a-zA-Z0-9_.-]+$/.test(c.repo) &&
    typeof c.publisherName === 'string' && c.publisherName.trim().length > 0 && /^[A-Fa-f0-9]{40}$/.test(c.certificateThumbprint);
}
// electron-updater 6 has a legacy PowerShell fallback; require a valid pinned certificate even if PowerShell fails.
function verifyInstaller(file, thumbprint) {
  return new Promise(resolve => {
    const script = `$ErrorActionPreference='Stop'; $s=Get-AuthenticodeSignature -LiteralPath '${file.replace(/'/g,"''")}'; if ($s.Status -ne 'Valid' -or $s.SignerCertificate.Thumbprint -ne '${thumbprint}') {exit 1}`;
    const executable = path.join(process.env.SystemRoot || 'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
    execFile(executable, ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],
      {windowsHide:true,timeout:30000}, error => resolve(error ? 'Windows-Signatur fehlt, ist ungültig oder stammt nicht vom freigegebenen Herausgeber.' : null));
  });
}
function wire({updater,dialog,win,isBusy,log=console,onStatus=()=>{}}) {
  let ready=false,prompting=false,postponed=false,checking=null;
  let status={state:'idle',message:'Nach einer neuen KIZUNA-Version suchen.'};
  const publish=(state,message)=>{status={state,message};onStatus(status);return status;};
  updater.autoDownload=false;updater.autoInstallOnAppQuit=false;updater.allowPrerelease=false;updater.allowDowngrade=false;
  const show=options=>dialog.showMessageBox(win(),{title:'KIZUNA Update',...options});
  async function offerInstall() {
    if(!ready||prompting||postponed)return;
    if(isBusy()){publish('ready','Update bereit. Beende zuerst Raum und Streams.');return;}
    prompting=true;
    try {
      const {response}=await show({type:'info',message:'Das Update ist geprüft und bereit.',detail:'KIZUNA wird zur Installation neu gestartet.',buttons:['Jetzt installieren','Später'],defaultId:0,cancelId:1});
      if(response!==0){postponed=true;publish('ready','Update bereit. Mit „Update installieren“ später fortfahren.');return;}
      if(!isBusy())updater.quitAndInstall(false,true);
      else publish('ready','Update bereit. Beende zuerst Raum und Streams.');
    } finally {prompting=false;}
  }
  updater.on('update-available',async info=>{
    if(prompting)return;prompting=true;
    publish('available',`KIZUNA ${info.version} ist verfügbar.`);
    try {
      const {response}=await show({type:'info',message:`KIZUNA ${info.version} ist verfügbar.`,detail:'Der Download startet nach deiner Auswahl. Installiert wird erst, nachdem Raum und Streams beendet sind.',buttons:['Jetzt aktualisieren','Später'],defaultId:0,cancelId:1});
      if(response===0){publish('downloading','Update wird heruntergeladen …');await updater.downloadUpdate();}
    }catch(e){log.warn('Update download failed',e.code||e.name);publish('error','Download fehlgeschlagen. Bitte erneut versuchen.');}finally{prompting=false;void offerInstall();}
  });
  updater.on('update-not-available',()=>publish('current','Du verwendest die aktuelle KIZUNA-Version.'));
  updater.on('download-progress',info=>{const percent=Number.isFinite(info.percent)?Math.max(0,Math.min(100,Math.round(info.percent))):0;publish('downloading',`Update wird heruntergeladen … ${percent} %`);});
  updater.on('update-downloaded',()=>{ready=true;publish('ready','Update geprüft und bereit zur Installation.');void offerInstall();});
  updater.on('error',e=>{log.warn('Central update failed',e.code||e.name);publish('error','Update konnte nicht sicher geladen werden. Bitte später erneut versuchen.');});
  const timer=setInterval(()=>{void offerInstall();},5000);timer.unref?.();
  async function check(){
    if(ready){postponed=false;await offerInstall();return status;}
    if(checking)return checking;
    if(prompting||status.state==='downloading')return status;
    publish('checking','Suche nach Updates …');
    checking=Promise.resolve().then(()=>updater.checkForUpdates()).then(()=>status).catch(e=>{log.warn('Update check failed',e.code||e.name);return publish('error','Updatesuche fehlgeschlagen. Internetverbindung prüfen und erneut versuchen.');}).finally(()=>{checking=null;});
    return checking;
  }
  return {check,getStatus:()=>status,stop:()=>clearInterval(timer)};
}
function unavailable(message){const status={state:'disabled',message};return {check:async()=>status,getStatus:()=>status,stop:()=>{}};}
function start({app,dialog,win,isBusy,onStatus}) {
  if(!app.isPackaged||process.env.VOXRALLY_TEST_DATA)return unavailable('In dieser Testversion sind Online-Updates noch nicht verfügbar.');
  const config=require('./release-channel.json');
  if(!validConfig(config))return unavailable('Online-Updates sind für diese Version noch nicht freigeschaltet. Die erste Update-Version muss einmal installiert werden.');
  if(!fs.existsSync(path.join(process.resourcesPath,'app-update.yml')))return unavailable('Diese Installation enthält noch keinen vollständigen Updatezugang.');
  const {autoUpdater}=require('electron-updater');
  autoUpdater.verifyUpdateCodeSignature=(_names,file)=>verifyInstaller(file,config.certificateThumbprint);
  const controller=wire({updater:autoUpdater,dialog,win,isBusy,onStatus});app.once('will-quit',controller.stop);void controller.check();return controller;
}
module.exports={start,wire,validConfig,verifyInstaller};
