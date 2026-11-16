/**
 * Passive WebRTC quality diagnostics. Reads already available peer-connection
 * statistics; never changes codecs, media tracks, encoder parameters or routing.
 */
type Stat = {
 id:string;type:string;timestamp:number;kind?:string;mediaType?:string;
 bytesSent?:number;bytesReceived?:number;packetsLost?:number;packetsReceived?:number;
 jitter?:number;framesPerSecond?:number;frameWidth?:number;frameHeight?:number;
 framesDropped?:number;framesDecoded?:number;freezeCount?:number;
 roundTripTime?:number;currentRoundTripTime?:number;
 codecId?:string;mimeType?:string;selectedCandidatePairId?:string;
 localCandidateId?:string;remoteCandidateId?:string;candidateType?:string;
};
type Snapshot={timestamp:number;bytes?:number;received?:number;lost?:number;dropped?:number;decoded?:number};
const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
const positive=(value:unknown)=>finite(value)?Math.max(0,value):0;
const display=(value:unknown,unit:string)=>finite(value)?`${Math.round(value)} ${unit}`:'k. A.';
const delta=(now:number|undefined,previous:number|undefined)=>finite(now)&&finite(previous)&&now>=previous?now-previous:undefined;

export type PeerQuality={lines:string[];videoSendFps?:number;videoReceiveFps?:number;audioLossPct?:number};
export class QualityDiagnostics {
 private old=new Map<string,Snapshot>();
 measure(peerId:string,peerName:string,report:RTCStatsReport):PeerQuality{
  const stats=new Map<string,Stat>();
  report.forEach(value=>{const item=value as Stat;stats.set(item.id,item);});
  let route='Verbindung wird aufgebaut';
  for(const s of stats.values()){
   if(s.type!=='transport'||!s.selectedCandidatePairId)continue;
   const pair=stats.get(s.selectedCandidatePairId);
   if(!pair)continue;
   const local=pair.localCandidateId?stats.get(pair.localCandidateId):undefined;
   const remote=pair.remoteCandidateId?stats.get(pair.remoteCandidateId):undefined;
   route=local?.candidateType==='relay'||remote?.candidateType==='relay'?'TURN-Relay':'P2P direkt';
   if(finite(pair.currentRoundTripTime))route+=` · RTT ${display(pair.currentRoundTripTime*1000,'ms')}`;
  }
  const lines:string[]=[];
  const outcome:PeerQuality={lines};
  for(const s of stats.values()){
   const kind=s.kind||s.mediaType;
   if(!['inbound-rtp','outbound-rtp'].includes(s.type)||!kind||!['audio','video'].includes(kind))continue;
   const key=`${peerId}:${s.id}`;
   const old=this.old.get(key);
   const elapsed=old&&s.timestamp>old.timestamp?s.timestamp-old.timestamp:undefined;
   const currentBytes=s.type==='outbound-rtp'?s.bytesSent:s.bytesReceived;
   const changed=old?delta(currentBytes,old.bytes):undefined;
   const mbps=elapsed&&changed!==undefined?changed*8/elapsed/1000:undefined;
   const recv=old?delta(s.packetsReceived,old.received):undefined;
   const lost=old?delta(s.packetsLost,old.lost):undefined;
   const lossPct=recv!==undefined&&lost!==undefined&&recv+lost>0?100*lost/(recv+lost):undefined;
   this.old.set(key,{timestamp:s.timestamp,bytes:currentBytes,received:s.packetsReceived,lost:s.packetsLost,dropped:s.framesDropped,decoded:s.framesDecoded});
   const codec=s.codecId?stats.get(s.codecId)?.mimeType?.replace(/^video\/|^audio\//,''):undefined;
   const direction=s.type==='outbound-rtp'?'Senden':'Empfang';
   if(kind==='video'){
    const fps=finite(s.framesPerSecond)?Math.round(s.framesPerSecond):undefined;
    if(direction==='Senden')outcome.videoSendFps=fps;
    else outcome.videoReceiveFps=fps;
    const resolution=finite(s.frameWidth)&&finite(s.frameHeight)?`${s.frameWidth}×${s.frameHeight}`:'Auflösung k. A.';
    const drop=old?delta(s.framesDropped,old.dropped):undefined;
    const decoded=old?delta(s.framesDecoded,old.decoded):undefined;
    let suffix='';
    if(lossPct!==undefined)suffix+=` · Paketverlust ${lossPct.toFixed(1)} %`;
    if(direction==='Empfang'&&drop!==undefined&&decoded!==undefined)suffix+=` · verworfene Frames +${Math.round(drop)}`;
    lines.push(`${peerName} · Video ${direction}: ${resolution} · ${fps??'?'} FPS · ${mbps===undefined?'Bitrate wird ermittelt':mbps.toFixed(2)+' Mbit/s'}${codec?' · '+codec:''}${suffix}`);
   }else{
    if(direction==='Empfang'&&lossPct!==undefined)outcome.audioLossPct=lossPct;
    lines.push(`${peerName} · Audio ${direction}: ${codec||'Codec k. A.'}${finite(s.jitter)?' · Jitter '+(s.jitter*1000).toFixed(1)+' ms':''}${lossPct===undefined?'':' · Paketverlust '+lossPct.toFixed(1)+' %'}`);
   }
  }
  if(!lines.length)lines.push(`${peerName}: noch keine RTP-Daten`);
  lines.push(`${peerName} · Netzwerk: ${route}`);
  return outcome;
 }
 removePeer(peerId:string){for(const key of this.old.keys())if(key.startsWith(peerId+':'))this.old.delete(key);}
 clear(){this.old.clear();}
}
