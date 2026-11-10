(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /** Run `on(visible)` whenever `el` enters or leaves the viewport. */
  const watch = (el, on, opts) =>
    new IntersectionObserver(es => es.forEach(e => on(e.isIntersecting)), opts).observe(el);

  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav state ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$('.nav nav a');
  $$('.hero, #games, #apps, #about, #contact').forEach(sec =>
    watch(sec, vis => {
      if (vis) links.forEach(a => a.classList.toggle('on', a.hash === '#' + sec.id));
    }, { rootMargin: '-45% 0px -50% 0px' }));

  /* ---------- scroll reveal ---------- */
  const revealer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
  }), { threshold: 0.08 });
  $$('.reveal').forEach((el, i) => {
    if (el.closest('.hero')) el.style.setProperty('--d', i * 0.09 + 's');
    revealer.observe(el);
  });

  /* ---------- ambient colour follows the section in view ---------- */
  $$('[data-aura]:not(body)').forEach(sec =>
    watch(sec, vis => { if (vis) document.body.dataset.aura = sec.dataset.aura; },
      { rootMargin: '-40% 0px -40% 0px' }));

  /* ---------- glass highlight follows the pointer ---------- */
  if (fine) {
    $$('.glass').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    }));

    /* hero tiles parallax */
    const orbit = $('#orbit');
    const tiles = $$('.tile', orbit);
    addEventListener('pointermove', e => {
      if (scrollY > innerHeight) return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      tiles.forEach(t => {
        const d = +t.dataset.depth;
        t.style.setProperty('--px', nx * d + 'px');
        t.style.setProperty('--py', ny * d + 'px');
      });
    }, { passive: true });
  }

  /* ================= Darklight ================= */
  /* torch: the screenshot is only lit where your pointer is */
  const stage = $('#stage');
  const stageImg = $('#stageImg');
  let torchUser = 0, stageVisible = false;
  const setTorch = (x, y) => {
    stage.style.setProperty('--tx', x + '%');
    stage.style.setProperty('--ty', y + '%');
  };
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    setTorch((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
    torchUser = performance.now();
    stage.classList.add('lit');
  });
  watch(stage, v => { stageVisible = v; });
  if (!calm) {
    // wander on its own until (and 3s after) someone takes the torch
    const wander = t => {
      if (stageVisible && t - torchUser > 3000) {
        setTorch(50 + Math.sin(t / 1900) * 32, 56 + Math.sin(t / 1300 + 1) * 22);
      }
      requestAnimationFrame(wander);
    };
    requestAnimationFrame(wander);
  }

  $('#thumbs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.classList.contains('on')) return;
    $$('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
    stageImg.classList.add('swap');
    setTimeout(() => {
      stageImg.src = b.dataset.src;
      stageImg.decode().catch(() => {}).then(() => stageImg.classList.remove('swap'));
    }, 300);
  });

  /* embers rising through the panel */
  const cv = $('.embers');
  if (cv && !calm) {
    const ctx = cv.getContext('2d');
    const host = cv.parentElement;
    let w = 0, h = 0, run = false, raf = 0, parts = [];
    const spawn = (anyY) => ({
      x: Math.random() * w, y: anyY ? Math.random() * h : h + 8,
      r: 0.6 + Math.random() * 1.8, vy: 0.25 + Math.random() * 0.8,
      ph: Math.random() * 6.28, life: 0.4 + Math.random() * 0.6,
      green: Math.random() < 0.18,
    });
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: clamp(Math.round(w * h / 14000), 24, 90) }, () => spawn(true));
    };
    const draw = t => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.y -= p.vy;
        p.x += Math.sin(t / 900 + p.ph) * 0.35;
        const a = p.life * clamp(p.y / h, 0, 1) * (0.6 + 0.4 * Math.sin(t / 200 + p.ph));
        ctx.fillStyle = p.green ? `rgba(182,227,58,${a})` : `rgba(255,${90 + p.r * 40 | 0},50,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        if (p.y < -8) Object.assign(p, spawn(false));
      }
      if (run) raf = requestAnimationFrame(draw);
    };
    new ResizeObserver(size).observe(host);
    watch(host, v => {
      run = v;
      cancelAnimationFrame(raf);
      if (v) raf = requestAnimationFrame(draw);
    });
  }

  /* ================= Lumo ================= */
  /* photo stack that fans out and shuffles */
  const fan = $('#fan');
  const cards = $$('img', fan);
  const n = cards.length;
  const slots = { 0: 'p0', 1: 'p1', 2: 'p2', [n - 1]: 'pl', [n - 2]: 'pl2' };
  let top = 0, fanVisible = false, fanHold = false;
  const layout = () => {
    cards.forEach((c, i) => { c.className = slots[(i - top + n) % n] || ''; });
    $('#fanCount').textContent = `${top + 1} / ${n}`;
  };
  const step = d => { top = (top + d + n) % n; layout(); };
  layout();
  fan.addEventListener('click', () => step(1));
  $('#fanNext').addEventListener('click', () => step(1));
  $('#fanPrev').addEventListener('click', () => step(-1));
  let sx = null;
  fan.addEventListener('pointerdown', e => { sx = e.clientX; });
  fan.addEventListener('pointerup', e => {
    if (sx !== null && Math.abs(e.clientX - sx) > 40) {
      step(e.clientX < sx ? 1 : -1);
      fan.addEventListener('click', ev => ev.stopImmediatePropagation(), { once: true, capture: true });
    }
    sx = null;
  });
  const lumo = $('#lumo');
  lumo.addEventListener('pointerenter', () => { fanHold = true; });
  lumo.addEventListener('pointerleave', () => { fanHold = false; });
  watch(fan, v => { fanVisible = v; }, { threshold: 0.4 });
  if (!calm) setInterval(() => { if (fanVisible && !fanHold && !document.hidden) step(1); }, 3200);

  /* ================= Gamepad Tester ================= */
  /* live controller: mirrors a real gamepad if one is connected, otherwise demos itself */
  const pad = $('#pad');
  const ls = $('#ls'), rs = $('#rs');
  const out = { lx: $('#lx'), ly: $('#ly'), rx: $('#rx'), ry: $('#ry') };
  const btns = {};
  $$('[data-b]', pad).forEach(b => { btns[b.dataset.b] = b; });
  const padStatus = $('#padStatus');
  const TRAVEL = 11;
  let padVisible = false, ptr = null, ptrAt = 0, demoBtn = -1, demoAt = 0;

  const moveStick = (el, x, y) => {
    el.setAttribute('transform', `translate(${(x * TRAVEL).toFixed(1)} ${(y * TRAVEL).toFixed(1)})`);
    el.classList.toggle('on', Math.hypot(x, y) > 0.92);
  };
  const render = (lx, ly, rx, ry, pressed) => {
    moveStick(ls, lx, ly); moveStick(rs, rx, ry);
    out.lx.textContent = lx.toFixed(2); out.ly.textContent = ly.toFixed(2);
    out.rx.textContent = rx.toFixed(2); out.ry.textContent = ry.toFixed(2);
    for (const k in btns) btns[k].classList.toggle('on', pressed(+k));
  };

  pad.addEventListener('pointermove', e => {
    const r = pad.getBoundingClientRect();
    ptr = {
      x: clamp(((e.clientX - r.left) / r.width - 0.5) * 2.4, -1, 1),
      y: clamp(((e.clientY - r.top) / r.height - 0.5) * 2.4, -1, 1),
    };
    ptrAt = performance.now();
  });
  pad.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-b]');
    if (b) { demoBtn = +b.dataset.b; demoAt = performance.now() + 250; }
  });
  watch(pad, v => { padVisible = v; });

  const realPad = () => (navigator.getGamepads ? [...navigator.getGamepads()].find(g => g && g.connected) : null);
  let wasLive = false;
  const DEMO_ORDER = [0, 1, 3, 2, 5, 15, 13, 14, 12, 4, 7, 6];
  const tick = t => {
    if (padVisible) {
      const gp = realPad();
      if (!!gp !== wasLive) {
        wasLive = !!gp;
        pad.classList.toggle('live', wasLive);
        padStatus.textContent = gp ? `Live — ${gp.id.replace(/\s*\(.*\)$/, '')}` : 'Demo — move your pointer, or connect a controller';
      }
      if (gp) {
        const a = gp.axes;
        render(a[0] || 0, a[1] || 0, a[2] || 0, a[3] || 0, i => !!(gp.buttons[i] && gp.buttons[i].pressed));
      } else {
        const usePtr = ptr && t - ptrAt < 2500;
        const lx = usePtr ? ptr.x : Math.cos(t / 700) * 0.8;
        const ly = usePtr ? ptr.y : Math.sin(t / 700) * 0.8;
        const rx = usePtr ? -ptr.x * 0.6 : Math.sin(t / 1100) * 0.6;
        const ry = usePtr ? ptr.y * 0.6 : Math.cos(t / 900) * 0.4;
        if (t > demoAt) { // idle: tap through the buttons
          demoBtn = calm ? -1 : DEMO_ORDER[Math.floor(t / 420) % DEMO_ORDER.length];
          if (Math.floor(t / 210) % 2) demoBtn = -1;
        }
        render(lx, ly, rx, ry, i => i === demoBtn);
      }
    }
    requestAnimationFrame(tick);
  };
  if (calm) render(0, 0, 0, 0, () => false);
  requestAnimationFrame(tick);

  /* ================= Renderlight ================= */
  /* a phone that plays the real wallpapers; tap it and it ripples back */
  const phone = $('#phone');
  const wall = $('#wallVideo');
  let wallVisible = false;
  const loadScene = name => {
    wall.poster = `images/renderlight/${name}.webp`;
    if (calm) return; // poster only when motion is unwelcome
    wall.src = `videos/renderlight/${name}.mp4`;
    if (wallVisible) wall.play().catch(() => {});
  };
  watch(phone, v => {
    wallVisible = v;
    if (calm) return;
    if (!v) wall.pause();
    else if (!wall.getAttribute('src')) loadScene('aurora');
    else wall.play().catch(() => {});
  }, { rootMargin: '200px' });

  $('#scenes').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.classList.contains('on')) return;
    $$('#scenes button').forEach(x => x.classList.toggle('on', x === b));
    wall.classList.add('swap');
    setTimeout(() => { loadScene(b.dataset.scene); wall.classList.remove('swap'); }, 320);
  });

  phone.addEventListener('pointerdown', e => {
    const r = phone.getBoundingClientRect();
    phone.classList.add('touched');
    ['', 'r2'].forEach(c => {
      const ring = document.createElement('span');
      ring.className = 'ripple ' + c;
      ring.style.left = e.clientX - r.left - phone.clientLeft + 'px';
      ring.style.top = e.clientY - r.top - phone.clientTop + 'px';
      ring.addEventListener('animationend', () => ring.remove());
      phone.appendChild(ring);
    });
  });

  const lockTime = $('#lockTime'), lockDate = $('#lockDate');
  const clock = () => {
    const d = new Date();
    lockTime.textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
    lockDate.textContent = d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  };
  clock();
  setInterval(clock, 20000);

  /* trailer modal — the player only loads when asked for */
  const modal = $('#trailer');
  const frame = $('#trailerFrame');
  $('#trailerBtn').addEventListener('click', () => {
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/y0RK04XQjzU?autoplay=1&rel=0" title="Gamepad Tester Pro trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    modal.showModal();
  });
  $('#trailerClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', () => { frame.innerHTML = ''; });
})();
