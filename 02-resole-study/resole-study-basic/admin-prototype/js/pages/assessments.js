/* Assignment, exam and programming workspaces. Data and grades stay in this page. */
(function () {
  'use strict';

  const bank = location.hash === '#questions';
  window.addEventListener('hashchange', () => {
    if (location.hash === '#questions' !== bank) location.reload();
  });
  if (bank) return;
  const {
    isSuper,
    toast,
    openModal,
    closeModal
  } = AdminUI;
  const root = document.querySelector('#management-root'),
    modal = document.querySelector('#record-modal');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
  const btn = (text, attrs = '', tone = '') => `<button type="button" class="btn ${tone}" ${attrs}>${text}</button>`;
  const terms = ['2026–2027 第一学期', '2025–2026 第二学期'];
  const courses = AdminTeaching.courses;
  const classes = AdminTeaching.classes.filter(c => courses.includes(c.course));
  const labels = {
    tasks: '作业列表',
    exams: '考试列表'
  };
  const correct = ['B', 'A', 'C', 'D', 'B', 'C', 'A', 'D', 'B', 'A', 'C', 'B', 'D', 'A', 'B', 'C', 'D', 'B', 'C', 'A'];
  const prompts = [['现代信息技术的基础是（ ）', ['光电子技术', '微电子技术', '通信技术', '计算机技术']], ['第二代电子计算机所采用的电子元件是（ ）', ['晶体管', '电子管', '集成电路', '超大规模集成电路']], ['Python 中用于创建空字典的表达式是（ ）', ['[]', '()', '{}', 'set()']], ['以下哪种结构支持重复执行一段代码？', ['赋值语句', '导入语句', '函数声明', '循环语句']], ['展示连续时间数据的变化趋势，优先选择（ ）', ['饼图', '折线图', '雷达图', '词云']], ['用于统计序列中元素个数的函数是（ ）', ['sum', 'max', 'len', 'min']], ['Python 列表的第一个元素下标是（ ）', ['0', '1', '−1', '2']], ['下列哪种做法能保护账号安全？', ['共享密码', '关闭验证', '重复使用密码', '启用多因素验证']], ['条件表达式相等判断使用（ ）', ['=', '==', '!=', ':=']], ['数据清洗的主要目的是什么？', ['提高数据质量', '增加重复数据', '删除全部数据', '隐藏错误']], ['Python 中不可变的序列类型是（ ）', ['列表', '字典', '元组', '集合']], ['求数组中的最大值应使用（ ）', ['min', 'max', 'len', 'type']], ['下列哪种信息不应公开分享？', ['课程简介', '公开论文', '作品标题', '登录验证码']], ['变量命名的正确写法是（ ）', ['student_count', '1student', 'student-count', 'class']], ['3C 技术通常指（ ）', ['计算、连接、控制', '计算机、通信、消费电子', '内容、社区、商业', '代码、云、容器']], ['程序运行前检查边界条件有助于（ ）', ['增加错误', '隐藏问题', '提高可靠性', '降低可读性']], ['存储数据之前，应优先确认（ ）', ['字体大小', '页面颜色', '图标样式', '数据有效性']], ['下面哪种行为尊重学术诚信？', ['直接复制他人代码', '引用资料并注明来源', '伪造实验数据', '替他人考试']], ['将复杂问题拆成较小问题体现（ ）', ['随机试错', '重复编写', '分解思想', '忽略细节']], ['冯·诺依曼体系的五个组成部分是（ ）', ['运算器、控制器、存储器、输入设备、输出设备', 'CPU、内存、硬盘、键盘、显示器', '处理器、总线、内存、输入、输出', '运算器、寄存器、存储器、输入、输出']]];
  const questions = prompts.map(([prompt, options], i) => ({
    prompt,
    options,
    answer: correct[i],
    max: 2,
    type: '选择题'
  }));
  const codingQuestions = [{
    prompt: '词频统计器：读取单词序列，输出各单词出现次数。',
    answer: '使用字典累加计数；覆盖空输入与重复单词。',
    max: 10,
    type: '编程题',
    problem: 'P001'
  }, {
    prompt: '数组最大值：遍历数组并返回最大元素，处理空数组。',
    answer: '先检查空数组，再遍历更新最大值。',
    max: 10,
    type: '编程题',
    problem: 'P006'
  }];
  const arrayCode = 'numbers = [3, 1, 5, 2]\nif numbers:\n    print(max(numbers))\nelse:\n    print("empty array")';
  const code = 'words = "hello world hello".split()\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)';
  let sequence = 0;
  function record(kind, name, course, state, index = 0) {
    const cls = classes.find(c => c.course === course),
      qs = kind === 'exams' ? questions : kind === 'programming' ? codingQuestions : [{
        prompt: name + '：按作业要求提交文件，并说明实现思路。',
        answer: '实现功能、边界处理与说明完整。',
        max: 10,
        type: '文件作业'
      }];
    const people = AdminTeaching.students.filter(s => s.classId === cls.id).map((s, i) => {
      const submitted = state !== '未开始' && !(i === 1 && index % 2 === 0),
        status = !submitted ? '未开始' : state === '进行中' && i === 0 ? '考试中' : '已完成';
      return {
        ...s,
        status,
        submitted,
        ip: submitted ? '192.0.2.' + (10 + i) : '—',
        updated: submitted ? '2026-10-09 15:' + String(10 + i * 8).padStart(2, '0') : '无记录',
        minutes: submitted ? 5 + i * 4 : 0,
        language: 'Python',
        file: submitted ? 'homework.py' : '',
        code: submitted ? code : '',
        codes: qs.map((q, j) => submitted ? kind === 'programming' && j === 1 ? arrayCode : code : ''),
        compileError: submitted && index === 2,
        feedback: '',
        scores: qs.map((q, j) => submitted ? kind === 'exams' ? (i + j + index) % 7 === 0 ? 0 : q.max : Math.max(0, q.max - i * 2 - index % 3) : null),
        answers: qs.map((q, j) => submitted ? kind === 'exams' ? (i + j + index) % 7 === 0 ? q.answer === 'D' ? 'A' : 'D' : q.answer : code : ''),
        reviewed: qs.map(() => false)
      };
    });
    return {
      id: 'AS-' + ++sequence,
      kind,
      name,
      course,
      classId: cls.id,
      term: terms[index === 4 ? 1 : 0],
      state,
      type: kind === 'tasks' ? '普通作业' : index === 4 ? '练习' : '考试',
      creator: cls.teacher,
      start: state === '未开始' ? '2096-12-31 14:00' : '2026-10-09 14:49',
      end: state === '未开始' ? '2096-12-31 15:00' : '2026-10-13 00:00',
      updated: '2026-10-09',
      password: index === 4 ? '' : '123456',
      showPassword: false,
      upload: index !== 4,
      published: false,
      questions: qs,
      people,
      description: kind === 'programming' ? '围绕课程编程题查看代码、评分与提交反馈。' : kind === 'tasks' ? '提交实现文件，说明解题思路与边界处理。' : '本地考试示例，逐题得分汇总为总分。'
    };
  }
  const records = [...['第三章线下作业', '校园电影之夜', '三角形判定', '数据可视化练习', 'filter 与 lambda 函数'].map((n, i) => record('tasks', n, courses[i === 3 ? 1 : 0], '已结束', i)), ...['计算机文化及 Python 初步', '编程思维导论测试', '变量考试', '表达式和运算符考试', 'Python 期末模拟', 'Python 期末考试'].map((n, i) => record('exams', n, courses[i === 1 ? 2 : i === 2 ? 1 : 0], i === 3 ? '进行中' : i === 5 ? '未开始' : '已结束', i)), ...['词频统计器编程测评', '数组与边界条件练习', 'Python 综合编程'].map((n, i) => record('programming', n, courses[0], i === 2 ? '进行中' : '已结束', i))];
  const homeworkDescriptions = ['完成第三章文件作业，提交 Python 源文件并说明实现思路。', '新建 movie.py，使用变量与输出语句编排一份校园电影之夜节目单。', '输入三个整数，判断能否构成三角形，并分类输出结果。', '选择合适图表展示一周数据趋势，提交实现文件与分析说明。', '使用 filter 与 lambda 处理成绩字典，筛选达到指定分数的学生。'];
  records.filter(r => r.kind === 'tasks').forEach((r, i) => {
    r.description = homeworkDescriptions[i];
    r.questions[0].prompt = homeworkDescriptions[i];
  });

  const aliases = {
    papers: 'exams',
    schedule: 'exams',
    grading: 'exams',
    themes: 'tasks'
  };
  let section = labels[location.hash.slice(1)] ? location.hash.slice(1) : aliases[location.hash.slice(1)] || 'tasks';
  let filters = {
      term: terms[0],
      course: '',
      classId: '',
      query: '',
      state: '',
      type: ''
    },
    page = 1,
    size = 12;
  let current = null,
    tab = 'monitor',
    studentQuery = '',
    studentState = '',
    detailPage = 1,
    detailSize = 10,
    sort = 'student',
    ascending = true,
    selectedStudent = null,
    selectedQuestion = 0,
    pending = null,
    listTrigger = null;
  const max = r => r.questions.reduce((sum, q) => sum + q.max, 0);
  const total = p => p.scores.reduce((sum, n) => sum + (n ?? 0), 0);
  const submitted = r => r.people.filter(p => p.submitted && p.status !== '考试中');
  const opts = (values, value, all = '全部') => `<option value="">${all}</option>` + values.map(v => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(v)}</option>`).join('');
  const table = (heads, rows, label = '数据明细') => `<div class="as-table table-wrap" role="region" tabindex="0" aria-label="${esc(label)}"><table><thead><tr>${heads.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${heads.length}" class="as-empty">暂无匹配记录</td></tr>`}</tbody></table></div>`;
  const cells = values => `<tr>${values.map(v => `<td>${v}</td>`).join('')}</tr>`;
  function pager(count, p, n, where) {
    const pages = Math.max(1, Math.ceil(count / n));
    return `<div class="pagination as-pager"><span>共 ${count} 条，第 ${p} / ${pages} 页</span><div><select aria-label="${where === 'list' ? '列表' : '明细'}每页条数" data-size="${where}">${[2, 6, 10, 12, 20].map(v => `<option value="${v}" ${n === v ? 'selected' : ''}>${v}条/页</option>`).join('')}</select>${btn('‹', `data-page="${p - 1}" data-where="${where}" ${p <= 1 ? 'disabled' : ''}`)}${Array.from({
      length: pages
    }, (_, i) => btn(i + 1, `data-page="${i + 1}" data-where="${where}" aria-label="第${i + 1}页" ${p === i + 1 ? 'aria-current="page"' : ''}`, p === i + 1 ? 'primary' : '')).join('')}${btn('›', `data-page="${p + 1}" data-where="${where}" ${p >= pages ? 'disabled' : ''}`)}<label>前往 <input type="number" min="1" max="${pages}" value="${p}" data-jump="${where}" aria-label="跳页"> 页</label></div></div>`;
  }
  function csv(name, heads, rows) {
    const cell = v => '"' + String(/^[=+@\-\t\r]/.test(String(v)) ? "'" + v : v ?? '').replace(/"/g, '""') + '"';
    const url = URL.createObjectURL(new Blob(['\ufeff' + [heads, ...rows].map(r => r.map(cell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name + '.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportRecords(list, name) {
    csv(name, ['名称', '课程', '班级', '学号', '姓名', '状态', '总分', '满分', '评语'], list.flatMap(r => r.people.map(p => [r.name, r.course, classes.find(c => c.id === r.classId).name, p.student, p.name, p.status, p.submitted ? total(p) : '', max(r), p.feedback])));
  }
  const match = (v, q) => String(v).toLowerCase().includes(q.trim().toLowerCase());
  function filtered() {
    return records.filter(r => r.kind === section && (!filters.term || r.term === filters.term) && (!filters.course || r.course === filters.course) && (!filters.classId || r.classId === filters.classId) && match(r.name, filters.query) && (!filters.state || r.state === filters.state) && (!filters.type || r.type === filters.type));
  }
  function renderShell() {
    history.replaceState(null, '', '#' + section);
    AdminUI.setNavigationHeading(AdminUI.navigationFor('#' + section));
    root.className = 'assessment-workspace';
    root.innerHTML = `<div class="tabs" role="tablist" aria-label="作业与测评">${Object.entries(labels).map(([id, label]) => `<button class="tab" role="tab" id="as-tab-${id}" aria-selected="${section === id}" tabindex="${section === id ? 0 : -1}" aria-controls="as-panel" data-section="${id}">${label}</button>`).join('')}</div><section id="as-panel" role="tabpanel" aria-labelledby="as-tab-${section}"><div id="as-overview"></div><form class="as-filters card" id="as-filters"><label>学期<select name="term">${opts(terms, filters.term, '全部学期')}</select></label><label>课程<select name="course">${opts(courses, filters.course, '全部课程')}</select></label><label>班级<select name="classId">${classOptions()}</select></label><label>搜索${section === 'tasks' ? '作业' : section === 'exams' ? '考试' : '编程'}<input name="query" type="search" placeholder="输入名称筛选" value="${esc(filters.query)}"></label>${section !== 'tasks' ? `<div class="as-filter-wide">状态 <div class="as-chips">${['', '进行中', '已结束', '未开始'].map(v => btn(v || '全部', `data-state="${v}" aria-pressed="${filters.state === v}"`, filters.state === v ? 'primary' : '')).join('')}</div>类型 <div class="as-chips">${['', '考试', '练习'].map(v => btn(v || '全部', `data-type="${v}" aria-pressed="${filters.type === v}"`, filters.type === v ? 'primary' : '')).join('')}</div></div>` : ''}<div class="as-filter-actions"><button class="btn primary" type="submit">⌕ 查询</button>${btn('重置', 'data-reset')}${btn('↓ 导出' + (section === 'tasks' ? '成绩' : '全部'), 'data-export-all')}${section !== 'tasks' ? btn('新手指南', 'data-guide') : ''}</div></form><div class="as-list-heading"><h2>${labels[section]}</h2><span id="as-count" class="meta"></span></div><div id="as-results"></div><p class="meta as-note">本地演示 · 统计来自本页示例；评分与操作刷新后恢复。</p></section>`;
    root.querySelector('#as-filters').onsubmit = e => {
      e.preventDefault();
      readFilters();
      page = 1;
      renderList();
    };
    document.dispatchEvent(new Event('admin-section-change'));
    renderList();
  }
  function classOptions() {
    return '<option value="">全部班级</option>' + classes.filter(c => !filters.course || c.course === filters.course).map(c => `<option value="${c.id}" ${filters.classId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  }
  function readFilters() {
    const d = Object.fromEntries(new FormData(root.querySelector('#as-filters')));
    filters = {
      ...filters,
      ...d
    };
  }
  function renderList() {
    const list = filtered(),
      all = records.filter(r => r.kind === section);
    page = Math.min(page, Math.max(1, Math.ceil(list.length / size)));
    root.querySelector('#as-overview').innerHTML = section === 'tasks' ? '' : metrics([[all.length, section === 'exams' ? '全部考试' : '全部编程'], [all.filter(r => r.state === '进行中').length, '进行中'], [all.filter(r => r.state === '已结束').length, '已结束'], [all.filter(r => r.state === '未开始').length, '未开始']]);
    root.querySelector('#as-count').textContent = list.length + ' 项';
    root.querySelector('#as-results').innerHTML = `<div class="as-card-grid ${section === 'tasks' ? 'as-homework-grid' : ''}">${list.slice((page - 1) * size, page * size).map(r => {
      const count = submitted(r).length;
      return `<article class="as-tile ${r.state === '进行中' ? 'running' : ''}"><div class="as-tile-heading"><h3>${esc(r.name)}</h3><span class="as-kind">${section === 'tasks' ? '作业' : r.type}</span>${section !== 'tasks' ? `<span class="status ${r.state === '进行中' ? 'success' : r.state === '未开始' ? 'warning' : 'neutral'}">${r.state}</span>` : ''}</div><p class="as-tile-context">${esc(r.course)} · ${esc(classes.find(c => c.id === r.classId).name)}</p><div class="as-tile-info">${section === 'tasks' ? `<div>★ 满分 <b>${max(r)}</b>　✓ 已交 <b>${count}</b>　<span class="as-danger">未交 ${r.people.length - count}</span></div><div>◷ 更新 ${r.updated}　⇧ 上传 <b>${r.upload ? '开放' : '关闭'}</b></div>` : `<div><span>▸ 开始</span><b>${r.start}</b></div><div><span>▸ 结束</span><b>${r.end}</b></div><div><span>♙ 创建者</span><b>${esc(r.creator)}</b></div>${r.password ? `<div class="as-password"><span>♧ 密码</span><b>${r.showPassword ? esc(r.password) : '••••••'}</b>${btn(r.showPassword ? '隐藏' : '显示', `data-password="${r.id}" aria-label="${r.showPassword ? '隐藏' : '显示'}${esc(r.name)}密码"`)}</div>` : ''}`}</div>${section === 'tasks' ? `<p class="as-description">${esc(r.description)}</p>` : ''}<div class="as-tile-actions">${section === 'tasks' ? btn('▥ 作业报表', `data-action="report" data-id="${r.id}"`) : ['details', 'report', 'export', 'copy'].map((a, i) => btn(['◎ 详情', '▥ 报表', '↓ 导出', '▣ 复制'][i], `data-action="${a}" data-id="${r.id}"`)).join('')}</div></article>`;
    }).join('') || '<div class="card as-empty">没有匹配记录，请重置筛选。</div>'}</div>${pager(list.length, page, size, 'list')}`;
  }
  function metrics(items) {
    return `<div class="as-metrics">${items.map(([n, label], i) => `<article class="as-metric"><span class="as-metric-icon tone-${i % 5}" aria-hidden="true">${['▤', '✓', '▥', '↑', '↓'][i % 5]}</span><div><strong>${esc(n)}</strong><small>${label}</small></div></article>`).join('')}</div>`;
  }
  function chart(title, labels, values, tone = 'purple', unit = '人') {
    const highest = Math.max(1, ...values),
      width = Math.max(460, labels.length * 43),
      height = 220,
      left = 38,
      plot = width - left - 14,
      step = plot / Math.max(1, labels.length);
    const colors = {
      purple: '#7660c4',
      green: '#4d9c54',
      blue: '#3294d8',
      orange: '#e89a43'
    };
    return `<section class="as-chart-card"><h3>${title}</h3><div class="as-chart-scroll"><svg viewBox="0 0 ${width} ${height}" style="min-width:${Math.max(280, labels.length * 38)}px" role="img" aria-label="${esc(title + ': ' + labels.map((l, i) => l + ' ' + values[i] + unit).join('，'))}">${[0, 1, 2, 3, 4].map(i => `<line x1="${left}" y1="${178 - i * 36}" x2="${width - 8}" y2="${178 - i * 36}" stroke="#e4e8f1"/><text x="30" y="${182 - i * 36}" text-anchor="end">${+(highest * i / 4).toFixed(1)}</text>`).join('')}${values.map((v, i) => `<rect x="${left + i * step + step * .2}" y="${178 - v / highest * 144}" width="${step * .6}" height="${v / highest * 144}" rx="3" fill="${colors[tone]}"><title>${esc(labels[i])}: ${v}${unit}</title></rect><text x="${left + (i + .5) * step}" y="${169 - v / highest * 144}" text-anchor="middle">${v}</text><text x="${left + (i + .5) * step}" y="201" text-anchor="middle">${esc(labels[i])}</text>`).join('')}</svg></div></section>`;
  }
  function summary(r) {
    const data = submitted(r),
      mean = data.length ? +(data.reduce((n, p) => n + total(p), 0) / data.length).toFixed(1) : '—';
    return metrics([[r.people.length, '应交人数'], [data.length, '实交人数'], [mean, '平均分 / ' + max(r)], [data.length ? Math.max(...data.map(total)) : '—', '最高分'], [data.length ? Math.min(...data.map(total)) : '—', '最低分']]);
  }
  function histogram(r) {
    const data = submitted(r),
      bins = ['0–59%', '60–69%', '70–79%', '80–89%', '90–100%'],
      values = [0, 0, 0, 0, 0];
    data.forEach(p => {
      const percent = total(p) / max(r) * 100;
      values[percent < 60 ? 0 : percent < 70 ? 1 : percent < 80 ? 2 : percent < 90 ? 3 : 4]++;
    });
    return chart('成绩分布', bins, values);
  }
  const names = people => people.length ? `<ul class="as-name-list">${people.map(p => `<li><span class="as-avatar">${esc(p.name.slice(0, 1))}</span><strong>${esc(p.name)}</strong><small>${esc(p.student)}</small></li>`).join('')}</ul>` : '<p class="as-empty">暂无记录</p>';
  function homeworkReport() {
    const r = current,
      data = submitted(r),
      count = data.length,
      rate = r.people.length ? Math.round(count / r.people.length * 100) : 0;
    const lines = count ? Math.round(data.reduce((n, p) => n + p.code.split('\n').length, 0) / count) : 0;
    return `<div class="as-report-banner"><span>▥</span><div><h2>${esc(r.name)}</h2><p>${esc(r.course)} · ${esc(classes.find(c => c.id === r.classId).name)} · ${r.term}</p></div><a class="btn" href="${esc(AdminUI.linkUrl('practice.html#coding'))}">打开编程题库 ↗</a></div><h3 class="as-section-heading">核心指标</h3><div class="as-homework-metrics"><div class="as-rate"><div class="as-ring" style="--rate:${rate}%"><strong>${rate}<small>%</small></strong></div><span>提交率 · 已交 ${count} / 应交 ${r.people.length}</span></div>${metrics([[r.people.length, '应交人数'], [count, '实交人数'], [lines, '平均代码行数'], [data.filter(p => p.compileError).length, '编译错误（示例）'], ['—', '疑似抄袭（未检测）']])}</div><h3 class="as-section-heading">基本信息</h3><div class="as-info-grid"><div>开始上传时间 <strong>${r.start}</strong></div><div>截止上传时间 <strong>${r.end}</strong></div></div><h3 class="as-section-heading">学生名单与成绩分布</h3><div class="as-report-columns"><section class="as-chart-card"><h3>未交名单 <span>${r.people.length - count}</span></h3>${names(r.people.filter(p => !p.submitted))}</section><section class="as-chart-card"><h3>示范名单 <span>${data.filter(p => total(p) === max(r)).length}</span></h3>${names(data.filter(p => total(p) === max(r)))}</section>${histogram(r)}</div><h3 class="as-section-heading">提交与批阅</h3>${table(['学号', '姓名', '提交文件', '得分', '状态', '操作'], r.people.map(p => cells([esc(p.student), esc(p.name), esc(p.file || '未提交'), p.submitted ? total(p) + ' / ' + max(r) : '—', p.submitted ? p.reviewed.every(Boolean) ? '已批阅' : '待批阅' : '未提交', p.submitted ? btn('查看 / 批阅', `data-student="${p.student}"`) : '—'])))}<h3 class="as-section-heading">疑似抄袭代码文件</h3><div class="as-unavailable">尚未接入代码相似度检测；当前无真实检测结果。</div>`;
  }
  const questionRate = (r, index) => {
    const data = submitted(r);
    return data.length ? +(data.filter(p => p.scores[index] === r.questions[index].max).length / data.length * 100).toFixed(1) : 0;
  };
  function statistics() {
    const r = current,
      data = submitted(r),
      wrong = r.questions.map((q, i) => ({
        q,
        i,
        count: data.filter(p => p.scores[i] < q.max).length
      })).filter(v => v.count).sort((a, b) => b.count - a.count);
    const ranks = (title, items, last) => `<section class="as-chart-card"><h3>${title}</h3>${table(['学号', '姓名', last], items.map(p => cells([esc(p.student), esc(p.name), last === '得分' ? total(p) : p.minutes])))}</section>`;
    const times = ['15:00', '15:15', '15:30', '15:45'],
      timeCounts = times.map((_, i) => data.filter(p => Number(p.updated.slice(-2)) >= i * 15 && Number(p.updated.slice(-2)) < (i + 1) * 15).length);
    return `${summary(r)}<div class="as-two-columns">${histogram(r)}<section class="as-chart-card"><h3>缺考名单 <span>${r.people.length - data.length} 人</span></h3>${names(r.people.filter(p => !p.submitted))}</section><section class="as-chart-card"><h3>错题集锦</h3>${table(['题号', '题干', '错误人数'], wrong.map(({
      q,
      i,
      count
    }) => cells([btn('第' + (i + 1) + '题', `data-analysis-question="${i}"`), esc(q.prompt), count])))}</section><div class="as-ranks">${ranks('最早交卷 Top5', [...data].sort((a, b) => a.updated.localeCompare(b.updated)).slice(0, 5), '用时（分钟）')}${ranks('最高分 Top5', [...data].sort((a, b) => total(b) - total(a)).slice(0, 5), '得分')}</div></div><h3 class="as-section-heading">高级图表分析</h3><div class="as-two-columns">${chart('交卷时间分布', times.slice(0, 4), timeCounts.slice(0, 4), 'orange')}${chart('答题用时分布', ['0–5分', '5–10分', '10–15分', '15–20分', '20分以上'], [0, 1, 2, 3, 4].map((_, i) => data.filter(p => i === 4 ? p.minutes >= 20 : p.minutes >= i * 5 && p.minutes < (i + 1) * 5).length), 'blue')}${heatmap(r)}${chart('题目满分率', r.questions.map((_, i) => '第' + (i + 1) + '题'), r.questions.map((_, i) => questionRate(r, i)), 'green', '%')}</div>`;
  }
  function heatmap(r) {
    const data = submitted(r),
      bins = Array.from({
        length: 8
      }, (_, i) => i * 5),
      values = Array.from({
        length: 5
      }, () => Array(8).fill(0));
    data.forEach(p => {
      values[Math.min(4, Math.floor(total(p) / max(r) * 5))][Math.min(7, Math.floor(p.minutes / 5))]++;
    });
    return `<section class="as-chart-card"><h3>分数–用时热力图</h3><div class="as-heatmap"><span></span>${bins.map(v => `<small>${v}–${v + 5}分</small>`).join('')}${values.slice().reverse().map((row, i) => `<small>${80 - i * 20}–${100 - i * 20}%</small>${row.map((v, j) => `<span style="background:${v ? 'rgba(110,90,190,' + Math.min(.9, .25 + v * .2) + ')' : '#f3f4fa'}" title="${80 - i * 20}–${100 - i * 20}%，${bins[j]}–${bins[j] + 5}分钟，${v}人">${v || ''}</span>`).join('')}`).join('')}</div><p class="meta">颜色越深表示人数越多；只统计已提交学生。</p></section>`;
  }
  function monitor() {
    const data = current.people.filter(p => match(p.name + ' ' + p.student, studentQuery) && (!studentState || p.status === studentState)).sort((a, b) => (sort === 'score' ? total(a) - total(b) : String(a[sort]).localeCompare(String(b[sort]), 'zh-CN')) * (ascending ? 1 : -1));
    detailPage = Math.min(detailPage, Math.max(1, Math.ceil(data.length / detailSize)));
    const head = (key, label) => btn(label + (sort === key ? ascending ? ' ↑' : ' ↓' : ' ↕'), `data-sort="${key}"`);
    return `<form id="as-student-filters" class="as-detail-tools"><input name="query" type="search" aria-label="姓名或学号" placeholder="姓名 / 学号" value="${esc(studentQuery)}"><select name="state" aria-label="学生状态">${opts(['未开始', '考试中', '判卷中', '已完成'], studentState, '全部状态')}</select><button class="btn primary" type="submit">查询</button>${btn('重置筛选', 'data-student-reset')}<div class="as-detail-actions">${btn(current.published ? '已发布' : '↑ 发布', 'data-operation="publish" ' + (current.published ? 'disabled' : ''), 'primary')}${btn('↓ 撤销', 'data-operation="revoke" ' + (!current.published ? 'disabled' : ''))}${btn('✓ 收卷', 'data-operation="collect" ' + (current.state === '已结束' ? 'disabled' : ''))}${btn('▥ 算分', 'data-operation="calculate"')}${btn('↓ 导出', 'data-detail-export')}</div></form>${table(['#', head('student', '学号'), '姓名', head('status', '状态'), '异常', head('score', '总分'), 'IP 地址', head('updated', '最后更新'), '操作'], data.slice((detailPage - 1) * detailSize, detailPage * detailSize).map((p, i) => cells([(detailPage - 1) * detailSize + i + 1, esc(p.student), esc(p.name), `<div class="as-progress">${['未开始', '考试中', '判卷中', '已完成'].map((state, j) => `<span class="${j <= ['未开始', '考试中', '判卷中', '已完成'].indexOf(p.status) ? 'on' : ''} ${state === p.status ? 'current' : ''}">${state}</span>`).join('')}</div>`, p.compileError ? '编译错误（示例）' : '—', p.submitted ? btn(total(p), `data-student="${p.student}"`, 'link') : '—', esc(p.ip), esc(p.updated), `<div class="inline-actions">${p.submitted ? btn('重置', `data-reset-student="${p.student}"`, 'small') : ''}${btn('详情', `data-student="${p.student}"`, 'small primary')}</div>`])), '实时监考示例')}${pager(data.length, detailPage, detailSize, 'detail')}`;
  }
  function matrix() {
    const data = current.people;
    detailPage = Math.min(detailPage, Math.max(1, Math.ceil(data.length / detailSize)));
    return `${table(['学号', '姓名', '总分', ...current.questions.map((_, i) => '第' + (i + 1) + '题')], data.slice((detailPage - 1) * detailSize, detailPage * detailSize).map(p => cells([esc(p.student), btn(esc(p.name), `data-student="${p.student}"`), p.submitted ? total(p) : '—', ...p.scores.map((n, i) => n === null ? '—' : btn(n, `data-student="${p.student}" data-question="${i}"`, `as-score ${n === 0 ? 'zero' : n === current.questions[i].max ? 'full' : 'partial'}`))])), '答题明细')}${pager(data.length, detailPage, detailSize, 'detail')}`;
  }
  function analysis() {
    return `<div class="as-question-analysis">${current.questions.map((q, i) => {
      const data = submitted(current),
        values = q.type === '选择题' ? ['A', 'B', 'C', 'D'].map(a => data.filter(p => p.answers[i] === a).length) : [data.filter(p => p.scores[i] === q.max).length, data.filter(p => p.scores[i] > 0 && p.scores[i] < q.max).length, data.filter(p => p.scores[i] === 0).length];
      return `<details ${selectedQuestion === i ? 'open' : ''}><summary><span>第${i + 1}题 · ${esc(q.type)}</span><strong>${esc(q.prompt)}</strong><span>满分率 ${questionRate(current, i)}%</span></summary><div class="as-analysis-body"><p>标准答案 / 评分依据：${esc(q.answer)}</p>${q.options ? `<div class="as-options">${q.options.map((v, j) => `<span>${'ABCD'[j]}. ${esc(v)}</span>`).join('')}</div>` : ''}${chart(q.type === '选择题' ? '选项分布' : '得分分布', q.type === '选择题' ? ['A', 'B', 'C', 'D'] : ['满分', '部分', '零分'], values)}${table(['学号', '姓名', '作答 / 状态', '得分', '操作'], current.people.map(p => cells([esc(p.student), esc(p.name), p.submitted ? q.type === '选择题' ? esc(p.answers[i]) : '代码提交' : '未提交', p.submitted ? p.scores[i] + ' / ' + q.max : '—', btn('查看', `data-student="${p.student}" data-question="${i}"`)])))}</div></details>`;
    }).join('')}</div>`;
  }
  function renderDetail() {
    const r = current,
      counts = ['已完成', '判卷中', '考试中', '未开始'].map(v => r.people.filter(p => p.status === v).length);
    modal.classList.add('as-modal');
    modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="as-detail-title"><header class="modal-head as-modal-head"><div><h2 id="as-detail-title">${r.kind === 'tasks' ? '作业报表' : r.kind === 'exams' ? '考试详情' : '编程详情'} · ${esc(r.name)}</h2><p>${esc(r.course)} · ${r.term}</p></div><div>${r.kind !== 'tasks' ? btn('新手指南', 'data-detail-guide') : ''}<button class="close" data-close aria-label="关闭详情">×</button></div></header><div class="as-modal-scroll"><div id="as-confirm" ${pending ? '' : 'hidden'}>${pending ? `<p>${esc(pending.text)}</p>${btn('确认', 'data-confirm', 'primary')}${btn('取消', 'data-cancel')}` : ''}</div>${r.kind === 'tasks' ? homeworkReport() : `<div class="as-detail-summary"><span class="status ${r.state === '进行中' ? 'success' : 'neutral'}">${r.state}</span>${r.published ? '<span class="status info">成绩已发布</span>' : ''}<span>创建者 ${esc(r.creator)}</span><span>${r.start} 至 ${r.end}</span><div><b>${r.people.length} 总人数</b>${counts.map((n, i) => `<span>${n} ${['已完成', '判卷中', '考试中', '未开始'][i]}</span>`).join('')}</div></div><div class="tabs as-detail-tabs" role="tablist" aria-label="${r.kind === 'exams' ? '考试' : '编程'}详情">${['monitor', 'stats', 'matrix', 'analysis'].map((v, i) => `<button class="tab" role="tab" id="as-detail-tab-${v}" aria-controls="as-detail-panel" aria-selected="${tab === v}" tabindex="${tab === v ? 0 : -1}" data-detail-tab="${v}">${['实时监考', '统计分析', '答题明细', '题目分析'][i]}</button>`).join('')}</div><section id="as-detail-panel" role="tabpanel" aria-labelledby="as-detail-tab-${tab}">${tab === 'monitor' ? monitor() : tab === 'stats' ? statistics() : tab === 'matrix' ? matrix() : analysis()}</section>`}</div><footer class="modal-foot">${btn('关闭', 'data-close')}${btn('↻ 刷新', 'data-refresh', 'primary')}</footer><div class="as-answer-backdrop" hidden><section class="as-answer" role="dialog" aria-modal="true" aria-labelledby="as-answer-title"></section></div></section>`;
    const f = modal.querySelector('#as-student-filters');
    if (f) f.onsubmit = e => {
      e.preventDefault();
      const d = new FormData(f);
      studentQuery = d.get('query').trim();
      studentState = d.get('state');
      detailPage = 1;
      renderDetail();
    };
  }
  function show(r, mode, trigger) {
    listTrigger = {
      id: r.id,
      action: mode
    };
    current = r;
    tab = mode === 'report' ? 'stats' : 'monitor';
    studentQuery = '';
    studentState = '';
    detailPage = 1;
    sort = 'student';
    ascending = true;
    pending = null;
    selectedStudent = null;
    renderDetail();
    openModal('record-modal', trigger);
  }
  function answer(p, index = 0, trigger) {
    selectedStudent = p;
    selectedQuestion = index;
    renderAnswer();
    modal.querySelector('.as-answer-backdrop').hidden = false;
    modal._answerTrigger = trigger;
    modal.querySelector('.as-answer [data-answer-close]').focus();
  }
  function renderAnswer() {
    const p = selectedStudent,
      q = current.questions[selectedQuestion],
      studentIndex = current.people.indexOf(p),
      score = p.scores[selectedQuestion];
    modal.querySelector('.as-answer').innerHTML = `<header class="as-answer-head"><h2 id="as-answer-title">${esc(p.name)} – 答题详情</h2><div>${btn('‹ 上一个', `data-person="${studentIndex - 1}" ${studentIndex === 0 ? 'disabled' : ''}`)}${btn('下一个 ›', `data-person="${studentIndex + 1}" ${studentIndex === current.people.length - 1 ? 'disabled' : ''}`)}${btn('×', 'data-answer-close aria-label="关闭答题详情"')}</div></header><div class="as-answer-content"><div class="as-answer-legend"><span class="full">满分</span><span class="partial">部分</span><span class="zero">零分</span><span>○ 自动评分示例　● 人工确认</span></div><div class="as-question-grid">${current.questions.map((item, i) => btn(`<small>${item.type === '选择题' ? '选' : item.type === '编程题' ? '码' : '文'}</small><span>第${i + 1}题${p.reviewed[i] ? ' ●' : ''}</span><strong>${p.scores[i] ?? '—'}</strong>`, `data-question-select="${i}" aria-label="第${i + 1}题" aria-pressed="${i === selectedQuestion}"`, p.scores[i] === null ? '' : p.scores[i] === 0 ? 'zero' : p.scores[i] === item.max ? 'full' : 'partial')).join('')}</div><h3>第${selectedQuestion + 1}题（${q.type}） <span class="status ${score === q.max ? 'success' : score === 0 ? 'danger' : 'warning'}">${!p.submitted ? '未提交' : score === q.max ? '满分' : score === 0 ? '零分' : '部分得分'}</span></h3><blockquote>${esc(q.prompt)}</blockquote>${q.options ? `<div class="as-options">${q.options.map((v, i) => `<span>${'ABCD'[i]}. ${esc(v)}</span>`).join('')}</div>` : ''}${q.type === '选择题' ? `<p>学生：<strong>${esc(p.answers[selectedQuestion] || '未作答')}</strong>　正确：<strong>${esc(q.answer)}</strong></p>` : `<div class="as-code-label">${esc(p.language)} · ${esc(p.file || '未提交文件')}${q.problem ? ' · ' + q.problem : ''}</div><pre class="as-code"><code>${esc(p.codes?.[selectedQuestion] || p.code || '暂无提交')}</code></pre><p>评分依据：${esc(q.answer)}</p><p class="meta">${p.compileError ? '编译错误为预置示例，未执行代码。' : '当前代码仅供查看，不运行或调用判题服务。'}</p>`}<form id="as-grade-form"><div class="as-grade-row"><label>得分 <input name="score" type="number" min="0" max="${q.max}" step="0.5" value="${score ?? 0}" ${!p.submitted ? 'disabled' : ''}></label><span>/ ${q.max}</span><button type="submit" class="btn primary" ${!p.submitted ? 'disabled' : ''}>保存</button><span>总分 <b>${p.submitted ? total(p) : '—'} / ${max(current)}</b></span></div><label class="as-feedback-label">教师评语<textarea name="feedback" maxlength="500" ${!p.submitted ? 'disabled' : ''}>${esc(p.feedback)}</textarea></label><p class="as-danger" id="as-grade-error" role="alert"></p><p class="meta">${p.reviewed[selectedQuestion] ? '本题已人工确认；修改仅在本页保留。' : '修改得分后点击保存，统计与答题明细同步更新。'}</p></form></div>`;
    modal.querySelector('#as-grade-form').onsubmit = e => {
      e.preventDefault();
      if (!p.submitted) return;
      const f = e.target,
        n = Number(f.elements.score.value);
      if (f.elements.score.value === '' || !Number.isFinite(n) || n < 0 || n > q.max || n * 2 !== Math.round(n * 2)) {
        modal.querySelector('#as-grade-error').textContent = '得分须为 0–' + q.max + '，以 0.5 为步长。';
        return;
      }
      p.scores[selectedQuestion] = n;
      p.reviewed[selectedQuestion] = true;
      p.feedback = f.elements.feedback.value.trim();
      const pos = selectedQuestion;
      renderDetail();
      answer(p, pos);
      toast('评分已保存', '总分与本页统计已更新，刷新后恢复。');
    };
  }
  function closeDetail() {
    closeModal(modal);
    if (listTrigger) root.querySelector(`[data-id="${listTrigger.id}"][data-action="${listTrigger.action}"]`)?.focus();
  }
  function closeAnswer() {
    const panel = modal.querySelector('.as-answer-backdrop');
    if (panel) panel.hidden = true;
    const trigger = modal._answerTrigger;
    if (trigger && document.contains(trigger)) trigger.focus();else (modal.querySelector(`.as-modal-scroll [data-student="${selectedStudent?.student}"]`) || modal.querySelector('[data-close]')).focus();
    selectedStudent = null;
  }
  function queue(action, text) {
    pending = {
      action,
      text
    };
    renderDetail();
    modal.querySelector('[data-confirm]').focus();
  }
  function calculate() {
    current.people.forEach(p => {
      if (p.status === '判卷中') p.status = '已完成';
    });
    toast('算分完成', '按本页已保存的逐题得分重新汇总。');
  }
  root.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.section) {
      navigate(t.dataset.section);
      return;
    }
    if (t.hasAttribute('data-reset')) {
      filters = {
        term: terms[0],
        course: '',
        classId: '',
        query: '',
        state: '',
        type: ''
      };
      page = 1;
      renderShell();
      return;
    }
    if (t.hasAttribute('data-state') || t.hasAttribute('data-type')) {
      readFilters();
      if (t.hasAttribute('data-state')) filters.state = t.dataset.state;else filters.type = t.dataset.type;
      page = 1;
      renderShell();
      return;
    }
    if (t.hasAttribute('data-export-all')) {
      exportRecords(filtered(), labels[section] + '成绩');
      return;
    }
    if (t.hasAttribute('data-guide')) {
      toast('考试与编程操作', '详情中可查监考、统计、答题明细与题目分析；点击学生或题目得分进行人工批阅。');
      return;
    }
    if (t.dataset.password) {
      const r = records.find(r => r.id === t.dataset.password);
      r.showPassword = !r.showPassword;
      renderList();
      root.querySelector(`[data-password="${r.id}"]`)?.focus();
      return;
    }
    if (t.dataset.action) {
      const r = records.find(r => r.id === t.dataset.id);
      if (t.dataset.action === 'export') exportRecords([r], r.name + '成绩');else if (t.dataset.action === 'copy') {
        const copy = {
          ...r,
          id: 'AS-' + ++sequence,
          name: r.name + '（副本）',
          state: '未开始',
          published: false,
          showPassword: false,
          start: '2096-12-31 14:00',
          end: '2096-12-31 15:00',
          people: r.people.map(p => ({
            ...p,
            submitted: false,
            status: '未开始',
            scores: r.questions.map(() => null),
            answers: r.questions.map(() => ''),
            reviewed: r.questions.map(() => false),
            code: '',
            codes: r.questions.map(() => ''),
            file: '',
            feedback: '',
            ip: '—',
            updated: '无记录',
            minutes: 0,
            compileError: false
          }))
        };
        records.unshift(copy);
        filters.state = '';
        filters.query = '';
        filters.term = r.term;
        page = 1;
        renderShell();
        toast('已复制', '副本保留题目与班级，清空提交记录，等待开始。');
      } else show(r, t.dataset.action, t);
      return;
    }
    handlePager(t);
  });
  function handlePager(t) {
    if (!t.hasAttribute('data-page')) return;
    const n = Number(t.dataset.page);
    if (t.dataset.where === 'list') {
      page = n;
      renderList();
    } else {
      detailPage = n;
      renderDetail();
    }
  }
  root.addEventListener('change', e => {
    if (e.target.name === 'course') {
      readFilters();
      filters.classId = '';
      root.querySelector('[name=classId]').innerHTML = classOptions();
    }
    if (e.target.dataset.size) {
      size = Number(e.target.value);
      page = 1;
      renderList();
    }
    if (e.target.dataset.jump) jump(e.target);
  });
  function jump(input) {
    const p = Number(input.value),
      count = input.dataset.jump === 'list' ? filtered().length : tab === 'matrix' ? current.people.length : current.people.filter(p => match(p.name + ' ' + p.student, studentQuery) && (!studentState || p.status === studentState)).length,
      n = input.dataset.jump === 'list' ? size : detailSize;
    const limit = Math.max(1, Math.ceil(count / n));
    if (!Number.isInteger(p) || p < 1 || p > limit) {
      input.setCustomValidity('请输入 1–' + limit + ' 的整数页码');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');
    if (input.dataset.jump === 'list') {
      page = p;
      renderList();
    } else {
      detailPage = p;
      renderDetail();
    }
  }
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeDetail();
      return;
    }
    const t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-close')) {
      closeDetail();
      return;
    }
    if (t.dataset.detailTab) {
      tab = t.dataset.detailTab;
      detailPage = 1;
      pending = null;
      renderDetail();
      modal.querySelector(`[data-detail-tab="${tab}"]`).focus();
      return;
    }
    if (t.hasAttribute('data-answer-close')) {
      closeAnswer();
      return;
    }
    if (t.hasAttribute('data-student')) {
      answer(current.people.find(p => p.student === t.dataset.student), Number(t.dataset.question || 0), t);
      return;
    }
    if (t.hasAttribute('data-person')) {
      const p = current.people[Number(t.dataset.person)];
      if (p) {
        selectedStudent = p;
        renderAnswer();
        modal.querySelector('[data-answer-close]').focus();
      }
      return;
    }
    if (t.hasAttribute('data-question-select')) {
      selectedQuestion = Number(t.dataset.questionSelect);
      renderAnswer();
      modal.querySelector(`[data-question-select="${selectedQuestion}"]`).focus();
      return;
    }
    if (t.hasAttribute('data-analysis-question')) {
      selectedQuestion = Number(t.dataset.analysisQuestion);
      tab = 'analysis';
      renderDetail();
      return;
    }
    if (t.dataset.sort) {
      ascending = sort === t.dataset.sort ? !ascending : true;
      sort = t.dataset.sort;
      renderDetail();
      return;
    }
    if (t.hasAttribute('data-student-reset')) {
      studentQuery = '';
      studentState = '';
      detailPage = 1;
      renderDetail();
      return;
    }
    if (t.hasAttribute('data-reset-student')) {
      queue('reset:' + t.dataset.resetStudent, '重置后，该学生在本页的作答、代码、评分与评语将清空，回到未开始。确认重置？');
      return;
    }
    if (t.dataset.operation) {
      const messages = {
        publish: '确认发布本页示例成绩？发布后显示成绩已发布；不通知真实学生。',
        revoke: '确认撤销本页成绩发布？保留当前评分。',
        collect: '确认收卷？考试中的学生将提交当前作答，未开始的学生保留未开始。',
        calculate: '确认按本页逐题得分重新汇总总分，并完成判卷中的记录？'
      };
      queue(t.dataset.operation, messages[t.dataset.operation]);
      return;
    }
    if (t.hasAttribute('data-cancel')) {
      pending = null;
      renderDetail();
      return;
    }
    if (t.hasAttribute('data-confirm') && pending) {
      const action = pending.action;
      if (action === 'publish') {
        if (current.people.some(p => p.status === '考试中' || p.status === '判卷中') || !submitted(current).length) {
          pending = null;
          renderDetail();
          toast('暂不能发布', '请先收卷并算分，且至少有一条提交记录。');
          return;
        }
        current.published = true;
      }
      if (action === 'revoke') current.published = false;
      if (action === 'collect') {
        current.people.forEach(p => {
          if (p.status === '考试中') {
            p.status = '判卷中';
            p.submitted = true;
          }
        });
        current.state = '已结束';
      }
      if (action === 'calculate') calculate();
      if (action.startsWith('reset:')) {
        const p = current.people.find(p => p.student === action.slice(6));
        Object.assign(p, {
          submitted: false,
          status: '未开始',
          scores: current.questions.map(() => null),
          answers: current.questions.map(() => ''),
          reviewed: current.questions.map(() => false),
          code: '',
          codes: current.questions.map(() => ''),
          file: '',
          feedback: '',
          ip: '—',
          updated: '无记录',
          minutes: 0,
          compileError: false
        });
        current.published = false;
      }
      pending = null;
      renderDetail();
      renderList();
      toast('操作已更新', '仅影响本页示例，刷新后恢复。');
      return;
    }
    if (t.hasAttribute('data-refresh')) {
      renderDetail();
      toast('已刷新', '重新读取本页当前记录，保留已保存的评分。');
      return;
    }
    if (t.hasAttribute('data-detail-export')) {
      exportRecords([current], current.name + '成绩');
      return;
    }
    if (t.hasAttribute('data-detail-guide')) {
      toast('详情使用指南', '监考可查学生状态；统计与题目分析来自提交；点击姓名或分数进入答题详情，评分后保存。');
      return;
    }
    handlePager(t);
  });
  modal.addEventListener('change', e => {
    if (e.target.dataset.size) {
      detailSize = Number(e.target.value);
      detailPage = 1;
      renderDetail();
    }
    if (e.target.dataset.jump) jump(e.target);
  });
  function tabKeys(e, selector) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const all = [...e.currentTarget.querySelectorAll(selector)],
      i = all.indexOf(e.target);
    if (i < 0) return;
    e.preventDefault();
    const index = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
    all[index].click();
  }
  root.addEventListener('keydown', e => tabKeys(e, '[data-section]'));
  modal.addEventListener('keydown', e => {
    tabKeys(e, '[data-detail-tab]');
    const drawer = modal.querySelector('.as-answer-backdrop:not([hidden])'),
      scope = drawer ? drawer.querySelector('.as-answer') : modal;
    if (e.key === 'Escape' && drawer) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeAnswer();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeDetail();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = [...scope.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el => !el.closest('[hidden]') && el.getClientRects().length);
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      e.stopImmediatePropagation();
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, true);
  function navigate(id) {
    if (!labels[id]) id = aliases[id] || 'tasks';
    if (section !== id) {
      section = id;
      filters = {
        term: terms[0],
        course: '',
        classId: '',
        query: '',
        state: '',
        type: ''
      };
      page = 1;
    }
    if (!modal.hidden) closeModal(modal);
    history.pushState(null, '', '#' + section);
    renderShell();
    root.querySelector(`[data-section="${section}"]`).focus({
      preventScroll: true
    });
  }
  window.addEventListener('hashchange', () => {
    if (location.hash !== '#questions') {
      section = labels[location.hash.slice(1)] ? location.hash.slice(1) : aliases[location.hash.slice(1)] || 'tasks';
      filters = {
        term: terms[0],
        course: '',
        classId: '',
        query: '',
        state: '',
        type: ''
      };
      page = 1;
      if (!modal.hidden) closeModal(modal);
      renderShell();
    }
  });
  renderShell();
})();
