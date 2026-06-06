/* ==========================================================================
   UCLAIT site — shared interactions
   No dependencies. Loaded with `defer` on every page.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Theme (dark default, persisted) ---- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('uclait-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}

  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    if (next === 'dark') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', 'light');
    try { localStorage.setItem('uclait-theme', next); } catch (e) {}
  }

  /* ---- DOM ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var nav     = document.querySelector('.nav');
    var burger  = document.querySelector('.nav__burger');
    var links   = document.querySelector('.nav__links');
    var toggle  = document.querySelector('.theme-toggle');

    /* Theme toggle */
    if (toggle) toggle.addEventListener('click', toggleTheme);

    /* Sticky nav shadow on scroll */
    if (nav) {
      var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Mobile menu */
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* Highlight current page in nav */
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === here || (here === '' && href === 'index.html')) a.classList.add('active');
    });

    /* Scroll reveal */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }

    /* Pointer-follow glow on cards */
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      });
    });

    /* Publication tabs (Journal / Conference) */
    var tabs = document.querySelectorAll('.pub-tab');
    if (tabs.length) {
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute('data-target');
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          document.querySelectorAll('.pub-panel').forEach(function (p) {
            p.classList.toggle('active', p.id === target);
          });
        });
      });
    }
  });
})();
