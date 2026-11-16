const {_electron:electron}=require('@playwright/test');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const artifacts=path.join(root,'test-results');
fs.mkdirSync(artifacts,{recursive:true});
const testData=path.join(root,'.test-data','packaged-'+process.pid);
(async()=>{
 let app;
 try{
  const exe=process.env.VOXRALLY_EXE||path.join(root,'release','win-unpacked','VoxRally.exe');
  assert.ok(fs.existsSync(exe),'Packaged KIZUNA executable was not created: '+exe);
  app=await electron.launch({
   executablePath:exe,args:['--disable-gpu'],
   env:{...process.env,ELECTRON_RUN_AS_NODE:undefined,VOXRALLY_TEST_DATA:testData}
  });
  const page=await app.firstWindow();
  page.setDefaultTimeout(20000);
  await page.getByRole('heading',{name:'Zusammen spielt’s sich besser.'}).waitFor();
  await page.locator('.kickoff-wisdom').waitFor();
  const result=await page.evaluate(async()=>{
   const [loaded,sessions]=await Promise.all([window.vox.load(),window.vox.listSessions()]);
   return {fingerprint:loaded.fingerprint,settings:loaded.settings,sessions};
  });
  assert.match(result.fingerprint,/^[0-9a-f]{64}$/);
  assert.equal(typeof result.settings.profilePhoto,'string');
  assert.deepEqual(result.sessions,[]);
  const sessionId='ci-session-'+process.pid;
  const session={id:sessionId,title:'CI-Football-Manager',game:'Football Manager',
   startsAt:Date.now()+3600*1000,durationMin:120,reminderMin:15,repeat:'none',
   notes:'Windows packagierter Smoke-Test',participants:'CI'};
  const stored=await page.evaluate(async item=>{
   await window.vox.saveSession(item);
   const result=await window.vox.listSessions();
   await window.vox.deleteSession(item.id);
   return result;
  },session);
  assert.equal(stored.length,1);
  assert.equal(stored[0].title,session.title);
  const safe=await app.evaluate(({BrowserWindow})=>{
   const window=BrowserWindow.getAllWindows()[0];
   const prefs=window.webContents.getLastWebPreferences();
   return Boolean(prefs.sandbox&&prefs.contextIsolation&&!prefs.nodeIntegration&&prefs.webSecurity);
  });
  assert.equal(safe,true,'Renderer sandbox and origin isolation must remain enabled');
  await page.getByTitle('Spielkalender',{exact:true}).click();
  await page.getByRole('heading',{name:'Spielkalender & Erinnerungen'}).waitFor();
  await page.screenshot({path:path.join(artifacts,'windows-packaged-calendar.png')});
  console.log('PASS Windows packaged KIZUNA launch, startup quote, isolated preload, SQLite calendar and UI.');
 }finally{
  await app?.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
