(function(){
'use strict';
const $=id=>document.getElementById(id),escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seeds=[
['wang','王欣怡','202410238','数字素养与安全','教育技术学·大二','需要修读本课程完成《大学生数字素养》实践学分，已完成先修学习。'],
['li','李嘉乐','202310117','数字素养与安全','计算机科学·大三','参加学院组织的网络安全知识竞赛，希望系统学习数字安全基础。'],
['zhao','赵思源','202510064','数字素养与安全','法学·大一','对个人信息保护与科技伦理感兴趣，希望作为通识课程学习。'],
['sun','孙可','202410188','数字素养与安全','汉语言文学','希望系统学习数字素养知识。'],
['zhang','章清','202210076','数字素养与安全','管理学','希望参加信息安全通识学习。'],
['lin','林同学','202410240','Python 程序设计','计算机科学·大二'],
['chen','陈可','202410241','Python 程序设计','软件工程·大二'],
['zhou','周宁','202410242','数据科学导论','统计学·大二'],
['wu','吴悦','202410243','数据科学导论','数学·大二'],
['xu','许晨','202410244','Python 程序设计','软件工程·大二'],
['yang','杨晓','202410245','数据科学导论','统计学·大二'],
['liu','刘青','202410246','Python 程序设计','计算机科学·大二','希望学习 Python。','approved'],
['he','何安','202410247','数据科学导论','数学·大二','希望学习数据分析。','rejected','请补充先修课程学习证明。'],
['han','韩同学','202410248','AI 办公效率提升','管理学·大二'],
['qian','钱同学','202410249','人工智能基础','计算机科学·大二']];
const rows=seeds.map(([id,name,student,course,major,reason='希望加入课程，完成相关学习。',status='pending',rejection=''],i)=>({id,name,student,course,major,reason,status,rejection,time:'2026-09-20 '+String(9+Math.floor(i/6)).padStart(2,'0')+':'+String(42-i%6*4).padStart(2,'0'),reviewedAt:status==='pending'?'':'2026-09-21 10:00:00'})).filter(row=>AdminUI.isSuper||AdminTeaching.courses.includes(row.course));
const statuses={pending:['待审核','warning'],approved:['已通过','success'],rejected:['已驳回','danger']},selected=new Set();
let filters={},status='pending',page=1,pageSize=5,active='',rejectId='';
$('review-scope').textContent=(AdminUI.isSuper?'全平台课程入课申请':'本人负责课程的入课申请')+' · 本页演示审核，刷新后恢复示例数据';
function matching(){return rows.filter(row=>(status==='all'||row.status===status)&&['course','name','student'].every(key=>!filters[key]||row[key].toLowerCase().includes(filters[key])));}
function visible(){const matches=matching();page=Math.max(1,Math.min(page,Math.ceil(matches.length/pageSize)||1));return matches.slice((page-1)*pageSize,page*pageSize);}
function badge(row){return '<span class="status '+statuses[row.status][1]+'">'+statuses[row.status][0]+'</span>';}
function selection(){const pending=visible().filter(row=>row.status==='pending'),count=pending.filter(row=>selected.has(row.id)).length;
$('review-select-page').disabled=!pending.length;$('review-select-page').checked=!!pending.length&&count===pending.length;$('review-select-page').indeterminate=count>0&&count<pending.length;
$('review-selection').textContent='已选 '+selected.size+' 项';$('review-bulk').disabled=!selected.size;}
function detail(){const row=rows.find(row=>row.id===active),target=$('review-detail');target.dataset.active=active;
if(!row){target.innerHTML='<h2>入课申请详情</h2><p class="meta">暂无匹配的申请，请调整搜索条件。</p>';return;}
target.innerHTML='<h2>'+escape(row.name)+'</h2><div class="meta">入课申请详情 '+badge(row)+'</div><div class="detail-section">'+[['课程名',row.course],['学号',row.student],['学籍',row.major],['申请时间',row.time],...(row.reviewedAt?[['审核时间',row.reviewedAt]]:[])].map(([key,value])=>'<div class="kv"><span>'+key+'</span><b>'+escape(value)+'</b></div>').join('')+'</div><div class="detail-section"><b>申请理由</b><div class="quote">'+escape(row.reason)+'</div></div>'+(row.status==='rejected'?'<div class="detail-section review-rejection"><b>驳回理由</b><div class="quote">'+escape(row.rejection)+'</div></div>':'')+(row.status==='pending'?'<div class="inline-actions"><button class="btn danger" id="review-reject">驳回</button><button class="btn primary" id="review-approve">通过申请</button></div>':'');}
function render(){const matches=matching(),items=visible(),pages=Math.ceil(matches.length/pageSize)||1;
if(!items.some(row=>row.id===active))active=items[0]?.id||'';
$('review-status-filters').innerHTML=[['pending','待审核'],['approved','已通过'],['rejected','已驳回'],['all','全部']].map(([key,label])=>'<button class="btn small" data-review-status="'+key+'" aria-pressed="'+(status===key)+'">'+label+'</button>').join('');
$('review-list').innerHTML=items.length?items.map(row=>'<article class="review-item" data-review="'+row.id+'" aria-current="'+(active===row.id)+'"><label class="review-checkbox"><input type="checkbox" data-review-select="'+row.id+'" aria-label="选择 '+escape(row.name)+'的申请" '+(selected.has(row.id)?'checked':'')+' '+(row.status!=='pending'?'disabled':'')+'></label><button class="review-card-main" data-review-view="'+row.id+'" aria-label="查看 '+escape(row.name)+'的入课申请"><span class="review-card-copy"><strong>'+escape(row.name)+' · '+escape(row.student)+'</strong><span class="meta">申请加入《'+escape(row.course)+'》 · '+escape(row.time)+'</span>'+(row.status==='rejected'?'<span class="review-card-rejection">驳回理由：'+escape(row.rejection)+'</span>':'')+'</span>'+badge(row)+'</button></article>').join(''):'<div class="card review-empty">暂无匹配的申请</div>';
$('review-pagination').innerHTML='<span>共 '+matches.length+' 条 · 第 '+page+' / '+pages+' 页</span><div class="inline-actions"><button class="btn small" data-review-page="'+(page-1)+'" '+(page===1?'disabled':'')+'>上一页</button>'+Array.from({length:pages},(_,i)=>i+1).filter(n=>n===1||n===pages||Math.abs(n-page)<=1).map(n=>'<button class="btn small" data-review-page="'+n+'" '+(n===page?'aria-current="page"':'')+'>'+n+'</button>').join('')+'<button class="btn small" data-review-page="'+(page+1)+'" '+(page===pages?'disabled':'')+'>下一页</button><label>每页 <select id="review-page-size" aria-label="每页条数">'+[5,10,20].map(n=>'<option '+(n===pageSize?'selected':'')+'>'+n+'</option>').join('')+'</select> 条</label></div>';
selection();detail();}
function update(targets,result,rejection=''){const time=new Date().toLocaleString('sv-SE');let count=0;targets.forEach(id=>{const row=rows.find(row=>row.id===id&&row.status==='pending');if(row){row.status=result;row.rejection=rejection;row.reviewedAt=time;selected.delete(id);count++;}});render();AdminUI.toast(result==='approved'?'已通过 '+count+' 项申请':'申请已驳回','本页演示结果，刷新后恢复。');}
$('review-filters').addEventListener('submit',event=>{event.preventDefault();filters=Object.fromEntries(new FormData(event.currentTarget).entries());Object.keys(filters).forEach(key=>filters[key]=filters[key].trim().toLowerCase());page=1;selected.clear();render();});
$('review-filters').addEventListener('reset',()=>{filters={};page=1;selected.clear();render();});
$('panel-review').addEventListener('click',event=>{
const button=event.target.closest('button'),card=event.target.closest('[data-review]');
if(button?.dataset.reviewStatus){status=button.dataset.reviewStatus;page=1;selected.clear();render();$('review-status-filters').querySelector('[data-review-status="'+status+'"]').focus();}
else if(button?.dataset.reviewPage){page=Number(button.dataset.reviewPage);render();$('review-pagination').querySelector('[aria-current="page"]').focus();}
else if(card&&!event.target.closest('.review-checkbox')){active=card.dataset.review;document.querySelectorAll('[data-review]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.review===active)));detail();}
else if(button?.id==='review-approve'){update([active],'approved');$('review-status-filters').querySelector('[data-review-status="approved"]').focus();}
else if(button?.id==='review-reject'){rejectId=active;const row=rows.find(row=>row.id===active);$('reject-target').textContent=row.name+' · '+row.course;$('reject-reason').value='';$('reject-reason').removeAttribute('aria-invalid');$('reject-error').textContent='';AdminUI.openModal('reject-modal',button);}
else if(button?.id==='review-bulk'){const targets=rows.filter(row=>selected.has(row.id)&&row.status==='pending');$('review-bulk-summary').textContent='确认通过所选 '+targets.length+' 项申请？';$('review-bulk-targets').innerHTML=targets.map(row=>'<li>'+escape(row.name)+' · '+escape(row.student)+' · '+escape(row.course)+'</li>').join('');AdminUI.openModal('review-bulk-modal',button);}});
$('panel-review').addEventListener('change',event=>{const input=event.target;if(input.dataset.reviewSelect){if(input.checked)selected.add(input.dataset.reviewSelect);else selected.delete(input.dataset.reviewSelect);selection();}else if(input.id==='review-select-page'){visible().filter(row=>row.status==='pending').forEach(row=>{if(input.checked)selected.add(row.id);else selected.delete(row.id);});render();$('review-select-page').focus();}else if(input.id==='review-page-size'){pageSize=Number(input.value);page=1;render();$('review-page-size').focus();}});
$('review-reject-form').addEventListener('submit',event=>{event.preventDefault();const reason=$('reject-reason').value.trim();if(!reason){$('reject-error').textContent='请填写驳回理由';$('reject-reason').setAttribute('aria-invalid','true');$('reject-reason').focus();return;}AdminUI.closeModal($('reject-modal'));update([rejectId],'rejected',reason);$('review-status-filters').querySelector('[data-review-status="rejected"]').focus();});
$('review-bulk-form').addEventListener('submit',event=>{event.preventDefault();AdminUI.closeModal($('review-bulk-modal'));update([...selected],'approved');$('review-select-page').focus();});
render();
})();
