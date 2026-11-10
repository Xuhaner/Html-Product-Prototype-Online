// 公共导航与原型状态控件：所有页面只维护这一份。
document.querySelector('#site-header').outerHTML = `<header class="topbar">
  <button class="brand" data-go="home" aria-label="返回基础教学首页"><span class="brand-mark">睿</span>睿秀学城</button>
  <nav class="mainnav" aria-label="主导航">
    <button class="navbtn" data-go="home">首页</button><button class="navbtn" data-go="courses">课程</button>
  </nav>
  <div class="top-actions"><button class="iconbtn" data-go="notifications" aria-label="通知">♢</button><button class="iconbtn" data-focus-search aria-label="搜索">⌕</button><button class="avatar" id="user-entry" data-go="profile" aria-label="个人中心">林</button></div>
</header>`;
document.querySelector('#site-footer').outerHTML = `<nav class="mobile-nav" aria-label="移动端导航">
  <button data-go="home">首页</button><button data-go="courses">课程</button>
</nav>
<div class="statusbar">
  <div class="state-menu" id="state-menu"><button id="admin-entry">教师管理端 ↗</button><button id="super-admin-entry">超级管理员 ↗</button><strong>用户身份</strong><button data-auth="member">● 登录用户</button><button data-auth="guest">○ 未登录访客</button><details class="prototype-submenu" id="theme-menu"><summary>主题色</summary><button data-theme="forest" aria-pressed="true">✓ 学城绿</button><button data-theme="blue" aria-pressed="false">○ 学术蓝</button><button data-theme="warm" aria-pressed="false">○ 人文棕</button><button data-theme="violet" aria-pressed="false">○ 科技紫</button><button data-theme="teal" aria-pressed="false">○ 湖水青</button><button data-theme="rose" aria-pressed="false">○ 蔷薇红</button></details><details class="prototype-submenu" id="page-state-menu"><summary>验证页面状态</summary><button data-state="default">✓ 默认状态</button><button data-state="loading">◌ 加载状态</button><button data-state="empty">◇ 空状态</button><button data-state="error">! 错误状态</button><button data-state="success">✓ 成功状态</button><button data-state="disabled">⊘ 禁用状态</button></details></div>
  <button class="status-toggle" id="state-toggle" aria-expanded="false" aria-controls="state-menu">原型状态</button>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
const shellPage=document.body.dataset.page==='requirements'?'home':document.body.dataset.page;
const shellActiveRoute=(['paid-course','paid-learn','interaction-classroom','ai-learning'].includes(shellPage)&&new URLSearchParams(location.search).get('from')==='programming')?'programming':(shellPage.startsWith('feature-')||(['paid-course','paid-learn'].includes(shellPage)&&new URLSearchParams(location.search).get('from')==='features'))?'features':['code','programming-course','problem-set'].includes(shellPage)?'programming':(shellPage.startsWith('spoc-')||['detail','learn','paid-course','paid-learn','data-detail','data-classroom','interaction-classroom','ai-learning','python-foundations','python-ai'].includes(shellPage))?'courses':['task-topic','task-topics','open-tasks'].includes(shellPage)?'tasks':shellPage;
document.querySelectorAll('.mainnav [data-go],.mobile-nav [data-go]').forEach(button=>button.classList.toggle('active',button.dataset.go===shellActiveRoute));
