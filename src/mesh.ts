import type {Chat,Settings} from './types';
import {isAllowedReaction} from './reactions';
export type SharedProfile={name:string;photo:string;bio:string;game:string};
/** Correct for one-way network transit when a recent ping/pong clock estimate exists. */
export function soundStartDelay(now:number,at:number,offset:number,lastSync:number,fallback:number|undefined):number|null{
 if(!Number.isFinite(now)||!Number.isFinite(at)||!Number.isFinite(offset))return null;
 if(lastSync>0&&lastSync<=now&&now-lastSync<90000){
  const delta=at-offset-now;
  return delta < -1000||delta>2000?null:Math.max(0,delta);
 }
 if(fallback!==undefined&&Number.isInteger(fallback)&&fallback>=0&&fallback<=500)return fallback;
 // Legacy senders may not include relative timing. Play promptly rather than
 // trusting clocks that have never been synchronized.
 return 0;
}

/** Filter signaling input before touching the browser ICE state. */
export function validIceCandidate(raw:unknown):raw is RTCIceCandidateInit{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const c=raw as Record<string,unknown>;
 return typeof c.candidate==='string'&&c.candidate.length<=8192
  &&(c.sdpMid==null||(typeof c.sdpMid==='string'&&c.sdpMid.length<=128))
  &&(c.sdpMLineIndex==null||(Number.isInteger(c.sdpMLineIndex)&&Number(c.sdpMLineIndex)>=0&&Number(c.sdpMLineIndex)<=128))
  &&(c.usernameFragment==null||(typeof c.usernameFragment==='string'&&c.usernameFragment.length<=256));
}

type Peer={profile?:SharedProfile;incoming:Promise<void>;pendingSignals:number;pendingSignalBytes:number;clockObservedAt:number;lastPingAt:number;pingTimer?:ReturnType<typeof setInterval>;retry?:ReturnType<typeof setTimeout>;restarts:number;id:string;name:string;pc:RTCPeerConnection;dc?:RTCDataChannel;updatesDc?:RTCDataChannel;making:boolean;answerPending:boolean;ignore:boolean;candidates:RTCIceCandidateInit[];streams:Map<string,MediaStream>;labels:Record<string,string>;count:number;since:number;chatCount:number;soundAt:number;soundTransferAt:number;soundAck:boolean;readySounds:Set<string>;offeredSounds?:Set<string>;pendingSoundReady:Map<string,{resolve:(ok:boolean)=>void;timeout:ReturnType<typeof setTimeout>}>;offset:number;speaking:boolean;speechTimeout?:ReturnType<typeof setTimeout>;reactionStart:number;reactionCount:number;transfer?:{hash:string;mime:string;size:number;parts:string[];received:number;expires:number}};
export type Remote={peer:string;name:string;stream:MediaStream;kind:string};
export class Mesh {
 peers=new Map<string,Peer>();profile:SharedProfile={name:'Spieler',photo:'',bio:'',game:''};self='';local=new Map<string,MediaStream>();sounds=new Map<string,Blob>();onChange=()=>{};onSpeaking=()=>{};localSpeaking=false;onChat=(m:Chat)=>{};onError=(s:string)=>{};onSound=(_blob:Blob,_peerId?:string)=>{};onReaction=(_id:string,_name:string,_emoji:string)=>{};private localReactionStart=0;private localReactionCount=0;private playbackTimers=new Set<ReturnType<typeof setTimeout>>();
 onUpdateChannel=(id:string,name:string,channel:RTCDataChannel)=>{};
 constructor(public settings:Settings){this.profile={name:settings.name||'Spieler',photo:'',bio:settings.profileBio||'',game:settings.favoriteGame||''};}
 transport:(message:{to:string;data:unknown})=>Promise<unknown>=(message)=>window.vox.signal(message);
 async signal(id:string,data:any){const payload=data.description?{description:{type:data.description.type,sdp:data.description.sdp}}:data;await this.transport({to:id,data:payload}).catch(()=>this.onError('Signaling-Nachricht konnte nicht gesendet werden'));}
 add(id:string,name:string,initiator:boolean){
  if(this.peers.has(id))return;
  const iceServers:RTCIceServer[]=[{urls:'stun:stun.cloudflare.com:3478'}];if(this.settings.turnUrl)iceServers.push({urls:this.settings.turnUrl,username:this.settings.turnUser,credential:this.settings.turnPassword});
  const pc=new RTCPeerConnection({iceServers,bundlePolicy:"max-bundle"});const p:Peer={incoming:Promise.resolve(),pendingSignals:0,pendingSignalBytes:0,clockObservedAt:0,lastPingAt:0,restarts:0,id,name,pc,making:false,answerPending:false,ignore:false,candidates:[],streams:new Map(),labels:{},count:0,chatCount:0,since:Date.now(),soundAt:0,soundTransferAt:0,soundAck:false,readySounds:new Set(),offeredSounds:new Set(),pendingSoundReady:new Map(),offset:0,speaking:false,reactionStart:0,reactionCount:0};this.peers.set(id,p);
  pc.onicecandidate=e=>{if(e.candidate)this.signal(id,{candidate:e.candidate.toJSON()});};
  // Let the joining peer offer first, so the initial offer always includes SCTP.
  // A media-only offer can otherwise roll back its data channels in Chromium.
  pc.onnegotiationneeded=async()=>{if(!initiator&&!pc.remoteDescription)return;try{p.making=true;await pc.setLocalDescription();await this.signal(id,{description:pc.localDescription});}catch{this.onError('Medienverhandlung fehlgeschlagen');}finally{p.making=false;}};
  pc.ontrack=e=>{const stream=e.streams[0];if(!stream)return;if(!p.streams.has(stream.id)&&p.streams.size>=8){e.track.stop();return;}p.streams.set(stream.id,stream);stream.onremovetrack=()=>{if(!stream.getTracks().length)p.streams.delete(stream.id);this.onChange();};e.track.onended=()=>this.onChange();this.onChange();};
  pc.onconnectionstatechange=()=>{this.onChange();console.info('RTC state',pc.connectionState,pc.iceConnectionState);if(pc.connectionState==='connected'){clearTimeout(p.retry);p.retry=undefined;p.restarts=0;void this.bitrate().catch(()=>{});}else if(['failed','disconnected'].includes(pc.connectionState))this.recover(p,pc.connectionState==='failed'?1000:5000);};
  pc.onicecandidateerror=e=>{if(e.errorCode===701)console.warn('ICE server unreachable; no relay route confirmed');};
  this.recover(p,25000);
  pc.ondatachannel=e=>{
   const channel=e.channel;
   if(channel.label==='voxrally-updates-v1'){
    if(p.updatesDc&&p.updatesDc.readyState!=='closed'){channel.close();return;}
    p.updatesDc=channel;channel.addEventListener('close',()=>{if(p.updatesDc===channel)p.updatesDc=undefined;},{once:true});
    this.onUpdateChannel(id,name,channel);
   }else if(channel.label==='voxrally-v1'){
    if(p.dc&&p.dc.readyState!=='closed'){channel.close();return;}
    this.bind(p,channel);
   }else channel.close();
  };
  if(initiator){this.bind(p,pc.createDataChannel('voxrally-v1',{ordered:true}));p.updatesDc=pc.createDataChannel('voxrally-updates-v1',{ordered:true});this.onUpdateChannel(id,name,p.updatesDc);}
  for(const stream of this.local.values())for(const track of stream.getTracks())pc.addTrack(track,stream);
  this.onChange();void this.bitrate().catch(()=>{});
 }
 recover(p:Peer,delay:number){if(p.retry||this.peers.get(p.id)!==p)return;p.retry=setTimeout(()=>{p.retry=undefined;if(this.peers.get(p.id)!==p||['connected','closed'].includes(p.pc.connectionState))return;if(p.restarts++>=3){this.onError('Medienverbindung unterbrochen. Einladung erneut öffnen; falls es wieder scheitert, TURN/VPN und Netzwerk prüfen.');return;}console.warn('RTC ICE restart',p.restarts,p.pc.iceConnectionState);p.pc.restartIce();this.recover(p,15000);},delay);}
 receive(id:string,data:unknown):Promise<void>{
  const p=this.peers.get(id);
  if(!p)return Promise.resolve();
  let size=0;
  try{size=JSON.stringify(data)?.length||0;}catch{return Promise.resolve();}
  if(size<2||size>60000||p.pendingSignals>=128||p.pendingSignalBytes+size>512*1024){
   this.onError('Zu viele Signaling-Nachrichten von einem Teilnehmer. Seine Verbindung wurde getrennt.');
   this.remove(id);
   return Promise.resolve();
  }
  p.pendingSignals++;p.pendingSignalBytes+=size;
  const pending=p.incoming.then(()=>this.receiveOrdered(p,data)).catch(error=>{
   this.onError('Signaling konnte nicht verarbeitet werden: '+(error instanceof Error?error.name:'Error'));
  }).finally(()=>{
   p.pendingSignals=Math.max(0,p.pendingSignals-1);
   p.pendingSignalBytes=Math.max(0,p.pendingSignalBytes-size);
  });
  p.incoming=pending;
  return pending;
 }
 async receiveOrdered(p:Peer,data:any){if(this.peers.get(p.id)!==p||!data||typeof data!=='object')return;const pc=p.pc;const id=p.id;
  try{if(data.description){const d=data.description;if(!['offer','answer'].includes(d.type)||typeof d.sdp!=='string'||d.sdp.length>58000)return;const collision=d.type==='offer'&&(p.making||(pc.signalingState!=='stable'&&!p.answerPending));p.ignore=this.self.localeCompare(id)<0&&collision;if(p.ignore)return;p.answerPending=d.type==='answer';await pc.setRemoteDescription(d);p.answerPending=false;for(const c of p.candidates)await pc.addIceCandidate(c);p.candidates=[];if(d.type==='offer'){await pc.setLocalDescription();await this.signal(id,{description:pc.localDescription});}}
   else if(data.candidate&&!p.ignore&&validIceCandidate(data.candidate)){if(pc.remoteDescription)await pc.addIceCandidate(data.candidate);else if(p.candidates.length<128)p.candidates.push(data.candidate);}
  }catch(e){if(!p.ignore){console.warn('RTC negotiation failed',e instanceof Error?e.name:'Error',pc.signalingState);this.onError('Medienverhandlung fehlgeschlagen. Verbindung wird erneut versucht.');this.recover(p,1000);}}finally{p.answerPending=false;}
 }
 bind(p:Peer,dc:RTCDataChannel){p.dc=dc;dc.bufferedAmountLowThreshold=65536;dc.onopen=()=>{if(this.peers.get(p.id)!==p||p.dc!==dc)return;this.send(p,{type:'labels',labels:this.labels()});const ping=()=>{
    const time=Date.now();
    if(this.send(p,{type:'ping',time}))p.lastPingAt=time;
   };
   ping();
   clearInterval(p.pingTimer);
   p.pingTimer=setInterval(()=>{
    if(this.peers.get(p.id)!==p||p.dc!==dc||dc.readyState!=='open'){clearInterval(p.pingTimer);p.pingTimer=undefined;return;}
    ping();
   },30000);
   this.send(p,{type:'capabilities',soundAck:true});this.send(p,{type:'profile',...this.profile});if(this.localSpeaking)this.send(p,{type:'speaking',active:true});this.onChange();};dc.onmessage=e=>{
   if(this.peers.get(p.id)!==p||p.dc!==dc)return;
   void this.data(p,e.data).catch(()=>this.onError('Ungültige Peer-Daten verworfen'));
  };
  dc.onclose=()=>{if(this.peers.get(p.id)!==p||p.dc!==dc)return;clearInterval(p.pingTimer);p.pingTimer=undefined;clearTimeout(p.speechTimeout);p.speaking=false;this.onSpeaking();this.onChange();};
 }
 labels(){return Object.fromEntries([...this.local].map(([kind,s])=>[s.id,kind]));}
 send(p:Peer,m:Record<string,unknown>):boolean{const text=JSON.stringify({v:1,...m});if(p.dc?.readyState!=='open'||p.dc.bufferedAmount>=512*1024||text.length>20000)return false;p.dc.send(text);return true;}
 broadcast(m:Record<string,unknown>){for(const p of this.peers.values())this.send(p,m);}
 async data(p:Peer,raw:unknown){
  if(typeof raw!=='string'||raw.length>20000)return;const now=Date.now();if(now-p.since>1000){p.count=0;p.chatCount=0;p.since=now;}if(++p.count>150){p.dc?.close();return;}
  const m=JSON.parse(raw);if(!m||m.v!==1)return;
  if(m.type==='labels'&&m.labels&&typeof m.labels==='object'){const entries=Object.entries(m.labels);if(entries.length<=4&&entries.every(([k,v])=>k.length<=80&&['voice','screen','camera'].includes(String(v)))){p.labels=m.labels;for(const id of p.streams.keys())if(!(id in p.labels))p.streams.delete(id);this.onChange();}}
  else if(m.type==='profile'&&typeof m.name==='string'&&m.name.trim().length>0&&m.name.length<=48&&typeof m.photo==='string'&&typeof m.bio==='string'&&typeof m.game==='string'
   &&m.bio.length<=160&&m.game.length<=90&&m.photo.length<=17000
   &&(m.photo===''||/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(m.photo))){
   p.profile={name:m.name,photo:m.photo,bio:m.bio,game:m.game};this.onChange();
  }
  else if(m.type==='speaking'&&typeof m.active==='boolean'){
   clearTimeout(p.speechTimeout);
   if(p.speaking!==m.active){p.speaking=m.active;this.onSpeaking();}
   if(m.active)p.speechTimeout=setTimeout(()=>{p.speechTimeout=undefined;if(this.peers.get(p.id)===p&&p.speaking){p.speaking=false;this.onSpeaking();}},3600);
  }
  else if(m.type==='reaction'&&isAllowedReaction(m.emoji)){
   if(now-p.reactionStart>=3000){p.reactionStart=now;p.reactionCount=0;}
   if(++p.reactionCount<=6)this.onReaction(p.id,p.name,m.emoji);
  }
  else if(m.type==='chat'&&++p.chatCount<=10&&typeof m.text==='string'&&m.text.length>0&&m.text.length<=4000&&typeof m.id==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(m.id)){this.onChat({id:m.id,text:m.text,sender:p.id,name:p.name,time:now});}
  else if(m.type==='capabilities'&&m.soundAck===true)p.soundAck=true;
  else if(m.type==='ping'&&Number.isFinite(m.time))this.send(p,{type:'pong',time:m.time,remote:now});
  else if(m.type==='pong'&&Number.isFinite(m.time)&&m.time===p.lastPingAt&&Number.isFinite(m.remote)&&now-m.time>=0&&now-m.time<10000){p.offset=m.remote-(m.time+now)/2;p.clockObservedAt=now;}
  else if(m.type==='sound-start'&&typeof m.hash==='string'&&/^[0-9a-f]{64}$/.test(m.hash)&&['audio/wav','audio/mpeg','audio/ogg','audio/flac'].includes(m.mime)&&Number.isInteger(m.size)&&m.size>0&&m.size<=10*1024*1024){if(this.sounds.has(m.hash)){this.cacheSound(m.hash,this.sounds.get(m.hash)!);this.send(p,{type:'sound-ready',hash:m.hash});return;}if(now-p.soundTransferAt<800)return;p.soundTransferAt=now;p.transfer={hash:m.hash,mime:m.mime,size:m.size,parts:[],received:0,expires:now+60000};}
  else if(m.type==='sound-part'&&p.transfer){const t=p.transfer;if(now>t.expires||typeof m.bytes!=='string'||m.bytes.length>16384||!/^[A-Za-z0-9+/]*={0,2}$/.test(m.bytes)){p.transfer=undefined;return;}t.received+=atob(m.bytes).length;if(t.received>t.size){p.transfer=undefined;return;}t.parts.push(m.bytes);}
  else if(m.type==='sound-end'&&p.transfer){const t=p.transfer;p.transfer=undefined;if(t.received!==t.size)return;const bytes=new Uint8Array(t.size);let pos=0;for(const part of t.parts){const b=atob(part);for(let i=0;i<b.length;i++)bytes[pos++]=b.charCodeAt(i);}const hash=await digest(bytes);if(hash!==t.hash)return;this.cacheSound(hash,new Blob([bytes],{type:t.mime}));this.send(p,{type:'sound-ready',hash});}
  else if(m.type==='sound-ready'&&typeof m.hash==='string'&&/^[0-9a-f]{64}$/.test(m.hash)&&p.offeredSounds?.has(m.hash)){
   if(p.readySounds.size>=32&&!p.readySounds.has(m.hash))p.readySounds.delete(p.readySounds.values().next().value!);
   p.readySounds.add(m.hash);
   const pending=p.pendingSoundReady.get(m.hash);
   if(pending){clearTimeout(pending.timeout);p.pendingSoundReady.delete(m.hash);pending.resolve(true);}
  }
  else if(m.type==='sound-missing'&&typeof m.hash==='string'&&/^[0-9a-f]{64}$/.test(m.hash))p.readySounds.delete(m.hash);
  else if(m.type==='sound-play'&&typeof m.hash==='string'&&/^[0-9a-f]{64}$/.test(m.hash)&&Number.isFinite(m.at)){
   const b=this.sounds.get(m.hash);
   if(!b){this.send(p,{type:'sound-missing',hash:m.hash});return;}
   if(now-p.soundAt<500)return;
   p.soundAt=now;
   const delay=soundStartDelay(now,m.at,p.offset,p.clockObservedAt,Number.isInteger(m.delayMs)?m.delayMs:undefined);
   if(delay===null)return;
   const timer=setTimeout(()=>{this.playbackTimers.delete(timer);if(this.peers.get(p.id)===p)this.onSound(b,p.id);},Math.max(0,delay));
   this.playbackTimers.add(timer);
  }
 }
 /** Limit the in-memory peer sound cache to 24 MiB and 8 clips. */
 cacheSound(hash:string,blob:Blob){
  if(blob.size>10*1024*1024)throw Error('Sound zu groß');
  if(this.sounds.has(hash))this.sounds.delete(hash);
  let total=[...this.sounds.values()].reduce((sum,item)=>sum+item.size,0);
  while(this.sounds.size>=8||total+blob.size>24*1024*1024){
   const oldest=this.sounds.keys().next().value;
   if(!oldest)break;
   const previous=this.sounds.get(oldest);
   this.sounds.delete(oldest);
   total-=previous?.size||0;
  }
  this.sounds.set(hash,blob);
 }
 sendReaction(emoji:string):boolean{if(!isAllowedReaction(emoji))return false;const now=Date.now();if(now-this.localReactionStart>=3000){this.localReactionStart=now;this.localReactionCount=0;}if(++this.localReactionCount>6)return false;this.broadcast({type:'reaction',emoji});return true;}
 setProfile(profile:SharedProfile){
  if(!profile.name.trim()||profile.name.length>48||profile.bio.length>160||profile.game.length>90||profile.photo.length>17000||!(profile.photo===''||/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(profile.photo)))throw Error('Ungültiges Profilbild');
  this.profile={...profile};this.broadcast({type:'profile',...this.profile});this.onChange();
 }
 setSpeaking(active:boolean){if(this.localSpeaking!==active){this.localSpeaking=active;this.onSpeaking();}this.broadcast({type:'speaking',active});}
 setLocal(kind:string,stream?:MediaStream){if(kind==='voice'&&!stream)this.setSpeaking(false);const old=this.local.get(kind);for(const p of this.peers.values()){if(old)for(const sender of p.pc.getSenders())if(sender.track&&old.getTracks().includes(sender.track))p.pc.removeTrack(sender);if(stream)for(const t of stream.getTracks())p.pc.addTrack(t,stream);}old?.getTracks().forEach(t=>t.stop());if(stream)this.local.set(kind,stream);else this.local.delete(kind);this.broadcast({type:'labels',labels:this.labels()});this.onChange();void this.bitrate().catch(()=>{});}
 async bitrate(){for(const p of this.peers.values())for(const sender of p.pc.getSenders()){
 if(sender.track?.kind!=='video')continue;
 const params=sender.getParameters();if(!params.encodings.length)continue;
 const camera=this.local.get('camera')?.getVideoTracks().includes(sender.track);
 const maxBitrate=(camera?this.settings.cameraBitrate:this.settings.bitrate)*1e6;
 const degradationPreference=camera?'balanced':this.settings.profile==='detail'?'maintain-resolution':this.settings.profile==='motion'?'maintain-framerate':'balanced';
 if(params.degradationPreference===degradationPreference&&params.encodings.every(e=>e.maxBitrate===maxBitrate))continue;
 params.degradationPreference=degradationPreference;for(const e of params.encodings)e.maxBitrate=maxBitrate;
 await sender.setParameters(params).catch(()=>{});
 }}
 async sound(blob:Blob){
  if(blob.size<1||blob.size>10*1024*1024||!['audio/wav','audio/mpeg','audio/ogg','audio/flac'].includes(blob.type))throw Error('Soundformat oder Größe nicht zulässig.');
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const hash=await digest(bytes);
  const targets=[...this.peers.values()].filter(p=>p.dc?.readyState==='open');
  const results=await Promise.allSettled(targets.map(async p=>{
   if(p.readySounds.has(hash))return p;
   if(!p.offeredSounds)p.offeredSounds=new Set();
   if(p.offeredSounds.size>=32&&!p.offeredSounds.has(hash))p.offeredSounds.delete(p.offeredSounds.values().next().value!);
   p.offeredSounds.add(hash);
   if(!this.send(p,{type:'sound-start',hash,mime:blob.type,size:bytes.length}))throw Error('Soundübertragung nicht verfügbar.');
   for(let pos=0;pos<bytes.length;pos+=9000){
    await this.drain(p);
    if(!this.send(p,{type:'sound-part',bytes:btoa(String.fromCharCode(...bytes.subarray(pos,pos+9000)))}))throw Error('Sounddaten konnten nicht gesendet werden.');
    // Keep control messages responsive and respect the existing inbound flood limit.
    await new Promise(r=>setTimeout(r,10));
   }
   await this.drain(p);
   // A peer may already have the asset (e.g. received from another friend)
   // and acknowledge sound-start before the transfer finishes.
   const acknowledged=p.readySounds.has(hash)?Promise.resolve(true):new Promise<boolean>(resolve=>{
    const timeout=setTimeout(()=>{p.pendingSoundReady.delete(hash);resolve(false);},p.soundAck?2500:600);
    p.pendingSoundReady.set(hash,{resolve,timeout});
   });
   if(!this.send(p,{type:'sound-end'})){
    const pending=p.pendingSoundReady.get(hash);if(pending){clearTimeout(pending.timeout);p.pendingSoundReady.delete(hash);pending.resolve(false);}
    throw Error('Soundabschluss konnte nicht gesendet werden.');
   }
   const ready=await acknowledged;
   if(!ready&&p.soundAck)throw Error('Sound wurde beim Empfänger nicht bestätigt.');
   return p;
  }));
  const at=Date.now()+160;
  for(let i=0;i<targets.length;i++){
   if(results[i].status==='fulfilled'&&targets[i].dc?.readyState==='open')
    this.send(targets[i],{type:'sound-play',hash,at,delayMs:160});
  }
  if(results.some(r=>r.status==='rejected'))this.onError('Mindestens ein Teilnehmer konnte den Sound nicht vollständig empfangen.');
  const timer=setTimeout(()=>{this.playbackTimers.delete(timer);this.onSound(blob);},160);
  this.playbackTimers.add(timer);
 }
 async drain(p:Peer){const start=Date.now();while(p.dc?.readyState==='open'&&p.dc.bufferedAmount>65536){if(Date.now()-start>10000)throw Error('Dateiübertragung zu langsam');await new Promise(r=>setTimeout(r,25));}if(p.dc?.readyState!=='open')throw Error('Peer getrennt');}
 remotes():Remote[]{return [...this.peers.values()].flatMap(p=>[...p.streams.values()].filter(s=>s.getTracks().some(t=>t.readyState==='live')).map(stream=>({peer:p.id,name:p.name,stream,kind:p.labels[stream.id]||'media'})));}
 remove(id:string){const p=this.peers.get(id);clearTimeout(p?.retry);clearTimeout(p?.speechTimeout);clearInterval(p?.pingTimer);p?.dc?.close?.();p?.updatesDc?.close?.();p?.streams?.clear();p?.readySounds?.clear();p?.offeredSounds?.clear();p?.transfer&&(p.transfer=undefined);if(p?.pendingSoundReady)for(const item of p.pendingSoundReady.values()){clearTimeout(item.timeout);item.resolve(false);}p?.pendingSoundReady?.clear();p?.pc.close();this.peers.delete(id);this.onChange();}
 clear(){for(const id of this.peers.keys())this.remove(id);this.self='';}
 close(){this.setSpeaking(false);for(const timer of this.playbackTimers)clearTimeout(timer);this.playbackTimers.clear();this.clear();for(const s of this.local.values())s.getTracks().forEach(t=>t.stop());this.local.clear();this.sounds.clear();}
}
async function digest(bytes:Uint8Array<ArrayBuffer>){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}

