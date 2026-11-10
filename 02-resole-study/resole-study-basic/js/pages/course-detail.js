const coursePanel = $('#course-tab-content'),
  overviewHTML = coursePanel.innerHTML;
const courseViews = {
  overview: overviewHTML,
  catalog: '<div class="view-head"><div><h2>课程目录</h2><p class="meta">6 个模块 · 42 课时 · 12 次练习</p></div><button class="btn primary" data-go="learn">继续学习</button></div><div class="module"><div class="module-head"><strong>第一章 · 初识 Python</strong><span class="badge">已完成</span></div><div class="lesson"><span>1.1 程序与计算思维 · 16 分钟</span><button data-go="learn">复习</button></div><div class="lesson"><span>1.2 搭建第一个程序 · 在线编程</span><button data-learn-content="assignment">查看作业</button></div></div><div class="module"><div class="module-head"><strong>第三章 · 流程控制</strong><span class="badge">进行中</span></div><div class="lesson"><span>3.2 列表与循环 · 剩余 18 分钟</span><button data-go="learn">继续</button></div><div class="lesson"><span>章节练习 · 5 题</span><button data-go="practice">开始</button></div><div class="lesson"><span>第三章小测 · 15 分钟</span><button data-go="test">开始</button></div></div><div class="module"><div class="module-head"><strong>期中考试</strong><span class="badge neutral">9 月 12 日开放</span></div><div class="lesson"><span>60 分钟 · 20 题 · 仅 1 次机会</span><button data-go="exam">查看规则</button></div></div>',
  tasks: '<div class="view-head"><div><h2>作业与测验</h2><p class="meta">练、测、考集中管理，截止时间一目了然。</p></div><select aria-label="筛选任务"><option>全部任务</option><option>待完成</option><option>已完成</option></select></div><div class="lesson"><span><b>章节练习</b><br><small>循环结构练习 · 5 题 · 可重复提交</small></span><button data-go="practice">继续练习</button></div><div class="lesson"><span><b>课前测</b><br><small>第三章小测 · 截止 9 月 8 日 23:59</small></span><button data-go="test">开始测试</button></div><div class="lesson"><span><b>文件作业</b><br><small>学生成绩分析报告 · 线下完成并上传文件</small></span><button data-learn-content="assignment">提交作业</button></div><div class="lesson"><span><b>期中考试</b><br><small>9 月 12 日 14:00 开放 · 仅 1 次机会</small></span><button data-go="exam">查看规则</button></div>',
  knowledge: renderKnowledgeGraph(["Python 程序设计", "循环结构", "函数", "列表", "文件操作", "for 循环", "while 循环", "条件表达式", "参数", "递归", "列表遍历", "切片", "文件读写"], ["python", "loop", "function", "list", "file", "node-5", "node-6", "node-7", "node-8", "node-9", "node-10", "node-11", "node-12"]),
  notices: '<div class="view-head"><div><h2>课程公告</h2><p class="meta">共 4 条公告</p></div></div><div class="module"><div class="module-head"><strong>第三章小测开放</strong><span class="meta">9 月 4 日</span></div><p>请在 9 月 8 日 23:59 前完成。本次测验可作答两次，取最高成绩。</p><span class="meta">陈珺 · 09:20</span></div><div class="module"><div class="module-head"><strong>第三章答疑安排</strong><span class="meta">9 月 2 日</span></div><p>请在课程讨论区提出循环结构学习问题，教师将结合课程安排回复。</p></div><div class="module"><div class="module-head"><strong>课件勘误说明</strong><span class="meta">8 月 29 日</span></div><p>第二章课件第 18 页示例代码已更新，可重新下载。</p></div>',
  discussion: '<div class="view-head"><div><h2>讨论互动</h2><p class="meta"><span id="discussion-count">24</span> 个话题 · 本周新增 6 个</p></div><button class="btn primary" id="ask-question">发起提问</button></div><form class="ask-form" id="ask-form" hidden novalidate><h3>发起新话题</h3><div class="field"><label for="question-title">问题标题</label><input id="question-title" required maxlength="60" placeholder="用一句话描述你的问题"><div class="error-text">请输入问题标题。</div></div><div class="field"><label for="question-body">问题描述</label><textarea id="question-body" required minlength="10" placeholder="说明你的思考、尝试过的方法或报错信息"></textarea><div class="error-text">请至少输入 10 个字的问题描述。</div></div><div class="dialog-actions"><button class="btn" type="button" id="cancel-question">取消</button><button class="btn primary" type="submit">发布问题</button></div></form><div id="discussion-list"><article class="module discussion-topic"><strong>为什么 range 的结束值不包含在结果里？</strong><p>周同学：这样设计与 Python 的切片规则有什么关系吗？</p><div class="meta">3 条回复 · 陈老师已回答 · 2 小时前</div><button class="btn small" data-discussion-expand>查看 3 条回复</button><div class="discussion-replies" hidden><p><b>陈老师：</b>左闭右开的区间让长度始终等于“结束值减开始值”，也能和切片保持一致。</p><p><b>林同学：</b>用 <code>range(len(items))</code> 时确实很方便。</p><button class="btn small" data-reply>参与讨论</button></div></article><article class="module discussion-topic"><strong>分享一个记忆循环嵌套的方法</strong><p>李同学：我把外层循环理解为“行”，内层理解为“列”……</p><div class="meta">8 条回复 · 昨天</div><button class="btn small" data-discussion-expand>查看 8 条回复</button><div class="discussion-replies" hidden><p><b>王助教：</b>这个类比适合二维数据，也可以画一张执行顺序表继续验证。</p><button class="btn small" data-reply>参与讨论</button></div></article><article class="module discussion-topic"><strong>第三章编程题的边界情况</strong><p>徐同学：空列表时应该返回 0，还是提示输入错误？</p><div class="meta">2 条回复 · 3 天前</div><button class="btn small" data-discussion-expand>查看 2 条回复</button><div class="discussion-replies" hidden><p><b>周助教：</b>请以题目约束为准，本题保证输入列表至少包含一个元素。</p><button class="btn small" data-reply>参与讨论</button></div></article></div>',
  team: '<div class="view-head"><div><h2>教研团队</h2><p class="meta">主讲、助教与实验指导共同支持课程。</p></div></div><div class="team-grid"><div class="team-member"><span class="avatar">陈</span><div><strong>陈珺</strong><div class="meta">课程负责人 · 主讲教师</div></div></div><div class="team-member"><span class="avatar">李</span><div><strong>李然</strong><div class="meta">主讲教师 · 算法基础</div></div></div><div class="team-member"><span class="avatar">周</span><div><strong>周恺</strong><div class="meta">课程助教 · 在线答疑</div></div></div><div class="team-member"><span class="avatar">王</span><div><strong>王璐</strong><div class="meta">实验指导 · Python OJ</div></div></div></div><dl class="info-table"><dt>授课机构</dt><dd>华东师范大学数据科学与工程学院</dd><dt>授课语言</dt><dd>中文</dd><dt>适合人群</dt><dd>大学一年级及零基础学习者</dd><dt>答疑时间</dt><dd>每周四 19:00–20:00</dd></dl>',
  results: '<div class="view-head"><div><h2>学习成果</h2><p class="meta">课程进度、成绩与证书集中呈现。</p></div></div><div class="kpi-grid"><div class="kpi-card"><span>课程进度</span><strong>42%</strong></div><div class="kpi-card"><span>练习正确率</span><strong>84%</strong></div><div class="kpi-card"><span>测验均分</span><strong>86</strong></div><div class="kpi-card"><span>文件作业</span><strong>待批阅</strong></div></div><section class="detail-section"><h2>课程证书</h2><div class="empty-cert"><div style="font-size:34px">◇</div><strong>完成课程后可申请证书</strong><p class="meta" style="justify-content:center">要求：学习进度 100%，综合成绩不低于 60 分。</p><button class="btn" disabled title="尚未达到证书申请条件">申请证书</button></div></section>'
};
courseViews.catalog = `<div class="view-head"><div><h2>课程目录</h2><p class="meta">6 个章节 · 视频、课件、资料、练习与作业按章节排列。</p></div><button class="btn primary" data-learn-content="lesson-3-2">继续学习</button></div>${[['第一章 · 初识 Python', ['1.1 程序与计算思维', '1.2 Python 开发环境', '1.3 第一个 Python 程序']], ['第二章 · 基础语法', ['2.1 变量、常量与表达式', '2.2 数字、字符串与布尔值', '2.3 基本输入输出', '2.4 变量与类型实战', '2.5 表达式与输入输出挑战']], ['第三章 · 流程控制', ['3.1 条件语句', '3.2 列表与循环', '3.3 循环嵌套', 'Python 程序设计学习讲义.pdf', '第三章课堂演示课件.pptx', 'Python 课程实践素材', '章节练习 · 5 题', '第三章小测', '文件作业 · 词频统计', '学生成绩分析报告']], ['第四章 · 函数与模块', ['4.1 函数定义与调用', '4.2 参数、返回值与作用域', '4.3 模块与标准库']], ['第五章 · 组合数据类型', ['5.1 列表与元组', '5.2 字典与集合', '5.3 常见数据处理']], ['第六章 · 文件与项目实践', ['6.1 文件读写与异常处理', '6.2 程序调试与测试', '6.3 综合编程任务']]].map(([chapter, items]) => `<div class="module"><div class="module-head"><strong>${chapter}</strong><span class="badge neutral">${items.length} 项</span></div>${items.map(item => {
  const action = item.includes('.pdf') ? 'pdf' : item.includes('.pptx') ? 'ppt' : item === 'Python 课程实践素材' ? 'download' : item === '学生成绩分析报告' ? 'assignment' : item.startsWith('2.4') ? 'lesson-2-4' : item.startsWith('2.5') ? 'lesson-2-5' : item.startsWith('3.1') ? 'lesson-3-1' : item.startsWith('3.2') ? 'lesson-3-2' : item.startsWith('3.3') ? 'lesson-3-3' : item.startsWith('章节练习') ? 'practice' : item === '第三章小测' ? 'test' : item.startsWith('文件作业') ? 'assignment' : 'preview';
  return `<div class="lesson"><span>${item}</span><button ${['practice', 'test', 'code'].includes(action) ? `data-go="${action}"` : `data-learn-content="${action}"`}>${action === 'download' ? '查看资料' : action === 'assignment' ? '查看作业' : '进入学习'}</button></div>`;
}).join('')}</div>`).join('')}<div class="module"><div class="module-head"><strong>课程考试</strong><span class="badge neutral">2 场</span></div><div class="lesson"><span>Python 程序设计期中考试</span><button data-go="exam">查看规则</button></div></div>`;
function openCourseView(view, focus = false) {
  const btn = $(`[data-course-view="${view}"]`, $('.course-nav'));
  if (!btn || !courseViews[view]) return;
  $$('.course-nav-btn').forEach(x => {
    const active = x === btn;
    x.classList.toggle('active', active);
    x.setAttribute('aria-selected', active);
    x.tabIndex = active ? 0 : -1;
  });
  coursePanel.innerHTML = view === 'discussion' ? '<div id="course-discussion"></div>' : courseViews[view];
  if (view === 'team') $('.info-table', coursePanel)?.remove();
  syncCourseView(view);
  if (focus) coursePanel.focus();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-course-view]');
  if (b) {
    e.preventDefault();
    openCourseView(b.dataset.courseView, !b.classList.contains('course-nav-btn'));
  }
  const content = e.target.closest('[data-learn-content]');
  if (content) go('learn', `#${content.dataset.learnContent}`);
});
$$('.course-nav-btn').forEach(b => b.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const tabs = $$('.course-nav-btn'),
    i = tabs.indexOf(b),
    next = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs.at(-1) : tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
  openCourseView(next.dataset.courseView);
  next.focus();
}));
openCourseView('overview');
function formatCheckinTime(value) {
  const date = new Date(value),
    pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function renderCourseCheckin() {
  const root = $('#checkin-status');
  if (!root) return;
  if (demo.checkinMode === 'unset') {
    root.innerHTML = '<div class="checkin-state unset"><span class="checkin-icon" aria-hidden="true">—</span><strong>未设置打卡信息</strong><p>当前课程暂无打卡要求</p></div>';
    return;
  }
  if (demo.checkedIn) {
    const time = demo.checkedInAt ? formatCheckinTime(demo.checkedInAt) : '2026-09-09 10:00:00';
    root.innerHTML = `<div class="checkin-state complete"><span class="checkin-icon" aria-hidden="true">✓</span><strong>今日打卡完成</strong><p>最近打卡：<time>${time}</time></p></div>`;
    return;
  }
  root.innerHTML = '<div class="checkin-state pending"><span class="checkin-icon" aria-hidden="true">!</span><strong>今日未打卡</strong><p>完成今日学习后记录打卡</p><button class="btn small primary" data-checkin>今日打卡</button></div>';
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-checkin]')) {
    demo.checkinMode = 'active';
    demo.checkedIn = true;
    demo.checkedInAt = Date.now();
    persistDemo();
    renderCourseCheckin();
    showToast('今日打卡已记录');
  }
  const mode = e.target.closest('[data-checkin-mode]')?.dataset.checkinMode;
  if (!mode) return;
  demo.checkinMode = mode === 'unset' ? 'unset' : 'active';
  demo.checkedIn = mode === 'complete';
  if (demo.checkedIn) demo.checkedInAt = Date.now();else delete demo.checkedInAt;
  persistDemo();
  renderCourseCheckin();
  showToast(mode === 'unset' ? '已切换为未设置打卡' : mode === 'complete' ? '已切换为打卡完成' : '已切换为今日未打卡');
});
function syncCourseView(view) {
  syncCommon();
  if (['catalog', 'tasks'].includes(view)) {
    const button = $('[data-go="exam"]', coursePanel);
    if (button) {
      const exam = demo.assessments.exam;
      const status = exam?.submitted ? '已交卷 · 待批阅' : exam?.startedAt ? '作答中' : '可进入';
      const row = button.closest('.lesson');
      row.dataset.examRow = 'open';
      row.insertAdjacentHTML('afterend', '<div class="lesson" data-exam-row="upcoming" data-task-done="no"><span><b>Python 程序设计期末考试</b><br><small>未开始 · 2096 年 12 月 31 日 14:00 开始 · 60 分钟</small></span><button data-upcoming-exam>查看安排</button></div>');
      row.dataset.taskDone = exam?.submitted ? 'yes' : 'no';
      $('span', row).innerHTML = `<b>Python 程序设计期中考试</b><br><small>${status} · 20 题 · 100 分 · 60 分钟</small>`;
      const badge = $('.module-head .badge', row.closest('.module') || row);
      if (badge) {
        badge.textContent = '2 场考试';
        $('.module-head strong', row.closest('.module')).textContent = '课程考试';
      }
      delete button.dataset.go;
      button.dataset.openExam = '';
      button.textContent = exam?.submitted ? '查看考试记录' : exam?.startedAt ? '继续考试' : '进入考试';
    }
  }
  if (view === 'discussion') {
    mountCourseDiscussion($('#course-discussion'), '讨论互动');
  }
  if (view === 'tasks') {
    const select = $('select', coursePanel);
    select.setAttribute('aria-label', '筛选任务状态');
    $$('.lesson', coursePanel).forEach(item => {
      const button = $('[data-go]', item);
      if (!button) return;
      const id = button.dataset.go,
        done = id === 'code' ? demo.codeResult?.passed : demo.assessments[id]?.submitted;
      item.dataset.taskDone = done ? 'yes' : 'no';
      if (done) {
        delete button.dataset.go;
        button.dataset.result = id;
        button.textContent = '查看结果';
      }
    });
    select.onchange = () => {
      $$('.lesson', coursePanel).forEach(item => item.hidden = select.value === '待完成' ? item.dataset.taskDone === 'yes' : select.value === '已完成' ? item.dataset.taskDone !== 'yes' : false);
      if (!$('.lesson:not([hidden])', coursePanel)) {
        if (!$('#task-empty')) coursePanel.insertAdjacentHTML('beforeend', '<p id="task-empty" class="meta">当前筛选下没有任务。</p>');
      } else $('#task-empty')?.remove();
    };
  }
  if (view === 'results') {
    const percent = Math.floor((18 + demo.completed.length) / 42 * 100);
    coursePanel.insertAdjacentHTML('afterbegin', `<div class="flow-help">本次课程进度 ${percent}% · 新完成 ${demo.completed.length} 节演示课时</div><div class="flow-actions">${['practice', 'test', 'exam'].map((id, i) => `<button class="btn" data-result="${id}">${['练习结果', '小测成绩', '考试记录'][i]}</button>`).join('')}</div>`);
    const cards = $$('.kpi-card strong', coursePanel);
    if (cards[0]) cards[0].textContent = percent + '%';
    if (demo.assessments.practice?.history.length) cards[1].textContent = demo.assessments.practice.history.at(-1).score + '%';
    if (demo.assessments.test?.history.length) cards[2].textContent = Math.max(...demo.assessments.test.history.map(x => x.score));
  }
}
document.addEventListener('prototype-save', event => {
  event.detail.courseView = $('.course-nav-btn.active')?.dataset.courseView;
});
document.addEventListener('prototype-restore', event => {
  if (event.detail.courseView) openCourseView(event.detail.courseView);
});
document.addEventListener('prototype-ready', () => {
  const requested = location.hash.slice(1);
  if (courseViews[requested]) openCourseView(requested);
  renderCourseCheckin();
  $('#state-menu').insertAdjacentHTML('beforeend', '<details class="prototype-submenu"><summary>课程打卡</summary><button data-checkin-mode="pending">今日未打卡</button><button data-checkin-mode="complete">打卡完成</button><button data-checkin-mode="unset">未设置打卡</button></details>');
});
