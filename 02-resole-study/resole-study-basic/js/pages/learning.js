const lessons=[
 {id:'lesson-3-1',title:'3.1 条件语句',code:'score = 85\nif score >= 60:\n    print("通过")\nelse:\n    print("继续加油")'},
 {id:'lesson-3-2',title:'3.2 列表与循环',code:'numbers = [1, 2, 3, 4]\ntotal = 0\nfor number in numbers:\n    total += number\nprint(total)'},
 {id:'lesson-3-3',title:'3.3 循环嵌套',code:'rows = [[1, 2], [3, 4]]\nfor row in rows:\n    for value in row:\n        print(value)'}
];
lessons.push({id:'lesson-2-4',title:'2.4 变量与类型实战',code:'name = "林晓"\nage = 18\nprint(type(name), type(age))'}, {id:'lesson-2-5',title:'2.5 表达式与输入输出挑战',code:'price = float(input("商品价格："))\nquantity = 2\nprint("合计：", price * quantity)'});
const courseDocuments={
 pdf:{title:'Python 程序设计学习讲义.pdf',type:'PDF',pages:[
  {kicker:'PYTHON PROGRAMMING',title:'列表与循环',subtitle:'第三章 · 流程控制',points:['循环用于重复执行一组语句','列表可以保存一组有序数据','使用 for 遍历列表中的每个元素']},
  {kicker:'3.1 循环基础',title:'for 循环的基本结构',subtitle:'从序列中依次取值',points:['for 变量 in 序列','注意循环体的缩进','range 可生成整数序列']},
  {kicker:'3.2 实践示例',title:'统计及格人数',subtitle:'遍历、判断与累加',points:['初始化计数变量','逐项判断是否及格','输出最终统计结果']}
 ]},
 ppt:{title:'第三章课堂演示课件.pptx',type:'PPT',pages:[
  {kicker:'第三章',title:'列表与循环',subtitle:'Python 程序设计',points:['认识列表','掌握循环','完成一个统计小程序']},
  {kicker:'知识回顾',title:'列表是什么？',subtitle:'一种有序、可修改的数据集合',points:['使用方括号创建','下标从 0 开始','支持增、删、改、查']},
  {kicker:'课堂练习',title:'遍历成绩列表',subtitle:'scores = [86, 72, 95, 60]',points:['输出每个成绩','计算平均分','找出最高分']},
  {kicker:'本节小结',title:'从数据到结果',subtitle:'列表负责保存，循环负责处理',points:['先明确数据结构','再拆分处理步骤','最后检查边界情况']}
 ]}
};
const contentRoot=$('#learning-content'),contentButtons=$$('[data-content]');
let lessonIndex=demo.lesson??1,contentId=location.hash.slice(1)||lessons[lessonIndex]?.id||'lesson-3-2',activeButton,playing=false,elapsed=0,documentPage=0,offlineSubmission=null,previewTitle='课程内容预览';
if(![...lessons.map(item=>item.id),'pdf','ppt','download','assignment','preview'].includes(contentId))contentId='lesson-3-2';
activeButton=contentButtons.find(button=>button.dataset.content===contentId)||contentButtons.find(button=>button.dataset.content==='lesson-3-2');
contentButtons.forEach(button=>button.onclick=()=>selectContent(button.dataset.content,button));
function setHead(title,eyebrow='Python 程序设计 · 课程内容',completable=false){
 $('#learn-title').textContent=title;$('.study-head .eyebrow').textContent=eyebrow;$('#complete-lesson').hidden=!completable;
 contentButtons.forEach(button=>button.classList.toggle('active',button===activeButton));
}
function selectContent(id,button){
 contentId=id;activeButton=button;documentPage=0;playing=false;elapsed=0;
 if(id==='preview')previewTitle=button.textContent.trim();else history.replaceState(null,'',new URL(`#${id}`, location.href).href);
 renderContent();
}
function renderVideo(lesson){
 const index=lessons.indexOf(lesson);lessonIndex=index;demo.lesson=index;persistDemo();setHead(lesson.title,'Python 程序设计 · 视频课程',true);
 contentRoot.innerHTML=`<div class="video"><div style="padding:20px;max-width:100%"><p class="flow-note" style="color:#c4dbce">课程内容演示 · 非真实视频</p><pre id="lesson-code" style="text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;color:#e8f4ee">${escapeHTML(lesson.code)}</pre><button class="play" id="play-video" aria-label="播放课程演示">▶</button><small id="video-status">30 秒演示 · 点击播放，或阅读后标记完成</small></div></div>`;
 $('#play-video').onclick=()=>{playing=!playing;$('#play-video').textContent=playing?'Ⅱ':'▶';$('#play-video').setAttribute('aria-label',playing?'暂停课程演示':'播放课程演示');$('#video-status').textContent=(playing?'演示播放中':'已暂停')+` · ${elapsed} / 30 秒`;};
 const complete=$('#complete-lesson');complete.textContent=demo.completed.includes(index)?'✓ 本课时已完成':'标记课时完成';complete.disabled=demo.completed.includes(index);
}
function renderDocument(kind){
 const doc=courseDocuments[kind],page=doc.pages[documentPage];setHead(doc.title,`第三章 · ${doc.type} 课件`);
 contentRoot.innerHTML=`<div class="document-viewer inline-document"><div class="document-stage"><div class="document-canvas ${kind}" role="img" aria-label="${doc.type} 第 ${documentPage+1} 页：${escapeHTML(page.title)}"><span class="document-kicker">${escapeHTML(page.kicker)}</span><div class="document-copy"><h3>${escapeHTML(page.title)}</h3><p>${escapeHTML(page.subtitle)}</p><ul>${page.points.map(point=>`<li>${escapeHTML(point)}</li>`).join('')}</ul></div><span class="document-mark">睿秀学城 · 演示课件</span></div></div><div class="document-pager" aria-label="文档翻页"><button class="btn" data-doc-page="prev" ${documentPage===0?'disabled':''}>上一页</button><strong aria-live="polite">${documentPage+1} / ${doc.pages.length}</strong><button class="btn primary" data-doc-page="next" ${documentPage===doc.pages.length-1?'disabled':''}>下一页</button></div><p class="meta">本页为图片式课件预览示例，不解析真实 ${doc.type} 文件。</p></div>`;
}
function renderDownload(){
 setHead('Python 课程实践素材','第三章 · 配套资料');
 contentRoot.innerHTML='<section class="learning-resource"><span class="resource-file-icon pack" aria-hidden="true">ZIP</span><div><h2>Python 课程实践素材</h2><p>下载后可在本地查看和编辑，示例包包含：</p><ul><li>scores.csv · 学生成绩示例数据</li><li>practice-guide.md · 列表与循环实践说明</li><li>homework-template.docx · 线下作业模板</li></ul><p class="meta">原型使用 TXT 文件模拟资源包下载。</p><button class="btn primary" id="download-course-material">下载资料</button></div></section>';
 $('#download-course-material').onclick=()=>{downloadText('Python课程实践素材.txt','Python 课程实践素材（原型示例）\n\n1. scores.csv：学生成绩示例数据\n2. practice-guide.md：列表与循环实践说明\n3. homework-template.docx：线下作业模板\n\n本文件仅用于展示资料下载交互。');showToast('已开始下载示例资料');};
}
function renderAssignment(){
 setHead('学生成绩分析报告','第三章 · 线下文件作业');
 contentRoot.innerHTML=`<section class="learning-assignment"><div class="assignment-brief"><span class="badge neutral">${offlineSubmission?'已提交':'待提交'}</span><h2>线下完成并上传文件</h2><p>下载作业模板，在本地完成学生成绩分析报告后，上传最终文件提交。</p><p class="meta">支持 DOC、DOCX、PDF、ZIP · 不超过 10MB · 截止 2026 年 9 月 15 日 23:59</p><button class="btn primary" id="open-offline-assignment">${offlineSubmission?'重新提交':'提交作业'}</button></div><div class="assignment-history"><strong>历史提交</strong>${offlineSubmission?`<div class="submission-row"><span><b>${escapeHTML(offlineSubmission.name)}</b><small>${escapeHTML(offlineSubmission.size)} · ${escapeHTML(offlineSubmission.time)}</small></span><span class="badge">已提交</span></div>`:'<p class="meta">暂无提交记录</p>'}</div></section>`;
 $('#open-offline-assignment').onclick=openOfflineAssignment;
}
function openOfflineAssignment(){
 openFlowDialog('提交线下文件作业',`<form id="offline-assignment-form"><div class="assignment-brief"><strong>学生成绩分析报告</strong><p>请先在本地完成报告，再上传最终文件。支持 DOC、DOCX、PDF、ZIP，文件不超过 10MB。</p></div><label class="upload-drop"><span>选择要提交的作业文件</span><small id="upload-file-name">尚未选择文件</small><input id="offline-file" type="file" accept=".doc,.docx,.pdf,.zip" required></label></form>`);
 const actions=$('.dialog-actions',flowDialog);actions.innerHTML='<button class="btn" type="button" id="cancel-offline">取消</button><button class="btn primary" type="submit" form="offline-assignment-form">确认提交</button>';
 $('#cancel-offline').onclick=()=>flowDialog.close();$('#offline-file').onchange=e=>{$('#upload-file-name').textContent=e.target.files[0]?.name||'尚未选择文件';};
 $('#offline-assignment-form').onsubmit=e=>{e.preventDefault();const file=$('#offline-file').files[0];if(!file){$('#offline-file').reportValidity();return;}if(file.size>10*1024*1024){showToast('文件不能超过 10MB');return;}offlineSubmission={name:file.name,size:file.size<1024?'小于 1KB':`${Math.ceil(file.size/1024)}KB`,time:formatLearningTime(Date.now())};flowDialog.close();renderAssignment();showToast('演示作业已提交');};
}
function formatLearningTime(value){const date=new Date(value),pad=n=>String(n).padStart(2,'0');return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;}
function renderPreview(){setHead(previewTitle);contentRoot.innerHTML='<div class="video preview-video"><div><p>该课时当前展示课程内容版式。</p><strong>完整内容以后续教学资源为准</strong></div></div>';}
function renderContent(){
 const isArenaLesson=contentId.startsWith('lesson-2-');
 $('#learning-discussion').hidden=false;
 document.dispatchEvent(new CustomEvent('course-lesson-change',{detail:contentId}));
 $('.study-sidebar .progress span').style.width=Math.floor((18+demo.completed.length)/42*100)+'%';
 const lesson=lessons.find(item=>item.id===contentId);if(lesson)renderVideo(lesson);else if(courseDocuments[contentId])renderDocument(contentId);else if(contentId==='download')renderDownload();else if(contentId==='assignment')renderAssignment();else renderPreview();
}
function completeLesson(){
 if(!demo.completed.includes(lessonIndex)){
  demo.completed.push(lessonIndex);
  LearningActivity.record('lesson','python:'+lessons[lessonIndex].id,{title:lessons[lessonIndex].title});
  if([0,1,2].every(index=>demo.completed.includes(index)))LearningActivity.record('chapter','python:chapter-3',{title:'Python 程序设计 · 第三章'});
 }
 playing=false;LearningActivity.flush();persistDemo();renderContent();showToast('本节已完成，已更新本标签页学习记录');
}
LearningActivity.startTimer(()=>playing||['pdf','ppt'].includes(contentId));
$('#complete-lesson').onclick=completeLesson;
contentRoot.addEventListener('click',event=>{const pager=event.target.closest('[data-doc-page]');if(!pager)return;documentPage+=pager.dataset.docPage==='next'?1:-1;renderDocument(contentId);});
setInterval(()=>{if(!playing)return;elapsed++;$('#video-status').textContent=`演示播放中 · ${elapsed} / 30 秒`;if(elapsed>=30)completeLesson();},1000);
mountCourseDiscussion($('#learning-discussion'),'课程讨论');
renderContent();
