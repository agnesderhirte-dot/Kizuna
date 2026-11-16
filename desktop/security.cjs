const { z } = require('zod');
const crypto = require('node:crypto');
const id = z.string().regex(/^[a-zA-Z0-9_-]{8,80}$/);
const secret = z.string().regex(/^[a-zA-Z0-9_-]{32,128}$/);
const name = z.string().trim().min(1).max(48);
function endpoint(value) {
  if(value==='peerjs')return value;
  const u = new URL(z.string().max(2048).parse(value));
  if(u.username || u.password || u.hash || u.search || u.pathname !== '/') throw Error('Ungültige Serveradresse');
  const local = /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+)$/.test(u.hostname);
  if(u.protocol !== 'wss:' && !(u.protocol === 'ws:' && local)) throw Error('Internet-Server benötigen wss://; ws:// nur für LAN/VPN');
  return u.href;
}
function invite(value) {
  if(typeof value !== 'string' || value.length > 4096) throw Error('Ungültige Einladung');
  const u = new URL(value);
  if(u.protocol !== 'voxrally:' || u.hostname !== 'join' || u.username || u.password || u.port || u.hash) throw Error('Ungültige Einladung');
  if([...u.searchParams.keys()].some(k=>!['token','server'].includes(k)) || u.searchParams.getAll('token').length !== 1 || u.searchParams.getAll('server').length !== 1) throw Error('Ungültige Einladung');
  return {room:id.parse(u.pathname.slice(1)),token:secret.parse(u.searchParams.get('token')),server:endpoint(u.searchParams.get('server'))};
}
function equal(a,b) { const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length && crypto.timingSafeEqual(aa,bb); }
class RateLimit {
  constructor(limit,ms){this.limit=limit;this.ms=ms;this.start=Date.now();this.count=0;}
  take(weight=1){const now=Date.now();if(now-this.start>=this.ms){this.count=0;this.start=now;}this.count+=weight;return this.count<=this.limit;}
}
const settings = z.object({name,profilePhoto:z.string().regex(/^(|[0-9a-f]{64})$/).default(''),profileBio:z.string().max(160).default(''),favoriteGame:z.string().max(90).default(''),skin:z.enum(['original','classic18','purple22','matchday24','portal27','winamp90','messenger03','neonwave','glassmodern']).default('original'),cameraDevice:z.string().max(256).default(''),cameraResolution:z.enum(['720','1080']).default('1080'),cameraBitrate:z.number().min(1).max(12).default(4),cameraBackground:z.string().regex(/^(|blur|[0-9a-f]{64})$/).default(''),theme:z.enum(['dark','oled','light']),accent:z.string().regex(/^#[0-9a-fA-F]{6}$/),mic:z.string().max(256),output:z.string().max(256),profile:z.enum(['detail','motion','auto']),resolution:z.enum(['720','1080','1440','2160','native']),fps:z.enum(['30','60']),bitrate:z.number().min(1).max(80),noise:z.boolean(),echo:z.boolean(),gain:z.boolean(),systemAudio:z.boolean(),background:z.string().max(80),turnUrl:z.string().max(512),turnUser:z.string().max(128),turnPassword:z.string().max(256)}).strict();
module.exports={id,secret,name,endpoint,invite,equal,RateLimit,settings};
