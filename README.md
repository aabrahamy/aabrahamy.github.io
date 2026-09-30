# Ani Abrahamyan: portfolio

An "engineering notebook folder" portfolio built with plain HTML, CSS and vanilla JS. There's no framework and no build step, so it deploys straight to GitHub Pages.

```
portfolio/
├── index.html        page shell (you shouldn't need to edit it)
├── 404.html          makes deep links like /projects/rv32i-cpu work on GitHub Pages
├── styles.css        colors, fonts, sizes, CSS motion values: all variables at the top
├── content.js        ALL content: about, projects, playground, contact, links
├── js/
│   ├── core.js       MOTION settings (top of file), router, helpers, lightbox
│   ├── effects.js    ink cursor trail + melting titles
│   ├── about.js      stamp portrait, bio sheet, tag staircase, clock
│   ├── projects.js   infinite grid + list views
│   ├── case-study.js /projects/<slug> pages
│   ├── playground.js draggable scrapbook
│   ├── contact.js    links table + copy email
│   └── main.js       builds the tabs and starts the site
└── assets/
    ├── about/        1.jpg, 2.jpg… (stamp photos), resume.pdf
    ├── projects/<slug>/
    └── playground/   photos, art, stickers
```

## Preview locally

The site uses real paths (`/projects/rv32i-cpu`), so preview it with a small server that sends every path to `index.html`:

```bash
npx serve -s .
```

Open the address it prints (usually http://localhost:3000).
Double-clicking `index.html` also works, but links fall back to `#/projects` style.

## Placeholders and `[EDIT]`

- Text in `content.js` that starts with `[EDIT]` shows a small dashed **EDIT** chip on the page. Replace the text and delete `[EDIT]`.
- Every image shows as a gray box labeled with the path it expects. Save a file at that path and it appears; no code changes needed. Until then, the browser console lists those files as "not found". That's expected.

---

## About page

### Stamp photos
The postage stamp cycles through `about.stampPhotos`. It swaps every 2.5s, and every 0.35s while hovered.

```js
stampPhotos: ["assets/about/1.jpg", "assets/about/2.jpg", "assets/about/3.jpg"],
stampRatio: "4/5",   // shape shared by all stamp photos
```

Add or remove paths freely. Use photos with the same shape; they're shown in grayscale. The caption is `about.stampCaption`.

### Bio sheet
Clicking the paper-clipped **ABOUT ME** note slides in `about.sheet`:

```js
sheet: {
  intro: "About five lines of text…",
  highlights: [
    { label: "SoCET", href: "https://…" },   // with href → becomes a link with →
    { label: "PASA exec board" },            // without → plain text
  ],
},
```

## Add a project

1. Create `assets/projects/<slug>/` and add images (at least `cover.jpg`).
2. Copy a project object in `content.js` → `projects` and edit it. `slug` must be unique and lowercase with no spaces; the page is `/projects/<slug>`.

```js
{
  slug: "my-thing",
  title: "My Thing",
  category: "Hardware",
  year: "2026",
  cover: { src: "assets/projects/my-thing/cover.jpg", alt: "…", ratio: "4/5" },
  summary: "The overview paragraph.",
  meta: [                                // the 2×2 grid; any labels you like
    { label: "Role", value: "Solo" },
    { label: "Tools", value: "SystemVerilog" },
    { label: "Year", value: "2026" },
    { label: "Timeline", value: "6 weeks" },
  ],
  blocks: [ … see below … ],
}
```

### Case-study block types
Blocks render top to bottom in the order you list them. Mix and repeat freely.

```js
// full-width image
{ type: "image", src: "assets/projects/my-thing/hero.jpg", alt: "…", ratio: "16/9" }

// two images side by side
{ type: "pair", images: [
    { src: "assets/projects/my-thing/a.jpg", alt: "…", ratio: "4/3" },
    { src: "assets/projects/my-thing/b.jpg", alt: "…", ratio: "4/3" },
] }

// black label on the left, justified text on the right
// (use for PROBLEM, APPROACH, RESULTS, WHAT I LEARNED…; blank line = new paragraph)
{ type: "section", label: "Problem", text: "First paragraph.\n\nSecond paragraph." }

// code snippet with a thin border
{ type: "code", lang: "systemverilog", code: `assign y = a & b;` }

// block diagram / waveform on a white card
{ type: "diagram", src: "assets/projects/my-thing/datapath.png", alt: "…", caption: "Fig. 1: datapath", ratio: "16/9" }

// video: a YouTube link (watch, youtu.be, shorts or a bare 11-character id) or a local file
{ type: "video", src: "https://www.youtube.com/watch?v=XXXXXXXXXXX", alt: "Demo", ratio: "16/9", caption: "optional" }
{ type: "video", src: "assets/projects/my-thing/demo.mp4", poster: "assets/projects/my-thing/poster.jpg", ratio: "16/9" }

// row of links
{ type: "links", items: [ { label: "GitHub", href: "https://…" }, { label: "Demo", href: "https://…" } ] }
```

Project order in the list sets the (01), (02)… numbers, the grid/list order, and what "Next project" points to (it loops around).

## Playground

The Playground is an endless scrapbook you drag sideways. Every item in `playground.items` can be placed by hand:

| field | meaning |
|---|---|
| `x` | px from the start of the canvas (left → right) |
| `y` | vertical position: `0` = top of the folder, `1` = bottom |
| `w` | width in px (height follows from `ratio`) |
| `bottom` | optional, instead of `y`: gap above the folder's bottom (`0.02` = 2%). Photo (01) uses it to sit in the bottom-right corner |
| `rotate` | degrees, optional |

Positions are in a 820-unit design width (the folder is about 820 wide), so anything with `x` above about 820 starts off-screen and only appears as you swipe. The intro's three lines (`intro: "hey!
this is my
world"`) stagger automatically, with the third indented under the second.

If you leave `x`/`y`/`w` out, the item goes after the previous one, alternating high and low. Positions scale down on short screens. The canvas ends with "The End" after your last item, then loops back to the intro note.

```js
{ type: "photo",   src: "assets/playground/lake.jpg", alt: "…", ratio: "3/2", caption: "Fujifilm X-T30 III · Lake Michigan", date: "2026.07", x: 900, y: 0.3, w: 260 }
{ type: "art",     src: "assets/playground/still-life.jpg", alt: "…", ratio: "4/5", caption: "Oil on canvas", date: "2026", tape: true, x: 1200, y: 0.5, w: 220, rotate: 2 }
{ type: "note",    text: "learning\nguitar", x: 1500, y: 0.25, rotate: -4 }   // "\n" = second, offset line
{ type: "sticker", src: "assets/playground/sticker-pick.png", alt: "Guitar pick", ratio: "1/1", x: 1560, y: 0.6, w: 90, rotate: 12 }
```

**Stickers** are cut-out images with a transparent background: save them as **PNG** (or WebP) with the background removed, e.g. with remove.bg, Photoshop, or Preview's "Instant Alpha". They get a soft drop shadow and aren't numbered. Notes and stickers move slightly faster than photos when you drag, which adds a little depth.

Photos and art open in a lightbox (← → to step through, Esc to close). The lightbox shows `caption · date`.

## PCB background + cursor glow

`js/pcb.js` draws a faint circuit board on the black area behind the folder (ICs, resistors/capacitors, a crystal, headers, one big chip, traces, vias, tiny silkscreen labels). Hover a component (or come within 20px) and it powers on: it brightens, grows 4%, and the traces attached to it light up with a pulse that travels away from it. A soft pink glow follows the cursor over the black area.

- **Colors, glow, scale, timings:** the `--pcb-*` and `--glow-*` variables in `styles.css` (`:root`).
- **Layout + behavior:** the constants at the top of `js/pcb.js`: `PCB_SEED` (change for a different fixed layout), `DENSITY`, `HOVER_PAD`, `PULSE_MS`, `GLOW_LAG`.
- Desktop only. On touch/small screens the board is static; with reduced motion it just brightens (no scale, no pulses, glow follows the cursor directly).

## Contact page

An intro plus a table of links, one row per link: LinkedIn, GitHub, Résumé, Photography and Email (with a copy button). The URLs are `SITE.links` in `content.js` (`linkedin`, `github`, `resume`, `photography`, `email`), and the intro text is `contact.intro`. Leave a link empty to remove its row.

## Colors, fonts and motion

**`styles.css` → `:root`** (top of the file):

| Variable | Controls |
|---|---|
| `--tab-about`, `--tab-projects`, `--tab-playground`, `--tab-contact` | each tab's color (the folder takes the active tab's color) |
| `--bg`, `--ink`, `--sheet`, `--orange` | background, text/highlighter, bio sheet, "The End" |
| `--dot-gap`, `--dot-size`, `--dot-inset`, `--dot`, `--trace` | dot grid + faint traces |
| `--font-display`, `--font-mono`, `--font-body`, `--font-hand`, `--font-script` | fonts (also update the Google Fonts link in `index.html`) |
| `--frame`, `--folder-w`, `--page-ratio` | black margin, max folder width, folder shape |
| `--dur-fade`, `--dur-sheet`, `--dur-hover`, `--ease-out` | CSS motion |

**`js/core.js` → `MOTION`** (top of the file):

| Setting | Controls |
|---|---|
| `pageFade` | crossfade between tabs (ms) |
| `meltIn`, `meltOut`, `meltEnter`, `meltScale`, `meltBlur`, `meltGoo`, `meltSwell` | melting title timing and strength |
| `trailLife`, `trailPoints`, `trailWidth`, `trailInk`, `trailInkAlpha`, `trailChalk` | ink cursor trail |
| `stampEvery`, `stampHover` | stamp photo speed |
| `momentumDecay`, `dragThreshold` | drag-scroll feel; a press moving less than `dragThreshold` px counts as a click |
| `previewLerp` | how quickly the list-view preview follows the cursor |
| `parallax` | Playground notes/stickers speed |

With **Reduce motion** turned on in the OS, the trail, melting, stamp cycling, momentum and parallax switch off, and the bio sheet fades instead of sliding.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

On GitHub, go to **Settings → Pages → Build and deployment**, set **Source: Deploy from a branch**, and pick **`main` / `(root)`**.

- Repo named `<you>.github.io` → site at `https://<you>.github.io/`
- Any other repo name → `https://<you>.github.io/<repo>/`

Both work without changes. The site detects where it lives, and `404.html` sends deep links (`…/projects/rv32i-cpu`) back to the right page.
