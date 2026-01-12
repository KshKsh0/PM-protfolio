(() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Determine page key from filename
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const pageKey = file.replace('.html','') || 'index';
  document.body.dataset.page = pageKey;

  // Mobile menu toggle (keeps existing behavior, but safer if repeated)
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (btn && menu && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  // Active nav link highlighting (desktop + mobile)
  const normalize = (href) => (href || '').split('#')[0].split('?')[0].toLowerCase();
  const current = normalize(file);
  document.querySelectorAll('nav a[href]').forEach((a) => {
    const href = normalize(a.getAttribute('href'));
    if (!href) return;
    if (href === current) a.classList.add('active');
  });

  // Smooth navbar "pill" indicator (desktop only)
  const desktopNav = document.querySelector('nav .md\\:flex');
  if (desktopNav) {
    const indicator = document.createElement('div');
    indicator.className = 'nav-indicator';
    desktopNav.style.position = 'relative';
    desktopNav.prepend(indicator);

    const positionIndicator = () => {
      const active = desktopNav.querySelector('a.navlink.active');
      if (!active) return;
      const aRect = active.getBoundingClientRect();
      const nRect = desktopNav.getBoundingClientRect();
      const left = aRect.left - nRect.left;
      indicator.style.left = `${Math.max(0, left - 8)}px`;
      indicator.style.width = `${aRect.width + 16}px`;
      indicator.style.opacity = '1';
    };

    positionIndicator();
    window.addEventListener('resize', positionIndicator);

    // Move indicator on hover for extra "fancy" feel
    desktopNav.querySelectorAll('a.navlink').forEach((a) => {
      a.addEventListener('mouseenter', () => {
        const aRect = a.getBoundingClientRect();
        const nRect = desktopNav.getBoundingClientRect();
        const left = aRect.left - nRect.left;
        indicator.style.left = `${Math.max(0, left - 8)}px`;
        indicator.style.width = `${aRect.width + 16}px`;
        indicator.style.opacity = '1';
      });
    });
    desktopNav.addEventListener('mouseleave', positionIndicator);
  }

  // Page transition overlay
  const overlay = document.getElementById('pageTransition');
  if (overlay && !prefersReduced) {
    // Enter effect: briefly show overlay then fade out
    document.body.classList.add('is-entering');
    window.setTimeout(() => document.body.classList.remove('is-entering'), 520);

    // Intercept internal navigations
    const isInternal = (url) => {
      try {
        const u = new URL(url, location.href);
        return u.origin === location.origin;
      } catch {
        return false;
      }
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (a.target && a.target !== '_self') return;

      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

      if (!isInternal(href)) return;

      const next = new URL(href, location.href);
      if (next.pathname === location.pathname && next.hash) return; // same page anchor

      e.preventDefault();
      document.body.classList.add('is-leaving');

      // Close mobile menu on nav
      if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');

      window.setTimeout(() => {
        location.href = next.href;
      }, 520);
    });

    // Handle bfcache back/forward
    window.addEventListener('pageshow', (evt) => {
      if (evt.persisted) {
        document.body.classList.remove('is-leaving');
        document.body.classList.add('is-entering');
        window.setTimeout(() => document.body.classList.remove('is-entering'), 520);
      }
    });
  }

  // Scroll reveal animations
  const candidates = [
    ...document.querySelectorAll('main section'),
    ...document.querySelectorAll('main .glass'),
    ...document.querySelectorAll('main .grid > *'),
  ];

  // de-dupe
  const uniq = Array.from(new Set(candidates)).filter(Boolean);

  if (!prefersReduced && 'IntersectionObserver' in window) {
    uniq.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    
    // Expose observer for dynamically-added elements (e.g., reflections loaded from JSON)
    window.__revealObserve = (el) => {
      if (!el) return;
      el.classList.add('reveal');
      io.observe(el);
    };
uniq.forEach((el) => io.observe(el));
  }

  // Theme picker (accent color) — persisted in localStorage
  const THEME_KEY = 'portfolioAccent';
  const applyAccent = (hex) => {
    if (!hex) return;
    // compute a nice secondary color by rotating hue in HSL
    const toRgb = (h) => {
      const m = h.replace('#','');
      const n = parseInt(m.length === 3 ? m.split('').map(x=>x+x).join('') : m, 16);
      return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
    };
    const rgb = toRgb(hex);
    const r = rgb.r/255, g = rgb.g/255, b = rgb.b/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g-b)/d) % 6;
      else if (max === g) h = (b-r)/d + 2;
      else h = (r-g)/d + 4;
      h = Math.round(h*60);
      if (h < 0) h += 360;
    }
    const h2 = (h + 40) % 360;
    const accent2 = `hsl(${h2} 90% 60%)`;
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-r', String(rgb.r));
    document.documentElement.style.setProperty('--accent-g', String(rgb.g));
    document.documentElement.style.setProperty('--accent-b', String(rgb.b));
    document.documentElement.style.setProperty('--accent2', accent2);
  };

  // Build UI
  const fab = document.createElement('div');
  fab.className = 'theme-fab';
  fab.innerHTML = `
    <button class="theme-btn" type="button" aria-label="Theme">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22c5.523 0 10-4.477 10-10 0-1.53-.343-2.98-.956-4.277-.15-.317-.56-.39-.81-.14l-1.75 1.75a1 1 0 0 1-1.414 0l-1.415-1.415a1 1 0 0 1 0-1.414l1.75-1.75c.25-.25.176-.66-.14-.81C14.98 2.343 13.53 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" stroke-width="1.6"/>
      </svg>
    </button>
    <div class="theme-panel">
      <div class="theme-row">
        <div class="theme-label">Accent color</div>
        <input class="theme-input" id="accentPicker" type="color" value="#7C3AED" />
      </div>
      <div class="theme-presets" aria-label="Presets">
        <button class="theme-swatch" type="button" data-color="#7C3AED" style="background:#7C3AED"></button>
        <button class="theme-swatch" type="button" data-color="#22C55E" style="background:#22C55E"></button>
        <button class="theme-swatch" type="button" data-color="#06B6D4" style="background:#06B6D4"></button>
        <button class="theme-swatch" type="button" data-color="#F97316" style="background:#F97316"></button>
        <button class="theme-swatch" type="button" data-color="#EAB308" style="background:#EAB308"></button>
        <button class="theme-swatch" type="button" data-color="#EC4899" style="background:#EC4899"></button>
      </div>
    </div>
  `;
  document.body.appendChild(fab);

  const DEFAULT_ACCENT = '#1A073B';
  const stored = localStorage.getItem(THEME_KEY);
  applyAccent(stored || DEFAULT_ACCENT);
  const picker = fab.querySelector('#accentPicker');
  if (picker) picker.value = stored || DEFAULT_ACCENT;

  const toggle = fab.querySelector('.theme-btn');
  if (toggle) toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    fab.classList.toggle('open');
  });
  document.addEventListener('click', () => fab.classList.remove('open'));
  fab.addEventListener('click', (e) => e.stopPropagation());

  if (picker) {
    picker.addEventListener('input', () => {
      const hex = picker.value;
      applyAccent(hex);
      localStorage.setItem(THEME_KEY, hex);
    });
  }
  fab.querySelectorAll('.theme-swatch[data-color]').forEach((b) => {
    b.addEventListener('click', () => {
      const hex = b.getAttribute('data-color');
      if (!hex) return;
      if (picker) picker.value = hex;
      applyAccent(hex);
      localStorage.setItem(THEME_KEY, hex);
    });
  });

  // Scroll-zoom icons: wheel while cursor is over the icon
  document.querySelectorAll('.scroll-zoom').forEach((el) => {
    let scale = 1;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const update = () => {
      el.style.transform = `scale(${scale})`;
      el.classList.toggle('is-active', scale !== 1);
      const t = (scale - 0.9) / (1.7 - 0.9); // 0..1
      const hue = 210 + t * 140; // 210..350
      const sat = 85;
      const light = 68;
      el.style.background = `hsla(${hue} ${sat}% ${light}% / .10)`;
      const icon = el.querySelector('i');
      if (icon) icon.style.color = `hsl(${hue} ${sat}% ${Math.min(90, light + 10)}%)`;
    };
    update();

    el.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      const delta = Math.sign(evt.deltaY);
      scale = clamp(scale + (delta < 0 ? 0.08 : -0.08), 0.9, 1.7);
      update();
    }, { passive: false });

    el.addEventListener('mouseleave', () => {
      scale = 1;
      el.style.background = '';
      const icon = el.querySelector('i');
      if (icon) icon.style.color = '';
      update();
    });
  });
})();
