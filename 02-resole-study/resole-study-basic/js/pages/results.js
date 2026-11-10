const resultKind=location.hash.slice(1)||'practice';
const resultRoot=$('#results-root');
function renderResults(){
 const isCode=resultKind==='code',config=assessmentConfigs[resultKind];
 const history=isCode?(demo.codeResult?[demo.codeResult]:[]):(demo.assessments[config?.storageKey||resultKind]?.history||[]);
 if(!isCode&&!config){resultRoot.innerHTML='<div class="card flow-empty"><h1>未找到这项学习记录</h1><button class="btn primary" data-go="profile">返回个人中心</button></div>';return;}
 const r=history.at(-1),title=isCode?'词频统计器':config.title;
 if(!r){resultRoot.innerHTML=`<div class="card flow-empty"><h1>${title}</h1><p>还没有提交记录，完成一次作答后即可查看结果。</p><button class="btn primary" data-go="${config?.requiresConfirmation?'exam':isCode?'code':config?'practice':resultKind}" data-hash="${config&&config.storageKey?'#'+resultKind:''}">开始任务</button><button class="btn" data-go="${config?.returnRoute||'profile'}">${config?.returnLabel||'返回个人中心'}</button></div>`;return;}
 const best=Math.max(...history.map(x=>x.score));
 const analysis=isCode?`<h2>模拟测试用例</h2><p>${r.passed?'✓ 3 / 3 通过':'✕ 2 / 3 通过：并列最高频时应返回字典序最小的词。'}</p><p>这里展示预设方案的反馈，不执行任意 Python。可返回编程页切换示例并重新评测。</p>`:config.indices.map((index,i)=>{
  const q=questionBank[index],answer=r.answers[i],value=answer===undefined||answer===''?'':q.options?q.options[Number(answer)]:answer;
  const correct=String(answer||'').trim()===q.answer;
  return `<details class="flow-result-row"><summary>${i+1}. ${escapeHTML(q.prompt)} <span class="flow-pill">${r.pending?(answer?'已作答 · 待批阅':'未作答'):q.type==='code'?'待批阅':correct?'正确':'未答或错误'} · ${r.pending||q.type==='code'?'—':correct?config.points[i]:0} / ${config.points[i]} 分</span></summary><p>你的答案：</p><pre>${escapeHTML(value||'未作答')}</pre>${r.pending?'<p class="meta">本次考试尚未公布标准答案与解析。</p>':`<p><strong>参考答案：</strong>${escapeHTML(q.options?q.options[Number(q.answer)]:q.answer)}</p><p>${escapeHTML(q.explain)}</p>`}</details>`;
 }).join('');
 resultRoot.innerHTML=`<div class="flow-head"><div><div class="eyebrow">${config?.storageKey?'独立任务结果':'学习结果'} · 本地演示</div><h1>${title}</h1><p class="meta">${new Date(r.submittedAt).toLocaleString('zh-CN')} 提交 · 第 ${history.length} 次${r.automatic?' · 时间到自动交卷':''}</p></div><button class="btn" data-go="${config?.returnRoute||'profile'}">${config?.returnLabel||'返回个人中心'}</button></div><div class="card flow-card"><h2>${r.pending?'答卷已提交，等待批阅':'本次作答已完成'}</h2><div class="flow-score">${r.pending?'待批阅':r.score+' 分'}</div><p>${r.pending?'客观题记录已保存，程序题需要教师批阅；完整成绩与解析尚未公布。':config?.minutes&&config.limit!==Infinity?`最高成绩 ${best} 分 · 已用 ${history.length} / ${config.limit} 次机会`:'可展开下方记录查看反馈。'}</p><div class="flow-actions"><button class="btn primary" data-go="${config?.returnRoute||'learn'}">${config?.returnLabel||'继续学习'}</button>${!r.pending&&(!config||history.length<config.limit)?'<button class="btn" id="retry-result">'+(isCode?'返回修改代码':'再做一次')+'</button>':''}</div></div><section class="card flow-card" style="margin-top:24px"><h2>${isCode?'评测反馈':'作答回顾'}</h2>${analysis}</section>`;
 $('#retry-result')?.addEventListener('click',()=>{
  if(isCode){go('code');return;}
  const a=demo.assessments[config.storageKey||resultKind];a.submitted=false;a.answers=[];a.reviewed=[];a.index=0;a.startedAt=null;a.deadline=null;persistDemo();
  if(config.storageKey&&config.requiresConfirmation){demo.examModes ||= {};demo.examModes[config.storageKey]='open';persistDemo();}
  if(config.requiresConfirmation)go('exam','#'+resultKind);else go(resultKind in routes?resultKind:'practice',config.storageKey?'#'+resultKind:'');
 });
}
renderResults();
