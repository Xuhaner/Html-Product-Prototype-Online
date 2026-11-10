/* Account business UI. Shared navigation/modal helpers remain in shared/core. */
(function(){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={account:'账号名',name:'姓名',phone:'手机号',schools:'所属机构',studentNo:'学号',avatar:'头像',gender:'性别',role:'角色',status:'账号状态',email:'邮箱',bio:'个人介绍',notes:'备注',orgCount:'加入机构数',createdAt:'创建时间',updatedAt:'最近更新时间'};
 const commonFilters=['account','name','phone','gender','status'];
 const sections=[
  {id:'students',title:'学生账号',person:'学生',filters:['account','name','phone','studentNo','gender','status'],columns:['account','name','phone','schools','studentNo','avatar','gender','status','email','bio','createdAt','updatedAt'],rows:[]},
  {id:'teachers',title:'教师账号',person:'教师',filters:[...commonFilters,'schools'],columns:['account','name','phone','schools','avatar','gender','status','email','orgCount','createdAt','updatedAt'],rows:[]},
  {id:'admins',title:'管理员账号',person:'管理员',filters:commonFilters,columns:['account','name','phone','avatar','gender','role','status','email','notes','createdAt','updatedAt'],rows:[]}
 ];
 for(const section of sections)section.rows=AdminPlatform.users.filter(row=>section.id==='students'?row.role==='学生':section.id==='teachers'?row.role==='教师':row.role.includes('管理员')).map(row=>({...row}));
 const students=sections[0].rows;
 students.forEach((row,i)=>Object.assign(row,{
  phone:['13800138001','13800138002','13900139003','13900139004','13700137005','13700137006'][i],
  studentNo:'202600'+String(i+1).padStart(2,'0'),gender:['未知','女','男','男','女','未知'][i],
  status:row.status==='停用'?'禁用':'启用',avatar:row.name.slice(0,1),
  email:i===0?'lin.student@example.com':i===1?'wang.student@example.com':'',
  bio:i===0?'热爱编程，正在学习 Python 与数据分析。':i===1?'希望用技术解决生活中的问题。':'',
  createdAt:'2026-09-01 09:00:00',updatedAt:'2026-10-09 16:30:00',
  organizations:[{name:row.school,studentNo:'202600'+String(i+1).padStart(2,'0'),className:i<2?'2026级计算机一班':'2026级数字素养班',major:i<2?'计算机科学与技术':'数字素养',status:'已加入'}]
 }));
 students[0].organizations.push({name:'睿秀学城联合课程',studentNo:'RX20260001',className:'Python 研习班',major:'跨学科课程',status:'已加入'});
 students.push(
  {id:'U007',account:'new.student',name:'陈亦安',phone:'13600136007',studentNo:'',avatar:'',gender:'未知',status:'启用',email:'',bio:'',role:'学生',school:'',createdAt:'2026-10-10 09:10:00',updatedAt:'2026-10-10 09:10:00',organizations:[]},
  {id:'U008',account:'closed.student',name:'周宁',phone:'13600136008',studentNo:'',avatar:'',gender:'女',status:'已注销',email:'',bio:'',role:'学生',school:'',createdAt:'2026-08-15 10:00:00',updatedAt:'2026-10-09 11:20:00',cancelledAt:'2026-10-09 11:20:00',cancellationType:'管理员注销',organizations:[]}
 );
 for(const section of sections.slice(1))section.rows.forEach((row,i)=>Object.assign(row,{
  phone:section.id==='teachers'?['13910139001','13910139002','13910139003'][i]:['13810138001','13810138002'][i],
  gender:i===0?'女':'男',status:'启用',avatar:row.name.slice(0,1),email:i===0?(section.id==='teachers'?'chen.teacher@example.com':'admin@example.com'):'',notes:i===0?'平台主管理员':'内容运营',
  organizations:section.id==='teachers'?[{name:row.school,role:'教师',status:'已加入'}]:[],createdAt:'2026-09-01 09:00:00',updatedAt:'2026-10-09 16:30:00'
 }));
 sections[1].rows[0].organizations.push({name:'睿秀学城联合课程',role:'教师',status:'已加入'});
 sections[1].rows[2].status='禁用';sections[2].rows[1].status='禁用';
 const institutions=[...new Set([...AdminPlatform.institutions.map(row=>row.name),...sections.flatMap(s=>s.rows.flatMap(row=>row.organizations.map(org=>org.name)))])];
 const root=document.querySelector('#management-root');
 root.innerHTML=`<div class="management-summary"><span class="status info">独立管理演示</span><p>管理学生、教师和管理员账号。本页新增、编辑、禁用、注销及删除刷新后恢复；密码只演示校验，不保存或修改真实凭据。</p></div><div class="tabs" role="tablist" aria-label="用户管理">${sections.map(s=>`<button class="tab" role="tab" id="tab-${s.id}" data-section="${s.id}" aria-controls="account-panel">${s.title}</button>`).join('')}</div><section id="account-panel" role="tabpanel"></section>`;
 const panel=root.querySelector('#account-panel'),modal=document.querySelector('#account-modal'),form=document.querySelector('#account-form'),body=document.querySelector('#account-modal-body'),error=document.querySelector('#account-error'),confirm=document.querySelector('#account-confirm');
 let section=sections[0],filters={},current=null,action='',nextId=1,avatarImage='',avatarPending=false,avatarInvalid=false,imageRequest=0;
 const value=(row,key)=>key==='schools'?row.organizations.map(org=>org.name).join('、'):key==='orgCount'?row.organizations.length:row[key];
 const status=v=>`<span class="status ${v==='启用'?'success':v==='禁用'?'danger':'neutral'}">${esc(v)}</span>`;
 const avatar=row=>`<span class="account-avatar ${row.avatar||row.avatarImage?'':'is-empty'}" role="img" aria-label="${row.avatar||row.avatarImage?esc(row.name)+'的演示头像':'未设置头像'}">${row.avatarImage?`<img src="${esc(row.avatarImage)}" alt="">`:esc(row.avatar||'—')}</span>`;
 const options=key=>key==='gender'?['男','女','未知']:key==='status'?(section.id==='students'?['启用','禁用','已注销']:['启用','禁用']):key==='schools'?institutions:key==='role'?['运营管理员','超级管理员']:null;
 const cell=(row,key)=>key==='avatar'?avatar(row):key==='status'?status(row.status):['bio','notes'].includes(key)?`<span class="account-bio" title="${esc(value(row,key))}">${esc(value(row,key)||'—')}</span>`:esc(value(row,key)??'')||'—';
 function activate(){
  section=sections.find(s=>s.id===location.hash.slice(1))||sections[0];filters={};
  if(location.hash!=='#'+section.id)history.replaceState(null,'','#'+section.id);
  root.querySelectorAll('[data-section]').forEach(tab=>{const on=tab.dataset.section===section.id;tab.setAttribute('aria-selected',on);tab.tabIndex=on?0:-1;});
  panel.setAttribute('aria-labelledby','tab-'+section.id);AdminUI.setNavigationHeading(AdminUI.navigationFor());document.dispatchEvent(new Event('admin-section-change'));
  panel.innerHTML=`<div class="manage-heading"><div><h2 id="section-title">${section.title}</h2><p class="meta">查询${section.title}信息，管理账号状态及个人资料。</p></div></div>
   <form id="account-filters" class="card account-filters">${section.filters.map(key=>`<div class="form-group"><label for="account-filter-${key}">${labels[key]}</label>${options(key)?`<select id="account-filter-${key}" name="${key}"><option value="">全部${labels[key]}</option>${options(key).map(v=>`<option>${esc(v)}</option>`).join('')}</select>`:`<input type="search" id="account-filter-${key}" name="${key}" placeholder="请输入${labels[key]}">`}</div>`).join('')}<div class="account-filter-actions"><button type="reset" class="btn">重置</button><button type="submit" class="btn primary">查询</button></div></form>
   <div class="account-list-heading"><strong>${section.title}列表</strong>${section.id!=='students'?'<button type="button" class="btn primary account-new" id="account-new">＋ 新增账号</button>':''}<span class="meta" id="account-count" role="status"></span></div><div class="card table-wrap account-table-wrap" role="region" aria-label="${section.title}列表，可横向滚动" tabindex="0"><table class="account-table"><thead><tr>${section.columns.map(key=>`<th scope="col">${labels[key]}</th>`).join('')}<th scope="col" class="account-actions-cell">操作</th></tr></thead><tbody id="account-rows"></tbody></table></div><div class="card empty-state" id="account-empty" hidden><h2>没有匹配的${section.title}</h2><p>请调整条件，或点击重置恢复全部账号。</p><button type="button" class="btn" id="account-reset-empty">重置筛选</button></div><p class="meta" id="account-feedback" role="status"></p>`;
  const filterForm=panel.querySelector('#account-filters');
  filterForm.onsubmit=e=>{e.preventDefault();filters=Object.fromEntries([...new FormData(filterForm)].map(([key,v])=>[key,v.trim().toLowerCase()]));render();};
  filterForm.onreset=()=>{filters={};render();};panel.querySelector('#account-reset-empty').onclick=()=>filterForm.reset();render();
 }
 function render(){
  const rows=section.rows.filter(row=>Object.entries(filters).every(([key,v])=>!v||(['gender','status'].includes(key)?row[key]===v:key==='schools'?row.organizations.some(org=>org.name.toLowerCase()===v):String(value(row,key)||'').toLowerCase().includes(v))));
  panel.querySelector('#account-rows').innerHTML=rows.map(row=>`<tr data-account-id="${esc(row.id)}">${section.columns.map(key=>`<td class="account-cell-${key}">${cell(row,key)}</td>`).join('')}<td class="account-actions-cell"><div class="account-row-actions">${row.status==='已注销'?'':`<button type="button" class="account-action ${row.status==='启用'?'danger':''}" data-account-action="toggle">${row.status==='启用'?'禁用':'启用'}</button><button type="button" class="account-action" data-account-action="edit">编辑</button><button type="button" class="account-action danger" data-account-action="${section.id==='students'?'cancel':'delete'}">${section.id==='students'?'注销':'删除'}</button>`}${section.id==='admins'?'<button type="button" class="account-action" data-account-action="password">修改密码</button>':'<button type="button" class="account-action" data-account-action="detail">详情</button>'}</div></td></tr>`).join('');
  panel.querySelector('#account-count').textContent=`共 ${rows.length} 条 / 全部 ${section.rows.length} 个账号`;panel.querySelector('.account-table-wrap').hidden=!rows.length;panel.querySelector('#account-empty').hidden=!!rows.length;
 }
 root.querySelector('.tabs').addEventListener('click',e=>{const tab=e.target.closest('[data-section]');if(tab&&tab.dataset.section!==section.id){history.pushState(null,'','#'+tab.dataset.section);activate();tab.focus({preventScroll:true});}});
 root.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...root.querySelectorAll('[role=tab]')],index=tabs.indexOf(e.target);if(index<0)return;e.preventDefault();const target=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];target.click();target.focus({preventScroll:true});});
 window.addEventListener('hashchange',()=>{if(!modal.hidden)AdminUI.closeModal(modal);activate();});
 const pair=(label,v)=>`<div class="account-detail-pair"><dt>${label}</dt><dd>${v}</dd></div>`;
 function details(row){
  const orgColumns=section.id==='students'?[['name','机构名称'],['studentNo','学号'],['className','行政班级'],['major','专业'],['status','机构状态']]:[['name','机构名称'],['role','机构角色'],['status','机构状态']];
  return `<h3>基础信息</h3><dl class="account-details">${section.columns.map(key=>pair(labels[key],cell(row,key))).join('')}${section.columns.includes('orgCount')?'':pair('加入机构数',row.organizations.length)}</dl><h3>加入机构</h3>${row.organizations.length?`<div class="table-wrap account-org-wrap" tabindex="0" role="region" aria-label="加入机构列表，可横向滚动"><table><thead><tr>${orgColumns.map(([,label])=>`<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${row.organizations.map(org=>`<tr>${orgColumns.map(([key])=>`<td>${esc(org[key]||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<div class="account-no-org">暂未加入机构</div>'}${row.status==='已注销'?`<h3>注销信息</h3><dl class="account-details">${pair('注销类型',esc(row.cancellationType))}${pair('注销申请时间',esc(row.cancelledAt))}${pair('注销时间（生效）',esc(row.cancelledAt))}</dl>`:''}`;
 }
 function input(key,v='',required=false,readonly=false){
  const id='account-edit-'+key;
  return `<div class="form-group"><label for="${id}">${labels[key]}${required?' <span class="account-required">*</span>':''}</label><input id="${id}" name="${key}" value="${esc(v)}" ${required?'required':''} ${readonly?'readonly':''} ${key==='phone'?'type="tel" inputmode="numeric" maxlength="11"':key==='email'?'type="email"':key==='name'?'maxlength="50"':'maxlength="80"'} autocomplete="off"></div>`;
 }
 function select(key,selected){return `<div class="form-group"><label for="account-edit-${key}">${labels[key]}</label><select id="account-edit-${key}" name="${key}">${options(key).map(v=>`<option ${v===selected?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`;}
 function passwords(){return ['password','passwordConfirm'].map((key,i)=>`<div class="form-group"><label for="account-edit-${key}">${i?'确认密码':'密码'} <span class="account-required">*</span></label><div class="account-password-control"><input id="account-edit-${key}" name="${key}" type="password" autocomplete="new-password" required minlength="8" maxlength="64"><button type="button" data-password-toggle="${key}" aria-pressed="false">显示</button></div>${i?'':'<small>8–64 位，至少包含字母和数字。</small>'}</div>`).join('');}
 function newFields(){
  const now=timestamp();
  return `<div class="account-new-fields">${input('account','',true)}${input('name','',true)}${input('phone','',true)}${select('gender','未知')}${passwords()}${section.id==='admins'?select('role','运营管理员'):''}${select('status','启用')}${input('email')}${section.id==='teachers'?`<div class="form-group full"><label id="account-institution-label">所属机构</label><details class="account-institutions account-institution-select"><summary aria-labelledby="account-institution-label account-institution-summary"><span id="account-institution-summary">请选择所属机构（可多选）</span><span aria-hidden="true">⌄</span></summary><div class="account-institution-options"><input type="search" id="account-institution-search" aria-label="搜索所属机构" placeholder="搜索机构名称"><div class="account-institution-list">${institutions.map((name,i)=>`<label><input type="checkbox" name="institutions" value="${esc(name)}" id="account-institution-${i}">${esc(name)}</label>`).join('')}</div><p id="account-institution-empty" class="meta" hidden>没有匹配的机构</p></div></details><small id="account-institution-selection" class="account-institution-selection">尚未选择机构</small></div>${input('orgCount','0',false,true)}`:`<div class="form-group full"><label for="account-edit-notes">备注</label><textarea name="notes" id="account-edit-notes" maxlength="255" rows="3"></textarea></div>`}<div class="form-group full"><label for="account-edit-avatar">头像</label><div class="account-avatar-upload"><span id="account-avatar-preview">${avatar({name:'新账号'})}</span><input type="file" id="account-edit-avatar" name="avatarFile" accept=".jpg,.jpeg,.png,.gif,.bmp"></div><small>支持 JPG、JPEG、PNG、GIF、BMP，大小不超过 2 MB，仅本页预览。</small></div>${input('createdAt',now,false,true)}${input('updatedAt',now,false,true)}</div>`;
 }
 function open(row,type,button){
  current=row;action=type;avatarImage='';avatarPending=false;avatarInvalid=false;imageRequest++;error.textContent='';
  modal.classList.toggle('is-drawer',['detail','edit','new'].includes(type));confirm.hidden=type==='detail';confirm.disabled=type==='detail';
  document.querySelector('#account-cancel').textContent=type==='detail'?'关闭':'取消';
  document.querySelector('#account-modal-title').textContent=type==='detail'?section.person+'详情':type==='edit'?'编辑'+section.person:type==='new'?'新增'+section.title:type==='password'?'修改密码 · '+row.account:type==='toggle'?(row.status==='启用'?'禁用账号':'启用账号'):type==='cancel'?'注销警告':'删除警告';
  confirm.textContent=type==='edit'||type==='new'?'保存':type==='cancel'?'继续注销':type==='delete'?'继续删除':'确认';
  if(type==='detail')body.innerHTML=details(row);
  if(type==='edit')body.innerHTML=`<div class="risk-note">请核对账号信息后再更改。仅支持编辑姓名和手机号。</div><div class="account-edit-fields">${input('account',row.account,false,true)}${input('name',row.name,true)}${input('phone',row.phone,true)}</div>`;
  if(type==='new')body.innerHTML=newFields();
  if(type==='password')body.innerHTML=`<div class="risk-note">密码仅用于演示校验，不保存或实际修改账号密码。</div><div class="account-edit-fields">${passwords()}</div>`;
  if(type==='toggle')body.innerHTML=`<p>确认${row.status==='启用'?'禁用':'启用'}${section.person} <strong>${esc(row.name)}</strong> 的账号 <strong>${esc(row.account)}</strong>？</p><p class="meta">${row.status==='启用'?'禁用后本页账号状态变为“禁用”，可再次启用。':'启用后本页账号状态变为“启用”。'}</p>`;
  if(type==='cancel'||type==='delete')body.innerHTML=`<div class="risk-note"><strong>管理员${type==='cancel'?'注销':'删除'}账号警告</strong><p>${type==='cancel'?'确认后，账号将标记为“已注销”，不可继续编辑或启用；保留详情及注销时间供查看。':'确认后，该账号将从列表移除，不保留已删除状态。'}</p></div><p>操作对象：<strong>${esc(row.name)}</strong> · 账号名 <strong>${esc(row.account)}</strong></p><p class="meta">仅影响当前页演示记录，刷新恢复，不改变真实用户或数据。</p>`;
  body.scrollTop=0;AdminUI.openModal('account-modal',button);
 }
 panel.addEventListener('click',e=>{if(e.target.closest('#account-new')){open(null,'new',e.target.closest('button'));return;}const button=e.target.closest('[data-account-action]');if(button)open(section.rows.find(row=>row.id===button.closest('tr').dataset.accountId),button.dataset.accountAction,button);});
 body.addEventListener('click',e=>{const button=e.target.closest('[data-password-toggle]');if(!button)return;const input=form.elements[button.dataset.passwordToggle],show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'隐藏':'显示';button.setAttribute('aria-pressed',String(show));});
 body.addEventListener('input',e=>{if(e.target.id==='account-institution-search'){const query=e.target.value.trim().toLowerCase();body.querySelectorAll('.account-institution-list label').forEach(label=>label.hidden=!label.textContent.toLowerCase().includes(query));document.querySelector('#account-institution-empty').hidden=!!body.querySelector('.account-institution-list label:not([hidden])');}if(e.target.hasAttribute('aria-invalid')){e.target.removeAttribute('aria-invalid');e.target.removeAttribute('aria-describedby');error.textContent='';}});
 body.addEventListener('change',async e=>{
  if(e.target.name==='institutions'){const chosen=[...body.querySelectorAll('[name=institutions]:checked')].map(input=>input.value);form.elements.orgCount.value=chosen.length;document.querySelector('#account-institution-summary').textContent=chosen.length?'已选择 '+chosen.length+' 个机构':'请选择所属机构（可多选）';document.querySelector('#account-institution-selection').textContent=chosen.join('、')||'尚未选择机构';}
  if(e.target.id!=='account-edit-avatar')return;
  const token=++imageRequest,file=e.target.files[0];avatarImage='';avatarPending=false;avatarInvalid=false;confirm.disabled=false;error.textContent='';
  document.querySelector('#account-avatar-preview').innerHTML=avatar({name:'新账号'});
  if(!file)return;
  if(!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)||!['image/jpeg','image/png','image/gif','image/bmp','image/x-ms-bmp'].includes(file.type)||file.size>2*1024*1024){avatarInvalid=true;fail('account-edit-avatar','请选择不超过 2 MB 的 JPG、JPEG、PNG、GIF 或 BMP 图片。');return;}
  avatarPending=true;confirm.disabled=true;
  try{
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject();reader.readAsDataURL(file);});
   await new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=data;});
   if(token!==imageRequest)return;avatarImage=data;document.querySelector('#account-avatar-preview').innerHTML=avatar({name:'新账号',avatarImage});
  }catch{if(token===imageRequest){avatarInvalid=true;fail('account-edit-avatar','无法读取这张图片，请重新选择。');}}
  finally{if(token===imageRequest){avatarPending=false;confirm.disabled=false;}}
 });
 new MutationObserver(()=>{if(modal.hidden){imageRequest++;avatarPending=false;avatarImage='';form.querySelectorAll('[name=password],[name=passwordConfirm]').forEach(input=>input.value='');}}).observe(modal,{attributes:true,attributeFilter:['hidden']});
 function fail(id,message){error.textContent=message;const input=document.getElementById(id);if(input){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','account-error');input.focus();}return false;}
 function validateIdentity(name,phone){
  if(!name)return fail('account-edit-name','请填写姓名。');if(name.length>50)return fail('account-edit-name','姓名不能超过 50 个字符。');
  if(!/^1[3-9]\d{9}$/.test(phone))return fail('account-edit-phone','请填写有效的 11 位手机号。');
  if(sections.some(s=>s.rows.some(row=>row!==current&&row.status!=='已注销'&&row.phone===phone)))return fail('account-edit-phone','手机号已被其他账号使用。');return true;
 }
 function validatePassword(){const password=form.elements.password.value;if(password.length<8||password.length>64||!/[a-z]/i.test(password)||!/[0-9]/.test(password))return fail('account-edit-password','密码须为 8–64 位，并包含字母和数字。');if(password!==form.elements.passwordConfirm.value)return fail('account-edit-passwordConfirm','两次输入的密码不一致。');return true;}
 function complete(message){
  const id=current?.id,type=action==='edit'?'edit':section.id==='admins'?'password':'detail';AdminUI.closeModal(modal);render();
  const button=panel.querySelector(`[data-account-id="${id}"] [data-account-action="${type}"]`);(button||panel.querySelector('#account-new')||panel.querySelector('[type=submit]')).focus({preventScroll:true});
  panel.querySelector('#account-feedback').textContent=message+'；仅本页生效，刷新恢复。';AdminUI.toast(message,'账号演示记录已更新。');
 }
 form.onsubmit=e=>{
  e.preventDefault();error.textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>{input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');});
  if(action==='detail'||(current?.status==='已注销'))return;
  if(action==='cancel'||action==='delete'){
   const text=action==='cancel'?'确认注销':'确认删除';action='confirm-'+action;document.querySelector('#account-modal-title').textContent=text;confirm.textContent=text;
   body.innerHTML=`<p>正在${text.slice(2)}账号：<strong>${esc(current.account)}</strong>（${esc(current.name)}）</p><div class="form-group"><label for="account-cancel-text">请输入“<strong class="account-required">${text}</strong>”以确认此操作</label><input id="account-cancel-text" name="confirmation" placeholder="请输入${text}" autocomplete="off" required></div>`;document.querySelector('#account-cancel-text').focus();return;
  }
  if(action==='confirm-cancel'||action==='confirm-delete'){
   const text=action==='confirm-cancel'?'确认注销':'确认删除';if(form.elements.confirmation.value!==text){fail('account-cancel-text','请输入完整的“'+text+'”。');return;}
   if(action==='confirm-delete'){section.rows.splice(section.rows.indexOf(current),1);complete('账号已删除');}
   else{current.status='已注销';current.cancelledAt=timestamp();current.updatedAt=current.cancelledAt;current.cancellationType='管理员注销';complete('账号已注销');}return;
  }
  if(action==='new'||action==='edit'){
   const name=form.elements.name.value.trim(),phone=form.elements.phone.value.trim();if(!validateIdentity(name,phone))return;
   if(action==='new'){
    const account=form.elements.account.value.trim(),email=form.elements.email.value.trim();
    if(!account){fail('account-edit-account','请填写账号名。');return;}
    if(sections.some(s=>s.rows.some(row=>row.account.toLowerCase()===account.toLowerCase()))){fail('account-edit-account','账号名已存在，请使用其他账号名。');return;}
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){fail('account-edit-email','请填写有效的邮箱。');return;}
    if(avatarPending||avatarInvalid){fail('account-edit-avatar',avatarPending?'头像仍在读取，请稍后保存。':'请重新选择有效头像，或清空头像。');return;}
    if(!validatePassword())return;
    const organizations=[...body.querySelectorAll('[name=institutions]:checked')].map(input=>({name:input.value,role:'教师',status:'已加入'})),now=timestamp();
    current={id:'LOCAL-'+nextId++,account,name,phone,gender:form.elements.gender.value,status:form.elements.status.value,email,role:section.id==='teachers'?'教师':form.elements.role.value,notes:form.elements.notes?.value.trim()||'',avatarImage,avatar:'',organizations,createdAt:now,updatedAt:now};section.rows.push(current);complete(section.person+'账号已新增');
   }else{current.name=name;current.phone=phone;current.updatedAt=timestamp();complete(section.person+'信息已保存');}return;
  }
  if(action==='password'){if(!validatePassword())return;current.updatedAt=timestamp();complete('密码修改演示已完成');return;}
  if(action==='toggle'){current.status=current.status==='启用'?'禁用':'启用';current.updatedAt=timestamp();complete('账号已'+current.status);}
 };
 function timestamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());}
 activate();
})();
