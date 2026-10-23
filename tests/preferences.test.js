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
