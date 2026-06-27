(function () {
  'use strict';

  document.querySelector('.resume-hero')?.classList.add('visible');
  document.querySelector('.resume-pitch')?.classList.add('visible');

  const navLinks = document.querySelectorAll('.resume-sidebar nav a, .resume-mobile-nav a');

  function getScrollOffset() {
    const root = document.documentElement;
    const headerH = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 68;
    const mobileNav = document.querySelector('.resume-mobile-nav');
    const navVisible = mobileNav && getComputedStyle(mobileNav).display !== 'none';
    const navH = navVisible ? mobileNav.offsetHeight : 0;
    return headerH + (navH > 0 ? navH + 12 : 12);
  }

  function scrollToSection(target, behavior) {
    const y = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: Math.max(0, y), behavior });
  }

  /* ─── Smooth in-page navigation ─── */
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollToSection(target, reducedMotion ? 'auto' : 'smooth');
      history.replaceState(null, '', href);
    });
  });

  /* ─── Sidebar + mobile nav active section ─── */
  const sections = document.querySelectorAll('.resume-section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.2, rootMargin: '-12% 0px -55% 0px' }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ─── Reveal on scroll ─── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
  );

  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));

  /* ─── Expandable experience cards ─── */
  document.querySelectorAll('.exp-card__header').forEach((header) => {
    header.addEventListener('click', () => {
      const card = header.closest('.exp-card');
      const open = card.classList.toggle('open');
      header.setAttribute('aria-expanded', open);
    });
  });

  /* ─── Project showcase tabs ─── */
  document.querySelectorAll('.project-showcase').forEach((showcase) => {
    const tabs = showcase.querySelectorAll('.project-tab');
    const panels = showcase.querySelectorAll('.project-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = tab.dataset.index;
        tabs.forEach((t) => t.classList.toggle('active', t === tab));
        panels.forEach((p) => p.classList.toggle('active', p.dataset.index === index));
      });
    });

    /* Gallery cycling per panel */
    panels.forEach((panel) => {
      const gallery = panel.querySelector('.project-panel__gallery');
      if (!gallery) return;

      const images = gallery.querySelectorAll('img');
      const dotsContainer = panel.querySelector('.project-panel__gallery-dots');
      if (images.length <= 1) return;

      let current = 0;
      images[0].classList.add('active');

      const dots = Array.from(images).map((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Image ' + (i + 1));
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          goTo(i);
        });
        dotsContainer.appendChild(dot);
        return dot;
      });

      function goTo(i) {
        images[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = i;
        images[current].classList.add('active');
        dots[current].classList.add('active');
      }

      let interval = setInterval(() => goTo((current + 1) % images.length), 3500);

      gallery.addEventListener('mouseenter', () => clearInterval(interval));
      gallery.addEventListener('mouseleave', () => {
        interval = setInterval(() => goTo((current + 1) % images.length), 3500);
      });

      gallery.addEventListener('click', () => {
        const lb = document.getElementById('resume-lightbox');
        if (!lb) return;
        lb.querySelector('.lightbox__img').src = images[current].src;
        lb.hidden = false;
        document.body.style.overflow = 'hidden';
      });
    });
  });

  /* ─── Lightbox ─── */
  const lightbox = document.getElementById('resume-lightbox');
  if (lightbox) {
    lightbox.querySelector('.lightbox__close').addEventListener('click', () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.hidden = true;
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) {
        lightbox.hidden = true;
        document.body.style.overflow = '';
      }
    });
  }

  /* ─── Print ─── */
  document.getElementById('print-resume')?.addEventListener('click', () => window.print());

  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.exp-card').forEach((c) => c.classList.add('open'));
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  });

})();
