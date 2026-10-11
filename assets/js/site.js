// Scroll motion for the Cimelium home page. Only four things move:
// the logo morph, the hero parallax/depth, the stacking role cards with
// their counter, and the drapery reveal in the pilot section.
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  // 0 to 1 between scroll positions a and b
  const range = (v, a, b) => clamp((v - a) / (b - a));
  // 0 to 1 as an element travels from viewport bottom to top
  const pass = (el, vh) => { const r = el.getBoundingClientRect(); return clamp((vh - r.top) / (vh + r.height)); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Logo: wordmark above the hero heading that turns into the tile parked top-left
  function brand() {
    const el = document.querySelector('[data-brand]'), slot = document.querySelector('[data-brand-slot]');
    if (!el || !slot) return () => {};
    const word = el.querySelector('[data-bw]'), tile = el.querySelector('[data-bv]'), letters = tile.querySelector('[data-bvl]'), lettersPath = letters.firstElementChild;
    el.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });

    return () => {
      const vw = innerWidth, r = slot.getBoundingClientRect();
      const p = range(scrollY, 0, 520), e = ease(p);
      const s0 = r.height || 48, size = vw < 760 ? 46 : vw < 1100 ? 58 : 70;
      const fx = Math.max(10, Math.min(24, (r.left - size) / 2)), fy = vw < 760 ? 12 : 22;
      const x = r.left + (fx - r.left) * e, y = r.top + (fy - r.top) * e, s = s0 + (size - s0) * e;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(s / 100).toFixed(4)})`;

      // "imelium" wipes away from the right, leaving the C
      word.style.clipPath = `inset(0 ${(75.9 * ease(range(p, 0, .5))).toFixed(2)}% 0 0)`;
      word.style.opacity = (1 - range(p, .12, .34)).toFixed(3);

      // tile fades in while CIMELIUM slides into its base and turns light
      tile.style.opacity = range(p, .04, .3).toFixed(3);
      const q = ease(range(p, 0, .5)), c = range(q, .55, .9);
      letters.style.opacity = range(p, 0, .12).toFixed(3);
      letters.setAttribute('transform', `translate(${((1 - q) * 95).toFixed(2)} ${((1 - q) * -20).toFixed(2)})`);
      lettersPath.setAttribute('fill', `rgb(${Math.round(74 + 169 * c)},${Math.round(74 + 167 * c)},${Math.round(74 + 162 * c)})`);
    };
  }

  // Hero: text outruns the painting, painting shrinks and softens
  function hero() {
    const layers = [...document.querySelectorAll('[data-px]')], art = document.querySelector('[data-hero-art]');
    if (art) art.style.transformOrigin = '50% 40%';
    return () => {
      if (reduce) return;
      const vh = innerHeight;
      for (const el of layers) {
        const host = el.parentElement.getBoundingClientRect();
        if (host.bottom < -200 || host.top > vh + 200) continue;
        const c = host.top + host.height / 2 - vh / 2;
        el.style.transform = `translate3d(0,${(-c * +el.dataset.px).toFixed(1)}px,0)`;
      }
      if (art) {
        const k = clamp(scrollY / 700);
        art.style.transform = `scale(${(1 - .07 * k).toFixed(4)})`;
        art.style.filter = `blur(${(k * 1.6).toFixed(2)}px) saturate(${(1 - .18 * k).toFixed(3)}) drop-shadow(0 22px 22px rgba(58,47,43,${(.2 - .12 * k).toFixed(3)}))`;
      }
    };
  }

  // Role cards stack up; the big number follows whichever card is on top
  function cards() {
    const list = [...document.querySelectorAll('[data-card]')], nums = [...document.querySelectorAll('[data-num]')];
    return () => {
      if (!list.length || !list[0].offsetParent) return; // hidden on mobile
      const cover = list.map((c, i) => {
        if (i === 0) return 0;
        const r = c.getBoundingClientRect(), stick = parseFloat(c.style.top) || 0, prev = list[i - 1].getBoundingClientRect();
        return clamp(1 - (r.top - stick) / Math.max(1, prev.height));
      });
      nums.forEach((n, i) => {
        const a = i === 0 ? 1 - (cover[1] || 0) : cover[i] - (cover[i + 1] || 0);
        n.style.opacity = clamp(a).toFixed(3);
      });
      list.forEach((c, i) => {
        let depth = 0; for (let j = i + 1; j < list.length; j++) depth += cover[j];
        c.style.transform = `scale(${(1 - .045 * Math.min(depth, 4)).toFixed(4)})`;
        c.style.filter = depth > 0 ? `brightness(${(1 - .08 * Math.min(depth, 3)).toFixed(3)})` : '';
      });
    };
  }

  // Pilot: the drapery opens up as it scrolls into view
  function drapery() {
    const img = document.querySelector('[data-clip]');
    return () => {
      if (!img) return;
      const t = ease(clamp((pass(img.parentElement, innerHeight) - .05) / .42)), a = (1 - t) * 14, b = (1 - t) * 22;
      img.style.clipPath = `inset(${a.toFixed(2)}% ${b.toFixed(2)}% ${a.toFixed(2)}% ${b.toFixed(2)}%)`;
      img.style.transform = `scale(${(1.1 - .1 * t).toFixed(4)})`;
    };
  }

  const steps = [brand(), hero(), cards(), drapery()];
  let raf = 0;
  const run = () => { raf = 0; steps.forEach(f => f()); };
  const req = () => { if (!raf) raf = requestAnimationFrame(run); };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  // fonts and images shift the layout a little after load
  run(); setTimeout(run, 300); setTimeout(run, 1200);
  addEventListener('load', req);
})();
