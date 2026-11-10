(() => {
 'use strict';
 const $=selector=>document.querySelector(selector),params=new URLSearchParams(location.search);
 const role=$('#login-role'),password=$('#password-form'),sms=$('#sms-form'),send=$('#send-code'),tabs=[...document.querySelectorAll('[data-login-mode]')];
 let requestedPhone='',expires=0,resendAt=0,timer;
 role.value=AdminAuth.role;
 function reset(){
  password.reset();sms.reset();password.elements.password.type='password';$('#password-toggle').textContent='显示';$('#password-toggle').setAttribute('aria-label','显示密码');
  document.querySelectorAll('.login-error').forEach(node=>node.textContent='');
  requestedPhone='';expires=0;clearInterval(timer);send.disabled=false;send.textContent='获取验证码';$('#code-status').textContent='';
 }
 function updateRole(){reset();$('#login-role-note').textContent=role.value==='super'?'登录后进入超级管理员平台总览':'登录后进入教师教学工作台';}
 updateRole();role.addEventListener('change',updateRole);
 if(params.get('signedOut')==='1')$('#login-status').textContent='已退出系统，请重新登录。';
 function mode(value){reset();password.hidden=value!=='password';sms.hidden=value!=='sms';tabs.forEach(tab=>{const active=tab.dataset.loginMode===value;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});}
 tabs.forEach((tab,i)=>{tab.onclick=()=>mode(tab.dataset.loginMode);tab.onkeydown=event=>{let next;if(event.key==='ArrowRight')next=(i+1)%2;if(event.key==='ArrowLeft')next=(i+1)%2;if(event.key==='Home')next=0;if(event.key==='End')next=1;if(next!==undefined){event.preventDefault();mode(tabs[next].dataset.loginMode);tabs[next].focus();}};});
 $('#password-toggle').onclick=()=>{const visible=password.elements.password.type==='password';password.elements.password.type=visible?'text':'password';$('#password-toggle').textContent=visible?'隐藏':'显示';$('#password-toggle').setAttribute('aria-label',visible?'隐藏密码':'显示密码');};
 const error=(form,message,input)=>{form.querySelector('.login-error').textContent=message;input?.focus();};
 function validPhone(){if(!/^1[3-9]\d{9}$/.test(sms.elements.phone.value)){error(sms,'请输入有效的 11 位手机号。',sms.elements.phone);return false;}return true;}
 function tick(){const remaining=Math.max(0,Math.ceil((resendAt-Date.now())/1000));send.disabled=remaining>0;send.textContent=remaining?remaining+' 秒后重试':'重新获取';if(!remaining)clearInterval(timer);}
 send.onclick=()=>{if(!validPhone())return;requestedPhone=sms.elements.phone.value;expires=Date.now()+5*60*1000;resendAt=Date.now()+60000;sms.querySelector('.login-error').textContent='';$('#code-status').textContent='演示验证码：123456，5 分钟内有效（不发送短信）。';tick();timer=setInterval(tick,1000);sms.elements.code.focus();};
 function complete(){
  reset();location.href=AdminAuth.destination(role.value===AdminAuth.role?params.get('next'):'',role.value);
 }
 password.onsubmit=event=>{event.preventDefault();password.elements.account.value=password.elements.account.value.trim();password.querySelector('.login-error').textContent='';if(!password.reportValidity())return;complete();};
 sms.onsubmit=event=>{event.preventDefault();sms.querySelector('.login-error').textContent='';if(!validPhone()||!sms.reportValidity())return;if(requestedPhone!==sms.elements.phone.value||Date.now()>expires){error(sms,'请先为当前手机号获取验证码。',sms.elements.phone);return;}if(sms.elements.code.value!=='123456'){error(sms,'验证码不正确，请输入演示验证码 123456。',sms.elements.code);return;}complete();};
 window.addEventListener('pagehide',reset);
})();
