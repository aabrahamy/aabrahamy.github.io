/* ==========================================================================
   js/about.js: About page: cycling stamp portrait, slide-over bio sheet,
   numbered tag staircase, live clock footer. Content: SITE.about.
   ========================================================================== */
(() => {
  "use strict";
  const { $, esc, txt, pad2, ph, href, asset, MOTION, reduced } = App;

  App.views.about = {
    render() {
      const a = SITE.about;
      const s = a.sheet || {};
      const tagColors = [1, 2, 3, 4];

      // staircase: row i puts its number in column i+1 and its tag in i+2
      const tags = (a.tags || []).map((t, i) => {
        const c = Math.min(i, 3);
        return `<li class="ftag">
          <span class="ftag__num" style="grid-column:${c + 1}">(${pad2(i + 1)})</span>
          <span class="ftag__label" style="grid-column:${c + 2} / span 2;--hl:var(--tag-${tagColors[i % 4]})">${txt(t)}</span>
          ${i === 0 && a.year ? `<span class="ftag__year">(${esc(a.year)})</span>` : ""}
        </li>`;
      }).join("");

      // placeholder [EDIT] markers are stripped inside the sheet's lists (no chips in real lists)
      const clean = (str) => esc(str).replace(/\[EDIT\]\s*/g, "");
      const highlights = (s.highlights || []).map((h) => `<li>${h.href
        ? `<a class="mono-link" href="${esc(asset(h.href))}" target="_blank" rel="noopener">${clean(h.label)} <span aria-hidden="true">→</span></a>`
        : clean(h.label)}</li>`).join("");

      return {
        title: SITE.tagline,
        watermark: "About",
        html: `
        <div class="about scroll-y">
          <h1 class="display about-name" data-melt data-focus tabindex="-1">${esc(SITE.name)}</h1>
          <div class="about-intro">
            <p class="lede">${txt(a.intro)}</p>
            <a class="mono-link" href="${esc(href("contact"))}">${esc(a.ctaLabel || "Let's talk")} <span aria-hidden="true">→</span></a>
          </div>
          <figure class="stamp-fig">
            <div class="stamp-shadow"><div class="stamp">${ph({ src: (typeof (a.stampPhotos || [])[0] === "string" ? a.stampPhotos[0] : (a.stampPhotos || [])[0]?.src), alt: a.stampAlt, ratio: a.stampRatio || "4/5" })}</div></div>
            ${a.stampCaption ? `<figcaption class="hand stamp-cap">${txt(a.stampCaption)}</figcaption>` : ""}
          </figure>
          <ol class="ftags" aria-label="Focus areas">${tags}</ol>
        </div>

        <footer class="strip-foot">
          <span>${esc(a.location)} <span aria-hidden="true">•</span> <time data-clock>--:--:-- --</time></span>
          <span>${esc(a.status)}</span>
        </footer>

        <div class="bio-scrim" data-close-sheet aria-hidden="true"></div>
        <!-- The note and the sheet are ONE piece of paper: it grows from the note into the sheet -->
        <div class="clipnote" id="clipNote">
          <div class="clipnote__paper">
            <div class="clipnote__body" id="bioSheet" role="region" aria-label="About me" tabindex="-1">
              <button class="sheet-close mono-link" type="button" data-close-sheet>✕ Close</button>
              <p class="bio-sheet__intro">${txt(s.intro)}</p>
              <div class="bio-sheet__lists">
                <div><h2 class="hl">Highlights</h2><ul class="plain-list">${highlights}</ul></div>
              </div>
            </div>
          </div>
          <button class="clipnote__hit" type="button" aria-expanded="false" aria-controls="bioSheet"><span class="clipnote__label">${esc(a.noteLabel || "About me")}</span></button>
          <svg class="clipnote__clip" viewBox="0 0 20 58" fill="none" stroke="#8d9196" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M7 16v28a3.5 3.5 0 0 0 7 0V9a5.5 5.5 0 0 0-11 0v38a7.5 7.5 0 0 0 15 0V17"/>
          </svg>
        </div>`,
      };
    },

    mount(el) {
      const a = SITE.about;
      const cleanups = [];

      /* ---- 6a. cycling stamp: hard cuts, faster while hovered ------------ */
      // each entry is a path string, or { src, position, zoom } to control the crop (see content.js)
      const photos = (a.stampPhotos || []).map((p) => (typeof p === "string" ? { src: p } : p));
      const fig = $(".stamp-fig", el);
      const frame = $(".stamp .ph", el);
      const label = $(".ph__label span", frame);
      const first = $("img", frame);
      // Every photo is its own <img>, all stacked and loaded up front. Showing the
      // next one is just a visibility swap (a hard cut), so the stamp never blanks
      // out while a new file loads.
      const imgs = photos.map((p, idx) => {
        const im = document.createElement("img");
        im.className = "stamp-img" + (idx === 0 ? " is-active" : "");
        im.alt = idx === 0 ? (a.stampAlt || "") : "";
        im.decoding = "async";
        im.draggable = false;
        im.src = asset(p.src);
        // crop: object-position picks which part of the photo stays inside the square
        const pos = p.position || "50% 50%";
        im.style.objectPosition = pos;
        im.style.transformOrigin = pos;
        if (p.zoom > 1) im.style.transform = `scale(${p.zoom})`;
        return im;
      });
      if (first) first.remove();
      imgs.forEach((im) => frame.appendChild(im));
      let i = 0, timer = 0, hovered = false;
      const show = () => {
        imgs.forEach((im, k) => im.classList.toggle("is-active", k === i));
        label.textContent = photos[i].src;
      };
      const loop = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { i = (i + 1) % photos.length; show(); loop(); },
          hovered ? MOTION.stampHover : MOTION.stampEvery);
      };
      if (photos.length > 1 && !reduced()) {
        const on = () => { hovered = true; loop(); };
        const off = () => { hovered = false; loop(); };
        fig.addEventListener("mouseenter", on);
        fig.addEventListener("mouseleave", off);
        loop();
        cleanups.push(() => { clearTimeout(timer); fig.removeEventListener("mouseenter", on); fig.removeEventListener("mouseleave", off); });
      }

      /* ---- 6b. the "About me" note grows into the bio sheet ------------------
         One element, animated FLIP-style: its width and height go from the note's
         box to the sheet's box with the top-left corner pinned under the paperclip
         (the right edge leads, the bottom edge trails a little), while the tilt
         eases to 0. Content fades in late. Closing plays it backwards. */
      const note = $("#clipNote", el);
      const hit = $(".clipnote__hit", note);
      const body = $(".clipnote__body", note);
      const page = $("#page");
      const root = document.documentElement;
      const cssNum = (name, fallback) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || fallback;
      const cssStr = (name) => getComputedStyle(root).getPropertyValue(name).trim();
      body.inert = true;
      let isOpen = false, busy = false, anims = [];

      function sizeSheet() {                       // final sheet size, in px
        const pw = page.clientWidth, ph = page.clientHeight;
        const left = note.offsetLeft, top = note.offsetTop;
        const W = App.isMobile() ? pw - left * 2 : Math.min(pw - left, Math.round(pw * cssNum("--sheet-width", 0.88)));
        // the sheet stops above the footer strip (location + clock), so those stay fully visible
        const foot = $(".strip-foot", el);
        const H = ph - top - (foot ? foot.offsetHeight : 40) - 6;
        note.style.setProperty("--sheet-w", W + "px");
        note.style.setProperty("--sheet-h", H + "px");
        return [W, H];
      }
      const finish = () => { anims.forEach((x) => x.cancel()); anims = []; };

      async function open() {
        if (busy || isOpen) return;
        busy = true;
        const [W, H] = sizeSheet();
        const w0 = note.offsetWidth, h0 = note.offsetHeight;
        const tilt = cssStr("--note-tilt") || "-2deg";
        el.classList.add("is-sheet-open");
        note.classList.add("is-open");
        hit.setAttribute("aria-expanded", "true");
        body.inert = false;
        if (reduced()) {
          anims = [note.animate([{ opacity: 0 }, { opacity: 1 }], { duration: MOTION.pageFade, fill: "both" })];
        } else {
          const M = MOTION, D = M.sheetMs, o = (delay) => ({ duration: D, delay, easing: M.sheetEase, fill: "both" });
          anims = [
            note.animate([{ width: w0 + "px" }, { width: W + "px" }], o(0)),                        // right edge leads…
            note.animate([{ height: h0 + "px" }, { height: H + "px" }], o(M.sheetStagger)),          // …bottom edge trails
            note.animate([{ transform: `rotate(${tilt})` }, { transform: "rotate(0deg)" }], o(0)),
            body.animate([{ opacity: 0, transform: `translateY(${M.sheetContentDrift}px)` }, { opacity: 1, transform: "translateY(0)" }],
              { duration: M.sheetContentMs, delay: (D + M.sheetStagger) * M.sheetContentAt, easing: "ease-out", fill: "both" }),
          ];
        }
        try { await Promise.all(anims.map((x) => x.finished)); } catch { /* cancelled */ }
        finish();
        isOpen = true; busy = false;
        body.focus({ preventScroll: true });
      }

      async function close(returnFocus = true) {
        if (busy || !isOpen) return;
        busy = true; isOpen = false;
        const W = note.offsetWidth, H = note.offsetHeight;
        const w0 = cssNum("--note-w", 150), h0 = cssNum("--note-h", 46);
        const tilt = cssStr("--note-tilt") || "-2deg";
        el.classList.remove("is-sheet-open");
        hit.setAttribute("aria-expanded", "false");
        body.inert = true;
        if (reduced()) {
          anims = [note.animate([{ opacity: 1 }, { opacity: 0 }], { duration: MOTION.pageFade, fill: "both" })];
          try { await anims[0].finished; } catch { /* cancelled */ }
        } else {
          const M = MOTION, D = M.sheetMs;
          // content fades out first…
          const out = body.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: `translateY(${M.sheetContentDrift}px)` }],
            { duration: 180, easing: "ease-in", fill: "both" });
          anims = [out];
          try { await out.finished; } catch { /* cancelled */ }
          // …then the paper shrinks back: the exact reverse (bottom edge leads, right edge trails)
          const o = (delay) => ({ duration: D, delay, easing: M.sheetEaseClose, fill: "both" });
          anims.push(
            note.animate([{ height: H + "px" }, { height: h0 + "px" }], o(0)),
            note.animate([{ width: W + "px" }, { width: w0 + "px" }], o(M.sheetStagger)),
            note.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${tilt})` }], o(0)));
          try { await Promise.all(anims.slice(1).map((x) => x.finished)); } catch { /* cancelled */ }
        }
        note.classList.remove("is-open");
        finish();
        busy = false;
        if (returnFocus) hit.focus({ preventScroll: true });
      }

      const onHit = () => (isOpen ? close() : open());
      const onClose = (e) => { if (e.target.closest("[data-close-sheet]")) close(); };
      const onKey = (e) => { if (e.key === "Escape" && isOpen && !App.lightbox.isOpen) close(); };
      hit.addEventListener("click", onHit);
      el.addEventListener("click", onClose);
      document.addEventListener("keydown", onKey);
      const ro = "ResizeObserver" in window ? new ResizeObserver(() => { if (isOpen) sizeSheet(); }) : null;
      if (ro) ro.observe(page);
      cleanups.push(() => {
        hit.removeEventListener("click", onHit);
        document.removeEventListener("keydown", onKey);
        if (ro) ro.disconnect();
        finish();
      });


    },
  };
})();
