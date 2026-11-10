const digitalLessons={
 'lesson-1-1':['1.1 信息真假与可信来源','核对发布者、证据和信息上下文，避免被标题和截图误导。'],
 'lesson-1-2':['1.2 网络诈骗与社交工程','识别仿冒身份、紧急转账、钓鱼链接和索要验证码等常见话术。'],
 'lesson-1-3':['1.3 安全使用公共网络','使用公共 Wi-Fi 时减少敏感操作，及时退出账号并检查设备权限。'],
 'lesson-2-1':['2.1 个人信息与隐私边界','区分可公开信息、个人信息和敏感个人信息，按需提供。'],
 'lesson-2-2':['2.2 账号、密码与多因素认证','为重要账号设置独立密码，并开启多因素认证。'],
 'lesson-2-3':['2.3 负责任的数字参与','理解数字足迹、平台规则与网络互动中的责任边界。']
};
if(!demo.digitalSpocJoined)go('spoc-detail','#catalog');
else{
 demo.digitalSpocCompleted=demo.digitalSpocCompleted||[];
 const buttons=$$('[data-spoc-content]');let active=location.hash.slice(1),playing=false;if(!digitalLessons[active])active='lesson-1-1';
 function renderDigitalLesson(){
  const [title,summary]=digitalLessons[active],done=demo.digitalSpocCompleted.includes(active);$('#spoc-learn-title').textContent=title;
  buttons.forEach(button=>button.classList.toggle('active',button.dataset.spocContent===active));
  $('#spoc-learning-content').innerHTML=`<div class="video spoc-video"><div><button class="play" id="spoc-play" aria-label="播放课程演示">▶</button><strong>${escapeHTML(title)}</strong><small>课程播放状态演示 · 非真实视频</small></div></div><section class="detail-section"><h2>本节要点</h2><p>${escapeHTML(summary)}</p></section>`;
  $('#spoc-play').onclick=()=>{playing=!playing;$('#spoc-play').textContent=playing?'Ⅱ':'▶';$('#spoc-play').setAttribute('aria-label',playing?'暂停课程演示':'播放课程演示');};
  const complete=$('#complete-spoc-lesson');complete.textContent=done?'✓ 本课时已完成':'标记课时完成';complete.disabled=done;$('#spoc-progress').style.width=`${Math.round(demo.digitalSpocCompleted.length/6*100)}%`;history.replaceState(null,'',new URL(`#${active}`, location.href).href);
 }
 buttons.forEach(button=>button.onclick=()=>{active=button.dataset.spocContent;playing=false;renderDigitalLesson();});
 $('#complete-spoc-lesson').onclick=()=>{
  if(!demo.digitalSpocCompleted.includes(active)){
   demo.digitalSpocCompleted.push(active);LearningActivity.record('lesson','digital:'+active,{title:digitalLessons[active][0]});
   const chapter=active.split('-')[1];
   if(Object.keys(digitalLessons).filter(id=>id.startsWith('lesson-'+chapter+'-')).every(id=>demo.digitalSpocCompleted.includes(id)))LearningActivity.record('chapter','digital:'+chapter,{title:'数字素养与安全 · 第'+chapter+'章'});
  }
  playing=false;LearningActivity.flush();persistDemo();renderDigitalLesson();showToast('本节已完成，已更新本标签页学习记录');
 };
 LearningActivity.startTimer(()=>playing);
 $('.study-head').insertAdjacentHTML('afterend','<div class="learning-growth-strip"><span>每一课的认真，都算成长。</span><a href="pages/profile/growth.html">查看学习成长 →</a></div>');
 mountCourseDiscussion($('#spoc-learning-discussion'),'课程讨论');renderDigitalLesson();
}
