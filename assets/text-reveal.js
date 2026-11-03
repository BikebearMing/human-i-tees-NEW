/*
  Text reveal — one entrance per font, never a fade.

  Add data-reveal to any text element and it plays its font's entrance the
  first time it comes up the screen:
    Futura (.h1–.h4, display)   lines rise out of their masks, 0.9s / 0.08 stagger
    Geist (.body)               lines rise out of their masks, 0.8s / 0.06 stagger
    American Typewriter         typed out letter by letter
    .custom-button              wiped up out of its own bottom edge
  The style is read from the element's computed font-family, so it follows
  whatever class the text already wears. Force one with data-reveal="futura",
  "body", "type" or "wipe".

  Loaded synchronously right after GSAP/SplitText in layout/theme.liquid, so
  the js-reveal class (which holds [data-reveal] hidden — see custom.css) is on
  <html> before any section paints. Each element is released the moment it is
  split and parked, so it is never seen at rest first.

  Sections with their own timelines don't use this; they follow the same
  styles by hand (line masks at yPercent 120, clip-path wipes instead of fades).
*/
(function () {
  'use strict';

  var reduce = false;
  try {
    reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var html = document.documentElement;
  if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  html.classList.add('js-reveal');

  var READY = 'reveal-ready';
  var LINES = {
    futura: { duration: 0.9, stagger: 0.08 },
    body: { duration: 0.8, stagger: 0.06 },
  };

  function kind(el) {
    var k = el.getAttribute('data-reveal');
    if (k) return k;
    if (el.classList.contains('custom-button')) return 'wipe';
    var f = getComputedStyle(el).fontFamily.toLowerCase();
    if (f.indexOf('typewriter') > -1) return 'type';
    if (f.indexOf('futura') > -1) return 'futura';
    return 'body';
  }

  /* Parks el in its start state and returns a paused timeline for its entrance. */
  function prepare(el) {
    var k = kind(el);
    var tl = gsap.timeline({ paused: true });

    if (k === 'wipe') {
      gsap.set(el, { yPercent: 100, clipPath: 'inset(0% 0% 100% 0%)' });
      tl.to(el, {
        yPercent: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.8,
        ease: 'power4.out',
        clearProps: 'clipPath,transform',
      });
    } else if (k === 'type') {
      var chars = SplitText.create(el, { type: 'chars' }).chars;
      gsap.set(chars, { visibility: 'hidden' });
      // each letter switches on in turn — capped so long labels still finish in ~1.2s
      tl.to(chars, { visibility: 'visible', duration: 0.001, stagger: Math.min(0.045, 1.2 / Math.max(1, chars.length)) });
    } else {
      var s = LINES[k] || LINES.body;
      var lines = SplitText.create(el, { type: 'lines', mask: 'lines' }).lines;
      gsap.set(lines, { yPercent: 120 });
      tl.to(lines, { yPercent: 0, duration: s.duration, ease: 'power4.out', stagger: s.stagger });
    }
    return tl;
  }

  function run() {
    var els = document.querySelectorAll('[data-reveal]:not(.' + READY + ')');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var tl = prepare(el);
        el.classList.add(READY);
        /* end: 'max' keeps it active from the start line down, so a reload
           mid-page (already past it) still plays it rather than leaving it parked. */
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          end: 'max',
          once: true,
          onEnter: function () {
            tl.play();
          },
        });
      })(els[i]);
    }
  }

  // Split once the webfonts are in, so the line breaks are the real ones.
  var ran = false;
  function start() {
    if (ran) return;
    ran = true;
    run();
  }
  function onReady() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
      setTimeout(start, 2500);
    } else {
      start();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  // Backstop: never leave text held hidden if something above failed.
  setTimeout(function () {
    if (!ran) html.classList.remove('js-reveal');
  }, 5000);

  window.TextReveal = { kind: kind, prepare: prepare, run: run };
})();
