/* ==========================================================================
   js/case-study.js: /projects/<slug> — each project opens as an article.
   The folder widens from a square into a wide rectangle (see
   .folder[data-view="project"] in styles.css) and the content is laid out
   like a blog post: a title block, a reading measure for text, wider
   figures, numbered sections, and previous / next at the end.
   Block types are documented at the top of the projects list in content.js.
   ========================================================================== */
(() => {
  "use strict";
  const { $, esc, txt, pad2, ph, href, asset, paras, coverOf } = App;

  /* "4 min read": prose at ~220 wpm, code counted at a quarter of that */
  function readingTime(p) {
    const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
    let n = words(p.summary);
    (p.blocks || []).forEach((b) => {
      n += words(b.text) + words(b.caption);
      if (b.type === "code") n += Math.round(words(b.code) / 4);
    });
    return Math.max(1, Math.round(n / 220));
  }

  const caption = (c) => (c ? `<figcaption class="pb-cap">${txt(c)}</figcaption>` : "");

  function block(b, ctx) {
    switch (b.type) {
      case "image":
        return `<figure class="pb pb-figure pb--wide">${ph(b, { natural: true })}${caption(b.caption)}</figure>`;
      case "diagram":
        return `<figure class="pb pb-figure pb-figure--board pb--wide">${ph(b, { natural: true })}${caption(b.caption)}</figure>`;
      case "pair":
        return `<div class="pb pb-pair pb--wide">${(b.images || []).slice(0, 2).map((im) =>
          `<figure class="pb-figure">${ph(im, { natural: true })}${caption(im.caption)}</figure>`).join("")}</div>`;
      case "section": {
        const n = ++ctx.section;
        return `<section class="pb pb-section pb--text">
          <h2 class="pb-h2"><span class="pb-h2__n">${pad2(n)}</span>${txt(b.label)}</h2>
          ${b.text ? `<div class="pb-prose">${paras(b.text)}</div>` : ""}
        </section>`;
      }
      case "code":
        return `<figure class="pb pb-code pb--text">
          <figcaption class="pb-code__bar"><span>${esc(b.lang || "code")}</span>${b.file ? `<span class="pb-code__file">${esc(b.file)}</span>` : ""}</figcaption>
          <pre tabindex="0"><code>${esc(String(b.code || "").replace(/^\s*\n|\s+$/g, ""))}</code></pre>
        </figure>`;
      case "video": {
        // a YouTube link / id (embedded, privacy-friendly domain) or a local video file
        const yt = String(b.src || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/) ||
          (/^[\w-]{11}$/.test(b.src || "") ? [0, b.src] : null);
        const style = `style="aspect-ratio:${esc(String(b.ratio || "16/9").replace("/", " / "))}"`;
        // opened as a local file, YouTube refuses to embed (error 153): link out instead
        const media = yt && location.protocol === "file:"
          ? `<a class="mono-link pb-video__fallback" href="https://www.youtube.com/watch?v=${yt[1]}" target="_blank" rel="noopener">Watch on YouTube <span aria-hidden="true">→</span></a>`
          : yt
          ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(b.alt || "Video")}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
          : b.src ? `<video src="${esc(asset(b.src))}" controls playsinline preload="metadata"${b.poster ? ` poster="${esc(asset(b.poster))}"` : ""}></video>` : "";
        return `<figure class="pb pb-video pb--wide"><div class="pb-video__frame" ${style}>${media}</div>${caption(b.caption)}</figure>`;
      }
      case "links":
        return `<p class="pb pb-links pb--text">${(b.items || []).map((l) =>
          `<a class="pb-link" href="${esc(asset(l.href))}" target="_blank" rel="noopener">${txt(l.label)} <span aria-hidden="true">↗</span></a>`).join("")}</p>`;
      default:
        return "";
    }
  }

  // previous / next card at the end of the article
  function pager(p, dir) {
    if (!p) return "";
    const label = dir === "prev" ? '<span aria-hidden="true">←</span> Previous' : 'Next <span aria-hidden="true">→</span>';
    return `<a class="pager__item pager__item--${dir}" href="${esc(href("projects/" + p.slug))}">
      <span class="pager__label">${label}</span>
      <span class="pager__thumb">${ph(coverOf(p), { ratio: "4/3" })}</span>
      <span class="pager__name">${txt(p.title)}</span>
      <span class="pager__cat">${txt(p.category)}</span>
    </a>`;
  }

  App.views.project = {
    render(route) {
      const P = SITE.projects;
      const i = P.findIndex((p) => p.slug === route.slug);
      const p = P[i];
      const prev = P[(i - 1 + P.length) % P.length];
      const next = P[(i + 1) % P.length];
      const category = String(p.category || "").replace(/^\((.*)\)$/, "$1");
      const metaItems = [
        ...(p.meta || []),
        ...(p.year ? [{ label: "Year", value: p.year }] : []),
        { label: "Reading time", value: `${readingTime(p)} min` },
      ];
      const meta = metaItems.map((m) => `<div><dt>${txt(m.label)}</dt><dd>${txt(m.value)}</dd></div>`).join("");
      const ctx = { section: 0 };
      const blocks = (p.blocks || []).map((b) => block(b, ctx)).join("");
      // with only two projects, prev and next are the same page: show one "next" card
      const foot = P.length < 2 ? "" : `
        <footer class="post-foot">
          <div class="pager${P.length === 2 ? " pager--single" : ""}">
            ${P.length === 2 ? pager(next, "next") : pager(prev, "prev") + pager(next, "next")}
          </div>
          <p class="post-foot__all"><a class="mono-link" href="${esc(href("projects"))}">Back to all projects</a></p>
        </footer>`;

      return {
        title: p.title,
        watermark: "Projects",
        html: `
        <div class="post-progress" aria-hidden="true"><span></span></div>
        <div class="post scroll-y">
          <div class="post__wrap">
            <nav class="post-nav" aria-label="Project">
              <a class="mono-link" href="${esc(href("projects"))}"><span aria-hidden="true">←</span> All projects</a>
              <span class="post-nav__pos">${pad2(i + 1)} <span aria-hidden="true">/</span> ${pad2(P.length)}</span>
            </nav>

            <header class="post-head">
              <p class="post-eyebrow">${category ? `<span>${txt(category)}</span>` : ""}${category && p.year ? '<span class="post-eyebrow__dot" aria-hidden="true">·</span>' : ""}${p.year ? `<span>${txt(p.year)}</span>` : ""}</p>
              <h1 class="post-title" data-focus tabindex="-1">${txt(p.title)}</h1>
              <p class="post-lede">${txt(p.summary)}</p>
              ${meta ? `<dl class="post-meta">${meta}</dl>` : ""}
            </header>

            <div class="post-body">${blocks}</div>
            ${foot}
          </div>
        </div>`,
      };
    },

    mount(el) {
      const scroller = $(".post", el);
      const bar = $(".post-progress span", el);
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
