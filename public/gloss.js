// Progressive enhancement for a.gloss links: hover/focus/click opens a small popover; without JS they stay plain links.
(() => {
  const links = document.querySelectorAll('a.gloss[data-gloss]');
  if (!links.length) return;
  const lang = document.documentElement.lang === 'de' ? 'de' : 'en';
  const pop = document.createElement('span');
  pop.id = 'gloss-pop';
  pop.className = 'gloss-pop';
  pop.setAttribute('role', 'tooltip');
  pop.hidden = true;
  let cur = null, timer = 0, touch = false;
  const open = (a) => {
    clearTimeout(timer);
    if (cur === a && !pop.hidden) return;
    close();
    cur = a;
    pop.replaceChildren();
    const h = document.createElement('strong'); h.textContent = a.dataset.term;
    const d = document.createElement('span'); d.className = 'gloss-def'; d.textContent = a.dataset.def;
    const l = document.createElement('a'); l.href = a.href; l.textContent = lang === 'de' ? '→ Glossar' : '→ Glossary';
    pop.append(h, d, l);
    a.after(pop);
    a.setAttribute('aria-describedby', pop.id);
    pop.hidden = false;
    place();
  };
  function place() {
    if (!cur) return;
    const r = cur.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 16);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
    pop.style.top = '0px';
    const ph = pop.offsetHeight, below = r.bottom + 6;
    pop.style.top = (below + ph > window.innerHeight && r.top - ph - 6 > 0 ? r.top - ph - 6 : below) + 'px';
  }
  function close() {
    pop.hidden = true;
    if (cur) cur.removeAttribute('aria-describedby');
    cur = null;
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(close, 200); };
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => open(a));
    a.addEventListener('mouseleave', later);
    a.addEventListener('focus', () => open(a));
    a.addEventListener('pointerdown', (e) => { touch = e.pointerType === 'touch'; });
    a.addEventListener('click', (e) => {
      // touch: first tap shows the definition, the popover link goes on; mouse/keyboard follow the link
      if (touch && (cur !== a || pop.hidden)) { e.preventDefault(); open(a); }
      touch = false;
    });
  });
  pop.addEventListener('mouseenter', () => clearTimeout(timer));
  pop.addEventListener('mouseleave', later);
  pop.addEventListener('focusout', (e) => { if (!pop.contains(e.relatedTarget) && e.relatedTarget !== cur) later(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !pop.hidden) { const a = cur; close(); a && a.focus({ preventScroll: true }); }
  });
  document.addEventListener('click', (e) => {
    if (!pop.hidden && !pop.contains(e.target) && !(e.target.closest && e.target.closest('a.gloss'))) close();
  });
  window.addEventListener('scroll', place, { passive: true });
  window.addEventListener('resize', place);
})();
