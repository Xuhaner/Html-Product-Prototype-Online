(function(){
  'use strict';
  const {closeModal,toast}=window.AdminUI;

  document.querySelectorAll('[role="tablist"]').forEach(list=>{
    const tabs=[...list.querySelectorAll('[role="tab"]')];
    function activate(tab,focus){
      tabs.forEach(item=>{
        const on=item===tab;item.setAttribute('aria-selected',String(on));item.tabIndex=on?0:-1;
        const panel=document.getElementById(item.getAttribute('aria-controls'));if(panel)panel.hidden=!on;
      });
      if(focus)tab.focus();
    }
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>activate(tab,false));
      tab.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
        activate(tabs[next],true);
      });
    });
  });

  document.querySelectorAll('[data-search-table]').forEach(input=>{
    const table=document.getElementById(input.dataset.searchTable);if(!table)return;
    const rows=[...table.querySelectorAll('tbody tr')];
    const count=document.querySelector('[data-result-for="'+table.id+'"]');
    const empty=document.querySelector('[data-empty-for="'+table.id+'"]');
    function run(){
      const query=input.value.trim().toLowerCase();let visible=0;
      rows.forEach(row=>{const show=!query||row.textContent.toLowerCase().includes(query);row.hidden=!show;if(show)visible++;});
      if(count)count.textContent='共 '+visible+' 条';
      if(empty)empty.hidden=visible!==0;
      table.closest('.table-wrap').hidden=visible===0;
    }
    input.addEventListener('input',run);
    document.querySelectorAll('[data-clear-search="'+table.id+'"]').forEach(button=>button.addEventListener('click',()=>{input.value='';run();input.focus();}));
  });

  document.querySelectorAll('[data-state-target]').forEach(select=>{
    select.addEventListener('change',()=>{
      const group=document.getElementById(select.dataset.stateTarget);if(!group)return;
      group.querySelectorAll('[data-view-state]').forEach(view=>view.hidden=view.dataset.viewState!==select.value);
      const focus=group.querySelector('[data-view-state="'+select.value+'"]');if(focus){focus.tabIndex=-1;focus.focus();}
    });
  });

  document.querySelectorAll('[data-submit-demo]').forEach(button=>{
    button.addEventListener('click',()=>{
      const modal=button.closest('.modal-backdrop');
      const required=[...modal.querySelectorAll('[required]')];let valid=true;
      required.forEach(field=>{const group=field.closest('.form-group');const ok=field.type==='checkbox'?field.checked:field.value.trim();group&&group.classList.toggle('invalid',!ok);if(!ok)valid=false;});
      if(!valid){required.find(field=>!field.value.trim())?.focus();return;}
      button.disabled=true;button.textContent='处理中…';
      window.setTimeout(()=>{
        closeModal(modal);button.disabled=false;button.textContent=button.dataset.submitDemo;
        const detail=document.getElementById('review-detail');
        if(button.dataset.reviewResult&&detail){
          const item=document.querySelector('.review-item[data-review="'+detail.dataset.active+'"]');
          if(item){item.querySelector('.status').className='status danger';item.querySelector('.status').textContent='已驳回';}
        }
        toast('操作已记录','这是本地原型反馈，未写入真实系统。');
      },650);
    });
  });

  document.querySelectorAll('[data-quick-action]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.quickAction==='重新加载'){const select=document.querySelector('#state-select');select.value='success';select.dispatchEvent(new Event('change'));}toast(button.dataset.quickAction,'演示状态已更新，刷新后恢复。');}));
})();
