export const APP_VERSION=__APP_VERSION__;
export type UpdateManifest={version:string;size:number;sha256:string;signature:string};
type Link={dc:RTCDataChannel;name:string;queue:Promise<void>;pending:number;ack?:()=>void;ackReject?:(error:Error)=>void;offer?:UpdateManifest;offset:number;sending:boolean};
export const newer=(a:string,b:string)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
export class RoomUpdates{
 links=new Map<string,Link>();offer?:UpdateManifest;receiving?:string;ready='';progress='';availableVersion='';changed=()=>{};error=(s:string)=>{};private epoch=0;
 bind(id:string,name:string,dc:RTCDataChannel){
  const previous=this.links.get(id);
  if(previous?.dc===dc)return;
  if(previous&&previous.dc!==dc){
   previous.ackReject?.(Error('Updateverbindung durch eine neue Verbindung ersetzt'));
   previous.dc.close();
  }
  const l:Link={dc,name,queue:Promise.resolve(),pending:0,offset:0,sending:false};
  this.links.set(id,l);dc.binaryType='arraybuffer';
  dc.onopen=()=>{if(this.links.get(id)!==l)return;this.send(l,{type:'version',version:APP_VERSION});if(this.offer)this.send(l,{type:'offer',manifest:this.offer});};
  dc.onmessage=e=>{if(this.links.get(id)!==l)return;if(++l.pending>32||(typeof e.data==='string'?e.data.length>4096:!(e.data instanceof ArrayBuffer)||e.data.byteLength>32768)){dc.close();return;}l.queue=l.queue.then(()=>this.receive(id,l,e.data)).catch(error=>{this.error(String(error));dc.close();}).finally(()=>{l.pending--;});};
  dc.onclose=()=>{l.ackReject?.(Error('Updateverbindung wurde getrennt'));if(this.links.get(id)!==l)return;this.links.delete(id);this.availableVersion=[...this.links.values()].reduce((version,peer)=>peer.offer&&(!version||newer(peer.offer.version,version))?peer.offer.version:version,'');if(this.receiving===id){this.receiving=undefined;void window.vox.abortUpdate();this.progress='Updateübertragung unterbrochen – bitte erneut anfordern.';}this.changed();};
 }
 send(l:Link,data:unknown){if(l.dc.readyState==='open')l.dc.send(JSON.stringify(data));}
 async publish(){const epoch=this.epoch;const manifest=await window.vox.selectUpdate();if(!manifest||epoch!==this.epoch)return;this.offer=manifest;for(const l of this.links.values())this.send(l,{type:'offer',manifest});this.progress=`Update ${manifest.version} für Freunde freigegeben.`;this.changed();}
 async accept(id:string){const l=this.links.get(id),epoch=this.epoch;if(!l?.offer||this.receiving)throw Error('Update gerade nicht verfügbar');await window.vox.beginUpdate(l.offer);if(this.epoch!==epoch||this.links.get(id)!==l||l.dc.readyState!=='open'){await window.vox.abortUpdate();return;}this.receiving=id;l.offset=0;this.progress='Update wird heruntergeladen …';this.send(l,{type:'accept',hash:l.offer.sha256});this.changed();}
 async receive(id:string,l:Link,raw:string|ArrayBuffer){
  if(raw instanceof ArrayBuffer){if(this.receiving!==id||!l.offer)throw Error('Unangeforderter Updateblock');l.offset=await window.vox.writeUpdate({hash:l.offer.sha256,offset:l.offset,bytes:new Uint8Array(raw)});this.send(l,{type:'ack',offset:l.offset});const progress=`Update laden: ${Math.floor(l.offset/l.offer.size*100)} %`;if(this.progress!==progress){this.progress=progress;this.changed();}return;}
  const m=JSON.parse(raw);
  // Version strings are unauthenticated hints, never proof that an update exists.
  if(m.type==='version')return;
  if(m.type==='offer'){
   if(this.receiving===id)return;
   // Check the publisher's pinned Ed25519 signature before displaying or caching.
   // The same signature is checked again before accepting or installing a file.
   let verified:UpdateManifest;
   try{verified=await window.vox.verifyUpdateOffer(m.manifest);}
   catch{this.error('Updateangebot ohne gültige Entwicklersignatur verworfen.');return;}
   if(this.links.get(id)!==l||l.dc.readyState!=='open'||!newer(verified.version,APP_VERSION))return;
   l.offer=verified;
   this.availableVersion=verified.version;
   void window.vox.notifyUpdate({version:verified.version}).catch(()=>{});
   this.changed();
  }
  if(m.type==='accept'&&this.offer&&m.hash===this.offer.sha256&&!l.sending){void this.transfer(l,this.offer).catch(e=>{this.error(String(e));l.dc.close();});}
  if(m.type==='ack'&&Number.isSafeInteger(m.offset)&&m.offset===l.offset)l.ack?.();
  if(m.type==='finish'&&this.receiving===id&&l.offer){this.ready=await window.vox.finishUpdate(l.offer.sha256);this.receiving=undefined;this.progress='Update geprüft und bereit. Installation beendet KIZUNA.';this.changed();}
 }
 async transfer(l:Link,manifest:UpdateManifest){
  l.sending=true;
  try{
   for(let offset=0;offset<manifest.size;){
    if(l.dc.readyState!=='open')throw Error('Updateverbindung getrennt');
    const bytes=await window.vox.readUpdate({hash:manifest.sha256,offset});
    if(l.dc.readyState!=='open')throw Error('Updateverbindung getrennt');
    if(!bytes.length||bytes.length>32768||offset+bytes.length>manifest.size)throw Error('Ungültiger Updateblock');
    l.offset=offset+bytes.length;
    await new Promise<void>((resolve,reject)=>{
     let done=false;
     const finish=(error?:Error)=>{
      if(done)return;
      done=true;clearTimeout(timer);l.ack=undefined;l.ackReject=undefined;
      if(error)reject(error);else resolve();
     };
     const timer=setTimeout(()=>finish(Error('Updateübertragung zu langsam')),15000);
     l.ack=()=>finish();
     l.ackReject=e=>finish(e);
     try{l.dc.send(bytes as Uint8Array<ArrayBuffer>);}catch(e){finish(e instanceof Error?e:Error('Updatekanal nicht verfügbar'));}
    });
    offset=l.offset;
   }
   if(l.dc.readyState!=='open')throw Error('Updateverbindung getrennt');
   this.send(l,{type:'finish'});
  }finally{l.ackReject?.(Error('Updateübertragung beendet'));l.sending=false;}
 }
 close(){this.epoch++;for(const l of this.links.values()){l.ackReject?.(Error('KIZUNA wurde geschlossen'));l.dc.close();}this.links.clear();if(this.receiving)void window.vox.abortUpdate();this.receiving=undefined;this.offer=undefined;this.availableVersion='';this.progress=this.ready?'Update geprüft und bereit. Installation beendet KIZUNA.':'';this.changed();}
}
