/* Four question banks share a bounded page module. All changes stay in this page. */
(function () {
  'use strict';

  const kind = document.body.dataset.bank,
    labels = {
      choice: '选择题',
      fill: '填空题',
      program: '程序设计题',
      sql: 'SQL 查询题'
    };
  const files = {
    choice: 'choice-bank.html',
    fill: 'fill-bank.html',

  };
  const data = structuredClone(AdminBankData),
    rows = data[kind],
    tables = data.tables;
  const root = document.querySelector('#management-root'),
    modal = document.querySelector('#record-modal'),
    form = document.querySelector('#record-form');
  const mine = '陈若云',
    esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]);
  const btn = (label, action, tone = '', extra = '') => `<button type="button" class="btn ${tone}" data-action="${action}" ${extra}>${label}</button>`;
  const input = (name, label, value = '', extra = '') => `<label class="qb-field"><span>${label}</span><input name="${name}" value="${esc(value)}" ${extra}></label>`;
  const area = (name, label, value = '', extra = '') => `<label class="qb-field qb-full"><span>${label}</span><textarea name="${name}" ${extra}>${esc(value)}</textarea></label>`;
  const select = (name, label, values, value = '', empty = false) => `<label class="qb-field"><span>${label}</span><select name="${name}">${empty ? '<option value="">请选择</option>' : ''}${values.map(v => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`;
  const radios = (name, label, values, value) => `<fieldset class="qb-radios"><legend>${label}</legend>${values.map(v => `<label><input type="radio" name="${name}" value="${v}" ${v === value ? 'checked' : ''}> ${v}</label>`).join('')}</fieldset>`;
  const tags = ['Python 基础语法', 'Python 输入输出', '程序结构', '流程图', '数据可视化', '数据安全', 'HTML 网页', '字典 / 字符串', '循环', '数组', '数据结构', 'SQL 基础查询', ...AdminBankData.program.map(r => r.tag)].filter((v, i, a) => a.indexOf(v) === i);
  let page = 1,
    size = 5,
    filters = {},
    selected = new Set(),
    editing = null,
    mode = '',
    drafts = [],
    activeTable = '',
    sortKey = '',
    sortAsc = true,
    sequence = 100;
  // Keep owned programming IDs for teachers; other banks show course-scoped teaching examples.
  if (!AdminUI.isSuper && kind === 'program') data.program = data.program.filter(r => AdminTeaching.problems.includes(r.id));
  const bankRows = kind === 'program' ? data.program : rows;
  function download(name, content) {
    const blob = new Blob(['\ufeff' + content], {
        type: 'text/csv;charset=utf-8'
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const csvLine = values => values.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',');
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const result = [];
    let row = [],
      cell = '',
      quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (quoted || cell === '') quoted = !quoted;else throw Error('CSV 引号格式错误。');
      } else if (c === ',' && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((c === '\n' || c === '\r') && !quoted) {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell);
        if (row.some(v => v !== '')) result.push(row);
        row = [];
        cell = '';
      } else cell += c;
    }
    if (quoted) throw Error('CSV 引号未闭合。');
    row.push(cell);
    if (row.some(v => v !== '')) result.push(row);
    return result;
  }
  function tableHTML(heads, body) {
    return `<div class="qb-table table-wrap" tabindex="0" role="region" aria-label="${labels[kind]}数据表"><table><thead><tr>${heads.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${heads.length}" class="qb-empty">暂无匹配记录，请调整或清除筛选。</td></tr>`}</tbody></table></div>`;
  }
  function filtered() {
    let list = bankRows.filter(r => (!filters.tag || r.tag === filters.tag) && (!filters.review || r.review === filters.review) && (!filters.usage || r.usage === filters.usage) && (!filters.uploader || r.uploader === filters.uploader) && (!filters.mine || r.uploader === mine) && (!filters.shared || r.shared && r.uploader !== mine) && (!filters.query || [r.id, r.name, r.description, r.tag].join(' ').toLowerCase().includes(filters.query.toLowerCase())));
    if (sortKey) list = list.slice().sort((a, b) => (sortKey === 'wrong' ? a.wrong - b.wrong : String(a[sortKey]).localeCompare(String(b[sortKey]), 'zh-CN')) * (sortAsc ? 1 : -1));
    return list;
  }
  const navigation = () => `<nav class="tabs qb-nav" aria-label="题库分类">${Object.entries(files).map(([k, f]) => `<a class="tab" href="${AdminUI.linkUrl(f)}" ${k === kind ? 'aria-current="page"' : ''}>${labels[k]}</a>`).join('')}</nav>`;
  function render() {
    AdminUI.setNavigationHeading(AdminUI.navigationFor());
    document.querySelector('.page-head h1').textContent = AdminUI.navigationFor().group;
    const list = filtered(),
      pages = Math.max(1, Math.ceil(list.length / size));
    page = Math.min(page, pages);
    const isObjective = ['choice', 'fill'].includes(kind),
      heads = ['<input type="checkbox" aria-label="选择本页全部题目" id="qb-all">', '序号', kind === 'sql' ? '标题' : isObjective ? '题干' : '题目'];
    if (isObjective) heads.push('知识点', '答案', btn('答错/抽中数 ↕', 'sort-wrong'), '标签存疑', btn('状态 ↕', 'sort-review'));else heads.push(kind === 'sql' ? '详细描述' : '描述');
    if (kind !== 'sql') heads.push('来源');
    heads.push('上传者', '共享', '操作');
    root.innerHTML = `<div class="question-bank">${navigation()}<section class="card qb-panel"><div class="qb-heading"><div><small>QUESTION BANK</small><h2>${labels[kind]}</h2></div><span class="meta">共 ${bankRows.length} 道示例</span></div><div class="qb-actions">${btn('＋ 添加题目', 'add', 'qb-green')}${isObjective ? btn('批量导入', 'import', 'qb-green') + btn('模板下载', 'template', 'qb-green') : ''}</div><form class="qb-filters" id="qb-filters">${select('tag', '标签', [...new Set([...tags, ...bankRows.map(r => r.tag)])], filters.tag, true)}${isObjective ? select('review', '审核状态', ['已审核', '未审核', '存疑'], filters.review, true) : ''}${select('usage', '题目类型', ['练习题', '考试题'], filters.usage, true)}${kind !== 'sql' ? select('uploader', '上传者', [...new Set(bankRows.map(r => r.uploader))], filters.uploader, true) : ''}${input('query', '搜索题目', filters.query || '', 'type="search" placeholder="请输入查询内容"')}<button class="btn qb-blue" type="submit">查找</button>${btn('清除筛选', 'reset')}<label class="qb-check"><input name="mine" type="checkbox" ${filters.mine ? 'checked' : ''}> 只看自己的题目</label><label class="qb-check"><input name="shared" type="checkbox" ${filters.shared ? 'checked' : ''}> 只看别人共享的题目</label></form><div class="qb-selection"><span>已选 ${selected.size} 道</span>${btn('批量删除', 'batch-delete', '', selected.size ? '' : 'disabled')}<span class="meta">共享、编辑与删除仅作用于本页</span></div>${tableHTML(heads, list.slice((page - 1) * size, page * size).map((r, i) => {
      const cells = [`<input type="checkbox" data-select="${r.id}" aria-label="选择 ${esc(r.name)}" ${selected.has(r.id) ? 'checked' : ''}>`, (page - 1) * size + i + 1, `<button class="qb-title" data-action="preview" data-id="${r.id}">${esc(r.name)}</button>${kind === 'program' ? `<small class="qb-id">${r.id}</small>` : ''}`];
      if (isObjective) cells.push(esc(r.tag), esc(r.answer), `${r.wrong}/${r.drawn}`, r.doubts, `<span class="status ${r.review === '已审核' ? 'success' : r.review === '存疑' ? 'warning' : 'neutral'}">${r.review}</span>`);else cells.push(esc(r.description));
      if (kind !== 'sql') cells.push(`<span class="qb-source">${esc(r.source)}</span>`);
      cells.push(esc(r.uploader), `<button class="qb-switch" role="switch" aria-checked="${r.shared}" aria-label="共享 ${esc(r.name)}" data-action="share" data-id="${r.id}"><span></span></button>`, `<div class="qb-row-actions">${btn('✎', 'edit', 'qb-blue', `data-id="${r.id}" aria-label="编辑 ${esc(r.name)}"`)}${btn('×', 'delete', 'qb-red', `data-id="${r.id}" aria-label="删除 ${esc(r.name)}"`)}${!isObjective ? btn('!', 'execution-logs', 'qb-amber', `data-id="${r.id}" aria-label="查看执行日志 ${esc(r.name)}" title="查看执行日志"`) : ''}${kind === 'program' ? btn('⧉', 'copy', 'qb-green', `data-id="${r.id}" aria-label="复制 ${esc(r.name)}"`) : ''}</div>`);
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    }).join(''))}<div class="qb-pager"><span>共 ${list.length} 条 · 第 ${page} / ${pages} 页</span><div><select aria-label="每页条数" id="qb-size">${[5, 10, 20].map(n => `<option ${n === size ? 'selected' : ''}>${n}</option>`).join('')}</select>${btn('‹', 'prev', '', page === 1 ? 'disabled' : '')}${Array.from({
      length: pages
    }, (_, i) => btn(i + 1, 'page', page === i + 1 ? 'qb-blue' : '', `data-page="${i + 1}" ${page === i + 1 ? 'aria-current="page"' : ''}`)).join('')}${btn('›', 'next', '', page === pages ? 'disabled' : '')}<label>前往 <input id="qb-jump" type="number" min="1" max="${pages}" value="${page}" aria-label="跳页"> 页</label></div></div></section><p class="qb-note">本地交互原型 · 保存仅在当前页保留，刷新恢复。手工维护选择题与填空题；导入仅支持所示 CSV 格式。</p></div>`;
  }
  function show(title, description, body, foot, trigger, wide = false) {
    modal.querySelector('.modal').className = 'modal qb-modal' + (wide ? ' qb-wide' : '');
    document.querySelector('#record-title').textContent = title;
    document.querySelector('#record-description').textContent = description;
    form.innerHTML = `<div class="modal-body"><div class="qb-form">${body}</div><p id="record-error" role="alert"></p></div><div class="modal-foot">${foot}</div>`;
    AdminUI.openModal('record-modal', trigger);
  }
  const cancel = () => '<button type="button" class="btn" data-close>取消</button>';
  function error(message) {
    document.querySelector('#record-error').textContent = message;
  }
  let logQuestion = null,
    logPage = 1,
    expandedLogs = new Set();
  const logSize = 10;
  function executionLogs() {
    return (data.executionLogs[kind] || []).filter(log => log.questionId === logQuestion.id);
  }
  function renderLogs() {
    const logs = executionLogs(),
      pages = Math.max(1, Math.ceil(logs.length / logSize));
    logPage = Math.min(logPage, pages);
    const heads = ['', '学生姓名', '提交时间', '错误类型', '通过用例百分比', '输出相似度', '运行时间(ms)', '内存占用(kb)', '代码', '错误信息'];
    const body = logs.slice((logPage - 1) * logSize, logPage * logSize).map(log => {
      const on = expandedLogs.has(log.id),
        tone = log.errorType === '通过' ? 'success' : log.errorType === '答案错误' ? 'warning' : 'danger';
      const values = [btn(on ? '⌄' : '›', 'toggle-log', '', `data-log-id="${log.id}" aria-expanded="${on}" aria-controls="detail-${log.id}" aria-label="${on ? '收起' : '展开'} ${esc(log.student)} ${log.submitted} 执行详情"`), esc(log.student), esc(log.submitted), `<span class="status ${tone}">${log.errorType}</span>`, log.passed + '%', Number(log.similarity).toFixed(2), log.runtime, log.memory, `<span class="qb-log-snippet">${esc(log.code)}</span>`, `<span class="qb-log-snippet">${esc(log.message)}</span>`];
      return `<tr data-log-row="${log.id}">${values.map(v => `<td>${v}</td>`).join('')}</tr><tr id="detail-${log.id}" class="qb-log-details" ${on ? '' : 'hidden'}><td colspan="10"><div><section><h3>提交代码 · ${esc(log.language)}</h3><pre>${esc(log.code)}</pre></section><section><h3>错误信息 / 执行反馈</h3><pre>${esc(log.message)}</pre><dl><dt>输入 / 数据来源</dt><dd><pre>${esc(log.input)}</pre></dd><dt>预期输出</dt><dd><pre>${esc(log.expected)}</pre></dd><dt>实际输出</dt><dd><pre>${esc(log.output || '无输出')}</pre></dd></dl></section></div></td></tr>`;
    }).join('');
    form.querySelector('#qb-log-body').innerHTML = tableHTML(heads, body || '<tr><td colspan="10" class="qb-empty">该题目暂无执行日志。</td></tr>') + `<div class="qb-pager"><span>共 ${logs.length} 条 · 第 ${logPage} / ${pages} 页</span><div>${btn('‹', 'log-prev', '', logPage === 1 ? 'disabled aria-label="执行日志上一页"' : 'aria-label="执行日志上一页"')}${Array.from({
      length: pages
    }, (_, i) => btn(i + 1, 'log-page', i + 1 === logPage ? 'qb-log-current' : '', `data-page="${i + 1}" aria-label="执行日志第 ${i + 1} 页" ${i + 1 === logPage ? 'aria-current="page"' : ''}`)).join('')}${btn('›', 'log-next', '', logPage === pages ? 'disabled aria-label="执行日志下一页"' : 'aria-label="执行日志下一页"')}</div></div>`;
    form.querySelector('.qb-table').setAttribute('aria-label', labels[kind] + '执行日志');
  }
  function openLogs(record, trigger) {
    if (!['program', 'sql'].includes(kind)) return;
    mode = 'execution-logs';
    logQuestion = record;
    logPage = 1;
    expandedLogs.clear();
    show('查看执行日志', labels[kind] + '执行详情 · ' + record.name, '<div id="qb-log-body" class="qb-full"></div><p class="qb-full meta">预置只读演示记录，不连接真实判题或数据库服务。</p>', cancel() + '<button type="button" class="btn qb-blue" data-close>确定</button>', trigger, true);
    modal.querySelector('.modal').classList.add('qb-log-modal');
    renderLogs();
    form.querySelector('[data-action=toggle-log]')?.focus();
  }
  function safeHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    function walk(node) {
      return [...node.childNodes].map(n => n.nodeType === 3 ? esc(n.textContent) : n.nodeType === 1 ? ['B', 'STRONG', 'I', 'EM', 'U', 'P', 'DIV', 'BR', 'UL', 'OL', 'LI', 'PRE', 'CODE'].includes(n.tagName) ? `<${n.tagName.toLowerCase()}>${walk(n)}</${n.tagName.toLowerCase()}>` : walk(n) : '').join('');
    }
    return walk(doc.body);
  }
  function rich(name, label, value = '', html = '') {
    return `<div class="qb-field qb-full"><label id="label-${name}">${label}</label><div class="qb-editor"><div class="qb-tools">${[['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['insertOrderedList', '1.'], ['insertUnorderedList', '•']].map(([cmd, text]) => `<button type="button" data-format="${cmd}" data-target="${name}" aria-label="${label} ${cmd}">${text}</button>`).join('')}<span>富文本编辑</span></div><div contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="label-${name}" data-rich="${name}" data-placeholder="开始编辑…">${html ? safeHTML(html) : esc(value)}</div></div></div>`;
  }
  function richValue(name) {
    return form.querySelector(`[data-rich="${name}"]`)?.innerText.trim() || '';
  }
  function caseHTML(c, i) {
    return `<section class="qb-case" data-case><header><strong>测试用例 ${i + 1}</strong>${btn('删除', 'remove-case', 'qb-red')}</header><div>${area('caseInput', '输入', c.input)}${area('caseOutput', '输出 *', c.output)}</div></section>`;
  }
  function openEditor(record, trigger, draftIndex = null) {
    mode = draftIndex === null ? 'editor' : 'draft';
    editing = record?.id || null;
    modal.dataset.draft = draftIndex ?? '';
    const r = record || {
      name: '',
      description: '',
      answer: '',
      options: ['', '', '', ''],
      review: '未审核',
      usage: '练习题',
      tag: '',
      difficulty: '基础',
      cases: [{
        input: '',
        output: ''
      }],
      io: '标准输入',
      queryType: 'SELECT',
      table: 'course'
    };
    let body = kind === 'choice' ? rich('name', '题干 *', r.name, r.rich?.name) + `<div class="qb-options">${r.options.map((o, i) => `<div>${rich('option' + i, '选项 ' + String.fromCharCode(65 + i) + ' *', o, r.rich?.['option' + i])}<label class="qb-correct"><input type="checkbox" name="correct" value="${String.fromCharCode(65 + i)}" ${r.answer.split(',').includes(String.fromCharCode(65 + i)) ? 'checked' : ''}> 正确答案</label></div>`).join('')}</div>` : kind === 'fill' ? input('name', '题干 *', r.name, 'required') + area('answer', '答案 *', r.answer, 'required') + '<p class="qb-full meta">多个可接受答案请使用半角逗号分隔。</p>' : input('name', '题目名称 *', r.name, `required maxlength="${kind === 'sql' ? 80 : 100}"`) + rich('description', '输入描述 *', r.description, r.rich?.description);
    if (kind === 'program') body += input('id', '题目编号 *', r.id || '', 'required pattern="P[0-9]{3,}" placeholder="自动生成，可修改"') + area('starter', '代码模板', r.starter || '', 'maxlength="5000"') + `<label class="qb-field qb-full"><span>附件</span><input type="file" name="attachment"><small>${esc(r.attachment || '只登记附件文件名，不上传')}</small></label>` + area('answer', '正确代码 / 参考解法 *', r.answer, 'required maxlength="5000"') + select('io', '输入输出文件', ['标准输入', '无输入', '文件输入'], r.io) + input('outputFile', '输出文件', r.outputFile || '') + `<div class="qb-full" id="qb-cases">${r.cases.map(caseHTML).join('')}</div><div class="qb-full">${btn('＋ 添加测试用例', 'add-case')}${btn('运行测试用例', 'run-cases', 'qb-green')}<div id="qb-result" role="status"></div></div>`;
    if (kind === 'sql') body += area('answer', '正确答案（SQL） *', r.answer, 'required maxlength="1000"') + select('queryType', '查询类型', ['SELECT'], r.queryType) + select('table', '涉及表名', Object.keys(tables), r.table) + input('keywords', '关键字', r.keywords || '', 'maxlength="100"') + `<div class="qb-full">${btn('执行 SQL 语句', 'run-sql', 'qb-green')}<div id="qb-result" role="status"></div></div>`;
    body += radios('review', '审核', ['已审核', '未审核', '存疑'], r.review) + radios('usage', '类型', ['练习题', '考试题'], r.usage) + select('tag', '标签', [...new Set([...tags, r.tag].filter(Boolean))], r.tag, true) + select('difficulty', '难度', ['基础', '中等', '竞赛'], r.difficulty) + area('explanation', '解析 / 评分依据', r.explanation || '');
    show(labels[kind] + ' · ' + (record ? '编辑题目' : '添加题目'), kind === 'program' ? '配置代码模板、参考解法与测试用例' : '维护题目内容、答案与知识标签', body, btn('识别标签', 'identify', 'qb-amber') + cancel() + '<button type="submit" class="btn qb-blue">确定</button>', trigger, kind === 'choice' || kind === 'sql');
    if (kind === 'program' && !record) form.elements.id.removeAttribute('required');
  }
  function collect() {
    const v = Object.fromEntries(new FormData(form)),
      r = {
        ...bankRows.find(r => r.id === editing),
        ...v
      };
    for (const key of ['name', 'description']) if (form.querySelector(`[data-rich="${key}"]`)) {
      r[key] = richValue(key);
      r.rich = {
        ...r.rich,
        [key]: safeHTML(form.querySelector(`[data-rich="${key}"]`).innerHTML)
      };
    }
    if (kind === 'choice') {
      r.options = [0, 1, 2, 3].map(i => richValue('option' + i));
      r.answer = new FormData(form).getAll('correct').join(',');
      [0, 1, 2, 3].forEach(i => r.rich['option' + i] = safeHTML(form.querySelector(`[data-rich="option${i}"]`).innerHTML));
    }
    if (kind === 'program') {
      r.cases = [...form.querySelectorAll('[data-case]')].map(el => ({
        input: el.querySelector('[name=caseInput]').value,
        output: el.querySelector('[name=caseOutput]').value
      }));
      r.attachment = form.elements.attachment.files[0]?.name || bankRows.find(r => r.id === editing)?.attachment || '';
      delete r.caseInput;
      delete r.caseOutput;
    }
    ['name', 'answer', 'description', 'id'].forEach(k => {
      if (typeof r[k] === 'string') r[k] = r[k].trim();
    });
    return r;
  }
  function validate(r) {
    if (!r.name) return '请填写题干或题目名称。';
    if (!r.answer) return '请填写答案。';
    if (!r.tag) return '请选择标签。';
    if (kind === 'choice' && (r.options.some(o => !o) || !/^([A-D])(,[A-D])*$/.test(r.answer))) return '请填写四个选项，并选择至少一个正确答案。';
    if (kind === 'choice' && new Set(r.options).size !== 4) return '选项内容不能重复。';
    if (kind === 'program') {
      if (!r.description) return '请填写输入描述。';
      if (!r.cases?.length || r.cases.some(c => !c.output.trim())) return '至少保留一个测试用例，并填写每个用例的输出。';
      if (r.id && !/^P\d{3,}$/.test(r.id)) return '题目编号格式应为 P 加至少三位数字。';
    }
    if (kind === 'sql') {
      if (!r.description) return '请填写输入描述。';
      try {
        executeSQL(r.answer, r.table);
      } catch (e) {
        return e.message;
      }
    }
    return '';
  }
  function newID() {
    const prefix = {
      choice: 'C',
      fill: 'F',
      program: 'P',
      sql: 'S'
    }[kind];
    let id;
    do {
      id = prefix + String(++sequence).padStart(3, '0');
    } while (bankRows.some(r => r.id === id));
    return id;
  }
  function normalize(r) {
    return {
      review: '未审核',
      usage: '练习题',
      difficulty: '基础',
      source: '人工',
      uploader: mine,
      shared: false,
      wrong: 0,
      drawn: 0,
      doubts: 0,
      ...r,
      id: r.id || newID()
    };
  }
  function save(r) {
    r = normalize(r);
    const index = bankRows.findIndex(x => x.id === editing);
    if (bankRows.some((x, i) => x.id === r.id && i !== index)) {
      error('题目编号已存在。');
      return;
    }
    if (index < 0) bankRows.unshift(r);else {
      selected.delete(bankRows[index].id);
      bankRows[index] = r;
    }
    AdminUI.closeModal(modal);
    render();
    AdminUI.toast('已保存', '题目只在当前页保留，刷新恢复。');
  }
  function preview(r, trigger) {
    mode = 'preview';
    show(labels[kind] + ' · 学生预览', '展示题目内容；不进行真实作答或判题', `<article class="qb-preview qb-full"><h3>${safeHTML(r.rich?.name || esc(r.name))}</h3>${r.description ? `<div>${safeHTML(r.rich?.description || esc(r.description))}</div>` : ''}${kind === 'choice' ? r.options.map((o, i) => `<label><input type="${r.answer.includes(',') ? 'checkbox' : 'radio'}" name="previewAnswer"> ${String.fromCharCode(65 + i)}. ${safeHTML(r.rich?.['option' + i] || esc(o))}</label>`).join('') : kind === 'fill' ? '<input placeholder="请输入答案" aria-label="填写答案">' : area('studentCode', '作答区', r.starter || '')}<details><summary>教师参考答案与解析</summary><pre>${esc(r.answer)}</pre><p>${esc(r.explanation || '暂无解析')}</p>${r.cases ? `<pre>${esc(r.cases.map(c => '输入：' + c.input + '\n输出：' + c.output).join('\n\n'))}</pre>` : ''}</details></article>`, cancel(), trigger, true);
  }
  function remove(ids, trigger) {
    mode = 'delete';
    modal.dataset.ids = JSON.stringify(ids);
    show('删除题目', '删除仅影响当前页，刷新后恢复', `<p class="qb-full">确认删除所选的 ${ids.length} 道题目？</p>`, cancel() + btn('确认删除', 'confirm-delete', 'qb-red'), trigger);
  }
  function openImport(trigger) {
    mode = 'import';
    show('批量导入 · ' + labels[kind], '支持 UTF-8 CSV；先预览校验，再确认导入', `<p class="qb-full">请使用模板字段；.xlsx / .xls 请先另存为 CSV。单文件最多 100 道。</p><label class="qb-field qb-full"><span>选择 CSV 文件</span><input type="file" id="qb-import-file" accept=".csv,text/csv"></label><div class="qb-full" id="qb-import-preview"></div>`, cancel() + btn('确认导入', 'confirm-import', 'qb-blue', 'disabled'), trigger, true);
    drafts = [];
  }
  const headers = kind === 'choice' ? ['题干', '选项A', '选项B', '选项C', '选项D', '答案', '标签', '审核', '类型'] : ['题干', '答案', '标签', '审核', '类型'];
  function template() {
    const r = bankRows[0],
      line = kind === 'choice' ? [r.name, ...r.options, r.answer, r.tag, r.review, r.usage] : [r.name, r.answer, r.tag, r.review, r.usage];
    download(labels[kind] + '导入模板.csv', [csvLine(headers), csvLine(line)].join('\r\n'));
  }
  async function readImport(file) {
    try {
      if (!file || !file.name.toLowerCase().endsWith('.csv')) throw Error('请选择 CSV 文件。');
      if (file.size > 1024 * 1024) throw Error('文件不能超过 1 MB。');
      const parsed = parseCSV(await file.text());
      if (parsed[0]?.join('|') !== headers.join('|')) throw Error('表头与模板不一致，请先下载模板。');
      if (parsed.length < 2 || parsed.length > 101) throw Error('请选择包含 1–100 道题目的 CSV。');
      drafts = parsed.slice(1).map((values, i) => {
        if (values.length !== headers.length) throw Error('第 ' + (i + 2) + ' 行字段数量不正确。');
        const v = Object.fromEntries(headers.map((h, j) => [h, values[j].trim()]));
        const r = {
          name: v.题干,
          answer: v.答案,
          tag: v.标签,
          review: v.审核,
          usage: v.类型,
          ...(kind === 'choice' ? {
            options: ['A', 'B', 'C', 'D'].map(k => v['选项' + k])
          } : {})
        };
        const e = validate(r);
        if (e) throw Error('第 ' + (i + 2) + ' 行：' + e);
        if (!['已审核', '未审核', '存疑'].includes(r.review) || !['练习题', '考试题'].includes(r.usage)) throw Error('第 ' + (i + 2) + ' 行审核或类型无效。');
        return r;
      });
      if (new Set(drafts.map(r => r.name)).size !== drafts.length || drafts.some(r => bankRows.some(b => b.name === r.name))) throw Error('导入内容存在重复题干，请调整后重试。');
      error('');
      form.querySelector('#qb-import-preview').innerHTML = '<p>校验通过，共 ' + drafts.length + ' 道；确认后写入本页。</p>' + drafts.map(r => `<p>${esc(r.name)} · ${esc(r.answer)}</p>`).join('');
      form.querySelector('[data-action=confirm-import]').disabled = false;
    } catch (e) {
      drafts = [];
      error(e.message);
      form.querySelector('[data-action=confirm-import]').disabled = true;
      form.querySelector('#qb-import-preview').textContent = '';
    }
  }
  function aiTags(category) {
    return [...new Set(AdminBankData[kind].map(r => r.tag))].filter(tag => category === '网页设计' ? tag === 'HTML 网页' : category === '计算机文化与哲学' ? ['数据安全', '数据可视化', '程序结构', '流程图'].includes(tag) : tag !== 'HTML 网页' && !['数据安全', '数据可视化', '程序结构', '流程图'].includes(tag));
  }
  let aiSettings = null;
  function openAI(trigger) {
    mode = 'ai';
    drafts = [];
    const settings = aiSettings || {
      category: 'Python 程序设计',
      aiTag: kind === 'program' ? '字符串' : 'Python 基础语法',
      quantity: 1,
      aiUsage: '练习题',
      aiDifficulty: '基础'
    };
    show('✦ ' + labels[kind] + ' · AI 工坊', '本地示例生成；校验只检查题目配置，不验证知识正确性', select('category', '知识大类', ['计算机文化与哲学', 'Python 程序设计', '网页设计'], settings.category) + select('aiTag', '知识点', aiTags(settings.category), settings.aiTag) + input('quantity', '题目数量（最多 5 道）', settings.quantity, 'type="number" min="1" max="5" step="1" required') + radios('aiUsage', '类型', ['练习题', '考试题'], settings.aiUsage) + radios('aiDifficulty', '难度', ['基础', '中等', '竞赛'], settings.aiDifficulty) + `<div class="qb-full">${btn('✦ 生成题目', 'generate', 'qb-blue')}${btn('学生预览', 'ai-preview', '', 'disabled')}${btn('确认入库', 'ai-save', 'qb-green', 'disabled')}</div><div id="qb-drafts" class="qb-full"><p class="meta">请选择知识点及数量，生成后逐题编辑、校验并选择保留入库。</p></div>`, cancel(), trigger, true);
  }
  function draftList() {
    form.querySelector('#qb-drafts').innerHTML = drafts.map((r, i) => `<article class="qb-draft"><header><strong>题目 ${i + 1}</strong><span class="status ${r.valid ? 'success' : 'warning'}">${r.valid ? '配置校验通过' : '需重新校验'}</span></header><h3>${esc(r.name)}</h3><p>${esc(r.tag)} · ${r.usage} · ${r.difficulty}</p><label><input type="checkbox" data-keep="${i}" ${r.keep ? 'checked' : ''} ${r.valid ? '' : 'disabled'}> 保留入库</label>${btn('编辑', 'edit-draft', '', `data-index="${i}"`)}${btn('校验本题', 'check-draft', '', `data-index="${i}"`)}</article>`).join('');
    form.querySelector('[data-action=ai-preview]').disabled = !drafts.length;
    form.querySelector('[data-action=ai-save]').disabled = !drafts.some(r => r.valid && r.keep);
  }
  function generate() {
    const v = Object.fromEntries(new FormData(form)),
      n = Number(v.quantity);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      error('题目数量必须为 1–5 的整数。');
      return;
    }
    const examples = AdminBankData[kind].filter(r => r.tag === v.aiTag);
    if (!examples.length) {
      error('该知识点暂未配置可校对的本地生题示例，请选择 ' + (kind === 'program' ? '字典 / 字符串、字符串或循环' : 'Python 基础语法、HTML 网页等已有题目标签') + '。');
      return;
    }
    aiSettings = v;
    drafts = Array.from({
      length: n
    }, (_, i) => ({
      ...structuredClone(examples[i % examples.length]),
      id: '',
      name: examples[i % examples.length].name + '（示例 ' + (i + 1) + '）',
      tag: v.aiTag,
      usage: v.aiUsage,
      difficulty: v.aiDifficulty,
      source: 'AI 演示',
      review: '未审核',
      uploader: mine,
      shared: false,
      wrong: 0,
      drawn: 0,
      doubts: 0,
      valid: true,
      keep: true
    }));
    error('');
    draftList();
  }
  function identify() {
    const text = [richValue('name'), form.elements.name?.value, richValue('description'), form.elements.answer?.value].join(' ').toLowerCase();
    let tag = kind === 'sql' ? 'SQL 基础查询' : /html|网页|mailto|title/.test(text) ? 'HTML 网页' : /input|print|键盘/.test(text) ? 'Python 输入输出' : /字典|词频|word_count/.test(text) ? '字典 / 字符串' : /循环|for |while/.test(text) ? '循环' : /数组/.test(text) ? '数组' : /数据|图表/.test(text) ? '数据可视化' : 'Python 基础语法';
    form.elements.tag.value = tag;
    error('已按本地关键词识别标签，请人工核对。');
  }
  // ponytail: small single-table SELECT demonstration; a real SQL engine belongs in a later backend.
  function executeSQL(sql, expectedTable) {
    const m = sql.trim().match(/^SELECT\s+([\w*,\s]+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?\s*;?$/i);
    if (!m) throw Error('本地演示仅支持单表 SELECT、WHERE（AND / 比较 / LIKE）、ORDER BY 和 LIMIT；未执行其他语句。');
    const name = Object.keys(tables).find(n => n.toLowerCase() === m[2].toLowerCase()),
      t = tables[name];
    if (!t) throw Error('涉及的数据表不存在。');
    if (expectedTable && name !== expectedTable) throw Error('SQL 中的表名与涉及表名不一致。');
    const known = t.columns.map(c => c.name),
      fields = m[1].trim() === '*' ? known : m[1].split(',').map(s => s.trim());
    if (fields.some(k => !known.includes(k)) || new Set(fields).size !== fields.length) throw Error('查询字段不存在或重复。');
    let list = t.rows.slice();
    if (m[3]) {
      const conditions = m[3].replace(/;$/, '').split(/\s+AND\s+/i).map(condition => {
        const c = condition.trim().match(/^(\w+)\s*(>=|<=|!=|<>|=|>|<|LIKE)\s*('(?:[^']|'')*'|-?\d+(?:\.\d+)?)$/i);
        if (!c || !known.includes(c[1])) throw Error('WHERE 条件不受支持或字段不存在。');
        const raw = c[3],
          value = raw[0] === "'" ? raw.slice(1, -1).replace(/''/g, "'") : Number(raw),
          op = c[2].toUpperCase();
        return row => {
          const a = row[c[1]];
          if (op === 'LIKE') {
            const pattern = String(value).split('').map(ch => ch === '%' ? '.*' : ch === '_' ? '.' : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
            return new RegExp('^' + pattern + '$', 'i').test(String(a));
          }
          if (op === '=') return String(a) === String(value);
          if (op === '!=' || op === '<>') return String(a) !== String(value);
          return op === '>' ? a > value : op === '<' ? a < value : op === '>=' ? a >= value : a <= value;
        };
      });
      list = list.filter(r => conditions.every(test => test(r)));
    }
    if (m[4]) {
      if (!known.includes(m[4])) throw Error('排序字段不存在。');
      const key = m[4],
        direction = m[5]?.toUpperCase() === 'DESC' ? -1 : 1;
      list.sort((a, b) => (typeof a[key] === 'number' ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key]), 'zh-CN')) * direction);
    }
    if (m[6]) list = list.slice(0, Number(m[6]));
    return {
      fields,
      rows: list.map(r => fields.map(k => r[k]))
    };
  }
  function sqlResult() {
    try {
      const result = executeSQL(form.elements.answer.value, form.elements.table.value);
      form.querySelector('#qb-result').innerHTML = `<p>本地示例查询结果：${result.rows.length} 行</p>` + tableHTML(result.fields, result.rows.map(row => '<tr>' + row.map(v => `<td>${esc(v)}</td>`).join('') + '</tr>').join(''));
      error('');
    } catch (e) {
      form.querySelector('#qb-result').textContent = '';
      error(e.message);
    }
  }
  function columnHTML(c, i) {
    return `<div class="qb-column" data-column>${input('columnName', '属性 ' + (i + 1), c.name, 'required pattern="[A-Za-z_][A-Za-z0-9_]*"')}${select('columnType', '类型', ['VARCHAR', 'INT', 'DECIMAL'], c.type)}<label><input type="checkbox" name="nullable" ${c.nullable ? 'checked' : ''}> 可为空</label><label><input type="checkbox" name="primary" ${c.primary ? 'checked' : ''}> 主键</label>${input('columnNote', '备注', c.note)}${btn('−', 'remove-column', 'qb-red', 'aria-label="删除属性"')}</div>`;
  }
  function createTable(trigger) {
    mode = 'create-table';
    show('✦ 新建数据表', '配置表结构和属性，仅保存到本页', input('tableName', '表名 *', '', 'required pattern="[A-Za-z_][A-Za-z0-9_]*"') + input('tableNote', '表备注') + `<div class="qb-full qb-actions">${btn('查看现存表', 'existing-tables', 'qb-green')}${btn('输入 SQL 建表语句', 'toggle-ddl', 'qb-blue')}</div><div id="qb-columns" class="qb-full">${columnHTML({
      name: '',
      type: 'VARCHAR',
      nullable: false,
      primary: false,
      note: ''
    }, 0)}</div><div class="qb-full">${btn('＋ 添加属性', 'add-column', 'qb-blue')}</div><div id="qb-ddl" class="qb-full" hidden>${area('ddl', 'CREATE TABLE 语句', '', 'placeholder="CREATE TABLE example (id INT PRIMARY KEY, name VARCHAR(100) NOT NULL);"')}<p class="meta">支持 INT、DECIMAL、VARCHAR，以及 NOT NULL、PRIMARY KEY。可使用可视表单配置其他信息。</p>${btn('解析建表语句', 'parse-ddl')}</div>`, cancel() + '<button type="submit" class="btn qb-blue">确定</button>', trigger, true);
  }
  function readColumns() {
    return [...form.querySelectorAll('[data-column]')].map(el => ({
      name: el.querySelector('[name=columnName]').value.trim(),
      type: el.querySelector('[name=columnType]').value,
      nullable: el.querySelector('[name=nullable]').checked,
      primary: el.querySelector('[name=primary]').checked,
      note: el.querySelector('[name=columnNote]').value.trim()
    }));
  }
  function parseDDL() {
    try {
      const m = form.elements.ddl.value.trim().match(/^CREATE\s+TABLE\s+(\w+)\s*\((.+)\)\s*;?$/is);
      if (!m) throw Error('请输入完整 CREATE TABLE 语句。');
      const parts = m[2].split(/,(?![^()]*\))/),
        cols = parts.map(part => {
          const c = part.trim().match(/^(\w+)\s+(INT|DECIMAL|VARCHAR)(?:\(\d+(?:,\d+)?\))?(?:\s+(NOT NULL|PRIMARY KEY))?(?:\s+(NOT NULL|PRIMARY KEY))?$/i);
          if (!c) throw Error('字段定义不受支持，请使用 INT、DECIMAL 或 VARCHAR。');
          const flags = [c[3], c[4]].join(' ').toUpperCase();
          return {
            name: c[1],
            type: c[2].toUpperCase(),
            primary: flags.includes('PRIMARY KEY'),
            nullable: !flags.includes('NOT NULL') && !flags.includes('PRIMARY KEY'),
            note: ''
          };
        });
      form.elements.tableName.value = m[1];
      form.querySelector('#qb-columns').innerHTML = cols.map(columnHTML).join('');
      error('已解析，请核对属性后确定。');
    } catch (e) {
      error(e.message);
    }
  }
  let stagedTables = null,
    editingData = false;
  function manageData(trigger) {
    mode = 'data';
    stagedTables = structuredClone(tables);
    activeTable = '';
    editingData = false;
    show('数据管理', '查看、编辑与 SQL 插入；确定后应用到本页', `<div class="qb-full qb-data-toolbar">${select('dataTable', '请选择表', Object.keys(tables), '', true)}${btn('查看数据', 'view-data', 'qb-blue')}</div><div id="qb-data-body" class="qb-full"></div>`, cancel() + btn('确定', 'save-data', 'qb-blue'), trigger, true);
  }
  function renderData() {
    const t = stagedTables[activeTable];
    if (!t) return;
    form.querySelector('#qb-data-body').innerHTML = `<div class="qb-actions">${btn(editingData ? '完成编辑' : '编辑', 'edit-data', 'qb-blue')}${btn('＋ 新增行', 'add-data')}${btn('批量删除', 'delete-data', 'qb-red')}${btn('SQL 语句插入', 'toggle-insert', 'qb-amber')}</div>${tableHTML(['<input type="checkbox" id="qb-data-all" aria-label="选择所有数据">', ...t.columns.map(c => esc(c.name))], t.rows.map((r, i) => `<tr><td><input type="checkbox" data-data-select="${i}" aria-label="选择数据第 ${i + 1} 行"></td>${t.columns.map(c => `<td>${editingData ? `<input data-cell="${i}" data-column-name="${c.name}" value="${esc(r[c.name])}" aria-label="第${i + 1}行 ${c.name}">` : esc(r[c.name])}</td>`).join('')}</tr>`).join(''))}<div id="qb-insert" hidden>${area('insertSQL', 'INSERT 语句', '', 'placeholder="INSERT INTO course (id, course, type, credit) VALUES (\'011\', \'新课程\', \'选修\', 2);"')}${btn('校验并插入', 'insert-data', 'qb-blue')}</div><p class="meta">${esc(t.note)} · ${t.rows.length} 行；确定前修改为暂存，取消将丢弃。</p>`;
  }
  function validateData(t, items) {
    const primary = t.columns.filter(c => c.primary);
    for (const r of items) {
      for (const c of t.columns) {
        const v = r[c.name];
        if ((!c.nullable || c.primary) && (v === null || v === undefined || String(v).trim() === '')) throw Error(c.name + ' 不可为空。');
        if (v !== null && v !== '' && c.type !== 'VARCHAR' && (!Number.isFinite(Number(v)) || c.type === 'INT' && !Number.isInteger(Number(v)))) throw Error(c.name + ' 必须为有效的 ' + c.type + ' 数值。');
        if (v !== null && v !== undefined && v !== '') r[c.name] = c.type === 'VARCHAR' ? String(v) : Number(v);
      }
    }
    if (primary.length) {
      const keys = items.map(r => JSON.stringify(primary.map(c => r[c.name])));
      if (new Set(keys).size !== keys.length) throw Error('主键不能重复。');
    }
  }
  function flushData() {
    if (!editingData) return;
    const t = stagedTables[activeTable],
      items = structuredClone(t.rows);
    form.querySelectorAll('[data-cell]').forEach(el => {
      const col = t.columns.find(c => c.name === el.dataset.columnName);
      items[Number(el.dataset.cell)][col.name] = el.value === '' && col.nullable ? null : col.type === 'VARCHAR' ? el.value : el.value === '' ? '' : Number(el.value);
    });
    validateData(t, items);
    t.rows = items;
  }
  function sqlValues(str) {
    const parts = [];
    let token = '',
      quoted = false;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === "'") {
        token += c;
        if (quoted && str[i + 1] === "'") {
          token += "'";
          i++;
        } else quoted = !quoted;
      } else if (c === ',' && !quoted) {
        parts.push(token.trim());
        token = '';
      } else token += c;
    }
    if (quoted) throw Error('插入语句引号未闭合。');
    parts.push(token.trim());
    return parts.map(v => {
      if (/^'(?:[^']|'')*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
      if (/^null$/i.test(v)) return null;
      if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v);
      throw Error('插入值仅支持单引号文本、数值或 NULL。');
    });
  }
  function insertData() {
    try {
      flushData();
      const m = form.elements.insertSQL.value.trim().match(/^INSERT\s+INTO\s+(\w+)\s*\(([\w,\s]+)\)\s+VALUES\s*\((.*)\)\s*;?$/is);
      if (!m || m[1] !== activeTable) throw Error('请输入针对当前表的单行 INSERT INTO … VALUES (…) 语句。');
      const fields = m[2].split(',').map(v => v.trim()),
        values = sqlValues(m[3]),
        t = stagedTables[activeTable];
      if (fields.length !== values.length || new Set(fields).size !== fields.length || fields.some(k => !t.columns.some(c => c.name === k))) throw Error('插入字段重复、不存在或与值数量不一致。');
      const r = Object.fromEntries(t.columns.map(c => [c.name, null]));
      fields.forEach((k, i) => r[k] = values[i]);
      validateData(t, [...t.rows, r]);
      t.rows.push(r);
      renderData();
      error('已暂存插入，点击确定后应用。');
    } catch (e) {
      error(e.message);
    }
  }
  root.addEventListener('submit', e => {
    if (e.target.id !== 'qb-filters') return;
    e.preventDefault();
    filters = Object.fromEntries(new FormData(e.target));
    filters.query = filters.query.trim();
    page = 1;
    selected.clear();
    render();
  });
  root.addEventListener('change', e => {
    if (e.target.dataset.select) {
      e.target.checked ? selected.add(e.target.dataset.select) : selected.delete(e.target.dataset.select);
      root.querySelector('.qb-selection span').textContent = '已选 ' + selected.size + ' 道';
      root.querySelector('[data-action=batch-delete]').disabled = !selected.size;
    }
    if (e.target.id === 'qb-all') {
      filtered().slice((page - 1) * size, page * size).forEach(r => e.target.checked ? selected.add(r.id) : selected.delete(r.id));
      render();
    }
    if (e.target.id === 'qb-size') {
      size = Number(e.target.value);
      page = 1;
      render();
    }
    if (e.target.id === 'qb-jump') {
      const n = Number(e.target.value),
        max = Math.max(1, Math.ceil(filtered().length / size));
      if (!Number.isInteger(n) || n < 1 || n > max) {
        AdminUI.toast('跳页无效', '请输入 1–' + max + ' 的整数。');
        e.target.value = page;
      } else {
        page = n;
        render();
      }
    }
  });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const action = b.dataset.action,
      r = bankRows.find(r => r.id === b.dataset.id);
    if (action === 'add') openEditor(null, b);
    if (action === 'edit') openEditor(r, b);
    if (action === 'preview') preview(r, b);
    if (action === 'execution-logs') openLogs(r, b);
    if (action === 'share') {
      r.shared = !r.shared;
      render();
      root.querySelector(`[data-action=share][data-id="${r.id}"]`)?.focus();
    }
    if (action === 'delete') remove([r.id], b);
    if (action === 'batch-delete') remove([...selected], b);
    if (action === 'copy') {
      bankRows.unshift(normalize({
        ...structuredClone(r),
        id: newID(),
        name: r.name + '（副本）',
        shared: false,
        uploader: mine,
        review: '未审核',
        wrong: 0,
        drawn: 0,
        doubts: 0
      }));
      render();
    }
    if (action === 'reset') {
      filters = {};
      page = 1;
      selected.clear();
      render();
    }
    if (action === 'prev') {
      page--;
      render();
    }
    if (action === 'next') {
      page++;
      render();
    }
    if (action === 'page') {
      page = Number(b.dataset.page);
      render();
    }
    if (action.startsWith('sort-')) {
      const key = action.slice(5);
      sortAsc = sortKey === key ? !sortAsc : true;
      sortKey = key;
      render();
    }
    if (action === 'template') template();
    if (action === 'import') openImport(b);
    if (action === 'ai') {
      aiSettings = null;
      openAI(b);
    }
    if (action === 'create-table') createTable(b);
    if (action === 'manage-data') manageData(b);
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (mode === 'editor' || mode === 'draft') {
      const r = collect(),
        message = validate(r);
      if (message) {
        error(message);
        return;
      }
      if (mode === 'draft') {
        const i = Number(modal.dataset.draft);
        drafts[i] = {
          ...drafts[i],
          ...r,
          valid: false,
          keep: false
        };
        const saved = drafts;
        openAI(document.querySelector('[data-action=ai]'));
        drafts = saved;
        draftList();
        error('内容已修改，请重新校验本题。');
      } else save(r);
    }
    if (mode === 'create-table') {
      try {
        const name = form.elements.tableName.value.trim(),
          columns = readColumns();
        if (!/^[A-Za-z_]\w*$/.test(name)) throw Error('表名须以字母或下划线开头，仅含字母、数字和下划线。');
        if (Object.keys(tables).some(k => k.toLowerCase() === name.toLowerCase())) throw Error('表名已存在。');
        if (!columns.length || columns.some(c => !/^[A-Za-z_]\w*$/.test(c.name))) throw Error('至少添加一个属性，属性名仅支持字母、数字与下划线。');
        if (new Set(columns.map(c => c.name.toLowerCase())).size !== columns.length) throw Error('属性名不能重复。');
        columns.forEach(c => {
          if (c.primary) c.nullable = false;
        });
        tables[name] = {
          note: form.elements.tableNote.value,
          columns,
          rows: []
        };
        AdminUI.closeModal(modal);
        AdminUI.toast('已创建数据表', name + ' 仅保留在本页。');
      } catch (e) {
        error(e.message);
      }
    }
  });
  form.addEventListener('change', e => {
    if (e.target.name === 'category') {
      const list = aiTags(e.target.value);
      form.elements.aiTag.innerHTML = list.length ? list.map(t => `<option>${esc(t)}</option>`).join('') : '<option value="">该类别暂无本地示例</option>';
    }
    if (e.target.id === 'qb-import-file') readImport(e.target.files[0]);
    if (e.target.dataset.keep !== undefined) {
      drafts[Number(e.target.dataset.keep)].keep = e.target.checked;
      form.querySelector('[data-action=ai-save]').disabled = !drafts.some(r => r.valid && r.keep);
    }
    if (e.target.id === 'qb-data-all') form.querySelectorAll('[data-data-select]').forEach(el => el.checked = e.target.checked);
    if (e.target.name === 'dataTable') {
      try {
        flushData();
        editingData = false;
        form.querySelector('#qb-data-body').textContent = '请点击查看数据。';
        error('');
      } catch (err) {
        e.target.value = activeTable;
        error(err.message);
      }
    }
  });
  form.addEventListener('paste', e => {
    if (e.target.closest('[data-rich]')) {
      e.preventDefault();
      document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    }
  });
  form.addEventListener('mousedown', e => {
    if (e.target.closest('[data-format]')) e.preventDefault();
  });
  form.addEventListener('click', e => {
    const fmt = e.target.closest('[data-format]');
    if (fmt) {
      const editor = form.querySelector(`[data-rich="${fmt.dataset.target}"]`);
      if (!editor.contains(window.getSelection().anchorNode)) editor.focus();
      document.execCommand(fmt.dataset.format, false, null);
      return;
    }
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const action = b.dataset.action;
    if (mode === 'execution-logs') {
      if (action === 'toggle-log') {
        const id = b.dataset.logId;
        expandedLogs.has(id) ? expandedLogs.delete(id) : expandedLogs.add(id);
        renderLogs();
        form.querySelector(`[data-log-id="${id}"]`)?.focus();
      }
      if (['log-prev', 'log-next', 'log-page'].includes(action)) {
        logPage = action === 'log-prev' ? logPage - 1 : action === 'log-next' ? logPage + 1 : Number(b.dataset.page);
        renderLogs();
        const target = form.querySelector(`[data-action="${action}"]${action === 'log-page' ? `[data-page="${logPage}"]` : ''}`);
        (target && !target.disabled ? target : form.querySelector('[aria-current=page]'))?.focus();
      }
      return;
    }
    if (action === 'identify') identify();
    if (action === 'add-case') {
      form.querySelector('#qb-cases').insertAdjacentHTML('beforeend', caseHTML({
        input: '',
        output: ''
      }, form.querySelectorAll('[data-case]').length));
    }
    if (action === 'remove-case') {
      b.closest('[data-case]').remove();
      form.querySelectorAll('[data-case] header strong').forEach((el, i) => el.textContent = '测试用例 ' + (i + 1));
    }
    if (action === 'run-cases') {
      const r = collect();
      if (!r.answer || !r.cases.length || r.cases.some(c => !c.output.trim())) {
        error('请填写参考代码，并为至少一个测试用例填写输出。');
        return;
      }
      error('');
      form.querySelector('#qb-result').innerHTML = '<p>本地配置检查通过；未执行代码，不代表判题通过。</p>' + r.cases.map((c, i) => `<pre>用例 ${i + 1} · 预期输出：\n${esc(c.output)}</pre>`).join('');
    }
    if (action === 'run-sql') sqlResult();
    if (action === 'confirm-delete') {
      const ids = JSON.parse(modal.dataset.ids);
      for (let i = bankRows.length - 1; i >= 0; i--) if (ids.includes(bankRows[i].id)) bankRows.splice(i, 1);
      ids.forEach(id => selected.delete(id));
      AdminUI.closeModal(modal);
      render();
      document.querySelector('[data-action=add]').focus();
    }
    if (action === 'confirm-import' && drafts.length) {
      bankRows.unshift(...drafts.map(normalize));
      drafts = [];
      AdminUI.closeModal(modal);
      render();
      AdminUI.toast('已导入', '题目仅在本页保留。');
    }
    if (action === 'generate') generate();
    if (action === 'edit-draft') openEditor(drafts[Number(b.dataset.index)], b, Number(b.dataset.index));
    if (action === 'check-draft') {
      const r = drafts[Number(b.dataset.index)],
        message = validate(r);
      r.valid = !message;
      r.keep = !message;
      draftList();
      error(message || '配置校验通过，请人工核对题目内容。');
    }
    if (action === 'ai-save') {
      const keep = drafts.filter(r => r.valid && r.keep);
      if (!keep.length) {
        error('请选择已校验的题目。');
        return;
      }
      bankRows.unshift(...keep.map(r => normalize({
        ...r,
        id: newID()
      })));
      drafts = [];
      AdminUI.closeModal(modal);
      render();
      AdminUI.toast('已入库', '生成题目仅保留在当前页，状态为未审核。');
    }
    if (action === 'ai-preview') {
      mode = 'ai-preview';
      show('生成题目 · 学生预览', '预览全部生成题目', `<div class="qb-full">${drafts.map(r => `<article class="qb-draft"><h3>${esc(r.name)}</h3><p>${esc(r.description || '')}</p>${r.options ? r.options.map((o, i) => `<p>${String.fromCharCode(65 + i)}. ${esc(o)}</p>`).join('') : '<textarea aria-label="学生作答" placeholder="填写答案或代码"></textarea>'}</article>`).join('')}</div>`, btn('返回 AI 工坊', 'back-ai'), b, true);
    }
    if (action === 'back-ai') {
      const saved = drafts;
      openAI(document.querySelector('[data-action=ai]'));
      drafts = saved;
      draftList();
    }
    if (action === 'add-column') form.querySelector('#qb-columns').insertAdjacentHTML('beforeend', columnHTML({
      name: '',
      type: 'VARCHAR',
      nullable: false,
      primary: false,
      note: ''
    }, form.querySelectorAll('[data-column]').length));
    if (action === 'remove-column') b.closest('[data-column]').remove();
    if (action === 'toggle-ddl') form.querySelector('#qb-ddl').hidden = !form.querySelector('#qb-ddl').hidden;
    if (action === 'parse-ddl') parseDDL();
    if (action === 'existing-tables') error('现存表：' + Object.entries(tables).map(([name, t]) => name + '（' + t.columns.map(c => c.name).join(', ') + ')').join('；'));
    if (action === 'view-data') {
      try {
        flushData();
        const value = form.elements.dataTable.value;
        if (!value) throw Error('请选择表。');
        activeTable = value;
        editingData = false;
        renderData();
        error('');
      } catch (e) {
        error(e.message);
      }
    }
    if (action === 'edit-data') {
      try {
        flushData();
        editingData = !editingData;
        renderData();
        error('');
      } catch (e) {
        error(e.message);
      }
    }
    if (action === 'add-data') {
      try {
        flushData();
        const t = stagedTables[activeTable];
        t.rows.push(Object.fromEntries(t.columns.map(c => [c.name, ''])));
        editingData = true;
        renderData();
        error('请填写新增行；主键与不可空属性必须填写。');
      } catch (e) {
        error(e.message);
      }
    }
    if (action === 'delete-data') {
      const ids = [...form.querySelectorAll('[data-data-select]:checked')].map(el => Number(el.dataset.dataSelect));
      if (!ids.length) {
        error('请先选择需要删除的数据。');
        return;
      }
      try {
        const t = stagedTables[activeTable],
          items = structuredClone(t.rows);
        form.querySelectorAll('[data-cell]').forEach(el => {
          const c = t.columns.find(c => c.name === el.dataset.columnName);
          items[Number(el.dataset.cell)][c.name] = el.value === '' && c.nullable ? null : c.type === 'VARCHAR' ? el.value : el.value === '' ? '' : Number(el.value);
        });
        const kept = items.filter((r, i) => !ids.includes(i));
        validateData(t, kept);
        t.rows = kept;
        renderData();
        error('已暂存删除 ' + ids.length + ' 行，确定后应用。');
      } catch (err) {
        error(err.message);
      }
    }
    if (action === 'toggle-insert') form.querySelector('#qb-insert').hidden = !form.querySelector('#qb-insert').hidden;
    if (action === 'insert-data') insertData();
    if (action === 'save-data') {
      try {
        flushData();
        Object.values(stagedTables).forEach(t => validateData(t, t.rows));
        Object.assign(tables, stagedTables);
        AdminUI.closeModal(modal);
        AdminUI.toast('已保存数据', '本地示例查询将使用更新的数据，刷新恢复。');
      } catch (e) {
        error(e.message);
      }
    }
  });
  render();
})();
