/* Feeder theme for Claude's Slide Engine: a bird-feeder / garden-birds look, made for a talk about a smart bird feeder.
   Transitions flock (a flock of small birds sweeps across the screen and the new slide opens behind it) and seed-fall
   (seed pours down and piles up; the new slide fills in from the bottom under the rising pile) · effect perch (the
   element flies in on an arc and lands like a bird: a squash, a little bounce, settled) · ambient "snowfall" (a winter
   dusk: bare branches in the corners, falling snow, a few birds sitting on the twigs) · data-dots="perch-dots" (the
   progress is a wooden perch rail; a bird hops along it to the current slide, seen slides leave a seed).
   The birds' bellies are the accent colour (data-accent). Option on <body>: data-feeder-bird="#back,#head" (the birds'
   back and head colours, default a great tit: olive back, black head).
   Link it before engine.js:  <script src="themes/feeder/theme.js" defer></script>  Docs: README.md next to this file. */
(window.slideEngineThemes = window.slideEngineThemes || []).push({ name: 'feeder', setup(se) {
  const { W, H, fctx, clamp, sstep, layer, rafLoop, A, helper, sampled, ease } = se;
  const [BACK, HEAD] = (se.body.dataset.feederBird || '#6B7F4E,#1B1E1C').split(',').map(s => s.trim());

  /* ---------- one small bird, drawn in its own units (body about 2 units long), facing +x ---------- */
  // flap: 0..1 wing position (0 up, 1 down); perched: wing folded
  function bird(g, x, y, s, flap, face = 1, perched = false) {
    g.save(); g.translate(x, y); g.scale(s * face, s);
    g.fillStyle = BACK;                                                   // tail
    g.beginPath(); g.moveTo(-.8, -.05); g.lineTo(-1.65, perched ? .35 : -.25); g.lineTo(-1.6, perched ? .62 : .12); g.lineTo(-.75, .25); g.fill();
    g.beginPath(); g.ellipse(0, 0, 1, .62, 0, 0, 6.283); g.fill();        // body
    g.fillStyle = se.ACCENT;                                              // belly
    g.beginPath(); g.ellipse(.2, .2, .72, .4, .15, 0, 6.283); g.fill();
    g.fillStyle = HEAD;                                                   // head, black stripe down the belly
    g.beginPath(); g.arc(.82, -.42, .46, 0, 6.283); g.fill();
    g.fillRect(.25, .05, .5, .12);
    g.fillStyle = '#F4F1E8';                                              // white cheek, eye
    g.beginPath(); g.ellipse(.92, -.32, .24, .17, 0, 0, 6.283); g.fill();
    g.fillStyle = '#2A2016';                                              // beak
    g.beginPath(); g.moveTo(1.22, -.52); g.lineTo(1.55, -.43); g.lineTo(1.22, -.34); g.fill();
    g.fillStyle = BACK; g.save();                                         // wing (flaps about the shoulder)
    g.translate(-.05, -.25);
    if (perched) { g.rotate(.12); g.beginPath(); g.ellipse(-.15, .2, .7, .3, .1, 0, 6.283); g.fill(); }
    else {
      const k = Math.cos(flap * Math.PI);                                 // 1 up … -1 down
      g.scale(1, k);
      g.beginPath(); g.moveTo(.35, 0); g.quadraticCurveTo(.1, -1.35, -.9, -1.15); g.quadraticCurveTo(-.4, -.4, -.45, 0); g.fill();
    }
    g.restore(); g.restore();
  }

  /* ---------- flock: forty birds sweep across; the new slide opens behind them ---------- */
  se.transition('flock', async (from, to, dir, reveal) => {
    const dur = se.simple ? 700 : 1900, N = 42, SPREAD = 760;
    const birds = Array.from({ length: N }, (_, i) => ({ lag: Math.random() * SPREAD, y: 40 + (i / (N - 1)) * (H - 80) + (Math.random() - .5) * 60,
      s: 13 + Math.random() * 14, ph: Math.random(), rate: 5 + Math.random() * 3, bob: Math.random() * 6.283 }));
    layer(from, 1); layer(to, 2);
    A(from, [{ filter: 'brightness(1)' }, { filter: 'brightness(.6) saturate(.6)' }], { duration: dur, easing: ease.io });
    let shown = false;
    await rafLoop(dur, p => {
      const front = sstep(p) * (W + SPREAD + 400) - 200;                  // the leading bird's x (forward); mirrored going back
      const edge = front - SPREAD * .55;                                  // the new slide is open up to the middle of the flock
      to.style.clipPath = dir > 0 ? `inset(0 ${clamp(W - edge, 0, W)}px 0 0)` : `inset(0 0 0 ${clamp(W - edge, 0, W)}px)`;
      if (!shown && edge > W * .3) { shown = true; reveal(); }
      fctx.clearRect(0, 0, W, H);
      const t = p * dur / 1000;
      for (const b of birds) {
        const xf = front - b.lag, x = dir > 0 ? xf : W - xf;
        if (x < -60 || x > W + 60) continue;
        bird(fctx, x, b.y + Math.sin(t * 4 + b.bob) * 14, b.s, (b.ph + t * b.rate) % 1, dir);
      }
    });
    fctx.clearRect(0, 0, W, H);
    to.style.clipPath = '';
  });

  /* ---------- seed-fall: seed pours down and piles up; the new slide is under the pile ---------- */
  se.transition('seed-fall', async (from, to, dir, reveal) => {
    const dur = se.simple ? 700 : 2000, N = 520;
    const tone = ['#3B342C', '#5A4B3A', '#D8C9A3', '#C9B27A', '#E9DFC4'];                 // sunflower (dark, striped), millet, oats
    const seeds = Array.from({ length: N }, () => ({ x: Math.random() * W, t0: Math.random() * .7, v: .8 + Math.random() * .5,
      r: 5 + Math.random() * 6, a: Math.random() * 6.283, spin: (Math.random() - .5) * 8, c: tone[(Math.random() * tone.length) | 0] }));
    const bumps = Array.from({ length: 9 }, () => ({ k: 1 + Math.random() * 4, ph: Math.random() * 6.283, a: 6 + Math.random() * 14 }));
    const lip = x => bumps.reduce((s, b) => s + b.a * Math.sin(x / W * 6.283 * b.k + b.ph), 0);   // the wavy top of the pile
    layer(from, 1); layer(to, 2);
    let shown = false;
    const poly = (lvl, down) => {                                          // clip: everything below the pile line (above it going back)
      const pts = []; for (let x = 0; x <= W; x += 48) pts.push(`${x}px ${(lvl + lip(x)).toFixed(1)}px`);
      return down ? `polygon(0 ${H}px, ${pts.join(',')}, ${W}px ${H}px)` : `polygon(0 0, ${pts.join(',')}, ${W}px 0)`;
    };
    await rafLoop(dur, p => {
      const fill = sstep(clamp((p - .12) / .88));
      const lvl = dir > 0 ? H + 60 - fill * (H + 140) : -80 + fill * (H + 140);          // going back the seed drains away
      to.style.clipPath = poly(lvl, dir > 0);
      if (!shown && fill > .4) { shown = true; reveal(); }             // builds start once most of the slide is uncovered
      fctx.clearRect(0, 0, W, H);
      for (const s of seeds) {                                             // falling seed, stopping at the pile
        const q = (p - s.t0 * .8) / .5; if (q < 0) continue;
        let y = -20 + q * q * s.v * (H + 200);
        const stop = dir > 0 ? lvl + lip(s.x) : H + 40;
        if (y > stop) { if (dir < 0 || q > 1.6) continue; y = stop; }
        fctx.save(); fctx.translate(s.x, y); fctx.rotate(s.a + q * s.spin);
        fctx.fillStyle = s.c; fctx.beginPath(); fctx.ellipse(0, 0, s.r, s.r * .5, 0, 0, 6.283); fctx.fill();
        if (s.c === '#3B342C') { fctx.strokeStyle = 'rgba(240,232,210,.7)'; fctx.lineWidth = 1.5; fctx.beginPath(); fctx.moveTo(-s.r * .8, 0); fctx.lineTo(s.r * .8, 0); fctx.stroke(); }
        fctx.restore();
      }
      if (fill > 0 && fill < 1) {                                          // the edge of the pile: a band of seed
        fctx.fillStyle = 'rgba(90,75,58,.55)';
        for (let x = 0; x < W; x += 9) { const y = lvl + lip(x); fctx.beginPath(); fctx.ellipse(x, y + (x * 7 % 13) - 6, 7, 3.5, (x % 5) * .6, 0, 6.283); fctx.fill(); }
      }
    });
    fctx.clearRect(0, 0, W, H);
    to.style.clipPath = '';
  });

  /* ---------- perch: the element flies in on an arc and lands (squash, bounce, settle) ---------- */
  se.build('perch', { measure: true, nested: true, count: true, make(item, { el, delay, out, A }) {
    const dur = 1300, fly = .55, g = item.geo, side = g && g.x + g.w / 2 > W / 2 ? 1 : -1;   // comes in from its own side of the slide
    el._se.countDelay = delay + dur * fly;
    A(el, sampled(dur, t => {
      const u = t / dur;
      if (u < fly) {                                                        // the flight: an arc from above and the side
        const v = 1 - (1 - u / fly) ** 3, x = side * 420 * (1 - v), y = -320 * (1 - v) * (1 - v) - 120 * Math.sin(v * Math.PI) * (1 - v);
        return { transform: `translate(${x}px, ${y}px) rotate(${side * 8 * (1 - v)}deg) scale(${.7 + .3 * v})`, opacity: Math.min(1, u / fly * 3), transformOrigin: '50% 100%' };
      }
      const w = (u - fly) / (1 - fly), sq = Math.exp(-5 * w) * Math.sin(w * 11);      // landing: a damped squash, starting from rest
      return { transform: `translateY(${4 * sq}px) scale(${1 + .07 * sq}, ${1 - .1 * sq})`, opacity: 1, transformOrigin: '50% 100%' };
    }, 50), { duration: dur, easing: 'linear' });
  } });

  /* ---------- ambient "snowfall": a winter dusk with bare branches, snow and a few birds on the twigs ---------- */
  se.ambient('snowfall', {
    init() {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'), tips = [];
      let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);   // the same branches every time
      const branch = (x, y, ang, len, wd, depth) => {
        const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
        g.strokeStyle = 'rgba(8,14,11,.75)'; g.lineWidth = wd; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (rnd() - .5) * len * .3, (y + y2) / 2 + (rnd() - .5) * len * .3, x2, y2); g.stroke();
        if (depth >= 6 || len < 18) { if (y2 > 60 && y2 < H - 200 && x2 > 40 && x2 < W - 40) tips.push([x2, y2, ang]); return; }
        const n = depth < 2 ? 2 : 2 + (rnd() < .4 ? 1 : 0);
        for (let i = 0; i < n; i++) branch(x2, y2, ang + (rnd() - .5) * 1.1 + (i - (n - 1) / 2) * .35, len * (.68 + rnd() * .14), wd * .66, depth + 1);
      };
      branch(-30, H * .86, -.6, 210, 24, 0);                                // from the lower left and the upper right corner
      branch(W + 30, H * .1, Math.PI + .4, 190, 20, 0);
      const flat = tips.filter(t => Math.abs(Math.sin(t[2])) < .75 && (t[0] > W * .62 || t[1] > H * .72))   // birds sit on flatter twigs, clear of a title on the left
        .sort(() => rnd() - .5).slice(0, 4);
      const snow = Array.from({ length: 220 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 3, v: 25 + Math.random() * 55, ph: Math.random() * 6.283 }));
      return { c, perched: flat.map(([x, y], i) => ({ x, y, face: x < W / 2 ? 1 : -1, hop: 3 + i * 2.7 })), snow };
    },
    draw(g, st, t, dt, still) {
      g.clearRect(0, 0, W, H);
      g.drawImage(st.c, 0, 0);
      for (const b of st.perched) {                                         // a hop now and then
        const k = (t + b.hop) % 7, hop = k < .35 ? Math.sin(k / .35 * Math.PI) * 18 : 0;
        if (k < .02 && !still) b.face = -b.face;
        bird(g, b.x, b.y - 28 - hop, 22, (t * 8) % 1, b.face, hop === 0);
      }
      g.fillStyle = 'rgba(245,240,230,.75)';
      for (const f of st.snow) {
        if (!still) { f.y += f.v * dt; f.x += Math.sin(t * .8 + f.ph) * 12 * dt; if (f.y > H + 6) { f.y = -6; f.x = Math.random() * W; } }
        g.globalAlpha = .35 + f.r / 6; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
    }
  });

  /* ---------- data-dots="perch-dots": a wooden rail; a bird hops to the current slide, seen slides leave a seed ---------- */
  let mini = null, miniAt = null;
  const miniSVG = () => `<svg viewBox="-34 -30 70 44" width="44" height="28"><g fill="${BACK}"><path d="M-16 -1 L-33 6 L-32 12 L-15 5z"/><ellipse cx="0" cy="0" rx="20" ry="12.5"/></g>` +
    `<ellipse cx="4" cy="4" rx="14" ry="8" fill="var(--se-accent)"/><circle cx="16" cy="-8.5" r="9.2" fill="${HEAD}"/><ellipse cx="18.5" cy="-6.5" rx="4.8" ry="3.4" fill="#F4F1E8"/>` +
    `<path d="M24 -10.5 L31 -8.6 L24 -6.8z" fill="#2A2016"/><ellipse cx="-4" cy="-2" rx="13" ry="6" fill="${BACK}" opacity=".85"/><path d="M-2 12 v4 M5 12 v4" stroke="#2A2016" stroke-width="2"/></svg>`;
  se.dots('perch-dots', {
    init(dots) { mini = helper('se-perch-bird', miniSVG()); miniAt = null; dots.classList.add('se-perch-dots'); dots.appendChild(mini); },
    update(cur) {
      const first = miniAt === null;
      if (!first && cur !== miniAt) {
        mini.classList.toggle('back', cur < miniAt);
        mini.animate([{ translate: '0 0' }, { translate: '0 -22px', offset: .45 }, { translate: '0 0' }], { duration: 700, easing: 'ease-in-out' });
      }
      miniAt = cur; if (first) mini.style.transition = 'none';
      mini.style.left = (cur * 40 + 20 - 22) + 'px';
      if (first) { mini.offsetWidth; mini.style.transition = ''; }
    }
  });
  se.css(`
#se-dots.se-perch-dots { gap: 0; bottom: 14px; height: 46px; align-items: flex-end; }
#se-dots.se-perch-dots::before { content: ''; position: absolute; left: -20px; right: -20px; bottom: 6px; height: 8px; border-radius: 4px;
  background: linear-gradient(#B07A4A, #7A4E2C); box-shadow: 0 2px 0 rgba(0,0,0,.18); }
#se-dots.se-perch-dots i, #se-dots.se-perch-dots i.cur { width: 40px; height: 14px; border-radius: 0; background: none; box-shadow: none; transform: none; position: relative; }
#se-dots.se-perch-dots i::after { content: ''; position: absolute; left: 15px; bottom: 14px; width: 10px; height: 6px; border-radius: 50%; background: transparent; transition: background .5s; }
#se-dots.se-perch-dots i.seen::after { background: #D8C9A3; box-shadow: 0 0 0 1px rgba(90,75,58,.5); }
#se-dots.se-perch-dots .se-perch-bird { position: absolute; bottom: 12px; width: 44px; height: 28px; transition: left .7s cubic-bezier(.65, 0, .35, 1); }
#se-dots.se-perch-dots .se-perch-bird.back svg { transform: scaleX(-1); }
`);
} });
