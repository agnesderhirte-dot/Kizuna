const {WebSocketServer, WebSocket}=require('ws');
const crypto=require('node:crypto');
const {id,secret,name,equal,RateLimit}=require('./security.cjs');
function createSignaling({host='127.0.0.1',port=8765,createKey=crypto.randomBytes(32).toString('base64url')}={}){
 const rooms=new Map(); const clients=new Set();
 const wss=new WebSocketServer({host,port,maxPayload:65536,perMessageDeflate:false});
 const send=(ws,m)=>{if(ws.readyState===WebSocket.OPEN && ws.bufferedAmount<262144)ws.send(JSON.stringify(m));};
 wss.on('connection',(ws,req)=>{
  if(clients.size>=64 || (req.headers.origin && req.headers.origin !== 'null')){ws.close(1008);return;}
  clients.add(ws);let room,peer;const limiter=new RateLimit(600,10000),byteLimiter=new RateLimit(2*1024*1024,10000);let alive=true;
  const authTimeout=setTimeout(()=>{if(!peer)ws.close(1008);},10000);
  ws.on('pong',()=>alive=true);
  ws.checkAlive=()=>{if(!alive){ws.terminate();return;}alive=false;ws.ping();};
  ws.on('message',(raw,isBinary)=>{
   try{
    if(isBinary || !limiter.take() || !byteLimiter.take(raw.length))throw Error('Limit');const m=JSON.parse(raw.toString());
    if(!m || m.v!==1)throw Error('Protokoll');
    if(!peer && m.type==='join'){
     const roomId=id.parse(m.room),token=secret.parse(m.token),displayName=name.parse(m.name);
     if(m.create){if(typeof m.createKey!=='string'||!equal(m.createKey,createKey)||rooms.has(roomId)||rooms.size>=32)throw Error('Raum nicht verfügbar');rooms.set(roomId,{token,peers:new Map(),emptySince:null});}
     room=rooms.get(roomId);if(!room||!equal(token,room.token))throw Error('Zugriff verweigert');
     if(room.peers.size>=4)throw Error('Raum voll (4 Teilnehmer)');
     peer={id:crypto.randomUUID(),name:displayName,ws};
     send(ws,{v:1,type:'welcome',self:peer.id,peers:[...room.peers.values()].map(p=>({id:p.id,name:p.name}))});
     for(const p of room.peers.values())send(p.ws,{v:1,type:'joined',peer:{id:peer.id,name:peer.name}});
     room.peers.set(peer.id,peer);room.emptySince=null;clearTimeout(authTimeout);return;
    }
    if(!peer)throw Error('Nicht angemeldet');
    if(m.type==='signal'){
     const target=room.peers.get(id.parse(m.to));if(!target)return; // A peer may leave while an ICE candidate is already in flight.
     if(target.id===peer.id)throw Error('Peer');
     if(!m.data || typeof m.data!=='object' || JSON.stringify(m.data).length>60000)throw Error('Signal');
     send(target.ws,{v:1,type:'signal',from:peer.id,data:m.data});return;
    }
    throw Error('Unbekannte Nachricht');
   }catch(error){if(process.env.VOXRALLY_TEST_DATA)console.warn('Signaling rejected:',error.message);send(ws,{v:1,type:'error',message:'Beitritt oder Nachricht abgelehnt. Einladung, Raumgröße und Server prüfen.'});ws.close(1008);}
  });
  ws.on('error',()=>{});
  ws.on('close',()=>{clearTimeout(authTimeout);clients.delete(ws);if(peer&&room){room.peers.delete(peer.id);for(const p of room.peers.values())send(p.ws,{v:1,type:'left',id:peer.id});if(!room.peers.size)room.emptySince=Date.now();}});
 });
 const heartbeat=setInterval(()=>{for(const ws of clients)ws.checkAlive?.();for(const [key,r]of rooms)if(r.emptySince&&Date.now()-r.emptySince>86400000)rooms.delete(key);},30000);
 wss.on('close',()=>clearInterval(heartbeat));
 return {wss,createKey,close:()=>{clearInterval(heartbeat);for(const ws of clients)ws.terminate();return new Promise(resolve=>wss.close(resolve));}};
}
module.exports={createSignaling};
if(require.main===module){const key=process.env.VOXRALLY_CREATE_KEY;if(!key||key.length<32)throw Error('VOXRALLY_CREATE_KEY mit mindestens 32 Zeichen setzen');const s=createSignaling({host:process.env.VOXRALLY_BIND||'127.0.0.1',port:Number(process.env.PORT)||8765,createKey:key});s.wss.on('listening',()=>console.log('VoxRally Signaling bereit'));}
