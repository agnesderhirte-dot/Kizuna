const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');

const modulePromise=loadTs('src/QualityDiagnostics.ts');

function makeReport(now,videoBytes,received,lost,dropped){
 const values=[
  {id:'transport',type:'transport',timestamp:now,selectedCandidatePairId:'pair'},
  {id:'pair',type:'candidate-pair',timestamp:now,localCandidateId:'local',remoteCandidateId:'remote',currentRoundTripTime:.026},
  {id:'local',type:'local-candidate',timestamp:now,candidateType:'host'},
  {id:'remote',type:'remote-candidate',timestamp:now,candidateType:'srflx'},
  {id:'vc',type:'codec',timestamp:now,mimeType:'video/VP9'},
  {id:'ac',type:'codec',timestamp:now,mimeType:'audio/opus'},
  {id:'video-sent',type:'outbound-rtp',kind:'video',timestamp:now,codecId:'vc',bytesSent:videoBytes,frameWidth:2560,frameHeight:1440,framesPerSecond:60},
  {id:'video-in',type:'inbound-rtp',kind:'video',timestamp:now,codecId:'vc',bytesReceived:videoBytes/2,frameWidth:2560,frameHeight:1440,framesPerSecond:58,framesDropped:dropped,framesDecoded:500+Math.round(now/10),packetsReceived:received,packetsLost:lost},
  {id:'audio-in',type:'inbound-rtp',kind:'audio',timestamp:now,codecId:'ac',bytesReceived:100000+Math.round(now/3),jitter:.015,packetsReceived:received,packetsLost:lost}
 ];
 return new Map(values.map(s=>[s.id,s]));
}
test('reports actual 1440p FPS and distinguishes the initial bitrate sample',async()=>{
 const {QualityDiagnostics}=await modulePromise;
 const q=new QualityDiagnostics();
 const first=q.measure('p','Friend',makeReport(1000,1000000,100,1,0));
 assert.equal(first.videoSendFps,60);
 assert.equal(first.videoReceiveFps,58);
 assert.ok(first.lines.some(s=>s.includes('2560×1440')));
 assert.ok(first.lines.some(s=>s.includes('Bitrate wird ermittelt')));
 const next=q.measure('p','Friend',makeReport(3500,2000000,198,3,2));
 assert.ok(next.lines.some(s=>s.includes('3.20 Mbit/s')));
 assert.ok(next.lines.some(s=>s.includes('P2P direkt · RTT 26 ms')));
 assert.equal(next.audioLossPct,2);
 assert.ok(next.lines.some(s=>s.includes('Jitter 15.0 ms')));
 assert.ok(next.lines.some(s=>s.includes('verworfene Frames +2')));
});
test('protects against counters resetting and missing transport data',async()=>{
 const {QualityDiagnostics}=await modulePromise;
 const q=new QualityDiagnostics();
 q.measure('p','A',makeReport(1000,1000000,100,8,0));
 const data=q.measure('p','A',makeReport(2000,500,0,0,0));
 assert.ok(data.lines.every(s=>!s.includes('NaN')&&!s.includes('Infinity')));
 assert.ok(data.lines.every(s=>!s.includes('Paketverlust -')));
 q.removePeer('p');
 const reset=q.measure('p','A',makeReport(2500,1000,10,1,0));
 assert.ok(reset.lines.some(s=>s.includes('Bitrate wird ermittelt')));
 q.clear();
});
test('shows actual inbound audio buffering and concealment without inventing latency',async()=>{
 const {QualityDiagnostics}=await modulePromise;
 const q=new QualityDiagnostics();
 const report=(time,delay,count,concealed,samples)=>new Map([
  ['opus',{id:'opus',type:'codec',timestamp:time,mimeType:'audio/opus'}],
  ['audio',{id:'audio',type:'inbound-rtp',kind:'audio',timestamp:time,codecId:'opus',bytesReceived:time*10,packetsReceived:time,packetsLost:0,jitter:0.02,jitterBufferDelay:delay,jitterBufferEmittedCount:count,concealedSamples:concealed,totalSamplesReceived:samples}]
 ]);
 const first=q.measure('p','Other',report(1000,1,100,2,1000));
 assert.equal(first.audioPlayoutBufferMs,undefined);
 const next=q.measure('p','Other',report(2000,2.2,140,12,2000));
 assert.ok(Math.abs(next.audioPlayoutBufferMs-30)<0.01);
 assert.ok(next.lines.some(s=>s.includes('Audiopuffer 30 ms')));
 assert.ok(next.lines.some(s=>s.includes('kaschierte Audiodaten 1.0 %')));
});
test('diagnostics do not reconfigure codec or track; mic recordings are ephemeral',()=>{
 const quality=fs.readFileSync(path.join(__dirname,'../src/QualityDiagnostics.ts'),'utf8');
 const microphone=fs.readFileSync(path.join(__dirname,'../src/AudioCheck.tsx'),'utf8');
 const main=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 for(const prohibited of ['setParameters(', 'applyConstraints(', 'addTrack('])assert.ok(!quality.includes(prohibited));
 assert.ok(microphone.includes('video:false'));
 assert.ok(microphone.includes('setTimeout(')&&microphone.includes('3000'));
 assert.ok(microphone.includes('URL.revokeObjectURL'));
 assert.ok(!microphone.includes('window.vox'));
 assert.ok(main.includes('qualityRef.current.measure('));
 assert.ok(!main.includes('void m.bitrate();},2500'));
});
