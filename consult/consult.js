/* 스몰브랜드설계자 컨설팅 페이지 v4 — 블록 6a226d52bc50b2f2669ba3bf 의 스크립트 (2026-09-10).
   로더 블록이 이 파일을 불러온 뒤 window.__sbaConsultRun(bm) 을 부른다. 히어로 엔진은 scratchpad/hero/hexa_field.html 4판 그대로. */
window.__sbaConsultRun = function(bm){
  function startHero(host){

  var cv=host.querySelector('.hf-gl'), labWrap=host.querySelector('.hf-labs');
  var gl=cv.getContext('webgl',{antialias:false,alpha:true,premultipliedAlpha:true});
  if(!gl){ cv.style.display='none'; return; }
  var reduced=false; try{ reduced=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  var AXES=['자기관리','생산관리','목표관리','관계관리','판매관리','재무관리'];   /* 위에서 시계 방향 */

  /* ── 입자: 흩어진 시작점 → 육각형 진단 필드(고리 · 여섯 축 · 꼭짓점 · 중심) ─────
     kind 0 고리(옅은) 1 먼지(안 모임) 2 고리(또렷) 3 꼭짓점 노드 4 축 선 5 중심 군집. axis = 0~5 (해당 없으면 -1) */
  var pts=[], i, k, t;
  function add(x,y,z,kind,axis,ringT){
    var R=1.6+1.6*Math.random(), th=Math.random()*Math.PI*2, ph=(Math.random()-.5)*1.6;   /* 시작: 멀리 흩어진 구 */
    pts.push({tx:x,ty:y,tz:z, sx:Math.cos(th)*R, sy:Math.sin(th)*R*0.9, sz:Math.sin(ph)*1.2, kind:kind, axis:axis, ring:ringT, seed:Math.random()});
  }
  function hexPt(r,ang){ return [Math.cos(ang)*r, Math.sin(ang)*r]; }
  var A0=Math.PI/2;                                        /* 꼭짓점 0 = 위 */
  function vert(k,r){ return hexPt(r, A0 - k*Math.PI/3); }
  /* 고리 8겹: 3겹(1/3,2/3,1)은 또렷, 나머지는 옅게 */
  var rings=[0.14,0.25,0.333,0.45,0.56,0.667,0.8,0.9,1.0], crispSet={0.333:1,0.667:1,1.0:1};
  for(var ri=0;ri<rings.length;ri++){
    var r=rings[ri], crisp=!!crispSet[r], cnt=Math.round((crisp?170:70)*(0.5+r));
    for(i=0;i<cnt;i++){
      t=Math.random(); k=Math.floor(t*6); var f=t*6-k;
      var a=vert(k,r), b=vert((k+1)%6,r);
      var x=a[0]+(b[0]-a[0])*f, y=a[1]+(b[1]-a[1])*f;
      var jit=(Math.random()-.5)*(crisp?0.006:0.02);
      var len=Math.hypot(x,y)||1; x+=x/len*jit; y+=y/len*jit;
      add(x,y,(Math.random()-.5)*(crisp?0.01:0.05), crisp?2:0, -1, r);
    }
  }
  /* 여섯 축 선 */
  for(k=0;k<6;k++){ var v=vert(k,1.0); for(i=0;i<150;i++){ var s=Math.pow(Math.random(),0.8); var jx=(Math.random()-.5)*0.012, jy=(Math.random()-.5)*0.012; add(v[0]*s+jx, v[1]*s+jy, (Math.random()-.5)*0.02, 4, k, s); } }
  /* 꼭짓점 노드 */
  for(k=0;k<6;k++){ var vv=vert(k,1.0); for(i=0;i<150;i++){ var rr=0.055*Math.sqrt(Math.random()), aa=Math.random()*Math.PI*2; add(vv[0]+Math.cos(aa)*rr, vv[1]+Math.sin(aa)*rr, (Math.random()-.5)*0.03, 3, k, rr/0.055); } }
  /* 중심 군집 */
  for(i=0;i<420;i++){ var g=(Math.random()+Math.random()+Math.random())/3; var rc=0.16*Math.pow(Math.abs(g-0.5)*2,1.2), ac=Math.random()*Math.PI*2; add(Math.cos(ac)*rc, Math.sin(ac)*rc, (Math.random()-.5)*0.04, 5, -1, 0); }
  /* 먼지 — 모이지 않고 멀리 떠 있다 */
  for(i=0;i<1500;i++){ var Rd=1.3+2.2*Math.pow(Math.random(),.6), thd=Math.random()*Math.PI*2, phd=(Math.random()-.5)*1.4; var p={tx:Math.cos(thd)*Rd,ty:Math.sin(thd)*Rd*0.8,tz:Math.sin(phd)*0.9}; p.sx=p.tx;p.sy=p.ty;p.sz=p.tz; p.kind=1;p.axis=-1;p.ring=1;p.seed=Math.random(); pts.push(p); }

  var N=pts.length, aTgt=new Float32Array(N*3), aSrc=new Float32Array(N*3), aSeed=new Float32Array(N), aKind=new Float32Array(N), aAxis=new Float32Array(N), aRing=new Float32Array(N);
  for(i=0;i<N;i++){ var q=pts[i]; aTgt[i*3]=q.tx;aTgt[i*3+1]=q.ty;aTgt[i*3+2]=q.tz; aSrc[i*3]=q.sx;aSrc[i*3+1]=q.sy;aSrc[i*3+2]=q.sz; aSeed[i]=q.seed; aKind[i]=q.kind; aAxis[i]=q.axis; aRing[i]=q.ring; }

  var VS=[
  'attribute vec3 aTgt; attribute vec3 aSrc; attribute float aSeed; attribute float aKind; attribute float aAxis; attribute float aRing;',
  'uniform float uT; uniform vec2 uRes; uniform vec2 uTilt; uniform vec2 uMouse; uniform float uDpr; uniform float uShift; uniform float uScale; uniform float uSel; uniform float uSelMix; uniform float uPrev; uniform float uOffY; uniform float uRot;',
  'varying float vA; varying float vSeed; varying float vKind; varying float vHit; varying float vGold; varying float vRing; varying float vSpark; varying float vT;',
  'void main(){',
  /* 모임: 입자마다 조금씩 다른 때에 출발해 2.6초 안에 제자리로 (먼지는 제외) */
  '  float dly = aSeed*1.1 + (aKind>4.5 ? 0.0 : aRing*0.5);',
  '  float pr = clamp((uT - dly)/1.7, 0.0, 1.0);',
'  float e = pr < 0.5 ? 4.0*pr*pr*pr : 1.0 - pow(-2.0*pr + 2.0, 3.0)/2.0;',
  '  if(aKind>0.5 && aKind<1.5) e = 1.0;',
  '  vec3 p = mix(aSrc, aTgt, e);',
  /* 모인 뒤 숨쉬기 + 먼지는 천천히 돈다 */
  '  float br = 1.0 + 0.012*sin(uT*0.9 + aSeed*6.0);',
  '  if(aKind>0.5 && aKind<1.5){ float w=uT*0.02; float c=cos(w), s=sin(w); p.xy = mat2(c,-s,s,c)*p.xy; }',
  '  p.xy *= br * uScale;',
  /* 모인 뒤 육각형 전체가 아주 천천히 돈다 (라벨도 JS 에서 같은 각도로 따라간다) */
  '  { float c=cos(uRot), s2=sin(uRot); p.xy = mat2(c,-s2,s2,c)*p.xy; }',
  /* 선택된 축: 꼭짓점 노드와 축 선이 금색으로 살아난다 (이전 축은 서서히 꺼진다) */
  '  float isSel = (aAxis > -0.5 && abs(aAxis - uSel) < 0.5) ? 1.0 : 0.0;',
  '  float wasPrev = (aAxis > -0.5 && abs(aAxis - uPrev) < 0.5) ? 1.0 : 0.0;',
  '  float gold = isSel*uSelMix + wasPrev*(1.0-uSelMix);',
  '  if(aKind>4.5) gold = 1.0;',   /* 중심은 늘 금빛 */
  '  if(aKind>2.5 && aKind<3.5){ p.xy *= 1.0 + 0.06*gold; }',
  /* 꼭짓점 노드의 일부(약 1/4)와 축 선의 일부는 금색이 될 때 빛갈라짐 스파크가 된다 */
'  float spark = ((aKind>2.5 && aKind<3.5 && aSeed>0.74) || (aKind>3.5 && aKind<4.5 && aSeed>0.93) || (aKind>4.5 && aSeed>0.86)) ? 1.0 : 0.0;',
  /* 살짝 눕힌 시점 — 마우스가 시점을 당긴다 */
  '  float tx = -0.40 + uTilt.y*0.10 + 0.10*sin(uRot*1.0), ty = uTilt.x*0.14 + 0.12*cos(uRot*1.0);',
  '  float cx=cos(tx), sx=sin(tx); p.yz = mat2(cx,-sx,sx,cx)*p.yz;',
  '  float cy=cos(ty), sy=sin(ty); p.xz = mat2(cy,-sy,sy,cy)*p.xz;',
  '  p.x += uShift; p.y += uOffY;',
  '  float fov=2.6; float sc = fov/(fov+p.z);',
  '  vec2 ndc = vec2(p.x*sc*uRes.y/uRes.x, p.y*sc);',
  /* 마우스 근처는 살짝 비켜나고 밝아진다 */
  '  vec2 asp = vec2(uRes.x/uRes.y, 1.0);',
  '  vec2 d = (ndc - uMouse)*asp; float L=length(d);',
  '  float push = smoothstep(0.22,0.0,L);',
  '  ndc += normalize(d+1e-4) * push * 0.035 / asp;',
  '  gl_Position = vec4(ndc, 0.0, 1.0);',
  '  float tw = 0.8 + 0.2*sin(uT*(1.4+aSeed*2.2) + aSeed*40.0);',
  '  float sz = 1.4 + 2.6*pow(aSeed,2.0);',
  '  if(aKind<0.5) sz *= 0.9; if(aKind>0.5&&aKind<1.5) sz = 0.7+1.5*aSeed; if(aKind>1.5&&aKind<2.5) sz *= 1.5;',
  '  if(aKind>2.5&&aKind<3.5) sz = (aSeed>0.92 ? 6.0 : 2.0+2.2*aSeed) * (1.0+1.6*gold);',
  '  if(aKind>3.5&&aKind<4.5) sz = (1.2+1.4*aSeed)*(1.0+1.4*gold); if(aKind>4.5) sz = (aSeed>0.9 ? 5.5+3.0*aSeed : 1.8+2.4*pow(aSeed,1.5));',
  /* 스파크는 금색일 때 크게 펼쳐진다(빛갈라짐이 들어갈 자리) */
  '  if(spark>0.5){ float tw2 = 0.75 + 0.25*sin(uT*(1.1+aSeed*1.7) + aSeed*31.0); float big = aSeed>0.975 ? 64.0 : (26.0 + 22.0*aSeed); if(aKind>4.5) big *= 0.8; sz = mix(sz, big*tw2, gold); }',
  '  float arrive = 0.55 + 0.45*e;',
  '  gl_PointSize = sz*sc*uDpr*(1.0+push*1.2)*tw*arrive;',
  '  float baseA = 0.55+0.45*aSeed; if(aKind<0.5) baseA*=0.55; if(aKind>0.5&&aKind<1.5) baseA=0.26; if(aKind>1.5&&aKind<2.5) baseA=1.2;',
  '  if(aKind>2.5&&aKind<3.5) baseA = 0.9 + 0.8*gold; if(aKind>3.5&&aKind<4.5) baseA = 0.5 + 0.9*gold; if(aKind>4.5) baseA = 1.0+0.4*aSeed;',
  '  if(spark>0.5) baseA = mix(baseA, 1.0, gold);',
  '  vA = baseA * sc * tw * (0.25+0.75*e); vSeed=aSeed; vKind=aKind; vHit=push; vGold=gold; vRing=aRing; vSpark=spark*gold; vT=uT;',
  '}'].join('\n');

  var FS=[
  'precision mediump float;',
  'varying float vA; varying float vSeed; varying float vKind; varying float vHit; varying float vGold; varying float vRing; varying float vSpark; varying float vT;',
  'float hsh(float n){ return fract(sin(n)*43758.5453); }',
  'void main(){',
  '  vec2 q=gl_PointCoord-0.5; float d=length(q);',
  '  vec3 goldC=vec3(0.95,0.72,0.35), goldHi=vec3(1.0,0.90,0.62), amber=vec3(0.80,0.50,0.16);',
  /* ── 스파크: 부드러운 금빛 광채 + 흰 심 + 길이·각도가 제각각인 6갈래 */
  '  if(vSpark>0.02){',
  '    float r = d*2.0;',
  '    float glow = exp(-r*r*7.0)*0.55 + exp(-r*r*60.0)*1.1;',
  '    float ang = atan(q.y,q.x) + 0.25*sin(vT*0.5 + vSeed*9.0);',
  '    float rays = 0.0;',
  '    for(int k=0;k<6;k++){',
  '      float fk = float(k);',
  '      float ak = fk*1.0472 + (hsh(vSeed*17.0+fk)-0.5)*0.55;',        /* 60도 간격에서 ±16도쯤 어긋난다 */
  '      float len = 0.45 + 0.55*hsh(vSeed*29.0+fk*3.0);',              /* 갈래마다 길이가 다르다 */
  '      float wdt = 0.05 + 0.05*hsh(vSeed*41.0+fk*7.0);',
  '      float dd = abs(mod(ang - ak + 3.14159, 6.28318) - 3.14159);',
  '      rays += exp(-dd*dd/(2.0*wdt*wdt)) * pow(max(0.0, 1.0 - r/len), 1.6);',
  '    }',
  '    float core = exp(-r*r*90.0);',
  '    vec3 c = mix(amber, goldC, clamp(glow*1.4,0.0,1.0));',
  '    c = mix(c, goldHi, clamp(rays*0.9 + core*1.2, 0.0, 1.0));',
  '    c = mix(c, vec3(1.0,0.98,0.92), core*0.9);',
  '    float aa = clamp(glow + rays*0.85, 0.0, 1.0) * vA * vSpark;',
  '    gl_FragColor = vec4(c*aa, aa); return;',
  '  }',
  '  float a = smoothstep(0.5,0.05,d); a *= a; a *= vA;',
  /* 금색이 된 일반 입자: 테두리를 부드럽게 넓혀 금빛이 번지게 */
  '  if(vGold>0.02){ float halo = exp(-d*d*14.0); a = mix(a, clamp(halo*1.15,0.0,1.0)*vA, vGold*0.8); }',
  '  vec3 mint=vec3(0.50,0.88,0.75), gold=vec3(0.95,0.72,0.35), white=vec3(0.96,1.0,0.98), deep=vec3(0.18,0.77,0.55);',
  '  vec3 c = mix(deep, mint, vRing);',
  '  if(vSeed<0.05) c=white;',
  '  if(vKind>0.5&&vKind<1.5) c=mix(mint,white,0.5)*0.8;',
  '  if(vKind>1.5&&vKind<2.5) c=mix(mint,white,0.4);',
  '  if(vKind>2.5&&vKind<3.5) c=mix(mint,white,0.3);',
  '  if(vKind>4.5) c = vSeed>0.9 ? mix(white,mint,0.2) : mix(white,mint,0.45);',
  '  vec3 gmix = mix(goldC, goldHi, smoothstep(0.35,0.0,d));',                          /* 가운데는 밝은 금, 가장자리는 진한 금 */
  '  c = mix(c, gmix, clamp(vGold,0.0,1.0));',                                        /* 금색은 선택된 한 축에만 */
  '  float h = clamp(vHit*1.3,0.0,1.0); float lum = dot(c, vec3(0.33));',
  '  c = clamp(mix(vec3(lum), c, 1.0 + 1.4*h) * (1.0 + 0.2*h), 0.0, 1.0);',
  '  gl_FragColor = vec4(c*a, a);',
  '}'].join('\n');

  function sh(type,src){ var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); } return s; }
  var prog=gl.createProgram(); gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS)); gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS)); gl.linkProgram(prog); gl.useProgram(prog);
  function buf(data,name,size){ var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW); var loc=gl.getAttribLocation(prog,name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0); }
  buf(aTgt,'aTgt',3); buf(aSrc,'aSrc',3); buf(aSeed,'aSeed',1); buf(aKind,'aKind',1); buf(aAxis,'aAxis',1); buf(aRing,'aRing',1);
  var U={}; ['uT','uRes','uTilt','uMouse','uDpr','uShift','uScale','uSel','uSelMix','uPrev','uOffY','uRot'].forEach(function(k){ U[k]=gl.getUniformLocation(prog,k); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0,0,0,0);

  /* 축 이름 라벨 + 금색 태그 */
  var labs=[]; for(k=0;k<6;k++){ var el=document.createElement('div'); el.className='hf-lab'; el.textContent=AXES[k]; labWrap.appendChild(el); labs.push(el); }
  var tag=document.createElement('div'); tag.className='hf-tag'; tag.textContent='이번 달 바꿀 한 가지'; labWrap.appendChild(tag);

  var W=0,H=0,dpr=1,shift=0.62,scale=0.92,offY=0.02,mobile=false;
  function resize(){
    dpr=Math.min(devicePixelRatio||1,2); W=host.clientWidth; H=host.clientHeight; if(!W||!H) return;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); gl.viewport(0,0,cv.width,cv.height);
    mobile = W<768;
    /* 레이더 크기: 화면 높이 기준. 모바일은 글 아래에 두고 조금 작게 */
    scale = mobile ? Math.min(0.33, 240/H) : 0.68;        /* 반지름 = scale*H/2 → PC 높이의 34%, 모바일 ≈150px */
    shift = mobile ? 0.0 : 0.70;
    offY = mobile ? -0.40 : 0.02;   /* 모바일: 글 아래로 내린다 */
  }
  var lastNow=0;
  var mouse={x:9,y:9}, mS={x:9,y:9}, tilt={x:0,y:0}, tgt={x:0,y:0}, t0=performance.now()-((/[?&]t=(\d+)/.exec(location.search)||[0,0])[1]*1000), alive=true, raf=0;
  var sel=0, prev=0, selMix=1, lastSw=0, GATHER=3.2, PERIOD=5.2, rot=0, ROT_SPEED=0.02;   /* 라디안/초 — 한 바퀴 약 5분 20초 */
  function toNdc(e){ var r=host.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*2-1, y:-(((e.clientY-r.top)/r.height)*2-1)}; }
  host.addEventListener('pointermove',function(e){ var p=toNdc(e); mouse=p; tgt={x:p.x,y:p.y}; },{passive:true});
  host.addEventListener('pointerleave',function(){ mouse={x:9,y:9}; mS={x:9,y:9}; tgt={x:0,y:0}; });

  /* 라벨 위치 — 셰이더와 같은 투영 (숨쉬기·밀어내기는 뺀다) */
  function proj(x,y,z){
    x*=scale; y*=scale;
    var tx=-0.40+tilt.y*0.10+0.10*Math.sin(rot), ty=tilt.x*0.14+0.12*Math.cos(rot);
    var y1=y*Math.cos(tx)-z*Math.sin(tx), z1=y*Math.sin(tx)+z*Math.cos(tx);
    var x2=x*Math.cos(ty)-z1*Math.sin(ty), z2=x*Math.sin(ty)+z1*Math.cos(ty);
    x2+=shift; y1+=offY;
    var fov=2.6, sc=fov/(fov+z2);
    var nx=x2*sc*H/W, ny=y1*sc;
    return {x:(nx+1)/2*W, y:(1-ny)/2*H};
  }
  function placeLabels(T){
    var e = Math.min(1, Math.max(0, (T-1.9)/1.0));   /* 모인 뒤에 라벨이 떠오른다 */
    for(var k=0;k<6;k++){
      var ang=A0-k*Math.PI/3-rot, v=proj(Math.cos(ang)*1.0, Math.sin(ang)*1.0, 0);
      var ox=Math.cos(ang)*(mobile?34:44), oy=-Math.sin(ang)*(mobile?22:30);   /* 꼭짓점 바깥쪽으로 */
      labs[k].style.transform='translate(-50%,-50%) translate('+(v.x+ox)+'px,'+(v.y+oy)+'px)';
      var fadeL = mobile ? 1 : Math.min(1, Math.max(0, ((v.x+ox) - W*0.50)/(W*0.06)));
      labs[k].style.opacity=e*fadeL;
      labs[k].classList.toggle('on', k===sel && selMix>0.5);
    }
    var sa=A0-sel*Math.PI/3-rot, sv=proj(Math.cos(sa)*1.0, Math.sin(sa)*1.0, 0);
    tag.style.transform='translate(-50%,0) translate('+(sv.x+Math.cos(sa)*(mobile?34:44))+'px,'+(sv.y-Math.sin(sa)*(mobile?22:30)+(Math.sin(sa)>0.7?-46:18))+'px)';
    tag.classList.toggle('on', T>GATHER+0.3 && selMix>0.6);
  }
  function frame(now){
    raf=0; if(!alive) return;
    var T=(now-t0)/1000; var dt=lastNow?Math.min(0.05,(now-lastNow)/1000):0.016; lastNow=now;
    tilt.x+=(tgt.x-tilt.x)*0.035; tilt.y+=(tgt.y-tilt.y)*0.035;
    if(mouse.x>5){ mS={x:9,y:9}; } else { if(mS.x>5) mS={x:mouse.x,y:mouse.y}; mS.x+=(mouse.x-mS.x)*0.05; mS.y+=(mouse.y-mS.y)*0.05; }
    /* 금색 축 순환: 모인 뒤 5초마다 다음 축으로, 0.9초에 걸쳐 건너간다 */
    rot = Math.max(0, T-GATHER) * ROT_SPEED * (1.0 - Math.exp(-Math.max(0,T-GATHER)/2.5));   /* 모인 뒤 서서히 돌기 시작 */
    if(T>GATHER){ if(T-lastSw>PERIOD){ prev=sel; sel=(sel+1)%6; lastSw=T; selMix=0; } selMix=Math.min(1, selMix+dt*1.1); } else { lastSw=GATHER; }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uT,T); gl.uniform2f(U.uRes,cv.width,cv.height); gl.uniform2f(U.uTilt,tilt.x,tilt.y);
    gl.uniform2f(U.uMouse,mS.x,mS.y); gl.uniform1f(U.uDpr,dpr); gl.uniform1f(U.uShift,shift); gl.uniform1f(U.uScale,scale);
    gl.uniform1f(U.uSel,sel); gl.uniform1f(U.uSelMix,selMix); gl.uniform1f(U.uPrev,prev); gl.uniform1f(U.uOffY,offY); gl.uniform1f(U.uRot,rot);
    gl.drawArrays(gl.POINTS,0,N);
    placeLabels(T);
    if(!reduced) raf=requestAnimationFrame(frame);
  }
  resize(); addEventListener('resize',resize); if(window.ResizeObserver){ new ResizeObserver(resize).observe(host); } setTimeout(resize,600); setTimeout(resize,2000);
  if(reduced){ t0=performance.now()-GATHER*1000-1000; }
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ alive=!!(es[0]&&es[0].isIntersecting); if(alive&&!raf) raf=requestAnimationFrame(frame); },{threshold:0}).observe(host); }
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&alive&&!raf) raf=requestAnimationFrame(frame); });
  raf=requestAnimationFrame(frame);

  }
  var bound=null;
  function fitHdr(root){ var h=document.querySelector('header.global-header'); if(!h) return; var hh=Math.round(h.getBoundingClientRect().height); if(hh>0&&hh<200) root.style.setProperty('--csx-hdr', hh+'px'); }
  function boot(){
    var root = bm.container && bm.container.querySelector('.csx');
    if(!root) return false;
    if(bound !== root){
      root.addEventListener('click', function(e){
        var go = e.target.closest('[data-go]'); if(!go) return;
        e.preventDefault();
        var target = go.getAttribute('data-go')==='how' ? root.querySelector('#csx-how') : (document.querySelector('.cs-form') || document.querySelector('form'));
        if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      });
      /* 모바일 하단 버튼: 히어로 70% 지나면 뜨고, 폼이 보이면 숨는다 */
      /* 모바일 하단 고정 버튼은 2026-09-11 대표님 지시로 제거. 옛 템플릿에 남아 있으면 지운다 */
      root.querySelectorAll('.csx-bar').forEach(function(b){ b.remove(); });
      document.querySelectorAll('.csx-bar--portal').forEach(function(b){ b.remove(); });
      fitHdr(root); addEventListener('resize', function(){ fitHdr(root); }); setTimeout(function(){ fitHdr(root); }, 900);
      /* 스크롤 등장: 같은 부모 안에서는 순번(--i)만큼 시간차. 숫자는 켜질 때 0 부터 센다 */
      var reduced=false; try{ reduced=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
      var targets = root.querySelectorAll('[data-rv]');
      var seen = new Map();
      targets.forEach(function(el){ var par = el.parentElement; var k = seen.get(par)||0; el.style.setProperty('--i', k); seen.set(par, k+1); });
      function countUp(b){ var to = parseInt(b.getAttribute('data-n'),10); if(isNaN(to) || b.__done) return; b.__done = true; if(reduced || to<=1){ b.textContent = to; return; }
        var t0 = performance.now(), dur = 900; (function step(now){ var p = Math.min(1,(now-t0)/dur); p = 1-Math.pow(1-p,3); b.textContent = Math.round(to*p); if(p<1) requestAnimationFrame(step); })(t0); }
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
      function show(el){ el.classList.add('in'); el.querySelectorAll('[data-n]').forEach(countUp); if(el.hasAttribute('data-n')) countUp(el); if(el.classList.contains('gl')) armSweep(el); el.querySelectorAll('[data-cycle]').forEach(armCycle); }
      if(reduced || !('IntersectionObserver' in window)){ targets.forEach(show); }
      else { var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } }); }, {threshold:0.18, rootMargin:'0px 0px -6% 0px'}); targets.forEach(function(el){ io.observe(el); }); }
      bound = root;
    }
    var host = root.querySelector('.hf');
    if(host && !host.__sbaGl){ host.__sbaGl = true; startHero(host); }
    return true;
  }
  if(!boot()){ var tries=0; var timer=setInterval(function(){ if(boot() || ++tries>200) clearInterval(timer); }, 50); }
  setTimeout(boot, 900); setTimeout(boot, 2600);
  if(typeof bm !== 'undefined') bm.onContextChange = function(){ boot(); };
};
