/* =========================================================================
   KCG — site behaviour
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Header: shadow on scroll + mobile nav
     --------------------------------------------------------------------- */
  var header = document.getElementById('site-header');
  var nav = document.getElementById('site-nav');
  var toggle = document.getElementById('nav-toggle');

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------------------------------------------------------------------
     Active nav link based on scroll position
     --------------------------------------------------------------------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger siblings inside the same grid for a nicer cascade.
        var delay = Math.min(i * 70, 350);
        setTimeout(function () { el.classList.add('in'); }, delay);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Stat counters
     --------------------------------------------------------------------- */
  var stats = document.querySelectorAll('.num[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || el.hasAttribute('data-plain')) {
      el.textContent = target + suffix;
      return;
    }
    var start = performance.now();
    var duration = 1300;
    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && stats.length) {
    var statObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    stats.forEach(function (el) { statObserver.observe(el); });
  } else {
    stats.forEach(runCount);
  }

  /* ---------------------------------------------------------------------
     Card cursor glow
     --------------------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------------------------------------------------------------------
     Solutions tabs
     --------------------------------------------------------------------- */
  var tabsRoot = document.querySelector('[data-tabs]');
  if (tabsRoot) {
    var tabs = Array.prototype.slice.call(tabsRoot.querySelectorAll('[role="tab"]'));

    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.classList.toggle('is-active', selected);
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !selected;
        panel.classList.toggle('is-active', selected);
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (dir) {
          e.preventDefault();
          selectTab(tabs[(i + dir + tabs.length) % tabs.length], true);
        } else if (e.key === 'Home') {
          e.preventDefault(); selectTab(tabs[0], true);
        } else if (e.key === 'End') {
          e.preventDefault(); selectTab(tabs[tabs.length - 1], true);
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Multi-step contact funnel
     --------------------------------------------------------------------- */
  var form = document.getElementById('funnel');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var fpFill = document.getElementById('fp-fill');
  var fpItems = Array.prototype.slice.call(form.querySelectorAll('.fp-steps li'));
  var statusEl = document.getElementById('step-status');
  var alertEl = document.getElementById('form-alert');
  var successEl = document.getElementById('form-success');
  var shell = form.parentElement;
  var current = 0;

  function showAlert(msg) {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.hidden = false;
  }
  function clearAlert() {
    if (alertEl) alertEl.hidden = true;
  }

  function goTo(index, moveFocus) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach(function (s, i) {
      s.hidden = i !== current;
      s.classList.toggle('is-active', i === current);
    });
    fpItems.forEach(function (li, i) {
      li.classList.toggle('is-active', i === current);
      li.classList.toggle('is-done', i < current);
    });
    if (fpFill) fpFill.style.width = (((current + 1) / steps.length) * 100) + '%';
    if (statusEl) statusEl.textContent = 'Step ' + (current + 1) + ' of ' + steps.length;
    clearAlert();

    // Only on a real step change — on first render this would steal focus from the page.
    if (!moveFocus) return;

    if (shell) {
      var top = shell.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    var legend = steps[current].querySelector('.step-title');
    if (legend) {
      legend.setAttribute('tabindex', '-1');
      legend.focus({ preventScroll: true });
    }
  }

  function setError(key, on) {
    var el = form.querySelector('[data-error-for="' + key + '"]');
    if (el) el.classList.toggle('show', !!on);
  }

  function validateStep(index) {
    var ok = true;

    if (index === 0) {
      var anyType = form.querySelector('input[name="Project type"]:checked');
      setError('projecttype', !anyType);
      if (!anyType) ok = false;

      var anyOrg = form.querySelector('input[name="Organization type"]:checked');
      setError('orgtype', !anyOrg);
      if (!anyOrg) ok = false;
    }

    if (index === 2) {
      var required = steps[index].querySelectorAll('[required]');
      Array.prototype.forEach.call(required, function (field) {
        var valid = field.checkValidity() && field.value.trim() !== '';
        field.classList.toggle('invalid', !valid);
        setError(field.name, !valid);
        if (!valid && ok) field.focus();
        if (!valid) ok = false;
      });
    }

    if (!ok) showAlert('Please complete the highlighted fields before continuing.');
    return ok;
  }

  // Clear an error the moment the user fixes it.
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (t.name === 'Project type') setError('projecttype', false);
    if (t.name === 'Organization type') setError('orgtype', false);
    if (t.hasAttribute && t.hasAttribute('required')) {
      t.classList.remove('invalid');
      setError(t.name, false);
    }
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'Project type') setError('projecttype', false);
    if (e.target.name === 'Organization type') setError('orgtype', false);
  });

  form.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(current)) goTo(current + 1, true);
    });
  });
  form.querySelectorAll('[data-prev]').forEach(function (btn) {
    btn.addEventListener('click', function () { goTo(current - 1, true); });
  });

  // Enter should advance, not submit, on steps 1 and 2.
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.tagName === 'TEXTAREA') return;
    if (current < steps.length - 1) {
      e.preventDefault();
      if (validateStep(current)) goTo(current + 1, true);
    }
  });

  goTo(0, false);

  /* --------- Submit --------- */
  var endpoint = form.getAttribute('action') || '';
  var configured = endpoint.indexOf('YOUR_FORM_ID') === -1 && /formspree\.io\/f\/\w+/.test(endpoint);

  if (!configured) {
    console.warn(
      '[KCG] Contact form is not wired up yet.\n' +
      'Create a form at https://formspree.io, then replace YOUR_FORM_ID in index.html ' +
      '(the <form action="..."> attribute) with your form ID. See README.md step 3.'
    );
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(steps.length - 1)) return;

    if (!configured) {
      showAlert(
        'This form isn’t connected yet. Please email contact@k-c-g.net or call 717-549-3600 — ' +
        'or finish the Formspree setup in README.md step 3.'
      );
      return;
    }

    var submitBtn = form.querySelector('.btn-submit');
    var originalHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.classList.add('is-sending');
      submitBtn.textContent = 'Sending…';
    }
    clearAlert();

    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (res.ok) return res.json().catch(function () { return {}; });
        return res.json().then(function (data) { throw new Error(formspreeError(data)); });
      })
      .then(function () {
        form.hidden = true;
        if (successEl) {
          successEl.hidden = false;
          successEl.setAttribute('tabindex', '-1');
          successEl.focus({ preventScroll: true });
          var top = successEl.getBoundingClientRect().top + window.scrollY - 140;
          window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      })
      .catch(function (err) {
        showAlert(
          (err && err.message ? err.message : 'Something went wrong sending your inquiry.') +
          ' You can also reach us at contact@k-c-g.net or 717-549-3600.'
        );
        if (submitBtn) {
          submitBtn.classList.remove('is-sending');
          submitBtn.innerHTML = originalHTML;
        }
      });
  });

  function formspreeError(data) {
    if (data && Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map(function (x) { return x.message; }).join(' ');
    }
    return 'Something went wrong sending your inquiry.';
  }
})();
