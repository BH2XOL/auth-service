export function loginPage(loggedIn = false, hasPasskey = false): string {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>登录</title>
<link rel="icon" href="https://blog.bh2xol.com/favicon-round.png">
<style>
:root{--bg:#ffffff;--card-bg:rgba(255,255,255,0.92);--card-border:rgba(0,0,0,0.07);--card-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.06);--text:#1f2328;--text-heading:#0d1117;--muted:#656d76;--accent:#0969da;--accent-border:rgba(9,105,218,0.28);--divider:rgba(0,0,0,0.06);--input-bg:rgba(0,0,0,0.04);--input-border:rgba(0,0,0,0.1);--radius:12px;--glow:rgba(9,105,218,0.03)}
html[data-theme="dark"]{--bg:#0d1117;--card-bg:rgba(22,27,34,0.85);--card-border:rgba(255,255,255,0.06);--card-shadow:0 1px 3px rgba(0,0,0,0.3),0 8px 24px rgba(0,0,0,0.2);--text:#e6edf3;--text-heading:#f0f6fc;--muted:#8b949e;--accent:#58a6ff;--accent-border:rgba(88,166,255,0.32);--divider:rgba(255,255,255,0.06);--input-bg:rgba(255,255,255,0.05);--input-border:rgba(255,255,255,0.1);--glow:rgba(88,166,255,0.04)}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans SC',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;-webkit-font-smoothing:antialiased;transition:background-color .4s,color .4s;position:relative}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% 35%,var(--glow) 0%,transparent 70%);pointer-events:none}
.card{background:var(--card-bg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--card-border);border-radius:var(--radius);padding:2rem 1.75rem;width:360px;box-shadow:var(--card-shadow);position:relative;z-index:1;transition:background-color .4s,border-color .4s,box-shadow .4s}
.logo{width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid var(--card-border);margin:0 auto 1rem}
.logo img{width:100%;height:100%;object-fit:cover}
h1{font-size:1.05rem;font-weight:700;letter-spacing:.12em;color:var(--text-heading);text-align:center;transition:color .4s}
.sub{color:var(--muted);font-size:.75rem;text-align:center;margin:.3rem 0 1.25rem;letter-spacing:.04em;transition:color .4s}
.tabs{display:flex;gap:.5rem;margin-bottom:1.1rem;background:var(--input-bg);padding:.25rem;border-radius:8px;border:1px solid var(--input-border)}
.tab{flex:1;height:2rem;border:none;border-radius:6px;background:transparent;color:var(--muted);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .2s}
.tab.active{background:var(--accent);color:#fff}
label{display:block;font-size:.68rem;color:var(--muted);margin-bottom:.3rem;letter-spacing:.04em}
input{width:100%;height:2.4rem;padding:0 .75rem;margin-bottom:.9rem;border-radius:8px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text);box-sizing:border-box;font-size:.88rem;outline:none;transition:border-color .25s,box-shadow .25s,background-color .25s;font-family:inherit}
input:focus{border-color:var(--accent-border);box-shadow:0 0 0 2px var(--accent-border)}
button.primary{width:100%;height:2.45rem;border:none;border-radius:8px;background:var(--accent);color:#fff;font-size:.88rem;font-weight:500;cursor:pointer;transition:opacity .2s;font-family:inherit}
button.secondary{width:100%;height:2.35rem;border:1px solid var(--input-border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:.84rem;font-weight:500;cursor:pointer;margin-top:.6rem;font-family:inherit}
button:hover{opacity:.88}
button:disabled{opacity:.5}
#step2{display:none}
#msg{color:#cf222e;font-size:.78rem;margin-top:.85rem;min-height:1rem;text-align:center}
.msg-ok{color:#2da44e!important}
.hint{font-size:.75rem;color:var(--muted);line-height:1.5;margin-bottom:1rem;text-align:center}
@media(prefers-color-scheme:dark){html:not([data-theme]){--bg:#0d1117;--card-bg:rgba(22,27,34,0.85);--card-border:rgba(255,255,255,0.06);--card-shadow:0 1px 3px rgba(0,0,0,0.3),0 8px 24px rgba(0,0,0,0.2);--text:#e6edf3;--text-heading:#f0f6fc;--muted:#8b949e;--accent:#58a6ff;--accent-border:rgba(88,166,255,0.32);--divider:rgba(255,255,255,0.06);--input-bg:rgba(255,255,255,0.05);--input-border:rgba(255,255,255,0.1);--glow:rgba(88,166,255,0.04)}}
</style></head><body>
<div class="card">
<div class="logo"><img src="https://image.bh2xol.com/image/profile.jpg" alt=""></div>
<h1>管理后台登录</h1>
<div class="sub">BH2XOL · 安全验证</div>

${loggedIn ? `
<div id="loggedPanel">
  <p class="hint">当前设备已登录。你可以绑定此设备的 Passkey（指纹 / 面容），以后免输密码直接登录。</p>
  <button class="primary" id="bindBtn" onclick="bindPasskey()">绑定当前设备为 Passkey</button>
  <button class="secondary" onclick="goReturn()">返回目标页面</button>
</div>
` : `
<div class="tabs">
  <button class="tab ${hasPasskey ? "active" : ""}" id="tabPasskey" onclick="switchTab('passkey')">Passkey 登录</button>
  <button class="tab ${hasPasskey ? "" : "active"}" id="tabOtp" onclick="switchTab('otp')">邮箱验证码</button>
</div>

<div id="panelPasskey" style="display:${hasPasskey ? "block" : "none"}">
  <p class="hint">${hasPasskey ? "使用已绑定的生物识别 / 通行密钥一键验证登录。" : "尚未绑定 Passkey，请先用邮箱验证码登录后绑定。"}</p>
  <button class="primary" id="btnPasskey" onclick="passkeyLogin()">使用 Passkey / 指纹登录</button>
</div>

<div id="panelOtp" style="display:${hasPasskey ? "none" : "block"}">
  <div id="step1">
    <label>邮箱</label>
    <input id="email" type="email" placeholder="you@example.com" autocomplete="username">
    <label>密码</label>
    <input id="pw" type="password" placeholder="密码" autocomplete="current-password">
    <button class="primary" id="btn1" onclick="step1()">获取验证码</button>
  </div>
  <div id="step2">
    <label>邮箱验证码</label>
    <input id="code" type="text" placeholder="6 位验证码" inputmode="numeric">
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
