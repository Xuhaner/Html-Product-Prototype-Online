/* Shared initialization for the related course preparation and smart-build pages. */
window.AdminPreparationModel={create(config,course,model){
 const find=id=>config.sections.find(s=>s.id===id),clone=v=>JSON.parse(JSON.stringify(v));
 const catalog=clone(find('catalog').rows),tasks=clone(find('tasks').rows),coding=[];
 let nextId=1,modules=[];
 const resource=(name,type,part='theory',extra={})=>({...extra,id:nextId++,name,type,part,className:extra.className||'不限班级'});
 const chapters=model?.chapters?.length?model.chapters:[];
 modules=chapters.map((name,i)=>({id:nextId++,name,hours:2,visible:true,resources:[]}));
 catalog.forEach((lesson,i)=>{
  const chapterIndex=chapters.findIndex(n=>n===lesson.chapter),ordinal=(lesson.chapter||'').match(/第([一二三四五六七八九十\d]+)章/),number=ordinal?('一二三四五六七八九十'.indexOf(ordinal[1])+1||Number(ordinal[1])):0;
  const m=modules[chapterIndex>=0?chapterIndex:number?Math.min(number-1,modules.length-1):Math.min(modules.length-1,Math.floor(i/Math.max(1,catalog.length/modules.length)))];if(!m)return;
  m.resources.push(resource(lesson.name,lesson.type==='视频'?'视频':lesson.type==='文件作业'?'作业':'课件(其他)',lesson.type==='文件作业'?'practice':'theory',{file:lesson.resource,source:'内部视频',url:lesson.resource,description:lesson.body||'',completion:lesson.completion,checkin:lesson.checkin,arena:lesson.arena,minutes:lesson.minutes,example:lesson.example,download:'是'}));
 });
 tasks.forEach((task,i)=>{const idx=Math.min(modules.length-1,task.chapter==='第三章'?2:task.chapter==='第二章'?1:0),m=modules[idx];if(m)m.resources.push(resource(task.name,task.type==='文件作业'?'作业':'测验','practice',{...task,mode:task.type.includes('考试')?'考试模式':'练习模式',score:10,description:'按课程学习安排完成。',questions:[]}));});
 coding.forEach((task,i)=>{const m=modules[Math.min(i,modules.length-1)];if(m)m.resources.push(resource(task.name,'测验','practice',{mode:'练习模式',questions:task.problems.split(/\s+/).filter(Boolean).map(id=>({type:'编程题',text:'配套编程练习 '+id,problem:id,score:10,answer:''})),access:task.access}));});
 if(modules.length&&!modules[0].resources.length)modules[0].resources.push(resource(course+'学习导读','课件(其他)','theory',{file:'课程学习导读.pdf',description:'课程基础概念与学习安排。',download:'是',rag:false}));
 return modules;
}};
