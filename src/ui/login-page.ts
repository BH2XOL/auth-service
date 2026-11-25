export function loginPage(loggedIn = false, hasPasskey = false): string {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>登录 · BH2XOL</title>
<link rel="icon" href="https://blog.bh2xol.com/favicon-round.png">
<style>
:root{
  --md-primary:#0b57d0;
  --md-on-primary:#ffffff;
  --md-primary-container:#d3e3fd;
  --md-on-primary-container:#041e49;
  --md-secondary-container:#c2e7ff;
  --md-on-secondary-container:#001d35;
  --md-surface:#f8f9fc;
  --md-surface-container-low:#ffffff;
  --md-surface-container:#eef2f8;
  --md-surface-container-high:#e4e9f2;
  --md-on-surface:#1b1b1f;
  --md-on-surface-variant:#44474f;
  --md-outline:#74777f;
  --md-outline-variant:#c4c6d0;
  --md-error:#ba1a1a;
  --md-error-container:#ffdad6;
  --md-on-error-container:#410002;
  --md-ok-container:#d4f4dd;
  --md-on-ok-container:#073b1a;
  --md-shadow:0 1px 2px rgba(0,0,0,0.08),0 4px 12px rgba(11,87,208,0.06);
  --md-ambient:radial-gradient(circle at 20% 20%,rgba(11,87,208,0.08),transparent 45%),radial-gradient(circle at 80% 80%,rgba(194,231,255,0.28),transparent 50%);
}
@media(prefers-color-scheme:dark){
  html:not([data-theme="light"]){
    --md-primary:#a8c7fa;
    --md-on-primary:#062e6f;
    --md-primary-container:#0842a0;
    --md-on-primary-container:#d3e3fd;
    --md-secondary-container:#004a77;
    --md-on-secondary-container:#c2e7ff;
    --md-surface:#111318;
    --md-surface-container-low:#1b1d23;
    --md-surface-container:#23262e;
    --md-surface-container-high:#2d3039;
    --md-on-surface:#e3e2e6;
    --md-on-surface-variant:#c4c6d0;
    --md-outline:#8e9099;
    --md-outline-variant:#44474f;
    --md-error:#ffb4ab;
    --md-error-container:#93000a;
    --md-on-error-container:#ffdad6;
    --md-ok-container:#0f5223;
    --md-on-ok-container:#c4eed0;
    --md-shadow:0 2px 6px rgba(0,0,0,0.36),0 8px 24px rgba(0,0,0,0.28);
    --md-ambient:radial-gradient(circle at 20% 20%,rgba(168,199,250,0.09),transparent 45%),radial-gradient(circle at 80% 80%,rgba(0,74,119,0.18),transparent 50%);
  }
}
html[data-theme="dark"]{
  --md-primary:#a8c7fa;
  --md-on-primary:#062e6f;
  --md-primary-container:#0842a0;
  --md-on-primary-container:#d3e3fd;
  --md-secondary-container:#004a77;
  --md-on-secondary-container:#c2e7ff;
  --md-surface:#111318;
  --md-surface-container-low:#1b1d23;
  --md-surface-container:#23262e;
  --md-surface-container-high:#2d3039;
  --md-on-surface:#e3e2e6;
  --md-on-surface-variant:#c4c6d0;
  --md-outline:#8e9099;
  --md-outline-variant:#44474f;
  --md-error:#ffb4ab;
  --md-error-container:#93000a;
  --md-on-error-container:#ffdad6;
  --md-ok-container:#0f5223;
  --md-on-ok-container:#c4eed0;
  --md-shadow:0 2px 6px rgba(0,0,0,0.36),0 8px 24px rgba(0,0,0,0.28);
  --md-ambient:radial-gradient(circle at 20% 20%,rgba(168,199,250,0.09),transparent 45%),radial-gradient(circle at 80% 80%,rgba(0,74,119,0.18),transparent 50%);
}
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:'Roboto','Segoe UI','Noto Sans SC',-apple-system,BlinkMacSystemFont,sans-serif;
  background:var(--md-surface);
  color:var(--md-on-surface);
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:1.5rem;
  -webkit-font-smoothing:antialiased;
  position:relative;
  transition:background-color .3s cubic-bezier(.2,0,0,1),color .3s cubic-bezier(.2,0,0,1);
}
body::before{
  content:'';
  position:fixed;
  inset:0;
  background:var(--md-ambient);
  pointer-events:none;
}
.card{
  background:var(--md-surface-container-low);
  border:1px solid var(--md-outline-variant);
  border-radius:28px;
  padding:2.25rem 1.75rem 1.75rem;
  width:100%;
  max-width:392px;
  box-shadow:var(--md-shadow);
  position:relative;
  z-index:1;
  transition:background-color .3s cubic-bezier(.2,0,0,1),border-color .3s,box-shadow .3s;
}
.header{
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-bottom:1.5rem;
}
.logo{
  width:56px;
  height:56px;
  border-radius:50%;
  overflow:hidden;
  border:2px solid var(--md-primary-container);
  background:var(--md-surface-container);
  margin-bottom:1rem;
}
.logo img{width:100%;height:100%;object-fit:cover}
h1{
  font-size:1.375rem;
  font-weight:500;
  line-height:1.75rem;
  color:var(--md-on-surface);
  letter-spacing:0;
  text-align:center;
}
.sub{
  color:var(--md-on-surface-variant);
  font-size:.8125rem;
  margin-top:.25rem;
  letter-spacing:.02em;
  text-align:center;
}
.tabs{
  display:grid;
  grid-template-columns:1fr 1fr;
  margin-bottom:1.25rem;
  border:1px solid var(--md-outline);
  border-radius:9999px;
  overflow:hidden;
  background:transparent;
}
.tab{
  height:40px;
  border:none;
  background:transparent;
  color:var(--md-on-surface);
  font-size:.875rem;
  font-weight:500;
  letter-spacing:.01em;
  cursor:pointer;
  transition:background-color .2s cubic-bezier(.2,0,0,1),color .2s;
  font-family:inherit;
}
.tab + .tab{border-left:1px solid var(--md-outline)}
.tab:hover:not(.active){background:var(--md-surface-container)}
.tab.active{
  background:var(--md-secondary-container);
  color:var(--md-on-secondary-container);
}
.field{margin-bottom:1rem}
label{
  display:block;
  font-size:.75rem;
  font-weight:500;
  color:var(--md-on-surface-variant);
  margin-bottom:.375rem;
  padding-left:.25rem;
  letter-spacing:.02em;
}
input{
  width:100%;
  height:48px;
  padding:0 1rem;
  border-radius:12px;
  border:1px solid var(--md-outline);
  background:transparent;
  color:var(--md-on-surface);
  font-size:.9375rem;
  outline:none;
  font-family:inherit;
  transition:border-color .2s,box-shadow .2s,background-color .2s;
}
input:hover{border-color:var(--md-on-surface)}
input:focus{
  border-color:var(--md-primary);
  box-shadow:0 0 0 1px var(--md-primary);
}
button.primary{
  width:100%;
  height:44px;
  border:none;
  border-radius:9999px;
  background:var(--md-primary);
  color:var(--md-on-primary);
  font-size:.875rem;
  font-weight:500;
  letter-spacing:.01em;
  cursor:pointer;
  font-family:inherit;
  margin-top:.25rem;
  transition:filter .2s,box-shadow .2s,opacity .2s;
}
button.primary:hover:not(:disabled){
  filter:brightness(1.06);
  box-shadow:0 1px 3px rgba(0,0,0,0.2);
}
button.secondary{
  width:100%;
  height:42px;
  border:1px solid var(--md-outline);
  border-radius:9999px;
  background:transparent;
  color:var(--md-primary);
  font-size:.875rem;
  font-weight:500;
  cursor:pointer;
  margin-top:.75rem;
  font-family:inherit;
  transition:background-color .2s;
}
button.secondary:hover:not(:disabled){background:var(--md-surface-container)}
button:disabled{opacity:.48;cursor:not-allowed}
#step2{display:none}
.hint{
  font-size:.8125rem;
  color:var(--md-on-surface-variant);
  line-height:1.5;
  margin-bottom:1.125rem;
  text-align:center;
  background:var(--md-surface-container);
  padding:.75rem 1rem;
  border-radius:16px;
}
#msg{
  font-size:.8125rem;
  line-height:1.4;
  margin-top:1rem;
  text-align:center;
  border-radius:12px;
  padding:.625rem .875rem;
  background:var(--md-error-container);
  color:var(--md-on-error-container);
  display:none;
}
#msg:not(:empty){display:block}
#msg.msg-ok{
  background:var(--md-ok-container);
  color:var(--md-on-ok-container);
}
</style></head><body>
<div class="card">
  <div class="header">
    <div class="logo"><img src="https://image.bh2xol.com/image/profile.jpg" alt="BH2XOL"></div>
    <h1>管理后台登录</h1>
    <div class="sub">BH2XOL · 安全验证</div>
  </div>

${loggedIn ? `
  <div id="loggedPanel">
    <p class="hint">当前设备已登录。你可以绑定此设备的 Passkey（指纹 / 面容），以后免输密码直接登录。</p>
    <button class="primary" id="bindBtn" onclick="bindPasskey()">绑定当前设备为 Passkey</button>
    <button class="secondary" onclick="goReturn()">返回目标页面</button>
  </div>
` : `
  <div class="tabs" role="tablist">
    <button class="tab ${hasPasskey ? "active" : ""}" id="tabPasskey" onclick="switchTab('passkey')">Passkey 登录</button>
    <button class="tab ${hasPasskey ? "" : "active"}" id="tabOtp" onclick="switchTab('otp')">邮箱验证码</button>
  </div>

  <div id="panelPasskey" style="display:${hasPasskey ? "block" : "none"}">
    <p class="hint">${hasPasskey ? "使用已绑定的生物识别 / 通行密钥一键验证登录。" : "尚未绑定 Passkey，请先用邮箱验证码登录后绑定。"}</p>
    <button class="primary" id="btnPasskey" onclick="passkeyLogin()">使用 Passkey / 指纹登录</button>
  </div>

  <div id="panelOtp" style="display:${hasPasskey ? "none" : "block"}">
    <div id="step1">
      <div class="field">
        <label for="email">邮箱</label>
        <input id="email" type="email" placeholder="you@example.com" autocomplete="username">
      </div>
      <div class="field">
        <label for="pw">密码</label>
        <input id="pw" type="password" placeholder="输入管理员密码" autocomplete="current-password">
      </div>
      <button class="primary" id="btn1" onclick="step1()">获取验证码</button>
    </div>
    <div id="step2">
      <div class="field">
        <label for="code">邮箱验证码</label>
        <input id="code" type="text" placeholder="6 位验证码" inputmode="numeric">
      </div>
      <button class="primary" id="btn2" onclick="step2()">登录</button>
    </div>
  </div>
`}

  <div id="msg"></div>
</div>
<script>
function b64uToBuf(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4)s+='=';
  var bin=atob(s),arr=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
  return arr.buffer;
}
function bufToB64u(buf){
  var arr=new Uint8Array(buf),bin='';
  for(var i=0;i<arr.length;i++)bin+=String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
}
function goReturn(){
  var ret=new URLSearchParams(location.search).get('return')||'https://log.bh2xol.com/admin';
  location.href=ret;
}
function switchTab(t){
  document.getElementById('tabPasskey').className='tab'+(t==='passkey'?' active':'');
  document.getElementById('tabOtp').className='tab'+(t==='otp'?' active':'');
  document.getElementById('panelPasskey').style.display=t==='passkey'?'block':'none';
  document.getElementById('panelOtp').style.display=t==='otp'?'block':'none';
  document.getElementById('msg').textContent='';
}
async function passkeyLogin(){
  var msg=document.getElementById('msg');
  if(!window.PublicKeyCredential){msg.textContent='当前浏览器不支持 Passkey，请切换「邮箱验证码」';msg.className='';return;}
  var btn=document.getElementById('btnPasskey');btn.disabled=true;msg.textContent='';msg.className='';
  try{
    var r1=await fetch('/webauthn/login/options',{method:'POST'});
    var opt=await r1.json();
    if(!r1.ok){msg.textContent=opt.error||'获取挑战失败';btn.disabled=false;return;}
    var pub={
      challenge:b64uToBuf(opt.challenge),
      rpId:opt.rpId,
      timeout:opt.timeout||60000,
      userVerification:opt.userVerification||'preferred',
      allowCredentials:(opt.allowCredentials||[]).map(function(c){return{id:b64uToBuf(c.id),type:'public-key',transports:c.transports};})
    };
    var cred=await navigator.credentials.get({publicKey:pub});
    var payload={
      challengeId:opt.challengeId,
      response:{
        id:cred.id,
        rawId:bufToB64u(cred.rawId),
        type:cred.type,
        response:{
          authenticatorData:bufToB64u(cred.response.authenticatorData),
          clientDataJSON:bufToB64u(cred.response.clientDataJSON),
          signature:bufToB64u(cred.response.signature),
          userHandle:cred.response.userHandle?bufToB64u(cred.response.userHandle):null
        }
      }
    };
    var r2=await fetch('/webauthn/login/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    var d2=await r2.json();
    if(r2.ok){goReturn();}
    else{msg.textContent=d2.error||'验证失败';}
  }catch(e){
    msg.textContent=e.message||'已取消';
  }
  btn.disabled=false;
}
async function bindPasskey(){
  var msg=document.getElementById('msg');
  if(!window.PublicKeyCredential){msg.textContent='当前浏览器不支持 Passkey';msg.className='';return;}
  var btn=document.getElementById('bindBtn');btn.disabled=true;msg.textContent='';msg.className='';
  try{
    var r1=await fetch('/webauthn/register/options',{method:'POST'});
    var opt=await r1.json();
    if(!r1.ok){msg.textContent=opt.error||'获取注册参数失败';btn.disabled=false;return;}
    var pub={
      challenge:b64uToBuf(opt.challenge),
      rp:opt.rp,
      user:{id:b64uToBuf(opt.user.id),name:opt.user.name,displayName:opt.user.displayName},
      pubKeyCredParams:opt.pubKeyCredParams,
      timeout:opt.timeout||60000,
      attestation:opt.attestation||'none',
      authenticatorSelection:opt.authenticatorSelection,
      excludeCredentials:(opt.excludeCredentials||[]).map(function(c){return{id:b64uToBuf(c.id),type:'public-key',transports:c.transports};})
    };
    var cred=await navigator.credentials.create({publicKey:pub});
    var payload={
      challengeId:opt.challengeId,
      name:navigator.platform||'Browser',
      response:{
        id:cred.id,
        rawId:bufToB64u(cred.rawId),
        type:cred.type,
        response:{
          attestationObject:bufToB64u(cred.response.attestationObject),
          clientDataJSON:bufToB64u(cred.response.clientDataJSON),
          transports:cred.response.getTransports?cred.response.getTransports():[]
        }
      }
    };
    var r2=await fetch('/webauthn/register/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    var d2=await r2.json();
    if(r2.ok){msg.textContent='Passkey 绑定成功！';msg.className='msg-ok';}
    else{msg.textContent=d2.error||'绑定失败';}
  }catch(e){
    msg.textContent=e.message||'已取消';
  }
  btn.disabled=false;
}
async function step1(){
  var email=document.getElementById('email').value;
  var pw=document.getElementById('pw').value;
  var msg=document.getElementById('msg');
  if(!email||!pw){msg.textContent='请输入邮箱和密码';msg.className='';return;}
  msg.textContent='';msg.className='';
  document.getElementById('btn1').disabled=true;
  var r=await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw})});
  var d=await r.json();
  if(r.ok){document.getElementById('step1').style.display='none';document.getElementById('step2').style.display='block';msg.textContent='验证码已发送';msg.className='msg-ok';}
  else{msg.textContent=d.error||'失败';}
  document.getElementById('btn1').disabled=false;
}
async function step2(){
  var code=document.getElementById('code').value;if(!code)return;
  var msg=document.getElementById('msg');
  document.getElementById('btn2').disabled=true;
  var r=await fetch('/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code})});
  var d=await r.json();
  if(r.ok){goReturn();}
  else{msg.textContent=d.error||'失败';msg.className='';}
  document.getElementById('btn2').disabled=false;
}
</script>
</body></html>`;
}
