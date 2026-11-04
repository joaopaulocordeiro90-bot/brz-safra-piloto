/* BRZ Safras — histórico autenticado e backup independente criptografado. */
(function(){
"use strict";
const LABELS={safra_base:"Base de safras",agrinvest_balance:"Oferta e Demanda · Agrinvest",scenario_assumptions:"Premissas de cenários"};
const SECTIONS=Object.keys(LABELS), ISO="BRZ_SAFRAS_SNAPSHOT_V1", ENCRYPTED="BRZ_SAFRAS_AES256_GCM_V1";
const $=id=>document.getElementById(id);
const htmlEscape=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dateFmt=value=>{
  try{return new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",dateStyle:"short",timeStyle:"short"}).format(new Date(value));}
  catch(e){return "—";}
};
function encode64(array){
  let text="";
  for(let i=0;i<array.length;i+=16384)text+=String.fromCharCode(...array.subarray(i,i+16384));
  return btoa(text);
}
function decode64(text){
  return Uint8Array.from(atob(text),x=>x.charCodeAt(0));
}
async function keyFor(pass,salt,mode){
  const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(pass),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:250000,hash:"SHA-256"},
    material,{name:"AES-GCM",length:256},false,[mode]);
}
function saveFile(data,name){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
async function encryptSnapshot(snapshot,pass){
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await keyFor(pass,salt,"encrypt");
  const clear=new TextEncoder().encode(JSON.stringify(snapshot));
  const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,clear));
  return {format:ENCRYPTED,created_at:snapshot.created_at,algorithm:"AES-256-GCM",
    kdf:"PBKDF2-HMAC-SHA256",iterations:250000,salt:encode64(salt),
    iv:encode64(iv),ciphertext:encode64(ciphertext)};
}
async function decryptSnapshot(file,pass){
  if(!file||file.format!==ENCRYPTED||file.algorithm!=="AES-256-GCM"||
    file.iterations!==250000||typeof file.ciphertext!=="string")throw new Error("Arquivo não é um backup BRZ Safras compatível.");
  const salt=decode64(file.salt),iv=decode64(file.iv),data=decode64(file.ciphertext);
  if(salt.length!==16||iv.length!==12||data.length>2100000)throw new Error("Arquivo de backup inválido ou muito grande.");
  const key=await keyFor(pass,salt,"decrypt");
  let decrypted;
  try{decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,data);}
  catch(e){throw new Error("Senha incorreta ou backup corrompido.");}
  const snapshot=JSON.parse(new TextDecoder().decode(decrypted));
  if(snapshot?.format!==ISO||!snapshot.sections||typeof snapshot.sections!=="object"||
     Object.keys(snapshot.sections).length!==3||
     !SECTIONS.every(s=>snapshot.sections[s]&&typeof snapshot.sections[s]==="object"&&!Array.isArray(snapshot.sections[s])))
    throw new Error("O backup descriptografado não contém as três áreas editáveis.");
  return snapshot;
}
function styles(){
 const sheet=document.createElement("style");sheet.id="brz-history-styles";
 sheet.textContent=[
  '#brz-history-trigger{position:fixed;left:14px;bottom:14px;z-index:2147483000;background:#1A3A5C;color:#fff;border:0;border-radius:6px;padding:9px 14px;box-shadow:0 3px 10px #12293f30;font:700 12px Arial,sans-serif;cursor:pointer}',
  '#brz-history-trigger:hover{background:#24547c}',
  '#brz-history-modal[hidden]{display:none!important}',
  '#brz-history-modal{position:fixed;inset:0;z-index:2147483002;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,31,47,.6);font:12px/1.5 Arial,sans-serif;color:#1E3448}',
  '#brz-history-modal *{box-sizing:border-box}',
  '#brz-history-card{background:white;border-radius:10px;width:min(100%,940px);max-height:94vh;overflow-y:auto;box-shadow:0 18px 56px #12293f50;padding:20px 23px}',
  '#brz-history-card h2{font-size:18px;color:#12293f;margin:0 0 2px}',
  '#brz-history-card h3{font-size:14px;color:#1a3a5c;margin:18px 0 8px}',
  '#brz-history-card .brz-h-sub{color:#66788a;font-size:11px}',
  '#brz-history-card .brz-h-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}',
  '#brz-history-card .brz-h-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
  '#brz-history-card .brz-h-panel{border:1px solid #dce5ed;padding:13px;border-radius:8px;background:#fcfdfe;min-width:0}',
  '#brz-history-card button{border:1px solid #cbd5e1;border-radius:5px;background:#fff;color:#1a3a5c;padding:6px 10px;font:700 11px Arial,sans-serif;cursor:pointer}',
  '#brz-history-card button:hover{background:#eef5f8}',
  '#brz-history-card button:disabled{opacity:.5;cursor:wait}',
  '#brz-history-card .brz-h-primary{background:#1a3a5c;color:#fff;border-color:#1a3a5c}',
  '#brz-history-card .brz-h-primary:hover{background:#24547c}',
  '#brz-history-card input[type=password],#brz-history-card input[type=file]{display:block;width:100%;max-width:100%;margin:6px 0 9px;padding:7px;border:1px solid #cad6e0;border-radius:5px;background:white;font-size:12px}',
  '#brz-history-card label{font-weight:700}',
  '#brz-history-card .brz-h-notice{font-size:11px;color:#526778;margin:7px 0 13px}',
  '#brz-history-card .brz-h-scroll{max-height:260px;overflow:auto;border:1px solid #e1e7ec;border-radius:6px}',
  '#brz-history-card table{border-collapse:collapse;width:100%;font-size:11px}',
  '#brz-history-card th{position:sticky;top:0;background:#eef4f7;text-align:left;font-size:10px;color:#526778}',
  '#brz-history-card td,#brz-history-card th{padding:6px 9px;border-bottom:1px solid #e7edf1;white-space:nowrap}',
  '#brz-history-card td:last-child{text-align:right}',
  '#brz-history-card .brz-h-error{color:#b42318}',
  '#brz-history-card #brz-history-feedback{font-weight:700;min-height:20px;margin-top:12px}',
  '@media(max-width:720px){#brz-history-card .brz-h-cols{grid-template-columns:1fr}#brz-history-card{padding:15px}#brz-history-trigger{bottom:55px}}'
 ].join("\n");
 document.head.appendChild(sheet);
}
function table(rows,cols){
  if(!rows.length)return '<p class="brz-h-notice">Nenhum registro disponível.</p>';
  return '<div class="brz-h-scroll"><table><thead><tr>'+cols.map(x=>'<th>'+x+'</th>').join("")+
    '</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';
}
function clearSecrets(){
  ["brz-h-pass","brz-h-pass2","brz-h-import-pass"].forEach(id=>{if($(id))$(id).value="";});
  if($("brz-h-file"))$("brz-h-file").value="";
}
function inform(message,error){
  const el=$("brz-history-feedback");el.textContent=message;el.className=error?"brz-h-error":"";
}
function build(){
 if($("brz-history-trigger"))return;
 styles();
 const trigger=document.createElement("button");trigger.id="brz-history-trigger";trigger.type="button";
 trigger.textContent="Histórico e backups";trigger.addEventListener("click",open);
 document.body.appendChild(trigger);
 const overlay=document.createElement("div");overlay.id="brz-history-modal";overlay.hidden=true;
 overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
 overlay.setAttribute("aria-labelledby","brz-history-title");
 overlay.innerHTML=
  '<div id="brz-history-card">'+
   '<div class="brz-h-head"><div><h2 id="brz-history-title">Histórico e cópias de segurança</h2>'+
   '<div class="brz-h-sub">BRZ Safras · dados editáveis · horários de Brasília</div></div>'+
   '<button id="brz-h-close" type="button" aria-label="Fechar">Fechar ×</button></div>'+
   '<h3>Revisões do banco</h3><div class="brz-h-notice">Cada restauração cria uma nova revisão. Alterações não sincronizadas nunca são descartadas automaticamente.</div>'+
   '<button id="brz-h-refresh" type="button">Atualizar histórico</button>'+
   '<div id="brz-h-current"></div><div id="brz-h-history"></div><div id="brz-h-daily"></div>'+
   '<h3>Cópia externa independente</h3><div class="brz-h-cols">'+
   '<section class="brz-h-panel"><strong>Baixar backup criptografado</strong>'+
    '<p class="brz-h-notice">Inclui as três áreas editáveis atuais. Guarde o arquivo fora do Supabase, em local privado. A senha do arquivo não é a senha de acesso ao BRZ.</p>'+
    '<label for="brz-h-pass">Nova senha do arquivo (mínimo 12 caracteres)</label><input id="brz-h-pass" type="password" autocomplete="new-password">'+
    '<label for="brz-h-pass2">Repetir senha</label><input id="brz-h-pass2" type="password" autocomplete="new-password">'+
    '<button id="brz-h-export" class="brz-h-primary" type="button">Baixar cópia criptografada</button>'+
    '<p class="brz-h-notice">Criptografia AES-256-GCM. Guarde a senha separadamente: não existe recuperação automática.</p>'+
   '</section><section class="brz-h-panel"><strong>Recuperar backup externo</strong>'+
    '<p class="brz-h-notice">Importação substitui as três áreas editáveis, de forma atômica, após sua confirmação. Uma revisão anterior fica preservada no histórico.</p>'+
    '<label for="brz-h-file">Selecionar arquivo .json criptografado</label><input id="brz-h-file" type="file" accept=".json,application/json">'+
    '<label for="brz-h-import-pass">Senha do arquivo</label><input id="brz-h-import-pass" type="password" autocomplete="off">'+
    '<button id="brz-h-import" type="button">Verificar e importar arquivo</button>'+
   '</section></div><p id="brz-history-feedback" role="status" aria-live="polite"></p>'+
  '</div>';
 document.body.appendChild(overlay);
 $("brz-h-close").addEventListener("click",close);
 overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)close();});
 $("brz-h-refresh").addEventListener("click",refreshHistory);
 $("brz-h-history").addEventListener("click",restoreClick);
 $("brz-h-export").addEventListener("click",exportEncrypted);
 $("brz-h-import").addEventListener("click",importEncrypted);
}
function close(){
 $("brz-history-modal").hidden=true;clearSecrets();inform("");
}
function open(){
 if(!document.documentElement.classList.contains("brz-access-granted")){
   alert("Entre no BRZ Safras antes de consultar backups.");return;
 }
 $("brz-history-modal").hidden=false;
 $("brz-h-close").focus();refreshHistory();
}
async function refreshHistory(){
 if(!window.BRZSYNC||!BRZSYNC.history){inform("Atualize a página. A versão de histórico não foi carregada.",true);return;}
 $("brz-h-refresh").disabled=true;inform("Consultando histórico...");
 try{
  const data=await BRZSYNC.history();
  const current=(data.current||[]).filter(x=>LABELS[x.section]);
  const history=(data.history||[]).filter(x=>LABELS[x.section]);
  const backups=(data.backups||[]).filter(x=>LABELS[x.section]);
  $("brz-h-current").innerHTML='<h3>Estado atual</h3>'+table(current.map(x=>
    '<tr><td>'+htmlEscape(LABELS[x.section])+'</td><td>'+Number(x.revision)+'</td><td>'+htmlEscape(dateFmt(x.updated_at))+'</td></tr>'),
    ["Área","Revisão","Última gravação"]);
  $("brz-h-history").innerHTML='<h3>Histórico preservado</h3>'+table(history.map(x=>
    '<tr><td>'+htmlEscape(LABELS[x.section])+'</td><td>'+Number(x.revision)+'</td><td>'+htmlEscape(dateFmt(x.captured_at))+'</td>'+
    '<td><button type="button" data-section="'+htmlEscape(x.section)+'" data-rev="'+Number(x.revision)+'">Restaurar</button></td></tr>'),
    ["Área","Revisão","Registro","Ação"]);
  $("brz-h-daily").innerHTML='<h3>Backups diários (no Supabase)</h3>'+table(backups.map(x=>
    '<tr><td>'+htmlEscape(LABELS[x.section])+'</td><td>'+Number(x.revision)+'</td><td>'+htmlEscape(x.backup_day)+'</td></tr>'),
    ["Área","Revisão","Dia"]);
  inform("Histórico atualizado. Nenhum dado foi modificado.");
 }catch(e){inform(e.message||"Erro ao consultar o histórico.",true);}
 finally{$("brz-h-refresh").disabled=false;}
}
async function restoreClick(e){
 const btn=e.target.closest("button[data-section][data-rev]");
 if(!btn)return;
 const section=btn.getAttribute("data-section"),revision=Number(btn.getAttribute("data-rev"));
 if(!LABELS[section]||!Number.isSafeInteger(revision))return;
 if(!confirm("Restaurar "+LABELS[section]+" da revisão "+revision+
   "?\n\nOs dados atuais serão preservados como revisão anterior. Alterações não sincronizadas impedem a operação."))return;
 if(prompt('Digite RESTAURAR para confirmar esta recuperação:')!=="RESTAURAR")return;
 btn.disabled=true;inform("Verificando revisão e restaurando...");
 try{
   const data=await BRZSYNC.history();
   const current=(data.current||[]).find(x=>x.section===section);
   if(!current||!Number.isSafeInteger(Number(current.revision)))throw new Error("Não foi possível obter a revisão atual.");
   await BRZSYNC.restoreRevision(section,revision,Number(current.revision));
   inform("Revisão restaurada. A plataforma está atualizando...");
 }catch(err){inform(err.message||"Falha na restauração.",true);}
 finally{btn.disabled=false;}
}
async function exportEncrypted(){
 const btn=$("brz-h-export"),pass=$("brz-h-pass").value,repeat=$("brz-h-pass2").value;
 if(pass.length<12||pass!==repeat){inform("Use uma senha de 12 caracteres ou mais e repita-a corretamente.",true);return;}
 if(!window.crypto?.subtle){inform("Este navegador não oferece criptografia segura.",true);return;}
 btn.disabled=true;inform("Consultando dados e criptografando no navegador...");
 try{
   const data=await BRZSYNC.backupSnapshot(),sections={};
   for(const s of SECTIONS){
     const value=data.sections?.[s]?.payload;
     if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Área indisponível: "+LABELS[s]);
     sections[s]=value;
   }
   const created_at=new Date().toISOString();
   const encrypted=await encryptSnapshot({format:ISO,created_at,sections},pass);
   const test=await decryptSnapshot(encrypted,pass);
   if(!test.sections||Object.keys(test.sections).length!==3)throw new Error("Falha na autoverificação do arquivo.");
   saveFile(encrypted,"BRZ_Safras_backup_"+created_at.slice(0,10)+".json");
   inform("Cópia criptografada preparada e download iniciado. Confirme que o arquivo foi salvo fora do Supabase.");
   clearSecrets();
 }catch(e){inform(e.message||"Falha ao gerar o backup.",true);}
 finally{btn.disabled=false;}
}
async function importEncrypted(){
 const btn=$("brz-h-import"),file=$("brz-h-file").files[0],pass=$("brz-h-import-pass").value;
 if(!file||!pass){inform("Selecione o backup e informe sua senha.",true);return;}
 if(file.size>5000000){inform("Arquivo muito grande para importação segura.",true);return;}
 btn.disabled=true;inform("Verificando integridade e senha...");
 try{
   const encrypted=JSON.parse(await file.text()),snapshot=await decryptSnapshot(encrypted,pass);
   if(!confirm("Backup de "+dateFmt(snapshot.created_at)+".\n\nA importação substituirá as três áreas editáveis atuais por esses valores. O histórico anterior será preservado.\n\nDeseja continuar?")){
     inform("Importação cancelada. Nada foi alterado.");return;
   }
   if(prompt("Para confirmar a substituição das TRÊS áreas, digite IMPORTAR:")!=="IMPORTAR"){
     inform("Importação cancelada. Nada foi alterado.");return;
   }
   inform("Importando com controle transacional...");
   await BRZSYNC.importSnapshot(snapshot.sections);
   inform("Backup importado. Recarregando dados...");
 }catch(e){inform(e.message||"Não foi possível importar o arquivo.",true);}
 finally{clearSecrets();btn.disabled=false;}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build,{once:true});else build();
})();