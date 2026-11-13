const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../homepage.js'), 'utf8');
vm.runInNewContext(source.replace(/load\(\);\s*$/, '') + `
const project = {id:'01-demo',name:'演示项目'};
const item = {id:'example',name:'示例',description:'流程说明',updatedAt:'2026-09-20',updateNote:'新增入口',entries:[
{name:'电脑端',path:'index.html'},{name:'移动端',path:'mobile.html'},
{name:'管理端',path:'admin.html'},{name:'教师端',path:'teacher.html'}]};
for (const list of [false,true]) {
 const html=prototype(project,item,list);
 assert.equal((html.match(/class="entry"/g)||[]).length,4);
 for (const entry of item.entries) assert.ok(html.includes('01-demo/example/'+entry.path));
 assert.ok(html.includes('本次更新'));
}
assert.equal(entryLink(project,item,{path:'index.html#admin'}),'01-demo/example/index.html#admin');
assert.ok(matches(item,'管理端'));
assert.ok(matches(item,'新增入口'));
assert.ok(!matches(item,'没有这个内容'));
assert.ok(!prototype(project,{...item,updateNote:''}).includes('本次更新'));
assert.ok(prototype(project,{...item,name:'<script>'}).includes('&lt;script&gt;'));
const items=[{id:1,updatedAt:'2026-09-01'},{id:2,updatedAt:'2026-09-20'},{id:3,updatedAt:'2026-09-20'}];
assert.equal(sorted(items).map(x=>x.id).join(','),'2,3,1');
assert.equal(items[0].id,1);
`, {assert});
console.log('OK: all entry types on both views, search, update notes, escaping and stable date sorting');
