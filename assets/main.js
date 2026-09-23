/* ==========================================================================
   Inštalacije Košnik – interakcije in animacije ob drsenju
   Brez knjižnic. Premika se samo transform / opacity / clip-path.
   Mere se preberejo ob spremembi velikosti, nikoli ob vsakem okvirju.
   ========================================================================== */
(function () {
  'use strict';

  var d = document, w = window, html = d.documentElement;
  var RM = html.classList.contains('rm');           /* zmanjšano gibanje (nastavi skripta v <head>) */
  var TEL = '+38631444466';
  var MAIL = 'instalacijekosnik@gmail.com';
  var CK_KEY = 'nk-piskotki';
  var MAP_SRC = 'https://www.google.com/maps?q=' +
    encodeURIComponent('Inštalacije centralnih in vodovodnih naprav, Nejc Košnik s.p., Jezerska cesta 78b, 4000 Kranj') +
    '&z=15&hl=sl&output=embed';

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  var mqDesk = w.matchMedia('(min-width: 1024px)');
  var mqProcRow = w.matchMedia('(min-width: 901px)');

  /* =======================================================
     1. Uvodna animacija
     ======================================================= */
  var intro = $('#intro');

  function revealHero() {
    if (html.classList.contains('intro-done')) return;
    html.classList.add('intro-done');
  }
  function finishIntro() {
    if (!intro) return;
    if (intro.parentNode) intro.parentNode.removeChild(intro);
    intro = null;
    html.classList.remove('js-intro');
    revealHero();
    measure(); frame();
    showCookieBanner(250);
  }

  if (intro && html.classList.contains('js-intro')) {
    try { sessionStorage.setItem('nk-uvod', '1'); } catch (e) { /* zasebni način */ }
    /* hero se začne odkrivati, ko se zavesa začne dvigovati */
    intro.addEventListener('animationstart', function (e) { if (e.target === intro) revealHero(); });
    intro.addEventListener('animationend', function (e) { if (e.target === intro) finishIntro(); });
    var skip = function () { if (intro && !intro.classList.contains('is-skip')) intro.classList.add('is-skip'); };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) {
      w.addEventListener(t, skip, { once: true, passive: true });
    });
    setTimeout(finishIntro, 4200); /* varovalka */
  } else {
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    intro = null;
    requestAnimationFrame(function () { requestAnimationFrame(revealHero); });
  }

  /* =======================================================
     2. Glava in mobilni meni
     ======================================================= */
  var hdr = $('#hdr');
  var burger = $('.burger');
  var mnav = $('#mnav');
  var menuOpen = false;

  function setMenu(open) {
    if (!mnav) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
    mnav.classList.toggle('is-open', open);
    if (open) mnav.removeAttribute('inert'); else mnav.setAttribute('inert', '');
    d.body.classList.toggle('lock', open);
    if (open) {
      hdr.classList.remove('is-hidden');
      var first = $('a', mnav);
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
    }
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
    });
    mqDesk.addEventListener('change', function () { if (mqDesk.matches) setMenu(false); });
  }

  /* Aktivna povezava v navigaciji */
  var navLinks = $$('.nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in w) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var nio = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = d.getElementById(id); if (s) nio.observe(s); });
  }

  /* =======================================================
     3. Naslovi: razrez na besede za razkritje izza maske
     ======================================================= */
  function splitWords(el) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (k) {
        if (k.nodeType === 3) {
          var parts = k.nodeValue.split(/([ \t\n\r]+)/);
          var frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^[ \t\n\r]+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var o = d.createElement('span');
            var i = d.createElement('span');
            o.className = 'w';
            i.style.setProperty('--w', n++);
            i.textContent = p;
            o.appendChild(i);
            frag.appendChild(o);
          });
          node.replaceChild(frag, k);
        } else if (k.nodeType === 1 && k.tagName !== 'BR') {
          walk(k);
        }
      });
    })(el);
    el.classList.add('is-split');
  }
  $$('[data-reveal="words"]').forEach(splitWords);

  /* =======================================================
     4. Razkrivanje ob drsenju (enkrat)
     ======================================================= */
  var counters = $$('[data-count]');
  function fmt(v, dec) { return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)); }
  if (!RM) counters.forEach(function (el) { el.textContent = fmt(parseFloat(el.getAttribute('data-from') || '0'), +(el.getAttribute('data-dec') || 0)); });

  function countUp(el) {
    if (el._done) return;
    el._done = true;
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from') || '0');
    var dec = +(el.getAttribute('data-dec') || 0);
    if (RM) { el.textContent = fmt(to, dec); return; }
    var t0 = null, dur = 1400;
    requestAnimationFrame(function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(from + (to - from) * e, dec);
      if (k < 1) requestAnimationFrame(step);
    });
  }
  function onReveal(el) {
    (el.hasAttribute('data-count') ? [el] : $$('[data-count]', el)).forEach(countUp);
  }

  var revealEls = $$('[data-reveal]');
  var rio = null;
  function reveal(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    if (rio) rio.unobserve(el);
    onReveal(el);
  }
  if ('IntersectionObserver' in w) {
    rio = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    revealEls.forEach(function (el) { rio.observe(el); });
  } else {
    revealEls.forEach(reveal);
  }

  /* =======================================================
     5. Zamrzovanje cevi: koraki poganjajo stanje diagrama
     ======================================================= */
  var fzFig = $('#freeze-fig');
  if (fzFig && 'IntersectionObserver' in w) {
    var fzSteps = $$('.freeze__steps li');
    var fio = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) {
        if (!en.isIntersecting) return;
        var s = en.target.getAttribute('data-step');
        fzFig.setAttribute('data-state', s);
        fzSteps.forEach(function (li) { li.classList.toggle('is-active', li === en.target); });
      });
    }, { rootMargin: '-44% 0px -44% 0px' });
    $$('[data-step]').forEach(function (el) { fio.observe(el); });
    /* tok vode teče samo, ko je diagram na zaslonu */
    var pio = new IntersectionObserver(function (ens) {
      fzFig.classList.toggle('is-playing', ens[0].isIntersecting);
    });
    pio.observe(fzFig);
  }

  /* =======================================================
     6. Drsni pogon: napredek, cevovod, trak, postopek, galerija
     ======================================================= */
  var progressI = $('#progress');
  var rail = $('#rail');
  var railFill = $('#rail-fill');
  var railNodes = [];
  if (rail) {
    $$('[data-rail]').forEach(function (s) {
      var n = d.createElement('i');
      n.className = 'rail__node';
      n._sec = s;
      rail.appendChild(n);
      railNodes.push(n);
    });
  }
  var band = $('#band');
  var proc = $('#proc');
  var procFill = $('#proc-fill');
  var procPipe = proc ? $('.proc__pipe', proc) : null;
  var procSteps = proc ? $$('.proc__step', proc) : [];
  var gal = $('#galerija');
  var galTrack = $('#gal-track');
  var galView = $('#gal-view');
  var heroFig = $('#hero-fig');
  var heroEl = $('.hero') || $('.phero');
  var mbar = $('#mbar');
  var contact = $('#kontakt');
  var ckOpen = false;

  var M = { vh: 1, max: 1, bandTop: 0, bandHalf: 1, procTop: 0, procH: 1, procRow: true, procMarks: [], galTop: 0, galDist: 0, heroH: 0, contactTop: Infinity };
  var pinOn = false;

  function setupPin() {
    if (!gal || !galTrack) return;
    pinOn = mqDesk.matches && !RM;
    gal.classList.toggle('is-pinned', pinOn);
    galTrack.style.transform = '';
    if (pinOn) {
      M.galDist = Math.max(0, galTrack.scrollWidth - (galView ? galView.clientWidth : w.innerWidth));
      gal.style.height = (M.galDist + w.innerHeight) + 'px';
    } else {
      M.galDist = 0;
      gal.style.height = '';
    }
  }

  function measure() {
    var y = w.scrollY;
    M.vh = w.innerHeight;
    setupPin();
    M.max = Math.max(1, html.scrollHeight - M.vh);
    if (band) {
      var rb = band.parentNode.getBoundingClientRect();
      M.bandTop = rb.top + y;
      M.bandHalf = Math.max(1, band.scrollWidth / 2);
    }
    if (proc && procPipe) {
      var rp = proc.getBoundingClientRect(), pr = procPipe.getBoundingClientRect();
      M.procTop = rp.top + y;
      M.procH = Math.max(1, rp.height);
      M.procRow = mqProcRow.matches;
      M.procMarks = procSteps.map(function (s) {
        var nr = $('.proc__node', s).getBoundingClientRect();
        return M.procRow ? (nr.left + nr.width / 2 - pr.left) / pr.width : (nr.top + nr.height / 2 - pr.top) / pr.height;
      });
    }
    if (gal && pinOn) {
      M.galTop = gal.getBoundingClientRect().top + y;
      /* IntersectionObserver v pripetem, premaknjenem traku ne poroča zanesljivo, zato položaje računamo sami */
      var tr = galTrack.getBoundingClientRect();
      M.viewW = galView ? galView.clientWidth : w.innerWidth;
      M.galItems = $$('[data-reveal]', galTrack).map(function (el) {
        return { el: el, left: el.getBoundingClientRect().left - tr.left };
      });
    }
    if (heroEl) M.heroH = heroEl.offsetHeight;
    if (contact) M.contactTop = contact.getBoundingClientRect().top + y;
    railNodes.forEach(function (n) {
      n._p = clamp((n._sec.getBoundingClientRect().top + y) / M.max, 0, 1);
      n.style.top = (n._p * 100).toFixed(2) + '%';
    });
    if (heroFig && !mqDesk.matches) heroFig.style.transform = '';
  }

  var lastY = w.scrollY, ticking = false;
  function frame() {
    ticking = false;
    var y = w.scrollY;
    var p = clamp(y / M.max, 0, 1);

    if (progressI) progressI.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (railFill) {
      railFill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      for (var r = 0; r < railNodes.length; r++) railNodes[r].classList.toggle('is-on', p >= railNodes[r]._p - 0.002);
    }

    if (hdr) {
      hdr.classList.toggle('is-scrolled', y > 10);
      var dy = y - lastY;
      if (menuOpen || y < 240) hdr.classList.remove('is-hidden');
      else if (dy > 4) hdr.classList.add('is-hidden');
      else if (dy < -4) hdr.classList.remove('is-hidden');
    }
    lastY = y;

    if (band && !RM && y + M.vh > M.bandTop - 100 && y < M.bandTop + 600) {
      var off = (y - M.bandTop + M.vh) * 0.4;
      var x = -(((off % M.bandHalf) + M.bandHalf) % M.bandHalf);
      band.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    }

    if (proc && procFill) {
      /* vodoravno: polni se na poti od 85 % do 35 % višine zaslona; navpično: po celotni višini seznama */
      var pp = M.procRow ? clamp((y + M.vh * 0.85 - M.procTop) / (M.vh * 0.5), 0, 1) : clamp((y + M.vh * 0.7 - M.procTop) / M.procH, 0, 1);
      procFill.style.transform = (M.procRow ? 'scaleX(' : 'scaleY(') + pp.toFixed(4) + ')';
      for (var s = 0; s < procSteps.length; s++) procSteps[s].classList.toggle('is-on', pp >= M.procMarks[s] - 0.01);
    }

    if (pinOn) {
      var gp = clamp((y - M.galTop) / Math.max(1, M.galDist), 0, 1);
      galTrack.style.transform = 'translate3d(' + (-gp * M.galDist).toFixed(1) + 'px,0,0)';
      if (M.galItems && y > M.galTop - M.vh * 0.5) {
        for (var g = 0; g < M.galItems.length; g++) {
          var it = M.galItems[g];
          if (!it.done && it.left - gp * M.galDist < M.viewW * 0.92) { it.done = true; reveal(it.el); }
        }
      }
    }

    if (heroFig && !RM && mqDesk.matches && y < M.heroH) heroFig.style.transform = 'translate3d(0,' + (y * 0.07).toFixed(1) + 'px,0)';

    if (mbar) mbar.classList.toggle('is-on', !ckOpen && y > M.vh * 0.6 && y + M.vh < M.contactTop + 160);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  measure(); frame();
  w.addEventListener('scroll', onScroll, { passive: true });
  var remeasure = debounce(function () { measure(); frame(); }, 150);
  w.addEventListener('resize', remeasure);
  w.addEventListener('load', remeasure);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(remeasure);
  if ('ResizeObserver' in w) new ResizeObserver(remeasure).observe(d.body);

  /* =======================================================
     7. Povečava fotografij
     ======================================================= */
  var lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    var gBtns = $$('.gal__btn');
    var lbImg = $('#lb-img'), lbCap = $('#lb-cap'), cur = 0;
    var showImg = function (i) {
      cur = (i + gBtns.length) % gBtns.length;
      var b = gBtns[cur], img = $('img', b), cap = b.parentNode.querySelector('figcaption');
      lbImg.src = b.getAttribute('data-full');
      lbImg.alt = img ? img.alt : '';
      if (cap) {
        var sp = cap.querySelector('span');
        lbCap.textContent = (sp ? sp.textContent + ' · ' : '') + cap.lastChild.textContent.trim();
      }
    };
    gBtns.forEach(function (b, i) { b.addEventListener('click', function () { showImg(i); lb.showModal(); }); });
    $('.lb__prev', lb).addEventListener('click', function () { showImg(cur - 1); });
    $('.lb__next', lb).addEventListener('click', function () { showImg(cur + 1); });
    $('.lb__close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb__fig')) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showImg(cur - 1);
      else if (e.key === 'ArrowRight') showImg(cur + 1);
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) showImg(cur + (dx < 0 ? 1 : -1));
      tx = null;
    });
  }

  /* =======================================================
     8. Obrazec: sestavi e-pošto ali SMS (brez strežnika)
     ======================================================= */
  var form = $('#form');
  if (form) {
    var status = $('#form-status'), tried = false, lastBtn = 'mail';
    var rules = {
      ime: function (v) { return v.trim().length >= 2 ? '' : 'Vpišite ime in priimek.'; },
      telefon: function (v) { return v.replace(/\D/g, '').length >= 6 ? '' : 'Vpišite telefonsko številko, da vas lahko pokličemo.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'E-poštni naslov ni pravilen (npr. ime@primer.si).'; },
      sporocilo: function (v) { return v.trim().length >= 10 ? '' : 'Na kratko opišite, kaj potrebujete (vsaj 10 znakov).'; }
    };
    var check = function (name) {
      var f = form.elements[name], msg = rules[name](f.value), err = d.getElementById(f.getAttribute('aria-describedby'));
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      f.addEventListener('blur', function () { if (tried || f.value) check(n); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(n); });
    });
    $$('button[type="submit"]', form).forEach(function (b) { b.addEventListener('click', function () { lastBtn = b.value; }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var first = null;
      Object.keys(rules).forEach(function (n) { if (!check(n) && !first) first = form.elements[n]; });
      if (first) { status.textContent = ''; first.focus(); return; }
      var v = function (n) { return form.elements[n].value.trim(); };
      var sto = v('storitev'), kraj = v('kraj');
      var via = (e.submitter && e.submitter.value) || lastBtn;
      if (via === 'sms') {
        var sms = v('sporocilo') + ' — ' + v('ime') + (kraj ? ', ' + kraj : '') + ' (' + sto + ')';
        w.location.href = 'sms:' + TEL + '?&body=' + encodeURIComponent(sms);
        status.textContent = 'Odpira se aplikacija za SMS s pripravljenim sporočilom. Če se ni odprla, pokličite 031 444 466.';
      } else {
        var body = 'Pozdravljeni,\n\n' + v('sporocilo') +
          '\n\n—\nIme: ' + v('ime') +
          '\nTelefon: ' + v('telefon') +
          (v('email') ? '\nE-pošta: ' + v('email') : '') +
          (kraj ? '\nKraj: ' + kraj : '') +
          '\nStoritev: ' + sto;
        var subj = 'Povpraševanje: ' + sto + (kraj ? ' – ' + kraj : '');
        w.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Odpira se vaš e-poštni program s pripravljenim sporočilom. Če se ni odprl, pišite na ' + MAIL + '.';
      }
    });
  }

  /* =======================================================
     9. Piškotki in zemljevid (naloži se le s soglasjem)
     ======================================================= */
  var ck = $('#ck'), ckd = $('#ckd'), ckExt = $('#ck-ext'), map = $('#map');

  function readConsent() {
    try { var c = JSON.parse(localStorage.getItem(CK_KEY)); return c && c.v === 1 ? c : null; } catch (e) { return null; }
  }
  function loadMap() {
    if (!map || map.classList.contains('has-map')) return;
    var f = d.createElement('iframe');
    f.src = MAP_SRC;
    f.title = 'Zemljevid: Jezerska cesta 78b, 4000 Kranj';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    map.appendChild(f);
    map.classList.add('has-map');
  }
  function unloadMap() {
    if (!map) return;
    var f = $('iframe', map);
    if (f) f.parentNode.removeChild(f);
    map.classList.remove('has-map');
  }
  function applyConsent(c) { if (c && c.zunanje) loadMap(); else unloadMap(); }
  function hideBanner() {
    if (!ck || ck.hidden) return;
    ck.classList.remove('is-open');
    ckOpen = false;
    setTimeout(function () { ck.hidden = true; frame(); }, RM ? 0 : 320);
  }
  function saveConsent(ext) {
    var c = { v: 1, zunanje: !!ext, cas: new Date().toISOString() };
    try { localStorage.setItem(CK_KEY, JSON.stringify(c)); } catch (e) { /* shramba ni na voljo */ }
    applyConsent(c);
    hideBanner();
  }
  function showCookieBanner(delay) {
    if (!ck || readConsent()) return;
    setTimeout(function () {
      ck.hidden = false;
      ckOpen = true;
      frame();
      requestAnimationFrame(function () { requestAnimationFrame(function () { ck.classList.add('is-open'); }); });
    }, delay || 0);
  }
  function openCkDialog() {
    if (!ckd || typeof ckd.showModal !== 'function') return;
    var c = readConsent();
    ckExt.checked = !!(c && c.zunanje);
    ckd.showModal();
  }

  $$('[data-ck]').forEach(function (b) { b.addEventListener('click', function () { saveConsent(b.getAttribute('data-ck') === 'all'); }); });
  $$('[data-ck-open]').forEach(function (b) { b.addEventListener('click', openCkDialog); });
  if (ckd) ckd.addEventListener('close', function () {
    if (ckd.returnValue === 'save') saveConsent(ckExt.checked);
    else if (ckd.returnValue === 'all') saveConsent(true);
    ckd.returnValue = '';
  });
  var mapBtn = $('#map-load');
  if (mapBtn) mapBtn.addEventListener('click', function () { saveConsent(true); });

  applyConsent(readConsent());
  if (!intro) showCookieBanner(900);

  /* =======================================================
     10. Drobnarije
     ======================================================= */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
