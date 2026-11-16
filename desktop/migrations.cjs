/** Versioned, transactional migrations preserve data across automatic application updates. */
const calendar=require('./calendar.cjs');
const SCHEMA_VERSION=2;
function migrate(db){
 const raw=db.prepare('PRAGMA user_version').get();
 const current=raw?.user_version;
 if(!Number.isInteger(current)||current<0||current>SCHEMA_VERSION)
  throw Error('Unbekannte oder neuere KIZUNA-Datenbankversion; keine Änderung vorgenommen.');
 if(current===SCHEMA_VERSION)return current;
 db.exec('BEGIN IMMEDIATE');
 try{
  // The 0.3.2 database was version 1. CREATE IF NOT EXISTS preserves those records.
  if(current<1){
   db.exec("CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY,value TEXT NOT NULL)");
   db.exec("CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL)");
   db.exec("CREATE TABLE IF NOT EXISTS messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id))");
  }
  if(current<2)calendar.setup(db);
  // Migrations must update this only after every schema change succeeded.
  db.exec('PRAGMA user_version='+SCHEMA_VERSION);
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
 return SCHEMA_VERSION;
}
module.exports={SCHEMA_VERSION,migrate};
