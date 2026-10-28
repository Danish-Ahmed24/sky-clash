import * as THREE from 'three';
import {BUILDINGS,BOUNDS} from '../shared/world.js';

export function createCity(scene,{quality='high'}={}) {
 const root=new THREE.Group(); root.name='Port Meridian'; scene.add(root);
 const owned=[]; const textures=[];
 const mat=(params)=>{const m=new THREE.MeshStandardMaterial(params);owned.push(m);return m;};
 const box=new THREE.BoxGeometry(1,1,1); owned.push(box);
 const plane=new THREE.PlaneGeometry(1,1);owned.push(plane);
 function mesh(g,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.receiveShadow=true;root.add(o);return o;}
 const land=mat({color:0x172532,roughness:.96});
 const water=mat({color:0x103449,roughness:.3,metalness:.62});
 mesh(box,land,400,-10,0,2800,20,3600);
 mesh(box,water,-1400,-12,0,800,16,3600);
 const quay=mat({color:0x64717a,roughness:.8});mesh(box,quay,-1000,-3,0,34,6,3600);
 const road=mat({color:0x111b27,roughness:.95});
 const laneMarks=[];
 const line=mat({color:0xb0a38a,emissive:0x4c381b,emissiveIntensity:.2});
 for(let c=0;c<9;c++){let x=-905+c*270;mesh(box,road,x,.1,0,72,.2,3500);for(let z=-1650;z<1700;z+=80)laneMarks.push([x,.23,z,1,.1,25]);}
 for(let r=0;r<9;r++){let z=-1395+r*330;mesh(box,road,400,.12,z,2700,.25,75);for(let x=-900;x<1750;x+=80)laneMarks.push([x,.3,z,25,.1,1]);}
 const lanes=new THREE.InstancedMesh(box,line,laneMarks.length);const lm=new THREE.Matrix4();for(let i=0;i<laneMarks.length;i++){const [x,y,z,w,h,d]=laneMarks[i];lm.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(w,h,d));lanes.setMatrixAt(i,lm);}root.add(lanes);
 const park=mat({color:0x244039,roughness:1});mesh(box,park,-30,.3,330,380,.6,170);
 const promenade=mat({color:0x566166,roughness:.95});mesh(box,promenade,-955,.2,0,55,.4,3500);
 function facade(tint,emissive=false){
  const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle=emissive?'#000000':tint;ctx.fillRect(0,0,128,256);
  for(let y=5;y<256;y+=12)for(let x=5;x<128;x+=12){const lit=((x*31+y*17)%71)>26;ctx.fillStyle=lit?'#ffb96c':emissive?'#000000':'#243d50';ctx.fillRect(x,y,5,6);ctx.fillStyle='rgba(5,12,24,.35)';ctx.fillRect(x+6,y,2,8);}
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;textures.push(tx);return tx;
 }
 const occupied=facade('#000000',true);
 const styles={glass:mat({color:0x9db7c6,map:facade('#243e52'),emissive:0xffb36b,emissiveMap:occupied,emissiveIntensity:.72,metalness:.55,roughness:.34}),ivory:mat({color:0xccc7b7,map:facade('#777c7d'),emissive:0xffb36b,emissiveMap:occupied,emissiveIntensity:.46,metalness:.1,roughness:.75}),charcoal:mat({color:0x737d8b,map:facade('#192632'),emissive:0xffb36b,emissiveMap:occupied,emissiveIntensity:.55,metalness:.45,roughness:.45})};
 const roof=mat({color:0x263441,roughness:.9});const roofMark=mat({color:0xb3a785,emissive:0x4c3d25,emissiveIntensity:.1});
 for(const style of Object.keys(styles)) {
  const bs=BUILDINGS.filter(b=>b.style===style);const inst=new THREE.InstancedMesh(box,styles[style],bs.length);const mx=new THREE.Matrix4();
  bs.forEach((b,i)=>{mx.compose(new THREE.Vector3(b.x,b.height/2,b.z),new THREE.Quaternion(),new THREE.Vector3(b.width,b.height,b.depth));inst.setMatrixAt(i,mx);});inst.castShadow=true;inst.receiveShadow=true;root.add(inst);
 }
 const details=new THREE.Group();root.add(details);
 const roofs=new THREE.InstancedMesh(plane,roof,BUILDINGS.length);
 const panels=new THREE.InstancedMesh(plane,roofMark,BUILDINGS.length*3);
 const ring=new THREE.RingGeometry(11,12,24);owned.push(ring);
 const pads=new THREE.InstancedMesh(ring,roofMark,BUILDINGS.length);
 const rq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2),rm=new THREE.Matrix4();
 BUILDINGS.forEach((b,i)=>{
  rm.compose(new THREE.Vector3(b.x,b.height+.02,b.z),rq,new THREE.Vector3(b.width*.98,b.depth*.98,1));roofs.setMatrixAt(i,rm);
  rm.compose(new THREE.Vector3(b.x,b.height+.05,b.z),rq,new THREE.Vector3(1,1,1));pads.setMatrixAt(i,rm);
  for(let j=0;j<3;j++){rm.compose(new THREE.Vector3(b.x-b.width*.3+j*9,b.height+.06,b.z-b.depth*.28),rq,new THREE.Vector3(6,12,1));panels.setMatrixAt(i*3+j,rm);}
 });details.add(roofs,panels,pads);
 const treeMat=mat({color:0x31564d,roughness:1});const treeGeo=new THREE.IcosahedronGeometry(1,0);owned.push(treeGeo);
 const trees=new THREE.InstancedMesh(treeGeo,treeMat,55);const tm=new THREE.Matrix4();for(let i=0;i<55;i++){const x=i<30?-930:-200+(i-30)*14,z=i<30?-1580+i*108:330;tm.compose(new THREE.Vector3(x,6,z),new THREE.Quaternion(),new THREE.Vector3(5,7,5));trees.setMatrixAt(i,tm);}root.add(trees);
 const beaconMat=new THREE.MeshBasicMaterial({color:0xff6b35});owned.push(beaconMat);const beaconGeo=new THREE.SphereGeometry(2,6,4);owned.push(beaconGeo);const beacons=[];
 for(const b of BUILDINGS.filter(x=>x.height>300)){const o=new THREE.Mesh(beaconGeo,beaconMat);o.position.set(b.x,b.height+1,b.z);root.add(o);beacons.push(o);}
 function setQuality(q){quality=q;details.visible=q!=='low';trees.visible=q!=='low';}
 setQuality(quality);
 return {root,update(elapsedSeconds=0){for(const b of beacons)b.visible=Math.sin(elapsedSeconds*2.5)>-.4;},setQuality,dispose(){scene.remove(root);for(const x of owned)x.dispose();for(const x of textures)x.dispose();}};
}
