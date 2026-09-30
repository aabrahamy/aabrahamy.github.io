/* ==========================================================================
   js/core.js: shared settings, helpers, router, drag-scrolling, lightbox.
   You shouldn't need to edit anything below MOTION to change content;
   content lives in content.js.
   ========================================================================== */
window.App = (() => {
  "use strict";

  /* ------------------------------------------------------------------------
     MOTION: tune the feel of the site here (all times in milliseconds).
     The matching CSS durations/easings are at the top of styles.css.
     ------------------------------------------------------------------------ */
  const MOTION = {
    pageFade: 150,          // crossfade when flipping between tabs

    // melting display titles (js/effects.js)
    // (hover melt timing is MELT_IN_MS / MELT_OUT_MS at the top of js/effects.js)
    meltEnter: 600,         // blobby → crisp when a page opens
    meltScale: 11,          // displacement strength at the peak
    meltBlur: 2.2,          // blur (px) before the goo threshold
    meltGoo: 14,            // threshold sharpness (higher = crisper blobs)
    meltSwell: 0.07,        // how much letters fatten (0 to 0.4)

    // ink cursor trail (js/effects.js)
    trailLife: 450,         // a point fades out after this long
    trailPoints: 25,        // how many recent positions to keep
    trailWidth: 1.2,        // px at the cursor end
    trailInk: "26, 26, 26", // RGB over the paper
    trailInkAlpha: 0.7,
    trailChalk: "217, 217, 217", // RGB over the black background

    // line boil on handwriting (js/effects.js)
    boilEvery: 120,         // ms between redraws (lower = jittery/fast)
    boilFrames: 4,          // how many different wobble shapes to cycle
    boilScale: 3.2,         // wobble strength in px
    boilFreq: 0.035,        // wobble size (lower = longer waves)
    boilGrit: 1.2,          // fine rough-edge grit in px
    boilSoftScale: 1.1,     // the gentler #boil-soft filter (small handwriting, e.g. the Playground intro)
    boilSoftGrit: 0.4,

    // "About me" note growing into the bio sheet (js/about.js)
    sheetMs: 500,           // grow / shrink duration
    sheetStagger: 40,       // the bottom edge trails the right edge by this much
    sheetEase: "cubic-bezier(.2, .8, .2, 1)",
    sheetEaseClose: "cubic-bezier(.8, 0, .8, .2)",   // the same curve mirrored, for shrinking back
    sheetContentAt: 0.7,    // content starts fading in at this fraction of the grow
    sheetContentMs: 180,    // content fade length
    sheetContentDrift: 6,   // px the content drifts up while fading in

    // stamp portrait (js/about.js)
    stampEvery: 2500,       // next photo every…
    stampHover: 350,        // …or this fast while hovered

    // drag scrolling (Projects grid/list, Playground)
    momentumDecay: 0.95,    // velocity kept per frame after you let go
    dragThreshold: 5,       // px moved before a press counts as a drag

    previewLerp: 0.15,      // list-view preview follows the cursor (0–1)
    parallax: 1.1,          // Playground notes + stickers move this much faster
  };

  /* ---- environment ------------------------------------------------------ */
  const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => reducedMQ.matches;
  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- tiny helpers ----------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // escape + turn "[EDIT]" into a visible chip
  const txt = (s) => esc(s).replace(/\[EDIT\]\s*/g, '<mark class="edit-flag">EDIT</mark> ');
  const pad2 = (n) => String(n).padStart(2, "0");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const ratioNum = (r) => {
    const [w, h] = String(r || "1/1").split("/").map(Number);
    return w > 0 && h > 0 ? w / h : 1;
  };
  const ratioCss = (r) => String(r || "4/3").replace("/", " / ");
  const paras = (text) => String(text || "").split(/\n\s*\n/).map((p) => `<p>${txt(p.trim())}</p>`).join("");
  const lines = (text) => String(text || "").split("\n").map(txt).join("<br>");

  /* ---- URLs ------------------------------------------------------------- */
  const BASE = window.SITE_BASE || "/";
  const MODE = location.protocol === "file:" ? "hash" : "path";
  const ROUTES = ["about", "projects", "playground", "contact"];

  // asset path from content.js → absolute URL (so it works at any page depth)
  const asset = (src) => (!src || /^([a-z]+:|\/\/|\/)/i.test(src) ? src : BASE + src);
  // page route ("projects/rv32i-cpu") → link href
  const href = (route) => (MODE === "hash" ? `#/${route}` : BASE + route);

  /**
   * Image frame. Shows a gray placeholder labeled with the file path until
   * the real image loads. If the file doesn't exist yet, the placeholder stays.
   *   natural: once loaded, use the image's own shape instead of `ratio`.
   */
  function ph(img = {}, { ratio, natural = false, cls = "" } = {}) {
    const src = img.src || "";
    return `<div class="ph${natural ? " ph--natural" : ""}${cls ? " " + cls : ""}" style="--ratio:${esc(ratioCss(ratio || img.ratio))}">
      <span class="ph__label"><span>${esc(src)}</span></span>
      ${src ? `<img src="${esc(asset(src))}" alt="${esc(img.alt || "")}" loading="lazy" decoding="async" draggable="false">` : ""}
    </div>`;
  }
  document.addEventListener("load", (e) => {
    if (e.target.tagName === "IMG") e.target.closest(".ph")?.classList.add("is-loaded");
  }, true);
  function markLoaded(root) {
    $$(".ph img", root).forEach((img) => {
      if (img.complete && img.naturalWidth > 0) img.closest(".ph").classList.add("is-loaded");
    });
  }

  /* ---- shared state that survives page changes (memory only) ------------ */
  const state = {};

  /* ==========================================================================
     DRAG SCROLLING with momentum
     Mouse only: touch and trackpads use the browser's native scrolling.
     A press that moves less than MOTION.dragThreshold still counts as a click.
     ========================================================================== */
  function dragScroll(el, axis = "y") {
    const pos = (e) => (axis === "y" ? e.clientY : e.clientX);
    const get = () => (axis === "y" ? el.scrollTop : el.scrollLeft);
    const set = (v) => { if (axis === "y") el.scrollTop = v; else el.scrollLeft = v; };
    let down = false, moved = false, start = 0, startScroll = 0, last = 0, lastT = 0, v = 0, raf = 0, pid = 0;

    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.target.closest("input, textarea, select")) return;
      stop();
      down = true; moved = false;
      start = last = pos(e); startScroll = get(); lastT = performance.now(); v = 0; pid = e.pointerId;
    };
    const onMove = (e) => {
      if (!down) return;
      const d = pos(e) - start;
      if (!moved && Math.abs(d) > MOTION.dragThreshold) {
        moved = true;
        el.classList.add("is-dragging");
        try { el.setPointerCapture(pid); } catch { /* ignore */ }
      }
      if (!moved) return;
      e.preventDefault();
      set(startScroll - d);
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      v = ((pos(e) - last) / dt) * 16;   // px per frame
      last = pos(e); lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
      if (performance.now() - lastT > 80) v = 0;         // paused before letting go
      if (moved && !reduced() && Math.abs(v) > 0.5) {
        const step = () => {
          v *= MOTION.momentumDecay;
          if (Math.abs(v) < 0.3) { raf = 0; return; }
          set(get() - v);
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
      setTimeout(() => { moved = false; }, 0);
    };
    // a drag must not open the thing you started it on
    const onClick = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } };
    const noNativeDrag = (e) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", noNativeDrag);
    el.addEventListener("wheel", stop, { passive: true });
    return () => {
      stop();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", noNativeDrag);
      el.removeEventListener("wheel", stop);
    };
  }

  /* ==========================================================================
     LIGHTBOX: App.lightbox.open(items, index)
     items: [{ src, alt, ratio, caption, date }]
     ========================================================================== */
  const lightbox = (() => {
    const dlg = $("#lightbox");
    let items = [], index = 0;
    const show = () => {
      const it = items[index];
      $("#lightboxImg").innerHTML = ph(it, { natural: true });
      $("#lightboxCap").innerHTML = [it.caption, it.date].filter(Boolean).map(txt).join(" · ");
      $$(".lightbox__nav", dlg).forEach((b) => { b.hidden = items.length < 2; });
      markLoaded(dlg);
    };
    const step = (d) => { index = (index + d + items.length) % items.length; show(); };
    dlg.addEventListener("click", (e) => {
      if (e.target.closest("[data-lb-close]") || e.target === dlg) dlg.close();
      const s = e.target.closest("[data-lb-step]");
      if (s) step(Number(s.dataset.lbStep));
    });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
    dlg.addEventListener("close", () => { $("#lightboxImg").innerHTML = ""; });
    return {
      open(list, i = 0) {
        items = list; index = i; show();
        if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      },
      get isOpen() { return dlg.open; },
    };
  })();

  /* ==========================================================================
     CLOCK: any element with [data-clock] shows the About time zone
     ========================================================================== */
  let clockFmt;
  try {
    clockFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: SITE.about.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
  } catch {
    clockFmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }
  function tick() {
    const els = $$("[data-clock]");
    if (!els.length) return;
    const now = new Date();
    els.forEach((el) => { el.textContent = clockFmt.format(now); el.dateTime = now.toISOString(); });
  }
  setInterval(tick, 1000);

  /* ==========================================================================
     PCB traces on the dot grid (seeded per page so they don't jump around)
     ========================================================================== */
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  function drawTraces(svg, w, h, seedKey) {
    const css = getComputedStyle(document.documentElement);
    const g = parseFloat(css.getPropertyValue("--dot-gap")) || 26;
    const inset = parseFloat(css.getPropertyValue("--dot-inset")) || g / 2;
    const cols = Math.floor((w - inset) / g) + 1;
    const rows = Math.floor((h - inset) / g) + 1;
    if (cols < 3 || rows < 3) { svg.innerHTML = ""; return; }
    const rand = rng(hash(seedKey));
    const count = Math.max(3, Math.round((w * h) / (85000 * Math.max(1, g / 40))));
    const X = (v) => (inset + v * g).toFixed(1);
    let out = "";
    for (let n = 0; n < count; n++) {
      let x = 1 + Math.floor(rand() * (cols - 2));
      let y = 1 + Math.floor(rand() * (rows - 2));
      let d = Math.floor(rand() * 4) * 2;
      const pts = [[x, y]];
      const segs = 2 + Math.floor(rand() * 3);
      for (let s = 0; s < segs; s++) {
        if (s > 0) d = (d + (rand() < 0.5 ? 1 : 7)) % 8;
        const px = d % 2 ? 30 + rand() * 30 : 52 + rand() * 104;
        const len = Math.max(1, Math.round(px / g));
        const nx = clamp(x + DIRS[d][0] * len, 0, cols - 1);
        const ny = clamp(y + DIRS[d][1] * len, 0, rows - 1);
        if (nx === x && ny === y) break;
        x = nx; y = ny; pts.push([x, y]);
      }
      if (pts.length < 2) continue;
      out += `<path d="M${pts.map(([a, b]) => `${X(a)} ${X(b)}`).join(" L")}"/>`;
      out += `<circle class="pad-fill" cx="${X(pts[0][0])}" cy="${X(pts[0][1])}" r="2.6"/>`;
      out += `<circle cx="${X(x)}" cy="${X(y)}" r="4"/>`;
    }
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = out;
  }

  /* ==========================================================================
     ROUTER (History API; falls back to #/ links when opened as a file)
     Views register themselves in App.views:
       { render(route) → { title, watermark, html },
         mount(el, route) → cleanup function (optional) }
     ========================================================================== */
  const views = {};
  let current = null; // { key, el, cleanup }

  function parseRoute() {
    let path = MODE === "hash"
      ? location.hash.replace(/^#\/?/, "")
      : decodeURIComponent(location.pathname).slice(decodeURIComponent(BASE).length);
    path = path.replace(/^\/+|\/+$/g, "");
    const [tab, slug] = path.split("/");
    if (tab === "projects" && slug) {
      return SITE.projects.some((p) => p.slug === slug) ? { tab, slug } : { tab: "projects" };
    }
    return ROUTES.includes(tab) ? { tab } : { tab: "about" };
  }
  const routeKey = (r) => r.tab + (r.slug ? "/" + r.slug : "");

  function navigate(route) {
    if (MODE === "hash") { location.hash = "/" + route; return; } // hashchange renders
    history.pushState(null, "", href(route));
    render();
  }

  // plain left-clicks on internal links → router; everything else (new tab,
  // middle click, downloads, other sites) behaves like a normal link
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    if (MODE === "hash") return; // #/ links route through hashchange
    if (a.getAttribute("href").startsWith("#")) return; // in-page anchors
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
    const route = decodeURIComponent(url.pathname.slice(BASE.length)).replace(/\/+$/, "");
    const first = route.split("/")[0];
    if (route && !ROUTES.includes(first)) return;
    e.preventDefault();
    navigate(route || "about");
  });

  const hooks = { beforeRender: [], afterRender: [] };

  function render() {
    const route = parseRoute();
    const key = routeKey(route);
    if (current && current.key === key) return;
    const name = route.slug ? "project" : route.tab;
    const view = views[name];
    const out = view.render(route);
    const first = !current;

    hooks.beforeRender.forEach((f) => f(route, name));

    // tear down the old page and crossfade it out
    if (current) {
      try { current.cleanup?.(); } catch (err) { console.error(err); }
      const old = current.el;
      old.classList.add("is-leaving");
      old.inert = true;
      if (typeof old.animate === "function") {
        old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: MOTION.pageFade, easing: "linear", fill: "forwards" })
          .finished.then(() => old.remove(), () => old.remove());
      } else old.remove();
    }

    // folder color + tabs change in the same frame as the new page
    const folder = $("#folder");
    folder.dataset.section = route.tab;
    folder.dataset.view = name;
    document.title = route.tab === "about" && !route.slug ? `${SITE.name}: ${out.title}` : `${out.title} · ${SITE.name}`;

    const el = document.createElement("div");
    el.className = `view view--${name}`;
    el.innerHTML = out.html;   // (script watermarks removed)
    $("#views").appendChild(el);
    if (!first && typeof el.animate === "function") {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: MOTION.pageFade, easing: "linear" });
    }
    markLoaded(el);
    tick();

    let cleanup = null;
    try { cleanup = view.mount?.(el, route) || null; } catch (err) { console.error(err); }
    current = { key, el, cleanup };

    hooks.afterRender.forEach((f) => f(el, route, { first }));
    if (!first) $("[data-focus]", el)?.focus({ preventScroll: true });
  }

  window.addEventListener(MODE === "hash" ? "hashchange" : "popstate", render);

  return {
    MOTION, reduced, isMobile, finePointer,
    $, $$, esc, txt, pad2, clamp, debounce, hash, rng, ratioNum, ratioCss, paras, lines,
    BASE, MODE, asset, href, ph, markLoaded,
    state, views, hooks, dragScroll, lightbox, drawTraces,
    navigate, render, parseRoute,
    get currentEl() { return current?.el; },
  };
})();
