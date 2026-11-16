const {Notification,app,BrowserWindow,ipcMain,session,desktopCapturer,dialog,safeStorage,shell,clipboard,globalShortcut}=require('electron');
const path=require('node:path');const fs=require('node:fs');const crypto=require('node:crypto');const os=require('node:os');const {pathToFileURL}=require('node:url');
const {DatabaseSync}=require('node:sqlite');const {WebSocket}=require('ws');const {z}=require('zod');
const security=require('./security.cjs');const calendar=require('./calendar.cjs');const builtinSounds=require('./bundled-sounds.cjs');const {createSignaling}=require('./signaling.cjs');
app.setPath('userData',process.env.VOXRALLY_TEST_DATA?path.resolve(process.env.VOXRALLY_TEST_DATA):path.join(app.getPath('appData'),'VoxRally'));
app.setName('KIZUNA');
let mediaActive=true,win,db,server,socket,pendingCapture,activeRoom,activeInvite,pendingInvite,retryTimer,calendarTimer,connectionSpec,retryCount=0;
const page=pathToFileURL(path.join(__dirname,'../dist/index.html')).href;
const defaults={profilePhoto:'',profileBio:'',favoriteGame:'',favoriteReactions:['⚽','🏆','😂'],skin:'original',cameraDevice:'',cameraResolution:'1080',cameraBitrate:4,cameraBackground:'',name:'Spieler',theme:'dark',accent:'#69e3b1',mic:'',output:'',profile:'detail',resolution:'native',fps:'30',bitrate:20,noise:true,echo:true,gain:false,systemAudio:true,background:'',turnUrl:'',turnUser:'',turnPassword:''};
function emit(data){if(win&&!win.isDestroyed())win.webContents.send('vox:event',data);}
function trusted(e){return win&&!win.isDestroyed()&&e.sender===win.webContents&&e.senderFrame===win.webContents.mainFrame&&e.senderFrame.url===page;}
function get(key,fallback){const row=db.prepare('SELECT value FROM kv WHERE key=?').get(key);return row?JSON.parse(row.value):fallback;}
function set(key,value){db.prepare('INSERT OR REPLACE INTO kv(key,value) VALUES(?,?)').run(key,JSON.stringify(value));}
function storedSettings(){const s={...defaults,...get('settings',{})};if(s.turnPassword){try{s.turnPassword=safeStorage.decryptString(Buffer.from(s.turnPassword,'base64'));}catch{s.turnPassword='';}}return s;}
function assetFile(id){if(!/^[0-9a-f]{64}$/.test(id))throw Error('Asset-ID');return path.join(app.getPath('userData'),'assets',id);}
function assetInfo(buffer,kind){
 if(kind==='avatar'){
  const {nativeImage}=require('electron');
  const decoded=nativeImage.createFromBuffer(buffer);
  if(decoded.isEmpty())throw Error('Profilbild ist nicht lesbar');
  const size=decoded.getSize();
  if(size.width<16||size.height<16||size.width>8192||size.height>8192)throw Error('Profilbild: 16 bis 8192 Pixel pro Seite');
  const side=Math.min(size.width,size.height);
  const image=decoded.crop({x:Math.floor((size.width-side)/2),y:Math.floor((size.height-side)/2),width:side,height:side}).resize({width:96,height:96,quality:'good'});
  let output=image.toJPEG(65);
  for(const quality of [55,45,35,25]){if(output.length<=12500)break;output=image.toJPEG(quality);}
  if(output.length>12500)throw Error('Profilbild zu komplex für die Übertragung');
  return {bytes:output,mime:'image/jpeg'};
 }
 if(kind==='background'||kind==='emoji'){
  const {nativeImage}=require('electron');const decoded=nativeImage.createFromBuffer(buffer);if(decoded.isEmpty())throw Error('Bild konnte nicht dekodiert werden');const size=decoded.getSize();if(size.width>8192||size.height>8192)throw Error('Bild maximal 8192 × 8192');return {bytes:decoded.toPNG(),mime:'image/png'};
 }
 const h=buffer.subarray(0,16);let mime;
 if(h.toString('ascii',0,4)==='RIFF'&&h.toString('ascii',8,12)==='WAVE')mime='audio/wav';
 else if(h.toString('ascii',0,4)==='OggS')mime='audio/ogg';else if(h.toString('ascii',0,4)==='fLaC')mime='audio/flac';
 else if(h.toString('ascii',0,3)==='ID3'||(h[0]===255&&(h[1]&224)===224))mime='audio/mpeg';
 else throw Error('Unterstützt: WAV, MP3, OGG, FLAC');return {bytes:buffer,mime};
}
function disconnect(){clearTimeout(retryTimer);connectionSpec=null;retryCount=0;if(socket){socket.removeAllListeners();socket.close();socket=null;}activeRoom=null;activeInvite=null;}
async function connect(spec,create=false){
 clearTimeout(retryTimer);if(socket){socket.removeAllListeners();socket.close();}connectionSpec=spec;const s=storedSettings();const url=security.endpoint(spec.server);socket=new WebSocket(url,{maxPayload:65536,perMessageDeflate:false,handshakeTimeout:10000});const current=socket;
 current.on('open',()=>current.send(JSON.stringify({v:1,type:'join',room:spec.room,token:spec.token,name:s.name,create,createKey:create?server.createKey:undefined})));
 current.on('message',raw=>{try{const m=JSON.parse(raw.toString());if(m.type==='welcome'){retryCount=0;activeRoom=spec.room;activeInvite=`voxrally://join/${spec.room}?token=${spec.token}&server=${encodeURIComponent(spec.publicServer||spec.server)}`;}emit(m);}catch{current.close();}});
 current.on('error',()=>emit({type:'error',message:'Server nicht erreichbar. Adresse und Netzwerk prüfen.'}));
 current.on('close',code=>{if(socket===current){activeRoom=null;emit({type:'disconnected'});if(code!==1008&&connectionSpec===spec){const delay=Math.min(30000,1000*2**Math.min(retryCount++,5));retryTimer=setTimeout(()=>{if(connectionSpec===spec)void connect(spec,false);},delay);}}});
}
function handle(channel,fn){ipcMain.handle('vox:'+channel,async(e,arg)=>{if(!trusted(e))throw Error('Nicht autorisierter IPC-Aufruf');try{return await fn(arg);}catch(err){throw Error(err instanceof z.ZodError?'Ungültige Eingabe':err.message);}});}
if(!process.env.VOXRALLY_TEST_DATA&&!app.requestSingleInstanceLock())app.quit();
else {
 app.on('second-instance',(_e,args)=>{const link=args.find(a=>a.startsWith('voxrally:'));if(link){try{security.invite(link);pendingInvite=link;emit({type:'invite',value:link});}catch{}}win?.show();});
 app.whenReady().then(()=>{
  fs.mkdirSync(path.join(app.getPath('userData'),'assets'),{recursive:true});db=new DatabaseSync(path.join(app.getPath('userData'),'voxrally.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,mime TEXT NOT NULL); CREATE TABLE IF NOT EXISTS messages(id TEXT NOT NULL,room TEXT NOT NULL,sender TEXT NOT NULL,name TEXT NOT NULL,text TEXT NOT NULL,time INTEGER NOT NULL,PRIMARY KEY(room,id)); PRAGMA user_version=1;');calendar.setup(db);
  if(!get('identity',null)){const pair=crypto.generateKeyPairSync('ed25519');if(!safeStorage.isEncryptionAvailable())throw Error('Windows Secure Storage nicht verfügbar');set('identity',{publicKey:pair.publicKey.export({type:'spki',format:'pem'}),privateKey:safeStorage.encryptString(pair.privateKey.export({type:'pkcs8',format:'pem'})).toString('base64')});}
  const initial=process.argv.find(a=>a.startsWith('voxrally:'));if(initial){try{security.invite(initial);pendingInvite=initial;}catch{}}
  session.defaultSession.setPermissionRequestHandler((wc,permission,cb,details)=>cb(wc===win?.webContents&&wc.getURL()===page&&details.isMainFrame!==false&&['media','display-capture','fullscreen'].includes(permission)));
  session.defaultSession.setPermissionCheckHandler((wc,permission,origin,details)=>wc===win?.webContents&&wc.getURL()===page&&['media','display-capture','fullscreen'].includes(permission));
  session.defaultSession.setDisplayMediaRequestHandler(async(req,cb)=>{
   const chosen=pendingCapture;pendingCapture=null;
   if(req.frame!==win?.webContents.mainFrame||req.frame.url!==page||!chosen||Date.now()-chosen.time>15000){cb({});return;}
   try{const sources=await desktopCapturer.getSources({types:['screen','window']});const source=sources.find(s=>s.id===chosen.id);cb(source?{video:source,...(chosen.audio?{audio:'loopback'}:{})}:{});}catch{cb({});}
  });
  require('./updates.cjs').registerUpdates({handle,app,dialog,win:()=>win,shell,Notification,isBusy:()=>!!activeRoom||mediaActive});
  handle('mediaActive',value=>{mediaActive=z.boolean().parse(value);return true;});
  handle('load',()=>({settings:storedSettings(),assets:db.prepare('SELECT * FROM assets').all(),fingerprint:crypto.createHash('sha256').update(get('identity',{}).publicKey).digest('hex'),invite:pendingInvite||''}));
  handle('save',arg=>{const s=security.settings.parse(arg);if(s.turnUrl&&!/^turns?:[^\s<>]{1,490}$/.test(s.turnUrl))throw Error('Ungültige TURN-Adresse');if(s.turnPassword){if(!safeStorage.isEncryptionAvailable())throw Error('Secure Storage nicht verfügbar');s.turnPassword=safeStorage.encryptString(s.turnPassword).toString('base64');}set('settings',s);return true;});
  handle('sources',async()=>{const items=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:320,height:180}});return items.map(s=>({id:s.id,name:s.name,thumbnail:s.thumbnail.toDataURL()}));});
  handle('capture',arg=>{const c=z.object({id:z.string().max(256),audio:z.boolean()}).strict().parse(arg);pendingCapture={...c,time:Date.now()};return true;});
  handle('host',async arg=>{
   const cfg=z.object({lan:z.boolean(),address:z.string().max(256),online:z.boolean().optional()}).strict().parse(arg);
   if(cfg.online){disconnect();let saved=get('online-room',null);if(!saved){saved={room:crypto.randomBytes(16).toString('hex'),token:safeStorage.encryptString(crypto.randomBytes(32).toString('base64url')).toString('base64')};set('online-room',saved);}const token=safeStorage.decryptString(Buffer.from(saved.token,'base64'));activeRoom=saved.room;activeInvite=`voxrally://join/${saved.room}?token=${token}&server=peerjs`;return {room:saved.room,address:'PeerJS Cloud',cloud:{room:saved.room,token,self:`vr-${saved.room}-h`,host:`vr-${saved.room}-h`,name:storedSettings().name}};}
   disconnect();if(server)await server.close();server=createSignaling({host:cfg.lan?'0.0.0.0':'127.0.0.1',port:8765});
   await new Promise((resolve,reject)=>{server.wss.once('listening',resolve);server.wss.once('error',reject);});
   const candidates=Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
   const address=cfg.address||candidates.find(a=>a.startsWith('192.168.')||a.startsWith('10.'))||candidates[0]||'127.0.0.1';
   const publicServer=security.endpoint(`ws://${cfg.lan?address:'127.0.0.1'}:8765/`);
   let saved=get('host-room',null);if(!saved){if(!safeStorage.isEncryptionAvailable())throw Error('Secure Storage nicht verfügbar');saved={room:crypto.randomBytes(16).toString('base64url'),token:safeStorage.encryptString(crypto.randomBytes(32).toString('base64url')).toString('base64')};set('host-room',saved);}const room=security.id.parse(saved.room),token=safeStorage.decryptString(Buffer.from(saved.token,'base64'));
   await connect({server:'ws://127.0.0.1:8765/',publicServer,room,token},true);return {room,address:publicServer};
  });
  handle('join',async arg=>{const spec=security.invite(arg);if(spec.server==='peerjs'){disconnect();activeRoom=spec.room;activeInvite=arg;return {room:spec.room,address:'PeerJS Cloud',cloud:{room:spec.room,token:spec.token,self:`vr-${crypto.randomUUID()}`,host:`vr-${spec.room}-h`,name:storedSettings().name}};}await connect(spec);return {room:spec.room,address:spec.server};});
  handle('getInvite',()=>{if(!activeInvite)throw Error('Zuerst Raum betreten');return activeInvite;});
  handle('emailInvite',async()=>{if(!activeInvite)throw Error('Zuerst Raum betreten');const subject='Einladung zu KIZUNA';const body='Komm in meinen KIZUNA-Raum!\n\n'+activeInvite+'\n\nKIZUNA muss installiert sein. Falls dein Mailprogramm den Link nicht öffnet, kopiere ihn in KIZUNA unter Freunden beitreten. Der Gastgeber muss den Raum geöffnet lassen.';await shell.openExternal('mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body));});
  handle('copyInvite',()=>{if(!activeInvite)throw Error('Zuerst Raum betreten');clipboard.writeText(activeInvite);return true;});
  handle('leave',()=>{disconnect();return true;});
  handle('signal',arg=>{const m=z.object({to:security.id,data:z.object({description:z.object({type:z.enum(['offer','answer']),sdp:z.string().max(58000)}).optional(),candidate:z.unknown().optional()}).strict()}).strict().parse(arg);if(!socket||socket.readyState!==WebSocket.OPEN||JSON.stringify(m).length>60000)throw Error('Keine Verbindung');socket.send(JSON.stringify({v:1,type:'signal',...m}));return true;});
  handle('importAsset',async arg=>{const kind=z.enum(['background','sound','emoji','avatar']).parse(arg);const picked=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:kind,extensions:kind==='sound'?['wav','mp3','ogg','flac']:['png','jpg','jpeg','webp','gif']}]});if(picked.canceled)return null;const file=picked.filePaths[0];if(fs.statSync(file).size>10*1024*1024)throw Error('Maximal 10 MB');if(db.prepare('SELECT count(*) AS n FROM assets').get().n>=100)throw Error('Bibliothek maximal 100 Dateien');const a=assetInfo(fs.readFileSync(file),kind);if(a.bytes.length>16*1024*1024)throw Error('Dekodierte Datei zu groß');const id=crypto.createHash('sha256').update(a.bytes).digest('hex');fs.writeFileSync(assetFile(id),a.bytes);const item={id,name:path.basename(file).slice(0,80),kind,mime:a.mime};db.prepare('INSERT OR REPLACE INTO assets VALUES(?,?,?,?)').run(id,item.name,kind,a.mime);return item;});
  handle('installBuiltinSounds',()=>{
   const installed=[];
   for(const track of builtinSounds.tracks){
    const sound=builtinSounds.synth(track.id);
    const id=crypto.createHash('sha256').update(sound.bytes).digest('hex');
    const existing=db.prepare('SELECT * FROM assets WHERE id=?').get(id);
    if(existing){installed.push(existing);continue;}
    if(db.prepare('SELECT count(*) AS n FROM assets').get().n>=100)throw Error('Soundbibliothek ist voll');
    fs.writeFileSync(assetFile(id),sound.bytes);
    db.prepare('INSERT OR IGNORE INTO assets VALUES(?,?,?,?)').run(id,sound.name,'sound',sound.mime);
    installed.push({id,name:sound.name,kind:'sound',mime:sound.mime});
   }
   return installed;
  });
  handle('deleteSound',arg=>{
   const id=z.string().regex(/^[0-9a-f]{64}$/).parse(arg);
   const item=db.prepare('SELECT kind FROM assets WHERE id=?').get(id);
   if(!item)return false;
   if(item.kind!=='sound')throw Error('Nur Sounds dürfen über die Soundbibliothek entfernt werden.');
   fs.rmSync(assetFile(id),{force:true});
   db.prepare('DELETE FROM assets WHERE id=?').run(id);
   return true;
  });
  handle('asset',arg=>{const file=assetFile(arg);const meta=db.prepare('SELECT mime FROM assets WHERE id=?').get(arg);if(!meta)throw Error('Unbekanntes Asset');return {bytes:new Uint8Array(fs.readFileSync(file)),mime:meta.mime};});
  handle('listSessions',()=>calendar.list(db));
  handle('saveSession',item=>calendar.save(db,item));
  handle('deleteSession',id=>calendar.remove(db,id));
  handle('copySession',item=>{clipboard.writeText(calendar.shareText(item));return true;});
  handle('copyDiagnostics',value=>{clipboard.writeText(z.string().min(1).max(12000).parse(value));return true;});
  handle('shareSession',async raw=>{
   const action=z.object({item:calendar.meeting,channel:z.enum(['email','whatsapp'])}).strict().parse(raw);
   const body=calendar.shareText(action.item).slice(0,900);
   if(action.channel==='email'){
    const url='mailto:?subject='+encodeURIComponent('KIZUNA · '+action.item.title)+'&body='+encodeURIComponent(body);
    await shell.openExternal(url);return true;
   }
   await shell.openExternal('https://wa.me/?text='+encodeURIComponent(body));return true;
  });

  handle('exportSessions',async()=>{
   const sessions=calendar.list(db);if(!sessions.length)throw Error('Keine Spieltermine vorhanden');
   const result=await dialog.showSaveDialog(win,{title:'Spieltermine als Kalenderdatei speichern',defaultPath:'KIZUNA-Spielabende.ics',filters:[{name:'Kalender (.ics)',extensions:['ics']}]});
   if(result.canceled||!result.filePath)return false;
   fs.writeFileSync(result.filePath,calendar.toICS(sessions),'utf8');return true;
  });
  handle('history',room=>db.prepare('SELECT * FROM (SELECT * FROM messages WHERE room=? ORDER BY time DESC LIMIT 200) ORDER BY time').all(security.id.parse(room)));
  handle('message',arg=>{const m=z.object({id:security.id,sender:security.id,name:security.name,text:z.string().min(1).max(4000),time:z.number().int().nonnegative()}).strict().parse(arg);if(!activeRoom)throw Error('Kein Raum');db.prepare('INSERT OR IGNORE INTO messages VALUES(?,?,?,?,?,?)').run(m.id,activeRoom,m.sender,m.name,m.text,m.time);db.prepare('DELETE FROM messages WHERE rowid NOT IN (SELECT rowid FROM messages ORDER BY time DESC LIMIT 20000)').run();return true;});
  handle('openLink',async arg=>{const u=new URL(z.string().max(2048).parse(arg));if(u.protocol!=='https:'||u.username||u.password)throw Error('Nur HTTPS-Links');await shell.openExternal(u.href);});
  win=new BrowserWindow({width:1400,height:920,minWidth:950,minHeight:650,backgroundColor:'#101319',title:'KIZUNA',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,backgroundThrottling:false}});
  win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-attach-webview',e=>e.preventDefault());
  calendarTimer=setInterval(()=>{
   try{
    for(const event of calendar.remindersDue(db)){
     if(Notification.isSupported()){
      const note=new Notification({title:'KIZUNA · Spielabend',body:event.game+' · '+event.title+' · '+new Date(event.occurrence).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})});
      note.on('click',()=>{if(win&&!win.isDestroyed()){win.show();win.focus();emit({type:'session-reminder',id:event.id});}});
      note.show();
     }
     emit({type:'session-reminder',id:event.id,title:event.title,game:event.game});
    }
   }catch(error){console.warn('Calendar reminder:',error instanceof Error?error.message:'unknown');}
  },30000);
  win.webContents.once('did-finish-load',()=>require('./central-updater.cjs').start({app,dialog,win:()=>win,isBusy:()=>!!activeRoom||mediaActive}));
  win.loadURL(page);if(app.isPackaged&&!process.env.VOXRALLY_TEST_DATA)app.setAsDefaultProtocolClient('voxrally');
  for(const [key,action]of [['CommandOrControl+Shift+M','mute'],['CommandOrControl+Shift+D','deafen']])globalShortcut.register(key,()=>emit({type:'hotkey',action}));
 });
 app.on('window-all-closed',()=>app.quit());app.on('will-quit',()=>{clearInterval(calendarTimer);globalShortcut.unregisterAll();disconnect();server?.close();db?.close();});
}
