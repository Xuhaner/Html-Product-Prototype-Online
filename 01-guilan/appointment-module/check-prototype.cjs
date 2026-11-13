const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'), {
  runScripts: 'dangerously',
  beforeParse(window) { window.scrollTo = () => {}; }
});
const { document: d, Event } = dom.window;
const change = id => d.getElementById(id).dispatchEvent(new Event('change', { bubbles: true }));
const input = (id, value) => {
  d.getElementById(id).value = value;
  d.getElementById(id).dispatchEvent(new Event('input', { bubbles: true }));
};
const saveQuota = () => d.querySelector('#quota-form [type="submit"]').click();
const table = d.getElementById('diagnosis-records');
const rows = [...table.tBodies[0].rows];
const visible = () => rows.filter(row => !row.hidden);
const filters = d.getElementById('record-filters');
const query = () => filters.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

d.querySelector('#home .tbl [data-go="done"]').click();
assert.equal(d.querySelector('.page.on').id, 'done');
d.querySelector('#done [data-go="home"]').click();
const reserveButton = d.getElementById('reserve-button');
assert(!reserveButton.disabled);
reserveButton.click();
assert.equal(d.querySelector('.page.on').id, 'apply');
d.querySelector('#apply [data-go="home"]').click();
input('remaining-quota', '0');
assert(!reserveButton.disabled);
saveQuota();
assert(reserveButton.disabled);
reserveButton.click();
assert.equal(d.querySelector('.page.on').id, 'home');
input('remaining-quota', '23');
saveQuota();
assert(!reserveButton.disabled);

assert.equal(d.querySelector('#admin .side .on').textContent, '首页配置');
assert.equal(d.querySelector('.admin-tabs .on').textContent, '材料诊断');
assert.equal(d.querySelectorAll('.config-grid .fld').length, 4);
assert.equal(d.querySelector('.nav [data-go="admin"]').textContent, '④ 管理端');
assert.equal(d.querySelector('label[for="new-label-visible"]').textContent, '【新增】标签是否显示');
for (const id of ['total-quota', 'remaining-quota']) {
  assert(d.getElementById(id).required);
  assert.equal(d.querySelector(`label[for="${id}"] i`).textContent, '*');
  input(id, '');
  saveQuota();
  assert.deepEqual([...d.querySelectorAll('#home .stat b')].map(el => el.textContent), ['60', '23']);
  input(id, id === 'total-quota' ? '60' : '23');
}
assert.deepEqual([...table.querySelectorAll('th')].map(th => th.textContent),
  ['编号', '姓名', '手机号', '工作单位', '职称', '职务', '工龄', '状态', '提交时间', '操作']);
assert(!d.getElementById('admin').textContent.includes('提醒'));
assert(!d.getElementById('admin').textContent.includes('已约时间'));
assert(rows.every(row => /^1\d{10}$/.test(row.cells[2].textContent)));

d.getElementById('module-visible').click();
assert(d.body.classList.contains('module-hidden'));
d.getElementById('module-visible').click();
assert(!d.body.classList.contains('module-hidden'));
d.getElementById('new-label-visible').click();
assert(d.body.classList.contains('new-label-hidden'));
input('total-quota', '10');
assert(!d.getElementById('quota-form').checkValidity());
saveQuota();
assert.equal(d.querySelector('#home .stat b').textContent, '60');
input('remaining-quota', '5');
assert.deepEqual([...d.querySelectorAll('#home .stat b')].map(el => el.textContent), ['60', '23']);
saveQuota();
assert.deepEqual([...d.querySelectorAll('#home .stat b')].map(el => el.textContent), ['10', '5']);
assert.equal(d.querySelector('#apply .quota').textContent, '本期剩余 5 名');

d.getElementById('filter-name').value = '王';
d.getElementById('filter-phone').value = '6688';
query();
assert.deepEqual(visible(), [rows[0]]);
d.getElementById('filter-status').value = '已反馈';
change('filter-status');
assert.equal(visible().length, 0);
assert.equal(d.getElementById('record-count').textContent, '共 0 条');
filters.reset();
assert.equal(visible().length, 4);
d.getElementById('filter-status').value = '待处理';
change('filter-status');
assert.equal(visible().length, 3);
const feedbackDialog = d.getElementById('feedback-confirm');
let feedbackOpened = false;
feedbackDialog.showModal = () => { feedbackOpened = true; };
rows[0].querySelector('[data-action="feedback"]').click();
assert(feedbackOpened);
assert.equal(rows[0].cells[7].textContent, '待处理');
feedbackDialog.returnValue = 'cancel';
feedbackDialog.dispatchEvent(new Event('close'));
assert.equal(rows[0].cells[7].textContent, '待处理');
assert.equal(visible().length, 3);
rows[0].querySelector('[data-action="feedback"]').click();
assert.equal(feedbackDialog.returnValue, '');
feedbackDialog.returnValue = 'confirm';
feedbackDialog.dispatchEvent(new Event('close'));
assert.equal(rows[0].cells[7].textContent, '已反馈');
assert(rows[0].querySelector('[data-action="feedback"]').disabled);
assert.equal(visible().length, 2);

// jsdom 未实现原生 dialog 与文件下载，分别验证弹窗内容和下载对象。
let opened = false;
d.getElementById('record-detail').showModal = () => { opened = true; };
rows[1].querySelector('[data-action="detail"]').click();
assert(opened);
assert.equal(d.querySelectorAll('#detail-fields dt').length, 10);
assert.equal(d.querySelector('#detail-fields dd').textContent, 'GL2026-0186');
assert.equal(d.querySelector('#detail-fields dt:last-of-type').textContent, '补充说明');
assert.equal(d.querySelector('#detail-fields dd:last-of-type').textContent, '—');
rows[0].querySelector('[data-action="detail"]').click();
assert.equal(d.querySelector('#detail-fields dd:last-of-type').textContent, rows[0].dataset.supplement);
let downloaded;
dom.window.URL.createObjectURL = blob => {
  assert.equal(blob.type, 'application/msword');
  assert(blob.size > 0);
  return 'blob:prototype';
};
dom.window.URL.revokeObjectURL = () => {};
dom.window.HTMLAnchorElement.prototype.click = function () { downloaded = this.download; };
rows[1].querySelector('[data-action="download"]').click();
assert.equal(downloaded, '李某_个人简历.doc');

d.querySelector('.nav [data-go="apply"]').click();
const form = d.getElementById('booking-form');
assert.equal(form.querySelector('h2').textContent, '一对一材料诊断预约');
assert(form.textContent.includes('个人简历'));
assert(form.textContent.includes('≤50MB'));
assert.equal(form.querySelectorAll('textarea[name="supplement"]').length, 1);
assert(!d.getElementById('supplement').required);
form.querySelector('[type="submit"]').click();
assert.equal(d.querySelector('.page.on').id, 'apply');
d.getElementById('professional-title').value = '工程师';
d.getElementById('position').value = '项目经理';
d.getElementById('supplement').value = '补充第一行\n补充第二行';
form.querySelector('[type="submit"]').click();
assert.equal(d.querySelector('.page.on').id, 'done');
rows[0].querySelector('[data-action="detail"]').click();
assert.equal(d.querySelector('#detail-fields dd:last-of-type').textContent, '补充第一行\n补充第二行');
dom.window.close();
console.log('通过：名额必填及保存生效、反馈二次确认与取消、补充说明提交及详情展示，以及首页跳转、按钮禁用、配置、筛选、下载和表单校验。');
