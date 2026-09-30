/* ==========================================================================
   js/projects.js: Projects page.
   GRID: two staggered columns that loop forever (rendered 3×, scrollTop is
         silently reset when you drift into the first or last copy).
   LIST: a dense index that also loops, with a preview image that follows
         the cursor.
   The chosen view and scroll position are remembered (in memory) so coming
   back from a case study puts you where you were.
   ========================================================================== */
(() => {
  "use strict";
  const { $, $$, esc, txt, pad2, ph, href, ratioNum, MOTION, reduced, finePointer, dragScroll, markLoaded } = App;

  const state = (App.state.projects = App.state.projects || { view: "grid", scroll: { grid: null, list: null } });

  // Grid tuning (fractions of the scroller width, px otherwise)
  const GRID = {
    cardW: 0.35,        // card width
    cardWMobile: 0.42,
    colX: [0.05, 0.53], // left edge of each column
    stagger: 0.4,       // right column pushed down by this × card height
    gap: 56,            // vertical space between rows
    numH: 22,           // "(01)" line above the image
    labelH: 62,         // name + category under the image
  };

  App.views.projects = {
    render() {
      return {
        title: "Projects",
        watermark: "Projects",
        html: `
        <header class="proj-head">
          <h1 class="display" data-melt data-focus tabindex="-1">Projects</h1>
          <div class="toggle" role="group" aria-label="Project layout">
            <button type="button" class="mono-link" data-set-view="grid" aria-pressed="${state.view === "grid"}">Grid</button>
            <button type="button" class="mono-link" data-set-view="list" aria-pressed="${state.view === "list"}">List</button>
          </div>
        </header>
        <div class="proj-scroll" data-drag tabindex="-1">
          <div class="proj-track"></div>
        </div>
        <div class="list-preview" aria-hidden="true"></div>`,
      };
    },

    mount(el) {
      const P = SITE.projects || [];
      const scroller = $(".proj-scroll", el);
      const track = $(".proj-track", el);
      const preview = $(".list-preview", el);
      let unitH = 0;
      const cleanups = [dragScroll(scroller, "y")];

      const cardLink = (p, n, extra = "") => `href="${esc(href("projects/" + p.slug))}" ${extra}`;

      /* ---- GRID --------------------------------------------------------- */
      function buildGrid() {
        const W = scroller.clientWidth;
        const H = scroller.clientHeight;
        const mobile = W < 560;
        const cw = Math.round(W * (mobile ? GRID.cardWMobile : GRID.cardW));
        // odd project count → use the list twice per unit so columns repeat cleanly
        const base = P.length % 2 ? [...P, ...P] : P.slice();
        const h = (p) => GRID.numH + cw / ratioNum(p.cover?.ratio || "4/5") + GRID.labelH;
        const avg = base.reduce((s, p) => s + h(p), 0) / base.length;
        const off = Math.round(avg * GRID.stagger);
        const rowsH = (list) => {
          let t = 0;
          for (let r = 0; r < list.length; r += 2) t += Math.max(h(list[r]), list[r + 1] ? h(list[r + 1]) : 0) + GRID.gap;
          return t;
        };
        let unit = base.slice();
        while (rowsH(unit) < H + off) unit = unit.concat(base);   // a unit must outgrow the viewport
        unitH = rowsH(unit);

        let y = 0, html = "";
        for (let c = 0; c < 3; c++) {
          html += `<div class="copy"${c === 1 ? "" : ' inert aria-hidden="true"'}>`;
          for (let r = 0; r < unit.length; r += 2) {
            [unit[r], unit[r + 1]].forEach((p, col) => {
              if (!p) return;
              const n = P.indexOf(p) + 1;
              const top = y + (col ? off : 0);
              html += `<a class="card" ${cardLink(p, n)} style="left:${Math.round(W * GRID.colX[col])}px;top:${Math.round(top)}px;width:${cw}px">
                <span class="card__num">(${pad2(n)})</span>
                <span class="card__img">${ph(p.cover, { ratio: p.cover?.ratio || "4/5" })}</span>
                <span class="hl card__name">${txt(p.title)}</span>
                <span class="card__cat">${txt(p.category)}</span>
              </a>`;
            });
            y += Math.max(h(unit[r]), unit[r + 1] ? h(unit[r + 1]) : 0) + GRID.gap;
          }
          html += "</div>";
        }
        track.className = "proj-track proj-track--grid";
        track.style.height = `${Math.round(y + off)}px`;
        track.innerHTML = html;
      }

      /* ---- LIST --------------------------------------------------------- */
      function buildList() {
        const H = scroller.clientHeight;
        const row = (p) => {
          const n = P.indexOf(p) + 1;
          return `<li><a class="prow" ${cardLink(p, n, `data-i="${n - 1}"`)}>
            <span class="prow__thumb">${ph(p.cover, { ratio: "1/1" })}</span>
            <span class="prow__num">(${pad2(n)})</span>
            <span class="prow__name">${txt(p.title)}</span>
            <span class="prow__cat">${txt(p.category)}</span>
          </a></li>`;
        };
        // repeat the list until one copy is taller than the viewport (rows ≈ 27px)
        const rowH = App.isMobile() ? 45 : 27;
        const reps = Math.max(1, Math.ceil((H + 40) / Math.max(1, P.length * rowH)));
        const unit = Array.from({ length: reps }, () => P).flat();
        track.className = "proj-track proj-track--list";
        track.style.height = "";
        track.innerHTML = [0, 1, 2].map((c) =>
          `<ol class="plist copy"${c === 1 ? "" : ' inert aria-hidden="true"'}>${unit.map(row).join("")}</ol>`).join("");
        unitH = $$(".copy", track)[1].offsetTop - $$(".copy", track)[0].offsetTop;
      }

      /* ---- build + restore scroll -------------------------------------- */
      function build(keepRatio) {
        const ratio = keepRatio && unitH ? scroller.scrollTop / unitH : null;
        if (!P.length) { track.innerHTML = ""; unitH = 0; return; }
        if (state.view === "list") buildList(); else buildGrid();
        markLoaded(track);
        const saved = state.scroll[state.view];
        scroller.scrollTop = ratio !== null ? ratio * unitH : saved !== null ? saved : unitH;
        wrap();
      }

      // silently jump by one copy when drifting into the first or last copy
      function wrap() {
        if (!unitH) return;
        const s = scroller.scrollTop;
        if (s < unitH * 0.5) scroller.scrollTop = s + unitH;
        else if (s > unitH * 1.5) scroller.scrollTop = s - unitH;
      }
      scroller.addEventListener("scroll", wrap, { passive: true });

      /* ---- GRID / LIST toggle ------------------------------------------ */
      const toggle = $(".toggle", el);
      toggle.addEventListener("click", (e) => {
        const b = e.target.closest("[data-set-view]");
        if (!b || b.dataset.setView === state.view) return;
        state.scroll[state.view] = scroller.scrollTop;
        state.view = b.dataset.setView;
        $$("[data-set-view]", toggle).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        hidePreview();
        build(false);
      });

      /* ---- list preview that follows the cursor ------------------------- */
      let tx = 0, ty = 0, px = 0, py = 0, raf = 0, shown = -1, visible = false;
      const follow = () => {
        const k = reduced() ? 1 : MOTION.previewLerp;
        px += (tx - px) * k;
        py += (ty - py) * k;
        preview.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, calc(-100% - 18px))`;
        raf = visible ? requestAnimationFrame(follow) : 0;
      };
      function hidePreview() {
        visible = false; shown = -1;
        preview.classList.remove("is-on");
      }
      const onMove = (e) => {
        if (state.view !== "list" || !finePointer() || App.isMobile()) return;
        const row = e.target.closest(".prow");
        if (!row) { hidePreview(); return; }
        const r = el.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        const i = Number(row.dataset.i);
        if (i !== shown) {                       // instant swap between rows
          shown = i;
          const cover = P[i].cover || {};
          preview.innerHTML = ph(cover, { ratio: cover.ratio || "4/5" });
          markLoaded(preview);
        }
        if (!visible) { visible = true; px = tx; py = ty; preview.classList.add("is-on"); }
        if (!raf) raf = requestAnimationFrame(follow);
      };
      scroller.addEventListener("pointermove", onMove);
      scroller.addEventListener("pointerleave", hidePreview);

      /* ---- resize ------------------------------------------------------ */
      let lastW = 0, lastH = 0;
      const ro = new ResizeObserver(() => {
        if (scroller.clientWidth === lastW && scroller.clientHeight === lastH) return;
        const firstBuild = !lastW;
        lastW = scroller.clientWidth; lastH = scroller.clientHeight;
        build(!firstBuild);
      });
      ro.observe(scroller);

      cleanups.push(() => {
        state.scroll[state.view] = scroller.scrollTop;
        ro.disconnect();
        cancelAnimationFrame(raf);
      });
      return () => cleanups.forEach((f) => f());
    },
  };
})();
