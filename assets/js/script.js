/* Arun Satish Rao – portfolio interactions. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = 'arunsrao35@gmail.com';

  /* ---- mobile menu ---- */
  var menuBtn = $('.menu-btn'), links = $('.nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- soccer-ball logo rolls as you scroll ---- */
  var ball = $('.logo svg');
  if (ball && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ball.style.transform = 'rotate(' + Math.round(window.scrollY * 0.45) + 'deg)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- decode effect on the role line ---- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&@?';
  function scramble(el) {
    var finalText = el.getAttribute('data-text') || el.textContent;
    if (reduce) { el.textContent = finalText; return; }
    var start = null, dur = 900;
    if (el._raf) cancelAnimationFrame(el._raf);
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1), out = '';
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText[i];
        if (ch === ' ' || ch === '·' || ch === ',') { out += ch; continue; }
        out += (i / finalText.length) < p ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(frame); else el.textContent = finalText;
    }
    el._raf = requestAnimationFrame(frame);
  }
  $$('.scramble').forEach(function (el) {
    setTimeout(function () { scramble(el); }, 350);
    el.addEventListener('mouseenter', function () { scramble(el); });
  });

  /* ---- ROT13 easter egg in the footer ---- */
  function rot13(s) {
    return s.replace(/[a-z]/gi, function (c) {
      var b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + 13) % 26 + b);
    });
  }
  $$('.rot').forEach(function (el) {
    var enc = el.getAttribute('data-enc');
    el.addEventListener('mouseenter', function () { el.textContent = rot13(enc); });
    el.addEventListener('mouseleave', function () { el.textContent = enc; });
    el.addEventListener('focus', function () { el.textContent = rot13(enc); });
    el.addEventListener('blur', function () { el.textContent = enc; });
  });
  if (window.console && console.log) console.log('%cflag{you_read_the_source}', 'color:#2F6BFF;font:700 16px monospace', '  Hello, fellow curious mind. Say hi: ' + EMAIL);

  /* ---- copy buttons ---- */
  $$('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy'), label = btn.textContent;
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = label; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done('Copied'); }, function () { done('Select + copy'); });
      } else { done('Select + copy'); }
    });
  });

  /* ---- contact form ---- */
  var form = $('#contact-form');
  if (form) {
    var status = $('#form-status');
    var say = function (cls, msg) { status.className = 'status show ' + cls; status.textContent = msg; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.getAttribute('data-live') !== 'true') {
        say('warn', 'The form is switched off in this preview. Please email me at ' + EMAIL + ' instead.');
        return;
      }
      var btn = $('button[type=submit]', form); btn.disabled = true;
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        say('ok', 'Message sent. I will reply by email.'); form.reset();
      }).catch(function () {
        say('err', 'That did not go through. Please email me at ' + EMAIL + ' instead.');
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---- photo wall: filters + lightbox ---- */
  var shots = $$('.shot');
  if (shots.length) {
    $$('.filters button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var f = b.getAttribute('data-filter');
        shots.forEach(function (s) { s.hidden = !(f === 'all' || s.getAttribute('data-cat') === f); });
      });
    });
    var lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('p', lb), idx = 0, lastFocus = null;
    var visible = function () { return shots.filter(function (s) { return !s.hidden; }); };
    function show(i) {
      var list = visible(); if (!list.length) return;
      idx = (i + list.length) % list.length;
      var s = list[idx]; lbImg.src = s.getAttribute('data-full'); lbImg.alt = $('img', s).alt; lbCap.textContent = s.getAttribute('data-cap');
    }
    function openLb(s) { lastFocus = s; lb.classList.add('open'); show(visible().indexOf(s)); $('.lb-close', lb).focus(); }
    function closeLb() { lb.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
    shots.forEach(function (s) { s.addEventListener('click', function () { openLb(s); }); });
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---- Caesar cipher lab ---- */
  var cIn = $('#cipher-in'), cShift = $('#cipher-shift'), cOut = $('#cipher-out'), cVal = $('#cipher-val');
  if (cIn && cShift && cOut) {
    var run = function () {
      var n = parseInt(cShift.value, 10);
      cVal.textContent = n;
      cOut.textContent = cIn.value.replace(/[a-z]/gi, function (c) {
        var b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + n) % 26 + b);
      });
    };
    cIn.addEventListener('input', run); cShift.addEventListener('input', run); run();
  }

  /* ---- arcade: button check reaction game ---- */
  var arcade = $('#arcade');
  if (arcade) {
    var SYMS = {
      up:    { color: '#3ED3A0', svg: '<svg class="prompt-sym" viewBox="0 0 40 40" fill="none" stroke="#3ED3A0" stroke-width="3.5" stroke-linejoin="round"><path d="M20 6 35 32H5z"/></svg>' },
      right: { color: '#FF6F59', svg: '<svg class="prompt-sym" viewBox="0 0 40 40" fill="none" stroke="#FF6F59" stroke-width="3.5"><circle cx="20" cy="20" r="14"/></svg>' },
      down:  { color: '#6AA0FF', svg: '<svg class="prompt-sym" viewBox="0 0 40 40" fill="none" stroke="#6AA0FF" stroke-width="3.5" stroke-linecap="round"><path d="M8 8l24 24M32 8 8 32"/></svg>' },
      left:  { color: '#FF8FC7', svg: '<svg class="prompt-sym" viewBox="0 0 40 40" fill="none" stroke="#FF8FC7" stroke-width="3.5" stroke-linejoin="round"><rect x="7" y="7" width="26" height="26" rx="2"/></svg>' }
    };
    var KEYS = { w: 'up', arrowup: 'up', d: 'right', arrowright: 'right', s: 'down', arrowdown: 'down', a: 'left', arrowleft: 'left' };
    var screen = $('.screen', arcade), msg = $('.msg', arcade), scoreEl = $('#arc-score'), timeEl = $('#arc-time'), bestEl = $('#arc-best'), startBtn = $('#arc-start');
    var state = { playing: false, score: 0, target: null, left: 20, timer: null }, best = 0;
    try { best = parseInt(localStorage.getItem('arun-arcade-best') || '0', 10) || 0; } catch (e) { best = 0; }
    bestEl.textContent = best;
    function next() {
      var names = Object.keys(SYMS), pick;
      do { pick = names[Math.floor(Math.random() * 4)]; } while (pick === state.target);
      state.target = pick; screen.innerHTML = ''; screen.appendChild(hud()); screen.insertAdjacentHTML('beforeend', SYMS[pick].svg);
    }
    function hud() { var h = document.createElement('div'); h.className = 'hud'; h.innerHTML = '<span>Score ' + state.score + '</span><span>' + state.left + 's</span>'; return h; }
    function refreshHud() { var h = $('.hud', screen); if (h) h.innerHTML = '<span>Score ' + state.score + '</span><span>' + state.left + 's</span>'; scoreEl.textContent = state.score; timeEl.textContent = state.left; }
    function end() {
      clearInterval(state.timer); state.playing = false; state.target = null;
      var verdict = state.score >= 40 ? 'Pro controller hands.' : state.score >= 25 ? 'Solid. Run it back?' : state.score >= 12 ? 'Warming up. Go again.' : 'Stretch your thumbs and retry.';
      if (state.score > best) { best = state.score; bestEl.textContent = best; try { localStorage.setItem('arun-arcade-best', String(best)); } catch (e) { /* storage may be blocked */ } }
      screen.innerHTML = '<p class="msg">Time. You scored ' + state.score + '.<br>' + verdict + '</p>';
      startBtn.textContent = 'Play again'; startBtn.disabled = false;
    }
    function start() {
      state.playing = true; state.score = 0; state.left = 20; state.target = null; startBtn.disabled = true; startBtn.textContent = 'Go!';
      next(); refreshHud();
      state.timer = setInterval(function () { state.left--; refreshHud(); if (state.left <= 0) end(); }, 1000);
    }
    function press(dir) {
      var btn = $('.pad .' + dir, arcade);
      if (btn) { btn.classList.add('hit'); setTimeout(function () { btn.classList.remove('hit'); }, 110); }
      if (!state.playing) return;
      if (dir === state.target) { state.score++; next(); refreshHud(); }
      else { screen.classList.remove('shake'); void screen.offsetWidth; screen.classList.add('shake'); }
    }
    startBtn.addEventListener('click', start);
    $$('.pad button[data-dir]', arcade).forEach(function (b) { b.addEventListener('click', function () { press(b.getAttribute('data-dir')); }); });
    document.addEventListener('keydown', function (e) {
      var d = KEYS[e.key.toLowerCase()];
      if (d && state.playing) { e.preventDefault(); press(d); }
    });
  }
})();
