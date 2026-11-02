/* 本地评审数据，不接入实际账号或服务。 */
const DEMO_KEY='guilan-literacy-prototype-v1';
const INITIAL_SCHOOLS=[{id:'gnu',name:'贵州师范大学站'},{id:'gzu',name:'贵州大学站'},{id:'gufe',name:'贵州财经大学站'}];
const TYPES={video:'视频',audio:'音频',html:'单 HTML',article:'图文',document:'文档'};
const STATUS={pending:'待审核',published:'已发布',rejected:'已驳回',offline:'已下架'};
const AWARDS=['','一等奖','二等奖','三等奖','优秀作品'];
const ARTICLE='数字技术让生活更便捷，也让保护个人信息成为每个人的日常功课。我们从校园生活出发，整理了这份可以立刻实践的数字安全清单。\n\n一、从账户安全开始\n为不同平台设置不同密码，开启双重验证。不要在公共电脑上勾选“记住密码”，使用后及时退出账号。\n\n二、分享之前，多想一步\n发布照片和截图前，检查其中是否包含学号、手机号、住址或证件信息。熟悉应用的隐私设置，谨慎授予不必要的权限。\n\n三、遇到可疑信息，先核实\n对来源不明的链接保持警惕。涉及转账或个人信息的请求，通过官方渠道或当面确认，不被“限时”和“紧急”催促。\n\n数字素养不是记住一套复杂规则，而是形成主动判断、理性使用与安全分享的习惯。';
const DOCUMENT='AI 可以成为学习伙伴，但学习的主体始终是我们自己。这份指南围绕查找资料、理解概念、整理笔记三个场景，探索更有效、可核验的使用方式。\n\n01 明确问题，再开始提问\n告诉工具你的学习目标、已有基础和遇到的困难。与其要求“帮我写完作业”，不如请它解释思路，再由自己完成推导。\n\n02 对生成的内容进行核验\n对于数据、引用和结论，回到教材、原始论文或可靠来源核实。保留资料链接，区分自己的观点与工具生成的建议。\n\n03 把答案变成自己的理解\n尝试用自己的语言复述知识，设计新的例子，或为同学讲解。可以让 AI 提问、提供反馈，但不要省略独立思考的过程。\n\n实践任务\n选一个正在学习的知识点，记录你的原始问题、工具的回答、你做的核验，以及最终的理解。比较前后变化，找到适合自己的方法。\n\n结语\n好的工具使用方式，应当让我们更会提问、更能判断，也更有能力独立完成任务。';
function seed(){
 const rows=[
 ['v1','AI，让学习多一种可能','陈思雨','gnu','video','video',328,'一等奖','2026-10-29T10:00:00','用校园中的三个学习场景，记录 AI 如何帮助我们拓展思路、理解知识。'],
 ['h1','看见数据的温度','周子涵','gnu','html','html',286,'二等奖','2026-10-30T09:20:00','一个可以亲手操作的数据小实验：用可视化理解身边的低碳生活。'],
 ['a1','听见数字时代：校园里的新声音','林语桐','gnu','audio','audio',219,'优秀作品','2026-10-31T14:00:00','以校园播客的形式，分享数字时代大学生的学习体验与成长故事。'],
 ['p1','给数字生活加把锁','王嘉宁','gnu','article','article',182,'三等奖','2026-11-01T11:00:00','从账号、隐私和信息核验出发，做一份每个人都能用上的校园数字安全清单。'],
 ['d1','大学生 AI 学习指南','刘一诺','gnu','document','document',156,'','2026-11-02T08:30:00','整理常见学习场景中的 AI 使用方法，在效率与独立思考之间找到自己的节奏。'],
 ['v2','当非遗遇见 AI','杨晓月','gnu','video','culture',133,'','2026-10-31T16:30:00','用数字创作重新发现贵州非遗之美，让传统文化被更多年轻人看见。'],
 ['h2','我的低碳校园','李沐阳','gzu','html','green',241,'二等奖','2026-11-01T09:00:00','从出行和阅读开始，计算日常选择带来的低碳改变。'],
 ['p2','数字工具，让小组协作更高效','赵明轩','gzu','article','article',125,'','2026-10-30T12:00:00','分享团队在资料整理、任务分工和成果表达方面的实践经验。'],
 ['d2','校园数字生活观察手册','吴欣然','gzu','document','document',98,'优秀作品','2026-11-01T15:00:00','从真实体验出发，观察大学生的数字生活与信息判断习惯。'],
 ['a2','一分钟，识别网络信息陷阱','唐可欣','gufe','audio','audio',204,'三等奖','2026-11-02T09:00:00','用简短的声音故事，说明核验信息来源的重要性。'],
 ['v3','我的第一支 AI 创意短片','宋雨辰','gufe','video','video',167,'优秀作品','2026-10-31T08:00:00','从创意到成片，记录一次使用数字工具完成作品的过程。'],
 ['p3','从一张表格看懂校园消费','何思远','gufe','article','green',111,'','2026-11-01T10:00:00','以校园生活为例，探索数据整理与理性分析的基本方法。'],
 ['q1','让校园信息更有温度','张书瑶','gnu','document','document',0,'','2026-11-02T10:10:00','一份关注校园信息无障碍的实践建议。'],
 ['q2','数字生活里的小确幸','许星禾','gzu','video','culture',0,'','2026-11-02T10:30:00','通过短片记录日常生活中的数字化便利。'],
 ['r1','我的数字学习笔记','徐子墨','gufe','article','article',0,'','2026-11-01T13:00:00','整理近期学习数字工具的实践体会。'],
 ['o1','校园网络安全微课堂','郑知行','gnu','video','video',65,'','2026-10-28T10:00:00','用校园案例介绍数字安全。']
 ];
 return {user:null,liked:[],config:{title:'全民数字素养能力提升月',visible:true,headerImage:'',description:'汇聚校园数字创意，展示青年实践成果。让每一个好作品被看见。',contact:'活动咨询：贵兰在线活动工作组\n咨询方式：请通过学校活动负责老师联系工作组\n服务时间：工作日 09:00—18:00',schools:INITIAL_SCHOOLS},works:rows.map((r,i)=>{let [id,title,author,school,type,cover,likes,award,date,intro]=r;const status=i===12||i===13?'pending':i===14?'rejected':i===15?'offline':'published';return {id,title,author,school,type,cover:'assets/'+cover+'.svg',likes,award,date,submitted:date,status,intro,department:school==='gufe'?'信息管理学院 / 信息管理与信息系统':'计算机与信息学院 / 计算机科学与技术',body:type==='article'?ARTICLE:type==='document'?DOCUMENT:'',filename:title+(type==='document'?'.docx':type==='video'?'.mp4':type==='audio'?'.mp3':type==='html'?'.html':''),source:'学生上传',submitter:'demo-student-'+(i+1),original:{title,author,school,type,intro},reason:i===14?'作品正文缺少完整结语，请联系活动工作组补充。':i===15?'内容需进一步核实，暂时下架。':'',logs:status==='pending'?[]:[{at:date,text:status==='published'?'市场部审核员：审核通过并发布':status==='rejected'?'市场部审核员：已驳回':'市场部审核员：已下架'}]}})};
}
let storageAvailable=true;
function packDemo(value){return btoa(Array.from(new TextEncoder().encode(JSON.stringify(value)),b=>String.fromCharCode(b)).join(''))}
function unpackDemo(value){return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value),c=>c.charCodeAt(0))))}
function readDemo(){
 // file:// storage may be isolated per file; a fragment snapshot carries state across pages.
 if(location.protocol==='file:'){try{const snapshot=new URLSearchParams(location.hash.slice(1)).get('demo');if(snapshot){const saved=unpackDemo(snapshot);if(Array.isArray(saved.works)&&Array.isArray(saved.config?.schools))return saved}}catch{}}
 try{const raw=localStorage.getItem(DEMO_KEY);return raw?JSON.parse(raw):seed()}catch(e){storageAvailable=false;try{return window.name.startsWith(DEMO_KEY)?JSON.parse(window.name.slice(DEMO_KEY.length)):seed()}catch{return seed()}}
}
let db=readDemo();
function persist(){let fragmentSaved=false;if(location.protocol==='file:'){try{history.replaceState(null,'','#demo='+encodeURIComponent(packDemo(db)));fragmentSaved=true}catch{}}try{localStorage.setItem(DEMO_KEY,JSON.stringify(db));return true}catch(e){storageAvailable=false;try{window.name=DEMO_KEY+JSON.stringify(db);return true}catch{return fragmentSaved}}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function schoolName(id){return db.config.schools.find(s=>s.id===id)?.name||'未分配高校站'}
function fmtDate(d){return new Date(d).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'})}
function published(school='all',sort='likes',query=''){return db.works.filter(w=>w.status==='published'&&(school==='all'||w.school===school)&&(!query||(w.title+w.author).includes(query))).sort((a,b)=>sort==='latest'?new Date(b.date)-new Date(a.date):b.likes-a.likes||new Date(b.date)-new Date(a.date))}
function record(w,text){w.logs=w.logs||[];w.logs.push({at:new Date().toISOString(),text:'市场部审核员：'+text})}
function manageWorks(){return db.works.filter(w=>w.status==='published'||w.status==='offline')}
function moderateWorks(ids,status,reason=''){
 const unique=[...new Set(ids)],text=String(reason).trim();
 if(!['published','rejected'].includes(status))return {ok:false,error:'审核状态无效。'};
 if(!unique.length)return {ok:false,error:'请先选择待审核作品。'};
 if(status==='rejected'&&!text)return {ok:false,error:'请填写不通过理由。'};
 const rows=unique.map(id=>db.works.find(w=>w.id===id));
 if(rows.some(w=>!w||w.status!=='pending'))return {ok:false,error:'所选作品的状态已变化，请刷新列表后重新选择。'};
 const snapshots=rows.map(w=>JSON.parse(JSON.stringify(w))),now=new Date().toISOString();
 rows.forEach(w=>{w.status=status;w.reason=text;if(status==='published')w.date=now;record(w,status==='published'?'审核通过并发布'+(text?'：'+text:''):'审核不通过：'+text)});
 if(!persist()){rows.forEach((w,i)=>Object.assign(w,snapshots[i]));return {ok:false,error:'审核结果保存失败，请重试。'}}
 return {ok:true,count:rows.length};
}
