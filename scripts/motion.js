(() => {
  const root = document.documentElement;
  const motionQuery = matchMedia('(prefers-reduced-motion: no-preference)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const phone = matchMedia('(max-width: 760px)');
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const closing = document.querySelector('.closing');
  const storyPhotos = document.querySelector('.story-photos');
  const floatCta = document.querySelector('[data-float-cta]');
  const revealables = [...document.querySelectorAll('[data-reveal]')];
  const flows = [...document.querySelectorAll('[data-flow]')];
  const cards = document.querySelectorAll('.cut-card');

  const STAGGER = 110;
  const MAX_STAGGER_STEPS = 5;
  const SETTLE_TIME = 1800;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const motionOn = () => motionQuery.matches && root.classList.contains('motion');

  // Tell the head script that motion started, so it keeps the hidden-until-revealed state.
  root.dataset.motionReady = '';

  /* ---------- Scroll reveals ---------- */

  function reveal(element, delay = 0) {
    if (element.classList.contains('is-revealed')) return;
    element.style.setProperty('--reveal-delay', delay + 'ms');
    element.classList.add('is-revealed');
    setTimeout(() => {
      element.classList.add('reveal-done');
      element.style.removeProperty('--reveal-delay');
    }, delay + SETTLE_TIME);
  }

  function revealNow(element) {
    element.classList.add('is-revealed', 'reveal-done');
  }

  // A developing photo starts clipped to zero area, so the observer would never see it (and its lazy
  // image would never load). Watch its container instead and reveal the photo from there.
  const watched = new Map();
  const watchTarget = (element) => (element.dataset.reveal === 'photo' ? element.parentElement : element);

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .flatMap((entry) => {
        observer.unobserve(entry.target);
        const elements = watched.get(entry.target) ?? [];
        watched.delete(entry.target);
        return elements;
      })
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach((element, index) => reveal(element, Math.min(index, MAX_STAGGER_STEPS) * STAGGER));
  }, { rootMargin: '0px 0px -8% 0px', threshold: .1 }) : null;

  function watch(element) {
    const target = watchTarget(element);
    if (!watched.has(target)) {
      watched.set(target, []);
      observer.observe(target);
    }
    watched.get(target).push(element);
  }

  function disableMotion() {
    observer?.disconnect();
    watched.clear();
    root.classList.remove('motion');
    revealables.forEach(revealNow);
    for (const element of [hero, closing, storyPhotos, ...flows]) {
      for (const property of ['--shift', '--drift', '--flow']) element?.style.removeProperty(property);
    }
    stopLoop();
  }

  // Keyboard users must never land on invisible content.
  document.addEventListener('focusin', (event) => {
    const hidden = event.target.closest?.('[data-reveal]:not(.is-revealed)');
    if (hidden) revealNow(hidden);
    const parent = hidden?.parentElement?.closest('[data-reveal]:not(.is-revealed)');
    if (parent) revealNow(parent);
  });

  /* ---------- Barber pole + ticker: run continuously, speed up while scrolling ---------- */

  const pole = document.querySelector('[data-pole] .pole-stripes');
  const strip = document.querySelector('[data-marquee]');
  const track = strip?.querySelector('.marquee-track');
  const spinners = [
    { element: pole, host: pole?.closest('[data-pole]'), speed: 26, boost: .5, offset: 0, visible: false, paused: false },
    { element: track, host: strip, speed: 55, boost: .35, offset: 0, visible: false, paused: false, width: 0 }
  ].filter((spinner) => spinner.element);
  let loopFrame = 0;
  let loopTime = 0;
  let loopScroll = scrollY;

  function fillTrack() {
    if (!track || track.dataset.filled) return;
    const group = track.firstElementChild;
    const copies = Math.max(3, Math.ceil((innerWidth * 2) / Math.max(1, group.getBoundingClientRect().width)) + 1);
    for (let copy = 1; copy < copies; copy += 1) track.append(group.cloneNode(true));
    track.dataset.filled = '';
    measureTrack();
  }

  function measureTrack() {
    const spinner = spinners.find((item) => item.element === track);
    if (spinner) spinner.width = track.firstElementChild.getBoundingClientRect().width;
  }

  function runLoop(now) {
    loopFrame = 0;
    if (!motionOn()) return;
    const elapsed = loopTime ? Math.min(now - loopTime, 100) / 1000 : 0;
    loopTime = now;
    const scrolled = Math.abs(scrollY - loopScroll);
    loopScroll = scrollY;
    for (const spinner of spinners) {
      if (!spinner.visible) continue;
      if (!spinner.paused) spinner.offset += spinner.speed * elapsed;
      spinner.offset += scrolled * spinner.boost;
      if (spinner.element === track) {
        if (spinner.width) spinner.offset %= spinner.width;
        track.style.setProperty('--strip-shift', -spinner.offset.toFixed(2) + 'px');
      } else {
        spinner.offset %= 1056; // a common multiple of every stripe tile size
        pole.style.setProperty('--pole-offset', -spinner.offset.toFixed(2) + 'px');
      }
    }
    startLoop();
  }

  function startLoop() {
    if (loopFrame || document.hidden || !motionOn() || !spinners.some((spinner) => spinner.visible)) return;
    if (!loopTime) loopScroll = scrollY;
    loopFrame = requestAnimationFrame(runLoop);
  }

  function stopLoop() {
    cancelAnimationFrame(loopFrame);
    loopFrame = 0;
    loopTime = 0;
  }

  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const spinner = spinners.find((item) => item.host === entry.target);
        if (spinner) spinner.visible = entry.isIntersecting;
      }
      if (spinners.some((spinner) => spinner.visible)) startLoop();
      else stopLoop();
    });
    spinners.forEach((spinner) => visibility.observe(spinner.host));
    if (strip) {
      const ticker = spinners.find((item) => item.host === strip);
      strip.addEventListener('pointerenter', () => { ticker.paused = true; });
      strip.addEventListener('pointerleave', () => { ticker.paused = false; });
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stopLoop() : startLoop()));
  }

  /* ---------- Scroll-linked effects, batched into one frame ---------- */

  let frame = 0;
  const requestUpdate = () => { frame ||= requestAnimationFrame(update); };

  // 0 as the element's top enters the bottom of the viewport, 1 as its bottom leaves the top.
  const passage = (box, viewport) => clamp((viewport - box.top) / (viewport + box.height));

  function update() {
    frame = 0;
    const viewport = innerHeight;
    const scrollable = root.scrollHeight - viewport;
    header.style.setProperty('--read-progress', scrollable > 0 ? clamp(scrollY / scrollable).toFixed(4) : '0');
    header.style.setProperty('--rule-offset', (scrollY * .35).toFixed(1) + 'px');
    header.toggleAttribute('data-scrolled', scrollY > 8);
    updateFloatCta(viewport);

    if (!motionOn()) return;

    // Safety net: a fast flick can skip past an element before the observer catches it.
    for (const [target, elements] of watched) {
      if (target.getBoundingClientRect().bottom >= 0) continue;
      observer.unobserve(target);
      watched.delete(target);
      elements.forEach((element) => reveal(element));
    }

    const heroBox = hero.getBoundingClientRect();
    if (heroBox.bottom > 0) hero.style.setProperty('--shift', clamp(-heroBox.top / heroBox.height).toFixed(4));

    const closingBox = closing.getBoundingClientRect();
    if (closingBox.bottom > 0 && closingBox.top < viewport) {
      closing.style.setProperty('--shift', (passage(closingBox, viewport) * 2 - 1).toFixed(4));
    }

    const storyBox = storyPhotos.getBoundingClientRect();
    if (storyBox.bottom > 0 && storyBox.top < viewport) {
      storyPhotos.style.setProperty('--drift', (passage(storyBox, viewport) * 2 - 1).toFixed(4));
    }

    for (const flow of flows) {
      const box = flow.getBoundingClientRect();
      if (box.bottom < -viewport || box.top > viewport * 2) continue;
      // Starts filling as the steps enter, completes as they pass the upper third of the screen.
      const progress = clamp((viewport * .85 - box.top) / (box.height + viewport * .3));
      flow.style.setProperty('--flow', progress.toFixed(4));
      const steps = flow.children;
      for (let index = 0; index < steps.length; index += 1) {
        steps[index].classList.toggle('is-lit', progress >= (index + .35) / steps.length);
      }
    }
  }

  /* ---------- Floating appointment button: phones, between the hero and the booking sections ---------- */

  function updateFloatCta(viewport) {
    if (!floatCta) return;
    const show = phone.matches
      && hero.getBoundingClientRect().bottom < 0
      && closing.getBoundingClientRect().top > viewport * .92;
    if (show === floatCta.hasAttribute('data-show')) return;
    if (!show && floatCta.contains(document.activeElement)) floatCta.blur();
    floatCta.toggleAttribute('data-show', show);
  }

  if (motionOn() && observer) revealables.forEach(watch);
  else disableMotion();

  if (floatCta) floatCta.hidden = false;
  if (motionOn()) fillTrack();
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', () => { measureTrack(); requestUpdate(); }, { passive: true });
  addEventListener('pageshow', requestUpdate);
  phone.addEventListener('change', requestUpdate);
  update();

  motionQuery.addEventListener('change', () => {
    if (!motionQuery.matches) disableMotion();
    requestUpdate();
  });

  /* ---------- Cut Book cards: pointer tilt + spotlight ---------- */

  function trackPointer(event) {
    if (!finePointer.matches || !motionOn()) return;
    const card = event.currentTarget;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    const strength = clamp(380 / box.width, .25, 1) * 7;
    card.style.setProperty('--tilt-x', ((.5 - y) * strength).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-y', ((x - .5) * strength).toFixed(2) + 'deg');
  }

  function resetPointer(event) {
    for (const property of ['--mx', '--my', '--tilt-x', '--tilt-y']) event.currentTarget.style.removeProperty(property);
  }

  for (const card of cards) {
    card.addEventListener('pointermove', trackPointer);
    card.addEventListener('pointerleave', resetPointer);
  }
})();
