const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const pkg=JSON.parse(read('package.json'));

test('unreleased feature branch has a newer version while retaining existing installed application identity',()=>{
 assert.equal(pkg.version,'0.4.0');
 assert.equal(pkg.build.appId,'de.voxrally.desktop');
 assert.equal(pkg.build.win.executableName,'VoxRally');
 assert.ok(pkg.build.protocols.some(p=>p.schemes.includes('voxrally')));
 assert.equal(pkg.build.nsis.deleteAppDataOnUninstall,false);
 const main=read('desktop/main.cjs');
 assert.ok(main.includes("path.join(app.getPath('appData'),'VoxRally')"));
 assert.ok(main.includes("path.join(app.getPath('userData'),'voxrally.sqlite')"));
});

test('central updates remain disabled without verified signing identity and explicit user consent',()=>{
 const channel=JSON.parse(read('desktop/release-channel.json'));
 assert.equal(channel.enabled,false);
 assert.equal(channel.certificateThumbprint,'');
 const updater=read('desktop/central-updater.cjs');
 assert.ok(updater.includes('updater.autoDownload=false'));
 assert.ok(updater.includes('updater.autoInstallOnAppQuit=false'));
 assert.ok(updater.includes('if(!validConfig(config))'));
 assert.ok(updater.includes('verifyInstaller(file,config.certificateThumbprint)'));
});

test('migration stays transactional and never overwrites an old user database',()=>{
 const migrations=read('desktop/migrations.cjs');
 assert.ok(migrations.includes("db.exec('BEGIN IMMEDIATE')"));
 assert.ok(migrations.includes("db.exec('COMMIT')"));
 assert.ok(migrations.includes("db.exec('ROLLBACK')"));
 assert.ok(migrations.includes('verifySchema(db)'));
});
