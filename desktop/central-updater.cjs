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
function wire({updater,dialog,win,isBusy,log=console}) {
  let ready=false,prompting=false,postponed=false;
  updater.autoDownload=false;updater.autoInstallOnAppQuit=false;updater.allowPrerelease=false;updater.allowDowngrade=false;
  const show=options=>dialog.showMessageBox(win(),{title:'KIZUNA Update',...options});
  async function offerInstall() {
    if(!ready||prompting||postponed||isBusy())return;
    prompting=true;
    try {
      const {response}=await show({type:'info',message:'Das Update ist geprüft und bereit.',detail:'KIZUNA wird zur Installation neu gestartet.',buttons:['Jetzt installieren','Später'],defaultId:0,cancelId:1});
      if(response!==0){postponed=true;return;}
      if(!isBusy())updater.quitAndInstall(false,true);
    } finally {prompting=false;}
  }
  updater.on('update-available',async info=>{
    if(prompting)return;prompting=true;
    try {
      const {response}=await show({type:'info',message:`KIZUNA ${info.version} ist verfügbar.`,detail:'Der Download startet nach deiner Auswahl. Installiert wird erst, nachdem Raum und Streams beendet sind.',buttons:['Jetzt aktualisieren','Später'],defaultId:0,cancelId:1});
      if(response===0)await updater.downloadUpdate();
    }catch(e){log.warn('Update download failed',e.code||e.name);}finally{prompting=false;void offerInstall();}
  });
  updater.on('update-downloaded',()=>{ready=true;void offerInstall();});
  updater.on('error',e=>{log.warn('Central update failed',e.code||e.name);void show({type:'warning',message:'Update konnte nicht sicher geladen werden.',detail:'Deine vorhandene Version bleibt unverändert. Beim nächsten Start wird erneut geprüft.',buttons:['OK']}).catch(()=>{});});
  const timer=setInterval(()=>{void offerInstall();},5000);timer.unref?.();
  return {check:()=>updater.checkForUpdates().catch(e=>log.warn('Update check failed',e.code||e.name)),stop:()=>clearInterval(timer)};
}
function start({app,dialog,win,isBusy}) {
  if(!app.isPackaged||process.env.VOXRALLY_TEST_DATA)return;
  const config=require('./release-channel.json');
  if(!validConfig(config)){console.info('Central updater disabled: release repository and Windows signing certificate are not configured.');return;}
  if(!fs.existsSync(path.join(process.resourcesPath,'app-update.yml'))){console.warn('Central updater disabled: app-update.yml missing');return;}
  const {autoUpdater}=require('electron-updater');
  autoUpdater.verifyUpdateCodeSignature=(_names,file)=>verifyInstaller(file,config.certificateThumbprint);
  const controller=wire({updater:autoUpdater,dialog,win,isBusy});app.once('will-quit',controller.stop);void controller.check();
}
module.exports={start,wire,validConfig,verifyInstaller};
