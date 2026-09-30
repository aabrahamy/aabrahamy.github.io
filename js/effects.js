/* ==========================================================================
   js/effects.js: the pencil cursor trail + the melting display titles.
   Settings for both live in MOTION at the top of js/core.js.
   ========================================================================== */
(() => {
  "use strict";
  const { $, $$, MOTION, reduced, hooks } = App;

  /* ---- Name / title melt timing: tune these ---------------------------- */
  const MELT_IN_MS = 900;       // hover: melt / swell in   (easeInOutCubic)
  const MELT_OUT_MS = 800;     // leave: settle back       (easeOutQuart)
  const MELT_INTENT_MS = 30;    // hover-intent: skimming past faster than this does nothing
  const MELT_RADIUS = 80;      // px around the title where the melt starts (bigger = earlier)

  /* ==========================================================================
     0. FILM GRAIN
     Random grayscale pixels drawn once onto a small canvas → data URL → the
     repeating background of the .grain layers. Opacity, speed, size and blend
     are CSS variables at the top of styles.css.
     ========================================================================== */
  (() => {
    const root = document.documentElement;
    const size = parseInt(getComputedStyle(root).getPropertyValue("--grain-size"), 10) || 200;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const cx = c.getContext("2d");
    const img = cx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    cx.putImageData(img, 0, 0);
    root.style.setProperty("--grain-url", `url(${c.toDataURL("image/png")})`);
    // don't burn GPU while the tab is in the background
    document.addEventListener("visibilitychange", () => root.classList.toggle("tab-hidden", document.hidden));
  })();

  /* ==========================================================================
     1. INK CURSOR TRAIL
     A full-screen canvas (pointer-events: none) that draws a tapering
     graphite line through the last ~25 pointer positions. Dark over the
     folder, light over the black background. Desktop / fine pointers only.
     ========================================================================== */
  (() => {
    const canvas = $("#inkTrail");
    const ctx = canvas.getContext("2d");
    const folder = $("#folder");
    const fineMQ = window.matchMedia("(hover: hover) and (pointer: fine)");
    const wideMQ = window.matchMedia("(min-width: 768px)");
    const enabled = () => fineMQ.matches && wideMQ.matches && !reduced();

    let pts = [];
    let raf = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || !enabled()) return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > MOTION.trailPoints) pts.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    }, { passive: true });

    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    function draw() {
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < MOTION.trailLife);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (pts.length < 2) { raf = 0; return; }

      const r = folder.getBoundingClientRect();
      const inside = (p) => p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Segment i runs from the midpoint before P[i] to the midpoint after it,
      // curving through P[i]. Each gets its own width/alpha → taper + fade.
      const n = pts.length;
      for (let i = 0; i < n - 1; i++) {
        const p = pts[i];
        const from = i === 0 ? p : mid(pts[i - 1], p);
        const to = i === n - 2 ? pts[n - 1] : mid(p, pts[i + 1]);
        const life = 1 - (now - p.t) / MOTION.trailLife; // 1 = fresh, 0 = gone
        const f = Math.max(0, life) * (0.35 + 0.65 * ((i + 1) / (n - 1)));
        ctx.lineWidth = MOTION.trailWidth * (0.25 + 0.75 * f);
        ctx.strokeStyle = inside(p)
          ? `rgba(${MOTION.trailInk}, ${(MOTION.trailInkAlpha * f).toFixed(3)})`
          : `rgba(${MOTION.trailChalk}, ${(0.9 * f).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        if (i === 0) ctx.lineTo(to.x, to.y);
        else ctx.quadraticCurveTo(p.x, p.y, to.x, to.y);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    }
  })();

  /* ==========================================================================
     2. MELTING DISPLAY TITLES
     Each [data-melt] title gets its own SVG filter:
       turbulence → displacement (wobble) → blur → alpha threshold (goo)
     At p = 0 the filter is an exact no-op, so we drop it for crisp text;
     p animates 0 → 1 → 0 on hover, tap, and page entry.
     ========================================================================== */
  const defs = $("#svgDefs");
  let meltCount = 0;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);                                         // page entry
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);  // way in
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);                                    // way out
  const NS = "http://www.w3.org/2000/svg";

  function melt(el) {
    if (reduced()) return () => {};
    const id = `melt-${++meltCount}`;
    const filter = document.createElementNS(NS, "filter");
    filter.setAttribute("id", id);
    filter.setAttribute("x", "-12%"); filter.setAttribute("y", "-35%");
    filter.setAttribute("width", "124%"); filter.setAttribute("height", "170%");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    filter.innerHTML = `
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${meltCount}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
      <feGaussianBlur in="wobble" stdDeviation="0" result="soft"/>
      <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>`;
    defs.appendChild(filter);
    const disp = filter.querySelector("feDisplacementMap");
    const blur = filter.querySelector("feGaussianBlur");
    const matrix = filter.querySelector("feColorMatrix");

    let p = 0, raf = 0;
    function apply(v) {
      p = v;
      disp.setAttribute("scale", (MOTION.meltScale * v).toFixed(2));
      blur.setAttribute("stdDeviation", (MOTION.meltBlur * v).toFixed(2));
      // alpha' = k·(alpha − threshold) + 0.5 ; identity when v = 0
      const k = 1 + (MOTION.meltGoo - 1) * v;
      const th = 0.5 - MOTION.meltSwell * v;
      matrix.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${k.toFixed(3)} ${(0.5 - k * th).toFixed(3)}`);
      el.style.filter = v > 0.002 ? `url(#${id})` : "";
    }
    // Every frame interpolates from wherever p is right now, so reversing
    // halfway glides back instead of jumping. Time scales with the distance
    // left to travel, so the speed stays even.
    function tween(to, dur, ease, then) {
      cancelAnimationFrame(raf);
      const from = p, t0 = performance.now();
      dur = Math.max(1, dur * Math.abs(to - from));
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        apply(from + (to - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else { raf = 0; then?.(); }
      };
      raf = requestAnimationFrame(step);
    }

    let intent = 0, near = false;
    const enter = () => {
      clearTimeout(intent);
      intent = setTimeout(() => tween(1, MELT_IN_MS, easeInOutCubic), MELT_INTENT_MS);
    };
    const leave = () => {
      clearTimeout(intent);
      if (p > 0) tween(0, MELT_OUT_MS, easeOutQuart);
    };
    // proximity trigger: starts when the cursor comes within MELT_RADIUS of the
    // title (not just on it); +20px of slack to leave, so the edge doesn't flicker
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      const d = Math.hypot(dx, dy);
      if (!near && d <= MELT_RADIUS) { near = true; enter(); }
      else if (near && d > MELT_RADIUS + 20) { near = false; leave(); }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", () => { if (near) { near = false; leave(); } });
    const tap = (e) => {
      if (e.pointerType === "mouse") return;
      tween(1, MELT_IN_MS, easeInOutCubic, () => tween(0, MELT_OUT_MS, easeOutQuart));
    };
    el.addEventListener("pointerup", tap);

    // page entry: start blobby, resolve to crisp
    apply(0.85);
    tween(0, MOTION.meltEnter, easeOut);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(intent);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", tap);
      filter.remove();
    };
  }
  App.melt = melt;

  /* ==========================================================================
     3. LINE BOIL ("squigglevision")
     One shared SVG filter (#boil) wobbles handwriting edges. Every
     MOTION.boilEvery ms its turbulence seed jumps to the next frame, so the
     scribble looks hand-redrawn and slightly alive. Reduced motion: one still
     wobble, no animation. Used by .stamp-cap; add filter: url(#boil) elsewhere.
     ========================================================================== */
  (() => {
    // two strengths: #boil (caption on the stamp) and #boil-soft (small handwriting)
    const make = (id, scale, grit) => {
      const f = document.createElementNS(NS, "filter");
      f.setAttribute("id", id);
      f.setAttribute("x", "-10%"); f.setAttribute("y", "-20%");
      f.setAttribute("width", "120%"); f.setAttribute("height", "140%");
      f.innerHTML = `
        <feTurbulence type="fractalNoise" baseFrequency="${MOTION.boilFreq}" numOctaves="2" seed="1" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="w"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="grain"/>
        <feDisplacementMap in="w" in2="grain" scale="${grit}" xChannelSelector="R" yChannelSelector="G"/>`;
      defs.appendChild(f);
      return f.querySelector("feTurbulence");
    };
    const turbs = [make("boil", MOTION.boilScale, MOTION.boilGrit), make("boil-soft", MOTION.boilSoftScale, MOTION.boilSoftGrit)];
    if (reduced()) return;
    let frame = 0;
    setInterval(() => {
      if (document.hidden) return;
      frame = (frame + 1) % MOTION.boilFrames;
      turbs.forEach((t) => t.setAttribute("seed", String(frame + 1)));
    }, MOTION.boilEvery);
  })();

  // every page: melt its [data-melt] titles; the view's cleanup removes them
  const meltCleanups = [];
  hooks.beforeRender.push(() => { meltCleanups.splice(0).forEach((f) => f()); });
  hooks.afterRender.push((el) => { $$("[data-melt]", el).forEach((t) => meltCleanups.push(melt(t))); });
})();
