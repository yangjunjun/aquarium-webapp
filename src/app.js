import { createFish, loadState, feed, update, MAX_FISH, SPECIES } from './simulation.js';
const $ = id => document.getElementById(id);
const canvas = $('tank'), ctx = canvas.getContext('2d');
let stored;
try { stored = loadState(localStorage.getItem('aquarium-v1')); } catch { /* Storage can be unavailable. */ }
let fish = stored?.fish ?? Array.from({length:8}, (_,i) => createFish(i));
let night = stored?.night ?? false, paused = false, food = [], time = 0, previous = 0, w = 0, h = 0;
const bubbles = Array.from({length:28}, () => ({x:Math.random(),y:Math.random(),r:1+Math.random()*2,s:.02+Math.random()*.03}));
const plants = Array.from({length:44}, (_,i) => ({x:i<22 ? .02+Math.random()*.24 : .73+Math.random()*.26, height:.12+Math.random()*.32,phase:Math.random()*6,width:4+Math.random()*8}));
let noticeTimer;
function notify(message) { $('notice').textContent = message; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => $('notice').textContent = '', 3500); }
function save() { try { localStorage.setItem('aquarium-v1',JSON.stringify({version:1,fish,night})); } catch { notify('浏览器未允许保存，当前鱼缸仍可正常使用'); } }
function refresh() {
  $('count').textContent = fish.length; $('add').disabled = fish.length >= MAX_FISH;
  $('pause').textContent = paused ? '▷ 继续' : 'Ⅱ 暂停'; $('pause').setAttribute('aria-pressed',String(paused));
  $('paused').hidden = !paused; $('activity').textContent = paused ? '时光暂停' : food.length ? '开饭啦' : '悠然游弋';
  $('food-count').textContent = food.length ? `还有 ${food.length} 粒鱼食正在下沉` : '水草轻摇，气泡上升';
  document.body.classList.toggle('night',night); $('light').textContent = night ? '☾ 月光模式' : '☼ 日光模式';
  $('light').setAttribute('aria-pressed',String(night)); $('mode-label').textContent = night ? 'MOONLIGHT / 24°C' : 'DAYLIGHT / 24°C';
  $('feed').disabled = paused; $('hint').textContent = paused ? '继续后即可投喂' : '点击水面，撒下一点鱼食';
}
function giveFood(x,y) { if(paused) return notify('先继续水下时光，再投喂吧'); feed(food,x,y); refresh(); }
const shell = canvas.closest('.tank-shell');
function syncFullscreen() {
  const active = document.fullscreenElement === shell || shell.classList.contains('is-expanded');
  $('fullscreen').textContent = active ? '⛶ 退出全屏' : '⛶ 全屏';
  $('fullscreen').setAttribute('aria-pressed', String(active));
  $('fullscreen').setAttribute('aria-label', active ? '退出鱼缸全屏' : '全屏查看鱼缸');
}
function closeExpanded() {
  shell.classList.remove('is-expanded');
  document.body.classList.remove('tank-expanded');
  syncFullscreen();
  $('fullscreen').focus();
}
$('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement === shell) await document.exitFullscreen();
    else if (shell.classList.contains('is-expanded')) closeExpanded();
    else if (shell.requestFullscreen && document.fullscreenEnabled) await shell.requestFullscreen();
    else {
      shell.classList.add('is-expanded');
      document.body.classList.add('tank-expanded');
    }
  } catch {
    // Embedded browsers may deny native fullscreen; retain an in-page alternative.
    shell.classList.add('is-expanded');
    document.body.classList.add('tank-expanded');
  }
  syncFullscreen();
};
document.addEventListener('fullscreenchange', syncFullscreen);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && shell.classList.contains('is-expanded')) closeExpanded();
});
$('feed').onclick = () => giveFood(.3+Math.random()*.4,.12);
canvas.addEventListener('pointerdown', e => { const r=canvas.getBoundingClientRect(); giveFood((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height); });
canvas.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();giveFood(.5,.12);} });
$('add').onclick = () => { if(fish.length>=MAX_FISH)return; fish.push(createFish(fish.length));save();refresh();notify('新伙伴加入了鱼缸'); };
$('light').onclick = () => { night=!night;save();refresh(); };
$('pause').onclick = () => { paused=!paused;refresh(); };
$('clear').onclick = () => { food=[];refresh();notify('剩余鱼食已清理'); };
$('reset').onclick = () => { if(!confirm('将恢复初始的 8 尾鱼和日光模式，确定重置？'))return; fish=Array.from({length:8},(_,i)=>createFish(i));food=[];night=false;paused=false;save();refresh();notify('鱼缸已恢复初始状态'); };
new ResizeObserver(() => { const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0); }).observe(canvas);
function drawFish(f) {
  ctx.save();ctx.translate(f.x*w,f.y*h);ctx.scale(f.vx>=0?1:-1,1);ctx.rotate(Math.atan2(f.vy,Math.abs(f.vx)+.01)*.35);
  const s=f.size, tail=Math.sin(time*7+f.phase)*.16, color=SPECIES[f.species];
  ctx.shadowColor=color+'44';ctx.shadowBlur=12;ctx.fillStyle=color;ctx.globalAlpha=.8;
  ctx.beginPath();ctx.moveTo(-s*.6,0);ctx.lineTo(-s*(1.3+tail),-s*.48);ctx.quadraticCurveTo(-s*.95,0,-s*(1.3-tail),s*.48);ctx.closePath();ctx.fill();
  const g=ctx.createLinearGradient(0,-s*.5,0,s*.5);g.addColorStop(0,'#f6e8c7');g.addColorStop(.45,color);g.addColorStop(1,'#465d59');ctx.fillStyle=g;ctx.globalAlpha=1;
  ctx.beginPath();ctx.ellipse(0,0,s,s*.42,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.45;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-s*.4,-s*.2);ctx.quadraticCurveTo(-s*.2,-s*.95,s*.45,-s*.25);ctx.fill();
  ctx.beginPath();ctx.moveTo(0,s*.15);ctx.lineTo(-s*.35,s*.7);ctx.lineTo(s*.4,s*.25);ctx.fill();
  if(f.species===1){ctx.strokeStyle='#b9ede1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-s*.7,0);ctx.lineTo(s*.6,0);ctx.stroke();}
  if(f.species===2){ctx.strokeStyle='#514d46';ctx.lineWidth=3;for(const x of [-.3,.1,.5]){ctx.beginPath();ctx.moveTo(s*x,-s*.32);ctx.lineTo(s*x,s*.32);ctx.stroke();}}
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.fillStyle='#142527';ctx.beginPath();ctx.arc(s*.66,-s*.07,2.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s*.69,-s*.1,.7,0,Math.PI*2);ctx.fill();ctx.restore();
}
function draw() {
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#142840':'#285559');bg.addColorStop(.5,night?'#102131':'#163b3e');bg.addColorStop(1,night?'#091922':'#0b2528');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<5;i++){const x=(.1+i*.21+Math.sin(time*.15+i)*.025)*w;const g=ctx.createLinearGradient(x,0,x+100,h);g.addColorStop(0,night?'#8da8dc13':'#e5efb51c');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w*.08,0);ctx.lineTo(x+w*.3,h);ctx.lineTo(x+w*.05,h);ctx.fill();}ctx.restore();
  ctx.fillStyle=night?'#283032':'#424a3d';ctx.beginPath();ctx.moveTo(0,h*.91);ctx.bezierCurveTo(w*.3,h*.86,w*.6,h*.96,w,h*.88);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  for(let i=0;i<140;i++){const x=((i*127.33)%997)/997*w,y=h*(.92+((i*19)%71)/900);ctx.fillStyle=i%2?'#c1bc8c22':'#050e1a44';ctx.beginPath();ctx.ellipse(x,y,1+i%3,1,0,0,7);ctx.fill();}
  for(const [x,y,s] of [[.15,.88,70],[.85,.9,90],[.93,.87,50]]){const g=ctx.createLinearGradient(0,y*h-s,0,y*h);g.addColorStop(0,'#4a6560');g.addColorStop(1,'#223d3a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x*w,y*h,s,s*.37,-.15,0,7);ctx.fill();}
  for(const p of plants){ctx.strokeStyle=night?'#234d49':`hsl(${151+p.phase*3} 29% ${22+p.phase*2}%)`;ctx.lineWidth=p.width;ctx.lineCap='round';const x=p.x*w,y=h*.92,high=p.height*h,sway=Math.sin(time*.7+p.phase)*14;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-20,y-high*.4,x+20+sway,y-high*.7,x+sway,y-high);ctx.stroke();}
  for(const b of bubbles){const y=((b.y-time*b.s)%1+1)%1*h;ctx.strokeStyle='#bdede333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x*w+Math.sin(time+b.y*20)*5,y,b.r,0,7);ctx.stroke();}
  for(const p of food){ctx.fillStyle='#dcb470';ctx.beginPath();ctx.arc(p.x*w,p.y*h,2,0,7);ctx.fill();}
  fish.forEach(drawFish);
  const shade=ctx.createRadialGradient(w*.5,h*.4,h*.15,w*.5,h*.4,w*.7);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#03151988');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
}
function frame(now){const dt=previous?Math.min((now-previous)/1000,.05):0;previous=now;if(!paused&&!document.hidden){time+=dt;update(fish,food,dt,time);}draw();requestAnimationFrame(frame);}
setInterval(refresh,500);setInterval(save,5000);window.addEventListener('pagehide',save);refresh();requestAnimationFrame(frame);
