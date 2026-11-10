// 共享顶栏下拉；通知与通知中心复用同一数据与已读状态。
const notificationTrigger=$('.top-actions [data-go="notifications"]');
notificationTrigger.id='notification-trigger';delete notificationTrigger.dataset.go;
notificationTrigger.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path d="M6 17V9a6 6 0 0 1 12 0v8l2 2H4l2-2Zm4 5h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span class="header-unread" hidden></span>';
const accountTrigger=$('#user-entry');delete accountTrigger.dataset.go;
const headerPopups=document.createElement('div');headerPopups.className='header-popups';
headerPopups.innerHTML='<section class="header-popup notification-popup" id="notification-popup" aria-label="通知" hidden></section><section class="header-popup account-popup" id="account-popup" aria-label="个人菜单" hidden></section>';
$('.topbar').append(headerPopups);
for(const [trigger,id] of [[notificationTrigger,'notification-popup'],[accountTrigger,'account-popup']]){
 trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-expanded','false');
 trigger.onclick=()=>{const opening=$('#'+id).hidden;closeHeaderPopups();if(opening){renderHeaderPopup(id);$('#'+id).hidden=false;trigger.setAttribute('aria-expanded','true');}};
 trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();if($('#'+id).hidden)trigger.click();$('button:not([disabled])',$('#'+id))?.focus();}});
}

function closeHeaderPopups(restore=false){
 for(const [trigger,id] of [[notificationTrigger,'notification-popup'],[accountTrigger,'account-popup']]){
  const wasOpen=!$('#'+id).hidden;$('#'+id).hidden=true;trigger.setAttribute('aria-expanded','false');if(wasOpen&&restore)trigger.focus();
 }
}
function updateHeaderUnread(){
 const count=getNotificationItems().filter(x=>!demo.announcements.read.includes(x.id)).length;
 $('.header-unread',notificationTrigger).hidden=!count;
 notificationTrigger.setAttribute('aria-label',count?`通知，${count} 条未读`:'通知，无未读');
}
function renderHeaderPopup(id){
 if(id==='notification-popup'){
  const items=getNotificationItems();
  $('#'+id).innerHTML=`<h2 class="notification-heading" id="notice-heading">公告</h2><div id="notice-content" role="region" aria-labelledby="notice-heading" class="notification-scroll">${items.length?items.map(x=>`<article class="notification-row ${demo.announcements.read.includes(x.id)?'is-read':''}"><p>${escapeHTML(x.title)}，${escapeHTML(x.body)}</p><div class="notification-row-bottom"><time>${x.time}</time><button data-header-notice="${x.id}" data-route="${x.route}">查看详情 <span aria-hidden="true">›</span></button></div></article>`).join(''):`<div class="notification-empty"><svg viewBox="0 0 200 150" width="180" height="135" aria-hidden="true"><rect x="24" y="40" width="150" height="97" rx="20" fill="#f0f3f2"/><rect x="64" y="15" width="80" height="107" rx="9" fill="white" stroke="#a8bbb2" stroke-width="2" transform="rotate(8 104 68)"/><path d="m83 46 10 10 20-23M84 77h39M84 94h28" fill="none" stroke="#146c4b" stroke-width="4" stroke-linecap="round"/><circle cx="34" cy="29" r="8" fill="#d8ece1"/><path d="m163 102 5-10 5 10 10 5-10 5-5 10-5-10-10-5z" fill="#146c4b"/></svg><p>暂无相关公告</p></div>`}</div><div class="notification-footer"><button id="header-read-all" ${items.every(x=>demo.announcements.read.includes(x.id))?'disabled':''}>✓ 全部已读</button><button data-go="notifications">全部公告 ›</button></div><span class="header-sr" role="status" id="header-read-status"></span>`;
  $('#header-read-all').onclick=()=>{demo.announcements.read=items.map(x=>x.id);persistDemo();renderHeaderPopup(id);$('#header-read-status').textContent='通知已全部标记为已读';$('[data-go=notifications]',$('#notification-popup')).focus();updateHeaderUnread();if(typeof renderNotifications==='function')renderNotifications();};
  $$('[data-header-notice]').forEach(b=>b.onclick=()=>{if(!demo.announcements.read.includes(b.dataset.headerNotice))demo.announcements.read.push(b.dataset.headerNotice);persistDemo();go(b.dataset.route);});
 }else{
  const logged=prototypeState.logged,name=prototypeState.displayName||'林晓';
  $('#'+id).innerHTML=logged?`<div class="account-identity"><div class="account-avatar" aria-hidden="true">${escapeHTML(name.slice(-1))}</div><div><h2>${escapeHTML(name)}</h2><p>校内基础教学 · 评审版</p></div></div><nav class="account-links" aria-label="个人快捷入口">${[['courses','学','我的学习','blue'],['assignments','作','我的作业','green'],['wrong','错','我的错题','orange'],['exams','考','我的考试','purple']].map(([view,icon,label,color])=>`<button data-profile-target="${view}"><span class="account-icon ${color}" aria-hidden="true">${icon}</span>${label}<span class="account-chevron" aria-hidden="true">›</span></button>`).join('')}</nav><div class="account-secondary"><button data-profile-target="info"><span aria-hidden="true">⚙</span> 个人资料</button><button id="header-logout"><span aria-hidden="true">↪</span> 退出登录</button></div>`:'<div class="account-identity"><div class="account-avatar" aria-hidden="true">○</div><div><h2>欢迎来到睿秀学城</h2><p>登录后查看学习记录</p></div></div><button class="btn primary" data-auth="member">登录演示账号</button>';
  $$('[data-profile-target]').forEach(b=>b.onclick=()=>{const view=b.dataset.profileTarget;closeHeaderPopups();if(current==='profile'){openProfileView(view,true);persistDemo();}else go('profile','#'+view);});
  $('#header-logout')?.addEventListener('click',()=>{closeHeaderPopups();applyAuth(false);persistDemo();accountTrigger.focus();});
 }
}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.header-popup')&&!e.target.closest('#notification-trigger,#user-entry'))closeHeaderPopups();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(!$('#notification-popup').hidden||!$('#account-popup').hidden)){e.preventDefault();closeHeaderPopups(true);}});
document.addEventListener('focusin',e=>{if(!e.target.closest('.header-popup')&&!e.target.closest('#notification-trigger,#user-entry'))closeHeaderPopups();});
document.addEventListener('auth-changed',()=>{closeHeaderPopups();});
updateHeaderUnread();
