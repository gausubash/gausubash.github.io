(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Mesh canvas (hero atmosphere) ─── */
  const canvas = document.getElementById('mesh-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [];
    let mouse = { x: -999, y: -999 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const n = Math.min(60, Math.floor(canvas.width * canvas.height / 22000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.2 + 0.4,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const onHero = window.scrollY < window.innerHeight * 0.85;
      if (!onHero) {
        if (!prefersReducedMotion) requestAnimationFrame(draw);
        return;
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 100) { p.x -= dx * 0.015; p.y -= dy * 0.015; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.2 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    if (!prefersReducedMotion) {
      resize();
      draw();
      window.addEventListener('resize', resize);
      document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    }
  }

  /* ─── Cursor glow ─── */
  const glow = document.getElementById('cursor-glow');
  if (glow && !prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  /* ─── Header & body state ─── */
  const header = document.getElementById('header');
  const progressBar = document.getElementById('story-progress');
  const heroShowcase = document.querySelector('.hero-showcase');

  function getHeroZoneHeight() {
    return heroShowcase?.offsetHeight ?? 600;
  }

  function onScroll() {
    const y = window.scrollY;
    const heroH = getHeroZoneHeight();
    const inHero = y < heroH - 80;

    header.classList.toggle('header--hero', inHero);
    header.classList.toggle('header--solid', !inHero);
    document.body.classList.toggle('on-hero', inHero);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.height = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── Reveal ─── */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  /* ─── Section scroll choreography ─── */
  const navAnchors = document.querySelectorAll('.header__nav a[href^="#"]');
  const snapPanels = document.querySelectorAll('.snap-panel');

  snapPanels.forEach((panel) => {
    panel.querySelectorAll('.reveal-stagger > *').forEach((child, i) => {
      child.style.setProperty('--stagger-i', i);
    });
  });

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const active = entry.isIntersecting && entry.intersectionRatio >= 0.22;
        el.classList.toggle('is-inview', active);

        if (active) {
          el.querySelectorAll('.reveal').forEach((child) => child.classList.add('visible'));
          const sectionId = el.id;
          if (sectionId) {
            navAnchors.forEach((link) => {
              const href = link.getAttribute('href');
              link.classList.toggle('is-active', href === `#${sectionId}`);
            });
          }
        }
      });
    },
    { threshold: [0.15, 0.22, 0.4, 0.6], rootMargin: '-10% 0px -10% 0px' }
  );

  snapPanels.forEach((panel) => sectionObs.observe(panel));

  if (heroShowcase) {
    heroShowcase.classList.add('is-inview');
    heroShowcase.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  /* ─── Metric counters ─── */
  const metrics = document.getElementById('hero-metrics');
  if (metrics) {
    const cObs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      document.querySelectorAll('[data-count]').forEach((el) => {
        const target = +el.dataset.count;
        const start = performance.now();
        const dur = 1400;
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      cObs.disconnect();
    }, { threshold: 0.4 });
    cObs.observe(metrics);
  }

  /* ─── Case study tabs ─── */
  const tabs = document.querySelectorAll('.case-tab');
  const panels = document.querySelectorAll('.case-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.case;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active);
      });
      panels.forEach((p) => p.classList.toggle('active', p.dataset.case === id));
    });
  });

  /* ─── Gallery cycling & lightbox ─── */
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox?.querySelector('.lightbox__img');
  let lbSrcs = [];
  let lbIdx = 0;

  function openLb(srcs, idx) {
    lbSrcs = srcs;
    lbIdx = idx;
    lbImg.src = lbSrcs[lbIdx];
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  if (lightbox) {
    lightbox.querySelector('.lightbox__x').addEventListener('click', closeLb);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => {
      lbIdx = (lbIdx - 1 + lbSrcs.length) % lbSrcs.length;
      lbImg.src = lbSrcs[lbIdx];
    });
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => {
      lbIdx = (lbIdx + 1) % lbSrcs.length;
      lbImg.src = lbSrcs[lbIdx];
    });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbSrcs.length) % lbSrcs.length; lbImg.src = lbSrcs[lbIdx]; }
      if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbSrcs.length; lbImg.src = lbSrcs[lbIdx]; }
    });
  }

  document.querySelectorAll('[data-gallery]').forEach((gal) => {
    const imgs = [...gal.querySelectorAll('img')];
    if (!imgs.length) return;
    let cur = imgs.findIndex((i) => i.classList.contains('active'));
    if (cur < 0) { cur = 0; imgs[0].classList.add('active'); }

    if (imgs.length > 1) {
      let timer = setInterval(() => {
        imgs[cur].classList.remove('active');
        cur = (cur + 1) % imgs.length;
        imgs[cur].classList.add('active');
      }, 3500);
      gal.addEventListener('mouseenter', () => clearInterval(timer));
      gal.addEventListener('mouseleave', () => {
        timer = setInterval(() => {
          imgs[cur].classList.remove('active');
          cur = (cur + 1) % imgs.length;
          imgs[cur].classList.add('active');
        }, 3500);
      });
    }

    gal.addEventListener('click', () => {
      openLb(imgs.map((i) => i.src), cur);
    });
  });

  document.querySelectorAll('.gallery-strip__track img').forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLb([img.src], 0));
  });

  /* ─── Mobile menu ─── */
  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('nav-backdrop');

  function closeMenu() {
    menuBtn?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('open');
    navBackdrop?.classList.remove('is-visible');
    navBackdrop?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  function setMenuOpen(open) {
    nav?.classList.toggle('open', open);
    menuBtn?.classList.toggle('open', open);
    menuBtn?.setAttribute('aria-expanded', open);
    navBackdrop?.classList.toggle('is-visible', open);
    navBackdrop?.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('nav-open', open);
  }

  menuBtn?.addEventListener('click', () => {
    setMenuOpen(!nav?.classList.contains('open'));
  });

  navBackdrop?.addEventListener('click', closeMenu);

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) closeMenu();
  });

  /* ─── Smooth scroll ─── */
  function getHeaderScrollOffset() {
    const header = document.querySelector('.header');
    return (header?.offsetHeight ?? 68) + 12;
  }

  function scrollToAnchor(target, behavior = 'smooth') {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const y = target.getBoundingClientRect().top + window.scrollY - getHeaderScrollOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : behavior });
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        scrollToAnchor(target);
        closeMenu();
      }
    });
  });

  /* ─── Hero robot: ceiling 6-DOF arm demo cycle ─── */
  const heroStage = document.getElementById('hero-robot-stage');
  const heroPayload = document.getElementById('hero-payload');
  const heroPayloadImg = heroPayload?.querySelector('img');

  window.addEventListener('hero-cycle-photo', (event) => {
    const url = event.detail?.url;
    if (heroPayloadImg && url) heroPayloadImg.src = url;
  });
  const robotEffectorEl = document.getElementById('robot-effector');
  const robotEffectorProxy = document.getElementById('robot-effector-proxy');
  let heroCycleRunning = false;

  const EFFECTOR_PAYLOAD_STAGES = new Set([
    'pick', 'lift', 'show', 'retract',
  ]);

  function getRobotEffector() {
    if (heroStage?.classList.contains('hero__showcase-main--3d') && robotEffectorProxy) {
      return robotEffectorProxy;
    }
    return robotEffectorEl;
  }

  function mountPayloadOnEffector() {
    const effector = getRobotEffector();
    if (!heroPayload || !effector) return;
    effector.appendChild(heroPayload);
    heroPayload.classList.add('hero__payload--carried');
  }

  function mountPayloadOnBelt() {
    if (!heroPayload || !heroStage) return;
    heroStage.appendChild(heroPayload);
    heroPayload.classList.remove('hero__payload--carried');
  }

  function syncPayloadMount(stageName) {
    const is3d = heroStage?.classList.contains('hero__showcase-main--3d');
    if (is3d) {
      mountPayloadOnBelt();
      return;
    }
    if (EFFECTOR_PAYLOAD_STAGES.has(stageName)) mountPayloadOnEffector();
    else mountPayloadOnBelt();
  }

  const ARM_MS = 2000;

  function armDuration() {
    if (!heroStage) return ARM_MS;
    const raw = getComputedStyle(heroStage).getPropertyValue('--hero-arm-ms').trim();
    if (!raw) return ARM_MS;
    if (raw.endsWith('ms')) return parseFloat(raw);
    if (raw.endsWith('s')) return parseFloat(raw) * 1000;
    return ARM_MS;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function waitArm(extra = 0) {
    return wait(armDuration() + extra);
  }

  function waitBeltFeed(direction) {
    const is3d = heroStage?.classList.contains('hero__showcase-main--3d');
    if (!is3d) {
      const ms = direction === 'forward' ? armDuration() * 1.2 : armDuration() * 0.9;
      return wait(ms);
    }
    return new Promise((resolve) => {
      const timeoutMs = 45000;
      const timer = setTimeout(() => {
        window.removeEventListener('hero-belt-feed', onFeed);
        resolve();
      }, timeoutMs);
      function onFeed(e) {
        if (e.detail?.direction === direction && e.detail?.phase === 'complete') {
          clearTimeout(timer);
          window.removeEventListener('hero-belt-feed', onFeed);
          resolve();
        }
      }
      window.addEventListener('hero-belt-feed', onFeed);
      window.dispatchEvent(new CustomEvent('hero-belt-command', { detail: { direction } }));
    });
  }

  function setArmStage(name) {
    if (!heroStage) return;
    const is3d = heroStage.classList.contains('hero__showcase-main--3d');
    heroStage.className = `hero__showcase-main hero__showcase-main--robot hero-stage--${name}`;
    if (is3d) heroStage.classList.add('hero__showcase-main--3d');
    heroStage.classList.add('hero-stage--show');
    syncPayloadMount(name);
    window.dispatchEvent(new CustomEvent('hero-arm-stage', { detail: { stage: name } }));
  }

  async function runCssPhotoPulse() {
    if (!heroPayload?.classList.contains('hero__payload--carried')) {
      await wait(armDuration() * 2);
      return;
    }
    const dur = Math.round(armDuration() * 0.85);
    const base = 'translate(-50%, -58%) rotateX(var(--photo-level-x, 0deg))';
    const showScale = 1.08;
    const peak = showScale * 3;
    heroPayload.style.transition = `transform ${dur}ms cubic-bezier(0.65, 0, 0.35, 1)`;
    heroPayload.style.transform = `${base} scale(${peak})`;
    heroPayload.style.zIndex = '20';
    await wait(dur + 80);
    heroPayload.style.transform = `${base} scale(${showScale})`;
    await wait(dur + 80);
    heroPayload.style.transition = '';
    heroPayload.style.zIndex = '';
  }

  function runPhotoPulse() {
    const is3d = heroStage?.classList.contains('hero__showcase-main--3d');
    if (!is3d) return runCssPhotoPulse();
    return new Promise((resolve) => {
      const timeoutMs = armDuration() * 3.5;
      const timer = setTimeout(() => {
        window.removeEventListener('hero-photo-pulse', onPulse);
        resolve();
      }, timeoutMs);
      function onPulse(e) {
        if (e.detail?.phase === 'complete' && e.detail?.target === 'pulse') {
          clearTimeout(timer);
          window.removeEventListener('hero-photo-pulse', onPulse);
          resolve();
        }
      }
      window.addEventListener('hero-photo-pulse', onPulse);
      window.dispatchEvent(new CustomEvent('hero-photo-pulse', { detail: { action: 'start' } }));
    });
  }

  function waitPhotoHandoff() {
    return new Promise((resolve) => {
      const timeoutMs = armDuration() + 600;
      const timer = setTimeout(resolve, timeoutMs);
      function onHandoff() {
        clearTimeout(timer);
        window.removeEventListener('hero-photo-handoff', onHandoff);
        resolve();
      }
      window.addEventListener('hero-photo-handoff', onHandoff);
    });
  }

  async function runRobotMotionCycle() {
    setArmStage('belt-stop');
    await waitArm();

    setArmStage('pick');
    await waitPhotoHandoff();

    setArmStage('lift');
    await waitArm(260);

    setArmStage('show');
    await waitArm(280);

    await runPhotoPulse();

    setArmStage('retract');
    await waitArm(460);

    setArmStage('place');
    await waitArm(420);
  }

  function isHeroInView() {
    if (!heroStage) return false;
    const rect = heroStage.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 1;
    const visiblePx = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return visiblePx > Math.min(vh * 0.12, 80);
  }

  async function runHeroRobotCycle() {
    if (!heroStage || heroCycleRunning) return;
    heroCycleRunning = true;
    window.__heroCycleActive = true;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setArmStage('show');
      return;
    }

    while (heroCycleRunning) {
      setArmStage('belt');
      await waitBeltFeed('forward');

      await runRobotMotionCycle();

      setArmStage('belt');
      await wait(120);
      await waitBeltFeed('reverse');
      await wait(400);
    }
  }

  if (heroStage) {
    let heroVisible = isHeroInView();
    let hero3dResolved = false;

    const heroPoseTeach = new URLSearchParams(window.location.search).has('heroTeach')
    || window.location.hash.includes('heroTeach');

    function isHero3dReady() {
      const wrap = document.getElementById('hero-robot-canvas-wrap');
      const stage = document.getElementById('hero-robot-stage');
      return window.__heroRobot3dReady === true
        || wrap?.dataset.ready === 'true'
        || stage?.classList.contains('hero__showcase-main--3d');
    }

    function isHeroDemoReady() {
      return isHero3dReady() || window.__heroRobotCssFallback === true;
    }

    function markHero3dResolved() {
      if (hero3dResolved) return;
      hero3dResolved = true;
      heroVisible = heroVisible || isHeroInView();
      tryStartHeroCycle();
    }

    function tryStartHeroCycle() {
      if (heroPoseTeach) return;
      heroVisible = heroVisible || isHeroInView();
      if (!heroVisible || !hero3dResolved || heroCycleRunning) return;
      runHeroRobotCycle();
    }

    const heroRobotObs = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        heroVisible = true;
        tryStartHeroCycle();
      }
    }, { threshold: [0, 0.08, 0.2] });
    heroRobotObs.observe(heroStage);

    window.addEventListener('hero-robot-3d-ready', markHero3dResolved);
    window.addEventListener('hero-start-cycle', () => {
      hero3dResolved = true;
      heroVisible = heroVisible || isHeroInView();
      tryStartHeroCycle();
    });

    if (isHeroDemoReady()) markHero3dResolved();

    requestAnimationFrame(() => {
      heroVisible = heroVisible || isHeroInView();
      if (isHeroDemoReady()) markHero3dResolved();
      else tryStartHeroCycle();
    });
  }

  const heroVideoSlot = document.getElementById('hero-video-slot');
  const heroVideo = document.getElementById('hero-video');
  const heroVideoPlay = document.getElementById('hero-video-play');
  if (heroVideo && heroVideoSlot && heroVideo.src) {
    heroVideoSlot.hidden = false;
    heroVideoPlay?.addEventListener('click', () => {
      heroVideoSlot.classList.add('is-playing');
      heroVideo.play();
    });
  }

  /* ─── Image error fallback ─── */
  document.querySelectorAll('.case-panel__media img').forEach((img) => {
    img.addEventListener('error', function handler() {
      this.removeEventListener('error', handler);
      const wrap = this.closest('.case-panel__media');
      if (wrap && !wrap.classList.contains('case-panel__media--viz')) {
        wrap.classList.add('case-panel__media--viz');
        wrap.innerHTML = '<div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--hero-muted);letter-spacing:0.1em;text-transform:uppercase">Research imagery</div>';
      }
    });
  });

  /* ─── Interactive career graph ─── */
  const careerGraph = document.getElementById('career-graph');
  if (careerGraph) {
    const YEAR_MIN = 2009;
    const YEAR_MAX = 2026;
    const SPAN = YEAR_MAX - YEAR_MIN;

    function yearToPct(year) {
      return ((year - YEAR_MIN) / SPAN) * 100;
    }

    careerGraph.querySelectorAll('.career-bar').forEach((bar) => {
      const start = +bar.dataset.start;
      const end = +bar.dataset.end;
      bar.style.left = yearToPct(start) + '%';
      bar.style.width = Math.max(yearToPct(end) - yearToPct(start), 4) + '%';
    });

    careerGraph.querySelectorAll('.career-node').forEach((node) => {
      const year = +node.dataset.year;
      node.style.left = yearToPct(year) + '%';
    });

    const details = careerGraph.querySelectorAll('.career-detail');
    const nodes = careerGraph.querySelectorAll('.career-node');
    const bars = careerGraph.querySelectorAll('.career-bar');

    function selectCareer(index) {
      const idx = String(index);
      details.forEach((d) => {
        const active = d.dataset.index === idx;
        d.classList.toggle('career-detail--active', active);
        d.hidden = !active;
      });
      nodes.forEach((n) => n.classList.toggle('career-node--active', n.dataset.index === idx));
      bars.forEach((b) => b.classList.toggle('career-bar--selected', b.dataset.index === idx));
    }

    nodes.forEach((n) => {
      n.addEventListener('click', () => selectCareer(n.dataset.index));
    });

    bars.forEach((b) => {
      const activate = () => selectCareer(b.dataset.index);
      b.addEventListener('click', activate);
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });

    const graphObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        careerGraph.classList.add('animated');
        graphObs.disconnect();
      }
    }, { threshold: 0.3 });
    graphObs.observe(careerGraph);

    selectCareer(0);
  }

  /* Init header state */
  header?.classList.add('header--hero');
  document.body.classList.add('on-hero');

})();
