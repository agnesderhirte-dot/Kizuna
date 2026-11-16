const {contextBridge,ipcRenderer}=require('electron');
const calls=['mediaActive','load','save','sources','capture','host','join','leave','signal','importAsset','asset','history','message','openLink','copyInvite','getInvite','emailInvite','selectUpdate','readUpdate','beginUpdate','writeUpdate','finishUpdate','abortUpdate','installUpdate','notifyUpdate','listSessions','saveSession','deleteSession','exportSessions','copySession','installBuiltinSounds','shareSession','copyDiagnostics','deleteSound'];
const api={};for(const c of calls)api[c]=arg=>ipcRenderer.invoke('vox:'+c,arg);
api.onEvent=fn=>{const cb=(_e,data)=>fn(data);ipcRenderer.on('vox:event',cb);return()=>ipcRenderer.removeListener('vox:event',cb);};
contextBridge.exposeInMainWorld('vox',api);
