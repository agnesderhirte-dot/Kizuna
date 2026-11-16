import type {PeerQuality} from './QualityDiagnostics';

type Counts={audio:number;video:number;latency:number};
const fresh=():Counts=>({audio:0,video:0,latency:0});
/** Passive advice: three consecutive abnormal samples; no automatic stream reconfiguration. */
export class QualityAdvisor{
 private counts=new Map<string,Counts>();
 assess(peerId:string,q:PeerQuality):string|undefined{
  const next=this.counts.get(peerId)||fresh();
  const hasAudio=q.audioLossPct!==undefined||q.audioPlayoutBufferMs!==undefined;
  const hasVideo=q.videoLossPct!==undefined;
  const hasLatency=q.roundTripMs!==undefined;
  if(hasAudio){
   const bad=(q.audioLossPct!==undefined&&q.audioLossPct>=4)||(q.audioPlayoutBufferMs!==undefined&&q.audioPlayoutBufferMs>=150);
   next.audio=bad?Math.min(3,next.audio+1):0;
  }
  if(hasVideo)next.video=(q.videoLossPct!==undefined&&q.videoLossPct>=5)?Math.min(3,next.video+1):0;
  if(hasLatency)next.latency=(q.roundTripMs!==undefined&&q.roundTripMs>=250)?Math.min(3,next.latency+1):0;
  this.counts.set(peerId,next);
  if(next.audio>=3)return 'Audio wiederholt gestört: Ausgabegerät prüfen, andere Uploads pausieren und Verbindung testen.';
  if(next.video>=3)return 'Videopakete gehen wiederholt verloren: geringere Bitrate oder 1080p-Profil testen.';
  if(next.latency>=3)return 'Netzwerklatenz wiederholt hoch: direktes Netzwerk statt VPN/TURN prüfen, sofern möglich.';
  return undefined;
 }
 forget(peerId:string){this.counts.delete(peerId);}
 clear(){this.counts.clear();}
}
