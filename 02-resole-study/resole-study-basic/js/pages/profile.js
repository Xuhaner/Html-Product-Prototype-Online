demo.favorites=demo.favorites.map(id=>id==='code'?'assignment':id);
const profilePanel = $('#profile-content'),
  profileDashboard = profilePanel.innerHTML;

const profileViews = {
  dashboard: profileDashboard,
  favorites: '<div class="view-head"><h2>我的收藏</h2><p class="meta">课程与教学任务集中保存。</p></div><div class="profile-list" id="favorite-list"></div><div class="statebox" id="favorite-empty"><h2>还没有收藏内容</h2><p>在课程中收藏后可回到这里继续学习。</p><button class="btn primary" data-go="courses">发现课程</button></div>',
  assignments: '<div class="view-head"><div><h2>作业中心</h2><p class="meta">集中查看课程任务与完成状态。</p></div><select id="assignment-filter" aria-label="筛选作业"><option value="all">全部任务</option><option value="pending">待完成</option><option value="done">已完成</option></select></div><div class="profile-list"><article class="assignment-item" data-assignment-status="pending"><div class="item-copy"><span class="badge">9 月 8 日截止</span><strong> 第三章小测</strong><p>Python 程序设计 · 15 分钟 · 尚未作答</p></div><button class="btn primary" data-go="test">开始测试</button></article><article class="assignment-item" data-assignment-status="pending"><div class="item-copy"><span class="badge neutral">长期开放</span><strong> 词频统计器</strong><p>Python 程序设计 · 文件作业 · 人工批阅</p></div><button class="btn" data-go="learn" data-hash="#assignment">查看作业</button></article><article class="assignment-item" data-assignment-status="pending"><div class="item-copy"><span class="badge neutral">9 月 12 日开放</span><strong> 期中考试</strong><p>Python 程序设计 · 60 分钟 · 仅 1 次机会</p></div><button class="btn" data-go="exam">查看规则</button></article><article class="assignment-item" data-assignment-status="done"><div class="item-copy"><span class="badge neutral">已完成 · 92 分</span><strong> 第二章练习</strong><p>提交于 8 月 30 日 20:18</p></div><button class="btn" data-result="practice">查看结果</button></article></div>'
};
profileViews.favorites = profileViews.favorites.replace('课程任务与完成状态集中查看。', '课程与教学任务集中保存。');
profileViews.courses = `<div class="view-head"><div><h2>我的学习</h2><p class="meta">统一查看已加入课程、学习状态与继续学习入口。</p></div></div><div class="learning-filter-bar" aria-label="筛选学习内容"><label><span>内容类型</span><select data-learning-filter="type"><option value="all">全部内容</option><option value="course">课程</option></select></label><label><span>学习状态</span><select data-learning-filter="status"><option value="all">全部状态</option><option value="not-started">未开始</option><option value="active">学习中</option><option value="done">已学完</option></select></label></div><div class="profile-list" id="profile-learning-list"></div><div class="statebox" id="profile-course-empty"><h2>没有符合条件的学习内容</h2><p>尝试选择其他内容类型或学习状态。</p></div>`;
profileViews.info = `<div class="view-head"><div><h2>个人资料</h2><p class="meta">用于课程身份识别和学习服务，请保持信息准确。</p></div></div><form class="profile-form" id="profile-form" novalidate><section class="profile-avatar-editor" aria-labelledby="profile-avatar-label"><div class="profile-avatar-edit-row"><input id="profile-avatar-file" type="file" accept="image/jpeg,image/png" hidden><button class="profile-avatar-edit-button" type="button" data-avatar-action="select" aria-label="修改头像"><span class="profile-avatar" id="profile-avatar-preview" aria-hidden="true">林</span><span class="profile-avatar-overlay" aria-hidden="true">修改头像</span></button><div class="profile-avatar-controls"><span class="field-label" id="profile-avatar-label">头像</span><div class="profile-avatar-actions" hidden><button class="btn small primary" type="button" data-avatar-action="confirm">确认修改</button><button class="btn small" type="button" data-avatar-action="cancel">取消</button></div></div></div><p class="meta profile-avatar-feedback" id="profile-avatar-feedback" aria-live="polite" hidden></p></section><div class="form-grid"><div class="field"><label for="profile-name">姓名</label><input id="profile-name" name="name" value="林晓" required aria-describedby="name-error"><div class="error-text" id="name-error">请输入姓名。</div></div><div class="field"><span class="field-label">学号</span><div class="profile-readonly">10265501427</div><div class="meta">学号由所属机构维护</div></div><div class="field"><span class="field-label">专业</span><div class="profile-readonly">数据科学与大数据技术</div></div><div class="field"><span class="field-label">年级</span><div class="profile-readonly">2025 级</div></div><div class="field"><span class="field-label">邮箱</span><div class="profile-contact"><strong data-contact-value="email">未绑定</strong><button class="btn small" type="button" data-security-action="email">绑定</button></div></div><div class="field"><span class="field-label">手机号</span><div class="profile-contact"><strong data-contact-value="phone">138****5678</strong><button class="btn small" type="button" data-security-action="phone">修改</button></div></div></div><div class="field"><label for="profile-bio">个人简介</label><textarea id="profile-bio" maxlength="120">正在学习 Python 和数据分析，希望完成第一个数据项目。</textarea><div class="meta">最多 120 字</div></div><button class="btn primary" type="submit">保存修改</button></form><section class="profile-security" aria-labelledby="profile-security-title"><h3 id="profile-security-title">账号安全</h3><div class="security-list"><article class="security-item"><div><strong>登录密码</strong><p>定期修改密码有助于保护账号安全</p></div><span class="security-status is-set">已设置</span><button class="btn" data-security-action="password">修改</button></article><article class="security-item danger-zone"><div><strong>注销账号</strong><p>提交注销申请后，账号将进入注销处理流程</p></div><button class="btn danger" data-security-action="cancel-account">申请注销</button></article></div></section>`;
profileViews.wrong = `<div class="view-head wrong-view-head"><div><h2>我的错题</h2><p class="meta">集中回顾练习与测验中的错题。</p></div><div class="search wrong-search"><input id="wrong-search" type="search" placeholder="搜索题目、课程或来源" aria-label="搜索我的错题"></div></div>${profileFilterTabs('wrong', [['all', '全部错题'], ['single', '单选题'], ['text', '填空题']])}<div class="wrong-list" id="profile-wrong-list"></div><div class="statebox" id="profile-wrong-empty"><h2>没有找到匹配的错题</h2><p>试试其他关键词或题型。</p></div>`;
profileViews.exams = `<div class="view-head exam-view-head"><h2>我的考试</h2><div class="search exam-search"><input id="exam-search" type="search" placeholder="搜索考试" aria-label="搜索我的考试"></div></div>${profileFilterTabs('exams', [['all', '全部'], ['not-started', '未开始'], ['active', '考试中'], ['review-pending', '待批阅'], ['reviewed', '已批阅']])}<div id="profile-exam-list"></div><div class="statebox" id="profile-exam-empty"><h2>没有符合条件的考试</h2><p>尝试更换关键词或选择其他考试状态。</p></div>`;
const wrongSamples = [{
  type: '单选题',
  score: '0 / 20',
  prompt: 'list(range(1, 5)) 的结果是什么？',
  course: 'Python 程序设计',
  source: '第三章小测',
  time: '2026-09-08 16:39',
  options: ['A. [1, 2, 3, 4]', 'B. [1, 2, 3, 4, 5]', 'C. [0, 1, 2, 3, 4]'],
  answer: 'A. [1, 2, 3, 4]',
  mine: 'B. [1, 2, 3, 4, 5]',
  explain: 'range 包含起点，不包含终点。'
}, {
  type: '单选题',
  score: '0 / 20',
  prompt: '循环中 break 的作用是什么？',
  course: 'Python 程序设计',
  source: '循环结构练习',
  time: '2026-09-07 20:18',
  options: ['A. 跳过本次迭代', 'B. 结束当前循环', 'C. 重新开始循环'],
  answer: 'B. 结束当前循环',
  mine: 'A. 跳过本次迭代',
  explain: 'break 会立即结束它所在的最内层循环。'
}, {
  type: '填空题',
  score: '0 / 20',
  prompt: '填空：len("python") 的值为 ____。',
  course: 'Python 程序设计',
  source: '第三章小测',
  time: '2026-09-06 14:32',
  options: [],
  answer: '6',
  mine: '5',
  explain: '字符串 python 共包含 6 个字符。'
}];
function profileFilterTabs(group, items) {
  return `<nav class="profile-filter-tabs" aria-label="筛选列表">${items.map(([value, label], index) => `<button type="button" data-profile-filter="${group}" data-filter-value="${value}" aria-pressed="${index === 0}">${label}</button>`).join('')}</nav>`;
}
const standardLearningItems = [{
  title: 'Python 程序设计',
  cover: 'a',
  mark: 'PYTHON',
  status: 'active',
  statusLabel: '学习中',
  school: '数据科学与工程学院',
  views: '8,420',
  action: 'data-go="detail"'
}, {
  title: '数据科学导论',
  cover: 'b',
  mark: 'DATA',
  status: 'active',
  statusLabel: '学习中',
  school: '数据科学与工程学院',
  views: '6,536',
  action: 'data-course-preview="数据科学导论"'
}, {
  title: '大学生信息素养',
  cover: 'd',
  mark: 'INFORMATION',
  status: 'done',
  statusLabel: '已学完',
  school: '教育学部',
  views: '5,760',
  action: 'data-course-preview="大学生信息素养"'
}, {
  title: '人工智能基础与应用',
  cover: 'f',
  mark: 'AI',
  status: 'closed',
  statusLabel: '已关闭',
  school: '计算机科学与技术学院',
  views: '3,240'
}];
function learningCard(item, type = 'course') {
  const paid = type === 'paid',
    closed = item.status === 'closed';
  return `<article class="profile-course-item course-list-item${closed ? ' is-closed' : ''}" data-learning-type="${type}" data-learning-status="${item.status}"><div class="profile-course-cover cover ${item.cover || 'g'}" aria-hidden="true"><span>${escapeHTML(item.mark || 'PREMIUM')}</span><strong>${escapeHTML(item.title)}</strong></div><div class="course-list-copy"><span class="badge${item.status === 'active' ? '' : ' neutral'}">${paid ? '付费课程 · ' : ''}${escapeHTML(item.statusLabel)}</span><h3>${escapeHTML(item.title)}</h3><p>${paid ? escapeHTML(item.author) : `授课学院：${escapeHTML(item.school)}`}</p><div class="course-list-meta"><span>${paid ? `已购买 · ${escapeHTML(item.validUntil || '长期有效')}` : `◉ ${item.views} 人观看`}</span></div></div>${closed ? '' : `<button class="btn primary" ${item.action || `data-go="feature-detail" data-hash="#${item.contentId}"`}>进入课程</button>`}</article>`;
}
function renderLearning() {
  const paid = [];
  const spoc = demo.digitalSpocJoined ? [{
    title: '数字素养与安全',
    cover: 'c',
    mark: '专属课程',
    status: 'not-started',
    statusLabel: '未开始',
    school: '数字素养教研组',
    views: '1,286',
    action: 'data-go="spoc-learn"'
  }] : [];
  $('#profile-learning-list').innerHTML = [...standardLearningItems, ...spoc].map(item => learningCard(item)).join('') + paid.map(item => learningCard(item, 'paid')).join('');
  applyLearningFilters();
}
function applyLearningFilters() {
  const type = $('[data-learning-filter="type"]')?.value || 'all';
  const status = $('[data-learning-filter="status"]')?.value || 'all';
  let visible = 0;
  $$('[data-learning-type]').forEach(item => {
    const show = (type === 'all' || item.dataset.learningType === type) && (status === 'all' || item.dataset.learningStatus === status);
    item.classList.toggle('hide', !show);
    if (show) visible++;
  });
  $('#profile-course-empty')?.classList.toggle('show', !visible);
}
const profileFilterConfig = {
  courses: {
    selector: '[data-course-status]',
    key: 'courseStatus',
    empty: '#profile-course-empty'
  },
  favorites: {
    selector: '[data-favorite-type]',
    key: 'favoriteType',
    empty: '#favorite-empty'
  },
  assignments: {
    selector: '[data-assignment-status]',
    key: 'assignmentStatus',
    empty: '#profile-assignment-empty'
  },
  wrong: {
    selector: '[data-wrong-type]',
    key: 'wrongType',
    empty: '#profile-wrong-empty',
    search: '#wrong-search'
  },
  exams: {
    selector: '[data-exam-status]',
    key: 'examStatus',
    empty: '#profile-exam-empty',
    search: '#exam-search'
  }
};
function applyProfileFilter(group, value) {

  const config = profileFilterConfig[group];
  if (!config) return;
  $$(`[data-profile-filter="${group}"]`).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filterValue === value)));
  let visible = 0;
  const query = config.search ? $(config.search)?.value.trim().toLowerCase() : '';
  $$(config.selector).forEach(item => {
    const show = (value === 'all' || item.dataset[config.key] === value) && (!query || (group === 'exams' ? $('b', item) : item).textContent.toLowerCase().includes(query));
    item.classList.toggle('hide', !show);
    if (show) visible++;
  });
  if (config.empty) $(config.empty)?.classList.toggle('show', !visible);
  if (group === 'favorites') {
    const discover = $('#favorite-empty button'),
      sets = value === '主题题单';
    discover.textContent = sets ? '发现主题题单' : '发现课程';
    discover.dataset.go = sets ? 'programming' : 'courses';
    if (sets) discover.dataset.hash = '#sets';else delete discover.dataset.hash;
  }
}
$('.profile-nav').insertAdjacentHTML('beforeend', '<button class="profile-nav-btn" data-profile-view="wrong">我的错题</button><button class="profile-nav-btn" data-profile-view="exams">我的考试</button>');
$('.profile-nav').append($('[data-profile-view="assignments"]'), $('[data-profile-view="exams"]'), $('[data-profile-view="wrong"]'), $('[data-profile-view="favorites"]'));
$('.profile-nav').insertAdjacentHTML('beforeend', '<button class="profile-nav-btn profile-nav-info" data-profile-view="info">个人资料</button>');
const securityEye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/><path class="auth-eye-slash" d="m4 4 16 16" hidden/></svg>';
function passwordField(name, label, autocomplete = 'new-password') {
  return `<label class="auth-field"><span>${label}</span><span class="auth-password"><input name="${name}" type="password" autocomplete="${autocomplete}" required minlength="8" placeholder="请输入${label}"><button type="button" data-security-password-toggle aria-label="显示${label}">${securityEye}</button></span></label>`;
}
function maskedContact(type, value) {
  if (!value) return '未绑定';
  return type === 'phone' ? value.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : value;
}
function syncAccountContacts() {
  ['phone', 'email'].forEach(type => {
    const value = demo.accountContacts[type],
      set = !!value;
    $$(`[data-contact-value="${type}"]`).forEach(node => node.textContent = (node.closest('.security-item') && set ? '已绑定：' : '') + maskedContact(type, value));
    $$(`[data-contact-status="${type}"]`).forEach(node => {
      node.textContent = set ? '已设置' : '未设置';
      node.classList.toggle('is-set', set);
    });
    $$(`[data-security-action="${type}"]`).forEach(button => button.textContent = set ? '修改' : '绑定');
  });
}
function openCancellationNotice(trigger) {
  openFlowDialog('账号注销须知', `<div class="cancellation-notice"><p>注销后账号将无法恢复，请先确认以下影响：</p><ul><li>课程进度、练习、考试和学习记录将被清除。</li><li>已购内容、收藏、订单与售后记录将无法继续使用。</li><li>账号内的个人信息、评论与互动数据将按规则处理。</li><li>提交后进入 7 天冷静期，期间再次登录可撤回申请。</li></ul><p class="meta">当前为本地原型演示，不会真实删除账号或学习数据。</p></div><label class="auth-consent cancellation-consent"><input type="checkbox" data-cancellation-consent><span>我已阅读并同意《账号注销协议》</span></label>`);
  const actions = $('.dialog-actions', flowDialog);
  actions.innerHTML = '<button class="btn" type="button" id="close-flow-dialog">取消</button><button class="btn danger" type="button" id="continue-cancellation" disabled>继续注销</button>';
  $('#close-flow-dialog').onclick = () => flowDialog.close();
  $('[data-cancellation-consent]').onchange = e => $('#continue-cancellation').disabled = !e.target.checked;
  $('#continue-cancellation').onclick = () => openCancellationVerification(trigger);
}
function openCancellationVerification(trigger) {
  const phone = demo.accountContacts.phone || '';
  openFlowDialog('为了保障您的账号安全，请验证身份', `<form class="security-form" id="cancellation-form"><label class="auth-field"><span>手机号</span><input name="phone" type="tel" inputmode="tel" required pattern="1[3-9][0-9]{9}" value="${escapeHTML(phone)}" placeholder="请输入绑定手机号"></label><label class="auth-field"><span>短信验证码</span><span class="security-code"><input name="code" inputmode="numeric" required pattern="[0-9]{6}" maxlength="6" placeholder="请输入 6 位验证码"><button class="btn" type="button" data-security-code>获取验证码</button></span></label><p class="meta">验证码校验为本地流程演示。</p></form>`);
  const form = $('#cancellation-form'),
    actions = $('.dialog-actions', flowDialog);
  actions.innerHTML = '<button class="btn" type="button" id="back-cancellation">上一步</button><button class="btn danger" type="submit" form="cancellation-form">申请注销</button>';
  $('#back-cancellation').onclick = () => openCancellationNotice(trigger);
  form.onsubmit = e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    demo.accountCancellation = {
      pending: true,
      submittedAt: new Date().toISOString()
    };
    persistDemo();
    openCancellationSubmitted();
  };
  form.phone.focus();
}
function openCancellationSubmitted() {
  openFlowDialog('注销申请已提交', '<div class="cancellation-result"><strong>账号已进入 7 天注销冷静期</strong><ul><li>冷静期内账号与学习数据不会被立即删除。</li><li>期间再次登录，可选择撤回注销申请。</li><li>若不撤回，冷静期结束后才进入正式注销流程。</li></ul><p class="meta">本页仅演示流程，不会真实注销账号。</p></div>');
  const actions = $('.dialog-actions', flowDialog);
  let left = 10;
  actions.innerHTML = `<button class="btn primary" type="button" id="finish-cancellation" disabled>我知道了（${left}）</button>`;
  const button = $('#finish-cancellation'),
    timer = setInterval(() => {
      left--;
      button.textContent = left ? `我知道了（${left}）` : '我知道了';
      if (!left) {
        clearInterval(timer);
        button.disabled = false;
      }
    }, 1000);
  flowDialog.addEventListener('close', () => clearInterval(timer), {
    once: true
  });
  button.onclick = () => {
    flowDialog.close();
    applyAuth(false);
    persistDemo();
  };
}
function openCancellationWithdrawal() {
  if (flowDialog?.open) return;
  openFlowDialog('确认撤回注销申请？', '<p>当前账号处于 7 天注销冷静期。撤回后，可继续正常使用账号和学习数据。</p><p class="meta">不撤回将退出本次登录。</p>');
  const actions = $('.dialog-actions', flowDialog);
  actions.innerHTML = '<button class="btn" type="button" id="keep-cancellation">取消</button><button class="btn primary" type="button" id="withdraw-cancellation">撤回注销申请</button>';
  $('#keep-cancellation').onclick = () => {
    flowDialog.close();
    applyAuth(false);
    persistDemo();
  };
  $('#withdraw-cancellation').onclick = () => {
    delete demo.accountCancellation;
    persistDemo();
    flowDialog.close();
    showToast('已撤回注销申请（演示）');
  };
}
function openSecurityDialog(action, trigger) {
  if (action === 'cancel-account') {
    openCancellationNotice(trigger);
    return;
  }
  const contact = demo.accountContacts[action];
  const dialogs = {
    password: ['修改登录密码', `<form class="security-form" data-security-form="password">${passwordField('currentPassword', '当前密码', 'current-password')}${passwordField('newPassword', '新密码')}${passwordField('confirmPassword', '确认新密码')}<p class="auth-help">密码至少 8 位，建议包含数字、字母或特殊符号中的两种。</p><p class="auth-error" role="alert"></p></form>`, '确认修改'],
    phone: [contact ? '更换绑定手机' : '绑定手机', `<form class="security-form" data-security-form="phone">${contact ? `<p>当前绑定手机号：${maskedContact('phone', contact)}</p>` : ''}${passwordField('password', '登录密码', 'current-password')}<label class="auth-field"><span>${contact ? '新' : ''}手机号</span><input name="phone" type="tel" inputmode="tel" required pattern="1[3-9][0-9]{9}" placeholder="请输入${contact ? '新' : ''}手机号"></label><label class="auth-field"><span>短信验证码</span><span class="security-code"><input name="code" inputmode="numeric" required maxlength="6" placeholder="请输入验证码"><button class="btn" type="button" data-security-code>获取验证码</button></span></label></form>`, contact ? '确认更换' : '确认绑定'],
    email: [contact ? '修改绑定邮箱' : '绑定邮箱', `<form class="security-form" data-security-form="email">${contact ? `<p>当前绑定邮箱：${escapeHTML(contact)}</p>` : ''}<label class="auth-field"><span>${contact ? '新' : ''}邮箱</span><input name="email" type="email" required placeholder="请输入${contact ? '新' : ''}邮箱"></label><label class="auth-field"><span>邮箱验证码</span><span class="security-code"><input name="code" inputmode="numeric" required maxlength="6" placeholder="请输入验证码"><button class="btn" type="button" data-security-code>获取验证码</button></span></label></form>`, contact ? '确认修改' : '确认绑定']
  };
  const [title, content, confirm] = dialogs[action];
  openFlowDialog(title, content);
  const form = $('[data-security-form]', flowDialog),
    actions = $('.dialog-actions', flowDialog);
  actions.innerHTML = `<button class="btn" type="button" id="close-flow-dialog">取消</button><button class="btn ${action === 'cancel-account' ? 'danger' : 'primary'}" type="submit" form="security-form">${confirm}</button>`;
  form.id = 'security-form';
  $('#close-flow-dialog').onclick = () => flowDialog.close();
  form.onsubmit = e => {
    e.preventDefault();
    const error = $('.auth-error', form);
    if (error) error.textContent = '';
    if (!form.reportValidity()) return;
    if (action === 'password' && form.newPassword.value !== form.confirmPassword.value) {
      error.textContent = '两次输入的新密码不一致。';
      form.confirmPassword.focus();
      return;
    }
    if (action === 'phone' || action === 'email') {
      demo.accountContacts[action] = form[action].value.trim();
      persistDemo();
      syncAccountContacts();
    }
    flowDialog.close();
    trigger.focus();
    showToast(action === 'cancel-account' ? '注销申请已提交（演示）' : '安全信息已更新（演示）');
  };
  $('input', form)?.focus();
}
// 头像仅用当前页面的临时 URL 演示，不写入持久化状态。
let profileAvatarUrl = '',
  profileAvatarDraft = '';
function renderProfileAvatar(message = '') {
  const preview = $('#profile-avatar-preview');
  if (!preview) return;
  const url = profileAvatarDraft || profileAvatarUrl;
  preview.replaceChildren();
  if (url) {
    const image = new Image();
    image.src = url;
    image.alt = '头像预览';
    preview.append(image);
  } else preview.textContent = prototypeState.displayName?.slice(0, 1) || '林';
  $('.profile-avatar-actions').hidden = !profileAvatarDraft;
  $('#profile-avatar-feedback').textContent = message;
  $('#profile-avatar-feedback').hidden = !message;
}
function cancelProfileAvatar() {
  if (profileAvatarDraft) URL.revokeObjectURL(profileAvatarDraft);
  profileAvatarDraft = '';
  const input = $('#profile-avatar-file');
  if (input) input.value = '';
}
async function previewProfileAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    input.value = '';
    renderProfileAvatar('请选择不超过 2 MB 的 JPG 或 PNG 图片。');
    return;
  }
  const url = URL.createObjectURL(file),
    image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(url);
    if (input.isConnected && input.files[0] === file) {
      input.value = '';
      renderProfileAvatar('图片无法读取，请重新选择。');
    }
    return;
  }
  if (!input.isConnected || input.files[0] !== file) {
    URL.revokeObjectURL(url);
    return;
  }
  if (profileAvatarDraft) URL.revokeObjectURL(profileAvatarDraft);
  profileAvatarDraft = url;
  input.value = '';
  renderProfileAvatar();
}
function openProfileView(view, focus = false) {
  if (view === 'security') view = 'info';
  const btn = $(`[data-profile-view="${view}"]`);
  if (!btn || !profileViews[view]) return;
  $$('.profile-nav-btn').forEach(x => x.classList.toggle('active', x === btn));
  const purchases = view === 'purchases';
  $('[data-profile-view="purchases"]')?.setAttribute('aria-expanded', String(purchases));
  if (!purchases) $$('[data-purchase-view]').forEach(x => {
    x.classList.remove('active');
    x.removeAttribute('aria-current');
  });
  cancelProfileAvatar();
  profilePanel.innerHTML = profileViews[view];
  syncProfile(view);
  syncAccountContacts();
  if (view === 'info') renderProfileAvatar();
  if (focus) profilePanel.focus();
}
document.addEventListener('click', e => {
  const avatar = e.target.closest('[data-avatar-action]');
  if (avatar) {
    if (avatar.dataset.avatarAction === 'select') $('#profile-avatar-file').click();else if (avatar.dataset.avatarAction === 'confirm' && profileAvatarDraft) {
      if (profileAvatarUrl) URL.revokeObjectURL(profileAvatarUrl);
      profileAvatarUrl = profileAvatarDraft;
      profileAvatarDraft = '';
      renderProfileAvatar();
      showToast('头像修改成功（演示）');
      $('[data-avatar-action="select"]').focus();
    } else if (avatar.dataset.avatarAction === 'cancel') {
      cancelProfileAvatar();
      renderProfileAvatar();
      $('[data-avatar-action="select"]').focus();
    }
  }
  const nav = e.target.closest('[data-profile-view]');
  if (nav) openProfileView(nav.dataset.profileView, false);
  const filter = e.target.closest('[data-profile-filter]');
  if (filter) applyProfileFilter(filter.dataset.profileFilter, filter.dataset.filterValue);

  const security = e.target.closest('[data-security-action]');
  if (security) openSecurityDialog(security.dataset.securityAction, security);
  const eye = e.target.closest('[data-security-password-toggle]');
  if (eye) {
    const input = eye.previousElementSibling,
      visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    eye.classList.toggle('password-visible', !visible);
    eye.setAttribute('aria-label', visible ? '显示密码' : '隐藏密码');
  }
  const code = e.target.closest('[data-security-code]');
  if (code) {
    code.textContent = '验证码已发送';
    code.disabled = true;
    showToast('验证码已发送（演示）');
  }
  const wrongDetail = e.target.closest('[data-wrong-detail]');
  if (wrongDetail) {
    const item = wrongSamples[Number(wrongDetail.dataset.wrongDetail)];
    openFlowDialog('错题详情', `<div class="wrong-detail"><div class="wrong-detail-head"><span class="wrong-kind">${item.type}</span><strong>得分：${item.score}</strong></div><h3>${escapeHTML(item.prompt)}</h3>${item.options.length ? `<ul>${item.options.map(option => `<li>${escapeHTML(option)}</li>`).join('')}</ul>` : ''}<p><b>正确答案：</b>${escapeHTML(item.answer)}</p><p><b>我的答案：</b>${escapeHTML(item.mine)}</p><div class="wrong-explain"><b>答案解析</b><p>${escapeHTML(item.explain)}</p></div></div>`);
    flowDialog.addEventListener('close', () => wrongDetail.focus(), {
      once: true
    });
  }
  const remove = e.target.closest('[data-remove-favorite]');
  if (remove) {
    const item = remove.closest('.favorite-item');
    demo.favorites = demo.favorites.filter(id => id !== item.dataset.favoriteId);
    item.remove();
    persistDemo();
    showToast('已取消收藏');
    applyProfileFilter('favorites', $('[data-profile-filter="favorites"][aria-pressed="true"]').dataset.filterValue);
    const next = $('#favorite-list .favorite-item:not(.hide) button');
    if (next) next.focus();else $('#favorite-empty button').focus();
  }
});
$$('.profile-nav-btn').forEach(b => b.addEventListener('keydown', e => {
  if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const nav = $$('.profile-nav-btn'),
    i = nav.indexOf(b),
    next = e.key === 'Home' ? nav[0] : e.key === 'End' ? nav.at(-1) : nav[(i + (e.key === 'ArrowDown' ? 1 : -1) + nav.length) % nav.length];
  openProfileView(next.dataset.profileView);
  next.focus();
}));
document.addEventListener('submit', e => {
  if (e.target.id !== 'profile-form') return;
  e.preventDefault();
  const invalid = $$('input:invalid,select:invalid', e.target);
  $$('.field', e.target).forEach(f => f.classList.toggle('invalid', !!$('input:invalid,select:invalid', f)));
  if (invalid.length) {
    invalid[0].focus();
    showToast('请检查标记的信息');
    return;
  }
  const save = $('button[type=submit]', e.target);
  save.disabled = true;
  save.textContent = '保存中…';
  setTimeout(() => {
    save.disabled = false;
    save.textContent = '保存修改';
    const name = $('#profile-name').value.trim();
    prototypeState.displayName = name;
    demo.profile = Object.fromEntries($$('input:not([type="file"]),select,textarea', e.target).map(x => [x.id, x.value]));
    persistDemo();
    $('#profile-title').textContent = name + '同学，上午好';
    $('#user-entry').textContent = name.slice(-1) || '我';
    showToast('基础信息已保存');
  }, 700);
});
document.addEventListener('change', e => {
  if (e.target.matches('[data-learning-filter]')) applyLearningFilters();
  if (e.target.id === 'profile-avatar-file') previewProfileAvatar(e.target);
});
document.addEventListener('auth-changed', () => {
  if (prototypeState.logged && demo.accountCancellation?.pending) openCancellationWithdrawal();
});
openProfileView('courses');
function syncProfile(view) {
  if (view === 'wrong') {
    $('#profile-wrong-list').innerHTML = wrongSamples.map((item, index) => `<article class="wrong-card" data-wrong-type="${item.type === '单选题' ? 'single' : 'text'}"><div class="wrong-card-head"><span class="wrong-kind">${item.type}</span><span class="wrong-score">得分：${item.score}</span></div><h3>${escapeHTML(item.prompt)}</h3><div class="wrong-meta"><span>所属课程：${item.course}</span><span>来源：${item.source}</span><time>${item.time}</time></div><button class="btn primary" data-wrong-detail="${index}">查看错题</button></article>`).join('');
    $('#wrong-search').addEventListener('input', () => applyProfileFilter('wrong', $('[data-profile-filter="wrong"][aria-pressed="true"]').dataset.filterValue));
  }
  if (view === 'exams') {
    const exam = demo.assessments.exam;
    const status = exam?.submitted ? 'review-pending' : 'active';
    $('#profile-exam-list').innerHTML = `<div class="lesson" data-exam-status="${status}"><span><b>Python 程序设计期中考试</b><br><small>${exam?.submitted ? '已交卷 · 待批阅' : exam?.startedAt ? '作答中' : '可进入'} · 20 题 · 60 分钟</small></span><button data-open-exam>${exam?.submitted ? '查看记录' : exam?.startedAt ? '继续考试' : '进入考试'}</button></div><div class="lesson" data-exam-status="not-started"><span><b>Python 程序设计期末考试</b><br><small>未开始 · 2096 年 12 月 31 日 14:00</small></span><button data-upcoming-exam>查看安排</button></div>`;
    $('#exam-search').addEventListener('input', () => applyProfileFilter('exams', $('[data-profile-filter="exams"][aria-pressed="true"]').dataset.filterValue));
  }
  const done = id => id === 'code' ? demo.codeResult?.passed : demo.assessments[id]?.submitted;
  if (view === 'dashboard') $$('.todo', profilePanel).forEach(item => {
    const button = $('[data-go]', item);
    if (button && done(button.dataset.go)) {
      const id = button.dataset.go;
      delete button.dataset.go;
      button.dataset.result = id;
      button.textContent = '查看结果';
      $('small', item).textContent = id === 'exam' ? '已交卷，待批阅' : '本次任务已完成';
    }
  });
  if (view === 'info' && demo.profile) for (const [id, value] of Object.entries(demo.profile)) {
    if ($('#' + id)) $('#' + id).value = value;
  }
  if (view === 'favorites') {
    const items = {
      python: ['Python 程序设计', '课程', 'detail'],
      data: ['数据科学导论', '课程', 'preview'],
      assignment: ['学生成绩分析报告', '作业', 'learn', '#assignment']
    };

    $('#favorite-list').innerHTML = demo.favorites.filter(id => items[id]).map(id => {
      const [title, type, route, hash] = items[id];
      return `<article class="favorite-item" data-favorite-id="${id}" data-favorite-type="${type}"><div class="item-copy"><span class="badge">${type}</span><strong>${title}</strong></div><div class="actions"><button class="btn small" ${route === 'preview' ? 'data-course-preview="数据科学导论"' : `data-go="${route}"${hash ? ` data-hash="${hash}"` : ''}`}>查看</button><button class="btn small danger" data-remove-favorite>取消收藏</button></div></article>`;
    }).join('');
    $('select', profilePanel)?.remove();
    $('.view-head', profilePanel).insertAdjacentHTML('afterend', profileFilterTabs('favorites', [['all', '全部收藏'], ['课程', '课程'], ['作业', '作业']]));
    applyProfileFilter('favorites', 'all');
  }
  if (view === 'courses') {
    renderLearning();
  }

  if (view === 'assignments') {
    $$('.assignment-item').forEach(item => {
      const b = $('[data-go]', item);
      if (!b) return;
      const id = b.dataset.go,
        done = id === 'code' ? demo.codeResult?.passed : demo.assessments[id]?.submitted;
      if (done) {
        item.dataset.assignmentStatus = 'done';
        delete b.dataset.go;
        b.dataset.result = id;
        b.textContent = '查看结果';
        $('.badge', item).textContent = id === 'exam' ? '待批阅' : '已完成';
      }
    });
    $('#assignment-filter').remove();
    $('.view-head', profilePanel).insertAdjacentHTML('afterend', profileFilterTabs('assignments', [['all', '全部任务'], ['pending', '待完成'], ['done', '已完成']]));
    profilePanel.insertAdjacentHTML('beforeend', '<div class="statebox" id="profile-assignment-empty"><h2>没有符合条件的作业</h2><p>尝试选择其他任务状态。</p></div>');
    applyProfileFilter('assignments', 'all');
  }
  $$('[data-reminder]').forEach(b => b.textContent = demo.reminders ? '取消开课提醒' : '设置开课提醒');
}
document.addEventListener('prototype-ready', () => {
  const requested = location.hash.slice(1);
  if (profileViews[requested] || requested === 'security') openProfileView(requested);
  if (prototypeState.logged && demo.accountCancellation?.pending) openCancellationWithdrawal();
});

// The profile owns its selected view; shared state only handles lifecycle.
document.addEventListener('prototype-save', event => {
  event.detail.profileView = $('.profile-nav-btn.active')?.dataset.profileView;
});
document.addEventListener('prototype-restore', event => {
  if (event.detail.profileView) openProfileView(event.detail.profileView);
});
