/* ==========================================================================
   js/playground.js: Playground: an endless, draggable scrapbook.
   The canvas is rendered 3× side by side inside a native horizontal
   scroller; scrollLeft is silently shifted by one copy when you drift too
   far, so it loops forever. Notes + stickers sit on a second layer that
   moves MOTION.parallax× as fast for a little depth.
   Item positions (x / y / w / rotate) come from content.js.
   ========================================================================== */
(() => {
  "use strict";
  const { $, $$, esc, txt, lines, pad2, ph, clamp, ratioNum, MOTION, reduced, dragScroll, markLoaded } = App;

  const DEFAULT_W = { photo: 220, art: 230, note: 200, sticker: 120 };
  const FLOATS = ["note", "sticker", "intro"];     // these get parallax
  const START = 900;                               // default x for items with no x: past the first screen (design width 820)
  const SPARKLE = (x, y, s, r) => `<svg class="sparkle" style="left:${x}%;top:${y}%;width:${s}px;transform:rotate(${r}deg)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 2c.6 4.6 2.4 7.4 10 10-7.6 2.6-9.4 5.4-10 10-.6-4.6-2.4-7.4-10-10 7.6-2.6 9.4-5.4 10-10z"/></svg>`;
  const ARROW = `<svg viewBox="0 0 80 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 10c18-3 44 1 72-2"/><path d="M64 3l11 5-10 6"/></svg>`;

  /* ---- fill in defaults: missing x/y/w get placed after the previous
          item, zig-zagging high and low ------------------------------------ */
  function layout(items) {
    let end = START, zig = 0, num = 0;
    return items.map((it) => {
      const w = it.w ?? DEFAULT_W[it.type] ?? 200;
      const x = it.x ?? end + 90;
      const y = it.y ?? (zig++ % 2 ? 0.55 : 0.18);
      end = Math.max(end, x + w);
      const numbered = it.type === "photo" || it.type === "art";
      return { ...it, x, y, w, n: numbered ? ++num : 0 };
    });
  }

  function itemHTML(it, S, lbIndex) {
    const vert = it.bottom != null ? `bottom:${(it.bottom * 100).toFixed(2)}%` : `top:${(it.y * 100).toFixed(2)}%`;
    const style = `left:${Math.round(it.x * S)}px;${vert};width:${Math.round(it.w * S)}px;--rot:${it.rotate || 0}deg`;
    if (it.type === "photo" || it.type === "art") {
      return `<figure class="pg-item pg-${it.type}" style="${style}">
        <span class="pg-num">(${pad2(it.n)})</span>
        ${it.type === "art" && it.tape ? '<span class="tape" aria-hidden="true"></span>' : ""}
        ${ph(it, { ratio: it.ratio || "4/5" })}
        <button type="button" class="pg-hit" data-lb="${lbIndex}"><span class="visually-hidden">Open ${esc(it.alt || it.type)}</span></button>
      </figure>`;
    }
    if (it.type === "note") {
      const [first, ...rest] = String(it.text || "").split("\n");
      return `<p class="pg-item pg-note hand" style="${style};width:auto">${txt(first)}${rest.length ? `<span class="pg-note__l2">${rest.map(txt).join("<br>")}</span>` : ""}</p>`;
    }
    if (it.type === "sticker") {
      return `<div class="pg-item pg-sticker" style="${style}">${ph(it, { ratio: it.ratio || "1/1" })}</div>`;
    }
    return "";
  }

  App.views.playground = {
    render() {
      return {
        title: "Playground",
        watermark: "Playground",
        html: `
        <h1 class="display pg-title" data-melt data-focus tabindex="-1">Playground</h1>
        <div class="pg-scroll" data-drag tabindex="0" role="region" aria-label="Playground scrapbook. Drag, swipe, scroll or use the arrow keys to move sideways.">
          <div class="pg-canvas">
            <div class="pg-layer pg-layer--base"></div>
            <div class="pg-layer pg-layer--float"></div>
          </div>
        </div>`,
      };
    },

    mount(el) {
      const pg = SITE.playground;
      const scroller = $(".pg-scroll", el);
      const canvas = $(".pg-canvas", el);
      const baseLayer = $(".pg-layer--base", el);
      const floatLayer = $(".pg-layer--float", el);
      const items = layout(pg.items || []);
      const viewable = items.filter((it) => it.type === "photo" || it.type === "art");
      let L = 0, f = 1;

      function build() {
        const H = scroller.clientHeight;
        const W = scroller.clientWidth;
        const S = clamp(Math.min(W, H) / 820, 0.4, 1.15);   // positions are in a 820-unit design; scale to the folder
        f = reduced() ? 1 : MOTION.parallax;
        const lastEnd = Math.max(START, ...items.map((it) => it.x + it.w));
        const endX = lastEnd + 120;
        L = Math.max(W + 40, Math.round((endX + 300 + 180) * S));   // one full loop of canvas

        const base = [], floats = [];
        items.forEach((it) => {
          const lb = viewable.indexOf(it);
          (FLOATS.includes(it.type) ? floats : base).push(itemHTML(it, S, lb));
        });
        // intro: upper-left (25% down, 6% in); the 3rd line is indented under the 2nd
        const introLines = String(pg.intro || "").split("\n").map((l, i) =>
          `<span class="pg-intro__l${i >= 2 ? " is-indent" : ""}">${txt(l)}</span>`).join("");
        const intro = `<p class="pg-item pg-intro hand" style="left:${Math.round(W * 0.06)}px;top:25%">${introLines}</p>`;
        const swipe = `<p class="pg-item pg-swipe hand" style="left:${Math.round(W * 0.06)}px;bottom:5%" aria-hidden="true">${txt(pg.swipeLabel || "swipe")} ${ARROW}</p>`;
        const end = `<div class="pg-item pg-end" style="left:${Math.round(endX * S)}px;top:40%">
          <span class="hand">${txt(pg.endLabel || "The End")}</span>
          ${SPARKLE(-18, -30, 22, 10)}${SPARKLE(96, -40, 16, -20)}${SPARKLE(104, 60, 26, 25)}${SPARKLE(-10, 90, 14, 0)}${SPARKLE(45, -62, 12, 30)}
        </div>`;
        const baseHTML = base.join("") + swipe + end;
        const floatHTML = intro + floats.join("");

        const copies = (html, spacing) => [0, 1, 2].map((k) =>
          `<div class="pg-copy" style="left:${Math.round(k * spacing)}px"${k === 1 ? "" : ' inert aria-hidden="true"'}>${html}</div>`).join("");
        canvas.style.width = `${3 * L}px`;
        baseLayer.innerHTML = copies(baseHTML, L);
        floatLayer.innerHTML = copies(floatHTML.replace(/left:(\d+)px/g, (m, v) => `left:${Math.round(v * f)}px`), L * f);
        markLoaded(canvas);
      }

      // loop: keep scrollLeft inside the middle copy, then move the float layer
      function onScroll() {
        let s = scroller.scrollLeft;
        if (s < L * 0.5) { s += L; scroller.scrollLeft = s; }
        else if (s > L * 1.5) { s -= L; scroller.scrollLeft = s; }
        floatLayer.style.transform = `translate3d(${(-(f - 1) * s).toFixed(1)}px, 0, 0)`;
      }
      scroller.addEventListener("scroll", onScroll, { passive: true });

      // vertical wheel / trackpad → sideways
      const onWheel = (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
      };
      scroller.addEventListener("wheel", onWheel, { passive: false });

      // click a photo / artwork (without dragging) → lightbox
      scroller.addEventListener("click", (e) => {
        const hit = e.target.closest("[data-lb]");
        if (!hit) return;
        const i = Number(hit.dataset.lb);
        App.lightbox.open(viewable.map((it) => ({ src: it.src, alt: it.alt, ratio: it.ratio, caption: it.caption, date: it.date })), i);
      });

      const cleanups = [dragScroll(scroller, "x")];

      let lastW = 0, lastH = 0;
      const ro = new ResizeObserver(() => {
        if (scroller.clientWidth === lastW && scroller.clientHeight === lastH) return;
        const ratio = L ? scroller.scrollLeft / L : 1;
        lastW = scroller.clientWidth; lastH = scroller.clientHeight;
        build();
        scroller.scrollLeft = ratio * L;
        onScroll();
      });
      ro.observe(scroller);

      cleanups.push(() => { ro.disconnect(); scroller.removeEventListener("wheel", onWheel); });
      return () => cleanups.forEach((fn) => fn());
    },
  };
})();
