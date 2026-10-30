/* 강의 운영판 — 식스샵 커스텀 스페이스 (2026-10-30)
   커스텀 DB lecture-apply(무료 · 초청 · 용역 강의 신청서)를 강의별로 보고, 상태 · 출석을 바꾸고, 수료 인원을 센다.
   규격: 식스샵 「AI로 커스텀 스페이스 만들기」 R1~R20.
   · 인증: 부모 창(스토어 매니저)에 SIXSHOP_APP_PAGE_AUTH_REQUEST → SIXSHOP_APP_PAGE_AUTH 의 payload 를 쓴다. 토큰은 화면 · 콘솔 · 저장소에 남기지 않는다.
   · API: https://<페이지 주소에서 맨 앞을 뺀 호스트>/call/cms/v1/app/lecture-apply… (custom-space.oas.dev.sixshop.com 의 cms 문서)
   · 이 기기에 남기는 것: 마지막으로 고른 강의 키와 강의별 수료 기준 숫자뿐(개인정보 없음). */
(function () {
  'use strict';
  var COL = 'lecture-apply';
  var FIELDS = 'name,phone,org,lecture,lectureTitle,lectureDate,sessionCount,host,status,attend,proof,createdAt';
  var PAGE = 200, MAX_PAGES = 25;              /* 한 번에 200건씩, 최대 5,000건까지 나눠 받는다 */
  var STATUSES = ['신청', '확정', '불가'];
  var LS_LEC = 'sba_ops_lec', LS_CRIT = 'sba_ops_crit_';
  var MAX_SESSIONS = 30;                       /* 회차 수 상한 — 이보다 크거나 정수가 아니면 그 값은 무시한다 */

  var auth = null, rows = [], cur = '', stFilter = '', query = '', busy = {}, loading = false;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 저장 안 돼도 화면은 그대로 */ } }

  function state(msg, kind) {
    var el = $('state');
    el.hidden = !msg;
    el.className = 'state' + (kind ? ' ' + kind : '');
    el.textContent = msg || '';
  }
  function note(msg, kind) {
    var el = $('note');
    el.className = 'note' + (kind ? ' ' + kind : '');
    el.textContent = msg || '';
  }

  /* ── API ── */
  function apiHost() { return 'https://' + location.hostname.split('.').slice(1).join('.'); }
  function headers(json) {
    var h = {'ss-store-id': auth.storeName, 'ss-user-id': auth.userId, 'ss-user-token': auth.userToken};
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }
  function api(path, opt) {
    opt = opt || {};
    var init = {method: opt.method || 'GET', headers: headers(!!opt.body)};
    if (opt.body) init.body = JSON.stringify(opt.body);
    return fetch(apiHost() + '/call/cms/v1/app/' + COL + path, init).then(function (r) {
      if (r.status === 204) return null;
      return r.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (!r.ok) {
          var why = j ? [j.code, j.message, j.data].filter(Boolean).join(' · ') : t.slice(0, 160);
          var err = new Error(r.status + (why ? ' · ' + why : ''));
          err.status = r.status;
          throw err;
        }
        return j && Object.prototype.hasOwnProperty.call(j, 'data') ? j.data : j;
      });
    });
  }
  function errText(e) {
    var s = e && e.status;
    if (s === 403) return '이 스페이스에서 쓸 수 없는 API 입니다(403). ' + e.message;
    if (s === 400) return '요청이 잘못되었습니다(400). ' + e.message;
    return '불러오지 못했습니다. ' + (e && e.message || e);
  }

  /* ── 불러오기 ── */
  /* 저장 중에는 다시 불러오지 않는다(옛 상태를 읽어 저장 결과를 덮는 일 방지). 다 받은 뒤에 한 번에 바꾼다 */
  function loadAll() {
    if (loading) return Promise.resolve();
    if (Object.keys(busy).length) { note('저장이 끝난 뒤에 다시 불러와 주세요.', 'warn'); return Promise.resolve(); }
    loading = true;
    var got = [];
    state('신청서를 불러오는 중입니다…');
    $('main').hidden = true;
    function page(n) {
      return api('?fields=' + FIELDS + '&sort=createdAt:asc&page=' + n + '&limit=' + PAGE).then(function (list) {
        list = Array.isArray(list) ? list : [];
        got = got.concat(list);
        state('신청서를 불러오는 중입니다… (' + got.length + '건)');
        if (list.length === PAGE && n < MAX_PAGES) return page(n + 1);
        return n >= MAX_PAGES && list.length === PAGE;
      });
    }
    return page(1).then(function (cut) {
      loading = false;
      rows = got;
      state('');
      $('main').hidden = false;
      buildLectures();
      if (cut) note('신청서가 ' + rows.length + '건을 넘어 앞의 ' + rows.length + '건만 불러왔습니다.', 'warn');
    }).catch(function (e) {
      loading = false;
      state(errText(e), 'err');
    });
  }

  /* 회차 수: 1~MAX_SESSIONS 정수만 믿는다. 신청서는 강의 페이지 데이터로 넣지만 회원이 API 로 다른 값을 넣을 수 있다 */
  function sessionsOf(r) {
    var v = r.sessionCount;
    return (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))) && +v >= 1 && +v <= MAX_SESSIONS && +v % 1 === 0 ? +v : 0;
  }
  function badSessions() {
    return rows.filter(function (r) { return r.sessionCount != null && r.sessionCount !== '' && !sessionsOf(r); }).length;
  }

  function lectures() {
    var map = {};
    rows.forEach(function (r) {
      var k = r.lecture || '(강의 키 없음)';
      var m = map[k] || (map[k] = {key: k, title: r.lectureTitle || k, date: r.lectureDate || '', sessions: 0, host: r.host || '', n: 0});
      m.n++;
      if (sessionsOf(r) > m.sessions) m.sessions = sessionsOf(r);
      if (!m.date && r.lectureDate) m.date = r.lectureDate;
      if (!m.host && r.host) m.host = r.host;
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }

  function buildLectures() {
    var ls = lectures(), sel = $('lecSel');
    if (!ls.length) {
      sel.innerHTML = '';
      $('sum').innerHTML = '';
      $('list').innerHTML = '<div class="empty">아직 들어온 신청서가 없습니다.</div>';
      return;
    }
    sel.innerHTML = ls.map(function (l) {
      var d = l.date ? l.date.slice(5).replace('-', '/') + ' · ' : '';
      return '<option value="' + esc(l.key) + '">' + esc(d + l.title) + ' (' + l.n + '명)</option>';
    }).join('');
    var want = cur || lsGet(LS_LEC);
    cur = ls.some(function (l) { return l.key === want; }) ? want : ls[0].key;
    sel.value = cur;
    $('crit').value = lsGet(LS_CRIT + cur) || '';
    render();
    var bad = badSessions();
    if (bad) note('회차 수가 1~' + MAX_SESSIONS + ' 범위를 벗어난 신청서 ' + bad + '건은 회차 수를 무시했습니다.', 'warn');
  }

  /* ── 계산 ── */
  function attendList(r) {
    return String(r.attend || '').split(',').map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return x > 0; })
      .filter(function (x, i, a) { return a.indexOf(x) === i; })
      .sort(function (a, b) { return a - b; });
  }
  function critValue() { var v = parseInt($('crit').value, 10); return v > 0 ? v : 0; }
  function isDone(r, crit) { return crit > 0 && r.status !== '불가' && attendList(r).length >= crit; }
  function curLecture() { return lectures().filter(function (l) { return l.key === cur; })[0]; }
  function curRows() { return rows.filter(function (r) { return (r.lecture || '(강의 키 없음)') === cur; }); }

  /* ── 그리기 ── */
  function render() {
    var lec = curLecture();
    if (!lec) return;
    var all = curRows(), crit = critValue();
    var n = {신청: 0, 확정: 0, 불가: 0};
    all.forEach(function (r) { n[r.status || '신청'] = (n[r.status || '신청'] || 0) + 1; });
    var done = all.filter(function (r) { return isDone(r, crit); }).length;
    var sessions = Math.max(1, lec.sessions || 0);
    $('sum').innerHTML =
      '<div class="lec"><b>' + esc(lec.title) + '</b><span>' + esc([lec.date, lec.host, sessions + '회차'].filter(Boolean).join(' · ')) + '</span></div>' +
      '<div class="nums">' +
        '<div><em>전체</em><b>' + all.length + '</b></div>' +
        '<div><em>신청</em><b>' + n['신청'] + '</b></div>' +
        '<div class="ok"><em>확정</em><b>' + n['확정'] + '</b></div>' +
        '<div class="no"><em>불가</em><b>' + n['불가'] + '</b></div>' +
        '<div class="dn"><em>수료</em><b>' + (crit ? done : '–') + '</b></div>' +
      '</div>' +
      '<p class="rule">' + (crit
        ? '수료 = 출석 <b>' + crit + '회 이상</b> (상태 ‘불가’ 제외)'
        : '수료 기준 회차 수를 입력하면 수료 인원을 계산합니다.') + '</p>';

    var q = query.trim().toLowerCase();
    var view = all.filter(function (r) {
      if (stFilter && (r.status || '신청') !== stFilter) return false;
      if (q && (String(r.name || '') + ' ' + String(r.org || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (!view.length) {
      $('list').innerHTML = '<div class="empty">' + (all.length ? '조건에 맞는 신청자가 없습니다.' : '이 강의에는 아직 신청자가 없습니다.') + '</div>';
      return;
    }
    $('list').innerHTML = view.map(function (r) { return rowHtml(r, sessions, crit); }).join('');
  }

  function rowHtml(r, sessions, crit) {
    var st = r.status || '신청', att = attendList(r), i, chips = '';
    for (i = 1; i <= sessions; i++) {
      chips += '<button type="button" class="a' + (att.indexOf(i) >= 0 ? ' on' : '') + '" data-att="' + i + '" aria-pressed="' + (att.indexOf(i) >= 0) + '">' + i + '회</button>';
    }
    var phone = String(r.phone || '');
    var hasFile = r.proof && r.proof.url;
    return '<div class="row' + (st === '불가' ? ' off' : '') + (busy[r.id] ? ' busy' : '') + '" data-id="' + esc(r.id) + '">' +
      '<div class="who"><b>' + esc(r.name || '(이름 없음)') + '</b><span>' + esc(r.org || '소속 없음') + '</span></div>' +
      '<div class="tel">' + (phone ? '<a href="tel:' + esc(phone.replace(/[^0-9]/g, '')) + '">' + esc(phone) + '</a>' : '—') + '</div>' +
      '<div class="seg" role="group" aria-label="상태">' + STATUSES.map(function (s) {
        return '<button type="button" data-st="' + s + '" class="s-' + s + (s === st ? ' on' : '') + '" aria-pressed="' + (s === st) + '">' + s + '</button>';
      }).join('') + '</div>' +
      '<div class="att">' + chips + '<span class="cnt">' + att.length + '/' + sessions + (isDone(r, crit) ? ' · <b>수료</b>' : '') + '</span></div>' +
      '<div class="meta">' + esc(String(r.createdAt || '').slice(0, 10)) +
        (hasFile ? ' · <button type="button" class="link" data-file="1">첨부 보기</button>' : '') + '</div>' +
    '</div>';
  }

  /* ── 바꾸기 ── */
  function rowById(id) { return rows.filter(function (r) { return r.id === id; })[0]; }
  function save(r, patch) {
    var before = {};
    Object.keys(patch).forEach(function (k) { before[k] = r[k]; r[k] = patch[k]; });
    busy[r.id] = true;
    render();
    return api('/' + encodeURIComponent(r.id), {method: 'PUT', body: patch}).then(function () {
      delete busy[r.id];
      /* 그사이 목록이 새로 들어왔으면 지금 목록의 같은 행에도 저장 결과를 넣는다 */
      var now = rowById(r.id);
      if (now && now !== r) Object.keys(patch).forEach(function (k) { now[k] = patch[k]; });
      render();
      note('저장했습니다 — ' + (r.name || '') + ' ' + Object.keys(patch).map(function (k) { return k === 'status' ? '상태 ' + patch[k] : '출석 ' + (patch[k] || '없음'); }).join(', '), 'ok');
    }).catch(function (e) {
      delete busy[r.id];
      Object.keys(before).forEach(function (k) { r[k] = before[k]; });
      render();
      note('저장하지 못해 되돌렸습니다. ' + errText(e), 'err');
    });
  }

  function openFile(r) {
    var w = window.open('', '_blank');
    note('첨부 파일 주소를 받는 중입니다…');
    api('/' + encodeURIComponent(r.id) + '/proof/file').then(function (d) {
      var url = d && d.url;
      if (!url) throw new Error('주소 없음');
      if (w) { w.location.href = url; note(''); }
      else note('새 창이 막혀 있습니다. 브라우저에서 팝업을 허용한 뒤 다시 눌러 주세요.', 'warn');
    }).catch(function (e) {
      if (w) w.close();
      note('첨부 파일을 열지 못했습니다. ' + errText(e), 'err');
    });
  }

  /* ── 엑셀(CSV) ── */
  function csv() {
    var lec = curLecture();
    if (!lec) return;
    var crit = critValue(), all = curRows();
    var head = ['이름', '소속', '휴대폰', '주관 기관', '강의', '첫 회차', '상태', '출석 회차', '출석 수', crit ? '수료(출석 ' + crit + '회 이상)' : '수료(기준 미입력)', '신청 일시'];
    var lines = [head].concat(all.map(function (r) {
      var att = attendList(r);
      return [r.name, r.org, r.phone, r.host, r.lectureTitle || r.lecture, r.lectureDate, r.status || '신청',
        att.join(' '), att.length, crit ? (isDone(r, crit) ? '수료' : '') : '', r.createdAt];
    }));
    var text = lines.map(function (cells) {
      return cells.map(function (c) {
        var s = String(c == null ? '' : c);
        if (/^[=+\-@]/.test(s)) s = "'" + s;                 /* 엑셀 수식으로 읽히지 않게 */
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');
    var blob = new Blob(['﻿' + text], {type: 'text/csv;charset=utf-8'});
    var a = document.createElement('a'), d = new Date();
    var ymd = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    a.href = URL.createObjectURL(blob);
    a.download = '강의신청_' + String(lec.key).replace(/[^0-9A-Za-z가-힣_-]/g, '_') + '_' + ymd + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    note(all.length + '명을 내려받았습니다.', 'ok');
  }

  /* ── 이벤트 ── */
  function wire() {
    $('lecSel').addEventListener('change', function () {
      cur = this.value; lsSet(LS_LEC, cur);
      $('crit').value = lsGet(LS_CRIT + cur) || '';
      note(''); render();
    });
    $('reload').addEventListener('click', function () { note(''); loadAll(); });
    $('stFilter').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-st]');
      if (!b) return;
      stFilter = b.getAttribute('data-st');
      Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
      render();
    });
    $('q').addEventListener('input', function () { query = this.value; render(); });
    $('crit').addEventListener('input', function () { lsSet(LS_CRIT + cur, critValue() ? String(critValue()) : ''); render(); });
    $('csv').addEventListener('click', csv);
    $('list').addEventListener('click', function (e) {
      var rowEl = e.target.closest('.row');
      if (!rowEl || rowEl.classList.contains('busy')) return;
      var r = rowById(rowEl.getAttribute('data-id'));
      if (!r) return;
      var sb = e.target.closest('button[data-st]');
      if (sb) {
        var s = sb.getAttribute('data-st');
        if (s !== (r.status || '신청')) save(r, {status: s});
        return;
      }
      var ab = e.target.closest('button[data-att]');
      if (ab) {
        var n = parseInt(ab.getAttribute('data-att'), 10), att = attendList(r), at = att.indexOf(n);
        if (at >= 0) att.splice(at, 1); else att.push(n);
        att.sort(function (a, b) { return a - b; });
        save(r, {attend: att.join(',')});
        return;
      }
      if (e.target.closest('button[data-file]')) openFile(r);
    });
  }

  /* ── 인증 (R9~R11) ── */
  /* 인증 메시지는 이 페이지를 띄운 부모 창(e.source)에서, 식스샵 출처(https · sixshop.com / sixshop.io 계열)로 온 것만 받는다.
     식스샵 문서(R9~R10 · cms.json)에 부모 출처가 적혀 있지 않아 계열 허용 목록으로 둔다(스토어 매니저 = store.sixshop.com). */
  function trustedOrigin(o) {
    var m = /^https:\/\/([a-z0-9.-]+)(?::\d+)?$/i.exec(String(o || ''));
    if (!m) return false;
    var h = m[1].toLowerCase();
    return h === 'sixshop.com' || h === 'sixshop.io' || /\.sixshop\.(com|io)$/.test(h);
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (auth || !d || d.type !== 'SIXSHOP_APP_PAGE_AUTH') return;
    if (e.source !== window.parent || window.parent === window || !trustedOrigin(e.origin)) return;
    var p = d.payload || {};
    if (!p.storeName || !p.userId || !p.userToken) return;
    auth = {storeName: p.storeName, userId: p.userId, userToken: p.userToken};
    wire();
    loadAll();
  });
  try { window.parent.postMessage({type: 'SIXSHOP_APP_PAGE_AUTH_REQUEST'}, '*'); } catch (e) { /* 부모 창이 없으면 아래 안내 */ }
  setTimeout(function () {
    if (!auth) state('인증 정보를 받지 못했습니다. 식스샵 스토어 매니저 왼쪽 메뉴의 「강의 운영판」에서 열어 주세요.', 'err');
  }, 10000);
})();
