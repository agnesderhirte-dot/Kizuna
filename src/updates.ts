export const APP_VERSION=__APP_VERSION__;
export type UpdateManifest={version:string;size:number;sha256:string;signature:string};
type Link={dc:RTCDataChannel;name:string;queue:Promise<void>;pending:number;ack?:()=>void;offer?:UpdateManifest;offset:number;sending:boolean};
export const newer=(a:string,b:string)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
export class RoomUpdates{
 links=new Map<string,Link>();offer?:UpdateManifest;receiving?:string;ready='';progress='';availableVersion='';changed=()=>{};error=(s:string)=>{};
 bind(id:string,name:string,dc:RTCDataChannel){const l:Link={dc,name,queue:Promise.resolve(),pending:0,offset:0,sending:false};this.links.set(id,l);dc.binaryType='arraybuffer';
  dc.onopen=()=>{this.send(l,{type:'version',version:APP_VERSION});if(this.offer)this.send(l,{type:'offer',manifest:this.offer});};
  dc.onmessage=e=>{if(++l.pending>32||(typeof e.data==='string'?e.data.length>4096:!(e.data instanceof ArrayBuffer)||e.data.byteLength>32768)){dc.close();return;}l.queue=l.queue.then(()=>this.receive(id,l,e.data)).catch(error=>{this.error(String(error));dc.close();}).finally(()=>{l.pending--;});};
  dc.onclose=()=>{if(this.links.get(id)!==l)return;this.links.delete(id);if(this.receiving===id){this.receiving=undefined;void window.vox.abortUpdate();this.progress='Updateübertragung unterbrochen – bitte erneut anfordern.';}this.changed();};
 }
 send(l:Link,data:unknown){if(l.dc.readyState==='open')l.dc.send(JSON.stringify(data));}
 async publish(){const manifest=await window.vox.selectUpdate();if(!manifest)return;this.offer=manifest;for(const l of this.links.values())this.send(l,{type:'offer',manifest});this.progress=`Update ${manifest.version} für Freunde freigegeben.`;this.changed();}
 async accept(id:string){const l=this.links.get(id);if(!l?.offer||this.receiving)throw Error('Update gerade nicht verfügbar');await window.vox.beginUpdate(l.offer);this.receiving=id;l.offset=0;this.progress='Update wird heruntergeladen …';this.send(l,{type:'accept',hash:l.offer.sha256});this.changed();}
 async receive(id:string,l:Link,raw:string|ArrayBuffer){
  if(raw instanceof ArrayBuffer){if(this.receiving!==id||!l.offer)throw Error('Unangeforderter Updateblock');l.offset=await window.vox.writeUpdate({hash:l.offer.sha256,offset:l.offset,bytes:new Uint8Array(raw)});this.send(l,{type:'ack',offset:l.offset});const progress=`Update laden: ${Math.floor(l.offset/l.offer.size*100)} %`;if(this.progress!==progress){this.progress=progress;this.changed();}return;}
  const m=JSON.parse(raw);
  if(m.type==='version'&&typeof m.version==='string'&&/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(m.version)&&newer(m.version,APP_VERSION)){this.availableVersion=m.version;void window.vox.notifyUpdate({version:m.version});this.changed();}
  if(m.type==='offer'&&typeof m.manifest?.version==='string'&&/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(m.manifest.version)){if(this.receiving===id)return;l.offer=m.manifest;this.availableVersion=m.manifest.version;if(newer(m.manifest.version,APP_VERSION))void window.vox.notifyUpdate({version:m.manifest.version});this.changed();}
  if(m.type==='accept'&&this.offer&&m.hash===this.offer.sha256&&!l.sending){void this.transfer(l,this.offer).catch(e=>{this.error(String(e));l.dc.close();});}
  if(m.type==='ack'&&Number.isSafeInteger(m.offset)&&m.offset===l.offset)l.ack?.();
  if(m.type==='finish'&&this.receiving===id&&l.offer){this.ready=await window.vox.finishUpdate(l.offer.sha256);this.receiving=undefined;this.progress='Update geprüft und bereit. Installation beendet KIZUNA.';this.changed();}
 }
 async transfer(l:Link,manifest:UpdateManifest){l.sending=true;try{for(let offset=0;offset<manifest.size;){const bytes=await window.vox.readUpdate({hash:manifest.sha256,offset});if(l.dc.readyState!=='open')throw Error('Updateverbindung getrennt');l.offset=offset+bytes.length;await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>{l.ack=undefined;reject(Error('Updateübertragung zu langsam'));},15000);l.ack=()=>{clearTimeout(timer);l.ack=undefined;resolve();};l.dc.send(bytes as Uint8Array<ArrayBuffer>);});offset=l.offset;}this.send(l,{type:'finish'});}finally{l.sending=false;}}
 close(){for(const l of this.links.values())l.dc.close();this.links.clear();if(this.receiving)void window.vox.abortUpdate();this.receiving=undefined;}
}
