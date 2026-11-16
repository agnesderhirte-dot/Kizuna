/** Original synthesized KIZUNA cues. No external audio or copyrighted recordings. */
const sampleRate=22050;
const tracks=[
 {id:'goal',name:'KIZUNA – Tor-Signal',duration:1.65},
 {id:'whistle',name:'KIZUNA – Anpfiff',duration:.9},
 {id:'clap',name:'KIZUNA – Stadionapplaus',duration:1.5}
];
const clamp=x=>Math.max(-1,Math.min(1,x));
function synth(id){
 const def=tracks.find(x=>x.id===id);if(!def)throw Error('Unbekannter Sound');
 const frames=Math.round(sampleRate*def.duration);
 const output=Buffer.alloc(44+frames*2);
 output.write('RIFF',0,'ascii');output.writeUInt32LE(output.length-8,4);
 output.write('WAVEfmt ',8,'ascii');output.writeUInt32LE(16,16);
 output.writeUInt16LE(1,20);output.writeUInt16LE(1,22);
 output.writeUInt32LE(sampleRate,24);output.writeUInt32LE(sampleRate*2,28);
 output.writeUInt16LE(2,32);output.writeUInt16LE(16,34);
 output.write('data',36,'ascii');output.writeUInt32LE(frames*2,40);
 let seed=0x291ab39;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/0xffffffff*2-1;};
 for(let i=0;i<frames;i++){
  const t=i/sampleRate,fade=Math.min(1,t/.012,(def.duration-t)/.07);
  let wave=0;
  if(id==='whistle'){
   const freq=t<.37?1100:1375;
   const phase=2*Math.PI*(freq*t+8*t*t);
   wave=(.78*Math.sin(phase)+.13*Math.sin(phase*2))*Math.min(1,t/.04);
  }else if(id==='goal'){
   // Original short ascending fanfare; not a club anthem or transcription.
   const segment=Math.min(3,Math.floor(t/.4));
   const freq=[330,415,494,660][segment];
   const local=t-segment*.4;
   const env=Math.min(1,local/.024)*Math.exp(-local*1.8);
   wave=env*(.5*Math.sin(2*Math.PI*freq*t)+.18*Math.sin(2*Math.PI*freq*2*t)+.08*Math.sin(2*Math.PI*freq*3*t));
  }else{
   // Sparse filtered bursts suggest clapping; no real crowd recording.
   const beat=t%(.13+Math.floor(t/.5)*.005);
   const envelope=beat<.027?Math.pow(1-beat/.027,2):0;
   wave=(random()*.5+Math.sin(t*2*Math.PI*175)*.13)*envelope;
  }
  output.writeInt16LE(Math.round(clamp(wave*fade*.7)*32760),44+i*2);
 }
 return {name:def.name,mime:'audio/wav',bytes:output};
}
module.exports={tracks,synth};
