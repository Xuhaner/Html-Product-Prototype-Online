/* Homepage-only design studies. Two visible views; the five earlier designs remain available in source. */
(() => {
  const root = document.querySelector('#page-home');
  const chapters = [...root.children];
  const labels = ['愿景', '服务角色', '教育矛盾', '教育理念', '在线学习', '合作机构'];
  const editions = {
    'visual-spatial': '01 / LIGHT & SPACE', 'visual-organic': '02 / ROOM TO GROW',
    cinema: '03 / THE HUMAN STORY', spatial: '04 / A NEW DIMENSION',
    editorial: '05 / EDUCATION MANIFESTO', console: '06 / LEARNING SYSTEM',
    organic: '07 / ROOM TO GROW'
  };
  const choices = [...document.querySelectorAll('[data-home-choice]:not([hidden])')];
  const rail = document.querySelector('.home-chapters');
  chapters.forEach((section, index) => {
    section.id = `home-chapter-${index + 1}`;
    section.dataset.chapter = String(index + 1).padStart(2, '0');
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.innerHTML = `<span>${section.dataset.chapter}</span><b>${labels[index]}</b>`;
    rail.append(link);
  });
  const links = [...rail.children];
  const strip = root.querySelector('.partner-strip');
  [...strip.children].forEach(partner => {
    const copy = partner.cloneNode(true);
    copy.classList.add('partner-copy');
    copy.setAttribute('aria-hidden', 'true');
    copy.tabIndex = -1;
    strip.append(copy);
  });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function updateScroll() {
    frame = 0;
    let active = 0;
    chapters.forEach((section, index) => {
      const box = section.getBoundingClientRect();
      if (box.top < innerHeight * .55) active = index;
      section.classList.toggle('in-view', box.top < innerHeight * .92 && box.bottom > 0);
      section.style.setProperty('--chapter-shift', `${reducedMotion.matches ? 0 : Math.max(-28, Math.min(28, box.top * .04))}px`);
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    document.body.style.setProperty('--home-progress', maxScroll > 0 ? scrollY / maxScroll : 0);
  }
  function requestScrollUpdate() { if (!frame) frame = requestAnimationFrame(updateScroll); }
  function choose(version, preservePosition = false) {
    if (!choices.some(button => button.dataset.homeChoice === version)) return;
    const currentChapter = chapters.find(section => section.getBoundingClientRect().bottom > 180) || chapters[0];
    const offset = currentChapter.getBoundingClientRect().top;
    document.body.dataset.homeVersion = version;
    document.body.classList.toggle('home-visual', version.startsWith('visual-'));
    choices.forEach(button => button.setAttribute('aria-pressed', button.dataset.homeChoice === version));
    document.querySelector('.home-edition').textContent = editions[version];
    document.querySelector('.version-status').textContent = `当前版本：${choices.find(button => button.dataset.homeChoice === version).textContent.trim()}`;
    prototypeState.homeVersion = version;
    if (preservePosition) persistDemo();
    if (preservePosition) window.scrollBy({top: currentChapter.getBoundingClientRect().top - offset, behavior: 'instant'});
    updateScroll();
  }
  choices.forEach(button => button.addEventListener('click', () => choose(button.dataset.homeChoice, true)));
  choose(choices.some(button => button.dataset.homeChoice === prototypeState.homeVersion) ? prototypeState.homeVersion : 'visual-spatial');
  window.addEventListener('scroll', requestScrollUpdate, {passive: true});
  window.addEventListener('resize', requestScrollUpdate);
  root.addEventListener('pointermove', event => {
    if (!['spatial', 'visual-spatial'].includes(document.body.dataset.homeVersion) || reducedMotion.matches || event.pointerType !== 'mouse') return;
    const card = event.target.closest('.audience-card, .home-vision-hero, .home-photo-media');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--pointer-x', `${x * 100}%`);
    card.style.setProperty('--pointer-y', `${y * 100}%`);
    card.style.setProperty('--tilt-x', `${(y - .5) * -8}deg`);
    card.style.setProperty('--tilt-y', `${(x - .5) * 8}deg`);
  });
  root.addEventListener('pointerout', event => {
    const card = event.target.closest('.audience-card, .home-vision-hero, .home-photo-media');
    if (card && !card.contains(event.relatedTarget)) {
      ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y'].forEach(property => card.style.removeProperty(property));
    }
  });
})();
