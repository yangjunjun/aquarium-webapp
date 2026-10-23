import { SPECIES } from '../simulation.js';
function fish(ctx, f, {w,h,time}) {
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
function crab(ctx, crab, {w,h,time}) {
  const s = crab.size;
  const gait = Math.sin(time * 12 + crab.phase);
  ctx.save();
  ctx.translate(crab.x * w, h * .925 + Math.abs(gait) * .6);
  // Sand shadow, four pairs of articulated walking legs, and two pincers.
  ctx.fillStyle = '#07171966';
  ctx.beginPath();ctx.ellipse(0, s * .5, s * 1.6, s * .25, 0, 0, Math.PI * 2);ctx.fill();
  ctx.lineCap = 'round';ctx.lineJoin = 'round';ctx.strokeStyle = '#a66348';ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const stride = Math.sin(time * 12 + crab.phase + i * Math.PI / 2 + side) * s * .12;
      ctx.beginPath();ctx.moveTo(side * s * .65, (i - 1.5) * s * .12);
      ctx.lineTo(side * s * (1.1 + i * .12), s * .08 + i * s * .08 + stride);
      ctx.lineTo(side * s * (1.35 + i * .08), s * .5 + stride);ctx.stroke();
    }
    ctx.strokeStyle = '#c77d58';ctx.lineWidth = 4;
    ctx.beginPath();ctx.moveTo(side * s * .65, -s * .15);
    ctx.lineTo(side * s * 1.1, -s * .55);ctx.lineTo(side * s * 1.25, -s * .9);ctx.stroke();
    ctx.fillStyle = '#d48c62';
    ctx.beginPath();ctx.ellipse(side * s * 1.25, -s * .95, s * .27, s * .34, side * .35, 0, Math.PI * 2);ctx.fill();
    ctx.strokeStyle = '#633f32';ctx.lineWidth = 1.5;
    ctx.beginPath();ctx.moveTo(side * s * 1.25, -s * 1.25);ctx.lineTo(side * s * 1.25, -s * .98);ctx.stroke();
  }
  const shellColor = ctx.createLinearGradient(0, -s * .55, 0, s * .45);
  shellColor.addColorStop(0, '#e4a777');shellColor.addColorStop(.55, '#bc7652');shellColor.addColorStop(1, '#754c3d');
  ctx.fillStyle = shellColor;ctx.beginPath();ctx.ellipse(0, 0, s, s * .55, 0, 0, Math.PI * 2);ctx.fill();
  ctx.strokeStyle = '#dbb18b';ctx.lineWidth = 2;
  for (const side of [-1, 1]) {
    ctx.beginPath();ctx.moveTo(side * s * .4, -s * .35);ctx.lineTo(side * s * .48, -s * .74);ctx.stroke();
    ctx.fillStyle = '#18272a';ctx.beginPath();ctx.arc(side * s * .48, -s * .74, 2.6, 0, Math.PI * 2);ctx.fill();
    ctx.fillStyle = '#f6e7c5';ctx.beginPath();ctx.arc(side * s * .48 + .7, -s * .78, .8, 0, Math.PI * 2);ctx.fill();
  }
  ctx.restore();
}
function background(ctx, {w,h,night,decorTime:time,plants,bubbles}) {
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#142840':'#285559');bg.addColorStop(.5,night?'#102131':'#163b3e');bg.addColorStop(1,night?'#091922':'#0b2528');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<5;i++){const x=(.1+i*.21+Math.sin(time*.15+i)*.025)*w;const g=ctx.createLinearGradient(x,0,x+100,h);g.addColorStop(0,night?'#8da8dc13':'#e5efb51c');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w*.08,0);ctx.lineTo(x+w*.3,h);ctx.lineTo(x+w*.05,h);ctx.fill();}ctx.restore();
  ctx.fillStyle=night?'#283032':'#424a3d';ctx.beginPath();ctx.moveTo(0,h*.91);ctx.bezierCurveTo(w*.3,h*.86,w*.6,h*.96,w,h*.88);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  for(let i=0;i<140;i++){const x=((i*127.33)%997)/997*w,y=h*(.92+((i*19)%71)/900);ctx.fillStyle=i%2?'#c1bc8c22':'#050e1a44';ctx.beginPath();ctx.ellipse(x,y,1+i%3,1,0,0,7);ctx.fill();}
  for(const [x,y,s] of [[.15,.88,70],[.85,.9,90],[.93,.87,50]]){const g=ctx.createLinearGradient(0,y*h-s,0,y*h);g.addColorStop(0,'#4a6560');g.addColorStop(1,'#223d3a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x*w,y*h,s,s*.37,-.15,0,7);ctx.fill();}
  for(const p of plants){ctx.strokeStyle=night?'#234d49':`hsl(${151+p.phase*3} 29% ${22+p.phase*2}%)`;ctx.lineWidth=p.width;ctx.lineCap='round';const x=p.x*w,y=h*.92,high=p.height*h,sway=Math.sin(time*.7+p.phase)*14;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-20,y-high*.4,x+20+sway,y-high*.7,x+sway,y-high);ctx.stroke();}
  for(const b of bubbles){const y=((b.y-time*b.s)%1+1)%1*h;ctx.strokeStyle='#bdede333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x*w+Math.sin(time+b.y*20)*5,y,b.r,0,7);ctx.stroke();}
}
function food(ctx,p,{w,h}) { ctx.fillStyle='#dcb470';ctx.beginPath();ctx.arc(p.x*w,p.y*h,2,0,Math.PI*2);ctx.fill(); }
export default { background, fish, crab, food };
