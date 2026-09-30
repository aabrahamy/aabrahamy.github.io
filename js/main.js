/* ==========================================================================
   js/main.js: boots the site (tabs, paper traces, first render).
   Loaded last, after every view has registered itself in App.views.
   ========================================================================== */
(() => {
  "use strict";
  const { $, $$, esc, href, drawTraces, debounce, hooks } = App;

  /* ---- nav pins: hardware-style links (pad → trace → via → silkscreen label) ------
     Each pin is a real <a href>, so hover shows the URL and middle-click works.
     Trace length, spacing, colors and glow are the --pin-* variables in styles.css. */
  const TABS = [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "playground", label: "Playground" },
    { id: "contact", label: "Contact" },
  ];
  const traceLen = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pin-trace")) || 40;

  // horizontal pin (desktop): pad on the folder edge, trace fanning up/down, via at the end
  function pinH(dy) {
    const c = 18, x1 = 10 + Math.max(4, (traceLen - 12) / 2), x2 = x1 + Math.abs(dy), xe = 10 + traceLen, ye = c + dy;
    const d = `M10 ${c} H${x1} L${x2} ${ye} H${xe}`;
    return `<svg class="pin__svg pin__svg--h" width="${xe + 6}" height="36" viewBox="0 0 ${xe + 6} 36" aria-hidden="true" focusable="false">
      <path class="pin__trace" d="${d}"/><path class="pin__sig" d="${d}" pathLength="100"/>
      <rect class="pin__pad" x="0.5" y="${c - 3}" width="10" height="6"/>
      <circle class="pin__via" cx="${xe}" cy="${ye}" r="3.5"/><circle class="pin__dot" cx="${xe}" cy="${ye}" r="1.5"/></svg>`;
  }
  // vertical pin (phones): via on top, short trace down to a pad on the folder's top edge
  function pinV(dx) {
    const d = `M12 23 V17 L${12 + dx} 12 V6`;
    return `<svg class="pin__svg pin__svg--v" width="24" height="33.5" viewBox="0 0 24 33.5" aria-hidden="true" focusable="false">
      <path class="pin__trace" d="${d}"/><path class="pin__sig" d="${d}" pathLength="100"/>
      <rect class="pin__pad" x="9" y="23.5" width="6" height="10"/>
      <circle class="pin__via" cx="${12 + dx}" cy="6" r="3.5"/><circle class="pin__dot" cx="${12 + dx}" cy="6" r="1.5"/></svg>`;
  }
  $("#pins").innerHTML = TABS.map((t, i) => {
    const s = i - 1.5;          // fan out from the middle: -1.5, -0.5, +0.5, +1.5 (equal gaps for pads and labels)
    return `<a class="pin" href="${esc(href(t.id))}" data-tab="${t.id}" style="--i:${i};--dy:${s * 8}px" aria-label="${t.label} section">${pinH(s * 8)}${pinV(s * 3.5)}<span class="pin__label" aria-hidden="true">${String(i + 1).padStart(2, "0")} ${t.label}</span></a>`;
  }).join("");

  hooks.beforeRender.push((route) => {
    $$(".pin").forEach((t) => {
      t.classList.remove("is-firing");
      if (t.dataset.tab === route.tab) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
  });

  // click: a short pulse travels along the trace INTO the folder, then the page changes
  const FIRE_MS = 110;   // keep in sync with pin-fire in styles.css
  $("#pins").addEventListener("click", (e) => {
    const a = e.target.closest(".pin");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute("aria-current")) return;                    // already here: normal router handling
    e.preventDefault();
    e.stopPropagation();
    const go = () => App.navigate(a.dataset.tab);
    if (App.reduced()) { go(); return; }
    a.classList.add("is-firing");
    setTimeout(go, FIRE_MS);
  });

  /* ---- static labels from content.js ----------------------------------- */
  $("#annotationText").textContent = SITE.about.tabNote || "";

  /* ---- "my projects" note: sits right of the 02 PROJECTS label, arrow pointing at it.
     Shown on About only, and only if it fits beside the pins (hidden otherwise). */
  const note = $(".annotation");
  function placeNote() {
    const label = $('.pin[data-tab="projects"] .pin__label');
    if (!note || !label || App.isMobile()) return;
    const fr = $("#folder").getBoundingClientRect(), lr = label.getBoundingClientRect();
    const left = lr.right - fr.left + 22, top = lr.top - fr.top + lr.height / 2 - 27;
    note.style.left = left + "px";
    note.style.top = top + "px";
    note.classList.toggle("is-fit", lr.right + 22 + note.offsetWidth + 16 < innerWidth);
  }
  window.addEventListener("resize", debounce(placeNote, 100));
  hooks.afterRender.push(placeNote);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeNote);

  /* ---- PCB traces on the paper (redrawn per section + on resize) -------- */
  const page = $("#page");
  let traceKey = "about";
  const redraw = () => drawTraces($("#traces"), page.clientWidth, page.clientHeight, traceKey);
  hooks.afterRender.push((el, route) => { traceKey = route.tab; redraw(); });
  if ("ResizeObserver" in window) new ResizeObserver(debounce(redraw, 120)).observe(page);

  /* ---- skip link → focus the current page's heading --------------------- */
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-skip]")) return;
    e.preventDefault();
    const h = $("[data-focus]", App.currentEl);
    if (h) h.focus();
  });

  App.render();
})();
