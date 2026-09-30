/* ==========================================================================
   content.js: ALL of the site's content lives in this one file.
   --------------------------------------------------------------------------
   • You never need to touch index.html or the js/ folder to change content.
   • Anything marked [EDIT] is placeholder copy. On the page it shows a small
     dashed "EDIT" chip so you can spot what's left. Delete [EDIT] when done.
   • Images: point `src` at a file inside /assets. Until the file exists the
     site shows a gray box labeled with the path it's looking for. Drop the
     image in at that path and it appears automatically.
   • `alt` = short description for screen readers. Please fill these in.
   • `ratio` = the image's shape as "width/height" ("4/5", "3/2", "1/1"…).
     It sizes the placeholder and keeps the layout from jumping.
   ========================================================================== */

const SITE = {
  /* ---- Basics -------------------------------------------------------- */
  name: "Ani Abrahamyan",
  tagline: "Computer Engineering @ Purdue", // browser tab title on About

  /* ---- Links used around the site ------------------------------------- */
  links: {
    email: "abrahamy@purdue.edu",                            
    linkedin: "https://www.linkedin.com/in/aabrahamy",     
    github: "https://github.com/aabrahamy",                              
    resume: "assets/about/resume.pdf",                      
  },

  /* ======================================================================
     ABOUT
     ====================================================================== */
  about: {
    noteLabel: "About me",            // the paper-clipped note (opens the bio sheet)
    intro:
      "Hi! I'm Ani, a Computer Engineering sophomore at Purdue, passionate about hardware design, verification, and anything computers.",
    ctaLabel: "Contact Me",           // opens Contact
    tabNote: "my projects",           // handwritten note beside the PROJECTS tab

    // ---- Postage-stamp portrait --------------------------------------
    // Photos cycle every ~2.5s (faster on hover). Add as many as you like.
    // Put the files in assets/about/. The stamp is square, so each photo is cropped to fit.
    // To choose the crop, use an object instead of a plain path:
    //   { src: "assets/about/2.jpg", position: "50% 20%", zoom: 1.3 }
    //   position = which part stays in the frame: "x% y%" (0% 0% = top-left, 50% 50% = center,
    //              100% 100% = bottom-right); "50% 0%" keeps the top, "50% 100%" keeps the bottom.
    //   zoom     = optional, 1 = as is, 1.3 = zoomed in 30% (zooms toward the same point).
    stampPhotos: [
      { src: "assets/about/1.jpg", position: "80% 50%", zoom: 1.0 },
      { src: "assets/about/2.jpg", position: "10% 80%", zoom: 1.4 },
      { src: "assets/about/4.jpg", position: "50% 60%", zoom: 1.1 },
      { src: "assets/about/3.jpg", position: "70% 50%", zoom: 1.1 },
      { src: "assets/about/5.jpg", position: "50% 50%", zoom: 1.0 },
    ],
    stampRatio: "1/1",
    stampAlt: "Photos of Me",
    stampCaption: "made with love, Ani",

    // ---- Numbered tag staircase + footer ---------------------------------
    tags: ["Digital Design", "Computer Architecture", "Semiconductors"],
    location: "West Lafayette",
    timezone: "America/Indiana/Indianapolis",

    // ---- Slide-over bio sheet (click the "ABOUT ME" note) ----------------
    sheet: {
      intro:
        "I got into computers through games, first writing Lua scripts for Roblox as a kid, then picking out parts and building my own PC in high school. That turned into learning C in college, and C turned into wanting to know what actually happens on a lower level: how hardware turns code into computation, from a single instruction moving through a CPU pipeline to thousands of threads running in parallel on a GPU. Now I'm a Computer Engineering student at Purdue working on digital design and verification. I'm building an RV32I CPU in SystemVerilog, doing RTL work with SoCET, and spent a co-op at Cummins building AI data pipelines. I'm still figuring out my niche in hardware design, and I'm doing it by building projects, getting into research, and following what I'm most curious about.",
      // `href` is optional. With it, the line becomes a link with a → arrow.
      highlights: [
        { label: "Armenian Student Association", href: "https://all-asa.org/" },
        { label: "Delta Phi Lambda Sorority", href: "https://www.deltaphilambda.org/" },
        { label: "System-on-Chip Extension Technologies", href: "https://engineering.purdue.edu/SoC-Team" },
        { label: "Adobe Student Ambassador" },
      ],
    },
  },

  /* ======================================================================
     PROJECTS
     ----------------------------------------------------------------------
     TO ADD A PROJECT:
       1. Make a folder assets/projects/<slug>/ and put images in it.
       2. Copy one object below and edit it. `slug` = unique, lowercase,
          no spaces. The page lives at  /projects/<slug>
       3. List order = order on the site = the (01), (02)… numbers.

     `meta` = the 2×2 grid under the overview. Labels are up to you.

     CASE-STUDY BLOCKS (`blocks`, any order, repeat freely):
       { type: "image",   src, alt, ratio? }                     full width
       { type: "pair",    images: [ {src, alt, ratio?}, {…} ] }  side by side
       { type: "section", label: "PROBLEM", text: "…" }          label + paragraph
       { type: "code",    lang: "systemverilog", code: `…` }
       { type: "diagram", src, alt, caption?, ratio? }           white card
       { type: "links",   items: [ { label: "GitHub", href: "…" }, … ] }
     In `text`, a blank line ("\n\n") starts a new paragraph.
     ====================================================================== */
  projects: [
    {
      slug: "rv32i-cpu",
      title: "RV32I Single-Cycle CPU",
      category: "(In Progress)",
      year: "2026",
      // cover: { src: "assets/projects/rv32i-cpu/cover.jpg", alt: "CPU datapath", ratio: "4/5" },
      summary:
        "A single-cycle RV32I core written in SystemVerilog that runs a subset of the RV32I instruction set. Next up: a 5-stage pipeline for higher clock frequency and lower CPI.",
      meta: [
        { label: "Tools", value: "SystemVerilog, Verilator, GTKWave" },
      ],
      blocks: [
        { type: "image", src: "assets/projects/rv32i-cpu/datapath.jpg", alt: "CPU datapath", ratio: "16/9" },
        { type: "section", label: "Problem", text: "Build a single-cycle RV32I CPU in SystemVerilog that supports R-type, I-type, S-type, B-type, and J-type instructions." },
        { type: "section", label: "Approach", text: "I started by drawing out the state elements, drawing the full single-cycle datapath from Harris & Harris, and documenting the control-unit spec and signal naming conventions before writing any RTL. From there, I built the CPU one module at a time in SystemVerilog, writing the core logic myself and verifying each block with its own Verilator testbench and Makefile before committing it and moving on. The goal is a fully tested single-cycle core that I can later extend into a 5-stage pipeline." },
        { type: "section", label: "Module Snippets" },
        {
          type: "code",
          lang: "systemverilog",
          code: `
module alu (
    input  logic [31:0] a,
    input  logic [31:0] b,
    input  logic [2:0] alucontrol,
    output logic [31:0] result,
    output logic zero
);
    always_comb begin
        case (alucontrol)
            3'b000:  result = a + b;
            3'b001:  result = a - b;
            3'b010:  result = a & b;
            3'b011:  result = a | b;
            3'b101:  result = {31'b0, $signed(a) < $signed(b)};
            default: result = 32'bx;
        endcase
    end

    assign zero = (result == 32'b0);

endmodule`,
        },
        {
          type: "code",
          lang: "systemverilog",
          code: `
module aludecoder (
    input logic op5,
    input logic [2:0] funct3,
    input logic funct7_b5, 
    input logic [1:0] aluop,
    output logic [2:0] alucontrol
);

    always_comb begin
        case (aluop)
            2'b00: alucontrol = 3'b000;
            2'b01: alucontrol = 3'b001;
            2'b10: begin
                case (funct3)
                    3'b000: alucontrol = (op5 & funct7_b5) ? 3'b001 : 3'b000;
                    3'b111: alucontrol = 3'b010;
                    3'b110: alucontrol = 3'b011;
                    3'b010: alucontrol = 3'b101;
                    default: alucontrol = 3'bxxx;
                endcase
            end
            default: alucontrol = 3'bxxx;
        endcase
    end

endmodule`
        },
        /*
        {
          type: "pair",
          images: [
            { src: "assets/projects/rv32i-cpu/wave-01.png", alt: "[EDIT] Waveform: ADDI", ratio: "4/3" },
            { src: "assets/projects/rv32i-cpu/wave-02.png", alt: "[EDIT] Waveform: BEQ", ratio: "4/3" },
          ],
        },
        { type: "section", label: "Results", text: "[EDIT] Tests passing, CPI, max clock frequency, resource usage." },
        { type: "section", label: "What I learned", text: "[EDIT] One or two honest takeaways." }, */
        { type: "links", items: [ { label: "GitHub", href: "https://github.com/aabrahamy/RV32I_CPU" },  ] },
      ],
    },

      {
      slug: "unbias",
      title: "unbias",
      category: "InnovateHer '26 Winner",
      year: "2026",
      summary:
        "A web tool that flags gender-biased language in performance reviews and suggests neutral alternatives, impacting financial and career growth for female employees. Built in 24 hours for Purdue InnovateHer 2026, winning 1st place in the Capital-One sponsored finance track.",
      meta: [
        { label: "Tools", value: "React, Node.js, TypeScript, Tailwind, MongoDB" },
      ],
      blocks: [
        { type: "image", src: "assets/projects/unbias/hero.jpg", alt: "App screenshot", ratio: "16/10" },
        { type: "section", label: "Problem", text: "Assertive men may be labeled as \"confident leaders,\" while women may be called \"bossy\" or \"aggressive\" for the same behaviors. We dug deeper and found that these words don't only affect a woman's outcomes in the workplace but also in her financial future." },
        {
          type: "video",
          src: "https://www.youtube.com/watch?v=sGD4tL4qVAs&t=5s",   // a YouTube link, or a file like "assets/projects/unbias/demo.mp4"
          alt: "App demo",
          ratio: "16/9"
        },
        { type: "links", items: [ { label: "DevPost", href: "https://devpost.com/software/unbias-qtr7y3" } ] },
      ],
    },
  
/*
    {
      slug: "personal-computer",
      title: "Personal Computer",
      category: "Fun Project",
      year: "2024",
      cover: { src: "assets/projects/personal-computer/cover.jpg", alt: "[EDIT] Personal computer", ratio: "1/1" },
      summary:
        "A custom-built personal computer (RTX 4060, I7 14700K Processor, 32GB RAM, 2 TB SSD) with a focus on performance and aesthetics for personal and professional use.",
      meta: [
      ],
    },
    */
  ],


  /* ======================================================================
     PLAYGROUND: a draggable scrapbook
     ----------------------------------------------------------------------
     Every item can be positioned by hand:
       x       px from the start of the canvas (left → right)
       y       0 = top of the folder, 1 = bottom
       bottom  (optional) instead of y: gap above the folder's bottom, e.g. 0.02 = 2%
       w       width in px
       rotate  degrees (optional)
     Leave x / y / w out and the item is placed after the previous one,
     zig-zagging high and low. Positions scale down on short screens.

     TYPES
       photo    { type, src, alt, ratio, caption?, date?, x, y, w }
       art      { type, src, alt, ratio, caption?, date?, tape?: true, … }
       note     { type, text: "line one\nline two", rotate? }  handwriting
       sticker  { type, src, alt, ratio, rotate? }  cut-out PNG with transparency
     ====================================================================== */
  playground: {
    intro: "hey!\nthis is my\nworld",   // 3rd line is indented under the last word of the 2nd
    swipeLabel: "swipe",
    endLabel: "The End",
    items: [
      // FIRST SCREEN: only photo (01) is visible on load (bottom-right, 27% wide, right edge
      // slightly cut off). `bottom: 0.02` pins it 2% above the folder's bottom instead of using y.
      // Everything else starts past x = 820 (the folder's width in design units) and appears as you swipe.
      { type: "photo", src: "assets/playground/bell-tower.jpg", alt: "[EDIT]", ratio: "2/3", caption: "[EDIT] Fujifilm X-T30 III · West Lafayette", date: "2026.04", x: 607, bottom: 0.02, w: 221 },
      /*{ type: "sticker", src: "assets/playground/sticker-camera.png", alt: "My camera", ratio: "1/1", x: 960, y: 0.6, w: 130, rotate: -10 },
      { type: "note", text: "shooting on\nmy Fuji", x: 1050, y: 0.8, rotate: -3 },
      { type: "photo", src: "assets/playground/photo-02.jpg", alt: "[EDIT]", ratio: "3/2", caption: "[EDIT] Fujifilm X-T30 III · Chicago", date: "2026.05", x: 1200, y: 0.3, w: 270 },
      { type: "art", src: "assets/playground/art-01.jpg", alt: "[EDIT]", ratio: "4/5", caption: "[EDIT] Charcoal study", date: "2025", tape: true, x: 1530, y: 0.44, w: 220, rotate: 2 },
      { type: "note", text: "painting\nagain", x: 1550, y: 0.18, rotate: 4 },
      { type: "photo", src: "assets/playground/photo-03.jpg", alt: "[EDIT]", ratio: "4/5", caption: "[EDIT] Fujifilm X-T30 III", date: "2026.06", x: 1830, y: 0.14, w: 180 },
      { type: "photo", src: "assets/playground/photo-04.jpg", alt: "[EDIT]", ratio: "3/2", caption: "[EDIT] Fujifilm X-T30 III", date: "2026.06", x: 1890, y: 0.6, w: 240 },
      { type: "note", text: "learning guitar", x: 2200, y: 0.3, rotate: -5 },
      { type: "sticker", src: "assets/playground/sticker-pick.png", alt: "Guitar pick", ratio: "1/1", x: 2260, y: 0.46, w: 90, rotate: 14 },
      { type: "art", src: "assets/playground/art-02.jpg", alt: "[EDIT]", ratio: "1/1", caption: "[EDIT] Window light, gouache", date: "2026", tape: true, x: 2400, y: 0.18, w: 210, rotate: -2 },
      { type: "photo", src: "assets/playground/photo-05.jpg", alt: "[EDIT]", ratio: "2/3", caption: "[EDIT] Fujifilm X-T30 III", date: "2026.07", x: 2680, y: 0.4, w: 210 },
      { type: "art", src: "assets/playground/art-03.jpg", alt: "[EDIT]", ratio: "3/4", caption: "[EDIT] Sketchbook page", date: "2026", x: 2960, y: 0.16, w: 230, rotate: 1 },
      { type: "note", text: "new hobby\nunlocked", x: 2980, y: 0.76, rotate: -3 },
      { type: "photo", src: "assets/playground/photo-06.jpg", alt: "[EDIT]", ratio: "4/5", caption: "[EDIT] Fujifilm X-T30 III", date: "2026.08", x: 3270, y: 0.3, w: 250 }, */
    ],
  },

  /* ======================================================================
     CONTACT
     ====================================================================== */
  contact: {
    intro: "Recruiting for hardware roles, curious about a project, or just want to chat? Find me here.",
    // The links table on the Contact page uses SITE.links above (linkedin, github, resume, photography, email).
  },

};
