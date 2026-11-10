/* Course-owned visual knowledge editor. In-page demo only; no student-side data link. */
window.AdminCourseKnowledge={mount(section,course){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=v=>JSON.parse(JSON.stringify(v)),root=document.querySelector('#management-root');
 const panel=document.createElement('section');panel.id='course-knowledge';panel.className='course-knowledge';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-knowledge');root.append(panel);
 let nextId=1,graph=null,saved=null,editing=false,selected=null,dirty=false,formDirty=false,collapsed=new Set(),zoom=1;
 const relations=[['before','前置知识'],['after','后置知识'],['related','关联知识']];
 const makeNode=(name,parent,type='knowledge',description='')=>({id:'kg-'+nextId++,name,parent,type,description,lessons:'',before:[],after:[],related:[]});
 const timestamp=()=>new Date().toLocaleString('zh-CN',{hour12:false});
 function seed(){
  const nodes=[makeNode(course,null,'category','本课程的知识结构与学习路径。')],base=nodes[0];
  section.rows.forEach(row=>{
   let parent=base;
   if(row.parent&&row.parent!==course){parent=nodes.find(n=>n.name===row.parent);if(!parent){parent=makeNode(row.parent,base.id,'category',row.parent+'相关知识。');nodes.push(parent);}}
   const node=makeNode(row.name,parent.id,'knowledge',row.description||row.name+'的基础方法与应用。');node.lessons=row.lessons||'';nodes.push(node);
  });
  section.rows.forEach(row=>{
   if(!row.target||row.target===row.name||row.target===course)return;
   let target=nodes.find(n=>n.name===row.target);if(!target){target=makeNode(row.target,base.id,'knowledge',row.target+'的基础方法与应用。');nodes.push(target);}
   const node=nodes.find(n=>n.name===row.name);node.related.push(target.id);if(!target.related.includes(node.id))target.related.push(node.id);
  });
  return {nodes,status:'待发布',created:timestamp()};
 }
 if(section.rows.length){graph=seed();saved=clone(graph);}
 const nodeById=id=>graph?.nodes.find(n=>n.id===id);
 const current=()=>nodeById(selected);
 function sync(){
  const on=location.hash==='#knowledge';panel.hidden=!on;
  if(on){root.querySelector('#management-panel').hidden=true;root.querySelector('.management-summary').hidden=true;root.querySelector('#tab-knowledge').setAttribute('aria-controls',panel.id);}
 }
 document.addEventListener('admin-section-change',sync);window.addEventListener('hashchange',sync);
 function mark(){dirty=true;graph.status='待发布';}
 function discardForm(){return !formDirty||window.confirm('节点有未保存的修改，确定放弃这些修改？');}
 function render(){
  const viewport=panel.querySelector('.kg-viewport'),scroll=viewport?{left:viewport.scrollLeft,top:viewport.scrollTop}:null;
  panel.innerHTML=`<div class="kg-heading"><div><span class="kg-eyebrow">COURSE KNOWLEDGE MAP</span><h2>${editing?'编辑知识图谱':'课程知识图谱'}</h2><p>${editing?'选择画布中的节点，在右侧完善内容与知识关系。':'用知识层级串联课程内容，构建清晰的学习路径。'}</p></div>${editing?'<button class="btn" data-kg="back">← 返回图谱列表</button>':`<button class="btn primary" data-kg="create" ${graph?'disabled title="每门课程维护一份知识图谱"':''}>＋ 创建图谱</button>`}</div><p class="kg-demo">本页演示：保存与发布仅在当前页面生效，刷新恢复，不同步学生端。</p>${editing?editor():list()}`;
  if(editing){draw();renderForm();if(scroll)panel.querySelector('.kg-viewport').scrollTo(scroll);}sync();
 }
 function list(){
  return graph?`<div class="kg-summary"><div><span class="kg-summary-icon">⌘</span><div><strong>知识图谱</strong><p>${esc(course)}</p></div></div><div><strong>${graph.nodes.length}</strong><span>个节点</span></div><div><strong>${graph.nodes.filter(n=>n.type==='knowledge').length}</strong><span>个知识点</span></div><span class="status ${graph.status==='已发布'?'success':'info'}">${graph.status}</span></div><div class="card table-wrap kg-table-wrap" tabindex="0" role="region" aria-label="课程图谱列表"><table class="kg-table"><thead><tr><th>图谱类型</th><th>节点数量</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody><tr><td><strong>知识图谱</strong><small>课程知识结构与关联关系</small></td><td>${graph.nodes.length}</td><td><span class="status ${graph.status==='已发布'?'success':'info'}">${graph.status}</span></td><td>${esc(graph.created)}</td><td><div class="inline-actions"><button class="btn small" data-kg="edit">编辑图谱</button><button class="btn small primary" data-kg="publish" ${graph.status==='已发布'?'disabled':''}>发布</button><button class="kg-text-danger" data-kg="delete-graph">删除</button></div></td></tr></tbody></table></div><p class="kg-list-foot">共 1 份图谱 · 每门课程维护一份知识图谱</p>`:'<div class="card empty-state"><div class="state-icon">⌘</div><h2>还没有知识图谱</h2><p>从课程根节点开始，添加分类与知识点，再配置它们之间的关系。</p><button class="btn primary" data-kg="create">＋ 创建图谱</button></div>';
 }
 function editor(){
  return `<div class="kg-workspace"><div class="kg-toolbar"><div class="kg-tool-group"><span class="kg-map-label">⌘ 知识图谱</span><span class="status ${graph.status==='已发布'?'success':'info'}">${graph.status}</span></div><div class="kg-tool-group"><button class="btn small" data-kg="expand">${collapsed.size?'全部展开':'全部收起'}</button><span class="kg-tool-divider"></span><button class="btn small" data-kg="sibling" ${!current()?.parent?'disabled':''}>＋ 同级</button><button class="btn small" data-kg="child" ${!selected?'disabled':''}>＋ 子级</button><button class="btn small kg-text-danger" data-kg="delete-node" ${!current()?.parent?'disabled':''}>删除节点</button></div><div class="kg-tool-group"><span id="kg-save-state" class="meta" role="status">${dirty?'有未保存更改':'更改已保存'}</span><button class="btn small" data-kg="save">保存图谱</button><button class="btn small primary" data-kg="publish">发布</button></div></div><div class="kg-editor-layout"><div class="kg-canvas-wrap"><div class="kg-canvas-tip">点击节点编辑 · 圆形按钮展开 / 收起</div><div class="kg-viewport" tabindex="0" role="region" aria-label="知识图谱画布，可滚动查看"><div class="kg-canvas"></div></div><div class="kg-canvas-footer"><span id="kg-node-count"></span><div class="kg-zoom"><button data-kg="zoom-out" aria-label="缩小图谱">−</button><output id="kg-zoom-value">${Math.round(zoom*100)}%</output><button data-kg="zoom-in" aria-label="放大图谱">＋</button><button data-kg="reset" aria-label="重置图谱视图">重置</button></div></div><div class="kg-legend"><span><i class="kg-category-dot"></i>分类</span><span><i></i>知识点</span><span>— 层级</span><span class="kg-relation-legend">┄ 选中节点的知识关系</span></div></div><aside class="kg-inspector" aria-label="节点配置"></aside></div></div>`;
 }
 function draw(){
  const canvas=panel.querySelector('.kg-canvas'),positions=new Map(),visible=[];let leaves=0,maxDepth=0;
  function layout(node,depth){
   maxDepth=Math.max(maxDepth,depth);visible.push(node);
   const children=collapsed.has(node.id)?[]:graph.nodes.filter(n=>n.parent===node.id);
   const ys=children.map(n=>layout(n,depth+1)),y=ys.length?(ys[0]+ys[ys.length-1])/2:65+leaves++*110;
   positions.set(node.id,{x:36+depth*230,y});return y;
  }
  layout(graph.nodes[0],0);
  const width=Math.max(640,270+maxDepth*230),height=Math.max(440,leaves*110+90);
  const line=(from,to,kind='hierarchy')=>{
   const a=positions.get(from),b=positions.get(to);if(!a||!b)return '';
   if(kind!=='hierarchy')return `<path class="kg-edge kg-edge-${kind}" d="M${a.x+86},${a.y+32} Q${(a.x+b.x)/2+86},${Math.max(a.y,b.y)+90} ${b.x+86},${b.y+32}"/>`;
   const x=a.x+172,y=a.y+32,endY=b.y+32;return `<path class="kg-edge" d="M${x},${y} C${x+32},${y} ${b.x-32},${endY} ${b.x},${endY}"/>`;
  };
  const chosen=current(),relationEdges=chosen?relations.map(([key])=>chosen[key].map(id=>line(chosen.id,id,key)).join('')).join(''):'';
  canvas.style.width=width*zoom+'px';canvas.style.height=height*zoom+'px';
  canvas.innerHTML=`<div class="kg-scene" style="width:${width}px;height:${height}px;transform:scale(${zoom})"><svg width="${width}" height="${height}" aria-hidden="true">${visible.filter(n=>n.parent).map(n=>line(n.parent,n.id)).join('')}${relationEdges}</svg>${visible.map(n=>{const p=positions.get(n.id),children=graph.nodes.filter(c=>c.parent===n.id);return `<div class="kg-node-wrap" style="left:${p.x}px;top:${p.y}px"><button class="kg-node ${n.parent?'':'kg-root'} ${n.type==='category'?'kg-category':''}" data-node="${n.id}" aria-pressed="${selected===n.id}" title="${esc(n.name)}"><span class="kg-node-type">${n.parent?(n.type==='category'?'分类':'知识点'):'课程根节点'}</span><strong>${esc(n.name)}</strong></button>${children.length?`<button class="kg-node-toggle" data-collapse="${n.id}" aria-expanded="${!collapsed.has(n.id)}" aria-label="${collapsed.has(n.id)?'展开':'收起'} ${esc(n.name)}">${collapsed.has(n.id)?'+':'−'}</button>`:''}</div>`;}).join('')}</div>`;
  panel.querySelector('#kg-node-count').textContent=`节点 ${graph.nodes.length} · 当前显示 ${visible.length}`;
  panel.querySelector('#kg-zoom-value').textContent=Math.round(zoom*100)+'%';
  panel.querySelector('[data-kg="expand"]').textContent=collapsed.size?'全部展开':'全部收起';
 }
 function relationRow(key,id=''){
  const others=graph.nodes.filter(n=>n.id!==selected&&n.parent);
  return `<div class="kg-relation-row"><select name="${key}" aria-label="${relations.find(r=>r[0]===key)[1]}"><option value="">请选择知识节点</option>${others.map(n=>`<option value="${n.id}" ${id===n.id?'selected':''}>${esc(n.name)}</option>`).join('')}</select><button type="button" class="kg-icon-remove" data-remove-relation aria-label="移除此关系">−</button></div>`;
 }
 function renderForm(){
  const inspector=panel.querySelector('.kg-inspector'),node=current();formDirty=false;
  if(!node){inspector.innerHTML='<div class="kg-inspector-empty"><span>⌖</span><h3>从一个节点开始</h3><p>点击左侧节点，在这里编辑内容、配置知识关系。</p><div><strong>1</strong> 选中节点<br><strong>2</strong> 添加同级或子级<br><strong>3</strong> 完善内容，保存并发布</div></div>';return;}
  inspector.innerHTML=`<div class="kg-inspector-head"><div><span>节点配置</span><h3>${node.parent?'编辑节点':'课程根节点'}</h3></div><button class="close" data-kg="close-node" aria-label="关闭节点配置">×</button></div><form id="kg-node-form"><div class="form-group"><label for="kg-name">节点名称 <em>*</em></label><input id="kg-name" name="name" maxlength="40" required value="${esc(node.name)}" ${node.parent?'':'readonly'}>${node.parent?'':'<small>根节点名称沿用当前课程名称。</small>'}</div><div class="form-group"><label for="kg-description">节点描述 <em>*</em></label><textarea id="kg-description" name="description" maxlength="128" required rows="3">${esc(node.description)}</textarea><small class="kg-char-count"><output id="kg-description-count">${node.description.length}</output> / 128</small></div><fieldset class="kg-type"><legend>节点类型 <em>*</em></legend>${[['category','分类'],['knowledge','知识点']].map(([value,label])=>`<label><input name="type" type="radio" value="${value}" ${node.type===value?'checked':''} ${node.parent?'':'disabled'}>${label}</label>`).join('')}</fieldset>${node.parent?`<div class="form-group"><label for="kg-lessons">关联课时</label><textarea id="kg-lessons" name="lessons" rows="2" placeholder="选填，填写关联课时">${esc(node.lessons)}</textarea></div>${relations.map(([key,label])=>`<section class="kg-relation-group"><div><strong>${label}</strong><button type="button" data-add-relation="${key}" aria-label="添加${label}">＋</button></div><div data-relation-rows="${key}">${node[key].map(id=>relationRow(key,id)).join('')}</div></section>`).join('')}<p class="meta">前置 / 后置表示学习先后，关联表示相关概念。画布虚线显示当前节点的关系。</p>`:''}<p id="kg-form-error" role="alert"></p><button class="btn primary kg-node-save" type="submit">保存节点</button></form>`;
  inspector.querySelector('form').onsubmit=e=>{e.preventDefault();saveNode();};
 }
 function fail(message,key='name'){
  panel.querySelector('#kg-form-error').textContent=message;const control=panel.querySelector('#kg-node-form')?.elements[key];if(control?.focus)control.focus();return false;
 }
 function saveNode(){
  const form=panel.querySelector('#kg-node-form'),node=current();if(!form||!node||!formDirty)return true;
  if(!form.reportValidity())return false;
  const data=new FormData(form),name=String(data.get('name')).trim(),description=String(data.get('description')).trim();
  if(!name)return fail('请填写节点名称。');if(!description)return fail('请填写节点描述。','description');
  if(graph.nodes.some(n=>n.id!==selected&&n.name===name))return fail('节点名称已存在，请使用不同名称。');
  const next=clone(graph),updated=next.nodes.find(n=>n.id===selected);Object.assign(updated,{name,description,type:node.parent?data.get('type'):'category',lessons:String(data.get('lessons')||'').trim()});
  const chosen=[];
  for(const [key,label] of relations){
   updated[key]=data.getAll(key).filter(Boolean);
   if(updated[key].some(id=>chosen.includes(id))||new Set(updated[key]).size!==updated[key].length)return fail('同一知识节点只能配置一种关系，且不能重复添加。');
   if(updated[key].some(id=>id===selected||!nodeById(id)?.parent))return fail(label+'必须选择其他有效节点。');
   chosen.push(...updated[key]);
  }
  // Keep paired relations in sync so selecting either endpoint shows the same learning order.
  next.nodes.filter(n=>n.id!==selected).forEach(n=>{
   relations.forEach(([key])=>n[key]=n[key].filter(id=>id!==selected));
   if(updated.before.includes(n.id))n.after.push(selected);
   if(updated.after.includes(n.id))n.before.push(selected);
   if(updated.related.includes(n.id))n.related.push(selected);
  });
  const visiting=new Set(),done=new Set(),lookup=new Map(next.nodes.map(n=>[n.id,n]));
  function cycle(id){if(visiting.has(id))return true;if(done.has(id))return false;visiting.add(id);if(lookup.get(id).after.some(cycle))return true;visiting.delete(id);done.add(id);return false;}
  if(next.nodes.some(n=>cycle(n.id)))return fail('前置 / 后置知识形成了循环，请调整学习顺序。');
  graph=next;formDirty=false;mark();render();panel.querySelector('.kg-node-save').focus({preventScroll:true});AdminUI.toast('节点已保存','完成配置后，请保存或发布图谱。');return true;
 }
 function validate(){
  const invalid=graph.nodes.find(n=>!n.name.trim()||!n.description.trim());
  if(invalid){selected=invalid.id;editing=true;render();fail('请先完善此节点的名称与描述。','description');return false;}return true;
 }
 function save(publish=false){
  if(editing&&!saveNode())return false;if(!validate())return false;
  if(publish)graph.status='已发布';saved=clone(graph);dirty=false;formDirty=false;render();AdminUI.toast(publish?'图谱已发布（演示）':'图谱已保存（演示）','仅在当前页面生效，刷新恢复，不同步学生端。');return true;
 }
 function focusNode(){
  const viewport=panel.querySelector('.kg-viewport'),node=panel.querySelector(`[data-node="${selected}"]`);
  if(node){const box=node.getBoundingClientRect(),view=viewport.getBoundingClientRect();viewport.scrollBy({left:box.left<view.left?box.left-view.left:Math.max(0,box.right-view.right+24),top:box.top<view.top?box.top-view.top:Math.max(0,box.bottom-view.bottom+24)});}
  panel.querySelector('#kg-name')?.focus({preventScroll:true});
  if(matchMedia('(max-width:700px)').matches)panel.querySelector('.kg-inspector').scrollIntoView({block:'start'});
 }
 panel.addEventListener('input',e=>{if(!e.target.closest('#kg-node-form'))return;formDirty=true;panel.querySelector('#kg-save-state').textContent='节点有未保存修改';panel.querySelector('#kg-form-error').textContent='';if(e.target.id==='kg-description')panel.querySelector('#kg-description-count').textContent=e.target.value.length;});
 panel.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.node){if(b.dataset.node!==selected&&discardForm()){selected=b.dataset.node;render();panel.querySelector('#kg-name').focus({preventScroll:true});if(matchMedia('(max-width:700px)').matches)panel.querySelector('.kg-inspector').scrollIntoView({block:'start'});}return;}
  if(b.dataset.collapse){const id=b.dataset.collapse;collapsed.has(id)?collapsed.delete(id):collapsed.add(id);draw();return;}
  if(b.dataset.addRelation){panel.querySelector(`[data-relation-rows="${b.dataset.addRelation}"]`).insertAdjacentHTML('beforeend',relationRow(b.dataset.addRelation));formDirty=true;panel.querySelector('#kg-save-state').textContent='节点有未保存修改';return;}
  if(b.hasAttribute('data-remove-relation')){b.closest('.kg-relation-row').remove();formDirty=true;panel.querySelector('#kg-save-state').textContent='节点有未保存修改';return;}
  const action=b.dataset.kg;
  if(action==='create'){graph={nodes:[makeNode(course,null,'category','本课程的知识结构与学习路径。')],status:'待发布',created:timestamp()};saved=clone(graph);selected=null;editing=true;dirty=false;collapsed.clear();zoom=1;render();}
  if(action==='edit'){editing=true;selected=null;render();}
  if(action==='back'){
   if((dirty||formDirty)&&!window.confirm('图谱有未保存的修改，确定放弃并返回列表？'))return;
   graph=clone(saved);dirty=false;formDirty=false;editing=false;selected=null;render();panel.querySelector('[data-kg="edit"]')?.focus();
  }
  if(action==='close-node'&&discardForm()){selected=null;render();panel.querySelector('[data-kg="expand"]').focus();}
  if(action==='sibling'||action==='child'){
   if(!current()||!discardForm())return;
   const parent=action==='child'?selected:current().parent;if(!parent)return;
   let name='新知识点',i=2;while(graph.nodes.some(n=>n.name===name))name='新知识点 '+i++;
   const node=makeNode(name,parent);graph.nodes.push(node);selected=node.id;collapsed.delete(parent);mark();render();focusNode();
  }
  if(action==='delete-node'){
   const node=current();if(!node?.parent)return;const ids=new Set();function collect(id){ids.add(id);graph.nodes.filter(n=>n.parent===id).forEach(n=>collect(n.id));}collect(node.id);
   if(!window.confirm(`确定删除「${node.name}」${ids.size>1?'及其 '+(ids.size-1)+' 个子节点':''}？相关知识关系也会移除。`))return;
   graph.nodes=graph.nodes.filter(n=>!ids.has(n.id));graph.nodes.forEach(n=>relations.forEach(([key])=>n[key]=n[key].filter(id=>!ids.has(id))));selected=null;formDirty=false;mark();render();
  }
  if(action==='delete-graph'&&window.confirm('确定删除本课程的知识图谱及全部节点？')){graph=null;saved=null;selected=null;dirty=false;formDirty=false;render();panel.querySelector('[data-kg="create"]')?.focus();}
  if(action==='expand'){if(collapsed.size)collapsed.clear();else graph.nodes.filter(n=>graph.nodes.some(c=>c.parent===n.id)).forEach(n=>collapsed.add(n.id));draw();b.textContent=collapsed.size?'全部展开':'全部收起';}
  if(action==='save')save();if(action==='publish')save(true);
  if(['zoom-in','zoom-out','reset'].includes(action)){zoom=action==='reset'?1:Math.max(.5,Math.min(1.5,Math.round((zoom+(action==='zoom-in'?.1:-.1))*10)/10));if(action==='reset'){collapsed.clear();panel.querySelector('.kg-viewport').scrollTo(0,0);}draw();}
  if(!panel.contains(b))panel.querySelector(`[data-kg="${action}"]`)?.focus({preventScroll:true});
 });
 window.addEventListener('beforeunload',e=>{if(dirty||formDirty){e.preventDefault();e.returnValue='';}});
 render();
}};
