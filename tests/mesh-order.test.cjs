const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('incoming description completes before ICE; rejected SDP resets answer flag',async()=>{
 const {Mesh}=await require('./load-ts.cjs').loadTs('src/mesh.ts');
 let applying=false,candidates=0;
 global.RTCPeerConnection=class{connectionState='new';signalingState='stable';remoteDescription=null;async setRemoteDescription(d){applying=true;await new Promise(r=>setTimeout(r,15));applying=false;if(d.sdp==='bad')throw Error('bad SDP');this.remoteDescription=d;}async addIceCandidate(){assert.equal(applying,false);candidates++;}close(){this.connectionState='closed';}getSenders(){return [];}restartIce(){}};
 const mesh=new Mesh({turnUrl:''});mesh.self='a';mesh.add('b','B',false);
 try{await Promise.all([mesh.receive('b',{description:{type:'answer',sdp:'valid'}}),mesh.receive('b',{candidate:{candidate:'test'}})]);assert.equal(candidates,1);await mesh.receive('b',{description:{type:'answer',sdp:'bad'}});assert.equal(mesh.peers.get('b').answerPending,false);}finally{mesh.close();delete global.RTCPeerConnection;}
});
