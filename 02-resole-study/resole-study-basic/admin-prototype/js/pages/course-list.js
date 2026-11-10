/* Course metadata and row actions; course drafts can continue into smart build. */
window.AdminCourses={mount(section,validate){
 section.rows=AdminCourseState.courses();
 delete section.fields.find(f=>f.key==='name').options;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const root=document.querySelector('#management-root'),modal=document.querySelector('#record-modal'),form=document.querySelector('#record-form');
 let query='',status='',typeFilter='',page=1,mode='',active=null,coverDraft='',coverName='',coverPending=false,coverVersion=0;const size=10;
 const samplePrices={'python-data':99,'sql-practice':129,'ai-office':69,'algorithm-advance':99,'ai-classroom':39,'project-learning':29,'course-community':29,'learning-analytics':19,'ai-safety':39,'media-literacy':19};
 section.rows.forEach(row=>{
  const model=AdminCourseModels[row.name];row.lessons=AdminCourseState.modules(row.id)?.map(m=>m.name)||row.lessons||[...(model?.lessons||[])];
  row.paidMode??='免费';row.platformCourse??='否';
  if(row.paidMode==='付费'&&row.price==null)Object.assign(row,{price:samplePrices[row.id]??'',trialLessons:model?.trial?row.lessons.slice(0,1):[],validity:'长期有效'});
 });
 const fields=section.fields.filter(f=>!['id','cover'].includes(f.key)&&(AdminUI.isSuper||f.key!=='platformCourse'));
 const nextId=()=>{let n=1;while(section.rows.some(r=>r.id==='course-demo-'+String(n).padStart(3,'0')))n++;return 'course-demo-'+String(n).padStart(3,'0');};
 section.rows.forEach((row,i)=>Object.assign(row,{created:row.created||`2026-09-${String(1+i%28).padStart(2,'0')} 09:00`,comments:row.comments??true}));
 history.replaceState(null,'','#courses');
 root.classList.add('course-list-page');
 root.innerHTML=`<div class="tabs"><a class="tab" aria-current="page" href="#courses">课程列表</a><a class="tab" href="governance.html">专属课程入课审核</a></div><div class="management-summary"><span class="status info">本地演示</span><p>从课程进入管理，资源与作业统一在备课中配置。课程资料与已保存备课保留在本标签页。</p></div><section class="card course-list-card"><div class="manage-heading"><h2>${AdminUI.isSuper?'课程列表':'我的课程'}</h2>${section.create===false?'':'<button class="btn primary" id="course-create">＋ 新增课程</button>'}</div><div class="toolbar"><div class="search"><input type="search" id="course-search" placeholder="请输入课程名称" aria-label="搜索课程名称"></div><select id="course-type" aria-label="课程类型"><option value="">全部课程类型</option>${section.fields.find(f=>f.key==='type').options.map(v=>`<option>${esc(v)}</option>`).join('')}</select><select id="course-status" aria-label="课程状态"><option value="">全部状态</option>${section.fields.find(f=>f.key==='status').options.map(v=>`<option>${esc(v)}</option>`).join('')}</select><button class="btn" id="course-reset">重置</button><span class="result" id="course-count"></span></div><div class="table-wrap" tabindex="0" aria-label="课程列表，可横向滚动"><table class="course-table"><thead><tr><th>课程名称</th><th>课程类型</th><th>课程状态</th><th>创建时间</th><th>教学模块</th><th>评论权限</th><th>操作</th></tr></thead><tbody id="course-rows"></tbody></table></div><div class="empty-state" id="course-empty" hidden><h3>没有匹配的课程</h3><p>请调整课程名称、类型或状态，或重置筛选。</p></div><div class="pagination"><span id="course-page-label"></span><div class="inline-actions"><button class="btn small" id="course-prev">上一页</button><button class="btn small" id="course-next">下一页</button></div></div></section>`;
 const workspace=(r,hash='preparation')=>AdminUI.linkUrl('course-editor.html?course='+encodeURIComponent(r.name)+'&courseId='+encodeURIComponent(r.id)+'#'+hash);
 function render(){
  const rows=section.rows.map((r,i)=>({r,i})).filter(({r})=>(!query||r.name.toLowerCase().includes(query))&&(!status||r.status===status)&&(!typeFilter||r.type===typeFilter)),pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages);
  root.querySelector('#course-rows').innerHTML=rows.slice((page-1)*size,page*size).map(({r,i})=>`<tr ${r.localDraft?'data-list-draft':''}><td><a class="course-name" href="${esc(workspace(r))}">${esc(r.name)}</a><small class="meta course-id">${esc(r.id)}</small></td><td class="course-type">${esc(r.type)}</td><td><span class="status ${r.status==='已上架'?'success':'neutral'}">${esc(r.status)}</span></td><td>${esc(r.created)}</td><td><a class="course-start" href="${esc(workspace(r))}">开始备课 →</a></td><td><button type="button" class="course-switch" role="switch" aria-checked="${r.comments}" aria-label="${esc(r.name)}评论权限" data-comments="${i}"><span></span></button><small class="meta">${r.comments?'开启':'关闭'}</small></td><td><div class="inline-actions"><button class="btn small" data-course-preview="${i}">预览</button><button class="btn small" data-course-edit="${i}">编辑</button><button class="btn small danger" data-course-delete="${i}">删除</button><button class="btn small" data-course-report="${i}">学情报表</button><details class="course-more"><summary class="btn small">更多 ⋯</summary><div>${[['课程大纲','overview'],['知识点与图谱','knowledge'],['课程公告','notices'],['讨论互动','discussion'],['教研团队','team']].map(([label,hash])=>`<a href="${esc(workspace(r,hash))}">${label}</a>`).join('')}<button type="button" data-course-copy="${i}">拷贝课程</button></div></details></div></td></tr>`).join('');
  root.querySelector('#course-count').textContent=`共 ${rows.length} 门课程`;
  root.querySelector('#course-empty').hidden=rows.length>0;root.querySelector('.table-wrap').hidden=!rows.length;
  root.querySelector('#course-page-label').textContent=`第 ${page} / ${pages} 页 · 每页 ${size} 条`;
  root.querySelector('#course-prev').disabled=page===1;root.querySelector('#course-next').disabled=page===pages;
  AdminUI.setNavigationHeading(AdminUI.navigationFor());document.dispatchEvent(new Event('admin-section-change'));
 }
 function open(action,index,trigger){
  mode=action;active=index;const row=index==null?{}:section.rows[index];
  document.querySelector('#record-title').textContent=({edit:'编辑课程',create:'新增课程',copy:'拷贝课程',delete:'删除课程',preview:'课程预览'})[action];
  modal.classList.add('course-record');
  coverVersion++;coverPending=false;coverDraft=row.coverPreview??'';coverName=action==='create'?'':row.cover??'';
  document.querySelector('#record-description').textContent=action==='copy'?'复制课程资料为草稿；不复制原课程的备课资源。':action==='delete'?'从本标签页课程演示中移除。':action==='create'?'填写课程资料，保存后加入当前列表；编号自动生成。':'本地课程资料，保留在本标签页，不同步学生端。';
  document.querySelector('#record-error').textContent='';document.querySelector('#record-save').hidden=action==='preview';document.querySelector('#record-save').textContent=action==='delete'?'确认删除':action==='create'?'新增课程':'保存';
  document.querySelector('#record-fields').innerHTML=action==='delete'?`<div class="form-group full"><p>确定删除「${esc(row.name)}」？</p><label for="course-confirm">请输入“确认删除”</label><input id="course-confirm" name="confirm" required autocomplete="off"></div>`:fields.map(f=>{
   if(['paidMode','platformCourse'].includes(f.key))return `<input type="hidden" name="${f.key}" value="${f.key==='paidMode'?'免费':'否'}">`;let value=row[f.key]??f.default??'';if(action==='copy'&&f.key==='name')value+='（副本）';if(['create','copy'].includes(action)&&f.key==='status')value='草稿';if(action==='copy'&&f.key==='platformCourse')value='否';
   if(action==='create'&&['name','summary'].includes(f.key))value='';if(action==='create'&&f.key==='teacher'&&!AdminUI.isSuper)value='陈若云';
   const common=`id="course-field-${f.key}" name="${f.key}" ${f.required?'required':''} ${action==='preview'?'disabled':''}`;
   const control=f.options?`<select ${common}>${[...new Set([...f.options,String(value)])].map(v=>`<option ${v===String(value)?'selected':''}>${esc(v)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea ${common}>${esc(value)}</textarea>`:`<input ${common} type="${f.type||'text'}" value="${esc(value)}" ${f.type==='number'?'min="1"':''}>`;
   const price=f.key==='paidMode'?`<div class="form-group" id="course-price-group" data-course-paid hidden><label for="course-field-price">课程费用（元） *</label><input id="course-field-price" name="price" type="text" inputmode="decimal" placeholder="请输入课程费用" value="${esc(row.price??'')}" disabled><small>金额大于 0，最多两位小数。</small></div><div class="form-group" data-course-paid hidden><label for="course-field-validity">权益有效期</label><select id="course-field-validity" name="validity" disabled><option>长期有效</option></select><small>购买后长期有效。</small></div><fieldset class="form-group full course-trial-field" data-course-paid hidden aria-describedby="course-trial-hint"><legend>试看内容</legend><small id="course-trial-hint">可多选，非必填，可后续补充；未选择时购买前全部锁定。</small><div class="course-trial-options">${(row.lessons||[]).map((lesson,i)=>`<label class="course-trial-option"><input type="checkbox" name="trialLessons" value="${esc(lesson)}" ${(row.trialLessons||[]).includes(lesson)?'checked':''} disabled><span>第 ${i+1} 节 · ${esc(lesson)}</span></label>`).join('')||'<p class="meta">暂无课时，可在课时配置完成后补充试看内容。</p>'}</div></fieldset>`:'';
   return `<div class="form-group ${f.type==='textarea'?'full':''}"><label for="course-field-${f.key}">${esc(f.label)}${f.required?' *':''}</label>${control}${f.hint?`<small>${esc(f.hint)}</small>`:''}</div>${price}`;
  }).join('')+`<div class="form-group full course-cover-field"><label ${action==='preview'?'':'for="course-cover-file"'}>封面资源</label><div class="course-cover-preview" id="course-cover-preview"></div>${action==='preview'?'':`<input id="course-cover-file" type="file" accept="image/jpeg,image/png,image/gif,image/bmp,.jpg,.jpeg,.png,.gif,.bmp"><small>本地选择 JPG / PNG / GIF / BMP 图片，最大 2 MB；仅在本标签页演示预览。</small><button type="button" class="btn small" id="course-cover-remove">移除封面</button>`}<small id="course-cover-name"></small><p id="course-cover-error" role="alert"></p></div>`;
  if(action!=='delete'){
   updateCover();updatePrice();form.elements.type.onchange=updatePrice;form.elements.paidMode.onchange=updatePrice;
   form.querySelector('#course-cover-file')?.addEventListener('change',chooseCover);
   form.querySelector('#course-cover-remove')?.addEventListener('click',()=>{coverVersion++;coverPending=false;coverDraft='';coverName='';form.querySelector('#course-cover-file').value='';document.querySelector('#course-cover-error').textContent='';updateCover();form.querySelector('#course-cover-file').focus();});
  }
  AdminUI.openModal('record-modal',trigger);
 }
 function updatePrice(){
  const paid=form.elements.paidMode.value==='付费',input=form.elements.price;
  form.querySelectorAll('[data-course-paid]').forEach(group=>{group.hidden=!paid;group.querySelectorAll('input,select,textarea').forEach(control=>control.disabled=!paid||mode==='preview');});if(input)input.required=paid&&mode!=='preview';
  if(form.elements.access&&mode!=='preview'){
   form.elements.access.value=paid?'购买解锁':form.elements.type.value==='专属课程'?'申请审核':'公开学习';
  }
 }
 function updateCover(){
  document.querySelector('#course-cover-preview').innerHTML=coverDraft?`<img src="${esc(coverDraft)}" alt="课程封面预览">`:'<span>暂无本地封面</span>';
  document.querySelector('#course-cover-name').textContent=coverName?`当前资源：${coverName}`:'尚未选择封面图片';
  const remove=form.querySelector('#course-cover-remove');if(remove)remove.hidden=!coverName;
 }
 function chooseCover(e){
  const file=e.target.files[0];if(!file)return;const version=++coverVersion,error=document.querySelector('#course-cover-error');
  const fail=msg=>{if(version!==coverVersion||modal.hidden)return;coverPending=false;error.textContent=msg;e.target.value='';};
  error.textContent='';coverPending=false;
  if(!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)||!['image/jpeg','image/png','image/gif','image/bmp','image/x-ms-bmp'].includes(file.type)){fail('请选择 JPG / PNG / GIF / BMP 图片。');return;}
  if(file.size>2*1024*1024){fail('封面图片不能超过 2 MB。');return;}
  coverPending=true;error.textContent='正在读取封面图片…';const reader=new FileReader();
  reader.onerror=()=>fail('图片读取失败，请重新选择。');
  reader.onload=()=>{
   if(version!==coverVersion||modal.hidden)return;const img=new Image();
   img.onerror=()=>fail('图片无法读取，请选择有效的图片。');
   img.onload=()=>{if(version!==coverVersion||modal.hidden)return;coverDraft=String(reader.result);coverName=file.name;coverPending=false;error.textContent='';updateCover();};img.src=reader.result;
  };reader.readAsDataURL(file);
 }
 function positionMenu(d){root.querySelectorAll('.course-more[open]').forEach(other=>{if(other!==d)other.open=false;});const b=d.querySelector('summary').getBoundingClientRect(),menu=d.querySelector('div');menu.style.left=Math.max(12,Math.min(innerWidth-182,b.right-170))+'px';menu.style.top=Math.max(12,Math.min(innerHeight-menu.offsetHeight-12,b.bottom+6))+'px';}
 root.addEventListener('click',e=>{

  const summary=e.target.closest('.course-more summary');if(summary){e.preventDefault();const d=summary.parentElement;d.open=!d.open;if(d.open)positionMenu(d);return;}
  const btn=e.target.closest('button');if(!btn)return;
  for(const action of ['preview','edit','delete','copy']){const key='course'+action[0].toUpperCase()+action.slice(1);if(btn.dataset[key]!==undefined){open(action,Number(btn.dataset[key]),btn);return;}}
  if(btn.dataset.comments!==undefined){const i=Number(btn.dataset.comments);const updated={...section.rows[i],comments:!section.rows[i].comments};if(!AdminCourseState.putCourse(updated))return;section.rows[i]=updated;render();root.querySelector(`[data-comments="${i}"]`)?.focus();return;}
  if(btn.dataset.courseReport!==undefined)AdminCourseReports.open(section.rows[Number(btn.dataset.courseReport)].name,btn);
 });
 root.querySelector('#course-create')?.addEventListener('click',e=>open('create',null,e.currentTarget));
 root.querySelector('#course-search').oninput=e=>{query=e.target.value.trim().toLowerCase();page=1;render();};
 root.querySelector('#course-status').onchange=e=>{status=e.target.value;page=1;render();};
 root.querySelector('#course-type').onchange=e=>{typeFilter=e.target.value;page=1;render();};
 root.querySelector('#course-reset').onclick=()=>{query='';status='';typeFilter='';page=1;root.querySelector('#course-search').value='';root.querySelector('#course-status').value='';root.querySelector('#course-type').value='';render();};
 root.querySelector('#course-prev').onclick=()=>{page--;render();};root.querySelector('#course-next').onclick=()=>{page++;render();};
 root.addEventListener('toggle',e=>{if(e.target.matches('.course-more')&&e.target.open)positionMenu(e.target);},true);
 root.querySelector('.table-wrap').addEventListener('scroll',()=>root.querySelectorAll('.course-more[open]').forEach(d=>d.open=false));
 window.addEventListener('resize',()=>root.querySelectorAll('.course-more[open]').forEach(d=>d.open=false));
 document.addEventListener('click',e=>root.querySelectorAll('.course-more[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;}));
 root.addEventListener('keydown',e=>{if(e.key==='Escape')root.querySelectorAll('.course-more[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus();});});
 form.onsubmit=e=>{
  e.preventDefault();if(mode==='preview')return;const record=Object.fromEntries(new FormData(form));
  const fail=(msg,key)=>{document.querySelector('#record-error').textContent=msg;form.elements[key]?.focus();};
  if(mode==='delete'){if(record.confirm!=='确认删除'){fail('请输入“确认删除”。','confirm');return;}if(!AdminCourseState.removeCourse(section.rows[active].id))return;section.rows.splice(active,1);}
  else{
   section.fields.forEach(f=>{if(typeof record[f.key]==='string')record[f.key]=record[f.key].trim();});
   const missing=fields.find(f=>f.required&&!record[f.key]);if(missing){fail('请填写'+missing.label,missing.key);return;}
   if(coverPending){fail('请等待封面图片读取完成。');return;}
   if(record.paidMode==='付费'){
    const price=String(record.price??'').trim();if(!/^\d+(\.\d{1,2})?$/.test(price)||!Number.isFinite(Number(price))||Number(price)<=0){fail('课程费用须大于 0，且最多两位小数。','price');return;}record.price=Number(price);
    record.trialLessons=new FormData(form).getAll('trialLessons');
    const lessons=active==null?[]:section.rows[active].lessons;
    if(record.trialLessons.some(lesson=>!lessons.includes(lesson))){fail('请选择当前课程的试看内容。');return;}
    record.validity='长期有效';
   }else Object.assign(record,{price:0,trialLessons:[],validity:''});
   record.lessons=active==null?[]:[...section.rows[active].lessons];if(mode==='copy'){record.lessons=[];record.trialLessons=[];}
   record.id=mode==='edit'?section.rows[active].id:nextId();record.cover=coverName;record.coverPreview=coverDraft;
   record.platformCourse=AdminUI.isSuper?record.platformCourse:mode==='edit'?section.rows[active].platformCourse:'否';
   if(!['公开课程','专属课程'].includes(record.type)||!['免费','付费'].includes(record.paidMode)||!['否','是'].includes(record.platformCourse)){fail('请选择有效的课程类型、付费模式和平台课程选项。');return;}
   record.access=record.paidMode==='付费'?'购买解锁':record.type==='专属课程'?'申请审核':'公开学习';
   const error=validate?.(record,section,mode==='edit'?active:null);if(error){fail(error.message,error.key);return;}
   if(mode!=='edit')Object.assign(record,{localDraft:true,created:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}).slice(0,16),comments:true});
   if(!AdminCourseState.putCourse({...section.rows[mode==='edit'?active:-1],...record}))return;
   if(mode==='edit')Object.assign(section.rows[active],record);
   else section.rows.unshift({...record,localDraft:true,created:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}).slice(0,16),comments:true});
  }
  if(['create','copy'].includes(mode)){query='';status='';typeFilter='';page=1;root.querySelector('#course-search').value='';root.querySelector('#course-status').value='';root.querySelector('#course-type').value='';}
  coverVersion++;AdminUI.closeModal(modal);render();root.querySelector('#course-search').focus();AdminUI.toast('已更新课程列表','课程资料已保留在本标签页，可继续手工备课。');
 };
 render();
}};
