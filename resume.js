(function () {
  'use strict';

  /* ─── Sidebar + mobile nav active section ─── */
  const sections = document.querySelectorAll('.resume-section[id]');
  const sideLinks = document.querySelectorAll('.resume-sidebar nav a, .resume-mobile-nav a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          sideLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: '-20% 0px -60% 0px' }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ─── Reveal on scroll ─── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

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

  /* Open all experience cards for print */
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.exp-card').forEach((c) => c.classList.add('open'));
  });

})();
