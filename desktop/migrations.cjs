/** Versioned, transactional migrations preserve data across automatic application updates. */
const calendar=require('./calendar.cjs');
const fs=require('node:fs');
const {DatabaseSync}=require('node:sqlite');
const SCHEMA_VERSION=2;
const SCHEMA={
 kv:['key','value'],
 assets:['id','name','kind','mime'],
 messages:['id','room','sender','name','text','time'],
 game_sessions:['id','title','game','startsAt','durationMin','reminderMin','repeat','notes','participants','notifiedOccurrence']
};
function verifySchema(db){
 for(const [table,columns] of Object.entries(SCHEMA)){
  const entry=db.prepare("SELECT type FROM sqlite_master WHERE name=?").get(table);
  if(entry?.type!=='table')throw Error('Datenbankschema beschädigt: '+table);
  const available=new Set(db.prepare('PRAGMA table_info('+table+')').all().map(col=>col.name));
  if(columns.some(column=>!available.has(column)))throw Error('Datenbankspalten fehlen: '+table);
 }
}

/** SQLite-backed consistent backup, not a raw copy of a potentially active WAL database. */
function ensureUpgradeBackup(db,file){
 if(!file)return;
 const exists=fs.existsSync(file);
 if(!exists){
  try{db.prepare('VACUUM INTO ?').run(file);}
  catch(error){try{fs.rmSync(file,{force:true});}catch{}throw error;}
 }
 let valid=false;
 try{
  const snapshot=new DatabaseSync(file,{readOnly:true});
  try{valid=snapshot.prepare('PRAGMA integrity_check').get()?.integrity_check==='ok'&&snapshot.prepare('PRAGMA user_version').get()?.user_version===1;}
  finally{snapshot.close();}
 }catch{valid=false;}
 if(!valid){
  if(!exists)fs.rmSync(file,{force:true});
  throw Error('Automatische Sicherung der alten KIZUNA-Datenbank ist beschädigt. Upgrade abgebrochen.');
 }
}
function migrate(db,backupPath){
 const raw=db.prepare('PRAGMA user_version').get();
 const current=raw?.user_version;
 if(!Number.isInteger(current)||current<0||current>SCHEMA_VERSION)
  throw Error('Unbekannte oder neuere KIZUNA-Datenbankversion; keine Änderung vorgenommen.');
 if(current===SCHEMA_VERSION){verifySchema(db);return current;}
 if(current===1)ensureUpgradeBackup(db,backupPath);
 db.exec('BEGIN IMMEDIATE');
 try{
  // The 0.3.2 database was version 1. CREATE IF NOT EXISTS preserves those records.
  if(current<1){
   db.exec("CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY,value TEXT NOT NULL)");
   db.exec("CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL)");
   db.exec("CREATE TABLE IF NOT EXISTS messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id))");
  }
  if(current<2)calendar.setup(db);
  verifySchema(db);
  // Migrations must update this only after every schema change succeeded.
  db.exec('PRAGMA user_version='+SCHEMA_VERSION);
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
 return SCHEMA_VERSION;
}
module.exports={SCHEMA_VERSION,migrate,ensureUpgradeBackup};
