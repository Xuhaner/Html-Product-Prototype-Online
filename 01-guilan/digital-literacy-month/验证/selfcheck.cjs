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
 if(published().length!==12)throw Error('未审核作品泄露');
 if(published('gnu').length!==6)throw Error('高校筛选');
 if(published('gnu','likes')[0].id!=='v1')throw Error('点赞排序');
 if(published('gnu','latest')[0].id!=='d1')throw Error('最新排序');
 if(published('all','likes','不存在的作品').length!==0)throw Error('空态');
 db.works.find(w=>w.id==='q1').status='published';
 if(published().length!==13)throw Error('审核发布');
 db.works.find(w=>w.id==='v1').status='offline';
 if(published().some(w=>w.id==='v1'))throw Error('下架过滤');
 if(esc('<script>')!=='&lt;script&gt;')throw Error('文本转义');
`,c);
// 批量审核与管理列表共用状态边界；失败时不允许部分更新。
const moderation=context();
vm.runInContext(`
 if(manageWorks().length!==13||manageWorks().some(w=>!['published','offline'].includes(w.status)))throw Error('作品管理边界');
 if(moderateWorks(['q1','q2'],'rejected','  ').ok)throw Error('不通过理由必填');
 const rejected=moderateWorks(['q1','q2'],'rejected','统一修改意见');
 if(!rejected.ok||rejected.count!==2)throw Error('批量不通过数量');
 if(db.works.filter(w=>['q1','q2'].includes(w.id)).some(w=>w.reason!=='统一修改意见'||w.status!=='rejected'))throw Error('统一理由');
 if(moderateWorks(['q1'],'published').ok)throw Error('不可重审非待审核作品');
 db=seed();
 const approved=moderateWorks(['q1','q2','q1'],'published');
 if(!approved.ok||approved.count!==2||published().length!==14||manageWorks().length!==15)throw Error('批量发布与去重');
 db=seed();persist=()=>false;
 if(moderateWorks(['q1','q2'],'published').ok)throw Error('应报告保存失败');
 if(db.works.filter(w=>['q1','q2'].includes(w.id)).some(w=>w.status!=='pending'||w.logs.length))throw Error('失败原子回滚');
`,moderation);
const file=context('file:');vm.runInContext(`db.user={id:'demo',name:'演示同学'};db.config.title='中文标题';db.works[0].likes=999;persist()`,file);
assert(file.location.hash.startsWith('#demo='));
const otherFile=context('file:',file.location.hash);
assert.equal(vm.runInContext('db.user.name',otherFile),'演示同学');
assert.equal(vm.runInContext('db.config.title',otherFile),'中文标题');
assert.equal(vm.runInContext('db.works[0].likes',otherFile),999);
assert.equal(vm.runInContext('db.works.length',context('file:','#demo=invalid')),16);
for(const name of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 assert(!/type=["']module|fetch\(/.test(html),'文件模式不应依赖模块加载或 fetch');
 for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g))assert(fs.existsSync(path.join(root,match[1])),name+' 缺失资源 '+match[1]);
}
for(const name of ['data.js','app.js','admin.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
console.log('PASS：五类数据、可见性、排序、空态、审核状态、批量审核与回滚、管理列表边界、文本转义、file 导航快照、静态资源及脚本语法');
