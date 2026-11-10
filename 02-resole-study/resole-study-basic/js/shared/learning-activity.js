// Cross-page learning records only. Presentation and reward definitions live in their own modules.
const LearningActivity = (() => {
 const state = demo.learningActivity ||= {events:[],badges:{},celebrated:{}};
 state.badges ||= {}; state.celebrated ||= {};
 const day = at => new Date(at + 8 * 3600000).toISOString().slice(0,10);
 function range(kind='day',at=Date.now()) {
  const startDay=Date.parse(day(at)+'T00:00:00+08:00');
  const start=kind==='week'?startDay-((new Date(startDay+8*3600000).getUTCDay()+6)%7)*86400000:startDay;
  return {start,end:start+(kind==='week'?7:1)*86400000,key:day(start)};
 }
 let rewardTasks=[];
 function syncPoints(){
  state.pointRecords=completions(rewardTasks).map(item=>{const task=rewardTasks.find(task=>task.id===item.id);return {...item,amount:task.points,title:task.title,period:task.period};});
 }
 function record(type,key,options={}) {
  if(!prototypeState.logged)return false;
  if(!['lesson','quiz','chapter','time'].includes(type))return false;
  if(type!=='time'&&state.events.some(event=>event.type===type&&event.key===key))return false;
  const at=options.at??Date.now(),source=options.source||'learning';
  if(!Number.isFinite(at))return false;
  if(type==='time') {
   const seconds=Number(options.seconds);
   if(!Number.isFinite(seconds)||seconds<=0)return false;
   const event=state.events.find(item=>item.type==='time'&&day(item.at)===day(at)&&item.source===source);
   if(event)event.seconds+=seconds;
   else state.events.push({type,key:'time:'+day(at)+':'+source,at,source,seconds});
  } else state.events.push({type,key,at,source,title:options.title||'',score:options.score??null});
  syncPoints();persistDemo();document.dispatchEvent(new Event('learning-activity-changed'));return true;
 }
 function events(period) { return state.events.filter(event=>!period||(event.at>=period.start&&event.at<period.end)); }
 function summary(period) {
  const list=events(period),count=type=>list.filter(event=>event.type===type).length;
  return {lessons:count('lesson'),quizzes:count('quiz'),chapters:count('chapter'),minutes:list.filter(event=>event.type==='time').reduce((sum,event)=>sum+event.seconds,0)/60,days:new Set(list.filter(event=>event.type!=='time'||event.seconds>=60).map(event=>day(event.at))).size};
 }
 function progress(task,period) { return Math.min(task.target,Math.floor(summary(period)[task.metric]||0)); }
 function completions(tasks) {
  const result=[];
  for(const task of tasks) {
   const periods=new Map(state.events.map(event=>{const period=range(task.period,event.at);return [period.key,period];}));
   for(const period of periods.values()) {
    const list=events(period).sort((a,b)=>a.at-b.at),counts={lessons:0,quizzes:0,chapters:0,minutes:0},days=new Set();
    for(const event of list) {
     if(event.type==='time')counts.minutes+=event.seconds/60;
     else counts[{lesson:'lessons',quiz:'quizzes',chapter:'chapters'}[event.type]]++;
     if(event.type!=='time'||event.seconds>=60)days.add(day(event.at));
     if((task.metric==='days'?days.size:counts[task.metric])>=task.target) {
      const type={lessons:'lesson',quizzes:'quiz',chapters:'chapter',minutes:'time'}[task.metric];
      result.push({id:task.id,key:task.id+':'+period.key,at:event.at,source:list.some(item=>item.at<=event.at&&item.type===type&&item.source==='demo')?'demo':'learning'});break;
     }
    }
   }
  }
  return result.sort((a,b)=>a.at-b.at);
 }
 let activeCheck=null,lastTick=Date.now(),pending=0,pendingAt=Date.now();
 function flush() { if(pending>0){const seconds=pending;pending=0;record('time','',{seconds,at:pendingAt});} }
 setInterval(()=>{
  const now=Date.now(),delta=Math.min(2,(now-lastTick)/1000);
  if(day(now)!==day(lastTick))flush();lastTick=now;
  if(activeCheck&&prototypeState.logged&&!document.hidden&&!document.querySelector('dialog[open]')&&activeCheck()){if(!pending)pendingAt=now;pending+=delta;}
  if(pending>=15)flush();
 },1000);
 document.addEventListener('visibilitychange',flush);
 window.addEventListener('pagehide',flush);
 return {state,day,range,record,events,summary,progress,completions,flush,setRewards(tasks){rewardTasks=tasks;syncPoints();},startTimer(check){activeCheck=check;}};
})();
