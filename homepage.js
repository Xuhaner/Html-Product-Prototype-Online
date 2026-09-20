const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (project, item, entry = item.entry) => [project.id, item.id, entry].map(part => part.split('/').map(encodeURIComponent).join('/')).join('/');
async function load() {
  try {
    const response = await fetch('./catalog.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Catalog unavailable');
    const catalog = await response.json();
    const all = catalog.projects.flatMap(project => project.prototypes.map(item => ({project,item})));
    $('stats').textContent = `${catalog.projects.length} 个项目 · ${all.length} 个原型`;
    $('latest').innerHTML = all.sort((a,b) => b.item.updatedAt.localeCompare(a.item.updatedAt)).slice(0,6).map(({project,item}) => `<article class="card"><div class="card-top"><span class="project-tag">${esc(project.name)}</span><span>交互原型</span></div><h3><a href="${link(project,item)}">${esc(item.name)}</a></h3><p>${esc(item.description || '')}</p><div class="card-bottom"><time datetime="${esc(item.updatedAt)}">更新于 ${esc(item.updatedAt)}</time><span>${(item.pages || []).map(page => `<a href="${link(project,item,page.entry)}">${esc(page.name)} ↗</a>`).join(' · ') || `<a href="${link(project,item)}">打开原型 →</a>`}</span></div></article>`).join('') || '<p class="muted">暂无原型</p>';
    function render() {
      const query = $('search').value.trim().toLocaleLowerCase();
      let matches = 0;
      $('project-list').innerHTML = catalog.projects.map(project => {
        const items = project.prototypes.filter(item => `${project.name} ${item.name} ${item.description || ''}`.toLocaleLowerCase().includes(query));
        if (query && !items.length && !project.name.toLocaleLowerCase().includes(query)) return '';
        matches++;
        return `<article class="project"><div class="project-heading"><span class="project-icon" aria-hidden="true">${esc(project.name.slice(0,1))}</span><div><h3>${esc(project.name)}</h3><p>${esc(project.description || '')}</p></div><span class="count">${project.prototypes.length} 个原型</span></div>${items.map(item => `<div class="prototype-row"><a href="${link(project,item)}">${esc(item.name)}</a><time datetime="${esc(item.updatedAt)}">${esc(item.updatedAt)}</time><a href="${link(project,item)}" aria-label="打开${esc(item.name)}">打开原型 ↗</a></div>`).join('') || '<p class="empty">暂无原型，新的探索即将开始。</p>'}</article>`;
      }).join('');
      $('search-status').textContent = matches ? '' : '没有找到匹配的项目或原型，请换个关键词。';
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
