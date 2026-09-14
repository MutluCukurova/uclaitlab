/* ==========================================================================
   UCLAIT site — CSV-driven content
   Loads /data/*.csv and renders News, Reading Club, Workshops, Social,
   the Life-in-the-Lab gallery, and Publications.
   No dependencies. Loaded with `defer` on the relevant pages.

   HOW ADMINS ADD CONTENT: edit the CSV files in the /data folder — one row
   per entry. See CONTENT-GUIDE.md for the exact columns and image naming.

   NOTE: browsers block reading local .csv files when a page is opened by
   double-clicking it (file://). Preview with a local server
   (double-click preview.command) or on the live hosted site.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Minimal RFC-4180 CSV parser ---------- */
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    var rows = [], row = [], field = '', i = 0, inQuotes = false;
    while (i < text.length) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function parseObjects(text) {
    var rows = parseCSV(text).filter(function (r) {
      return r.length && r.some(function (c) { return c.trim() !== ''; });
    });
    if (!rows.length) return [];
    var head = rows.shift().map(function (h) { return h.trim(); });
    return rows.map(function (r) {
      var o = {};
      head.forEach(function (key, idx) { o[key] = (r[idx] != null ? r[idx] : '').trim(); });
      return o;
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function load(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' → HTTP ' + r.status);
      return r.text();
    }).then(parseObjects);
  }

  function initFx(scope) {
    var revealEls = scope.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el, i) {
        // If it's not currently rendered (e.g. inside an inactive tab panel), show it
        // immediately — the observer would never fire, leaving it stuck faded out.
        if (!el.getClientRects().length) { el.classList.add('in'); return; }
        el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }
    scope.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      });
    });
  }

  function fail(el, label) {
    el.innerHTML = '<p class="note">Could not load ' + esc(label) +
      '. If you opened this file directly, use the local server ' +
      '(double-click <code>preview.command</code>) — the live site loads it automatically.</p>';
  }

  function youTubeId(url) {
    if (!url) return null;
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  /* Build the shared carousel markup from a list of {src, caption, alt}. */
  function carouselHtml(items) {
    if (!items.length) return '';
    var multi = items.length > 1;
    var slides = items.map(function (p) {
      return '<figure class="carousel__slide">' +
        '<a class="carousel__img" href="' + esc(p.src) + '">' +
        '<img src="' + esc(p.src) + '" alt="' + esc(p.alt || p.caption || '') + '" loading="lazy" /></a>' +
        (p.caption ? '<figcaption>' + esc(p.caption) + '</figcaption>' : '') + '</figure>';
    }).join('');
    var controls = multi
      ? '<button class="carousel__nav carousel__prev" type="button" aria-label="Previous photo">&#8249;</button>' +
        '<button class="carousel__nav carousel__next" type="button" aria-label="Next photo">&#8250;</button>' +
        '<div class="carousel__counter">1 / ' + items.length + '</div>'
      : '';
    return '<div class="carousel"><div class="carousel__viewport"><div class="carousel__track">' +
      slides + '</div></div>' + controls + '</div>';
  }

  /* ---------- News ---------- */
  function renderNews(el, rows) {
    el.innerHTML = rows.map(function (r) {
      var imgs = (r.image || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean);
      var yt = youTubeId(r.link_url);

      var media = '';
      if (imgs.length) {
        media = carouselHtml(imgs.map(function (fn) { return { src: 'images/news/' + fn, alt: r.title }; }));
      } else if (yt) {
        media = '<a class="news-yt" href="' + esc(r.link_url) + '" target="_blank" rel="noopener">' +
          '<img src="https://img.youtube.com/vi/' + yt + '/hqdefault.jpg" alt="' + esc(r.title) + '" loading="lazy" />' +
          '<span class="news-yt__play" aria-hidden="true"></span></a>';
      }

      var body = r.body || '';
      var linkIsThumb = (!imgs.length && yt);           // the thumbnail already links out
      if (r.link_url && !linkIsThumb) {
        var txt = r.link_text || (yt ? 'Watch on YouTube →' : 'View →');
        body += ' <a href="' + esc(r.link_url) + '" target="_blank" rel="noopener">' + esc(txt) + '</a>';
      }

      var meta = [r.venue, r.date].filter(Boolean).map(esc).join(' · ');
      return '<article class="card news-item reveal">' +
        (media ? '<div class="news-item__media">' + media + '</div>' : '') +
        '<div class="news-item__text">' +
        '<div class="news-item__meta">' +
        (r.category ? '<span class="news-cat">' + esc(r.category) + '</span>' : '') +
        (meta ? '<span class="news-when">' + meta + '</span>' : '') + '</div>' +
        (r.title ? '<h3 class="news-item__title">' + esc(r.title) + '</h3>' : '') +
        (body ? '<p>' + body + '</p>' : '') +
        '</div></article>';
    }).join('');
    initFx(el);
    initCarousels(el);
  }

  /* ---------- Reading Club & Workshops (grouped by year) ---------- */
  function renderYearGroups(el, rows, opts) {
    var order = [], byYear = {};
    rows.forEach(function (r) {
      if (!r[opts.chair] && !r[opts.title]) return;     // skip blank rows
      var y = r.year || '—';
      if (!byYear[y]) { byYear[y] = []; order.push(y); }
      byYear[y].push(r);
    });
    if (!order.length) { el.innerHTML = '<p class="note">Nothing scheduled yet.</p>'; return; }
    el.innerHTML = order.map(function (y) {
      var items = byYear[y].map(function (r) {
        var title = r[opts.title], url = opts.url ? r[opts.url] : '';
        var paper = url
          ? '<div class="rc-paper"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + (title || url) + '</a></div>'
          : '<div class="rc-paper' + (title ? '' : ' tbd') + '">' + (title || 'To be announced') + '</div>';
        return '<li class="rc-item"><div class="rc-meta"><span class="rc-date">' + esc(r.date) +
          '</span><span class="rc-chair">' + esc(r[opts.chair]) + '</span></div>' + paper + '</li>';
      }).join('');
      return '<div class="year-block reveal"><div class="year-head"><h3>' + esc(y) +
        '</h3></div><ul class="rc-list">' + items + '</ul></div>';
    }).join('');
    initFx(el);
  }

  /* ---------- Social — termly events ---------- */
  function renderSocial(el, rows) {
    el.innerHTML = rows.map(function (r) {
      var flag = [r.Term, r.date].filter(Boolean).map(esc).join(' · ');
      return '<article class="card event-card reveal">' +
        '<img class="event-card__img" src="images/social/' + esc(r.image) + '" alt="' + esc(r.title) +
        '" loading="lazy" />' +
        '<div class="event-card__body"><span class="event-card__flag">' + flag + '</span>' +
        '<div class="event-card__title">' + esc(r.title) + '</div>' +
        '<div class="event-card__meta">Organised by ' + esc(r.organiser) + '</div></div></article>';
    }).join('');
    initFx(el);
  }

  /* ---------- Life in the Lab — one slideshow per event ---------- */
  function renderGallery(el, rows) {
    if (!rows.length) { el.innerHTML = '<p class="note">No photos yet.</p>'; return; }
    var order = [], byEvent = {};
    rows.forEach(function (r) {
      var key = (r.event || 'Gallery') + '||' + (r.date || '');
      if (!byEvent[key]) { byEvent[key] = { event: r.event || 'Gallery', date: r.date || '', photos: [] }; order.push(key); }
      // one row may list several images separated by ';'
      (r.image || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean)
        .forEach(function (fn) { byEvent[key].photos.push({ image: fn, caption: r.caption || '' }); });
    });
    el.innerHTML = order.map(function (key) {
      var g = byEvent[key];
      var carousel = carouselHtml(g.photos.map(function (p) {
        return { src: 'images/social/' + p.image, caption: p.caption, alt: g.event };
      }));
      return '<div class="gallery-event reveal">' +
        '<div class="gallery-event__head"><h3>' + esc(g.event) + '</h3>' +
        (g.date ? '<span class="gallery-event__date">' + esc(g.date) + '</span>' : '') + '</div>' +
        carousel + '</div>';
    }).join('');
    initFx(el);
    initCarousels(el);
  }

  /* ---------- Important dates ---------- */
  function renderDates(el, rows) {
    el.innerHTML = rows.map(function (r) {
      return '<li><span class="ev">' + esc(r.event) + '</span>' +
        '<span class="dt">' + esc(r.date) + '</span></li>';
    }).join('');
    initFx(el);
  }

  /* ---------- Team (grouped by role) ---------- */
  function renderTeam(el, rows) {
    var order = [], byGroup = {};
    rows.forEach(function (r) {
      if (!r.name) return;
      var g = r.group || 'Team';
      if (!byGroup[g]) { byGroup[g] = []; order.push(g); }
      byGroup[g].push(r);
    });
    el.innerHTML = order.map(function (g) {
      var cards = byGroup[g].map(function (r) {
        var name = r.url
          ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>'
          : esc(r.name);
        return '<article class="card member reveal">' +
          '<img class="member__photo" src="images/team/' + esc(r.image) + '" alt="' + esc(r.name) + '" loading="lazy" />' +
          '<div class="member__name">' + name + '</div>' +
          (r.role ? '<div class="member__role">' + esc(r.role) + '</div>' : '') +
          (r.tag ? '<span class="member__tag">' + esc(r.tag) + '</span>' : '') +
          '</article>';
      }).join('');
      return '<div class="role-divider"><span>' + esc(g) + '</span></div>' + cards;
    }).join('');
    initFx(el);
  }

  /* ---------- Carousels + shared lightbox ---------- */
  function initCarousels(scope) {
    var lb = buildLightbox();
    scope.querySelectorAll('.carousel').forEach(function (car) {
      var track = car.querySelector('.carousel__track');
      var slides = car.querySelectorAll('.carousel__slide');
      var counter = car.querySelector('.carousel__counter');
      var idx = 0;
      function go(n) {
        idx = (n + slides.length) % slides.length;
        track.style.transform = 'translateX(' + (-idx * 100) + '%)';
        if (counter) counter.textContent = (idx + 1) + ' / ' + slides.length;
      }
      var prev = car.querySelector('.carousel__prev');
      var next = car.querySelector('.carousel__next');
      if (prev) prev.addEventListener('click', function () { go(idx - 1); });
      if (next) next.addEventListener('click', function () { go(idx + 1); });
      var photos = [].map.call(slides, function (s) {
        var img = s.querySelector('img'), cap = s.querySelector('figcaption');
        return { src: img.getAttribute('src'), caption: cap ? cap.textContent : '' };
      });
      car.querySelectorAll('.carousel__img').forEach(function (a, i) {
        a.addEventListener('click', function (e) { e.preventDefault(); lb.open(photos, i); });
      });
    });
  }

  function buildLightbox() {
    var box = document.getElementById('lightbox');
    if (box && box.__api) return box.__api;
    if (!box) {
      box = document.createElement('div');
      box.id = 'lightbox';
      box.className = 'lightbox';
      box.setAttribute('hidden', '');
      box.innerHTML =
        '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
        '<button class="lightbox__nav lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button>' +
        '<figure class="lightbox__fig"><img alt="" /><figcaption></figcaption></figure>' +
        '<button class="lightbox__nav lightbox__next" type="button" aria-label="Next photo">&#8250;</button>';
      document.body.appendChild(box);
    }
    var imgEl = box.querySelector('img');
    var capEl = box.querySelector('figcaption');
    var prevBtn = box.querySelector('.lightbox__prev');
    var nextBtn = box.querySelector('.lightbox__next');
    var list = [], i = 0;
    function show() {
      imgEl.src = list[i].src;
      capEl.textContent = list[i].caption || '';
      var multi = list.length > 1;
      prevBtn.hidden = !multi; nextBtn.hidden = !multi;
    }
    function step(d) { i = (i + d + list.length) % list.length; show(); }
    function close() { box.setAttribute('hidden', ''); }
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (box.hasAttribute('hidden')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    box.__api = { open: function (photos, start) { list = photos; i = start || 0; show(); box.removeAttribute('hidden'); } };
    return box.__api;
  }

  /* ---------- Publications (one CSV -> two tabbed lists) ---------- */
  function renderPublications(rows) {
    var buckets = { journal: [], conference: [] };
    rows.forEach(function (r) { (buckets[r.type] || buckets.conference).push(r); });
    [['pub-journals', 'journal'], ['pub-conferences', 'conference']].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      el.innerHTML = buckets[pair[1]].map(function (r) { return '<li>' + (r.citation || '') + '</li>'; }).join('');
    });
  }

  /* ---------- Wire up whichever containers exist on this page ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var jobs = [
      ['news-root',     'data/news.csv',           renderNews,   'news'],
      ['dates-root',    'data/important-dates.csv', renderDates,  'important dates'],
      ['team-root',     'data/team.csv',           renderTeam,   'the team'],
      ['rc-root',       'data/reading-club.csv',   function (el, rows) { renderYearGroups(el, rows, { chair: 'chair', title: 'paper_title', url: 'paper_url' }); }, 'the reading-club schedule'],
      ['workshop-root', 'data/workshop.csv',       function (el, rows) { renderYearGroups(el, rows, { chair: 'chair', title: 'workshop_title' }); }, 'the workshop list'],
      ['social-root',   'data/social.csv',         renderSocial, 'social events'],
      ['gallery-root',  'data/life-in-the-lab.csv', renderGallery, 'the gallery']
    ];
    jobs.forEach(function (j) {
      var el = document.getElementById(j[0]);
      if (!el) return;
      load(j[1]).then(function (rows) { j[2](el, rows); })
                .catch(function (e) { console.error(e); fail(el, j[3]); });
    });

    var pubEl = document.getElementById('pub-journals');
    if (pubEl) {
      load('data/publications.csv').then(renderPublications)
        .catch(function (e) { console.error(e); fail(pubEl, 'publications'); });
    }
  });
})();
