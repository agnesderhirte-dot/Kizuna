import {useRef} from 'react';
import {REACTION_GROUPS} from './reactions';
export function ReactionPicker({send}:{send:(emoji:string)=>void}){
 const root=useRef<HTMLDetailsElement>(null);
 return <details className="stream-reactions" ref={root}>
  <summary aria-label="Stream-Reaktionen auswählen">⚽ Reaktionen</summary>
  <div className="reaction-menu" aria-label="Reaktionen für alle Teilnehmer">
   {REACTION_GROUPS.map(group=><div key={group.name}>
    <strong>{group.name}</strong>
    <div className="reaction-buttons">{group.items.map(emoji=><button type="button" key={emoji} title={emoji} aria-label={`Reaktion ${emoji} senden`} onClick={()=>{send(emoji);if(root.current)root.current.open=false;}}>{emoji}</button>)}</div>
   </div>)}
  </div>
 </details>;
}
