/* Ajolo Legal – kleine Skripte: Sprache, Inhaltsverzeichnis, Fortschritt, Effekte. Keine Cookies, keine externen Aufrufe. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'ajolo-legal-lang';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Sprache ---------- */
  function views() { return document.querySelectorAll('.view'); }
  function setLang(l, persist) {
    if (l !== 'de' && l !== 'en') l = 'de';
    root.setAttribute('lang', l);
    root.setAttribute('data-lang', l);
    views().forEach(function (v) { v.hidden = v.getAttribute('lang') !== l; });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-l') === l ? 'true' : 'false'); });
    var t = root.getAttribute('data-title-' + l); if (t) document.title = t;
    var d = root.getAttribute('data-desc-' + l);
    var m = document.querySelector('meta[name="description"]'); if (m && d) m.setAttribute('content', d);
    document.querySelectorAll('[data-de][data-en]').forEach(function (el) { el.textContent = el.getAttribute('data-' + l); });
    if (persist) store(KEY, l);
    observeToc();
  }
  function initialLang() {
    var q = /[?&]lang=(de|en)\b/.exec(location.search);
    if (q) return q[1];
    var s = store(KEY); if (s === 'de' || s === 'en') return s;
    var n = (navigator.language || 'de').toLowerCase();
    return n.indexOf('de') === 0 ? 'de' : 'en';
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-l'), true); window.scrollTo({ top: 0 }); });
  });

  /* ---------- Inhaltsverzeichnis: aktiver Abschnitt ---------- */
  var io;
  function observeToc() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    var view = document.querySelector('.view:not([hidden])'); if (!view) return;
    var links = {};
    view.querySelectorAll('.toc a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var secs = view.querySelectorAll('.sec[id]'); if (!secs.length) return;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('on'); });
          var a = links[e.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-18% 0px -70% 0px', threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
  }
  document.querySelectorAll('.toc-m a').forEach(function (a) {
    a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.removeAttribute('open'); });
  });

  /* ---------- Fortschritt, Cursor-Glow, Spotlight ---------- */
  var bar = document.getElementById('bar');
  function prog() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', prog, { passive: true }); prog();

  var cg = document.getElementById('cg');
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (cg && fine && !reduce) {
    window.addEventListener('pointermove', function (e) { cg.style.opacity = 1; cg.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }, { passive: true });
    document.addEventListener('mouseleave', function () { cg.style.opacity = 0; });
  }
  document.addEventListener('pointermove', function (e) {
    var t = e.target.closest && e.target.closest('.sp'); if (!t) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty('--x', (e.clientX - r.left) + 'px');
    t.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Einblenden beim Scrollen ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { threshold: 0.06 });
    rv.forEach(function (n) { ro.observe(n); });
  } else { rv.forEach(function (n) { n.classList.add('in'); }); }

  /* ---------- Drucken / PDF ---------- */
  document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  setLang(initialLang(), false);
})();
