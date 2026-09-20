(function() {
  'use strict';

  var LIST_CAP = 50;      // 列表上限暂定，待与开发确认
  var PICK_SIZE = 5;      // 每次模拟选择 5 个示例文件
  var LIB_PAGE_SIZE = 10;

  // ===== Mock Data =====
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function mockDuration(i) {
    var total = 300 + (i * 137) % 2400;
    return pad2(Math.floor(total / 3600)) + ':' + pad2(Math.floor((total % 3600) / 60)) + ':' + pad2(total % 60);
  }

  var MOCK_VIDEOS = [];
  for (var vi = 1; vi <= LIST_CAP; vi++) {
    MOCK_VIDEOS.push({
      name: 'lesson' + vi + '.mp4',
      title: 'lesson' + vi,
      duration: mockDuration(vi),
      size: (120 + (vi * 53) % 1800) + 'MB'
    });
  }

  var MOCK_PPTS = [
    { name: 'deepseekV2.pptx', size: '156MB' },
    { name: 'DeepSeekV3.2技术报告.pptx', size: '234MB' },
    { name: 'LLM推理引擎.pptx', size: '198MB' },
    { name: 'Python爬虫基础与发展现状.pptx', size: '267MB' },
    { name: '当我们谈论行为数据时.pptx', size: '212MB' },
    { name: '数字化转型概论.pptx', size: '145MB' },
    { name: '数据素养入门.pptx', size: '98MB' },
    { name: '智能办公工具.pptx', size: '176MB' },
    { name: '信息安全意识.pptx', size: '132MB' },
    { name: '行业案例解析.pptx', size: '208MB' }
  ];
  MOCK_PPTS.forEach(function(p) { p.title = p.name.replace(/\.[^.]+$/, ''); });

  var MOCK_NETWORK = [
    { name: 'v.qq.com/x/cover/...', title: '腾讯视频-1', duration: '00:45:00', size: '--' },
    { name: 'bilibili.com/video/BV1...', title: 'B站视频-1', duration: '00:12:30', size: '--' },
    { name: 'bilibili.com/video/BV2...', title: 'B站视频-2', duration: '00:08:15', size: '--' },
    { name: 'v.youku.com/v_show/...', title: '优酷视频-1', duration: '01:02:00', size: '--' }
  ];

  var LIB_FILES = [
    { id: 'L01', name: '测试转码问题.mp4', size: '1.10 MB', duration: '5秒', date: '2025-09-10 10:37:52' },
    { id: 'L02', name: '20250909-092425.mp4', size: '248.46 KB', duration: '6秒', date: '2025-09-09 09:26:15' },
    { id: 'L03', name: '1.mp4', size: '541.11 KB', duration: '4秒', date: '2025-09-08 18:56:21' },
    { id: 'L04', name: '声音异常.mp4', size: '7.70 MB', duration: '81秒', date: '2025-09-08 17:24:13' },
    { id: 'L05', name: '文件类型测试.mp4', size: '4.67 MB', duration: '11秒', date: '2025-09-08 17:18:45' },
    { id: 'L06', name: '数字素养通识课.mp4', size: '409.39 MB', duration: '1804秒', date: '2025-09-08 16:57:03' },
    { id: 'L07', name: '组会9.3.mp4', size: '88.20 MB', duration: '356秒', date: '2025-09-05 14:02:11' },
    { id: 'L08', name: '开学第一课.mp4', size: '256.78 MB', duration: '1204秒', date: '2025-09-04 09:15:40' },
    { id: 'L09', name: '微课-数据篇.mp4', size: '64.35 MB', duration: '302秒', date: '2025-09-03 16:44:08' },
    { id: 'L10', name: '试讲片段.mp4', size: '32.10 MB', duration: '151秒', date: '2025-09-02 11:27:33' },
    { id: 'L11', name: '课程宣传片.mp4', size: '128.66 MB', duration: '95秒', date: '2025-09-01 15:08:52' },
    { id: 'L12', name: '实验演示.mp4', size: '75.42 MB', duration: '420秒', date: '2025-08-29 10:41:19' },
    { id: 'L13', name: '答疑回放.mp4', size: '210.55 MB', duration: '2410秒', date: '2025-08-28 19:03:26' },
    { id: 'L14', name: '章节导入.mp4', size: '18.90 MB', duration: '74秒', date: '2025-08-27 08:52:47' },
    { id: 'L15', name: '案例讲解.mp4', size: '96.13 MB', duration: '508秒', date: '2025-08-26 14:36:05' },
    { id: 'L16', name: '期末复习.mp4', size: '154.27 MB', duration: '620秒', date: '2025-08-25 17:59:31' },
    { id: 'L17', name: '导学视频.mp4', size: '45.68 MB', duration: '233秒', date: '2025-08-24 09:20:14' }
  ];

  var LIB_FILES_PPT = [
    { id: 'P01', name: '数字化转型概论.pptx', size: '145.00 MB', date: '2025-09-10 15:22:41' },
    { id: 'P02', name: '数据素养入门.pptx', size: '98.30 MB', date: '2025-09-09 10:18:07' },
    { id: 'P03', name: '智能办公工具.pptx', size: '176.52 MB', date: '2025-09-08 14:03:55' },
    { id: 'P04', name: '信息安全意识.pptx', size: '132.18 MB', date: '2025-09-07 09:47:26' },
    { id: 'P05', name: '行业案例解析.pptx', size: '208.74 MB', date: '2025-09-05 16:31:12' },
    { id: 'P06', name: 'Python爬虫基础.pptx', size: '267.09 MB', date: '2025-09-04 11:26:48' },
    { id: 'P07', name: 'LLM推理引擎概述.pptx', size: '198.44 MB', date: '2025-09-03 15:52:30' },
    { id: 'P08', name: 'DeepSeek技术报告.pptx', size: '234.61 MB', date: '2025-09-02 10:08:19' },
    { id: 'P09', name: '当我们谈论行为数据时.pptx', size: '212.35 MB', date: '2025-08-30 17:44:03' },
    { id: 'P10', name: '数字化课堂设计.pptx', size: '88.27 MB', date: '2025-08-28 13:37:56' },
    { id: 'P11', name: '可视化图表方法.pptx', size: '120.83 MB', date: '2025-08-26 09:15:24' },
    { id: 'P12', name: '期末复习要点.pptx', size: '154.46 MB', date: '2025-08-24 14:59:10' }
  ];

  var OFFICIAL_FILES = {
    video: [
      { id: 'OV01', name: '官方精品课-数字素养导论.mp4', size: '356.20 MB', duration: '1520秒', date: '2025-09-06 09:12:33' },
      { id: 'OV02', name: '官方精品课-信息安全基础.mp4', size: '428.75 MB', duration: '1834秒', date: '2025-09-02 15:40:08' },
      { id: 'OV03', name: '官方精品课-办公效率工具.mp4', size: '312.44 MB', duration: '1266秒', date: '2025-08-28 11:05:47' },
      { id: 'OV04', name: '官方精品课-数据分析入门.mp4', size: '501.09 MB', duration: '2015秒', date: '2025-08-21 16:33:20' }
    ],
    ppt: [
      { id: 'OP01', name: '组会9.3_3.pptx', size: '2.16 MB', date: '2025-09-11 09:19:04' },
      { id: 'OP02', name: '自然语言处理简介.pptx', size: '4.13 MB', date: '2025-09-08 14:25:41' }
    ]
  };

  var LESSON_TREE = [
    { name: '第一章 总论', children: [
      { name: '绪论' }
    ] },
    { name: '第二章 数字素养', children: [
      { name: '数字素养1', children: [
        { name: '二级目录' },
        { name: '三级目录' }
      ] }
    ] },
    { name: '第三章 数字化转型', children: [
      { name: '数字化转型1' }
    ] }
  ];

  // ===== State =====
  var state = {
    step: 1,
    type: null,         // 'video' | 'ppt'
    files: [],
    activeTab: 'local',
    batch: { video: 0, ppt: 0 },
    libKeyword: '',
    libPage: 1,
    libStaged: [],      // 资料库勾选但尚未添加的 id
    offKeyword: '',
    offPage: 1,
    offStaged: []       // 官方资源库勾选但尚未添加的 id
  };

  // ===== DOM Refs =====
  var $ = function(sel) { return document.querySelector(sel); };
  var $$ = function(sel) { return document.querySelectorAll(sel); };

  var overlay = $('#modal-overlay');
  var lessonPop = $('#lesson-pop');
  var pickerOverlay = $('#picker-overlay');

  // ===== Modal =====
  function openModal() {
    resetWizard();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    closeLessonPop();
    closePicker();
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  $('#btn-open-modal').addEventListener('click', openModal);
  $('#modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (!lessonPop.hidden) closeLessonPop();
    else if (!pickerOverlay.hidden) closePicker();
    else if (overlay.classList.contains('open')) closeModal();
  });

  // ===== Wizard Reset =====
  function resetWizard() {
    stopUploadSimulation();
    state.step = 1;
    state.type = null;
    state.files = [];
    state.activeTab = 'local';
    state.batch = { video: 0, ppt: 0 };
    state.libKeyword = '';
    state.libPage = 1;
    state.libStaged = [];
    state.offKeyword = '';
    state.offPage = 1;
    state.offStaged = [];
    updateStepUI();
    $('#lib-keyword').value = '';
    $('#off-keyword').value = '';
    $('#network-urls').value = '';
    $('#dur-min').value = '0';
    $('#dur-sec').value = '0';
    $('#ppt-bulk-min').value = '0';
    $('#completion-type').value = 'video-play';
    $('#completion-lock').checked = false;
    $('#upload-list-wrap').style.display = 'none';
    $('#upload-tbody').innerHTML = '';
    resetTabs();
    renderLibrary();
    renderOfficial();
  }

  function resetTabs() {
    $$('.upload-tab').forEach(function(t) { t.classList.remove('active'); });
    $$('.upload-panel').forEach(function(p) { p.classList.remove('active'); });
    $('.upload-tab[data-tab="local"]').classList.add('active');
    $('#upload-local').classList.add('active');
    state.activeTab = 'local';
  }

  // ===== Step Navigation =====
  function updateStepUI() {
    $$('.wizard-step').forEach(function(s, i) {
      var n = i + 1;
      s.classList.remove('active', 'done');
      if (n < state.step) s.classList.add('done');
      else if (n === state.step) s.classList.add('active');
    });
    $$('.type-card').forEach(function(c) {
      c.classList.toggle('selected', c.dataset.type === state.type);
    });
    $$('.wizard-panel').forEach(function(p) { p.classList.remove('active'); });
    var panel = $('#panel-step' + state.step);
    if (panel) panel.classList.add('active');

    var footer = $('#wizard-footer');
    footer.hidden = state.step === 1;
    $('#btn-footer-next').textContent = state.step === 3 ? '确定' : '下一步';
  }

  $$('.type-card').forEach(function(card) {
    card.addEventListener('click', function() {
      state.type = card.dataset.type;
      state.step = 2;
      setupUploadTabs(state.type);
      updateStepUI();
    });
  });

  function setupUploadTabs(type) {
    $('#tab-network').style.display = type === 'video' ? '' : 'none';
    $('#dropzone-hint').textContent = type === 'video'
      ? '视频文件（仅支持 .mp4，单个文件最大 2GB，单次最多 10 个文件）'
      : 'PPT文件（支持 .pptx .ppt .pps .ppsx .pot .potx，最大 100MB）';
    resetTabs();
    $('#upload-list-wrap').style.display = 'none';
    $('#upload-tbody').innerHTML = '';
    state.files = [];
    renderLibrary();
    renderOfficial();
  }

  $('#btn-footer-cancel').addEventListener('click', closeModal);
  $('#btn-footer-prev').addEventListener('click', function() {
    if (state.step > 1) {
      state.step -= 1;
      updateStepUI();
    }
  });
  $('#btn-footer-next').addEventListener('click', function() {
    if (state.step === 2) {
      if (state.files.length === 0) {
        showToast('请先添加文件');
        return;
      }
      var missing = state.files.some(function(f) { return !f.lesson; });
      if (missing) {
        showToast('请为每个文件选择课时名');
        return;
      }
      state.step = 3;
      updateStepUI();
      renderCompletion();
    } else if (state.step === 3) {
      closeModal();
      showToast('课时任务创建成功');
    }
  });

  function renderCompletion() {
    var isPpt = state.type === 'ppt';
    $('#completion-type-video').style.display = isPpt ? 'none' : '';
    $('#completion-type-ppt').style.display = isPpt ? '' : 'none';
    $('#completion-lock-row').style.display = isPpt ? 'none' : '';

    var list = $('#summary-list');
    list.innerHTML = '';
    $('#summary-th-duration').textContent = isPpt ? '停留时长' : '视频时长';
    state.files.forEach(function(file) {
      if (file.status === 'uploading' || file.status === 'failed') return;
      var tr = document.createElement('tr');
      var durationText = isPpt ? (file.minutes || 0) + ' 分钟' : (file.duration || '--');
      tr.innerHTML = '<td>' + escHtml(file.title) + '</td>' +
        '<td>' + escHtml(durationText) + '</td>' +
        '<td>' + escHtml(file.size) + '</td>' +
        '<td class="col-sum-lesson" title="' + escAttr(file.lesson || '') + '">' + escHtml(file.lesson || '--') + '</td>';
      list.appendChild(tr);
    });
  }

  // ===== Upload Tab Switching =====
  $$('.upload-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      $$('.upload-tab').forEach(function(t) { t.classList.remove('active'); });
      $$('.upload-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = $('#upload-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
      state.activeTab = tab.dataset.tab;
      if (tab.dataset.tab === 'library') renderLibrary();
      if (tab.dataset.tab === 'official') renderOfficial();
      closeLessonPop();
    });
  });

  // ===== Mock File Picker =====
  function openPicker() {
    var pool = state.type === 'ppt' ? MOCK_PPTS : MOCK_VIDEOS;
    var start = state.batch[state.type] * PICK_SIZE;
    var batch = pool.slice(start, start + PICK_SIZE);
    if (batch.length === 0) {
      showToast('示例文件已全部添加');
      return;
    }
    if (state.files.length >= LIST_CAP) {
      showToast('文件列表已达上限 ' + LIST_CAP + ' 个（暂定）');
      return;
    }
    var list = $('#picker-list');
    list.innerHTML = '';
    batch.forEach(function(f) {
      var div = document.createElement('div');
      div.className = 'picker-item';
      div.innerHTML = '<span class="pick-check"></span><span>' + escHtml(f.name) + '</span>' +
        '<span class="pick-size">' + escHtml(f.size) + '</span>';
      list.appendChild(div);
    });
    pickerOverlay.hidden = false;
  }

  function closePicker() {
    pickerOverlay.hidden = true;
  }

  $('#picker-close').addEventListener('click', closePicker);
  $('#picker-cancel').addEventListener('click', closePicker);
  pickerOverlay.addEventListener('click', function(e) {
    if (e.target === pickerOverlay) closePicker();
  });
  $('#picker-ok').addEventListener('click', function() {
    var pool = state.type === 'ppt' ? MOCK_PPTS : MOCK_VIDEOS;
    var start = state.batch[state.type] * PICK_SIZE;
    var batch = pool.slice(start, start + PICK_SIZE);
    var room = LIST_CAP - state.files.length;
    batch = batch.slice(0, room);
    if (batch.length === 0) {
      closePicker();
      showToast('文件列表已达上限 ' + LIST_CAP + ' 个（暂定）');
      return;
    }
    var added = batch.map(function(f) {
      return Object.assign({}, f, {
        source: 'local',
        progress: 0,
        status: 'waiting',
        lesson: null,
        minutes: 0,
        id: 'f' + Math.random().toString(36).substr(2, 6)
      });
    });
    state.files = state.files.concat(added);
    state.batch[state.type] += 1;
    closePicker();
    renderUploadList();
    setTimeout(function() { startUploadSimulation(added); }, 400);
    showToast('已添加 ' + added.length + ' 个文件');
  });

  var dropzone = $('#dropzone');
  dropzone.addEventListener('click', function(e) {
    if (e.target.closest('.dropzone-link') || e.target === dropzone || e.target.closest('.dropzone-icon') || e.target.closest('.dropzone-text')) {
      openPicker();
    }
  });
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', function() {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    openPicker();
  });
  $('#btn-browse').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openPicker();
  });

  // ===== Network URL Import =====
  $('#btn-import-urls').addEventListener('click', function() {
    var text = $('#network-urls').value.trim();
    if (!text) {
      showToast('请输入视频网址');
      return;
    }
    var urls = text.split('\n').filter(function(l) { return l.trim(); });
    var min = parseInt($('#dur-min').value, 10) || 0;
    var sec = parseInt($('#dur-sec').value, 10) || 0;
    var defaultDuration = (min || sec) ? '00:' + pad2(min) + ':' + pad2(sec) : null;
    var room = LIST_CAP - state.files.length;
    var batch = MOCK_NETWORK.slice(0, Math.min(urls.length, MOCK_NETWORK.length, room));
    if (batch.length === 0) {
      showToast('文件列表已达上限 ' + LIST_CAP + ' 个（暂定）');
      return;
    }
    var added = batch.map(function(f) {
      return Object.assign({}, f, {
        source: 'network',
        duration: defaultDuration || f.duration,
        progress: 0,
        status: 'waiting',
        lesson: null,
        minutes: 0,
        id: 'n' + Math.random().toString(36).substr(2, 6)
      });
    });
    state.files = state.files.concat(added);
    renderUploadList();
    showToast('已导入 ' + added.length + ' 条链接');
  });

  $('#btn-clear-urls').addEventListener('click', function() {
    $('#network-urls').value = '';
  });

  // ===== Library Picker =====
  function libSource() {
    return state.type === 'ppt' ? LIB_FILES_PPT : LIB_FILES;
  }

  function libFiltered() {
    var kw = state.libKeyword.trim();
    var list = libSource();
    if (!kw) return list;
    return list.filter(function(f) { return f.name.indexOf(kw) !== -1; });
  }

  function renderLibrary() {
    var list = libFiltered();
    var showDuration = state.type !== 'ppt';
    $('#lib-th-duration').style.display = showDuration ? '' : 'none';
    var pages = Math.max(1, Math.ceil(list.length / LIB_PAGE_SIZE));
    if (state.libPage > pages) state.libPage = pages;
    var rows = list.slice((state.libPage - 1) * LIB_PAGE_SIZE, state.libPage * LIB_PAGE_SIZE);

    $('#lib-total').textContent = '共 ' + list.length + ' 条数据';

    var pagesWrap = $('#lib-pages');
    pagesWrap.innerHTML = '';
    for (var p = 1; p <= pages; p++) {
      (function(page) {
        var b = document.createElement('button');
        b.className = 'pager-btn' + (page === state.libPage ? ' active' : '');
        b.textContent = page;
        b.addEventListener('click', function() {
          state.libPage = page;
          renderLibrary();
        });
        pagesWrap.appendChild(b);
      })(p);
    }
    $('#lib-next').disabled = state.libPage >= pages;

    var tbody = $('#lib-tbody');
    tbody.innerHTML = '';
    rows.forEach(function(f) {
      var inQueue = state.files.some(function(x) { return x.id === 'lib-' + f.id; });
      var checked = inQueue || state.libStaged.indexOf(f.id) !== -1;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="checkbox" class="lib-check" data-lib="' + f.id + '"' + (checked ? ' checked' : '') + (inQueue ? ' disabled' : '') + '></td>' +
        '<td>' + escHtml(f.name) + '</td>' +
        '<td>' + f.size + '</td>' +
        (showDuration ? '<td>' + escHtml(f.duration || '--') + '</td>' : '') +
        '<td>' + f.date + '</td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-lib]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var id = cb.dataset.lib;
        if (cb.checked) {
          if (state.libStaged.indexOf(id) === -1) state.libStaged.push(id);
        } else {
          state.libStaged = state.libStaged.filter(function(x) { return x !== id; });
        }
        syncCheckAll();
      });
    });
    syncCheckAll();
  }

  function syncCheckAll() {
    var boxes = $$('#lib-tbody [data-lib]:not(:disabled)');
    var all = boxes.length > 0;
    boxes.forEach(function(cb) { if (!cb.checked) all = false; });
    $('#lib-check-all').checked = all;
  }

  $('#lib-check-all').addEventListener('change', function() {
    var checked = this.checked;
    $$('#lib-tbody [data-lib]:not(:disabled)').forEach(function(cb) {
      cb.checked = checked;
      var id = cb.dataset.lib;
      if (checked) {
        if (state.libStaged.indexOf(id) === -1) state.libStaged.push(id);
      } else {
        state.libStaged = state.libStaged.filter(function(x) { return x !== id; });
      }
    });
  });

  $('#btn-lib-search').addEventListener('click', function() {
    state.libKeyword = $('#lib-keyword').value;
    state.libPage = 1;
    renderLibrary();
  });

  $('#btn-lib-reset').addEventListener('click', function() {
    state.libKeyword = '';
    state.libPage = 1;
    $('#lib-keyword').value = '';
    renderLibrary();
  });

  $('#lib-next').addEventListener('click', function() {
    state.libPage += 1;
    renderLibrary();
  });

  $('#btn-lib-add').addEventListener('click', function() {
    var room = LIST_CAP - state.files.length;
    var ids = state.libStaged.slice(0, room);
    if (ids.length === 0) {
      showToast(state.libStaged.length === 0 ? '请先勾选文件' : '文件列表已达上限 ' + LIST_CAP + ' 个（暂定）');
      return;
    }
    var added = ids.map(function(id) {
      var rec = libSource().filter(function(f) { return f.id === id; })[0];
      return {
        id: 'lib-' + id,
        source: 'library',
        name: rec.name,
        title: rec.name.replace(/\.[^.]+$/, ''),
        duration: rec.duration || '--',
        size: rec.size,
        progress: 100,
        status: 'complete',
        lesson: null,
        minutes: 0
      };
    });
    state.files = state.files.concat(added);
    state.libStaged = state.libStaged.filter(function(x) { return ids.indexOf(x) === -1; });
    renderLibrary();
    renderUploadList();
    showToast('已添加 ' + added.length + ' 个文件');
  });

  // ===== Official Library Import =====
  function offSource() {
    return OFFICIAL_FILES[state.type] || [];
  }

  function offFiltered() {
    var kw = state.offKeyword.trim();
    var list = offSource();
    if (!kw) return list;
    return list.filter(function(f) { return f.name.indexOf(kw) !== -1; });
  }

  function renderOfficial() {
    var list = offFiltered();
    var showDuration = state.type === 'video';
    $('#off-th-duration').style.display = showDuration ? '' : 'none';
    var pages = Math.max(1, Math.ceil(list.length / LIB_PAGE_SIZE));
    if (state.offPage > pages) state.offPage = pages;
    var rows = list.slice((state.offPage - 1) * LIB_PAGE_SIZE, state.offPage * LIB_PAGE_SIZE);

    $('#off-total').textContent = '共 ' + list.length + ' 条数据';

    var pagesWrap = $('#off-pages');
    pagesWrap.innerHTML = '';
    for (var p = 1; p <= pages; p++) {
      (function(page) {
        var b = document.createElement('button');
        b.className = 'pager-btn' + (page === state.offPage ? ' active' : '');
        b.textContent = page;
        b.addEventListener('click', function() {
          state.offPage = page;
          renderOfficial();
        });
        pagesWrap.appendChild(b);
      })(p);
    }
    $('#off-next').disabled = state.offPage >= pages;

    var tbody = $('#off-tbody');
    tbody.innerHTML = '';
    rows.forEach(function(f) {
      var inQueue = state.files.some(function(x) { return x.id === 'off-' + f.id; });
      var checked = inQueue || state.offStaged.indexOf(f.id) !== -1;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="checkbox" class="lib-check" data-off="' + f.id + '"' + (checked ? ' checked' : '') + (inQueue ? ' disabled' : '') + '></td>' +
        '<td>' + escHtml(f.name) + '</td>' +
        '<td>' + f.size + '</td>' +
        (showDuration ? '<td>' + escHtml(f.duration || '--') + '</td>' : '') +
        '<td>' + f.date + '</td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-off]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var id = cb.dataset.off;
        if (cb.checked) {
          if (state.offStaged.indexOf(id) === -1) state.offStaged.push(id);
        } else {
          state.offStaged = state.offStaged.filter(function(x) { return x !== id; });
        }
        syncOffCheckAll();
      });
    });
    syncOffCheckAll();
  }

  function syncOffCheckAll() {
    var boxes = $$('#off-tbody [data-off]:not(:disabled)');
    var all = boxes.length > 0;
    boxes.forEach(function(cb) { if (!cb.checked) all = false; });
    $('#off-check-all').checked = all;
  }

  $('#off-check-all').addEventListener('change', function() {
    var checked = this.checked;
    $$('#off-tbody [data-off]:not(:disabled)').forEach(function(cb) {
      cb.checked = checked;
      var id = cb.dataset.off;
      if (checked) {
        if (state.offStaged.indexOf(id) === -1) state.offStaged.push(id);
      } else {
        state.offStaged = state.offStaged.filter(function(x) { return x !== id; });
      }
    });
  });

  $('#btn-off-search').addEventListener('click', function() {
    state.offKeyword = $('#off-keyword').value;
    state.offPage = 1;
    renderOfficial();
  });

  $('#btn-off-reset').addEventListener('click', function() {
    state.offKeyword = '';
    state.offPage = 1;
    $('#off-keyword').value = '';
    renderOfficial();
  });

  $('#off-next').addEventListener('click', function() {
    state.offPage += 1;
    renderOfficial();
  });

  $('#btn-off-add').addEventListener('click', function() {
    var room = LIST_CAP - state.files.length;
    var ids = state.offStaged.slice(0, room);
    if (ids.length === 0) {
      showToast(state.offStaged.length === 0 ? '请先勾选文件' : '文件列表已达上限 ' + LIST_CAP + ' 个（暂定）');
      return;
    }
    var added = ids.map(function(id) {
      var rec = offSource().filter(function(f) { return f.id === id; })[0];
      return {
        id: 'off-' + id,
        source: 'official',
        name: rec.name,
        title: rec.name.replace(/\.[^.]+$/, ''),
        duration: rec.duration || '--',
        size: rec.size,
        progress: 100,
        status: 'complete',
        lesson: null,
        minutes: 0
      };
    });
    state.files = state.files.concat(added);
    state.offStaged = state.offStaged.filter(function(x) { return ids.indexOf(x) === -1; });
    renderOfficial();
    renderUploadList();
    showToast('已添加 ' + added.length + ' 个文件');
  });

  // ===== PPT Bulk Duration =====
  $('#btn-ppt-apply').addEventListener('click', function() {
    var mins = parseInt($('#ppt-bulk-min').value, 10) || 0;
    var count = 0;
    state.files.forEach(function(f) {
      f.minutes = mins;
      count += 1;
    });
    renderUploadList();
    showToast('已统一设置 ' + count + ' 个文件的停留时长为 ' + mins + ' 分钟');
  });

  // ===== Render Upload List =====
  function renderUploadList() {
    closeLessonPop();
    var tbody = $('#upload-tbody');
    var isPPT = state.type === 'ppt';

    $('#list-meta-count').textContent = '文件列表：' + state.files.length + '/' + LIST_CAP;
    $('#list-meta-note').textContent = '上限暂定，待与开发确认';
    $('#ppt-bulk-row').style.display = (isPPT && state.files.length > 0) ? '' : 'none';

    $('#table-head-video').style.display = isPPT ? 'none' : '';
    $('#table-head-ppt').style.display = isPPT ? '' : 'none';

    tbody.innerHTML = '';
    state.files.forEach(function(file) {
      var tr = document.createElement('tr');
      tr.dataset.id = file.id;

      var tdName = document.createElement('td');
      if (file.source === 'library') {
        tdName.innerHTML = '<span class="file-name">' + escHtml(file.name) + '</span>' +
          '<div class="progress-wrap"><span class="progress-text complete">资料库已选</span></div>';
      } else if (file.source === 'official') {
        tdName.innerHTML = '<span class="file-name">' + escHtml(file.name) + '</span>' +
          '<div class="progress-wrap"><span class="progress-text complete">官方库导入</span></div>';
      } else if (file.source === 'network') {
        tdName.innerHTML = '<span class="file-name">' + escHtml(file.name) + '</span>';
      } else {
        tdName.innerHTML = '<span class="file-name">' + escHtml(file.name) + '</span>' +
          '<div class="progress-wrap" data-progress="' + file.id + '">' +
          '<div class="progress-bar"><div class="progress-fill ' + file.status + '" style="width:' + file.progress + '%"></div></div>' +
          '<span class="progress-text ' + file.status + '">' + progressLabel(file) + '</span></div>';
      }

      var tdTitle = document.createElement('td');
      tdTitle.innerHTML = '<input class="title-input" value="' + escAttr(file.title) + '" maxlength="64">' +
        '<span class="title-char">' + file.title.length + '/64</span>';

      var tdSize = document.createElement('td');
      tdSize.textContent = file.size;

      var tdLesson = document.createElement('td');
      tdLesson.innerHTML = '<button class="lesson-cell-btn' + (file.lesson ? ' set' : '') + '" data-lesson="' + file.id + '">' +
        (file.lesson ? escHtml(file.lesson) : '请选择') +
        '</button>';

      var tdAction = document.createElement('td');
      tdAction.style.textAlign = 'center';
      tdAction.innerHTML = '<button class="btn-trash" data-remove="' + file.id + '" title="移除">' +
        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M5 4h6l-.5 9h-5L5 4zM3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>' +
        '</button>';

      tr.appendChild(tdName);
      tr.appendChild(tdTitle);

      if (!isPPT) {
        var tdDuration = document.createElement('td');
        if (file.source === 'network') {
          tdDuration.innerHTML = '<input class="duration-cell-input" data-duration="' + file.id + '" value="' + escAttr(file.duration) + '">';
        } else {
          tdDuration.textContent = file.duration || '--';
        }
        tr.appendChild(tdDuration);
      } else {
        var tdMinutes = document.createElement('td');
        tdMinutes.innerHTML = '<input type="number" class="duration-cell-input" min="0" data-minutes="' + file.id + '" value="' + (file.minutes || 0) + '">';
        tr.appendChild(tdMinutes);
      }

      tr.appendChild(tdSize);
      tr.appendChild(tdLesson);
      tr.appendChild(tdAction);

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.title-input').forEach(function(input) {
      input.addEventListener('input', function() {
        var countSpan = input.nextElementSibling;
        if (countSpan) countSpan.textContent = input.value.length + '/64';
      });
    });

    tbody.querySelectorAll('[data-duration]').forEach(function(input) {
      input.addEventListener('input', function() {
        var file = findFile(input.dataset.duration);
        if (file) file.duration = input.value;
      });
    });

    tbody.querySelectorAll('[data-minutes]').forEach(function(input) {
      input.addEventListener('input', function() {
        var file = findFile(input.dataset.minutes);
        if (file) file.minutes = parseInt(input.value, 10) || 0;
      });
    });

    tbody.querySelectorAll('[data-lesson]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        openLessonPop(btn, btn.dataset.lesson);
      });
    });

    tbody.querySelectorAll('[data-remove]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.remove;
        if (id.indexOf('lib-') === 0) {
          state.libStaged = state.libStaged.filter(function(x) { return x !== id.replace('lib-', ''); });
          renderLibrary();
        }
        if (id.indexOf('off-') === 0) {
          state.offStaged = state.offStaged.filter(function(x) { return x !== id.replace('off-', ''); });
          renderOfficial();
        }
        state.files = state.files.filter(function(f) { return f.id !== id; });
        renderUploadList();
        if (state.files.length === 0) {
          $('#upload-list-wrap').style.display = 'none';
        }
      });
    });

    if (state.files.length > 0) $('#upload-list-wrap').style.display = '';
  }

  function findFile(id) {
    for (var i = 0; i < state.files.length; i++) {
      if (state.files[i].id === id) return state.files[i];
    }
    return null;
  }

  function progressLabel(file) {
    if (file.status === 'waiting') return '等待中';
    if (file.status === 'uploading') return Math.round(file.progress) + '% 上传中...';
    if (file.status === 'complete') return '100% 上传完成';
    return Math.round(file.progress) + '% 上传失败';
  }

  // ===== Lesson Picker Popover =====
  function openLessonPop(anchor, fileId) {
    var file = findFile(fileId);
    if (!file) return;
    lessonPop.innerHTML = '';
    buildLessonNodes(LESSON_TREE, [], 0, file);
    lessonPop.hidden = false;

    var rect = anchor.getBoundingClientRect();
    var popW = 280;
    var popH = Math.min(280, lessonPop.scrollHeight + 12);
    var left = Math.min(rect.left, window.innerWidth - popW - 8);
    var top = rect.bottom + 4;
    if (top + popH > window.innerHeight - 8) top = Math.max(8, rect.top - popH - 4);
    lessonPop.style.left = left + 'px';
    lessonPop.style.top = top + 'px';
  }

  function buildLessonNodes(nodes, path, level, file) {
    nodes.forEach(function(node) {
      var nodePath = path.concat([node.name]);
      if (level === 0) {
        var chapter = document.createElement('div');
        chapter.className = 'lesson-chapter';
        chapter.innerHTML = escHtml(node.name);
        lessonPop.appendChild(chapter);
      } else {
        var label = document.createElement('label');
        label.className = 'lesson-node lv-' + level;
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'lesson-pop-radio';
        radio.checked = file.lesson === nodePath.join(' / ');
        radio.addEventListener('change', function() {
          file.lesson = nodePath.join(' / ');
          closeLessonPop();
          renderUploadList();
        });
        label.appendChild(radio);
        label.appendChild(document.createTextNode(node.name));
        lessonPop.appendChild(label);
      }
      if (node.children) buildLessonNodes(node.children, nodePath, level + 1, file);
    });
  }

  function closeLessonPop() {
    lessonPop.hidden = true;
  }

  document.addEventListener('click', function(e) {
    if (lessonPop.hidden) return;
    if (e.target.closest('#lesson-pop') || e.target.closest('[data-lesson]')) return;
    closeLessonPop();
  });

  // ===== Upload Simulation =====
  var uploadTimers = [];

  function stopUploadSimulation() {
    uploadTimers.forEach(clearInterval);
    uploadTimers = [];
  }

  function startUploadSimulation(added) {
    added.forEach(function(file, index) {
      file.status = 'uploading';
      file.progress = 0;
      updateFileProgress(file);

      var delay = (index % PICK_SIZE) * 300;
      var shouldFail = (index === 2);
      var shouldStall = (index === PICK_SIZE - 1);

      setTimeout(function() {
        var timer = setInterval(function() {
          var increment = shouldFail ?
            (file.progress < 78 ? Math.random() * 8 + 2 : 0) :
            (shouldStall ? (file.progress < 62 ? Math.random() * 10 + 3 : 0) : (Math.random() * 12 + 3));

          file.progress = Math.min(100, file.progress + increment);

          if (shouldFail && file.progress >= 78) {
            file.status = 'failed';
            file.progress = 78;
            updateFileProgress(file);
            clearInterval(timer);
            return;
          }

          if (shouldStall && file.progress >= 62) {
            file.progress = 62;
            file.status = 'uploading';
            updateFileProgress(file);
            clearInterval(timer);
            return;
          }

          if (file.progress >= 100) {
            file.progress = 100;
            file.status = 'complete';
            updateFileProgress(file);
            clearInterval(timer);
          } else {
            updateFileProgress(file);
          }
        }, 300 + Math.random() * 200);
        uploadTimers.push(timer);
      }, delay);
    });
  }

  function updateFileProgress(file) {
    var wrap = document.querySelector('[data-progress="' + file.id + '"]');
    if (!wrap) return;
    var fill = wrap.querySelector('.progress-fill');
    var text = wrap.querySelector('.progress-text');
    fill.className = 'progress-fill ' + file.status;
    fill.style.width = file.progress + '%';
    text.className = 'progress-text ' + file.status;
    text.textContent = progressLabel(file);
  }

  // ===== Demo Shortcuts =====
  function lessonLeafPaths() {
    var paths = [];
    (function walk(nodes, path) {
      nodes.forEach(function(node) {
        var p = path.concat([node.name]);
        if (node.children && node.children.length) walk(node.children, p);
        else paths.push(p.join(' / '));
      });
    })(LESSON_TREE, []);
    return paths;
  }

  function seedDemoFiles() {
    stopUploadSimulation();
    var isPPT = state.type === 'ppt';
    function rid(p) { return p + Math.random().toString(36).substr(2, 6); }
    function base(rec, source, id, status, progress) {
      return {
        id: id,
        source: source,
        name: rec.name,
        title: rec.title || rec.name.replace(/\.[^.]+$/, ''),
        duration: rec.duration || '--',
        size: rec.size,
        progress: progress,
        status: status,
        lesson: null,
        minutes: 0
      };
    }
    var uploads = (isPPT ? MOCK_PPTS : MOCK_VIDEOS).slice(0, 3);
    var files = [
      base(uploads[0], 'local', rid('f'), 'complete', 100),
      base(uploads[1], 'local', rid('f'), 'uploading', 62),
      base(uploads[2], 'local', rid('f'), 'failed', 78)
    ];
    var libRec = isPPT ? LIB_FILES_PPT[0] : LIB_FILES[0];
    files.push(base(libRec, 'library', 'lib-' + libRec.id, 'complete', 100));
    var offRec = OFFICIAL_FILES[state.type][0];
    files.push(base(offRec, 'official', 'off-' + offRec.id, 'complete', 100));
    if (!isPPT) files.push(base(MOCK_NETWORK[0], 'network', rid('n'), 'waiting', 0));
    state.files = files;
    renderLibrary();
    renderOfficial();
    renderUploadList();
    showToast('已生成演示文件列表');
  }

  $('#list-meta-count').addEventListener('click', seedDemoFiles);

  $('#list-meta-note').addEventListener('click', function() {
    if (state.files.length === 0) {
      showToast('请先添加文件');
      return;
    }
    var paths = lessonLeafPaths();
    state.files.forEach(function(f, i) { f.lesson = paths[i % paths.length]; });
    renderUploadList();
    showToast('已为 ' + state.files.length + ' 个文件配置课时名');
  });

  // ===== Toast =====
  function showToast(msg) {
    var toast = $('#toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2500);
  }

  // ===== Utility =====
  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function escAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  renderLibrary();
})();
