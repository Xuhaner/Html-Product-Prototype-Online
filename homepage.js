const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const projectLink = project => `project.html?id=${encodeURIComponent(project.id)}`;
const entryLink = (project, item, entry) => {
  const [path, fragment] = entry.path.split('#');
  return [project.id, item.id, path].map(part => part.split('/').map(encodeURIComponent).join('/')).join('/') + (fragment ? '#' + encodeURIComponent(fragment) : '');
};
const sorted = items => [...items].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
const matches = (item, query) => [item.name, item.description, item.updateNote, ...item.entries.map(e => e.name)].join(' ').toLocaleLowerCase().includes(query);
function entries(project, item) {
  return `<div class="entries" aria-label="${esc(item.name)}的原型入口">${item.entries.map(entry => `<a class="entry" href="${entryLink(project,item,entry)}" aria-label="${esc(item.name)} · ${esc(entry.name)}">${esc(entry.name)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`;
}
function prototype(project, item, list = false) {
  return `<article class="${list ? 'prototype-item' : 'card'}"><div class="card-top"><a class="project-tag" href="${projectLink(project)}">${esc(project.name)}</a><time datetime="${esc(item.updatedAt)}">${esc(item.updatedAt)}</time></div><h3>${esc(item.name)}</h3><p class="description">${esc(item.description || '')}</p>${item.updateNote ? `<p class="update-note"><span>本次更新</span>${esc(item.updateNote)}</p>` : ''}${entries(project,item)}</article>`;
}
async function load() {
  try {
    const response = await fetch('./catalog.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Catalog unavailable');
    const catalog = await response.json();
    if ($('prototype-list')) {
      const id = new URLSearchParams(location.search).get('id');
      const project = catalog.projects.find(p => p.id === id);
      if (!project) {
        $('project-title').textContent = '未找到项目';
        $('project-name').textContent = '未找到项目';
        $('project-description').textContent = '链接可能有误，请返回全部项目选择。';
        $('search').disabled = true;
        return;
      }
      document.title = `${project.name} · 产品原型列表`;
      $('project-name').textContent = project.name;
      $('project-title').textContent = project.name;
      $('project-description').textContent = project.description || '项目内全部原型与各端入口。';
      $('stats').textContent = `${project.prototypes.length} 个原型`;
      function render() {
        const query = $('search').value.trim().toLocaleLowerCase();
        const items = sorted(project.prototypes).filter(item => matches(item,query));
        $('prototype-list').innerHTML = items.map(item => prototype(project,item,true)).join('');
        $('search-status').textContent = !project.prototypes.length ? '该项目暂无原型，后续新增内容将在这里展示。' : !items.length ? '没有匹配的原型，请换个关键词。' : `共 ${items.length} 个原型`;
      }
      $('search').addEventListener('input',render);
      render();
      return;
    }
    const all = catalog.projects.flatMap(project => project.prototypes.map(item => ({project,item})));
    $('stats').textContent = `${catalog.projects.length} 个项目 · ${all.length} 个原型`;
    $('latest').innerHTML = all.sort((a,b) => b.item.updatedAt.localeCompare(a.item.updatedAt)).slice(0,6).map(({project,item}) => prototype(project,item)).join('') || '<p class="muted">暂无原型</p>';
    function render() {
      const query = $('search').value.trim().toLocaleLowerCase();
      const projects = catalog.projects.filter(p => `${p.name} ${p.description || ''}`.toLocaleLowerCase().includes(query) || p.prototypes.some(item => matches(item,query)));
      $('project-list').innerHTML = projects.map(project => {
        const latest = sorted(project.prototypes)[0];
        return `<a class="project" href="${projectLink(project)}"><div class="project-heading"><span class="project-icon" aria-hidden="true">${esc(project.name.slice(0,1))}</span><h3>${esc(project.name)}</h3><span class="count">${project.prototypes.length} 个原型</span></div><p>${esc(project.description || '')}</p><div class="project-bottom"><span>${latest ? `最近更新 ${esc(latest.updatedAt)}` : '暂无原型'}</span><span>查看项目列表 →</span></div></a>`;
      }).join('');
      $('search-status').textContent = projects.length ? '' : '没有匹配的项目或原型，请换个关键词。';
    }
    $('search').addEventListener('input',render);
    render();
    $('legacy-links').innerHTML = (catalog.legacy || []).map(item => `<a href="${esc(item.path)}">${esc(item.name)} ↗</a>`).join('');
    $('legacy').hidden = !catalog.legacy?.length;
  } catch(error) {
    $('stats').textContent = '列表暂时不可用';
    $('error').hidden = false;
    console.error(error);
  }
}
load();
