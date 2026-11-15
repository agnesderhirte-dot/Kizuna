const test=require('node:test');const assert=require('node:assert/strict');const {EventEmitter}=require('node:events');
const {wire,validConfig,verifyInstaller}=require('../desktop/central-updater.cjs');
test('central release disabled without repository and signing identity',()=>{assert.equal(validConfig({enabled:false}),false);assert.equal(validConfig({enabled:true,owner:'a',repo:'b',publisherName:'x'}),false);});
test('central update downloads after consent, never installs during a room/stream',async()=>{
 const updater=new EventEmitter();let busy=true,downloads=0,installs=0;const prompts=[];
 updater.downloadUpdate=async()=>{downloads++;updater.emit('update-downloaded');};updater.quitAndInstall=()=>installs++;updater.checkForUpdates=async()=>{};
 const controller=wire({updater,isBusy:()=>busy,win:()=>null,dialog:{showMessageBox:async(_w,o)=>{prompts.push(o);return {response:0};}}});
 try {updater.emit('update-available',{version:'0.3.3'});await new Promise(r=>setImmediate(r));assert.equal(downloads,1);assert.equal(installs,0);assert.equal(updater.autoInstallOnAppQuit,false);assert.deepEqual(prompts[0].buttons,['Jetzt aktualisieren','Später']);busy=false;updater.emit('update-downloaded');await new Promise(r=>setImmediate(r));assert.equal(installs,1);}finally{controller.stop();}
});
test('Later never downloads; active stream appearing while install dialog is open blocks install',async()=>{
 const updater=new EventEmitter();let downloads=0,installs=0,busy=false;
 updater.downloadUpdate=async()=>downloads++;updater.quitAndInstall=()=>installs++;
 let response=1;const controller=wire({updater,isBusy:()=>busy,win:()=>null,dialog:{showMessageBox:async()=>{if(response===0)busy=true;return {response};}}});
 try{updater.emit('update-available',{version:'0.3.3'});await new Promise(r=>setImmediate(r));assert.equal(downloads,0);response=0;updater.emit('update-downloaded');await new Promise(r=>setImmediate(r));assert.equal(installs,0);}finally{controller.stop();}
});
test('missing installer fails closed in Windows signature verification',async()=>{assert.ok(await verifyInstaller('C:\\does-not-exist-kizuna.exe','0'.repeat(40)));});
