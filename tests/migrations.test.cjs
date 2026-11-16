const test=require('node:test');
const assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
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
