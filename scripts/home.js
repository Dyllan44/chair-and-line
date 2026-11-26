(() => {
  const form = document.querySelector('#appointment-form');
  const { service, style, time } = form.elements;
  const result = document.querySelector('#appointment-result');
  const summary = document.querySelector('#result-summary');

  function updateDetails() {
    style.disabled = service.value === 'beard-trim';
    if (style.disabled) style.value = '';
    result.hidden = true;
  }

  form.addEventListener('change', updateDetails);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const details = [service.selectedOptions[0].text];
    if (style.value) details.push('Look: ' + style.selectedOptions[0].text);
    if (time.value) details.push('Preferred time: ' + time.selectedOptions[0].text);
    summary.textContent = details.join(' · ');
    result.hidden = false;
    result.focus();
  });

  document.querySelector('#edit-appointment').addEventListener('click', () => {
    result.hidden = true;
    service.focus();
  });

  document.addEventListener('click', (event) => {
    const choice = event.target.closest('a[data-service]');
    if (!choice || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    service.value = choice.dataset.service;
    style.value = choice.dataset.style ?? '';
    updateDetails();
  });

  form.querySelector('fieldset').disabled = false;
  updateDetails();
})();

(() => {
  const group = document.querySelector('.cut-filters');
  const buttons = [...group.querySelectorAll('button')];
  const grid = document.querySelector('.cut-grid');
  const cards = [...grid.querySelectorAll('[data-cut]')];
  const status = document.querySelector('#cut-status');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');

  group.addEventListener('click', (event) => {
    const active = event.target.closest('button[data-filter]');
    if (!active || active.getAttribute('aria-pressed') === 'true') return;
    const filter = active.dataset.filter;
    const shown = [];
    grid.toggleAttribute('data-filtered', filter !== 'all');
    for (const button of buttons) button.setAttribute('aria-pressed', String(button === active));
    for (const card of cards) {
      card.hidden = filter !== 'all' && card.dataset.cut !== filter;
      if (!card.hidden) shown.push(card);
    }
    status.textContent = shown.length === 1 ? active.textContent + ' style shown.' : shown.length + ' styles shown.';

    if (!motion.matches || typeof Element.prototype.animate !== 'function') return;
    shown.forEach((card, index) => {
      card.animate([{ opacity: .65, translate: '0 .35rem' }, { opacity: 1, translate: '0 0' }],
        { duration: 270, delay: index * 45, easing: 'ease-out' });
    });
  });

  group.hidden = false;
})();
