const test=require('node:test');
const assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {migrate,SCHEMA_VERSION}=require('../desktop/migrations.cjs');

function database(){return new DatabaseSync(':memory:');}
function version(db){return db.prepare('PRAGMA user_version').get().user_version;}

test('fresh Kizuna database migrates to the current version and creates every table',()=>{
 const db=database();
 assert.equal(version(db),0);
 assert.equal(migrate(db),SCHEMA_VERSION);
 assert.equal(version(db),2);
 for(const name of ['kv','assets','messages','game_sessions']){
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name));
 }
 db.close();
});

test('existing 0.3.2 data survives the upgrade and repeat migration',()=>{
 const db=database();
 db.exec("CREATE TABLE kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL);CREATE TABLE messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id));PRAGMA user_version=1;");
 db.prepare('INSERT INTO kv VALUES(?,?)').run('settings',JSON.stringify({name:'Altversion'}));
 db.prepare('INSERT INTO assets VALUES(?,?,?,?)').run('a'.repeat(64),'Vereinswappen','background','image/png');
 db.prepare('INSERT INTO messages VALUES(?,?,?,?,?,?)').run('old_id_123','room_12345','friend_123','Freund','Alte Nachricht',123);
 migrate(db);
 assert.equal(version(db),2);
 assert.equal(JSON.parse(db.prepare('SELECT value FROM kv WHERE key=?').get('settings').value).name,'Altversion');
 assert.equal(db.prepare('SELECT count(*) AS n FROM assets').get().n,1);
 assert.equal(db.prepare('SELECT count(*) AS n FROM messages').get().n,1);
 assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name='game_sessions'").get());
 assert.equal(migrate(db),2);
 assert.equal(db.prepare('SELECT count(*) AS n FROM messages').get().n,1);
 db.close();
});

test('an incompatible newer database is refused without downgrading or changing data',()=>{
 const db=database();
 db.exec('PRAGMA user_version=99');
 assert.throws(()=>migrate(db),/neuere KIZUNA-Datenbankversion/);
 assert.equal(version(db),99);
 assert.equal(db.prepare('SELECT count(*) AS n FROM sqlite_master').get().n,0);
 db.close();
});

test('invalid existing calendar table rolls back the version upgrade',()=>{
 const db=database();
 db.exec("CREATE TABLE kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL);CREATE TABLE messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id));PRAGMA user_version=1;");
 // Existing migrations must never mutate old records or version on failure.
 db.exec("CREATE VIEW game_sessions AS SELECT 'unexpected' AS id");
 assert.throws(()=>migrate(db));
 assert.equal(version(db),1);
 assert.equal(db.prepare("SELECT type FROM sqlite_master WHERE name='game_sessions'").get().type,'view');
 db.close();
});

test('0.3.2 to 0.4.0 creates an intact pre-upgrade SQLite snapshot before changing records',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'kizuna-upgrade-'));
 const original=path.join(folder,'original.sqlite');
 const backup=path.join(folder,'original.sqlite.pre-0.4.0-backup');
 const db=new DatabaseSync(original);
 try{
  db.exec("CREATE TABLE kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL);CREATE TABLE messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id));PRAGMA user_version=1;");
  db.prepare('INSERT INTO kv VALUES (?,?)').run('settings',JSON.stringify({name:'Unverändert'}));
  assert.equal(migrate(db,backup),2);
  assert.equal(version(db),2);
  assert.ok(fs.existsSync(backup));
  const old=new DatabaseSync(backup,{readOnly:true});
  try{
   assert.equal(version(old),1);
   assert.equal(old.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
   assert.equal(JSON.parse(old.prepare('SELECT value FROM kv WHERE key=?').get('settings').value).name,'Unverändert');
   assert.equal(old.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name='game_sessions'").get().n,0);
  }finally{old.close();}
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name='game_sessions'").get());
 }finally{db.close();fs.rmSync(folder,{recursive:true,force:true});}
});

test('a corrupted old backup blocks migration without destroying old user records',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'kizuna-failed-backup-'));
 const backup=path.join(folder,'old-backup.sqlite');
 const db=database();
 try{
  db.exec("CREATE TABLE kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL);CREATE TABLE messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id));PRAGMA user_version=1;");
  db.prepare('INSERT INTO kv VALUES (?,?)').run('key','historical value');
  fs.writeFileSync(backup,Buffer.from('not a sqlite database'));
  assert.throws(()=>migrate(db,backup),/Sicherung der alten KIZUNA-Datenbank/);
  assert.equal(db.prepare('SELECT value FROM kv WHERE key=?').get('key').value,'historical value');
  assert.equal(version(db),1);
  assert.equal(fs.readFileSync(backup,'utf8'),'not a sqlite database');
 }finally{db.close();fs.rmSync(folder,{recursive:true,force:true});}
});

test('an already updated database never creates additional backup files',()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'kizuna-idempotent-'));
 const backup=path.join(folder,'backup.sqlite'),db=database();
 try{
  migrate(db);assert.equal(migrate(db,backup),2);
  assert.equal(fs.existsSync(backup),false);
 }finally{db.close();fs.rmSync(folder,{recursive:true,force:true});}
});
