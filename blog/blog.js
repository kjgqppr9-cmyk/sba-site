/* 스몰브랜드설계자 블로그 화면: 다크 모드(기본) + 일반 모드 토글 + 읽기 타이포 (2026-09-13)
   적용 범위: /boards/5619(블로그 목록), /posts/blog-*(블로그 글), 게시판 이름이 '블로그'인 글.
   미리보기: 아무 글 주소 뒤에 ?sbablog=1 을 붙이면 강제로 켜진다.
   2026-09-17 강의 후기 게시판(/boards/5670 = /boards/class-reviews, 게시판 이름 '강의 후기')도 같은 틀을 쓴다.
   후기는 밝게 보여야 해서 일반 모드가 기본이고, 테두리 없이 떠 있는 뉴모피즘 카드(사이트 아래 블록과 같은 그림자 값)로 꾸민다. */
(function () {
  if (window.__sbaBlog) return; window.__sbaBlog = 1;
  var KEY = 'sbaBlogTheme', ROOT = document.documentElement;

  var CSS = [
  /* 색 토큰: DESIGN-SBA-homepage.md 기준. 금색은 선에만, 글자 강조는 초록(일반)과 민트(다크) */
  'html[data-sba-blog]{--b-bg:#F2F0EB;--b-surface:#E8E5DC;--b-card:#FFFFFF;--b-text:#1F1F1B;--b-soft:#4A4845;--b-muted:#7A7774;--b-head:#1A1A17;--b-em:#006241;--b-em2:#B15E41;--b-line:rgba(26,26,23,.12);--b-gold:#D9AE4B;--b-w:400;--b-shadow:0 1px 2px rgba(26,26,23,.06),0 10px 28px rgba(26,26,23,.07)}',
  'html[data-sba-blog="dark"]{--b-bg:#10241C;--b-surface:#1A3229;--b-card:#1A3229;--b-text:#E3E0D6;--b-soft:#BCC7C0;--b-muted:#8FA098;--b-head:#F5F2EA;--b-em:#7FE0BE;--b-em2:#F2A286;--b-line:rgba(233,230,220,.13);--b-w:350;--b-shadow:0 1px 2px rgba(0,0,0,.25),0 12px 30px rgba(0,0,0,.28)}',
  'html[data-sba-blog] body,html[data-sba-blog] [class*="PageView_wrapper"]{background:var(--b-bg)!important;transition:background-color .25s ease}',
  'html[data-sba-blog] section:has([class*="Post_wrapper"]),html[data-sba-blog] section:has(.board-wrapper),html[data-sba-blog] section:has([class*="Post_wrapper"]) [class*="section-outer"],html[data-sba-blog] section:has(.board-wrapper) [class*="section-outer"]{background:transparent!important}',

  /* 도구줄: 보기 방식(목록 화면만) + 화면 모드. 미끄러지는 손잡이가 달린 분할 버튼 */
  'html[data-sba-blog]{--b-thumb:#FFFFFF;--b-track:#E6E2D8;--b-item:#FFFFFF}',
  'html[data-sba-blog="dark"]{--b-thumb:#2A4B3F;--b-track:#152C23;--b-item:#1A3229}',
  '.sba-mode{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin:0 0 26px}',
  '.sba-mode.has-view{justify-content:space-between}',
  '.sba-seg{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:3px;border-radius:12px;background:var(--b-track);box-shadow:inset 0 0 0 1px var(--b-line)}',
  '.sba-seg::before{content:"";position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);border-radius:9px;background:var(--b-thumb);box-shadow:0 1px 2px rgba(0,0,0,.18),0 4px 12px rgba(0,0,0,.12),inset 0 0 0 1px rgba(217,174,75,.38);transition:transform .28s cubic-bezier(.3,.7,.2,1)}',
  '.sba-seg[data-on="1"]::before{transform:translateX(100%)}',
  '.sba-seg button{position:relative;z-index:1;appearance:none;border:0;background:transparent;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:68px;height:34px;padding:0 12px;border-radius:9px;color:var(--b-muted);font:600 13px/1 Pretendard,"Pretendard Variable",-apple-system,sans-serif;letter-spacing:-.01em;cursor:pointer;transition:color .2s}',
  '.sba-seg button svg{width:15px;height:15px;flex:none;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
  '.sba-seg button:hover{color:var(--b-soft)}',
  '.sba-seg button[aria-pressed="true"]{color:var(--b-head)}',
  '.sba-seg button[aria-pressed="true"] svg{color:var(--b-em)}',
  '.sba-seg button:focus-visible{outline:2px solid var(--b-gold);outline-offset:1px}',

  /* 글 틀: PC 읽기 폭 700 */
  'html[data-sba-blog] [class*="Post_wrapper"]{max-width:760px!important;margin-left:auto!important;margin-right:auto!important;color:var(--b-text)}',
  'html[data-sba-blog] [class*="Post_wrapper"]>h2{color:var(--b-em)!important;font-size:14px!important;letter-spacing:.08em!important;font-weight:700!important;opacity:.9}',
  'html[data-sba-blog] [class*="Post_post-wrapper"]{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding-left:0!important;padding-right:0!important}',
  'html[data-sba-blog] [class*="Post_post-header"] h2{color:var(--b-head)!important;font-size:clamp(25px,6.2vw,34px)!important;line-height:1.38!important;letter-spacing:-.025em!important;font-weight:800!important;word-break:keep-all}',
  'html[data-sba-blog] [class*="Post_post-info"] *{color:var(--b-muted)!important}',
  'html[data-sba-blog] [class*="Post_wrapper"] [class*="divider"]{background:var(--b-line)!important;border-color:var(--b-line)!important}',
  'html[data-sba-blog] [class*="Post_wrapper"] .tc-text-40,html[data-sba-blog] [class*="Post_wrapper"] .tc-text-60{color:var(--b-muted)!important}',

  /* 본문: 행간 넓게, 덩어리 사이 빈 줄 하나만큼 */
  'html[data-sba-blog] .ck-content{font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,sans-serif!important;color:var(--b-text)!important;font-size:17px!important;line-height:1.95!important;letter-spacing:-.012em!important;font-weight:var(--b-w)!important;word-break:keep-all;overflow-wrap:anywhere}',
  'html[data-sba-blog] .ck-content p{margin:0 0 1.95em!important;font-size:inherit!important;line-height:inherit!important;color:inherit!important}',
  '@media (max-width:767px){html[data-sba-blog] .ck-content{padding-left:5px!important;padding-right:5px!important}html[data-sba-blog] [class*="Post_post-header"],html[data-sba-blog] [class*="Post_post-info"],html[data-sba-blog] .sba-mode{padding-left:5px;padding-right:5px}}',
  'html[data-sba-blog] .ck-content h2{color:var(--b-head)!important;font-size:23px!important;line-height:1.5!important;letter-spacing:-.02em!important;font-weight:700!important;margin:2.5em 0 1.1em!important;word-break:keep-all}',
  /* 글 첫 문단은 인용구 자리: 코럴 인용 + 작은 출처 */
  'html[data-sba-blog] .ck-content>p:first-child{font-size:14px!important;line-height:1.85!important;color:var(--b-muted)!important;margin-bottom:2.6em!important}',
  'html[data-sba-blog] .ck-content>p:first-child i{display:inline-block;font-size:18px!important;line-height:1.75!important;margin-bottom:8px;font-weight:600!important}',
  'html[data-sba-blog] .ck-content h3{color:var(--b-head)!important;font-size:19px!important;line-height:1.55!important;font-weight:700!important;margin:2.4em 0 .8em!important}',
  'html[data-sba-blog] .ck-content strong,html[data-sba-blog] .ck-content b{color:var(--b-em)!important;font-weight:700!important}',
  'html[data-sba-blog] .ck-content i,html[data-sba-blog] .ck-content em{color:var(--b-em2)!important;font-style:normal!important;font-weight:650!important}',
  'html[data-sba-blog] .ck-content a{color:var(--b-em)!important;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px}',
  'html[data-sba-blog] .ck-content ul,html[data-sba-blog] .ck-content ol{margin:0 0 1.95em!important;padding-left:1.2em!important}',
  'html[data-sba-blog] .ck-content li{margin:0 0 .35em!important;line-height:inherit!important}',
  'html[data-sba-blog] .ck-content li::marker{color:var(--b-em)}',
  /* 인용 상자: 한쪽 색 띠 없음(대표님 규칙). 면 색 대비와 금빛 가는 선만 */
  'html[data-sba-blog] .ck-content blockquote{margin:2.6em 0!important;padding:24px 24px 4px!important;border:0!important;border-radius:16px!important;background:var(--b-surface)!important;font-style:normal!important;color:var(--b-text)!important;position:relative}',
  'html[data-sba-blog] .ck-content blockquote::before{content:"";position:absolute;left:24px;right:24px;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--b-gold),transparent);opacity:.7}',
  'html[data-sba-blog] .ck-content blockquote p{margin:0 0 1.3em!important}',

  /* 이미지: 휴대폰은 화면 끝까지, 위아래 넉넉하게 */
  'html[data-sba-blog] .ck-content figure.image{display:block;margin:56px calc(50% - 50vw)!important;width:100vw!important;max-width:100vw!important;float:none!important}',
  'html[data-sba-blog] .ck-content figure.image img{display:block;width:100%!important;height:auto!important;margin:0 auto;border-radius:0}',
  'html[data-sba-blog] .ck-content figcaption{display:block;background:transparent!important;color:var(--b-muted)!important;font-size:13.5px!important;line-height:1.6!important;text-align:center!important;margin:14px 20px 0!important;padding:0!important;font-weight:400!important}',
  'html[data-sba-blog] .ck-content hr{border:0!important;height:1px!important;background:var(--b-line)!important;margin:3em 0!important}',

  /* 글 맨 아래 '목록으로 돌아가기' — 식스샵 기본 글자색(#1a1a17)이 어두운 바탕에서 안 보였다(2026-09-16 제보) */
  'html[data-sba-blog] [class*="BackToList"] button,html[data-sba-blog] [class*="BackToList"] a{color:var(--b-text)!important;opacity:1!important}',
  'html[data-sba-blog] [class*="BackToList"] button *,html[data-sba-blog] [class*="BackToList"] a *{color:inherit!important;fill:currentColor!important;stroke:currentColor!important}',
  'html[data-sba-blog="dark"] [class*="BackToList"] button:hover,html[data-sba-blog="dark"] [class*="BackToList"] a:hover{color:var(--b-em)!important}',

  /* PC */
  '@media (min-width:768px){',
  'html[data-sba-blog] [class*="Post_wrapper"]{padding-left:30px!important;padding-right:30px!important}',
  'html[data-sba-blog] .ck-content{font-size:18px!important;line-height:2!important}',
  'html[data-sba-blog] .ck-content p{margin-bottom:2em!important}',
  'html[data-sba-blog] .ck-content h2{font-size:26px!important}',
  'html[data-sba-blog] .ck-content figure.image{width:100%!important;max-width:700px!important;margin:76px auto!important}',
  'html[data-sba-blog] .ck-content figure.image.sba-tall{max-width:460px!important}',
  'html[data-sba-blog] .ck-content figure.image img{border-radius:14px;box-shadow:var(--b-shadow)}',
  '}',

  /* 블로그 목록 카드(기존 크림 카드 덮어쓰기) */
  'html[data-sba-blog] .container:has(.board-wrapper){background:var(--b-card)!important;box-shadow:var(--b-shadow)!important}',
  'html[data-sba-blog] .board-wrapper,html[data-sba-blog] .board-wrapper .title{color:var(--b-head)!important}',
  'html[data-sba-blog] .board-wrapper .board-header .heading-3{color:var(--b-em)!important}',
  'html[data-sba-blog] .board-wrapper .content,html[data-sba-blog] .board-wrapper .board-post-meta,html[data-sba-blog] .board-wrapper .board-post-meta *,html[data-sba-blog] .board-wrapper .empty-contents-wrapper,html[data-sba-blog] .board-wrapper .empty-contents-wrapper *{color:var(--b-muted)!important}',
  'html[data-sba-blog="dark"] .board-wrapper .input-field{background:#132A21!important;box-shadow:inset 0 0 0 1px var(--b-line)!important}',
  'html[data-sba-blog="dark"] .board-wrapper .input-field__input{color:var(--b-text)!important}',
  'html[data-sba-blog] .board-wrapper li>.divider{background:var(--b-line)!important}',
  'html[data-sba-blog="dark"] .board-wrapper .pagination .btn-prev,html[data-sba-blog="dark"] .board-wrapper .pagination .btn-next{background:var(--b-surface)!important;box-shadow:none!important}',
  'html[data-sba-blog="dark"] .board-wrapper .pagination button{color:var(--b-soft)!important}',
  /* 식스샵 기본 게시판 목록(Board_wrapper) */
  'html[data-sba-blog] section:has([class*="Board_wrapper"]){background:transparent!important}',
  'html[data-sba-blog] [class*="Board_wrapper"]{max-width:760px!important;margin-left:auto!important;margin-right:auto!important;color:var(--b-text)!important}',
  'html[data-sba-blog] [class*="Board_wrapper"]>h2{color:var(--b-head)!important;font-size:clamp(26px,6vw,34px)!important;font-weight:800!important;letter-spacing:-.02em!important}',
  'html[data-sba-blog] [class*="BoardList_wrapper"] *:not(img){background-color:transparent!important}',
  'html[data-sba-blog] [class*="BoardList_board-item"]{background:var(--b-surface)!important;border-radius:18px!important;padding:16px 18px!important;margin-bottom:12px!important;box-shadow:inset 0 0 0 1px var(--b-line)!important}',
  'html[data-sba-blog] [class*="BoardList_post-title-wrapper"] *{color:var(--b-head)!important;font-weight:700!important}',
  'html[data-sba-blog] [class*="BoardList_post-contents-wrapper"] *{color:var(--b-soft)!important}',
  'html[data-sba-blog] [class*="BoardList_post-meta-row"] *,html[data-sba-blog] [class*="Board_wrapper"] .tc-text-60,html[data-sba-blog] [class*="Board_wrapper"] .tc-text-40{color:var(--b-muted)!important}',
  'html[data-sba-blog] [class*="BoardList_thumbnail-image"] img{border-radius:12px!important}',
  /* 목록 공통: 썸네일은 원본 비율(1200x630), 제목 두 줄·설명·날짜 칸 높이를 고정해 크기를 맞춘다 */
  'html[data-sba-blog] [class*="BoardList_wrapper"]>li>[class*="Divider"]{display:none!important}',
  'html[data-sba-blog] [class*="BoardList_board-item"]{display:flex!important;text-decoration:none!important;overflow:hidden;transition:transform .25s ease,box-shadow .25s ease}',
  'html[data-sba-blog] [class*="BoardList_thumbnail-image"]{flex:none!important;height:auto!important;aspect-ratio:1200/630!important;--aspect-ratio:1200/630!important;overflow:hidden}',
  'html[data-sba-blog] [class*="BoardList_thumbnail-image"] img{width:100%!important;height:100%!important;object-fit:cover!important;transition:transform .5s ease}',
  'html[data-sba-blog] [class*="BoardList_post-info-wrapper"]{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;min-width:0;align-items:stretch!important;text-align:left!important}',
  /* 설명이 비거나 짧아도 제목·날짜 줄이 가운데로 몰리지 않게 폭을 채우고 왼쪽에 붙인다 */
  'html[data-sba-blog] [class*="BoardList_post-contents-wrapper"],html[data-sba-blog] [class*="BoardList_post-title-wrapper"],html[data-sba-blog] [class*="BoardList_post-meta-row"]{width:100%!important;text-align:left!important;justify-content:flex-start!important;align-items:flex-start!important}',
  'html[data-sba-blog] [class*="BoardList_post-title-wrapper"] p{white-space:normal!important;display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;text-overflow:clip!important;word-break:keep-all;letter-spacing:-.02em!important;line-height:1.45!important}',
  'html[data-sba-blog] [data-sba-ex]::after{content:attr(data-sba-ex);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;color:var(--b-soft);font-size:14px;line-height:1.62;font-weight:400;letter-spacing:-.01em;word-break:keep-all;margin-top:8px;min-height:3.24em}',
  'html[data-sba-blog] [class*="BoardList_post-meta-row"]{margin-top:auto!important;padding-top:14px}',
  'html[data-sba-blog] [class*="BoardList_post-author-name"],html[data-sba-blog] [class*="BoardList_text-divider"]{display:none!important}',
  'html[data-sba-blog] [data-sba-tag]::before{content:attr(data-sba-tag);display:inline-block;margin-right:10px;padding:4px 9px;border-radius:6px;font-size:12px;font-weight:600;line-height:1;color:var(--b-em);box-shadow:inset 0 0 0 1px var(--b-line)}',
  'html[data-sba-blog] [class*="BoardList_post-created-info-wrapper"]{display:flex!important;align-items:center}',
  /* 카드형(기본) */
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="Board_wrapper"]{max-width:900px!important}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_wrapper"]{display:grid!important;grid-template-columns:1fr;gap:18px}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_wrapper"]>li{display:flex;margin:0!important}',
  'html[data-sba-blog] [class*="BoardList_wrapper"]{border:0!important;padding:0!important;border-radius:0!important}',
  'html[data-sba-blog] [class*="BoardList_wrapper"] [class*="BoardList_board-item"]{background-color:var(--b-item)!important}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_board-item"]{flex-direction:column!important;align-items:stretch!important;width:100%;padding:0!important;margin:0!important;border-radius:18px!important;gap:0!important}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_thumbnail-image"]{width:100%!important;border-radius:0!important}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_thumbnail-image"] img{border-radius:0!important}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_post-info-wrapper"]{padding:18px 20px 20px!important}',
  'html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_post-title-wrapper"] p{font-size:18px!important;min-height:2.9em}',
  '@media (min-width:768px){html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_wrapper"]{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}html[data-sba-blog]:not([data-sba-view="list"]) [class*="BoardList_post-info-wrapper"]{padding:20px 24px 22px!important}}',
  '@media (hover:hover){html[data-sba-blog] [class*="BoardList_board-item"]:hover{transform:translateY(-3px);box-shadow:inset 0 0 0 1px rgba(217,174,75,.45),var(--b-shadow)!important}html[data-sba-blog] [class*="BoardList_board-item"]:hover img{transform:scale(1.03)}}',
  /* 목록형 */
  'html[data-sba-blog][data-sba-view="list"] [class*="BoardList_board-item"]{flex-direction:row!important;align-items:center!important;gap:18px!important}',
  'html[data-sba-blog][data-sba-view="list"] [class*="BoardList_thumbnail-image"]{width:200px!important;border-radius:12px!important}',
  'html[data-sba-blog][data-sba-view="list"] [class*="BoardList_post-info-wrapper"]{align-self:stretch}',
  'html[data-sba-blog][data-sba-view="list"] [class*="BoardList_post-title-wrapper"] p{font-size:17px!important}',
  'html[data-sba-blog][data-sba-view="list"] [data-sba-ex]::after{-webkit-line-clamp:1;min-height:1.62em;margin-top:6px}',
  '@media (max-width:767px){html[data-sba-blog][data-sba-view="list"] [class*="BoardList_board-item"]{gap:14px!important;padding:12px!important}html[data-sba-blog][data-sba-view="list"] [class*="BoardList_thumbnail-image"]{width:120px!important;border-radius:10px!important}html[data-sba-blog][data-sba-view="list"] [class*="BoardList_post-title-wrapper"] p{font-size:15px!important}html[data-sba-blog][data-sba-view="list"] [data-sba-ex]::after{display:none}html[data-sba-blog][data-sba-view="list"] [class*="BoardList_post-meta-row"]{padding-top:8px}}',
  /* 검색창은 가운데 */
  'html[data-sba-blog] [class*="Board_post-sub-wrapper"]{display:flex!important;justify-content:center!important;margin-top:36px}',
  'html[data-sba-blog] [class*="Board_post-sub-wrapper"] form{width:min(440px,100%)}',
  'html[data-sba-blog] [class*="Board_search-input"]{width:100%!important;max-width:none!important}',
  'html[data-sba-blog] [class*="Board_wrapper"] [class*="SearchResultText_search-result-line"]{background:var(--b-line)!important}',
  'html[data-sba-blog] [class*="InputText_input-container"]{background:var(--b-surface)!important;border-color:var(--b-line)!important;border-radius:999px!important}',
  'html[data-sba-blog] [class*="InputText_input-container"] input{color:var(--b-text)!important;background:transparent!important}',
  'html[data-sba-blog] [class*="InputText_input-container"] input::placeholder{color:var(--b-muted)!important}',
  'html[data-sba-blog] [class*="Board_wrapper"] [class*="IconButton"],html[data-sba-blog] [class*="Board_wrapper"] [class*="InputText_icon"]{color:var(--b-soft)!important}',
  /* 게시판 페이지 틀에 딸린 빈 게시판 블록("게시판 선택")은 블로그 화면에서 숨긴다 */
  'html[data-sba-blog] section.section-type-Custom-T02:has(.board-wrapper){display:none!important}',
  /* ── 강의 후기 게시판 전용: 뉴모피즘(테두리 없이 떠 있는 면). 그림자 값은 사이트 하단 게시판 블록에서 실측(2026-09-17) ── */
  'html[data-sba-rev]{--n-bg:#F2F0EB;--n-lo:#D4D0C5;--n-hi:#FDFDFB;--n-ilo:#D9D5CA;--n-card:linear-gradient(145deg,#F6F4EF,#ECE9E2)}',
  'html[data-sba-rev][data-sba-blog="dark"]{--n-bg:#10241C;--n-lo:rgba(0,0,0,.46);--n-hi:rgba(255,255,255,.045);--n-ilo:rgba(0,0,0,.5);--n-card:linear-gradient(145deg,#15302A,#0D1F18)}',
  'html[data-sba-rev]{--b-bg:var(--n-bg);--b-surface:var(--n-bg);--b-item:var(--n-bg);--b-track:var(--n-bg);--b-thumb:var(--n-bg)}',
  'html[data-sba-rev] [class*="Board_wrapper"]{max-width:1080px!important}',
  'html[data-sba-rev] [class*="BoardList_wrapper"]>li{min-width:0!important}',
  'html[data-sba-rev] [class*="BoardList_post-info-wrapper"]{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}',
  'html[data-sba-rev] [class*="BoardList_post-title-wrapper"],html[data-sba-rev] [class*="BoardList_post-contents-wrapper"],html[data-sba-rev] [class*="BoardList_post-meta-row"]{max-width:100%!important;min-width:0!important}',
  'html[data-sba-rev] [class*="Board_wrapper"]>h2{text-align:center!important;margin-bottom:6px!important}',
  'html[data-sba-rev] .sba-mode{margin:18px 0 34px}',
  'html[data-sba-rev] .sba-seg{background:var(--n-bg);box-shadow:inset 3px 3px 7px var(--n-ilo),inset -3px -3px 7px var(--n-hi);border-radius:14px;padding:5px}',
  'html[data-sba-rev] .sba-seg::before{top:5px;bottom:5px;left:5px;width:calc(50% - 5px);border-radius:10px;background:var(--n-bg);box-shadow:3px 3px 7px var(--n-lo),-3px -3px 7px var(--n-hi),inset 0 0 0 1px rgba(217,174,75,.35)}',
  'html[data-sba-rev] [class*="BoardList_wrapper"] [class*="BoardList_board-item"]{background:var(--n-card)!important;border:0!important;border-radius:26px!important;box-shadow:8px 8px 18px var(--n-lo),-8px -8px 18px var(--n-hi)!important}',
  'html[data-sba-rev] [class*="BoardList_thumbnail-image"]{aspect-ratio:3/2!important;--aspect-ratio:3/2!important;border-radius:18px!important}',
  'html[data-sba-rev] [class*="BoardList_thumbnail-image"] img{border-radius:18px!important}',
  '@media (hover:hover){html[data-sba-rev] [class*="BoardList_board-item"]:hover{transform:translateY(-4px);box-shadow:12px 14px 26px var(--n-lo),-10px -10px 22px var(--n-hi),inset 0 0 0 1px rgba(217,174,75,.35)!important}}',
  'html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_wrapper"]{gap:30px!important;padding:10px 6px 20px!important}',
  'html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_board-item"]{padding:14px!important}',
  'html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_thumbnail-image"],html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_thumbnail-image"] img{border-radius:18px!important}',
  'html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_post-info-wrapper"]{padding:16px 8px 6px!important}',
  '@media (min-width:768px){html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_wrapper"]{grid-template-columns:repeat(2,minmax(0,1fr))}html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_post-info-wrapper"]{padding:18px 10px 8px!important}}',
  '@media (min-width:1024px){html[data-sba-rev]:not([data-sba-view="list"]) [class*="BoardList_wrapper"]{grid-template-columns:repeat(3,minmax(0,1fr))}}',
  'html[data-sba-rev][data-sba-view="list"] [class*="BoardList_wrapper"]>li{margin:0 6px 22px!important}',
  'html[data-sba-rev][data-sba-view="list"] [class*="BoardList_board-item"]{padding:14px!important;gap:24px!important}',
  'html[data-sba-rev][data-sba-view="list"] [class*="BoardList_thumbnail-image"]{width:260px!important}',
  'html[data-sba-rev][data-sba-view="list"] [class*="BoardList_post-info-wrapper"]{padding:6px 10px 6px 0!important}',
  'html[data-sba-rev][data-sba-view="list"] [class*="BoardList_post-title-wrapper"] p{font-size:19px!important}',
  '@media (max-width:767px){html[data-sba-rev][data-sba-view="list"] [class*="BoardList_board-item"]{gap:14px!important;padding:10px!important}html[data-sba-rev][data-sba-view="list"] [class*="BoardList_thumbnail-image"],html[data-sba-rev][data-sba-view="list"] [class*="BoardList_thumbnail-image"] img{width:132px!important;border-radius:14px!important}html[data-sba-rev][data-sba-view="list"] [class*="BoardList_thumbnail-image"] img{width:100%!important}html[data-sba-rev][data-sba-view="list"] [class*="BoardList_post-title-wrapper"] p{font-size:15px!important}}',
  'html[data-sba-rev] [class*="Board_post-sub-wrapper"]{justify-content:space-between!important;align-items:center;gap:16px;margin-top:40px}',
  'html[data-sba-rev] [class*="Board_post-sub-wrapper"] form{width:min(360px,100%)}',
  'html[data-sba-rev] [class*="InputText_input-container"]{background:var(--n-bg)!important;border:0!important;box-shadow:inset 3px 3px 7px var(--n-ilo),inset -3px -3px 7px var(--n-hi)!important}',
  'html[data-sba-rev] [class*="Board_post-sub-wrapper"]>button{flex:none;border:0!important;border-radius:999px!important;min-width:112px;height:46px;padding:0 26px!important;color:#fff!important;font-weight:700!important;background:linear-gradient(145deg,#008A55,#00613E)!important;box-shadow:6px 6px 14px var(--n-lo),-6px -6px 14px var(--n-hi),0 10px 24px rgba(0,98,65,.18),inset 0 0 0 1.5px rgba(217,174,75,.55)!important;transition:transform .2s ease,box-shadow .2s ease}',
  'html[data-sba-rev] [class*="Board_post-sub-wrapper"]>button:hover{transform:translateY(-2px)}',
  'html[data-sba-rev] [class*="Board_post-sub-wrapper"]>button:active{transform:translateY(1px)}',
  'html[data-sba-rev] [class*="Board_wrapper"] [class*="Pagination"] button{background:var(--n-bg)!important;border:0!important;border-radius:50%!important;box-shadow:3px 3px 7px var(--n-lo),-3px -3px 7px var(--n-hi)!important;color:var(--b-soft)!important}',
  'html[data-sba-rev] [class*="Board_wrapper"] [class*="Pagination"] button[aria-current],html[data-sba-rev] [class*="Board_wrapper"] [class*="Pagination"] button[class*="active"],html[data-sba-rev] [class*="Board_wrapper"] [class*="Pagination"] button[class*="selected"]{box-shadow:inset 3px 3px 7px var(--n-ilo),inset -3px -3px 7px var(--n-hi)!important;color:var(--b-em)!important;font-weight:700!important}',
  '@media (min-width:768px){html[data-sba-rev] [class*="Post_post-wrapper"]{background:var(--n-card)!important;border-radius:28px!important;box-shadow:8px 8px 18px var(--n-lo),-8px -8px 18px var(--n-hi)!important;padding:44px 48px 36px!important}}',
  '@media (prefers-reduced-motion:reduce){html[data-sba-blog] body,.sba-seg::before,.sba-seg button,html[data-sba-blog] [class*="BoardList_board-item"],html[data-sba-blog] [class*="BoardList_thumbnail-image"] img{transition:none!important}}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('sba-blog-css')) return;
    var s = document.createElement('style'); s.id = 'sba-blog-css'; s.textContent = CSS;
    (document.head || ROOT).appendChild(s);
  }
  function stored() { try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  /* 강의 후기 게시판 */
  function isReviews() {
    var p = location.pathname || '';
    if (/^\/boards\/(5670|class-reviews)(\/|$)/.test(p)) return true;
    if (/^\/posts\//.test(p)) {
      var h = document.querySelector('[class*="Post_wrapper"] > h2');
      if (h && h.textContent.trim() === '강의 후기') return true;
    }
    return false;
  }
  var RKEY = 'sbaRevTheme', RVKEY = 'sbaRevView';
  function storedRev() { try { return localStorage.getItem(RKEY) === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; } }
  function storedRevView() { try { return localStorage.getItem(RVKEY) === 'list' ? 'list' : 'card'; } catch (e) { return 'card'; } }
  function saveRev(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function isBlog() {
    var p = location.pathname || '';
    if (/[?&]sbablog=1/.test(location.search)) return true;
    if (/^\/boards\/5619(\/|$)/.test(p)) return true;
    if (/^\/posts\/blog-/.test(p)) return true;
    if (/^\/posts\//.test(p)) {
      var h = document.querySelector('[class*="Post_wrapper"] > h2');
      if (h && h.textContent.trim() === '블로그') return true;
    }
    return false;
  }

  var VKEY = 'sbaBlogView';
  function storedView() { try { return localStorage.getItem(VKEY) === 'list' ? 'list' : 'card'; } catch (e) { return 'card'; } }
  function saveView(v) { try { localStorage.setItem(VKEY, v); } catch (e) {} }

  var I = {
    card: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
    list: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="5" height="4" rx="1"/><rect x="3.5" y="15" width="5" height="4" rx="1"/><path d="M12 7h8.5M12 17h8.5"/></svg>',
    dark: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>'
  };
  function seg(kind, label, a, b) {
    return '<div class="sba-seg" data-kind="' + kind + '" role="group" aria-label="' + label + '">' +
      '<button type="button" data-v="' + a[0] + '" aria-label="' + a[2] + '">' + I[a[0]] + '<span>' + a[1] + '</span></button>' +
      '<button type="button" data-v="' + b[0] + '" aria-label="' + b[2] + '">' + I[b[0]] + '<span>' + b[1] + '</span></button></div>';
  }
  function mountToggle() {
    var post = document.querySelector('[class*="Post_post-wrapper"]');
    var host = post || document.querySelector('[class*="Board_wrapper"]');
    if (!host) return;
    for (var i = 0; i < host.children.length; i++) { if (host.children[i].classList.contains('sba-mode')) return; }
    var wrap = document.createElement('div'); wrap.className = 'sba-mode' + (post ? '' : ' has-view');
    var rev = ROOT.hasAttribute('data-sba-rev');
    wrap.innerHTML = (post ? '' : seg('view', '보기 방식', ['card', '카드', '카드형으로 보기'], ['list', '목록', '목록형으로 보기'])) +
      (rev ? seg('theme', '화면 모드', ['light', '일반', '일반 모드'], ['dark', '다크', '다크 모드'])
           : seg('theme', '화면 모드', ['dark', '다크', '다크 모드'], ['light', '일반', '일반 모드']));
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      var kind = b.parentNode.getAttribute('data-kind'), v = b.getAttribute('data-v');
      if (ROOT.hasAttribute('data-sba-rev')) saveRev(kind === 'view' ? RVKEY : RKEY, v);
      else if (kind === 'view') saveView(v); else save(v);
      apply();
    });
    var head = host.querySelector(':scope > h2');
    if (head && !post) host.insertBefore(wrap, head.nextSibling); else host.insertBefore(wrap, host.firstChild);
  }
  function syncToggle() {
    var cur = { theme: ROOT.getAttribute('data-sba-blog'), view: ROOT.getAttribute('data-sba-view') || 'card' };
    document.querySelectorAll('.sba-seg').forEach(function (g) {
      var v = cur[g.getAttribute('data-kind')], bs = g.querySelectorAll('button');
      g.setAttribute('data-on', bs[1].getAttribute('data-v') === v ? '1' : '0');
      bs.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
    });
  }

  /* 카드 설명 한 줄: 페이지 데이터(__NEXT_DATA__)의 본문에서 인용구·소제목을 건너뛴 첫 문단들 */
  /* 메뉴를 눌러 들어오면(클라이언트 이동) __NEXT_DATA__ 는 처음 연 페이지 것이라 목록 글이 없다.
     글 페이지 HTML 에도 본문 데이터가 없다(2026-09-14 실측). 그래서 지금 목록 주소의 HTML 을 한 번 받아 읽는다. */
  var META = {}, asked = {};
  function excerpt(html) {
    var d = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html').body.firstChild, out = '', first = true;
    for (var n = d.firstElementChild; n && out.length < 70; n = n.nextElementSibling) {
      if (n.tagName !== 'P') { if (/^H[1-6]$/.test(n.tagName)) first = false; continue; }
      if (first && n.querySelector('i')) { first = false; continue; }
      first = false;
      var t = n.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
      var ta = document.createElement('textarea'); ta.innerHTML = t; t = ta.value.replace(/\s+/g, ' ').trim();
      if (t) out += (out ? ' ' : '') + t;
    }
    return out.length > 120 ? out.slice(0, 118) + '…' : out;
  }
  function collect(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (typeof obj.slug === 'string' && typeof obj.contents === 'string') {
      META[obj.slug] = { ex: excerpt(obj.contents), tag: obj.tags && obj.tags[0] && obj.tags[0].name || '' };
    }
    for (var k in obj) { if (obj[k] && typeof obj[k] === 'object') collect(obj[k]); }
  }
  function readNext(doc) {
    var s = doc.getElementById('__NEXT_DATA__'); if (!s) return;
    try { collect(JSON.parse(s.textContent)); } catch (e) {}
  }
  function decorate() {
    var items = document.querySelectorAll('[class*="BoardList_board-item"]'); if (!items.length) return;
    if (!decorate.__read) { decorate.__read = 1; readNext(document); }
    items.forEach(function (a) {
      var m = (a.getAttribute('href') || '').match(/\/posts\/([^?#/]+)/); if (!m) return;
      var slug = decodeURIComponent(m[1]), info = META[slug];
      if (!info) {
        var src = location.pathname + location.search;
        if (!asked[src]) {
          asked[src] = 1;
          fetch(src, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (t) {
            readNext(new DOMParser().parseFromString(t, 'text/html')); decorate();
          }).catch(function () {});
        }
        info = { ex: '', tag: '' };
      }
      var c = a.querySelector('[class*="BoardList_post-contents-wrapper"]'), r = a.querySelector('[class*="BoardList_post-created-info-wrapper"]');
      if (c && c.getAttribute('data-sba-ex') !== info.ex) c.setAttribute('data-sba-ex', info.ex);
      if (r && info.tag && r.getAttribute('data-sba-tag') !== info.tag) r.setAttribute('data-sba-tag', info.tag);
    });
  }
  function markTall() {
    document.querySelectorAll('.ck-content figure.image img').forEach(function (img) {
      var f = img.closest('figure'); if (!f || f.__sbaT) return;
      var go = function () { if (!img.naturalWidth) return; f.__sbaT = 1; if (img.naturalHeight / img.naturalWidth > 1.15) f.classList.add('sba-tall'); };
      if (img.complete) go(); else img.addEventListener('load', go, { once: true });
    });
  }

  var busy = false;
  function apply() {
    if (busy) return; busy = true;
    try {
      var rev = !isBlog() && isReviews();
      if (rev || isBlog()) {
        injectCss();
        if (rev !== ROOT.hasAttribute('data-sba-rev')) {
          if (rev) ROOT.setAttribute('data-sba-rev', '1'); else ROOT.removeAttribute('data-sba-rev');
          document.querySelectorAll('.sba-mode').forEach(function (n) { n.remove(); });
        }
        var v = rev ? storedRev() : stored();
        if (ROOT.getAttribute('data-sba-blog') !== v) ROOT.setAttribute('data-sba-blog', v);
        var vw = rev ? storedRevView() : storedView();
        if (ROOT.getAttribute('data-sba-view') !== vw) ROOT.setAttribute('data-sba-view', vw);
        mountToggle(); syncToggle(); markTall(); decorate();
      } else if (ROOT.hasAttribute('data-sba-blog')) {
        ROOT.removeAttribute('data-sba-blog'); ROOT.removeAttribute('data-sba-view'); ROOT.removeAttribute('data-sba-rev');
        document.querySelectorAll('.sba-mode').forEach(function (n) { n.remove(); });
      }
    } finally { busy = false; }
  }

  var tm; function later() { clearTimeout(tm); tm = setTimeout(apply, 150); }
  ['pushState', 'replaceState'].forEach(function (m) {
    var o = history[m]; if (!o) return;
    history[m] = function () { var r = o.apply(this, arguments); later(); return r; };
  });
  window.addEventListener('popstate', later);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) { if (list[i].target.nodeType === 1 && !(list[i].target.closest && list[i].target.closest('.sba-mode'))) { later(); return; } }
  }).observe(document.body || ROOT, { childList: true, subtree: true });
})();
