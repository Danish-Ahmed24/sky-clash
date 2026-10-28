// Port Meridian: a deterministic, original coastal combat arena. All solid
// building meshes use these exact axis-aligned collision envelopes.
export const MAP_NAME = 'Port Meridian';
export const BOUNDS = Object.freeze({halfSize:1800,minAltitude:8,maxAltitude:1100});
const blocks=[];
function add(id,x,z,width,depth,height,style='glass',district='Meridian Core') {blocks.push(Object.freeze({id,x,z,width,depth,height,style,district}));}
// Generous 150–230 m flight streets split the skyline into readable districts.
for(let row=0;row<8;row++) for(let col=0;col<9;col++) {
 const x=-770+col*270,z=-1230+row*330;
 if((col===3||col===4)&&(row===3||row===4)) continue;
 const seed=(row*73+col*41+19)%97;
 const h=55+seed*2.6;
 add(`block-${row}-${col}`,x,z,90+(seed%3)*15,100+(seed%4)*12,h,seed%3===0?'ivory':seed%3===1?'glass':'charcoal',col<2?'Harbour Reach':row<3?'Northbank':'Meridian Core');
}
add('meridian-one',110,0,130,150,550,'glass');
add('meridian-two',380,0,115,130,490,'charcoal');
add('lighthouse',-1010,-950,55,55,175,'ivory','Harbour Reach');
// Roof installations fit inside their buildings' collision envelopes: painted
// roof pads and inset skylights provide detail without invisible obstacles.
export const BUILDINGS=Object.freeze(blocks);
export const SPAWNS=Object.freeze(Array.from({length:10},(_,i)=>{
 const a=i*Math.PI*2/10;
 const p=[Math.sin(a)*1450,650+(i%3)*55,Math.cos(a)*1450];
 // Heading toward the city, forward local +Z.
 const yaw=a+Math.PI;
 return Object.freeze({p,q:[0,Math.sin(yaw/2),0,Math.cos(yaw/2)]});
}));
