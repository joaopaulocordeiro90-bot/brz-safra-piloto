
/* ═══════════ BRZ SAFRA s29 · Base de Dados → Excel (.xlsx) completo ═══════════
   Uma planilha por base: progresso semanal, série histórica, publicações Conab, oferta e demanda
   (Conab e Agrinvest), DERAL PR, IMEA MT e fontes. Números como número, datas como data. */
(function(){
'use strict';
const C=window.C;
const en=()=>document.documentElement.lang==='en';
const T=(pt,e)=>en()?e:pt;
const LBL={begin:'Estoque inicial',production:'Produção',imports:'Importação',supply:'Oferta total',seeds:'Sementes / outros',process:'Processamento',domestic:'Consumo interno',exports:'Exportação',use:'Demanda total',end:'Estoque final'};
function sheets(){
  const S=[],n2s={};Object.entries((C.meta&&C.meta.ufNome)||{}).forEach(([s,n])=>{n2s[n]=s;});
  const pr=[['Cultura','Safra','Operação','UF','Sigla','Semana até','% concluído']];
  Object.entries(C.prog||{}).forEach(([c,ss])=>Object.entries(ss).forEach(([s,ops])=>Object.entries(ops).forEach(([op,ufs])=>Object.entries(ufs).forEach(([u,arr])=>
    (arr||[]).slice().sort((a,b)=>a[0]<b[0]?-1:1).forEach(([d,p])=>pr.push([c,s,op==='Semeadura'?'Plantio':op,u==='BR'?'Brasil':u,u==='BR'?'BR':(n2s[u]||''),d,p]))))));
  S.push({name:'Progresso semanal',rows:pr,widths:[12,10,10,22,7,13,13],fmt:{5:'date',6:'n1'}});
  const hs=[['Cultura','Safra','Geografia','Área (mil ha)','Produtividade (kg/ha)','Produção (mil t)','Situação']];
  Object.entries(C.hist||{}).forEach(([c,h])=>Object.keys(h.prod||{}).forEach(k=>(h.safras||[]).forEach((s,i)=>{
    const a=((h.area||{})[k]||[])[i],y=((h.produt||{})[k]||[])[i],p=((h.prod||{})[k]||[])[i];if(a==null&&y==null&&p==null)return;
    hs.push([c,s,k,a,y,p,s===h.previsao?'estimativa':'']);})));
  S.push({name:'Série histórica Conab',rows:hs,widths:[12,10,15,14,20,16,11],fmt:{3:'n1',4:'n0',5:'n1'}});
  const pv=[['Publicação','Tipo','Referência','Publicada em','Cultura','Safra','Geografia','Área (mil ha)','Produtividade (kg/ha)','Produção (mil t)']];
  (C.vintages||[]).forEach(v=>Object.entries(v.records||{}).forEach(([c,ss])=>Object.entries(ss).forEach(([s,g])=>Object.entries(g).forEach(([k,a])=>
    pv.push([v.label,v.kind,v.reference_month,v.published_at||'',c,s,k,a[0],a[1],a[2]])))));
  S.push({name:'Publicações Conab',rows:pv,widths:[26,14,12,14,12,10,15,14,20,16],fmt:{3:'date',7:'n1',8:'n0',9:'n1'}});
  const B=window.__BAL_OFFICIAL__,ag=(window.BRZBAL&&window.BRZBAL.read)?window.BRZBAL.read():{};
  if(B&&B.tables){
    const od=[['Produto','Safra','Componente','Conab (mil t)','Agrinvest (mil t)','Diferença AG − Conab (mil t)','Estoque/demanda Conab (%)']];
    Object.entries(B.tables).forEach(([p,ys])=>Object.keys(ys).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(y=>{const r=ys[y],inp=ag[p+'|'+y]||{};
      Object.keys(LBL).forEach(k=>{if(typeof r[k]!=='number')return;const a=typeof inp[k]==='number'?inp[k]:null;od.push([p,y,LBL[k],r[k],a,a==null?null:a-r[k],k==='end'&&r.use>0?r.end/r.use*100:null]);});}));
    S.push({name:'Oferta e demanda',rows:od,widths:[16,10,20,15,17,27,24],fmt:{3:'n1',4:'n1',5:'n1',6:'n2'}});
  }
  if(C.deralPR&&C.deralPR.crops){
    const dr=[['Cultura','Safra','Operação','Relatório','Núcleo regional','Código','Área total (ha)','Plantado (ha)','Plantado (%)','Colhido (ha)','Colhido (%)','Ruim (%)','Médio (%)','Bom (%)','Germinação (%)','Vegetativo (%)','Floração (%)','Frutificação (%)','Maturação (%)']];
    Object.entries(C.deralPR.crops).forEach(([c,o])=>(o.regionals||[]).concat(o.total?[o.total]:[]).forEach(r=>dr.push([c,o.safra||'',o.oper==='Colheita'?'Colheita':'Plantio',C.deralPR.data||'',r.regional,r.codigo,r.area_total_ha,r.plantado_ha,r.plantado_pct,r.colhido_ha,r.colhido_pct,r.ruim_pct,r.medio_pct,r.bom_pct,r.germinacao_pct,r.vegetativo_pct,r.floracao_pct,r.frutificacao_pct,r.maturacao_pct])));
    const fm={3:'date'};for(let i=6;i<19;i++)fm[i]='n0';
    S.push({name:'DERAL PR',rows:dr,widths:[12,10,10,12,22,8,14,14,12,13,11,9,9,9,13,13,12,14,12],fmt:fm});
  }
  if(C.deralPR&&C.deralPR.historico&&C.deralPR.historico.length)S.push({name:'DERAL semanal',rows:[['Cultura','Safra','Operação','Relatório DERAL','% concluído']].concat(C.deralPR.historico.slice().sort((x,y)=>x.cultura.localeCompare(y.cultura)||(x.data<y.data?-1:1)).map(x=>[x.cultura,x.safra||'',(x.oper||'Semeadura')==='Colheita'?'Colheita':'Plantio',x.data,x.pct])),widths:[12,10,10,16,12],fmt:{3:'date',4:'n0'}});
  if(window.BRZIMEA&&window.BRZIMEA.sheets)S.push(...window.BRZIMEA.sheets());
  S.push({name:'Fontes e notas',rows:[['Campo','Valor'],['Arquivo','BRZ SAFRA '+(typeof BUILD!=='undefined'?BUILD:'')],['Dados consolidados em',(C.meta||{}).geradoEm||''],
    ['Progresso semanal',(C.meta||{}).fonteProg||''],['Série histórica',(C.meta||{}).fonteHist||''],['Publicações Conab',(C.meta||{}).revisoes||''],
    ['Oferta e demanda',(B&&B.source)||''],['DERAL',(C.deralPR&&C.deralPR.origem)||''],['IMEA',(C.imeaMT&&C.imeaMT.fonte)||''],
    ['Unidades','área em mil ha, produtividade em kg/ha, produção e balanço em mil t, progresso em % da área']],widths:[24,120],fmt:{},filter:false});
  return S;
}
const lbl=()=>T('Excel · base completa','Excel · full database');
function exportAll(btn){
  if(!window.BRZXLSX)return Promise.resolve(0);
  if(btn){btn.disabled=true;btn.textContent='…';}
  return window.BRZXLSX.download('BRZ_SAFRA_base_completa_'+((C.meta||{}).geradoEm||'')+'.xlsx',sheets()).then(sz=>{if(typeof toast==='function')toast(T('Excel gerado ✓','Excel generated ✓'));return sz;})
    .finally(()=>{if(btn){btn.disabled=false;btn.textContent=lbl();}});
}
function mount(){
  const h=document.querySelector('#scr-base .base-wrap .sect-h');if(!h)return;
  document.querySelectorAll('#base-xlsx').forEach(x=>x.remove());
  const b=document.createElement('button');b.id='base-xlsx';b.type='button';b.className='base-xlsx';b.textContent=lbl();
  b.title=T('Baixa todas as bases em um arquivo Excel, uma planilha por base','Downloads every database in one Excel file, one sheet per base');
  b.onclick=()=>exportAll(b);h.appendChild(b);
}
function init(){mount();new MutationObserver(()=>{const b=document.getElementById('base-xlsx');if(b&&!b.disabled)b.textContent=lbl();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.BRZBASEXLSX={sheets,exportAll};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
