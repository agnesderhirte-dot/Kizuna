import {useEffect,useRef,useState} from 'react';
import type {Settings} from './types';

/** Private, ephemeral microphone check. Never uploads, transmits or persists samples. */
export function AudioCheck({settings}:{settings:Settings}){
 const resources=useRef<{stream?:MediaStream;context?:AudioContext;timer?:ReturnType<typeof setInterval>;recording?:MediaRecorder;stopRecording?:ReturnType<typeof setTimeout>;url?:string}>({});
 const playback=useRef<HTMLAudioElement>(null);
 const [active,setActive]=useState(false);
 const [recording,setRecording]=useState(false);
 const [clip,setClip]=useState('');
 const [level,setLevel]=useState(0);
 const [message,setMessage]=useState('Kein Mikrofon geöffnet.');
 const generation=useRef(0);
 const dispose=()=>{
  generation.current++;
  const r=resources.current;
  clearInterval(r.timer);
  clearTimeout(r.stopRecording);
  if(r.recording?.state==='recording')r.recording.stop();
  r.stream?.getTracks().forEach(t=>t.stop());
  void r.context?.close().catch(()=>{});
  if(r.url)URL.revokeObjectURL(r.url);
  if(playback.current){playback.current.pause();playback.current.src='';}
  resources.current={};
 };
 useEffect(()=>()=>dispose(),[]);
 function stop(){dispose();setActive(false);setRecording(false);setClip('');setLevel(0);setMessage('Mikrofon geschlossen. Keine Audioaufnahme gespeichert.');}
 async function start(){
  stop();
  const id=generation.current;
  let stream:MediaStream|undefined;
  try{
   stream=await navigator.mediaDevices.getUserMedia({video:false,audio:{
    deviceId:settings.mic?{exact:settings.mic}:undefined,
    echoCancellation:settings.echo,noiseSuppression:settings.noise,autoGainControl:settings.gain
   }});
   if(generation.current!==id){stream.getTracks().forEach(t=>t.stop());return;}
   const context=new AudioContext();
   const source=context.createMediaStreamSource(stream);
   const analyser=context.createAnalyser();analyser.fftSize=1024;source.connect(analyser);
   const data=new Float32Array(analyser.fftSize);
   resources.current={stream,context};
   await context.resume();
   if(generation.current!==id)return;
   resources.current.timer=setInterval(()=>{
    analyser.getFloatTimeDomainData(data);
    let sum=0;for(let i=0;i<data.length;i++)sum+=data[i]*data[i];
    setLevel(Math.min(100,Math.round(Math.sqrt(sum/data.length)*260)));
   },150);
   const track=stream.getAudioTracks()[0];
   const s=track.getSettings();
   track.addEventListener('ended',()=>{if(generation.current===id)stop();},{once:true});
   setActive(true);
   setMessage(`Nur lokale Mikrofonprüfung. Eingang: ${track.label||'Standardmikrofon'} · ${s.sampleRate||'?'} Hz · ${s.channelCount||'?'} Kanal/Kanäle. Mikrofonpegel prüfen oder drei Sekunden aufzeichnen.`);
  }catch(error){
   if(stream)stream.getTracks().forEach(t=>t.stop());
   if(generation.current===id){stop();setMessage('Mikrofon konnte nicht geöffnet werden: '+String(error));}
  }
 }
 function capture(){
  const r=resources.current;
  if(!r.stream||r.recording?.state==='recording')return;
  if(typeof MediaRecorder==='undefined'){setMessage('Aufnahmefunktion wird von dieser Electron-Version nicht unterstützt.');return;}
  if(r.url){URL.revokeObjectURL(r.url);r.url=undefined;}
  setClip('');
  const parts:BlobPart[]=[];
  try{
   const format=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':undefined;
   const recorder=new MediaRecorder(r.stream,format?{mimeType:format}:undefined);
   r.recording=recorder;
   recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};
   recorder.onerror=()=>{setRecording(false);setMessage('Lokale Aufnahme fehlgeschlagen.');};
   recorder.onstop=()=>{
    if(resources.current.recording!==recorder)return;
    clearTimeout(resources.current.stopRecording);
    setRecording(false);
    const blob=new Blob(parts,{type:recorder.mimeType||'audio/webm'});
    if(!blob.size){setMessage('Mikrofon liefert keine aufzeichenbaren Daten.');return;}
    const url=URL.createObjectURL(blob);
    resources.current.url=url;
    setClip(url);
    setMessage('Drei Sekunden aufgenommen. Zur Diagnose anhören; die Aufnahme bleibt nur im Arbeitsspeicher.');
   };
   recorder.start();
   setRecording(true);setMessage('Aufzeichnung läuft ausschließlich lokal (maximal drei Sekunden).');
   r.stopRecording=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},3000);
  }catch(error){setRecording(false);setMessage('Aufnahme nicht möglich: '+String(error));}
 }
 async function listen(){
  const audio=playback.current;
  if(!audio||!clip)return;
  try{
   if('setSinkId'in audio)await audio.setSinkId(settings.output||'default');
   audio.currentTime=0;await audio.play();
   setMessage('Aufnahme wird auf dem ausgewählten Ausgabegerät wiedergegeben.');
  }catch(error){setMessage('Ausgabeproblem: '+String(error));}
 }
 return <div className="audio-check">
  <h3>Mikrofontest – ohne Webcam</h3>
  <p>Prüfe den tatsächlichen Mikrofonpegel und höre eine kurze, ausschließlich lokale Testaufnahme ab. Keine Übertragung an andere Nutzer.</p>
  <meter aria-label="Lokaler Mikrofonpegel" min="0" max="100" value={level}/>
  <div className="audio-check-buttons">
   <button type="button" onClick={()=>void start()} disabled={active}>Mikrofon prüfen</button>
   <button type="button" onClick={capture} disabled={!active||recording}>3 Sekunden aufnehmen</button>
   <button type="button" onClick={()=>void listen()} disabled={!clip||recording}>Aufnahme anhören</button>
   <button type="button" onClick={stop} disabled={!active&&!clip}>Test beenden</button>
  </div>
  <audio ref={playback} src={clip||undefined} preload="none"/>
  <p role="status">{message}</p>
 </div>;
}
