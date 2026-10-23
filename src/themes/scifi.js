import { ellipse, line, glow, fishTransform, bodyGradient } from './primitives.js';

function background(ctx, {w,h,night,decorTime:t,bubbles,reducedMotion}) {
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#0a152b':'#142f4b');bg.addColorStop(.6,night?'#0a1225':'#0b2437');bg.addColorStop(1,'#090f1c');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  // Distant bulkhead and a gridded observation window.
  ctx.strokeStyle=night?'#4f91bd10':'#4f91bd22';ctx.lineWidth=1;
  for(let x=0;x<w;x+=Math.max(38,w/20)){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h*.88);ctx.stroke();}
  for(let y=0;y<h*.9;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(const side of [.07,.93]){
    const x=side*w;ctx.fillStyle='#0a1425';ctx.fillRect(x-9,0,18,h*.9);
    line(ctx,[[x-8,0],[x-8,h*.84],[x+(side<.5?50:-50),h*.9]],'#3b5e75',3);
    line(ctx,[[x+3,0],[x+3,h*.86]],'#81d8ed30',2);
    for(let i=0;i<6;i++)ctx.fillRect(x-12,h*(.12+i*.13),24,7);
  }
  // Energy columns are visible silhouettes, not merely a recolored plant.
  for(const [fraction,height] of [[.19,.47],[.81,.34]]){
    const x=fraction*w,y=h*.89,top=y-height*h;
    const pulse=reducedMotion ? .7 : .68+Math.sin(t*1.1+fraction*9)*.12;
    glow(ctx,x,top+height*h*.5,Math.min(120,w*.16),night?'#3e83e416':'#42ceec24');
    ctx.fillStyle='#122f43';ctx.fillRect(x-17,top,34,height*h);
    line(ctx,[[x-17,top],[x-17,y],[x+17,y],[x+17,top]],'#56798c',2);
    ctx.fillStyle=`rgba(95,225,237,${pulse})`;ctx.fillRect(x-3,top+8,6,height*h-8);
    for(let i=0;i<5;i++){ctx.fillStyle='#284253';ctx.fillRect(x-24,top+i*height*h/5,48,9);ctx.fillStyle='#82e0e7';ctx.fillRect(x-20,top+3+i*height*h/5,8,2);}
    ellipse(ctx,x,top,23,7,'#405e72');ellipse(ctx,x,top,15,3,'#9ef4f1');
    ctx.fillStyle='#162333';ctx.fillRect(x-32,y-4,64,17);
  }
  // Floor panels, conduits and runway strips.
  ctx.fillStyle='#142333';ctx.fillRect(0,h*.89,w,h*.11);
  for(let i=0;i<12;i++){const x=i*w/11;line(ctx,[[w*.5+(x-w*.5)*.8,h*.89],[x,h]],'#35506880');}
  line(ctx,[[0,h*.89],[w,h*.89]],'#7db5cb80',2);
  for(const y of [.91,.975])line(ctx,[[0,h*y],[w,h*y]],'#4b738666');
  for(let i=0;i<16;i++){ctx.fillStyle=i%3?'#55d5df77':'#b995ec88';ctx.fillRect(i*w/16+5,h*.91,w/27,2);}
  // Slowly moving scan, explicitly disabled by the reduced-motion preference.
  if(!reducedMotion){const scan=((t*.035)%1)*h*.88;const g=ctx.createLinearGradient(0,scan-22,0,scan+1);g.addColorStop(0,'#77f1ff00');g.addColorStop(1,night?'#77f1ff0c':'#77f1ff20');ctx.fillStyle=g;ctx.fillRect(0,scan-22,w,23);}
  for(const b of bubbles){const y=((b.y-t*b.s*.38)%1+1)%1*h*.88;const x=b.x*w+Math.sin(t*.3+b.y*12)*4;ctx.fillStyle=b.r>2?'#a8b7ec77':'#83e6eb77';ctx.fillRect(x,y,b.r,b.r);}
}
function fish(ctx,f,s){
  fishTransform(ctx,f,s);const size=f.size,t=s.time;
  const color=['#7ce9ed','#b4a2f6','#8ac4f0'][f.species];
  const tail=Math.sin(t*8+f.phase)*size*.1;
  line(ctx,[[-size*.7,0],[-size*1.25,tail]],'#688aa3',3);
  ctx.fillStyle=color+'66';ctx.beginPath();ctx.moveTo(-size*.9,0);ctx.lineTo(-size*1.4,-size*.5+tail);ctx.lineTo(-size*1.4,size*.5+tail);ctx.closePath();ctx.fill();
  if(f.species===1){
    ellipse(ctx,0,0,size,size*.44,'#8dbeef24');ctx.strokeStyle='#bbeaf49c';ctx.lineWidth=1;ctx.stroke();
    line(ctx,[[-size*.65,0],[size*.65,0]],'#d2d5ff',1.5);
    for(let i=-2;i<3;i++)line(ctx,[[size*i*.22,-size*.28],[size*i*.22,size*.28]],'#acbafc77');
    glow(ctx,0,0,size*.8,'#bca3f066');ellipse(ctx,0,0,size*.14,size*.14,'#e8dfff');
  }else{
    ellipse(ctx,0,0,size,size*.42,bodyGradient(ctx,size,['#b8d1d9','#3a6075','#132c40']));
    line(ctx,[[-size*.4,-size*.35],[-size*.15,0],[-size*.4,size*.35]],'#0a2639',2);
    line(ctx,[[size*.2,-size*.36],[size*.38,0],[size*.2,size*.36]],'#0a2639',2);
    line(ctx,[[-size*.6,0],[size*.3,0]],color,2);
    ellipse(ctx,size*.07,-size*.05,size*.12,size*.12,color);
  }
  ctx.fillStyle='#3c657a';ctx.beginPath();ctx.moveTo(-size*.25,-size*.35);ctx.lineTo(size*.1,-size*.77);ctx.lineTo(size*.5,-size*.3);ctx.fill();
  ellipse(ctx,size*.68,-size*.06,size*.1,size*.1,'#0c2130');ellipse(ctx,size*.7,-size*.07,size*.055,size*.055,color);
  line(ctx,[[-size*.9,-2],[-size*1.1,-2]],color,2);
}
function crab(ctx,c,{w,h,time:t}){
  const s=c.size;ctx.translate(c.x*w,h*.925);
  ellipse(ctx,0,s*.52,s*1.65,s*.22,'#02091488');
  for(const side of [-1,1]){
    for(let i=0;i<4;i++){
      const gait=Math.sin(t*12+c.phase+i*Math.PI/2+side)*s*.1;
      const joint=[side*s*(1.06+i*.13),s*.05+i*s*.08+gait];
      line(ctx,[[side*s*.6,(i-1.5)*s*.12],joint,[side*s*(1.4+i*.1),s*.5+gait]],'#657e91',3);
      ellipse(ctx,...joint,2,2,'#74e8eb');
    }
    line(ctx,[[side*s*.7,-s*.1],[side*s*1.1,-s*.58],[side*s*1.2,-s*.9]],'#6b8ba0',4);
    line(ctx,[[side*s*1.4,-s*1.14],[side*s*1.2,-s*.85],[side*s*.98,-s*1.17]],'#b1d0d8',3);
  }
  ctx.fillStyle=bodyGradient(ctx,s,['#8caaba','#315367','#172c41']);ctx.beginPath();ctx.moveTo(-s,-s*.2);ctx.lineTo(-s*.6,-s*.6);ctx.lineTo(s*.6,-s*.6);ctx.lineTo(s,-s*.2);ctx.lineTo(s*.7,s*.4);ctx.lineTo(-s*.7,s*.4);ctx.closePath();ctx.fill();
  line(ctx,[[-s*.6,-s*.1],[s*.6,-s*.1]],'#7cf1ed',2);
  for(const side of [-1,1]){ctx.fillStyle='#adc4d3';ctx.fillRect(side*s*.45-2,-s*.83,4,s*.3);ellipse(ctx,side*s*.45,-s*.83,3,3,'#9cfcff');}
  ellipse(ctx,0,s*.17,3,2,'#b4a4ef');
}
function food(ctx,p,{w,h}){
  const x=p.x*w,y=p.y*h;glow(ctx,x,y,10,'#89eaf54a');
  ctx.fillStyle='#d5faff';ctx.fillRect(x-1.5,y-3,3,6);ctx.fillStyle='#5cb8d8';ctx.fillRect(x-1.5,y,3,3);
}
export default {background,fish,crab,food};
