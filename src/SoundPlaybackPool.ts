/** Releases owned blob URLs on natural end, manual stop, errors, or leaving a room. */
export class SoundPlaybackPool {
 private clips=new Map<HTMLAudioElement,string>();
 constructor(private revoke:(url:string)=>void=(url)=>URL.revokeObjectURL(url)){}
 add(audio:HTMLAudioElement,url:string){
  this.remove(audio);
  this.clips.set(audio,url);
  audio.onended=()=>this.remove(audio);
  audio.onerror=()=>this.remove(audio);
 }
 has(audio:HTMLAudioElement){return this.clips.has(audio);}
 remove(audio:HTMLAudioElement){
  const url=this.clips.get(audio);
  if(!url)return;
  this.clips.delete(audio);
  audio.onended=null;audio.onerror=null;
  audio.pause();
  audio.removeAttribute('src');
  this.revoke(url);
 }
 stopAll(){for(const audio of this.clips.keys())this.remove(audio);}
 get size(){return this.clips.size;}
}
