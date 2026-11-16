import {useRef,useState} from 'react';
type Participant={id:string;name:string;connected:boolean};
type Props={
 participants:Participant[];levels:Record<string,number>;onChange:(id:string,level:number)=>void;
 hiddenReactions:Record<string,boolean>;onToggleReactions:(id:string)=>void;
 mutedSounds:Record<string,boolean>;onToggleSounds:(id:string)=>void;
};
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
/** Voice-only listening preferences. Never modifies peer tracks or sends anything to the network. */
export function ParticipantAudio({participants,levels,onChange,hiddenReactions,onToggleReactions,mutedSounds,onToggleSounds}:Props){
 const [expanded,setExpanded]=useState(false);
 const previousNonZero=useRef<Record<string,number>>({});
 return <div className="participant-audio">
  <button type="button" aria-expanded={expanded} aria-controls="participant-audio-options" onClick={()=>setExpanded(v=>!v)}>🎧 Mitspieler-Steuerung</button>
  {expanded&&<div id="participant-audio-options" className="participant-audio-options">
   <strong>Sprachlautstärke und Effekte je Mitspieler</strong>
   <p>Stelle Stimmen einzeln ein. Reaktionen und Sounds können unabhängig davon pro Teilnehmer ausgeblendet werden.</p>
   {participants.length===0&&<p>Keine anderen Teilnehmer verbunden.</p>}
   {participants.map(peer=>{
    const volume=clamp(levels[peer.id]??1);
    return <div className="participant-voice" key={peer.id}>
     <div className="participant-voice-head"><b>{peer.name}</b><button type="button" disabled={!peer.connected} aria-pressed={volume===0} aria-label={`Sprache von ${peer.name} ${volume===0?'einschalten':'stumm schalten'}`} onClick={()=>{if(volume===0)onChange(peer.id,previousNonZero.current[peer.id]??1);else{previousNonZero.current[peer.id]=volume;onChange(peer.id,0);}}}>{volume===0?'Stumm':'Mute'}</button></div>
     <label>Stimme von {peer.name} · {Math.round(volume*100)} %
      <input type="range" min="0" max="1" step="0.05" disabled={!peer.connected} value={volume} onChange={e=>{const next=clamp(Number(e.target.value));if(next>0)previousNonZero.current[peer.id]=next;onChange(peer.id,next);}}/>
     </label>
     <div className="participant-privacy">
      <label><input type="checkbox" disabled={!peer.connected} checked={!hiddenReactions[peer.id]} onChange={()=>onToggleReactions(peer.id)}/> Reaktionen von {peer.name} anzeigen</label>
      <label><input type="checkbox" disabled={!peer.connected} checked={!mutedSounds[peer.id]} onChange={()=>onToggleSounds(peer.id)}/> Soundboard von {peer.name} hören</label>
     </div>
    </div>;
   })}
   <button type="button" onClick={()=>{for(const p of participants)onChange(p.id,1);}}>Alle Stimmen auf 100 %</button>
  </div>}
 </div>;
}
