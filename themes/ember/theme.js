/* Ember theme for Claude's Slide Engine: made for the Ember talk (a slim tie with 3,699 red LEDs behind the fabric,
   driven as a 1/16-scan LED matrix).
   Transitions scan-mux (the next slide is written by a multiplexed LED matrix: the screen is cut into thin rows and the
   rows light up scan line by scan line, every 16th row at once, each flashing as it is driven) and tie-drop (the next
   slide grows out of the top centre in the shape of a necktie, knot first, until the tie covers the screen) · effect
   spark (a glowing spark runs once round the element and it lights up behind it) · ambient "embers" (glowing sparks
   drifting up a dark slide) · data-dots="stitch-dots" (progress as stitches along a seam; the current one glows).
   Glows use the accent colour (data-accent). Option on <body>: data-ember-rows="64" (rows of the scan-mux wipe, a
   multiple of 16). Link it before engine.js:  <script src="themes/ember/theme.js" defer></script>  Docs: README.md. */
(window.slideEngineThemes = window.slideEngineThemes || []).push({ name: 'ember', setup(se) {
  const { W, H, fctx, sprite, clamp, sstep, layer, rafLoop, helper } = se;
  const ROWS = Math.max(16, Math.round((+se.body.dataset.emberRows || 64) / 16) * 16);

  /* ---------- scan-mux: rows are driven scan line by scan line (row r belongs to scan line r mod 16) ---------- */
  se.transition('scan-mux', async (from, to, dir, reveal) => {
    const dur = se.simple ? 700 : 1600, rh = H / ROWS, lines = 16;
    const order = [];                                                // scan line -> position in the sequence
    for (let i = 0; i < lines; i++) order.push(dir > 0 ? i : lines - 1 - i);
    layer(from, 1); layer(to, 2);
    to.style.clipPath = 'path("M0 0Z")';
    let shown = false;
    await rafLoop(dur, p => {
      const q = sstep(p) * (lines + 2);                            // how many scan lines are on (fractional = the one being driven)
      let d = '';
      for (let r = 0; r < ROWS; r++) {
        const k = order.indexOf(r % lines);
        if (q > k + 1) d += `M0 ${(r * rh).toFixed(1)}H${W}V${((r + 1) * rh + .6).toFixed(1)}H0Z`;
      }
      to.style.clipPath = d ? `path("${d}")` : 'path("M0 0Z")';
      if (!shown && q > 1) { shown = true; reveal(); }
      fctx.clearRect(0, 0, W, H);
      for (let r = 0; r < ROWS; r++) {                               // the row being driven flashes, then afterglow
        const k = order.indexOf(r % lines), a = q - k;
        if (a <= 0 || a > 2.2) continue;
        const glow = a < 1 ? sstep(a) : Math.pow(clamp(1 - (a - 1) / 1.2), 2);
        fctx.globalAlpha = glow * .85;
        fctx.drawImage(sprite, -W * .05, r * rh - rh * .9, W * 1.1, rh * 2.8);
        fctx.globalAlpha = glow * .35; fctx.fillStyle = se.ACCENT;
        fctx.fillRect(0, r * rh, W, rh);
      }
      fctx.globalAlpha = 1;
    });
    to.style.clipPath = '';
    fctx.clearRect(0, 0, W, H);
  });

  /* ---------- tie-drop: the new slide grows out of the top centre in the shape of a tie ---------- */
  function tiePoints(s) {                                            // tie outline in units of s, knot at the top centre
    const cx = W / 2, P = [[-.55, 0], [.55, 0], [.38, 1], [.26, 1.12], [.9, 6.4], [0, 7.4], [-.9, 6.4], [-.26, 1.12], [-.38, 1]];
    return P.map(([x, y]) => [cx + x * s, y * s - s * .02]);
  }
  se.transition('tie-drop', async (from, to, dir, reveal) => {
    const dur = se.simple ? 650 : 1500, sMax = Math.hypot(W, H) * .62;
    const [a, b] = dir > 0 ? [from, to] : [to, from];                // going back: the old slide shrinks back into the knot
    layer(a, 1); layer(b, 2);
    if (dir < 0) reveal();
    let shown = false;
    await rafLoop(dur, p => {
      const e = dir > 0 ? sstep(p) : 1 - sstep(p), s = 8 + e * sMax;
      const pts = tiePoints(s);
      b.style.clipPath = `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
      if (dir > 0 && !shown && p > .08) { shown = true; reveal(); }
      fctx.clearRect(0, 0, W, H);                                    // glowing seam along the tie's edge
      fctx.strokeStyle = se.ACCENT; fctx.lineWidth = 3 + 9 * Math.sin(e * Math.PI); fctx.globalAlpha = .8 * Math.sin(e * Math.PI);
      fctx.shadowColor = se.ACCENT; fctx.shadowBlur = 30;
      fctx.beginPath(); pts.forEach(([x, y], i) => i ? fctx.lineTo(x, y) : fctx.moveTo(x, y)); fctx.closePath(); fctx.stroke();
      fctx.shadowBlur = 0; fctx.globalAlpha = 1;
    });
    b.style.clipPath = '';
    fctx.clearRect(0, 0, W, H);
  });

  /* ---------- spark: a spark runs once round the element, which lights up behind it ---------- */
  se.build('spark', { measure: true, make(item, { el, delay, A }) {
    const g = item.geo, dur = 1100, sz = 46;
    const dot = helper('se-spark', '', { left: (g.x - sz / 2) + 'px', top: (g.y - sz / 2) + 'px', width: sz + 'px', height: sz + 'px', zIndex: 6 });
    g.slide.appendChild(dot);
    const per = 2 * (g.w + g.h), at = d => d < g.w ? [d, 0] : d < g.w + g.h ? [g.w, d - g.w] : d < 2 * g.w + g.h ? [2 * g.w + g.h - d, g.h] : [0, per - d];
    const kf = [];
    for (let i = 0; i <= 24; i++) { const [x, y] = at(per * i / 24); kf.push({ transform: `translate(${x}px, ${y}px)`, opacity: i === 24 ? 0 : 1, offset: i / 24 }); }
    A(dot, kf, { duration: dur, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    A(el, [{ opacity: 0, filter: 'brightness(.2)' }, { opacity: .35, filter: 'brightness(.6)', offset: .5 },
      { opacity: 1, filter: 'brightness(1.5) drop-shadow(0 0 18px var(--se-accent-a50))', offset: .85 }, { opacity: 1, filter: 'none' }], { duration: dur + 300 });
  } });
  se.css(`
.se-spark { position: absolute; pointer-events: none; border-radius: 50%;
  background: radial-gradient(circle, #fff 0 12%, var(--se-accent-light) 22%, var(--se-accent-a50) 45%, transparent 70%); }
`);

  /* ---------- ambient: embers drifting up a dark slide ---------- */
  se.ambient('embers', {
    init() {
      const p = [];
      for (let i = 0; i < 90; i++) p.push(spawn(Math.random() * H));
      return { p };
    },
    draw(g, st, t, dt, still) {
      g.clearRect(0, 0, W, H);
      for (const e of st.p) {
        if (!still) {
          e.y -= e.v * dt; e.x += Math.sin(t * e.f + e.ph) * 14 * dt; e.life -= dt * .08;
          if (e.y < -40 || e.life <= 0) Object.assign(e, spawn(H + 20));
        }
        const fl = .55 + .45 * Math.sin(t * e.f * 3.1 + e.ph * 5), a = clamp(e.life) * fl * e.b;
        g.globalAlpha = a; g.drawImage(sprite, e.x - e.s, e.y - e.s, e.s * 2, e.s * 2);
      }
      g.globalAlpha = 1;
    }
  });
  function spawn(y) {
    return { x: Math.random() * W, y, v: 25 + Math.random() * 55, f: .4 + Math.random() * .9, ph: Math.random() * 6.28,
      s: 5 + Math.random() * 13, b: .35 + Math.random() * .65, life: .6 + Math.random() * .4 };
  }

  /* ---------- data-dots="stitch-dots": stitches along a seam ---------- */
  se.dots('stitch-dots', { init(dots) { dots.classList.add('se-stitch-dots'); } });
  se.css(`
#se-dots.se-stitch-dots { gap: 10px; }
#se-dots.se-stitch-dots i { width: 26px; height: 6px; border-radius: 3px; transform: rotate(-35deg); background: rgba(128,128,128,.35); }
#se-dots.se-stitch-dots i.seen { background: var(--se-accent-a45); }
#se-dots.se-stitch-dots i.cur { background: var(--se-accent-light); box-shadow: 0 0 10px 2px var(--se-accent-a90), 0 0 22px 6px var(--se-accent-a50); transform: rotate(-35deg) scaleX(1.25); }
`);
} });
