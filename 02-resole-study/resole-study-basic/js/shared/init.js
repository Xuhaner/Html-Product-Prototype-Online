// Apply static reward definitions before restoring this page or handling learning actions.
if (typeof LearningActivity !== 'undefined' && typeof growthTasks !== 'undefined') {
  LearningActivity.setRewards(growthTasks);
}
// 在所有业务脚本完成初始化后恢复草稿；保存纯演示界面，原型版本改变会失效。
function savePageState() {
  const state = {
    fields: (['practice', 'test', 'exam-paper', 'code', 'learn', 'results', 'ai-learning', 'python-ai', 'python-foundations'].includes(current) ? [] : $$('input,textarea,select').filter(field => !field.closest('dialog,.comment-form'))).map(field => ({
      value: ['file', 'password'].includes(field.type) ? '' : field.value,
      checked: field.checked
    }))
  };
  document.dispatchEvent(new CustomEvent('prototype-save', {
    detail: state
  }));
  prototypeState.pages[current] = state;
  window.name = statePrefix + JSON.stringify(prototypeState);
}
function restorePageState() {
  const saved = prototypeState.pages[current];
  if (!saved) return;
  restoring = true;
  // Business modules restore their own view before generic fields are applied.
  document.dispatchEvent(new CustomEvent('prototype-restore', {
    detail: saved
  }));
  $$('input,textarea,select').filter(field => !field.closest('dialog,.comment-form')).forEach((field, index) => {
    const value = saved.fields?.[index];
    if (!value || ['file', 'password'].includes(field.type)) return;
    field.value = value.value;
    if ('checked' in field) field.checked = value.checked;
    if (field.tagName === 'SELECT') field.dispatchEvent(new Event('change', {
      bubbles: true
    }));
  });
  applyAuth(prototypeState.logged, false);
  restoring = false;
}
restorePageState();
window.addEventListener('pagehide', savePageState);
$$('.mainnav [data-go],.mobile-nav [data-go]').forEach(button => {
  button.classList.toggle('active', button.dataset.go === shellActiveRoute);
});
// 兼容旧版 index.html#detail 等书签。
const initial = location.hash.slice(1);
if (current === 'home' && routes[initial] && initial !== current) go(initial);
if (initial === 'search' && current === 'courses') $('#course-search').focus();
document.dispatchEvent(new Event("prototype-ready"));
// window.name can be captured before pagehide during reload. Keep the visible
// page snapshot current after its handlers finish, without saving dialog inputs.
for (const type of ['input', 'change', 'click']) {
  document.addEventListener(type, event => {
    if (restoring || !event.target.closest('main') || event.target.closest('dialog')) return;
    queueMicrotask(savePageState);
  });
}
