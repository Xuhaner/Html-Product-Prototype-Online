/* 无依赖状态与本地文件导航桥接自检：node 验证/selfcheck.cjs */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'data.js'),'utf8');
function context(protocol='http:',hash=''){
 const memory=new Map(),location={protocol,hash};
 const c=vm.createContext({location,window:{name:''},localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},history:{replaceState:(_,__,hash)=>location.hash=hash},TextEncoder,TextDecoder,URLSearchParams,btoa,atob,console});
 vm.runInContext(source,c);return c;
}
const c=context();
vm.runInContext(`
 if(Object.keys(TYPES).length!==5)throw Error('类型数量');
 if(published().length!==26)throw Error('未审核作品泄露');
 if(published('gnu').length!==20)throw Error('活动专题筛选');
 if(published('gnu','likes')[0].id!=='v1')throw Error('点赞排序');
 if(published('gnu','latest')[0].id!=='stage-14')throw Error('最新排序');
 if(published('all','likes','不存在的作品').length!==0)throw Error('空态');
 db.works.find(w=>w.id==='q1').status='published';
 if(published().length!==27)throw Error('审核发布');
 db.works.find(w=>w.id==='v1').status='offline';
 if(published().some(w=>w.id==='v1'))throw Error('下架过滤');
 if(esc('<script>')!=='&lt;script&gt;')throw Error('文本转义');
`,c);
// 批量审核与管理列表共用状态边界；失败时不允许部分更新。
const moderation=context();
vm.runInContext(`
 if(manageWorks().length!==27||manageWorks().some(w=>!['published','offline'].includes(w.status)))throw Error('作品管理边界');
 if(moderateWorks(['q1','q2'],'rejected','  ').ok)throw Error('不通过理由必填');
 const rejected=moderateWorks(['q1','q2'],'rejected','统一修改意见');
 if(!rejected.ok||rejected.count!==2)throw Error('批量不通过数量');
 if(db.works.filter(w=>['q1','q2'].includes(w.id)).some(w=>w.reason!=='统一修改意见'||w.status!=='rejected'))throw Error('统一理由');
 if(moderateWorks(['q1'],'published').ok)throw Error('不可重审非待审核作品');
 db=seed();
 const approved=moderateWorks(['q1','q2','q1'],'published');
 if(!approved.ok||approved.count!==2||published().length!==28||manageWorks().length!==29)throw Error('批量发布与去重');
 db=seed();persist=()=>false;
 if(moderateWorks(['q1','q2'],'published').ok)throw Error('应报告保存失败');
 if(db.works.filter(w=>['q1','q2'].includes(w.id)).some(w=>w.status!=='pending'||w.logs.length))throw Error('失败原子回滚');
`,moderation);
const tiers=context();
vm.runInContext(`
 const counts=TIERS.map(t=>published('gnu').filter(w=>w.award===t.name).length);
 if(JSON.stringify(counts)!=='[8,6,3,2,1]')throw Error('五段位示例比例');
 if(new Set(LABELS.filter(Boolean).map(tagClass)).size!==9)throw Error('标签颜色标识唯一');
 let legacy=seed();delete legacy.schemaVersion;legacy.config.title='全民数字素养能力提升月';legacy.config.schools=[{id:'gnu',name:'贵州师范大学站'},{id:'gzu',name:'贵州大学站'},{id:'gufe',name:'贵州财经大学站'}];legacy.works=legacy.works.filter(w=>!w.id.startsWith('stage-'));legacy.works[0].likes=777;delete legacy.config.contactHtml;
 const updated=migrateDemo(legacy);if(updated.config.title!=='全民数字素养能力提升实践活动'||updated.config.schools[0].name!=='贵兰·AI实践月 · 第1期'||updated.works[0].likes!==777||updated.works.length!==30)throw Error('旧数据保留与迁移');
 if(migrateDemo(updated).works.length!==30)throw Error('迁移不可重复添加示例');
`,tiers);
// V1.3：验证两个筛选独立组合、榜单排除未分段作品，以及后台排序。
const views=context();views.document={body:{dataset:{page:'admin'}},addEventListener(){}};views.window.addEventListener=()=>{};views.location.search='';
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),views);
vm.runInContext(fs.readFileSync(path.join(root,'admin.js'),'utf8').replace(/renderAdmin\(\);\s*$/,''),views);
vm.runInContext(`
 listSchool='all';listLabel='优秀作品';listTopicFilter='gzu';
 const filtered=gallery();if(!filtered.includes('共 1 件作品')||!filtered.includes('校园数字生活观察手册'))throw Error('标签与专题组合筛选');
 listTopicFilter='gufe';if(!gallery().includes('我的第一支 AI 创意短片'))throw Error('专题筛选不应被标签覆盖');
 db.works.find(w=>w.id==='q1').status='published';listSchool='gnu';
 const ranking=gallery();if(!ranking.includes('共 20 件作品')||ranking.includes('data-sort=')||ranking.includes('其他作品')||ranking.includes('tier-quota')||ranking.includes('tier-kicker'))throw Error('榜单范围与精简结构');
 if(ranking.indexOf('id="tier-king-title"')>ranking.indexOf('id="tier-bronze-title"'))throw Error('王者必须优先');
 listSchool='all';listLabel='';listTopicFilter='all';if(!gallery().includes('共 27 件作品'))throw Error('全部作品应包含已发布的未分段作品');
 adminTab='review';const audit=table();if(audit.includes('<th>标签</th>')||audit.includes('col-likes')||!audit.includes('data-review-select'))throw Error('审核字段边界');
 adminTab='manage';adminLikesSort='ascending';let counts=adminRows().map(w=>w.likes);if(counts.some((n,i)=>i&&n<counts[i-1]))throw Error('后台点赞升序');
 adminLikesSort='descending';counts=adminRows().map(w=>w.likes);if(counts.some((n,i)=>i&&n>counts[i-1]))throw Error('后台点赞降序');
`,views);
const file=context('file:');vm.runInContext(`db.user={id:'demo',name:'演示同学'};db.config.title='中文标题';db.works[0].likes=999;persist()`,file);
assert(file.location.hash.startsWith('#demo='));
const otherFile=context('file:',file.location.hash);
assert.equal(vm.runInContext('db.user.name',otherFile),'演示同学');
assert.equal(vm.runInContext('db.config.title',otherFile),'中文标题');
assert.equal(vm.runInContext('db.works[0].likes',otherFile),999);
assert.equal(vm.runInContext('db.works.length',context('file:','#demo=invalid')),30);
for(const name of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 assert(!/type=["']module|fetch\(/.test(html),'文件模式不应依赖模块加载或 fetch');
 for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g))assert(fs.existsSync(path.join(root,match[1])),name+' 缺失资源 '+match[1]);
}
for(const name of ['data.js','app.js','admin.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
console.log('PASS：五类数据、可见性、排序、并行筛选、榜单边界、审核字段、空态、审核状态、批量审核与回滚、管理列表边界、文本转义、file 导航快照、静态资源及脚本语法');
