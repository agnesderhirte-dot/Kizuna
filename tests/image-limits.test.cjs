const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {dimensions,verifyImage}=require('../desktop/image-limits.cjs');

function png(w,h){
 const b=Buffer.alloc(24);Buffer.from([137,80,78,71,13,10,26,10]).copy(b);
 b.writeUInt32BE(13,8);b.write('IHDR',12,'ascii');b.writeUInt32BE(w,16);b.writeUInt32BE(h,20);return b;
}
function gif(w,h){
 const b=Buffer.alloc(12);b.write('GIF89a',0,'ascii');b.writeUInt16LE(w,6);b.writeUInt16LE(h,8);return b;
}
function jpeg(w,h){
 return Buffer.from([0xff,0xd8,0xff,0xc0,0,0x11,8,(h>>8)&255,h&255,(w>>8)&255,w&255,0,0,0,0,0,0,0,0,0,0xff,0xd9]);
}
function webp(w,h){
 const b=Buffer.alloc(30);b.write('RIFF',0,'ascii');b.write('WEBP',8,'ascii');b.write('VP8X',12,'ascii');b.writeUIntLE(w-1,24,3);b.writeUIntLE(h-1,27,3);return b;
}
test('reads dimensions of PNG, JPEG, GIF and WebP without decoding pixels',()=>{
 for(const data of [png(3840,2160),jpeg(1920,1080),gif(640,480),webp(2560,1440)]){
  const measured=dimensions(data);assert.ok(measured.width>0&&measured.height>0);
  assert.ok(['png','gif','jpeg','webp'].includes(measured.format));
 }
 assert.deepEqual(dimensions(jpeg(1920,1080)),{format:'jpeg',width:1920,height:1080});
 assert.deepEqual(dimensions(webp(2560,1440)),{format:'webp',width:2560,height:1440});
});
test('compressed image bombs are stopped by headers before Electron decode',()=>{
 assert.throws(()=>verifyImage(png(8192,8192),'background'),/Bildabmessungen/);
 assert.throws(()=>verifyImage(gif(5000,5000),'background'),/Bildabmessungen/);
 assert.throws(()=>verifyImage(jpeg(4096,4096),'avatar'),/Bildabmessungen/);
 assert.throws(()=>verifyImage(png(6,6),'avatar'),/mindestens/);
 assert.deepEqual(verifyImage(png(3840,2160),'background').format,'png');
 assert.deepEqual(verifyImage(png(96,96),'avatar').format,'png');
});
test('invalid or unsupported content never reaches native decoder',()=>{
 for(const bad of [Buffer.from('<svg/onload=alert(1)>'),Buffer.alloc(100),Buffer.from('RIFF')])assert.throws(()=>verifyImage(bad,'background'));
 const app=fs.readFileSync(path.join(__dirname,'../desktop/main.cjs'),'utf8');
 const avatar=app.slice(app.indexOf("if(kind==='avatar')"),app.indexOf("if(kind==='background'||kind==='emoji')"));
 const backdrop=app.slice(app.indexOf("if(kind==='background'||kind==='emoji')"),app.indexOf("const h=buffer.subarray(0,16)"));
 assert.ok(avatar.indexOf('verifyImage(buffer,kind)')<avatar.indexOf('nativeImage.createFromBuffer(buffer)'));
 assert.ok(backdrop.indexOf('verifyImage(buffer,kind)')<backdrop.indexOf('nativeImage.createFromBuffer(buffer)'));
});
