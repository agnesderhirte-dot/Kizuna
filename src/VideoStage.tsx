import {type ReactNode,useEffect,useRef,useState} from 'react';
import type {StreamReaction} from './reactions';
export type VideoTile={id:string;name:string;kind:string;local:boolean;stream:MediaStream;speaking:boolean;avatar?:string};
type ScreenSound={volume:number;muted:boolean;output:string;onError:(message:string)=>void};
function configureOutput(element:HTMLMediaElement,output:string,onError:(message:string)=>void){
 if('setSinkId'in element)void element.setSinkId(output||'default').catch(e=>onError('Spielsound: Ausgabegerät nicht verfügbar: '+String(e)));
}
function Video({tile,sound}:{tile:VideoTile;sound:ScreenSound}){
 const ref=useRef<HTMLVideoElement>(null);
 const playsScreenAudio=!tile.local&&tile.kind==='screen';
 useEffect(()=>{const video=ref.current!;video.srcObject=tile.stream;void video.play().catch(e=>sound.onError('Stream-Wiedergabe fehlgeschlagen: '+String(e)));return()=>{video.pause();video.srcObject=null;};},[tile.stream,sound.onError]);
 useEffect(()=>{ref.current!.volume=sound.volume;},[sound.volume]);
 useEffect(()=>{if(playsScreenAudio)configureOutput(ref.current!,sound.output,sound.onError);},[sound.output,sound.onError,playsScreenAudio]);
 return <><video ref={ref} autoPlay playsInline muted={!playsScreenAudio||sound.muted}/><figcaption>{tile.avatar&&<img className="tile-avatar" src={tile.avatar} alt=""/>}{tile.name} · {tile.kind==='screen'?'Bildschirm':tile.kind==='camera'?'Kamera':'Video'}</figcaption></>;
}
function OffscreenAudio({tile,sound}:{tile:VideoTile;sound:ScreenSound}){
 const ref=useRef<HTMLAudioElement>(null);
 useEffect(()=>{const audio=ref.current!;audio.srcObject=tile.stream;void audio.play().catch(e=>sound.onError('Spielsound-Wiedergabe fehlgeschlagen: '+String(e)));return()=>{audio.pause();audio.srcObject=null;};},[tile.stream,sound.onError]);
 useEffect(()=>{ref.current!.volume=sound.volume;},[sound.volume]);
 useEffect(()=>{configureOutput(ref.current!,sound.output,sound.onError);},[sound.output,sound.onError]);
 return <audio ref={ref} autoPlay muted={sound.muted} aria-hidden="true"/>;
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function VideoStage({tiles,controls,reactions=[],screenMuted,onToggleScreenMute,screenVolume,deafened,output,onAudioError}:{
 tiles:VideoTile[];controls?:ReactNode;reactions?:StreamReaction[];
 screenMuted:Record<string,boolean>;onToggleScreenMute:(tileId:string)=>void;screenVolume:number;deafened:boolean;output:string;onAudioError:(message:string)=>void;
}){
 const stage=useRef<HTMLElement>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const [full,setFull]=useState(false);
 const [error,setError]=useState('');
 const [positions,setPositions]=useState<Record<string,{x:number;y:number}>>({});
 const drag=useRef<{id:string;pointer:number;x:number;y:number;left:number;top:number}|null>(null);
 const focused=tiles.find(t=>t.id===selected&&t.kind==='screen');
 const screens=tiles.filter(t=>t.kind==='screen');
 const soundFor=(tile:VideoTile):ScreenSound=>({volume:screenVolume,muted:deafened||!!screenMuted[tile.id],output,onError:onAudioError});
 useEffect(()=>{const update=()=>setFull(document.fullscreenElement===stage.current);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);},[]);
 useEffect(()=>{if(selected&&!focused){setSelected(null);if(document.fullscreenElement===stage.current)void document.exitFullscreen().catch(()=>{});}},[selected,focused]);
 function focus(tile:VideoTile,fullscreen=false){setSelected(tile.id);setError('');if(fullscreen&&!document.fullscreenElement)void stage.current?.requestFullscreen().catch(()=>setError('Vollbild nicht verfügbar. Die große Ansicht bleibt aktiv.'));}
 function grid(){setSelected(null);if(document.fullscreenElement===stage.current)void document.exitFullscreen().catch(()=>{});}
 return <section ref={stage} className={`video-stage ${focused?'focused':'grid-view'}`} aria-label="Videoansicht">
  <div className="stage-toolbar"><button onClick={grid} aria-pressed={!focused}>Viereransicht</button>{screens.map(t=><button key={t.id} aria-pressed={selected===t.id} onClick={()=>focus(t)}>{t.name} groß</button>)}
  {screens.filter(t=>!t.local).map(t=><button key={'audio:'+t.id} type="button" className="stream-sound-toggle" aria-pressed={!!screenMuted[t.id]} aria-label={`Spielsound von ${t.name} ${screenMuted[t.id]?'einschalten':'stumm schalten'}`} onClick={()=>onToggleScreenMute(t.id)}>{screenMuted[t.id]?'🔇':'🔊'} Spielsound: {t.name}</button>)}{focused&&<button onClick={()=>full?void document.exitFullscreen():focus(focused,true)}>{full?'Vollbild verlassen':'Vollbild'}</button>}<small>{focused?'Kameras am Griff verschieben':'Doppelklick auf einen Bildschirm: Vollbild'}</small>{controls}</div>
  {error&&<p role="status">{error}</p>}
  <div className="streams stage-content">
   {focused?<><figure className="focus-screen" data-local={focused.local} data-speaking={focused.speaking} onDoubleClick={()=>full?void document.exitFullscreen():focus(focused,true)}><Video tile={focused} sound={soundFor(focused)}/></figure>{tiles.filter(t=>t.kind==='camera').map((tile,i)=>{const pos=positions[tile.id]||{x:i%2,y:1-Math.floor(i/2)*.35};return <figure key={tile.id} className="camera-overlay" data-speaking={tile.speaking} style={{left:`${pos.x*100}%`,top:`${pos.y*100}%`,transform:`translate(-${pos.x*100}%, -${pos.y*100}%)`}}>
    <button className="camera-handle" aria-label={`${tile.name} Kamera verschieben`} onKeyDown={e=>{const dx=e.key==='ArrowRight'?.05:e.key==='ArrowLeft'?-.05:0;const dy=e.key==='ArrowDown'?.05:e.key==='ArrowUp'?-.05:0;if(dx||dy){e.preventDefault();setPositions(p=>({...p,[tile.id]:{x:clamp(pos.x+dx),y:clamp(pos.y+dy)}}));}}} onPointerDown={e=>{const box=e.currentTarget.parentElement!.getBoundingClientRect();drag.current={id:tile.id,pointer:e.pointerId,x:e.clientX,y:e.clientY,left:box.left,top:box.top};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=drag.current;if(!d||d.id!==tile.id||d.pointer!==e.pointerId)return;const el=e.currentTarget.parentElement!;const bounds=el.parentElement!.getBoundingClientRect();setPositions(p=>({...p,[tile.id]:{x:clamp((d.left-bounds.left+e.clientX-d.x)/Math.max(1,bounds.width-el.offsetWidth)),y:clamp((d.top-bounds.top+e.clientY-d.y)/Math.max(1,bounds.height-el.offsetHeight))}}));}} onPointerUp={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>⠿ {tile.name}</button><Video tile={tile} sound={soundFor(tile)}/></figure>;})}</>:tiles.map(tile=><figure key={tile.id} data-local={tile.local} data-kind={tile.kind} data-speaking={tile.speaking} onDoubleClick={()=>{if(tile.kind==='screen')focus(tile,true);}}><Video tile={tile} sound={soundFor(tile)}/></figure>)}
   {focused&&screens.filter(t=>!t.local&&t.id!==focused.id&&t.stream.getAudioTracks().some(track=>track.readyState==='live')).map(t=><OffscreenAudio key={'offscreen:'+t.id} tile={t} sound={soundFor(t)}/>)}
   {reactions.length>0&&<div className="stream-reaction-overlay" aria-live="polite" aria-label="Stream-Reaktionen">{reactions.slice(-6).map(r=><div key={r.id} className="stream-reaction"><strong>{r.emoji}</strong><span>{r.name}</span></div>)}</div>}
   {!tiles.length&&<div className="empty-stream"><h2>Der Raum ist bereit.</h2><p>Aktiviere deine Kamera oder teile deinen Bildschirm.</p></div>}
  </div>
 </section>;
}
