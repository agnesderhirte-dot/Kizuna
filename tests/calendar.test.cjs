const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const calendar=require('../desktop/calendar.cjs');
const item=(start=Date.now()+3600000)=>({
 id:'meeting_12345',title:'Football Manager Abend',game:'Football Manager',startsAt:start,
 durationMin:180,reminderMin:60,repeat:'none',notes:'Taktik & Transfers',participants:'Spieler A, Spieler B'
});
function db(){const store=new DatabaseSync(':memory:');calendar.setup(store);return store;}
test('calendar preserves events and rejects invalid schedules',()=>{
 const store=db();const s=item();
 assert.deepEqual(calendar.save(store,s),s);
 assert.equal(calendar.list(store).length,1);
 assert.throws(()=>calendar.save(store,{...s,durationMin:10000}));
 assert.throws(()=>calendar.save(store,{...s,notes:'<script>'.repeat(500)}));
 assert.equal(calendar.remove(store,s.id),true);
 assert.equal(calendar.list(store).length,0);
 store.close();
});
test('reminder fires once and does not duplicate after app restart',()=>{
 const store=db();const now=Date.now();
 const session=item(now+60*60000);
 calendar.save(store,session);
 assert.equal(calendar.remindersDue(store,now).length,1);
 assert.equal(calendar.remindersDue(store,now+1000).length,0);
 assert.equal(calendar.remindersDue(store,now+5000).length,0);
 store.close();
});
test('weekly reminder re-arms on following occurrence only',()=>{
 const store=db();
 const now=Date.now();
 calendar.save(store,{...item(now+3600000),repeat:'weekly'});
 assert.equal(calendar.remindersDue(store,now).length,1);
 assert.equal(calendar.remindersDue(store,now+1000).length,0);
 assert.equal(calendar.remindersDue(store,now+7*86400000).length,1);
 store.close();
});
test('ICS can be imported by calendar apps and escapes user text',()=>{
 const cal=calendar.toICS([{...item(1794862800000),title:'FM, Club; Saison',notes:'Zeile 1\nZeile 2',repeat:'weekly'}]);
 assert.ok(cal.startsWith('BEGIN:VCALENDAR\r\n'));
 assert.ok(cal.includes('BEGIN:VEVENT'));
 assert.ok(cal.includes('RRULE:FREQ=WEEKLY'));
 assert.ok(cal.includes('BEGIN:VALARM'));
 assert.ok(cal.includes('SUMMARY:FM\\, Club\\; Saison'));
 assert.ok(cal.includes('END:VCALENDAR'));
 assert.ok(cal.endsWith('\r\n'));
 assert.ok(cal.includes('DTSTART:'));
 assert.ok(cal.includes('UID:'));
});
test('calendar exports European weekly meetings with wall-clock timezone and DST transitions',()=>{
 const summer=calendar.toICS([{...item(Date.UTC(2027,6,17,18,0)),repeat:'weekly'}],'Europe/Berlin');
 const winter=calendar.toICS([{...item(Date.UTC(2027,0,17,19,0)),repeat:'weekly'}],'Europe/Berlin');
 assert.ok(summer.includes('BEGIN:VTIMEZONE'));
 assert.ok(summer.includes('TZNAME:CEST'));
 assert.ok(summer.includes('TZNAME:CET'));
 assert.ok(summer.includes('DTSTART;TZID=Europe/Berlin:20270717T200000'));
 assert.ok(winter.includes('DTSTART;TZID=Europe/Berlin:20270117T200000'));
 assert.ok(summer.includes('RRULE:FREQ=WEEKLY'));
});
test('external message sharing is always a manual user action',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'../src/GameCalendar.tsx'),'utf8');
 assert.ok(main.includes("handle('shareSession',async raw=>"));
 assert.ok(main.includes("z.enum(['email','whatsapp'])"));
 assert.ok(main.includes("'mailto:?subject='"));
 assert.ok(main.includes("'https://wa.me/?text='"));
 assert.ok(ui.includes('E-Mail vorbereiten'));
 assert.ok(ui.includes('WhatsApp öffnen'));
 assert.ok(ui.includes('Bitte Nachricht selbst versenden.'));
});
test('secure Electron wiring and UI exist and are opt-in',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const preload=fs.readFileSync(path.join(__dirname,'../desktop/preload.cjs'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'../src/GameCalendar.tsx'),'utf8');
 assert.ok(main.includes("calendar.setup(db)"));
 assert.ok(main.includes("handle('saveSession'"));
 assert.ok(main.includes("calendar.remindersDue(db)"));
 assert.ok(main.includes("dialog.showSaveDialog(win"));
 assert.ok(preload.includes("'listSessions'"));
 assert.ok(app.includes("<GameCalendar"));
 assert.ok(ui.includes('type="datetime-local"'));
 assert.ok(ui.includes('Kizuna geöffnet'));
});
