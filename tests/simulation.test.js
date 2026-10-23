import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFish, createCrab, updateCrabs, feed, update, loadState, MAX_FOOD } from '../src/simulation.js';
test('food attracts a fish and is consumed on contact',()=>{const f={...createFish(),x:.5,y:.4,vx:0,vy:0};const food=[{x:.65,y:.4,age:0}];update([f],food,.05,0);assert.ok(f.vx>0);food[0].x=f.x;food[0].y=f.y;update([f],food,.05,0);assert.equal(food.length,0);});
test('long simulation keeps fish inside tank',()=>{const fish=Array.from({length:24},(_,i)=>createFish(i));for(let i=0;i<20000;i++)update(fish,[],.05,i*.05);for(const f of fish){assert.ok(f.x>=.04&&f.x<=.96);assert.ok(f.y>=.1&&f.y<=.84);}});
test('food is bounded and expires',()=>{const food=[];for(let i=0;i<100;i++)feed(food,0,0);assert.equal(food.length,MAX_FOOD);for(let i=0;i<600;i++)update([],food,.05,0);assert.equal(food.length,0);});
test('storage rejects corrupted or unsafe data',()=>{for(const raw of ['oops','null','{}',JSON.stringify({version:1,fish:[{...createFish(),x:-1}]}),JSON.stringify({version:1,fish:[]})])assert.equal(loadState(raw),null);const fish=[createFish()];const legacy=loadState(JSON.stringify({version:1,fish,night:true}));assert.deepEqual(legacy.fish,fish);assert.equal(legacy.night,true);assert.equal(legacy.crabs.length,2);});

test('crabs move sideways, reverse at both edges, and remain bounded', () => {
  const crab = {...createCrab(), x: .879, vx: .022};
  updateCrabs([crab], .05);assert.equal(crab.x, .88);assert.ok(crab.vx < 0);
  crab.x = .121;crab.vx = -.022;
  updateCrabs([crab], .05);assert.equal(crab.x, .12);assert.ok(crab.vx > 0);
  const start = crab.x;updateCrabs([crab], 0);assert.equal(crab.x, start);
  for(let i=0;i<20000;i++){updateCrabs([crab], .05);assert.ok(crab.x>=.12&&crab.x<=.88);}
});
test('crab positions survive reload and corrupted crab data preserves fish', () => {
  const fish=[createFish()], crabs=[createCrab(0),createCrab(1)];
  assert.deepEqual(loadState(JSON.stringify({version:1,fish,crabs})).crabs,crabs);
  const restored=loadState(JSON.stringify({version:1,fish,crabs:[{x:-1}]}));
  assert.deepEqual(restored.fish,fish);assert.equal(restored.crabs.length,2);
});
