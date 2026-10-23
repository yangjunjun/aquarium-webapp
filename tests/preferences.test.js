import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPreferences, normalizeTheme, resolveReducedMotion } from '../src/preferences.js';
import { createFish, createCrab, loadState } from '../src/simulation.js';
test('legacy saves gain nature and system motion defaults without losing residents', () => {
  const fish = [createFish()], crabs = [createCrab(0), createCrab(1)];
  const loaded = loadState(JSON.stringify({version:1,fish,crabs,night:true}));
  assert.deepEqual(loaded.fish,fish);assert.deepEqual(loaded.crabs,crabs);
  assert.equal(loaded.theme,'nature');assert.equal(loaded.reducedMotion,null);assert.equal(loaded.night,true);
});
test('all theme preferences survive reload and unknown values safely fall back', () => {
  for (const theme of ['nature','scifi','cthulhu']) {
    const loaded = loadState(JSON.stringify({version:1,fish:[createFish()],theme,reducedMotion:true}));
    assert.equal(loaded.theme,theme);assert.equal(loaded.reducedMotion,true);
  }
  assert.deepEqual(readPreferences({theme:'<script>',reducedMotion:'false'}),{theme:'nature',reducedMotion:null});
  assert.equal(normalizeTheme('__proto__'),'nature');
});
test('explicit motion preference overrides the system, old saves follow it', () => {
  assert.equal(resolveReducedMotion(null,true),true);
  assert.equal(resolveReducedMotion(false,true),false);
  assert.equal(resolveReducedMotion(true,false),true);
});

test('switching themes retains the exact residents, food and positions', async () => {
  const {selectTheme} = await import('../src/preferences.js');
  const state={theme:'nature',fish:[createFish()],crabs:[createCrab()],food:[{x:.5,y:.2}]};
  const fish=state.fish,crabs=state.crabs,food=state.food;
  const before=JSON.stringify({fish,crabs,food});
  for (const id of ['scifi','cthulhu','nature']) assert.equal(selectTheme(state,id),true);
  assert.equal(state.fish,fish);assert.equal(state.crabs,crabs);assert.equal(state.food,food);
  assert.equal(JSON.stringify({fish:state.fish,crabs:state.crabs,food:state.food}),before);
  assert.equal(selectTheme(state,'nature'),false);
});
test('half-second transition finishes, pauses, and skips for reduced motion', async () => {
  const {advanceTransition} = await import('../src/preferences.js');
  assert.equal(advanceTransition(0,.25),.5);assert.equal(advanceTransition(.9,.1),1);
  assert.equal(advanceTransition(.3,.1,{paused:true}),.3);
  assert.equal(advanceTransition(0,0,{reducedMotion:true}),1);
});
