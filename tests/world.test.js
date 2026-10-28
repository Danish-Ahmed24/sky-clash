import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILDINGS,BOUNDS,SPAWNS} from '../shared/world.js';
test('ten spawns have aircraft-sized building clearance and lie in bounds',()=>{
 assert.equal(SPAWNS.length,10);
 for(const {p,q} of SPAWNS){assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(p[0])<BOUNDS.halfSize-20&&Math.abs(p[2])<BOUNDS.halfSize-20);assert.ok(p[1]>BOUNDS.minAltitude+20&&p[1]<BOUNDS.maxAltitude-20);assert.ok(Math.abs(Math.hypot(...q)-1)<1e-10);for(const b of BUILDINGS)assert.ok(Math.abs(p[0]-b.x)>b.width/2+20||Math.abs(p[2]-b.z)>b.depth/2+20||p[1]>b.height+20);}
});
test('landmark crown volumes and footprint form stepped solid silhouettes',()=>{
 for(const id of ['meridian-one','meridian-two']){const tiers=BUILDINGS.filter(b=>b.id.startsWith(id));assert.equal(tiers.length,3);assert.ok(tiers[0].height<tiers[1].height&&tiers[1].height<tiers[2].height);assert.ok(tiers[0].width>tiers[1].width&&tiers[1].width>tiers[2].width);}
 assert.equal(Math.max(...BUILDINGS.map(b=>b.height)),550);
});
