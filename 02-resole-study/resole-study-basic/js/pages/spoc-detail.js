const spocPanel=$('#spoc-content'),spocDialog=$('#spoc-application-dialog'),spocForm=$('#spoc-application-form');
const spocLessons=[
 ['第一章 · 识别数字风险',['1.1 信息真假与可信来源','1.2 网络诈骗与社交工程','1.3 安全使用公共网络']],
 ['第二章 · 保护个人信息',['2.1 个人信息与隐私边界','2.2 账号、密码与多因素认证','2.3 负责任的数字参与']]
];
const lessonModules=spocLessons.map(([chapter,lessons],chapterIndex)=>`<section class="module"><div class="module-head"><strong>${chapter}</strong><span class="badge neutral">3 节</span></div>${lessons.map((title,index)=>`<div class="lesson"><span>${title}</span><button data-spoc-action="lesson" data-lesson-id="${chapterIndex+1}-${index+1}">进入学习</button></div>`).join('')}</section>`).join('');
const spocViews={
 overview:'<section class="detail-section"><h2>课程大纲</h2><p>通过信息判断、网络风险与隐私保护案例，建立可以应用于日常学习和生活的数字素养。</p><h3>一、课程目标</h3><ol><li>识别常见的信息与网络风险。</li><li>正确管理个人信息、账号和设备权限。</li><li>在网络互动中作出负责任的判断。</li></ol><h3>二、教学内容</h3><p><strong>第一章 识别数字风险</strong></p><ul><li>信息真假与可信来源</li><li>网络诈骗与社交工程</li><li>安全使用公共网络</li></ul><p><strong>第二章 保护个人信息</strong></p><ul><li>个人信息与隐私边界</li><li>账号、密码与多因素认证</li><li>负责任的数字参与</li></ul></section>',
 catalog:`<div class="view-head"><div><h2>课程目录</h2><p class="meta">2 章 6 节，另含练习、测试和课程考试演示。</p></div><button class="btn primary" data-spoc-action="lesson" data-lesson-id="1-1">开始学习</button></div>${lessonModules}<section class="module"><div class="module-head"><strong>课程考核</strong><span class="badge neutral">3 项</span></div><div class="lesson"><span>章节练习 · 5 题</span><button data-spoc-action="practice">开始练习</button></div><div class="lesson"><span>数字安全小测 · 15 分钟</span><button data-spoc-action="test">开始测试</button></div><div class="lesson"><span>课程结课考试 · 60 分钟</span><button data-spoc-action="exam">查看规则</button></div></section>`,
 tasks:'<div class="view-head"><div><h2>作业与测验</h2><p class="meta">练、测、考集中管理。</p></div></div><div class="lesson"><span><b>章节练习</b><br><small>数字风险识别 · 5 题 · 可重复提交</small></span><button data-spoc-action="practice">开始练习</button></div><div class="lesson"><span><b>课程测试</b><br><small>数字安全小测 · 15 分钟</small></span><button data-spoc-action="test">开始测试</button></div><div class="lesson"><span><b>结课考试</b><br><small>60 分钟 · 仅 1 次机会</small></span><button data-spoc-action="exam">查看规则</button></div>',
 knowledge:renderKnowledgeGraph(["数字素养与安全", "信息判断", "隐私保护", "网络安全", "数字责任", "可信来源", "信息核验", "事实与观点", "信息边界", "账号权限", "公共网络", "社交工程", "负责任参与"]),
 notices:'<div class="view-head"><div><h2>课程公告</h2><p class="meta">共 2 条公告</p></div></div><div class="module"><div class="module-head"><strong>学习资格审核说明</strong><span class="meta">9 月 6 日</span></div><p>提交申请理由后，审核通过即可开始学习。</p></div><div class="module"><div class="module-head"><strong>第一章测试开放</strong><span class="meta">9 月 8 日</span></div><p>完成第一章后可参与测试，可作答两次。</p></div>',
 discussion:'<div id="spoc-discussion"></div>',
 team:'<div class="view-head"><div><h2>教研团队</h2><p class="meta">主讲教师与课程助教共同支持学习。</p></div></div><div class="team-grid"><div class="team-member"><span class="avatar">周</span><div><strong>周恺</strong><div class="meta">课程负责人 · 主讲教师</div></div></div><div class="team-member"><span class="avatar">陈</span><div><strong>陈玙</strong><div class="meta">主讲教师 · 信息安全</div></div></div><div class="team-member"><span class="avatar">林</span><div><strong>林悦</strong><div class="meta">课程助教 · 在线答疑</div></div></div></div>',
 results:'<div class="view-head"><div><h2>学习成果</h2><p class="meta">加入课程后展示学习进度与成绩。</p></div></div><div class="kpi-grid"><div class="kpi-card"><span>课程进度</span><strong>0%</strong></div><div class="kpi-card"><span>已学课时</span><strong>0 / 6</strong></div><div class="kpi-card"><span>测验成绩</span><strong>--</strong></div><div class="kpi-card"><span>考试成绩</span><strong>--</strong></div></div>'
};
function renderSpocAccess(){
 const joined=!!demo.digitalSpocJoined;
 $('#spoc-access').innerHTML=joined?'<span><b>已加入课程</b>，可访问课时与考核内容</span><button class="text-button" data-spoc-action="lesson" data-lesson-id="1-1">开始学习 →</button>':'<span>专属课程面向指定学习者，加入课程需提交审核</span><button class="text-button" id="open-spoc-application">申请加入课程 →</button>';
}
function openSpocView(view,focus=false){
 const button=$(`[data-spoc-view="${view}"]`,$('.spoc-nav'));if(!button||!spocViews[view])return;
 $$('.spoc-nav [data-spoc-view]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',active);item.tabIndex=active?0:-1;});
 spocPanel.innerHTML=spocViews[view];if(view==='discussion')mountCourseDiscussion($('#spoc-discussion'),'课程讨论');if(focus)spocPanel.focus();
}
function openSpocApplication(trigger){spocDialog.showModal();spocDialog.dataset.trigger=trigger.id||'';$('#spoc-reason').focus();}
function promptSpocJoin(trigger){
 openFlowDialog('需要先加入课程','<p>课程介绍和目录可以查看，课时、练习、测试和考试需审核加入后访问。</p>');
 $('.dialog-actions',flowDialog).innerHTML='<button class="btn" id="close-flow-dialog">暂不加入</button><button class="btn primary" id="start-spoc-application">申请加入</button>';
 $('#close-flow-dialog').onclick=()=>flowDialog.close();$('#start-spoc-application').onclick=()=>{flowDialog.close();openSpocApplication(trigger);};
}
function runSpocAction(action,trigger,lessonId='1-1'){
 if(!demo.digitalSpocJoined){promptSpocJoin(trigger);return;}
 if(action==='lesson')go('spoc-learn',`#lesson-${lessonId}`);else go(action);
}
document.addEventListener('click',event=>{
 const view=event.target.closest('[data-spoc-view]');if(view){event.preventDefault();openSpocView(view.dataset.spocView,true);return;}
 const apply=event.target.closest('#open-spoc-application');if(apply){openSpocApplication(apply);return;}
 const action=event.target.closest('[data-spoc-action]');if(action)runSpocAction(action.dataset.spocAction,action,action.dataset.lessonId);
});
$$('.spoc-nav [data-spoc-view]').forEach(button=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('.spoc-nav [data-spoc-view]'),index=tabs.indexOf(button),next=event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):tabs[(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];openSpocView(next.dataset.spocView);next.focus();}));
$('#cancel-spoc-application').onclick=()=>spocDialog.close();
spocDialog.addEventListener('cancel',event=>{event.preventDefault();spocDialog.close();});
spocDialog.addEventListener('close',()=>$('#open-spoc-application')?.focus());
spocDialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const items=$$('button:not([disabled]),textarea',spocDialog),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
spocForm.onsubmit=event=>{
 event.preventDefault();$('#spoc-application-error').textContent='';if(!spocForm.reportValidity())return;
 const submit=$('button[type="submit"]',spocForm);submit.disabled=true;submit.textContent='审核中…';
 setTimeout(()=>{demo.digitalSpocJoined=true;persistDemo();spocDialog.close();submit.disabled=false;submit.textContent='提交审核';renderSpocAccess();openFlowDialog('已加入课程','<p>申请已提交并完成模拟审核，现在可以使用完整课程功能。</p><button class="btn primary" data-flow-spoc-learn>开始学习</button>');$('[data-flow-spoc-learn]').onclick=()=>go('spoc-learn','#lesson-1-1');},600);
};
renderSpocAccess();openSpocView(location.hash==='#catalog'?'catalog':'overview');
