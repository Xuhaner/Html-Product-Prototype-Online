/* Shared record-table and form interactions. Business fields and sample records live in pages/. */
window.AdminManager={mount(config){
 const root=document.querySelector('#management-root'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let section=config.sections.find(s=>s.id===location.hash.slice(1))||config.sections[0],editing=null,query='',status='',viewingRecords=false;
 if(location.hash.slice(1)!==section.id)history.replaceState(null,'','#'+section.id);
 const localSection=entry=>{const target=new URL(entry.href,location.href);return target.pathname===location.pathname?config.sections.find(s=>s.id===target.hash.slice(1)):null;};
 let tabGroup='';
 const sectionLabel=()=>{const context=AdminUI.navigationFor('#'+section.id);return context&&!context.detail?context.entry.label:section.title;};
 const modal=document.querySelector('#record-modal'),form=document.querySelector('#record-form');
 root.innerHTML=`<div class="management-summary"><span class="status info">独立管理演示</span><p>${esc(config.description)} 编辑结果仅在本页保留，刷新恢复，不会同步学生端。</p></div><div class="tabs" role="tablist" aria-label="管理栏目"></div><section id="management-panel" role="tabpanel"><div class="manage-heading"><div><h2 id="section-title"></h2><p id="section-description" class="meta"></p></div><button class="btn primary" id="new-record">＋ 新增</button></div><nav id="manage-related" class="manage-related" aria-label="关联配置入口"></nav><div class="toolbar"><div class="search"><input id="manage-search" type="search" aria-label="搜索当前模块" placeholder="搜索名称、关联对象或内容"></div><select id="manage-status" aria-label="筛选状态"><option value="">全部状态</option></select><span id="manage-count" class="result"></span><button class="btn" id="reset-search">清除筛选</button></div><div class="card table-wrap"><table id="manage-table"></table></div><div class="card empty-state" id="manage-empty" hidden><h2>没有匹配的记录</h2><p>可以清除筛选，或新增一条演示记录。</p></div><p class="meta" id="manage-feedback" role="status"></p></section>`;
 const field=(f,value)=>{const id='record-'+f.key,common=`id="${id}" name="${f.key}" ${f.required?'required':''}`;let control;
 if(f.type==='output')control=`<output class="field" ${common}>${esc(value)}</output>`;
 else if(f.options)control=`<select ${common}>${f.options.map(o=>`<option ${String(value)===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
 else if(f.type==='textarea')control=`<textarea ${common} rows="4">${esc(value)}</textarea>`;
 else control=`<input ${common} type="${f.type||'text'}" value="${esc(value)}" ${f.type==='number'?`min="${f.min??(['order','count','pages','current','batch','opponents','rounds'].includes(f.key)?1:0)}" step="${['amount','price'].includes(f.key)?'0.01':'1'}" ${f.key==='accuracy'?'max="100"':''}`:''}>`;
 return `<div class="form-group ${f.type==='textarea'?'full':''}"><label for="${id}">${esc(f.label)}${f.required?' *':''}</label>${control}${f.hint?`<small>${esc(f.hint)}</small>`:''}</div>`;};
 function render(){
  const context=AdminUI.navigationFor('#'+section.id),tabs=root.querySelector('.tabs');
  const key=context&&!context.detail?context.group:'detail';
  if(key!==tabGroup){
   tabGroup=key;
   const entries=context&&!context.detail?context.children:config.sections.map(s=>({label:s.title,href:'#'+s.id}));
   tabs.setAttribute('aria-label',context&&!context.detail?context.group:'课程内容配置');
   tabs.innerHTML=entries.map(entry=>{const own=localSection(entry);return own?`<button class="tab" role="tab" id="tab-${own.id}" aria-controls="management-panel" data-section="${own.id}">${esc(entry.label)}</button>`:`<a class="tab" role="tab" aria-selected="false" tabindex="-1" href="${esc(AdminUI.linkUrl(entry.href))}">${esc(entry.label)}</a>`;}).join('');
  }
  AdminUI.setNavigationHeading(context,context?.detail?section.title:'');
  root.querySelector('.management-summary p').textContent=section.description+' 编辑结果仅在本页保留，刷新恢复，不会同步学生端。';
  document.dispatchEvent(new Event('admin-section-change'));
  document.querySelectorAll('[data-section]').forEach(b=>{const on=b.dataset.section===section.id;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});
  document.querySelector('#management-panel').setAttribute('aria-labelledby','tab-'+section.id);
  document.querySelector('#section-title').textContent=sectionLabel();document.querySelector('#section-description').textContent=section.description;
  document.querySelector('#manage-related').innerHTML=(section.related||[]).filter(link=>window.AdminUI.canVisit(link.href)).map(link=>`<a class="btn small" href="${esc(link.href)}">${esc(link.label)} →</a>`).join('');
  document.querySelector('#new-record').hidden=!!section.readonly||section.create===false;document.querySelector('#new-record').textContent='＋ '+(section.createLabel||'新增记录');
  const filter=document.querySelector('#manage-status'),statusField=section.fields.find(f=>f.key==='status');
  filter.hidden=!statusField;filter.innerHTML='<option value="">全部状态</option>'+(statusField?.options||[]).map(s=>`<option ${s===status?'selected':''}>${esc(s)}</option>`).join('');
  const rows=section.rows.map((r,i)=>({r,i})).filter(({r})=>(!query||Object.values(r).join(' ').toLowerCase().includes(query))&&(!status||r.status===status));
  const columns=section.columns||section.fields.slice(0,3).map(f=>f.key),fByKey=k=>section.fields.find(f=>f.key===k);
  document.querySelector('#manage-table').innerHTML=`<thead><tr>${columns.map(k=>`<th>${esc(fByKey(k)?.label||k)}</th>`).join('')}<th>操作</th></tr></thead><tbody>${rows.map(({r,i})=>`<tr>${columns.map(k=>`<td>${k==='status'?`<span class="status ${/已发布|已上架|已通过|正常|进行中|已支付/.test(r[k])?'success':'neutral'}">${esc(r[k])}</span>`:esc(r[k])}</td>`).join('')}<td><div class="inline-actions"><button class="btn small" data-edit="${i}">${section.readonly?'查看记录':section.editLabel||'配置 / 编辑'}</button>${section.records?`<button type="button" class="btn small" data-records="${i}">${esc(section.records.label)}</button>`:''}${section.link?`<a class="btn small" href="${esc(section.link)}?course=${encodeURIComponent(r.name)}">课程工作区</a>`:''}</div></td></tr>`).join('')}</tbody>`;
  document.querySelector('#manage-table').closest('.table-wrap').hidden=!rows.length;document.querySelector('#manage-empty').hidden=!!rows.length;
  document.querySelector('#manage-count').textContent=`共 ${rows.length} 条`;
 }
 function open(index,button){viewingRecords=false;editing=index;const record=index===null?{}:section.rows[index];document.querySelector('#record-title').textContent=(section.readonly?'查看':index===null?'新增':'编辑')+' · '+sectionLabel();
  document.querySelector('#record-description').textContent=section.description;
  document.querySelector('#record-fields').innerHTML=section.fields.map(f=>field(f,record[f.key]??f.default??f.options?.[0]??'')).join('');
  document.querySelector('#record-save').hidden=!!section.readonly;form.querySelectorAll('input,select,textarea').forEach(f=>f.disabled=!!section.readonly);
  document.querySelector('#record-error').textContent='';window.AdminUI.openModal('record-modal',button);
 }
 function openRecords(index,button){
  viewingRecords=true;
  const record=section.rows[index],details=section.records,rows=details.rows(record);
  document.querySelector('#record-title').textContent=record.name+' · '+details.label;
  document.querySelector('#record-description').textContent='当前项目的只读演示记录，不与学生端联动。';
  document.querySelector('#record-fields').innerHTML=rows.length?`<div class="form-group full record-history table-wrap" tabindex="0" role="region" aria-label="${esc(details.label)}"><table><thead><tr>${details.fields.map(f=>`<th scope="col">${esc(f.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${details.fields.map(f=>`<td>${esc(row[f.key])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<p class="form-group full">当前项目暂无记录。</p>';
  document.querySelector('#record-save').hidden=true;document.querySelector('#record-error').textContent='';
  AdminUI.openModal('record-modal',button);
 }
 root.addEventListener('click',e=>{const tab=e.target.closest('[data-section]');if(tab){if(tab.dataset.section===section.id)return;section=config.sections.find(s=>s.id===tab.dataset.section);query='';status='';document.querySelector('#manage-search').value='';history.pushState(null,'','#'+section.id);render();root.querySelector(`[data-section="${section.id}"]`).focus({preventScroll:true});}
  const edit=e.target.closest('[data-edit]');if(edit)open(Number(edit.dataset.edit),edit);
  const records=e.target.closest('[data-records]');if(records)openRecords(Number(records.dataset.records),records);
 });
 root.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...root.querySelectorAll('.tabs [role=tab]')],i=tabs.indexOf(e.target);if(i<0)return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;const target=tabs[n];target.click();(root.querySelector(`[data-section="${section.id}"]`)||target).focus({preventScroll:true});});
 window.addEventListener('hashchange',()=>{const next=config.sections.find(s=>s.id===location.hash.slice(1))||config.sections[0];if(location.hash.slice(1)!==next.id)history.replaceState(null,'','#'+next.id);section=next;query='';status='';document.querySelector('#manage-search').value='';render();root.querySelector(`[data-section="${section.id}"]`).focus({preventScroll:true});});
 document.querySelector('#manage-search').oninput=e=>{query=e.target.value.trim().toLowerCase();render();};document.querySelector('#manage-status').onchange=e=>{status=e.target.value;render();};document.querySelector('#reset-search').onclick=()=>{query='';status='';document.querySelector('#manage-search').value='';render();};document.querySelector('#new-record').onclick=e=>open(null,e.currentTarget);
 form.onsubmit=e=>{e.preventDefault();if(section.readonly||viewingRecords)return;const record=Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,['id','account'].includes(key)?String(value).trim():value]));
  form.querySelectorAll('[aria-invalid]').forEach(f=>{f.removeAttribute('aria-invalid');f.removeAttribute('aria-describedby');});
  document.querySelector('#record-error').textContent='';
  const fail=(key,message)=>{document.querySelector('#record-error').textContent=message;const control=form.elements[key];if(control){control.setAttribute('aria-invalid','true');control.setAttribute('aria-describedby','record-error');control.focus();}};
  const empty=section.fields.find(f=>f.required&&!String(record[f.key]||'').trim());if(empty){fail(empty.key,'请填写'+empty.label);return;}
  if(record.start&&record.end&&record.end<record.start){fail('end','结束时间不能早于开始时间。');return;}
  const error=config.validate?.(record,section,editing);if(error){fail(error.key,error.message);return;}
  if(editing===null)section.rows.push(record);else section.rows[editing]=record;
  const buttonIndex=editing;window.AdminUI.closeModal(modal);render();(buttonIndex===null?document.querySelector('#new-record'):root.querySelector(`[data-edit="${buttonIndex}"]`)||document.querySelector('#manage-search')).focus();
  document.querySelector('#manage-feedback').textContent='已保存本页演示记录；刷新后恢复。';window.AdminUI.toast('已保存','当前模块的演示记录已更新。');
 };
 render();
}};
