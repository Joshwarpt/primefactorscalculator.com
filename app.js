const $=id=>document.getElementById(id), THR=0.5;
let NB=15251n,Ns="15251",NM=null,CAP=20000,winCut=false,M=8,sig=0,mode=2,sel=2,L=0,P=null,jit=[],raf=0;
const sh=s=>s.length>40?s.slice(0,16)+"…"+s.slice(-16)+" ("+s.length+" digits)":s;
const cv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const gauss=()=>Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());
const reroll=()=>{jit=Array.from({length:61},gauss)};
const ph=(l,m)=>{const k=mode===2?m*m:m;return -2*Math.PI*((k*NM[l])%l)/l+sig*jit[m]};
function amp(l){let r=0,i=0;for(let m=0;m<=M;m++){const p=ph(l,m);r+=Math.cos(p);i+=Math.sin(p)}return[r/(M+1),i/(M+1)]}
function fit(c,h){const d=window.devicePixelRatio||1,w=c.clientWidth;c.width=Math.round(w*d);c.height=Math.round(h*d);c.style.height=h+"px";const x=c.getContext("2d");x.setTransform(d,0,0,d,0,0);return[x,w,h]}

function compute(){
 const half=NB/2n;winCut=half>BigInt(CAP);L=Number(winCut?BigInt(CAP):half);NM=new Uint32Array(L+1);for(let l=2;l<=L;l++)NM[l]=Number(NB%BigInt(l));P=new Float32Array(L+1);
 for(let l=2;l<=L;l++){const[r,i]=amp(l);P[l]=r*r+i*i}
 const found=[];for(let l=2;l<=L;l++)if(P[l]>=THR)found.push(l);
 const real=found.filter(l=>NM[l]===0),ghost=found.filter(l=>NM[l]!==0);
 const st=$("status"),ch=$("chips");ch.innerHTML="";
 if(real.length){
  const pairs=real.filter(l=>BigInt(l)*BigInt(l)<=NB).map(l=>l+" × "+sh((NB/BigInt(l)).toString()));
  st.textContent="Bright lines found. "+sh(Ns)+" = "+pairs.join(" or ")+".";
  real.forEach(l=>{const s=document.createElement("span");s.className="chip mono";s.textContent="l = "+l;ch.appendChild(s)});
 }else{
  st.textContent=winCut?"No bright lines for l up to "+L+". N may be prime, or its factors are larger than the scan limit.":"No bright lines above the threshold. "+sh(Ns)+" looks prime, or noise and too few pulses hid the factors.";
 }
 if(ghost.length){const s=document.createElement("span");s.className="chip g mono";s.textContent=ghost.length+" ghost line"+(ghost.length>1?"s":"")+(ghost.length<=4?" at l = "+ghost.join(", "):"");ch.appendChild(s)}
 let d=0;for(let l=2;l<=L;l++)if(NM[l]===0){d=l;break}
 $("info").textContent="N has "+Ns.length+" digits. Scanned l = 2 to "+L+(winCut?" (the scan limit; covering every l up to N/2 is out of reach).":" (every l up to N/2).")+" Setting the pulse phases needs timing precision near 10^-"+Ns.length+", while the best optical clocks reach roughly 10^-19.";
 setSel(d||Math.min(2,L),true);
 drawSpec();
}

function setSel(l,fromCompute){
 sel=Math.max(2,Math.min(L,l));const s=$("l");
 if(fromCompute){s.max=L}
 s.value=sel;$("lv").textContent=sel;drawDyn();
 if(!fromCompute)drawSpec();
}

function drawSpec(){
 const[x,w,h]=fit($("spec"),230),pad=34,pb=24,pw=w-pad-8,phh=h-pb-10;
 const bm=new Float32Array(pw+1),bk=new Uint8Array(pw+1),den=Math.max(1,L-2);
 for(let l=2;l<=L;l++){const b=Math.floor((l-2)/den*pw),v=P[l];if(v>bm[b])bm[b]=v;if(v>=THR){const k=NM[l]===0?1:2;if(bk[b]===0||k===1)bk[b]=k}}
 const mute=cv("--mute"),line=cv("--line");
 x.font="12px system-ui,sans-serif";x.fillStyle=mute;x.strokeStyle=line;x.lineWidth=1;
 [0,.5,1].forEach(v=>{const y=10+phh*(1-v);x.beginPath();x.moveTo(pad,y);x.lineTo(w-8,y);x.stroke();x.textAlign="right";x.fillText(v.toFixed(1),pad-6,y+4)});
 for(let b=0;b<=pw;b++){
  const bh=bm[b]*phh,k=bk[b];
  x.fillStyle=k===1?cv("--peak"):k===2?cv("--ghost"):cv("--base");
  x.fillRect(pad+b-(k?1:0),10+phh-bh,k?3:1,Math.max(bh,1));
 }
 x.setLineDash([4,4]);x.strokeStyle=mute;const ty=10+phh*(1-THR);x.beginPath();x.moveTo(pad,ty);x.lineTo(w-8,ty);x.stroke();x.setLineDash([]);
 const sx=pad+(sel-2)/den*pw;x.strokeStyle=cv("--ink");x.beginPath();x.moveTo(sx,10);x.lineTo(sx,10+phh);x.stroke();
 x.fillStyle=mute;x.textAlign="left";x.fillText("l = 2",pad,h-6);x.textAlign="right";x.fillText("l = "+L+(winCut?" (scan limit)":" = N/2"),w-8,h-6);
}

function drawDyn(){
 const l=sel,[ar,ai]=amp(l),I=ar*ar+ai*ai,mute=cv("--mute"),line=cv("--line");
 let c=$("ph");const side=Math.min(c.clientWidth,300);
 const[x,w]=fit(c,side),cx=w/2,cy=side/2,R=side/2-14;
 x.strokeStyle=line;x.lineWidth=1;x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();
 x.beginPath();x.moveTo(cx-R,cy);x.lineTo(cx+R,cy);x.moveTo(cx,cy-R);x.lineTo(cx,cy+R);x.stroke();
 let px=0,py=0;x.strokeStyle=cv("--base");x.lineWidth=2;x.beginPath();x.moveTo(cx,cy);
 for(let m=0;m<=M;m++){const p=ph(l,m);px+=Math.cos(p)/(M+1);py+=Math.sin(p)/(M+1);x.lineTo(cx+px*R,cy-py*R)}
 x.stroke();x.fillStyle=cv("--peak");x.beginPath();x.arc(cx+px*R,cy-py*R,5,0,7);x.fill();
 x.fillStyle=mute;x.font="12px system-ui,sans-serif";x.textAlign="left";x.fillText("sum of fields (unit circle = all in step)",6,12);
 const div=NM[l]===0;
 $("ro").textContent="l = "+l+": "+(div?"divides N (N/l = "+sh((NB/BigInt(l)).toString())+")":"does not divide N")+", |A|² = "+I.toFixed(3);
 const[y,w2,h2]=fit($("pu"),80),bw=w2/(M+1);
 for(let m=0;m<=M;m++){const p=((ph(l,m)%(2*Math.PI))+2*Math.PI)%(2*Math.PI);y.fillStyle="hsl("+Math.round(p/(2*Math.PI)*360)+",70%,55%)";y.fillRect(m*bw+1,8,Math.max(bw-2,1),h2-16)}
 drawFreq();
}

let K=4;
function ampU(u){let r=0,i=0;for(let m=0;m<=M;m++){const k=mode===2?m*m:m,p=-2*Math.PI*((k*u)%1)+sig*jit[m];r+=Math.cos(p);i+=Math.sin(p)}return(r*r+i*i)/((M+1)*(M+1))}
function drawFreq(){
 const[x,w,h]=fit($("fq"),210),pad=34,pb=24,top=18,pw=w-pad-8,phh=h-pb-top,mute=cv("--mute"),line=cv("--line");
 x.font="12px system-ui,sans-serif";x.fillStyle=mute;x.strokeStyle=line;x.lineWidth=1;
 [0,1].forEach(v=>{const y=top+phh*(1-v);x.beginPath();x.moveTo(pad,y);x.lineTo(w-8,y);x.stroke();x.textAlign="right";x.fillText(v,pad-6,y+4)});
 for(let j=0;j<=K;j++){const gx=pad+j/K*pw;x.beginPath();x.moveTo(gx,top);x.lineTo(gx,top+phh);x.stroke();x.textAlign="center";x.fillText(j,gx,h-6)}
 x.strokeStyle=cv("--base");x.lineWidth=1.5;x.beginPath();
 for(let px=0;px<=pw;px++){let v=0;for(let s=0;s<4;s++){const a=ampU((px+s/4)/pw*K);if(a>v)v=a}const yy=top+phh*(1-v);px?x.lineTo(pad+px,yy):x.moveTo(pad,yy)}
 x.stroke();
 const f=NM[sel]/sel,u=f;
 x.setLineDash([4,4]);x.strokeStyle=cv("--peak");for(let j=0;j<K;j++){const gx=pad+(j+f)/K*pw;x.beginPath();x.moveTo(gx,top);x.lineTo(gx,top+phh);x.stroke()}x.setLineDash([]);
 x.fillStyle=mute;x.textAlign="right";x.fillText("u = N/l, continuing to infinity",w-8,12);
 $("fr").textContent="At l = "+sel+": N/l has fractional part "+f.toFixed(3)+", |A|² = "+ampU(u).toFixed(3)+(NM[sel]===0?" (on a tooth, so l is a divisor)":" (between teeth)");
}
$("k").oninput=e=>{K=+e.target.value;$("kv").textContent=K;drawFreq()};

function bench(){
 const b=$("bb");b.disabled=true;b.textContent="Running…";
 setTimeout(()=>{
  const sets=[[11,13],[101,103],[1009,1013],[10007,10009],[100003,100019]];let sink=0,rows="<tr><th>N</th><th>factor p</th><th>comb ops</th><th>comb ms</th><th>trial ops</th><th>trial ms</th><th>comb / trial time</th></tr>";
  sets.forEach(([p,q])=>{
   const n=p*q,reps=Math.max(1,Math.floor(4e5/(p*(M+1))));let found=0,ghosts=0;
   const comb=()=>{found=0;ghosts=0;for(let l=2;l<=p;l++){let r=0,i=0;const nl=n%l;for(let m=0;m<=M;m++){const k=mode===2?m*m:m,a=-2*Math.PI*((k*nl)%l)/l;r+=Math.cos(a);i+=Math.sin(a)}if((r*r+i*i)/((M+1)*(M+1))>=THR){if(nl===0)found=l;else ghosts++}}};
   let t0=performance.now();for(let r=0;r<reps;r++)comb();const tc=(performance.now()-t0)/reps;
   const trial=()=>{for(let l=2;l<=p;l++)if(n%l===0)return l;return 0};
   const reps2=reps*20;t0=performance.now();for(let r=0;r<reps2;r++)sink+=trial();const tt=(performance.now()-t0)/reps2;
   rows+="<tr><td class='mono'>"+n+"</td><td class='mono'>"+found+(ghosts?" (+"+ghosts+" ghost)":"")+"</td><td class='mono'>"+(p-1)*(M+1)+"</td><td class='mono'>"+tc.toFixed(4)+"</td><td class='mono'>"+(p-1)+"</td><td class='mono'>"+tt.toFixed(5)+"</td><td class='mono'>"+(tc/Math.max(tt,1e-9)).toFixed(0)+"× slower</td></tr>";
  });
  $("bt").innerHTML=rows;
  $("bn").textContent="In simulation the comb always loses: it does "+(M+1)+" sine and cosine evaluations per trial divisor where trial division does one remainder. An ideal optical comb would read every l in a single shot, but it would need about p resolvable lines and timing precision near 1/N, and both grow with N. A browser cannot show that parallel speedup, and the timings are approximate.";
  b.disabled=false;b.textContent="Run benchmark";if(sink<0)console.log(sink);
 },30);
}
$("bb").onclick=bench;

function readN(){let s=($("n").value||"").replace(/[^0-9]/g,"").replace(/^0+/,"");if(s.length>2000)s=s.slice(0,2000);if(!s||BigInt(s)<4n)s="4";$("n").value=s;Ns=s;NB=BigInt(s);CAP=Math.min(200000,Math.max(100,Math.round(+$("cap").value)||20000));compute()}
$("n").addEventListener("change",readN);$("cap").addEventListener("change",readN);
document.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{$("n").value=b.dataset.n;readN()});
$("m").oninput=e=>{M=+e.target.value;$("mv").textContent=M+1;compute()};
$("s").oninput=e=>{sig=e.target.value/100;$("sv").textContent=sig.toFixed(2)+" rad";compute()};
$("mode").onchange=e=>{mode=+e.target.value;compute()};
$("rr").onclick=()=>{reroll();compute()};
$("l").oninput=e=>{cancelAnimationFrame(raf);setSel(+e.target.value)};
$("spec").addEventListener("click",e=>{const r=e.target.getBoundingClientRect(),pad=34,pw=r.width-pad-8;const f=Math.min(1,Math.max(0,(e.clientX-r.left-pad)/pw));cancelAnimationFrame(raf);setSel(2+Math.round(f*Math.max(1,L-2)))});
$("sw").onclick=()=>{cancelAnimationFrame(raf);let l=2;const step=Math.max(1,Math.ceil(L/400));(function go(){setSel(l);l+=step;if(l<=L)raf=requestAnimationFrame(go)})()};
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{drawSpec();drawDyn()},120)});
matchMedia("(prefers-color-scheme:dark)").addEventListener("change",()=>{drawSpec();drawDyn()});
reroll();compute();
