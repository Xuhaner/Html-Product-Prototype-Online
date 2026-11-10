const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const routes = {"review-guide":"pages/home/review-guide.html","institutions":"pages/institutions/institutions.html","institution":"pages/institutions/institution.html","requirements":"pages/home/review-requirements.html","home":"index.html","courses":"pages/courses/courses.html","detail":"pages/courses/detail.html","spoc-detail":"pages/courses/spoc-detail.html","spoc-learn":"pages/courses/spoc-learn.html","learn":"pages/courses/learn.html","practice":"pages/tasks/practice.html","test":"pages/tasks/test.html","exam":"pages/tasks/exam.html","exam-paper":"pages/tasks/exam-paper.html","results":"pages/tasks/results.html","profile":"pages/profile/profile.html","resources":"pages/courses/resources.html","notifications":"pages/profile/notifications.html"};
const pages = $$('.page'),
  main = $('#main'),
  toast = $('#toast');
const globalState = $('#global-state');
let current = document.body.dataset.page,
  toastTimer,
  restoring = false;
// file:// 的存储隔离因浏览器而异；window.name 在同一标签页的本地页面间传递演示状态。
// 仅供原型，同目录、同标签页有效，不保存真实认证信息。变更状态结构时递增版本。
const statePrefix = 'ruixiu-basic-v1:';
const stateScope = new URL('.', document.baseURI).href;
let prototypeState = {
  scope: stateScope,
  logged: true,
  pages: {}
};
try {
  if (window.name.startsWith(statePrefix)) {
    const saved = JSON.parse(window.name.slice(statePrefix.length));
    if (saved.scope === stateScope && saved.pages) prototypeState = saved;
  }
} catch {/* 损坏或旧版本演示状态回到默认值。 */}
const themeNames = {
  forest: '学城绿',
  blue: '学术蓝',
  warm: '人文棕',
  violet: '科技紫',
  teal: '湖水青',
  rose: '蔷薇红'
};
function setTheme(theme, announce = true) {
  if (!themeNames[theme]) return;
  prototypeState.theme = theme;
  document.documentElement.dataset.theme = theme;
  const favicon = document.querySelector('link[rel~="icon"]') || Object.assign(document.head.appendChild(document.createElement('link')), {
    rel: 'icon',
    type: 'image/svg+xml'
  });
  favicon.href = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="17" fill="${getComputedStyle(document.documentElement).getPropertyValue('--green').trim()}"/><text x="32" y="43" fill="white" font-size="30" font-weight="800" text-anchor="middle" font-family="system-ui,sans-serif">睿</text></svg>`)}`;
  $$('#theme-menu button[data-theme]').forEach(button => {
    const active = button.dataset.theme === theme;
    button.setAttribute('aria-pressed', active);
    button.textContent = (active ? '✓ ' : '○ ') + themeNames[button.dataset.theme];
  });
  if (typeof savePageState === 'function') savePageState();
  if (announce) showToast(`已切换为${themeNames[theme]}`);
}
setTheme(prototypeState.theme || 'forest', false);
function showToast(message) {
  if (restoring) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function go(id, hash = '') {
  if (!routes[id]) return;
  if (id === current && !hash) {
    setState('default');
    main.focus({
      preventScroll: true
    });
    return;
  }
  if (typeof savePageState === 'function') savePageState();
  location.href = new URL(routes[id] + hash, document.baseURI).href;
}
document.addEventListener('click', event => {
  const themeButton = event.target.closest('#theme-menu button[data-theme]');
  if (themeButton) setTheme(themeButton.dataset.theme);
  const navigation = event.target.closest('[data-go]');
  if (navigation) go(navigation.dataset.go, navigation.dataset.hash || '');
  const tip = event.target.closest('[data-toast]');
  if (tip) showToast(tip.dataset.toast);
});
$$('[data-focus-search]').forEach(button => button.addEventListener('click', () => {
  if (current === 'courses') $('#course-search').focus();else go('courses', '#search');
}));
