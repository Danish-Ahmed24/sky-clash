/** Dependency-free, fixed-step deterministic flight; metres, seconds, quaternion XYZW. */
export const JETS = Object.freeze({falcon:{minSpeed:72,maxSpeed:235,boostSpeed:330,turn:1.05,roll:2.35},wraith:{minSpeed:65,maxSpeed:210,boostSpeed:290,turn:1.24,roll:2.05}});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const axis=(a,t)=>{const q=[0,0,0,Math.cos(t/2)];q[a]=Math.sin(t/2);return q;};
export function multiplyQuaternion(a,b){return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
export function forwardVector(q){return [2*(q[0]*q[2]+q[3]*q[1]),2*(q[1]*q[2]-q[3]*q[0]),1-2*(q[0]*q[0]+q[1]*q[1])];}
export function createFlightState(spawn={p:[0,180,0],q:[0,0,0,1]},jet='falcon'){
 const q=[...(spawn.q||[0,0,0,1])], speed=125, f=forwardVector(q);
 return {p:[...(spawn.p||[0,180,0])],q,v:f.map(n=>n*speed),speed,health:100,boost:1,throttle:.55,jet:JETS[jet]?jet:'falcon',collisionCooldown:0,dead:false};
}
/** Return earliest swept point/AABB intersection. Renderer must use identical building bounds. */
export function segmentBuilding(a,b,building,radius=0){
 const lo=[building.x-building.width/2-radius,-radius,building.z-building.depth/2-radius];
 const hi=[building.x+building.width/2+radius,building.height+radius,building.z+building.depth/2+radius];
 let enter=0,exit=1,normal=[0,1,0];
 for(let i=0;i<3;i++){
  const d=b[i]-a[i]; if(Math.abs(d)<1e-9){if(a[i]<lo[i]||a[i]>hi[i])return null;continue;}
  let t1=(lo[i]-a[i])/d,t2=(hi[i]-a[i])/d,n=-Math.sign(d);if(t1>t2)[t1,t2]=[t2,t1];
  if(t1>enter){enter=t1;normal=[0,0,0];normal[i]=n;}exit=Math.min(exit,t2);if(enter>exit)return null;
 }
 return enter>=0&&enter<=1?{t:enter,normal}:null;
}
export function stepFlight(s,input={},dt=1/30,buildings=[],bounds={halfSize:1800,minAltitude:8,maxAltitude:1100}){
 if(s.health<=0||s.dead){s.dead=true;return s;}dt=clamp(Number.isFinite(dt)?dt:1/30,0,.1);
 const cfg=JETS[s.jet]||JETS.falcon;
 const control=k=>clamp(Number.isFinite(input[k])?input[k]:0,-1,1);
 if(Number.isFinite(input.throttle))s.throttle=clamp(input.throttle,0,1);
 if(input.throttleUp)s.throttle=clamp(s.throttle+dt*.4,0,1);
 if(input.throttleDown)s.throttle=clamp(s.throttle-dt*.4,0,1);
 const boost=!!input.boost&&s.boost>.015;
 s.boost=clamp(s.boost+dt*(boost?-.22:.12),0,1);s.afterburner=boost;
 const target=cfg.minSpeed+(cfg.maxSpeed-cfg.minSpeed)*s.throttle+(boost?cfg.boostSpeed-cfg.maxSpeed:0);
 s.speed+=(target-s.speed)*(1-Math.exp(-dt*.9));
 let q=s.q;
 q=multiplyQuaternion(q,axis(0,-control('pitch')*cfg.turn*dt));
 q=multiplyQuaternion(q,axis(1,(control('yaw')*.65+control('rudder')*.65)*cfg.turn*dt));
 q=multiplyQuaternion(q,axis(2,-control('roll')*cfg.roll*dt));
 const len=Math.hypot(...q);s.q=q.map(n=>n/len);
 const f=forwardVector(s.q),response=1-Math.exp(-dt*5);
 s.v=s.v.map((v,i)=>v+(f[i]*s.speed-v)*response);
 const from=[...s.p],next=s.p.map((v,i)=>v+s.v[i]*dt);
 s.collisionCooldown=Math.max(0,(s.collisionCooldown||0)-dt);
 let earliest=null;
 for(const b of buildings){const hit=segmentBuilding(from,next,b,3);if(hit&&(!earliest||hit.t<earliest.t))earliest=hit;}
 if(earliest){
  const n=earliest.normal,normalSpeed=Math.abs(s.v.reduce((v,x,i)=>v+x*n[i],0));
  s.p=from.map((v,i)=>v+(next[i]-v)*Math.max(0,earliest.t-.002)+n[i]*.3);
  if(normalSpeed>100){s.health=0;s.dead=true;s.impact='crash';}
  else{
   if(!s.collisionCooldown){s.health=Math.max(0,s.health-(7+s.speed*.09+normalSpeed*.35));s.collisionCooldown=.22;}
   const dot=s.v.reduce((v,x,i)=>v+x*n[i],0);s.v=s.v.map((v,i)=>v-Math.min(0,dot)*n[i]);s.speed*=.985;s.impact='scrape';
  }
 }else{s.p=next;s.impact=null;}
 if(s.p[1]<bounds.minAltitude){s.p[1]=bounds.minAltitude;if(s.v[1]<-50){s.health=0;s.dead=true;}else{s.v[1]=Math.max(0,s.v[1]);s.health=Math.max(0,s.health-dt*30);}}
 if(s.p[1]>bounds.maxAltitude){s.p[1]=bounds.maxAltitude;s.v[1]=Math.min(0,s.v[1]);}
 for(const i of [0,2])if(Math.abs(s.p[i])>bounds.halfSize){s.p[i]=Math.sign(s.p[i])*bounds.halfSize;s.v[i]*=-.3;s.health=Math.max(0,s.health-dt*15);}
 s.dead=s.health<=0;return s;
}
