/* ==========================================================================
   js/case-study.js: /projects/<slug> editorial case studies.
   Block types are documented at the top of the projects list in content.js.
   ========================================================================== */
(() => {
  "use strict";
  const { $, esc, txt, pad2, ph, href, asset, paras } = App;

  function block(b) {
    switch (b.type) {
      case "image":
        return `<figure class="cb cb-image">${ph(b, { natural: true })}</figure>`;
      case "pair":
        return `<div class="cb cb-pair">${(b.images || []).slice(0, 2).map((im) => `<figure>${ph(im, { natural: true })}</figure>`).join("")}</div>`;
      case "section":
        return `<section class="cb cb-section case-row">
          <div class="case-label"><h2 class="hl">${txt(b.label)}</h2></div>
          <div class="case-body just">${paras(b.text)}</div>
        </section>`;
      case "code":
        return `<figure class="cb cb-code">
          <figcaption class="cb-code__lang">${esc(b.lang || "code")}</figcaption>
          <pre tabindex="0"><code>${esc(String(b.code || "").replace(/^\s*\n|\s+$/g, ""))}</code></pre>
        </figure>`;
      case "diagram":
        return `<figure class="cb cb-diagram">${ph(b, { natural: true })}${b.caption ? `<figcaption>${txt(b.caption)}</figcaption>` : ""}</figure>`;
      case "video": {
        // a YouTube link / id (embedded, privacy-friendly domain) or a local video file
        const yt = String(b.src || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/) ||
          (/^[\w-]{11}$/.test(b.src || "") ? [0, b.src] : null);
        const style = `style="aspect-ratio:${esc(String(b.ratio || "16/9").replace("/", " / "))}"`;
        // opened as a local file, YouTube refuses to embed (error 153): link out instead
        const media = yt && location.protocol === "file:"
          ? `<a class="mono-link cb-video__fallback" href="https://www.youtube.com/watch?v=${yt[1]}" target="_blank" rel="noopener">Watch on YouTube <span aria-hidden="true">→</span></a>`
          : yt
          ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(b.alt || "Video")}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
          : b.src ? `<video src="${esc(asset(b.src))}" controls playsinline preload="metadata"${b.poster ? ` poster="${esc(asset(b.poster))}"` : ""}></video>` : "";
        return `<figure class="cb cb-video"><div class="cb-video__frame" ${style}>${media}</div>${b.caption ? `<figcaption>${txt(b.caption)}</figcaption>` : ""}</figure>`;
      }
      case "links":
        return `<p class="cb cb-links">${(b.items || []).map((l) =>
          `<a class="mono-link" href="${esc(asset(l.href))}" target="_blank" rel="noopener">${txt(l.label)} <span aria-hidden="true">→</span></a>`).join("")}</p>`;
      default:
        return "";
    }
  }

  App.views.project = {
    render(route) {
      const P = SITE.projects;
      const i = P.findIndex((p) => p.slug === route.slug);
      const p = P[i];
      const next = P[(i + 1) % P.length];
      const meta = (p.meta || []).map((m) => `<div><dt>${txt(m.label)}</dt><dd>${txt(m.value)}</dd></div>`).join("");

      return {
        title: p.title,
        watermark: "Projects",
        html: `
        <div class="case scroll-y">
          <div class="case-top">
            <span class="case-pos">(${pad2(i + 1)} / ${pad2(P.length)})</span>
            <a class="mono-link" href="${esc(href("projects"))}"><span aria-hidden="true">←</span> All projects</a>
          </div>
          <h1 class="case-title" data-focus tabindex="-1">${txt(p.title)}</h1>
          <p class="case-kicker">${txt(p.category)}</p>

          <section class="case-row case-intro">
            <div class="case-label"><h2 class="hl">Overview</h2></div>
            <div class="case-body">
              <p class="just">${txt(p.summary)}</p>
              ${meta ? `<dl class="case-meta">${meta}</dl>` : ""}
            </div>
          </section>

          <div class="case-blocks">${(p.blocks || []).map(block).join("")}</div>

          ${P.length > 1 ? `
          <a class="case-next" href="${esc(href("projects/" + next.slug))}">
            <span class="case-next__label mono-link">Next project <span aria-hidden="true">→</span></span>
            <span class="case-next__img">${ph(next.cover, { ratio: next.cover?.ratio || "4/5" })}</span>
            <span class="case-next__name">${txt(next.title)}</span>
          </a>` : ""}
        </div>
        <div class="case-progress" aria-hidden="true"><span></span></div>`,
      };
    },

    mount(el) {
      const scroller = $(".case", el);
      const bar = $(".case-progress span", el);
      const update = () => {
        const max = scroller.scrollHeight - scroller.clientHeight;
        bar.style.transform = `scaleX(${max > 0 ? scroller.scrollTop / max : 0})`;
      };
      scroller.addEventListener("scroll", update, { passive: true });
      update();
      return () => scroller.removeEventListener("scroll", update);
    },
  };
})();
