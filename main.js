(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stored = localStorage.getItem('theme');
  root.setAttribute('data-theme', stored === 'light' ? 'light' : 'dark');

  function typing(el) {
    if (!el) return;
    const text = el.dataset.text || '';
    if (reduce) { el.textContent = text; return; }
    let i = 0;
    (function step() {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(step, 38);
    })();
  }

  function digits(v) { return v.replace(/\D/g, ''); }
  function formatPhone(v) {
    const n = digits(v).slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 6) return '(' + n.slice(0, 2) + ') ' + n.slice(2);
    if (n.length <= 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
    return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
  }

  function network() {
    const c = document.getElementById('net');
    if (!c || reduce) return;
    const ctx = c.getContext('2d');
    let w, h, pts = [], mouse = { x: -999, y: -999 };
    function size() {
      w = c.width = innerWidth; h = c.height = innerHeight;
      const n = Math.min(90, Math.floor(w * h / 18000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45 }));
    }
    size();
    addEventListener('resize', size);
    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    function frame() {
      ctx.clearRect(0, 0, w, h);
      const light = root.getAttribute('data-theme') === 'light';
      const rgb = light ? '0,112,243' : '0,229,255';
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, 6.283);
        ctx.fillStyle = 'rgba(' + rgb + ',.7)';
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 130) {
            ctx.strokeStyle = 'rgba(' + rgb + ',' + (.22 * (1 - d / 130)) + ')';
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
        const dm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
        if (dm < 160) {
          ctx.strokeStyle = 'rgba(139,92,246,' + (.5 * (1 - dm / 160)) + ')';
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    }
    frame();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });

    const menu = document.getElementById('mobile-menu');
    const nav = document.querySelector('.nav');
    if (menu) menu.addEventListener('click', () => nav.classList.toggle('open'));

    typing(document.querySelector('.typing'));
    network();

    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    const bar = document.getElementById('progress');
    addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    }, { passive: true });

    const glow = document.getElementById('glow');
    addEventListener('mousemove', e => { if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; } });

    document.querySelectorAll('.card,.project-card,.skill-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        if (!reduce) {
          const rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
          card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
        }
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    const filters = document.querySelectorAll('.filter');
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(c => {
        c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f);
      });
    }));

    const form = document.getElementById('contact-form');
    if (form) {
      const phone = document.getElementById('phone');
      const status = document.getElementById('form-status');
      phone.addEventListener('input', e => { e.target.value = formatPhone(e.target.value); });
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        const v = id => document.getElementById(id).value.trim();
        const mail = v('email');
        const ok = v('name') && v('message') && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail);
        if (!ok) { status.textContent = 'Preencha nome, e-mail valido e mensagem.'; status.style.color = '#ff5c7a'; return; }
        const body = v('message') + '\n\n— ' + v('name') + '\nEmail: ' + mail + (v('phone') ? '\nTelefone: ' + v('phone') : '');
        status.textContent = 'Abrindo seu aplicativo de e-mail...';
        status.style.color = '#2cff9a';
        location.href = 'mailto:kaiqueguedesv@gmail.com?subject=' + encodeURIComponent('Contato pelo portfolio — ' + v('name')) + '&body=' + encodeURIComponent(body);
      });
    }

    const copy = document.getElementById('copy-mail');
    if (copy) copy.addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard.writeText('kaiqueguedesv@gmail.com').then(() => {
        const s = copy.querySelector('span');
        const old = s.textContent;
        s.textContent = 'Copiado!';
        setTimeout(() => { s.textContent = old; }, 1600);
      });
    });
  });
})();
