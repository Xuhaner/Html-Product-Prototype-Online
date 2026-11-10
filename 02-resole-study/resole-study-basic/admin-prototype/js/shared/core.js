(function(){
  'use strict';
  const page=document.body.dataset.page==='course-editor'?'content':document.body.dataset.page;
  const sidebar=document.querySelector('.sidebar');
  const overlay=document.querySelector('.mobile-overlay');
  const menu=document.querySelector('.menu-toggle');
  const toastRegion=document.querySelector('.toast-region');
  let lastTrigger=null;

  const platformOnly=document.body.hasAttribute('data-platform-only');
  const requestedRole=new URLSearchParams(location.search).get('role');
  const role=requestedRole==='super'?'super':requestedRole==='teacher'?'teacher':platformOnly?'super':'teacher';
  const isSuper=role==='super';
  document.body.dataset.adminRole=role;
  if(page==='dashboard'&&isSuper){location.replace('super-admin.html?role=super');}
  if(platformOnly&&!isSuper){location.replace('index.html?role=teacher');}
  const teacherPages=new Set(['index.html','content.html','course-editor.html','smart-build.html','classes.html','classroom.html','assessments.html','practice.html','choice-bank.html','fill-bank.html','program-bank.html','sql-bank.html','members.html','governance.html','profile.html']);
  const linkUrl=(href,mode=role)=>{
    const url=new URL(href,location.href);
    if(url.origin!==location.origin||url.pathname.slice(0,url.pathname.lastIndexOf('/')+1)!==location.pathname.slice(0,location.pathname.lastIndexOf('/')+1)||!url.pathname.endsWith('.html'))return href;
    if(!url.searchParams.has('role'))url.searchParams.set('role',mode);
    return url.pathname.split('/').pop()+url.search+url.hash;
  };
  const canVisit=href=>{
    if(isSuper)return true;
    const target=new URL(href,location.href),filename=target.pathname.split('/').pop();
    if(!teacherPages.has(filename))return false;
    if(filename==='classroom.html')return true;
    const sections=teacherNav.flatMap(entry=>entry.children||[entry]).map(entry=>new URL(entry.href,location.href)).filter(url=>url.pathname===target.pathname&&url.hash);
    return !target.hash||!sections.length||sections.some(url=>url.hash===target.hash);
  };
  const item=(label,href,icon='')=>({label,href,icon});
  const group=(label,icon,children)=>({label,icon,children});
  const teacherNav=[item('教学工作台','index.html','▦'),group('我的课程','▤',[item('课程列表','content.html#courses'),item('专属课程入课审核','governance.html')]),group('我的班级','◎',[item('班级列表','classes.html#classes'),item('学生名册','classes.html#students')]),group('作业与测评','✓',[item('作业列表','assessments.html#tasks'),item('考试列表','assessments.html#exams')]),group('教学题库','◇',[item('选择题','choice-bank.html'),item('填空题','fill-bank.html')])];
  const superNav=[item('平台总览','super-admin.html','▦'),group('用户管理','◎',[item('学生账号','users.html#students'),item('教师账号','users.html#teachers'),item('管理员账号','users.html#admins')]),group('课程管理','▤',[item('课程列表','content.html#courses'),item('专属课程入课审核','governance.html')]),group('班级管理','◎',[item('班级列表','classes.html#classes'),item('学生名册','classes.html#students')]),group('作业与测评','✓',[item('作业列表','assessments.html#tasks'),item('考试列表','assessments.html#exams')]),group('教学题库','◇',[item('选择题','choice-bank.html'),item('填空题','fill-bank.html')])];
  const entries=isSuper?superNav:teacherNav;
  // Sidebar, page tabs and headings all resolve the same navigation ownership.
  const navigationFor=(href=location.href)=>{
    const target=new URL(href,location.href);
    if(target.pathname.endsWith('/course-editor.html')){
      const parent=entries.find(parent=>parent.children?.some(entry=>entry.href==='content.html#courses'));
      return {group:parent.label,entry:parent.children[0],children:parent.children,detail:true};
    }
    const matches=entries.flatMap(parent=>(parent.children||[parent]).map(entry=>({parent,entry}))).filter(({entry})=>new URL(entry.href,location.href).pathname===target.pathname);
    const match=matches.find(({entry})=>new URL(entry.href,location.href).hash===(target.pathname.endsWith('/classroom.html')?'#sessions':target.hash))||matches.find(({entry})=>!new URL(entry.href,location.href).hash)||(!target.hash?matches[0]:null);
    return match?{group:match.parent.label,entry:match.entry,children:match.parent.children||[match.entry],detail:!new URL(match.entry.href,location.href).hash}:null;
  };
  function setNavigationHeading(context,detailTitle=''){
    if(!context)return;
    const crumb=document.querySelector('.crumb');
    crumb.replaceChildren(document.createTextNode(context.group));
    const trail=document.createElement('span');trail.textContent=' / '+context.entry.label+(detailTitle?' / '+detailTitle:'');crumb.append(trail);
    document.title='睿秀学城管理端 · '+context.group+' · '+context.entry.label+(detailTitle?' · '+detailTitle:'');
    if(!context.detail){
      const heading=document.querySelector('.page-head h1'),subtitle=document.querySelector('.page-head h1 + p');
      if(heading)heading.textContent=context.group;
      if(subtitle)subtitle.textContent=context.entry.label+' · 管理配置与业务记录';
    }
  }
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const navLink=entry=>`<a href="${esc(linkUrl(entry.href))}" data-admin-nav><span class="nav-icon" aria-hidden="true">${entry.icon||'·'}</span><span>${esc(entry.label)}</span></a>`;
  sidebar.innerHTML=`<a class="brand" href="${isSuper?'super-admin':'index'}.html?role=${role}"><span class="brand-mark">睿</span><span>睿秀学城<small>${isSuper?'平台管理中心':'教学管理平台'}</small></span></a><div class="sidebar-mode"><span class="status ${isSuper?'info':'success'}">${isSuper?'超级管理员':'教师管理端'}</span><small>${isSuper?'全平台管理范围':'本人负责的教学范围'}</small></div><nav class="nav mode-nav" aria-label="${isSuper?'平台管理':'教学管理'}">${entries.map((entry,i)=>entry.children?`<div class="nav-group"><button class="nav-group-toggle" aria-expanded="false" aria-controls="nav-group-${i}"><span class="nav-icon" aria-hidden="true">${entry.icon}</span><span>${entry.label}</span><span class="nav-chevron" aria-hidden="true">⌄</span></button><div class="nav-children" id="nav-group-${i}" hidden>${entry.children.map(navLink).join('')}</div></div>`:navLink(entry)).join('')}</nav><div class="side-foot"><a href="../index.html">↗ 查看学生端</a><small>本地原型 · 数据与权限均为演示</small></div>`;
  function updateNav(){
    const filename=location.pathname.split('/').pop(),hash=location.hash;
    const links=[...sidebar.querySelectorAll('[data-admin-nav]')];
    const matching=links.filter(a=>new URL(a.href).pathname.split('/').pop()===(filename==='course-editor.html'?'content.html':filename));
    const current=matching.find(a=>new URL(a.href).hash===(filename==='course-editor.html'?'#courses':filename==='classroom.html'?'#sessions':hash))||matching.find(a=>!new URL(a.href).hash)||(!hash?matching[0]:null);
    links.forEach(a=>{const on=a===current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const parent=current?.closest('.nav-group');
    sidebar.querySelectorAll('.nav-group').forEach(group=>group.classList.toggle('current',group===parent));
    if(!document.querySelector('#management-root')?.children.length)setNavigationHeading(navigationFor());
    if(parent){parent.querySelector('button').setAttribute('aria-expanded','true');parent.querySelector('.nav-children').hidden=false;}
  }
  updateNav();window.addEventListener('hashchange',updateNav);document.addEventListener('admin-section-change',updateNav);
  sidebar.querySelectorAll('.nav-group-toggle').forEach(button=>button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));document.getElementById(button.getAttribute('aria-controls')).hidden=!expanded;
  }));
  const modeMenu=document.createElement('details');modeMenu.className='admin-mode-menu';
  modeMenu.innerHTML=`<summary>查看管理端 <span aria-hidden="true">⌄</span></summary><div><a href="index.html?role=teacher" ${!isSuper?'aria-current="true"':''}>教师管理端${!isSuper?' ✓':''}</a><a href="super-admin.html?role=super" ${isSuper?'aria-current="true"':''}>超级管理员${isSuper?' ✓':''}</a></div>`;
  document.querySelector('.top-actions').prepend(modeMenu);
  const user=document.querySelector('.admin-user');
  const userMenu=document.createElement('details');userMenu.className='admin-user-menu';
  const name=isSuper?'平台管理员':'陈若云',roleLabel=isSuper?'超级管理员':'任课教师';
  userMenu.innerHTML=`<summary aria-label="账号菜单"><span class="avatar">${isSuper?'管':'陈'}</span><span class="admin-user-copy"><strong>${name}</strong><small>${roleLabel}</small></span><span class="user-chevron" aria-hidden="true">⌄</span></summary><div class="admin-user-dropdown"><a href="profile.html?role=${role}" ${page==='profile'?'aria-current="page"':''}><span aria-hidden="true">◎</span>个人中心</a><button type="button" id="admin-sign-out"><span aria-hidden="true">⏻</span>退出系统</button></div>`;
  if(user)user.replaceWith(userMenu);else document.querySelector('.top-actions').append(userMenu);
  function setUser(name,image){
    userMenu.querySelector('strong').textContent=name;
    const avatar=userMenu.querySelector('.avatar');avatar.replaceChildren();
    if(image){const img=document.createElement('img');img.src=image;img.alt='';avatar.append(img);}else avatar.textContent=name.slice(0,1);
  }
  userMenu.querySelector('#admin-sign-out').addEventListener('click',()=>{AdminAuth.signOut(role);});
  if(!isSuper){document.querySelectorAll('.top-actions>.icon-button').forEach(a=>a.remove());}
  const accountMenus=[modeMenu,userMenu];
  accountMenus.forEach(current=>current.addEventListener('toggle',()=>{if(current.open)accountMenus.forEach(other=>{if(other!==current)other.open=false;});}));
  document.addEventListener('click',e=>accountMenus.forEach(current=>{if(!current.contains(e.target))current.open=false;}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')accountMenus.forEach(current=>{if(current.open){current.open=false;current.querySelector('summary').focus();}});});
  function decorateLinks(root){
    const anchors=[...(root.matches?.('a[href]')?[root]:[]),...root.querySelectorAll('a[href]')];
    anchors.forEach(a=>{a.setAttribute('href',linkUrl(a.getAttribute('href')));});
  }
  decorateLinks(document);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)decorateLinks(node);}))).observe(document.body,{childList:true,subtree:true});
  if(!isSuper&&!['dashboard','profile'].includes(page)){
    const note=document.createElement('div');note.className='scope-note';note.textContent=['smart-build','course-editor'].includes(document.body.dataset.page)||(page==='content'&&location.hash!=='#resources')?'教师视角 · 本人负责课程与本标签页新建课程；课程草稿可跨页继续，不执行真实权限校验。':'教师视角 · 仅展示本人负责的教学示例，刷新恢复；不执行真实权限校验。';document.querySelector('.page-head')?.after(note);
  }

  function setSidebar(open){
    if(!sidebar)return;
    sidebar.classList.toggle('open',open);
    overlay.hidden=!open;
    menu&&menu.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('admin-drawer-open',open);
    if(open){sidebar.querySelector('a').focus();}else{menu&&menu.focus();}
  }

  function toast(title,message){
    const item=document.createElement('div');
    item.className='toast';item.setAttribute('role','status');
    const heading=document.createElement('strong'),body=document.createElement('span');heading.textContent=title;body.textContent=message;item.append(heading,body);
    toastRegion.appendChild(item);
    window.setTimeout(()=>item.remove(),3200);
  }

  function openModal(id,trigger){
    const modal=document.getElementById(id);if(!modal)return;
    lastTrigger=trigger||document.activeElement;modal.hidden=false;
    document.body.style.overflow='hidden';
    const focusable=modal.querySelector('input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[contenteditable=true]')||modal.querySelector('button:not(:disabled)');focusable&&focusable.focus();
  }

  function closeModal(modal){
    if(!modal)return;modal.hidden=true;document.body.style.overflow='';
    if(lastTrigger&&document.contains(lastTrigger))lastTrigger.focus();
  }

  sidebar.addEventListener('keydown',event=>{
    if(!sidebar.classList.contains('open')||event.key!=='Tab')return;
    const items=[...sidebar.querySelectorAll('a,button')].filter(el=>!el.closest('[hidden]'));
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  sidebar.addEventListener('click',event=>{if(event.target.closest('a')&&sidebar.classList.contains('open'))setSidebar(false);});
  menu&&menu.addEventListener('click',()=>setSidebar(!sidebar.classList.contains('open')));
  overlay&&overlay.addEventListener('click',()=>setSidebar(false));
  document.addEventListener('click',event=>{
    const opener=event.target.closest('[data-open]');if(opener)openModal(opener.dataset.open,opener);
    const closer=event.target.closest('[data-close]');if(closer)closeModal(closer.closest('.modal-backdrop'));
    if(event.target.classList.contains('modal-backdrop'))closeModal(event.target);
  });
  document.querySelectorAll('.modal-backdrop').forEach(backdrop=>{
    backdrop.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();closeModal(backdrop);return;}
      if(event.key!=='Tab')return;
      const focusable=[...backdrop.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contenteditable=true],a[href]')].filter(el=>!el.closest('[hidden]'));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar&&sidebar.classList.contains('open'))setSidebar(false);});

  window.AdminUI={openModal,closeModal,toast,role,isSuper,canVisit,linkUrl,setUser,navigationFor,setNavigationHeading,navigationEntries:entries};
})();
