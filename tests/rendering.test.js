import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawScene, createScenery, availableThemes } from '../src/renderer.js';
import nature from '../src/themes/nature.js';
import scifi from '../src/themes/scifi.js';
import cthulhu from '../src/themes/cthulhu.js';

function recordingContext() {
  const calls=[];let balance=0;
  const ctx=new Proxy({}, {
    set(target,key,value){calls.push(['set',key,typeof value==='object'?'gradient':value]);target[key]=value;return true;},
    get(target,key){
      if(key==='calls')return calls;
      if(key==='balance')return balance;
      if(key.startsWith('create'))return (...args)=>{for(const n of args)assert.ok(Number.isFinite(n));return{addColorStop(offset,color){assert.ok(offset>=0&&offset<=1);assert.equal(typeof color,'string');}};};
      return (...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${key} received ${n}`);if(key==='save')balance++;if(key==='restore')balance--;assert.ok(balance>=0);calls.push([key,...args]);};
    },
  });return ctx;
}
const scenery=createScenery();
const residents={fish:[0,1,2].map(species=>({x:.3,y:.4,vx:.035,vy:0,size:24,phase:1,species})),crabs:[{x:.4,size:20,phase:1}],food:[{x:.5,y:.2}]};
test('all themes render finite coordinates at desktop, mobile, fullscreen and preview sizes',()=>{
  assert.deepEqual(availableThemes,['nature','scifi','cthulhu']);
  for(const theme of availableThemes)for(const [w,h] of [[1200,460],[320,420],[390,844],[320,110]])for(const night of [false,true])for(const reducedMotion of [false,true]){
    const ctx=recordingContext();drawScene(ctx,{...scenery,...residents,theme,w,h,night,reducedMotion,time:40});assert.equal(ctx.balance,0);assert.ok(ctx.calls.length>100);
  }
});
test('themes have distinct environment, fish, crab and food geometry',()=>{
  const signatures=[];
  for(const painter of [nature,scifi,cthulhu]){
    const ctx=recordingContext(),s={...scenery,w:800,h:460,night:false,time:40,decorTime:40,reducedMotion:false};
    painter.background(ctx,s);painter.fish(ctx,residents.fish[0],s);painter.crab(ctx,residents.crabs[0],s);painter.food(ctx,residents.food[0],s);signatures.push(JSON.stringify(ctx.calls));
  }
  assert.equal(new Set(signatures).size,3);
});
test('reduced-motion backgrounds do not vary with simulation time',()=>{
  for(const theme of availableThemes){
    const render=time=>{const ctx=recordingContext();drawScene(ctx,{...scenery,theme,w:800,h:460,night:false,reducedMotion:true,time,fish:[],crabs:[],food:[]});return ctx.calls;};
    assert.deepEqual(render(0),render(40));
  }
});
