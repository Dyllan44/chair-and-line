(() => {
  const header = document.querySelector('.site-header');
  const process = document.querySelector('.process-steps');
  const preference = matchMedia('(prefers-reduced-motion: no-preference)');
  const animations = new Map();
  const clamp = (value) => Math.min(1, Math.max(0, value));
  let processVisible = false;
  let frame = 0;

  function paint() {
    frame = 0;
    const page = document.documentElement.scrollHeight - innerHeight;
    header.style.setProperty('--read-progress', page > 0 ? clamp(scrollY / page) : 0);

    if (!preference.matches || !processVisible) return;
    const bounds = process.getBoundingClientRect();
    const impression = clamp((innerHeight * .94 - bounds.top) / Math.max(1, bounds.height * .82));
    process.style.setProperty('--impression', impression);
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();

  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    processVisible = entry.isIntersecting;
    schedule();
  }).observe(process);

  const reveals = new IntersectionObserver((entries) => {
    if (!preference.matches || typeof Element.prototype.animate !== 'function') return;
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const target = entry.target;
      reveals.unobserve(target);
      if (target.matches(':focus-within') || entry.boundingClientRect.top < header.offsetHeight) continue;

      const photo = target.dataset.reveal === 'photo';
      const first = photo
        ? { opacity: .8, translate: '0 .5rem', clipPath: 'inset(0 0 6% 0)' }
        : { opacity: .62, translate: '0 .55rem' };
      const last = photo
        ? { opacity: 1, translate: '0 0', clipPath: 'inset(0)' }
        : { opacity: 1, translate: '0 0' };
      const animation = target.animate([first, last], {
        duration: photo ? 610 : 460, easing: 'cubic-bezier(.19,.76,.25,1)', delay: Math.min(order++, 3) * 55
      });
      if (target.classList.contains('section-heading')) target.dataset.printed = '';
      animations.set(target, animation);
      animation.finished.then(() => animations.delete(target), () => animations.delete(target));
    }
  }, { threshold: .14 });

  document.querySelectorAll('[data-reveal]').forEach((element) => reveals.observe(element));
  document.addEventListener('focusin', (event) => {
    for (const [element, animation] of animations) {
      if (element.contains(event.target)) animation.cancel();
    }
  });
  preference.addEventListener('change', () => {
    if (!preference.matches) {
      animations.forEach((animation) => animation.cancel());
      process.style.removeProperty('--impression');
    }
    schedule();
  });
})();
