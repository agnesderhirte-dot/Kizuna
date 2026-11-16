const {z}=require('zod');

const meeting=z.object({
 id:z.string().regex(/^[a-zA-Z0-9_-]{8,80}$/),
 title:z.string().trim().min(1).max(90),
 game:z.string().trim().min(1).max(90),
 startsAt:z.number().int().min(0).max(8640000000000000),
 durationMin:z.number().int().min(15).max(720),
 reminderMin:z.union([z.literal(0),z.literal(5),z.literal(15),z.literal(30),z.literal(60),z.literal(1440)]),
 repeat:z.enum(['none','weekly']),
 notes:z.string().max(500),
 participants:z.string().max(240)
}).strict();

function setup(db){
 db.exec("CREATE TABLE IF NOT EXISTS game_sessions (id TEXT PRIMARY KEY, title TEXT NOT NULL, game TEXT NOT NULL, startsAt INTEGER NOT NULL, durationMin INTEGER NOT NULL, reminderMin INTEGER NOT NULL, repeat TEXT NOT NULL, notes TEXT NOT NULL, participants TEXT NOT NULL, notifiedOccurrence INTEGER)");
}
const columns="id,title,game,startsAt,durationMin,reminderMin,repeat,notes,participants";
function list(db){return db.prepare('SELECT '+columns+' FROM game_sessions ORDER BY startsAt ASC LIMIT 500').all();}
function save(db,raw){
 const item=meeting.parse(raw);
 if(db.prepare('SELECT count(*) AS c FROM game_sessions').get().c>=500&&!db.prepare('SELECT id FROM game_sessions WHERE id=?').get(item.id))throw Error('Maximal 500 geplante Spielabende');
 db.prepare('INSERT INTO game_sessions ('+columns+',notifiedOccurrence) VALUES (?,?,?,?,?,?,?,?,?,NULL) ON CONFLICT(id) DO UPDATE SET title=excluded.title,game=excluded.game,startsAt=excluded.startsAt,durationMin=excluded.durationMin,reminderMin=excluded.reminderMin,repeat=excluded.repeat,notes=excluded.notes,participants=excluded.participants,notifiedOccurrence=NULL')
 .run(item.id,item.title,item.game,item.startsAt,item.durationMin,item.reminderMin,item.repeat,item.notes,item.participants);
 return item;
}
function remove(db,id){return db.prepare('DELETE FROM game_sessions WHERE id=?').run(z.string().regex(/^[a-zA-Z0-9_-]{8,80}$/).parse(id)).changes>0;}

/** Preserve local wall-clock time across daylight saving changes. */
function occurrenceAtOrAfter(session,now){
 const start=new Date(session.startsAt);
 if(session.repeat!=='weekly'||now<=session.startsAt)return start.getTime();
 let next=new Date(session.startsAt);
 const elapsed=Math.max(0,Math.floor((now-session.startsAt)/(7*86400000)));
 next.setDate(next.getDate()+Math.max(0,elapsed-1)*7);
 for(let i=0;i<5&&next.getTime()<now;i++)next.setDate(next.getDate()+7);
 return next.getTime();
}
function remindersDue(db,now=Date.now()){
 // At most the current/next recurrence. Keep a five-minute catch-up
 // period after scheduled session start for transient Windows sleep.
 const rows=db.prepare('SELECT * FROM game_sessions WHERE startsAt <= ? ORDER BY startsAt LIMIT 500').all(now+1440*60000);
 const due=[];
 for(const row of rows){
  const target=occurrenceAtOrAfter(row,now-row.reminderMin*60000-5*60000);
  const trigger=target-row.reminderMin*60000;
  if(trigger<=now&&now<=Math.min(target+5*60000,trigger+5*60000)&&row.notifiedOccurrence!==target){
   db.prepare('UPDATE game_sessions SET notifiedOccurrence=? WHERE id=? AND (notifiedOccurrence IS NULL OR notifiedOccurrence<>?)').run(target,row.id,target);
   due.push({...row,occurrence:target});
  }
 }
 return due;
}
function esc(text){return String(text).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function utc(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
function fold(line){const out=[];let part='';for(const char of line){if(Buffer.byteLength(part+char,'utf8')>70){out.push(part);part=' '+char;}else part+=char;}if(part)out.push(part);return out.join('\r\n');}
function berlinLocal(ms){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 return parts.year+parts.month+parts.day+'T'+parts.hour+parts.minute+parts.second;
}
function toICS(items,timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone){
 const berlin=timeZone==='Europe/Berlin';
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KIZUNA//Game Sessions//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 if(berlin)lines.push(
  'X-WR-TIMEZONE:Europe/Berlin','BEGIN:VTIMEZONE','TZID:Europe/Berlin',
  'BEGIN:DAYLIGHT','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','TZNAME:CEST','DTSTART:19700329T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT',
  'BEGIN:STANDARD','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','TZNAME:CET','DTSTART:19701025T030000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE'
 );
 for(const item of items.map(x=>meeting.parse(x))){
  lines.push('BEGIN:VEVENT','UID:'+item.id+'@kizuna.local','DTSTAMP:'+utc(Date.now()),berlin?'DTSTART;TZID=Europe/Berlin:'+berlinLocal(item.startsAt):'DTSTART:'+utc(item.startsAt),berlin?'DTEND;TZID=Europe/Berlin:'+berlinLocal(item.startsAt+item.durationMin*60000):'DTEND:'+utc(item.startsAt+item.durationMin*60000),'SUMMARY:'+esc(item.title),'DESCRIPTION:'+esc('Spiel: '+item.game+(item.participants?'\nMit: '+item.participants:'')+(item.notes?'\n'+item.notes:'')));
  if(item.repeat==='weekly')lines.push('RRULE:FREQ=WEEKLY');
  if(item.reminderMin>0)lines.push('BEGIN:VALARM','TRIGGER:-PT'+item.reminderMin+'M','ACTION:DISPLAY','DESCRIPTION:'+esc(item.title),'END:VALARM');
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR','');
 return lines.map(fold).join('\r\n');
}
function shareText(item){const s=meeting.parse(item);return s.title+' ('+s.game+')\n'+new Date(s.startsAt).toLocaleString('de-DE',{dateStyle:'full',timeStyle:'short'})+' · '+s.durationMin+' Minuten'+(s.participants?'\nTeilnehmer: '+s.participants:'')+(s.notes?'\n'+s.notes:'');}
module.exports={meeting,setup,list,save,remove,occurrenceAtOrAfter,remindersDue,toICS,shareText};
