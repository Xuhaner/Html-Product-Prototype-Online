/* Class list, team and learning records. All mutations are page-local demos. */
(function(){
 'use strict';
 const {isSuper,toast,openModal,closeModal}=AdminUI;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const root=document.querySelector('#management-root'),modal=document.querySelector('#record-modal'),form=document.querySelector('#record-form'),fields=document.querySelector('#record-fields');
 const child=document.querySelector('#attendance-editor'),childForm=document.querySelector('#attendance-form');
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
 const terms=['2026–2027 第一学期','2025–2026 第二学期'];
 const courses=isSuper?[...AdminTeaching.courses,'AI 办公效率提升']:AdminTeaching.courses;
 const teacherPool=['陈若云','李明','周宁','韩宁'];
 let classes=AdminTeaching.classes.filter(c=>isSuper||c.teacher==='陈若云').map((c,i)=>({...c,term:terms[0],created:`2026-09-${String(29-i*4).padStart(2,'0')}`,guest:c.id==='CLS-AI02',team:[{name:c.teacher,role:'创建者',school:c.school}],attendance:[{id:'att-1',name:'1009考勤',date:'2026-10-09',start:'09:00',end:'09:10',marks:{}}]}));
 let students=AdminTeaching.students.filter(s=>classes.some(c=>c.id===s.classId)).map((s,i)=>({...s,logins:i===1?0:14-i,views:i===1?0:1+i%3,complete:i===1?0:33+i%3*25,effective:i===1?0:698+i*75,stay:i===1?0:710+i*75,speed:1,quiz:65+i*5,exam:55+i*7}));
 classes.forEach(c=>students.filter(s=>s.classId===c.id).forEach((s,i)=>c.attendance[0].marks[s.student]=i===0?'出勤':'缺勤'));
 const icons={
  team:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
  login:'<path d="M3 4h18v13H3zM8 22l4-5 4 5M7 12l4-4 3 3 4-5"/>',
  video:'<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3"/>',
  attendance:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M7 15h3M14 15h3M7 18h3"/>',
  warning:'<circle cx="12" cy="12" r="9"/><path d="M12 6v7M12 16v2"/>',
  edit:'<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
  delete:'<path d="M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>'
 };
 const actions=[['team','班级团队','♟','blue'],['login','登录统计','▥','green'],['video','视频统计','▻','neutral'],['attendance','考勤','▦','amber'],['edit','编辑','✎','amber'],['delete','删除','⌫','red']];
 let section=location.hash==='#students'?'students':'classes',page=1,size=10,view='list',sort='',ascending=true,filters={term:terms[0],course:'',name:'',student:'',guest:false};
 let current=null,mode='',detailQuery='',detailPage=1,detailSize=10,detailSort='',detailAscending=true,teamPanel='',range=7,allAttendance=false,selectedAttendance='',analyzed=false,coefficients=[1,1,1,1],uploadName='',selected=new Set(),childMode='';
 const roster=c=>students.filter(s=>s.classId===c.id);
 const match=(value,q)=>String(value).toLowerCase().includes(q.trim().toLowerCase());
 const options=(values,value,placeholder)=>`${placeholder!==undefined?`<option value="">${esc(placeholder)}</option>`:''}${values.map(v=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(v)}</option>`).join('')}`;
 const button=(label,attrs='',kind='')=>`<button type="button" class="btn ${kind}" ${attrs}>${label}</button>`;
 const input=(name,label,value='',type='text',extra='')=>`<div class="form-group"><label for="class-${name}">${label}</label><input id="class-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;
 const select=(name,label,values,value,placeholder)=>`<div class="form-group"><label for="class-${name}">${label}</label><select id="class-${name}" name="${name}">${options(values,value,placeholder)}</select></div>`;
 const table=(heads,rows,id='')=>`<div class="table-wrap class-table" tabindex="0" role="region" aria-label="${esc(mode?actions.find(a=>a[0]===mode)?.[1]||'学生名册':'班级列表')}"><table ${id?`id="${id}"`:''}><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${heads.length}" class="class-empty">暂无匹配记录</td></tr>`}</tbody></table></div>`;
 const cells=values=>`<tr>${values.map(v=>`<td>${v}</td>`).join('')}</tr>`;
 function pager(total,p,n,prefix){const pages=Math.max(1,Math.ceil(total/n));return `<div class="pagination class-pagination"><span>共 ${total} 条，第 ${p} / ${pages} 页</span><div class="class-pager"><select aria-label="每页条数" data-size="${prefix}">${[5,10,20].map(s=>`<option ${s===n?'selected':''} value="${s}">${s}条/页</option>`).join('')}</select>${button('‹',`data-page="${p-1}" data-pager="${prefix}" ${p<=1?'disabled':''}`)}${Array.from({length:pages},(_,i)=>button(i+1,`data-page="${i+1}" data-pager="${prefix}" aria-label="第${i+1}页" ${i+1===p?'aria-current="page"':''}`,i+1===p?'primary':'')).join('')}${button('›',`data-page="${p+1}" data-pager="${prefix}" ${p>=pages?'disabled':''}`)}</div></div>`;}
 function csv(name,headers,rows){
  // Prevent spreadsheet formula execution in exported user-entered names.
  const cell=v=>'"'+String(/^[=+@\-\t\r]/.test(String(v))?"'"+v:v??'').replace(/"/g,'""')+'"';
  const blob=new Blob(['\ufeff'+[headers,...rows].map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function renderShell(){
  if(location.hash!=='#'+section)history.replaceState(null,'','#'+section);
  AdminUI.setNavigationHeading(AdminUI.navigationFor('#'+section));
  root.className='class-management';
  root.innerHTML=`<div class="tabs" role="tablist" aria-label="班级管理">${['classes','students'].map((s,i)=>`<button class="tab" role="tab" aria-selected="${s===section}" tabindex="${s===section?0:-1}" aria-controls="class-panel" id="class-tab-${s}" data-section="${s}">${['班级列表','学生名册'][i]}</button>`).join('')}</div><section id="class-panel" role="tabpanel" aria-labelledby="class-tab-${section}"><div class="card class-list-card"><div class="manage-heading"><h2>${section==='classes'?'班级列表':'学生名册'}</h2><div class="inline-actions">${section==='classes'?button('＋ 新建班级','id="class-create"','primary')+button('新手指南','data-guide')+`<div class="class-view" aria-label="视图">${['auto','grid','list'].map((v,i)=>button(['自动','▦','☷'][i],`data-view="${v}" aria-label="${['自动视图','卡片视图','列表视图'][i]}" aria-pressed="${view===v}"`)).join('')}</div>`:button('导出名册','data-roster-export')}</div></div><form id="class-filters" class="class-filters"><select name="term" aria-label="学期">${options(terms,filters.term,'全部学期')}</select><select name="course" aria-label="课程">${options(courses,filters.course,'全部课程')}</select><input name="name" aria-label="班级名称" placeholder="请输入班级名称" value="${esc(filters.name)}"><input name="student" aria-label="学生姓名或学号" placeholder="请输入学生姓名/学号" value="${esc(filters.student)}">${section==='classes'?`<label class="class-check"><input type="checkbox" name="guest" ${filters.guest?'checked':''}>显示访客班级</label>`:''}<button type="submit" class="btn primary">查找</button><button type="button" class="btn" data-reset>重置</button></form><div id="class-results"></div></div><p class="meta class-demo-note">本页演示 · 修改刷新后恢复；统计为独立示例，不与学生端同步。</p></section>`;
  root.querySelector('#class-filters').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);filters=Object.fromEntries(data);filters.guest=data.has('guest');page=1;selected.clear();renderList();};
  renderList();document.dispatchEvent(new Event('admin-section-change'));
 }
 function filteredClasses(){return classes.filter(c=>(!filters.term||c.term===filters.term)&&(!filters.course||c.course===filters.course)&&match(c.name,filters.name)&&(!filters.student||roster(c).some(s=>match(s.name+' '+s.student,filters.student)))&&(filters.guest||!c.guest));}
 function rowActions(c){return `<div class="class-row-actions">${actions.map(([key,label,icon,color])=>button(`<span aria-hidden="true"><svg viewBox="0 0 24 24" class="class-action-icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[key]}</svg></span><span>${label}</span>`,`data-action="${key}" data-id="${esc(c.id)}" aria-label="${label}" title="${label}"`,color+' small')).join('')}</div>`;}
 function renderList(){
  const target=root.querySelector('#class-results');
  if(section==='students'){
   const own=classes.filter(c=>(!filters.term||c.term===filters.term)&&(!filters.course||c.course===filters.course)&&match(c.name,filters.name));
   const data=students.filter(s=>own.some(c=>c.id===s.classId)&&match(s.name+' '+s.student,filters.student));page=Math.min(page,Math.max(1,Math.ceil(data.length/size)));
   target.innerHTML=table(['学号','姓名','班级名称','课程','完成课时','状态'],data.slice((page-1)*size,page*size).map(s=>cells([esc(s.student),esc(s.name),esc(classes.find(c=>c.id===s.classId)?.name),esc(s.course),esc(s.progress),esc(s.status)])),'class-roster')+pager(data.length,page,size,'main');return;
  }
  let data=filteredClasses();if(sort)data.sort((a,b)=>(sort==='count'?roster(a).length-roster(b).length:String(a[sort]).localeCompare(String(b[sort]),'zh-CN'))*(ascending?1:-1));
  page=Math.min(page,Math.max(1,Math.ceil(data.length/size)));const shown=data.slice((page-1)*size,page*size);
  const sortHead=(key,label)=>button(label+(sort===key?(ascending?' ↑':' ↓'):' ↕'),`data-sort="${key}"`,'link');
  const list=table([`<input type="checkbox" aria-label="选择本页班级" data-select-all ${shown.length&&shown.every(c=>selected.has(c.id))?'checked':''} ${!shown.length?'disabled':''}>`,'班级名称','课程名称',sortHead('count','班级名单'),'学期',sortHead('created','创建时间'),'操作'],shown.map(c=>cells([`<input type="checkbox" aria-label="选择${esc(c.name)}" data-select="${esc(c.id)}" ${selected.has(c.id)?'checked':''}>`,`<strong>${esc(c.name)}</strong>${c.guest?'<small class="meta">访客班级</small>':''}`,esc(c.course),button(roster(c).length,`data-action="roster" data-id="${esc(c.id)}" aria-label="查看${esc(c.name)}名册"`,'link'),esc(c.term),esc(c.created),rowActions(c)])),'class-list-table');
  const grid=`<div class="class-grid">${shown.map(c=>`<article class="card class-tile"><div class="class-tile-mark">◎</div><h3>${esc(c.name)}</h3><p>${esc(c.course)}</p><p class="meta">${esc(c.term)} · ${esc(c.created)}</p>${button(roster(c).length+' 位学生',`data-action="roster" data-id="${esc(c.id)}"`,'link')}${rowActions(c)}</article>`).join('')||'<p class="class-empty">暂无匹配班级，请重置筛选。</p>'}</div>`;
  target.innerHTML=`<div class="class-result-note"><span>共 ${data.length} 个班级${selected.size?' · 已选择 '+selected.size+' 个':''}</span></div><div class="class-list-view ${view==='auto'?'class-auto-list':''}" ${view==='grid'?'hidden':''}>${list}</div><div class="class-grid-view ${view==='auto'?'class-auto-grid':''}" ${view==='list'?'hidden':''}>${grid}</div>${pager(data.length,page,size,'main')}`;
 }
 function title(text,description='',large=false){document.querySelector('#record-title').textContent=text;document.querySelector('#record-description').textContent=description;modal.classList.toggle('class-wide',large);document.querySelector('#record-error').textContent='';fields.className='class-modal-content';document.querySelector('#record-save').hidden=true;}
 function show(kind,c,trigger){
  current=c||null;mode=kind;detailQuery='';detailPage=1;detailSize=10;detailSort='';detailAscending=true;teamPanel='';range=7;allAttendance=false;selectedAttendance=c?.attendance[0]?.id||'';analyzed=false;coefficients=[1,1,1,1];uploadName='';renderModal();openModal('record-modal',trigger);
 }
 function renderModal(){
  if(['create','edit'].includes(mode))return renderEdit();
  if(mode==='guide'){title('班级使用指南');fields.innerHTML='<ol class="class-guide"><li>新建班级：选择课程、填写名称与学期；可下载 Excel 可打开的 CSV 名单模板。</li><li>班级团队：添加教师或移除协作成员；创建者保留。</li><li>登录与视频统计：查看独立示例、筛选学生并导出 CSV。</li><li>考勤：开启、修改、删除考勤项，点击记录切换出勤状态。</li></ol><p class="meta">Excel 选取仅登记文件名，不解析或新增学生；所有修改刷新后恢复。</p>';return;}
  if(mode==='delete'){title('删除班级',current.name);fields.innerHTML=`<p>确定删除「${esc(current.name)}」？本页该班级、名册、团队和考勤演示记录将一并移除。</p><p class="meta">刷新后恢复初始示例，不影响真实班级。</p>`;document.querySelector('#record-save').hidden=false;document.querySelector('#record-save').textContent='确认删除';return;}
  if(mode==='team')return renderTeam();
  const label=mode==='video'?'视频观看明细':mode==='attendance'?'考勤明细':mode==='warning'?'学情预警':mode==='roster'?'班级名单':'登录统计';
  title(label,current.name+' · '+current.course+' · '+current.term,true);
  if(mode==='login'){renderLogin();return;}
  if(mode==='warning'){renderWarning();return;}
  const search=`<input type="search" id="detail-search" placeholder="学生名字/学号" aria-label="搜索学生" value="${esc(detailQuery)}">${button('查找','data-detail-search','primary')}${button('刷新','data-detail-reset')}`;
  if(mode==='video')fields.innerHTML=`<div class="class-metrics" id="video-metrics"></div><section class="class-chart-card"><div class="class-detail-tools"><h3>观看数据</h3>${search}${button('↓ 导出','data-export="video"','primary')}<span class="class-legend">≥80%　40–79%　&lt;40%　— 未观看</span></div><div id="detail-results"></div></section>`;
  if(mode==='roster')fields.innerHTML=`<div class="class-detail-tools">${search}${button('导出','data-export="roster"','primary')}</div><div id="detail-results"></div>`;
  if(mode==='attendance')fields.innerHTML=`<div class="class-detail-tools">${search}<label class="class-check"><input type="checkbox" id="all-attendance" ${allAttendance?'checked':''}>全部考勤</label><div class="class-tools-right">${button('开启考勤','data-att="create"','primary')}${button('修改考勤项','data-att="edit"','amber')}${button('删除考勤项','data-att="delete"','danger')}${button('导出','data-export="attendance"','primary')}</div></div><p class="meta">选择表头的考勤项；点击学生状态可切换出勤、缺勤、请假。</p><div id="detail-results"></div>`;
  if(mode==='video')renderVideoMetrics();renderDetailRows();
 }
 function renderEdit(){
  const c=current||{};title(mode==='create'?'新建班级':'编辑班级',mode==='create'?'填写班级基本信息':c.name);
  fields.className='form-grid';fields.innerHTML=`<div class="form-group full">${select('course','隶属课程 *',courses,c.course||'','请选择课程')}</div>${input('name','班级名称 *',c.name||'','text','maxlength="80"')}${select('term','开学学期 *',terms,c.term||terms[0])}${mode==='create'?`<div class="form-group full"><label>学生名单</label><div>${button('班级名单模板下载（CSV）','data-template','primary')}</div><label class="class-upload" id="class-drop" tabindex="0" for="class-file"><span class="class-upload-icon">⇧</span><strong>将 Excel 文件拖到此处，或点击选择</strong><small>支持 .xlsx / .xls · 仅登记文件名，不解析名单</small><input type="file" id="class-file" accept=".xlsx,.xls" class="sr-only"><span id="class-file-name" role="status"></span></label></div>`:''}`;
  document.querySelector('#record-save').hidden=false;document.querySelector('#record-save').textContent='确定';
 }
 function renderTeam(){
  title('教学团队','管理班级教师和助教 · '+current.name,true);
  fields.innerHTML=`<div class="class-detail-tools"><h3>班级团队</h3><div class="class-tools-right">${button(teamPanel==='add'?'关闭成员':'添加教师','data-team-panel="add"','primary')}${button(teamPanel==='remove'?'取消移除':'移除教师','data-team-panel="remove"','danger')}</div></div><div class="class-team-layout"><div class="class-team-cards">${current.team.map((t,i)=>`<article class="class-member ${i===0?'creator':''}"><div class="class-member-avatar">${i===0?'<span class="class-crown" aria-hidden="true">♛</span>':''}${esc(t.name.slice(0,1))}</div><strong>${esc(t.name)}</strong><span class="status ${i===0?'warning':'info'}">${esc(t.role)}</span><small>${esc(t.school)}</small>${teamPanel==='remove'&&i>0?button('移除',`data-remove-teacher="${i}"`,'danger'):''}</article>`).join('')}</div>${teamPanel==='add'?`<aside class="class-team-pool"><h4>从教学团队选择</h4>${teacherPool.filter(n=>!current.team.some(t=>t.name===n)).map(n=>`<div><span>${esc(n)}</span>${button('＋',`data-add-teacher="${n}" aria-label="添加${n}"`,'primary')}</div>`).join('')||'<p>全部成员已添加</p>'}</aside>`:''}</div>${teamPanel==='remove'&&current.team.length===1?'<p class="meta">创建者不可移除，当前没有其他成员。</p>':''}`;
 }
 const duration=n=>n?Math.floor(n/60)+'分'+n%60+'秒':'—';
 function metrics(items){return items.map(([value,label],i)=>`<article class="class-metric"><span class="class-metric-icon tone-${i%4}" aria-hidden="true">${['♙','▻','✓','◷'][i%4]}</span><div><strong>${esc(value)}</strong><small>${label}</small></div></article>`).join('');}
 function renderVideoMetrics(){const data=roster(current),watched=data.filter(s=>s.views),mean=key=>watched.length?Math.round(watched.reduce((n,s)=>n+s[key],0)/watched.length):0;document.querySelector('#video-metrics').innerHTML=metrics([[data.length,'学生人数'],[3,'视频数量'],[data.length?Math.round(data.reduce((n,s)=>n+s.complete,0)/data.length)+'%':'—','平均完播率'],[duration(mean('effective')),'平均有效观看'],[duration(mean('stay')),'平均页面停留'],[watched.length?'1.0x':'—','平均倍速'],[data.reduce((n,s)=>n+s.views,0),'总观看次数'],['35分0秒','视频总时长']]);}
 function detailData(){let data=roster(current).filter(s=>match(s.student+' '+s.name,detailQuery));if(detailSort)data.sort((a,b)=>(typeof a[detailSort]==='number'?a[detailSort]-b[detailSort]:String(a[detailSort]).localeCompare(String(b[detailSort]),'zh-CN'))*(detailAscending?1:-1));return data;}
 function attendanceItems(){return current.attendance.filter(a=>allAttendance||a.date===today()||a.id===selectedAttendance);}
 function renderDetailRows(){
  const data=detailData();detailPage=Math.min(detailPage,Math.max(1,Math.ceil(data.length/detailSize)));const shown=data.slice((detailPage-1)*detailSize,detailPage*detailSize);
  const sortable=(key,label)=>button(label+(detailSort===key?(detailAscending?' ↑':' ↓'):' ↕'),`data-detail-sort="${key}"`,'link');let heads,rows;
  if(mode==='video'){
   heads=[sortable('student','学号'),sortable('name','姓名'),'已看视频','观看天数',sortable('views','观看次数'),sortable('complete','平均完播率'),'有效观看时长','页面停留时长','平均倍速'];
   rows=shown.map(s=>cells([esc(s.student),`<span class="class-student-avatar">${esc(s.name.slice(0,1))}</span>${esc(s.name)}`,s.views?Math.min(3,s.views)+'/3':'0/3',s.views?1:0,s.views,s.views?`<div class="class-progress"><span style="width:${s.complete}%;background:${s.complete>=80?'#19875a':s.complete>=40?'#dc9b32':'#e26369'}"></span></div><strong>${s.complete}%</strong>`:'—',duration(s.effective),duration(s.stay),s.views?s.speed+'x':'—']));
  }else if(mode==='attendance'){
   const items=attendanceItems();heads=[sortable('student','学号'),'姓名',...items.map(a=>button(esc(a.name),`data-att-select="${esc(a.id)}" ${a.id===selectedAttendance?'aria-current="true"':''}`,'link'))];
   rows=shown.map(s=>cells([esc(s.student),esc(s.name),...items.map(a=>{const mark=a.marks[s.student]||'未签到';return button(mark==='出勤'?'✓ 出勤':mark,`data-mark="${esc(a.id)}" data-student="${esc(s.student)}" aria-label="${esc(s.name)} ${esc(a.name)} ${mark}"`,mark==='出勤'?'primary small':mark==='缺勤'?'danger small':'small');})]));
  }else{heads=['学号','姓名','完成课时','状态'];rows=shown.map(s=>cells([esc(s.student),esc(s.name),esc(s.progress),esc(s.status)]));}
  document.querySelector('#detail-results').innerHTML=table(heads,rows,'class-detail-table')+(mode==='attendance'&&!attendanceItems().length?'<p class="meta">暂无考勤项，点击“开启考勤”添加。</p>':'')+pager(data.length,detailPage,detailSize,'detail');
 }
 function bars(labels,values,colors){const max=Math.max(...values,1);return `<div class="class-bars" role="img" aria-label="${esc(labels.map((v,i)=>v+' '+values[i]).join('，'))}">${labels.map((label,i)=>`<div class="class-bar"><strong>${values[i]}</strong><span style="height:${Math.max(2,values[i]/max*160)}px;background:${colors?.[i]||'#2dc0c4'}"></span><small>${esc(label)}</small></div>`).join('')}</div>`;}
 function donut(titleText,labels,values){const total=values.reduce((a,b)=>a+b,0),colors=['#2dc0c4','#a997d3','#57aaeb','#ffb28d'];let start=0;const stops=values.map((v,i)=>{const from=start;start+=v/total*100;return `${colors[i%4]} ${from}% ${start}%`;}).join(',');return `<div class="class-donut-block"><h4>${titleText}</h4><div class="class-donut" style="background:conic-gradient(${stops})" role="img" aria-label="${esc(labels.map((l,i)=>l+' '+Math.round(values[i]/total*100)+'%').join('，'))}"><span>${total}</span></div><div class="class-donut-legend">${labels.map((l,i)=>`<span><i style="background:${colors[i%4]}"></i>${esc(l)} ${Math.round(values[i]/total*100)}%</span>`).join('')}</div></div>`;}
 function renderLogin(){
  const data=roster(current),active=data.filter(s=>s.logins>0),mult=range===7?1:range===30?3:8;
  fields.innerHTML=`<div class="class-login-summary">${metrics([[data.length,'班级总人数'],[active.length,'已登录'],[data.length-active.length,'未登录']])}</div><div class="class-detail-tools">${button('↓ 导出未登录名单','data-export="unlogged"','danger')}<div class="class-tools-right"><label for="login-range">统计周期</label><select id="login-range">${[7,30,90].map(n=>`<option value="${n}" ${range===n?'selected':''}>最近 ${n} 天</option>`).join('')}</select></div></div><section class="class-chart-card"><h3>班级学生登录次数（最近 ${range} 天）</h3>${bars(data.map(s=>s.name),data.map(s=>s.logins*mult))}</section><div class="class-chart-grid"><section class="class-chart-card"><h3>登录状态</h3>${bars(['班级总人数','已登录','未登录'],[data.length,active.length,data.length-active.length],['#439aff','#57be12','#ff5260'])}</section><section class="class-chart-card"><h3>班级学生登录时段矩阵图</h3><div class="class-heat-labels"><span>00:00</span><span>08:00</span><span>16:00</span><span>24:00</span></div><div class="class-heat">${Array.from({length:7},(_,d)=>`<span class="class-heat-day">${['一','二','三','四','五','六','日'][d]}</span>${Array.from({length:24},(_,h)=>{const count=active.length&&(h>=8&&h<=20)?(d*3+h*mult)%5:0;return `<span style="background:${['#e9ecef','#e6f2ff','#c8e3ff','#91c8ff','#439aff'][count]}" title="周${'一二三四五六日'[d]} ${h}:00 · ${count} 次示例登录"></span>`;}).join('')}`).join('')}</div></section></div><section class="class-chart-card"><h3>班级学生登录终端分布图</h3><div class="class-chart-grid">${donut('设备分布',['Windows 10/11','Android','iPhone','Mac'],[84,8,5,3])}${donut('浏览器分布',['Chrome','微信','Safari','Edge'],[88,4,3,5])}</div></section><section class="class-chart-card"><h3>班级学生登录目的地（功能区域）分布图</h3><div class="class-chart-grid">${bars(['挑战题库','OJ 练习','学城课堂','工坊'],[12,35,126,4].map(n=>n*mult))}${donut('访问占比',['挑战题库','OJ 练习','学城课堂','工坊'],[12,35,126,4].map(n=>n*mult))}</div></section><section class="class-chart-card"><h3>TOP榜</h3><p class="meta">早鸟同学与夜猫子以北京时间凌晨 5 点作为一天的分界；以下均为预置示例。</p><div class="class-rank-grid">${['活跃榜','潜水榜','早鸟同学','夜猫子','健忘王（登录失败次数最多）','课程最近访问情况'].map((label,i)=>{
   const list=[...data].sort((a,b)=>i===1?a.logins-b.logins:b.logins-a.logins).slice(0,5);const headers=i<2?['用户名','姓名','登录次数','访问本课程次数']:i===2?['用户名','姓名','最早登录时间','平均登录时间']:i===3?['用户名','姓名','最晚登录时间','平均登录时间']:i===4?['用户名','姓名','登录失败次数','最近登录时间']:['用户名','姓名','最近访问时间'];
   const rows=list.map((s,j)=>cells([esc(s.student),esc(s.name),...(i<2?[s.logins*mult,s.views*mult]:i===2?['2026-10-09 05:57','05:57:00']:i===3?['2026-10-09 22:18','22:18:00']:i===4?[3+j,'2026-10-09 09:30']:['2026-10-09 09:30'])]));return `<article><h4>${label}</h4>${table(headers,rows)}</article>`;
  }).join('')}</div></section>`;
 }
 function attendanceScore(s){const items=current.attendance;return items.length?items.reduce((n,a)=>n+(a.marks[s.student]==='出勤'?100:a.marks[s.student]==='请假'?80:0),0)/items.length:0;}
 function prediction(s){const [a,e,q,total]=coefficients;return Math.min(100,Math.max(0,(attendanceScore(s)*a+s.exam*e+s.quiz*q)/(a+e+q)*total));}
 function renderWarning(){
  fields.innerHTML=`<div class="class-warning-note">⚠ 本地预警演示，预测结果仅供参考，不代表真实成绩或模型分析。</div><div class="class-detail-tools"><select disabled aria-label="预警学期">${options([current.term],current.term)}</select><select disabled aria-label="预警课程">${options([current.course],current.course)}</select><select disabled aria-label="预警班级">${options([current.name],current.name)}</select>${button('获取 / 刷新','data-warning-refresh','primary')}${button('文件下载','data-export="warning"','primary')}<label class="btn primary" for="warning-file">文件上传<input class="sr-only" type="file" id="warning-file" accept=".xlsx,.xls,.csv"></label>${button('分析','data-analyze','primary')}</div><p id="warning-file-name" class="meta" role="status">${esc(uploadName)}</p><div class="class-coefficients">${['出勤难度系数','考试难度系数','测验难度系数','难度系数（总）'].map((label,i)=>`<div><label for="coefficient-${i}">${label}</label><div><input id="coefficient-${i}" type="range" min="0.1" max="3" step="0.1" value="${coefficients[i]}" data-coefficient="${i}"><input type="number" min="0.1" max="3" step="0.1" value="${coefficients[i]}" data-coefficient="${i}" aria-label="${label}数值"></div></div>`).join('')}</div><p class="meta" id="warning-state" role="status">${analyzed?'已按当前系数生成本地参考结果。':'调节系数后点击“分析”；文件只登记名称，不导入数据。'}</p><div id="warning-results"></div>`;renderWarningRows();
 }
 function renderWarningRows(){const data=roster(current);detailPage=Math.min(detailPage,Math.max(1,Math.ceil(data.length/detailSize)));document.querySelector('#warning-results').innerHTML=table(['学号','姓名','考勤百分制成绩','测验百分制平均分','考试百分制平均分','期末考试成绩预测'],data.slice((detailPage-1)*detailSize,detailPage*detailSize).map(s=>{const n=prediction(s);return cells([esc(s.student),esc(s.name),attendanceScore(s).toFixed(2),s.quiz.toFixed(2),s.exam.toFixed(2),analyzed?`<span class="status ${n<60?'danger':n<80?'warning':'success'}">${n.toFixed(2)} · ${n<60?'高风险':n<80?'需关注':'正常'}</span>`:'—']);}),'class-warning-table')+pager(data.length,detailPage,detailSize,'warning');}
 function openAttendanceEditor(kind){
  childMode=kind;const a=current.attendance.find(a=>a.id===selectedAttendance)||current.attendance[0];
  if(kind!=='create'&&!a){toast('暂无考勤项','请先开启考勤。');return;}
  selectedAttendance=a?.id||'';document.querySelector('#attendance-editor-title').textContent={create:'开启考勤',edit:'修改考勤',delete:'删除考勤项'}[kind];document.querySelector('#attendance-error').textContent='';
  const choose=kind==='create'?'':`<div class="form-group full"><label for="attendance-original">原考勤项 *</label><select id="attendance-original" name="original">${current.attendance.map(a=>`<option value="${esc(a.id)}" ${a.id===selectedAttendance?'selected':''}>${esc(a.name)} · ${esc(a.date)}</option>`).join('')}</select></div>`;
  document.querySelector('#attendance-fields').innerHTML=choose+(kind==='delete'?'<p class="form-group full">确定删除所选考勤项及其学生签到记录？仅影响本页演示。</p>':input('att-name','考勤项名称 *',kind==='edit'?a.name:'','text','maxlength="40"')+input('att-date','日期 *',kind==='edit'?a.date:today(),'date')+input('att-start','起止时间 *',kind==='edit'?a.start:'09:00','time')+input('att-end','结束时间',kind==='edit'?a.end:'','time')+'<p class="form-group full meta" id="attendance-hint">只设开始时间时，结束时间默认 +10 分钟；已过期考勤只允许修改名称。</p>');
  if(kind==='edit')fillAttendance(a);child.showModal();
 }
 function expired(a){return a.date<today()||(a.date===today()&&a.end<new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()));}
 function fillAttendance(a){['name','date','start','end'].forEach(key=>childForm.elements['att-'+key].value=a[key]);['date','start','end'].forEach(key=>childForm.elements['att-'+key].disabled=expired(a));}
 function exportCurrent(kind){
  const data=kind==='unlogged'?roster(current).filter(s=>!s.logins):kind==='warning'?roster(current):detailData();let headers=['学号','姓名'],rows;
  if(kind==='video'){headers.push('已看视频','观看次数','平均完播率','有效观看秒数','页面停留秒数','平均倍速');rows=data.map(s=>[s.student,s.name,Math.min(s.views,3),s.views,s.complete,s.effective,s.stay,s.speed]);}
  else if(kind==='attendance'){const items=attendanceItems();headers.push(...items.map(a=>a.name));rows=data.map(s=>[s.student,s.name,...items.map(a=>a.marks[s.student]||'未签到')]);}
  else if(kind==='warning'){headers.push('考勤百分制成绩','测验平均分','考试平均分','成绩预测（演示）');rows=data.map(s=>[s.student,s.name,attendanceScore(s).toFixed(2),s.quiz,s.exam,analyzed?prediction(s).toFixed(2):'未分析']);}
  else rows=data.map(s=>[s.student,s.name]);csv(current.name+'-'+kind,headers,rows);
 }
 function fail(message,key,error='#record-error',target=form){document.querySelector(error).textContent=message;target.elements[key]?.focus();return false;}
 form.onsubmit=e=>{
  e.preventDefault();if(mode==='delete'){const id=current.id;classes=classes.filter(c=>c.id!==id);students=students.filter(s=>s.classId!==id);selected.delete(id);closeModal(modal);renderList();root.querySelector('#class-create')?.focus();toast('已删除班级','刷新后恢复初始示例。');return;}
  if(!['create','edit'].includes(mode))return;
  const data=Object.fromEntries(new FormData(form));data.name=data.name.trim();
  if(!courses.includes(data.course))return fail('请选择课程。','course');if(!data.name)return fail('请填写班级名称。','name');if(!terms.includes(data.term))return fail('请选择开学学期。','term');
  if(classes.some(c=>c!==current&&c.name===data.name&&c.course===data.course&&c.term===data.term))return fail('该课程与学期下已有同名班级。','name');
  if(mode==='create'){let n=1;while(classes.some(c=>c.id==='CLS-DEMO-'+n))n++;classes.unshift({...data,id:'CLS-DEMO-'+n,teacher:isSuper?'平台管理员':'陈若云',school:'睿秀学城',created:today(),guest:false,attendance:[],team:[{name:isSuper?'平台管理员':'陈若云',role:'创建者',school:'睿秀学城'}],file:uploadName});filters={term:'',course:'',name:'',student:'',guest:false};page=1;}else{Object.assign(current,data);roster(current).forEach(s=>s.course=data.course);}
  closeModal(modal);renderShell();toast('已保存班级',mode==='create'&&uploadName?'文件名已登记；未解析或导入学生。':'仅更新本页，刷新恢复。');root.querySelector('#class-create')?.focus();
 };
 childForm.onsubmit=e=>{
  e.preventDefault();const a=current.attendance.find(a=>a.id===selectedAttendance),data=Object.fromEntries(new FormData(childForm));
  if(childMode==='delete'){current.attendance=current.attendance.filter(a=>a.id!==selectedAttendance);selectedAttendance=current.attendance[0]?.id||'';}
  else{
   const name=data['att-name'].trim();if(!name)return fail('请填写考勤项名称。','att-name','#attendance-error',childForm);
   if(current.attendance.some(item=>item!==(childMode==='edit'?a:null)&&item.name===name))return fail('考勤项名称不能重复。','att-name','#attendance-error',childForm);
   if(childMode==='edit'&&expired(a)){a.name=name;}
   else{
    const date=data['att-date'],start=data['att-start'];let end=data['att-end'];if(!date)return fail('请选择日期。','att-date','#attendance-error',childForm);if(!start)return fail('请选择开始时间。','att-start','#attendance-error',childForm);
    if(!end){const [h,m]=start.split(':').map(Number),mins=h*60+m+10;if(mins>=1440)return fail('默认结束时间超出当日，请设置当日有效时段。','att-start','#attendance-error',childForm);end=String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');}
    if(end<=start)return fail('结束时间须晚于开始时间。','att-end','#attendance-error',childForm);
    if(childMode==='create'){let n=1;while(current.attendance.some(a=>a.id==='att-'+n))n++;selectedAttendance='att-'+n;current.attendance.push({id:selectedAttendance,name,date,start,end,marks:{}});}else Object.assign(a,{name,date,start,end});
   }
  }
  child.close();renderDetailRows();toast('考勤项已更新','仅保存本页演示。');
 };
 child.addEventListener('click',e=>{if(e.target.closest('[data-child-close]'))child.close();});
 child.addEventListener('change',e=>{if(e.target.id==='attendance-original'){selectedAttendance=e.target.value;if(childMode==='edit')fillAttendance(current.attendance.find(a=>a.id===selectedAttendance));}});
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.section){section=b.dataset.section;page=1;history.pushState(null,'','#'+section);renderShell();root.querySelector(`[data-section="${section}"]`).focus();}
  if(b.id==='class-create')show('create',null,b);if(b.hasAttribute('data-guide'))show('guide',null,b);
  if(b.dataset.action)show(b.dataset.action,classes.find(c=>c.id===b.dataset.id),b);
  if(b.dataset.view){view=b.dataset.view;root.querySelectorAll('[data-view]').forEach(v=>v.setAttribute('aria-pressed',v.dataset.view===view));renderList();}
  if(b.hasAttribute('data-reset')){filters={term:'',course:'',name:'',student:'',guest:false};page=1;selected.clear();renderShell();}
  if(b.hasAttribute('data-sort')){ascending=sort===b.dataset.sort?!ascending:true;sort=b.dataset.sort;renderList();}
  if(b.dataset.pager){page=Number(b.dataset.page);renderList();}
  if(b.hasAttribute('data-roster-export')){const ids=classes.filter(c=>(!filters.term||c.term===filters.term)&&(!filters.course||c.course===filters.course)&&match(c.name,filters.name)).map(c=>c.id),data=students.filter(s=>ids.includes(s.classId)&&match(s.name+' '+s.student,filters.student));csv('学生名册',['学号','姓名','班级','课程','完成课时','状态'],data.map(s=>[s.student,s.name,classes.find(c=>c.id===s.classId).name,s.course,s.progress,s.status]));}
 });
 root.addEventListener('change',e=>{
  const el=e.target;if(el.dataset.size){size=Number(el.value);page=1;renderList();}
  if(el.hasAttribute('data-select')){el.checked?selected.add(el.dataset.select):selected.delete(el.dataset.select);renderList();}
  if(el.hasAttribute('data-select-all')){root.querySelectorAll('[data-select]').forEach(c=>el.checked?selected.add(c.dataset.select):selected.delete(c.dataset.select));renderList();}
 });
 root.addEventListener('keydown',e=>{if(!e.target.matches('[role=tab]')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();root.querySelector(`[data-section="${e.key==='Home'?'classes':e.key==='End'?'students':section==='classes'?'students':'classes'}"]`).click();});
 window.addEventListener('hashchange',()=>{section=location.hash==='#students'?'students':'classes';page=1;renderShell();});
 modal.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-template'))csv('班级名单模板',['学号','姓名'],[['202600001','示例学生']]);
  if(b.hasAttribute('data-team-panel')){teamPanel=teamPanel===b.dataset.teamPanel?'':b.dataset.teamPanel;renderTeam();modal.querySelector(`[data-team-panel="${b.dataset.teamPanel}"]`).focus();}
  if(b.dataset.addTeacher){current.team.push({name:b.dataset.addTeacher,role:'教师',school:current.school});renderTeam();toast('教师已添加','本页班级团队已更新。');}
  if(b.hasAttribute('data-remove-teacher')){current.team.splice(Number(b.dataset.removeTeacher),1);renderTeam();}
  if(b.hasAttribute('data-detail-search')){detailQuery=document.querySelector('#detail-search').value;detailPage=1;renderDetailRows();}
  if(b.hasAttribute('data-detail-reset')){detailQuery='';detailPage=1;document.querySelector('#detail-search').value='';renderDetailRows();}
  if(b.dataset.detailSort){detailAscending=detailSort===b.dataset.detailSort?!detailAscending:true;detailSort=b.dataset.detailSort;renderDetailRows();}
  if(b.dataset.export)exportCurrent(b.dataset.export);
  if(b.dataset.att)openAttendanceEditor(b.dataset.att);
  if(b.dataset.attSelect){selectedAttendance=b.dataset.attSelect;renderDetailRows();}
  if(b.dataset.mark){const a=current.attendance.find(a=>a.id===b.dataset.mark),states=['未签到','出勤','缺勤','请假'];a.marks[b.dataset.student]=states[(states.indexOf(a.marks[b.dataset.student]||'未签到')+1)%states.length];renderDetailRows();modal.querySelector(`[data-mark="${b.dataset.mark}"][data-student="${b.dataset.student}"]`)?.focus();}
  if(b.hasAttribute('data-analyze')){const bad=[...modal.querySelectorAll('input[type=number][data-coefficient]')].find(el=>!el.checkValidity()||!el.value);if(bad){document.querySelector('#warning-state').textContent='系数须为 0.1–3，步长为 0.1。';bad.focus();return;}analyzed=true;renderWarning();modal.querySelector('[data-analyze]').focus();}
  if(b.hasAttribute('data-warning-refresh')){analyzed=false;renderWarning();modal.querySelector('[data-warning-refresh]').focus();toast('示例已刷新','保留本页考勤与系数，重新分析可查看结果。');}
  if(b.dataset.pager){detailPage=Number(b.dataset.page);b.dataset.pager==='warning'?renderWarningRows():renderDetailRows();}
 });
 modal.addEventListener('change',e=>{
  const el=e.target;if(el.dataset.size){detailSize=Number(el.value);detailPage=1;mode==='warning'?renderWarningRows():renderDetailRows();}
  if(el.id==='class-file')registerFile(el.files[0],'class-file-name',false);
  if(el.id==='warning-file')registerFile(el.files[0],'warning-file-name',true);
  if(el.id==='login-range'){range=Number(el.value);renderLogin();document.querySelector('#login-range').focus();}
  if(el.id==='all-attendance'){allAttendance=el.checked;detailPage=1;renderDetailRows();}
 });
 modal.addEventListener('input',e=>{
  if(e.target.id==='detail-search'){detailQuery=e.target.value;detailPage=1;renderDetailRows();}
  if(e.target.hasAttribute('data-coefficient')){const i=Number(e.target.dataset.coefficient),n=Number(e.target.value);if(!Number.isFinite(n)||n<0.1||n>3){document.querySelector('#warning-state').textContent='系数范围为 0.1–3。';return;}coefficients[i]=Math.round(n*10)/10;modal.querySelectorAll(`[data-coefficient="${i}"]`).forEach(el=>el.value=coefficients[i]);analyzed=false;document.querySelector('#warning-state').textContent='系数已更新，请重新分析。';renderWarningRows();}
 });
 modal.addEventListener('keydown',e=>{if(e.key==='Tab'){const items=[...modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}e.stopPropagation();}if(e.target.id==='class-drop'&&['Enter',' '].includes(e.key)){e.preventDefault();document.querySelector('#class-file').click();}if(e.target.id==='detail-search'&&e.key==='Enter'){e.preventDefault();detailQuery=e.target.value;renderDetailRows();}},true);
 modal.addEventListener('dragover',e=>{if(e.target.closest('#class-drop'))e.preventDefault();});
 modal.addEventListener('drop',e=>{if(!e.target.closest('#class-drop'))return;e.preventDefault();registerFile(e.dataTransfer.files[0],'class-file-name',false);});
 function registerFile(file,target,csvAllowed){if(!file)return;const regex=csvAllowed?/\.(xlsx|xls|csv)$/i:/\.(xlsx|xls)$/i;if(!regex.test(file.name)){uploadName='';document.getElementById(target).textContent='请选择 '+(csvAllowed?'Excel 或 CSV':'Excel (.xlsx / .xls)')+' 文件。';return;}uploadName=file.name;document.getElementById(target).textContent=file.name+' · 已登记文件名，未解析或导入数据。';}
 renderShell();
})();
