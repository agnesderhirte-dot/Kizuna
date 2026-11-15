import type {Settings} from './types';
export type CameraSession={stream:MediaStream;stop:()=>void};
export async function startCamera(settings:Settings,onError:(message:string)=>void):Promise<CameraSession>{
 const raw=await navigator.mediaDevices.getUserMedia({video:{deviceId:settings.cameraDevice?{exact:settings.cameraDevice}:undefined,width:{ideal:Number(settings.cameraResolution)*16/9},height:{ideal:Number(settings.cameraResolution)},frameRate:{ideal:30,max:30}},audio:false});
 if(!settings.cameraBackground)return {stream:raw,stop:()=>raw.getTracks().forEach(t=>t.stop())};
 let segmenter:import('@mediapipe/tasks-vision').ImageSegmenter|undefined;
 let timer:ReturnType<typeof setTimeout>|undefined;let stopped=false;let url='';
 const video=document.createElement('video');video.muted=true;video.playsInline=true;video.srcObject=raw;
 const canvas=document.createElement('canvas'),mask=document.createElement('canvas');
 let output:MediaStream|undefined;
 const stop=()=>{if(stopped)return;stopped=true;clearTimeout(timer);segmenter?.close();video.pause();video.srcObject=null;raw.getTracks().forEach(t=>t.stop());output?.getTracks().forEach(t=>t.stop());if(url)URL.revokeObjectURL(url);};
 try{
  await video.play();
  const {ImageSegmenter,FilesetResolver}=await import('@mediapipe/tasks-vision');
  const base=new URL('./vision/',document.baseURI).href;
  segmenter=await ImageSegmenter.createFromOptions(await FilesetResolver.forVisionTasks(base),{baseOptions:{modelAssetPath:base+'selfie.tflite',delegate:'CPU'},runningMode:'VIDEO',outputConfidenceMasks:true,outputCategoryMask:false});
  let backdrop:HTMLImageElement|undefined;
  if(settings.cameraBackground!=='blur'){const asset=await window.vox.asset(settings.cameraBackground);url=URL.createObjectURL(new Blob([new Uint8Array(asset.bytes)],{type:asset.mime}));backdrop=new Image();backdrop.src=url;await backdrop.decode();}
  const maxHeight=Number(settings.cameraResolution),ratio=video.videoWidth/video.videoHeight||16/9;
  canvas.height=Math.min(maxHeight,video.videoHeight||maxHeight);canvas.width=Math.round(canvas.height*ratio);
  const ctx=canvas.getContext('2d')!,maskCtx=mask.getContext('2d')!;
  output=canvas.captureStream(30);let lastTime=-1;let pixels:ImageData|undefined;
  const render=()=>{if(stopped)return;const started=performance.now();try{
   if(video.readyState>=2&&video.currentTime!==lastTime){lastTime=video.currentTime;segmenter!.segmentForVideo(video,started,result=>{
    const confidence=result.confidenceMasks?.[0];if(!confidence)throw Error('Keine Personenmaske');
    if(mask.width!==confidence.width||mask.height!==confidence.height){mask.width=confidence.width;mask.height=confidence.height;}
    const values=confidence.getAsFloat32Array();if(!pixels||pixels.width!==mask.width||pixels.height!==mask.height)pixels=maskCtx.createImageData(mask.width,mask.height);
    for(let i=0;i<values.length;i++)pixels.data[i*4+3]=Math.round(Math.max(0,Math.min(1,(values[i]-.25)/.5))*255);
    maskCtx.putImageData(pixels,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';ctx.drawImage(video,0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='destination-over';
    if(backdrop){const scale=Math.max(canvas.width/backdrop.width,canvas.height/backdrop.height);const w=backdrop.width*scale,h=backdrop.height*scale;ctx.drawImage(backdrop,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}else{ctx.filter='blur(18px)';ctx.drawImage(video,-24,-24,canvas.width+48,canvas.height+48);ctx.filter='none';}
    ctx.globalCompositeOperation='source-over';
   });}
   timer=setTimeout(render,Math.max(0,1000/30-(performance.now()-started)));
  }catch{stop();onError('Webcam-Effekt gestoppt. Bitte Kamera erneut aktivieren oder Hintergrund ausschalten.');}};
  render();return {stream:output,stop};
 }catch(error){stop();throw new Error('Webcam-Hintergrund konnte nicht gestartet werden: '+(error instanceof Error?error.message:String(error)));}
}
