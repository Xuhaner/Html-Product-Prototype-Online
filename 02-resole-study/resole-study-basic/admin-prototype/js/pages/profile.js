/* Current-account information only. All changes remain in this page's memory. */
(() => {
 'use strict';
 const {isSuper,role,setUser,openModal,closeModal,toast}=window.AdminUI;
 const home=(isSuper?'super-admin':'index')+'.html?role='+role;
 if(new URLSearchParams(location.search).get('view')==='signed-out'){
  AdminAuth.signOut(role);
  return;
 }
 const account=isSuper?{id:'A001',login:'platform.admin',name:'平台管理员',gender:'未填写',address:'',bio:'负责平台教学服务、账号与运营管理。',phone:'138****0001',email:'admin@example.edu',institution:'睿秀学城平台',department:'平台运营部',position:'超级管理员',institutionId:'PLATFORM',certified:'2026-09-01 10:00',avatar:''}:{id:'T001',login:'chen.teacher',name:'陈若云',gender:'女',address:'上海市普陀区',bio:'关注编程教学与数字素养，负责课程与班级教学管理。',phone:'138****5678',email:'',institution:'华东师范大学',department:'计算机科学与技术学院',position:'任课教师',institutionId:'ORG001',certified:'2026-09-01 10:00',avatar:''};
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const form=document.getElementById('profile-form'),details=document.getElementById('profile-details'),edit=document.getElementById('profile-edit'),error=document.getElementById('profile-error');
 const securityForm=document.getElementById('security-form'),securityModal=document.getElementById('security-modal'),securityError=document.getElementById('security-error');
 let draftAvatar='',imageRequest=0,imageLoading=false,securityKind='',codeRequested=false;
 function avatar(node,image,name){node.replaceChildren();if(image){const img=document.createElement('img');img.src=image;img.alt='当前头像';node.append(img);}else node.textContent=name.slice(0,1);}
 function infoRow(label,value,wide=false){return `<div${wide?' class="profile-wide"':''}><dt>${label}</dt><dd>${esc(value||'未填写')}</dd></div>`;}
 function renderInformation(){
  document.getElementById('identity-name').textContent=account.name;
  document.getElementById('identity-account').textContent=account.login+' · '+account.position;
  avatar(document.getElementById('identity-avatar'),account.avatar,account.name);setUser(account.name,account.avatar);
  details.innerHTML=infoRow('账号 ID',account.id)+infoRow('账号名',account.login)+infoRow('用户名称',account.name)+infoRow('性别',account.gender)+infoRow('已绑定手机',account.phone)+infoRow('个人认证','已通过（示例）')+infoRow('联系地址',account.address)+infoRow('个人介绍',account.bio)+`<div class="profile-wide"><dt>头像</dt><dd><div class="profile-avatar" id="information-avatar"></div></dd></div>`;
  avatar(document.getElementById('information-avatar'),account.avatar,account.name);
 }
 function renderSecurity(){
  document.getElementById('profile-security').innerHTML=[['phone','手机','用于接收通知与验证身份，绑定后可使用手机号登录。',account.phone,'更改绑定'],['password','登录密码','修改密码需要填写当前密码、新密码及确认密码。',account.passwordUpdated?'已修改（演示）':'已设置','修改'],['email','邮箱','用于接收消息和账号安全通知。',account.email||'未绑定',account.email?'更改绑定':'绑定']].map(([kind,title,description,value,action])=>`<article class="profile-security-row"><h3>${title}</h3><p>${description}</p><span class="profile-security-value">${esc(value)}</span><button type="button" class="btn small" data-security="${kind}">${action}</button></article>`).join('');
 }
 document.getElementById('profile-home').setAttribute('href',home);
 document.getElementById('profile-organization').innerHTML=infoRow('机构名称',account.institution)+infoRow('机构编号',account.institutionId)+infoRow('所属部门',account.department)+infoRow('机构内身份',account.position)+infoRow('认证状态','已通过（示例）')+infoRow('认证时间',account.certified);
 document.getElementById('organization-records').innerHTML=`<article class="institution-event"><h3>机构认证通过</h3><p>${esc(account.certified)} · ${esc(account.institution)}</p><p>当前账号机构归属已确认（预置示例）。</p></article><article class="institution-event"><h3>建立机构关联</h3><p>2026-08-28 09:00 · ${esc(account.position)}</p><p>账号关联至 ${esc(account.department)}（预置示例）。</p></article>`;
 renderInformation();renderSecurity();
 function endEdit(){imageRequest++;imageLoading=false;form.hidden=true;details.hidden=false;edit.hidden=false;form.reset();form.elements.name.removeAttribute('aria-invalid');error.textContent='';edit.focus();}
 edit.addEventListener('click',()=>{
  form.elements.name.value=account.name;form.elements.gender.value=account.gender;form.elements.address.value=account.address;form.elements.bio.value=account.bio;draftAvatar=account.avatar;avatar(document.getElementById('draft-avatar'),draftAvatar,account.name);error.textContent='';document.getElementById('profile-feedback').textContent='';
  details.hidden=true;form.hidden=false;edit.hidden=true;form.elements.name.focus();
 });
 document.getElementById('profile-cancel').addEventListener('click',endEdit);
 document.getElementById('profile-image-reset').addEventListener('click',()=>{imageRequest++;imageLoading=false;draftAvatar='';document.getElementById('profile-image').value='';avatar(document.getElementById('draft-avatar'),'',form.elements.name.value||account.name);error.textContent='';});
 document.getElementById('profile-image').addEventListener('change',event=>{
  const file=event.target.files[0];const request=++imageRequest;imageLoading=false;if(!file)return;
  if(!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)||(file.type&&!['image/jpeg','image/png','image/gif','image/bmp','image/x-ms-bmp'].includes(file.type))){error.textContent='请选择 JPG、PNG、GIF 或 BMP 图片。';event.target.value='';return;}
  if(file.size>2*1024*1024){error.textContent='头像不能超过 2 MB。';event.target.value='';return;}
  imageLoading=true;error.textContent='正在读取头像…';
  const reader=new FileReader();const failed=()=>{if(request!==imageRequest)return;imageLoading=false;error.textContent='图片无法读取，请选择有效图片。';event.target.value='';};
  reader.onerror=failed;reader.onload=()=>{if(request!==imageRequest)return;const image=new Image();image.onerror=failed;image.onload=()=>{if(request!==imageRequest)return;draftAvatar=reader.result;imageLoading=false;avatar(document.getElementById('draft-avatar'),draftAvatar,account.name);error.textContent='';};image.src=reader.result;};reader.readAsDataURL(file);
 });
 form.addEventListener('submit',event=>{
  event.preventDefault();error.textContent='';form.elements.name.removeAttribute('aria-invalid');
  const name=form.elements.name.value.trim();
  if(!name||name.length>20){error.textContent='请填写 1–20 个字的用户名称。';form.elements.name.setAttribute('aria-invalid','true');form.elements.name.focus();return;}
  if(imageLoading){error.textContent='请等待头像读取完成后再保存。';return;}
  Object.assign(account,{name,gender:form.elements.gender.value,address:form.elements.address.value.trim(),bio:form.elements.bio.value.trim(),avatar:draftAvatar});
  renderInformation();endEdit();document.getElementById('profile-feedback').textContent='个人资料已在本页更新，刷新恢复。';toast('资料已更新','仅更新本页演示资料，刷新后恢复。');
 });
 const input=(id,label,type='text',extra='')=>`<div class="form-group full"><label for="${id}">${label} *</label><input id="${id}" name="${id}" type="${type}" required ${extra}></div>`;
 document.getElementById('profile-security').addEventListener('click',event=>{
  const button=event.target.closest('[data-security]');if(!button)return;
  securityKind=button.dataset.security;codeRequested=false;securityError.textContent='';securityForm.reset();
  document.getElementById('security-title').textContent=securityKind==='phone'?'更改手机绑定':securityKind==='email'?(account.email?'更改邮箱绑定':'绑定邮箱'):'修改登录密码';
  document.getElementById('security-description').textContent=securityKind==='password'?'仅校验输入格式与两次密码，不核对或保存真实凭据。':'使用演示验证码验证输入，不发送短信或邮件。';
  document.getElementById('security-fields').innerHTML=securityKind==='password'?input('current-password','当前密码','password','autocomplete="current-password"')+input('new-password','新密码','password','autocomplete="new-password" minlength="8" maxlength="64"')+input('confirm-password','确认新密码','password','autocomplete="new-password"')+'<small class="form-group full">新密码为 8–64 位，至少包含字母和数字。</small>':input('new-contact',securityKind==='phone'?'新手机号':'邮箱',securityKind==='phone'?'tel':'email',securityKind==='phone'?'autocomplete="tel" inputmode="tel" maxlength="11"':'autocomplete="email"')+input('verification-code','演示验证码','text','inputmode="numeric" maxlength="6" autocomplete="off"')+'<div class="security-code-help">这是本地验证演示，不发送真实验证码。<br><button class="btn small" type="button" id="get-demo-code">获取演示验证码</button><p id="demo-code-hint" role="status"></p></div>';
  openModal('security-modal',button);
 });
 securityForm.addEventListener('click',event=>{if(event.target.id!=='get-demo-code')return;codeRequested=true;document.getElementById('demo-code-hint').textContent='本次演示验证码：123456';});
 securityForm.addEventListener('submit',event=>{
  event.preventDefault();securityError.textContent='';securityForm.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  const fail=(id,message)=>{securityError.textContent=message;const el=document.getElementById(id);el.setAttribute('aria-invalid','true');el.focus();};
  if(securityKind==='password'){
   if(!document.getElementById('current-password').value){fail('current-password','请填写当前密码（仅作必填演示）。');return;}
   const next=document.getElementById('new-password').value;
   if(next.length<8||next.length>64||!/[a-z]/i.test(next)||!/[0-9]/.test(next)){fail('new-password','新密码须为 8–64 位，并包含字母与数字。');return;}
   if(next!==document.getElementById('confirm-password').value){fail('confirm-password','两次输入的新密码不一致。');return;}
   if(next===document.getElementById('current-password').value){fail('new-password','新密码不能与当前输入相同。');return;}
   account.passwordUpdated=true;
  }else{
   const contact=document.getElementById('new-contact'),value=contact.value.trim();
   if(securityKind==='phone'&&!/^1[3-9]\d{9}$/.test(value)){fail('new-contact','请填写有效的 11 位手机号。');return;}
   if(securityKind==='email'&&(!value||!contact.validity.valid)){fail('new-contact','请填写有效的邮箱地址。');return;}
   if(!codeRequested||document.getElementById('verification-code').value.trim()!=='123456'){fail('verification-code','请获取并填写正确的演示验证码。');return;}
   if(securityKind==='phone')account.phone=value.slice(0,3)+'****'+value.slice(-4);else account.email=value;
  }
  securityForm.reset();closeModal(securityModal);renderInformation();renderSecurity();document.querySelector(`[data-security="${securityKind}"]`).focus();toast('安全设置已更新','本地演示完成，未发送验证码或修改真实凭据。');
 });
 // Clear credential fields whenever the security dialog closes, including Escape/backdrop.
 new MutationObserver(()=>{if(securityModal.hidden)securityForm.reset();}).observe(securityModal,{attributes:true,attributeFilter:['hidden']});
})();
