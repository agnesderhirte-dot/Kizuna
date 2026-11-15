const {_electron:electron}=require('@playwright/test');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');
const root=path.resolve(__dirname,'..');const artifacts=path.join(root,'test-results');fs.mkdirSync(artifacts,{recursive:true});
const apps=[];const errors=[];const runId=Date.now().toString();
async function launch(label){const app=await electron.launch({executablePath:process.env.VOXRALLY_EXE,args:[...(process.env.VOXRALLY_EXE?[]:[root]),'--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'],env:{...process.env,ELECTRON_RUN_AS_NODE:undefined,VOXRALLY_TEST_DATA:path.join(root,'.test-data',runId,label)}});apps.push(app);app.process().stderr?.on('data',data=>{const text=data.toString();if(text.includes('Signaling rejected'))console.log(text);});const page=await app.firstWindow();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.log(label,m.text());});await page.getByRole('heading',{name:'Zusammen spielt’s sich besser.'}).waitFor();if(process.env.VOXRALLY_TRACE)await page.evaluate(()=>{window.__rtcTrace=[];for(const method of ['setLocalDescription','setRemoteDescription','restartIce']){const original=RTCPeerConnection.prototype[method];RTCPeerConnection.prototype[method]=function(...args){if(!this.__traceId)this.__traceId=Math.random().toString(36).slice(2,7);if(window.__rtcTrace.length<200)window.__rtcTrace.push({pc:this.__traceId,method,state:this.signalingState,type:args[0]?.type,connection:this.connectionState,transceivers:this.getTransceivers().map(t=>[t.mid,t.direction,t.currentDirection])});return original.apply(this,args).then(result=>{if(window.__rtcTrace.length<200)window.__rtcTrace.push({pc:this.__traceId,done:method,local:this.localDescription?.sdp.split(/\r?\n/).filter(x=>/^(m=|a=mid:|a=send|a=recv|a=inactive)/.test(x)),remote:this.remoteDescription?.sdp.split(/\r?\n/).filter(x=>/^(m=|a=mid:|a=send|a=recv|a=inactive)/.test(x))});return result;});};}});return{app,page};}
(async()=>{try{
 const a=await launch('a'),b=await launch('b');
 await a.page.getByTitle('Einstellungen',{exact:true}).click();await a.page.getByLabel('Anzeigename',{exact:true}).fill('Alpha');await a.page.getByRole('button',{name:'Einstellungen speichern'}).click();
 assert.equal(await a.page.evaluate(async()=>{try{await window.vox.save({name:'invalid'});return false;}catch{return true;}}),true);
 assert.equal(await a.page.evaluate(async()=>{try{await window.vox.asset('../../Windows');return false;}catch{return true;}}),true);
 await a.page.getByTitle('Raum',{exact:true}).click();if(!process.env.VOXRALLY_CLOUD_TEST){await a.page.getByLabel('Online-Raum (kostenloses Signaling)').uncheck();await a.page.getByLabel('Im LAN/VPN erreichbar').uncheck();}await a.page.getByRole('button',{name:'Raum erstellen →'}).click();await a.page.getByRole('button',{name:'Einladung kopieren'}).click();
 const invite=await a.app.evaluate(({clipboard})=>clipboard.readText());assert.match(invite,/^voxrally:\/\/join\//);
 await b.page.getByLabel('Einladung',{exact:true}).fill(invite);await b.page.getByRole('button',{name:'Raum beitreten',exact:true}).click();
 await a.page.waitForFunction(()=>document.querySelector('.member small')&&[...document.querySelectorAll('.member small')].some(e=>e.textContent==='connected'),{},{timeout:20000});
 await a.page.getByLabel('Nachricht',{exact:true}).fill('<img src=x onerror=alert(1)> Hallo Beta 🎮');await a.page.getByRole('button',{name:'Senden',exact:true}).click();await b.page.getByText('<img src=x onerror=alert(1)> Hallo Beta 🎮',{exact:true}).waitFor();assert.equal(await b.page.locator('.messages img').count(),0);
 await a.page.getByRole('button',{name:'Mikrofon an',exact:true}).click();await b.page.getByRole('button',{name:'Mikrofon an',exact:true}).click();
 await a.page.waitForFunction(()=>document.querySelector('.hidden-audio audio')?.srcObject?.getAudioTracks().length>0,{},{timeout:15000});
 for(const {page}of [a,b]){await page.evaluate(()=>{navigator.mediaDevices.getDisplayMedia=async()=>{const c=document.createElement('canvas');c.width=1920;c.height=1080;const ctx=c.getContext('2d');let n=0;const timer=setInterval(()=>{ctx.fillStyle=n++%2?'#214e43':'#253e58';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='white';ctx.font='60px sans-serif';ctx.fillText('VoxRally synthetic screen '+n,100,200);},100);const s=c.captureStream(30);s.getTracks()[0].addEventListener('ended',()=>clearInterval(timer));return s;};});await page.getByRole('button',{name:'Bildschirm teilen',exact:true}).click();await page.locator('.source-grid button').first().click();}
 await a.page.waitForFunction(()=>document.querySelectorAll('.streams video').length===2,{},{timeout:20000});await b.page.waitForFunction(()=>document.querySelectorAll('.streams video').length===2,{},{timeout:20000});
 await a.page.waitForFunction(()=>[...document.querySelectorAll('.streams video')].every(v=>v.videoWidth===1920),{},{timeout:20000});
 await a.page.screenshot({path:path.join(artifacts,'two-peers.png'),fullPage:true});
 if(process.env.VOXRALLY_LAYOUT_ONLY){
  for(const client of [a,b]){await client.page.evaluate(()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=constraints=>constraints.video?navigator.mediaDevices.getDisplayMedia():original(constraints);});await client.page.getByRole('button',{name:'Kamera',exact:true}).click();}
  await a.page.waitForFunction(()=>document.querySelectorAll('.streams video').length===4&&[...document.querySelectorAll('.streams video')].every(v=>v.readyState>=2&&v.videoWidth>=640));
  await a.page.waitForFunction(()=>document.querySelectorAll('.streams video').length===4);
  const columns=await a.page.locator('.streams').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(columns,2);
  await a.page.screenshot({path:path.join(artifacts,'layout-grid.png'),fullPage:true});
  await a.page.locator('figure[data-local="false"][data-kind="screen"]').dblclick();
  await a.page.waitForFunction(()=>document.fullscreenElement?.classList.contains('video-stage'));
  assert.equal(await a.page.locator('.streams video').count(),3);assert.equal(await a.page.locator('.camera-overlay').count(),2);
  const handle=a.page.locator('.camera-handle').first();const before=await handle.boundingBox();
  await handle.hover();await a.page.mouse.down();await a.page.mouse.move(before.x+before.width/2+70,before.y+before.height/2-100,{steps:6});await a.page.mouse.up();
  const after=await handle.boundingBox();assert.ok(Math.abs(after.y-before.y)>40,'Camera moved');
  assert.equal(await b.page.locator('.streams video').count(),4,'Local screen still sent');
  await a.page.waitForFunction(()=>[...document.querySelectorAll('.streams video')].every(v=>v.readyState>=2&&v.videoWidth>0&&v.getVideoPlaybackQuality().totalVideoFrames>2));
  await a.page.screenshot({path:path.join(artifacts,'layout-fullscreen.png')});
  await a.page.getByRole('button',{name:'Viereransicht',exact:true}).click();
  await a.page.waitForFunction(()=>!document.fullscreenElement&&document.querySelectorAll('.streams video').length===4);

  await a.page.locator('figure[data-local="true"][data-kind="screen"]').dblclick();
  await a.page.waitForFunction(()=>document.fullscreenElement&&document.querySelector('.focus-screen[data-local="true"]'));
  assert.equal(await a.page.locator('.camera-overlay').count(),2);
  await a.page.locator('.stream-quality summary').click();await a.page.getByLabel('Bildschirm Mbit/s',{exact:true}).fill('12');await a.page.getByLabel('Webcam Mbit/s',{exact:true}).fill('3');
  await a.page.getByRole('button',{name:'Qualität jetzt anwenden'}).click();await a.page.waitForFunction(async()=>(await window.vox.load()).settings.bitrate===12);
  await a.page.locator('.stream-quality summary').click();await a.page.getByRole('button',{name:'Viereransicht',exact:true}).click();
  await a.page.waitForFunction(()=>!document.fullscreenElement);
  await a.page.getByRole('button',{name:'Direktlink anzeigen',exact:true}).click();assert.equal(await a.page.getByLabel('Dein Einladungslink',{exact:true}).inputValue(),invite);
  await a.app.evaluate(({shell})=>{global.__mail='';shell.openExternal=async url=>{global.__mail=url;};});await a.page.getByRole('button',{name:'Per E-Mail einladen',exact:true}).click();
  const mail=await a.app.evaluate(()=>global.__mail);assert.ok(mail.startsWith('mailto:'));assert.ok(decodeURIComponent(mail).includes(invite));
  await a.page.getByRole('button',{name:'Smileys',exact:true}).click();await a.page.getByRole('button',{name:'⚽',exact:true}).click();await a.page.getByRole('button',{name:'Senden',exact:true}).click();await b.page.locator('.messages').getByText('⚽',{exact:true}).waitFor();
  await a.page.getByTitle('Einstellungen',{exact:true}).click();
  for(const skin of ['classic18','matchday24','portal27','purple22']){
   await a.page.getByLabel('Manager-Skin',{exact:true}).selectOption(skin);
   assert.equal(await a.page.locator(`.skin-${skin}`).count(),1);
   await a.page.screenshot({path:path.join(artifacts,`skin-${skin}.png`),fullPage:true});
  }
  await a.page.getByLabel('Webcam-Hintergrund',{exact:true}).selectOption('blur');await a.page.getByRole('button',{name:'Einstellungen speichern',exact:true}).click();
  await a.page.getByRole('status').filter({hasText:'Einstellungen gespeichert.'}).waitFor({timeout:45000});
  assert.equal(await a.page.locator('.skin-purple22').count(),1);

  const backgroundFile=path.join(artifacts,'camera-background.png');const imageData=await a.page.evaluate(()=>{const c=document.createElement('canvas');c.width=320;c.height=180;const x=c.getContext('2d');x.fillStyle='#ee2244';x.fillRect(0,0,320,180);return c.toDataURL().split(',')[1];});fs.writeFileSync(backgroundFile,Buffer.from(imageData,'base64'));
  await a.app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},backgroundFile);
  await a.page.getByRole('button',{name:'Eigenes Hintergrundbild importieren',exact:true}).click();
  await a.page.waitForFunction(async()=>(await window.vox.load()).assets.some(x=>x.name==='camera-background.png'));
  const cameraImage=await a.page.evaluate(async()=>(await window.vox.load()).assets.find(x=>x.name==='camera-background.png').id);
  await a.page.getByLabel('Webcam-Hintergrund',{exact:true}).selectOption(cameraImage);await a.page.getByRole('button',{name:'Einstellungen speichern',exact:true}).click();
  await a.page.waitForFunction(async()=>(await window.vox.load()).settings.cameraBackground.length===64);
  await a.page.getByTitle('Raum',{exact:true}).click();await a.page.waitForFunction(()=>[...document.querySelectorAll('.streams video')].every(v=>v.readyState>=2&&v.videoWidth>0),{},{timeout:30000});
  await b.page.waitForFunction(()=>{const v=document.querySelector('figure[data-local="false"][data-kind="camera"] video');if(!v||v.readyState<2)return false;const c=document.createElement('canvas');c.width=8;c.height=8;const ctx=c.getContext('2d');ctx.drawImage(v,0,0,8,8);const pixel=ctx.getImageData(0,0,1,1).data;return pixel[0]>160&&pixel[1]<100;},{},{timeout:30000});

  await a.page.screenshot({path:path.join(artifacts,'features-03.png'),fullPage:true});

  const crypto=require('node:crypto'),{payload}=require('../desktop/updates.cjs');const updateFile=path.join(artifacts,'VoxRally-test-update.exe');const updateBytes=Buffer.alloc(100000,42);updateBytes.write('MZ');const manifest={version:'0.3.2',size:updateBytes.length,sha256:crypto.createHash('sha256').update(updateBytes).digest('hex')};manifest.signature=crypto.sign(null,Buffer.from(payload(manifest)),fs.readFileSync(path.join(root,'build/private/update-key.pem'))).toString('base64');fs.writeFileSync(updateFile,updateBytes);fs.writeFileSync(updateFile+'.update.json',JSON.stringify(manifest));
  await a.app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},updateFile);
  await b.app.evaluate(({Notification})=>{Notification.prototype.show=function(){};});
  await a.page.getByRole('button',{name:'Update für Freunde freigeben',exact:true}).click();await b.page.getByRole('button',{name:'Update 0.3.2 von Alpha herunterladen',exact:true}).click();await b.page.getByRole('button',{name:'Geprüftes Update installieren',exact:true}).waitFor();
  const received=path.join(root,'.test-data',runId,'b','updates','VoxRally-Setup-0.3.2-'+manifest.sha256.slice(0,12)+'.exe');assert.deepEqual(fs.readFileSync(received),updateBytes);
  assert.deepEqual(errors,[]);console.log('PASS: own/remote fullscreen, 2x2, draggable cams, live quality, invite + mail draft, emoji delivery, skin, local background segmentation, signed P2P update transfer (no execution).');return;
 }

 await a.page.getByRole('button',{name:'Mute',exact:true}).click();await a.page.getByRole('button',{name:'Stumm',exact:true}).waitFor();await a.page.getByRole('button',{name:'Deafen',exact:true}).click();
 await a.page.getByRole('button',{name:'Deafen',exact:true}).click();
 const wav=Buffer.alloc(44+16000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);for(let i=0;i<8000;i++)wav.writeInt16LE(Math.round(Math.sin(2*Math.PI*440*i/8000)*300),44+i*2);const soundPath=path.join(artifacts,'test-silence.wav');fs.writeFileSync(soundPath,wav);
 await a.app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},soundPath);
 await b.page.evaluate(()=>{window.__soundPlayed=0;const old=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this instanceof HTMLAudioElement){window.__soundPlayed++;window.__soundElement=this;}return old.call(this);};});
 await a.page.getByTitle('Soundboard',{exact:true}).click();await a.page.getByRole('button',{name:'+ Sound importieren'}).click();await a.page.getByRole('button',{name:/test-silence.wav/}).click();await b.page.waitForFunction(()=>window.__soundPlayed>0&&window.__soundElement.readyState>=2&&window.__soundElement.currentTime>.05,{},{timeout:20000});
 const data=await a.page.evaluate(()=>window.vox.load());assert.equal(data.settings.name,'Alpha');assert.ok(data.assets.some(x=>x.name==='test-silence.wav'));
 await b.page.getByRole('button',{name:'Raum verlassen',exact:true}).click();await b.page.getByLabel('Einladung',{exact:true}).fill(invite);await b.page.getByRole('button',{name:'Raum beitreten',exact:true}).click();await b.page.getByText('<img src=x onerror=alert(1)> Hallo Beta 🎮',{exact:true}).waitFor();
 const c=await launch('c'),d=await launch('d');for(const client of [c,d]){await client.page.getByLabel('Einladung',{exact:true}).fill(invite);await client.page.getByRole('button',{name:'Raum beitreten',exact:true}).click();}
 await a.page.waitForFunction(()=>[...document.querySelectorAll('.member small')].filter(e=>e.textContent==='connected').length===3,{},{timeout:20000});
 await a.page.getByTitle('Raum',{exact:true}).click();
 for(let round=0;round<Number(process.env.VOXRALLY_REJOIN_ROUNDS||0);round++){
  await d.page.getByRole('button',{name:'Raum verlassen',exact:true}).click();
  await d.page.getByLabel('Einladung',{exact:true}).fill(invite);await d.page.getByRole('button',{name:'Raum beitreten',exact:true}).click();
  for(const client of [a,b,c,d])await client.page.waitForFunction(()=>[...document.querySelectorAll('.member small')].filter(e=>e.textContent==='connected').length===3,{},{timeout:20000});
  await d.page.getByLabel('Nachricht',{exact:true}).fill(`Wiederbeitritt ${round}`);await d.page.getByRole('button',{name:'Senden',exact:true}).click();
  for(const client of [a,b,c])await client.page.getByText(`Wiederbeitritt ${round}`,{exact:true}).waitFor();
 }
 await a.page.getByTitle('Raum',{exact:true}).click();await a.page.getByLabel('Nachricht',{exact:true}).fill('Vier Teilnehmer verbunden');await a.page.getByRole('button',{name:'Senden',exact:true}).click();for(const client of [b,c,d])await client.page.getByText('Vier Teilnehmer verbunden',{exact:true}).waitFor();
 const png=path.join(artifacts,'background.png');fs.writeFileSync(png,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1cAAAAASUVORK5CYII=','base64'));
 await c.app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},png);await c.page.getByTitle('Einstellungen',{exact:true}).click();await c.page.getByRole('button',{name:'Hintergrund importieren',exact:true}).click();await c.page.waitForFunction(async()=>(await window.vox.load()).settings.background.length===64);
 const before=await c.page.evaluate(()=>window.vox.load());await c.app.close();const restarted=await launch('c');const after=await restarted.page.evaluate(()=>window.vox.load());assert.equal(after.settings.background,before.settings.background);assert.equal(after.fingerprint,before.fingerprint);
 assert.deepEqual(errors,[]);console.log('PASS: startup, settings, invalid IPC inputs, room auth, four-peer mesh, DataChannel chat/XSS, bidirectional fake microphones, dual synthetic 1080p streams, mute/deafen, remote sound playback, chat retention after rejoin, background and identity persistence after restart, screenshot.');
 const hours=Number(process.env.VOXRALLY_SOAK_HOURS||0);if(hours>0&&hours<=4){
  // B left and rejoined earlier: re-enable its synthetic microphone and screen for a dual-stream soak.
  await b.page.getByRole('button',{name:'Mikrofon an',exact:true}).click();await b.page.getByRole('button',{name:'Bildschirm teilen',exact:true}).click();await b.page.locator('.source-grid button').first().click();
  for(const client of [a,b,d,restarted])await client.app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.hide();});
  const started=Date.now(), samples=[];let lastFrames=-1;
  const save=(state,extra={})=>fs.writeFileSync(path.join(artifacts,'soak-status.json'),JSON.stringify({state,startedAt:new Date(started).toISOString(),updatedAt:new Date().toISOString(),targetHours:hours,elapsedMs:Date.now()-started,scope:'Three local Electron participants; two synthetic screens and fake microphones. Not physical two-PC or hardware capture verification.',samples,...extra},null,2));save('running');
  try{while(Date.now()-started<hours*3600000){await new Promise(r=>setTimeout(r,60000));const connected=await a.page.locator('.member small').allTextContents();assert.ok(connected.filter(t=>t==='connected').length>=2,'Peer disconnected during soak');const frames=await a.page.evaluate(()=>[...document.querySelectorAll('.streams video')].reduce((n,v)=>n+v.getVideoPlaybackQuality().totalVideoFrames,0));assert.ok(frames>lastFrames,'Video frames stopped');lastFrames=frames;const memory=await a.app.evaluate(({app})=>app.getAppMetrics().reduce((sum,p)=>sum+p.memory.workingSetSize,0));samples.push({elapsedMs:Date.now()-started,decodedFrames:frames,appWorkingSetKiB:memory});save('running',{oneHourPassed:Date.now()-started>=3600000});}save('passed',{oneHourPassed:hours>=1});console.log('PASS local synthetic soak',hours,'hours');}catch(e){save('failed',{error:String(e)});throw e;}
 }
 console.log('NOT VERIFIED: real microphone quality, physical screen/system audio, separate PCs, long sessions, clean installation.');
 }catch(e){for(let i=0;i<apps.length;i++){try{const p=await apps[i].firstWindow();if(process.env.VOXRALLY_TRACE)console.log('RTC TRACE',JSON.stringify(await p.evaluate(()=>window.__rtcTrace)));console.log('VIDEO',await p.locator('.streams video').evaluateAll(vs=>vs.map(v=>({ready:v.readyState,paused:v.paused,width:v.videoWidth,frames:v.getVideoPlaybackQuality().totalVideoFrames,tracks:v.srcObject?.getTracks().map(t=>({state:t.readyState,muted:t.muted,enabled:t.enabled}))}))));console.log('FAILURE UI',i,await p.locator('.members').innerText(),await p.locator('.alert').allTextContents());await p.screenshot({path:path.join(artifacts,`failure-${i}.png`)});}catch{}}throw e;}finally{for(const app of apps.reverse())await app.close().catch(()=>{});}})().catch(e=>{console.error(e);process.exitCode=1;});






