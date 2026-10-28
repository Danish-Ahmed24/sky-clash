import * as THREE from 'three';

const vector=p=>p?.isVector3?p:new THREE.Vector3(...(p||[0,0,0]));
export function createEffects(scene,{quality='high'}={}) {
  const maxParticles=260,maxTracers=96;
  let particleLimit=quality==='low'?100:260;
  const particles=Array.from({length:maxParticles},()=>({life:0,max:1,p:new THREE.Vector3(),v:new THREE.Vector3(),size:1,color:new THREE.Color()}));
  const mesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshBasicMaterial({transparent:true,opacity:.82,blending:THREE.AdditiveBlending,depthWrite:false}),maxParticles);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;scene.add(mesh);
  const positions=new Float32Array(maxTracers*6),colors=new Float32Array(maxTracers*6);
  const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));lineGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const lines=new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));lines.frustumCulled=false;scene.add(lines);
  const tracers=Array.from({length:maxTracers},()=>({life:0}));const dummy=new THREE.Object3D();let cursor=0,traceCursor=0;
  function emit(position,velocity,size,life,color){const p=particles[cursor++%particleLimit];p.p.copy(vector(position));p.v.copy(velocity);p.size=size;p.life=p.max=life;p.color.set(color);}
  function tracer(from,to,color=0xffd491){const i=traceCursor++%maxTracers;tracers[i].life=.085;const a=vector(from),b=vector(to),c=new THREE.Color(color);positions.set([a.x,a.y,a.z,b.x,b.y,b.z],i*6);colors.set([c.r,c.g,c.b,c.r,c.g,c.b],i*6);}
  function explosion(position){for(let i=0;i<(quality==='low'?24:55);i++){const v=new THREE.Vector3(Math.random()-.5,Math.random()-.3,Math.random()-.5).normalize().multiplyScalar(10+Math.random()*48);emit(position,v,1+Math.random()*4,.35+Math.random()*.85,i%3?0xff782d:0xffdd9a);}}
  function flare(position){for(let i=0;i<8;i++)emit(position,new THREE.Vector3((Math.random()-.5)*18,-5-Math.random()*10,(Math.random()-.5)*18),.8,.8+Math.random(),0xffd9a2);}
  function trail(position){emit(position,new THREE.Vector3(0,1,0),.45,.25,0xffbc6d);}
  function update(dt){for(let i=0;i<particleLimit;i++){const p=particles[i];p.life=Math.max(0,p.life-dt);if(p.life){p.p.addScaledVector(p.v,dt);p.v.multiplyScalar(Math.exp(-1.5*dt));p.v.y-=6*dt;dummy.position.copy(p.p);dummy.scale.setScalar(p.size*p.life/p.max);mesh.setColorAt(i,p.color);}else dummy.scale.setScalar(0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;for(let i=0;i<maxTracers;i++){tracers[i].life-=dt;if(tracers[i].life<=0)positions.fill(0,i*6,i*6+6);}lineGeo.attributes.position.needsUpdate=true;}
  function setQuality(next){quality=next;particleLimit=quality==='low'?100:260;mesh.count=particleLimit;for(let i=particleLimit;i<maxParticles;i++)particles[i].life=0;cursor%=particleLimit;}
  setQuality(quality);
  update(0);
  return {tracer,explosion,flare,trail,update,setQuality,dispose(){scene.remove(mesh,lines);mesh.geometry.dispose();mesh.material.dispose();lineGeo.dispose();lines.material.dispose();}};
}
