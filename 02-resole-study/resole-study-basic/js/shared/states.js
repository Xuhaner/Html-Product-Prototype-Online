const stateMenu=$('#state-menu'), stateToggle=$('#state-toggle');
$('#admin-entry').addEventListener('click',()=>{window.location.href=new URL('admin-prototype/index.html?role=teacher', document.baseURI).href;});
$('#super-admin-entry').addEventListener('click',()=>{window.location.href=new URL('admin-prototype/super-admin.html?role=super', document.baseURI).href;});
stateToggle.addEventListener('click',()=> {
  const open=stateMenu.classList.toggle('open');
  stateToggle.setAttribute('aria-expanded',open);
  if(open)$('button',stateMenu).focus()
}
);
document.addEventListener('keydown',e=> {
  if(e.key==='Escape'&&stateMenu.classList.contains('open')) {
    stateMenu.classList.remove('open');
    stateToggle.setAttribute('aria-expanded','false');
    stateToggle.focus()
  }
}
);
function setState(state,title,body) {
  if(state==='retry'){setState('loading');setTimeout(()=>setState('default'),600);return;}
  if(state==='default') {
    globalState.classList.remove('show');
    pages.forEach(p=>p.classList.toggle('active',p.id==='page-'+current));
    showToast('已恢复默认状态');
    return
  }
  pages.forEach(p=>p.classList.remove('active'));
  globalState.classList.add('show');
  const map= {
    loading:['<div class="spinner" aria-label="加载中"></div><div class="skeleton"></div><div class="skeleton" style="max-width:350px"></div>','正在加载课程内容','请稍候，学习进度正在同步。'],empty:['<div style="font-size:38px">◇</div>','这里还没有内容','加入课程或完成首次学习后，相关内容会出现在这里。'],error:['<div style="font-size:38px;color:var(--danger)">!</div>','课程内容加载失败','网络似乎开了小差。你的学习进度已经保存在本地。'],success:['<div style="font-size:38px;color:var(--green)">✓</div>','操作成功','学习记录已更新，可以继续下一项任务。'],disabled:['<div style="font-size:38px">⊘</div>','当前内容暂不可用','请先完成上一节课程，或等待教师开放本项内容。']
  }
  ;
  const x=map[state]||['',title,body];
  globalState.innerHTML=x[0]+'<h2>'+(title||x[1])+'</h2><p>'+(body||x[2])+'</p><button class="btn primary" data-state="default">返回原页面</button>'+(state==='error'?'<button class="btn" data-state="retry">重新加载</button>':'')+(state==='disabled'?'<button class="btn" disabled>开始学习</button>':'');
  globalState.focus?.()
}
document.addEventListener('click',e=> {
  const b=e.target.closest('[data-state]');
  if(!b)return;
  setState(b.dataset.state);
  stateMenu.classList.remove('open');
  stateToggle.setAttribute('aria-expanded','false')
}
);
