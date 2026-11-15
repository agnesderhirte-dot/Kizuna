import {type ReactNode,useEffect,useRef,useState} from 'react';
export type VideoTile={id:string;name:string;kind:string;local:boolean;stream:MediaStream};
function Video({tile}:{tile:VideoTile}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const video=ref.current!;video.srcObject=tile.stream;void video.play().catch(()=>{});return()=>{video.srcObject=null;};},[tile.stream]);
 return <><video ref={ref} autoPlay playsInline muted/><figcaption>{tile.name} · {tile.kind==='screen'?'Bildschirm':tile.kind==='camera'?'Kamera':'Video'}</figcaption></>;
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function VideoStage({tiles,controls}:{tiles:VideoTile[];controls?:ReactNode}){
 const stage=useRef<HTMLElement>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const [full,setFull]=useState(false);
 const [error,setError]=useState('');
 const [positions,setPositions]=useState<Record<string,{x:number;y:number}>>({});
 const drag=useRef<{id:string;pointer:number;x:number;y:number;left:number;top:number}|null>(null);
 const focused=tiles.find(t=>t.id===selected&&t.kind==='screen');
 const screens=tiles.filter(t=>t.kind==='screen');
 useEffect(()=>{const update=()=>setFull(document.fullscreenElement===stage.current);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);},[]);
 useEffect(()=>{if(selected&&!focused){setSelected(null);if(document.fullscreenElement===stage.current)void document.exitFullscreen().catch(()=>{});}},[selected,focused]);
 function focus(tile:VideoTile,fullscreen=false){setSelected(tile.id);setError('');if(fullscreen&&!document.fullscreenElement)void stage.current?.requestFullscreen().catch(()=>setError('Vollbild nicht verfügbar. Die große Ansicht bleibt aktiv.'));}
 function grid(){setSelected(null);if(document.fullscreenElement===stage.current)void document.exitFullscreen().catch(()=>{});}
 return <section ref={stage} className={`video-stage ${focused?'focused':'grid-view'}`} aria-label="Videoansicht">
  <div className="stage-toolbar"><button onClick={grid} aria-pressed={!focused}>Viereransicht</button>{screens.map(t=><button key={t.id} aria-pressed={selected===t.id} onClick={()=>focus(t)}>{t.name} groß</button>)}{focused&&<button onClick={()=>full?void document.exitFullscreen():focus(focused,true)}>{full?'Vollbild verlassen':'Vollbild'}</button>}<small>{focused?'Kameras am Griff verschieben':'Doppelklick auf einen Bildschirm: Vollbild'}</small>{controls}</div>
  {error&&<p role="status">{error}</p>}
  <div className="streams stage-content">
   {focused?<><figure className="focus-screen" data-local={focused.local} onDoubleClick={()=>full?void document.exitFullscreen():focus(focused,true)}><Video tile={focused}/></figure>{tiles.filter(t=>t.kind==='camera').map((tile,i)=>{const pos=positions[tile.id]||{x:i%2,y:1-Math.floor(i/2)*.35};return <figure key={tile.id} className="camera-overlay" style={{left:`${pos.x*100}%`,top:`${pos.y*100}%`,transform:`translate(-${pos.x*100}%, -${pos.y*100}%)`}}>
    <button className="camera-handle" aria-label={`${tile.name} Kamera verschieben`} onKeyDown={e=>{const dx=e.key==='ArrowRight'?.05:e.key==='ArrowLeft'?-.05:0;const dy=e.key==='ArrowDown'?.05:e.key==='ArrowUp'?-.05:0;if(dx||dy){e.preventDefault();setPositions(p=>({...p,[tile.id]:{x:clamp(pos.x+dx),y:clamp(pos.y+dy)}}));}}} onPointerDown={e=>{const box=e.currentTarget.parentElement!.getBoundingClientRect();drag.current={id:tile.id,pointer:e.pointerId,x:e.clientX,y:e.clientY,left:box.left,top:box.top};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=drag.current;if(!d||d.id!==tile.id||d.pointer!==e.pointerId)return;const el=e.currentTarget.parentElement!;const bounds=el.parentElement!.getBoundingClientRect();setPositions(p=>({...p,[tile.id]:{x:clamp((d.left-bounds.left+e.clientX-d.x)/Math.max(1,bounds.width-el.offsetWidth)),y:clamp((d.top-bounds.top+e.clientY-d.y)/Math.max(1,bounds.height-el.offsetHeight))}}));}} onPointerUp={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>⠿ {tile.name}</button><Video tile={tile}/></figure>;})}</>:tiles.map(tile=><figure key={tile.id} data-local={tile.local} data-kind={tile.kind} onDoubleClick={()=>{if(tile.kind==='screen')focus(tile,true);}}><Video tile={tile}/></figure>)}
   {!tiles.length&&<div className="empty-stream"><h2>Der Raum ist bereit.</h2><p>Aktiviere deine Kamera oder teile deinen Bildschirm.</p></div>}
  </div>
 </section>;
}
