/** Prevents repeated Electron IPC when only unrelated peer/visual state changes. */
export class MediaActivityGate {
 private last: boolean|undefined;
 constructor(private send:(active:boolean)=>Promise<unknown>,private onError:(error:unknown)=>void){}
 update(active:boolean):boolean{
  if(this.last===active)return false;
  this.last=active;
  void this.send(active).catch(error=>{
   if(this.last===active)this.last=undefined;
   this.onError(error);
  });
  return true;
 }
 reset(){this.last=undefined;}
}
