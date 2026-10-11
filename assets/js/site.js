// Scroll motion for the Cimelium home page. Only three things move:
// the hero parallax/depth, the stacking role cards with their counter,
// and a gentle drift on the drapery in the pilot section.
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // 0 to 1 as an element travels from viewport bottom to top
  const pass = (el, vh) => { const r = el.getBoundingClientRect(); return clamp((vh - r.top) / (vh + r.height)); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer tile takes you back to the top
  document.querySelectorAll('[data-to-top]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }));

  // Hero: text outruns the painting, painting shrinks and softens
  function hero() {
    const layers = [...document.querySelectorAll('[data-px]')], art = document.querySelector('[data-hero-art]');
    if (art) {
      art.style.transformOrigin = '50% 40%';
      // repaint once the painting has decoded, so it never sits blank until the first scroll
      const repaint = () => { art.style.visibility = 'hidden'; art.offsetHeight; art.style.visibility = ''; };
      if (art.complete) repaint(); else art.addEventListener('load', repaint, { once: true });
    }
    return () => {
      if (reduce) return;
      const vh = innerHeight;
      // no parallax on phones: the hero stacks there, and the layers would squeeze the gap under the button
      for (const el of layers) {
        if (innerWidth < 760) { el.style.transform = ''; continue; }
        const host = el.parentElement.getBoundingClientRect();
        if (host.bottom < -200 || host.top > vh + 200) continue;
        const c = host.top + host.height / 2 - vh / 2;
        el.style.transform = `translate3d(0,${(-c * +el.dataset.px).toFixed(1)}px,0)`;
      }
      if (art) {
        const k = clamp(scrollY / 700);
        // at the top leave the stylesheet's plain drop-shadow alone, Safari renders the blur(0) chain as a blank box
        art.style.transform = k ? `scale(${(1 - .07 * k).toFixed(4)})` : '';
        art.style.filter = k ? `blur(${(k * 1.6).toFixed(2)}px) saturate(${(1 - .18 * k).toFixed(3)}) drop-shadow(0 22px 22px rgba(58,47,43,${(.2 - .12 * k).toFixed(3)}))` : '';
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

  // Pilot: the drapery drifts gently inside its frame as the section scrolls past.
  // It's scaled up 8%, which leaves 4% spare on each edge, and moves ±3.5%,
  // little enough that the foot at the top right stays in frame.
  function drapery() {
    const img = document.querySelector('[data-drapery]');
    return () => {
      if (!img || reduce) return;
      const t = pass(img.parentElement, innerHeight);
      img.style.transform = `translate3d(0,${((.5 - t) * 7).toFixed(2)}%,0) scale(1.08)`;
    };
  }

  const steps = [hero(), cards(), drapery()];
  let raf = 0;
  const run = () => { raf = 0; steps.forEach(f => f()); };
  const req = () => { if (!raf) raf = requestAnimationFrame(run); };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  // fonts and images shift the layout a little after load
  run(); setTimeout(run, 300); setTimeout(run, 1200);
  addEventListener('load', req);
})();
