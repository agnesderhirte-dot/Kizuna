/** Raster image limits evaluated before Electron decodes pixel buffers. No external parser. */
function dimensions(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<12)throw Error('Ungültige Bilddatei');
 if(bytes.length>=24&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
  if(bytes.toString('ascii',12,16)!=='IHDR')throw Error('PNG-Header fehlt');
  return {format:'png',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
 }
 if(bytes.length>=10&&/^GIF8[79]a$/.test(bytes.toString('ascii',0,6))){
  return {format:'gif',width:bytes.readUInt16LE(6),height:bytes.readUInt16LE(8)};
 }
 if(bytes[0]===0xff&&bytes[1]===0xd8){
  let at=2;
  while(at+4<bytes.length){
   if(bytes[at++]!==0xff)throw Error('JPEG-Header beschädigt');
   while(bytes[at]===0xff)at++;
   const marker=bytes[at++];
   if(marker===0xda||marker===0xd9)break;
   if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
   if(at+2>bytes.length)break;
   const length=bytes.readUInt16BE(at);
   if(length<2||at+length>bytes.length)throw Error('JPEG-Segment ungültig');
   if(([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]).includes(marker)&&length>=7)
    return {format:'jpeg',width:bytes.readUInt16BE(at+5),height:bytes.readUInt16BE(at+3)};
   at+=length;
  }
  throw Error('JPEG-Abmessungen nicht lesbar');
 }
 if(bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  const tag=bytes.toString('ascii',12,16);
  if(tag==='VP8X')return {format:'webp',width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3)};
  if(tag==='VP8 '&&bytes[23]===0x9d&&bytes[24]===0x01&&bytes[25]===0x2a)
   return {format:'webp',width:bytes.readUInt16LE(26)&0x3fff,height:bytes.readUInt16LE(28)&0x3fff};
  if(tag==='VP8L'&&bytes[20]===0x2f)
   return {format:'webp',width:1+bytes[21]+((bytes[22]&0x3f)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)};
  throw Error('WebP-Header nicht unterstützt');
 }
 throw Error('Nur PNG, JPEG, GIF und WebP als Bilddateien');
}
function verifyImage(bytes,kind){
 if(kind==='avatar'&&bytes.length>4*1024*1024)throw Error('Profilfoto maximal 4 MB');
 const info=dimensions(bytes);
 const maxPixels=kind==='avatar'?8_000_000:16_000_000;
 if(!Number.isInteger(info.width)||!Number.isInteger(info.height)||info.width<1||info.height<1||
    info.width>8192||info.height>8192||info.width*info.height>maxPixels)
  throw Error('Bildabmessungen zu groß: maximal '+maxPixels.toLocaleString('de-DE')+' Pixel');
 if(kind==='avatar'&&(info.width<16||info.height<16))throw Error('Profilfoto mindestens 16 × 16 Pixel');
 return info;
}
module.exports={dimensions,verifyImage};
