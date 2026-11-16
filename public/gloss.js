// Progressive enhancement for a.gloss links: hover/focus/tap opens a small popover; without JS they stay plain links.
// One shared native popover (top layer, Escape and outside click handled by the browser), anchored to the link with CSS
// anchor positioning; browsers without anchor() get the same placement from place(), and without popover the old fixed box.
(() => {
  const links = document.querySelectorAll('a.gloss[data-gloss]');
  if (!links.length) return;
  const lang = document.documentElement.lang === 'de' ? 'de' : 'en';
  const native = 'popover' in HTMLElement.prototype;
  const anchored = native && CSS.supports('top', 'anchor(bottom)');
  const pop = document.createElement('span');
  pop.id = 'gloss-pop';
  pop.className = 'gloss-pop';
  pop.setAttribute('role', 'tooltip');
  if (native) pop.setAttribute('popover', 'auto'); else pop.hidden = true;
  let cur = null, timer = 0, touch = false;
  const isOpen = () => (native ? pop.matches(':popover-open') : !pop.hidden);
  const open = (a) => {
    clearTimeout(timer);
    if (cur === a && isOpen()) return;
    close();
    cur = a;
    pop.replaceChildren();
    const h = document.createElement('strong'); h.textContent = a.dataset.term;
    const d = document.createElement('span'); d.className = 'gloss-def'; d.textContent = a.dataset.def;
    const l = document.createElement('a'); l.href = a.href; l.textContent = lang === 'de' ? '→ Glossar' : '→ Glossary';
    pop.append(h, d, l);
    a.after(pop); // next in tab order, so keyboard users can reach the glossary link
    a.setAttribute('aria-describedby', pop.id);
    if (anchored) a.style.anchorName = '--gloss'; // the popover's position-anchor
    if (native) pop.showPopover(); else pop.hidden = false;
    if (!anchored) place();
  };
  function place() {
    if (!cur) return;
    const r = cur.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 16);
    pop.style.inset = 'auto';
    pop.style.margin = '0';
    pop.style.width = w + 'px';
    pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
    pop.style.top = '0px';
    const ph = pop.offsetHeight, below = r.bottom + 6;
    pop.style.top = (below + ph > window.innerHeight && r.top - ph - 6 > 0 ? r.top - ph - 6 : below) + 'px';
  }
  function cleanup() {
    if (cur) { cur.removeAttribute('aria-describedby'); cur.style.anchorName = ''; }
    cur = null;
  }
  function close() {
    if (native) { if (pop.matches(':popover-open')) pop.hidePopover(); } else pop.hidden = true;
    cleanup();
  }
  // Escape / outside click close the native popover without going through close()
  if (native) pop.addEventListener('toggle', (e) => { if (e.newState === 'closed') cleanup(); });
  const later = () => { clearTimeout(timer); timer = setTimeout(close, 200); };
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => open(a));
    a.addEventListener('mouseleave', later);
    a.addEventListener('focus', () => open(a));
    a.addEventListener('pointerdown', (e) => { touch = e.pointerType === 'touch'; });
    a.addEventListener('click', (e) => {
      // touch: first tap shows the definition, the popover link goes on; mouse/keyboard follow the link
      if (touch && (cur !== a || !isOpen())) { e.preventDefault(); open(a); }
      touch = false;
    });
  });
  pop.addEventListener('mouseenter', () => clearTimeout(timer));
  pop.addEventListener('mouseleave', later);
  pop.addEventListener('focusout', (e) => { if (!pop.contains(e.relatedTarget) && e.relatedTarget !== cur) later(); });
  if (!native) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { const a = cur; close(); a && a.focus({ preventScroll: true }); }
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !pop.contains(e.target) && !(e.target.closest && e.target.closest('a.gloss'))) close();
    });
  }
  window.addEventListener('scroll', () => { if (!anchored && isOpen()) place(); }, { passive: true });
  window.addEventListener('resize', () => { if (!anchored && isOpen()) place(); });
})();
