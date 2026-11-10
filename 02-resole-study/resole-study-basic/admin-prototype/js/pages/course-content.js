/* Course content workbench. All edits and progress records are local page demonstrations. */
window.AdminCourseContent={mount(config,course,modules){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=v=>JSON.parse(JSON.stringify(v)),section=id=>config.sections.find(s=>s.id===id);
 const ids=['overview','notices','discussion','team','results'],root=document.querySelector('#management-root');
 const panel=document.createElement('section');panel.id='course-content';panel.className='course-content';panel.setAttribute('role','tabpanel');root.append(panel);
 const modal=document.querySelector('#course-content-modal');
 const $=s=>panel.querySelector(s),m$=s=>modal.querySelector(s),button=(label,attrs='',primary=false)=>`<button type="button" class="btn ${primary?'primary':''}" ${attrs}>${label}</button>`;
 const field=(label,name,value='',type='text',extra='')=>`<label class="form-group ${type==='textarea'?'full':''}"><span>${label}</span>${type==='textarea'?`<textarea name="${name}" ${extra}>${esc(value)}</textarea>`:`<input name="${name}" type="${type}" value="${esc(value)}" ${extra}>`}</label>`;
 const select=(label,name,options,value)=>`<label class="form-group"><span>${label}</span><select name="${name}">${options.map(v=>`<option ${v===value?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`;
 const table=(headers,rows,label)=>`<div class="card table-wrap content-table" role="region" aria-label="${esc(label)}" tabindex="0"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}" class="content-empty">暂无数据</td></tr>`}</tbody></table></div>`;
 const badge=value=>`<span class="status ${['已发布','正常','已恢复','已完成'].includes(value)?'success':'neutral'}">${esc(value)}</span>`;
 const demo='本页演示 · 保存、发布及管理操作仅在当前页面生效，刷新恢复，不同步学生端。';
 let active='',query='',status='',arenaDraft=null,arenaIndex=null,modalSubmit=null,range=null,outlineDirty=false,filters={},page=1,pageSize=10;
 const base=section('overview').rows[0]||{};
 let outlineSaved=base.name?`<h2>${esc(course.name)} · 课程大纲</h2>${[['课程目标',base.goals],['先修要求',base.prerequisite],['教学内容',base.outline],['教学安排',base.schedule]].map(([h,t])=>`<h3>${h}</h3><p>${esc(t||'待补充').replace(/\n/g,'<br>')}</p>`).join('')}`:'';
 let outlineDraft=outlineSaved;
 const seeds=[
  [{text:'以下哪个语句将整数 3 赋值给变量 x？',options:['x = 3','3 = x','x == 3'],answers:[0],explanation:'赋值语句将右侧的值关联到左侧变量。'},{text:'以下哪些值属于字符串？',options:['"Python"','42','"42"'],answers:[0,2],multiple:true,explanation:'用引号包围的值是字符串。'},{text:'int("12") 的结果是？',options:['整数 12','字符串 "12"','发生错误'],answers:[0],explanation:'int 可以将有效的整数字符串转换为整数。'}],
  [{text:'2 + 3 * 4 的结果是？',options:['20','14','24'],answers:[1],explanation:'先乘除后加减。'},{text:'input() 默认返回哪种类型？',options:['字符串','整数','浮点数'],answers:[0],explanation:'input() 返回字符串，需要时再转换类型。'},{text:'以下哪些语句可以输出数字 3？',options:['print(3)','print(1 + 2)','input(3)'],answers:[0,1],multiple:true,explanation:'print 用于输出，input 用于读取输入。'}]
 ];
 const resourceGroups=[['lessons','课时任务进度'],['assignments','作业进度'],['exams','考试进度'],['experiments','实验进度']];
 const resources=modules.flatMap(m=>m.resources.map(r=>({...r,directory:m.name+'/'+r.name})));
 const kind=r=>r.type==='实训'?'experiments':r.type==='作业'?'assignments':r.type==='测验'?(r.mode==='考试模式'?'exams':'assignments'):'lessons';
 const students=AdminTeaching.students.filter(s=>s.course===course.name).map((s,i)=>{
  const ratio=Number(s.progress.split('/')[0])/Number(s.progress.split('/')[1]),className=AdminTeaching.classes.find(c=>c.id===s.classId)?.name||'—';
  const details=Object.fromEntries(resourceGroups.map(([key])=>[key,resources.filter(r=>kind(r)===key).map((r,j)=>{
   const done=j<Math.round(resources.filter(x=>kind(x)===key).length*ratio),graded=done&&j%2===0;
   return {name:r.name,type:r.type,directory:r.directory,done,status:done?'已完成':key==='lessons'?'未完成':'未提交',grading:done?(graded?'已批阅':'待批阅'):'—',score:graded?String(80+i*5):'—',start:done?'2026-09-21 09:00':'—',end:done?'2026-09-21 09:20':'—',duration:done?'20 分钟':'—'};
  })]));
  return {...s,className,college:i%2?'软件工程学院':'计算机科学与技术学院',major:i%2?'软件工程':'计算机科学与技术',details};
 });
 const progress=(s,key)=>{const rows=s.details[key];return `${rows.filter(r=>r.done).length} / ${rows.length}`;};
 const summaryRows=list=>list.map(s=>[s.name,s.student,s.college,s.major,s.className,...resourceGroups.map(([key])=>progress(s,key))]);
 const summaryHeaders=['学生姓名','学号','学院','专业','行政班级',...resourceGroups.map(([,label])=>label)];
 function exportCSV(name,rows){
  const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function openDialog(title,body,trigger,onSubmit,label='保存',wide=false){
  m$('#content-modal-title').textContent=title;m$('#content-modal-body').innerHTML=body;m$('#content-modal-error').textContent='';m$('#content-modal-save').hidden=!onSubmit;m$('#content-modal-save').textContent=label;modal.classList.toggle('content-wide',wide);modalSubmit=onSubmit;AdminUI.openModal(modal.id,trigger);
 }
 m$('#content-modal-form').onsubmit=e=>{e.preventDefault();modalSubmit?.(new FormData(e.currentTarget));};
 function fail(message,control){$('#content-error').textContent=message;control?.focus();}
 function sync(){
  const id=location.hash.slice(1),on=ids.includes(id);panel.hidden=!on;
  if(on){root.querySelector('#management-panel').hidden=true;root.querySelector('.management-summary').hidden=true;panel.setAttribute('aria-labelledby','tab-'+id);root.querySelector('#tab-'+id).setAttribute('aria-controls',panel.id);if(id!==active){active=id;query='';status='';render();}}
 }
 document.addEventListener('admin-section-change',sync);window.addEventListener('hashchange',sync);
 function render(){
  const s=section(active);panel.innerHTML=`<div class="content-heading"><div><h2>${esc(s.title)}</h2><p>${esc(active==='overview'?'每门课程维护一份大纲，直接编辑正文。':active==='arena'?'关联当前课程课时，在本页维护选择题与竞技规则。':active==='results'?'按学生查看各类学习任务进度，筛选后可导出或查看详情。':s.description)}</p></div>${['notices','team','discussion'].includes(active)?button('＋ '+(active==='notices'?'新增公告':active==='team'?'添加成员':'新增讨论'),'data-content="create"',true):active==='arena'&&!arenaDraft?button('＋ 新增竞技','data-content="arena-new" '+(section('arena').create===false?'disabled title="请先在备课中配置课时"':''),true):''}</div><p class="content-demo">${active==='results'?'独立示例学情 · 学生来自本课程示例名册，任务来自进入本页时的备课快照；不读取真实学习记录。':demo}</p><div id="content-body"></div><p id="content-error" class="content-error" role="alert"></p>`;
  if(active==='overview')renderOutline();else if(active==='arena')renderArena();else if(active==='results')renderResults();else renderList();
 }
 function renderOutline(){
  $('#content-error').textContent='';
  $('#content-body').innerHTML=`<div class="card outline-card"><div class="rich-toolbar" role="toolbar" aria-label="大纲格式工具">${[['bold','B','加粗'],['italic','I','斜体'],['underline','U','下划线'],['strikeThrough','S','删除线'],['blockquote','❞','引用'],['pre','&lt;/&gt;','代码块'],['insertOrderedList','1. ≡','有序列表'],['insertUnorderedList','• ≡','无序列表'],['outdent','⇤','减少缩进'],['indent','⇥','增加缩进'],['justifyLeft','☰','左对齐'],['justifyCenter','≡','居中'],['justifyRight','☷','右对齐']].map(([cmd,label,title])=>`<button type="button" data-rich="${cmd}" title="${title}" aria-label="${title}">${label}</button>`).join('')}<select aria-label="段落样式" data-rich-select="formatBlock"><option value="p">正文</option><option value="h2">标题 1</option><option value="h3">标题 2</option><option value="h4">标题 3</option></select><select aria-label="字号" data-rich-select="fontSize"><option value="3">16px</option><option value="2">14px</option><option value="4">18px</option><option value="5">24px</option></select><label title="文字颜色">A<input type="color" aria-label="文字颜色" data-rich-select="foreColor" value="#253a31"></label><label title="背景色">▧<input type="color" aria-label="文字背景色" data-rich-select="hiliteColor" value="#fff3b0"></label>${[['removeFormat','Tₓ','清除格式'],['link','↗','插入链接'],['image','▧','插入图片'],['video','▣','插入视频'],['undo','↶','撤销'],['redo','↷','重做']].map(([cmd,label,title])=>`<button type="button" data-rich="${cmd}" title="${title}" aria-label="${title}">${label}</button>`).join('')}</div><div id="outline-editor" class="outline-editor" contenteditable="true" role="textbox" aria-label="课程大纲正文" aria-multiline="true" data-placeholder="请输入课程大纲…"></div><div class="outline-foot"><span id="outline-state" class="meta" role="status">${outlineDirty?'有未保存更改':'大纲已保存'}</span><div class="inline-actions">${button('恢复已保存内容','data-content="outline-reset"')}${button('保存大纲','data-content="outline-save"',true)}</div></div></div><input type="file" id="outline-media" hidden>`;
  $('#outline-editor').innerHTML=outlineDraft;
  $('#outline-editor').oninput=()=>{outlineDraft=$('#outline-editor').innerHTML;outlineDirty=outlineDraft!==outlineSaved;$('#outline-state').textContent=outlineDirty?'有未保存更改':'大纲已保存';};
  $('#outline-editor').onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));};
  $('#outline-editor').ondrop=e=>e.preventDefault();
 }
 function rememberRange(){const selection=getSelection();if(selection.rangeCount&&$('#outline-editor')?.contains(selection.anchorNode))range=selection.getRangeAt(0).cloneRange();}
 document.addEventListener('selectionchange',rememberRange);
 function richCommand(command,value){const editor=$('#outline-editor');editor.focus();const selection=getSelection();if(range&&editor.contains(range.commonAncestorContainer)){selection.removeAllRanges();selection.addRange(range);}document.execCommand(command,false,value);editor.dispatchEvent(new Event('input'));rememberRange();}
 panel.addEventListener('mousedown',e=>{if(e.target.closest('.rich-toolbar button'))e.preventDefault();});
 panel.addEventListener('change',e=>{if(e.target.dataset.richSelect)richCommand(e.target.dataset.richSelect,e.target.value);});
 function renderList(){
  $('#content-body').innerHTML=`<div class="toolbar"><div class="search"><input id="content-search" type="search" aria-label="搜索当前栏目" placeholder="搜索名称或内容" value="${esc(query)}"></div><select id="content-status" aria-label="筛选状态" ${active==='team'?'hidden':''}><option value="">全部状态</option>${(section(active).fields.find(f=>f.key==='status')?.options||[]).map(v=>`<option ${v===status?'selected':''}>${esc(v)}</option>`).join('')}</select>${button('清除筛选','data-content="list-reset"')}</div><div id="content-list"></div>`;
  $('#content-search').oninput=e=>{query=e.target.value.trim().toLowerCase();renderListRows();};$('#content-status').onchange=e=>{status=e.target.value;renderListRows();};renderListRows();
 }
 function renderListRows(){
  const keys=active==='notices'?['name','body','order','status']:active==='discussion'?['name','author','scope','body','reply','status']:['name','role','school','bio','order'];
  const rows=section(active).rows.map((r,i)=>({r,i})).filter(({r})=>(!query||Object.values(r).join(' ').toLowerCase().includes(query))&&(!status||r.status===status));
  $('#content-list').innerHTML=table([...keys.map(k=>section(active).fields.find(f=>f.key===k)?.label||k),'操作'],rows.map(({r,i})=>[...keys.map(k=>k==='status'?badge(r[k]):esc(r[k]||'—')),`<div class="content-actions">${button('编辑',`data-row-edit="${i}"`)}${active==='notices'?button(r.status==='已发布'?'下架':'发布',`data-row-publish="${i}"`):active==='discussion'?button(r.status==='已隐藏'?'恢复显示':'隐藏',`data-row-hide="${i}"`)+button('回复',`data-row-reply="${i}"`):''}${button('删除',`data-row-delete="${i}"`)}</div>`]),section(active).title)+`<p class="meta">共 ${rows.length} 条</p>`;
 }
 function editRecord(index,trigger){
  const s=section(active),record=index===null?{}:s.rows[index];
  const fields=s.fields.filter(f=>!(active==='discussion'&&['reply','likes','reason'].includes(f.key)));
  openDialog((index===null?'新增':'编辑')+' · '+s.title,`<div class="form-grid">${fields.map(f=>f.options?select(f.label,f.key,f.options,record[f.key]??(active==='notices'&&f.key==='status'?'草稿':f.default)):field(f.label+(f.required?' *':''),f.key,record[f.key]??(index===null?'':f.default),f.type||'text',`${f.required?'required':''} ${f.type==='number'?'min="1" step="1"':''}`)).join('')}</div>`,trigger,data=>{
   const row={...record,...Object.fromEntries(data)};if(fields.some(f=>f.required&&!String(row[f.key]).trim())){m$('#content-modal-error').textContent='请填写必填内容。';return;}
   if(index===null)s.rows.push(row);else s.rows[index]=row;AdminUI.closeModal(modal);renderListRows();$('#content-search').focus();AdminUI.toast('已保存','仅本页演示，刷新恢复。');
  });
 }
 function renderArena(){
  if(!arenaDraft){const s=section('arena');$('#content-body').innerHTML=`<div class="content-guide"><strong>AI 导师统一引导</strong><p>“先说说你的思路与卡点，我会通过提示和追问，陪你逐步找到答案。”</p><small>所有活动共用，无需逐项配置；未接入真实 AI 服务。</small></div>`+table(['竞技名称','关联课时','题量','状态','操作'],s.rows.map((r,i)=>[esc(r.name),esc(r.lesson),r.questions.length+' 道选择题',badge(r.status),`<div class="content-actions">${button('编辑竞技',`data-arena-edit="${i}"`)}${button('参与记录',`data-arena-records="${i}"`)}</div>`]),'课内竞技');return;}
  const d=arenaDraft,fields=section('arena').fields.filter(f=>!['bank','tutor'].includes(f.key));
  $('#content-body').innerHTML=`<form id="arena-form" class="card arena-editor"><div class="content-heading"><h3>${arenaIndex===null?'新增':'编辑'}竞技</h3>${button('返回竞技列表','data-content="arena-back"')}</div><div class="form-grid">${fields.map(f=>f.options?select(f.label,f.key,f.options,d[f.key]):field(f.label+(f.required?' *':''),f.key,d[f.key]??f.default,f.type||'text',`${f.required?'required':''} ${f.type==='number'?`min="${f.key==='accuracy'?0:1}" step="1" ${f.key==='accuracy'?'max="100"':''}`:''}`)).join('')}</div><div class="content-guide"><strong>AI 导师使用统一引导语</strong><p>先说说你的思路与卡点，我会通过提示和追问，陪你逐步找到答案。</p></div><div class="content-heading"><div><h3>竞技题库 <span class="meta">${d.questions.length} 道</span></h3><p>仅支持选择题，可设置单选或多选。勾选正确答案，并补充解析。</p></div>${button('＋ 添加选择题','data-content="question-add"')}</div><div id="arena-questions">${d.questions.map((q,i)=>`<fieldset class="arena-question" data-question="${i}"><legend>第 ${i+1} 题</legend><div class="content-heading">${select('题型','qtype',['单选题','多选题'],q.multiple?'多选题':'单选题')}${button('删除此题',`data-question-remove="${i}"`)}</div>${field('题干 *','qtext',q.text,'textarea','required')}<div class="arena-options">${q.options.map((o,j)=>`<div class="arena-option"><label class="answer-pick"><input type="${q.multiple?'checkbox':'radio'}" name="answer-${i}" value="${j}" ${q.answers.includes(j)?'checked':''} aria-label="第 ${i+1} 题选项 ${String.fromCharCode(65+j)} 为正确答案"><span>${String.fromCharCode(65+j)}</span></label><input name="qoption" value="${esc(o)}" required aria-label="第 ${i+1} 题选项 ${String.fromCharCode(65+j)}">${button('×',`data-option-remove="${i}:${j}" aria-label="删除选项 ${String.fromCharCode(65+j)}" ${q.options.length<=2?'disabled':''}`)}</div>`).join('')}</div>${button('＋ 添加选项',`data-option-add="${i}" ${q.options.length>=6?'disabled':''}`)}${field('答案解析','qexplanation',q.explanation,'textarea')}</fieldset>`).join('')||'<div class="content-empty">尚未添加题目，请添加选择题。</div>'}</div><p class="content-error" id="arena-error" role="alert"></p><div class="content-savebar"><span class="meta">题库与规则一起保存到本页</span><button class="btn primary" type="submit">保存竞技与题库</button></div></form>`;
  $('#arena-form').onsubmit=e=>{e.preventDefault();readArena();const d=arenaDraft;
   const error=!d.name.trim()?'请填写竞技名称。':!section('arena').fields.find(f=>f.key==='lesson').options.includes(d.lesson)?'请选择当前课程的课时。':!d.questions.length?'请至少添加一道选择题。':Number(d.rounds)>d.questions.length?'每局抽题数量不能超过题库题量。':d.questions.some(q=>!q.text.trim()||q.options.some(o=>!o.trim())||new Set(q.options.map(o=>o.trim())).size!==q.options.length||!q.answers.length||(!q.multiple&&q.answers.length!==1))?'请完善题干、至少两个不重复的选项及正确答案。':'';
   if(error){$('#arena-error').textContent=error;$('#arena-error').scrollIntoView({block:'center'});return;}
   if(arenaIndex===null)section('arena').rows.push(clone(d));else section('arena').rows[arenaIndex]=clone(d);arenaDraft=null;render();$(`[data-arena-edit="${arenaIndex??section('arena').rows.length-1}"]`)?.focus();AdminUI.toast('竞技与题库已保存','仅本页演示，刷新恢复。');
  };
  $('#arena-form').addEventListener('change',e=>{if(e.target.name==='qtype'){readArena();renderArena();}});
 }
 function readArena(){
  const form=$('#arena-form');if(!form)return;const data=new FormData(form);
  section('arena').fields.filter(f=>!['bank','tutor'].includes(f.key)).forEach(f=>arenaDraft[f.key]=data.get(f.key));
  arenaDraft.questions=[...form.querySelectorAll('[data-question]')].map(el=>{const multiple=el.querySelector('[name=qtype]').value==='多选题',answers=[...el.querySelectorAll('.answer-pick input:checked')].map(e=>Number(e.value));return {text:el.querySelector('[name=qtext]').value,options:[...el.querySelectorAll('[name=qoption]')].map(e=>e.value),answers:multiple?answers:answers.slice(0,1),multiple,explanation:el.querySelector('[name=qexplanation]').value};});
 }
 function openArena(index){arenaIndex=index;arenaDraft=index===null?Object.fromEntries(section('arena').fields.map(f=>[f.key,f.default??f.options?.[0]??''])):clone(section('arena').rows[index]);if(index===null){arenaDraft.rounds=1;arenaDraft.questions=[];}render();$('#arena-form [name=name]').focus();}
 function filteredStudents(){return students.filter(s=>Object.entries(filters).every(([key,v])=>!v||s[key].toLowerCase().includes(v)));}
 function renderResults(){
  $('#content-body').innerHTML=`<div class="content-metrics">${[['本课示例学生',students.length+' 人'],['课时任务',resources.filter(r=>kind(r)==='lessons').length+' 项'],['作业 / 练习',resources.filter(r=>kind(r)==='assignments').length+' 项'],['考试 / 实验',resources.filter(r=>['exams','experiments'].includes(kind(r))).length+' 项']].map(([l,v])=>`<div class="card"><span>${l}</span><strong>${v}</strong></div>`).join('')}</div><form id="results-filter" class="card results-filter">${[['name','学生姓名'],['student','学号'],['college','学院'],['major','专业'],['className','行政班级']].map(([k,l])=>field(l,k,filters[k]||'','search',`placeholder="请输入${l}"`)).join('')}<div class="content-actions"><button class="btn" type="reset">重置</button><button class="btn primary">查询</button></div></form><div class="content-heading"><span class="meta">完成数 / 总数 · 导出包含当前筛选的全部学生</span>${button('导出学习进度','data-content="results-export"',true)}</div><div id="results-list"></div>`;
  $('#results-filter').onsubmit=e=>{e.preventDefault();filters=Object.fromEntries([...new FormData(e.currentTarget)].map(([k,v])=>[k,v.trim().toLowerCase()]));page=1;renderResultRows();};
  $('#results-filter').onreset=e=>{e.preventDefault();filters={};page=1;renderResults();};renderResultRows();
 }
 function renderResultRows(){
  $('#content-error').textContent='';
  const list=filteredStudents(),pages=Math.max(1,Math.ceil(list.length/pageSize));page=Math.min(page,pages);
  $('#results-list').innerHTML=table([...summaryHeaders,'操作'],list.slice((page-1)*pageSize,page*pageSize).map(s=>[...summaryRows([s])[0].map(esc),button('详情',`data-student="${s.student}"`)]),'学生学习进度')+`<div class="content-pagination"><span>共 ${list.length} 条数据</span><div class="content-actions">${button('上一页',`data-result-page="${page-1}" ${page===1?'disabled':''}`)}<span>${page} / ${pages}</span>${button('下一页',`data-result-page="${page+1}" ${page===pages?'disabled':''}`)}<select id="results-size" aria-label="每页条数">${[10,20,50].map(n=>`<option value="${n}" ${pageSize===n?'selected':''}>${n} 条/页</option>`).join('')}</select></div></div>`;
  $('#results-size').onchange=e=>{pageSize=Number(e.target.value);page=1;renderResultRows();};
 }
 function detailTable(key,rows){
  const headers=key==='lessons'?['序号','课时任务','任务类型','所属目录','完成状态','开始时间','完成时间','学习时长']:['序号',key==='assignments'?'作业名称':key==='exams'?'考试名称':'实验名称','类型','参与状态','批阅状态','得分','开始时间','完成时间'];
  return {headers,rows:rows.map((r,i)=>key==='lessons'?[i+1,r.name,r.type,r.directory,r.status,r.start,r.end,r.duration]:[i+1,r.name,r.type,r.status,r.grading,r.score,r.start,r.end])};
 }
 function studentDetails(id,trigger){
  const s=students.find(s=>s.student===id);if(!s)return;
  openDialog('学习进度详情',`${button('导出个人学习进度',`data-student-export="${s.student}"`,true)}<dl class="student-info">${[['学生姓名',s.name],['学号',s.student],['学院',s.college],['专业',s.major],['行政班级',s.className],['课程',course.name]].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${resourceGroups.map(([key,title])=>{const rows=s.details[key],done=rows.filter(r=>r.done).length,details=detailTable(key,rows);return `<section class="progress-section"><h3>${title}</h3><p class="progress-summary"><span>总数：${rows.length}</span><span>已完成：${done}</span><span>未完成：${rows.length-done}</span><span>完成率：${rows.length?Math.round(done/rows.length*100):0}%</span></p>${table(details.headers,details.rows.map(r=>r.map(esc)),title)}</section>`;}).join('')}`,trigger,null,'',true);
 }
 modal.addEventListener('click',e=>{const id=e.target.closest('[data-student-export]')?.dataset.studentExport;if(!id)return;const s=students.find(s=>s.student===id);exportCSV(course.name+'-'+s.name+'-学习进度',[['本地示例学习进度'],summaryHeaders,summaryRows([s])[0],...resourceGroups.flatMap(([key,label])=>{const t=detailTable(key,s.details[key]);return [[],[label],t.headers,...t.rows];})]);});
 panel.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const action=b.dataset.content;
  if(action==='create')editRecord(null,b);
  if(b.dataset.rowEdit!==undefined)editRecord(Number(b.dataset.rowEdit),b);
  if(b.dataset.rowDelete!==undefined){const i=Number(b.dataset.rowDelete),row=section(active).rows[i];openDialog('删除 · '+section(active).title,`<p>确定删除「${esc(row.name)}」？${active==='discussion'?'该讨论及教师回复将一并移除。':''}</p>`,b,()=>{section(active).rows.splice(i,1);AdminUI.closeModal(modal);renderListRows();$('#content-search').focus();AdminUI.toast('已删除','仅本页演示，刷新恢复。');},'确认删除');}
  if(b.dataset.rowPublish!==undefined){const r=section(active).rows[Number(b.dataset.rowPublish)];r.status=r.status==='已发布'?'已下架':'已发布';renderListRows();$(`[data-row-publish="${b.dataset.rowPublish}"]`)?.focus();AdminUI.toast(r.status,r.status==='已发布'?'本页公告立即显示为已发布，不设置发布时间；不发送真实通知。':demo);}
  if(b.dataset.rowHide!==undefined){const r=section(active).rows[Number(b.dataset.rowHide)];r.status=r.status==='已隐藏'?'正常':'已隐藏';renderListRows();$(`[data-row-hide="${b.dataset.rowHide}"]`)?.focus();}
  if(b.dataset.rowReply!==undefined){const r=section(active).rows[Number(b.dataset.rowReply)];openDialog('回复讨论',`<div class="content-guide"><strong>${esc(r.name)}</strong><p>${esc(r.body)}</p></div>${field('教师回复 *','reply',r.reply||'','textarea','required maxlength="2000"')}`,b,data=>{const reply=data.get('reply').trim();if(!reply){m$('#content-modal-error').textContent='请输入回复内容。';return;}r.reply=reply;AdminUI.closeModal(modal);renderListRows();$(`[data-row-reply="${b.dataset.rowReply}"]`)?.focus();AdminUI.toast('回复已保存','仅本页演示，刷新恢复。');},'保存回复');}
  if(action==='list-reset'){query='';status='';renderList();$('#content-search').focus();}
  if(action==='outline-save'){const editor=$('#outline-editor');if(!editor.textContent.trim()&&!editor.querySelector('img,video')){fail('请先填写课程大纲正文。',editor);return;}outlineSaved=outlineDraft;outlineDirty=false;$('#outline-state').textContent='大纲已保存';$('#content-error').textContent='';AdminUI.toast('大纲已保存','仅本页演示，刷新恢复。');}
  if(action==='outline-reset'&&(!outlineDirty||confirm('恢复已保存内容，放弃未保存的大纲修改？'))){outlineDraft=outlineSaved;outlineDirty=false;range=null;renderOutline();$('#outline-editor').focus();}
  const rich=b.dataset.rich;
  if(rich){
   if(['blockquote','pre'].includes(rich))richCommand('formatBlock',rich);
   else if(rich==='link'){openDialog('插入链接',field('链接文字','text','','text','required')+field('链接地址（https:// 或 mailto:）','url','','text','required'),b,data=>{const url=data.get('url').trim();if(!/^(https?:\/\/|mailto:)[^\s]+$/i.test(url)){m$('#content-modal-error').textContent='请输入有效的 http、https 或 mailto 链接。';return;}AdminUI.closeModal(modal);richCommand('insertHTML',`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(data.get('text').trim()||url)}</a>`);});}
   else if(rich==='image'||rich==='video'){
    const input=$('#outline-media');input.accept=rich==='image'?'image/png,image/jpeg,image/gif,image/webp':'video/mp4,video/webm';
    input.onchange=async()=>{const file=input.files[0];if(!file)return;const image=rich==='image',allowed=image?/^image\/(png|jpeg|gif|webp)$/:/^video\/(mp4|webm)$/;if(!allowed.test(file.type)||file.size>(image?5:20)*1024*1024){fail(image?'请选择 5 MB 以内的 PNG/JPG/GIF/WebP 图片。':'请选择 20 MB 以内的 MP4/WebM 视频。');return;}try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});if(active!=='overview')return;richCommand('insertHTML',image?`<img src="${data}" alt="${esc(file.name)}">`:`<video src="${data}" controls aria-label="${esc(file.name)}"></video><p><br></p>`);input.value='';}catch{fail('无法读取所选文件，请重试。');}};input.click();
   }else richCommand(rich);
  }
  if(action==='arena-new')openArena(null);
  if(b.dataset.arenaEdit!==undefined)openArena(Number(b.dataset.arenaEdit));
  if(action==='arena-back'&&confirm('返回列表并放弃当前尚未保存的竞技修改？')){arenaDraft=null;render();$('[data-content="arena-new"]').focus();}
  if(action==='question-add'){readArena();arenaDraft.questions.push({text:'',options:['',''],answers:[],explanation:'',multiple:false});renderArena();$('#arena-questions .arena-question:last-child [name=qtext]').focus();}
  if(b.dataset.questionRemove!==undefined){readArena();const i=Number(b.dataset.questionRemove);if(confirm('确定删除第 '+(i+1)+' 题？')){arenaDraft.questions.splice(i,1);renderArena();$('[data-content="question-add"]').focus();}}
  if(b.dataset.optionAdd!==undefined){readArena();const i=Number(b.dataset.optionAdd);if(arenaDraft.questions[i].options.length<6)arenaDraft.questions[i].options.push('');renderArena();$(`[data-question="${i}"] .arena-option:last-child [name=qoption]`)?.focus();}
  if(b.dataset.optionRemove!==undefined){readArena();const [i,j]=b.dataset.optionRemove.split(':').map(Number),q=arenaDraft.questions[i];if(q.options.length>2){q.options.splice(j,1);q.answers=q.answers.filter(a=>a!==j).map(a=>a>j?a-1:a);renderArena();}}
  if(b.dataset.arenaRecords!==undefined){const r=section('arena').rows[Number(b.dataset.arenaRecords)],details=section('arena').records;openDialog(r.name+' · 参与记录',table(details.fields.map(f=>esc(f.label)),details.rows(r).map(row=>details.fields.map(f=>esc(row[f.key]))),'竞技参与记录'),b,null);}
  if(b.dataset.student)studentDetails(b.dataset.student,b);
  if(b.dataset.resultPage){page=Number(b.dataset.resultPage);renderResultRows();$('#results-size').focus();}
  if(action==='results-export'){const list=filteredStudents();if(!list.length){fail('当前筛选没有可导出的学生记录。');return;}exportCSV(course.name+'-学习进度',[summaryHeaders,...summaryRows(list)]);}
 });
 panel.addEventListener('input',e=>{if(e.target.closest('#arena-form'))readArena();});
 window.addEventListener('beforeunload',e=>{if(outlineDirty||arenaDraft){e.preventDefault();e.returnValue='';}});
 sync();
}};
