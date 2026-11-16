import {useState} from 'react';
type Participant={id:string;name:string;connected:boolean};
type Props={participants:Participant[];levels:Record<string,number>;onChange:(id:string,level:number)=>void};
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
/** Voice-only listening preferences. Never modifies peer tracks or sends anything to the network. */
export function ParticipantAudio({participants,levels,onChange}:Props){
 const [expanded,setExpanded]=useState(false);
 return <div className="participant-audio">
  <button type="button" aria-expanded={expanded} aria-controls="participant-audio-options" onClick={()=>setExpanded(v=>!v)}>🎧 Mitspieler-Ton</button>
  {expanded&&<div id="participant-audio-options" className="participant-audio-options">
   <strong>Sprachlautstärke je Mitspieler</strong>
   <p>Ändert nur, wie laut du die Stimme hörst – Spielsound und Torhymnen bleiben unverändert.</p>
   {participants.length===0&&<p>Keine anderen Teilnehmer verbunden.</p>}
   {participants.map(peer=>{
    const volume=clamp(levels[peer.id]??1);
    return <div className="participant-voice" key={peer.id}>
     <div className="participant-voice-head"><b>{peer.name}</b><button type="button" disabled={!peer.connected} aria-pressed={volume===0} aria-label={`Sprache von ${peer.name} ${volume===0?'einschalten':'stumm schalten'}`} onClick={()=>onChange(peer.id,volume===0?1:0)}>{volume===0?'Stumm':'Mute'}</button></div>
     <label>Stimme von {peer.name} · {Math.round(volume*100)} %
      <input type="range" min="0" max="1" step="0.05" disabled={!peer.connected} value={volume} onChange={e=>onChange(peer.id,clamp(Number(e.target.value)))}/>
     </label>
    </div>;
   })}
   <button type="button" onClick={()=>{for(const p of participants)onChange(p.id,1);}}>Alle Stimmen auf 100 %</button>
  </div>}
 </div>;
}
