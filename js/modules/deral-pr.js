/* BRZ SAFRA s32 · DERAL/PR: fonte estadual independente, exibida sem misturar com a Conab (comparação lado a lado).
   Tudo sai da base window.C.deralPR: data e semana do relatório, culturas de plantio (safra nova) e de colheita
   (safra de inverno), série semanal, estimativa mensal e comparação na mesma data do ano anterior. */
(function(){
 'use strict';
 const V=window.C&&window.C.deralPR;if(!V)return;
 const el=document.getElementById('deral-app');if(!el)return;
 const LABELS={'Soja':['Soja','Soybeans'],'Milho 1ª':['Milho 1ª safra','1st-crop corn'],'Feijão 1ª':['Feijão 1ª safra','1st-crop beans'],'Batata 1ª':['Batata 1ª safra','1st-crop potatoes'],
   'Trigo':['Trigo','Wheat'],'Cevada':['Cevada','Barley'],'Batata 2ª':['Batata 2ª safra','2nd-crop potatoes']};
 const ORDER=['Soja','Milho 1ª','Feijão 1ª','Batata 1ª','Trigo','Cevada','Batata 2ª'];
 const crops=Object.keys(V.crops).sort((a,b)=>(ORDER.indexOf(a)+99)%99-(ORDER.indexOf(b)+99)%99);
 let crop=crops.includes('Soja')?'Soja':crops[0],filter='';
 const en=()=>document.documentElement.lang==='en';
 const T=(pt,e)=>en()?e:pt;
 const lbl=k=>LABELS[k]?T(LABELS[k][0],LABELS[k][1]):k;
 const fmt=(n,dec=0)=>{let s=Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec});return s.replace(/^-/,'−');}; /* pt-BR na origem, i18n converte */
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const MESE=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const dmy=iso=>{const q=String(iso||'').split('-');if(q.length!==3)return String(iso||'');return en()?(+q[2])+' '+MESE[+q[1]-1]+' '+q[0]:q[2]+'/'+q[1]+'/'+q[0];};
 const dm=iso=>{const q=String(iso||'').split('-');if(q.length!==3)return String(iso||'');return en()?(+q[2])+' '+MESE[+q[1]-1]:q[2]+'/'+q[1];};
 const sgn=(v,d=0)=>(Math.abs(v)<Math.pow(10,-d)/2?'':v>0?'+':'−')+fmt(Math.abs(v),d);
 const colors={base:'#1A3A5C',up:'#0D9488',other:'#B5963E',bad:'#B3564D'};
 const bar=(p,color)=>`<div class="dr-track"><div class="dr-bar" style="width:${Math.min(100,Math.max(0,p))}%;background:${color||colors.base}"></div></div>`;
 const meta=k=>{const x=V.crops[k]||{};return {safra:x.safra||'2026/27',oper:x.oper||'Semeadura',conab:x.conab===undefined?null:x.conab,conabSafra:x.conabSafra||x.safra||'2026/27'};};
 const harvest=k=>meta(k).oper==='Colheita';
 function conabSerie(k){const m=meta(k);if(!m.conab)return [];return ((((window.C.prog||{})[m.conab]||{})[m.conabSafra]||{})[m.oper]||{})['Paraná']||[];}
 function hist(k){const op=meta(k).oper;return (V.historico||[]).filter(x=>x.cultura===k&&(x.oper||'Semeadura')===op).sort((a,b)=>a.data<b.data?-1:1);}
 function produceCSV(){
  const rows=[['Cultura','Safra','Operação','Núcleo regional','Área total ha','Área plantada ha','% plantio','Área colhida ha','% colheita','Área ruim ha','% ruim','Área média ha','% média','Área boa ha','% boa','Germinação %','Desenv vegetativo %','Floração %','Frutificação %','Maturação %','Fonte','Data','Semana']];
  for(const k of crops){const x=V.crops[k],m=meta(k);for(const r of [...x.regionals,x.total])
   rows.push([k,m.safra,m.oper==='Colheita'?'Colheita':'Plantio',r.regional,r.area_total_ha,r.plantado_ha,r.plantado_pct,r.colhido_ha,r.colhido_pct,r.ruim_ha,r.ruim_pct,r.medio_ha,r.medio_pct,r.bom_ha,r.bom_pct,r.germinacao_pct,r.vegetativo_pct,r.floracao_pct,r.frutificacao_pct,r.maturacao_pct,'SEAB/DERAL/DEB',V.data||'',V.semana||'']);}
  const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='DERAL_PR_'+String(V.data||'').replace(/-/g,'')+'_S'+(V.semana||'')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1800);
 }
 function render(){
  const dat=V.crops[crop],total=dat.total,m=meta(crop),hv=harvest(crop);
  const pctK=hv?'colhido_pct':'plantado_pct',haK=hv?'colhido_ha':'plantado_ha',pctNow=total[pctK];
  const H=hist(crop),prevH=H.filter(x=>x.data<(V.data||'')).pop();
  /* Conab: leitura do sábado seguinte ao relatório; sem ela, a anterior */
  const cs=conabSerie(crop),t0=Date.parse((V.data||'')+'T00:00:00Z');let ca=null,cb=null;
  cs.forEach(p=>{const df=(Date.parse(p[0]+'T00:00:00Z')-t0)/864e5;if(df>=0&&df<=6&&(!ca||df<ca.df))ca={d:p[0],v:p[1],df};if(df<0&&(!cb||df>cb.df))cb={d:p[0],v:p[1],df};});
  let html=`<div class="dr-header"><div><h2>${T('DERAL · Paraná · acompanhamento por núcleo regional','DERAL · Paraná · regional crop monitoring')}</h2><p>${T('Relatório PSS SEAB/DERAL/DEB · semana '+(V.semana||'')+' · '+dmy(V.data)+' · PR','SEAB/DERAL/DEB PSS report · week '+(V.semana||'')+' · '+dmy(V.data)+' · Paraná')}</p></div><button class="dr-export" id="dr-export">${T('Exportar CSV','Export CSV')}</button></div>`;
  const opt=g=>crops.filter(k=>(meta(k).oper==='Colheita')===g).map(k=>`<option value="${esc(k)}" ${crop===k?'selected':''}>${esc(lbl(k))}</option>`).join('');
  const sNova=(crops.find(k=>!harvest(k))?meta(crops.find(k=>!harvest(k))).safra:''),sVelha=(crops.find(k=>harvest(k))?meta(crops.find(k=>harvest(k))).safra:'');
  html+=`<div class="dr-controls"><label>${T('Cultura','Crop')} <select id="dr-crop"><optgroup label="${esc(T('Plantio · safra '+sNova,'Planting · crop year '+sNova))}">${opt(false)}</optgroup>${sVelha?`<optgroup label="${esc(T('Colheita · safra '+sVelha,'Harvest · crop year '+sVelha))}">${opt(true)}</optgroup>`:''}</select></label><label>${T('Buscar núcleo regional','Find regional office')} <input id="dr-filter" value="${esc(filter)}" placeholder="${T('Ex.: Cascavel','E.g. Cascavel')}"></label></div>`;
  const dW=prevH?pctNow-prevH.pct:null;
  const kpis=hv?[
   [T('Área total','Total area'),fmt(total.area_total_ha)+' ha',''],
   [T('Área colhida','Harvested area'),fmt(total.colhido_ha)+' ha',''],
   [T('Colheita DERAL','DERAL harvest'),fmt(total.colhido_pct)+'%',dW!=null?sgn(dW)+T(' p.p. desde ',' p.p. since ')+dm(prevH.data):''],
   [T('Falta colher','Left to harvest'),fmt(total.area_total_ha-total.colhido_ha)+' ha',''],
   [T('No campo em boa condição','Good condition, still in field'),fmt(total.bom_pct)+'%',T('média ','fair ')+fmt(total.medio_pct)+'% · '+T('ruim ','poor ')+fmt(total.ruim_pct)+'%']
  ]:[
   [T('Área prevista','Expected area'),fmt(total.area_total_ha)+' ha',''],
   [T('Área semeada','Planted area'),fmt(total.plantado_ha)+' ha',''],
   [T('Plantio DERAL','DERAL planting'),fmt(total.plantado_pct)+'%',dW!=null?sgn(dW)+T(' p.p. desde ',' p.p. since ')+dm(prevH.data):''],
   [T('Falta semear','Remaining area'),fmt(total.area_total_ha-total.plantado_ha)+' ha',''],
   [T('Lavouras em boa condição','Crops in good condition'),fmt(total.bom_pct)+'%',T('média ','fair ')+fmt(total.medio_pct)+'% · '+T('ruim ','poor ')+fmt(total.ruim_pct)+'%']
  ];
  html+=`<div class="dr-kpis">${kpis.map(([a,b,c])=>`<div class="dr-kpi"><span>${a}</span><b>${b}</b>${c?`<small>${c}</small>`:''}</div>`).join('')}</div>`;
  if(m.conab&&(ca||cb)){
   const opL=hv?T('colheita','harvest'):T('plantio','planting');
   let note;
   if(ca)note=T('No PR, a série semanal da Conab repete o número do DERAL no sábado seguinte ao relatório; a diferença no mesmo dia é só calendário.','In PR, Conab weekly series repeats the DERAL figure on the Saturday after the report; same-day gaps are calendar only.');
   else{const ph=H.find(x=>{const d=(Date.parse(cb.d+'T00:00:00Z')-Date.parse(x.data+'T00:00:00Z'))/864e5;return d>=0&&d<=6;});
    const nx=new Date(t0+((6-new Date(t0).getUTCDay()+7)%7||7)*864e5).toISOString().slice(0,10);
    note=ph&&Math.abs(ph.pct-cb.v)<0.05?T('A Conab de '+dm(cb.d)+' repete o DERAL de '+dm(ph.data)+' ('+fmt(ph.pct)+'%); a leitura Conab deste relatório sai no sábado '+dm(nx)+'.','Conab on '+dm(cb.d)+' repeats DERAL of '+dm(ph.data)+' ('+fmt(ph.pct)+'%); the Conab reading for this report comes out on Saturday '+dm(nx)+'.')
     :T('A Conab ainda não publicou a semana deste relatório; comparação com a leitura anterior.','Conab has not published the week of this report yet; compared with the previous reading.');}
   const c=ca||cb;
   html+=`<div class="dr-conab">${T('Paraná · '+opL+' | DERAL ('+dm(V.data)+')','Paraná · '+opL+' | DERAL ('+dm(V.data)+')')}: <b>${fmt(pctNow)}%</b> &nbsp; · &nbsp; Conab (${dm(c.d)}): <b>${fmt(c.v,1)}%</b> <span>${note}</span></div>`;
  }
  /* estimativa mensal, mesma data do ano anterior e série semanal */
  const es=((V.estimativa||{}).crops||{})[crop],md=(V.mesmaData||{})[crop];
  const parts=[];
  if(md)parts.push(T('Mesma data em '+md.ano+': '+fmt(md.pct)+'% '+(hv?'colhido':'plantado')+' ('+sgn(pctNow-md.pct)+' p.p. em '+(+String(V.data).slice(0,4))+')','Same date in '+md.ano+': '+fmt(md.pct)+'% '+(hv?'harvested':'planted')+' ('+sgn(pctNow-md.pct)+' p.p. in '+(+String(V.data).slice(0,4))+')'));
  if(es)parts.push(T('Estimativa DERAL ('+dm(V.estimativa.data)+'): ','DERAL estimate ('+dm(V.estimativa.data)+'): ')+fmt(es.prod,2)+T(' Mi t',' Mmt')+(es.area!=null?' · '+fmt(es.area,2)+T(' Mi ha',' Mha'):'')+(es.produt!=null?' · '+fmt(es.produt)+' kg/ha':'')+(es.prodAnt?' · '+sgn((es.prod/es.prodAnt-1)*100,1)+T('% sobre ','% vs ')+((+String(es.safra).slice(0,4)-1)+'/'+String(es.safra).slice(2,4)):''));
  if(H.length>1)parts.push(T('Série DERAL: ','DERAL series: ')+H.map(x=>dm(x.data)+' '+fmt(x.pct)+'%').join(' · '));
  const U=V.ultimo;
  if(U&&U.data>(V.data||'')){const uc=(U.culturas||{})[crop];parts.unshift(T('Relatório mais recente ('+dmy(U.data)+'): ','Latest report ('+dmy(U.data)+'): ')+(uc?fmt(uc.plantado)+'%':T('sem número desta cultura','no figure for this crop'))+T('; o detalhe por núcleo abaixo é do relatório de '+dmy(V.data)+'.','; the regional detail below is from the '+dmy(V.data)+' report.'));}
  if(parts.length)html+=`<div class="dr-latest">${parts.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`;
  const rows=dat.regionals.filter(r=>r.regional.toLowerCase().includes(filter.trim().toLowerCase())).sort((a,b)=>hv?b.area_total_ha-a.area_total_ha:b.plantado_ha-a.plantado_ha);
  html+=`<div class="dr-cols"><section class="dr-pane"><h3>${hv?T('Avanço da colheita por núcleo','Harvest progress by region'):T('Avanço do plantio por núcleo','Planting progress by region')}</h3><div class="dr-scroll">${rows.map(r=>`<div class="dr-row"><span title="${esc(r.regional)}">${esc(r.regional)}</span>${bar(r[pctK],hv?colors.other:colors.base)}<b>${fmt(r[pctK])}%</b></div>`).join('')}</div></section>`;
  html+=`<section class="dr-pane"><h3>${hv?T('Condição das lavouras ainda no campo','Condition of fields still unharvested'):T('Condição das áreas implantadas','Condition of planted fields')}</h3><div class="dr-legend"><i style="background:${colors.up}"></i>${T('Bom','Good')} <i style="background:${colors.other}"></i>${T('Médio','Fair')} <i style="background:${colors.bad}"></i>${T('Ruim','Poor')}</div><div class="dr-scroll">${rows.map(r=>{const done=hv&&r.colhido_pct>=100&&!(r.bom_pct+r.medio_pct+r.ruim_pct);
    return `<div class="dr-row"><span title="${esc(r.regional)}">${esc(r.regional)}</span>${done?`<div class="dr-track dr-done">${T('colheita concluída','harvest complete')}</div><b>·</b>`:`<div class="dr-track dr-stacked"><i style="width:${r.bom_pct}%;background:${colors.up}"></i><i style="width:${r.medio_pct}%;background:${colors.other}"></i><i style="width:${r.ruim_pct}%;background:${colors.bad}"></i></div><b>${fmt(r.bom_pct)}%</b>`}</div>`;}).join('')}</div></section></div>`;
  const fld=['regional','area_total_ha',haK,pctK,'ruim_pct','medio_pct','bom_pct','germinacao_pct','vegetativo_pct','floracao_pct','frutificacao_pct','maturacao_pct'];
  const hd=[T('Núcleo regional','Regional office'),T('Área total (ha)','Total area (ha)'),hv?T('Colhido (ha)','Harvested (ha)'):T('Semeado (ha)','Planted (ha)'),hv?T('Colheita (%)','Harvest (%)'):T('Plantio (%)','Planting (%)'),T('Ruim (%)','Poor (%)'),T('Médio (%)','Fair (%)'),T('Bom (%)','Good (%)'),T('Germ. (%)','Germ. (%)'),T('Veget. (%)','Veget. (%)'),T('Flor. (%)','Flower. (%)'),T('Frut. (%)','Fruit. (%)'),T('Mat. (%)','Matur. (%)')];
  html+=`<section class="dr-pane dr-all"><h3>${T('Detalhamento DERAL por núcleo regional','DERAL regional-level dataset')} · ${esc(lbl(crop))} · ${esc(m.safra)}</h3><div class="dr-table-scroll"><table class="dr-table"><thead><tr>${hd.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${fld.map(k=>`<td>${k==='regional'?esc(r[k]):fmt(r[k])}</td>`).join('')}</tr>`).join('')}</tbody><tfoot><tr>${fld.map(k=>`<td>${k==='regional'?T('TOTAL PARANÁ','TOTAL PARANÁ'):fmt(total[k])}</td>`).join('')}</tr></tfoot></table></div><p class="dr-note">${hv?T('Na colheita, condição e fases referem-se à área ainda não colhida. Percentuais conforme publicados pelo DERAL; a soma pode diferir de 100% pelo arredondamento da fonte.','During harvest, condition and phases refer to the area not yet harvested. Percentages as published by DERAL; totals may differ from 100% due to source rounding.'):T('Condição da lavoura refere-se à área implantada. Fenologia conforme percentuais publicados pelo DERAL; a soma pode diferir de 100% pelo arredondamento da fonte.','Crop condition describes planted acreage. Phenology as published by DERAL; totals may differ from 100% due to source rounding.')}</p></section>`;
  const cLast=(()=>{const s=((((window.C.prog||{}).Soja||{})['2026/27']||{}).Semeadura||{}).BR||[];return s.length?s[s.length-1][0]:'';})();
  html+=`<div class="dr-source">${T('Fontes: SEAB/DERAL/DEB, Relatório PSS, semana '+(V.semana||'')+', emissão '+dmy(V.data)+'; Conab, acompanhamento semanal até '+dmy(cLast)+'. Os valores do DERAL não substituem os da Conab.','Sources: SEAB/DERAL/DEB PSS report, week '+(V.semana||'')+', issued '+dmy(V.data)+'; Conab weekly monitoring through '+dmy(cLast)+'. DERAL values do not replace Conab figures.')}</div>`;
  el.innerHTML=html;
  el.querySelector('#dr-crop').onchange=e=>{crop=e.target.value;filter='';render();};
  el.querySelector('#dr-filter').oninput=e=>{filter=e.target.value;const pos=e.target.selectionStart;render();const x=el.querySelector('#dr-filter');x.focus();x.setSelectionRange(pos,pos);};
  el.querySelector('#dr-export').onclick=produceCSV;
 }
 render();
 window.BRZDERAL={render};
 new MutationObserver(m=>{if(m.some(x=>x.attributeName==='lang'))render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
