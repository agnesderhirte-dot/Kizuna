/** Local receive-only mix. Never affects microphone transmission or remote screen/soundboard tracks. */
export const unit=(value:number):number=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;
export function peerVoiceVolume(globalLevel:number,peerId:string,levels:Readonly<Record<string,number>>):number{
 return unit(globalLevel)*unit(levels[peerId]??1);
}
