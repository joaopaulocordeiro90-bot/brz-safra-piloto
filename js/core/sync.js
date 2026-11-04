/* BRZ Safras — sincronização administrativa (ambiente de teste).
   Dados oficiais permanecem no build; somente as três áreas editáveis são compartilhadas. */
(function(){
"use strict";
const ENDPOINT="https://jxvleqbphljxboleeaot.supabase.co/functions/v1/brz-safra-live-gateway";
const TOKEN="brz_safra_live_admin_session_v1";
const REVISIONS="brz_safra_live_remote_revisions_v1";
const DRAFTS="brz_safra_live_pending_sections_v1";
const SHADOW="brz_safra_live_last_synced_values_v1";
const STORE={
  safra_base:"brz_safra_dataC",
  agrinvest_balance:"brz_safra_agrinvest_bal_v1",
  scenario_assumptions:"brz_safra_cen_v1"
};
const sections=Object.keys(STORE);
let revisions={},shadows={},dirty=new Set(),timer=0,working=false,suspended=false,enabled=false,stopped=false;
try{revisions=JSON.parse(localStorage.getItem(REVISIONS)||"{}")||{};}catch(e){revisions={};}
try{shadows=JSON.parse(localStorage.getItem(SHADOW)||"{}")||{};}catch(e){shadows={};}
try{dirty=new Set(JSON.parse(localStorage.getItem(DRAFTS)||"[]").filter(x=>sections.includes(x)));}catch(e){dirty=new Set();}
function token(){try{return sessionStorage.getItem(TOKEN)||""}catch(e){return ""}}
function status(message,error){
  let p=document.getElementById("brz-sync-status");
  if(!p){p=document.createElement("aside");p.id="brz-sync-status";
    p.setAttribute("role","status");p.style.cssText="position:fixed;right:14px;bottom:14px;z-index:2147483600;background:#fff;border:1px solid #dce5ed;border-left:3px solid #0d9488;border-radius:5px;box-shadow:0 3px 10px #12293f22;padding:8px 11px;max-width:310px;font:600 11px/1.4 Arial,sans-serif;color:#19354d;pointer-events:none";
    document.body.appendChild(p);
  }
  p.textContent=message;p.style.borderLeftColor=error?"#b42318":"#0d9488";
}
async function request(action,data,secret){
  let resp;
  try{resp=await fetch(ENDPOINT,{
    method:"POST",mode:"cors",cache:"no-store",
    headers:{"Content-Type":"application/json",...(secret||token()?{"Authorization":"Bearer "+(secret||token())}:{})},
    body:JSON.stringify({action,...(data||{})})
  });}catch(e){throw new Error("Não foi possível conectar ao Supabase.");}
  let ans;try{ans=await resp.json();}catch(e){throw new Error("Resposta inválida do Supabase.");}
  if(!resp.ok||!ans.ok){
    let err=new Error(ans.error==="conflict"?"Outra sessão alterou estes dados. Nada foi sobrescrito. Exporte seu HTML para guardar a cópia local e recarregue para revisar.":ans.error==="too_many_attempts"?"Muitas tentativas; tente novamente em 15 minutos.":ans.error==="invalid_credentials"?"Senha incorreta.":ans.error==="unauthorized"?"Sua sessão expirou. Entre novamente.":ans.error==="too_large"?"Dados excederam o limite permitido.":"Falha ao comunicar com o Supabase.");
    err.code=ans.error;err.remote=ans;throw err;
  }
  return ans;
}
function saveMetadata(){
  suspended=true;
  try{
    localStorage.setItem(REVISIONS,JSON.stringify(revisions));
    localStorage.setItem(SHADOW,JSON.stringify(shadows));
    localStorage.setItem(DRAFTS,JSON.stringify(Array.from(dirty)));
  }finally{suspended=false;}
}
function hydrate(sectionsRemote){
  let changed=false;
  suspended=true;
  try{
    for(const section of sections){
      const obj=sectionsRemote?.[section];if(!obj)continue;
      const rev=Number(obj.revision);
      const payload=obj.payload;
      if(!Number.isSafeInteger(rev)||rev<1||!payload||typeof payload!=="object"||Array.isArray(payload))continue;
      if(Object.keys(payload).length>0&&Number(revisions[section]||0)!==rev){
        const dest=STORE[section];
        const previous=localStorage.getItem(dest);
        const next=JSON.stringify(payload);
        if(dirty.has(section) && previous!==next){
          stopped=true;
          status("Há edições locais pendentes em "+section+". Sem sobrescrever. Exporte o HTML antes de resolver.",true);
          continue;
        }
        if(previous!==next){
          if(previous){try{localStorage.setItem("brz_safra_live_backup_"+section+"_"+Date.now(),previous);}catch(e){}}
          localStorage.setItem(dest,next);
          changed=true;
        }
        shadows[section]=next;
      } else if (Object.keys(payload).length===0 && !dirty.has(section)){
        shadows[section]=JSON.stringify(payload);
      }
      revisions[section]=rev;
    }
    saveMetadata();
  }finally{suspended=false;}
  return changed;
}
async function login(pin){
  if(!/^[0-9]{6}$/.test(pin))throw new Error("Informe os seis dígitos da senha.");
  const ans=await request("login",{pin});
  try{sessionStorage.setItem(TOKEN,ans.token);}catch(e){throw new Error("Não foi possível manter a sessão neste navegador.");}
  try{
    const remote=await request("read",{},ans.token);
    hydrate(remote.sections);
    sessionStorage.setItem("brz_safra_live_gate_open","yes");
    location.reload();
    return true;
  }catch(err){
    sessionStorage.removeItem(TOKEN);
    sessionStorage.removeItem("brz_safra_live_gate_open");
    throw err;
  }
}
function localData(section){
  const key=STORE[section];
  const value=localStorage.getItem(key);
  if(!value)return null;
  try{const parsed=JSON.parse(value);return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:null;}catch(e){return null;}
}
function queue(section){
  if(!enabled||suspended||stopped||!token()||!sections.includes(section))return;
  dirty.add(section);
  saveMetadata();
  status("BRZ Safras: alterações locais registradas; sincronizando…");
  clearTimeout(timer);timer=setTimeout(flush,700);
}
async function flush(){
  if(working||stopped||!token()||dirty.size===0)return;
  working=true;
  try{
    while(dirty.size){
      const section=dirty.values().next().value;
      dirty.delete(section);
      const payload=localData(section);
      if(!payload){saveMetadata();continue;}
      if(shadows[section]===JSON.stringify(payload)){saveMetadata();continue;}
      const rev=Number(revisions[section]);
      if(!Number.isSafeInteger(rev)||rev<1){dirty.add(section);throw new Error("Revisão da base não carregada. Faça login novamente.");}
      let ans;
      try{ans=await request("save",{section,payload,expected_revision:rev});}
      catch(e){dirty.add(section);saveMetadata();if(e.code==="conflict")stopped=true;throw e;}
      revisions[section]=ans.revision;shadows[section]=JSON.stringify(payload);saveMetadata();
      status("BRZ Safras: "+section.replace(/_/g," ")+" sincronizado ✓");
    }
  }catch(e){
    status("BRZ Safras: "+e.message+" As edições continuam salvas neste navegador.",true);
  }finally{working=false}
}
async function refresh(){
  if(!token()||stopped||working||dirty.size)return;
  try{
    const remote=await request("read");
    const changed=hydrate(remote.sections);
    if(changed && !stopped){status("Dados mais recentes encontrados; atualizando…");location.reload();}
  }catch(e){
    if(e.code==="unauthorized"){
      sessionStorage.removeItem(TOKEN);sessionStorage.removeItem("brz_safra_live_gate_open");
      location.reload();
    }else status("BRZ Safras: sem conexão com o banco. Os dados locais foram mantidos.",true);
  }
}
function start(){
  if(!token())return;
  enabled=true;
  const native=Storage.prototype.setItem;
  try{
    Storage.prototype.setItem=function(k,v){
      const ret=native.apply(this,arguments);
      if(this===localStorage&&!suspended){
        const section=sections.find(s=>STORE[s]===k);
        if(section)queue(section);
      }
      return ret;
    };
  }catch(e){
    status("Sincronização automática indisponível; preservado salvamento local.",true);
    return;
  }
  status("BRZ Safras: sessão de edição ativa · banco conectado");
  if(dirty.size){flush();}else{refresh();}
  window.addEventListener("focus",()=>{if(document.hidden)return;if(dirty.size&&!stopped)flush();else refresh();});
}
async function history(){
  if(!token())throw new Error("Faça login para consultar o histórico.");
  return await request("history");
}
async function backupSnapshot(){
  if(!token()||dirty.size||working||stopped)throw new Error("Há sincronização ou edição local pendente. Resolva antes de gerar o backup.");
  return await request("read");
}
async function restoreRevision(section,revision,expected_revision){
  if(!token()||dirty.size||working||stopped)throw new Error("Há sincronização ou edição local pendente. Não é seguro restaurar.");
  const ans=await request("restore",{section,revision,expected_revision});
  await refresh();
  return ans;
}
window.BRZSYNC={login,refresh,flush,status,history,backupSnapshot,restoreRevision,version:"live-history-2"};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,0),{once:true});else setTimeout(start,0);
})();