
/* ═══════════ BRZ SAFRA s30 · Indicadores ═══════════
   Dez leituras calculadas sobre as bases do arquivo (Conab semanal, Série Histórica, publicações,
   balanço, DERAL e IMEA). Nada é digitado aqui: tudo recalcula quando a Base muda.
   Números de tela em pt-BR (a camada i18n converte para EN); gráficos usam o motor dinâmico nativo. */
(function(){
'use strict';
const C=window.C;
const en=()=>document.documentElement.lang==='en';
const T=(pt,e)=>en()?e:pt;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const nf=(v,d)=>{if(v==null||!isFinite(v))return 'n/d';let s=Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});if(/^-0(,0+)?$/.test(s))s=s.slice(1);return s.replace(/^-/,'−');};
const nfL=(v,d)=>{if(v==null||!isFinite(v))return 'n/d';let s=Number(v).toLocaleString(en()?'en-US':'pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});if(/^-0([.,]0+)?$/.test(s))s=s.slice(1);return s.replace(/^-/,'−');};
const sg=(v,d)=>{if(v==null||!isFinite(v))return 'n/d';const r=Number(v.toFixed(d));return (r===0?'':r>0?'+':'−')+nf(Math.abs(r),d);};
const dBR=iso=>{const p=String(iso||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0].slice(2):String(iso||'');};
const dDM=iso=>{const p=String(iso||'').split('-');return p.length===3?p[2]+'/'+p[1]:String(iso||'');};
const dL=iso=>{const p=String(iso||'').split('-');if(p.length!==3)return String(iso||'');return en()?p[1]+'/'+p[2]+'/'+p[0].slice(2):p[2]+'/'+p[1]+'/'+p[0].slice(2);};
const MESC=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],MES_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const UFN=(C.meta&&C.meta.ufNome)||{},N2S={};Object.entries(UFN).forEach(([s,n])=>{N2S[n]=s;});
const sig=u=>u==='BR'?'BR':(N2S[u]||u);
const geoLbl=u=>u==='BR'?T('Brasil','Brazil'):sig(u);
const CROPN={'Soja':['Soja','Soybeans'],'Milho 1ª':['Milho 1ª','1st-crop corn'],'Milho 2ª':['Milho 2ª','2nd-crop corn'],'Milho 3ª':['Milho 3ª','3rd-crop corn'],'Milho Total':['Milho total','Total corn'],'Trigo':['Trigo','Wheat'],'Algodão':['Algodão','Cotton'],'Arroz':['Arroz','Rice'],'Feijão 1ª':['Feijão 1ª','1st-crop beans'],'Feijão Total':['Feijão total','Total beans'],'Sorgo':['Sorgo','Sorghum'],'Brasil Grãos':['Grãos total','Total grains']};
const cropN=c=>CROPN[c]?T(CROPN[c][0],CROPN[c][1]):c;
const opN=o=>o==='Semeadura'?T('Plantio','Planting'):T('Colheita','Harvest');
const tone=(x,eps)=>x==null||!isFinite(x)?'in-na':Math.abs(x)<eps?'in-flat':x>0?'in-up':'in-down';
const has=c=>typeof temProg==='function'&&temProg(c);

/* ── núcleo de cálculo ── */
const seasonsOf=(cult,oper)=>Object.keys(C.prog[cult]||{}).filter(s=>C.prog[cult][s][oper]).sort((a,b)=>parseInt(a,10)-parseInt(b,10));
function pctAt(cult,s,oper,uf,x){
  const ser=serieProg(cult,s,oper,uf);if(!ser.length)return null;
  if(x<ser[0].x)return ser[0].v<=10?0:null;
  return pctNaSemana(cult,s,oper,uf,x);
}
function avg5(cult,oper,uf,x,sf){
  const prev=seasonsOf(cult,oper).filter(s=>parseInt(s,10)<parseInt(sf,10)).slice(-5);
  const vs=prev.map(s=>pctAt(cult,s,oper,uf,x)).filter(v=>v!=null);
  return vs.length>=3?vs.reduce((a,b)=>a+b,0)/vs.length:null;
}
function prevSeason(cult,oper,sf){const ss=seasonsOf(cult,oper);const i=ss.indexOf(sf);return i>0?ss[i-1]:null;}
function curSeason(cult,oper){return (typeof safraDaOper==='function'?safraDaOper(cult,oper):null)||seasonsOf(cult,oper).slice(-1)[0];}
function ufList(cult,sf,oper){return Object.keys((((C.prog[cult]||{})[sf]||{})[oper])||{}).filter(u=>u!=='BR').sort((a,b)=>sig(a).localeCompare(sig(b)));}
function lastBR(cult,sf,oper){const s=serieProg(cult,sf,oper,'BR');return s.length?s[s.length-1]:null;}
function yieldKg(cult,sf,u){
  const k=sig(u),h=C.hist[cult];
  if(h){const i=histIdx(cult,sf);if(i>=0){const v=((h.produt||{})[k]||[])[i];if(v!=null&&v>0)return v;}}
  const VV=C.vintages||[];for(let j=VV.length-1;j>=0;j--){const r=((((VV[j].records||{})[cult]||{})[sf])||{})[k];if(r&&r[1]>0)return r[1];if(r&&r[0]>0&&r[2]>0)return r[2]/r[0]*1000;}
  return null;
}
function prodMil(cult,sf,u){const v=typeof prodDe==='function'?prodDe(cult,sf,u):null;if(v!=null)return v;
  const VV=C.vintages||[];for(let j=VV.length-1;j>=0;j--){const r=((((VV[j].records||{})[cult]||{})[sf])||{})[sig(u)];if(r&&r[2]!=null)return r[2];}return null;}

/* ── estado e gráficos ── */
const S={tab:'semana',cult:'Soja',oper:null,ofCult:'Soja',ofUf:'BR',ypCult:'Soja',ypGeo:'BR',revM:'prod'};
let CH=[];
function dropCharts(){CH.forEach(o=>{try{o.ro.disconnect();o.ch.dispose();}catch(e){}});CH=[];}
function mount(id,opt){const el=document.getElementById(id);if(!el||!window.echarts)return;const ch=window.echarts.init(el);ch.setOption(opt,true);const ro=new ResizeObserver(()=>ch.resize());ro.observe(el);CH.push({ch,ro});}
const card=(id,title,sub,body,acts)=>'<section class="in-card" id="'+id+'"><div class="in-ch"><div><h3>'+esc(title)+'</h3><div class="in-sub">'+esc(sub)+'</div></div>'+(acts?'<div class="in-acts" data-noexport>'+acts+'</div>':'')+'</div>'+body+'</section>';
const pngBtn=(id,name)=>'<button type="button" class="in-btn" data-in-png="'+id+'" data-name="'+esc(name)+'">PNG 3×</button>';

/* 10 · Semana em números */
function semanaData(){
  const out={};const cult='Soja',oper='Semeadura',sf=curSeason(cult,oper),last=lastBR(cult,sf,oper);
  if(last){const ser=serieProg(cult,sf,oper,'BR'),prev=ser.length>1?ser[ser.length-2]:null,ps=prevSeason(cult,oper,sf);
    out.soja={sf,d:last.d,v:last.v,dw:prev?last.v-prev.v:null,avg:avg5(cult,oper,'BR',last.x,sf),ano1:ps?pctAt(cult,ps,oper,'BR',last.x):null};
    const ufs=['Mato Grosso','Paraná','Goiás','Mato Grosso do Sul','Rio Grande do Sul','Bahia','Minas Gerais','Maranhão','Tocantins','Piauí','Santa Catarina','São Paulo'];
    const rows=ufs.map(u=>{const v=pctAt(cult,sf,oper,u,last.x),a=avg5(cult,oper,u,last.x,sf);return v!=null&&a!=null?{u,v,a,dd:v-a}:null;}).filter(Boolean);
    rows.forEach(r=>{r.p1=ps?pctAt(cult,ps,oper,r.u,last.x):null;});
    rows.sort((a,b)=>b.dd-a.dd);out.ufTop=rows[0];out.ufLow=rows[rows.length-1];out.ufVal=rows.find(r=>r.u==='Mato Grosso');out.rowsUF=rows;}
  [['Milho 1ª','Semeadura','m1'],['Trigo','Colheita','tr']].forEach(([c,o,k])=>{if(!has(c))return;const s=curSeason(c,o),l=lastBR(c,s,o);if(!l)return;
    if(typeof opAtiva==='function'&&opAtiva(c)!==o)return;out[k]={c,o,sf:s,d:l.d,v:l.v,avg:avg5(c,o,'BR',l.x,s)};});
  const VV=C.vintages||[],v1=VV[VV.length-1],v0=VV.length>1?VV[VV.length-2]:null;
  const rv=c=>{if(!v1)return null;const ss=Object.keys((v1.records||{})[c]||{}).sort((a,b)=>parseInt(a)-parseInt(b)),s=ss[ss.length-1],a=(((v1.records[c]||{})[s]||{}).BR||[])[2],b=v0?((((v0.records||{})[c]||{})[s]||{}).BR||[])[2]:null;return a==null?null:{c,s,a,b,d:b==null?null:a-b};};
  out.rev={v1,v0,soja:rv('Soja'),milho:rv('Milho Total'),graos:rv('Brasil Grãos')};
  const im=(C.imeaMT&&C.imeaMT.plantio||[]).filter(x=>x.cultura==='Soja').sort((a,b)=>a.data<b.data?-1:1).pop();if(im)out.imea=im;
  const dh=((C.deralPR&&C.deralPR.historico)||[]).filter(x=>x.cultura==='Soja'&&(x.oper||'Semeadura')==='Semeadura').sort((a,b)=>a.data<b.data?-1:1).pop();if(dh)out.deral=dh;
  return out;
}
function vsAvgTxt(dd,avg){
  if(Math.abs(dd)<1)return T('em linha com a média de cinco safras ('+nf(avg,1)+'%)','in line with the five-year average ('+nf(avg,1)+'%)');
  return dd>0?T(nf(dd,1)+' p.p. acima da média de cinco safras ('+nf(avg,1)+'%)',nf(dd,1)+' p.p. above the five-year average ('+nf(avg,1)+'%)')
             :T(nf(-dd,1)+' p.p. abaixo da média de cinco safras ('+nf(avg,1)+'%)',nf(-dd,1)+' p.p. below the five-year average ('+nf(avg,1)+'%)');
}
function vsPrevTxt(v,prev,sf){const pl=prevLbl(sf);
  if(Math.abs(v-prev)<1)return T('igual a '+pl+' ('+nf(prev,1)+'%)','level with '+pl+' ('+nf(prev,1)+'%)');
  return v>prev?T('à frente de '+pl+' ('+nf(prev,1)+'%)','ahead of '+pl+' ('+nf(prev,1)+'%)'):T('atrás de '+pl+' ('+nf(prev,1)+'%)','behind '+pl+' ('+nf(prev,1)+'%)');
}
const MESP=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const vLbl=v=>{if(!v)return '';const p=String(v.reference_month||'').split('-');return p.length>1?(en()?MES_EN[+p[1]-1]:MESP[+p[1]-1])+'/'+p[0].slice(2):v.id;};
function semanaTexto(){
  const D=semanaData(),p=[];
  if(D.soja){const s=D.soja;
    p.push(T('Soja: plantio em '+nf(s.v,1)+'% da área até '+dBR(s.d)+(s.dw!=null?', avanço de '+nf(s.dw,1)+' p.p. na semana':'')+'.',
             'Soybeans: planting at '+nf(s.v,1)+'% of area through '+dBR(s.d)+(s.dw!=null?', up '+nf(s.dw,1)+' p.p. in the week':'')+'.'));
    if(s.avg!=null)p.push(T('Ritmo ','Pace ')+vsAvgTxt(s.v-s.avg,s.avg)+(s.ano1!=null?T(' e ',' and ')+vsPrevTxt(s.v,s.ano1,s.sf):'')+'.');
    if(D.ufTop&&D.ufLow&&D.ufTop.u!==D.ufLow.u)p.push(T(sig(D.ufTop.u)+' é o mais adiantado contra a média, com '+nf(D.ufTop.v,1)+'% ('+sg(D.ufTop.dd,1)+' p.p.); '+sig(D.ufLow.u)+', o mais atrasado, com '+nf(D.ufLow.v,1)+'% ('+sg(D.ufLow.dd,1)+' p.p.).',
                                                         sig(D.ufTop.u)+' is furthest ahead of its average at '+nf(D.ufTop.v,1)+'% ('+sg(D.ufTop.dd,1)+' p.p.); '+sig(D.ufLow.u)+' lags most at '+nf(D.ufLow.v,1)+'% ('+sg(D.ufLow.dd,1)+' p.p.).'));}
  if(D.m1)p.push(T('Milho verão em '+nf(D.m1.v,1)+'% plantado'+(D.m1.avg!=null?', contra '+nf(D.m1.avg,1)+'% na média':'')+'.','Summer corn '+nf(D.m1.v,1)+'% planted'+(D.m1.avg!=null?', against a '+nf(D.m1.avg,1)+'% average':'')+'.'));
  if(D.tr)p.push(T('Trigo: colheita em '+nf(D.tr.v,1)+'%'+(D.tr.avg!=null?', contra '+nf(D.tr.avg,1)+'% na média':'')+'.','Wheat: harvest at '+nf(D.tr.v,1)+'%'+(D.tr.avg!=null?', against a '+nf(D.tr.avg,1)+'% average':'')+'.'));
  const R=D.rev;
  if(R&&R.soja){const rv=x=>x.d==null?'':' ('+sg(x.d,1)+T(' mil t contra ',' kt vs ')+vLbl(R.v0)+')';const rs=x=>x.d==null?'':' ('+sg(x.d,1)+T(' mil t',' kt')+')';
    p.push(T('Conab '+vLbl(R.v1)+': soja em '+nf(R.soja.a/1000,2)+' Mi t'+rv(R.soja)+(R.milho?' e milho total em '+nf(R.milho.a/1000,2)+' Mi t'+rs(R.milho):'')+'.',
             'Conab '+vLbl(R.v1)+': soybeans at '+nf(R.soja.a/1000,2)+' Mmt'+rv(R.soja)+(R.milho?' and total corn at '+nf(R.milho.a/1000,2)+' Mmt'+rs(R.milho):'')+'.'));}
  const st=[];if(D.imea)st.push(T('no MT, o IMEA marca '+nf(D.imea.pct,2)+'% plantado ('+dBR(D.imea.data)+')','in MT, IMEA shows '+nf(D.imea.pct,2)+'% planted ('+dBR(D.imea.data)+')'));
  if(D.deral)st.push(T('no PR, o DERAL aponta '+nf(D.deral.pct,0)+'% ('+dBR(D.deral.data)+')','in PR, DERAL shows '+nf(D.deral.pct,0)+'% ('+dBR(D.deral.data)+')'));
  if(st.length){const s=st.join('; ');p.push(s.charAt(0).toUpperCase()+s.slice(1)+'.');}
  return {txt:p.join(' '),D};
}
function prevLbl(sf){const a=parseInt(sf,10);return (a-1)+'/'+String(a).slice(2);}
function semanaView(){
  const {txt,D}=semanaTexto();const kp=(l,v,s)=>'<div class="in-kpi"><span>'+esc(l)+'</span><b>'+esc(v)+'</b><small>'+esc(s||'')+'</small></div>';
  const k=[];
  if(D.soja)k.push(kp(T('Soja · plantio Brasil','Soybeans · planting Brazil'),nf(D.soja.v,1)+'%',T('até ','through ')+dBR(D.soja.d)+(D.soja.avg!=null?' · '+T('média ','avg ')+nf(D.soja.avg,1)+'%':'')));
  if(D.ufVal)k.push(kp(T('Soja · MT (Conab)','Soybeans · MT (Conab)'),nf(D.ufVal.v,1)+'%',sg(D.ufVal.dd,1)+' p.p. '+T('vs média','vs avg')));
  if(D.m1)k.push(kp(T('Milho verão · plantio','Summer corn · planting'),nf(D.m1.v,1)+'%',D.m1.avg!=null?T('média ','avg ')+nf(D.m1.avg,1)+'%':''));
  if(D.tr)k.push(kp(T('Trigo · colheita','Wheat · harvest'),nf(D.tr.v,1)+'%',D.tr.avg!=null?T('média ','avg ')+nf(D.tr.avg,1)+'%':''));
  if(D.rev&&D.rev.soja)k.push(kp(T('Soja · Conab','Soybeans · Conab'),nf(D.rev.soja.a/1000,2)+' Mi t',D.rev.soja.d!=null?sg(D.rev.soja.d,1)+T(' mil t na revisão',' kt revision'):''));
  let ufT='';
  if(D.rowsUF&&D.rowsUF.length){ufT='<div class="in-scroll"><table class="in-t"><thead><tr><th class="in-l">UF</th><th>'+esc(T('Plantio','Planting'))+'<small>%</small></th><th>'+esc(T('Média 5 safras','5-year avg'))+'<small>%</small></th><th>'+esc(T('vs média','vs avg'))+'<small>p.p.</small></th><th>'+esc(prevLbl(D.soja.sf))+'<small>%</small></th><th>'+esc(T('vs safra anterior','vs previous year'))+'<small>p.p.</small></th></tr></thead><tbody>'+
    D.rowsUF.map(r=>'<tr><td class="in-l"><b>'+esc(sig(r.u))+'</b> <small>'+esc(r.u)+'</small></td><td><b>'+esc(nf(r.v,1))+'</b></td><td>'+esc(nf(r.a,1))+'</td><td class="'+tone(r.dd,1)+'">'+esc(sg(r.dd,1))+'</td><td>'+esc(r.p1==null?'n/d':nf(r.p1,1))+'</td><td class="'+tone(r.p1==null?null:r.v-r.p1,1)+'">'+esc(r.p1==null?'n/d':sg(r.v-r.p1,1))+'</td></tr>').join('')+'</tbody></table></div>';}
  return card('in-semana',T('Semana em números','The week in numbers'),T('Texto gerado a partir das bases do arquivo, no padrão da mesa; copie e cole no relatório','Text generated from the file databases in desk style; copy it into the report'),
    '<div class="in-kpis">'+k.join('')+'</div><p class="in-text" id="in-semana-txt">'+esc(txt)+'</p>',
    '<button type="button" class="in-btn in-pri" data-in-copy="in-semana-txt">'+esc(T('Copiar texto','Copy text'))+'</button>'+pngBtn('in-semana','semana_em_numeros'))+
    (ufT?card('in-semuf',T('Soja · plantio por UF contra a média','Soybeans · planting by state versus average'),T('Leitura Conab até ','Conab reading through ')+dBR(D.soja.d)+T(' · ordenado pela diferença contra a média de cinco safras',' · sorted by gap versus the five-year average'),ufT,pngBtn('in-semuf','soja_plantio_uf')):'');
}

/* 1 · Atraso por UF e semana */
function heatView(){
  const cult=S.cult,oper=S.oper||opAtiva(cult),sf=curSeason(cult,oper);
  const wk=serieProg(cult,sf,oper,'BR');if(!wk.length)return card('in-heat',T('Atraso por UF e semana','Delay by state and week'),'',
    '<div class="in-empty">'+esc(T('Sem leitura semanal para esta cultura e operação.','No weekly reading for this crop and operation.'))+'</div>');
  const rows=['BR'].concat(ufList(cult,sf,oper));
  let h='<div class="in-scroll"><table class="in-heat"><thead><tr><th class="in-l">UF</th>'+wk.map(p=>'<th>'+esc(dDM(p.d))+'</th>').join('')+'<th class="in-last">'+esc(T('última','latest'))+'<small>%</small></th></tr></thead><tbody>';
  rows.forEach(u=>{let lastV=null;
    h+='<tr class="'+(u==='BR'?'in-br':'')+'"><td class="in-l">'+esc(geoLbl(u))+'</td>'+wk.map(p=>{const v=pctAt(cult,sf,oper,u,p.x),a=avg5(cult,oper,u,p.x,sf);if(v!=null)lastV=v;
      if(v==null||a==null)return '<td class="in-na">·</td>';const dd=v-a,al=Math.min(1,Math.abs(dd)/20)*0.62;
      const bg=Math.abs(dd)<1?'#F4F6F8':dd>0?'rgba(13,148,136,'+al.toFixed(3)+')':'rgba(179,86,77,'+al.toFixed(3)+')';
      return '<td style="background:'+bg+'" title="'+esc(geoLbl(u)+' · '+dBR(p.d)+': '+nf(v,1)+'% · '+T('média ','avg ')+nf(a,1)+'%')+'">'+esc(sg(dd,0))+'</td>';}).join('')+
      '<td class="in-last">'+esc(lastV==null?'n/d':nf(lastV,1))+'</td></tr>';});
  h+='</tbody></table></div><div class="in-note">'+esc(T('Célula: diferença em p.p. entre a safra '+sf+' e a média das cinco safras anteriores na mesma semana do calendário. Verde: adiantado; vermelho: atrasado; intensidade plena a partir de 20 p.p.','Cell: gap in p.p. between crop year '+sf+' and the average of the five previous crop years in the same calendar week. Green: ahead; red: behind; full intensity from 20 p.p.'))+'</div>';
  return card('in-heat',T('Atraso por UF e semana','Delay by state and week')+' · '+cropN(cult)+' · '+opN(oper),T('Safra ','Crop year ')+sf+' · Conab',h,pngBtn('in-heat','atraso_'+cult+'_'+oper));
}

/* 2 · Área por plantar ou colher e produção ainda fora do campo */
function remView(){
  const cult=S.cult,oper=S.oper||opAtiva(cult),sf=curSeason(cult,oper),l=lastBR(cult,sf,oper),pl=oper==='Semeadura';
  const tit=pl?T('Área por plantar e produção ainda fora da terra','Area left to plant and output not yet in the ground'):T('Área por colher e produção ainda no campo','Area left to harvest and output still in the field');
  if(!l)return card('in-rem',tit,'','<div class="in-empty">'+esc(T('Sem leitura semanal.','No weekly reading.'))+'</div>');
  const rows=ufList(cult,sf,oper).map(u=>{const v=pctAt(cult,sf,oper,u,l.x),a=avg5(cult,oper,u,l.x,sf),ar=areaDe(cult,sf,u),y=yieldKg(cult,sf,u);
    if(v==null||ar==null)return null;const rest=ar*(1-v/100);return {u,v,a,ar,y,rest,prod:y!=null?rest*y/1000:null};}).filter(Boolean).sort((a,b)=>b.rest-a.rest);
  const tot=rows.reduce((s,r)=>s+r.rest,0),totP=rows.reduce((s,r)=>s+(r.prod||0),0),mx=Math.max(...rows.map(r=>r.rest),1e-9);
  const brA=areaDe(cult,sf,'BR'),brY=yieldKg(cult,sf,'BR'),brRest=brA!=null?brA*(1-l.v/100):null;
  let h='<div class="in-scroll"><table class="in-t"><thead><tr><th class="in-l">UF</th><th>'+esc(opN(oper))+' %</th><th>'+esc(T('vs média','vs avg'))+'<small>p.p.</small></th><th>'+esc(T('Área','Area'))+'<small>Mi ha</small></th><th>'+esc(pl?T('A plantar','To plant'):T('A colher','To harvest'))+'<small>Mi ha</small></th><th class="in-barh"></th><th>'+esc(T('Produção potencial','Potential output'))+'<small>Mi t</small></th></tr></thead><tbody>';
  rows.forEach(r=>{h+='<tr><td class="in-l"><b>'+esc(sig(r.u))+'</b> <small>'+esc(r.u)+'</small></td><td>'+esc(nf(r.v,1))+'</td><td class="'+tone(r.a==null?null:r.v-r.a,1)+'">'+esc(r.a==null?'n/d':sg(r.v-r.a,1))+'</td><td>'+esc(nf(r.ar/1000,2))+'</td><td><b>'+esc(nf(r.rest/1000,2))+'</b></td>'+
    '<td class="in-barc"><span class="in-bar"><i style="width:'+(r.rest/mx*100).toFixed(1)+'%"></i></span></td><td>'+esc(r.prod==null?'n/d':nf(r.prod/1000,2))+'</td></tr>';});
  h+='<tr class="in-tot"><td class="in-l">'+esc(T('Soma das UFs','Sum of states'))+'</td><td></td><td></td><td></td><td><b>'+esc(nf(tot/1000,2))+'</b></td><td></td><td><b>'+esc(nf(totP/1000,2))+'</b></td></tr>';
  if(brRest!=null)h+='<tr class="in-tot"><td class="in-l">'+esc(T('Brasil · agregado Conab','Brazil · Conab aggregate'))+'</td><td>'+esc(nf(l.v,1))+'</td><td></td><td>'+esc(nf(brA/1000,2))+'</td><td><b>'+esc(nf(brRest/1000,2))+'</b></td><td></td><td>'+esc(brY!=null?nf(brRest*brY/1e6,2):'n/d')+'</td></tr>';
  h+='</tbody></table></div><div class="in-note">'+esc(T('Área e produtividade da estimativa Conab da safra '+sf+'; produção potencial = área restante × produtividade estimada. A soma cobre só as UFs com leitura semanal.','Area and yield from Conab estimate for '+sf+'; potential output = remaining area × estimated yield. The sum covers only states with weekly readings.'))+'</div>';
  return card('in-rem',tit+' · '+cropN(cult),T('Leitura até ','Reading through ')+dBR(l.d)+' · '+T('safra ','crop year ')+sf,h,pngBtn('in-rem','area_restante_'+cult));
}

/* 3 · Janela do milho 2ª */
function janelaView(){
  const ufs=['Mato Grosso','Goiás','Paraná','Mato Grosso do Sul','BR'];
  const ss=seasonsOf('Soja','Colheita').filter(s=>s!==curSeason('Soja','Semeadura'));
  const at=(c,s,o,u,mm,dd)=>{const y=parseInt(s,10)+1,iso=y+'-'+mm+'-'+dd;const ser=serieProg(c,s,o,u);if(!ser.length)return null;return pctAt(c,s,o,u,semIdx(c,s,iso,o));};
  const head='<tr><th class="in-l">'+esc(T('Safra','Crop year'))+'</th>'+ufs.map(u=>'<th>'+esc(geoLbl(u))+'</th>').join('')+'</tr>';
  let t1='<table class="in-t in-c"><thead>'+head+'</thead><tbody>',t2='<table class="in-t in-c"><thead>'+head+'</thead><tbody>';
  const acc1={},acc2={},acc3={};
  ss.forEach(s=>{t1+='<tr><td class="in-l">'+esc(s)+'</td>';t2+='<tr><td class="in-l">'+esc(s)+'</td>';
    ufs.forEach(u=>{const v=at('Soja',s,'Colheita',u,'02','28');(acc1[u]=acc1[u]||[]).push(v);t1+='<td>'+esc(v==null?'n/d':nf(v,1))+'</td>';
      const m1=at('Milho 2ª',s,'Semeadura',u,'02','28'),m2=at('Milho 2ª',s,'Semeadura',u,'03','15');(acc2[u]=acc2[u]||[]).push(m1);(acc3[u]=acc3[u]||[]).push(m2);
      t2+='<td>'+esc(m1==null?'n/d':nf(m1,0))+' <small>· '+esc(m2==null?'n/d':nf(m2,0))+'</small></td>';});
    t1+='</tr>';t2+='</tr>';});
  const mean=a=>{const v=(a||[]).slice(-5).filter(x=>x!=null);return v.length?v.reduce((p,q)=>p+q,0)/v.length:null;};
  t1+='<tr class="in-tot"><td class="in-l">'+esc(T('Média 5 safras','5-year average'))+'</td>'+ufs.map(u=>'<td><b>'+esc(nf(mean(acc1[u]),1))+'</b></td>').join('')+'</tr></tbody></table>';
  t2+='<tr class="in-tot"><td class="in-l">'+esc(T('Média 5 safras','5-year average'))+'</td>'+ufs.map(u=>'<td><b>'+esc(nf(mean(acc2[u]),0))+'</b> <small>· '+esc(nf(mean(acc3[u]),0))+'</small></td>').join('')+'</tr></tbody></table>';
  const sf=curSeason('Soja','Semeadura'),l=lastBR('Soja',sf,'Semeadura');
  let lead='';if(l){const it=ufs.map(u=>{const v=pctAt('Soja',sf,'Semeadura',u,l.x),a=avg5('Soja','Semeadura',u,l.x,sf);return v!=null&&a!=null?geoLbl(u)+' '+nf(v,1)+'% ('+sg(v-a,1)+' p.p.)':null;}).filter(Boolean);
    lead=T('Sinal antecipado '+sf+': plantio da soja até '+dBR(l.d)+' contra a média de cinco safras: '+it.join(', ')+'. Plantio adiantado abre espaço para colheita mais cedo e para o milho 2ª dentro da janela; a confirmação vem com a colheita de jan/fev.',
           'Early signal '+sf+': soybean planting through '+dBR(l.d)+' versus the five-year average: '+it.join(', ')+'. Earlier planting makes room for an earlier harvest and for 2nd-crop corn within the window; confirmation comes with the Jan/Feb harvest.');}
  return card('in-jan',T('Janela do milho 2ª','2nd-crop corn window'),T('Soja colhida e milho 2ª plantado nas datas-chave · Conab','Soybeans harvested and 2nd-crop corn planted on key dates · Conab'),
    '<p class="in-text in-lead">'+esc(lead)+'</p><div class="in-two"><div><h4>'+esc(T('Soja colhida até 28/fev · %','Soybeans harvested by Feb 28 · %'))+'</h4><div class="in-scroll">'+t1+'</div></div>'+
    '<div><h4>'+esc(T('Milho 2ª plantado até 28/fev · 15/mar · %','2nd-crop corn planted by Feb 28 · Mar 15 · %'))+'</h4><div class="in-scroll">'+t2+'</div></div></div>'+
    '<div class="in-note">'+esc(T('Valores interpolados entre as leituras semanais. A janela do milho 2ª é considerada até o fim de fevereiro no MT e até meados de março nas demais UFs.','Values interpolated between weekly readings. The 2nd-crop corn window is taken as end of February in MT and mid-March in the other states.'))+'</div>',pngBtn('in-jan','janela_milho2'));
}

/* 4 · Oferta física semanal */
function linAt(cult,s,oper,uf,x){ /* interpolação linear pura (sem segurar o último valor em buracos), para volumes semanais */
  const sr=serieProg(cult,s,oper,uf);if(!sr.length)return null;
  if(x<sr[0].x)return sr[0].v<=10?0:null;if(x===sr[0].x)return sr[0].v;
  for(let i=1;i<sr.length;i++){if(sr[i].x>=x){const a=sr[i-1],b=sr[i];return a.v+(b.v-a.v)*(x-a.x)/(b.x-a.x);}}
  return sr[sr.length-1].v;
}
function ofertaData(){
  const cult=S.ofCult,uf=S.ofUf,ss=seasonsOf(cult,'Colheita'),sf=ss[ss.length-1];if(!sf)return null;
  const ser=serieProg(cult,sf,'Colheita',uf),prod=prodMil(cult,sf,uf);if(ser.length<2||prod==null)return null;
  const prev=ss.filter(s=>parseInt(s,10)<parseInt(sf,10)).slice(-5).map(s=>({s,p:prodMil(cult,s,uf)})).filter(o=>o.p!=null);
  const x0=ser[0].x,x1=ser[ser.length-1].x,t0=Date.parse(ser[0].d+'T00:00:00Z'),pts=[];
  for(let x=x0;x<=x1;x++){
    const a=linAt(cult,sf,'Colheita',uf,x-1),b=linAt(cult,sf,'Colheita',uf,x);if(a==null||b==null)continue;
    const av=prev.map(o=>{const p0=linAt(cult,o.s,'Colheita',uf,x-1),p1=linAt(cult,o.s,'Colheita',uf,x);return p0!=null&&p1!=null?(p1-p0)/100*o.p/1000:null;}).filter(v=>v!=null);
    const d=new Date(t0+(x-x0)*7*864e5).toISOString().slice(0,10);
    pts.push({d,x,vol:Math.max(0,(b-a)/100*prod/1000),avg:av.length>=3?av.reduce((p,q)=>p+q,0)/av.length:null,cum:b/100*prod/1000});
  }
  return {cult,uf,sf,prod,pts,prev:prev.map(o=>o.s)};
}
function ofertaView(){
  const cults=['Soja','Milho 2ª','Milho 1ª','Trigo','Algodão'].filter(c=>has(c)&&C.hist[c]);
  if(!cults.includes(S.ofCult))S.ofCult=cults[0];
  const ufs=['BR'].concat(ufList(S.ofCult,seasonsOf(S.ofCult,'Colheita').slice(-1)[0],'Colheita'));if(!ufs.includes(S.ofUf))S.ofUf='BR';
  const ctl='<div class="in-ctl"><label>'+esc(T('Cultura','Crop'))+'<select data-in-sel="ofCult">'+cults.map(c=>'<option value="'+esc(c)+'"'+(c===S.ofCult?' selected':'')+'>'+esc(cropN(c))+'</option>').join('')+'</select></label>'+
    '<label>UF<select data-in-sel="ofUf">'+ufs.map(u=>'<option value="'+esc(u)+'"'+(u===S.ofUf?' selected':'')+'>'+esc(geoLbl(u))+'</option>').join('')+'</select></label></div>';
  const D=ofertaData();
  if(!D)return card('in-of',T('Oferta física semanal','Weekly physical supply'),'',ctl+'<div class="in-empty">'+esc(T('Sem colheita com produção estimada para esta seleção.','No harvest with estimated output for this selection.'))+'</div>');
  const pk=D.pts.reduce((a,b)=>b.vol>a.vol?b:a,D.pts[0]),last=D.pts[D.pts.length-1];
  const read=T('Safra '+D.sf+': '+nf(last.cum,2)+' Mi t colhidas até '+dBR(last.d)+' de '+nf(D.prod/1000,2)+' Mi t estimadas. Pico de '+nf(pk.vol,2)+' Mi t na semana até '+dBR(pk.d)+(pk.avg!=null?', contra '+nf(pk.avg,2)+' Mi t na média das safras anteriores na mesma semana.':'.'),
               'Crop year '+D.sf+': '+nf(last.cum,2)+' Mmt harvested through '+dBR(last.d)+' out of '+nf(D.prod/1000,2)+' Mmt estimated. Peak of '+nf(pk.vol,2)+' Mmt in the week through '+dBR(pk.d)+(pk.avg!=null?', against '+nf(pk.avg,2)+' Mmt on average in the same week of earlier crop years.':'.'));
  return card('in-of',T('Oferta física semanal','Weekly physical supply')+' · '+cropN(D.cult)+' · '+geoLbl(D.uf),T('Mi t colhidas por semana: avanço da colheita × produção estimada · média das cinco safras anteriores na linha','Mmt harvested per week: harvest progress × estimated output · five previous crop years average in the line'),
    ctl+'<p class="in-text in-lead">'+esc(read)+'</p><div class="in-chart" id="in-of-ch"></div>',pngBtn('in-of','oferta_semanal_'+D.cult));
}
function ofertaChart(){const D=ofertaData();if(!D)return;const mt=T('Mi t','Mmt');
  mount('in-of-ch',{xAxis:{type:'category',data:D.pts.map(p=>dDM(p.d)),axisLabel:{fontSize:11}},yAxis:{type:'value',name:mt,axisLabel:{fontSize:11}},
    tooltip:{trigger:'axis',formatter:ps=>'<b>'+esc(dL(D.pts[ps[0].dataIndex].d))+'</b><br>'+ps.map(p=>p.marker+esc(p.seriesName)+': <b>'+nfL(p.value,2)+' '+mt+'</b>').join('<br>')},
    toolbox:{feature:{saveAsImage:{name:'oferta_semanal_'+D.cult},dataView:{},magicType:{}}},
    series:[{name:D.sf.slice(2)+' '+T('colhido','harvested'),type:'bar',color:'#1A3A5C',data:D.pts.map(p=>+p.vol.toFixed(3))},
            {name:T('média 5 safras','5-year avg'),type:'line',color:'#B5963E',showSymbol:true,symbolSize:5,lineStyle:{width:2,type:'dashed'},data:D.pts.map(p=>p.avg==null?null:+p.avg.toFixed(3))}]});}

/* 5 · Produtividade contra a tendência */
const N_TREND=20;
function trendRows(cult){
  const h=C.hist[cult];if(!h)return [];const n=h.safras.length,ci=n-1,sf=h.safras[ci];
  const geos=Object.keys(h.prod||{}).filter(k=>k==='BR'||/^[A-Z]{2}$/.test(k));
  const rows=geos.map(k=>{const Y=h.produt[k]||[],A=h.area[k]||[],P=h.prod[k]||[];
    const pts=[];for(let i=Math.max(0,ci-N_TREND);i<ci;i++){const y=Y[i];if(y!=null&&y>0)pts.push([i,y]);}
    if(pts.length<10||!(Y[ci]>0)||!(A[ci]>0))return null;
    const mx=pts.reduce((s,p)=>s+p[0],0)/pts.length,my=pts.reduce((s,p)=>s+p[1],0)/pts.length;
    const sxy=pts.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0),sxx=pts.reduce((s,p)=>s+(p[0]-mx)**2,0),b=sxx?sxy/sxx:0,a=my-b*mx,tr=a+b*ci;
    const ssr=pts.reduce((s,p)=>s+(p[1]-(a+b*p[0]))**2,0),sst=pts.reduce((s,p)=>s+(p[1]-my)**2,0),r2=sst?1-ssr/sst:null;
    const dev=Y[ci]-tr;return {k,sf,cur:Y[ci],tr,dev,pct:dev/tr*100,eff:dev*A[ci]/1000,prod:P[ci]||0,r2,a,b,ci};}).filter(Boolean);
  const br=rows.find(r=>r.k==='BR'),ufs=rows.filter(r=>r.k!=='BR').sort((x,y)=>y.prod-x.prod).slice(0,10);
  return br?[br].concat(ufs):ufs;
}
function trendView(){
  const cults=['Soja','Milho Total','Milho 1ª','Milho 2ª','Trigo','Sorgo','Algodão'].filter(c=>C.hist[c]);if(!cults.includes(S.ypCult))S.ypCult=cults[0];
  const rows=trendRows(S.ypCult);if(!rows.find(r=>r.k===S.ypGeo))S.ypGeo=rows.length?rows[0].k:'BR';
  const sf=rows.length?rows[0].sf:'';
  let h='<div class="in-ctl"><label>'+esc(T('Cultura','Crop'))+'<select data-in-sel="ypCult">'+cults.map(c=>'<option value="'+esc(c)+'"'+(c===S.ypCult?' selected':'')+'>'+esc(cropN(c))+'</option>').join('')+'</select></label><span class="in-hint">'+esc(T('Clique numa linha para ver o gráfico da UF','Click a row to chart that state'))+'</span></div>';
  h+='<div class="in-scroll"><table class="in-t in-click"><thead><tr><th class="in-l">'+esc(T('Geografia','Geography'))+'</th><th>'+esc(T('Tendência','Trend'))+'<small>sc/ha</small></th><th>'+esc(sf)+'<small>sc/ha</small></th><th>'+esc(T('Desvio','Gap'))+'<small>sc/ha</small></th><th>%</th><th>'+esc(T('Efeito','Effect'))+'<small>Mi t</small></th><th>R²</th></tr></thead><tbody>';
  rows.forEach(r=>{h+='<tr class="'+(r.k===S.ypGeo?'on':'')+(r.k==='BR'?' in-br':'')+'" data-in-geo="'+esc(r.k)+'"><td class="in-l"><b>'+esc(r.k==='BR'?T('Brasil','Brazil'):r.k)+'</b>'+(r.k!=='BR'?' <small>'+esc(UFN[r.k]||'')+'</small>':'')+'</td><td>'+esc(nf(r.tr/60,1))+'</td><td><b>'+esc(nf(r.cur/60,1))+'</b></td>'+
    '<td class="'+tone(r.pct,0.5)+'">'+esc(sg(r.dev/60,1))+'</td><td class="'+tone(r.pct,0.5)+'">'+esc(sg(r.pct,1))+'%</td><td class="'+tone(r.pct,0.5)+'"><b>'+esc(sg(r.eff/1000,2))+'</b></td><td>'+esc(r.r2==null?'n/d':nf(r.r2,2))+'</td></tr>';});
  h+='</tbody></table></div><div class="in-chart" id="in-yp-ch"></div><div class="in-note">'+esc(T('Tendência linear das '+N_TREND+' safras anteriores a '+sf+' (Série Histórica Conab). Efeito = desvio de produtividade × área estimada. R² baixo indica tendência pouco aderente; leia o desvio com cautela.','Linear trend over the '+N_TREND+' crop years before '+sf+' (Conab Historical Series). Effect = yield gap × estimated area. A low R² means a weak trend; read the gap with care.'))+'</div>';
  return card('in-yp',T('Produtividade contra a tendência','Yield versus trend')+' · '+cropN(S.ypCult),T('Desvio da estimativa atual sobre a tendência, convertido em produção','Gap of the current estimate versus trend, converted into output'),h,pngBtn('in-yp','produtividade_tendencia_'+S.ypCult));
}
function trendChart(){
  const rows=trendRows(S.ypCult),r=rows.find(x=>x.k===S.ypGeo);if(!r)return;const h=C.hist[S.ypCult],i0=Math.max(0,r.ci-24),idx=[];for(let i=i0;i<=r.ci;i++)idx.push(i);
  mount('in-yp-ch',{xAxis:{type:'category',data:idx.map(i=>h.safras[i].slice(2)),axisLabel:{fontSize:11}},yAxis:{type:'value',name:'sc/ha',scale:true,axisLabel:{fontSize:11}},
    tooltip:{trigger:'axis',valueFormatter:v=>nfL(v,1)+' sc/ha'},toolbox:{feature:{saveAsImage:{name:'tendencia_'+S.ypCult+'_'+r.k},dataView:{}}},
    series:[{name:(r.k==='BR'?T('Brasil','Brazil'):r.k)+' · '+T('produtividade','yield'),type:'line',color:'#1A3A5C',showSymbol:true,symbolSize:6,lineStyle:{width:2},data:idx.map(i=>{const y=(h.produt[r.k]||[])[i];return y>0?+(y/60).toFixed(2):null;})},
            {name:T('tendência','trend'),type:'line',color:'#B5963E',showSymbol:false,lineStyle:{width:2,type:'dashed'},data:idx.map(i=>i>=r.ci-N_TREND?+((r.a+r.b*i)/60).toFixed(2):null)}]});
}

/* 6 · Peso das UFs */
const MATOPIBA=['MA','TO','PI','BA'];
function pesoData(cult){
  const h=C.hist[cult];if(!h)return null;const n=h.safras.length,ci=n-1;
  const ufs=Object.keys(h.prod||{}).filter(k=>/^[A-Z]{2}$/.test(k)&&k!=='BR'&&!MATOPIBA.includes(k)).sort((a,b)=>((h.prod[b]||[])[ci]||0)-((h.prod[a]||[])[ci]||0)).slice(0,5);
  const groups=ufs.map(k=>({k,l:k,keys:[k]})).concat([{k:'MATOPIBA',l:'Matopiba',keys:MATOPIBA}]);
  const rows=h.safras.map((s,i)=>{const br=(h.prod.BR||[])[i];if(!(br>0))return null;const o={s,br,sh:{}};let used=0;
    groups.forEach(g=>{const v=g.keys.reduce((t,k)=>t+(((h.prod[k]||[])[i])||0),0);o.sh[g.k]=v/br*100;used+=v;});o.sh.OUT=Math.max(0,100-used/br*100);return o;}).filter(Boolean);
  return {groups:groups.concat([{k:'OUT',l:T('Outros','Others')}]),rows};
}
function pesoView(){
  const D=pesoData(S.ypCult);if(!D)return card('in-peso',T('Peso das UFs na produção','States share of output'),'','<div class="in-empty">n/d</div>');
  const pick=[1986,1996,2006,2016].map(y=>D.rows.find(r=>parseInt(r.s,10)===y)).filter(Boolean).concat([D.rows[D.rows.length-11],D.rows[D.rows.length-1]].filter(Boolean));
  const uniq=[...new Map(pick.map(r=>[r.s,r])).values()].sort((a,b)=>parseInt(a.s)-parseInt(b.s)),last=D.rows[D.rows.length-1],ten=D.rows[D.rows.length-11];
  let h='<div class="in-scroll"><table class="in-t"><thead><tr><th class="in-l">'+esc(T('Grupo','Group'))+'</th>'+uniq.map(r=>'<th>'+esc(r.s)+'</th>').join('')+'<th>'+esc(T('10 safras','10 crop years'))+'<small>p.p.</small></th></tr></thead><tbody>';
  D.groups.forEach(g=>{const dd=ten?last.sh[g.k]-ten.sh[g.k]:null;h+='<tr><td class="in-l"><b>'+esc(g.l)+'</b>'+(g.k==='MATOPIBA'?' <small>MA, TO, PI, BA</small>':g.k!=='OUT'?' <small>'+esc(UFN[g.k]||'')+'</small>':'')+'</td>'+uniq.map(r=>'<td>'+esc(nf(r.sh[g.k],1))+'%</td>').join('')+'<td class="'+tone(dd,0.5)+'">'+esc(sg(dd,1))+'</td></tr>';});
  h+='</tbody></table></div><div class="in-chart in-tall" id="in-peso-ch"></div>';
  return card('in-peso',T('Peso das UFs na produção','States share of output')+' · '+cropN(S.ypCult),T('% da produção nacional por safra, Série Histórica Conab desde ','% of national output by crop year, Conab Historical Series since ')+D.rows[0].s,h,pngBtn('in-peso','peso_ufs_'+S.ypCult));
}
function pesoChart(){const D=pesoData(S.ypCult);if(!D)return;const cols=['#1A3A5C','#0D9488','#5B7CA6','#63B8B0','#8A9099','#B5963E','#CBD5E1'];
  mount('in-peso-ch',{xAxis:{type:'category',data:D.rows.map(r=>r.s.slice(2)),axisLabel:{fontSize:11}},yAxis:{type:'value',max:100,axisLabel:{fontSize:11,formatter:'{value}%'}},
    tooltip:{trigger:'axis',valueFormatter:v=>nfL(v,1)+'%'},toolbox:{feature:{saveAsImage:{name:'peso_ufs_'+S.ypCult},dataView:{},magicType:{}}},
    series:D.groups.map((g,i)=>({name:g.l,type:'bar',stack:'p',color:cols[i%cols.length],data:D.rows.map(r=>+r.sh[g.k].toFixed(2))}))});}

/* 7 · Divergências DERAL × Conab (PR) e IMEA × Conab (MT) */
function nextConab(cult,sf,uf,iso,oper){const a=((((C.prog[cult]||{})[sf]||{})[oper||'Semeadura']||{})[uf])||[];const t0=Date.parse(iso+'T00:00:00Z');let best=null;
  a.forEach(([d,v])=>{const df=(Date.parse(d+'T00:00:00Z')-t0)/864e5;if(df>=0&&df<=6&&(!best||df<best.df))best={d,v,df};});return best;}
function divData(){
  const out=[];const im=((C.imeaMT||{}).plantio||[]).filter(x=>x.cultura==='Soja').sort((a,b)=>a.data<b.data?-1:1);
  im.forEach(x=>{const c=nextConab('Soja',x.safra||'2026/27','Mato Grosso',x.data);out.push({src:'IMEA',uf:'MT',cult:'Soja',d:x.data,v:x.pct,cd:c?c.d:null,cv:c?c.v:null,gap:c?x.pct-c.v:null});});
  const dh=((C.deralPR||{}).historico||[]).slice().sort((a,b)=>a.data<b.data?-1:1);
  dh.filter(x=>C.prog&&C.prog[x.cultura]).forEach(x=>{const sf=x.conabSafra||x.safra||'2026/27',op=x.oper||'Semeadura',c=nextConab(x.cultura,sf,'Paraná',x.data,op);out.push({src:'DERAL',uf:'PR',cult:x.cultura,op,d:x.data,v:x.pct,cd:c?c.d:null,cv:c?c.v:null,gap:c?x.pct-c.v:null});});
  return out;
}
function divView(){
  const D=divData(),soy=D.filter(x=>x.cult==='Soja');
  const sumr=src=>{const a=soy.filter(x=>x.src===src&&x.gap!=null);if(!a.length)return null;const eq=a.filter(x=>Math.abs(x.gap)<0.05).length,mae=a.reduce((s,x)=>s+Math.abs(x.gap),0)/a.length,l=a[a.length-1];return {n:a.length,eq,mae,l};};
  const sI=sumr('IMEA'),sD=sumr('DERAL');const reads=[];
  if(sD)reads.push(sD.eq===sD.n?T('PR: a série semanal da Conab repete o DERAL em '+sD.eq+' de '+sD.n+' semanas, com cerca de 5 dias de defasagem (relatório DERAL na terça, Conab no sábado seguinte). Diferença no mesmo dia é só calendário.','PR: Conab weekly series repeats DERAL in '+sD.eq+' of '+sD.n+' weeks, with about a 5-day lag (DERAL report on Tuesday, Conab the following Saturday). Same-day gaps are calendar only.'):
    T('PR: diferença média de '+nf(sD.mae,1)+' p.p. entre DERAL e Conab da semana seguinte; última '+sg(sD.l.gap,1)+' p.p. ('+dBR(sD.l.d)+').','PR: average gap of '+nf(sD.mae,1)+' p.p. between DERAL and the following Conab week; latest '+sg(sD.l.gap,1)+' p.p. ('+dBR(sD.l.d)+').'));
  if(sI)reads.push(T('MT: IMEA e Conab são levantamentos distintos; diferença média de '+nf(sI.mae,1)+' p.p. em '+sI.n+' semanas, última de '+sg(sI.l.gap,2)+' p.p. ('+dBR(sI.l.d)+').','MT: IMEA and Conab are separate surveys; average gap of '+nf(sI.mae,1)+' p.p. over '+sI.n+' weeks, latest '+sg(sI.l.gap,2)+' p.p. ('+dBR(sI.l.d)+').'));
  let h='<p class="in-text in-lead">'+esc(reads.join(' '))+'</p><div class="in-chart" id="in-div-ch"></div>';
  h+='<div class="in-scroll"><table class="in-t"><thead><tr><th class="in-l">'+esc(T('Fonte','Source'))+'</th><th>'+esc(T('Cultura','Crop'))+'</th><th>'+esc(T('Data','Date'))+'</th><th>'+esc(T('Fonte','Source'))+' %</th><th>Conab %</th><th>'+esc(T('Conab · data','Conab · date'))+'</th><th>'+esc(T('Diferença','Gap'))+'<small>p.p.</small></th></tr></thead><tbody>';
  D.slice().sort((a,b)=>a.src.localeCompare(b.src)||a.cult.localeCompare(b.cult)||(a.d<b.d?-1:1)).forEach(x=>{h+='<tr><td class="in-l"><b>'+esc(x.src)+'</b> <small>'+esc(x.uf)+'</small></td><td>'+esc(cropN(x.cult))+(x.op==='Colheita'?' <small>· '+esc(T('colheita','harvest'))+'</small>':'')+'</td><td>'+esc(dBR(x.d))+'</td><td>'+esc(nf(x.v,x.src==='IMEA'?2:0))+'</td><td>'+esc(x.cv==null?'n/d':nf(x.cv,1))+'</td><td>'+esc(x.cd?dBR(x.cd):'')+'</td><td class="'+tone(x.gap,0.05)+'">'+esc(x.gap==null?'n/d':sg(x.gap,2))+'</td></tr>';});
  h+='</tbody></table></div><div class="in-note">'+esc(T('Comparação com a leitura Conab do sábado seguinte ao corte de cada fonte. Séries DERAL e IMEA em Base → IMEA MT e na base DERAL do arquivo.','Compared with the Conab reading of the Saturday after each source cut-off. DERAL and IMEA series in Database → IMEA MT and in the file DERAL base.'))+'</div>';
  return card('in-div',T('Divergências semana a semana','Week-by-week divergences'),T('DERAL × Conab no PR e IMEA × Conab no MT · plantio','DERAL × Conab in PR and IMEA × Conab in MT · planting'),h,pngBtn('in-div','divergencias_fontes'));
}
function divChart(){const D=divData().filter(x=>x.cult==='Soja'&&x.gap!=null);if(!D.length)return;const d0=Date.UTC(2026,8,1),dx=iso=>Math.round((Date.parse(iso+'T00:00:00Z')-d0)/864e5);
  const ser=['IMEA','DERAL'].map((s,i)=>({name:s+' − Conab ('+(s==='IMEA'?'MT':'PR')+')',type:'line',color:i?'#B5963E':'#0D9488',showSymbol:true,symbolSize:7,lineStyle:{width:2},data:D.filter(x=>x.src===s).map(x=>({value:[dx(x.d),+x.gap.toFixed(2)],d:x.d}))})).filter(s=>s.data.length);
  mount('in-div-ch',{xAxis:{type:'value',axisLabel:{fontSize:11,formatter:v=>{const t=new Date(d0+v*864e5);return en()?MES_EN[t.getUTCMonth()]:MESC[t.getUTCMonth()];}}},yAxis:{type:'value',name:'p.p.',axisLabel:{fontSize:11}},
    tooltip:{trigger:'axis',formatter:ps=>ps.map(p=>p.marker+esc(p.seriesName)+': <b>'+nfL(p.value[1],2)+' p.p.</b>'+(p.data&&p.data.d?' · '+dL(p.data.d):'')).join('<br>')},toolbox:{feature:{saveAsImage:{name:'divergencias'},dataView:{}}},series:ser});}

/* 8 · Rendimento do esmagamento */
function crushData(){const B=window.__BAL_OFFICIAL__;if(!B||!B.tables||!B.tables['Soja em grão'])return null;const G=B.tables['Soja em grão'],F=B.tables['Farelo de soja']||{},O=B.tables['Óleo de soja']||{};
  return Object.keys(G).sort((a,b)=>parseInt(a)-parseInt(b)).map(y=>{const p=G[y].process,f=(F[y]||{}).production,o=(O[y]||{}).production;if(!(p>0)||f==null||o==null)return null;return {y,p,f,o,rf:f/p*100,ro:o/p*100,rt:(f+o)/p*100};}).filter(Boolean);}
function crushHTML(withChart){
  const D=crushData();if(!D||!D.length)return '';const med=D.map(r=>r.rt).sort((a,b)=>a-b)[Math.floor(D.length/2)];
  let h='<div class="in-scroll"><table class="in-t"><thead><tr><th class="in-l">'+esc(T('Safra','Crop year'))+'</th><th>'+esc(T('Processamento','Crush'))+'<small>mil t</small></th><th>'+esc(T('Farelo','Meal'))+'<small>mil t</small></th><th>'+esc(T('Óleo','Oil'))+'<small>mil t</small></th><th>'+esc(T('Rend. farelo','Meal yield'))+'<small>%</small></th><th>'+esc(T('Rend. óleo','Oil yield'))+'<small>%</small></th><th>'+esc(T('Total','Total'))+'<small>%</small></th><th>'+esc(T('Casca e perdas','Hulls and losses'))+'<small>%</small></th><th>'+esc(T('vs mediana','vs median'))+'<small>p.p.</small></th></tr></thead><tbody>';
  D.forEach(r=>{const dd=r.rt-med;h+='<tr><td class="in-l"><b>'+esc(r.y)+'</b></td><td>'+esc(nf(r.p,1))+'</td><td>'+esc(nf(r.f,1))+'</td><td>'+esc(nf(r.o,1))+'</td><td>'+esc(nf(r.rf,2))+'</td><td>'+esc(nf(r.ro,2))+'</td><td><b>'+esc(nf(r.rt,2))+'</b></td><td>'+esc(nf(100-r.rt,2))+'</td><td class="'+(Math.abs(dd)>=1?'in-down':'in-flat')+'">'+esc(sg(dd,2))+'</td></tr>';});
  h+='</tbody></table></div>'+(withChart?'<div class="in-chart" id="in-crush-ch"></div>':'')+'<div class="in-note">'+esc(T('Rendimento = produção de farelo e de óleo sobre o grão processado no balanço Conab. Desvio de 1 p.p. ou mais sobre a mediana sinaliza balanço a conferir.','Yield = meal and oil output over soybeans crushed in the Conab balance. A gap of 1 p.p. or more from the median flags a balance to check.'))+'</div>';
  return h;
}
function crushChart(){const D=crushData();if(!D)return;
  mount('in-crush-ch',{xAxis:{type:'category',data:D.map(r=>r.y.slice(2)),axisLabel:{fontSize:11}},yAxis:[{type:'value',name:T('farelo %','meal %'),scale:true,axisLabel:{fontSize:11}},{type:'value',name:T('óleo %','oil %'),scale:true,axisLabel:{fontSize:11}}],
    tooltip:{trigger:'axis',valueFormatter:v=>nfL(v,2)+'%'},toolbox:{feature:{saveAsImage:{name:'rendimento_esmagamento'},dataView:{}}},
    series:[{name:T('Rendimento do farelo','Meal yield'),type:'line',color:'#1A3A5C',showSymbol:true,symbolSize:6,lineStyle:{width:2},data:D.map(r=>+r.rf.toFixed(2))},
            {name:T('Rendimento do óleo','Oil yield'),type:'line',yAxisIndex:1,color:'#B5963E',showSymbol:true,symbolSize:6,lineStyle:{width:2},data:D.map(r=>+r.ro.toFixed(2))}]});}

/* 9 · Trajetória das revisões Conab */
function revView(){
  const VV=C.vintages||[],m=S.revM,mi={area:0,produt:1,prod:2}[m];
  const crops=['Brasil Grãos','Soja','Milho Total','Milho 1ª','Milho 2ª','Milho 3ª','Sorgo','Algodão','Trigo','Arroz','Feijão Total','Feijão 1ª'];
  const v1=VV[VV.length-1];const seg=[['prod',T('Produção','Production')],['area',T('Área','Area')],['produt',T('Produtividade','Yield')]].map(([k,l])=>'<button type="button" data-in-rev="'+k+'" class="'+(k===m?'on':'')+'">'+esc(l)+'</button>').join('');
  const unit=m==='produt'?'sc/ha':m==='area'?T('Mi ha','Mha'):T('Mi t','Mmt'),fv=v=>v==null?null:m==='produt'?v/60:v/1000,dec=m==='produt'?1:2;
  const lbl=v=>{const p=String(v.reference_month||'').split('-');const mm=p.length>1?(en()?MES_EN[+p[1]-1]:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][+p[1]-1])+'/'+p[0].slice(2):v.id;return (v.kind==='perspectivas'?T('Persp. ','Outlook '):T('Lev. ','Survey '))+mm;};
  let h='<div class="in-ctl"><div class="in-seg">'+seg+'</div></div><div class="in-scroll"><table class="in-t"><thead><tr><th class="in-l">'+esc(T('Cultura','Crop'))+'</th><th>'+esc(T('Safra','Crop year'))+'</th>'+VV.map(v=>'<th>'+esc(lbl(v))+'<small>'+esc(unit)+'</small></th>').join('')+'<th>'+esc(T('Acumulado','Cumulative'))+'<small>%</small></th><th>'+esc(T('Trajetória','Path'))+'</th></tr></thead><tbody>';
  crops.forEach(c=>{if(!v1||!(v1.records||{})[c])return;const ss=Object.keys(v1.records[c]).sort((a,b)=>parseInt(a)-parseInt(b)),s=ss[ss.length-1];
    const vals=VV.map(v=>{const r=((((v.records||{})[c]||{})[s])||{}).BR;if(!r||(mi===1&&c==='Brasil Grãos'))return null;let x=r[mi];if(mi===1&&(x==null||x===0)&&r[0]>0&&r[2]>0)x=r[2]/r[0]*1000;return x;});
    const fst=vals.find(v=>v!=null),lst=[...vals].reverse().find(v=>v!=null),cum=fst&&lst&&vals.filter(v=>v!=null).length>1?(lst/fst-1)*100:null;
    const pts=vals.map(v=>fv(v)).filter(v=>v!=null);let sp='';if(pts.length>=2){const W=80,H=20,mn=Math.min(...pts),mx=Math.max(...pts),spn=mx-mn||1;const X=i=>3+i/(pts.length-1)*(W-6),Y=v=>H-4-(v-mn)/spn*(H-8);
      sp='<svg class="in-spark" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><path d="'+pts.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('')+'" fill="none" stroke="#1A3A5C" stroke-width="1.5"/><circle cx="'+X(pts.length-1).toFixed(1)+'" cy="'+Y(pts[pts.length-1]).toFixed(1)+'" r="2.6" fill="#B5963E"/></svg>';}
    h+='<tr><td class="in-l"><b>'+esc(cropN(c))+'</b></td><td>'+esc(s)+'</td>'+vals.map(v=>'<td>'+esc(v==null?'n/d':nf(fv(v),dec))+'</td>').join('')+'<td class="'+tone(cum,0.05)+'">'+esc(cum==null?'n/d':sg(cum,2)+'%')+'</td><td class="in-spc">'+sp+'</td></tr>';});
  h+='</tbody></table></div><div class="in-note">'+esc(T('Cada coluna é uma publicação Conab incorporada ao arquivo. Com duas publicações a trajetória é um degrau; a cada novo levantamento a tabela ganha uma coluna e a curva se forma sozinha.','Each column is a Conab release embedded in the file. With two releases the path is a single step; each new survey adds a column and the curve builds itself.'))+'</div>';
  return card('in-rev',T('Trajetória das revisões Conab','Conab revisions path'),T('Estimativa nacional da safra corrente em cada publicação','National estimate for the current crop year in each release'),h,pngBtn('in-rev','trajetoria_revisoes'));
}

/* ── montagem da tela ── */
const TABS=[['semana','Semana em números','The week in numbers'],['progresso','Progresso','Progress'],['produtividade','Produtividade e UFs','Yield and states'],['fontes','Fontes estaduais','State sources'],['balancos','Balanços e revisões','Balances and revisions']];
function render(){
  const el=document.getElementById('ind-app');if(!el)return;dropCharts();
  if(!S.oper)S.oper=typeof opAtiva==='function'?opAtiva(S.cult):'Semeadura';
  let v='';
  if(S.tab==='semana')v=semanaView();
  else if(S.tab==='progresso'){
    const cults=(typeof PROGCULTS!=='undefined'?PROGCULTS:['Soja']).filter(has);
    const ops=['Semeadura','Colheita'].filter(o=>seasonsOf(S.cult,o).length);if(!ops.includes(S.oper))S.oper=ops[0];
    v='<div class="in-ctl in-ctlbar"><label>'+esc(T('Cultura','Crop'))+'<select data-in-sel="cult">'+cults.map(c=>'<option value="'+esc(c)+'"'+(c===S.cult?' selected':'')+'>'+esc(cropN(c))+'</option>').join('')+'</select></label>'+
      '<label>'+esc(T('Operação','Operation'))+'<select data-in-sel="oper">'+ops.map(o=>'<option value="'+o+'"'+(o===S.oper?' selected':'')+'>'+esc(opN(o))+(o===opAtiva(S.cult)?' · '+esc(T('em andamento','in progress')):'')+'</option>').join('')+'</select></label></div>'+
      heatView()+remView()+janelaView()+ofertaView();
  }else if(S.tab==='produtividade')v=trendView()+pesoView();
  else if(S.tab==='fontes')v=divView();
  else v=card('in-crush',T('Rendimento do esmagamento','Crush yield'),T('Farelo e óleo sobre o grão processado no balanço Conab','Meal and oil over soybeans crushed in the Conab balance'),crushHTML(true),pngBtn('in-crush','rendimento_esmagamento'))+revView();
  el.innerHTML='<div class="in-head"><div><div class="in-sub">'+esc(T('Leituras calculadas sobre as bases Conab, DERAL e IMEA do arquivo; recalculam quando a Base muda','Readings computed from the file Conab, DERAL and IMEA databases; they update when the Database changes'))+'</div></div></div>'+
    '<div class="in-tabs">'+TABS.map(([k,pt,e])=>'<button type="button" data-in-tab="'+k+'" class="'+(S.tab===k?'on':'')+'">'+esc(T(pt,e))+'</button>').join('')+'</div>'+v;
  if(S.tab==='progresso')ofertaChart();
  if(S.tab==='produtividade'){trendChart();pesoChart();}
  if(S.tab==='fontes')divChart();
  if(S.tab==='balancos')crushChart();
}
/* PNG de um cartão (estilos calculados no clone, com fonte e marca d'água) */
const PROPS=['display','position','top','right','bottom','left','width','height','min-width','max-width','min-height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-style','border-right-style','border-bottom-style','border-left-style','border-top-color','border-right-color','border-bottom-color','border-left-color','border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius','background-color','background-image','color','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-transform','vertical-align','white-space','box-sizing','flex-grow','flex-shrink','flex-basis','flex-direction','flex-wrap','align-items','justify-content','row-gap','column-gap','grid-template-columns','overflow-x','overflow-y','opacity','border-collapse','border-spacing','font-variant-numeric','fill','stroke','stroke-width','stroke-dasharray'];
function png(id,name){
  const src=document.getElementById(id);if(!src)return;const W=Math.ceil(src.getBoundingClientRect().width),K=3;
  const c=src.cloneNode(true),A=[src,...src.querySelectorAll('*')],B=[c,...c.querySelectorAll('*')];
  A.forEach((e,i)=>{const cs=getComputedStyle(e);let s='';for(const p of PROPS){const v=cs.getPropertyValue(p);if(v!=='')s+=p+':'+v+';';}B[i].setAttribute('style',s);});
  c.querySelectorAll('[data-noexport],.ndyn-top').forEach(x=>x.remove());c.style.margin='0';c.style.width=W+'px';c.style.position='relative';c.style.background='#fff';
  const ft=document.createElement('div');ft.setAttribute('style',"margin-top:8px;font:400 10px 'Arial Nova Cond','Arial Narrow',Arial,sans-serif;color:#64748B");ft.textContent=T('Fonte: Conab, DERAL e IMEA conforme bases do arquivo BRZ SAFRA · ','Source: Conab, DERAL and IMEA per BRZ SAFRA file databases · ')+((C.meta||{}).geradoEm||'');c.appendChild(ft);
  const logo=typeof LOGO_HREF_get==='function'?LOGO_HREF_get():'';if(logo){const wm=document.createElement('img');wm.setAttribute('src',logo);wm.setAttribute('style','position:absolute;left:50%;top:50%;width:150px;transform:translate(-50%,-50%);opacity:.25');c.appendChild(wm);}
  const host=document.createElement('div');host.setAttribute('data-noi18n','');host.setAttribute('style','position:absolute;left:-20000px;top:0;width:'+W+'px');host.appendChild(c);document.body.appendChild(host);const H=Math.ceil(c.getBoundingClientRect().height);host.remove();
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">'+new XMLSerializer().serializeToString(c)+'</div></foreignObject></svg>';
  const img=new Image();img.onload=()=>{const cv=document.createElement('canvas');cv.width=W*K;cv.height=H*K;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);
    const a=document.createElement('a');a.download='BRZ_SAFRA_'+String(name||id).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_')+'.png';a.href=cv.toDataURL('image/png');a.click();};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
document.addEventListener('click',e=>{
  const t=e.target;if(!t.closest('#ind-app'))return;
  const tb=t.closest('[data-in-tab]');if(tb){S.tab=tb.dataset.inTab;render();return;}
  const rv=t.closest('[data-in-rev]');if(rv){S.revM=rv.dataset.inRev;render();return;}
  const gr=t.closest('[data-in-geo]');if(gr){S.ypGeo=gr.dataset.inGeo;render();return;}
  const pb=t.closest('[data-in-png]');if(pb){png(pb.dataset.inPng,pb.dataset.name);return;}
  const cp=t.closest('[data-in-copy]');if(cp){const el=document.getElementById(cp.dataset.inCopy);if(!el)return;const txt=el.textContent;
    const ok=()=>{if(typeof toast==='function')toast(T('Texto copiado ✓','Text copied ✓'));};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,()=>{fallback(txt);ok();});else{fallback(txt);ok();}}
});
function fallback(txt){const ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}ta.remove();}
document.addEventListener('change',e=>{const s=e.target.closest('#ind-app [data-in-sel]');if(!s)return;const k=s.dataset.inSel;S[k]=s.value;
  if(k==='cult')S.oper=typeof opAtiva==='function'?opAtiva(S.cult):'Semeadura';if(k==='ofCult')S.ofUf='BR';if(k==='ypCult')S.ypGeo='BR';render();});
function init(){
  render();
  new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const scr=document.getElementById('scr-ind');if(scr)new MutationObserver(()=>{if(scr.classList.contains('on'))render();}).observe(scr,{attributes:true,attributeFilter:['class']});
  window.BRZIND={render,crushHTML,semanaTexto:()=>semanaTexto().txt,state:S};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
