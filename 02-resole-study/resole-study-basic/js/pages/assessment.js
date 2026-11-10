const requestedKind = location.hash.slice(1);
const assessmentKind = assessmentConfigs[requestedKind] ? requestedKind : current === 'exam-paper' ? 'exam' : current;
const config = assessmentConfigs[assessmentKind];
const recordKey = config.storageKey || assessmentKind;
const record = demo.assessments[recordKey] ||= { answers:[], index:0, reviewed:[], history:[] };
const root = $('#assessment-root');
let submitting=false;
function answeredCount() { return record.answers.filter(a=>String(a||'').trim()).length; }
function questionAt(i) { return questionBank[config.indices[i]]; }
function startAttempt() {
 if(record.history.length>=config.limit)return;
 record.answers=[]; record.reviewed=[];record.index=0;record.submitted=false;
 record.startedAt=Date.now(); record.deadline=config.minutes?Date.now()+config.minutes*60000:null;
 persistDemo(); renderAssessment();
}
function renderAssessment(focus=false) {
 if(config.requiresConfirmation&&!record.startedAt){root.innerHTML=`<div class="card flow-empty"><h1>请先完成考前确认</h1><p>从考试详情阅读规则并确认开始。</p><button class="btn primary" data-go="exam" data-hash="${assessmentKind==='exam'?'':'#'+assessmentKind}">返回考试详情</button></div>`;return;}
 if(record.submitted){root.innerHTML=`<div class="card flow-empty"><div class="eyebrow">本次作答已提交</div><h1>${config.title}</h1><p>共 ${record.history.length} 次记录，答案已锁定。</p><div class="flow-actions"><button class="btn primary" data-result="${assessmentKind}">查看结果与解析</button>${record.history.length<config.limit?'<button class="btn" id="new-attempt">再做一次</button>':'<span class="meta">作答机会已用完</span>'}<button class="btn" data-go="${config.returnRoute}">${config.returnLabel}</button></div></div>`;$('#new-attempt')?.addEventListener('click',startAttempt);return;}
 if(!record.startedAt){record.startedAt=Date.now();record.deadline=config.minutes?Date.now()+config.minutes*60000:null;}
 const i=record.index,q=questionAt(i),answer=record.answers[i]||'';
 const controls=q.type==='code'?`<p class="samples">${escapeHTML(q.example)}</p><label for="answer-input">Python 代码（提交后待批阅）</label><textarea id="answer-input" spellcheck="false">${escapeHTML(answer)}</textarea>`:q.type==='text'?`<label for="answer-input">你的答案</label><input id="answer-input" type="text" value="${escapeHTML(answer)}" autocomplete="off">`:q.options.map((o,j)=>`<label class="option"><input type="radio" name="answer" value="${j}" ${answer===String(j)?'checked':''}> <span>${escapeHTML(o)}</span></label>`).join('');
 root.innerHTML=`<div class="flow-head"><div><div class="eyebrow">${config.label}</div><h1>${config.title}</h1><p class="meta">${config.indices.length} 题 · 100 分 · ${config.examLike?(config.pending?'仅 1 次；程序题待教师批阅':`最多 ${config.limit} 次，交卷即出分`):config.minutes?`最多 ${config.limit} 次，取最高成绩`:'不限次数，可即时查看解析'}</p></div><button class="btn" id="leave-assessment">暂存并${config.returnLabel}</button></div><div class="flow-layout"><section class="card flow-card"><div class="meta">第 ${i+1} / ${config.indices.length} 题 · ${config.points[i]} 分 · ${q.type==='code'?'程序设计':q.type==='text'?'填空题':'单项选择'}</div><form id="answer-form" class="flow-question" novalidate><h2 id="question-title" tabindex="-1">${escapeHTML(q.prompt)}</h2><div class="field">${controls}</div><p id="answer-error" class="flow-error" role="alert" hidden>请先作答，再查看解析。</p>${!config.examLike&&!config.minutes?'<button class="btn" type="submit">检查答案</button>':''}</form><div id="answer-feedback" role="status"></div><div class="flow-actions"><button class="btn" id="previous-question" ${i===0?'disabled':''}>上一题</button><button class="btn primary" id="next-question" ${i===config.indices.length-1?'disabled':''}>下一题</button>${i===config.indices.length-1?'<button class="btn primary" id="finish-last">完成并提交</button>':''}</div></section><aside class="card flow-card flow-summary"><h2>答题卡</h2>${config.minutes?'<div class="timer" id="assessment-timer" aria-label="剩余时间"></div>':'<p class="meta">可以反复练习，错题允许修改。</p>'}<p id="answer-progress" role="status"></p><div class="flow-nav">${config.indices.map((_,n)=>`<button data-question="${n}" aria-label="第 ${n+1} 题${record.answers[n]?'，已作答':''}" aria-current="${i===n}" class="${record.answers[n]?'answered':''}">${n+1}</button>`).join('')}</div><p class="flow-note">绿色表示已作答，深色为当前题。内容保存在本标签页。</p><button class="btn primary" id="finish-assessment">提交${config.examLike?'答卷':'本次作答'}</button><p class="flow-note">本地演示计时与评分，未接入监考或在线判题。</p></aside></div>`;
 $('#answer-form').addEventListener('input',e=>{
  if(!e.target.matches('input,textarea'))return;
  record.answers[i]=e.target.value;record.reviewed[i]=false;$('#answer-feedback').innerHTML='';$('#answer-error').hidden=true;
  updateProgress();persistDemo();
 });
 $('#answer-form').addEventListener('submit',e=>{e.preventDefault();if(config.examLike||config.minutes)return;
  if(!record.answers[i]?.trim()){ $('#answer-error').hidden=false;$('input,textarea',$('#answer-form')).focus();return; }
  record.reviewed[i]=true;showAnswerFeedback();persistDemo();
 });
 $('#previous-question').onclick=()=>moveQuestion(i-1);
 $('#next-question').onclick=()=>moveQuestion(i+1);
 $$('[data-question]').forEach(b=>b.onclick=()=>moveQuestion(Number(b.dataset.question)));
 $('#finish-assessment').onclick=confirmFinish;$('#finish-last')?.addEventListener('click',confirmFinish);
 $('#leave-assessment').onclick=()=>{persistDemo();go(config.returnRoute);};
 updateProgress();showAnswerFeedback();updateTimer();if(focus)$('#question-title').focus();
}
function updateProgress(){
 if($('#answer-progress'))$('#answer-progress').textContent=`已作答 ${answeredCount()} / ${config.indices.length} 题`;
 $$('[data-question]').forEach(b=>{const n=Number(b.dataset.question);b.classList.toggle('answered',!!record.answers[n]);b.setAttribute('aria-label',`第 ${n+1} 题${record.answers[n]?'，已作答':''}`);});
}
function showAnswerFeedback(){
 if(config.examLike||config.minutes||!record.reviewed[record.index])return;
 const q=questionAt(record.index),correct=record.answers[record.index]===q.answer;
 $('#answer-feedback').innerHTML=`<div class="flow-feedback"><strong>${correct?'✓ 回答正确':'还需改进，可直接修改答案重试'}</strong><p>${escapeHTML(q.explain)}</p></div>`;
}
function moveQuestion(index){record.index=Math.max(0,Math.min(config.indices.length-1,index));persistDemo();renderAssessment(true);}
function confirmFinish(){
 const missing=config.indices.length-answeredCount();
 openFlowDialog('确认提交本次作答？',`<p>${missing?`还有 ${missing} 题未作答，未答题计 0 分。`:'已完成所有题目。'}提交后本次答案将锁定。</p><button class="btn primary" id="confirm-submit">确认提交</button>`);
 $('#confirm-submit').onclick=()=>{flowDialog.close();finishAssessment(false);};
}
function finishAssessment(auto){
 if(submitting||record.submitted)return;submitting=true;
 const btn=$('#finish-assessment');if(btn){btn.disabled=true;btn.textContent='正在提交…';}
 setTimeout(()=>{
  const score=config.indices.reduce((sum,_,i)=>sum+(questionAt(i).type!=='code'&&String(record.answers[i]||'').trim()===questionAt(i).answer?config.points[i]:0),0);
  record.history.push({answers:[...record.answers],score,submittedAt:Date.now(),pending:!!config.pending,automatic:auto});
  if(typeof LearningActivity!=='undefined'&&!config.examLike&&answeredCount()===config.indices.length)LearningActivity.record('quiz','assessment:'+recordKey,{title:config.title,score});
  record.submitted=true;persistDemo();viewResult(assessmentKind);
 },350);
}
function updateTimer(){
 if(!record.deadline||record.submitted)return;
 const left=Math.max(0,Math.ceil((record.deadline-Date.now())/1000));
 if($('#assessment-timer'))$('#assessment-timer').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
 if(!left)finishAssessment(true);
}
renderAssessment();
if(config.minutes)setInterval(updateTimer,1000);
