const {_electron:electron}=require('@playwright/test');const path=require('node:path');const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
(async()=>{let app;try{
 app=await electron.launch({args:[root],env:{...process.env,ELECTRON_RUN_AS_NODE:undefined,VOXRALLY_TEST_DATA:path.join(root,'.test-data','devices-'+Date.now())}});
 const page=await app.firstWindow();await page.getByRole('heading',{name:'Zusammen spielt’s sich besser.'}).waitFor();
 const report=await page.evaluate(async()=>{
  const results={devices:[],camera:null,microphone:null};
  results.devices=(await navigator.mediaDevices.enumerateDevices()).map(d=>({kind:d.kind,label:d.label}));
  for(const kind of ['camera','microphone']){let stream,ctx,video;try{
   stream=await navigator.mediaDevices.getUserMedia(kind==='camera'?{video:{width:{ideal:1920},height:{ideal:1080}},audio:false}:{audio:true,video:false});
   const track=stream.getTracks()[0];const settings=track.getSettings();delete settings.deviceId;delete settings.groupId;
   if(kind==='camera'){video=document.createElement('video');video.muted=true;video.srcObject=stream;await video.play();await new Promise(r=>setTimeout(r,1500));results.camera={opened:true,settings,width:video.videoWidth,height:video.videoHeight,decodedFrames:video.getVideoPlaybackQuality().totalVideoFrames};}
   else{ctx=new AudioContext();await ctx.resume();const analyser=ctx.createAnalyser();ctx.createMediaStreamSource(stream).connect(analyser);const samples=new Uint8Array(analyser.fftSize);let peak=0;for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,100));analyser.getByteTimeDomainData(samples);peak=Math.max(peak,...samples.map(n=>Math.abs(n-128)));}results.microphone={opened:true,settings,signalPeak:peak};}
  }catch(e){results[kind]={opened:false,error:String(e)};}finally{stream?.getTracks().forEach(t=>t.stop());if(video){video.pause();video.srcObject=null;}await ctx?.close();}}
  return results;
 });
 fs.writeFileSync(path.join(root,'test-results','real-devices.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await app?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
