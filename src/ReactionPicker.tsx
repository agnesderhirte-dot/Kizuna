import {useRef,useState} from 'react';
import {REACTION_GROUPS} from './reactions';

export function ReactionPicker({send,favorites,onToggleFavorite}:{send:(emoji:string)=>void;favorites:string[];onToggleFavorite:(emoji:string)=>void}){
 const root=useRef<HTMLDetailsElement>(null);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [onlyFavorites,setOnlyFavorites]=useState(false);
 const allowed=(emoji:string)=>!onlyFavorites||favorites.includes(emoji);
 const groups=REACTION_GROUPS.map(group=>({name:group.name,items:group.items.filter(emoji=>allowed(emoji)&&emoji.toLocaleLowerCase('de-DE').includes(query.trim().toLocaleLowerCase('de-DE')))})).filter(g=>g.items.length>0);
 function choose(emoji:string){send(emoji);if(root.current)root.current.open=false;setOpen(false);}
 return <details className="stream-reactions" ref={root} onToggle={e=>setOpen(e.currentTarget.open)}>
  <summary aria-label="Stream-Reaktionen auswählen">⚽ Reaktionen</summary>
  {open&&<div className="reaction-menu" aria-label="Reaktionen für alle Teilnehmer">
   <div className="reaction-filters">
    <input aria-label="Reaktionen suchen" placeholder="Emoji oder Text suchen" maxLength={35} value={query} onChange={e=>setQuery(e.target.value)}/>
    <button type="button" aria-pressed={onlyFavorites} onClick={()=>setOnlyFavorites(v=>!v)}>{onlyFavorites?'★ Favoriten':'☆ Favoriten'}</button>
   </div>
   {groups.map(group=><div key={group.name}>
    <strong>{group.name}</strong>
    <div className="reaction-buttons">{group.items.map(emoji=><span className="reaction-choice" key={emoji}>
     <button className="reaction-send" type="button" title={emoji} aria-label={`Reaktion ${emoji} senden`} onClick={()=>choose(emoji)}>{emoji}</button>
     <button className="reaction-star" type="button" aria-pressed={favorites.includes(emoji)} aria-label={`${emoji} ${favorites.includes(emoji)?'aus Favoriten entfernen':'als Favorit speichern'}`} onClick={()=>onToggleFavorite(emoji)}>{favorites.includes(emoji)?'★':'☆'}</button>
    </span>)}</div>
   </div>)}
   {!groups.length&&<p>Keine passenden Reaktionen.</p>}
   <small>Favoriten werden lokal gespeichert. Bis zu 12 Markierungen.</small>
  </div>}
 </details>;
}
