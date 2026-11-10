const demo = prototypeState.demo ||= {
 notes:{}, completed:[], favorites:['data','code'], checkedIn:false,
 posts:[], replies:{}, reminders:false, read:[], assessments:{}, codeResult:null
};
// 公告单独保存，兼容已有演示数据；初始保留一条未读。
demo.announcements ||= {empty:false,read:['announcement-welcome']};
demo.premiumUnlocked ||= [];
demo.accountContacts ||= {phone:'13812345678',email:''};
const seedPurchaseOrders=[];
demo.purchaseOrders ||= [];
seedPurchaseOrders.forEach(order=>{if(!demo.purchaseOrders.some(saved=>saved.id===order.id))demo.purchaseOrders.push(order);});
demo.purchaseOrders.filter(order=>order.status==='paid').forEach(order=>{if(!demo.premiumUnlocked.includes(order.contentId))demo.premiumUnlocked.push(order.contentId);});
const seedCourseComments=[
 {id:'course-comment-1',author:'周同学',time:'2 小时前',content:'为什么 range 的结束值不包含在结果里？这样设计与 Python 的切片规则有什么关系？',likes:8,replies:[{author:'陈老师',time:'1 小时前',content:'左闭右开的区间让长度始终等于“结束值减开始值”，也能和切片保持一致。'}]},
 {id:'course-comment-2',author:'李同学',time:'昨天',content:'我把外层循环理解为“行”，内层理解为“列”，这样记忆是否准确？',likes:12,replies:[{author:'王助教',time:'昨天',content:'这个类比适合二维数据，也可以画出执行顺序表继续验证。'}]},
 {id:'course-comment-3',author:'徐同学',time:'3 天前',content:'在内层循环使用 break 后，外层循环是否还会继续？',likes:5,replies:[]},
 {id:'course-comment-4',author:'林同学',time:'4 天前',content:'遍历列表时，enumerate 和 range(len(items)) 分别适合什么情况？',likes:7,replies:[]},
 {id:'course-comment-5',author:'吴同学',time:'5 天前',content:'列表推导式和普通 for 循环在可读性上应该怎么选择？',likes:4,replies:[]},
 {id:'course-comment-6',author:'郑同学',time:'6 天前',content:'如何判断循环中的累加变量应该放在循环内还是循环外？',likes:6,replies:[]},
 {id:'course-comment-7',author:'孙同学',time:'1 周前',content:'continue 跳过当前轮后，循环变量还会正常更新吗？',likes:3,replies:[]},
 {id:'course-comment-8',author:'刘同学',time:'1 周前',content:'空列表进入 for 循环时为什么不会报错？',likes:9,replies:[]},
 {id:'course-comment-9',author:'周同学',time:'1 周前',content:'嵌套循环遍历二维列表时，怎么处理每行长度不同的情况？',likes:2,replies:[]},
 {id:'course-comment-10',author:'钱同学',time:'2 周前',content:'循环的 else 子句通常用在什么场景？',likes:5,replies:[]},
 {id:'course-comment-11',author:'张同学',time:'2 周前',content:'如何避免 while 循环忘记更新条件而形成死循环？',likes:11,replies:[]},
 {id:'course-comment-12',author:'陈同学',time:'2 周前',content:'使用 zip 同时遍历两个列表时，长度不一致会发生什么？',likes:6,replies:[]}
];
demo.courseComments ||= [...(demo.posts||[]).map((post,index)=>({id:`saved-course-comment-${index}`,author:'林晓',time:'之前发表',content:[post.title,post.body].filter(Boolean).join('：'),likes:0,replies:[]})),...seedCourseComments];
function escapeHTML(value) {
 return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function persistDemo() {
 if (typeof savePageState === 'function') savePageState();
 else window.name = statePrefix + JSON.stringify(prototypeState);
}
function viewResult(kind) { go('results', '#' + kind); }
function downloadText(filename, text) {
 const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
 const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
let flowDialog, flowTrigger;
function openFlowDialog(title, content) {
 if (!flowDialog) {
  flowDialog = document.createElement('dialog'); flowDialog.className='flow-dialog';
  flowDialog.setAttribute('aria-labelledby','flow-dialog-title'); document.body.append(flowDialog);
  flowDialog.addEventListener('close',()=>{ if(flowTrigger?.isConnected) flowTrigger.focus(); });
  flowDialog.addEventListener('keydown', e=>{
   if(e.key!=='Tab')return;
   const items=$$('button:not([disabled]),input,textarea,select,a[href]',flowDialog),first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
 }
 flowTrigger=document.activeElement;
 flowDialog.innerHTML=`<div class="dialog-body"><h2 id="flow-dialog-title">${escapeHTML(title)}</h2>${content}<div class="dialog-actions"><button class="btn" id="close-flow-dialog">关闭</button></div></div>`;
 $('#close-flow-dialog').onclick=()=>flowDialog.close();
 flowDialog.showModal(); $('#close-flow-dialog').focus();
}
function mountCourseDiscussion(root,title='讨论互动') {
 if(!root)return;
 const ui={page:1,compose:false,reply:null};
 const render=()=>{
  const total=demo.courseComments.length,pages=Math.max(1,Math.ceil(total/10));ui.page=Math.min(ui.page,pages);
  const comments=demo.courseComments.slice((ui.page-1)*10,ui.page*10);
  root.innerHTML=`<div class="view-head"><div><h2>${title}</h2><p class="meta">${total} 条评论</p></div><button class="btn primary" data-comment-compose>发表评论</button></div>${ui.compose?'<form class="comment-form" data-comment-form="new"><div class="field"><label>评论内容</label><textarea name="content" required minlength="2" maxlength="500" placeholder="请输入评论内容"></textarea></div><div class="dialog-actions"><button class="btn" type="button" data-comment-cancel>取消</button><button class="btn primary" type="submit">发表</button></div></form>':''}<div class="course-comments">${comments.map(comment=>`<article class="course-comment"><div class="comment-head"><strong>${escapeHTML(comment.author)}</strong><span class="meta">${escapeHTML(comment.time)}</span></div><p>${escapeHTML(comment.content)}</p><div class="comment-actions"><button class="text-button" data-comment-reply="${comment.id}">回复</button><button class="text-button" data-comment-like="${comment.id}" aria-pressed="${!!comment.liked}">${comment.liked?'♥':'♡'} ${comment.likes||0}</button></div>${(comment.replies||[]).length?`<div class="comment-replies">${comment.replies.map(reply=>`<div class="comment-reply"><strong>${escapeHTML(reply.author)}：</strong>${escapeHTML(reply.content)}<span class="meta">${escapeHTML(reply.time)}</span></div>`).join('')}</div>`:''}${ui.reply===comment.id?`<form class="comment-form reply-form" data-comment-form="reply" data-comment-id="${comment.id}"><div class="field"><label>回复内容</label><textarea name="content" required minlength="2" maxlength="500" placeholder="回复这条评论"></textarea></div><div class="dialog-actions"><button class="btn" type="button" data-comment-cancel>取消</button><button class="btn primary" type="submit">回复</button></div></form>`:''}</article>`).join('')}</div>${pages>1?`<nav class="comment-pagination" aria-label="评论分页"><button class="btn small" data-comment-page="${ui.page-1}" ${ui.page===1?'disabled':''}>上一页</button><span>第 ${ui.page} / ${pages} 页</span><button class="btn small" data-comment-page="${ui.page+1}" ${ui.page===pages?'disabled':''}>下一页</button></nav>`:''}`;
 };
 root.onclick=event=>{
  const compose=event.target.closest('[data-comment-compose]'),cancel=event.target.closest('[data-comment-cancel]'),page=event.target.closest('[data-comment-page]'),like=event.target.closest('[data-comment-like]'),reply=event.target.closest('[data-comment-reply]');
  if(compose){ui.compose=true;ui.reply=null;render();$('textarea',root).focus();}
  if(cancel){ui.compose=false;ui.reply=null;render();}
  if(page){ui.page=Number(page.dataset.commentPage);render();}
  if(like){const comment=demo.courseComments.find(item=>item.id===like.dataset.commentLike);comment.liked=!comment.liked;comment.likes=Math.max(0,(comment.likes||0)+(comment.liked?1:-1));render();persistDemo();}
  if(reply){ui.reply=reply.dataset.commentReply;ui.compose=false;render();$('textarea',root).focus();}
 };
 root.onsubmit=event=>{
  const form=event.target.closest('[data-comment-form]');if(!form)return;event.preventDefault();
  const content=new FormData(form).get('content').trim();if(content.length<2){$('textarea',form).reportValidity();return;}
  if(form.dataset.commentForm==='new'){demo.courseComments.unshift({id:`course-comment-${Date.now()}`,author:'林晓',time:'刚刚',content,likes:0,replies:[]});ui.page=1;ui.compose=false;}
  else {const comment=demo.courseComments.find(item=>item.id===form.dataset.commentId);comment.replies.push({author:'林晓',time:'刚刚',content});ui.reply=null;}
  render();persistDemo();showToast(form.dataset.commentForm==='new'?'评论已发表':'回复已发表');
 };
 render();return {render};
}
function toggleFavorite(id) {
 if(demo.favorites.includes(id))demo.favorites=demo.favorites.filter(x=>x!==id);
 else demo.favorites.push(id);
 persistDemo(); syncCommon();
}
function syncCommon() {
 $$('[data-favorite]').forEach(b=>{
  const saved=demo.favorites.includes(b.dataset.favorite);
  b.textContent=saved?'★ 已收藏':'☆ 收藏'; b.setAttribute('aria-pressed',String(saved));
 });
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-open-exam]')) {
  if(demo.assessments.exam?.submitted){viewResult('exam');return;}
  demo.examMode='open';persistDemo();go('exam');return;
 }
 if(e.target.closest('[data-upcoming-exam]'))openFlowDialog('Python 程序设计期末考试','<p><strong>未开始</strong></p><p>考试时间：2096 年 12 月 31 日 14:00–15:00（北京时间）。</p><p>开放前可查看安排，暂不能进入作答。</p><button class="btn primary" disabled>考试尚未开始</button>');
 const favorite=e.target.closest('[data-favorite]'); if(favorite)toggleFavorite(favorite.dataset.favorite);
 const result=e.target.closest('[data-result]');if(result)viewResult(result.dataset.result);
 const preview=e.target.closest('[data-course-preview]');
 if(preview)openFlowDialog(preview.dataset.coursePreview,`<p>该课程目前展示课程资料卡，完整学习流程以 Python 程序设计为演示样例。</p><p class="meta">${escapeHTML(preview.dataset.courseMeta || '课程广场 · 开放课程')}</p><button class="btn primary" data-go="detail">体验 Python 课程完整流程</button>`);
 const cert=e.target.closest('[data-certificate]');
 if(cert)openFlowDialog('学习证书 · 示例', '<p class="flow-score">91 分</p><p>林晓 · 大学生信息素养</p><p>2026 年 6 月 20 日完成课程。本证书为演示样例，不具备真实认证效力。</p><button class="btn" id="download-certificate">下载示例凭证</button>');
 if(e.target.closest('#download-certificate'))downloadText('学习凭证-演示.txt','演示凭证（非真实证书）\n林晓\n大学生信息素养\n成绩：91 分\n完成日期：2026-06-20');
 const reminder=e.target.closest('[data-reminder]');if(reminder){demo.reminders=!demo.reminders; reminder.textContent=demo.reminders?'取消开课提醒':'设置开课提醒';persistDemo();showToast(demo.reminders?'已加入演示通知':'已取消提醒');}
});
document.addEventListener('prototype-ready',()=>{
 syncCommon();
 $('#state-menu').insertAdjacentHTML('beforeend','<button data-go="review-guide">基础教学评审说明 ↗</button>'+'<strong>完整演示</strong><button id="demo-guide">查看演示路线</button><details class="prototype-submenu"><summary>公告展示</summary><button id="show-announcements">公告</button><button id="empty-announcements">公告为空</button></details><details class="prototype-submenu" id="restore-menu"><summary>恢复演示</summary><button id="reset-announcements">重置公告</button><button id="reset-exam">重置考试</button><button id="reset-demo">重置全部数据…</button></details>');
 $('#demo-guide').onclick=()=>openFlowDialog('基础教学评审路线','<ol><li>教师端：课程列表 → 手工建课与备课，查看班级、名册和入课审核。</li><li>学生端：课程 → Python 程序设计 → 第三章视频、课件与文件作业。</li><li>完成练习、小测 → 考试详情 → 答题交卷 → 待批阅。</li><li>教师端：作业列表 / 考试列表 → 批阅与成绩发布演示。</li><li>学生端：我的学习 / 作业中心 / 我的考试回看记录。</li></ol><p>两端使用独立示例，提交和批阅不互通；本版评审页面与规则，不代表真实服务。首批需求清单可从评审首页打开。</p>');
 $('#show-announcements').onclick=()=>setAnnouncementDemo(false);
 $('#empty-announcements').onclick=()=>setAnnouncementDemo(true);
 $('#reset-announcements').onclick=()=>setAnnouncementDemo(false,true);
 $('#reset-exam').onclick=()=>{
   savePageState();
   delete demo.assessments.exam;demo.examMode='open';
   delete prototypeState.pages.exam;delete prototypeState.pages['exam-paper'];
   window.removeEventListener('pagehide',savePageState);
   window.name=statePrefix+JSON.stringify(prototypeState);
   location.href=new URL('pages/courses/detail.html#tasks', document.baseURI).href;
 };
 $('#reset-demo').onclick=()=>{
  openFlowDialog('重置本次演示？','<p>将清空本标签页新增的普通学习、购买、答题、收藏和演示记录，恢复初始状态。后台记录独立，不在本次重置范围内，请在对应页面管理。</p><button class="btn danger" id="confirm-reset-demo">确认重置</button>');
  $('#confirm-reset-demo').onclick=()=>{window.removeEventListener('pagehide',savePageState);window.name='';location.href=new URL('index.html', document.baseURI).href;};
 };
});

function getNotificationItems(){
 if(demo.announcements.empty)return [];
 return [
  {id:'announcement-exam',title:'Python 课程考试安排公告',body:'期中考试已开放演示；期末考试于 2096 年 12 月 31 日 14:00 开始。',route:'exam',time:'2026-09-09 10:00'},
  {id:'announcement-welcome',title:'秋季课程学习须知',body:'请按课程目录完成学习、练习与测验，课件可在资料页查看。',route:'resources',time:'2026-09-08 09:00'}
 ];
}
function setAnnouncementDemo(empty,reset=false){
 demo.announcements.empty=empty;
 if(reset)demo.announcements.read=['announcement-welcome'];
 persistDemo();
 if(typeof renderNotifications==='function')renderNotifications();
 if(typeof updateHeaderUnread==='function')updateHeaderUnread();
 $('#state-menu').classList.remove('open');$('#state-toggle').setAttribute('aria-expanded','false');$('#state-toggle').focus();
 showToast(reset?'公告已恢复：1 条未读':'已切换为'+(empty?'公告为空':'公告列表'));
}
