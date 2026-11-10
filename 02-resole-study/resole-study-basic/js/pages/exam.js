const promise = $('#exam-promise'), startExam = $('#start-exam'), dialog = $('#exam-dialog');
const requestedExam = location.hash.slice(1);
const examKey = assessmentConfigs[requestedExam]?.requiresConfirmation ? requestedExam : 'exam';
const examConfig = assessmentConfigs[examKey];
const independentExam = !!examConfig.storageKey;
demo.examModes ||= {};
let examMode = independentExam ? demo.examModes[examKey] || 'open' : demo.examMode || 'upcoming';
if(independentExam){
  document.title=`睿秀学城 · ${examConfig.title}`;
  $('#exam-title').textContent=examConfig.title;
  $('#exam-back').dataset.go=examConfig.returnRoute;
  $('#exam-back').textContent='独立开放任务';
  const facts=$$('.exam-facts dd');
  facts[0].innerHTML='常年开放<br>可随时开始';
  facts[1].textContent=`${examConfig.minutes} 分钟`;
  facts[2].innerHTML='100 分 <small>· 60 分及格</small>';
  facts[3].innerHTML=`${examConfig.limit} 次 <small>· 取最高成绩</small>`;
  facts[4].textContent='交卷后立即公布';
  $('.exam-rules').innerHTML='<li><strong>请在规定时间内独立完成。</strong><p>开始后连续计时，离开页面不会暂停；到时自动提交当前答案。</p></li><li><strong>提交前检查全部答案。</strong><p>未作答题目按 0 分计算，提交后本次答案不可修改。</p></li><li><strong>本测评不绑定课程。</strong><p>成绩仅用于本地演示，不生成真实等级证明或认证记录。</p></li>';
  $('.exam-entry .meta').textContent='本测评不绑定课程，请预留完整的作答时间。';
  $$('.exam-entry [data-go="detail"]').forEach(button=>{button.dataset.go=examConfig.returnRoute;button.textContent=examConfig.returnLabel;});
  $('.exam-boundary').textContent='交互演示：确认后进入本地答卷；不接入真实认证、监考或等级证明服务。';
  $('#dialog-title').textContent='确认开始本次测评吗？';
  $('#dialog-title').nextElementSibling.textContent=`确认后开始 ${examConfig.minutes} 分钟计时。本次作答只保存在当前标签页。`;
}
function updateExamEntry() {
  startExam.disabled = examMode !== 'open' && !(independentExam&&examMode==='submitted');
  startExam.textContent = { upcoming: '考试尚未开始', open: '进入考试', closed: '考试已结束', submitted: independentExam?'查看结果':'已交卷' }[examMode];
  $('#exam-entry-hint').textContent = examMode === 'open'
    ? '请阅读并勾选考试承诺。'
    : { upcoming: independentExam?'开放后可进入作答。':'9 月 12 日 14:00 开放进入。', closed: '已过截止时间，无法开始新的作答。', submitted: independentExam?'本次作答已提交，请查看结果。':'答卷已提交，不能再次进入。' }[examMode];
}
function setExamMode(mode) {
  examMode = mode;
  if(independentExam)demo.examModes[examKey]=mode;else demo.examMode=mode;
  persistDemo();
  const copy = {
    upcoming: ['尚未开始', independentExam?'本次测评暂未开放，现在可以查看规则。':'考试将于 9 月 12 日 14:00 开放。现在可以查看规则并完成考前准备。'],
    open: ['可进入 · 演示', independentExam?'数据素养等级测评常年开放，请阅读须知后开始。':'当前模拟 9 月 12 日 14:00，考试已开放。请阅读考试须知，再确认进入。'],
    closed: ['已结束 · 演示', independentExam?'本次测评开放已结束。':'当前模拟考试已结束。你未参加本次考试，如有疑问请联系课程教师。'],
    submitted: ['已交卷 · 演示', independentExam?'本次成绩已生成，可前往结果页查看。':'答卷已提交，正在等待教师批阅。成绩公布后可查看考试结果。']
  }[mode];
  $('#exam-badge').textContent = copy[0];
  $('#exam-notice').textContent = copy[1];
  updateExamEntry();
}
startExam.addEventListener('click', () => {
  if(independentExam&&examMode==='submitted'){viewResult(examKey);return;}
  promise.closest('.field').classList.toggle('invalid', !promise.checked);
  promise.setAttribute('aria-invalid', String(!promise.checked));
  if (!promise.checked) { promise.focus(); return; }
  dialog.showModal();
  $('[data-close-dialog]', dialog).focus();
});
promise.addEventListener('change', () => {
  promise.closest('.field').classList.remove('invalid');
  promise.removeAttribute('aria-invalid');
});
$('[data-close-dialog]', dialog).addEventListener('click', () => dialog.close());
$('#confirm-exam').addEventListener('click', () => {
  dialog.close();
  const exam = demo.assessments[examConfig.storageKey||'exam'] ||= {answers:[],index:0,reviewed:[],history:[]};
  if(exam.submitted){viewResult(examKey);return;}
  exam.startedAt ||= Date.now(); exam.deadline ||= Date.now()+examConfig.minutes*60*1000;
  persistDemo(); go('exam-paper',independentExam?'#'+examKey:'');
});
dialog.addEventListener('close', () => startExam.focus());
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const buttons = $$('button', dialog), first = buttons[0], last = buttons.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
// 场景切换放在原型工具菜单，业务页面保持真实的时间门禁。
$('#state-menu').insertAdjacentHTML('beforeend', '<strong>考试场景演示</strong><button data-exam-mode="upcoming">考试未开始</button><button data-exam-mode="open">考试可进入</button><button data-exam-mode="closed">考试已结束</button><button data-exam-mode="submitted">已交卷待批阅</button>');
document.addEventListener('click', event => {
  const mode = event.target.closest('[data-exam-mode]');
  if (!mode) return;
  setExamMode(mode.dataset.examMode);
  $('#state-menu').classList.remove('open');
  $('#state-toggle').setAttribute('aria-expanded', 'false');
  $('#state-toggle').focus();
});

if(demo.assessments[examConfig.storageKey||'exam']?.submitted){
  if(independentExam)demo.examModes[examKey]='submitted';else demo.examMode='submitted';
}
setExamMode(independentExam?demo.examModes[examKey]||'open':demo.examMode||'upcoming');
