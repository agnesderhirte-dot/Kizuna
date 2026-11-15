const {_electron:electron}=require('@playwright/test');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');
const root=path.resolve(__dirname,'..');const artifacts=path.join(root,'test-results');fs.mkdirSync(artifacts,{recursive:true});
const apps=[];const errors=[];const runId=Date.now().toString();
async function launch(label){const app=await electron.launch({executablePath:process.env.VOXRALLY_EXE,args:[...(process.env.VOXRALLY_EXE?[]:[root]),'--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'],env:{...process.env,ELECTRON_RUN_AS_NODE:undefined,VOXRALLY_TEST_DATA:path.join(root,'.test-data',runId,label)}});apps.push(app);app.process().stderr?.on('data',data=>{const text=data.toString();if(text.includes('Signaling rejected'))console.log(text);});const page=await app.firstWindow();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')console.log(label,m.text());});await page.getByRole('heading',{name:'Zusammen spielt’s sich besser.'}).waitFor();if(process.env.VOXRALLY_TRACE)await page.evaluate(()=>{window.__rtcTrace=[];for(const method of ['setLocalDescription','setRemoteDescription','restartIce']){const original=RTCPeerConnection.prototype[method];RTCPeerConnection.prototype[method]=function(...args){if(!this.__traceId)this.__traceId=Math.random().toString(36).slice(2,7);if(window.__rtcTrace.length<200)window.__rtcTrace.push({pc:this.__traceId,method,state:this.signalingState,type:args[0]?.type,connection:this.connectionState,transceivers:this.getTransceivers().map(t=>[t.mid,t.direction,t.currentDirection])});return original.apply(this,args).then(result=>{if(window.__rtcTrace.length<200)window.__rtcTrace.push({pc:this.__traceId,done:method,local:this.localDescription?.sdp.split(/\r?\n/).filter(x=>/^(m=|a=mid:|a=send|a=recv|a=inactive)/.test(x)),remote:this.remoteDescription?.sdp.split(/\r?\n/).filter(x=>/^(m=|a=mid:|a=send|a=recv|a=inactive)/.test(x))});return result;});};}});await page.evaluate(()=>{window.__pcs=[];const Native=window.RTCPeerConnection;window.RTCPeerConnection=class extends Native{constructor(...args){super(...args);window.__pcs.push(this);}};});return{app,page};}
(async()=>{try{
 const a=await launch('a'),b=await launch('b');assert.equal(await a.app.evaluate(({app})=>app.getName()),'KIZUNA');assert.equal(await a.app.evaluate(({app})=>app.getVersion()),'0.3.2');
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
 for(const {page}of [a,b]){
  await page.evaluate(()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=c=>c.video?navigator.mediaDevices.getDisplayMedia():original(c);});
  await page.getByRole('button',{name:'Kamera',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.streams video').length>=3);
 }
 for(const {page}of [a,b]){
  await page.waitForFunction(()=>document.querySelectorAll('.streams video').length===4&&[...document.querySelectorAll('.streams video')].every(v=>v.videoWidth>=640&&v.readyState>=2));
  await page.waitForFunction(async()=>{let audio=false,video=0;for(const pc of window.__pcs){const stats=await pc.getStats();stats.forEach(s=>{if(s.type==='inbound-rtp'&&s.kind==='audio'&&s.bytesReceived>0)audio=true;if(s.type==='inbound-rtp'&&s.kind==='video'&&s.framesDecoded>5)video++;});}return audio&&video>=2;});
 }
 console.log('PASS: two independent clients; simultaneous bidirectional screens, cameras and incoming audio RTP');
 await a.page.getByRole('button',{name:'Kamera',exact:true}).click();
 await b.page.waitForFunction(()=>document.querySelectorAll('.streams video').length===3);
 await a.page.getByRole('button',{name:'Mikrofon aus',exact:true}).click();
 await b.page.waitForFunction(()=>document.querySelector('figure[data-local="false"][data-kind="screen"] video')?.readyState>=2);
 await a.page.getByRole('button',{name:'Mikrofon an',exact:true}).click();
 console.log('PASS: camera and microphone toggle independently; screen retained');
 if(process.env.VOXRALLY_CLOUD_TEST){
   await b.page.evaluate(()=>window.__pcs[0].close());
   await b.page.waitForFunction(()=>window.__pcs.length>=4,{},{timeout:45000});
   await b.page.waitForFunction(()=>document.querySelector('figure[data-local="false"][data-kind="screen"] video')?.readyState>=2,{},{timeout:45000});
   await a.page.getByLabel('Nachricht',{exact:true}).fill('after automatic reconnect');
   await a.page.getByRole('button',{name:'Senden',exact:true}).click();
   await b.page.getByText('after automatic reconnect',{exact:true}).waitFor({timeout:20000});
   console.log('PASS: bootstrap transport interrupted; automatic reconnect restores stream and chat');
 }
 assert.deepEqual(errors,[]);console.log('CORE PASS');
 }catch(error){console.error(error);process.exitCode=1;}finally{for(const app of apps)await app.close().catch(()=>{});}})();
