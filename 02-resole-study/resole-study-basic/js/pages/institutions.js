/* 两张机构页面共用同一份展示数据，不请求远端服务。 */
(() => {
  const root = document.querySelector('.institutions-page');
  if (document.body.dataset.page === 'institutions') {
    root.innerHTML = `<nav class="institution-breadcrumb" aria-label="面包屑"><a href="index.html">首页</a> / 合作机构</nav><header class="institutions-heading"><div class="eyebrow">共同建设 · 开放学习</div><h1>合作机构</h1><p>与优质教育机构一起，探索更多学习可能</p></header><div class="institution-grid">${institutions.map(item => `<a class="institution-tile" href="pages/institutions/institution.html?id=${item.id}"><span class="institution-mark" aria-hidden="true">${item.mark}</span><h2>${item.name}</h2><span>${item.courses.length} 门课程 <b aria-hidden="true">↗</b></span></a>`).join('')}</div><p class="institution-note">机构与课程关联为本地原型示例。</p>`;
    return;
  }
  const institution = institutions.find(item => item.id === new URLSearchParams(location.search).get('id'));
  if (!institution) {
    root.innerHTML = '<div class="institutions-heading"><h1>未找到该机构</h1><p>请返回列表选择合作机构。</p><a class="btn primary" href="pages/institutions/institutions.html">返回合作机构</a></div>';
    return;
  }
  document.title = `睿秀学城 · ${institution.name}`;
  root.innerHTML = `<nav class="institution-breadcrumb" aria-label="面包屑"><a href="index.html">首页</a> / <a href="pages/institutions/institutions.html">合作机构</a> / ${institution.name}</nav><div class="institution-banner"><span>连接知识，开启学习</span></div><header class="institution-profile"><span class="institution-mark" aria-hidden="true">${institution.mark}</span><div><div class="eyebrow">合作机构</div><h1>${institution.name}</h1><p>${institution.description}</p><span class="institution-note">${institution.courses.length} 门课程 · 机构介绍与课程关联为演示内容</span></div></header><div class="institution-course-heading"><h2>全部课程</h2><span>共 ${institution.courses.length} 门</span></div><div class="course-grid">${institution.courses.map(course => `<article class="card course-card"><div class="cover ${course.cover}"><span class="cover-tag">${course.tag}</span><strong>${course.title}</strong></div><div class="course-body"><h3>${course.title}</h3><p>${course.summary}</p><div class="school-line">${institution.name} · ${course.teacher}</div><div class="course-bottom"><span>${course.learners}</span><button class="btn small primary" ${course.route && routes[course.route] ? `data-go="${course.route}"${course.hash ? ` data-hash="#${course.hash}"` : ''}` : `data-course-preview="${course.title}" data-course-meta="${institution.name} · ${course.teacher}"`}>查看课程</button></div></div></article>`).join('')}</div>`;
})();
