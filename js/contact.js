/* ==========================================================================
   js/contact.js: Contact page: intro + a bordered table of links, plus a
   copy-to-clipboard button for the email. All URLs come from content.js.
   ========================================================================== */
(() => {
  "use strict";
  const { $, esc, txt, asset } = App;

  App.views.contact = {
    render() {
      const c = SITE.contact;
      const L = SITE.links;
      // one row per link. arrow: "→" or "↗" (↗ = a file / portfolio in a new tab). Rows without a URL are skipped.
      const rows = [
        ["LinkedIn", L.linkedin, "→"],
        ["GitHub", L.github, "→"],
        ["Résumé", L.resume, "↗"],
        ["Photography", L.photography, "↗"],
      ].filter(([, u]) => u);

      return {
        title: "Contact",
        html: `
        <div class="contact scroll-y">
          <h1 class="display" data-melt data-focus tabindex="-1">Contact</h1>
          <p class="contact-lede">${txt(c.intro)}</p>

          <div class="ledger">
            ${rows.map(([label, u, arrow]) => `<a class="ledger__row" href="${esc(asset(u))}" target="_blank" rel="noopener">
              <span class="ledger__label">${label}</span><span class="ledger__arrow" aria-hidden="true">${arrow}</span></a>`).join("")}
            <div class="ledger__row ledger__row--email">
              <a class="ledger__mail" href="mailto:${esc(L.email)}"><span class="ledger__label">Email</span><span class="ledger__addr">${esc(L.email)}</span></a>
              <button type="button" class="copy-btn" data-copy="${esc(L.email)}"><span aria-hidden="true">⧉</span> <span class="copy-btn__label">Copy</span></button>
            </div>
          </div>
        </div>`,
      };
    },

    mount(el) {
      /* ---- copy email → "COPIED ✓" for 1.5s ---------------------------- */
      let t = 0;
      const onClick = async (e) => {
        const btn = e.target.closest("[data-copy]");
        if (!btn) return;
        const value = btn.dataset.copy;
        let ok = false;
        try { await navigator.clipboard.writeText(value); ok = true; } catch {
          const ta = Object.assign(document.createElement("textarea"), { value });
          ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta);
          ta.select();
          try { ok = document.execCommand("copy"); } catch { ok = false; }
          ta.remove();
        }
        const label = $(".copy-btn__label", btn);
        label.textContent = ok ? "Copied ✓" : "Press Ctrl+C";
        clearTimeout(t);
        t = setTimeout(() => { label.textContent = "Copy"; }, 1500);
      };
      el.addEventListener("click", onClick);
      return () => clearTimeout(t);
    },
  };
})();
