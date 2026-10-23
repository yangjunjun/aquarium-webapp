import { ellipse, line, glow, fishTransform, bodyGradient } from './primitives.js';

function rune(ctx,x,y,size,color){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,size*.7,0,Math.PI*1.7);ctx.stroke();
  line(ctx,[[-size*.45,-size*.4],[size*.3,size*.5],[0,size*.1],[size*.55,-size*.45]],color);
  line(ctx,[[0,-size],[0,-size*.55]],color);
  ctx.restore();
}
function tentacle(ctx,x,y,length,width,t,phase,color){
  ctx.strokeStyle=color;ctx.lineCap='round';
  let px=x,py=y;
  for(let i=1;i<=12;i++){
    const fraction=i/12;
    const nx=x+Math.sin(fraction*4+phase+t*.35)*length*fraction*.23;
    const ny=y-length*fraction;
    ctx.lineWidth=Math.max(.8,width*(1-fraction)+1);
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();
    if(i%2===0)ellipse(ctx,nx+width*(1-fraction)*.22,ny,width*(1-fraction)*.13+1,1.4,'#b1c38733');
    px=nx;py=ny;
  }
}
function distantPresence(ctx,w,h,t){
  // A silhouette visits for 12 seconds per 58-second cycle, never in reduced motion.
  const cycle=t%58;if(cycle<34||cycle>46)return;
  const progress=(cycle-34)/12;
  ctx.save();ctx.globalAlpha=Math.sin(progress*Math.PI)*.22;
  const x=(-.45+progress*1.9)*w,y=h*.27;
  ellipse(ctx,x,y,w*.29,h*.12,'#090d1c');
  for(let i=0;i<6;i++){
    ctx.strokeStyle='#090d1c';ctx.lineWidth=9-i;
    ctx.beginPath();ctx.moveTo(x-w*.18,y+h*.05);
    ctx.bezierCurveTo(x-w*.3,y+h*(.17+i*.015),x-w*.38,y+h*.02,x-w*.5,y+Math.sin(t*.6+i)*h*.1);ctx.stroke();
  }
  ctx.restore();
}
function background(ctx,{w,h,night,decorTime:t,bubbles,reducedMotion}){
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#101827':'#25323b');bg.addColorStop(.5,night?'#112027':'#193d3b');bg.addColorStop(1,'#0e1c23');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  glow(ctx,w*.49,h*.42,Math.max(w,h)*.47,night?'#81b17f12':'#a8d69b24');
  // Distant ruins form a broken skyline.
  ctx.fillStyle='#13262d';
  for(let i=0;i<13;i++){const top=h*(.5+Math.sin(i*2.8)*.13);ctx.fillRect(i*w/12,top,w*.048,h-top);}
  if(!reducedMotion)distantPresence(ctx,w,h,t);
  // Temple staircase and the central portal.
  const cx=w*.52,ground=h*.89,scale=Math.min(w/850,h/460);
  for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#32413d':'#293a38';ctx.fillRect(cx-(100+i*16)*scale,ground-(20-i*5)*scale,(200+i*32)*scale,6*scale);}
  const archTop=ground-165*scale,archWidth=95*scale;
  ctx.strokeStyle='#3b4d43';ctx.lineWidth=19*scale;ctx.beginPath();ctx.moveTo(cx-archWidth*.5,ground-18*scale);ctx.lineTo(cx-archWidth*.5,archTop+35*scale);ctx.quadraticCurveTo(cx,archTop-30*scale,cx+archWidth*.5,archTop+35*scale);ctx.lineTo(cx+archWidth*.5,ground-18*scale);ctx.stroke();
  ctx.strokeStyle='#7e95634d';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(cx-archWidth*.4,ground-20*scale);ctx.lineTo(cx-archWidth*.4,archTop+35*scale);ctx.quadraticCurveTo(cx,archTop-18*scale,cx+archWidth*.4,archTop+35*scale);ctx.lineTo(cx+archWidth*.4,ground-20*scale);ctx.stroke();
  glow(ctx,cx,archTop+74*scale,75*scale,night?'#add89512':'#add89522');
  rune(ctx,cx,archTop+75*scale,22*scale,'#c7e99b88');
  // Foreground fractured columns with glowing inscriptions.
  for(const [fraction,height,tilt] of [[.16,.43,-.08],[.83,.34,.13],[.91,.22,-.2]]){
    ctx.save();ctx.translate(fraction*w,ground);ctx.rotate(tilt);
    const ph=h*height,pw=Math.min(35,w*.055);
    ctx.fillStyle='#394b43';ctx.beginPath();ctx.moveTo(-pw,0);ctx.lineTo(-pw*.8,-ph);ctx.lineTo(-pw*.1,-ph-9);ctx.lineTo(pw*.2,-ph+5);ctx.lineTo(pw*.8,-ph);ctx.lineTo(pw,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='#52604a';ctx.fillRect(-pw*1.05,-ph+12,pw*2.1,8);ctx.fillRect(-pw*1.2,-7,pw*2.4,12);
    line(ctx,[[-pw*.35,-ph+25],[pw*.2,-ph*.55],[-pw*.4,-ph*.43],[pw*.05,-ph*.15]],'#142c2c',2);
    for(let j=0;j<3;j++)rune(ctx,0,-ph*(.22+j*.24),7,'#b7d88c88');
    ctx.restore();
  }
  // Dark silt and scattered stones.
  ctx.fillStyle='#2a3833';ctx.beginPath();ctx.moveTo(0,h*.91);ctx.bezierCurveTo(w*.3,h*.88,w*.6,h*.94,w,h*.9);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  for(let i=0;i<35;i++){const x=((i*73)%101)/101*w,y=h*(.93+(i%5)*.012);ellipse(ctx,x,y,3+i%6,1.5+i%3,i%2?'#4e554144':'#0b1c2688');}
  for(let i=0;i<13;i++){
    const left=i<7,x=left?(i*.023+.015)*w:(.86+(i-7)*.026)*w;
    tentacle(ctx,x,h*.94,h*(.15+(i%4)*.06),10+i%4,t,i*1.7,i%2?'#466451':'#344b4b');
  }
  // Diffuse fog stays behind residents, keeping their silhouettes readable.
  for(let i=0;i<3;i++)glow(ctx,w*(.2+i*.3)+Math.sin(t*.08+i)*w*.07,h*.65,Math.max(90,w*.25),i===1?'#62507a17':'#93b5940d');
  for(const b of bubbles){const y=((b.y-t*b.s*.18)%1+1)%1*h*.9;const x=b.x*w+Math.sin(t*.2+b.y*14)*9;ellipse(ctx,x,y,b.r*.7,b.r*.7,'#bad79977');}
}
function fish(ctx,f,s){
  fishTransform(ctx,f,s);const size=f.size,t=s.time;
  if(f.species===1){
    // Eel-like body with flexible filaments instead of a triangular tail.
    for(let i=0;i<4;i++){
      ctx.strokeStyle=i%2?'#80a294':'#537d76';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-size*.5,(i-1.5)*4);
      ctx.bezierCurveTo(-size*1.1,Math.sin(t*3+f.phase+i)*size*.4,-size*1.6,(i-1.5)*size*.3,-size*2,Math.sin(t*3+i)*size*.3);ctx.stroke();
    }
    ellipse(ctx,0,0,size,size*.37,bodyGradient(ctx,size,['#a0b5a0','#506e68','#263c43']));
    for(let i=-2;i<3;i++)ellipse(ctx,size*i*.22,size*.08,1.5,1.5,'#c0d9a4');
  }else{
    const tail=Math.sin(t*6+f.phase)*size*.12;
    ctx.fillStyle='#637e78';ctx.beginPath();ctx.moveTo(-size*.6,0);ctx.lineTo(-size*1.4,-size*.5+tail);ctx.lineTo(-size*1.3,size*.4+tail);ctx.closePath();ctx.fill();
    ellipse(ctx,0,0,size,size*.5,bodyGradient(ctx,size,['#9da388','#4e655f','#273746']));
    for(let i=-2;i<3;i++){
      ctx.fillStyle=f.species===2?'#a5b08d':'#567e71';ctx.beginPath();ctx.moveTo(i*size*.25,-size*.4);ctx.lineTo(i*size*.25-size*.1,-size*(.75+(i%2)*.1));ctx.lineTo(i*size*.25+size*.14,-size*.3);ctx.fill();
    }
    if(f.species===0){
      ctx.strokeStyle='#8ea791';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(size*.25,-size*.4);ctx.quadraticCurveTo(size*.25,-size*1.1,size*.92,-size*.88);ctx.stroke();
      glow(ctx,size*.92,-size*.88,size*.32,'#bddc8877');ellipse(ctx,size*.92,-size*.88,2.5,2.5,'#daf3aa');
    }else{for(let i=-2;i<2;i++)line(ctx,[[i*size*.3,-size*.3],[i*size*.3+size*.15,size*.3]],'#b5b29166',2);}
  }
  ellipse(ctx,size*.63,-size*.08,3.5,3.5,'#a3ce8f');ellipse(ctx,size*.67,-size*.08,1.3,2.8,'#102930');
  line(ctx,[[size*.72,size*.2],[size*.9,size*.15]],'#142b30',1.2);
}
function crab(ctx,c,{w,h,time:t,decorTime}){
  const s=c.size;ctx.translate(c.x*w,h*.925);
  ellipse(ctx,0,s*.52,s*1.7,s*.23,'#06131788');
  for(const side of [-1,1]){
    for(let i=0;i<4;i++){
      const gait=Math.sin(t*12+c.phase+i*Math.PI/2+side)*s*.11;
      line(ctx,[[side*s*.6,(i-1.5)*s*.1],[side*s*(1.1+i*.13),s*.08+i*s*.1+gait],[side*s*(1.4+i*.08),s*.5+gait]],'#74846d',3);
    }
    line(ctx,[[side*s*.7,-s*.1],[side*s*1.13,-s*.55],[side*s*1.3,-s*.85]],'#688677',4);
    ellipse(ctx,side*s*1.3,-s*.9,s*.28,s*.36,'#8b9b7c',side*.4);
    line(ctx,[[side*s*1.3,-s*1.23],[side*s*1.3,-s*.9]],'#293c3c',1.5);
  }
  ctx.fillStyle=bodyGradient(ctx,s,['#b1b99a','#738770','#3c514d']);ctx.beginPath();
  for(let i=0;i<8;i++){const angle=i*Math.PI/4;const x=Math.cos(angle)*s,y=Math.sin(angle)*s*.6;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();
  rune(ctx,0,0,s*.38,'#d4edac');
  for(let i=0;i<3;i++)tentacle(ctx,(i-1)*s*.35,-s*.3,s*.55,2,decorTime,c.phase+i,'#6c9180');
  for(const side of [-1,1]){line(ctx,[[side*s*.45,-s*.4],[side*s*.5,-s*.73]],'#83987b',2);ellipse(ctx,side*s*.5,-s*.73,2.4,2.4,'#c6e9a2');}
}
function food(ctx,p,{w,h}){
  const x=p.x*w,y=p.y*h;glow(ctx,x,y,9,'#b4d89640');
  ctx.fillStyle='#d6e7a3';ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x+2,y);ctx.lineTo(x,y+3);ctx.lineTo(x-2,y);ctx.closePath();ctx.fill();
}
export default {background,fish,crab,food};
