/** Lightweight microphone-level activity indicator, not speech recognition.
 * Never encodes or records audio. Active only while voice capture is enabled.
 */
export class SpeechGate {
 active=false;
 private consecutive=0;
 private lastLoud=-Infinity;
 constructor(private thresholdDb=-43, private hangoverMs=420){}
 sample(db:number,now:number):boolean {
  const loud=Number.isFinite(db)&&db>=this.thresholdDb;
  this.consecutive=loud?this.consecutive+1:0;
  if(loud)this.lastLoud=now;
  if(!this.active&&this.consecutive>=2)this.active=true;
  if(this.active&&!loud&&now-this.lastLoud>this.hangoverMs)this.active=false;
  return this.active;
 }
 reset(){this.active=false;this.consecutive=0;this.lastLoud=-Infinity;}
}
export class VoiceActivityMonitor {
 private context?:AudioContext;
 private source?:MediaStreamAudioSourceNode;
 private analyser?:AnalyserNode;
 private samples?:Float32Array<ArrayBuffer>;
 private timer?:ReturnType<typeof setInterval>;
 private gate=new SpeechGate();
 private enabled=true;
 private previous=false;
 private lastHeartbeat=0;
 constructor(private stream:MediaStream,private onActivity:(active:boolean)=>void){}
 async start():Promise<void>{
  if(this.context)return;
  const context=new AudioContext();
  this.context=context;
  try{
   const source=context.createMediaStreamSource(this.stream);
   const analyser=context.createAnalyser();
   analyser.fftSize=1024;
   analyser.smoothingTimeConstant=0.2;
   source.connect(analyser);
   this.source=source;
   this.analyser=analyser;
   this.samples=new Float32Array(new ArrayBuffer(analyser.fftSize*4));
   await context.resume();
   this.timer=setInterval(()=>this.sample(),100);
  }catch(error){this.stop();throw error;}
 }
 private sample(){
  if(!this.enabled||!this.analyser||!this.samples)return;
  const track=this.stream.getAudioTracks()[0];
  if(!track||track.readyState!=='live'||!track.enabled){this.emit(false);return;}
  this.analyser.getFloatTimeDomainData(this.samples);
  let sum=0;
  for(let i=0;i<this.samples.length;i++)sum+=this.samples[i]*this.samples[i];
  const db=20*Math.log10(Math.max(1e-6,Math.sqrt(sum/this.samples.length)));
  this.emit(this.gate.sample(db,performance.now()));
 }
 private emit(active:boolean){
  const now=performance.now();
  if(active===this.previous&&(!active||now-this.lastHeartbeat<1500))return;
  this.previous=active;
  this.lastHeartbeat=now;
  this.onActivity(active);
 }
 setEnabled(enabled:boolean){
  this.enabled=enabled;
  if(!enabled){this.gate.reset();this.emit(false);}
 }
 stop(){
  if(this.timer)clearInterval(this.timer);
  this.timer=undefined;
  this.gate.reset();
  this.emit(false);
  this.source?.disconnect();
  this.analyser?.disconnect();
  this.source=undefined;
  this.analyser=undefined;
  this.samples=undefined;
  const context=this.context;
  this.context=undefined;
  if(context)void context.close().catch(()=>{});
 }
}
