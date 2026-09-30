/* ==========================================================================
   js/pcb.js: a faint PCB on the black background + a pink cursor glow.
   • The board is one generated <svg id="pcb"> (fixed seed, so it always looks
     the same at a given window size), drawn BEHIND the folder.
   • Hovering a component (or coming within HOVER_PAD px) powers it on: it
     brightens, scales up slightly, and the traces connected to it light up
     with a pulse that travels away from it. Everything eases back after.
   • A soft pink glow (#cursorGlow) follows the cursor over the black area.
   Colors, glow strength, scale and timings: the --pcb-* / --glow-* variables
   at the top of styles.css, and the constants right below.
   ========================================================================== */
(() => {
  "use strict";
  const { $, rng, clamp, debounce, reduced } = App;

  /* ---- tune these -------------------------------------------------------- */
  const PCB_SEED = 7;        // change for a different (but still fixed) layout
  const HOVER_PAD = 20;      // px around a component that still counts as hovering
  const PULSE_MS = 600;      // signal pulse travelling along a lit trace
  const GLOW_LAG = 0.12;     // 0–1 per frame: how closely the glow follows the cursor
  const DENSITY = 1;         // 1 = default; 0.5 = sparser board, 1.5 = denser
  const FILL_RIGHT = 1.5;    // extra density for the strip right of the nav pins (0 = none)

  const NS = "http://www.w3.org/2000/svg";
  const svg = $("#pcb");
  const glow = $("#cursorGlow");
  const folder = $("#folder");
  if (!svg) return;

  const hoverCapable = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.matchMedia("(min-width: 768px)").matches;
  const f = (n) => +n.toFixed(1);

  /* ==========================================================================
     Component drawings. Each returns { w, h, html, pins, prefix }.
     A pin is { x, y, dx, dy }: where a trace attaches, and which way it leaves.
     ========================================================================== */
  const pad = (x, y, w, h) => `<rect class="pad" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`;

  function ic(cx, cy, { quad = false, nv = 4, nh = 4, pitch = 9, ring = false } = {}) {
    const pl = 6, pw = pitch > 10 ? 4.4 : 3.4;
    const bw = (quad ? nh * pitch : 30 + nv * 4) + 12;
    const bh = nv * pitch + 12;
    const x0 = cx - bw / 2, y0 = cy - bh / 2;
    let html = `<rect class="body" x="${f(x0)}" y="${f(y0)}" width="${f(bw)}" height="${f(bh)}" rx="2"/>`;
    const pins = [];
    for (let i = 0; i < nv; i++) {
      const y = y0 + 6 + pitch * i + pitch / 2;
      html += pad(x0 - pl, y - pw / 2, pl, pw) + pad(x0 + bw, y - pw / 2, pl, pw);
      pins.push({ x: x0 - pl, y, dx: -1, dy: 0 }, { x: x0 + bw + pl, y, dx: 1, dy: 0 });
    }
    if (quad) {
      for (let i = 0; i < nh; i++) {
        const x = x0 + 6 + pitch * i + pitch / 2;
        html += pad(x - pw / 2, y0 - pl, pw, pl) + pad(x - pw / 2, y0 + bh, pw, pl);
        pins.push({ x, y: y0 - pl, dx: 0, dy: -1 }, { x, y: y0 + bh + pl, dx: 0, dy: 1 });
      }
    }
    html += `<circle class="dot" cx="${f(x0 + 5.5)}" cy="${f(y0 + 5.5)}" r="1.7"/>`;   // pin 1
    if (ring) html += `<circle class="body" cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.min(bw, bh) * 0.2)}"/>`;
    return { w: bw + 2 * pl, h: bh + (quad ? 2 * pl : 0), html, pins, prefix: "U" };
  }

  function smd(cx, cy, vertical, prefix) {
    const L = 24, T = 8;
    const w = vertical ? T : L, h = vertical ? L : T;
    const x0 = cx - w / 2, y0 = cy - h / 2;
    let html, pins;
    if (!vertical) {
      html = pad(x0, y0, 6, T) + pad(x0 + L - 6, y0, 6, T) + `<rect class="body" x="${f(x0 + 6)}" y="${f(y0 + 1.5)}" width="${L - 12}" height="${T - 3}"/>`;
      pins = [{ x: x0, y: cy, dx: -1, dy: 0 }, { x: x0 + L, y: cy, dx: 1, dy: 0 }];
    } else {
      html = pad(x0, y0, T, 6) + pad(x0, y0 + L - 6, T, 6) + `<rect class="body" x="${f(x0 + 1.5)}" y="${f(y0 + 6)}" width="${T - 3}" height="${L - 12}"/>`;
      pins = [{ x: cx, y: y0, dx: 0, dy: -1 }, { x: cx, y: y0 + L, dx: 0, dy: 1 }];
    }
    return { w, h, html, pins, prefix };
  }

  function crystal(cx, cy) {
    const bw = 34, bh = 15, x0 = cx - bw / 2, y0 = cy - bh / 2;
    const html = `<rect class="body" x="${f(x0)}" y="${f(y0)}" width="${bw}" height="${bh}" rx="7.5"/>` +
      `<rect class="body" x="${f(cx - 9)}" y="${f(cy - 3.5)}" width="18" height="7" rx="3"/>` +
      pad(x0 - 5, cy - 4.5, 5, 9) + pad(x0 + bw, cy - 4.5, 5, 9);
    return { w: bw + 10, h: bh, html, pins: [{ x: x0 - 5, y: cy, dx: -1, dy: 0 }, { x: x0 + bw + 5, y: cy, dx: 1, dy: 0 }], prefix: "Y" };
  }

  function header(cx, cy, n, vertical, dirSign) {
    const pitch = 11, len = n * pitch;
    const w = vertical ? 14 : len, h = vertical ? len : 14;
    const x0 = cx - w / 2, y0 = cy - h / 2;
    let html = `<rect class="body" x="${f(x0 - 1)}" y="${f(y0 - 1)}" width="${w + 2}" height="${h + 2}" rx="1.5"/>`;
    const pins = [];
    for (let i = 0; i < n; i++) {
      const px = vertical ? cx : x0 + pitch * i + pitch / 2;
      const py = vertical ? y0 + pitch * i + pitch / 2 : cy;
      html += pad(px - 3.5, py - 3.5, 7, 7);
      pins.push(vertical ? { x: px + dirSign * 3.5, y: py, dx: dirSign, dy: 0 } : { x: px, y: py + dirSign * 3.5, dx: 0, dy: dirSign });
    }
    return { w, h, html, pins, prefix: "J" };
  }

  /* ==========================================================================
     Traces: only horizontal, vertical and 45° segments, with small rounded bends
     ========================================================================== */
  function rounded(pts, r = 5) {
    let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], b = pts[i], c = pts[i + 1];
      const l1 = Math.hypot(b.x - a.x, b.y - a.y), l2 = Math.hypot(c.x - b.x, c.y - b.y);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const p1 = { x: b.x - ((b.x - a.x) / l1) * rr, y: b.y - ((b.y - a.y) / l1) * rr };
      const p2 = { x: b.x + ((c.x - b.x) / l2) * rr, y: b.y + ((c.y - b.y) / l2) * rr };
      d += ` L${f(p1.x)} ${f(p1.y)} Q${f(b.x)} ${f(b.y)} ${f(p2.x)} ${f(p2.y)}`;
    }
    const z = pts[pts.length - 1];
    return d + ` L${f(z.x)} ${f(z.y)}`;
  }

  /* ==========================================================================
     Build the whole board
     ========================================================================== */
  let comps = [], grid = new Map();
  const CELL = 140;

  function build() {
    const W = innerWidth, H = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const rand = rng(PCB_SEED);
    const R = (a, b) => a + rand() * (b - a);
    const wide = W >= 768;

    // the folder (and its nav pins) fully covers the middle: nothing is placed there
    const fr = folder.getBoundingClientRect();
    const ex = { l: fr.left - 16, t: fr.top - (wide ? 16 : 70), r: fr.right + (wide ? 210 : 16), b: fr.bottom + 16 };
    const hitsFolder = (cx, cy, hw, hh) => cx + hw > ex.l && cx - hw < ex.r && cy + hh > ex.t && cy - hh < ex.b;

    // density: thin near the center, dense toward the edges and corners
    const edgeness = (x, y) => clamp(Math.max(Math.abs(x - W / 2) / (W / 2), Math.abs(y - H / 2) / (H / 2)), 0, 1);

    const placed = [];
    const counters = { U: 0, R: 0, C: 0, Y: 0, J: 0 };
    const items = [];   // { cx, cy, w, h, html, pins, label }

    const free = (cx, cy, w, h, margin = 14) =>
      !hitsFolder(cx, cy, w / 2 + 4, h / 2 + 4) &&
      cx - w / 2 > 6 && cx + w / 2 < W - 6 && cy - h / 2 > 6 && cy + h / 2 < H - 6 &&
      placed.every((p) => Math.abs(p.cx - cx) > (p.w + w) / 2 + margin || Math.abs(p.cy - cy) > (p.h + h) / 2 + margin);

    function place(make, tries = 60) {
      for (let t = 0; t < tries; t++) {
        const x = R(20, W - 20), y = R(20, H - 20);
        if (rand() > Math.pow(edgeness(x, y), 1.6) + 0.04) continue;
        const c = make(x, y);
        if (!free(x, y, c.w, c.h)) continue;
        return add(c, x, y);
      }
      return null;
    }
    function add(c, cx, cy) {
      placed.push({ cx, cy, w: c.w, h: c.h });
      const n = ++counters[c.prefix];
      const it = { ...c, cx, cy, id: items.length, label: c.prefix + n, traces: [], used: new Set() };
      items.push(it);
      return it;
    }

    // one larger chip near a corner
    const corner = Math.floor(rand() * 4);
    const bigN = 9;
    const big = ic(0, 0, { quad: true, nv: bigN, nh: bigN, pitch: 12, ring: true });
    const bx = corner % 2 ? W - 60 - big.w / 2 : 60 + big.w / 2;
    const by = corner < 2 ? 60 + big.h / 2 : H - 60 - big.h / 2;
    const bigC = ic(bx, by, { quad: true, nv: bigN, nh: bigN, pitch: 12, ring: true });
    if (free(bx, by, bigC.w, bigC.h)) add(bigC, bx, by);

    const area = (W * H) / 1000000 * DENSITY;
    for (let i = 0; i < Math.round(area * 7); i++) {
      place((x, y) => rand() < 0.5
        ? ic(x, y, { nv: 3 + Math.floor(rand() * 4) })
        : ic(x, y, { quad: true, nv: 3 + Math.floor(rand() * 3), nh: 3 + Math.floor(rand() * 3) }));
    }
    for (let i = 0; i < Math.round(area * 30); i++) {
      const isC = rand() < 0.45, vert = rand() < 0.5;
      place((x, y) => smd(x, y, vert, isC ? "C" : "R"));
    }
    for (let i = 0; i < Math.round(area * 1.6) + 1; i++) place((x, y) => crystal(x, y));
    for (let i = 0; i < Math.round(area * 1.8) + 1; i++) {
      const n = 5 + Math.floor(rand() * 4), vert = rand() < 0.5;
      place((x, y) => header(x, y, n, vert, rand() < 0.5 ? -1 : 1));
    }

    /* ---- fill pass: the strip to the right of the nav pins ----------------------
       (the pins reserve a band next to the folder, which used to leave the far-right
       edge sparse). Same parts, placed with a flat probability across the strip. */
    const rx0 = ex.r + 8;
    if (wide && W - rx0 > 90) {
      const strip = ((W - 12 - rx0) * H) / 1000000 * DENSITY * FILL_RIGHT;
      const fillIn = (make, tries = 90) => {
        for (let t = 0; t < tries; t++) {
          const x = R(rx0 + 12, W - 16), y = R(16, H - 16);
          const c = make(x, y);
          if (free(x, y, c.w, c.h, 10)) return add(c, x, y);
        }
        return null;
      };
      for (let i = 0; i < Math.round(strip * 9) + 1; i++) {
        fillIn((x, y) => rand() < 0.5 ? ic(x, y, { nv: 3 + Math.floor(rand() * 4) })
          : ic(x, y, { quad: true, nv: 3 + Math.floor(rand() * 3), nh: 3 + Math.floor(rand() * 3) }));
      }
      for (let i = 0; i < Math.round(strip * 45); i++) {
        const isC = rand() < 0.45, vert = rand() < 0.5;
        fillIn((x, y) => smd(x, y, vert, isC ? "C" : "R"));
      }
      for (let i = 0; i < Math.round(strip * 3) + 1; i++) fillIn((x, y) => crystal(x, y));
      for (let i = 0; i < Math.round(strip * 3) + 1; i++) {
        const n = 5 + Math.floor(rand() * 4), vert = rand() < 0.5;
        fillIn((x, y) => header(x, y, n, vert, rand() < 0.5 ? -1 : 1));
      }
    }

    /* ---- routing -------------------------------------------------------- */
    const traces = [];
    const distToViewport = (x, y) => Math.min(x, y, W - x, H - y);

    function route(p, q) {
      const s = 10;
      const a = { x: p.x + p.dx * s, y: p.y + p.dy * s }, b = { x: q.x + q.dx * s, y: q.y + q.dy * s };
      const dx = b.x - a.x, dy = b.y - a.y, adx = Math.abs(dx), ady = Math.abs(dy);
      const sx = Math.sign(dx) || 1, sy = Math.sign(dy) || 1;
      let m;
      if (rand() < 0.5) m = adx >= ady ? { x: a.x + sx * (adx - ady), y: a.y } : { x: a.x, y: a.y + sy * (ady - adx) };
      else m = adx >= ady ? { x: b.x - sx * (adx - ady), y: b.y } : { x: b.x, y: b.y - sy * (ady - adx) };
      return [{ x: p.x, y: p.y }, a, m, b, { x: q.x, y: q.y }].filter((pt, i, arr) => !i || Math.hypot(pt.x - arr[i - 1].x, pt.y - arr[i - 1].y) > 0.5);
    }
    const pickPin = (c, tx, ty) => {
      const vx = tx - c.cx, vy = ty - c.cy, vl = Math.hypot(vx, vy) || 1;
      let best = null, bs = -9;
      c.pins.forEach((p, i) => {
        if (c.used.has(i)) return;
        const sc = (p.dx * vx + p.dy * vy) / vl - Math.hypot(p.x - tx, p.y - ty) * 0.001;
        if (sc > bs) { bs = sc; best = i; }
      });
      if (best === null) return null;
      c.used.add(best);
      return c.pins[best];
    };
    const link = (a, b) => {
      const p = pickPin(a, b.cx, b.cy), q = pickPin(b, a.cx, a.cy);
      if (!p || !q) return;
      const pts = route(p, q);
      traces.push({ pts, a: a.id, b: b.id });
    };

    // each part connects to its nearest one or two neighbours
    items.forEach((a) => {
      const near = items.filter((b) => b !== a)
        .map((b) => ({ b, d: Math.hypot(b.cx - a.cx, b.cy - a.cy) }))
        .filter((o) => o.d < 320)
        .sort((x, y) => x.d - y.d)
        .slice(0, a.prefix === "U" ? 3 : 1 + (rand() < 0.4 ? 1 : 0));
      near.forEach((o) => link(a, o.b));
    });

    // parallel buses of 3–6 lines running from big pin banks off to the nearest screen edge
    items.filter((c) => c.prefix === "U" && c.pins.length >= 8).forEach((c) => {
      if (rand() > 0.75) return;
      const k = 3 + Math.floor(rand() * 4);
      // side whose outward direction points toward the closest viewport edge
      const dirs = [[-1, 0, c.cx], [1, 0, W - c.cx], [0, -1, c.cy], [0, 1, H - c.cy]].sort((x, y) => x[2] - y[2]);
      for (const [dx, dy] of dirs) {
        const side = c.pins.map((p, i) => ({ p, i })).filter((o) => o.p.dx === dx && o.p.dy === dy && !c.used.has(o.i));
        if (side.length < k) continue;
        side.sort((x, y) => (dx ? x.p.y - y.p.y : x.p.x - y.p.x));
        const start = Math.floor(rand() * (side.length - k + 1));
        const nx = dy, ny = dx, sgn = rand() < 0.5 ? 1 : -1;   // perpendicular
        const len1 = R(14, 34), shift = R(26, 60);
        for (let j = 0; j < k; j++) {
          const o = side[start + j]; c.used.add(o.i);
          const p = o.p;
          const a1 = { x: p.x + dx * len1, y: p.y + dy * len1 };
          const a2 = { x: a1.x + (dx + nx * sgn) * shift, y: a1.y + (dy + ny * sgn) * shift };
          const far = { x: dx > 0 ? W + 30 : dx < 0 ? -30 : a2.x, y: dy > 0 ? H + 30 : dy < 0 ? -30 : a2.y };
          traces.push({ pts: [{ x: p.x, y: p.y }, a1, a2, far], a: c.id, b: -1, r: 7 });
        }
        break;
      }
    });

    // any leftover passives get a short stub ending in a via, and a few free vias
    const vias = [];
    items.forEach((c) => {
      if (c.used.size === 0 && c.pins.length) {
        const p = c.pins[Math.floor(rand() * c.pins.length)];
        const len = R(16, 40);
        const end = { x: p.x + p.dx * len, y: p.y + p.dy * len };
        traces.push({ pts: [{ x: p.x, y: p.y }, end], a: c.id, b: -1 });
        vias.push(end);
      }
    });
    traces.forEach((t) => {
      if (t.pts.length > 3 && rand() < 0.4) vias.push(t.pts[1]);                       // at the stub end
      if (t.pts.length > 3 && t.b >= 0 && rand() < 0.35) vias.push(t.pts[Math.floor(t.pts.length / 2)]);   // junction
    });

    /* ---- render ------------------------------------------------------------ */
    let out = "";
    traces.forEach((t, i) => { t.d = rounded(t.pts, t.r || 5); t.i = i; out += `<path class="pcb-trace" data-t="${i}" d="${t.d}"/>`; });
    vias.forEach((v) => { out += `<circle class="pcb-via" cx="${f(v.x)}" cy="${f(v.y)}" r="3.2"/>`; });
    items.forEach((c) => {
      const label = rand() < 0.65
        ? `<text class="lbl" x="${f(c.cx - c.w / 2)}" y="${f(c.cy - c.h / 2 - 5)}">${c.label}</text>` : "";
      out += `<g class="pcb-comp" data-c="${c.id}">${c.html}${label}</g>`;
    });
    svg.innerHTML = out;

    // link elements ↔ data, and build the spatial lookup (grid of buckets)
    const tEls = svg.querySelectorAll(".pcb-trace"), cEls = svg.querySelectorAll(".pcb-comp");
    traces.forEach((t, i) => { t.el = tEls[i]; if (t.a >= 0) items[t.a].traces.push(t); if (t.b >= 0) items[t.b].traces.push(t); });
    grid = new Map();
    items.forEach((c, i) => {
      c.el = cEls[i];
      c.box = { l: c.cx - c.w / 2 - HOVER_PAD, r: c.cx + c.w / 2 + HOVER_PAD, t: c.cy - c.h / 2 - HOVER_PAD, b: c.cy + c.h / 2 + HOVER_PAD };
      for (let gx = Math.floor(c.box.l / CELL); gx <= Math.floor(c.box.r / CELL); gx++)
        for (let gy = Math.floor(c.box.t / CELL); gy <= Math.floor(c.box.b / CELL); gy++) {
          const k = gx + "," + gy;
          if (!grid.has(k)) grid.set(k, []);
          grid.get(k).push(c);
        }
    });
    comps = items;
    active = null;   // old elements are gone
    layoutHint();
  }

  /* ==========================================================================
     Hover: power a component on (and its traces), ease back on leave
     ========================================================================== */
  let active = null;

  function lookup(x, y) {
    const list = grid.get(Math.floor(x / CELL) + "," + Math.floor(y / CELL));
    if (!list) return null;
    let best = null, bd = 1e9;
    for (const c of list) {
      if (x < c.box.l || x > c.box.r || y < c.box.t || y > c.box.b) continue;
      const d = Math.hypot(x - c.cx, y - c.cy);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  function pulse(t, from) {
    if (reduced() || !t.el.animate) return;
    let p = t.pulse;
    if (!p) {
      p = document.createElementNS(NS, "path");
      p.setAttribute("d", t.d);
      p.setAttribute("pathLength", "100");
      p.setAttribute("class", "pcb-pulse");
      p.style.strokeDasharray = "14 200";
      svg.appendChild(p);
      t.pulse = p;
    }
    // the path starts at trace.a: a pulse from a runs start → end, from b runs end → start
    const forward = t.a === from.id;
    if (t.anim) t.anim.cancel();
    p.style.opacity = 1;
    t.anim = p.animate(
      forward ? [{ strokeDashoffset: 14 }, { strokeDashoffset: -100 }] : [{ strokeDashoffset: -100 }, { strokeDashoffset: 14 }],
      { duration: PULSE_MS, easing: "ease-out" });
    t.anim.onfinish = () => { p.style.opacity = 0; };
    t.anim.oncancel = () => { p.style.opacity = 0; };
  }

  /* ==========================================================================
     Hint: "psst… hover over the board" + an arrow to the nearest bottom-left part.
     Hidden if it won't fit beside the folder, and gone for the session once any
     component has been hovered (in-memory flag; a reload brings it back).
     ========================================================================== */
  const hint = $("#pcbHint");
  const hintText = hint && $(".pcb-hint__text", hint);
  const hintArrow = hint && $(".pcb-hint__arrow", hint);
  function layoutHint() {
    if (!hint) return;
    hintArrow.innerHTML = "";
    if (App.state.pcbFound) { hint.classList.remove("is-shown"); hint.classList.add("is-gone"); return; }
    const t = hintText.getBoundingClientRect();
    const fr = folder.getBoundingClientRect();
    const fits = hoverCapable() && t.right + 24 < fr.left && t.left >= 20;
    // nearest part that isn't sitting under the text
    const cx = t.right, cy = t.top + t.height * 0.35;
    let best = null, bd = 1e9;
    comps.forEach((c) => {
      if (c.cx < t.left || c.cx > fr.left - 10 || c.cy < fr.top) return;
      if (c.cx - c.w / 2 < t.right + 8 && c.cy + c.h / 2 > t.top - 4) return;   // would touch the text
      const d = Math.hypot(c.cx - cx, c.cy - cy);
      if (d > 30 && d < bd) { bd = d; best = c; }
    });
    if (!fits || !best) { hint.classList.remove("is-shown"); return; }
    // curved arrow from the text to the part's near edge
    const sx = cx + 8, sy = cy;
    const dx = best.cx - sx, dy = best.cy - sy, len = Math.hypot(dx, dy) || 1;
    const stop = Math.max(best.w, best.h) / 2 + 10;
    const ex = best.cx - (dx / len) * stop, ey = best.cy - (dy / len) * stop;
    const qx = (sx + ex) / 2 - (ey - sy) * 0.28, qy = (sy + ey) / 2 + (ex - sx) * 0.28;
    const ang = Math.atan2(ey - qy, ex - qx), ah = 9;
    const a1 = [ex - ah * Math.cos(ang - 0.5), ey - ah * Math.sin(ang - 0.5)];
    const a2 = [ex - ah * Math.cos(ang + 0.5), ey - ah * Math.sin(ang + 0.5)];
    hintArrow.innerHTML = `<path d="M${f(sx)} ${f(sy)} Q${f(qx)} ${f(qy)} ${f(ex)} ${f(ey)}"/><path d="M${f(a1[0])} ${f(a1[1])} L${f(ex)} ${f(ey)} L${f(a2[0])} ${f(a2[1])}"/>`;
    hint.classList.remove("is-gone");
    hint.classList.add("is-shown");
  }
  function foundBoard() {
    if (App.state.pcbFound) return;
    App.state.pcbFound = true;
    if (hint) { hint.classList.remove("is-shown"); hint.classList.add("is-gone"); }
  }

  function power(c) {
    if (c === active) return;
    if (c) foundBoard();
    if (active) {
      active.el.classList.remove("is-on");
      active.traces.forEach((t) => t.el.classList.remove("is-lit"));
    }
    active = c;
    if (c) {
      c.el.classList.add("is-on");
      c.traces.forEach((t) => { t.el.classList.add("is-lit"); pulse(t, c); });
    }
  }

  /* ==========================================================================
     Cursor glow: follows the cursor over the black area with a little lag
     ========================================================================== */
  let gx = 0, gy = 0, tx = 0, ty = 0, glowOn = false, raf = 0;
  function glowFrame() {
    const k = reduced() ? 1 : GLOW_LAG;
    gx += (tx - gx) * k; gy += (ty - gy) * k;
    const half = glow.offsetWidth / 2;
    glow.style.transform = `translate3d(${(gx - half).toFixed(1)}px, ${(gy - half).toFixed(1)}px, 0)`;
    raf = glowOn ? requestAnimationFrame(glowFrame) : 0;
  }
  function glowTo(on, x, y) {
    if (on) {
      tx = x; ty = y;
      if (!glowOn) { glowOn = true; gx = x; gy = y; glow.classList.add("is-on"); }
      if (!raf) raf = requestAnimationFrame(glowFrame);
    } else if (glowOn) {
      glowOn = false; glow.classList.remove("is-on");
    }
  }

  /* ==========================================================================
     Wiring (desktop only; on touch / small screens the board is static and dim)
     ========================================================================== */
  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !hoverCapable()) return;
    // over the folder, its nav pins or the image viewer → the board sleeps
    const overUI = e.target.closest && e.target.closest(".folder, dialog");
    glowTo(!overUI, e.clientX, e.clientY);
    power(overUI ? null : lookup(e.clientX, e.clientY));
  };
  const sleep = () => { glowTo(false); power(null); };

  build();
  window.addEventListener("resize", debounce(build, 150));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", sleep);
  window.addEventListener("blur", sleep);
})();
