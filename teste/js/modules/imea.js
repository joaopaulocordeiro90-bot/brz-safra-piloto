
/* ═══════════ BRZ SAFRA s29 · IMEA · MT ═══════════
   Fonte estadual independente (Instituto Mato-grossense de Economia Agropecuária), exibida sem misturar
   com a Conab: as duas séries aparecem lado a lado. Base em window.C.imeaMT (editável em Base → IMEA MT,
   salva no EXPORTAR HTML). Números de mercado formatados em pt-BR; a camada i18n converte para EN. */
(function(){
'use strict';
const C=window.C;
const en=()=>document.documentElement.lang==='en';
const T=(pt,e)=>en()?e:pt;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const nf=(v,d)=>v==null||!isFinite(v)?'n/d':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const nfL=(v,d)=>v==null||!isFinite(v)?'n/d':Number(v).toLocaleString(en()?'en-US':'pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const sg=(v,d)=>v==null||!isFinite(v)?'n/d':(Math.abs(v)<Math.pow(10,-d)/2?'':v>0?'+':'−')+nf(Math.abs(v),d);
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],MES_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],MESC=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const dBR=iso=>{const p=String(iso||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0].slice(2):String(iso||'');};
const dL=iso=>{const p=String(iso||'').split('-');if(p.length!==3)return String(iso||'');return en()?p[1]+'/'+p[2]+'/'+p[0].slice(2):p[2]+'/'+p[1]+'/'+p[0].slice(2);};
const mRef=ref=>{const p=String(ref||'').split('-');return p.length>=2?T(MES[+p[1]-1]+'/'+p[0].slice(2),MES_EN[+p[1]-1]+'/'+p[0].slice(2)):String(ref||'');};
const refL=r=>String(r||'').length===7?mRef(r):dBR(r);
const CROPN={'Soja':['Soja','Soybeans'],'Milho':['Milho','Corn'],'Algodão':['Algodão','Cotton']};
const cropN=c=>CROPN[c]?T(CROPN[c][0],CROPN[c][1]):c;
function D(){return C.imeaMT||null;}
const byDate=(a,b)=>String(a.data||a.ref||'').localeCompare(String(b.data||b.ref||''));
function conab(sf){const a=((((C.prog||{}).Soja||{})[sf]||{}).Semeadura||{})['Mato Grosso']||[];return a.slice().sort((x,y)=>x[0]<y[0]?-1:1);}
const prevSafra=sf=>{const a=parseInt(sf,10);return (a-1)+'/'+String(a).slice(2);};
const day0=sf=>Date.UTC(parseInt(sf,10),8,1);
const dX=(iso,sf)=>Math.round((Date.parse(iso+'T00:00:00Z')-day0(sf))/864e5);
let chart=null,ro=null;

function render(){
  const el=document.getElementById('imea-app');if(!el)return;
  if(chart){try{ro&&ro.disconnect();chart.dispose();}catch(e){}chart=null;}
  const d=D();
  if(!d){el.innerHTML='<div class="dr-note">'+esc(T('Base IMEA vazia. Preencha em Base → IMEA MT.','IMEA base is empty. Fill it in Database → IMEA MT.'))+'</div>';return;}
  const sf=d.safra||'2026/27';
  const pl=(d.plantio||[]).filter(x=>x.cultura==='Soja'&&x.safra===sf).sort(byDate),last=pl[pl.length-1],prev=pl[pl.length-2];
  const cm=conab(sf),cl=cm[cm.length-1],cp=cm[cm.length-2];
  const pj=(d.projecoes||[]).filter(x=>x.cultura==='Soja').sort(byDate),pn=pj[pj.length-1],p0=pj[0];
  const com=(d.comercializacao||[]).filter(x=>x.cultura==='Soja'&&x.safra===sf).sort(byDate).pop();
  const kp=(lbl,val,sub)=>'<div class="dr-kpi"><span>'+esc(lbl)+'</span><b>'+esc(val)+'</b><small>'+esc(sub||'')+'</small></div>';
  let h='<div class="dr-header"><div><h2>'+esc(T('IMEA · Mato Grosso · acompanhamento da safra','IMEA · Mato Grosso · crop monitoring'))+'</h2><p>'+
    esc(T('Instituto Mato-grossense de Economia Agropecuária · safra '+sf+' · atualizado em '+dBR(d.atualizado),'Mato Grosso Institute of Agricultural Economics · crop year '+sf+' · updated '+dBR(d.atualizado)))+'</p></div>'+
    '<div class="im-acts"><button type="button" class="dr-export" data-im="xlsx">Excel</button><button type="button" class="dr-export im-ghost" data-im="base">'+esc(T('Editar base','Edit base'))+'</button></div></div>';
  h+='<div class="dr-kpis im-kpis">'+
    kp(T('Plantio da soja · IMEA','Soybean planting · IMEA'),last?nf(last.pct,2)+'%':'n/d',last?(T('até ','through ')+dBR(last.data)+(prev?' · '+sg(last.pct-prev.pct,2)+' p.p. '+T('na semana','in the week'):'')+(last.media5!=null?' · '+T('média 5 anos ','5-yr avg ')+nf(last.media5,2)+'%':'')):'')+
    kp(T('Plantio · Conab · MT','Planting · Conab · MT'),cl?nf(cl[1],1)+'%':'n/d',cl?(T('até ','through ')+dBR(cl[0])+(cp?' · '+sg(cl[1]-cp[1],1)+' p.p.':'')):'')+
    kp(T('Área projetada · IMEA','Projected area · IMEA'),pn&&pn.area!=null?nf(pn.area,2)+' Mi ha':'n/d',pn?(refL(pn.data)+(p0&&p0!==pn&&p0.area!=null?' · '+T('inicial ','initial ')+nf(p0.area,2):'')):'')+
    kp(T('Produção projetada · IMEA','Projected output · IMEA'),pn&&pn.prod!=null?nf(pn.prod,2)+' Mi t':'n/d',pn?(nf(pn.produt,2)+' sc/ha'+(p0&&p0!==pn&&p0.prod!=null?' · '+sg(pn.prod-p0.prod,2)+' Mi t '+T('vs ','vs ')+refL(p0.data):'')):'')+
    kp(T('Soja '+sf+' vendida','Soybeans '+sf+' sold'),com?nf(com.pct,2)+'%':'n/d',com?(T('relatório de ','report of ')+refL(com.ref)+(com.vsPP!=null?' · '+sg(com.vsPP,2)+' p.p. '+T('vs safra anterior','vs previous crop'):'')):'')+
    '</div>';
  if(last&&cl)h+='<div class="dr-conab">'+esc(T('Mato Grosso | plantio IMEA ('+dBR(last.data)+'): ','Mato Grosso | IMEA planting ('+dBR(last.data)+'): '))+'<b>'+esc(nf(last.pct,2))+'%</b> · Conab ('+esc(dBR(cl[0]))+'): <b>'+esc(nf(cl[1],1))+'%</b>'+
    '<span>'+esc(T('Levantamentos com metodologias e datas de corte diferentes (IMEA na sexta, Conab no sábado); a diferença não é avanço semanal.','Surveys with different methods and cut-off dates (IMEA on Friday, Conab on Saturday); the gap is not weekly progress.'))+'</span></div>';
  h+='<div class="dr-pane im-chartpane"><h3>'+esc(T('Plantio da soja no MT · IMEA × Conab','Soybean planting in MT · IMEA × Conab'))+'</h3><div class="im-chart" id="im-chart"></div></div>';
  // tabela semanal
  const cmap={};cm.forEach(([dd,v])=>{cmap[dd]=v;});
  const near=iso=>{const t0=Date.parse(iso+'T00:00:00Z');let best=null,bd=4;cm.forEach(([dd,v])=>{const df=Math.abs(Date.parse(dd+'T00:00:00Z')-t0)/864e5;if(df<bd){bd=df;best=[dd,v];}});return best;};
  const ps=prevSafra(sf).slice(2);
  let tw='<table class="dr-table im-table"><thead><tr><th>'+esc(T('Semana até','Week ending'))+'</th><th>IMEA %</th><th>'+esc(T('avanço p.p.','change p.p.'))+'</th><th>IMEA '+esc(ps)+'</th><th>'+esc(T('IMEA média 5','IMEA 5-yr avg'))+'</th><th>'+esc(T('Conab sáb.','Conab Sat.'))+'</th><th>IMEA − Conab</th></tr></thead><tbody>';
  pl.forEach((x,i)=>{const c=near(x.data),df=c?x.pct-c[1]:null;
    tw+='<tr><td>'+esc(dBR(x.data))+'</td><td><b>'+esc(nf(x.pct,2))+'</b></td><td>'+(i?esc(sg(x.pct-pl[i-1].pct,2)):'')+'</td><td>'+(x.anoAnt!=null?esc(nf(x.anoAnt,2)):'<span class="im-na">n/d</span>')+'</td><td>'+(x.media5!=null?esc(nf(x.media5,2)):'<span class="im-na">n/d</span>')+'</td><td>'+(c?esc(nf(c[1],1)):'n/d')+'</td><td class="'+(df==null?'':Math.abs(df)<0.5?'im-flat':df>0?'im-up':'im-down')+'">'+(df==null?'n/d':esc(sg(df,2)))+'</td></tr>';});
  tw+='</tbody></table>';
  // macrorregiões
  const rg=(d.regioes||[]).filter(x=>x.cultura==='Soja').sort(byDate),dates=[...new Set(rg.map(x=>x.data))].sort(),regs=[...new Set(rg.map(x=>x.regiao))];
  const REGORD=['Noroeste','Norte','Nordeste','Médio-Norte','Oeste','Centro-Sul','Sudeste'];regs.sort((a,b)=>(REGORD.indexOf(a)+99)%99-(REGORD.indexOf(b)+99)%99);
  let tr='<table class="dr-table im-table"><thead><tr><th>'+esc(T('Macrorregião','Macro-region'))+'</th>'+dates.map(x=>'<th>'+esc(dBR(x))+'</th>').join('')+'<th>'+esc(T('avanço na última semana','latest weekly change'))+'</th></tr></thead><tbody>';
  regs.forEach(r=>{const lastD=dates[dates.length-1],av=rg.find(x=>x.regiao===r&&x.data===lastD&&x.avanco!=null);
    tr+='<tr><td>'+esc(r)+'</td>'+dates.map(dd=>{const x=rg.find(y=>y.regiao===r&&y.data===dd&&y.pct!=null);return '<td>'+(x?esc(nf(x.pct,2)):'<span class="im-na">n/d</span>')+'</td>';}).join('')+'<td>'+(av?esc(sg(av.avanco,2))+' p.p.':'<span class="im-na">n/d</span>')+'</td></tr>';});
  tr+='</tbody></table>';
  h+='<div class="dr-cols"><section class="dr-pane"><h3>'+esc(T('Avanço semanal · IMEA e Conab','Weekly progress · IMEA and Conab'))+'</h3><div class="dr-table-scroll im-scroll">'+tw+'</div></section>'+
    '<section class="dr-pane"><h3>'+esc(T('Macrorregiões IMEA · valores divulgados','IMEA macro-regions · published values'))+'</h3><div class="dr-table-scroll im-scroll">'+tr+'</div>'+
    '<div class="dr-note">'+esc(T('O IMEA divulga as sete macrorregiões no painel semanal; aqui ficam os valores já publicados. Complete a tabela em Base → IMEA MT.','IMEA publishes all seven macro-regions in its weekly panel; this table keeps the values already published. Complete it in Database → IMEA MT.'))+'</div></section></div>';
  // projeções e comercialização
  const pjAll=(d.projecoes||[]).slice().sort((a,b)=>String(a.cultura).localeCompare(String(b.cultura))||byDate(a,b));
  let tp='<table class="dr-table im-table im-proj"><thead><tr><th>'+esc(T('Cultura','Crop'))+'</th><th>'+esc(T('Referência','Reference'))+'</th><th>'+esc(T('Área · Mi ha','Area · Mha'))+'</th><th>'+esc(T('Produtividade · sc/ha','Yield · bags/ha'))+'</th><th>'+esc(T('Produção · Mi t','Output · Mmt'))+'</th><th class="im-noteh">'+esc(T('Nota','Note'))+'</th></tr></thead><tbody>';
  pjAll.forEach(x=>{tp+='<tr><td>'+esc(cropN(x.cultura))+'</td><td>'+esc(refL(x.data))+'</td><td>'+esc(nf(x.area,2))+'</td><td>'+(x.produt!=null?esc(nf(x.produt,2)):'n/d')+'</td><td>'+(x.prod!=null?esc(nf(x.prod,2)):x.pluma!=null?esc(nf(x.pluma,2))+' '+esc(T('pluma','lint')):'n/d')+'</td><td class="im-note">'+esc(x.nota||'')+'</td></tr>';});
  tp+='</tbody></table>';
  const cmAll=(d.comercializacao||[]).slice().sort((a,b)=>String(a.cultura).localeCompare(String(b.cultura))||String(b.safra).localeCompare(String(a.safra)));
  let tc='<table class="dr-table im-table"><thead><tr><th>'+esc(T('Cultura','Crop'))+'</th><th>'+esc(T('Safra','Crop year'))+'</th><th>'+esc(T('Vendido · % da produção','Sold · % of output'))+'</th><th>'+esc(T('Relatório','Report'))+'</th><th>'+esc(T('vs mesmo período anterior','vs same period last year'))+'</th></tr></thead><tbody>';
  cmAll.forEach(x=>{tc+='<tr><td>'+esc(cropN(x.cultura))+'</td><td>'+esc(x.safra)+'</td><td><span class="im-bar"><i style="width:'+Math.max(0,Math.min(100,x.pct||0)).toFixed(1)+'%"></i></span>'+esc(nf(x.pct,2))+'</td><td>'+esc(refL(x.ref))+'</td><td>'+(x.vsPP!=null?esc(sg(x.vsPP,2))+' p.p.':'')+'</td></tr>';});
  tc+='</tbody></table>';
  h+='<div class="dr-cols"><section class="dr-pane"><h3>'+esc(T('Projeções de safra · IMEA','Crop projections · IMEA'))+'</h3><div class="dr-table-scroll im-scroll">'+tp+'</div></section>'+
    '<section class="dr-pane"><h3>'+esc(T('Comercialização · IMEA','Marketing · IMEA'))+'</h3><div class="dr-table-scroll im-scroll">'+tc+'</div></section></div>';
  const fontes=(d.fontes||[]).map(f=>'<li>'+(f.u?'<a href="'+esc(f.u)+'" target="_blank" rel="noopener">'+esc(f.t)+'</a>':esc(f.t))+'</li>').join('');
  h+='<div class="dr-source"><b>'+esc(T('Fonte:','Source:'))+'</b> '+esc(d.fonte||'IMEA')+'. '+esc(T('Os valores do IMEA não substituem os da Conab.','IMEA values do not replace Conab figures.'))+(fontes?'<ul class="im-fontes">'+fontes+'</ul>':'')+'</div>';
  el.innerHTML=h;
  mountChart(d,sf,pl,cm);
}
function mountChart(d,sf,pl,cm){
  const box=document.getElementById('im-chart');if(!box||!window.echarts)return;
  const ps=prevSafra(sf),cmp=conab(ps);
  const ser=[{name:'IMEA '+sf.slice(2),type:'line',color:'#0D9488',showSymbol:true,symbolSize:8,lineStyle:{width:2.6},data:pl.map(x=>({value:[dX(x.data,sf),x.pct],d:x.data}))},
             {name:'Conab '+sf.slice(2),type:'line',color:'#1A3A5C',showSymbol:true,symbolSize:6,lineStyle:{width:2},data:cm.map(([dd,v])=>({value:[dX(dd,sf),v],d:dd}))}];
  if(cmp.length>1)ser.push({name:'Conab '+ps.slice(2),type:'line',color:'#B5963E',showSymbol:false,lineStyle:{width:1.8,type:'dashed'},data:cmp.map(([dd,v])=>({value:[dX(dd,ps),v],d:dd}))});
  const m5=pl.filter(x=>x.media5!=null);if(m5.length>1)ser.push({name:T('IMEA média 5 anos','IMEA 5-yr avg'),type:'line',color:'#7FB8B2',showSymbol:true,symbolSize:6,lineStyle:{width:1.8,type:'dashed'},data:m5.map(x=>({value:[dX(x.data,sf),x.media5],d:x.data}))});
  const xs=ser.flatMap(s=>s.data.map(p=>p.value[0])),xmax=Math.max(60,Math.min(150,Math.ceil((Math.max(...xs)+10)/10)*10));
  const opt={xAxis:{type:'value',min:0,max:xmax,axisLabel:{fontSize:11,formatter:v=>{const dt=new Date(day0(sf)+v*864e5);return en()?MES_EN[dt.getUTCMonth()]:MESC[dt.getUTCMonth()];}}},
    yAxis:{type:'value',max:100,axisLabel:{fontSize:11,formatter:'{value}%'}},
    tooltip:{trigger:'axis',formatter:ps0=>ps0.map(p=>p.marker+esc(p.seriesName)+': <b>'+nfL(p.value[1],p.seriesName.indexOf('IMEA')===0?2:1)+'%</b>'+(p.data&&p.data.d?' · '+dL(p.data.d):'')).join('<br>')},
    dataZoom:[{type:'inside'}],toolbox:{feature:{saveAsImage:{name:'IMEA_MT_plantio_soja'},dataView:{}}},series:ser};
  chart=window.echarts.init(box);chart.setOption(opt,true);ro=new ResizeObserver(()=>chart&&chart.resize());ro.observe(box);
}

/* ── Excel do IMEA ── */
function xlsx(){
  const d=D();if(!d||!window.BRZXLSX)return;
  window.BRZXLSX.download('BRZ_IMEA_MT_'+(d.atualizado||'')+'.xlsx',sheets(d));
}
function sheets(d){
  return [
   {name:'IMEA plantio',rows:[['Cultura','Safra','Semana até','% plantado','Ano anterior (%)','Média 5 anos (%)']].concat((d.plantio||[]).slice().sort(byDate).map(x=>[x.cultura,x.safra,x.data,x.pct,x.anoAnt,x.media5])),widths:[12,10,14,12,16,16],fmt:{2:'date',3:'n2',4:'n2',5:'n2'}},
   {name:'IMEA macrorregiões',rows:[['Cultura','Data','Macrorregião','% plantado','Avanço na semana (p.p.)']].concat((d.regioes||[]).slice().sort(byDate).map(x=>[x.cultura,x.data,x.regiao,x.pct,x.avanco])),widths:[12,14,18,12,22],fmt:{1:'date',3:'n2',4:'n2'}},
   {name:'IMEA projeções',rows:[['Cultura','Referência','Área (Mi ha)','Produtividade (sc/ha)','Produção (Mi t)','Pluma (Mi t)','Nota']].concat((d.projecoes||[]).map(x=>[x.cultura,x.data,x.area,x.produt,x.prod,x.pluma,x.nota||''])),widths:[12,12,13,20,15,13,40],fmt:{2:'n2',3:'n2',4:'n2',5:'n2'}},
   {name:'IMEA comercialização',rows:[['Cultura','Relatório','Safra','% vendido','vs mesmo período anterior (p.p.)']].concat((d.comercializacao||[]).map(x=>[x.cultura,x.ref,x.safra,x.pct,x.vsPP])),widths:[12,12,10,12,30],fmt:{3:'n2',4:'n2'}},
   {name:'IMEA fontes',rows:[['Fonte','Endereço']].concat((d.fontes||[]).map(f=>[f.t,f.u||''])),widths:[60,90],fmt:{},filter:false}];
}

/* ── Base → IMEA MT: editor ── */
const ED={
  plantio:{t:['Plantio semanal','Weekly planting'],cols:[['cultura','Cultura','text'],['safra','Safra','text'],['data','Semana até','date'],['pct','% plantado','num'],['anoAnt','Ano anterior %','num'],['media5','Média 5 anos %','num']]},
  regioes:{t:['Macrorregiões','Macro-regions'],cols:[['cultura','Cultura','text'],['data','Data','date'],['regiao','Macrorregião','text'],['pct','% plantado','num'],['avanco','Avanço p.p.','num']]},
  projecoes:{t:['Projeções','Projections'],cols:[['cultura','Cultura','text'],['data','Referência (AAAA-MM-DD ou AAAA-MM)','text'],['area','Área Mi ha','num'],['produt','Produtividade sc/ha','num'],['prod','Produção Mi t','num'],['pluma','Pluma Mi t','num'],['nota','Nota','text']]},
  comercializacao:{t:['Comercialização','Marketing'],cols:[['cultura','Cultura','text'],['ref','Relatório (AAAA-MM)','text'],['safra','Safra','text'],['pct','% vendido','num'],['vsPP','vs ano anterior p.p.','num']]}
};
const cellTxt=(v,ty)=>v==null?'':ty==='num'?String(v).replace('.',','):String(v);
function edTable(key){
  const spec=ED[key],rows=((D()||{})[key])||[];
  return '<div class="im-ed" data-ed="'+key+'"><div class="im-edh"><b>'+esc(T(spec.t[0],spec.t[1]))+'</b><button type="button" data-im-add="'+key+'">+ '+esc(T('linha','row'))+'</button></div>'+
   '<div class="dbwrap im-edwrap"><table class="db"><thead><tr>'+spec.cols.map(c=>'<th>'+esc(c[1])+'</th>').join('')+'<th></th></tr></thead><tbody>'+
   rows.map(r=>'<tr>'+spec.cols.map(c=>'<td contenteditable="true" data-c="'+c[0]+'">'+esc(cellTxt(r[c[0]],c[2]))+'</td>').join('')+'<td class="del" data-im-del>✕</td></tr>').join('')+'</tbody></table></div></div>';
}
function readEd(key){
  const spec=ED[key],out=[];
  document.querySelectorAll('#pane-imea .im-ed[data-ed="'+key+'"] tbody tr').forEach(tr=>{
    const o={};let any=false;
    spec.cols.forEach(([k,,ty])=>{const td=tr.querySelector('td[data-c="'+k+'"]');const s=td?td.textContent.trim():'';
      if(ty==='num'){const n=parseFloat(s.replace(/\s/g,'').replace(',','.'));o[k]=s===''||!isFinite(n)?null:n;if(o[k]!=null)any=true;}
      else{o[k]=s||null;if(s)any=true;}});
    if(any)out.push(o);});
  return out;
}
function baseMount(){
  const tabs=document.getElementById('base-sub');if(!tabs)return;
  tabs.querySelectorAll('[data-bsub="imea"]').forEach(x=>x.remove());document.querySelectorAll('#pane-imea').forEach(x=>x.remove());
  const btn=document.createElement('button');btn.dataset.bsub='imea';btn.textContent='IMEA MT';tabs.appendChild(btn);
  const pane=document.createElement('div');pane.id='pane-imea';pane.className='base-pane';pane.style.display='none';
  document.getElementById('scr-base').querySelector('.base-wrap').appendChild(pane);
  paneFill(pane);
  btn.onclick=()=>{tabs.querySelectorAll('button').forEach(t=>t.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('#scr-base .base-pane').forEach(x=>x.style.display='none');pane.style.display='block';};
  tabs.querySelectorAll('button:not([data-bsub="imea"])').forEach(x=>x.addEventListener('click',()=>{pane.style.display='none';}));
}
function paneFill(pane){
  pane=pane||document.getElementById('pane-imea');if(!pane)return;const d=D()||{};
  pane.innerHTML='<div class="db-tools"><button type="button" class="primary" data-im="apply">'+esc(T('Aplicar IMEA','Apply IMEA'))+'</button><button type="button" data-im="xlsx">Excel</button>'+
   '<label class="im-lab">'+esc(T('Safra','Crop year'))+' <input type="text" data-im-meta="safra" value="'+esc(d.safra||'2026/27')+'"></label>'+
   '<label class="im-lab">'+esc(T('Atualizado em','Updated'))+' <input type="text" data-im-meta="atualizado" value="'+esc(d.atualizado||'')+'" placeholder="AAAA-MM-DD"></label>'+
   '<span class="meta">'+esc(T('Edite as células, use + linha para novos boletins e clique em Aplicar IMEA. Números com vírgula ou ponto; datas AAAA-MM-DD.','Edit the cells, use + row for new bulletins and click Apply IMEA. Numbers with comma or dot; dates YYYY-MM-DD.'))+'</span></div>'+
   '<div class="im-edgrid">'+edTable('plantio')+edTable('regioes')+edTable('projecoes')+edTable('comercializacao')+'</div>';
}
function apply(){
  const d=C.imeaMT=C.imeaMT||{};
  ['plantio','regioes','projecoes','comercializacao'].forEach(k=>{d[k]=readEd(k);});
  document.querySelectorAll('#pane-imea [data-im-meta]').forEach(i=>{d[i.dataset.imMeta]=i.value.trim()||d[i.dataset.imMeta];});
  window._dataDirty=true;render();paneFill();
  if(typeof toast==='function')toast(T('Base IMEA aplicada ✓','IMEA base applied ✓'));
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-im]');
  if(b){const a=b.dataset.im;if(a==='xlsx')xlsx();else if(a==='apply')apply();else if(a==='base'){if(typeof show==='function')show('scr-base');const t=document.querySelector('#base-sub [data-bsub="imea"]');if(t)t.click();}return;}
  const ad=e.target.closest('[data-im-add]');
  if(ad){const key=ad.dataset.imAdd,spec=ED[key],tb=document.querySelector('#pane-imea .im-ed[data-ed="'+key+'"] tbody');if(!tb)return;
    const last=tb.lastElementChild,tr=document.createElement('tr');
    tr.innerHTML=spec.cols.map(c=>'<td contenteditable="true" data-c="'+c[0]+'">'+(c[0]==='cultura'||c[0]==='safra'?esc(last?(last.querySelector('td[data-c="'+c[0]+'"]')||{}).textContent||'':''):'')+'</td>').join('')+'<td class="del" data-im-del>✕</td>';
    tb.appendChild(tr);const f=tr.querySelector('td[data-c="data"],td[data-c="ref"]');if(f)f.focus();return;}
  if(e.target.closest('[data-im-del]')){e.target.closest('tr').remove();}
});
let lastLang=null;
function init(){
  render();baseMount();
  const scr=document.getElementById('scr-imea');
  if(scr)new MutationObserver(()=>{if(scr.classList.contains('on')&&chart)requestAnimationFrame(()=>chart&&chart.resize());}).observe(scr,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>{const l=document.documentElement.lang;if(l!==lastLang){lastLang=l;render();paneFill();}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  lastLang=document.documentElement.lang;
  window.BRZIMEA={render,sheets:()=>sheets(D()||{}),data:D};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
