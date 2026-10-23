// Optional browser regression: npm install --no-save --package-lock=false playwright@1.56.1
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const server = spawn(process.execPath, ['server.mjs'], {env: {...process.env, PORT:'4173'}, stdio:'pipe'});
let browser;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let i=0;i<50;i++) {
    try { const r=await fetch('http://localhost:4173/');if(r.ok){ready=true;break;} } catch { /* Wait for server. */ }
    await delay(100);
  }
  assert.ok(ready,'development server started');
  browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const context = await browser.newContext({viewport:{width:1360,height:1100},reducedMotion:'no-preference'});
  const page = await context.newPage(), errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/favicon.ico',route=>route.fulfill({status:204}));
  await page.addInitScript(() => {
    if (!localStorage.getItem('aquarium-v1')) localStorage.setItem('aquarium-v1',JSON.stringify({
      version:1,night:false,fish:[0,1,2].map(species=>({x:.3+species*.18,y:.4,vx:.035,vy:0,size:24,species,phase:1})),
      crabs:[{x:.3,vx:.022,size:20,phase:1},{x:.7,vx:-.022,size:21,phase:2}],
    }));
  });
  await page.goto('http://localhost:4173/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#tank').width>0);
  assert.equal(await page.locator('body').getAttribute('data-theme'),'nature');
  assert.equal(await page.locator('#count').innerText(),'3');
  await page.locator('#pause').click();
  await page.locator('#light').click(); // Save the paused state as a stable comparison baseline.
  const residents=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('aquarium-v1'));return {fish:s.fish,crabs:s.crabs};});
  await page.locator('#light').click();
  await mkdir('artifacts',{recursive:true});
  const snapshots=[];
  for (const id of ['nature','scifi','cthulhu']) {
    await page.locator(`.theme-card[data-theme="${id}"]`).click();
    assert.equal(await page.locator('body').getAttribute('data-theme'),id);
    const saved=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('aquarium-v1'));return {fish:s.fish,crabs:s.crabs};});
    assert.deepEqual(saved,residents,'theme switching must preserve residents');
    await page.waitForTimeout(80);
    const first=await page.locator('#tank').evaluate(c=>c.toDataURL());
    await page.waitForTimeout(130);
    assert.equal(await page.locator('#tank').evaluate(c=>c.toDataURL()),first,'pause freezes the entire scene');
    snapshots.push(first);
    await page.screenshot({path:`artifacts/${id}-desktop.png`,fullPage:true});
    await page.locator('#light').click();await page.waitForTimeout(80);
    assert.notEqual(await page.locator('#tank').evaluate(c=>c.toDataURL()),first,'lighting changes render');
    await page.locator('#light').click();
  }
  assert.equal(new Set(snapshots).size,3,'all three themes look different');
  await page.locator('#motion').click();
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('body').getAttribute('data-theme'),'cthulhu');
  assert.equal(await page.locator('#motion').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#count').innerText(),'3');
  await page.locator('#add').click();assert.equal(await page.locator('#count').innerText(),'4');
  await page.locator('#feed').click();
  assert.match(await page.locator('#food-count').innerText(),/碎屑/);
  await page.locator('#pause').click();assert.equal(await page.locator('#feed').isDisabled(),true);
  const foodBefore=(await page.locator('#food-count').innerText()).match(/\d+/)?.[0];
  await page.locator('.theme-card[data-theme="scifi"]').click();
  assert.equal((await page.locator('#food-count').innerText()).match(/\d+/)?.[0],foodBefore,'theme switching retains food');
  await page.locator('#clear').click();assert.match(await page.locator('#food-count').innerText(),/能量循环/);

  // Both the browser Fullscreen API and a denied-API fallback must remain usable.
  await page.locator('#fullscreen').click();
  await page.waitForFunction(()=>document.fullscreenElement||document.querySelector('.tank-shell').classList.contains('is-expanded'));
  await page.locator('#theme-select').selectOption('cthulhu');
  assert.equal(await page.locator('body').getAttribute('data-theme'),'cthulhu');
  assert.equal(await page.locator('.tank-toolbar [data-action="pause"]').isVisible(),true);
  await page.locator('.tank-toolbar [data-action="motion"]').click();
  await page.locator('#fullscreen').click();
  await page.waitForFunction(()=>!document.fullscreenElement&&!document.querySelector('.tank-shell').classList.contains('is-expanded'));
  await page.evaluate(()=>{document.querySelector('.tank-shell').requestFullscreen=()=>Promise.reject(new Error('denied for test'));});
  await page.locator('#fullscreen').click();
  await page.waitForFunction(()=>document.querySelector('.tank-shell').classList.contains('is-expanded'));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'false');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no mobile horizontal overflow');
  await page.locator('#fullscreen').click();await page.waitForTimeout(100);
  const box=await page.locator('#tank').boundingBox();assert.ok(Math.abs(box.height-844)<3,'expanded canvas fills phone');
  await page.locator('#theme-select').selectOption('scifi');
  await page.screenshot({path:'artifacts/scifi-mobile-fullscreen.png'});
  await page.keyboard.press('Escape');
  await page.locator('#pause').click();
  await page.locator('#tank').focus();await page.keyboard.press('Enter');
  assert.match(await page.locator('#food-count').innerText(),/胶囊/);
  page.once('dialog',dialog=>dialog.accept());await page.locator('#reset').click();
  assert.equal(await page.locator('#count').innerText(),'8');
  assert.equal(await page.locator('body').getAttribute('data-theme'),'scifi');
  // Exercise rapid switching and the 500 ms transition while the simulation runs.
  await page.locator('#motion').evaluate(b=>{if(b.getAttribute('aria-pressed')==='true')b.click();});
  for(const id of ['nature','cthulhu','scifi','nature'])await page.locator(`.theme-card[data-theme="${id}"]`).click();
  await page.waitForTimeout(650);assert.equal(await page.locator('body').getAttribute('data-theme'),'nature');
  await page.screenshot({path:'artifacts/nature-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'no browser runtime errors');
  // A separate context validates the OS motion preference and unavailable storage.
  const restricted=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const privatePage=await restricted.newPage();privatePage.on('pageerror',e=>errors.push(e.message));
  await privatePage.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('storage unavailable');};});
  await privatePage.goto('http://localhost:4173/',{waitUntil:'networkidle'});
  assert.equal(await privatePage.locator('#motion').getAttribute('aria-pressed'),'true');
  await privatePage.locator('.theme-card[data-theme="cthulhu"]').click();
  assert.match(await privatePage.locator('#save-status').innerText(),/保存不可用/);
  assert.equal(await privatePage.locator('body').getAttribute('data-theme'),'cthulhu');
  assert.deepEqual(errors,[]);
  console.log('Chromium passed: legacy migration, all theme renders, resident/food preservation, pause, lighting, preferences, reload, feeding, fullscreens, Escape, mobile, reset, rapid switching and storage failure.');
} finally {
  if (browser) await browser.close();
  server.kill();
}
