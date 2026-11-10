let authReturnFocus = null;
let authCodeTimer, authCodePhone = '', authCodeExpires = 0;
function clearAuthSecrets(dialog) {
  clearInterval(authCodeTimer); authCodePhone = ''; authCodeExpires = 0;
  $$('input[type="password"], .auth-password input, [name="code"]', dialog).forEach(input => { input.value = ''; if (input.closest('.auth-password')) input.type = 'password'; });
  $$('[data-password-toggle]', dialog).forEach(button => { button.classList.remove('password-visible'); button.setAttribute('aria-label', '显示密码'); });
  $$('.auth-error', dialog).forEach(node => node.textContent = '');
  const send = $('#auth-send-code', dialog);
  send.disabled = false; send.textContent = '获取验证码';
  $('#auth-code-status', dialog).textContent = '';
}

function applyAuth(logged, announce = true) {
  prototypeState.logged = logged;
  $('.member-profile')?.classList.toggle('hide', !logged);
  if ($('.guest-profile')) $('.guest-profile').style.display = logged ? 'none' : 'block';
  const entry = $('#user-entry'), action = $('#home-account-action');
  entry.textContent = logged ? (prototypeState.displayName || '林').slice(-1) : '登录';
  entry.classList.toggle('guest', !logged);
  entry.setAttribute('aria-label', logged ? '个人中心' : '登录或注册');
  if (action) {
    action.textContent = logged ? '进入我的学习' : '登录 / 注册';
    if (logged) { action.dataset.go = 'profile'; delete action.dataset.auth; }
    else { delete action.dataset.go; action.dataset.auth = 'member'; }
  }
  if (prototypeState.displayName && $('#profile-title')) {
    $('#profile-title').textContent = prototypeState.displayName + '同学，上午好';
  }
  document.dispatchEvent(new Event('auth-changed'));
  if (announce) showToast(logged ? '已登录演示账号' : '已退出登录');
}

function ensureAuthDialog() {
  if ($('#auth-dialog')) return $('#auth-dialog');
  const dialog = document.createElement('dialog');
  dialog.id = 'auth-dialog';
  dialog.className = 'auth-dialog';
  dialog.setAttribute('aria-labelledby', 'auth-title');
  dialog.innerHTML = `<div class="auth-panel">
    <button class="auth-close" type="button" aria-label="关闭登录注册弹窗">×</button>
    <div class="auth-brand" aria-hidden="true"><span class="brand-mark">睿</span><strong>睿秀学城</strong></div>
    <header class="auth-heading"><h2 id="auth-title">账号登录</h2><p>登录后继续你的课程与学习记录</p></header>
    <div class="auth-tabs" role="tablist" aria-label="登录方式">
      <button type="button" id="auth-password-tab" role="tab" aria-selected="true" aria-controls="login-form" data-auth-mode="login">密码登录</button>
      <button type="button" id="auth-sms-tab" role="tab" aria-selected="false" aria-controls="sms-login-form" tabindex="-1" data-auth-mode="sms">验证码登录</button>
    </div>
    <form class="auth-form" id="login-form" role="tabpanel" aria-labelledby="auth-password-tab" novalidate>
      <label class="auth-field"><span>账号</span><input name="account" autocomplete="username" required placeholder="用户名 / 手机号 / Email / 学号"></label>
      <label class="auth-field"><span>密码</span><span class="auth-password"><input name="password" type="password" autocomplete="current-password" required minlength="6" placeholder="请输入密码"><button type="button" data-password-toggle aria-label="显示密码"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/><path class="auth-eye-slash" d="m4 4 16 16" hidden/></svg></button></span></label>
      <label class="auth-consent"><input type="checkbox" name="consent" required><span>我已阅读并同意 <button type="button" data-toast="用户协议内容为原型展示">《睿秀学城用户协议》</button></span></label>
      <button class="btn primary auth-submit" type="submit">立即登录</button>
      <p class="auth-switch">还没有账号？<button type="button" data-auth-mode="register">用户注册</button></p>
    </form>
    <form class="auth-form" id="sms-login-form" role="tabpanel" aria-labelledby="auth-sms-tab" novalidate hidden>
      <label class="auth-field"><span>手机号</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" pattern="1[3-9][0-9]{9}" maxlength="11" required placeholder="请输入 11 位手机号"></label>
      <label class="auth-field"><span>验证码</span><span class="auth-code"><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="请输入 6 位验证码"><button type="button" id="auth-send-code">获取验证码</button></span></label>
      <p class="auth-code-status" id="auth-code-status" role="status"></p>
      <label class="auth-consent"><input type="checkbox" name="consent" required><span>我已阅读并同意 <button type="button" data-toast="用户协议内容为原型展示">《睿秀学城用户协议》</button></span></label>
      <p class="auth-error" role="alert"></p>
      <button class="btn primary auth-submit" type="submit">立即登录</button>
      <p class="auth-help">验证码为本地演示，不发送短信。</p>
      <p class="auth-switch">还没有账号？<button type="button" data-auth-mode="register">用户注册</button></p>
    </form>
    <form class="auth-form" id="register-form" novalidate hidden>
      <label class="auth-field"><span>手机号</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="请输入手机号"></label>
      <label class="auth-field"><span>设置密码</span><span class="auth-password"><input name="password" type="password" autocomplete="new-password" required minlength="8" placeholder="8–20 位密码"><button type="button" data-password-toggle aria-label="显示密码"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/><path class="auth-eye-slash" d="m4 4 16 16" hidden/></svg></button></span></label>
      <label class="auth-field"><span>确认密码</span><span class="auth-password"><input name="confirmPassword" type="password" autocomplete="new-password" required minlength="8" placeholder="请再次输入密码"><button type="button" data-password-toggle aria-label="显示确认密码"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/><path class="auth-eye-slash" d="m4 4 16 16" hidden/></svg></button></span></label>
      <p class="auth-help">学号由学校后台配置，Email 可在个人资料中补充。</p>
      <label class="auth-consent"><input type="checkbox" name="consent" required><span>我已阅读并同意 <button type="button" data-toast="用户协议内容为原型展示">《睿秀学城用户协议》</button></span></label>
      <p class="auth-error" role="alert"></p>
      <button class="btn primary auth-submit" type="submit">立即注册</button>
      <p class="auth-switch">已有账号？<button type="button" data-auth-mode="login">去登录</button></p>
    </form>
  </div>`;
  document.body.append(dialog);

  dialog.addEventListener('close', () => { clearAuthSecrets(dialog); $$('.auth-form', dialog).forEach(form => form.reset()); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); authReturnFocus?.focus(); });
  $('.auth-close', dialog).onclick = () => { dialog.close(); authReturnFocus?.focus(); };
  $$('[data-auth-mode]', dialog).forEach(button => button.onclick = () => setAuthMode(button.dataset.authMode));
  const tabs = $$('.auth-tabs [role="tab"]', dialog);
  tabs.forEach((tab, i) => tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = (i + 1) % 2;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 1;
    if (next !== undefined) { event.preventDefault(); setAuthMode(tabs[next].dataset.authMode); tabs[next].focus(); }
  }));
  $$('[data-password-toggle]', dialog).forEach(button => button.onclick = () => {
    const input = button.previousElementSibling, visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.classList.toggle('password-visible', !visible);
    button.setAttribute('aria-label', visible ? '显示密码' : '隐藏密码');
  });
  $('#login-form', dialog).onsubmit = event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    finishDemoLogin();
  };
  const sms = $('#sms-login-form', dialog), send = $('#auth-send-code', dialog);
  send.onclick = () => {
    const phone = sms.elements.phone;
    if (!phone.reportValidity()) return;
    authCodePhone = phone.value; authCodeExpires = Date.now() + 5 * 60 * 1000;
    $('.auth-error', sms).textContent = '';
    $('#auth-code-status', dialog).textContent = '演示验证码：123456，5 分钟内有效（不发送短信）。';
    const resendAt = Date.now() + 60000;
    const tick = () => { const seconds = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)); send.disabled = seconds > 0; send.textContent = seconds ? seconds + ' 秒后重试' : '重新获取'; if (!seconds) clearInterval(authCodeTimer); };
    tick(); authCodeTimer = setInterval(tick, 1000); sms.elements.code.focus();
  };
  sms.onsubmit = event => {
    event.preventDefault(); const error = $('.auth-error', sms); error.textContent = '';
    if (!sms.reportValidity()) return;
    if (authCodePhone !== sms.elements.phone.value || Date.now() > authCodeExpires) { error.textContent = '请先为当前手机号获取验证码。'; sms.elements.phone.focus(); return; }
    if (sms.elements.code.value !== '123456') { error.textContent = '验证码不正确，请输入演示验证码 123456。'; sms.elements.code.focus(); return; }
    finishDemoLogin();
  };
  $('#register-form', dialog).onsubmit = event => {
    event.preventDefault();
    const form = event.currentTarget, error = $('.auth-error', form);
    error.textContent = '';
    if (!form.reportValidity()) return;
    if (form.password.value !== form.confirmPassword.value) { error.textContent = '两次输入的密码不一致。'; form.confirmPassword.focus(); return; }
    setAuthMode('login');
    $('#login-form [name="account"]', dialog).value = form.phone.value;
    showToast('注册信息已完成，请登录（演示）');
  };
  return dialog;
}

function setAuthMode(mode) {
  const dialog = ensureAuthDialog(), registering = mode === 'register';
  clearAuthSecrets(dialog);
  $('#login-form', dialog).hidden = mode !== 'login';
  $('#sms-login-form', dialog).hidden = mode !== 'sms';
  $('#register-form', dialog).hidden = !registering;
  $('.auth-tabs', dialog).hidden = registering;
  $$('.auth-tabs [role="tab"]', dialog).forEach(tab => { const active = tab.dataset.authMode === mode; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  $('#auth-title', dialog).textContent = registering ? '用户注册' : '账号登录';
  $('.auth-heading p', dialog).textContent = registering ? '使用手机号创建学习账号' : mode === 'sms' ? '使用绑定的手机号登录，继续学习' : '登录后继续你的课程与学习记录';
  const form = registering ? $('#register-form', dialog) : mode === 'sms' ? $('#sms-login-form', dialog) : $('#login-form', dialog);
  $('input', form).focus();
}

function openAuthDialog(trigger, mode = 'login') {
  authReturnFocus = trigger.closest('.header-popup') ? $('#user-entry') : trigger;
  if (typeof closeHeaderPopups === 'function') closeHeaderPopups();
  const dialog = ensureAuthDialog();
  dialog.showModal();
  setAuthMode(mode);
}

function finishDemoLogin() {
  const dialog = $('#auth-dialog');
  dialog.close();
  applyAuth(true, false);
  if (typeof persistDemo === 'function') persistDemo();
  showToast('登录成功（演示）');
  if (current === 'profile') openProfileView('courses');
  else go('profile');
}

document.addEventListener('click', event => {
  const auth = event.target.closest('[data-auth]');
  if (!auth) return;
  const logged = auth.dataset.auth === 'member';
  if (auth.closest('#state-menu') || !logged) {
    applyAuth(logged);
    $('#state-menu').classList.remove('open');
    $('#state-toggle').setAttribute('aria-expanded', 'false');
    if (logged && current === 'profile') openProfileView('courses');
    return;
  }
  event.preventDefault();
  openAuthDialog(auth);
});

applyAuth(prototypeState.logged, false);
