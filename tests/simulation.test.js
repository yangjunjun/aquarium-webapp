import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFish, feed, update, loadState, MAX_FOOD } from '../src/simulation.js';
test('food attracts a fish and is consumed on contact',()=>{const f={...createFish(),x:.5,y:.4,vx:0,vy:0};const food=[{x:.65,y:.4,age:0}];update([f],food,.05,0);assert.ok(f.vx>0);food[0].x=f.x;food[0].y=f.y;update([f],food,.05,0);assert.equal(food.length,0);});
test('long simulation keeps fish inside tank',()=>{const fish=Array.from({length:24},(_,i)=>createFish(i));for(let i=0;i<20000;i++)update(fish,[],.05,i*.05);for(const f of fish){assert.ok(f.x>=.04&&f.x<=.96);assert.ok(f.y>=.1&&f.y<=.84);}});
test('food is bounded and expires',()=>{const food=[];for(let i=0;i<100;i++)feed(food,0,0);assert.equal(food.length,MAX_FOOD);for(let i=0;i<600;i++)update([],food,.05,0);assert.equal(food.length,0);});
test('storage rejects corrupted or unsafe data',()=>{for(const raw of ['oops','null','{}',JSON.stringify({version:1,fish:[{...createFish(),x:-1}]}),JSON.stringify({version:1,fish:[]})])assert.equal(loadState(raw),null);const fish=[createFish()];assert.deepEqual(loadState(JSON.stringify({version:1,fish,night:true})),{fish,night:true});});
