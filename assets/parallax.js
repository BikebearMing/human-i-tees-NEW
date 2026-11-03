/*
  Global smooth parallax.
  Usage: any `<div class="parallax-container"><img class="parallax-image" ...></div>`
  on the page automatically gets a smoothed translateY tied to scroll position.
*/
(function () {
  'use strict';

  var STRENGTH = 0.18;
  var EASE = 0.08;
  var items = [];
  var rafId = null;

  function register(container) {
    var img = container.querySelector('.parallax-image');
    if (!img || container.dataset.parallaxReady === '1') return;
    container.dataset.parallaxReady = '1';

    var prevOverflow = getComputedStyle(container).overflow;
    if (prevOverflow !== 'hidden') container.style.overflow = 'hidden';

    img.style.willChange = 'transform';
    img.style.backfaceVisibility = 'hidden';
    img.style.transform = 'translate3d(0,0,0) scale(1.18)';
    img.style.height = '120%';
    img.style.width = '100%';
    img.style.objectFit = 'cover';

    items.push({
      container: container,
      img: img,
      current: 0,
      target: 0,
      inView: false
    });
  }

  function scan(root) {
    (root || document).querySelectorAll('.parallax-container').forEach(register);
  }

  function compute() {
    var vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var rect = it.container.getBoundingClientRect();
      it.inView = rect.bottom > 0 && rect.top < vh;
      if (it.inView) {
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) / vh; // -1 .. 1 (ish)
        it.target = -offset * rect.height * STRENGTH;
      }
    }
  }

  function tick() {
    var anyAlive = false;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.inView) continue;
      it.current += (it.target - it.current) * EASE;
      it.img.style.transform = 'translate3d(0,' + it.current.toFixed(2) + 'px,0) scale(1.18)';
      anyAlive = true;
    }
    rafId = anyAlive ? requestAnimationFrame(tick) : null;
  }

  function kick() {
    compute();
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scan();
    if (!items.length) return;

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function () { kick(); }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      items.forEach(function (it) { io.observe(it.container); });
    }

    var mo = new MutationObserver(function (muts) {
      var changed = false;
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) {
            if (n.classList && n.classList.contains('parallax-container')) { register(n); changed = true; }
            if (n.querySelectorAll) {
              n.querySelectorAll('.parallax-container').forEach(function (el) { register(el); changed = true; });
            }
          }
        });
      });
      if (changed) kick();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    kick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
