
/* BRZ SAFRA s23 — Supply and demand: Conab official + independent Agrinvest scenarios.
   Lightweight inline SVG, no network requests, no additional JS libraries.
   Values are in THOUSAND TONNES. Missing is NOT zero. */
(function(){
 'use strict';
 const official=window.__BAL_OFFICIAL__, root=document.getElementById('bal-root');
 if(!official||!root)return;
 const STORE='brz_safra_agrinvest_bal_v1';
 const colors={navy:'#1A3A5C',teal:'#0D9488',beige:'#B5963E',red:'#AF514D',grid:'#E6EDF2'};
 const rowsFor=product=> product==='Soja em grão' ? [
  ['group','Oferta / Supply'],['begin','Estoque inicial'],['production','Produção'],['imports','Importação'],['supply','OFERTA TOTAL'],
  ['group','Demanda / Use'],['seeds','Sementes / Outros'],['process','Processamento'],['domestic','Consumo interno (total)'],['exports','Exportação'],['use','DEMANDA TOTAL'],['group','Fechamento / Carryout'],['end','ESTOQUE FINAL']
 ]:[
  ['group','Oferta / Supply'],['begin','Estoque inicial'],['production','Produção'],['imports','Importação'],['supply','OFERTA TOTAL'],
  ['group','Demanda / Use'],['domestic',product==='Milho'?'Consumo interno':'Vendas no mercado interno'],['exports','Exportação'],['use','DEMANDA TOTAL'],['group','Fechamento / Carryout'],['end','ESTOQUE FINAL']
 ];
 const trans={'Oferta / Supply':'Supply','Demanda / Use':'Use','Fechamento / Carryout':'Carryout','Estoque inicial':'Beginning stocks','Produção':'Production','Importação':'Imports','OFERTA TOTAL':'TOTAL SUPPLY','Sementes / Outros':'Seeds / other','Processamento':'Crush','Consumo interno (total)':'Domestic use (total)','Consumo interno':'Domestic consumption','Vendas no mercado interno':'Domestic sales','Exportação':'Exports','DEMANDA TOTAL':'TOTAL USE','ESTOQUE FINAL':'ENDING STOCKS'};
 const langs={soja:['Soja & derivados','Soybeans & products'],milho:['Milho','Corn']};
 const en=()=>document.documentElement.lang==='en';
 const t=(pt,eng)=>en()?(eng||trans[pt]||pt):pt;
 const clean=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const format=(n,d=1)=>{if(n==null||!Number.isFinite(n))return '—';let s=Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});if(/^-0(,0+)?$/.test(s))s=s.slice(1);return s.replace(/^-/,'−');}; /* s27: sempre pt-BR, a camada i18n converte; s29: sinal de menos tipográfico e sem -0 */
 const pct=n=>n==null||!Number.isFinite(n)?'—':format(n,1)+'%';
 const delta=n=>n==null||!Number.isFinite(n)?'—':(n>0?'+':n<0?'−':'')+format(Math.abs(n),1);
 const years=o=>Object.keys(o).sort((a,b)=>parseInt(a,10)-parseInt(b,10));
 const fields=['begin','production','imports','seeds','process','domestic','exports','end'];
 const has=(o,k)=>o&&Object.prototype.hasOwnProperty.call(o,k)&&typeof o[k]==='number'&&Number.isFinite(o[k]);
 const sumIf=(o,a)=>a.every(k=>has(o,k))?a.reduce((acc,k)=>acc+o[k],0):null;
 const fmtM=n=>n==null?'—':format(n/1000,2)+' '+t('Mi t','Mmt');
 let inputs={};
 // Prefer saved data embedded in an exported HTML; otherwise use the local browser copy.
 try{ const embed=window.__AGR_BALANCE__;
  if(embed&&Object.keys(embed).length)inputs=JSON.parse(JSON.stringify(embed));
  else {const local=localStorage.getItem(STORE);if(local){const o=JSON.parse(local);if(o&&typeof o==='object')inputs=o;}}
 }catch(e){inputs={};}
 let crop='soja',product='Soja em grão',year='2026/27',initialized=false;
 /* s29: aba ativa, estado do simulador e gráficos montados */
 let view='safra';const SIM={};let NCH=[];
 const path=(c,s)=>c+'|'+s;
 const getInput=(c,s)=>inputs[path(c,s)]||{};
 function computed(v,c){
  if(c==='Soja em grão'){
   v.domestic=sumIf(v,['seeds','process']);
  }
  v.supply=sumIf(v,['begin','production','imports']);
  v.use=sumIf(v,['domestic','exports']);
  const implied=v.supply!=null&&v.use!=null?v.supply-v.use:null;
  const closing=has(v,'end')?v.end:implied;
  return {v,implied,closing,closeDelta:implied!=null&&has(v,'end')?v.end-implied:null};
 }
 function model(c,s){
  const now=official.tables[c][s];
  const v={...getInput(c,s)};
  return {source:now,...computed(v,c)};
 }
 function share(ending,use){return ending!=null&&use>0?ending/use*100:null;}
 function countInputs(c,s){const o=getInput(c,s);return (c==='Soja em grão'?['begin','production','imports','seeds','process','exports']:['begin','production','imports','domestic','exports']).filter(k=>has(o,k)).length;}
 function persist(){
  const script=document.getElementById('brz-balance-state');if(script)script.textContent='window.__AGR_BALANCE__='+JSON.stringify(inputs).replace(/<\/script/gi,'<\\/script')+';';
  try{localStorage.setItem(STORE,JSON.stringify(inputs));}catch(e){};
  window.__AGR_BALANCE__=JSON.parse(JSON.stringify(inputs));
 }
 function parseBR(s){
  const z=String(s??'').trim();if(!z)return null;
  const q=z.replace(/\s/g,'');
  // Brazilian notation (1.234,5) or plain point decimal (1234.5).
  if(!/^\d+(?:\.\d{3})*(?:,\d{1,5})?$/.test(q)&&!/^\d+(?:\.\d{1,5})?$/.test(q))return NaN;
  const groups=/^\d{1,3}(?:\.\d{3})+$/.test(q);
  const n=Number(q.includes(',')||groups?q.replace(/\./g,'').replace(',','.'):q);
  return n>=0&&Number.isFinite(n)?n:NaN;
 }
 function set(c,s,k,value){
  const o={...getInput(c,s)};
  if(value===null)delete o[k];else o[k]=value;
  if(Object.keys(o).length)inputs[path(c,s)]=o;else delete inputs[path(c,s)];
  persist();
 }
 function toVal(rec,key){
  if(!rec)return null;
  if(key==='domestic'&&product==='Soja em grão')return rec.domestic;
  return has(rec,key)?rec[key]:null;
 }
 function renderRow(c,s,m,key,label){
  if(key==='group')return '<tr class="bal-group"><td colspan="4">'+clean(t(label))+'</td></tr>';
  const fixed=m.source[key];
  const input=getInput(c,s);
  const ag=(key==='end'?m.closing:toVal(m.v,key));
  const d=ag==null?null:ag-fixed;
  const formField=fields.includes(key)&&!(key==='domestic'&&c==='Soja em grão');
  let edt='';
  if(formField){
    const raw=has(input,key)?format(input[key],1):'';
    const note=key==='end'&&m.implied!=null&&!has(input,'end')?'<span class="bal-small">'+clean(t('Implícito','Implied'))+': '+format(m.implied,1)+'</span>':'';
    edt='<input class="bal-edit" type="text" inputmode="decimal" aria-label="'+clean(t(label))+' AGRINVEST '+s+'" placeholder="—" data-bal-field="'+key+'" value="'+clean(raw)+'"/>'+note;
  }else edt=ag==null?'<span class="bal-na">—</span>':'<b>'+format(ag,1)+'</b>';
  const cls=key==='end'?'bal-grand':key==='supply'||key==='use'||key==='domestic'?'bal-total':'';
  const tone=d==null?'':Math.abs(d)<.05?'bal-muted':d>0?'bal-green':'bal-red';
  return '<tr class="'+cls+'"><td>'+clean(t(label))+'</td><td class="bal-num">'+format(fixed,1)+'</td><td class="bal-ag">'+edt+'</td><td class="bal-delta '+tone+'">'+delta(d)+'</td></tr>';
 }
 /* s27: referência da safra anterior, formatação e fonte */
 const prevYear=(c,s)=>{const a=years(official.tables[c]);const i=a.indexOf(s);return i>0?a[i-1]:null;};
 const fmt2M=n=>n==null||!Number.isFinite(n)?'—':format(n/1000,2);
 const sgnM=(n,d=2)=>{if(n==null||!Number.isFinite(n))return '—';const r=Number((n/1000).toFixed(d));return (r===0?'':r>0?'+':'−')+format(Math.abs(r),d);};
 const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],MES_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const dShort=iso=>{if(!iso)return '—';const p=String(iso).split('-');return p[2]+'/'+p[1]+'/'+p[0].slice(2);};
 const mShort=iso=>{if(!iso)return '';const p=String(iso).split('-');return t(MES[+p[1]-1]+'/'+p[0].slice(2),MES_EN[+p[1]-1]+'/'+p[0].slice(2));};
 const PNAME_EN={'Soja em grão':'Soybeans','Farelo de soja':'Soybean meal','Óleo de soja':'Soybean oil','Milho':'Corn'};
 const pname=p=>t(p,PNAME_EN[p]||p);
 const fileTag=()=>(product+'_'+year).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\W+/g,'_');
 function srcTxt(){return t('Fonte: Conab, 1º levantamento 2026/27 ('+dShort(official.published)+'), planilha ','Source: Conab, 1st survey 2026/27 ('+dShort(official.published)+'), sheet ')+(official.sourceSheet[product]||'')+t('. Agrinvest: cenário próprio, não altera a Conab.','. Agrinvest: own scenario, Conab data unchanged.');}
 function srcFooter(){
  return '<b>'+clean(t('Fonte oficial:','Official source:'))+'</b> '+clean(t('Conab, 1º levantamento 2026/27','Conab, 1st survey 2026/27'))+' ('+clean(dShort(official.published))+'), '+clean(t('planilhas','sheets'))+' <span data-noi18n>Suprimento</span> '+clean(t('e','and'))+' <span data-noi18n>Suprimento - Soja</span>; '+clean(t('tabela em mil t, gráficos em Mi t.','table in kt, charts in Mmt.'))+
   ' <a href="'+clean(official.url)+'" target="_blank" rel="noopener">'+clean(t('Consultar tabela oficial','Open official table'))+'</a>. '+
   clean(t('A edição do cenário Agrinvest não altera os dados Conab.','Editing the Agrinvest scenario does not change Conab data.'))+' '+
   '<b>'+clean(t('Milho:','Corn:'))+'</b> '+clean(t('ano comercial fevereiro a janeiro;','commercial year February to January;'))+' <b>'+clean(t('soja:','soybeans:'))+'</b> '+clean(t('estoque de passagem em dezembro.','ending stocks in December.'));
 }
 function kpi(label,officialValue,agValue,unit,prevValue,prevY){
  unit=unit||'Mi t';const isRatio=unit!=='Mi t';
  const shown=isRatio?pct(officialValue):fmtM(officialValue);
  let vsTxt=t('n/d','n/a'),vsCls='bal-muted';
  if(prevValue!=null&&officialValue!=null){const d=officialValue-prevValue;
   if(isRatio)vsTxt=(Math.abs(d)<0.05?'':d>0?'+':'−')+format(Math.abs(d),1)+' p.p.';
   else{const p=prevValue?(officialValue/prevValue-1)*100:null;vsTxt=sgnM(d)+' '+t('Mi t','Mmt')+(p==null?'':' ('+(Math.abs(p)<0.05?'':p>0?'+':'−')+format(Math.abs(p),1)+'%)');}
   vsCls=Math.abs(d)<(isRatio?0.05:50)?'bal-muted':d>0?'bal-green':'bal-red';}
  let agTxt=t('sem cenário','no scenario'),agCls='bal-muted';
  if(agValue!=null&&officialValue!=null){const d=agValue-officialValue;agCls='bal-agr-value';
   agTxt=(isRatio?pct(agValue):fmtM(agValue))+' ('+(isRatio?(Math.abs(d)<0.05?'':d>0?'+':'−')+format(Math.abs(d),1)+' p.p.':sgnM(d)+' '+t('Mi t','Mmt'))+')';}
  return '<div class="bal-kpi"><div class="bal-kpi-label">'+clean(label)+'</div><div class="bal-kpi-main">'+clean(shown)+'</div><div class="bal-kpi-break"></div>'+
   '<div class="bal-kpi-comparison"><span>'+clean(prevY?'vs '+prevY:t('vs safra anterior','vs previous crop'))+'</span><b class="'+vsCls+'">'+clean(vsTxt)+'</b></div>'+
   '<div class="bal-kpi-comparison bal-kpi-diff"><span>Agrinvest</span><b class="'+agCls+'">'+clean(agTxt)+'</b></div></div>';
 }
 /* s27: leitura do balanço (substitui as barras de níveis absolutos, que saíam quase iguais) */
 function leituraCard(m){
  const cur=m.source,py=prevYear(product,year),prev=py?official.tables[product][py]:null;
  const soy=product==='Soja em grão',corn=product==='Milho';
  const comps=soy?[['process','Processamento','Crush',colors.navy],['exports','Exportação','Exports',colors.teal],['seeds','Sementes / outros','Seeds / other','#94A3B8'],['end','Estoque final','Ending stocks',colors.beige]]:
   [['domestic',corn?'Consumo interno':'Mercado interno',corn?'Domestic use':'Domestic sales',colors.navy],['exports','Exportação','Exports',colors.teal],['end','Estoque final','Ending stocks',colors.beige]];
  const rowsD=[];
  if(prev)rowsD.push({lbl:py+' · Conab',r:prev});
  rowsD.push({lbl:year+' · Conab',r:cur,now:1});
  if(m.implied!=null)rowsD.push({lbl:year+' · Agrinvest',r:Object.assign({},m.v,{end:m.closing})});
  const dest=rowsD.map(o=>{const sup=o.r.supply;
   const segs=comps.map(([k,pt,e,col])=>{const val=o.r[k];const w=sup>0&&val!=null?val/sup*100:0;
    return '<i style="width:'+w.toFixed(3)+'%;background:'+col+'" title="'+clean(t(pt,e))+': '+clean(fmt2M(val))+' '+clean(t('Mi t','Mmt'))+' · '+clean(format(w,1))+'%">'+(w>=8?'<span>'+clean(format(w,0))+'%</span>':'')+'</i>';}).join('');
   return '<div class="bal26-drow'+(o.now?' on':'')+'"><span class="bal26-dl">'+clean(o.lbl)+'</span><span class="bal26-dbar">'+segs+'</span><b>'+clean(fmt2M(sup))+'</b></div>';}).join('');
  const legend='<div class="bal26-legend">'+comps.map(([k,pt,e,col])=>'<span><i style="background:'+col+'"></i>'+clean(t(pt,e))+' <b>'+clean(fmt2M(cur[k]))+'</b></span>').join('')+'<span class="bal26-lu">'+clean(t(year+' · Mi t; à direita, oferta total',year+' · Mmt; total supply at right'))+'</span></div>';
  let varHtml='',read='';
  if(prev){
   const items=soy?[['begin','Estoque inicial','Beginning stocks'],['production','Produção','Production'],['imports','Importação','Imports'],['supply','Oferta total','Total supply',1],['seeds','Sementes / outros','Seeds / other'],['process','Processamento','Crush'],['exports','Exportação','Exports'],['use','Demanda total','Total use',1],['end','Estoque final','Ending stocks',1]]:
    [['begin','Estoque inicial','Beginning stocks'],['production','Produção','Production'],['imports','Importação','Imports'],['supply','Oferta total','Total supply',1],['domestic',corn?'Consumo interno':'Vendas no mercado interno',corn?'Domestic use':'Domestic sales'],['exports','Exportação','Exports'],['use','Demanda total','Total use',1],['end','Estoque final','Ending stocks',1]];
   const ds=items.map(([k,pt,e,tot])=>({k,l:t(pt,e),tot,d:has(cur,k)&&has(prev,k)?cur[k]-prev[k]:null,p:has(cur,k)&&has(prev,k)&&prev[k]?(cur[k]/prev[k]-1)*100:null}));
   const mx=Math.max(...ds.map(o=>Math.abs(o.d||0)),1);
   varHtml='<div class="bal26-vhead"><span>'+clean(t('Componente','Item'))+'</span><span>'+clean(year)+' vs '+clean(py)+'</span><span>'+clean(t('Mi t','Mmt'))+'</span><span>%</span></div>'+
    ds.map(o=>{const w=o.d==null?0:Math.abs(o.d)/mx*50,cls=o.d==null||Math.abs(o.d)<50?'f':o.d>0?'u':'d';
     return '<div class="bal26-vrow'+(o.tot?' tot':'')+'"><span>'+clean(o.l)+'</span><span class="bal26-vtr"><em></em><i class="'+cls+'" style="'+(o.d!=null&&o.d<0?'right':'left')+':50%;width:'+w.toFixed(2)+'%"></i></span><b class="'+(cls==='u'?'bal-green':cls==='d'?'bal-red':'bal-muted')+'">'+clean(o.d==null?'—':sgnM(o.d))+'</b><small>'+clean(o.p==null?'—':((Math.abs(o.p)<0.05?'':o.p>0?'+':'−')+format(Math.abs(o.p),1)+'%'))+'</small></div>';}).join('');
   const dS=cur.supply-prev.supply,dU=cur.use-prev.use,dE=cur.end-prev.end,s0=share(prev.end,prev.use),s1=share(cur.end,cur.use),flat=Math.abs(dE)<50;
   read=t('Oferta '+sgnM(dS)+' Mi t e demanda '+sgnM(dU)+' Mi t contra '+py+': estoque final '+(flat?'estável':(dE<0?'cai ':'sobe ')+format(Math.abs(dE)/1000,2)+' Mi t')+', para '+fmt2M(cur.end)+' Mi t. Estoque/demanda de '+format(s0,1)+'% para '+format(s1,1)+'%.',
          'Supply '+sgnM(dS)+' Mmt and use '+sgnM(dU)+' Mmt vs '+py+': ending stocks '+(flat?'steady':(dE<0?'fall ':'rise ')+format(Math.abs(dE)/1000,2)+' Mmt')+', to '+fmt2M(cur.end)+' Mmt. Stocks/use from '+format(s0,1)+'% to '+format(s1,1)+'%.');
  }else read=t('Primeira safra da série: sem safra anterior para comparar.','First crop year in the series: no previous year to compare.');
  return '<article class="bal-card bal26-card" id="bal26-leitura"><div class="bal26-ch"><div><h2>'+clean(t('Leitura do balanço','Balance reading'))+' · '+clean(pname(product))+' · '+clean(year)+'</h2><div class="bal-desc">'+clean(t('Destino da oferta e variação por componente contra a safra anterior · Conab','Where supply goes and change by item vs the previous crop year · Conab'))+'</div></div><button type="button" class="bal-btn bal26-png" data-bal-action="png" data-noexport>PNG 3×</button></div>'+
   '<p class="bal26-read">'+clean(read)+'</p>'+
   '<div class="bal26-sec">'+clean(t('Destino da oferta','Where supply goes'))+'</div><div class="bal26-dest">'+dest+'</div>'+legend+
   (varHtml?'<div class="bal26-sec">'+clean(t('Variação por componente','Change by item'))+'</div><div class="bal26-var">'+varHtml+'</div>':'')+'</article>';
 }
 /* s27: estoques finais em lista legível no painel lateral, com estoque/demanda */
 function histList(c){
  const all=years(official.tables[c]);if(!all.length)return '';
  const vals=all.map(y=>{const r=official.tables[c][y];return {y,end:r.end,pc:share(r.end,r.use)};});
  const mx=Math.max(...vals.map(v=>v.end||0),1);
  return '<div class="bal26-hist"><div class="bal26-hrow bal26-hh"><span>'+clean(t('Safra','Crop year'))+'</span><span></span><span>'+clean(t('Mi t','Mmt'))+'</span><span>'+clean(t('E/D','S/U'))+'</span></div>'+
   vals.map(v=>'<div class="bal26-hrow'+(v.y===year?' on':'')+'"><span>'+clean(v.y)+'</span><span class="bal26-htr"><i style="width:'+(Math.max(0,v.end)/mx*100).toFixed(2)+'%"></i></span><b>'+clean(fmt2M(v.end))+'</b><small>'+clean(pct(v.pc))+'</small></div>').join('')+'</div>';
 }
 /* s27: PNG de qualquer card do balanço; estilos calculados copiados para o clone (inclui fonte e marca d'água da casa) */
 const PROPS=['display','position','top','right','bottom','left','width','height','min-width','max-width','min-height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-style','border-right-style','border-bottom-style','border-left-style','border-top-color','border-right-color','border-bottom-color','border-left-color','border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius','background-color','background-image','color','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-transform','vertical-align','white-space','box-sizing','flex-grow','flex-shrink','flex-basis','flex-direction','flex-wrap','align-items','align-self','justify-content','row-gap','column-gap','grid-template-columns','grid-column-start','grid-column-end','overflow-x','overflow-y','opacity','table-layout','border-collapse','border-spacing','font-variant-numeric','text-overflow','text-decoration-line'];
 function inlineClone(src){
  const c=src.cloneNode(true),A=[src,...src.querySelectorAll('*')],B=[c,...c.querySelectorAll('*')];
  A.forEach((el,i)=>{const cs=getComputedStyle(el);let s='';for(const p of PROPS){const v=cs.getPropertyValue(p);if(v!=='')s+=p+':'+v+';';}B[i].setAttribute('style',s);});
  c.querySelectorAll('[data-noexport],.bal-mobile-hint').forEach(x=>x.remove());
  c.querySelectorAll('input').forEach(inp=>{const sp=document.createElement('span');sp.textContent=inp.value||'—';sp.setAttribute('style',(inp.getAttribute('style')||'')+'display:block;');inp.replaceWith(sp);});
  return c;
 }
 function nodePNG(el,name){
  if(!el)return;
  const W=Math.ceil(el.getBoundingClientRect().width),K=3,c=inlineClone(el);
  c.style.margin='0';c.style.boxShadow='none';c.style.width=W+'px';c.style.position='relative';c.style.background='#fff';
  const ft=document.createElement('div');ft.setAttribute('style',"margin-top:10px;font:400 10px 'Arial Nova Cond','Arial Narrow',Arial,sans-serif;color:#64748B");ft.textContent=srcTxt();c.appendChild(ft);
  const logo=typeof LOGO_HREF_get==='function'?LOGO_HREF_get():'';
  if(logo){const wm=document.createElement('img');wm.setAttribute('src',logo);wm.setAttribute('alt','');wm.setAttribute('style','position:absolute;left:50%;top:50%;width:150px;transform:translate(-50%,-50%);opacity:.25');c.appendChild(wm);}
  const host=document.createElement('div');host.setAttribute('data-noi18n','');host.setAttribute('style','position:absolute;left:-20000px;top:0;width:'+W+'px');
  host.appendChild(c);document.body.appendChild(host);const H=Math.ceil(c.getBoundingClientRect().height);host.remove();
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">'+new XMLSerializer().serializeToString(c)+'</div></foreignObject></svg>';
  const img=new Image();
  img.onload=()=>{const cv=document.createElement('canvas');cv.width=W*K;cv.height=H*K;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);
   const a=document.createElement('a');a.download='BRZ_Balanco_'+name+'.png';a.href=cv.toDataURL('image/png');a.click();};
  img.onerror=()=>alert(t('Falha na exportação PNG','PNG export failed'));
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 }
 /* ═══ s29 · abas, série histórica e simulador ═══ */
 const VIEWS=[['safra','Balanço da safra','Crop-year balance'],['serie','Série histórica','Historical series'],['sim','Simulador','Simulator']];
 const fmtL=(n,d)=>{if(n==null||!Number.isFinite(n))return '—';let s=Number(n).toLocaleString(en()?'en-US':'pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});if(/^-0([.,]0+)?$/.test(s))s=s.slice(1);return s.replace(/^-/,'−');};
 const COMP_PT={begin:'Estoque inicial',production:'Produção',imports:'Importação',supply:'Oferta total',seeds:'Sementes / outros',process:'Processamento',domestic:'Consumo interno',exports:'Exportação',use:'Demanda total',end:'Estoque final'};
 function viewTabs(){return '<div class="bal29-tabs" role="tablist">'+VIEWS.map(([k,pt,e])=>'<button type="button" role="tab" data-bal-view="'+k+'" class="'+(view===k?'on':'')+'" aria-selected="'+(view===k)+'">'+clean(t(pt,e))+'</button>').join('')+'</div>';}
 function serieDefs(p){
  p=p||product;const soy=p==='Soja em grão',corn=p==='Milho';
  const D=(k,pt,e,kind)=>({k,pt,e,kind:kind||'q'});
  return [
   {g:t('Oferta','Supply')},D('begin','Estoque inicial','Beginning stocks'),D('production','Produção','Production'),D('imports','Importação','Imports'),D('supply','Oferta total','Total supply','qt'),
   {g:t('Demanda','Use')},
   ...(soy?[D('seeds','Sementes / outros','Seeds / other'),D('process','Processamento','Crush'),D('domestic','Consumo interno (total)','Domestic use (total)','qs')]:[D('domestic',corn?'Consumo interno':'Vendas no mercado interno',corn?'Domestic use':'Domestic sales')]),
   D('exports','Exportação','Exports'),D('use','Demanda total','Total use','qt'),
   {g:t('Fechamento','Carryout')},D('end','Estoque final','Ending stocks','qt'),D('dstock','Variação do estoque no ano','Stock change in the year','qd'),
   {g:t('Indicadores','Ratios')},D('su','Estoque / demanda','Stocks / use','pct'),D('days','Estoque em dias de demanda','Stocks in days of use','days'),D('expsh','Exportação / oferta','Exports / supply','pct'),
   ...(soy?[D('crushsh','Processamento / produção','Crush / production','pct')]:[D('domsh',corn?'Consumo interno / oferta':'Mercado interno / oferta',corn?'Domestic use / supply':'Domestic sales / supply','pct')]),
   D('prodyoy','Produção vs safra anterior','Production vs previous year','yoy'),D('expyoy','Exportação vs safra anterior','Exports vs previous year','yoy')
  ];
 }
 function sval(r,k,prev){
  if(!r)return null;
  switch(k){
   case 'dstock':return has(r,'end')&&has(r,'begin')?r.end-r.begin:null;
   case 'su':return share(r.end,r.use);
   case 'days':return r.use>0?r.end/r.use*365:null;
   case 'expsh':return r.supply>0?r.exports/r.supply*100:null;
   case 'crushsh':return r.production>0?r.process/r.production*100:null;
   case 'domsh':return r.supply>0?r.domestic/r.supply*100:null;
   case 'prodyoy':return prev&&prev.production?(r.production/prev.production-1)*100:null;
   case 'expyoy':return prev&&prev.exports?(r.exports/prev.exports-1)*100:null;
   default:return has(r,k)?r[k]:null;}
 }
 const isQ=k=>k==='q'||k==='qt'||k==='qs'||k==='qd';
 const sgnF=(v,d)=>(Math.abs(v)<Math.pow(10,-d)/2?'':v>0?'+':'−')+format(Math.abs(v),d);
 const sfmt=(kind,v)=>v==null||!Number.isFinite(v)?'—':kind==='pct'?format(v,1)+'%':kind==='days'?format(v,0):kind==='yoy'?sgnF(v,1)+'%':format(v,1);
 function spark(vals,hl){
  const pts=vals.map((v,i)=>v==null?null:[i,v]).filter(Boolean);if(pts.length<2)return '';
  const W=74,H=20,mn=Math.min(...pts.map(p=>p[1])),mx=Math.max(...pts.map(p=>p[1])),sp=mx-mn||1,n=Math.max(1,vals.length-1);
  const X=i=>3+i/n*(W-6),Y=v=>H-4-(v-mn)/sp*(H-8);
  const d=pts.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');
  const hp=pts.find(p=>p[0]===hl);
  return '<svg class="bal29-spark" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" aria-hidden="true"><path d="'+d+'" fill="none" stroke="#1A3A5C" stroke-width="1.4" stroke-linejoin="round"/>'+(hp?'<circle cx="'+X(hp[0]).toFixed(1)+'" cy="'+Y(hp[1]).toFixed(1)+'" r="2.6" fill="#B5963E"/>':'')+'</svg>';
 }
 function serieView(){
  const all=years(official.tables[product]),TB=official.tables[product],defs=serieDefs(),yi=all.indexOf(year),py=yi>0?all[yi-1]:null;
  const head='<tr><th class="bal29-l">'+clean(t('Indicador','Item'))+' <small>· '+clean(t('mil t','kt'))+'</small></th>'+all.map(y=>'<th class="'+(y===year?'on':'')+'">'+clean(y)+'</th>').join('')+
   '<th class="bal29-d">'+clean(year)+' vs '+clean(py||'—')+'</th><th class="bal29-d">%</th><th class="bal29-sp">'+clean(t('Tendência','Trend'))+'</th></tr>';
  let body='';
  defs.forEach(d=>{
   if(d.g){body+='<tr class="bal29-g"><td class="bal29-l">'+clean(d.g)+'</td><td colspan="'+(all.length+3)+'"></td></tr>';return;}
   const vals=all.map((y,i)=>sval(TB[y],d.k,i?TB[all[i-1]]:null)),cur=vals[yi],pre=yi>0?vals[yi-1]:null;
   let dA='—',dP='',cls='bal-muted';
   if(cur!=null&&pre!=null&&d.kind!=='yoy'){const df=cur-pre;
    if(d.kind==='pct')dA=sgnF(df,1)+' p.p.';else if(d.kind==='days')dA=sgnF(df,0);else{dA=sgnF(df,1);if(pre&&d.kind!=='qd')dP=sgnF((cur/pre-1)*100,1)+'%';}
    cls=Math.abs(df)<(isQ(d.kind)?50:d.kind==='days'?0.5:0.05)?'bal-muted':df>0?'bal-green':'bal-red';}
   if(d.kind==='yoy')dA='';
   body+='<tr class="'+(d.kind==='qt'?'bal29-tot':d.kind==='qs'?'bal29-sub':'')+'"><td class="bal29-l">'+clean(t(d.pt,d.e))+(d.kind==='days'?' <small>· '+clean(t('dias','days'))+'</small>':'')+'</td>'+
    vals.map((v,i)=>'<td class="'+(all[i]===year?'on':'')+'">'+clean(sfmt(d.kind,v))+'</td>').join('')+
    '<td class="bal29-d '+cls+'">'+clean(dA)+'</td><td class="bal29-d '+cls+'">'+clean(dP)+'</td><td class="bal29-sp">'+(d.kind==='yoy'?'':spark(vals,yi))+'</td></tr>';
  });
  const ends=all.map(y=>TB[y].end),sus=all.map(y=>share(TB[y].end,TB[y].use)),curE=TB[year].end,curS=sus[yi];
  const prevS=sus.slice(0,yi).filter(v=>v!=null),avg=prevS.length?prevS.reduce((a,b)=>a+b,0)/prevS.length:null;
  const rank=ends.slice().sort((a,b)=>a-b).indexOf(curE)+1,N=ends.length;
  const pos=rank===1?t('menor estoque da série desde '+all[0],'lowest ending stocks since '+all[0]):rank===N?t('maior estoque da série desde '+all[0],'highest ending stocks since '+all[0]):t(rank+'º menor de '+N+' safras',rank+(rank===2?'nd':rank===3?'rd':'th')+' lowest of '+N+' crop years');
  const read=t('Estoque final de '+fmt2M(curE)+' Mi t em '+year+', '+pos+'. Estoque/demanda em '+format(curS,1)+'%'+(avg!=null?', contra média de '+format(avg,1)+'% nas safras anteriores da série.':'.'),
               'Ending stocks of '+fmt2M(curE)+' Mmt in '+year+', '+pos+'. Stocks/use at '+format(curS,1)+'%'+(avg!=null?', against an average of '+format(avg,1)+'% in the earlier crop years of the series.':'.'));
  return '<article class="bal-card bal29-card" id="bal29-serie"><div class="bal26-ch"><div><h2>'+clean(t('Balanço histórico','Historical balance'))+' · '+clean(pname(product))+'</h2><div class="bal-desc">'+
    clean(t('Conab, safras '+all[0]+' a '+all[all.length-1]+' no 1º levantamento 2026/27 · mil t, salvo indicação · coluna destacada: safra selecionada no filtro','Conab, crop years '+all[0]+' to '+all[all.length-1]+' in the 1st survey 2026/27 · kt unless stated · highlighted column: crop year chosen in the filter'))+'</div></div>'+
    '<div class="bal29-acts" data-noexport><button type="button" class="bal-btn" data-bal-action="xlsx">Excel</button><button type="button" class="bal-btn" data-bal-action="csv-serie">CSV</button><button type="button" class="bal-btn bal26-png" data-bal-action="png-serie">PNG 3×</button></div></div>'+
    '<p class="bal26-read">'+clean(read)+'</p><div class="bal-table-scroll"><table class="bal29-table"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div></article>'+
    '<div class="bal29-charts">'+
     '<article class="bal-card bal29-ch"><h2>'+clean(t('Estoque final e estoque/demanda','Ending stocks and stocks/use'))+'</h2><div class="bal-desc">'+clean(t('Mi t nas barras, % da demanda na linha','Mmt in bars, % of use in the line'))+'</div><div class="bal29-chart" data-ch="end"></div></article>'+
     '<article class="bal-card bal29-ch"><h2>'+clean(t('Destino da oferta por safra','Where supply goes by crop year'))+'</h2><div class="bal-desc">'+clean(t('% da oferta total','% of total supply'))+'</div><div class="bal29-chart" data-ch="dest"></div></article>'+
     '<article class="bal-card bal29-ch bal29-wide"><h2>'+clean(t('Oferta, demanda e componentes','Supply, use and components'))+'</h2><div class="bal-desc">'+clean(t('Mi t por safra','Mmt by crop year'))+'</div><div class="bal29-chart" data-ch="flow"></div></article>'+
    '</div>'+(window.BRZIND&&product!=='Milho'?'<article class="bal-card bal29-card" id="bal29-crush"><div class="bal26-ch"><div><h2>'+clean(t('Rendimento do esmagamento','Crush yield'))+'</h2><div class="bal-desc">'+clean(t('Farelo e óleo sobre o grão processado no balanço Conab · também em Indicadores','Meal and oil over soybeans crushed in the Conab balance · also in Indicators'))+'</div></div></div>'+window.BRZIND.crushHTML(false)+'</article>':'');
 }
 function chartOpt(kind){
  const all=years(official.tables[product]),TB=official.tables[product],soy=product==='Soja em grão',corn=product==='Milho',fs=11,cats=all.map(y=>y.slice(2));
  const base={toolbox:{feature:{saveAsImage:{name:'balanco_'+kind+'_'+product},dataView:{},magicType:{}}},xAxis:{type:'category',data:cats,axisLabel:{fontSize:fs}}};
  const mt=t('Mi t','Mmt');
  if(kind==='end')return Object.assign(base,{tooltip:{trigger:'axis',formatter:ps=>ps.map(p=>p.marker+clean(p.seriesName)+': <b>'+(p.seriesName===t('Estoque / demanda','Stocks / use')?fmtL(p.value,1)+'%':fmtL(p.value,2)+' '+mt)+'</b>').join('<br>')},
    yAxis:[{type:'value',name:mt,axisLabel:{fontSize:fs}},{type:'value',name:'%',axisLabel:{fontSize:fs}}],
    series:[{name:t('Estoque final','Ending stocks'),type:'bar',color:'#B5963E',data:all.map(y=>+(TB[y].end/1000).toFixed(3))},
            {name:t('Estoque / demanda','Stocks / use'),type:'line',yAxisIndex:1,color:'#1A3A5C',showSymbol:true,symbolSize:7,lineStyle:{width:2},data:all.map(y=>+share(TB[y].end,TB[y].use).toFixed(2))}]});
  if(kind==='dest'){
   const comps=soy?[['process','Processamento','Crush','#1A3A5C'],['exports','Exportação','Exports','#0D9488'],['seeds','Sementes / outros','Seeds / other','#94A3B8'],['end','Estoque final','Ending stocks','#B5963E']]:
    [['domestic',corn?'Consumo interno':'Mercado interno',corn?'Domestic use':'Domestic sales','#1A3A5C'],['exports','Exportação','Exports','#0D9488'],['end','Estoque final','Ending stocks','#B5963E']];
   return Object.assign(base,{tooltip:{trigger:'axis',valueFormatter:v=>fmtL(v,1)+'%'},yAxis:{type:'value',max:100,axisLabel:{fontSize:fs,formatter:'{value}%'}},
    series:comps.map(([k,pt,e,col])=>({name:t(pt,e),type:'bar',stack:'d',color:col,data:all.map(y=>+(TB[y][k]/TB[y].supply*100).toFixed(2))}))});
  }
  const ser=[['supply','Oferta total','Total supply','#1A3A5C',null],['use','Demanda total','Total use','#0D9488',null],['production','Produção','Production','#5B7CA6','dashed'],['exports','Exportação','Exports','#B5963E','dashed'],
   soy?['process','Processamento','Crush','#8A9099','dashed']:['domestic',corn?'Consumo interno':'Mercado interno',corn?'Domestic use':'Domestic sales','#8A9099','dashed']];
  return Object.assign(base,{tooltip:{trigger:'axis',valueFormatter:v=>fmtL(v,2)+' '+mt},yAxis:{type:'value',axisLabel:{fontSize:fs}},
   series:ser.map(([k,pt,e,col,dash])=>({name:t(pt,e),type:'line',color:col,showSymbol:true,symbolSize:6,lineStyle:{width:2,type:dash||'solid'},data:all.map(y=>+(TB[y][k]/1000).toFixed(3))}))});
 }
 function dropCharts(){NCH.forEach(o=>{try{o.ro.disconnect();o.ch.dispose();}catch(e){}});NCH=[];}
 function mountCharts(){
  dropCharts();if(!window.echarts)return;
  root.querySelectorAll('.bal29-chart[data-ch]').forEach(el=>{const ch=window.echarts.init(el);ch.setOption(chartOpt(el.dataset.ch),true);const ro=new ResizeObserver(()=>ch.resize());ro.observe(el);NCH.push({ch,ro});});
 }
 function serieCSV(){
  const all=years(official.tables[product]),TB=official.tables[product];
  const rows=[[t('Indicador','Item'),...all]];
  serieDefs().forEach(d=>{if(d.g)return;rows.push([t(d.pt,d.e)+(d.kind==='pct'||d.kind==='yoy'?' (%)':d.kind==='days'?' ('+t('dias','days')+')':' (mil t)'),...all.map((y,i)=>{const v=sval(TB[y],d.k,i?TB[all[i-1]]:null);return v==null?'':v.toFixed(isQ(d.kind)?1:2).replace('.',',');})]);});
  const quote=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const u=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=u;a.download='BRZ_Balanco_historico_'+fileTag().replace(/_\d{4}_\d{2}$/,'')+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
 }
 function xlsxOD(){
  if(!window.BRZXLSX){alert(t('Exportação Excel indisponível.','Excel export unavailable.'));return;}
  const prods=['Soja em grão','Farelo de soja','Óleo de soja','Milho'],sheets=[];
  prods.forEach(p=>{const all=years(official.tables[p]),TB=official.tables[p],rows=[[t('Indicador','Item')+' (mil t, salvo indicação)',...all]];
   serieDefs(p).forEach(d=>{if(d.g){rows.push([d.g]);return;}rows.push([t(d.pt,d.e)+(d.kind==='pct'||d.kind==='yoy'?' (%)':d.kind==='days'?' ('+t('dias','days')+')':''),...all.map((y,i)=>{const v=sval(TB[y],d.k,i?TB[all[i-1]]:null);return v==null?null:+v.toFixed(isQ(d.kind)?1:2);})]);});
   const fm={};all.forEach((y,i)=>fm[i+1]='n1');sheets.push({name:'O&D '+p,rows,widths:[40,...all.map(()=>12)],fmt:fm,filter:false});});
  const long=[['Produto','Safra','Componente','Conab (mil t)','Agrinvest (mil t)','Diferença AG − Conab (mil t)']];
  prods.forEach(p=>years(official.tables[p]).forEach(y=>{const TB=official.tables[p][y],inp=inputs[path(p,y)]||{};
   ['begin','production','imports','supply','seeds','process','domestic','exports','use','end'].forEach(k=>{if(!has(TB,k))return;const ag=has(inp,k)?inp[k]:null;long.push([p,y,COMP_PT[k],+TB[k].toFixed(3),ag,ag==null?null:+(ag-TB[k]).toFixed(3)]);});}));
  sheets.push({name:'O&D formato longo',rows:long,widths:[16,10,20,15,17,26],fmt:{3:'n1',4:'n1',5:'n1'}});
  sheets.push({name:'Fonte',rows:[['Campo','Valor'],['Fonte oficial',official.source||''],['Publicado em',official.published||''],['Unidade','mil t'],['Agrinvest','cenário próprio editado na plataforma; não altera a Conab'],['Arquivo',typeof BUILD!=='undefined'?'BRZ SAFRA '+BUILD:'BRZ SAFRA']],widths:[18,90],fmt:{},filter:false});
  window.BRZXLSX.download('BRZ_Oferta_Demanda_Conab_'+(official.published||'')+'.xlsx',sheets);
 }
 /* simulador */
 function simDrivers(){const soy=product==='Soja em grão',corn=product==='Milho';
  return [['begin','Estoque inicial','Beginning stocks',1],['production','Produção','Production',1],['imports','Importação','Imports',1],
   ...(soy?[['seeds','Sementes / outros','Seeds / other',-1],['process','Processamento','Crush',-1]]:[['domestic',corn?'Consumo interno':'Vendas no mercado interno',corn?'Domestic use':'Domestic sales',-1]]),
   ['exports','Exportação','Exports',-1]];}
 const simKey=()=>path(product,year);
 const simState=()=>SIM[simKey()]||(SIM[simKey()]={});
 function simCalc(pct){
  const b=official.tables[product][year],soy=product==='Soja em grão',v={};
  simDrivers().forEach(([k])=>{v[k]=(b[k]||0)*(1+((pct&&pct[k])||0)/100);});
  v.supply=v.begin+v.production+v.imports;if(soy)v.domestic=v.seeds+v.process;v.use=v.domestic+v.exports;v.end=v.supply-v.use;
  return v;}
 function simView(){
  const b=official.tables[product][year],st=simState();
  const rows=simDrivers().map(([k,pt,e,sg])=>{const p=st[k]||0,sv=(b[k]||0)*(1+p/100);
   return '<div class="bal29-drv" data-k="'+k+'"><span class="bal29-dl">'+clean(t(pt,e))+' <i>'+clean(sg>0?t('oferta','supply'):t('demanda','use'))+'</i></span>'+
    '<span class="bal29-db">'+clean(fmt2M(b[k]))+'</span>'+
    '<input type="range" min="-20" max="20" step="0.5" value="'+p+'" data-sim-k="'+k+'" aria-label="'+clean(t(pt,e))+' %">'+
    '<input type="number" class="bal29-pct" step="0.5" min="-50" max="50" value="'+p+'" data-sim-p="'+k+'" aria-label="'+clean(t(pt,e))+' %">'+
    '<input type="text" inputmode="decimal" class="bal29-abs" value="'+clean(fmt2M(sv))+'" data-sim-a="'+k+'" aria-label="'+clean(t(pt,e))+' Mi t">'+
    '<b class="bal29-dd" data-sim-d="'+k+'"></b></div>';}).join('');
  return '<div class="bal29-sim"><article class="bal-card bal29-card" id="bal29-simcard"><div class="bal26-ch"><div><h2>'+clean(t('Simulador de balanço','Balance simulator'))+' · '+clean(pname(product))+' · '+clean(year)+'</h2>'+
    '<div class="bal-desc">'+clean(t('Base Conab, 1º levantamento. Mova cada componente em % ou digite o valor em Mi t; oferta, demanda e estoque final recalculam na hora.','Conab base, 1st survey. Move each item in % or type the value in Mmt; supply, use and ending stocks update instantly.'))+'</div></div>'+
    '<div class="bal29-acts" data-noexport><button type="button" class="bal-btn" data-bal-sim="reset">'+clean(t('Zerar','Reset'))+'</button><button type="button" class="bal-btn bal-btn-primary" data-bal-sim="apply">'+clean(t('Levar para o cenário Agrinvest','Send to Agrinvest scenario'))+'</button><button type="button" class="bal-btn bal26-png" data-bal-sim="png">PNG 3×</button></div></div>'+
    '<div class="bal29-dhead"><span>'+clean(t('Componente','Item'))+'</span><span>Conab · '+clean(t('Mi t','Mmt'))+'</span><span>'+clean(t('ajuste','adjustment'))+'</span><span>%</span><span>'+clean(t('simulado · Mi t','simulated · Mmt'))+'</span><span>Δ '+clean(t('Mi t','Mmt'))+'</span></div>'+rows+
    '<div class="bal29-out" id="bal29-out"></div></article>'+
    '<article class="bal-card bal29-card" id="bal29-bridgecard"><div class="bal26-ch"><div><h2>'+clean(t('Do estoque Conab ao simulado','From Conab to simulated stocks'))+'</h2><div class="bal-desc">'+clean(t('Contribuição de cada componente para o estoque final, Mi t','Contribution of each item to ending stocks, Mmt'))+'</div></div></div><div id="bal29-bridge"></div></article>'+
    '<article class="bal-card bal29-card" id="bal29-mxcard"><div class="bal26-ch"><div><h2>'+clean(t('Sensibilidade do estoque final','Ending stocks sensitivity'))+'</h2><div class="bal-desc">'+clean(t('Produção nas linhas e exportação nas colunas, em torno da simulação atual · célula: estoque final em Mi t e estoque/demanda','Production in rows and exports in columns, around the current simulation · cell: ending stocks in Mmt and stocks/use'))+'</div></div>'+
    '<div class="bal29-acts" data-noexport><button type="button" class="bal-btn" data-bal-sim="csv">CSV</button><button type="button" class="bal-btn bal26-png" data-bal-sim="pngmx">PNG 3×</button></div></div><div id="bal29-matrix"></div></article></div>';
 }
 function simUpdate(){
  const b=official.tables[product][year],st=simState(),v=simCalc(st);
  const su0=share(b.end,b.use),su1=share(v.end,v.use),d0=b.use>0?b.end/b.use*365:null,d1=v.use>0?v.end/v.use*365:null,dE=v.end-b.end,dS=su1-su0;
  const tone=(x,eps)=>Math.abs(x)<eps?'bal-muted':x>0?'bal-green':'bal-red';
  root.querySelectorAll('[data-sim-d]').forEach(el=>{const k=el.dataset.simD,df=v[k]-(b[k]||0);el.textContent=sgnM(df);el.className='bal29-dd '+tone(df,50);});
  const card=(lbl,val,sub,cls)=>'<div class="bal29-o"><span>'+clean(lbl)+'</span><b>'+clean(val)+'</b><small class="'+(cls||'')+'">'+clean(sub)+'</small></div>';
  const mt=t('Mi t','Mmt'),out=root.querySelector('#bal29-out');
  if(out)out.innerHTML=card(t('Oferta total','Total supply'),fmt2M(v.supply)+' '+mt,'Conab '+fmt2M(b.supply)+' · '+sgnM(v.supply-b.supply),tone(v.supply-b.supply,50))+
   card(t('Demanda total','Total use'),fmt2M(v.use)+' '+mt,'Conab '+fmt2M(b.use)+' · '+sgnM(v.use-b.use),tone(v.use-b.use,50))+
   card(t('Estoque final','Ending stocks'),fmt2M(v.end)+' '+mt,'Conab '+fmt2M(b.end)+' · '+sgnM(dE),tone(dE,50))+
   card(t('Estoque / demanda','Stocks / use'),format(su1,1)+'%','Conab '+format(su0,1)+'% · '+sgnF(dS,1)+' p.p.',tone(dS,0.05))+
   card(t('Dias de demanda','Days of use'),format(d1,0),'Conab '+format(d0,0)+' · '+sgnF(d1-d0,0),tone(d1-d0,0.5));
  const contrib=simDrivers().map(([k,pt,e,sg])=>({l:t(pt,e),v:sg*(v[k]-(b[k]||0))})),mx=Math.max(...contrib.map(c=>Math.abs(c.v)),Math.abs(dE),1);
  const bar=(l,val,tot)=>'<div class="bal26-vrow'+(tot?' tot':'')+'"><span>'+clean(l)+'</span><span class="bal26-vtr"><em></em><i class="'+(tot?'t':Math.abs(val)<50?'f':val>0?'u':'d')+'" style="'+(val<0?'right':'left')+':50%;width:'+(Math.abs(val)/mx*50).toFixed(2)+'%"></i></span><b class="'+tone(val,50)+'">'+clean(sgnM(val))+'</b><small></small></div>';
  const lvl=(l,val)=>'<div class="bal26-vrow tot"><span>'+clean(l)+'</span><span></span><b>'+clean(fmt2M(val))+'</b><small>'+clean(mt)+'</small></div>';
  const br=root.querySelector('#bal29-bridge');
  if(br)br.innerHTML='<div class="bal26-var">'+lvl(t('Estoque final Conab','Conab ending stocks'),b.end)+contrib.map(c=>bar(c.l,c.v)).join('')+bar(t('Variação total','Total change'),dE,1)+lvl(t('Estoque final simulado','Simulated ending stocks'),v.end)+'</div>';
  const steps=[-6,-4,-2,0,2,4,6],pP=st.production||0,pE=st.exports||0,sgS=s=>(s>0?'+':s<0?'−':'')+Math.abs(s)+'%';
  let mtx='<div class="bal-table-scroll"><table class="bal29-mx"><thead><tr><th class="bal29-mxc">'+clean(t('Produção ↓ · Exportação →','Production ↓ · Exports →'))+'</th>'+steps.map(s=>'<th>'+sgS(s)+'<small>'+clean(fmt2M((b.exports||0)*(1+(pE+s)/100)))+'</small></th>').join('')+'</tr></thead><tbody>';
  steps.forEach(sp=>{mtx+='<tr><th>'+sgS(sp)+'<small>'+clean(fmt2M((b.production||0)*(1+(pP+sp)/100)))+'</small></th>';
   steps.forEach(se=>{const w=simCalc(Object.assign({},st,{production:pP+sp,exports:pE+se})),s2=share(w.end,w.use),dd=s2-su0,a=Math.min(.55,Math.abs(dd)/3*.55);
    const bg=Math.abs(dd)<0.05?'#F6F8FA':dd>0?'rgba(13,148,136,'+a.toFixed(3)+')':'rgba(179,86,77,'+a.toFixed(3)+')';
    mtx+='<td style="background:'+bg+'" class="'+(sp===0&&se===0?'on':'')+(w.end<0?' neg':'')+'"><b>'+clean(fmt2M(w.end))+'</b><small>'+clean(format(s2,1))+'%</small></td>';});
   mtx+='</tr>';});
  mtx+='</tbody></table></div><div class="bal29-note">'+clean(t('Cor: estoque/demanda acima (verde) ou abaixo (vermelho) da Conab, intensidade plena a partir de 3 p.p. Célula com contorno: simulação atual. Estoque negativo indica balanço que não fecha.','Color: stocks/use above (green) or below (red) Conab, full intensity from 3 p.p. Outlined cell: current simulation. Negative stocks mean the balance does not close.'))+'</div>';
  const mx2=root.querySelector('#bal29-matrix');if(mx2)mx2.innerHTML=mtx;
 }
 function simSet(k,p,src){
  p=Math.max(-50,Math.min(50,Math.round(p*100)/100));const st=simState();st[k]=p;
  const b=official.tables[product][year];
  const r=root.querySelector('[data-sim-k="'+k+'"]'),n=root.querySelector('[data-sim-p="'+k+'"]'),a=root.querySelector('[data-sim-a="'+k+'"]');
  if(r&&src!=='r')r.value=p;if(n&&src!=='p')n.value=p;if(a&&src!=='a')a.value=fmt2M((b[k]||0)*(1+p/100));
  simUpdate();
 }
 function simApply(){
  const v=simCalc(simState()),o={};simDrivers().forEach(([k])=>{o[k]=Math.round(v[k]*10)/10;});
  if(!confirm(t('Gravar a simulação como cenário Agrinvest de '+product+' '+year+'? Os valores atuais do cenário serão substituídos.','Save the simulation as the Agrinvest scenario for '+product+' '+year+'? Current scenario values will be replaced.')))return;
  inputs[path(product,year)]=o;persist();view='safra';render();
  if(typeof toast==='function')toast(t('Cenário Agrinvest atualizado ✓','Agrinvest scenario updated ✓'));
 }
 function simCSV(){
  const b=official.tables[product][year],st=simState(),steps=[-6,-4,-2,0,2,4,6],pP=st.production||0,pE=st.exports||0;
  const rows=[[t('produção_%','production_%'),t('exportação_%','exports_%'),t('estoque_final_mil_t','ending_stocks_kt'),t('estoque_demanda_%','stocks_use_%')]];
  steps.forEach(sp=>steps.forEach(se=>{const w=simCalc(Object.assign({},st,{production:pP+sp,exports:pE+se}));rows.push([pP+sp,pE+se,w.end.toFixed(1),share(w.end,w.use).toFixed(2)].map(x=>String(x).replace('.',',')));}));
  const u=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=u;a.download='BRZ_Simulador_'+fileTag()+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
 }
 function render(){
  if(!document.getElementById('scr-balanco').classList.contains('on'))return;
  const options=(crop==='milho'?['Milho']:['Soja em grão','Farelo de soja','Óleo de soja']);
  if(!options.includes(product))product=options[0];
  const all=years(official.tables[product]);if(!all.includes(year))year=all[all.length-1];
  root.querySelectorAll('[data-bal-crop]').forEach(b=>{b.textContent=langs[b.dataset.balCrop][en()?1:0];b.classList.toggle('on',b.dataset.balCrop===crop);b.setAttribute('aria-selected',String(b.dataset.balCrop===crop))});
  const nav=document.querySelector('.topmenu [data-go="scr-balanco"]');if(nav)nav.textContent=t('Oferta & Demanda','Supply & Demand');
  const title=root.querySelector('.bal-top h1');if(title)title.textContent=t('Oferta & Demanda · Brasil','Supply & Demand · Brazil');
  const intro=root.querySelector('.bal-top p');if(intro)intro.textContent=t('Comparação entre balanço oficial e premissas próprias, com reconciliação por safra.','Comparison of official balances and custom assumptions with crop-year reconciliation.');
  const th=root.querySelector('.bal-toolbar-title');if(th)th.textContent=t('Configuração do balanço','Balance configuration');
  const tc=root.querySelector('.bal-toolbar-caption');if(tc)tc.textContent=t('Selecione a commodity e o ano-safra','Choose commodity and crop year');
  const tk=root.querySelector('.bal-key-official');if(tk)tk.textContent=t('CONAB · oficial','CONAB · official');
  const ta=root.querySelector('.bal-key-private');if(ta)ta.textContent=t('AGRINVEST · editável','AGRINVEST · editable');
  const be=root.querySelector('[data-bal-action="export"]');if(be)be.textContent=t('Exportar HTML','Export HTML');
  const eb=root.querySelector('.bal-eyebrow');if(eb)eb.innerHTML=clean(t('AGRINVEST INTELIGÊNCIA','AGRINVEST INTELLIGENCE'))+' <span aria-hidden="true">/</span> '+clean(t('BRASIL · CONAB','BRAZIL · CONAB'));
  root.querySelectorAll('.bal-filters label').forEach((lb,i)=>{const n=lb.firstChild;if(n&&n.nodeType===3)n.nodeValue=(i===0?t('Produto','Product'):t('Safra','Crop year'))+' ';});
  const ao=document.getElementById('bal-asof');if(ao)ao.textContent='Conab · '+t('1º levantamento','1st survey')+' · '+dShort(official.published);
  const bpg=root.querySelector('.bal-top [data-bal-action="png"]');if(bpg)bpg.title=t('Exportar a leitura do balanço (PNG 3×)','Export the balance reading (PNG 3×)');
  const bsrc=root.querySelector('.bal-source');if(bsrc)bsrc.innerHTML=srcFooter();
  const ep=root.querySelector('.bal-top .bal-export-pair');if(ep&&!ep.querySelector('[data-bal-action="xlsx"]')){const bx=document.createElement('button');bx.type='button';bx.className='bal-btn';bx.dataset.balAction='xlsx';bx.textContent='Excel';bx.title=t('Balanço de todos os produtos em Excel','All products balance in Excel');ep.appendChild(bx);}
  const pd=document.getElementById('bal-product');pd.innerHTML=options.map(p=>'<option value="'+clean(p)+'" '+(p===product?'selected':'')+'>'+clean(t(p,p==='Soja em grão'?'Soybeans':p==='Farelo de soja'?'Soybean meal':p==='Óleo de soja'?'Soybean oil':'Corn'))+'</option>').join('');
  const sel=document.getElementById('bal-season');sel.innerHTML=all.map(y=>'<option '+(y===year?'selected':'')+'>'+clean(y)+'</option>').join('');
  const m=model(product,year), fixed=m.source;
  const officialPct=share(fixed.end,fixed.use), agrPct=share(m.closing,m.v.use);
  const counted=countInputs(product,year),total=product==='Soja em grão'?6:5;
  const py=prevYear(product,year),pv=py?official.tables[product][py]:null;
  const kp=[kpi(t('Produção','Production'),fixed.production,toVal(m.v,'production'),'Mi t',pv&&pv.production,py),kpi(t('Exportação','Exports'),fixed.exports,toVal(m.v,'exports'),'Mi t',pv&&pv.exports,py),kpi(t('Estoque final','Ending stocks'),fixed.end,m.closing,'Mi t',pv&&pv.end,py),kpi(t('Estoque / demanda','Stocks / use'),officialPct,agrPct,'%',pv?share(pv.end,pv.use):null,py)].join('');
  const body=rowsFor(product).map(([k,l])=>renderRow(product,year,m,k,l)).join('');
  const checks=[];
  const officialCheck=fixed.supply-fixed.use-fixed.end;
  const conabGood=Math.abs(officialCheck)<.1;
  checks.push('<div class="bal-aside-stat"><span>'+clean(t('Fechamento Conab','Conab reconciliation'))+'</span><b class="'+(conabGood?'bal-green':'bal-red')+'">'+format(officialCheck,3)+' mil t</b></div>');
  checks.push('<div class="bal-progress-group"><div class="bal-progress-label"><span>'+clean(t('Cenário Agrinvest preenchido','Agrinvest scenario completed'))+'</span><b>'+counted+' / '+total+'</b></div><div class="bal-progress-track"><div style="width:'+Math.round(100*counted/total)+'%" class="bal-progress-bar"></div></div></div>');
  checks.push('<div class="bal-aside-stat"><span>'+clean(t('Estoque / demanda · Conab','Conab stocks/use'))+'</span><b>'+pct(officialPct)+'</b></div>');
  checks.push('<div class="bal-aside-stat"><span>'+clean(t('Estoque / demanda · Agrinvest','Agrinvest stocks/use'))+'</span><b>'+pct(agrPct)+'</b></div>');
  const complete=m.implied!=null;
  let alert='';
  if(!complete)alert='<div class="bal-alert">'+clean(t('Preencha os componentes Agrinvest para calcular automaticamente oferta, demanda e estoque implícito. Campos vazios não são considerados zero.','Fill the Agrinvest assumptions to calculate supply, use and implied ending stocks. Blank fields are not treated as zero.'))+'</div>';
  else if(m.closeDelta!=null && Math.abs(m.closeDelta)>0.11)alert='<div class="bal-alert warn"><strong>'+clean(t('Atenção: balanço Agrinvest não fecha.','Warning: Agrinvest balance does not reconcile.'))+'</strong> '+clean(t('Estoque informado menos estoque implícito','Input ending stocks minus implied ending stocks'))+': <b>'+format(m.closeDelta,2)+' mil t</b>.</div>';
  else alert='<div class="bal-alert good"><strong>'+clean(t('Balanço Agrinvest reconciliado.','Agrinvest balance reconciled.'))+'</strong> '+clean(t('Estoque final implícito','Implied ending stocks'))+': '+format(m.implied,1)+' mil t.</div>';
  const __safraHtml='<div class="bal-metrics-head"><div><h2>'+clean(t('Indicadores do balanço','Balance indicators'))+'</h2><p>'+clean(t('Níveis Conab e cenário Agrinvest. Todas as quantidades em milhões de toneladas, salvo indicação.','Conab official values and Agrinvest scenario. Quantities in million metric tonnes unless stated.'))+'</p></div><span class="bal-metrics-ref">'+clean(t(product,product==='Milho'?'Corn':product==='Soja em grão'?'Soybeans':product==='Farelo de soja'?'Soybean meal':'Soybean oil'))+' · '+clean(year)+'</span></div><div class="bal-kpis">'+kp+'</div><div class="bal-layout"><div>'+ 
    '<article class="bal-card bal-primary-card"><div class="bal26-ch"><div><h2>'+clean(t('Balanço de oferta e demanda','Supply & demand balance'))+' · '+clean(t(product,product==='Milho'?'Corn':product==='Soja em grão'?'Soybeans':product==='Farelo de soja'?'Soybean meal':'Soybean oil'))+' · '+clean(year)+'</h2><div class="bal-desc">'+clean(t('Valores em mil t · coluna Agrinvest livre para imputação · diferença = Agrinvest − Conab','Values in thousand tonnes · Agrinvest inputs are editable · difference = Agrinvest − Conab'))+'</div></div><button type="button" class="bal-btn bal26-png" data-bal-action="png-table" data-noexport>PNG 3×</button></div><div class="bal-mobile-hint">'+clean(t('Deslize a tabela para a direita para editar AGRINVEST e consultar as diferenças →','Swipe right to edit AGRINVEST and see the differences →'))+'</div><div class="bal-table-scroll" tabindex="0" role="region" aria-label="Tabela Conab Agrinvest"><table class="bal-table"><thead><tr><th>'+clean(t('Componentes','Items'))+'</th><th>CONAB<br/>'+clean(t('Oficial','Official'))+'</th><th>AGRINVEST<br/>'+clean(t('Estimativa editável','Editable estimate'))+'</th><th>'+clean(t('Diferença','Difference'))+'<br/>AG − CONAB</th></tr></thead><tbody>'+body+'</tbody></table></div><div class="bal-legend">'+clean(t('Edite os campos em verde com números em mil toneladas. Oferta, demanda e estoque implícito são calculados apenas quando os componentes estão completos. Estoque final informado é opcional e é confrontado com o implícito.','Edit green input fields in thousand tonnes. Supply, use and implied carryout are calculated only with complete inputs. An independently entered ending stock is optional and checked against the implied value.'))+'</div></article>'+ 
    leituraCard(m)+'</div><aside>'+ 
    '<article class="bal-card bal-audit-card"><h2>'+clean(t('Reconciliação & premissas','Reconciliation & assumptions'))+'</h2><div class="bal-desc">'+clean(t('Identidade contábil · oferta − demanda = estoque final','Accounting identity · supply − use = ending stocks'))+'</div>'+checks.join('')+alert+'<button type="button" class="bal-btn bal-btn-quiet" data-bal-action="clear">'+clean(t('Limpar cenário Agrinvest desta safra','Clear Agrinvest scenario for this season'))+'</button></article>'+ 
    '<article class="bal-card bal-history-card"><h2>'+clean(t('Estoques finais · Conab','Ending stocks · Conab'))+'</h2><div class="bal-desc">'+clean(t('Safras sucessivas no levantamento de '+mShort(official.published)+', não revisões mensais. E/D: estoque sobre demanda.','Successive crop years in the '+mShort(official.published)+' survey, not monthly revisions. S/U: stocks to use.'))+'</div>'+histList(product)+'</article>'+ 
    '<article class="bal-card"><h2>'+clean(t('Notas de calendário e fonte','Calendar & source notes'))+'</h2><div class="bal-aside-stat"><span>'+clean(t('Safra selecionada','Selected crop year'))+'</span><b>'+clean(year)+'</b></div><div class="bal-aside-stat"><span>'+clean(t('Base oficial','Official release'))+'</span><b>'+clean(dShort(official.published))+'</b></div><div class="bal-aside-stat"><span>'+clean(t('Estoque de passagem','Ending stock date'))+'</span><b>'+clean((product==='Milho'?t('31/jan/','31 Jan '):t('31/dez/','31 Dec '))+(Number.parseInt(year.split('/')[1],10)+2000+(product==='Milho'?1:0)))+'</b></div><div class="bal-aside-stat"><span>'+clean(t('Planilha fonte','Source worksheet'))+'</span><b data-noi18n>'+clean(official.sourceSheet[product])+'</b></div></article>'+ 
    '</aside></div>';
  if(view!=='serie')dropCharts();
  root.querySelector('#bal-content').innerHTML=viewTabs()+(view==='serie'?serieView():view==='sim'?simView():__safraHtml);
  if(view==='serie')mountCharts();
  if(view==='sim')simUpdate();
  initialized=true;
 }
 function csv(){
  const m=model(product,year);
  const header=['Produto','Safra','Item','Conab mil t','Agrinvest mil t','Delta mil t','Fonte'];
  const rec=rowsFor(product).filter(x=>x[0]!=='group').map(([k,l])=>{
   const v=k==='end'?m.closing:toVal(m.v,k),base=m.source[k];
   const n1=x=>x==null||!Number.isFinite(x)?'':x.toFixed(1).replace('.',','); /* s27: decimal com vírgula para o Excel pt-BR */
   return [product,year,l,n1(base),n1(v),n1(v==null?null:v-base),official.source+' | '+official.sourceSheet[product]];
  });
  const quote=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const txt='\ufeff'+[header,...rec].map(r=>r.map(quote).join(';')).join('\r\n');
  const u=URL.createObjectURL(new Blob([txt],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='BRZ_Balanco_'+product.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\W+/g,'_')+'_'+year.replace('/','-')+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
 }
 function png(){nodePNG(document.getElementById('bal26-leitura'),fileTag()+'_leitura');}
 function pngTable(){nodePNG(root.querySelector('.bal-primary-card'),fileTag()+'_tabela');}
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-bal-crop],[data-bal-action]');if(!b||!root.contains(b))return;
  if(b.dataset.balCrop){crop=b.dataset.balCrop;product=crop==='milho'?'Milho':'Soja em grão';year='2026/27';render();return;}
  const action=b.dataset.balAction;
  if(action==='csv')csv();else if(action==='png')png();else if(action==='png-table')pngTable();else if(action==='xlsx')xlsxOD();else if(action==='csv-serie')serieCSV();else if(action==='png-serie')nodePNG(document.getElementById('bal29-serie'),fileTag()+'_historico');else if(action==='export'){persist();if(typeof window.exportarHTML==='function')window.exportarHTML();else if(typeof exportarHTML==='function')exportarHTML();}
  else if(action==='clear'){
   if(confirm(t('Limpar apenas os valores Agrinvest de '+product+' '+year+'?','Clear only Agrinvest values for '+product+' '+year+'?'))){delete inputs[path(product,year)];persist();render()}
  }
 });
 root.addEventListener('click',e=>{
  const vb=e.target.closest('[data-bal-view]');if(vb){view=vb.dataset.balView;render();return;}
  const sb=e.target.closest('[data-bal-sim]');if(!sb)return;const a=sb.dataset.balSim;
  if(a==='reset'){SIM[simKey()]={};render();}else if(a==='apply')simApply();else if(a==='csv')simCSV();
  else if(a==='png')nodePNG(document.getElementById('bal29-simcard'),fileTag()+'_simulador');else if(a==='pngmx')nodePNG(document.getElementById('bal29-mxcard'),fileTag()+'_sensibilidade');
 });
 root.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset&&el.dataset.simK){simSet(el.dataset.simK,parseFloat(el.value)||0,'r');return;}
  if(el.dataset&&el.dataset.simP){const v=parseFloat(String(el.value).replace(',','.'));if(Number.isFinite(v))simSet(el.dataset.simP,v,'p');}
 });
 root.addEventListener('change',e=>{
  const el=e.target;if(!el.dataset||!el.dataset.simA)return;
  const k=el.dataset.simA,b=official.tables[product][year],s=String(el.value).trim().replace(/\s/g,''),n=s.indexOf(',')>=0?parseFloat(s.replace(/\./g,'').replace(',','.')):parseFloat(s);
  if(!Number.isFinite(n)||!(b[k]>0)){el.value=fmt2M((b[k]||0)*(1+((simState()[k])||0)/100));return;}
  simSet(k,(n*1000/b[k]-1)*100,'a');
 });
 root.addEventListener('change',e=>{
  const el=e.target;
  if(el.id==='bal-product'){product=el.value;year='2026/27';render();return;}
  if(el.id==='bal-season'){year=el.value;render();return;}
  if(!el.matches('.bal-edit'))return;
  const k=el.dataset.balField,n=parseBR(el.value);
  if(Number.isNaN(n)){el.classList.add('bal-invalid');el.title=t('Número inválido. Use vírgula decimal ou ponto.','Invalid number. Use comma or dot decimals.');el.focus();return;}
  set(product,year,k,n);render();
 });
 function startup(){
  const pane=document.getElementById('scr-balanco');if(!pane)return;
  const observer=new MutationObserver(()=>{if(pane.classList.contains('on'))render()});
  observer.observe(pane,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>{if(pane.classList.contains('on'))render()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  if(pane.classList.contains('on'))render();
 }
 window.BRZBAL={persist,flush:persist,render,read:()=>JSON.parse(JSON.stringify(inputs)),official};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startup,{once:true});else startup();
})();

