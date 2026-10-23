export const TAU = Math.PI * 2;
export function ellipse(ctx, x, y, rx, ry, color, rotation = 0) {
  ctx.fillStyle = color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,TAU);ctx.fill();
}
export function line(ctx, points, color, width = 1) {
  ctx.strokeStyle = color;ctx.lineWidth = width;ctx.beginPath();ctx.moveTo(...points[0]);for (const p of points.slice(1)) ctx.lineTo(...p);ctx.stroke();
}
export function glow(ctx, x, y, radius, color) {
  const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);gradient.addColorStop(0,color);gradient.addColorStop(1,'#00000000');ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
}
export function fishTransform(ctx,f,{w,h}) {
  ctx.translate(f.x*w,f.y*h);ctx.scale(f.vx>=0?1:-1,1);ctx.rotate(Math.atan2(f.vy,Math.abs(f.vx)+.01)*.3);
}
export function bodyGradient(ctx,s,colors) {
  const g=ctx.createLinearGradient(0,-s,0,s);colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));return g;
}
