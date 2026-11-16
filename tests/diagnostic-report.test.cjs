const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const reportPromise=loadTs('src/diagnostic-report.ts');

test('diagnostic report contains only whitelisted measurements, never secrets or chat',async()=>{
 const {buildDiagnosticReport}=await reportPromise;
 const settings={resolution:'1440',fps:'60',profile:'motion',bitrate:20,turnPassword:'SECRET-PASSWORD',turnUrl:'turns:private',background:'PRIVATE-ASSET'};
 const report=buildDiagnosticReport('0.3.2',settings,['Freund · Video Empfang: 2560×1440 · 60 FPS','Freund · Audio Empfang: Jitter 15 ms'],Date.UTC(2026,10,16));
 assert.match(report,/1440/);
 assert.match(report,/60 FPS/);
 assert.match(report,/Jitter 15 ms/);
 assert.match(report,/Version: 0.3.2/);
 for(const secret of ['SECRET-PASSWORD','turns:private','PRIVATE-ASSET'])assert.ok(!report.includes(secret));
});
test('diagnostics report remains bounded and sanitizes control chars',async()=>{
 const {buildDiagnosticReport}=await reportPromise;
 const report=buildDiagnosticReport('version',{resolution:'native',fps:'30',profile:'detail',bitrate:12},Array(300).fill('someone\n\r\t'+('x'.repeat(300))));
 assert.ok(report.length<=11000);
 assert.ok(!report.includes('someone\n'));
 assert.ok(!report.includes('Infinity'));
});
test('copy button delegates to trusted bounded Electron IPC, not to a telemetry service',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const desktop=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const preload=fs.readFileSync(path.join(__dirname,'../desktop/preload.cjs'),'utf8');
 assert.ok(app.includes('buildDiagnosticReport(APP_VERSION,settings,stats)'));
 assert.ok(app.includes('window.vox.copyDiagnostics(report)'));
 assert.ok(desktop.includes("handle('copyDiagnostics',value=>"));
 assert.ok(desktop.includes('z.string().min(1).max(12000)'));
 assert.ok(preload.includes("'copyDiagnostics'"));
});
