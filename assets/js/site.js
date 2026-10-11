/* CryptoGorac.com — zajednički skript za sve stranice */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopNav = window.matchMedia('(min-width: 992px)');
  const en = doc.lang.startsWith('en');
  const t = en
    ? { open: 'Open menu', close: 'Close menu', na: 'unavailable', locale: 'en-US' }
    : { open: 'Otvori meni', close: 'Zatvori meni', na: 'nedostupno', locale: 'en-US' };

  /* ---------- Navigacija ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navPanel = document.getElementById('nav-panel');
  const subToggles = [...document.querySelectorAll('.nav-sub-toggle')];

  const closeSubs = (except) => subToggles.forEach((t) => { if (t !== except) t.setAttribute('aria-expanded', 'false'); });
  const setMenu = (open) => {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? t.close : t.open);
    navPanel.classList.toggle('is-open', open);
    if (!open) closeSubs();
  };

  navToggle?.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  subToggles.forEach((t) => t.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = t.getAttribute('aria-expanded') !== 'true';
    closeSubs(t);
    t.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) { if (desktopNav.matches) closeSubs(); }
    if (!e.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = subToggles.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (open) { closeSubs(); open.focus(); }
    else if (navToggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); navToggle.focus(); }
  });
  document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('focusout', (e) => {
    if (desktopNav.matches && !item.contains(e.relatedTarget)) closeSubs();
  }));
  desktopNav.addEventListener('change', () => setMenu(false));

  /* ---------- Nazad na vrh ---------- */
  const toTop = document.querySelector('.back-to-top');
  if (toTop) {
    const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      document.getElementById('main')?.focus({ preventScroll: true });
    });
  }

  /* ---------- Pojavljivanje sekcija ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Godina u footeru ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Kod animacija (početna) ---------- */
  const codeEl = document.querySelector('[data-typing]');
  if (codeEl) {
    const source = codeEl.textContent.replace(/^\n+|\s+$/g, '');
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // jednoprolazni tokenizer: string | ključna riječ | .svojstvo | broj | operator
    const tokens = /('[^'\n]*'?)|\b(class|constructor|return|this)\b|\.(\w+)|\b(\d+)\b|(\s[=+]\s)/g;
    const highlight = (s) => {
      let out = '';
      let last = 0;
      s.replace(tokens, (m, str, kw, prop, num, op, idx) => {
        out += esc(s.slice(last, idx));
        if (str) out += `<span class="tok-str">${esc(str)}</span>`;
        else if (kw) out += `<span class="tok-kw">${kw}</span>`;
        else if (prop) out += `.<span class="tok-prop">${prop}</span>`;
        else if (num) out += `<span class="tok-num">${num}</span>`;
        else out += `<span class="tok-op">${esc(op)}</span>`;
        last = idx + m.length;
        return m;
      });
      return out + esc(s.slice(last));
    };
    if (reduceMotion) {
      codeEl.innerHTML = highlight(source);
    } else {
      let i = 0;
      let running = false;
      const tick = () => {
        i = Math.min(source.length, i + 2);
        codeEl.innerHTML = highlight(source.slice(0, i)) + '<span class="caret"></span>';
        if (i < source.length) setTimeout(tick, 28);
        else setTimeout(() => { i = 0; tick(); }, 4000);
      };
      const start = () => {
        if (running) return;
        running = true;
        // zaključaj visinu punog koda, da kucanje ne pomjera ostatak stranice
        const pre = codeEl.closest('pre');
        if (pre) pre.style.minHeight = `${pre.offsetHeight}px`;
        codeEl.textContent = '';
        tick();
      };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { start(); io.disconnect(); } });
        io.observe(codeEl);
      } else start();
    }
  }

  /* ---------- Rotirajući naslov (kontakt) ---------- */
  document.querySelectorAll('.spin-title').forEach((title) => {
    const text = title.textContent.trim();
    title.textContent = '';
    const label = document.createElement('span');
    label.className = 'visually-hidden';
    label.textContent = text;
    title.appendChild(label);
    [...text].forEach((ch, idx) => {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', idx);
      s.textContent = ch === ' ' ? ' ' : ch;
      title.appendChild(s);
    });
    title.classList.add('is-ready');
  });

  /* ---------- Cijene BTC / ETH (crypto stranice) ---------- */
  const btc = document.getElementById('btc-price');
  const eth = document.getElementById('eth-price');
  if (btc && eth) {
    const fmt = new Intl.NumberFormat(t.locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const update = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        btc.textContent = fmt.format(data.bitcoin.usd);
        eth.textContent = fmt.format(data.ethereum.usd);
        btc.dataset.ok = '1';
        const shown = btc.closest('.price-bar');
        if (shown) shown.classList.remove('is-off');
      } catch (err) {
        btc.textContent = eth.textContent = t.na;
        const bar = btc.closest('.price-bar');
        if (bar && !btc.dataset.ok) bar.classList.add('is-off');
      }
    };
    update();
    setInterval(() => { if (!document.hidden) update(); }, 300000);
  }


  /* ---------- Futuristički efekti (lagani, bez biblioteka) ---------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1) Traka napretka čitanja na vrhu stranice
  const bar = document.createElement('div');
  bar.className = 'fx-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let barQueued = false;
  const setBar = () => {
    barQueued = false;
    const max = doc.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', () => { if (!barQueued) { barQueued = true; requestAnimationFrame(setBar); } }, { passive: true });
  requestAnimationFrame(setBar);

  // 2) Animirana mreža čestica u zaglavlju stranice (hero); uz "Reduce Motion" ostaje vidljiva, ali miruje
  const heroes = document.querySelectorAll('.hero, .page-hero');
  if (heroes.length) {
    const startNet = (host) => {
      const cv = document.createElement('canvas');
      cv.className = 'fx-net';
      cv.setAttribute('aria-hidden', 'true');
      host.prepend(cv);
      const ctx = cv.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, finePointer ? 2 : 1.5);
      let w = 0, h = 0, pts = [], visible = true, raf = 0;
      const mouse = { x: -1e4, y: -1e4 };
      const size = () => {
        w = host.clientWidth; h = host.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        link = w < 600 ? 95 : 120; link2 = link * link;
        const n = Math.round(Math.min(70, Math.max(w < 600 ? 12 : 22, (w * h) / 16000)));
        pts = Array.from({ length: n }, () => ({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
          r: 1 + Math.random() * 1.6,
        }));
      };
      let link = 120, link2 = link * link;
      // linije su grupisane u 4 nivoa providnosti: jedan stroke po nivou umjesto po liniji (brže na telefonima)
      const tones = [.5, .375, .25, .125].map((a) => `rgba(26,188,156,${a})`);
      const buckets = [[], [], [], []];
      const coarse = !finePointer;
      let tick = 0;
      const frame = () => {
        raf = 0;
        // na ekranima na dodir 30 slika u sekundi je dovoljno i štedi bateriju
        if (coarse && !reduceMotion && (tick++ & 1)) { raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0; return; }
        ctx.clearRect(0, 0, w, h);
        if (!reduceMotion) for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        for (const bkt of buckets) bkt.length = 0;
        const n = pts.length;
        for (let i = 0; i !== n; i++) {
          const a = pts[i];
          for (let j = i + 1; j !== n; j++) {
            const b = pts[j];
            const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 > link2) continue;
            buckets[Math.min(3, (Math.sqrt(d2) / link * 4) | 0)].push(a.x, a.y, b.x, b.y);
          }
        }
        ctx.lineWidth = 1;
        for (let k = 0; k !== 4; k++) {
          const L = buckets[k];
          if (!L.length) continue;
          ctx.strokeStyle = tones[k];
          ctx.beginPath();
          for (let q = 0; q !== L.length; q += 4) { ctx.moveTo(L[q], L[q + 1]); ctx.lineTo(L[q + 2], L[q + 3]); }
          ctx.stroke();
        }
        if (mouse.x > -1e3) {
          ctx.strokeStyle = 'rgba(26,188,156,.35)';
          ctx.beginPath();
          for (const a of pts) {
            const dx = a.x - mouse.x, dy = a.y - mouse.y;
            if (dx * dx + dy * dy !== 0 && dx * dx + dy * dy < 25600) { ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); }
          }
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(26,188,156,.8)';
        ctx.beginPath();
        for (const a of pts) { ctx.moveTo(a.x + a.r, a.y); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); }
        ctx.fill();
        raf = !reduceMotion && visible && !document.hidden ? requestAnimationFrame(frame) : 0;
      };
      const run = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
      size();
      new ResizeObserver(() => { size(); run(); }).observe(host);
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; run(); }).observe(host);
      document.addEventListener('visibilitychange', run);
      host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
      host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
      cv.classList.add('is-on');
      run();
    };
    const idle2 = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    const go = () => idle2(() => heroes.forEach(startNet), { timeout: 1500 });
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  }

  // 3) Svjetlosni odsjaj koji prati miš na karticama (računar) i talas na dodir (telefon)
  const glowCards = document.querySelectorAll('.service-card, .project-card, .book-card, .panel, .hero-card, .moto-card, .contact-card');
  glowCards.forEach((c) => c.classList.add('fx-glow'));
  if (finePointer) {
    glowCards.forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true }));
    // blagi 3D nagib na karticama usluga i projekata
    if (!reduceMotion) document.querySelectorAll('.service-card, .project-card').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(700px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-6px)`;
      }, { passive: true });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  } else if (!reduceMotion) {
    document.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.btn, .service-card, .project-card, .book-card, .footer-nav a, .store-badge');
      if (!t) return;
      const r = t.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'fx-ripple';
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.style.overflow = 'hidden';
      t.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }, { passive: true });
  }

  // 4) Telefon: kartica koja prolazi sredinom ekrana zasvijetli kao na hover (MotoGorac kartica ostaje kakva jeste)
  if (!finePointer && !reduceMotion && 'IntersectionObserver' in window) {
    const lit = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting)),
      { rootMargin: '-42% 0px -42% 0px' });
    document.querySelectorAll('.service-card, .project-card, .book-card').forEach((c) => lit.observe(c));
  }

  // 5) Linija ispod naslova sekcije se iscrta kad naslov uđe u ekran
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const heads = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); heads.unobserve(e.target); }
    }), { threshold: .6 });
    document.querySelectorAll('.section-head').forEach((h) => { h.classList.add('fx-head'); heads.observe(h); });
  }

  // 6) Računar: efekti koji prate miš i "dešifrovanje" naslova (MotoGorac kartica ostaje kakva jeste)
  if (finePointer && !reduceMotion) {
    // nagib i na karticama priručnika, kao na uslugama i projektima
    document.querySelectorAll('.book-card').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-6px)`;
      }, { passive: true });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });

    // dugmad se blago povuku prema mišu
    document.querySelectorAll('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 10, y = ((e.clientY - r.top) / r.height - .5) * 8;
        b.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      }, { passive: true });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });

    // početna: kartica "Šta radimo" i mreža u pozadini se pomjeraju sa mišem (dubina)
    const hero = document.querySelector('.hero');
    if (hero) {
      let hx = 0, hy = 0, hq = false;
      const setHero = () => { hq = false; hero.style.setProperty('--px', hx.toFixed(3)); hero.style.setProperty('--py', hy.toFixed(3)); };
      hero.classList.add('fx-depth');
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        hx = (e.clientX - r.left) / r.width - .5; hy = (e.clientY - r.top) / r.height - .5;
        if (!hq) { hq = true; requestAnimationFrame(setHero); }
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { hx = hy = 0; requestAnimationFrame(setHero); });
    }

    // naslovi sekcija i oznake iznad naslova se "dešifruju" kad uđu u ekran; pravi tekst ostaje
    // na mjestu (za čitače ekrana i raspored), a slova koja se smjenjuju idu preko njega
    if ('IntersectionObserver' in window) {
      const glyphs = '01ABCDEF#$%&*+=<>?';
      const decrypt = (el) => {
        const text = el.textContent;
        const cs = getComputedStyle(el);
        const ov = document.createElement('span');
        ov.className = 'fx-scr';
        ov.setAttribute('aria-hidden', 'true');
        ov.style.color = cs.color;
        ov.style.textShadow = cs.textShadow;
        el.classList.add('fx-scr-host', 'fx-scr-on');
        el.appendChild(ov);
        const t0 = performance.now(), dur = 900;
        let last = 0;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          if (p === 1) { ov.remove(); el.classList.remove('fx-scr-on'); return; }
          if (now - last > 45) {
            last = now;
            const done = Math.floor(p * text.length);
            let out = text.slice(0, done);
            for (let i = done; i < text.length; i++) out += /\s|·/.test(text[i]) ? text[i] : glyphs[(Math.random() * glyphs.length) | 0];
            ov.textContent = out;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { io.unobserve(e.target); decrypt(e.target); }
      }), { threshold: 1 });
      const oneLine = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getClientRects().length === 1; };
      const startScr = () => document.querySelectorAll('.section-head h2, .eyebrow').forEach((el) => {
        if (el.children.length || !oneLine(el) || el.closest('section')?.querySelector('.moto-card')) return;
        io.observe(el);
      });
      // tek kad se stranica učita, da ne smeta prvom prikazu
      const idle3 = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
      if (document.readyState === 'complete') idle3(startScr, { timeout: 1200 });
      else window.addEventListener('load', () => idle3(startScr, { timeout: 1200 }), { once: true });
    }
  }

  /* ---------- Tawk.to chat — učitava se tek kad je stranica spremna ---------- */
  const chatId = document.body.dataset.tawk;
  if (chatId) {
    // Na telefonu Tawk dok je chat otvoren zaključa stranicu (body position:fixed + overflow:hidden)
    // i isključi zumiranje (viewport user-scalable=no). Ako zaključavanje pokrene dvaput, pri zatvaranju
    // vrati zaključano stanje i stranica se više ne skroluje — zato poslije zatvaranja sami vraćamo
    // stil stranice, viewport i poziciju skrola. Funkcije moraju biti na Tawk_API prije učitavanja skripte.
    const body = document.body;
    const vp = document.querySelector('meta[name="viewport"]');
    const bodyCss = body.style.cssText, vpContent = vp?.getAttribute('content');
    let lastY = window.scrollY, chatOpen = false;
    window.addEventListener('scroll', () => { if (body.style.position !== 'fixed') lastY = window.scrollY; }, { passive: true });
    const isMax = () => { try { return chatOpen || window.Tawk_API?.isChatMaximized?.() === true; } catch { return chatOpen; } };
    const restore = () => {
      if (isMax()) return;
      if (body.style.cssText !== bodyCss) body.style.cssText = bodyCss;
      if (vp && vp.getAttribute('content') !== vpContent) vp.setAttribute('content', vpContent);
      if (lastY > 1 && Math.abs(window.scrollY - lastY) > 1) {
        doc.style.scrollBehavior = 'auto';   // bez glatkog klizanja — odmah na staro mjesto
        window.scrollTo(0, lastY);
        doc.style.scrollBehavior = '';
      }
    };
    const onClose = () => { chatOpen = false; setTimeout(restore, 0); };
    // zaključavanje koje stigne kad je chat već zatvoren (ili zakasni) skidamo kad se stanje smiri
    new MutationObserver(() => { if (body.style.position === 'fixed' && !chatOpen) setTimeout(restore, 600); })
      .observe(body, { attributes: true, attributeFilter: ['style'] });
    const loadChat = () => {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onChatMaximized = () => { chatOpen = true; };
      window.Tawk_API.onChatMinimized = onClose;
      window.Tawk_API.onChatHidden = onClose;
      window.Tawk_LoadStart = new Date();
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://embed.tawk.to/${chatId}`;
      s.charset = 'UTF-8';
      s.setAttribute('crossorigin', '*');
      document.head.appendChild(s);
    };
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500));
    window.addEventListener('load', () => idle(loadChat, { timeout: 4000 }), { once: true });
  }
})();
