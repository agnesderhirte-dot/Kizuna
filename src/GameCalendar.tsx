import {useEffect,useMemo,useState} from 'react';
import type {GameSession} from './types';

const pad=(v:number)=>String(v).padStart(2,'0');
const localInput=(date:Date)=>date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes());
const fmt=new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
const defaults=():GameSession=>{
 const future=new Date();future.setHours(20,0,0,0);if(future.getTime()<Date.now())future.setDate(future.getDate()+1);
 return {id:crypto.randomUUID(),title:'Gemeinsamer Spielabend',game:'Football Manager',startsAt:future.getTime(),durationMin:180,reminderMin:60,repeat:'none',notes:'',participants:''};
};
function datesForMonth(month:Date){
 const first=new Date(month.getFullYear(),month.getMonth(),1);
 const leading=(first.getDay()+6)%7;
 const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 return Array.from({length:Math.ceil((leading+days)/7)*7},(_,i)=>new Date(first.getFullYear(),first.getMonth(),i-leading+1));
}
function visibleOccurrence(session:GameSession,day:Date){
 const date=new Date(session.startsAt);
 const weekly=session.repeat==='weekly';
 return date.getFullYear()===day.getFullYear()&&date.getMonth()===day.getMonth()&&date.getDate()===day.getDate()
   ||weekly&&date.getTime()<=new Date(day.getFullYear(),day.getMonth(),day.getDate(),23,59,59).getTime()&&date.getDay()===day.getDay();
}
export function GameCalendar({onShare}:{onShare?:(item:GameSession)=>Promise<void>}){
 const [items,setItems]=useState<GameSession[]>([]);
 const [selected,setSelected]=useState<GameSession>(defaults);
 const [month,setMonth]=useState(()=>new Date());
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [mode,setMode]=useState<'month'|'upcoming'>('upcoming');
 const refresh=async()=>setItems(await window.vox.listSessions());
 useEffect(()=>{void refresh().catch(e=>setError(String(e)));},[]);
 const days=useMemo(()=>datesForMonth(month),[month]);
 const date=localInput(new Date(selected.startsAt));
 const change=<K extends keyof GameSession>(field:K,value:GameSession[K])=>setSelected(s=>({...s,[field]:value}));
 async function operation(task:()=>Promise<void>){setBusy(true);setError('');setNotice('');try{await task();}catch(e){setError(String(e));}finally{setBusy(false);}}
 const future=items.filter(s=>s.repeat==='weekly'||s.startsAt>=Date.now()-3600000).sort((a,b)=>a.startsAt-b.startsAt);
 return <section className="panel calendar-page">
  <h2>Spielkalender & Erinnerungen</h2>
  <p>Plane Spielabende und lass dich lokal in Kizuna beziehungsweise unter Windows erinnern. E-Mail und WhatsApp können über das Teilen eines Termins vorbereitet werden; ein automatischer Versand ist nicht eingerichtet.</p>
  <div className="calendar-actions">
   <button onClick={()=>{setSelected(defaults());setError('');}}>+ Neuer Spielabend</button>
   <button disabled={busy||!items.length} onClick={()=>void operation(async()=>{if(await window.vox.exportSessions())setNotice('Kalender als ICS-Datei gespeichert.');})}>Alle Termine als .ics exportieren</button>
  </div>
  <div className="calendar-body">
   <form className="calendar-form" onSubmit={e=>{e.preventDefault();void operation(async()=>{await window.vox.saveSession(selected);await refresh();setNotice('Spielabend gespeichert. Die lokale Erinnerung ist eingerichtet.');});}}>
    <h3>Termin {items.some(s=>s.id===selected.id)?'bearbeiten':'erstellen'}</h3>
    <label>Titel<input required maxLength={90} value={selected.title} onChange={e=>change('title',e.target.value)}/></label>
    <label>Spiel<input required maxLength={90} value={selected.game} onChange={e=>change('game',e.target.value)}/></label>
    <label>Datum und Uhrzeit<input required type="datetime-local" value={date} onChange={e=>{const time=new Date(e.target.value).getTime();if(Number.isFinite(time))change('startsAt',time);}}/></label>
    <label>Dauer (Minuten)<input type="number" min={15} max={720} step={15} value={selected.durationMin} onChange={e=>change('durationMin',Number(e.target.value))}/></label>
    <label>Erinnerung<select value={selected.reminderMin} onChange={e=>change('reminderMin',Number(e.target.value) as GameSession['reminderMin'])}>
     <option value={0}>Zum Beginn</option><option value={5}>5 Minuten vorher</option><option value={15}>15 Minuten vorher</option><option value={30}>30 Minuten vorher</option><option value={60}>1 Stunde vorher</option><option value={1440}>1 Tag vorher</option>
    </select></label>
    <label>Wiederholung<select value={selected.repeat} onChange={e=>change('repeat',e.target.value as GameSession['repeat'])}><option value="none">Einmalig</option><option value="weekly">Wöchentlich</option></select></label>
    <label>Mitspieler (freiwillig)<input maxLength={240} placeholder="Namen der Mitspieler" value={selected.participants} onChange={e=>change('participants',e.target.value)}/></label>
    <label>Notizen<textarea maxLength={500} rows={3} value={selected.notes} onChange={e=>change('notes',e.target.value)}/></label>
    <button className="primary" type="submit" disabled={busy}>Spielabend speichern</button>
    {items.some(s=>s.id===selected.id)&&<div className="calendar-actions">
     <button type="button" disabled={busy} onClick={()=>void operation(async()=>{await window.vox.copySession(selected);setNotice('Termintext kopiert – in E-Mail oder WhatsApp einfügen.');})}>Text kopieren</button>
     {onShare&&<button type="button" disabled={busy} onClick={()=>void operation(async()=>{await onShare(selected);setNotice('Termin in die aktuelle Lounge gesendet.');})}>Im Raum teilen</button>}
     <button type="button" disabled={busy} onClick={()=>void operation(async()=>{await window.vox.deleteSession(selected.id);await refresh();setSelected(defaults());setNotice('Spielabend gelöscht.');})}>Löschen</button>
    </div>}
   </form>
   <div className="calendar-overview">
    <div className="calendar-actions"><button type="button" aria-pressed={mode==='upcoming'} onClick={()=>setMode('upcoming')}>Termine</button><button type="button" aria-pressed={mode==='month'} onClick={()=>setMode('month')}>Monat</button></div>
    {mode==='upcoming'?<div className="calendar-upcoming">{future.length?future.map(s=><button key={s.id} type="button" className={selected.id===s.id?'selected':''} onClick={()=>setSelected(s)}><strong>{s.title}</strong><span>{s.game} · {fmt.format(s.startsAt)}{s.repeat==='weekly'?' · wöchentlich':''}</span></button>):<p>Noch keine kommenden Spielabende.</p>}</div>
    :<><div className="calendar-month-title"><button type="button" aria-label="Vormonat" onClick={()=>setMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}>‹</button><strong>{month.toLocaleDateString('de-DE',{month:'long',year:'numeric'})}</strong><button type="button" aria-label="Nächster Monat" onClick={()=>setMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}>›</button></div>
    <div className="calendar-grid">{['Mo','Di','Mi','Do','Fr','Sa','So'].map(x=><b key={x}>{x}</b>)}{days.map(day=>{
     const matching=items.filter(s=>visibleOccurrence(s,day));return <button type="button" key={localInput(day)} className={(day.getMonth()!==month.getMonth()?'outside ':'')+(matching.length?'has-events':'')} title={matching.map(x=>x.title).join(', ')} onClick={()=>{if(matching.length)setSelected(matching[0]);else{const next=defaults();next.startsAt=new Date(day.getFullYear(),day.getMonth(),day.getDate(),20).getTime();setSelected(next);}}}>{day.getDate()}{matching.length>0&&<small>{matching.length} Termin{matching.length>1?'e':''}</small>}</button>})}</div></>}
   </div>
  </div>
  <p className="calendar-disclaimer">Wichtig: Automatische Erinnerungen funktionieren derzeit nur, solange Kizuna geöffnet ist und Windows Benachrichtigungen zulässt. Für Erinnerungen bei geschlossenem PC die ICS-Datei in einen vorhandenen Kalender importieren.</p>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 </section>;
}
