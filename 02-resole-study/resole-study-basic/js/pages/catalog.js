const search = $('#course-search'),
  catalog = $('#catalog'),
  empty = $('#search-empty'),
  resultCount = $('#result-count');
// 信息移至上方，底部统一只保留操作；价格和权益文案仍保留。
$$('.course-bottom', catalog).forEach(bottom => {
  const info = $(':scope > span', bottom);
  if (info) {
    info.classList.add('course-info-line');
    bottom.before(info);
  }
});
let activeType = 'all',
  activeSubject = 'all';
function filterCourses() {
  const q = search.value.trim().toLowerCase();
  let count = 0;
  $$('[data-key]', catalog).forEach(c => {
    const types = c.dataset.type.split(' '),
      subjects = c.dataset.subject.split(' '),
      title = $('.cover strong', c).textContent.toLowerCase(),
      visible = (!q || title.includes(q)) && (activeType === 'all' || types.includes(activeType)) && (activeSubject === 'all' || subjects.includes(activeSubject));
    c.classList.toggle('hide', !visible);
    if (visible) count++;
  });
  catalog.classList.toggle('hide', !count);
  empty.classList.toggle('show', !count);
  resultCount.textContent = `${count} 门课程`;
}
function chooseFilter(button, kind) {
  button ||= $(`[data-filter-${kind}="all"]`);
  const selector = kind === 'type' ? '[data-filter-type]' : '[data-filter-subject]',
    value = button.dataset[kind === 'type' ? 'filterType' : 'filterSubject'];
  $$(selector).forEach(x => {
    const active = x === button;
    x.classList.toggle('active', active);
    x.setAttribute('aria-pressed', active);
  });
  if (kind === 'type') activeType = value;else activeSubject = value;
  filterCourses();
}
$$('[data-filter-type]').forEach(b => b.addEventListener('click', () => chooseFilter(b, 'type')));
$$('[data-filter-subject]').forEach(b => b.addEventListener('click', () => chooseFilter(b, 'subject')));
search.addEventListener('input', filterCourses);
$('#clear-search').addEventListener('click', () => {
  search.value = '';
  chooseFilter($('[data-filter-type="all"]'), 'type');
  chooseFilter($('[data-filter-subject="all"]'), 'subject');
  search.focus();
});
const filterToggle = $('#filter-toggle'),
  filterSidebar = $('#course-filters');
filterToggle.addEventListener('click', () => {
  const open = filterSidebar.classList.toggle('open');
  filterToggle.setAttribute('aria-expanded', open);
  filterToggle.textContent = open ? '× 收起筛选' : '☷ 筛选课程';
});
filterCourses();
document.addEventListener('prototype-save', event => {
  event.detail.filterType = activeType;
  event.detail.filterSubject = activeSubject;
});
document.addEventListener('prototype-ready', () => {
  const saved = prototypeState.pages[current];
  if (!saved) return;
  chooseFilter($(`[data-filter-type="${saved.filterType || 'all'}"]`), 'type');
  chooseFilter($(`[data-filter-subject="${saved.filterSubject || 'all'}"]`), 'subject');
});
