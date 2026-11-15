import Peer,{type DataConnection} from 'peerjs';
import type {Settings} from './types';
export type CloudSpec={room:string;token:string;self:string;host:string;name:string};
type Link={connection:DataConnection;nonce:string;ready:boolean;name:string;sent:number;received:number;queue:Promise<void>;incoming:Promise<void>;count:number;since:number;timeout:ReturnType<typeof setTimeout>};
const encoder=new TextEncoder(),decoder=new TextDecoder();
const base64=(b:Uint8Array)=>btoa(String.fromCharCode(...b));
const bytes=(s:string)=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
export class CloudRoom {
 retry?:ReturnType<typeof setTimeout>;attempt=0;registered=false;peer:Peer;links=new Map<string,Link>();key:Promise<CryptoKey>;closed=false;
 constructor(public spec:CloudSpec,settings:Settings,public event:(e:any)=>void){
  this.key=crypto.subtle.digest('SHA-256',encoder.encode(spec.token)).then(k=>crypto.subtle.importKey('raw',k,'AES-GCM',false,['encrypt','decrypt']));
  const iceServers:RTCIceServer[]=[{urls:'stun:stun.cloudflare.com:3478'}];if(settings.turnUrl)iceServers.push({urls:settings.turnUrl,username:settings.turnUser,credential:settings.turnPassword});
  this.peer=new Peer(spec.self,{secure:true,debug:0,config:{iceServers,bundlePolicy:"max-bundle"}});
  this.peer.on('open',()=>{if(spec.self===spec.host){if(!this.registered){this.registered=true;this.event({type:'welcome',self:spec.self,peers:[]});}}else this.connectHost();});
  this.peer.on('connection',c=>{if(spec.self!==spec.host||this.links.size>=3||this.links.has(c.peer)){c.close();return;}this.bind(c);});
  this.peer.on('error',e=>{console.warn('Cloud peer error',e.type);this.event({type:'error',message:e.type==='unavailable-id'?'Dieser Raum ist bereits geöffnet. Schließe die andere Gastgeber-Instanz.':'Online-Verbindung unterbrochen. Gastgeber, Netzwerk und gegebenenfalls TURN-Zugang prüfen.'});if(spec.self!==spec.host&&['peer-unavailable','network','webrtc'].includes(e.type))this.retryHost();});
  this.peer.on('disconnected',()=>{if(!this.closed&&!this.peer.destroyed)setTimeout(()=>{if(!this.closed&&this.peer.disconnected)this.peer.reconnect();},2000);});
 }
 connectHost(){if(this.closed||this.links.has(this.spec.host))return;this.bind(this.peer.connect(this.spec.host,{reliable:true,serialization:'binary'}));}
 retryHost(){if(this.closed||this.retry||this.spec.self===this.spec.host)return;if(this.attempt>=5){this.event({type:'error',message:'Gastgeber nicht erreichbar. Erneut beitreten; bei blockierter direkter Verbindung ist ein TURN-Zugang oder VPN erforderlich.'});return;}this.event({type:'disconnected'});this.retry=setTimeout(()=>{this.retry=undefined;this.connectHost();},Math.min(15000,1000*2**this.attempt++));}
 cleanUnopened(link:Link){if(this.links.get(link.connection.peer)!==link)return;clearTimeout(link.timeout);this.links.delete(link.connection.peer);if(this.spec.self!==this.spec.host)this.retryHost();}
 bind(connection:DataConnection){
  const link:Link={connection,nonce:'',ready:false,name:'',sent:0,received:0,queue:Promise.resolve(),incoming:Promise.resolve(),count:0,since:Date.now(),timeout:setTimeout(()=>{console.warn("Cloud handshake timeout");connection.close();this.cleanUnopened(link);},20000)};
  this.links.set(connection.peer,link);
  connection.on('open',()=>{if(this.spec.self===this.spec.host){link.nonce=crypto.randomUUID();this.send(link,{type:'challenge',nonce:link.nonce});}});
  connection.on('data',raw=>{if(typeof raw!=='string'||raw.length>110000){console.warn("Cloud payload limit");connection.close();return;}if(Date.now()-link.since>10000){link.since=Date.now();link.count=0;}if(++link.count>600){console.warn("Cloud rate limit");connection.close();return;}link.incoming=link.incoming.then(()=>this.receive(link,raw)) .catch(e=>{console.warn("Cloud receive rejected:",String(e));connection.close();});});
  connection.on('close',()=>{console.warn('Cloud closed',link.ready,link.count,this.links.size);clearTimeout(link.timeout);if(this.links.get(connection.peer)!==link)return;this.links.delete(connection.peer);if(link.ready&&this.spec.self===this.spec.host){this.event({type:'left',id:connection.peer});for(const l of this.links.values())if(l.ready)this.send(l,{type:'left',id:connection.peer});}else if(this.spec.self!==this.spec.host&&!this.closed)this.retryHost();});
  connection.on('error',e=>{console.warn('Cloud connection error',e.type);connection.close();this.cleanUnopened(link);});
 }
 send(link:Link,data:unknown){link.queue=link.queue.then(async()=>{if(!link.connection.open)return;const body=JSON.stringify({room:this.spec.room,from:this.spec.self,to:link.connection.peer,sequence:++link.sent,data});if(body.length>70000)throw Error('Signal zu groß');const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await this.key,encoder.encode(body));link.connection.send(JSON.stringify({iv:base64(iv),cipher:base64(new Uint8Array(encrypted))}));}).catch(e=>{console.warn("Cloud send rejected:",String(e));link.connection.close();});}
 async receive(link:Link,raw:string){
  const packet=JSON.parse(raw);if(typeof packet.iv!=='string'||packet.iv.length!==16||typeof packet.cipher!=='string'||packet.cipher.length>100000)throw Error('Packet');
  const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(packet.iv)},await this.key,bytes(packet.cipher));const body=JSON.parse(decoder.decode(clear));
  if(body.room!==this.spec.room||body.from!==link.connection.peer||body.to!==this.spec.self||!Number.isSafeInteger(body.sequence)||body.sequence!==link.received+1)throw Error('Envelope');link.received=body.sequence;const m=body.data;if(!m||typeof m!=='object')throw Error('Message');
  const host=this.spec.self===this.spec.host;
  if(!host&&m.type==='challenge'&&typeof m.nonce==='string'&&m.nonce.length===36){link.nonce=m.nonce;this.send(link,{type:'hello',nonce:m.nonce,name:this.spec.name});return;}
  if(host&&!link.ready&&m.type==='hello'&&m.nonce===link.nonce&&typeof m.name==='string'&&m.name.trim().length>0&&m.name.length<=48){
   const peers=[{id:this.spec.self,name:this.spec.name},...[...this.links].filter(([,l])=>l.ready).map(([id,l])=>({id,name:l.name}))];link.ready=true;link.name=m.name;clearTimeout(link.timeout);this.send(link,{type:'welcome',nonce:link.nonce,self:link.connection.peer,peers});this.event({type:'joined',peer:{id:link.connection.peer,name:m.name}});for(const other of this.links.values())if(other!==link&&other.ready)this.send(other,{type:'joined',peer:{id:link.connection.peer,name:m.name}});return;
  }
  if(!host&&m.type==='welcome'&&m.nonce===link.nonce&&m.self===this.spec.self&&Array.isArray(m.peers)&&m.peers.length<=3&&m.peers.every((p:any)=>typeof p.id==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(p.id)&&typeof p.name==='string'&&p.name.length<=48)){link.ready=true;this.attempt=0;clearTimeout(this.retry);this.retry=undefined;clearTimeout(link.timeout);this.event(m);return;}
  if(!link.ready)throw Error('Not authorized');
  if(host&&m.type==='signal'&&typeof m.to==='string'&&m.data&&JSON.stringify(m.data).length<60000){const data={type:'signal',from:link.connection.peer,data:m.data};if(m.to===this.spec.self)this.event(data);else{const target=this.links.get(m.to);if(target?.ready)this.send(target,data);}return;}
  if(!host&&['signal','joined','left'].includes(m.type)){if(m.type==='joined'&&(!m.peer||typeof m.peer.id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(m.peer.id)||typeof m.peer.name!=='string'||m.peer.name.length>48))throw Error('Peer');this.event(m);return;}
  throw Error('Unknown message');
 }
 async signal(message:{to:string;data:unknown}){if(this.spec.self===this.spec.host){const link=this.links.get(message.to);if(link?.ready)this.send(link,{type:'signal',from:this.spec.self,data:message.data});}else{const link=this.links.get(this.spec.host);if(link?.ready)this.send(link,{type:'signal',...message});}}
 close(){this.closed=true;clearTimeout(this.retry);for(const link of this.links.values())clearTimeout(link.timeout);this.peer.destroy();this.links.clear();}
}



