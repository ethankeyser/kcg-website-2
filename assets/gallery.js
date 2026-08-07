/* =========================================================================
   Gallery — category filtering + lightbox
   Loaded only by work.html. script.js handles the shared header/nav.
   ========================================================================= */
(function () {
  'use strict';

  var grid = document.getElementById('gal-grid');
  if (!grid) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll('.gal-item'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('.gal-filter'));

  /* ---------------------------------------------------------------------
     Filtering. `visible` tracks what the lightbox may step through, so
     arrowing never lands on a hidden tile.
     --------------------------------------------------------------------- */
  var visible = items.slice();

  function applyFilter(cat) {
    visible = [];
    items.forEach(function (el) {
      var match = cat === 'all' || el.getAttribute('data-cat') === cat;
      /* Drive the hide from an inline style, not from `hidden` alone: the
         tile carries an author `display`, which outranks the UA sheet's
         [hidden] rule, so the attribute on its own hides nothing. Inline
         style also survives a stale or unloaded stylesheet. */
      el.style.display = match ? '' : 'none';
      el.hidden = !match;
      if (match) visible.push(el);
    });
    filters.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === cat));
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ---------------------------------------------------------------------
     Lightbox
     --------------------------------------------------------------------- */
  var lb = document.getElementById('lb');
  if (!lb) return;

  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbCap = document.getElementById('lb-cap');
  var lbCount = document.getElementById('lb-count');
  var idx = 0;
  var lastFocus = null;

  function show(i) {
    if (!visible.length) return;
    idx = (i + visible.length) % visible.length;
    var el = visible[idx];
    var img = el.querySelector('img');

    lbImg.src = el.getAttribute('data-full');
    lbImg.alt = img ? img.alt : '';
    lbTitle.textContent = el.getAttribute('data-title') || '';
    lbCap.textContent = el.getAttribute('data-cap') || '';
    lbCount.textContent = (idx + 1) + ' / ' + visible.length;
  }

  function open(el) {
    var i = visible.indexOf(el);
    if (i < 0) return;
    lastFocus = el;
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (el) {
    el.addEventListener('click', function () { open(el); });
  });

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(idx + 1); });

  /* Backdrop click closes, but clicks on the image or controls must not. */
  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { show(idx - 1); }
    else if (e.key === 'ArrowRight') { show(idx + 1); }
    else if (e.key === 'Tab') {
      /* Keep focus inside the overlay while it is open. */
      var f = lb.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
