'use strict';

const INITIAL_SCHOOLS = [
  {
    id: 's1', name: '贵州大学测试1', color: '#c0392b', main: true, authAt: '2026-06-01',
    info: { 学号: '2026090302', 姓名: 'wxh26', 学院: '152', 班级: '345', 专业: '532' },
  },
  {
    id: 's2', name: '贵州文', color: '#8a94a6', main: false, authAt: '2026-07-12',
    info: { 学号: '1237821', 姓名: '王东喜', 学院: '贵在', 班级: '7823', 专业: '贵州' },
  },
  {
    id: 's3', name: '贵州师范大学', color: '#2e7d32', main: false, authAt: '2026-08-20',
    info: { 学号: '2023010502', 姓名: '王东喜', 学院: '计算机学院', 班级: '计科2301', 专业: '软件工程' },
  },
  {
    id: 's4', name: '贵州民族大学', color: '#6a4c93', main: false, authAt: '2026-09-05',
    info: { 学号: '2024020301', 姓名: '王东喜', 学院: '经济管理学院', 班级: '经济2402', 专业: '经济学' },
  },
];

const state = { schools: structuredClone(INITIAL_SCHOOLS) };

const DEMO_CODE = '123456';
const $ = (sel) => document.querySelector(sel);
const schoolBody = $('#schoolBody');
const schoolSection = $('#schoolSection');
const demoBar = $('#demoBar');

/* ---------------- render ---------------- */

function fieldHtml(label, value) {
  return `<div class="field"><span class="field-label">${label}</span><span class="field-value">${value}</span></div>`;
}

function infoFields(school) {
  return Object.entries(school.info).map(([k, v]) => fieldHtml(k, v)).join('');
}

function schoolCard(school) {
  const isMain = school.main;
  const tag = isMain ? '<span class="tag tag-main">当前学校</span>' : '';

  if (document.body.dataset.platform === 'mobile') {
    let actions = '';
    if (!isMain) {
      actions += `<button class="btn-block switch" type="button" data-action="switch" data-id="${school.id}">设为当前学校</button>`;
    }
    actions += `<button class="btn-block unbind" type="button" data-action="unbind" data-id="${school.id}">解绑</button>`;

    return `
      <article class="${isMain ? 'school-box main' : 'school-box'}">
        <div class="box-head"><span class="school-name">${school.name}</span>${tag}</div>
        <div class="rows">${infoFields(school)}</div>
        <div class="box-actions">${actions}</div>
      </article>`;
  }

  let actions = '';
  if (!isMain) {
    actions += `<button class="btn primary small" type="button" data-action="switch" data-id="${school.id}">设为当前学校</button>`;
  }
  actions += `<button class="btn-link danger" type="button" data-action="unbind" data-id="${school.id}">解绑</button>`;

  return `
    <article class="${isMain ? 'school-card main' : 'school-card'}">
      <div class="school-head">
        <span class="school-logo" style="--logo-c:${school.color}" aria-hidden="true">${school.name.charAt(0)}</span>
        <div class="school-title"><h3 class="school-name">${school.name}</h3>${tag}</div>
        <div class="school-actions">${actions}</div>
      </div>
      <div class="fields">${infoFields(school)}</div>
    </article>`;
}

function render() {
  const bound = state.schools;
  const main = bound.find((s) => s.main);
  const others = bound.filter((s) => !s.main);

  let html = '';

  if (!main && bound.length > 0) {
    html += `
      <div class="no-main-banner" role="alert">
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 2.5 19 17H1Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 8v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="14.6" r="1" fill="currentColor"/></svg>
        <span>当前无生效学校：学校专属课程、考试与学籍服务不可用。可将已认证学校设为当前学校，或点击「立即认证」重新认证。</span>
      </div>`;
  }

  if (bound.length === 0) {
    html += `
      <div class="empty-box">
        <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect x="8" y="14" width="32" height="24" rx="4" fill="none" stroke="#c6cbd2" stroke-width="2"/><path d="M8 22h32M24 14v-6m0 0 -6 6m6-6 6 6" stroke="#c6cbd2" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        <strong>暂无认证学校</strong>
        <span>认证学校后可使用学校专属课程、考试与学籍服务</span>
        <button class="btn primary" type="button" data-boundary="原型边界：学校认证表单由真实系统提供，本原型仅演示切换与解绑。">立即认证</button>
      </div>`;
    schoolBody.innerHTML = html;
    return;
  }

  if (main) html += `<div class="school-group">${schoolCard(main)}</div>`;
  if (others.length) html += `<div class="school-group">${others.map(schoolCard).join('')}</div>`;

  schoolBody.innerHTML = html;
}

/* ---------------- toast ---------------- */

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  $('#toastText').textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

/* ---------------- modal manager ---------------- */

let lastFocus = null;
let trapOverlay = null;

function focusables(overlay) {
  return [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function openModal(overlay, autofocusSel) {
  lastFocus = document.activeElement;
  overlay.hidden = false;
  trapOverlay = overlay;
  const target = (autofocusSel && overlay.querySelector(autofocusSel)) || overlay.querySelector('[data-close]');
  if (target) target.focus();
}

function closeModal(overlay) {
  overlay.hidden = true;
  if (trapOverlay === overlay) trapOverlay = null;
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  else schoolSection.focus();
}

document.addEventListener('keydown', (e) => {
  if (trapOverlay) {
    if (e.key === 'Escape') { closeModal(trapOverlay); return; }
    if (e.key !== 'Tab') return;
    const items = focusables(trapOverlay);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    return;
  }
  if (e.key === 'R' && e.shiftKey && demoBar.hidden) {
    const t = e.target;
    if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') demoBar.hidden = false;
  }
});

document.querySelectorAll('.overlay').forEach((overlay) => {
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(overlay); });
  overlay.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => closeModal(overlay)));
});

/* ---------------- switch flow ---------------- */

const switchModal = $('#switchModal');
let switchTargetId = null;

function openSwitch(id) {
  const target = state.schools.find((s) => s.id === id);
  const current = state.schools.find((s) => s.main);
  switchTargetId = id;
  $('#switchFrom').textContent = current ? current.name : '（无）';
  $('#switchTo').textContent = target.name;
  const confirmBtn = $('#switchConfirm');
  confirmBtn.disabled = false;
  confirmBtn.classList.remove('loading');
  openModal(switchModal, '#switchConfirm');
}

$('#switchConfirm').addEventListener('click', () => {
  const btn = $('#switchConfirm');
  btn.classList.add('loading');
  btn.disabled = true;
  setTimeout(() => {
    const target = state.schools.find((s) => s.id === switchTargetId);
    state.schools.forEach((s) => { s.main = s.id === switchTargetId; });
    btn.classList.remove('loading');
    render();
    closeModal(switchModal);
    toast(`当前学校已切换为「${target.name}」`);
  }, 700);
});

/* ---------------- unbind flow ---------------- */

const unbindModal = $('#unbindModal');
const codeInput = $('#codeInput');
const sendCodeBtn = $('#sendCodeBtn');
const unbindConfirm = $('#unbindConfirm');
const codeError = $('#codeError');
let unbindTargetId = null;
let countdownTimer = null;

function stopCountdown() {
  clearInterval(countdownTimer);
  countdownTimer = null;
  sendCodeBtn.disabled = false;
  sendCodeBtn.textContent = '获取验证码';
}

function openUnbind(id) {
  const school = state.schools.find((s) => s.id === id);
  unbindTargetId = id;
  $('#unbindSchoolName').textContent = school.name;

  const impacts = ['学号与院系班级信息将从个人信息移除，重新绑定需重新认证；'];
  if (school.main) {
    const others = state.schools.filter((s) => s.id !== id);
    if (others.length === 0) {
      impacts.push('解绑后进入无学校状态，学校专属课程与考试不可用，直到重新认证。');
    } else {
      const next = others.reduce((a, b) => (a.authAt > b.authAt ? a : b));
      impacts.push(`此学校解绑后，当前学校会更改为「${next.name}」。`);
    }
  }
  $('#unbindImpact').innerHTML = impacts.map((t) => `<li>${t}</li>`).join('');

  codeInput.value = '';
  codeInput.removeAttribute('aria-invalid');
  codeError.hidden = true;
  unbindConfirm.disabled = true;
  unbindConfirm.classList.remove('loading');
  stopCountdown();
  openModal(unbindModal, '#sendCodeBtn');
}

sendCodeBtn.addEventListener('click', () => {
  let left = 60;
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = `重新发送（${left}s）`;
  toast('验证码已发送至 185****2826');
  countdownTimer = setInterval(() => {
    left -= 1;
    if (left <= 0) { stopCountdown(); sendCodeBtn.textContent = '重新发送验证码'; }
    else sendCodeBtn.textContent = `重新发送（${left}s）`;
  }, 1000);
});

codeInput.addEventListener('input', () => {
  codeInput.value = codeInput.value.replace(/\D/g, '').slice(0, 6);
  codeError.hidden = true;
  codeInput.removeAttribute('aria-invalid');
  unbindConfirm.disabled = codeInput.value.length !== 6;
});

unbindConfirm.addEventListener('click', () => {
  if (codeInput.value !== DEMO_CODE) {
    codeError.hidden = false;
    codeInput.setAttribute('aria-invalid', 'true');
    codeInput.focus();
    return;
  }
  unbindConfirm.classList.add('loading');
  unbindConfirm.disabled = true;
  setTimeout(() => {
    const school = state.schools.find((s) => s.id === unbindTargetId);
    const wasMain = school.main;
    state.schools = state.schools.filter((s) => s.id !== unbindTargetId);
    let msg = `已解绑「${school.name}」`;
    if (wasMain) {
      if (state.schools.length) {
        const next = state.schools.reduce((a, b) => (a.authAt > b.authAt ? a : b));
        state.schools.forEach((s) => { s.main = s.id === next.id; });
        msg = `已解绑「${school.name}」，当前学校已更改为「${next.name}」`;
      } else {
        msg = `已解绑「${school.name}」，当前无生效学校`;
      }
    }
    unbindConfirm.classList.remove('loading');
    stopCountdown();
    render();
    closeModal(unbindModal);
    toast(msg);
  }, 800);
});

const unbindObserver = new MutationObserver(() => {
  if (unbindModal.hidden && countdownTimer) stopCountdown();
});
unbindObserver.observe(unbindModal, { attributes: true, attributeFilter: ['hidden'] });

/* ---------------- demo bar ---------------- */

$('#resetBtn').addEventListener('click', () => {
  state.schools = structuredClone(INITIAL_SCHOOLS);
  render();
  toast('演示状态已重置');
});

$('#hideBarBtn').addEventListener('click', () => {
  demoBar.hidden = true;
});

/* ---------------- global delegation ---------------- */

document.addEventListener('click', (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    const { action, id } = actionEl.dataset;
    if (action === 'switch') openSwitch(id);
    if (action === 'unbind') openUnbind(id);
    return;
  }
  const boundaryEl = e.target.closest('[data-boundary]');
  if (boundaryEl) toast(boundaryEl.dataset.boundary);
});

render();
