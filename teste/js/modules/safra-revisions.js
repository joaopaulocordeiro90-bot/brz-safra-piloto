
/* ═══════════ BRZ SAFRA s26 · Quadro de estimativas Conab ═══════════
   Substitui os painéis s20 (KPIs repetidos, ponte em escala relativa, barras de nível por UF,
   evolução de 2 pontos) por: tabela única por geografia, leitura área × produtividade em texto
   (barras só acima de 0,5% do nível) e tabela por UF com barras em escala fixa.
   Números sempre formatados em pt-BR; a camada i18n converte para EN. */
(function(){
'use strict';
const DATA=window.C, VV=DATA.vintages||[];
const en=()=>document.documentElement.lang==='en';
const T=(pt,e)=>en()?e:pt;
const NF={};
const nf=n=>NF[n]||(NF[n]=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:n,maximumFractionDigits:n}));
const MINUS='\u2212';
const num=(v,n)=>v==null||!isFinite(v)?'n/d':nf(n).format(v);
const sgn=(v,n)=>{if(v==null||!isFinite(v))return 'n/d';const r=Number(v.toFixed(n));if(r===0)return nf(n).format(0);return (r>0?'+':MINUS)+nf(n).format(Math.abs(r));};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cropName=c=>en()&&window.BRZI18N?window.BRZI18N.toEnglish(c):c;

/* ── métricas: nível e variação, unidades e casas fixas ── */
const MET={
 prod:{pt:'Produção',en:'Production',lvU:['Mi t','Mmt'],dU:['mil t','kt'],lv:x=>x/1000,lvD:2,dv:x=>x,dD:1},
 area:{pt:'Área',en:'Area',lvU:['Mi ha','Mha'],dU:['mil ha','kha'],lv:x=>x/1000,lvD:2,dv:x=>x,dD:1},
 produt:{pt:'Produtividade',en:'Yield',lvU:['sc/ha','bags/ha'],dU:['sc/ha','bags/ha'],lv:x=>x/60,lvD:1,dv:x=>x/60,dD:1}
};
const MORDER=['prod','area','produt'];
const mName=m=>T(MET[m].pt,MET[m].en), lvU=m=>T(MET[m].lvU[0],MET[m].lvU[1]), dU=m=>T(MET[m].dU[0],MET[m].dU[1]);
const lvf=(m,x)=>x==null?'n/d':num(MET[m].lv(x),MET[m].lvD);
const dvf=(m,x)=>x==null?'n/d':sgn(MET[m].dv(x),MET[m].dD);

/* escala fixa das barras (%) e limiar de tom neutro: ruído de arredondamento não vira alarme */
const SC={rev:2,saf:20}, EPS={rev:0.05,saf:0.1}, PONTE_MIN=0.5, TOPN=8;
const tone=(p,k)=>p==null?'q-na':Math.abs(p)<EPS[k]?'q-flat':p>0?'q-up':'q-down';
const pcf=(p,k)=>p==null?'n/d':sgn(p,k==='rev'?2:1)+'%';

/* ── publicações ── */
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MES_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ord=n=>{n=+n;const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
function vShort(v){const p=String(v&&v.reference_month||'').split('-');if(p.length<2)return v?v.id:'';const m=+p[1]-1,y=p[0].slice(2);return T(MES[m]+'/'+y,MES_EN[m]+'/'+y);}
function vName(v){if(!v)return '';const s=vShort(v);if(v.kind==='perspectivas')return T('Perspectivas '+s,'Outlook '+s);
 const n=(String(v.label||'').match(/(\d+)\s*º/)||[])[1]||'';return T((n?n+'º ':'')+'levantamento '+s,(n?ord(n)+' ':'')+'survey '+s);}
const dBR=iso=>{if(!iso)return '';const p=iso.split('-');return p[2]+'/'+p[1]+'/'+p[0].slice(2);};
const cur=()=>VV[VV.length-1], prv=()=>VV.length>1?VV[VV.length-2]:null;
const seasons=(v,c)=>Object.keys((v&&v.records&&v.records[c])||{}).sort((a,b)=>parseInt(a,10)-parseInt(b,10));
const rec=(v,c,s,g)=>(v&&v.records&&v.records[c]&&v.records[c][s]&&v.records[c][s][g])||null;
function metr(v,c,s,g){const r=rec(v,c,s,g);if(!r)return null;const a=r[0],p=r[2];let y=r[1];
 if((y==null||y===0)&&a>0&&p>0)y=p/a*1000;            /* identidade Conab: kg/ha = mil t ÷ mil ha × 1000 */
 return {area:a,produt:a>0?y:null,prod:p};}
function ctx(c){const v=cur(),ss=seasons(v,c);if(!ss.length)return null;const sf=ss[ss.length-1],sa=ss.length>1?ss[ss.length-2]:null;
 const p=prv();return {c,v,sf,sa,p:(p&&rec(p,c,sf,'BR'))?p:null};}
function cmp(k,g){const now=metr(k.v,k.c,k.sf,g);if(!now)return null;
 return {now,saf:k.sa?metr(k.v,k.c,k.sa,g):null,rev:k.p?metr(k.p,k.c,k.sf,g):null};}
const dlt=(a,b)=>a==null||b==null?null:a-b;
const pct=(a,b)=>a==null||b==null||!b?null:(a/b-1)*100;
function ponte(b,a){if(!a||!b||[a.area,a.produt,a.prod,b.area,b.produt,b.prod].some(x=>x==null))return null;
 const ea=(a.area-b.area)*(a.produt+b.produt)/2000, ey=(a.produt-b.produt)*(a.area+b.area)/2000, tot=a.prod-b.prod;
 return {ea,ey,tot,res:tot-ea-ey,pct:pct(a.prod,b.prod)};}

/* ── geografia ── */
const REG=[['NORTE','Norte','North'],['NORDESTE','Nordeste','Northeast'],['CENTRO-OESTE','Centro-Oeste','Center-West'],['SUDESTE','Sudeste','Southeast'],['SUL','Sul','South'],['NORTE/NORDESTE','Norte/Nordeste','North/Northeast'],['CENTRO-SUL','Centro-Sul','Center-South']];
const REG_UF={NORTE:['RR','RO','AC','AM','AP','PA','TO'],NORDESTE:['MA','PI','CE','RN','PB','PE','AL','SE','BA'],'CENTRO-OESTE':['MT','MS','GO','DF'],SUDESTE:['MG','ES','RJ','SP'],SUL:['PR','SC','RS']};
REG_UF['NORTE/NORDESTE']=REG_UF.NORTE.concat(REG_UF.NORDESTE);
REG_UF['CENTRO-SUL']=REG_UF['CENTRO-OESTE'].concat(REG_UF.SUDESTE,REG_UF.SUL);
const isUF=g=>/^[A-Z]{2}$/.test(g)&&g!=='BR';
const ufNome=g=>(DATA.meta.ufNome||{})[g]||g;
function geoName(g){if(g==='BR')return T('Brasil','Brazil');const r=REG.find(x=>x[0]===g);return r?(en()?r[2]:r[1]):ufNome(g);}
function geoSelect(k,sel,regionsOnly){
 const rs=(k.v.records[k.c]||{})[k.sf]||{};const has=g=>{const a=rs[g];return !!(a&&(a[2]>0||a[0]>0));};
 const o=(v,t)=>`<option value="${v}"${sel===v?' selected':''}>${esc(t)}</option>`;
 const regs=REG.filter(r=>has(r[0]));
 let h=o('BR',T('Brasil','Brazil'));
 if(regs.length)h+=`<optgroup label="${esc(T('Regiões','Regions'))}">${regs.map(r=>o(r[0],en()?r[2]:r[1])).join('')}</optgroup>`;
 if(!regionsOnly){const ufs=Object.keys(rs).filter(g=>isUF(g)&&has(g)).sort();
  h+=`<optgroup label="${esc(T('Estados','States'))}">${ufs.map(g=>o(g,g+' · '+ufNome(g))).join('')}</optgroup>`;}
 return h;
}

/* ── quadro principal: uma tabela no lugar de KPIs, tabela, caixas e evolução ── */
function mainTable(k,g){
 const x=cmp(k,g);if(!x)return `<div class="q-empty">${esc(T('Sem estimativa Conab para esta geografia.','No Conab estimate for this geography.'))}</div>`;
 const hasRev=!!(k.p&&x.rev);
 let h=`<div class="q-scroll"><table class="q-table q-main"><thead><tr>`+
  `<th class="q-l" rowspan="2">${esc(geoName(g))}</th>`+
  `<th rowspan="2">${esc(k.sa||'n/d')}<small>${esc(T('safra anterior','previous crop'))}</small></th>`+
  (hasRev?`<th rowspan="2">${esc(k.sf)}<small>${esc(vName(k.p))}</small></th>`:'')+
  `<th rowspan="2" class="q-now">${esc(k.sf)}<small>${esc(vName(k.v))}</small></th>`+
  `<th colspan="2" class="q-grp">vs ${esc(k.sa||'n/d')}</th>`+
  (hasRev?`<th colspan="2" class="q-grp">${esc(T('Revisão','Revision'))} ${esc(vShort(k.v))} vs ${esc(vShort(k.p))}</th>`:'')+
  `</tr><tr><th class="q-sub2">${esc(T('var.','chg.'))}</th><th class="q-sub2">%</th>`+
  (hasRev?`<th class="q-sub2">${esc(T('var.','chg.'))}</th><th class="q-sub2">%</th>`:'')+`</tr></thead><tbody>`;
 MORDER.forEach(m=>{
  const a=x.now[m],b=x.saf?x.saf[m]:null,r=x.rev?x.rev[m]:null,pS=pct(a,b),pR=pct(a,r);
  h+=`<tr><td class="q-l"><b>${esc(mName(m))}</b><small>${esc(lvU(m))} · ${esc(T('var. em','chg. in'))} ${esc(dU(m))}</small></td>`+
   `<td>${lvf(m,b)}</td>`+(hasRev?`<td>${lvf(m,r)}</td>`:'')+`<td class="q-now"><b>${lvf(m,a)}</b></td>`+
   `<td class="${tone(pS,'saf')}">${dvf(m,dlt(a,b))}</td><td class="${tone(pS,'saf')}">${pcf(pS,'saf')}</td>`+
   (hasRev?`<td class="${tone(pR,'rev')}">${dvf(m,dlt(a,r))}</td><td class="${tone(pR,'rev')}">${pcf(pR,'rev')}</td>`:'')+`</tr>`;
 });
 return h+`</tbody></table></div>`;
}
function ponteBars(p){
 const rows=[[T('Área','Area'),p.ea,0],[T('Produtividade','Yield'),p.ey,0],[T('Total','Total'),p.tot,1]];
 const mx=Math.max(...rows.map(r=>Math.abs(r[1])),1e-9);
 return `<div class="q-pb">${rows.map(([l,v,tot])=>{const w=Math.min(50,Math.abs(v)/mx*50);
  const cls=tot?'q-pb-tot':v>=0?'q-pb-up':'q-pb-dn';
  return `<div class="q-pb-r"><span>${esc(l)}</span><span class="q-pb-tr"><i class="${cls}" style="${v>=0?'left':'right'}:50%;width:${w.toFixed(2)}%"></i></span><b class="${tot?'':(v>=0?'q-up':'q-down')}">${sgn(v,1)}</b></div>`;}).join('')}</div>`;
}
function noRevNote(k){const p=prv();
 return T(`Sem projeção de ${k.sf} em ${p?vName(p):'publicação anterior'}. A coluna de revisão entra a partir do próximo levantamento.`,
          `No ${k.sf} projection in the ${p?vName(p):'prior release'}. The revision column starts with the next survey.`);}
function leitura(k,g){
 const x=cmp(k,g);if(!x)return '';
 const blk=(tit,base,kind)=>{const p=ponte(base,x.now);if(!p)return '';
  const res=Math.abs(p.res)>=0.05?`, ${T('resíduo','residual')} ${sgn(p.res,1)}`:'';
  return `<div class="q-rd"><div class="q-rd-h">${esc(tit)}</div>`+
   `<div class="q-rd-v ${tone(p.pct,kind)}">${sgn(p.tot,1)} ${esc(dU('prod'))} <span>(${pcf(p.pct,kind)})</span></div>`+
   `<div class="q-rd-t">${esc(T('Área','Area'))} ${sgn(p.ea,1)}, ${esc(T('produtividade','yield'))} ${sgn(p.ey,1)}${esc(res)} ${esc(dU('prod'))}.</div>`+
   (Math.abs(p.pct)>=PONTE_MIN?ponteBars(p):`<div class="q-rd-n">${esc(T('Abaixo de 0,5% do nível: sem gráfico.','Below 0.5% of level: no chart.'))}</div>`)+`</div>`;};
 const out=[];
 if(k.p&&x.rev)out.push(blk(T('Revisão','Revision')+' '+vShort(k.v)+' vs '+vShort(k.p),x.rev,'rev'));
 if(k.sa&&x.saf)out.push(blk(k.sf+' vs '+k.sa,x.saf,'saf'));
 const note=(k.p&&x.rev)?'':`<div class="q-note">${esc(noRevNote(k))}</div>`;
 return `<div class="q-reads">${out.join('')}</div>${note}`;
}

/* ── trajetória por publicação: só aparece com 3 ou mais publicações da mesma safra ── */
function trajCard(k,g){
 const rels=VV.filter(v=>rec(v,k.c,k.sf,g));
 if(rels.length<3)return '';
 const M=rels.map(v=>metr(v,k.c,k.sf,g));
 let h=`<div class="q-card q-trajcard"><div class="q-card-h"><div><div class="q-card-t">${esc(T('Trajetória por publicação','Estimate path by release'))} · ${esc(cropName(k.c))} · ${esc(geoName(g))}</div>`+
  `<div class="q-card-s">${esc(T(`${rels.length} publicações da safra ${k.sf} · abaixo de cada valor, a revisão contra a publicação anterior`,`${rels.length} releases for crop year ${k.sf} · below each value, the revision against the prior release`))}</div></div>`+
  `<div class="q-tools" data-noexport><button type="button" class="q-btn" data-q-png="${esc(k.c+'_'+g+'_trajetoria')}">PNG 3×</button></div></div>`+
  `<div class="q-scroll"><table class="q-table q-traj"><thead><tr><th class="q-l">${esc(geoName(g))}</th>`+
  rels.map((v,i)=>`<th class="${i===rels.length-1?'q-now':''}">${esc(vShort(v))}<small>${esc(v.kind==='perspectivas'?T('perspectivas','outlook'):T('levantamento','survey'))}</small></th>`).join('')+
  `<th>${esc(T('Acumulado','Cumulative'))}<small>${esc(vShort(rels[rels.length-1]))} vs ${esc(vShort(rels[0]))}</small></th><th>%<small>&nbsp;</small></th></tr></thead><tbody>`;
 MORDER.forEach(m=>{
  h+=`<tr><td class="q-l"><b>${esc(mName(m))}</b><small>${esc(lvU(m))} · ${esc(T('rev. em','rev. in'))} ${esc(dU(m))}</small></td>`;
  M.forEach((x,i)=>{const a=x?x[m]:null,b=i&&M[i-1]?M[i-1][m]:null,p=pct(a,b);
   h+=`<td class="${i===M.length-1?'q-now':''}">${i===M.length-1?'<b>'+lvf(m,a)+'</b>':lvf(m,a)}${i?`<small class="q-step ${tone(p,'rev')}">${dvf(m,dlt(a,b))}</small>`:''}</td>`;});
  const a=M[M.length-1]?M[M.length-1][m]:null,b=M[0]?M[0][m]:null,p=pct(a,b);
  h+=`<td class="${tone(p,'rev')}">${dvf(m,dlt(a,b))}</td><td class="${tone(p,'rev')}">${pcf(p,'rev')}</td></tr>`;
 });
 return h+`</tbody></table></div></div>`;
}

/* ── tabela por UF: valores e variações; barras em escala fixa ── */
function ufRows(k,m,reg){
 let ufs=Object.keys((k.v.records[k.c]||{})[k.sf]||{}).filter(isUF);
 if(reg&&REG_UF[reg])ufs=ufs.filter(u=>REG_UF[reg].includes(u));
 return ufs.map(u=>{const x=cmp(k,u);if(!x)return null;
  if(!(x.now.prod>0)&&!(x.saf&&x.saf.prod>0))return null;
  const a=x.now[m],b=x.saf?x.saf[m]:null,r=x.rev?x.rev[m]:null;
  return {u,size:x.now.prod||0,a,dS:dlt(a,b),pS:pct(a,b),dR:dlt(a,r),pR:pct(a,r)};}).filter(Boolean);
}
function bar(p,k){if(p==null)return '<span class="q-bar q-bar-na"></span>';
 const w=Math.min(1,Math.abs(p)/SC[k])*50,sat=Math.abs(p)>SC[k],cls=Math.abs(p)<EPS[k]?'q-bf':p>0?'q-bu':'q-bd';
 return `<span class="q-bar" title="${esc(pcf(p,k))}"><i class="${cls}${sat?' q-sat':''}" style="${p>=0?'left':'right'}:50%;width:${w.toFixed(2)}%"></i></span>`;}
function sortRows(rows,st){const key=st.sort||'size',dir=st.dir||-1;
 const val=r=>key==='size'?r.size:key==='a'?r.a:Math.abs(r[key]==null?-1:r[key]);
 return rows.slice().sort((x,y)=>{const a=val(x),b=val(y);if(a==null&&b==null)return 0;if(a==null)return 1;if(b==null)return -1;return (a-b)*dir;});}
function ufCard(k,st,opts){
 opts=opts||{};const m=st.metric||'prod',hasRev=!!k.p;
 const reg=REG_UF[st.geo]?st.geo:null,hl=isUF(st.geo)?st.geo:null;
 const rows=sortRows(ufRows(k,m,reg),st),n=rows.length;
 let show=(st.all||opts.all)?rows:rows.slice(0,TOPN);
 if(hl&&!show.find(r=>r.u===hl)){const r=rows.find(r=>r.u===hl);if(r)show=show.concat([r]);}
 const ar=key=>st.sort===key?`<span class="q-ar">${(st.dir||-1)<0?'▾':'▴'}</span>`:'';
 const th=(key,lbl,sub)=>`<th data-q-sort="${key}">${esc(lbl)}${ar(key)}${sub?`<small>${esc(sub)}</small>`:''}</th>`;
 const seg=MORDER.map(x=>`<button type="button" data-q-metric="${x}" class="${x===m?'on':''}">${esc(mName(x))}</button>`).join('');
 const title=T('Estados','States')+' · '+mName(m)+(reg?' · '+geoName(reg):'');
 let h=`<div class="q-card q-ufcard"><div class="q-card-h"><div><div class="q-card-t">${esc(cropName(k.c))} · ${esc(title)}</div>`+
  `<div class="q-card-s">${esc(k.sf)} · ${esc(vName(k.v))}${hasRev?' · '+esc(T('revisão vs','revision vs'))+' '+esc(vShort(k.p)):''}</div></div>`+
  `<div class="q-tools" data-noexport><div class="q-seg">${seg}</div><button type="button" class="q-btn" data-q-csv>CSV</button><button type="button" class="q-btn" data-q-png="${esc(k.c+'_estados_'+m+(reg?'_'+reg:''))}">PNG 3×</button></div></div>`;
 if(!n)return h+`<div class="q-empty">${esc(T('Sem dados estaduais para esta cultura.','No state data for this crop.'))}</div></div>`;
 h+=`<div class="q-scroll"><table class="q-table q-uf"><thead><tr>`+
  th('size',T('UF','State'),'')+th('a',T('Atual','Current'),lvU(m))+
  (hasRev?th('dR',T('Revisão','Revision'),dU(m))+th('pR','%','')+`<th class="q-bh"><small>${esc(T('escala','scale'))} ±${SC.rev}%</small></th>`:'')+
  th('dS','vs '+(k.sa||''),dU(m))+th('pS','%','')+`<th class="q-bh"><small>${esc(T('escala','scale'))} ±${SC.saf}%</small></th>`+
  `</tr></thead><tbody>`;
 show.forEach(r=>{
  h+=`<tr class="${r.u===hl?'q-hl':''}"><td class="q-l"><b>${r.u}</b><small>${esc(ufNome(r.u))}</small></td><td class="q-now">${lvf(m,r.a)}</td>`+
   (hasRev?`<td class="${tone(r.pR,'rev')}">${dvf(m,r.dR)}</td><td class="${tone(r.pR,'rev')}">${pcf(r.pR,'rev')}</td><td class="q-bc">${bar(r.pR,'rev')}</td>`:'')+
   `<td class="${tone(r.pS,'saf')}">${dvf(m,r.dS)}</td><td class="${tone(r.pS,'saf')}">${pcf(r.pS,'saf')}</td><td class="q-bc">${bar(r.pS,'saf')}</td></tr>`;
 });
 const sk=st.sort||'size',ordTxt=sk==='size'?T('Ordem: produção da UF.','Order: state production.'):sk==='a'?T('Ordem: valor atual.','Order: current value.'):
  (sk==='dR'||sk==='pR')?T('Ordem: maiores revisões em valor absoluto.','Order: largest revisions in absolute terms.'):T('Ordem: maiores variações vs safra anterior em valor absoluto.','Order: largest changes vs previous crop in absolute terms.');
 h+=`</tbody></table></div><div class="q-foot"><span>${esc(ordTxt)} ${esc(T('Barra cheia indica valor acima da escala.','A full bar means the value exceeds the scale.'))} <span data-noexport>${esc(T('Clique no cabeçalho para reordenar.','Click a header to re-sort.'))}</span></span>`+
  (n>TOPN&&!opts.all?`<button type="button" class="q-more" data-q-all data-noexport>${esc(st.all?T('Mostrar só os 8 maiores','Show top 8 only'):T(`Ver os ${n} estados`,`Show all ${n} states`))}</button>`:'')+`</div></div>`;
 return h;
}
function srcText(){const v=cur(),p=prv();
 return `${esc(T('Fonte: Conab','Source: Conab'))}, ${esc(vName(v))}${v.published_at?' ('+esc(dBR(v.published_at))+')':''}${p?' '+esc(T('e','and'))+' '+esc(vName(p)):''}. ${esc(T('Revisão positiva indica oferta estimada maior, não direção de preço.','A positive revision means higher estimated supply, not price direction.'))}`;}
function srcLine(){return `<div class="q-src">${srcText()}</div>`;}

/* ── telas das culturas ── */
const SCREENS={soja:'Soja',milho:'Milho 2ª',sorgo:'Sorgo',trigo:'Trigo',algodao:'Algodão',arroz:'Arroz',feijao:'Feijão 1ª'};
const MSUBC={m1:'Milho 1ª',m2:'Milho 2ª',m3:'Milho 3ª',mt:'Milho Total'};
const ST={};
const stOf=id=>ST[id]||(ST[id]={geo:'BR',metric:'prod',sort:'size',dir:-1,all:false});
function cropOf(id){if(id!=='milho')return SCREENS[id];const b=document.querySelector('#milho-sub button.active');return MSUBC[(b&&b.dataset.msub)||'m2'];}
function renderCulture(id){
 const root=document.getElementById('rev-'+id);if(!root)return;
 const c=cropOf(id),k=ctx(c),st=stOf(id);
 if(!k){root.innerHTML='';return;}
 if(st.geo!=='BR'&&!rec(k.v,c,k.sf,st.geo))st.geo='BR';
 const sub=T('Safra','Crop year')+' '+k.sf+' · '+vName(k.v)+(k.v.published_at?' ('+dBR(k.v.published_at)+')':'')+
  (k.p?' '+T('contra','against')+' '+vName(k.p)+' '+T('e safra','and crop year')+' '+k.sa:(k.sa?' '+T('contra safra','against crop year')+' '+k.sa:''));
 root.innerHTML=`<div class="q-head"><div><h2>${esc(T('Estimativas Conab','Conab estimates'))} · ${esc(cropName(c))}</h2><div class="q-sub">${esc(sub)}</div></div>`+
  `<div class="q-tools"><label>${esc(T('UF / Região','State / Region'))}<select data-q-geo>${geoSelect(k,st.geo)}</select></label></div></div>`+
  `<div class="q-card q-maincard"><div class="q-card-h"><div><div class="q-card-t">${esc(cropName(c))} · ${esc(geoName(st.geo))}</div><div class="q-card-s">${esc(T('Produção, área e produtividade · Conab','Production, area and yield · Conab'))}</div></div>`+
  `<div class="q-tools" data-noexport><button type="button" class="q-btn" data-q-png="${esc(c+'_'+st.geo+'_quadro')}">PNG 3×</button></div></div>${mainTable(k,st.geo)}${leitura(k,st.geo)}</div>`+
  trajCard(k,st.geo)+ufCard(k,st)+srcLine();
}

/* ── Radar (tela Safras) ── */
const RS={tab:'panorama',crop:'Soja',geo:'BR',metric:'prod',sort:'size',dir:-1,all:true,nat:'prod'};
const NAT=[['Brasil Grãos',0],['Soja',0],['Milho Total',0],['Milho 1ª',1],['Milho 2ª',1],['Milho 3ª',1],['Sorgo',0],['Algodão',0],['Trigo',0],['Arroz',0],['Feijão Total',0],['Feijão 1ª',1]];
const NAT_NAME={'Brasil Grãos':['Grãos · total','Grains · total'],'Milho Total':['Milho · total','Corn · total'],'Milho 1ª':['1ª safra','1st crop'],'Milho 2ª':['2ª safra','2nd crop'],'Milho 3ª':['3ª safra','3rd crop'],'Algodão':['Algodão · pluma','Cotton · lint'],'Feijão Total':['Feijão · total','Beans · total'],'Feijão 1ª':['1ª safra','1st crop']};
const LINK={'Soja':['scr-soja'],'Milho Total':['scr-milho','mt'],'Milho 1ª':['scr-milho','m1'],'Milho 2ª':['scr-milho','m2'],'Milho 3ª':['scr-milho','m3'],'Sorgo':['scr-sorgo'],'Algodão':['scr-algodao'],'Trigo':['scr-trigo'],'Arroz':['scr-arroz'],'Feijão 1ª':['scr-feijao']};
const natName=c=>NAT_NAME[c]?T(NAT_NAME[c][0],NAT_NAME[c][1]):cropName(c);
function natTable(){
 const p=prv(),v=cur(),m=RS.nat||'prod';
 const seg=MORDER.map(x=>`<button type="button" data-q-nat="${x}" class="${x===m?'on':''}">${esc(mName(x))}</button>`).join('');
 let h=`<div class="q-card"><div class="q-card-h"><div><div class="q-card-t">${esc(mName(m))} ${esc(T('por cultura · Brasil','by crop · Brazil'))}</div>`+
  `<div class="q-card-s">${esc(vName(v))}${p?' · '+esc(T('revisão contra','revision against'))+' '+esc(vName(p)):''} · ${esc(T('componentes recuados sob o total','components indented under the total'))}</div></div>`+
  `<div class="q-tools" data-noexport><div class="q-seg">${seg}</div><button type="button" class="q-btn" data-q-png="${esc(m+'_por_cultura_Brasil')}">PNG 3×</button></div></div>`+
  `<div class="q-scroll"><table class="q-table q-nat"><thead><tr><th class="q-l" rowspan="2">${esc(T('Cultura','Crop'))}</th><th rowspan="2">${esc(T('Safra','Crop year'))}</th>`+
  `<th rowspan="2">${esc(T('Anterior','Previous'))}<small>${esc(lvU(m))}</small></th><th rowspan="2" class="q-now">${esc(T('Atual','Current'))}<small>${esc(lvU(m))}</small></th>`+
  `<th colspan="2" class="q-grp">${esc(T('vs safra anterior','vs previous crop'))}</th><th colspan="2" class="q-grp">${esc(T('Revisão','Revision'))} ${esc(vShort(v))}${p?' vs '+esc(vShort(p)):''}</th></tr>`+
  `<tr><th class="q-sub2">${esc(dU(m))}</th><th class="q-sub2">%</th><th class="q-sub2">${esc(dU(m))}</th><th class="q-sub2">%</th></tr></thead><tbody>`;
 NAT.forEach(([c,lvl])=>{const k=ctx(c);if(!k)return;const x=cmp(k,'BR');if(!x)return;
  const a=x.now[m],b=x.saf?x.saf[m]:null,r=x.rev?x.rev[m]:null,pS=pct(a,b),pR=pct(a,r),lk=LINK[c];
  const nm=lk?`<button type="button" class="q-lnk" data-go="${lk[0]}"${lk[1]?` data-msub="${lk[1]}"`:''}>${esc(natName(c))}</button>`:esc(natName(c));
  h+=`<tr class="${lvl?'q-child':''}${c==='Brasil Grãos'?' q-total':''}"><td class="q-l">${nm}</td><td>${esc(k.sf)}</td><td>${lvf(m,b)}</td><td class="q-now"><b>${lvf(m,a)}</b></td>`+
   `<td class="${tone(pS,'saf')}">${dvf(m,dlt(a,b))}</td><td class="${tone(pS,'saf')}">${pcf(pS,'saf')}</td>`+
   `<td class="${tone(pR,'rev')}">${dvf(m,dlt(a,r))}</td><td class="${tone(pR,'rev')}">${pcf(pR,'rev')}</td></tr>`;
 });
 return h+`</tbody></table></div><div class="q-foot"><span>${esc(T('n/d: cultura sem projeção na publicação anterior. Clique na cultura para abrir a tela.','n/a: crop not projected in the prior release. Click a crop to open its screen.'))}</span></div></div>`;
}
function annualBars(){
 const m=RS.nat||'prod';
 const list=['Brasil Grãos','Soja','Milho Total','Sorgo','Algodão','Trigo','Arroz','Feijão Total'].map(c=>{const k=ctx(c),x=k&&cmp(k,'BR');
  return x&&x.saf?{c,k,p:pct(x.now[m],x.saf[m]),d:dlt(x.now[m],x.saf[m])}:null;}).filter(o=>o&&o.p!=null).sort((a,b)=>b.p-a.p);
 const mx=Math.max(...list.map(o=>Math.abs(o.p)),1e-9);
 return `<div class="q-card"><div class="q-card-h"><div><div class="q-card-t">${esc(T('Variação anual','Annual change'))} · ${esc(mName(m))} · %</div>`+
  `<div class="q-card-s">${esc(T('Safra atual vs anterior · só totais, sem somar componentes','Current vs previous crop · totals only, components not added'))}</div></div>`+
  `<div class="q-tools" data-noexport><button type="button" class="q-btn" data-q-png="${esc('variacao_anual_'+m)}">PNG 3×</button></div></div>`+
  `<div class="q-ab">${list.map(o=>{const w=Math.min(50,Math.abs(o.p)/mx*50),cls=o.c==='Brasil Grãos'?'q-pb-tot':o.p>=0?'q-pb-up':'q-pb-dn';
   return `<div class="q-ab-r"><span class="q-ab-l">${esc(natName(o.c))} <small>${esc(o.k.sf)}</small></span><span class="q-pb-tr"><i class="${cls}" style="${o.p>=0?'left':'right'}:50%;width:${w.toFixed(2)}%"></i></span>`+
    `<span class="q-ab-v ${o.c==='Brasil Grãos'?'':tone(o.p,'saf')}">${pcf(o.p,'saf')}<small>${dvf(m,o.d)} ${esc(dU(m))}</small></span></div>`;}).join('')}</div></div>`;
}
function radarUF(){
 const crops=['Soja','Milho Total','Milho 1ª','Milho 2ª','Milho 3ª','Sorgo','Algodão','Trigo','Arroz','Feijão Total','Feijão 1ª'].filter(c=>ctx(c));
 if(!crops.includes(RS.crop))RS.crop=crops[0];
 const k=ctx(RS.crop);if(!REG_UF[RS.geo])RS.geo='BR';
 return `<div class="q-filters"><label>${esc(T('Cultura','Crop'))}<select data-q-crop>${crops.map(c=>`<option value="${esc(c)}"${c===RS.crop?' selected':''}>${esc(cropName(c))}</option>`).join('')}</select></label>`+
  `<label>${esc(T('Região','Region'))}<select data-q-geo>${geoSelect(k,RS.geo,true)}</select></label></div>`+ufCard(k,RS,{all:true});
}
function renderMain(){
 const wrap=document.getElementById('rev-main');if(!wrap)return;
 const tabs=[['panorama','Panorama','Overview'],['uf','Por UF','By state'],['antigo','Séries históricas','Historical series']];
 if(!tabs.some(t=>t[0]===RS.tab))RS.tab='panorama';
 let view='';
 if(RS.tab==='panorama')view=natTable()+annualBars();
 else if(RS.tab==='uf')view=radarUF();
 const v=cur(),p=prv();
 wrap.innerHTML=`<div class="q-head"><div><h2>${esc(T('Radar da safra · Conab','Crop radar · Conab'))}</h2><div class="q-sub">${esc(vName(v))}${v.published_at?' ('+esc(dBR(v.published_at))+')':''}${p?' '+esc(T('contra','against'))+' '+esc(vName(p)):''} ${esc(T('e safra anterior','and previous crop'))}</div></div>`+
  `<div class="q-tools"><button type="button" class="q-btn" data-rev-export="csv">${esc(T('CSV das publicações','Releases CSV'))}</button></div></div>`+
  `<div class="q-tabs">${tabs.map(([kk,pt,e])=>`<button type="button" data-q-tab="${kk}" class="${RS.tab===kk?'on':''}">${esc(T(pt,e))}</button>`).join('')}</div>`+
  view+(RS.tab==='antigo'?'':srcLine());
 const old=document.getElementById('grid-safras');if(old)old.style.display=RS.tab==='antigo'?'grid':'none';
}

/* ── exportações ── */
function pngNode(node,name){
 if(!node)return;
 const W=Math.ceil(node.getBoundingClientRect().width),K=3;
 const clone=node.cloneNode(true);clone.querySelectorAll('[data-noexport]').forEach(x=>x.remove());
 clone.style.margin='0';clone.style.boxShadow='none';clone.style.width=W+'px';clone.style.position='relative';
 const ft=document.createElement('div');ft.className='q-src q-src-x';ft.innerHTML=srcText();clone.appendChild(ft);
 const logo=typeof LOGO_HREF_get==='function'?LOGO_HREF_get():'';
 if(logo){const wm=document.createElement('img');wm.setAttribute('src',logo);wm.setAttribute('alt','');
  wm.setAttribute('style','position:absolute;left:50%;top:50%;width:150px;transform:translate(-50%,-50%);opacity:.25;pointer-events:none');clone.appendChild(wm);}
 const host=document.createElement('div');host.className='q26';host.setAttribute('data-noi18n','');host.style.cssText='position:absolute;left:-20000px;top:0;width:'+W+'px';
 host.appendChild(clone);document.body.appendChild(host);const H=Math.ceil(clone.getBoundingClientRect().height);host.remove();
 const cssEl=document.getElementById('brz-q26-style');
 const css=(cssEl?cssEl.textContent:'')+'*{box-sizing:border-box}';
 const wrap=`<div xmlns="http://www.w3.org/1999/xhtml" class="q26" style="width:${W}px;margin:0;background:#fff">`+new XMLSerializer().serializeToString(clone)+`</div>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css.replace(/</g,'\\3c ')}</style>${wrap}</div></foreignObject></svg>`;
 const img=new Image();
 img.onload=()=>{const cv=document.createElement('canvas');cv.width=W*K;cv.height=H*K;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);
  const a=document.createElement('a');a.download='BRZ_SAFRA_'+String(name||'quadro').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_')+'.png';a.href=cv.toDataURL('image/png');a.click();};
 img.onerror=()=>alert(T('Não foi possível gerar o PNG.','Could not generate the PNG.'));
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function csvUF(id){
 const st=id==='main'?RS:stOf(id),c=id==='main'?RS.crop:cropOf(id),k=ctx(c);if(!k)return;const m=st.metric||'prod';
 const rows=sortRows(ufRows(k,m,REG_UF[st.geo]?st.geo:null),st);
 const u=MET[m].lvU[0].replace(/\W+/g,'_').toLowerCase(),du=MET[m].dU[0].replace(/\W+/g,'_').toLowerCase();
 const out=[['cultura','safra','uf','nome','atual_'+u].concat(k.p?['revisao_'+du,'revisao_pct']:[],['vs_safra_anterior_'+du,'vs_safra_anterior_pct'])];
 const r4=v=>v==null?null:Math.round(v*1e4)/1e4;
 rows.forEach(r=>out.push([c,k.sf,r.u,ufNome(r.u),r4(r.a==null?null:MET[m].lv(r.a))].concat(k.p?[r4(r.dR==null?null:MET[m].dv(r.dR)),r4(r.pR)]:[],[r4(r.dS==null?null:MET[m].dv(r.dS)),r4(r.pS)])));
 if(typeof dl==='function'&&typeof csvText==='function')dl(('BRZ_SAFRA_estados_'+c+'_'+m).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_]+/g,'')+'.csv',csvText(out));
}
function exportRevisions(){let rows=[['publicacao','tipo','safra','cultura','uf','area_mil_ha','produt_kg_ha','producao_mil_t']];
 VV.forEach(v=>Object.entries(v.records).forEach(([c,ss])=>Object.entries(ss).forEach(([sf,geos])=>Object.entries(geos).forEach(([g,a])=>rows.push([v.label,v.kind,sf,c,g].concat(a.map(x=>x==null?null:String(x).replace('.',',')))))))); /* s29: decimal com vírgula para o Excel pt-BR */
 const csv='\ufeff'+rows.map(r=>r.map(x=>`"${String(x==null?'n/d':x).replace(/"/g,'""')}"`).join(';')).join('\r\n');
 const b=(typeof BUILD!=='undefined'?String(BUILD).split(' ')[0]:'s26');
 const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='BRZ_SAFRA_'+b+'_publicacoes.csv';a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}

/* ── Base · aba Levantamentos (idempotente, sobrevive ao EXPORTAR HTML) ── */
function addBaseVintages(){
 const tabs=document.getElementById('base-sub');if(!tabs)return;
 tabs.querySelectorAll('[data-bsub="lev"]').forEach(x=>x.remove());document.querySelectorAll('#pane-lev').forEach(x=>x.remove());
 const btn=document.createElement('button');btn.dataset.bsub='lev';btn.textContent=T('Levantamentos','Surveys');tabs.appendChild(btn);
 const pane=document.createElement('div');pane.id='pane-lev';pane.className='base-pane';pane.style.display='none';
 document.getElementById('scr-base').querySelector('.base-wrap').appendChild(pane);
 pane.innerHTML=`<div class="rev-wrap q26" style="width:auto;max-width:none;margin:8px 0"><div class="q-card"><div class="q-card-h"><div><div class="q-card-t">${esc(T('Publicações Conab incorporadas','Embedded Conab releases'))}</div>`+
  `<div class="q-card-s">${esc(T('Cada publicação guarda a safra nova e a safra anterior revisada, por UF e região.','Each release stores the new crop year and the revised previous one, by state and region.'))}</div></div></div>`+
  `<div class="q-scroll"><table class="q-table"><thead><tr><th class="q-l">${esc(T('Publicação','Release'))}</th><th>${esc(T('Tipo','Type'))}</th><th>${esc(T('Referência','Reference'))}</th><th>${esc(T('Publicada em','Published'))}</th><th>${esc(T('Culturas','Crops'))}</th></tr></thead><tbody>`+
  VV.map(v=>`<tr><td class="q-l"><b>${esc(vName(v))}</b></td><td>${esc(v.kind==='perspectivas'?T('perspectivas','outlook'):T('levantamento','survey'))}</td><td>${esc(vShort(v))}</td><td>${v.published_at?esc(dBR(v.published_at)):'n/d'}</td><td>${Object.keys(v.records).length}</td></tr>`).join('')+
  `</tbody></table></div><div class="q-foot"><span>${esc(T('Grãos total aparece só no levantamento de outubro, sem soma parcial de culturas.','Total grains appears only in the October survey, not as a partial sum of crops.'))}</span></div></div></div>`;
 btn.onclick=()=>{tabs.querySelectorAll('button').forEach(t=>t.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('#scr-base .base-pane').forEach(x=>x.style.display='none');pane.style.display='block';};
 tabs.querySelectorAll('button:not([data-bsub="lev"])').forEach(x=>x.addEventListener('click',()=>{pane.style.display='none';}));
}

/* ── ciclo de vida ── */
function refreshAll(){renderMain();Object.keys(SCREENS).forEach(renderCulture);addBaseVintages();}
function rootId(el){const r=el&&el.closest('[data-q-root]');return r?r.dataset.qRoot:null;}
function rerender(id){if(id==='main')renderMain();else renderCulture(id);}
function init(){
 if(!VV.length)return;
 const ss=document.getElementById('scr-safras');if(!ss)return;
 document.querySelectorAll('.rev-wrap[data-rev-init]').forEach(p=>p.remove());
 const main=document.createElement('div');main.id='rev-main';main.className='rev-wrap q26';main.dataset.revInit='1';main.dataset.qRoot='main';
 ss.insertBefore(main,ss.querySelector('#grid-safras'));renderMain();
 Object.keys(SCREENS).forEach(id=>{const el=document.getElementById('scr-'+id),grid=el&&el.querySelector('.grid2');if(!grid)return;
  const d=document.createElement('div');d.className='rev-wrap rev-culture q26';d.id='rev-'+id;d.dataset.revInit='1';d.dataset.qRoot=id;el.insertBefore(d,grid);renderCulture(id);});
 addBaseVintages();
 document.addEventListener('change',e=>{const id=rootId(e.target);if(!id)return;
  if(e.target.matches('[data-q-crop]')){RS.crop=e.target.value;renderMain();return;}
  if(e.target.matches('[data-q-geo]')){(id==='main'?RS:stOf(id)).geo=e.target.value;rerender(id);}
 });
 document.addEventListener('click',e=>{const t=e.target;
  const tb=t.closest('[data-q-tab]');if(tb){RS.tab=tb.dataset.qTab;renderMain();return;}
  const nb=t.closest('[data-q-nat]');if(nb){RS.nat=nb.dataset.qNat;renderMain();return;}
  if(t.closest('[data-rev-export="csv"]')){exportRevisions();return;}
  const pb=t.closest('[data-q-png]');if(pb){pngNode(pb.closest('.q-card'),pb.dataset.qPng);return;}
  const id=rootId(t);
  if(id){const st=id==='main'?RS:stOf(id);
   const mb=t.closest('[data-q-metric]');if(mb){st.metric=mb.dataset.qMetric;rerender(id);return;}
   const sb=t.closest('th[data-q-sort]');if(sb){const key=sb.dataset.qSort;if(st.sort===key)st.dir=-(st.dir||-1);else{st.sort=key;st.dir=-1;}rerender(id);return;}
   if(t.closest('[data-q-all]')){st.all=!st.all;rerender(id);return;}
   if(t.closest('[data-q-csv]')){csvUF(id);return;}
  }
  if(t.closest('[data-msub]'))setTimeout(()=>renderCulture('milho'),0);
  if(t.closest('#lang-switch [data-lang]'))setTimeout(refreshAll,15);
 });
 window.BRZREV={state:RS,cultures:ST,ctx,cmp,renderMain,renderCulture,refresh:refreshAll,init};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
