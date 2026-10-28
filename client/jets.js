import * as THREE from 'three';

// All aircraft geometry is authored here; local forward is +Z and local up is +Y.
const V = (x,y,z) => new THREE.Vector3(x,y,z);
function panel(points, thickness, material) {
  const shape = new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,z)));
  const geo = new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,steps:1});
  geo.rotateX(Math.PI/2); geo.translate(0,thickness/2,0);
  const mesh = new THREE.Mesh(geo,material); mesh.castShadow=true; return mesh;
}
function ellipsoid(parent, material, p, scale) {
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),material);
  mesh.position.set(...p);mesh.scale.set(...scale);parent.add(mesh);return mesh;
}
export function createJet(type='falcon', color=0xaebdca) {
  const stealth=String(type).toLowerCase()==='wraith';
  const jet=new THREE.Group();jet.name=stealth?'Wraith':'Falcon';
  const hull=new THREE.MeshStandardMaterial({color:stealth?0x343d4b:color,metalness:.65,roughness:.36});
  const dark=new THREE.MeshStandardMaterial({color:0x111c2b,metalness:.65,roughness:.4});
  const edge=new THREE.MeshStandardMaterial({color:stealth?0x66778a:0xdbe2dd,metalness:.55,roughness:.4});
  const orange=new THREE.MeshStandardMaterial({color:0xff7b35,emissive:0xe4400d,emissiveIntensity:.7,metalness:.3,roughness:.5});
  const glass=new THREE.MeshPhysicalMaterial({color:0x204656,metalness:.55,roughness:.13,clearcoat:1});
  const exhaust=new THREE.MeshBasicMaterial({color:0xffb05b,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false});
  const core=ellipsoid(jet,hull,[0,0,0],[stealth?1.3:.8,.55,5.6]);
  if(stealth){
    jet.add(panel([[0,5.7],[-1.1,2.1],[-6.4,-3.2],[-2.6,-2.45],[-1.45,-4.6],[0,-3.8],[1.45,-4.6],[2.6,-2.45],[6.4,-3.2],[1.1,2.1]],.22,hull));
    jet.add(panel([[-.7,2.9],[-4.5,-2.2],[-3.7,-2.1],[-.45,2.8]],.235,edge));
    jet.add(panel([[.7,2.9],[4.5,-2.2],[3.7,-2.1],[.45,2.8]],.235,edge));
  } else {
    jet.add(panel([[-.5,1.9],[-5,-1.9],[-5.1,-3],[-.5,-1.95],[.5,-1.95],[5.1,-3],[5,-1.9],[.5,1.9]],.14,hull));
    jet.add(panel([[-.5,-2.5],[-2.8,-4.5],[-2.65,-5],[-.4,-4.15],[.4,-4.15],[2.65,-5],[2.8,-4.5],[.5,-2.5]],.12,edge));
    for(const sign of [-1,1]){
      const stripe=panel([[sign*2.6,-.55],[sign*3.4,-1.15],[sign*3.6,-2.5],[sign*2.85,-2.3]],.155,orange);jet.add(stripe);
      const tank=ellipsoid(jet,dark,[sign*1.55,-.42,-.5],[.3,.27,1.8]);
      ellipsoid(jet,edge,[sign*3.2,-.35,-1.9],[.13,.13,1.2]);
    }
  }
  // Canted twin fins, with individually faceted silhouettes.
  for(const sign of [-1,1]) {
    const fin=panel([[0,0],[1.8,-.7],[.5,-2],[0,-2]],.12,hull);
    fin.rotation.z=Math.PI/2-sign*(stealth?.48:.22);
    fin.position.set(sign*(stealth?1.65:.65),.12,-2.5);jet.add(fin);
    const intake=new THREE.Mesh(new THREE.BoxGeometry(.65,.48,1.55),dark);intake.position.set(sign*.78,-.16,.35);jet.add(intake);
  }
  ellipsoid(jet,glass,[0,.51,1.65],[.43,.43,1.34]);
  ellipsoid(jet,edge,[0,.25,3.65],[.13,.18,1.25]);
  const flames=[];
  for(const x of (stealth?[-.65,.65]:[0])){
    const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.38,.44,.65,12,true),dark);
    nozzle.rotation.x=Math.PI/2;nozzle.position.set(x,0,-4.5);jet.add(nozzle);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.35,.045,6,16),edge);rim.position.set(x,0,-4.85);jet.add(rim);
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.29,2,12),exhaust.clone());flame.rotation.x=-Math.PI/2;flame.position.set(x,0,-5.7);jet.add(flame);flames.push(flame);
  }
  const nav=[];
  for(const sign of [-1,1]) {
    const light=new THREE.Mesh(new THREE.SphereGeometry(.085,6,4),new THREE.MeshBasicMaterial({color:sign<0?0xff4d39:0x61ffce}));
    light.position.set(sign*(stealth?6.1:5),.12,-2.7);jet.add(light);nav.push(light);
  }
  jet.userData={flames,nav,core,stealth};return jet;
}
export function animateJet(jet,state={},time=0) {
  const boost=Boolean(state.afterburner||state.boosting||state.boost===true);
  for(const flame of jet.userData.flames||[]) {
    flame.scale.set(1,boost?1.8+.12*Math.sin(time*47):.65+.08*Math.sin(time*31),1);
    flame.material.opacity=boost?.95:.65;
  }
  for(const light of jet.userData.nav||[])light.visible=Math.sin(time*5)>-.7;
}
