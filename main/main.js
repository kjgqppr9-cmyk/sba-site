/* 스몰브랜드설계자 메인 페이지 v1 — 로더 블록이 불러온 뒤 window.__sbaMainRun(bm) 을 부른다 (2026-09-10). */
window.__sbaMainRun = function(bm){
  function reduced(){
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; }
  }

  /* 히어로 「설계 도면」 (v5, 2D 캔버스) — 격자 위에 육각 도면이 한 획씩 그려진다.
     0.2s 컴퍼스가 점선 원을 긋고 → 2.4s 부터 여섯 변이 차례로(펜 끝에 6갈래 반짝임) → 꼭짓점 십자 표시 →
     중심축 여섯 + 안쪽 점선 육각형 → 진단 다각형이 그려지고 옅게 채워짐 → 한 변 바깥에 치수 눈금 →
     완성 후 숨쉬는 글로우, 꼭짓점을 도는 반짝임 → 마지막 1.6초 옅어지고 각도를 바꿔 다시(17초 주기). 금가루는 늘 떠다닌다. */
  function startBlueprint(host, cv){
    var ctx = cv.getContext('2d'); if(!ctx) return false;
    var W=0,H=0,dpr=1,raf=null,alive=false,t0=performance.now(),still=reduced(),mT=0,mS=0,pT=0,pS=0;
    var qs=/[?&]t=(\d+(?:\.\d+)?)/.exec(location.search||''), tOff=qs?parseFloat(qs[1]):0;   /* 확인용: ?t=초 로 장면을 앞당겨 본다 */
    function size(){ dpr=Math.min(2,window.devicePixelRatio||1); W=host.clientWidth; H=host.clientHeight; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cv.style.width=W+'px'; cv.style.height=H+'px'; }
    size(); addEventListener('resize', function(){ size(); if(still) draw(12.5); });
    host.addEventListener('pointermove', function(e){ var r=host.getBoundingClientRect(); mT=(e.clientX-r.left)/r.width-0.5; mS=(e.clientY-r.top)/r.height-0.5; }, {passive:true});
    host.addEventListener('pointerleave', function(){ mT=0; mS=0; });
    var GOLD='224,162,63', GOLD2='242,201,121', MINT='127,224,190', PAPER='255,246,220', PERIOD=17;
    var motes=[]; for(var i=0;i<38;i++) motes.push({x:Math.random(), y:Math.random(), r:.6+Math.random()*1.6, s:.012+Math.random()*.02, ph:Math.random()*6.28});
    function shapeFor(k){ var a=[]; for(var i=0;i<6;i++){ a.push(0.42+0.5*(0.5+0.5*Math.sin(k*3.7+i*2.1+Math.cos(k*1.3+i)))); } return a; }
    function ease(x){ return x<=0?0:x>=1?1:x*x*(3-2*x); }
    function seg(t,a,b){ return ease((t-a)/(b-a)); }
    function hexPt(cx,cy,R,rot,i){ var a=rot+i*Math.PI/3; return [cx+Math.cos(a)*R, cy+Math.sin(a)*R]; }
    function glow(col,w,a){ if(a<=0.01) return; ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=w+14; ctx.strokeStyle='rgba('+col+','+(a*0.07).toFixed(3)+')'; ctx.stroke(); ctx.lineWidth=w+6; ctx.strokeStyle='rgba('+col+','+(a*0.18).toFixed(3)+')'; ctx.stroke(); ctx.restore(); }
    function flare(x,y,r,rot,al){ if(al<=0.02) return; ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.shadowColor='rgba(0,0,0,0)'; ctx.shadowBlur=0; ctx.shadowColor='rgba(0,0,0,0)'; ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.min(1,al*ctx.globalAlpha);
      /* 그라데이션 없이: 갈래는 안쪽→바깥쪽 7조각을 점점 옅은 단색으로, 핵은 동심원 5겹 (웨일 GPU 캔버스 호환) */
      ctx.lineCap='round';
      for(var k=0;k<6;k++){ var L=r*(0.5+0.5*Math.abs(Math.sin(k*2.1+rot*2.0+x*0.01))), w=(k%2?0.9:1.7), N=7;
        for(var q=0;q<N;q++){ var f0=q/N, f1=(q+1)/N, a=0.95*Math.pow(1-f0,1.5), c=(q<2)?'255,242,205':'242,201,121';
          ctx.strokeStyle='rgba('+c+','+a.toFixed(3)+')'; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(L*f0,0); ctx.lineTo(L*f1,0); ctx.stroke(); }
        ctx.rotate(Math.PI/3); }
      var cr=r*.34, ring=[[1,'242,201,121',.10],[.72,'242,201,121',.18],[.48,'242,201,121',.32],[.26,'255,250,236',.6],[.12,'255,250,236',1]];
      for(var m=0;m<ring.length;m++){ ctx.fillStyle='rgba('+ring[m][1]+','+ring[m][2]+')'; ctx.beginPath(); ctx.arc(0,0,cr*ring[m][0],0,6.2832); ctx.fill(); }
      ctx.restore(); }
    function draw(tt){
      var loop=Math.floor(tt/PERIOD), t=tt-loop*PERIOD, i, x, y;
      pT+=(mT-pT)*0.06; pS+=(mS-pS)*0.06;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
      var mobile=W<768;
      var R=mobile? Math.min(W*0.34, 160) : Math.min(H*0.36, W*0.205);
      var cx=(mobile? W*0.5 : W*0.745)+pT*16, cy=(mobile? H-R-124 : H*0.50)+pS*12;
      var rot=-Math.PI/2+loop*0.36+(t/PERIOD)*0.05;
      /* 격자 */
      var g=Math.max(26, Math.round(Math.min(W,H)/18)); ctx.lineWidth=1;
      ctx.strokeStyle='rgba('+GOLD+',0.075)'; ctx.beginPath(); for(x=cx%g; x<W; x+=g){ ctx.moveTo(x,0); ctx.lineTo(x,H); } for(y=cy%g; y<H; y+=g){ ctx.moveTo(0,y); ctx.lineTo(W,y); } ctx.stroke();
      ctx.strokeStyle='rgba('+GOLD+',0.12)'; ctx.beginPath(); for(x=cx%(g*5); x<W; x+=g*5){ ctx.moveTo(x,0); ctx.lineTo(x,H); } for(y=cy%(g*5); y<H; y+=g*5){ ctx.moveTo(0,y); ctx.lineTo(W,y); } ctx.stroke();
      var fade=1-seg(t,PERIOD-1.6,PERIOD); ctx.globalAlpha=fade;
      /* 컴퍼스 원 */
      var pC=seg(t,0.2,2.4);
      if(pC>0){ ctx.setLineDash([4,6]); ctx.strokeStyle='rgba('+GOLD2+',0.38)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,R,rot,rot+pC*Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
        if(pC<1){ var pa=rot+pC*Math.PI*2, ex0=cx+Math.cos(pa)*R, ey0=cy+Math.sin(pa)*R; ctx.strokeStyle='rgba('+GOLD2+',0.55)'; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex0,ey0); ctx.stroke(); flare(ex0,ey0,22,t*2,0.9); }
        ctx.fillStyle='rgba('+PAPER+',0.9)'; ctx.beginPath(); ctx.arc(cx,cy,2.2,0,6.283); ctx.fill(); }
      /* 육각형 여섯 변 */
      var pts=[]; for(i=0;i<6;i++) pts.push(hexPt(cx,cy,R,rot,i));
      ctx.lineJoin='round'; ctx.lineCap='round';
      for(i=0;i<6;i++){ var p=seg(t,2.4+i*0.6,3.0+i*0.6); if(p<=0) break; var A=pts[i], B=pts[(i+1)%6], ex=A[0]+(B[0]-A[0])*p, ey=A[1]+(B[1]-A[1])*p;
        ctx.strokeStyle='rgba('+GOLD2+',0.95)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(A[0],A[1]); ctx.lineTo(ex,ey); glow(GOLD2,2,0.8); ctx.stroke();
        if(p<1) flare(ex,ey,26,t*3,1); }
      /* 꼭짓점 십자 표시 */
      for(i=0;i<6;i++){ var pv=seg(t,3.0+i*0.6,3.4+i*0.6); if(pv<=0) continue; var sc=1+0.6*(1-pv), vx=pts[i][0], vy=pts[i][1]; ctx.strokeStyle='rgba('+PAPER+',0.85)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(vx,vy,5*sc,0,6.283); ctx.stroke(); var c=9*sc;
        ctx.beginPath(); ctx.moveTo(vx-c,vy); ctx.lineTo(vx-c*0.45,vy); ctx.moveTo(vx+c*0.45,vy); ctx.lineTo(vx+c,vy); ctx.moveTo(vx,vy-c); ctx.lineTo(vx,vy-c*0.45); ctx.moveTo(vx,vy+c*0.45); ctx.lineTo(vx,vy+c); ctx.stroke(); }
      /* 중심축 여섯 + 안쪽 점선 육각형 */
      for(i=0;i<6;i++){ var px=seg(t,6.0+i*0.18,6.7+i*0.18); if(px<=0) break; ctx.strokeStyle='rgba('+MINT+',0.35)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+(pts[i][0]-cx)*px, cy+(pts[i][1]-cy)*px); ctx.stroke(); }
      var pIn=seg(t,6.6,7.6); if(pIn>0){ ctx.setLineDash([3,5]); ctx.strokeStyle='rgba('+GOLD+','+(0.3*pIn)+')'; ctx.lineWidth=1; var fr=[0.667,0.333]; for(var f=0;f<2;f++){ ctx.beginPath(); for(i=0;i<6;i++){ var q=hexPt(cx,cy,R*fr[f],rot,i); if(i) ctx.lineTo(q[0],q[1]); else ctx.moveTo(q[0],q[1]); } ctx.closePath(); ctx.stroke(); } ctx.setLineDash([]); }
      /* 진단 다각형 */
      var sh=shapeFor(loop), pD=seg(t,7.6,10.2);
      if(pD>0){ var total=6*pD, q0=hexPt(cx,cy,R*sh[0],rot,0), last=q0; ctx.strokeStyle='rgba('+GOLD2+',1)'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(q0[0],q0[1]);
        for(i=1;i<=6;i++){ var ff=Math.min(1,Math.max(0,total-(i-1))); if(ff<=0) break; var qa=hexPt(cx,cy,R*sh[(i-1)%6],rot,(i-1)%6), qb=hexPt(cx,cy,R*sh[i%6],rot,i%6); last=[qa[0]+(qb[0]-qa[0])*ff, qa[1]+(qb[1]-qa[1])*ff]; ctx.lineTo(last[0],last[1]); }
        glow(GOLD2,2.4,0.9); ctx.stroke(); if(pD<1) flare(last[0],last[1],30,t*3,1);
        var pF=seg(t,10.0,11.0); if(pF>0){ ctx.fillStyle='rgba('+GOLD+','+(0.16*pF)+')'; ctx.beginPath(); for(i=0;i<6;i++){ var qq=hexPt(cx,cy,R*sh[i],rot,i); if(i) ctx.lineTo(qq[0],qq[1]); else ctx.moveTo(qq[0],qq[1]); } ctx.closePath(); ctx.fill(); } }
      /* 치수 눈금 (한 변 바깥) */
      var pM=seg(t,10.6,11.8);
      if(pM>0){ var A2=pts[1], B2=pts[2], nx=(A2[0]+B2[0])/2-cx, ny=(A2[1]+B2[1])/2-cy, nl=Math.hypot(nx,ny)||1; nx/=nl; ny/=nl; var off=22, ax=A2[0]+nx*off, ay=A2[1]+ny*off, bx=B2[0]+nx*off, by=B2[1]+ny*off;
        ctx.strokeStyle='rgba('+PAPER+',0.7)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+(bx-ax)*pM, ay+(by-ay)*pM); ctx.stroke();
        var tx=-ny, ty=nx; for(var k=0;k<=6;k++){ var fk=k/6; if(fk>pM) break; var kx=ax+(bx-ax)*fk, ky=ay+(by-ay)*fk, L=(k%6===0)?7:4; ctx.beginPath(); ctx.moveTo(kx-tx*L,ky-ty*L); ctx.lineTo(kx+tx*L,ky+ty*L); ctx.stroke(); } }
      /* 완성 후 숨쉬기 + 꼭짓점을 도는 반짝임 */
      var pH=seg(t,11.0,12.0);
      if(pH>0){ var br=0.5+0.5*Math.sin(t*2.2); ctx.strokeStyle='rgba('+GOLD2+','+(0.32*pH*(0.5+0.5*br))+')'; ctx.lineWidth=6; ctx.beginPath(); for(i=0;i<6;i++){ if(i) ctx.lineTo(pts[i][0],pts[i][1]); else ctx.moveTo(pts[i][0],pts[i][1]); } ctx.closePath(); glow(GOLD2,6,0.6*pH*(0.5+0.5*br)); ctx.stroke();
        var vi=Math.floor((t*0.8)%6); flare(pts[vi][0],pts[vi][1],26+8*br,t,0.9*pH); }
      /* 여섯 축: 완성되면 꼭짓점에 브랜드 색 점과 짧은 이름이 차례로 켜진다 */
      var AXC=['#10B981','#F59E0B','#6366F1','#EC4899','#EF4444','#1E3A8A'], AXN=['자기','생산','목표','관계','판매','재무'];
      for(i=0;i<6;i++){ var pn=seg(t,11.2+i*0.25,11.7+i*0.25); if(pn<=0) continue; var nx2=pts[i][0], ny2=pts[i][1], s2=1+0.5*(1-pn);
        ctx.fillStyle=AXC[i]; ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(nx2,ny2,7*s2,0,6.283); ctx.fill(); ctx.stroke();
        var ang2=rot+i*Math.PI/3, lx=nx2+Math.cos(ang2)*24, ly=ny2+Math.sin(ang2)*24; ctx.font='700 '+(mobile?11:13)+'px "Noto Sans KR","Malgun Gothic",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='rgba(255,246,220,'+(0.95*pn)+')'; ctx.fillText(AXN[i],lx,ly); }
      ctx.globalAlpha=1;
      /* 금가루 */
      for(var m=0;m<motes.length;m++){ var o=motes[m], yy=((o.y-tt*o.s)%1+1)%1, xx=o.x*W+Math.sin(tt*0.5+o.ph)*10, al=0.14+0.24*(0.5+0.5*Math.sin(tt*1.3+o.ph)); ctx.fillStyle='rgba('+GOLD2+','+al.toFixed(3)+')'; ctx.beginPath(); ctx.arc(xx,yy*H,o.r,0,6.283); ctx.fill(); }
    }
    function frame(now){ raf=null; if(!alive) return; if(W!==host.clientWidth||H!==host.clientHeight) size(); draw((now-t0)/1000+tOff); raf=requestAnimationFrame(frame); }
    if(still){ draw(12.5); return true; }
    if(window.IntersectionObserver){ new IntersectionObserver(function(es){ alive=!!(es[0]&&es[0].isIntersecting); if(alive&&!raf) raf=requestAnimationFrame(frame); },{threshold:0}).observe(host); }
    else { alive=true; raf=requestAnimationFrame(frame); }
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&alive&&!raf) raf=requestAnimationFrame(frame); });
    return true;
  }

  /* 첫걸음 섹션 — 금빛 육각형 모션 (2D 캔버스). 세 겹 육각형이 서로 다른 속도로 천천히 돌고,
     꼭짓점이 차례로 6갈래 빛갈라짐으로 반짝이며, 바깥 테두리를 금빛 불씨가 한 바퀴 돈다. 금가루가 천천히 떠오른다. */
  function startHexGold(sec, cv){
    var ctx = cv.getContext('2d'); if(!ctx) return false;
    var W=0,H=0,dpr=1,raf=null,alive=false,t0=performance.now(), still=reduced();
    function size(){ dpr=Math.min(2,window.devicePixelRatio||1); W=sec.clientWidth; H=sec.clientHeight; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cv.style.width=W+'px'; cv.style.height=H+'px'; }
    size(); addEventListener('resize', function(){ size(); if(still) draw(3.3); });
    var motes=[]; for(var i=0;i<44;i++) motes.push({x:Math.random(), y:Math.random(), r:.7+Math.random()*1.7, s:.018+Math.random()*.03, ph:Math.random()*6.28});
    function hex(cx,cy,R,rot){ ctx.beginPath(); for(var k=0;k<6;k++){ var a=rot+k*Math.PI/3, x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R; if(k) ctx.lineTo(x,y); else ctx.moveTo(x,y); } ctx.closePath(); }
    function glow(col,w,a){ if(a<=0.01) return; ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=w+14; ctx.strokeStyle='rgba('+col+','+(a*0.07).toFixed(3)+')'; ctx.stroke(); ctx.lineWidth=w+6; ctx.strokeStyle='rgba('+col+','+(a*0.18).toFixed(3)+')'; ctx.stroke(); ctx.restore(); }
    function flare(x,y,r,rot,al){ if(al<=0.02) return; ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.shadowColor='rgba(0,0,0,0)'; ctx.shadowBlur=0; ctx.shadowColor='rgba(0,0,0,0)'; ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.min(1,al);
      /* 그라데이션 없이: 갈래는 안쪽→바깥쪽 7조각을 점점 옅은 단색으로, 핵은 동심원 5겹 (웨일 GPU 캔버스 호환) */
      ctx.lineCap='round';
      for(var k=0;k<6;k++){ var L=r*(0.5+0.5*Math.abs(Math.sin(k*2.1+rot*2.0+x*0.01))), w=(k%2?0.9:1.7), N=7;
        for(var q=0;q<N;q++){ var f0=q/N, f1=(q+1)/N, a=0.95*Math.pow(1-f0,1.5), c=(q<2)?'255,242,205':'242,201,121';
          ctx.strokeStyle='rgba('+c+','+a.toFixed(3)+')'; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(L*f0,0); ctx.lineTo(L*f1,0); ctx.stroke(); }
        ctx.rotate(Math.PI/3); }
      var cr=r*.34, ring=[[1,'242,201,121',.10],[.72,'242,201,121',.18],[.48,'242,201,121',.32],[.26,'255,250,236',.6],[.12,'255,250,236',1]];
      for(var m=0;m<ring.length;m++){ ctx.fillStyle='rgba('+ring[m][1]+','+ring[m][2]+')'; ctx.beginPath(); ctx.arc(0,0,cr*ring[m][0],0,6.2832); ctx.fill(); }
      ctx.restore(); }
    function draw(t){
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
      var cx=W/2, cy=H*0.5, R=Math.min(W*0.42, H*0.46); ctx.lineJoin='round';
      for(var j=0;j<3;j++){
        var Rj=R*(1-j*0.21), rot=t*(0.045+j*0.025)*(j%2?-1:1)+j*0.35, al=0.14+0.09*j;
        ctx.save(); ctx.strokeStyle='rgba(224,162,63,'+al.toFixed(3)+')'; ctx.lineWidth=(j===2?2.2:1.4); hex(cx,cy,Rj,rot); glow('242,201,121',(j===2?2.2:1.4),al*0.85); ctx.stroke(); ctx.restore();
        var vi=Math.floor((t*0.55+j*2)%6), pulse=0.5+0.5*Math.sin(t*2.6+j*1.7);
        for(var k=0;k<6;k++){ var a=rot+k*Math.PI/3, vx=cx+Math.cos(a)*Rj, vy=cy+Math.sin(a)*Rj; var on=(k===vi)?(0.35+0.65*pulse):0.14; flare(vx,vy,(k===vi?24+12*pulse:9),t*0.4+k,on*(0.9-0.15*j)); }
      }
      var u=(t*0.075)%1, seg=Math.floor(u*6), f=u*6-seg, rot0=t*0.045, a0=rot0+seg*Math.PI/3, a1=rot0+(seg+1)*Math.PI/3;
      var px=cx+(Math.cos(a0)+(Math.cos(a1)-Math.cos(a0))*f)*R, py=cy+(Math.sin(a0)+(Math.sin(a1)-Math.sin(a0))*f)*R;
      flare(px,py,36,t*1.1,0.95);
      for(var m=0;m<motes.length;m++){ var o=motes[m]; var my=((o.y - t*o.s)%1+1)%1, mx=o.x*W+Math.sin(t*0.6+o.ph)*9; var al2=0.18+0.28*(0.5+0.5*Math.sin(t*1.4+o.ph));
        ctx.fillStyle='rgba(224,162,63,'+al2.toFixed(3)+')'; ctx.beginPath(); ctx.arc(mx,my*H,o.r,0,6.2832); ctx.fill(); }
    }
    function frame(now){ raf=null; if(!alive) return; if(W!==sec.clientWidth||H!==sec.clientHeight) size(); draw((now-t0)/1000); raf=requestAnimationFrame(frame); }
    if(still){ draw(3.3); return true; }
    if(window.IntersectionObserver){ new IntersectionObserver(function(es){ alive=!!(es[0]&&es[0].isIntersecting); if(alive&&!raf) raf=requestAnimationFrame(frame); },{threshold:0}).observe(sec); }
    else { alive=true; raf=requestAnimationFrame(frame); }
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&alive&&!raf) raf=requestAnimationFrame(frame); });
    return true;
  }
  var bound=null;
  function fitHdr(root){ var h=document.querySelector('header.global-header'); if(!h) return; var hh=Math.round(h.getBoundingClientRect().height); if(hh>0&&hh<200) root.style.setProperty('--mx-hdr', hh+'px'); }
  function boot(){
    var root = bm.container && bm.container.querySelector('.mx');
    if(!root) return false;
    if(bound !== root){
      root.addEventListener('click', function(e){
        var go = e.target.closest('[data-go]'); if(!go) return;
        e.preventDefault();
        var target = root.querySelector(go.getAttribute('data-go'));
        if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      });
      /* 모바일 하단 버튼: 히어로 70% 지나면 뜨고, 폼이 보이면 숨는다 */
      var bar = root.querySelector('.mx-bar'), hero = root.querySelector('.hf');
      function tick(){
        if(!bar) return;
        var form = document.querySelector('.cs-form'), vh = innerHeight;
        var past = hero ? (hero.getBoundingClientRect().bottom < vh*0.3) : (scrollY > 400);
        var formIn = false; if(form){ var r=form.getBoundingClientRect(); formIn = r.top < vh*0.85 && r.bottom > 0; }
        bar.classList.toggle('on', past && !formIn);
      }
      addEventListener('scroll', tick, {passive:true}); addEventListener('resize', tick); setTimeout(tick, 300);
      fitHdr(root); addEventListener('resize', function(){ fitHdr(root); }); setTimeout(function(){ fitHdr(root); }, 900);
      /* 스크롤 등장: 같은 부모 안에서는 순번(--i)만큼 시간차. 숫자는 켜질 때 0 부터 센다 */
      var reduced=false; try{ reduced=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
      var targets = root.querySelectorAll('[data-rv]');
      var seen = new Map();
      targets.forEach(function(el){ var par = el.parentElement; var k = seen.get(par)||0; el.style.setProperty('--i', k); seen.set(par, k+1); });
      function countUp(b){ var to = parseInt(b.getAttribute('data-n'),10); if(isNaN(to) || b.__done || b.__run) return; b.__done = true; if(reduced || to<=1){ b.textContent = to; return; }
        b.__run = true; var t0 = performance.now(), dur = 1500; (function step(now){ var p = Math.min(1,(now-t0)/dur); p = 1-Math.pow(1-p,2.6); b.textContent = Math.max(1, Math.round(to*p)); if(p<1) requestAnimationFrame(step); else b.__run = false; })(t0); }
      /* 금빛 순회: 켜질 때 한 번, 그 뒤 7~10초마다 반복(카드마다 어긋나게), 마우스를 올리면 즉시 */
      function sweep(el){ el.classList.remove('sweep'); void el.offsetWidth; el.classList.add('sweep'); }
      function armSweep(el){ if(el.__sweepArmed || reduced) return; el.__sweepArmed = true;
        var i = parseFloat(el.style.getPropertyValue('--i'))||0;
        setTimeout(function(){ sweep(el); }, 350 + i*180);
        setTimeout(function(){ sweep(el); setInterval(function(){ if(!el.matches(':hover')) sweep(el); }, 7000 + (i%4)*900); }, 7000 + i*900 + Math.random()*1200);
        el.addEventListener('pointerenter', function(){ sweep(el); }); }
      /* 실행 계획 체크리스트: 켜지면 2초마다 하나씩 체크, 다 차면 잠깐 쉬고 비운 뒤 반복 */
      function armCycle(ul){ if(ul.__cyc) return; ul.__cyc = true; var lis = ul.querySelectorAll('li'), k = 0;
        if(reduced){ lis.forEach(function(li){ li.classList.add('on'); }); return; }
        function step(){ if(k < lis.length){ lis[k].classList.add('on'); k++; setTimeout(step, 2000); } else { setTimeout(function(){ lis.forEach(function(li){ li.classList.remove('on'); }); k = 0; setTimeout(step, 1200); }, 2600); } }
        setTimeout(step, 900); }
      window.__mxCount = countUp;
      function show(el){ el.classList.add('in'); el.querySelectorAll('[data-n]').forEach(countUp); if(el.hasAttribute('data-n')) countUp(el); if(el.classList.contains('gl')) armSweep(el); el.querySelectorAll('[data-cycle]').forEach(armCycle); }
      if(reduced || !('IntersectionObserver' in window)){ targets.forEach(show); }
      else { var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } }); }, {threshold:0.18, rootMargin:'0px 0px -6% 0px'}); targets.forEach(function(el){ io.observe(el); }); }
      bound = root;
    }
    var host = root.querySelector('.mh'), cv = host && host.querySelector('.mh-gl');
    if(host && cv && !cv.__sbaGl){ cv.__sbaGl = true; if(!startBlueprint(host, cv)) cv.style.display='none'; }
    var cta = root.querySelector('.mx-cta'), ch = cta && cta.querySelector('.cta-hex');
    if(cta && ch && !ch.__on){ ch.__on = true; startHexGold(cta, ch); }
    var stats = root.querySelector('.mx-trust .stats');
    if(stats && !stats.__re && window.IntersectionObserver){ stats.__re = true; new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ stats.querySelectorAll('[data-n]').forEach(function(b){ if(!b.__run){ b.__done = false; if(window.__mxCount) window.__mxCount(b); } }); } }); }, {threshold:0.5}).observe(stats); }
    /* 육각형 모델: 행에 마우스를 올리면 레이더의 그 축이 커진다 */
    var radar = root.querySelector('.mx-hex .radar');
    if(radar && !radar.__hi){ radar.__hi = true; root.querySelectorAll('.mx-hex .axes li').forEach(function(li, k){ li.addEventListener('mouseenter', function(){ radar.setAttribute('data-hi', k); }); li.addEventListener('mouseleave', function(){ radar.removeAttribute('data-hi'); }); }); }
    return true;
  }
  if(!boot()){ var tries=0; var timer=setInterval(function(){ if(boot() || ++tries>200) clearInterval(timer); }, 50); }
  setTimeout(boot, 900); setTimeout(boot, 2600);
  if(typeof bm !== 'undefined') bm.onContextChange = function(){ boot(); };
};
