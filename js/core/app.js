
/* ═══════════ BRZ SAFRA — build s32 · gabarito EUA e43 ═══════════ */
/* Padrão visual/arquitetura: BRZ Exportações Americanas e43 */
'use strict';
const BUILD='s33 · 03Nov';
let NAVY='#1A3A5C',TEAL='#0D9488',BEGE='#B5963E',CINZA='#9aa3ad',PRETO='#000',GELO='#dfe5ea';
let IDADE_COR=[NAVY,TEAL,BEGE,CINZA,'#c9d1d8'];
const IDADE_ST=[{w:2.4,dots:1,lbl:1},{w:1.8},{w:1.4,dash:'5 3'},{w:1.4,dash:'2 3'},{w:1.2,dash:'2 3'}];
const idadeDe=(ss,s)=>ss.length-1-ss.indexOf(s);
let PAL6=[NAVY,TEAL,BEGE,'#5b7ca6','#63b8b0','#8a9099'];
const FONT="'Arial Nova Cond','Arial Nova Condensed','Arial Narrow',Arial,sans-serif";
const NF1=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
const NF0=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
const f1=v=>NF1.format(v), f0=v=>NF0.format(v);
const NF2=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}), f2=v=>NF2.format(v);
/* s29: casas decimais conforme o passo do eixo (UF pequena não repete 0, 0, 0) e valor abaixo de 1 com 2 casas */
const NFX=[0,1,2,3].map(d=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}));
function fTick(tk,min){const st=tk.length>1?Math.abs(tk[1]-tk[0]):1;let d=st>=1-1e-9?0:st>=0.1-1e-9?1:st>=0.01-1e-9?2:3;if(min!=null)d=Math.max(d,min);return v=>NFX[d].format(v);}
const fVal=v=>(v!==0&&Math.abs(v)<1)?NFX[2].format(v):NF1.format(v);
const fp=v=>NF1.format(v).replace(',0','')+'%';
const WM='<use data-wm="1" href="#brzlogo" x="143" y="29" width="143" height="118" opacity="0.25"/>';
let HIDDEN=null; const HID=l=>!!(HIDDEN&&HIDDEN.has(l));
let CORES=null; const COR=(l,d)=>(CORES&&CORES[l])||d;
function syncHousePalette(){
  IDADE_COR=[NAVY,TEAL,BEGE,CINZA,'#c9d1d8'];
  PAL6=[NAVY,TEAL,BEGE,'#5b7ca6','#63b8b0','#8a9099'];
}

/* ── motor SVG (dimensões e helpers idênticos à família) ── */
const W=414,H=190,ML=30,MR=8,MT=8,MB=16;
const X=(v,a,b)=>ML+(v-a)/(b-a)*(W-ML-MR);
const Y=(v,a,b)=>H-MB-(v-a)/(b-a)*(H-MT-MB);
const AX=()=>`<line class="axis0" x1="${ML}" y1="${H-MB}" x2="${W-MR}" y2="${H-MB}"/>`;
const TY=(vals,a,b,f)=>vals.filter(v=>v>=a-1e-9&&v<=b+1e-9).map(v=>`<text x="${ML-5}" y="${(Y(v,a,b)+3).toFixed(1)}" class="ytick" text-anchor="end">${f(v)}</text>`).join('');
const GRID=(vals,a,b)=>vals.filter(v=>v>a+1e-9&&v<=b+1e-9).map(v=>`<line x1="${ML}" x2="${W-MR}" y1="${Y(v,a,b)}" y2="${Y(v,a,b)}" stroke="#eef1f5"/>`).join('');
function LN(pts,a,b,xa,xb,cor,w2,dash){
  const seg=pts.filter(p=>p.v!=null);
  if(!seg.length)return'';
  const d=seg.map((p,i)=>(i?'L':'M')+X(p.x,xa,xb).toFixed(1)+' '+Y(p.v,a,b).toFixed(1)).join('');
  return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${w2||1.6}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
}
const SW=inner=>`<svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:#fff">${WM}${inner}</svg>`;
const nice=v=>{const p=Math.pow(10,Math.floor(Math.log10(v||1)));const n=v/p;return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p;};
function ticks4(mx){const t=nice(mx/3.2);const o=[];for(let v=0;v<=mx+t*0.999;v+=t)o.push(+v.toFixed(6));return o;}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

/* ── camada de dados ── */
const C=window.C;
const MESES=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const NOME2SIG={}; Object.entries(C.meta.ufNome).forEach(([sig,nome])=>NOME2SIG[nome]=sig);
const SIG2NOME=C.meta.ufNome;
/* mês-âncora do eixo (semana 0 = dia 1 do mês âncora) */
const ANCORA={'Soja':9,'Milho 1ª':9,'Milho 2ª':1,'Trigo':4,'Algodão':11,'Arroz':9,'Feijão 1ª':9};
/* extensão do eixo em semanas, por cultura */
const XSPAN={'Soja':44,'Milho 1ª':48,'Milho 2ª':42,'Trigo':42,'Algodão':48,'Arroz':46,'Feijão 1ª':46};
const PROGCULTS=['Soja','Milho 1ª','Milho 2ª','Trigo','Algodão','Arroz','Feijão 1ª'];
const temProg=c=>PROGCULTS.includes(c)&&C.prog[c];

function anoBase(cult,safra){
  const a=parseInt(safra,10);
  if(cult==='Milho 2ª')return a+1;      /* 2025/26 → jan/2026 */
  if(cult==='Trigo')return a;           /* 2026 → abr/2026 */
  if(cult==='Algodão')return a;         /* 2025/26 → nov/2025 */
  return a;                             /* verão: 2025/26 → set/2025 */
}
const WEEK_MS=7*864e5;
const parseISODate=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(Date.UTC(y,m-1,d));};
function weekEndSaturday(d0){
  const d=new Date(d0.getTime());
  d.setUTCDate(d.getUTCDate()+(6-d.getUTCDay()+7)%7);
  return d;
}
const saturdayISO=iso=>weekEndSaturday(parseISODate(iso)).toISOString().slice(0,10);
function _ancCult(cult,safra){return new Date(Date.UTC(anoBase(cult,safra),(ANCORA[cult]||9)-1,1));}
function _semCult(cult,safra,iso){
  const d=weekEndSaturday(parseISODate(iso));
  const a=weekEndSaturday(_ancCult(cult,safra));
  return Math.round((d-a)/WEEK_MS);
}
const addMonths=(d,n)=>new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+n,1));
const _OPWIN={};
/* janela do eixo por cultura×operação, derivada dos dados BR das 5 safras */
function OPWIN(cult,oper){
  const k=cult+'|'+oper;
  if(_OPWIN[k])return _OPWIN[k];
  const fallback={shift:0,weeks:XSPAN[cult]||46};
  if(!temProg(cult))return _OPWIN[k]=fallback;
  const ss=Object.keys(C.prog[cult]).filter(s=>C.prog[cult][s][oper]).sort((a,b)=>parseInt(a)-parseInt(b)).slice(-5);
  if(!ss.length)return _OPWIN[k]=fallback;
  const atual=ss[ss.length-1];
  let ini=Infinity,fim=-Infinity;
  ss.forEach(sf=>{
    const arr=((C.prog[cult][sf][oper]||{})['BR'])||[];
    if(!arr.length)return;
    const pts=arr.map(([d,p])=>({x:_semCult(cult,sf,d),v:p})).sort((a,b)=>a.x-b.x);
    const p0=pts.find(p=>p.v>=0.5)||pts[0];
    if(p0&&p0.x<ini)ini=p0.x;
    const pF=pts.find(p=>p.v>=99.5);
    if(pF){if(pF.x>fim)fim=pF.x;}
    else if(sf!==atual){const last=pts[pts.length-1];if(last&&last.x>fim)fim=last.x;}
  });
  if(!isFinite(ini)||!isFinite(fim)||fim<=ini)return _OPWIN[k]=fallback;
  const ref=weekEndSaturday(_ancCult(cult,atual));
  const dIni=new Date(ref.getTime()+ini*WEEK_MS);
  const anc0=new Date(Date.UTC(dIni.getUTCFullYear(),dIni.getUTCMonth(),1));
  const shift=(anc0.getUTCFullYear()-ref.getUTCFullYear())*12+(anc0.getUTCMonth()-ref.getUTCMonth());
  const dFim=new Date(ref.getTime()+fim*WEEK_MS);
  const endM=new Date(Date.UTC(dFim.getUTCFullYear(),dFim.getUTCMonth()+1,1));
  const weeks=Math.ceil((endM-anc0)/WEEK_MS);
  return _OPWIN[k]={shift,weeks:Math.max(8,weeks)};
}
function ancDate(cult,safra,oper){
  const b=_ancCult(cult,safra);
  return oper?addMonths(b,OPWIN(cult,oper).shift):b;
}
function semIdx(cult,safra,iso,oper){
  const d=weekEndSaturday(parseISODate(iso));
  const a=weekEndSaturday(ancDate(cult,safra,oper));
  return Math.round((d-a)/WEEK_MS);
}
function safrasProg(cult,oper){
  if(!temProg(cult))return[];
  const ss=Object.keys(C.prog[cult]).filter(s=>C.prog[cult][s][oper]);
  ss.sort((a,b)=>parseInt(a)-parseInt(b));
  return ss.slice(-5);
}
function serieProg(cult,safra,oper,uf){
  const o=(((C.prog[cult]||{})[safra]||{})[oper]||{})[uf]||[];
  const semanas=new Map();
  o.forEach(([d,p])=>{
    const x=semIdx(cult,safra,d,oper),anterior=semanas.get(x);
    /* Base pode receber leituras diárias; a comparação usa a última leitura da semana encerrada no sábado. */
    if(!anterior||d>=anterior.sourceDate)semanas.set(x,{x,v:p,d:saturdayISO(d),sourceDate:d});
  });
  return [...semanas.values()].filter(p=>p.x>=-2).sort((a,b)=>a.x-b.x);
}
function ufsDe(cult){
  if(!temProg(cult))return['BR'];
  const s=new Set();
  Object.values(C.prog[cult]).forEach(sf=>Object.values(sf).forEach(op=>Object.keys(op).forEach(u=>s.add(u))));
  const arr=[...s].filter(u=>u!=='BR');
  arr.sort();
  return ['BR',...arr];
}
function histIdx(cult,safra){const h=C.hist[cult];return h?h.safras.indexOf(safra):-1;}
function prodDe(cult,safra,ufNome){
  const h=C.hist[cult]; if(!h)return null;
  const i=histIdx(cult,safra); if(i<0)return null;
  const key=ufNome==='BR'?'BR':(NOME2SIG[ufNome]||ufNome);
  const arr=h.prod[key]; return arr?arr[i]:null;   /* mil t */
}
function histSerie(cult,tipo,key,n){
  const h=C.hist[cult]; if(!h)return{safras:[],vals:[]};
  const arr=(h[tipo]||{})[key]||[];
  const k=Math.min(n||15,h.safras.length);
  return {safras:h.safras.slice(-k),vals:arr.slice(-k)};
}
function ultimoPonto(cult,safra,oper,uf){
  const s=serieProg(cult,safra,oper,uf);
  return s.length?s[s.length-1]:null;
}
function semanasDisponiveis(cult,oper){
  if(!temProg(cult))return[];
  const op=oper||'Colheita',sf=safraDaOper(cult,op)||safraAtual(cult);
  let arr=serieProg(cult,sf,op,'BR').map(p=>p.d);
  if(!arr.length){
    const set=new Set();ufsDe(cult).forEach(u=>serieProg(cult,sf,op,u).forEach(p=>set.add(p.d)));arr=[...set];
  }
  return [...new Set(arr)].sort();
}
function pontoNaSemana(cult,safra,oper,uf,dataSel){
  if(!dataSel)return ultimoPonto(cult,safra,oper,uf);
  const x=semIdx(cult,safra,dataSel,oper),v=pctNaSemana(cult,safra,oper,uf,x);
  return v==null?null:{x,v,d:dataSel};
}
function pctNaSemana(cult,safra,oper,uf,x){
  const s=serieProg(cult,safra,oper,uf);
  if(!s.length)return null;
  if(x<=s[0].x)return s[0].x-x>3?null:s[0].v;
  for(let i=1;i<s.length;i++){
    if(s[i].x>=x){
      const a=s[i-1],b=s[i];
      if(b.x-a.x>6)return a.v;  /* buraco grande: segura último */
      return a.v+(b.v-a.v)*(x-a.x)/(b.x-a.x);
    }
  }
  return s[s.length-1].v;
}
function media5(cult,oper,uf,x,exclui){
  const ss=safrasProg(cult,oper).filter(s=>s!==exclui);
  const vs=ss.map(s=>pctNaSemana(cult,s,oper,uf,x)).filter(v=>v!=null);
  return vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:null;
}
const safraProducao=cult=>{const h=C.hist[cult];return h&&h.safras.length?h.safras[h.safras.length-1]:null;};
const safraPlantio=cult=>{const ss=safrasProg(cult,'Semeadura');return ss.length?ss[ss.length-1]:null;};
const safraColheita=cult=>{const ss=safrasProg(cult,'Colheita');return ss.length?ss[ss.length-1]:null;};
/* Mantém a safra efetivamente em colheita nos gráficos de colheita anteriores. */
const safraAtual=cult=>safraColheita(cult)||safraProducao(cult);
const safraAnt=(cult,s)=>{const ss=safrasProg(cult,'Colheita');const i=ss.indexOf(s);return i>0?ss[i-1]:null;};
/* s26: campanha em andamento. Operação ativa = leitura Conab mais recente; empate fica com a menos avançada. */
function safraDaOper(cult,oper){return oper==='Semeadura'?safraPlantio(cult):safraColheita(cult);}
function safraAntOper(cult,oper,s){const ss=safrasProg(cult,oper);const i=ss.indexOf(s);return i>0?ss[i-1]:null;}
function opAtiva(cult){
  if(!temProg(cult))return 'Colheita';
  const ult=op=>{const sf=safraDaOper(cult,op);if(!sf)return null;let p=ultimoPonto(cult,sf,op,'BR');
    if(!p)ufsDe(cult).forEach(u=>{const q=ultimoPonto(cult,sf,op,u);if(q&&(!p||q.d>p.d))p=q;});
    return p;};
  const s=ult('Semeadura'),c=ult('Colheita');
  if(!s)return 'Colheita'; if(!c)return 'Semeadura';
  if(s.d!==c.d)return s.d>c.d?'Semeadura':'Colheita';
  return s.v<=c.v?'Semeadura':'Colheita';
}
/* s26: publicação Conab mais recente quando a Série Histórica não cobre a cultura (Arroz, Feijão) */
function vintRec(cult,ufNome){
  const VVs=C.vintages||[],v=VVs[VVs.length-1],r=v&&v.records&&v.records[cult];if(!r)return null;
  const ss=Object.keys(r).sort((a,b)=>parseInt(a)-parseInt(b));if(!ss.length)return null;
  const key=(!ufNome||ufNome==='BR')?'BR':(NOME2SIG[ufNome]||ufNome);
  const sf=ss[ss.length-1],sa=ss.length>1?ss[ss.length-2]:null;
  return {sf,sa,now:(r[sf]||{})[key]||null,prev:sa?((r[sa]||{})[key]||null):null};
}
/* s26: área por UF (mil ha) da safra; Série Histórica primeiro, publicação Conab como reserva */
function areaDe(cult,safra,ufNome){
  const key=ufNome==='BR'?'BR':(NOME2SIG[ufNome]||ufNome),h=C.hist[cult];
  if(h){const i=histIdx(cult,safra);if(i>=0){const arr=(h.area||{})[key];if(arr&&arr[i]!=null)return arr[i];}}
  const VVs=C.vintages||[];
  for(let k=VVs.length-1;k>=0;k--){const r=((((VVs[k].records||{})[cult]||{})[safra])||{})[key];if(r&&r[0]!=null)return r[0];}
  return null;
}
function fmtData(iso){const[y,m,d]=iso.split('-');return d+'/'+m+'/'+y.slice(2);}
function mesesTicks(cult,xb,oper){
  const out=[];const anc=(ANCORA[cult]||9)+(oper?OPWIN(cult,oper).shift:0);
  const base=weekEndSaturday(new Date(Date.UTC(2023,anc-1,1)));
  for(let i=0;i<16;i++){
    const m0=new Date(Date.UTC(2023,anc-1+i,1));
    const wk=Math.round((weekEndSaturday(m0)-base)/WEEK_MS);
    if(wk>xb)break;
    out.push({x:wk,lbl:MESES[m0.getUTCMonth()]});
  }
  return out;
}

/* ═══════════ gráficos (SVG string) ═══════════ */
const VAZIO=msg=>SW(`<text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="11" fill="#888">${msg||'sem dados'}</text>`);
const sfLbl=s=>s.includes('/')?s.slice(2):s;   /* 2025/26 → 25/26 ; Trigo 2026 → 2026 */
const corSafra=(ss,s)=>IDADE_COR[idadeDe(ss,s)]||'#E2E8F0';

/* curva de progresso — % × semana do ano-safra, 5 safras */
function gProg(cult,oper,uf){
  const ss=safrasProg(cult,oper); if(!ss.length)return VAZIO();
  const xb=OPWIN(cult,oper).weeks;
  const TOPO=106;   /* s26: folga acima de 100% para o rótulo final caber no card */
  let s=AX()+TY([0,25,50,75,100],0,TOPO,v=>v+'%');
  mesesTicks(cult,xb,oper).forEach(t=>{s+=`<text x="${X(t.x,0,xb)}" y="${H-MB+13}" class="xlab" text-anchor="middle">${t.lbl}</text>`;});
  ss.forEach(sf=>{
    if(HID(sfLbl(sf)))return;
    const pts=serieProg(cult,sf,oper,uf).filter(p=>p.x>=0&&p.x<=xb);
    if(pts.length<2)return;
    const idade=idadeDe(ss,sf), st=IDADE_ST[idade]||IDADE_ST[4];
    const cor=corSafra(ss,sf);
    s+=LN(pts,0,TOPO,0,xb,cor,st.w,st.dash);
    if(st.dots)pts.forEach(p=>{s+=`<circle cx="${X(p.x,0,xb).toFixed(1)}" cy="${Y(p.v,0,TOPO).toFixed(1)}" r="2.6" fill="${cor}" stroke="#fff" stroke-width="1"/>`;});
    if(st.lbl){
      const u=pts[pts.length-1];
      const tx=Math.max(34,Math.min(X(u.x,0,xb),W-14));
      s+=`<text class="val etext" x="${tx.toFixed(1)}" y="${(Y(u.v,0,TOPO)-5.5).toFixed(1)}" text-anchor="middle" fill="${cor}">${fp(u.v)}</text>`;
    }
  });
  return SW(s);
}

/* painel executivo — números-chave */
function gExec(cult,uf,dataSel){
  const sf=safraProducao(cult),rows=[];
  if(temProg(cult)){
    for(const [op,lbl] of [['Semeadura','Plantio'],['Colheita','Colheita']]){
      const campaign=op==='Semeadura'?safraPlantio(cult):safraColheita(cult);
      if(!campaign)continue;
      // Não aplicar semana seletora da safra antiga a uma nova campanha diferente.
      const pt=ultimoPonto(cult,campaign,op,uf);
      if(!pt)continue;
      const ss=safrasProg(cult,op),idx=ss.indexOf(campaign),prev=idx>0?ss[idx-1]:null;
      const last=prev?pctNaSemana(cult,prev,op,uf,pt.x):null;
      rows.push({t:lbl+' '+sfLbl(campaign),v:fp(pt.v),s:(last==null?'':('ano-1: '+fp(last)+' · '+(pt.v-last>=0?'+':'')+f1(pt.v-last)+' p.p.')),d:pt.d});
    }
  }
  if(sf&&C.hist[cult]){
    const h=C.hist[cult],i=histIdx(cult,sf),k=uf==='BR'?'BR':(NOME2SIG[uf]||uf);
    const prod=(h.prod[k]||[])[i],ant=i>0?(h.prod[k]||[])[i-1]:null;
    const area=(h.area[k]||[])[i],yieldkg=(h.produt[k]||[])[i];
    if(prod!=null)rows.push({t:'Produção '+sfLbl(sf),v:f2(prod/1000)+' Mi t',s:ant!=null&&ant!==0?('ano-1: '+(prod>=ant?'+':'')+f1((prod/ant-1)*100)+'%'):''});
    if(area!=null&&yieldkg!=null)rows.push({t:'Área · Produtividade '+sfLbl(sf),v:f2(area/1000)+' Mi ha',s:f1(yieldkg/60)+' sc/ha'});
  }
  if(!C.hist[cult]){const vr=vintRec(cult,uf);
    if(vr&&vr.now){const area=vr.now[0],yieldkg=vr.now[1],prod=vr.now[2],ant=vr.prev?vr.prev[2]:null;
      if(prod!=null)rows.push({t:'Produção '+sfLbl(vr.sf),v:f2(prod/1000)+' Mi t',s:ant!=null&&ant!==0?('ano-1: '+(prod>=ant?'+':'')+f1((prod/ant-1)*100)+'%'):''});
      if(area!=null&&yieldkg)rows.push({t:'Área · Produtividade '+sfLbl(vr.sf),v:f2(area/1000)+' Mi ha',s:f1(yieldkg/60)+' sc/ha'});}}
  if(!rows.length)return VAZIO();
  const yy=rows.length>4?33:39,ystart=25;let s='';
  rows.forEach((r,i)=>{const y=ystart+i*yy;
    s+=`<text x="24" y="${y}" class="pl">${r.t}${r.d?' · até '+fmtData(r.d):''}</text>`;
    s+=`<text x="24" y="${y+15}" class="pv" fill="${NAVY}">${r.v}</text>`;
    if(r.s)s+=`<text x="177" y="${y+15}" class="ps">${r.s}</text>`;
  });return SW(s);
}

/* volume acumulado (Mi t) — colheita × produção da própria safra */
function gVolAcum(cult,uf){
  const ss=safrasProg(cult,'Colheita'); if(!ss.length)return VAZIO();
  const xb=OPWIN(cult,'Colheita').weeks;
  const series=ss.map(sf=>{
    const prod=prodDe(cult,sf,uf); if(prod==null)return null;
    const pts=serieProg(cult,sf,'Colheita',uf).filter(p=>p.x>=0&&p.x<=xb)
      .map(p=>({x:p.x,v:prod*p.v/100/1000,d:p.d,pct:p.v}));
    return pts.length>1?{sf,pts}:null;
  }).filter(Boolean);
  if(!series.length)return VAZIO();
  let mx=0;series.forEach(q=>q.pts.forEach(p=>{if(p.v>mx)mx=p.v;}));
  const tk=ticks4(mx),b=tk[tk.length-1]*1.08;
  let s=AX()+TY(tk,0,b,fTick(tk));
  mesesTicks(cult,xb,'Colheita').forEach(t=>{s+=`<text x="${X(t.x,0,xb)}" y="${H-MB+13}" class="xlab" text-anchor="middle">${t.lbl}</text>`;});
  series.forEach(q=>{
    if(HID(sfLbl(q.sf)))return;
    const idade=idadeDe(ss,q.sf), st=IDADE_ST[idade]||IDADE_ST[4];
    const cor=corSafra(ss,q.sf);
    s+=LN(q.pts,0,b,0,xb,cor,st.w,st.dash);
    if(st.dots)q.pts.forEach(p=>{s+=`<circle cx="${X(p.x,0,xb).toFixed(1)}" cy="${Y(p.v,0,b).toFixed(1)}" r="2.6" fill="${cor}" stroke="#fff" stroke-width="1"/>`;});
    if(st.lbl){
      const u=q.pts[q.pts.length-1];
      s+=`<text class="val etext" x="${Math.max(30,Math.min(X(u.x,0,xb),W-16)).toFixed(1)}" y="${(Y(u.v,0,b)-5.5).toFixed(1)}" text-anchor="middle" fill="${cor}">${fVal(u.v)}</text>`;
    }
  });
  return SW(s);
}

/* barras por UF: feito × a fazer na campanha da operação ativa (colheita em Mi t; plantio em Mi ha) */
function gVolUF(cult,dataSel,oper){
  oper=oper||'Colheita';const pl=oper==='Semeadura';
  const sf=safraDaOper(cult,oper)||safraAtual(cult); if(!sf||!temProg(cult))return VAZIO();
  const LF=pl?'plantado':'colhido',LR=pl?'a plantar':'a colher',UN=pl?'Mi ha':'Mi t';
  const ufs=ufsDe(cult).filter(u=>u!=='BR');
  const dat=ufs.map(u=>{
    const base=pl?areaDe(cult,sf,u):prodDe(cult,sf,u), pt=pontoNaSemana(cult,sf,oper,u,dataSel);
    if(base==null||!pt)return null;
    return {sig:NOME2SIG[u]||u,feito:base*pt.v/100/1000,resto:base/1000*(1-pt.v/100),pct:pt.v};
  }).filter(Boolean).sort((a,b)=>(b.feito+b.resto)-(a.feito+a.resto));
  if(!dat.length)return VAZIO();
  const mx=Math.max(...dat.map(d=>d.feito+d.resto));
  const tk=ticks4(mx),b=tk[tk.length-1]*1.12;
  let s=AX()+TY(tk,0,b,fTick(tk));
  const bw=Math.min(26,(W-ML-MR)/dat.length*0.62);
  dat.forEach((d,i)=>{
    const xc=X(i+0.5,0,dat.length);
    const y1=Y(d.feito,0,b), y2=Y(d.feito+d.resto,0,b);
    if(!HID(LR))s+=`<rect rx="1.5" x="${xc-bw/2}" y="${y2}" width="${bw}" height="${(y1-y2).toFixed(1)}" fill="${COR(LR,TEAL)}"><title>${d.sig} ${LR}: ${f1(d.resto)} ${UN}</title></rect>`;
    if(!HID(LF))s+=`<rect rx="1.5" x="${xc-bw/2}" y="${y1}" width="${bw}" height="${(H-MB-y1).toFixed(1)}" fill="${COR(LF,NAVY)}"><title>${d.sig} ${LF}: ${f1(d.feito)} ${UN} (${fp(d.pct)})</title></rect>`;
    s+=`<text x="${xc}" y="${H-MB+13}" class="xlab" text-anchor="middle">${d.sig}</text>`;
    s+=`<text x="${xc}" y="${Math.min(y1,y2)-3}" class="val" text-anchor="middle" fill="#000">${fVal(d.feito+d.resto)}</text>`;
  });
  return SW(s);
}

/* dumbbell por UF: % ano-1 → % atual, mesma semana */
function gDeltaUF(cult,oper,dataSel){
  const sf=safraDaOper(cult,oper)||safraAtual(cult), sa=safraAntOper(cult,oper,sf);
  if(!sf||!sa)return VAZIO();
  const ufs=ufsDe(cult).filter(u=>u!=='BR');
  const dat=ufs.map(u=>{
    const pt=pontoNaSemana(cult,sf,oper,u,dataSel); if(!pt)return null;
    const p1=pctNaSemana(cult,sa,oper,u,pt.x); if(p1==null)return null;
    return {sig:NOME2SIG[u]||u,a:p1,b:pt.v};
  }).filter(Boolean).sort((a,b)=>b.b-a.b);
  if(!dat.length)return VAZIO();
  const rh=(H-MT-MB)/dat.length;
  let s=`<line x1="${ML}" y1="${MT}" x2="${ML}" y2="${H-MB}" stroke="${PRETO}"/>`;
  [0,25,50,75,100].forEach(v=>{s+=`<line x1="${X(v,0,104)}" x2="${X(v,0,104)}" y1="${MT}" y2="${H-MB}" stroke="#eef1f5"/><text x="${X(v,0,104)}" y="${H-MB+13}" class="xlab" text-anchor="middle">${v}%</text>`;});
  dat.forEach((d,i)=>{
    const y=MT+rh*(i+0.5);
    const x1=X(d.a,0,104),x2=X(d.b,0,104);
    const corB=d.b>=d.a?COR('atual · alta',TEAL):COR('atual · queda',NAVY);
    s+=`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#c9d1d8" stroke-width="1.4"/>`;
    if(!HID('ano-1'))s+=`<circle cx="${x1}" cy="${y}" r="3" fill="${COR('ano-1','#c9b08a')}"><title>${d.sig} ano-1: ${fp(d.a)}</title></circle>`;
    s+=`<circle cx="${x2}" cy="${y}" r="3.4" fill="${corB}"><title>${d.sig} atual: ${fp(d.b)}</title></circle>`;
    s+=`<text x="${ML-5}" y="${y+3}" class="ytick" text-anchor="end">${d.sig}</text>`;
    const xr=Math.max(x1,x2)+6, lbl=(d.b>=d.a?'+':'−')+f1(Math.abs(d.b-d.a));
    s+=xr<=W-22?`<text x="${xr}" y="${y+3}" class="vs">${lbl}</text>`:`<text x="${Math.min(x1,x2)-6}" y="${y+3}" class="vs" text-anchor="end">${lbl}</text>`;
  });
  return SW(s);
}

/* ritmo semanal — p.p./sem da safra atual (barras) vs média 5 safras (linha) */
function gRitmo(cult,oper,uf){
  const ss=safrasProg(cult,oper); if(!ss.length)return VAZIO();
  const sf=ss[ss.length-1], xb=OPWIN(cult,oper).weeks;
  const cur=serieProg(cult,sf,oper,uf).filter(p=>p.x>=0&&p.x<=xb);
  if(cur.length<2)return VAZIO();
  const bars=[];
  for(let i=1;i<cur.length;i++){
    const dw=cur[i].x-cur[i-1].x;
    if(dw<=0||dw>3)continue;
    bars.push({x:cur[i].x,v:Math.max(0,(cur[i].v-cur[i-1].v)/dw),d:cur[i].d});
  }
  const med=[];
  for(let x=1;x<=xb;x+=1){
    const vs=ss.slice(0,-1).map(s0=>{
      const a=pctNaSemana(cult,s0,oper,uf,x-1),b=pctNaSemana(cult,s0,oper,uf,x);
      return (a!=null&&b!=null)?Math.max(0,b-a):null;
    }).filter(v=>v!=null);
    if(vs.length>=2)med.push({x,v:vs.reduce((a,b)=>a+b,0)/vs.length});
  }
  let mx=Math.max(...bars.map(b=>b.v),...med.map(m=>m.v),1);
  const tk=ticks4(mx),b=tk[tk.length-1]*1.1;
  let s=AX()+TY(tk,0,b,fTick(tk));
  mesesTicks(cult,xb,oper).forEach(t=>{s+=`<text x="${X(t.x,0,xb)}" y="${H-MB+13}" class="xlab" text-anchor="middle">${t.lbl}</text>`;});
  const bw=Math.max(3,(W-ML-MR)/xb*0.62);
  if(!HID(sfLbl(sf)+' · p.p./sem'))bars.forEach(bp=>{
    s+=`<rect rx="1.5" x="${X(bp.x,0,xb)-bw/2}" y="${Y(bp.v,0,b)}" width="${bw}" height="${(H-MB-Y(bp.v,0,b)).toFixed(1)}" fill="${COR(sfLbl(sf)+' · p.p./sem',TEAL)}"><title>${fmtData(bp.d)}: +${f1(bp.v)} p.p.</title></rect>`;});
  if(!HID('média 5 safras'))s+=LN(med,0,b,0,xb,COR('média 5 safras','#8a9099'),1.6,'4 3');
  return SW(s);
}

/* produção histórica — barras N safras */
function gHistProd(cult,uf,n){
  const key=uf==='BR'?'BR':(NOME2SIG[uf]||uf);
  const {safras,vals}=histSerie(cult,'prod',key,n||15);
  const dat=safras.map((s0,i)=>({s:s0,v:vals[i]!=null?vals[i]/1000:null})).filter(d=>d.v!=null);
  if(!dat.length)return VAZIO();
  const mx=Math.max(...dat.map(d=>d.v));
  const tk=ticks4(mx),b=tk[tk.length-1]*1.12;
  let s=AX()+TY(tk,0,b,fTick(tk));
  const bw=(W-ML-MR)/dat.length*0.66;
  dat.forEach((d,i)=>{
    const xc=X(i+0.5,0,dat.length);
    const cor=i===dat.length-1?COR('safra atual',NAVY):(i===dat.length-2?COR('ano-1',CINZA):COR('anteriores',GELO));
    s+=`<rect rx="1.5" x="${xc-bw/2}" y="${Y(d.v,0,b)}" width="${bw}" height="${(H-MB-Y(d.v,0,b)).toFixed(1)}" fill="${cor}"><title>${d.s}: ${f1(d.v)} Mi t</title></rect>`;
    if(i%2===dat.length%2)s+=`<text x="${xc}" y="${H-MB+13}" class="xlab" text-anchor="middle">${sfLbl(d.s)}</text>`;
    if(i>=dat.length-3)s+=`<text x="${xc}" y="${Y(d.v,0,b)-3}" class="val" text-anchor="middle">${fVal(d.v)}</text>`;
  });
  return SW(s);
}

/* área (barras) × produtividade sc/ha (linha, eixo dir) */
function gHistAP(cult,uf,n){
  const key=uf==='BR'?'BR':(NOME2SIG[uf]||uf);
  const A=histSerie(cult,'area',key,n||15), P=histSerie(cult,'produt',key,n||15);
  const dat=A.safras.map((s0,i)=>({s:s0,a:A.vals[i]!=null?A.vals[i]/1000:null,p:P.vals[i]!=null?P.vals[i]/60:null})).filter(d=>d.a!=null);
  if(!dat.length)return VAZIO();
  /* s26: plotagem termina antes do eixo direito; antes os rótulos de sc/ha saíam do viewBox */
  const MR2=24, NX=dat.length*(W-ML-MR)/(W-ML-MR2);
  const mxA=Math.max(...dat.map(d=>d.a)), tkA=ticks4(mxA), bA=tkA[tkA.length-1]*1.15;
  const ps=dat.map(d=>d.p).filter(v=>v!=null);
  const mxP=Math.max(...ps), mnP=Math.min(...ps), bP=mxP*1.08, aP=Math.max(0,mnP*0.85);
  let s=AX()+TY(tkA,0,bA,fTick(tkA,1));
  const bw=(W-ML-MR2)/dat.length*0.6;
  dat.forEach((d,i)=>{
    const xc=X(i+0.5,0,NX);
    if(!HID('área (Mi ha)'))s+=`<rect rx="1.5" x="${xc-bw/2}" y="${Y(d.a,0,bA)}" width="${bw}" height="${(H-MB-Y(d.a,0,bA)).toFixed(1)}" fill="${COR('área (Mi ha)',GELO)}"><title>${d.s}: ${f1(d.a)} Mi ha</title></rect>`;
    if(i%2===dat.length%2)s+=`<text x="${xc}" y="${H-MB+13}" class="xlab" text-anchor="middle">${sfLbl(d.s)}</text>`;
  });
  if(!HID('produtividade (sc/ha)')){
    const pts=dat.map((d,i)=>({x:i+0.5,v:d.p}));
    s+=LN(pts,aP,bP,0,NX,COR('produtividade (sc/ha)',TEAL),2);
    const u=pts.filter(p=>p.v!=null).pop();
    if(u)s+=`<text x="${X(u.x,0,NX)-4}" y="${Y(u.v,aP,bP)-6}" class="val" fill="${COR('produtividade (sc/ha)',TEAL)}" text-anchor="end">${f1(u.v)} sc/ha</text>`;
    [aP,(aP+bP)/2,bP].forEach(v=>{s+=`<text x="${W-MR2+4}" y="${Y(v,aP,bP)+3}" class="ytick" font-size="7">${f0(v)}</text>`;});
  }
  return SW(s);
}

/* stack milho: 1ª+2ª+3ª por safra (Mi t) */
function gStackMilho(n){
  const T=C.hist['Milho Total']; if(!T)return VAZIO();
  const k=Math.min(n||15,T.safras.length);
  const safras=T.safras.slice(-k);
  const seg=[['Milho 1ª','1ª safra',NAVY],['Milho 2ª','2ª safra',TEAL],['Milho 3ª','3ª safra',BEGE]];
  const dat=safras.map(s0=>{
    const o={s:s0,tot:0};
    seg.forEach(([c,lb])=>{
      const i=histIdx(c,s0);
      const v=i>=0?((C.hist[c].prod.BR||[])[i]||0)/1000:0;
      o[lb]=v;o.tot+=v;
    });
    return o;
  });
  const mx=Math.max(...dat.map(d=>d.tot));
  const tk=ticks4(mx),b=tk[tk.length-1]*1.12;
  let s=AX()+TY(tk,0,b,fTick(tk));
  const bw=(W-ML-MR)/dat.length*0.64;
  dat.forEach((d,i)=>{
    const xc=X(i+0.5,0,dat.length);let acc=0;
    seg.forEach(([c,lb,cor])=>{
      if(HID(lb))return;
      const v=d[lb];if(!v)return;
      const y1=Y(acc,0,b),y2=Y(acc+v,0,b);
      s+=`<rect rx="1.5" x="${xc-bw/2}" y="${y2}" width="${bw}" height="${(y1-y2).toFixed(1)}" fill="${COR(lb,cor)}"><title>${d.s} ${lb}: ${f1(v)} Mi t</title></rect>`;
      acc+=v;
    });
    if(i%2===dat.length%2)s+=`<text x="${xc}" y="${H-MB+13}" class="xlab" text-anchor="middle">${sfLbl(d.s)}</text>`;
    if(i>=dat.length-3)s+=`<text x="${xc}" y="${Y(acc,0,b)-3}" class="val" text-anchor="middle">${fVal(d.tot)}</text>`;
  });
  return SW(s);
}

/* ═══════════ cards / telas / estado (v4 — padrão e43) ═══════════ */
let _lgK=0;
function chip(lb,cor,bold){_lgK++;return `<span${bold?' style="font-weight:800;color:#000"':''}><input type="color" class="lgc" data-var="--c${_lgK}" value="${cor}" title="Cor da série"><b class="etext">${esc(lb)}</b></span>`;}
function rewriteVars(svg,map){for(const m of map){svg=svg.split('"'+m.cor+'"').join('"var('+m.v+')"');}return svg;}

function legFor(cult,spec){
  const cid=spec.id;
  if(spec.leg==='safras'){
    const oper=spec.oper||(cid==='prog_sem'?'Semeadura':'Colheita');
    const ss=safrasProg(cult,oper);
    return ss.slice().reverse().map(s0=>chip(sfLbl(s0),corSafra(ss,s0))).join('');
  }
  if(spec.leg==='voluf')return spec.oper==='Semeadura'?chip('plantado',NAVY)+chip('a plantar',TEAL):chip('colhido',NAVY)+chip('a colher',TEAL);
  if(spec.leg==='delta')return chip('ano-1','#c9b08a')+chip('atual · alta',TEAL)+chip('atual · queda',NAVY);
  if(spec.leg==='ritmo'){const sf=safraDaOper(cult,spec.oper||'Colheita')||safraAtual(cult);return chip(sfLbl(sf)+' · p.p./sem',TEAL)+chip('média 5 safras','#8a9099');}
  if(spec.leg==='hist')return chip('anteriores',GELO)+chip('ano-1',CINZA)+chip('safra atual',NAVY);
  if(spec.leg==='ap')return chip('área (Mi ha)',GELO)+chip('produtividade (sc/ha)',TEAL);
  if(spec.leg==='stack')return chip('1ª safra',NAVY)+chip('2ª safra',TEAL)+chip('3ª safra',BEGE);
  return '';
}

function cardsFor(cult){
  const sf=safraAtual(cult)||'—';
  const temHist=!!C.hist[cult];
  const out=[];
  const sfP=safraProducao(cult)||((vintRec(cult,'BR')||{}).sf)||null;
  const partes=[];if(sfP)partes.push('Produção '+sfP);
  if(temProg(cult)){const p0=safraPlantio(cult),c0=safraColheita(cult);if(p0)partes.push('plantio '+p0);if(c0)partes.push('colheita '+c0);}
  /* s26: cards de UF e ritmo seguem a operação em andamento */
  const opA=opAtiva(cult),plA=opA==='Semeadura',opLbl=plA?'Plantio':'Colheita',sfA=safraDaOper(cult,opA)||sf;
  out.push({id:'exec',t:`Leitura da safra — ${cult}`,s:partes.join(' · ')||'Conab',fn:(c,u,d)=>gExec(c,u,d),uf:1,sem:0});
  if(temProg(cult)){
    out.push(
      {id:'prog_sem',t:`Plantio — ${cult}`,s:'% da área semeada · semana do ano-safra · 5 safras',fn:(c,u)=>gProg(c,'Semeadura',u),uf:1,leg:'safras',dyn:'prog',oper:'Semeadura'},
      {id:'prog_col',t:`Colheita — ${cult}`,s:'% da área colhida · semana do ano-safra · 5 safras',fn:(c,u)=>gProg(c,'Colheita',u),uf:1,leg:'safras',dyn:'prog',oper:'Colheita'});
    if(temHist)out.push(
      {id:'vol',t:`Volume colhido — ${cult}`,s:'Mi t acumuladas · % colhido × produção estimada de cada safra',fn:(c,u)=>gVolAcum(c,u),uf:1,leg:'safras',dyn:'vol'},
      {id:'vol_uf',t:plA?`Plantado × a plantar por UF — ${cult}`:`Colhido × a colher por UF — ${cult}`,s:`Safra ${sfA} · ${plA?'Mi ha':'Mi t'} · semana selecionada`,fn:(c,u,d)=>gVolUF(c,d,opA),leg:'voluf',dyn:'voluf',sem:1,oper:opA});
    out.push(
      {id:'delta_col',t:`${opLbl} vs ano-1 por UF — ${cult}`,s:'% na semana selecionada · ano-1 → atual',fn:(c,u,d)=>gDeltaUF(c,opA,d),leg:'delta',dyn:'dumb',oper:opA,sem:1},
      {id:'ritmo',t:`Ritmo de ${opLbl.toLowerCase()} — ${cult}`,s:'p.p. por semana · safra atual vs média',fn:(c,u)=>gRitmo(c,opA,u),uf:1,leg:'ritmo',dyn:'ritmo',oper:opA});
  }
  if(temHist)out.push(
    {id:'hist',t:`Produção — ${cult}`,s:'Mi t · últimas 15 safras · Conab',fn:(c,u)=>gHistProd(c,u),uf:1,leg:'hist',dyn:'hist'},
    {id:'ap',t:`Área × produtividade — ${cult}`,s:'Mi ha e sc/ha · últimas 15 safras',fn:(c,u)=>gHistAP(c,u),uf:1,leg:'ap',dyn:'ap'});
  if(cult==='Milho Total')out.splice(1,0,{id:'stack',t:'Milho por safra — 1ª + 2ª + 3ª',s:'Mi t · composição da produção total',fn:()=>gStackMilho(),leg:'stack',dyn:'stack'});
  return out;
}
const SPEC_BY_KEY={};
function specDe(key){
  if(SPEC_BY_KEY[key])return SPEC_BY_KEY[key];
  const [cid,cult]=key.split('|');
  const sp=cardsFor(cult).find(s=>s.id===cid)||(cid==='stack_g'?{id:'stack_g',t:'Milho por safra — 1ª + 2ª + 3ª',s:'Mi t · composição da produção total',fn:()=>gStackMilho(),leg:'stack',dyn:'stack'}:(cid==='hist_g'?{id:'hist_g',t:`Produção — ${cult}`,s:'Mi t · últimas 15 safras · Conab',fn:(cc,u)=>gHistProd(cc,u),uf:1,leg:'hist',dyn:'hist'}:null));
  if(sp)SPEC_BY_KEY[key]={cult,spec:sp};
  return SPEC_BY_KEY[key];
}
const DYN_HID_OK=new Set(['prog_sem','prog_col','vol','vol_uf','delta_col','ritmo','hist','ap','stack','stack_g','hist_g']);

function ultimaSemana(cult){
  let mx=null;
  if(temProg(cult))Object.values(C.prog[cult]).forEach(sf=>Object.values(sf).forEach(op=>Object.values(op).forEach(arr=>arr.forEach(([d])=>{if(!mx||d>mx)mx=d;}))));
  return mx?saturdayISO(mx):null;
}

function wmFix(el){
  el.querySelectorAll('use[data-wm]').forEach(u=>{if(!u.getAttribute('href'))u.setAttribute('href','#brzlogo');});
}
function wmEnsure(el){wmFix(el);}

function buildCard(cult,spec){
  const key=(spec.id)+'|'+cult;
  SPEC_BY_KEY[key]={cult,spec};
  const sv=window.__SAVED__&&window.__SAVED__.cards&&window.__SAVED__.cards[key];
  if(sv&&sv.html){
    const el=document.createElement('div');el.className='p-card';el.dataset.card=key;
    el.innerHTML=sv.html; if(sv.style)el.setAttribute('style',sv.style);
    reviveCard(el,cult,spec);
    return el;
  }
  const el=document.createElement('div');el.className='p-card';el.dataset.card=key;
  const hd=document.createElement('div');hd.className='p-card-h';
  hd.innerHTML=`<div style="min-width:0"><div class="p-card-t etext">${esc(spec.t)}</div><div class="p-card-s etext">${esc(spec.s)}</div></div>`;
  const tools=document.createElement('div');tools.className='cardtools';
  const lg=document.createElement('div');lg.className='lg';tools.appendChild(lg);
  const ctrow=document.createElement('div');ctrow.className='ctrow';tools.appendChild(ctrow);
  const selrow=document.createElement('div');selrow.className='selrow';ctrow.appendChild(selrow);
  hd.appendChild(tools);
  const ch=document.createElement('div');ch.className='chart';
  let uf='BR';
  const weeks=spec.sem?semanasDisponiveis(cult,spec.oper||'Colheita'):[];
  let weekDate=weeks.length?weeks[weeks.length-1]:null;
  el._vars={};
  const draw=()=>{
    _lgK=0;
    const lgHtml=legFor(cult,spec);
    const map=[...lgHtml.matchAll(/data-var="(--c\d+)" value="(#[0-9a-fA-F]{6})"/g)].map(m=>({v:m[1],cor:m[2]}));
    const seen={};const mapU=map.filter(m=>{if(seen[m.cor])return false;seen[m.cor]=m.v;return true;});
    HIDDEN=el._hidden||null;
    let svg='';
    try{svg=spec.fn(cult,uf,weekDate);}catch(e){svg=VAZIO('erro: '+esc(e.message));}
    HIDDEN=null;
    svg=svg.replace(/(<text[^>]*?fill=")(?!#fff\b|#FFF\b|#ffffff\b|#FFFFFF\b|white\b)([^"]+)(")/g,'$1#000$3');
    svg=rewriteVars(svg,mapU);
    svg=svg.replace(/<text([^>]*?)class="([^"]*)"/g,'<text$1class="etext $2"')
           .replace(/<text(?![^>]*class=)([^>]*)>/g,'<text class="etext"$1>');
    mapU.forEach(m=>el.style.setProperty(m.v,el._vars[m.v]||m.cor));
    ch.innerHTML=svg;
    wmFix(el);
    lg.innerHTML=lgHtml;
    lg.querySelectorAll('input.lgc').forEach(inp=>{const ov=el._vars[inp.dataset.var];if(ov)inp.value=ov;});
    if(el._hidden&&el._hidden.size){lg.querySelectorAll('span').forEach(sp2=>{const b2=sp2.querySelector('b');
      if(b2&&el._hidden.has(b2.textContent)){sp2.style.opacity='.35';sp2.title='série oculta — filtrada no modo dinâmico';}});}
    wirePal(el);
    if(window.typoApply)typoApply(el);
  };
  el._draw=draw;
  el._getUf=()=>uf;
  el._getWeekDate=()=>weekDate;
  el._syncControls=()=>{const su=el.querySelector('select[data-role="uf"]'),sw=el.querySelector('select[data-role="week"]');if(su)uf=su.value;if(sw)weekDate=sw.value||null;draw();};
  el._rebuild=()=>{if(window.__SAVED__&&window.__SAVED__.cards)delete window.__SAVED__.cards[key];const novo=buildCard(cult,spec);el.replaceWith(novo);};
  if(spec.sem&&weeks.length){
    const sw=document.createElement('select');sw.className='selp';sw.dataset.role='week';sw.style.maxWidth='88px';
    weeks.forEach(d=>{const o=document.createElement('option');o.value=d;o.textContent='Sem. '+fmtData(d).slice(0,5);if(d===weekDate)o.selected=true;sw.appendChild(o);});
    sw.onchange=()=>{weekDate=sw.value;if(typeof dynOff==='function')dynOff(el,true);draw();};
    selrow.appendChild(sw);
  }
  if(spec.uf&&temProg(cult)){
    const sel=document.createElement('select');sel.className='selp';sel.dataset.role='uf';
    ufsDe(cult).forEach(u=>{const o=document.createElement('option');o.value=u;o.textContent=u==='BR'?'Brasil':((NOME2SIG[u]||'')+' · '+u);sel.appendChild(o);});
    sel.onchange=()=>{uf=sel.value;if(typeof dynOff==='function')dynOff(el,true);draw();};
    selrow.appendChild(sel);
  }
  const pal=document.createElement('div');pal.className='pal';
  const rb=document.createElement('button');rb.className='mini rst';rb.textContent='↺';rb.title='Restaurar card';pal.appendChild(rb);
  const b=document.createElement('button');b.className='mini png';b.textContent='⤓';b.title='PNG do card (3×)';
  b.onclick=()=>baixar(el,spec.t+(uf!=='BR'?'_'+(NOME2SIG[uf]||uf):'')+(weekDate?'_'+weekDate:''));pal.appendChild(b);
  ctrow.appendChild(pal);
  const ft=document.createElement('div');ft.className='foot';
  const us=ultimaSemana(cult);
  ft.innerHTML=`<span class="etext">Conab · Plantio e Colheita + Série Histórica</span><span class="etext">${us?('até '+fmtData(us)):C.meta.geradoEm}</span>`;
  el.appendChild(hd);el.appendChild(ch);el.appendChild(ft);
  draw();
  if(typeof injectDynBtn==='function')injectDynBtn(el);
  return el;
}

function reviveCard(el,cult,spec){
  const key=spec.id+'|'+cult;
  wmEnsure(el);
  el._vars={};
  const st=el.getAttribute('style')||'';
  [...st.matchAll(/(--c\d+)\s*:\s*([^;]+)/g)].forEach(m=>el._vars[m[1]]=m[2].trim());
  const sels=[...el.querySelectorAll('select')];
  const selUf=sels.find(s=>s.dataset.role==='uf')||sels.find(s=>s.dataset.role!=='week');
  const selW=sels.find(s=>s.dataset.role==='week');
  el._getUf=()=>selUf?selUf.value:'BR';
  el._getWeekDate=()=>selW?selW.value:null;
  el._rebuild=()=>{if(window.__SAVED__&&window.__SAVED__.cards)delete window.__SAVED__.cards[key];const novo=buildCard(cult,spec);el.replaceWith(novo);};
  const rebuildPreserve=()=>{
    if(window.__SAVED__&&window.__SAVED__.cards)delete window.__SAVED__.cards[key];
    const novo=buildCard(cult,spec);
    sels.forEach((s,i)=>{const ns=novo.querySelector('select[data-role="'+s.dataset.role+'"]')||novo.querySelectorAll('select')[i];if(ns)ns.value=s.value;});
    novo._vars=Object.assign({},el._vars||{});Object.entries(novo._vars).forEach(([k,v])=>novo.style.setProperty(k,v));
    novo._hidden=el._hidden||null;
    [['.p-card-t'],['.p-card-s']].forEach(([q])=>{const a=el.querySelector(q),b=novo.querySelector(q);if(a&&b){b.textContent=a.textContent;b.style.cssText=a.style.cssText;}});
    if(novo._syncControls)novo._syncControls();
    el.replaceWith(novo);return novo;
  };
  sels.forEach(s=>{s.onchange=rebuildPreserve;});
  const png=el.querySelector('.mini.png');
  if(png)png.onclick=()=>baixar(el,(el.querySelector('.p-card-t')||{}).textContent||'card');
  const dimK=[...el.querySelectorAll('.lg span')].filter(sp=>(sp.title||'').indexOf('oculta')>-1).map(sp=>{const b2=sp.querySelector('b');return b2?b2.textContent:null;}).filter(Boolean);
  if(dimK.length&&DYN_HID_OK.has(spec.id))el._hidden=new Set(dimK);
  el._draw=rebuildPreserve;
  wirePal(el);
  if(window.typoApply)typoApply(el);
  if(typeof injectDynBtn==='function')injectDynBtn(el);
}

function renderGrid(cult,gridId){
  const g=document.getElementById(gridId);if(!g)return;
  g.querySelectorAll('.p-card').forEach(c=>{if(typeof dynOff==='function')dynOff(c,true);});
  g.innerHTML='';
  cardsFor(cult).forEach(spec=>g.appendChild(buildCard(cult,spec)));
}

/* ── navegação ── */
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  const el=document.getElementById(id);if(el)el.classList.add('on');
  document.querySelectorAll('.topmenu button').forEach(b=>b.classList.toggle('active',b.dataset.go===id));
  window.scrollTo(0,0);
}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)show(g.dataset.go);});

const MSUB={'m1':'Milho 1ª','m2':'Milho 2ª','m3':'Milho 3ª','mt':'Milho Total'};
function milhoSub(k){
  document.querySelectorAll('#milho-sub button').forEach(b=>b.classList.toggle('active',b.dataset.msub===k));
  renderGrid(MSUB[k],'grid-milho');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-msub]');if(b)milhoSub(b.dataset.msub);});

/* ── CSV ── */
function dl(nome,conteudo,mime){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([conteudo],{type:mime||'text/csv;charset=utf-8'}));
  a.download=nome;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3);
}
const num=v=>v==null?'':String(Math.round(v*10)/10).replace('.',',');
function csvCell(v){if(v==null)return'';let s=typeof v==='number'?String(v).replace('.',','):String(v);if(/[;"\n]/.test(s))s='"'+s.replace(/"/g,'""')+'"';return s;}
function csvText(rows){return '\ufeff'+rows.map(r=>r.map(csvCell).join(';')).join('\n');}
function baixarCSV(cult,spec,el){
  const uf=(el&&el._getUf&&el._getUf())||'BR',dataSel=(el&&el._getWeekDate&&el._getWeekDate())||null;let rows=[];
  const oper=spec.oper||(spec.id==='prog_sem'?'Semeadura':'Colheita');
  if(spec.id==='prog_sem'||spec.id==='prog_col'||spec.id==='vol'){
    const ss=safrasProg(cult,oper);
    rows.push(['semana_ate','safra',spec.id==='vol'?'mi_t':'pct']);
    ss.forEach(sf=>{
      const prod=prodDe(cult,sf,uf);
      serieProg(cult,sf,oper,uf).forEach(p=>rows.push([p.d,sf,num(spec.id==='vol'?(prod!=null?prod*p.v/100/1000:null):p.v)]));
    });
  }else if(spec.id==='vol_uf'){
    const pl=oper==='Semeadura',sf=safraDaOper(cult,oper)||safraAtual(cult);
    rows.push(pl?['semana_ate','uf','pct_plantado','plantado_mi_ha','a_plantar_mi_ha']:['semana_ate','uf','pct_colhido','colhido_mi_t','a_colher_mi_t']);
    ufsDe(cult).filter(u=>u!=='BR').forEach(u=>{
      const base=pl?areaDe(cult,sf,u):prodDe(cult,sf,u),pt=pontoNaSemana(cult,sf,oper,u,dataSel);
      if(base==null||!pt)return;
      rows.push([dataSel||pt.d,NOME2SIG[u]||u,num(pt.v),num(base*pt.v/100/1000),num(base/1000*(1-pt.v/100))]);
    });
  }else if(spec.id==='delta_col'){
    const sf=safraDaOper(cult,oper)||safraAtual(cult),sa=safraAntOper(cult,oper,sf);
    rows.push(['semana_ate','uf','pct_ano1','pct_atual','delta_pp']);
    ufsDe(cult).filter(u=>u!=='BR').forEach(u=>{
      const pt=pontoNaSemana(cult,sf,oper,u,dataSel);if(!pt)return;
      const p1=sa?pctNaSemana(cult,sa,oper,u,pt.x):null;if(p1==null)return;
      rows.push([dataSel||pt.d,NOME2SIG[u]||u,num(p1),num(pt.v),num(pt.v-p1)]);
    });
  }else if(spec.id==='ritmo'){
    const ss=safrasProg(cult,oper),sf=ss[ss.length-1],xb=OPWIN(cult,oper).weeks;
    const cur=serieProg(cult,sf,oper,uf).filter(p=>p.x>=0&&p.x<=xb);
    rows.push(['semana_ate','safra','pp_semana','media5_pp']);
    for(let i=1;i<cur.length;i++){
      const dw=cur[i].x-cur[i-1].x;if(dw<=0||dw>3)continue;
      const vs=ss.slice(0,-1).map(s0=>{const a=pctNaSemana(cult,s0,oper,uf,cur[i].x-1),b=pctNaSemana(cult,s0,oper,uf,cur[i].x);return(a!=null&&b!=null)?Math.max(0,b-a):null;}).filter(v=>v!=null);
      rows.push([cur[i].d,sf,num(Math.max(0,(cur[i].v-cur[i-1].v)/dw)),num(vs.length>=2?vs.reduce((a,b)=>a+b,0)/vs.length:null)]);
    }
  }else{
    const key=uf==='BR'?'BR':(NOME2SIG[uf]||uf);
    rows.push(['safra','producao_mil_t','area_mil_ha','produt_kg_ha']);
    const h=C.hist[cult]||C.hist['Milho Total'];
    if(h)h.safras.forEach((s0,i)=>rows.push([s0,num((h.prod[key]||[])[i]),num((h.area[key]||[])[i]),num((h.produt[key]||[])[i])]));
  }
  dl(('BRZ_SAFRA_'+spec.id+'_'+cult+'_'+uf).replace(/\s|ª/g,'')+'.csv',csvText(rows));
}

/* ── Base editável ── */
let BF={cult:'Soja',safra:null,oper:'Colheita',uf:'BR'};
function baseInit(){
  const selC=document.getElementById('bf-cult');
  selC.innerHTML=PROGCULTS.filter(temProg).map(c=>`<option>${c}</option>`).join('');
  selC.value=BF.cult;
  selC.onchange=()=>{BF.cult=selC.value;BF.safra=null;baseFill();};
  ['bf-safra','bf-oper','bf-uf'].forEach(id=>{document.getElementById(id).onchange=e=>{
    BF[{['bf-safra']:'safra',['bf-oper']:'oper',['bf-uf']:'uf'}[id]]=e.target.value;baseRender();};});
  document.getElementById('db-add').onclick=baseAdd;
  document.getElementById('db-csv').onclick=baseCSV;
  document.querySelectorAll('#base-sub button').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('#base-sub button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.base-pane').forEach(p=>p.style.display='none');
    document.getElementById('pane-'+b.dataset.bsub).style.display='';
    if(b.dataset.bsub==='est')estRender();
  });
  baseFill();estRender();
}
function baseFill(){
  const safras=Object.keys(C.prog[BF.cult]||{}).sort((a,b)=>parseInt(b)-parseInt(a));
  if(!BF.safra||!safras.includes(BF.safra))BF.safra=safras[0];
  document.getElementById('bf-safra').innerHTML=safras.map(s=>`<option${s===BF.safra?' selected':''}>${s}</option>`).join('');
  document.getElementById('bf-oper').innerHTML=['Colheita','Semeadura'].map(o=>`<option${o===BF.oper?' selected':''}>${o}</option>`).join('');
  const ufs=ufsDe(BF.cult);
  if(!ufs.includes(BF.uf))BF.uf='BR';
  document.getElementById('bf-uf').innerHTML=ufs.map(u=>`<option${u===BF.uf?' selected':''} value="${u}">${u==='BR'?'Brasil':u}</option>`).join('');
  baseRender();
}
function baseSerie(){return (((C.prog[BF.cult]||{})[BF.safra]||{})[BF.oper]||{})[BF.uf];}
function baseRender(){
  const tb=document.querySelector('#db-table tbody');tb.innerHTML='';
  const arr=(baseSerie()||[]).slice().sort((a,b)=>a[0]<b[0]?-1:1);
  arr.forEach(([d,p])=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td contenteditable="true">${d}</td><td contenteditable="true">${String(p).replace('.',',')}</td><td class="del" title="remover">✕</td>`;
    tb.appendChild(tr);
  });
  document.getElementById('db-meta').textContent=arr.length+' semanas · '+BF.cult+' '+BF.safra+' · '+BF.oper+' · '+(BF.uf==='BR'?'Brasil':BF.uf);
}
function baseSync(){
  const rows=[...document.querySelectorAll('#db-table tbody tr')].map(tr=>{
    const tds=tr.querySelectorAll('td');
    const d=tds[0].textContent.trim(),p=parseFloat(tds[1].textContent.trim().replace(',','.'));
    return (/^\d{4}-\d{2}-\d{2}$/.test(d)&&isFinite(p))?[d,Math.max(0,Math.min(100,p))]:null;
  }).filter(Boolean);
  const c=C.prog[BF.cult]=C.prog[BF.cult]||{};
  const s=c[BF.safra]=c[BF.safra]||{};
  const o=s[BF.oper]=s[BF.oper]||{};
  o[BF.uf]=rows.sort((a,b)=>a[0]<b[0]?-1:1);
  window._dataDirty=true;
  try{localStorage.setItem('brz_safra_dataC',JSON.stringify(C));}catch(e){toast('Não foi possível salvar a base local.');return;}
  rerenderAll();if(window.BRZIMEA)window.BRZIMEA.render();if(window.BRZIND)window.BRZIND.render();toast('Base sincronizada ✓');
}
function baseAdd(){
  const tb=document.querySelector('#db-table tbody');
  const tr=document.createElement('tr');
  tr.innerHTML=`<td contenteditable="true">${new Date().toISOString().slice(0,10)}</td><td contenteditable="true"></td><td class="del">✕</td>`;
  tb.appendChild(tr);tr.querySelector('td').focus();
}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('del')&&e.target.closest('#db-table')){e.target.closest('tr').remove();}
  if(e.target.id==='db-sync')baseSync();
  if(e.target.id==='est-sync')estSync();
});
function baseCSV(){
  const arr=(baseSerie()||[]).slice().sort((a,b)=>a[0]<b[0]?-1:1);
  const rows=[['semana_ate','pct']].concat(arr.map(([d,p])=>[d,String(p).replace('.',',')]));
  dl(('base_'+BF.cult+'_'+BF.safra+'_'+BF.oper+'_'+BF.uf).replace(/[\s/ª]/g,'')+'.csv',csvText(rows));
}
function estRender(){
  const wrap=document.getElementById('est-wrap');wrap.innerHTML='';
  PROGCULTS.filter(c=>temProg(c)&&C.hist[c]).forEach(cult=>{
    const sf=safraAtual(cult),i=histIdx(cult,sf);
    if(i<0)return;
    const tb=document.createElement('table');tb.className='vtab est';tb.dataset.cult=cult;tb.dataset.idx=i;
    let h=`<thead><tr><th colspan="2">${cult} · ${sf} · mil t</th></tr></thead><tbody>`;
    h+=`<tr><td class="cm">BR</td><td class="est" contenteditable="true" data-k="BR">${num(C.hist[cult].prod.BR[i])}</td></tr>`;
    ufsDe(cult).filter(u=>u!=='BR').forEach(u=>{
      const sig=NOME2SIG[u]||u;
      const v=(C.hist[cult].prod[sig]||[])[i];
      h+=`<tr><td class="cm">${sig}</td><td class="est" contenteditable="true" data-k="${sig}">${num(v)}</td></tr>`;
    });
    tb.innerHTML=h+'</tbody>';wrap.appendChild(tb);
  });
}
function estSync(){
  document.querySelectorAll('#est-wrap table.est').forEach(tb=>{
    const cult=tb.dataset.cult,i=+tb.dataset.idx;
    tb.querySelectorAll('td[data-k]').forEach(td=>{
      const v=parseFloat(td.textContent.trim().replace(/\./g,'').replace(',','.'));
      if(isFinite(v)){
        const k=td.dataset.k;
        if(!C.hist[cult].prod[k])C.hist[cult].prod[k]=new Array(C.hist[cult].safras.length).fill(null);
        C.hist[cult].prod[k][i]=v;
      }
    });
  });
  window._dataDirty=true;
  try{localStorage.setItem('brz_safra_dataC',JSON.stringify(C));}catch(e){toast('Não foi possível salvar as estimativas locais.');return;}
  rerenderAll();toast('Estimativas aplicadas ✓');
}

/* ── estado (gabarito e43: HTML congelado + versão de dados + paleta) ── */
function collectState(){
  if(typeof dynOffAll==='function')try{dynOffAll();}catch(e){}
  const cards={};
  document.querySelectorAll('.p-card[data-card]').forEach(c=>{
    const cl=c.cloneNode(true);
    const so=c.querySelectorAll('select'), sc=cl.querySelectorAll('select');
    so.forEach((s,i2)=>{[...sc[i2].options].forEach(o=>{if(o.value===s.value)o.setAttribute('selected','');else o.removeAttribute('selected');});});
    cl.querySelectorAll('image[data-wm]').forEach(im=>{
      const u=document.createElementNS('http://www.w3.org/2000/svg','use');
      ['x','y','width','height','opacity'].forEach(a=>{const v=im.getAttribute(a);if(v)u.setAttribute(a,v);});
      u.setAttribute('data-wm','1');u.setAttribute('href','#brzlogo');im.replaceWith(u);});
    cl.querySelectorAll('.mini.dyn').forEach(b=>b.remove());
    const chd=cl.querySelector('.chart'); if(chd) chd.classList.remove('dynon');
    cl.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));
    cards[c.dataset.card]={html:cl.innerHTML, style:c.getAttribute('style')||''};
  });
  return {v:4,build:BUILD,dataAtual:C.meta.geradoEm,ts:Date.now(),cards,
    palette:{navy:NAVY,teal:TEAL,bege:BEGE},
    typo:{sizes:Object.assign({},window.TYPO?TYPO.sizes:{}),foot:window.TYPO?!!TYPO.foot:true}};
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.style.display='block';
  clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2600);
}
function saveState(){
  if(window.BRZBAL&&window.BRZBAL.persist)window.BRZBAL.persist();
  if(window.typoSave)typoSave();
  window.__SAVED__=collectState();
  let ok=true;
  try{
    localStorage.setItem('brz_safra_state',JSON.stringify(window.__SAVED__));
    if(window._dataDirty)localStorage.setItem('brz_safra_dataC',JSON.stringify(C));
  }catch(e){ok=false;toast('Aviso: não coube no navegador; use EXPORTAR HTML.');}
  optStatus();if(ok)toast('Edições salvas ✓');
}
function optStatus(){
  const el=document.getElementById('opt-status');if(!el)return;
  el.textContent=window.__SAVED__?('Último salvamento: '+new Date(window.__SAVED__.ts).toLocaleString('pt-BR')):'Nenhum salvamento nesta máquina ainda.';
}
function exportarHTML(){
  if(window.BRZBAL&&window.BRZBAL.flush)window.BRZBAL.flush();
  saveState();
  if(typeof select==='function')select(null);
  document.body.classList.remove('edit');
  const g2=document.getElementById('gear'); if(g2)g2.classList.remove('on');
  const ec=document.getElementById('editctrls'); if(ec)ec.style.display='none';
  const inl2=document.getElementById('inl'); if(inl2)inl2.style.display='none';
  const _t=document.getElementById('toast'); if(_t){_t.style.display='none';_t.textContent='';}
  const curScr=(document.querySelector('.screen.on')||{}).id||'scr-menu';
  show('scr-menu');
  document.querySelectorAll('.mini.dyn').forEach(b=>b.remove());
  document.querySelectorAll('script[src]').forEach(s=>{if(/echarts/i.test(s.src))s.remove();});
  document.querySelectorAll('#typo-panel').forEach(el=>el.remove());
  const dm=document.getElementById('dynmodal'); if(dm)dm.remove();
  const std=document.getElementById('safra-data');
  std.textContent='window.C='+JSON.stringify(C).replace(/<\/script/gi,'<\\/scr'+'ipt');
  const sts=document.getElementById('safra-state');
  sts.textContent='window.__SAVED__='+JSON.stringify(window.__SAVED__).replace(/<\/script/gi,'<\\/scr'+'ipt')+';';
  const html='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
  dl('BRZ_SAFRA_'+BUILD.split(' ')[0]+'.html',html,'text/html;charset=utf-8');
  document.querySelectorAll('.p-card').forEach(c=>{if(typeof injectDynBtn==='function')injectDynBtn(c);});
  if(window.buildTypoPanel)buildTypoPanel();
  show(curScr);
  toast('Exportado com edições ('+BUILD+').');
}
function limparTudo(){
  if(!confirm('Limpar edições salvas nesta máquina?'))return;
  localStorage.removeItem('brz_safra_state');localStorage.removeItem('brz_safra_dataC');localStorage.removeItem('brz_safra_agrinvest_bal_v1');
  window.__SAVED__=null;location.reload();
}
function rerenderAll(){
  syncHousePalette();
  if(window.__SAVED__&&window.__SAVED__.cards)window.__SAVED__.cards={};
  [...document.querySelectorAll('.p-card[data-card]')].forEach(el=>{
    const inst=(typeof ECHM!=='undefined')?ECHM.get(el):null;
    if(inst){try{inst.chart.dispose();inst.ro.disconnect();}catch(e){}ECHM.delete(el);}
    const info=specDe(el.dataset.card);
    if(info)el.replaceWith(buildCard(info.cult,info.spec));else if(el._draw)el._draw();
  });
}

/* ── boot ── */
function boot(){
  const stateOk=s=>!!(s&&s.v>=4&&s.build===BUILD&&s.dataAtual===C.meta.geradoEm);
  try{
    const ls=localStorage.getItem('brz_safra_state');
    if(ls){const st=JSON.parse(ls);if(stateOk(st)&&(!stateOk(window.__SAVED__)||st.ts>window.__SAVED__.ts))window.__SAVED__=st;}
    const dc=localStorage.getItem('brz_safra_dataC');
    if(dc){const cc=JSON.parse(dc);if(cc&&cc.prog&&cc.meta&&cc.meta.geradoEm===C.meta.geradoEm&&cc.meta.revisoes===C.meta.revisoes){Object.assign(C.prog,cc.prog);Object.assign(C.hist,cc.hist);window._dataDirty=true;}else localStorage.removeItem('brz_safra_dataC');}
  }catch(e){}
  if(!stateOk(window.__SAVED__)){
    const old=window.__SAVED__;
    window.__SAVED__=old?{v:4,build:BUILD,dataAtual:C.meta.geradoEm,ts:old.ts||Date.now(),cards:{},palette:old.palette||null,typo:old.typo||null}:null;
  }
  if(window.__SAVED__&&window.__SAVED__.palette){
    NAVY=window.__SAVED__.palette.navy||NAVY;TEAL=window.__SAVED__.palette.teal||TEAL;BEGE=window.__SAVED__.palette.bege||BEGE;
  }
  syncHousePalette();
  if(window.__SAVED__&&window.__SAVED__.typo&&window.TYPO){TYPO.sizes=window.__SAVED__.typo.sizes||{};TYPO.foot=window.__SAVED__.typo.foot!==false;}
  renderGrid('Soja','grid-soja');
  milhoSub('m2');
  renderGrid('Sorgo','grid-sorgo');
  renderGrid('Trigo','grid-trigo');
  renderGrid('Algodão','grid-algodao');
  renderGrid('Arroz','grid-arroz');
  renderGrid('Feijão 1ª','grid-feijao');
  const gs=document.getElementById('grid-safras');gs.innerHTML='';
  gs.appendChild(buildCard('Milho Total',{id:'stack_g',t:'Milho por safra — 1ª + 2ª + 3ª',s:'Mi t · composição da produção total',fn:()=>gStackMilho(),leg:'stack',dyn:'stack'}));
  ['Soja','Milho Total','Trigo','Algodão','Sorgo'].forEach(c=>{
    if(!C.hist[c])return;
    gs.appendChild(buildCard(c,{id:'hist_g',t:`Produção — ${c}`,s:'Mi t · últimas 15 safras · Conab',fn:(cc,u)=>gHistProd(cc,u),uf:1,leg:'hist',dyn:'hist'}));
  });
  baseInit();
  document.getElementById('opt-save').onclick=saveState;
  document.getElementById('opt-export').onclick=exportarHTML;
  document.getElementById('opt-clear').onclick=limparTudo;
  document.getElementById('opt-build').textContent='BUILD '+BUILD;
  document.getElementById('pc-navy').value=NAVY;document.getElementById('pc-teal').value=TEAL;document.getElementById('pc-bege').value=BEGE;
  const pc=(id,set)=>{const el=document.getElementById(id);el.oninput=()=>{set(el.value);rerenderAll();};};
  pc('pc-navy',v=>NAVY=v);pc('pc-teal',v=>TEAL=v);pc('pc-bege',v=>BEGE=v);
  document.getElementById('pc-reset').onclick=()=>{NAVY='#1A3A5C';TEAL='#0D9488';BEGE='#B5963E';
    document.getElementById('pc-navy').value=NAVY;document.getElementById('pc-teal').value=TEAL;document.getElementById('pc-bege').value=BEGE;rerenderAll();toast('Paleta restaurada.');};
  const dts=PROGCULTS.map(ultimaSemana).filter(Boolean).sort();const du=dts[dts.length-1]||'',dg=C.meta.geradoEm||'';
  document.getElementById('dt').textContent='dados até '+(du?fmtData(du):'—')+' · consolidado '+(dg?fmtData(dg):'—')+' · '+BUILD;
  if(window.typoApply)typoApply();
  optStatus();
  show('scr-menu');
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();

/* ═══════════ MODO EDIÇÃO (padrão e43) ═══════════ */
const EDIT=()=>document.body.classList.contains('edit');
const gear=document.getElementById('gear');
const inl=document.getElementById('inl');
gear.onclick=()=>{
  const on=document.body.classList.toggle('edit');
  gear.classList.toggle('on',on);
  document.getElementById('editctrls').style.display=on?'flex':'none';
  if(!on){select(null); inl.style.display='none';}
  const tp=document.getElementById('typo-panel');
  if(tp)tp.style.display=on?'block':'none';
  if(on&&window.typoRefresh)typoRefresh();
};
let SEL=null;
function isSvgEl(el){return el && el.namespaceURI==='http://www.w3.org/2000/svg';}
function getSize(el){return parseFloat(getComputedStyle(el).fontSize)||10;}
function select(el){ if(SEL)SEL.classList.remove('sel'); SEL=el; if(el){el.classList.add('sel'); document.getElementById('fsz').value=Math.round(getSize(el));} }
function setSize(el,v){ el.style.fontSize=v+'px'; }
function setColor(el,v){ if(isSvgEl(el)) el.style.fill=v; else el.style.color=v; }
function setFam(el,v){ el.style.fontFamily=v; }
function togBold(el){ el.style.fontWeight=(parseInt(getComputedStyle(el).fontWeight)>=700)?'400':'800'; }
function togItal(el){ el.style.fontStyle=(getComputedStyle(el).fontStyle==='italic')?'normal':'italic'; }
let drag=null, moved=false;
document.addEventListener('pointerdown',e=>{
  if(!EDIT())return;
  if(e.target.closest('.topnav')||e.target.closest('.editbar')||e.target.closest('.pal')||e.target.closest('.subtabs')||e.target.closest('select')||e.target.closest('input')||e.target===inl)return;
  let el=null,type=null,f=1;
  const sv=e.target.closest('.chart svg');
  if(sv && sv.closest('.chart.dynon')) return;
  if(sv && e.target!==sv){ el=e.target; type='svg'; f=414/sv.getBoundingClientRect().width; }
  else { el=e.target.closest('.lg span')||e.target.closest('.etext'); if(el) type='html'; }
  if(!el)return;
  drag={el,type,f,sx:e.clientX,sy:e.clientY,bx:parseFloat(el.dataset.tx||0),by:parseFloat(el.dataset.ty||0)};
  moved=false;
});
document.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.sx, dy=e.clientY-drag.sy;
  if(Math.abs(dx)+Math.abs(dy)>3)moved=true;
  if(!moved)return;
  e.preventDefault();
  const tx=drag.bx+dx*(drag.type==='svg'?drag.f:1);
  const ty=drag.by+dy*(drag.type==='svg'?drag.f:1);
  if(drag.type==='svg'){ drag.el.setAttribute('transform',`translate(${tx.toFixed(1)} ${ty.toFixed(1)})`); }
  else { drag.el.style.position='relative'; drag.el.style.left=tx+'px'; drag.el.style.top=ty+'px'; }
  drag.el.dataset.tx=tx; drag.el.dataset.ty=ty;
});
document.addEventListener('pointerup',()=>{ drag=null; setTimeout(()=>{moved=false;},0); });
document.addEventListener('click',e=>{
  if(!EDIT())return;
  if(moved)return;
  if(e.target.closest('.newscard')||e.target.closest('.topnav')||e.target.closest('.editbar')||e.target.closest('.pal')||e.target.closest('input')||e.target===inl) return;
  const t=e.target.closest('.etext');
  if(t) select(t); else select(null);
});
document.addEventListener('dblclick',e=>{
  if(!EDIT())return;
  const t=e.target.closest('.etext'); if(!t)return;
  select(t);
  const r=t.getBoundingClientRect();
  inl.style.display='block';
  inl.style.left=(r.left+window.scrollX)+'px';
  inl.style.top=(r.top+window.scrollY-2)+'px';
  inl.style.width=Math.max(70,r.width+30)+'px';
  inl.value=t.textContent;
  inl.focus(); inl.select();
  const commit=()=>{t.textContent=inl.value; inl.style.display='none';};
  inl.onkeydown=ev=>{ if(ev.key==='Enter')commit(); if(ev.key==='Escape')inl.style.display='none'; };
  inl.onblur=()=>{ if(inl.style.display!=='none')commit(); };
});
function applyScope(fn){
  if(!SEL) return;
  if(document.getElementById('allcard').checked){
    const card=SEL.closest('.p-card')||SEL.closest('.screen');
    card.querySelectorAll('.etext').forEach(fn);
  } else fn(SEL);
}
document.getElementById('fsz').addEventListener('input',e=>applyScope(el=>setSize(el,parseFloat(e.target.value)||9)));
document.getElementById('szm').onclick=()=>applyScope(el=>setSize(el,getSize(el)-1));
document.getElementById('szp').onclick=()=>applyScope(el=>setSize(el,getSize(el)+1));
document.getElementById('fcol').addEventListener('input',e=>applyScope(el=>setColor(el,e.target.value)));
document.getElementById('ffam').addEventListener('change',e=>applyScope(el=>setFam(el,e.target.value)));
document.getElementById('fb').onclick=()=>applyScope(togBold);
document.getElementById('fi').onclick=()=>applyScope(togItal);

/* ═══════════ TIPOGRAFIA GLOBAL + RODAPÉ (padrão e43) ═══════════ */
window.TYPO=(function(){try{return Object.assign({sizes:{},foot:true},JSON.parse(document.body.dataset.typo||'{}'));}catch(e){return {sizes:{},foot:true};}})();
try{if(window.__SAVED__&&window.__SAVED__.typo){TYPO.sizes=window.__SAVED__.typo.sizes||{};TYPO.foot=window.__SAVED__.typo.foot!==false;}}catch(e){}
window.typoSave=function(){document.body.dataset.typo=JSON.stringify({sizes:TYPO.sizes,foot:TYPO.foot});};
window.typoApply=function(scope){
  if(!window.TYPO)return;
  const inCard=!!(scope&&scope.classList&&scope.classList.contains('p-card'));
  TYPO_CATS.forEach((c,i)=>{
    const v=TYPO.sizes[i]; if(v==null)return;
    const sel=inCard?c[1].replace('.p-card ',''):c[1];
    (scope||document).querySelectorAll(sel).forEach(el2=>setSize(el2,v));
  });
  (scope||document).querySelectorAll(inCard?'.foot':'.p-card .foot').forEach(f=>{f.style.display=TYPO.foot?'':'none';});
};
const TYPO_CATS=[
  ['Título','.p-card .p-card-t'],
  ['Subtítulo','.p-card .p-card-s'],
  ['Legendas','.p-card .lg span b'],
  ['Eixo Y','.p-card .chart svg .ytick'],
  ['Eixo X','.p-card .chart svg .xlab'],
  ['Valores','.p-card .chart svg .val'],
  ['Rodapé','.p-card .foot span'],
];
function buildTypoPanel(){
  document.querySelectorAll('#typo-panel').forEach(el=>el.remove());
  const p=document.createElement('div');p.id='typo-panel';
  p.style.cssText='position:fixed;top:64px;right:14px;z-index:60;background:#fff;border:1px solid var(--line);border-radius:8px;padding:10px 12px;box-shadow:0 8px 24px rgba(15,38,56,.14);display:none;min-width:172px;font:600 10.5px var(--cond);color:#334155;';
  let html='<div style="font:800 11px var(--cond);color:#1A3A5C;margin-bottom:6px;">Tipografia global</div>';
  TYPO_CATS.forEach((c,i)=>{
    html+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:3px 0;"><span>'+c[0]+'</span><input data-ti="'+i+'" type="number" min="5" max="48" step="1" style="width:52px;font:600 10.5px var(--cond);padding:2px 4px;border:1px solid var(--line);border-radius:4px;color:#334155;"></div>';
  });
  html+='<div style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px;display:flex;align-items:center;gap:6px;"><input type="checkbox" id="typo-foot" checked><label for="typo-foot" style="cursor:pointer;">Mostrar rodapé</label></div>';
  p.innerHTML=html;
  document.body.appendChild(p);
  p.querySelectorAll('input[data-ti]').forEach(inp=>{
    inp.addEventListener('input',()=>{
      let v=parseFloat(inp.value); if(isNaN(v))return; v=Math.min(48,Math.max(5,v));
      document.querySelectorAll('.chart.dynon').forEach(ch=>{const c2=ch.closest('.p-card');if(c2&&window.dynOff)dynOff(c2);});
      TYPO.sizes[+inp.dataset.ti]=v;
      if(window.typoSave)typoSave();
      document.querySelectorAll(TYPO_CATS[+inp.dataset.ti][1]).forEach(el=>setSize(el,v));
    });
  });
  const cbFoot=p.querySelector('#typo-foot');
  if(cbFoot)cbFoot.addEventListener('change',e=>{
    const onf=e.target.checked;
    TYPO.foot=onf;
    if(window.typoSave)typoSave();
    document.querySelectorAll('.p-card .foot').forEach(f=>{f.style.display=onf?'':'none';});
  });
  if(document.body.classList.contains('edit'))p.style.display='block';
}
window.buildTypoPanel=buildTypoPanel;
window.typoRefresh=function(){
  const p=document.getElementById('typo-panel'); if(!p)return;
  p.querySelectorAll('input[data-ti]').forEach(inp=>{
    const st=TYPO.sizes[+inp.dataset.ti];
    if(st!=null){inp.value=st;return;}
    const el=document.querySelector(TYPO_CATS[+inp.dataset.ti][1]);
    inp.value=el?Math.round(parseFloat(getComputedStyle(el).fontSize)||0):'';
  });
  const cb=p.querySelector('#typo-foot');
  if(cb)cb.checked=!!TYPO.foot;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildTypoPanel);else buildTypoPanel();

function wirePal(card){
  card.querySelectorAll('input.lgc').forEach(inp=>{
    inp.oninput=e=>{
      const v=e.target.dataset.var, val=e.target.value;
      card.style.setProperty(v,val);
      card._vars=card._vars||{}; card._vars[v]=val;
      card.querySelectorAll(`input.lgc[data-var="${v}"]`).forEach(o=>{if(o!==e.target)o.value=val;});
    };
  });
}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('rst')){
    select(null);
    const c=e.target.closest('.p-card');
    if(!c)return;
    if(window.dynOff) dynOff(c,true);
    if(c._rebuild) c._rebuild();
  }
});

/* ═══════════ PNG do card (3×) — padrão e43 ═══════════ */
function LOGO_HREF_get(){
  const im=document.querySelector('#brzlogo image');
  return im?(im.getAttribute('href')||im.getAttributeNS('http://www.w3.org/1999/xlink','href')||''):'';
}
function baixar(el,tit){
  const LOGO_HREF=LOGO_HREF_get();
  const CW=438,CH=264,K=3;
  const clone=el.cloneNode(true);
  clone.querySelectorAll('.selrow,.pal,.tools,.ui-hint').forEach(x=>x.remove());
  clone.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));
  clone.querySelectorAll('.lg span').forEach(sp2=>{if(sp2.title&&sp2.title.indexOf('oculta')>-1)sp2.remove();});
  if(window.TYPO&&!TYPO.foot){const ftc=clone.querySelector('.foot');if(ftc)ftc.remove();}
  clone.querySelectorAll('image[data-wm]').forEach(im=>{im.setAttribute('href',LOGO_HREF);im.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',LOGO_HREF);});
  clone.querySelectorAll('use').forEach(u=>{
    const img2=document.createElementNS('http://www.w3.org/2000/svg','image');
    ['x','y','width','height','opacity','transform'].forEach(a2=>{const v=u.getAttribute(a2); if(v)img2.setAttribute(a2,v);});
    img2.setAttribute('href',LOGO_HREF);
    img2.setAttribute('preserveAspectRatio','xMidYMid meet');
    u.replaceWith(img2);
  });
  clone.querySelectorAll('input.lgc').forEach(i2=>{const sw=document.createElement('i');sw.setAttribute('style','width:8px;height:8px;border-radius:2px;display:inline-block;flex:none;background:'+i2.value);i2.replaceWith(sw);});
  clone.style.cssText='width:'+CW+'px;height:'+CH+'px;margin:0;';
  const _cs=getComputedStyle(el);let _vv='';
  for(let k=1;k<=12;k++){const v=_cs.getPropertyValue('--c'+k).trim();if(v)_vv+='--c'+k+':'+v+';';}
  if(_vv)clone.style.cssText+=_vv;
  const css=`*{box-sizing:border-box;font-family:'Arial Nova Cond','Arial Narrow',Arial,sans-serif;}
  .p-card{background:#fff;border:none;border-radius:0;padding:10px 12px 8px;height:${CH}px;display:flex;flex-direction:column;}
  .p-card-h{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;}
  .p-card-t{font-weight:800;font-size:11px;color:#000;line-height:1.15;}
  .p-card-s{font-weight:400;font-size:10px;color:#000;margin-top:2px;}
  .chart{flex:1;min-height:0;} .chart svg{width:100%;height:100%;display:block;}
  .ytick{font-weight:600;font-size:8px;fill:#000;} .xlab{font-weight:700;font-size:8.5px;fill:#000;} .val{font-weight:700;font-size:8px;fill:#334155;}
  .axis0{stroke:#000;stroke-width:1.2;}
  .foot{font-size:8px;color:#000;margin-top:5px;padding-top:5px;display:flex;justify-content:space-between;}
  .cardtools{display:flex;flex-direction:column;align-items:flex-end;gap:3px;}
  .lg{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;max-width:255px;padding-top:2px;}
  .lg span{display:inline-flex;align-items:center;gap:4px;font-size:8.5px;font-weight:600;color:#000;white-space:nowrap;}
  .mini,.tools{display:none;}
  .pl{font-size:9px;fill:#000;} .pv{font-weight:800;font-size:15px;} .ps{font-size:8.5px;fill:#000;} .vs{font-size:7.5px;fill:#000;}
  .lg i{width:8px;height:8px;border-radius:2px;display:inline-block;flex:none;}`;
  const xml='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+CW+'" height="'+CH+'">'+
    '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>'+css+'</style>'+
    clone.outerHTML.replace(/&nbsp;/g,'\u00a0').replace(/<br\s*>/gi,'<br/>')+'</div></foreignObject></svg>';
  const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=CW*K;c.height=CH*K;
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);
    const a=document.createElement('a');a.download=(tit||'card').replace(/[^a-z0-9]+/gi,'_')+'.png';a.href=c.toDataURL('image/png');a.click();};
  img.onerror=()=>{
    const sv0=el.querySelector('.chart svg');
    if(!sv0)return;
    const svg=sv0.cloneNode(true);
    svg.setAttribute('width',W*K);svg.setAttribute('height',H*K);
    const st2=document.createElementNS('http://www.w3.org/2000/svg','style');
    st2.textContent="text{font-family:'Arial Nova Cond','Arial Narrow',Arial,sans-serif;}.ytick{font-weight:600;font-size:8px;fill:#000;}.xlab{font-weight:700;font-size:8.5px;fill:#000;}.val{font-weight:700;font-size:8px;fill:#334155;}.axis0{stroke:#000;stroke-width:1.2;}";
    svg.insertBefore(st2,svg.firstChild);
    svg.querySelectorAll('use').forEach(u=>{
      const img2=document.createElementNS('http://www.w3.org/2000/svg','image');
      ['x','y','width','height','opacity'].forEach(a2=>{const v=u.getAttribute(a2); if(v)img2.setAttribute(a2,v);});
      img2.setAttribute('href',LOGO_HREF);u.replaceWith(img2);
    });
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
    const im2=new Image();
    im2.onload=()=>{const c=document.createElement('canvas');c.width=W*K;c.height=H*K;
      const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im2,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      const a=document.createElement('a');a.download=(tit||'card').replace(/[^a-z0-9]+/gi,'_')+'.png';a.href=c.toDataURL('image/png');a.click();};
    im2.src=url;
  };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
}

/* ═══════════ MODO DINÂMICO · motor nativo s28 com API compatível (ver brz-dyn-native) ═══════════ */
const ICO_FULL='path://M3 3h7v2H5v5H3V3zm18 0v7h-2V5h-5V3h7zM3 21v-7h2v5h5v2H3zm18 0h-7v-2h5v-5h2v7z';
const ICO_CSV='path://M4 2h10l6 6v14H4V2zm10 1.5V8h4.5L14 3.5zM7 12h2v6H7v-6zm4-2h2v8h-2v-8zm4 3h2v5h-2v-5z';
let _ecp=null;
function ensureECharts(){
  /* s28: motor dinâmico nativo embutido (script brz-dyn-native); sem CDN e sem rede */
  return window.echarts?Promise.resolve():Promise.reject(new Error('motor dinâmico não carregado'));
}
const ECHM=new Map();
const DYNSTATIC=new Map();
function wkFmt(cult,oper){
  const anc=(ANCORA[cult]||9)+(oper?OPWIN(cult,oper).shift:0)-1;
  const base=weekEndSaturday(new Date(Date.UTC(2023,anc,1)));
  return v=>MESES[new Date(base.getTime()+Math.round(v)*WEEK_MS).getUTCMonth()];
}
function dynSeries(card,big){
  const info=specDe(card.dataset.card); if(!info)return null;
  const {cult,spec}=info;
  const uf=card._getUf?card._getUf():'BR',dataSel=card._getWeekDate?card._getWeekDate():null;
  const dyn=spec.dyn,fs=big?12:9,fsAx=big?11:8.5;
  const vf1=v=>v==null?'—':(Math.round(v*10)/10).toLocaleString('pt-BR');
  const out={dz:false,vfmt:v=>vf1(v)};
  if(dyn==='prog'||dyn==='vol'){
    const oper=spec.oper||'Colheita';
    const ss=safrasProg(cult,oper),xb=OPWIN(cult,oper).weeks,atual=ss[ss.length-1];
    out.series=ss.map(sf=>{
      const prod=dyn==='vol'?prodDe(cult,sf,uf):null;
      if(dyn==='vol'&&prod==null)return null;
      const pts=serieProg(cult,sf,oper,uf).filter(p=>p.x>=0&&p.x<=xb)
        .map(p=>({value:[p.x,dyn==='vol'?+(prod*p.v/100/1000).toFixed(1):p.v],d:p.d}));
      const st=IDADE_ST[idadeDe(ss,sf)]||IDADE_ST[4];
      return {name:sfLbl(sf),type:'line',showSymbol:!!st.dots,symbolSize:6,
        lineStyle:{width:st.w+0.4,type:st.dash?'dashed':'solid'},emphasis:{focus:'series'},
        color:corVar(card,sfLbl(sf),corSafra(ss,sf)),data:pts};
    }).filter(Boolean);
    out.xAxis={type:'value',min:0,max:xb,axisLabel:{formatter:wkFmt(cult,oper),fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.yAxis={type:'value',max:dyn==='prog'?100:null,axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000',formatter:dyn==='prog'?'{value}%':'{value}'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.dz=true;
    out.vfmt=v=>dyn==='prog'?fp(v):vf1(v)+' Mi t';
    out.ttfmt=ps=>ps.filter(p=>p.data&&p.data.value).map(p=>`${p.marker}${p.seriesName}: <b>${out.vfmt(p.value[1])}</b>${p.data.d?' · '+fmtData(p.data.d):''}`).join('<br>');
    return out;
  }
  if(dyn==='voluf'){
    const oper=spec.oper||'Colheita',pl=oper==='Semeadura',LF=pl?'plantado':'colhido',LR=pl?'a plantar':'a colher',UN=pl?'Mi ha':'Mi t';
    const sf=safraDaOper(cult,oper)||safraAtual(cult);
    const dat=ufsDe(cult).filter(u=>u!=='BR').map(u=>{
      const base=pl?areaDe(cult,sf,u):prodDe(cult,sf,u),pt=pontoNaSemana(cult,sf,oper,u,dataSel);
      if(base==null||!pt)return null;
      return {sig:NOME2SIG[u]||u,c:+(base*pt.v/100/1000).toFixed(2),r:+(base/1000*(1-pt.v/100)).toFixed(2)};
    }).filter(Boolean).sort((a,b)=>(b.c+b.r)-(a.c+a.r));
    out.series=[
      {name:LF,type:'bar',stack:'v',color:corVar(card,LF,NAVY),data:dat.map(d=>d.c)},
      {name:LR,type:'bar',stack:'v',color:corVar(card,LR,TEAL),data:dat.map(d=>d.r)}];
    out.xAxis={type:'category',data:dat.map(d=>d.sig),axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{lineStyle:{color:'#000'}},axisTick:{alignWithLabel:true}};
    out.yAxis={type:'value',axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.vfmt=v=>vf1(v)+' '+UN;
    return out;
  }
  if(dyn==='dumb'){
    const oper=spec.oper||'Colheita';
    const sf=safraDaOper(cult,oper)||safraAtual(cult),sa=safraAntOper(cult,oper,sf);
    const dat=ufsDe(cult).filter(u=>u!=='BR').map(u=>{
      const pt=pontoNaSemana(cult,sf,oper,u,dataSel);if(!pt)return null;
      const p1=sa?pctNaSemana(cult,sa,oper,u,pt.x):null;if(p1==null)return null;
      return {sig:NOME2SIG[u]||u,a:+p1.toFixed(1),b:+pt.v.toFixed(1)};
    }).filter(Boolean).sort((a,b)=>a.b-b.b);
    out.series=[
      {name:'ano-1',type:'scatter',symbolSize:big?14:10,color:corVar(card,'ano-1','#c9b08a'),data:dat.map(d=>[d.a,d.sig])},
      {name:'atual · alta',type:'scatter',symbolSize:big?15:11,color:corVar(card,'atual · alta',TEAL),data:dat.filter(d=>d.b>=d.a).map(d=>[d.b,d.sig])},
      {name:'atual · queda',type:'scatter',symbolSize:big?15:11,color:corVar(card,'atual · queda',NAVY),data:dat.filter(d=>d.b<d.a).map(d=>[d.b,d.sig])}];
    out.xAxis={type:'value',max:100,axisLabel:{formatter:'{value}%',fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.yAxis={type:'category',data:dat.map(d=>d.sig),axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{lineStyle:{color:'#000'}}};
    out.trigger='item';
    out.ttfmt=p=>`${p.marker}${p.name||p.value[1]} · ${p.seriesName}: <b>${fp(p.value[0])}</b>`;
    return out;
  }
  if(dyn==='ritmo'){
    const oper=spec.oper||'Colheita';
    const ss=safrasProg(cult,oper),sf=ss[ss.length-1],xb=OPWIN(cult,oper).weeks;
    const cur=serieProg(cult,sf,oper,uf).filter(p=>p.x>=0&&p.x<=xb);
    const bars=[];for(let i=1;i<cur.length;i++){const dw=cur[i].x-cur[i-1].x;if(dw<=0||dw>3)continue;bars.push({value:[cur[i].x,+Math.max(0,(cur[i].v-cur[i-1].v)/dw).toFixed(1)],d:cur[i].d});}
    const med=[];for(let x=1;x<=xb;x++){const vs=ss.slice(0,-1).map(s0=>{const a=pctNaSemana(cult,s0,oper,uf,x-1),b=pctNaSemana(cult,s0,oper,uf,x);return(a!=null&&b!=null)?Math.max(0,b-a):null;}).filter(v=>v!=null);if(vs.length>=2)med.push([x,+(vs.reduce((a,b)=>a+b,0)/vs.length).toFixed(1)]);}
    const l1=sfLbl(sf)+' · p.p./sem';
    out.series=[
      {name:l1,type:'bar',barWidth:big?9:6,color:corVar(card,l1,TEAL),data:bars},
      {name:'média 5 safras',type:'line',showSymbol:false,lineStyle:{type:'dashed'},color:corVar(card,'média 5 safras','#8a9099'),data:med}];
    out.xAxis={type:'value',min:0,max:xb,axisLabel:{formatter:wkFmt(cult,oper),fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.yAxis={type:'value',axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.dz=true;
    out.vfmt=v=>vf1(v)+' p.p.';
    return out;
  }
  if(dyn==='hist'){
    const key=uf==='BR'?'BR':(NOME2SIG[uf]||uf);
    const {safras,vals}=histSerie(cult,'prod',key,15);
    const dat=safras.map((s0,i)=>({s:sfLbl(s0),v:vals[i]!=null?+(vals[i]/1000).toFixed(1):null})).filter(d=>d.v!=null);
    const n=dat.length;
    const mk=(nome,cor,test)=>({name:nome,type:'bar',stack:'h',color:cor,data:dat.map((d,i)=>test(i)?d.v:null)});
    out.series=[
      mk('anteriores',corVar(card,'anteriores',GELO),i=>i<n-2),
      mk('ano-1',corVar(card,'ano-1',CINZA),i=>i===n-2),
      mk('safra atual',corVar(card,'safra atual',NAVY),i=>i===n-1)];
    out.xAxis={type:'category',data:dat.map(d=>d.s),axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{lineStyle:{color:'#000'}},axisTick:{alignWithLabel:true}};
    out.yAxis={type:'value',axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.vfmt=v=>vf1(v)+' Mi t';
    return out;
  }
  if(dyn==='ap'){
    const key=uf==='BR'?'BR':(NOME2SIG[uf]||uf);
    const A=histSerie(cult,'area',key,15),P=histSerie(cult,'produt',key,15);
    const dat=A.safras.map((s0,i)=>({s:sfLbl(s0),a:A.vals[i]!=null?+(A.vals[i]/1000).toFixed(2):null,p:P.vals[i]!=null?+(P.vals[i]/60).toFixed(1):null})).filter(d=>d.a!=null);
    out.series=[
      {name:'área (Mi ha)',type:'bar',color:corVar(card,'área (Mi ha)',GELO),data:dat.map(d=>d.a)},
      {name:'produtividade (sc/ha)',type:'line',yAxisIndex:1,color:corVar(card,'produtividade (sc/ha)',TEAL),data:dat.map(d=>d.p)}];
    out.xAxis={type:'category',data:dat.map(d=>d.s),axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{lineStyle:{color:'#000'}},axisTick:{alignWithLabel:true}};
    out.yAxis=[{type:'value',name:'Mi ha',nameTextStyle:{fontFamily:FONT,color:'#000'},axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}},
               {type:'value',name:'sc/ha',nameTextStyle:{fontFamily:FONT,color:'#000'},axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}}];
    return out;
  }
  if(dyn==='stack'){
    const T=C.hist['Milho Total'];
    const safras=T.safras.slice(-15);
    const seg=[['Milho 1ª','1ª safra',NAVY],['Milho 2ª','2ª safra',TEAL],['Milho 3ª','3ª safra',BEGE]];
    out.series=seg.map(([c,lb,cor])=>({name:lb,type:'bar',stack:'m',color:corVar(card,lb,cor),
      data:safras.map(s0=>{const i=histIdx(c,s0);const v=i>=0?((C.hist[c].prod.BR||[])[i]||0)/1000:0;return +v.toFixed(1);})}));
    out.xAxis={type:'category',data:safras.map(sfLbl),axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{lineStyle:{color:'#000'}},axisTick:{alignWithLabel:true}};
    out.yAxis={type:'value',axisLabel:{fontSize:fsAx,fontFamily:FONT,color:'#000'},axisLine:{show:true,lineStyle:{color:'#000'}},splitLine:{show:false}};
    out.vfmt=v=>vf1(v)+' Mi t';
    return out;
  }
  return null;
}
function corVar(card,lbl,fallback){
  const b=[...card.querySelectorAll('.lg span b')].find(x=>x.textContent===lbl);
  if(b){const inp=b.parentElement.querySelector('input.lgc');if(inp)return inp.value;}
  return fallback;
}
function buildOption(card,big){
  const info=specDe(card.dataset.card); if(!info)return null;
  const sp=dynSeries(card,big); if(!sp)return null;
  const fs=big?12:9,fsAx=big?11:8.5;
  const FEAT={
    dataZoom:{yAxisIndex:'none',title:{zoom:'zoom por seleção',back:'desfazer zoom'}},
    magicType:{type:['line','bar'],title:{line:'linha',bar:'barra'}},
    restore:{title:'restaurar'},
    dataView:{readOnly:true,title:'dados',lang:['Dados da série','fechar','atualizar'],textareaBorderColor:'#D1D5DB',buttonColor:'#0D9488'},
    saveAsImage:{title:'salvar PNG',name:card.dataset.card,pixelRatio:2},
    myCSV:{show:true,title:'baixar CSV',icon:ICO_CSV,onclick:()=>baixarCSV(info.cult,info.spec,card)}
  };
  if(!big) FEAT.myFull={show:true,title:'tela cheia',icon:ICO_FULL,onclick:()=>openDynModal(card)};
  const opt={
    textStyle:{fontFamily:FONT,color:'#000'},animationDuration:250,
    tooltip:{trigger:sp.trigger||'axis',confine:true,
      axisPointer:{type:'cross',label:{backgroundColor:'#0F2638',fontSize:fsAx},crossStyle:{color:'#94A3B8'}},
      backgroundColor:'#0F2638',borderWidth:0,textStyle:{color:'#fff',fontSize:big?12:10.5,fontFamily:FONT},
      valueFormatter:sp.vfmt},
    legend:Object.assign({top:0,left:0,itemWidth:11,itemHeight:8,icon:'roundRect',textStyle:{fontSize:fs,fontFamily:FONT,color:'#000'}},
      (card._hidden&&card._hidden.size)?{selected:Object.fromEntries([...card._hidden].map(n=>[n,false]))}:{}),
    grid:{left:big?56:40,right:big?24:14,top:big?40:26,bottom:big?64:40,containLabel:false},
    toolbox:{right:0,top:0,itemSize:big?16:11,itemGap:big?9:5,feature:FEAT},
    xAxis:sp.xAxis,yAxis:sp.yAxis,series:sp.series
  };
  if(sp.ttfmt)opt.tooltip.formatter=sp.ttfmt;
  if(sp.dz)opt.dataZoom=[{type:'inside',xAxisIndex:0},{type:'slider',xAxisIndex:0,height:big?20:13,bottom:big?8:3,
    borderColor:'#D1D5DB',fillerColor:'rgba(13,148,136,.18)',handleStyle:{color:'#0D9488'},
    textStyle:{fontSize:fsAx-1,fontFamily:FONT}}];
  return opt;
}
async function renderDyn(card){
  try{ await ensureECharts(); }
  catch(e){ toast('Modo dinâmico indisponível.'); return null; }
  const opt0=buildOption(card,false);
  if(!opt0)return null;
  const holder=document.createElement('div');
  holder.style.cssText='height:100%;min-height:0;';
  const chart=echarts.init(holder,null,{renderer:'canvas'});
  chart.setOption(opt0);
  const ro=new ResizeObserver(()=>chart.resize());ro.observe(holder);
  ECHM.set(card,{chart,ro});
  return holder;
}
window.dynOff=function(card,drop){
  const ch=card.querySelector('.chart');
  const inst=ECHM.get(card);
  let sel=null;
  if(inst){
    try{const o=inst.chart.getOption();if(o&&o.legend&&o.legend[0])sel=o.legend[0].selected||null;}catch(e){}
    try{inst.chart.dispose();inst.ro.disconnect();}catch(e){} ECHM.delete(card);
  }
  if(drop){card._hidden=null;}
  else if(sel){const hid=new Set(Object.keys(sel).filter(k=>sel[k]===false));card._hidden=hid.size?hid:null;
    if(card._hidden&&!DYN_HID_OK.has((card.dataset.card||'').split('|')[0]))card._hidden=null;}
  if(ch&&ch.classList.contains('dynon')){
    ch.classList.remove('dynon');
    const b=card.querySelector('.mini.dyn');if(b)b.classList.remove('on');
    DYNSTATIC.delete(card);
    if(card._draw)card._draw();
  }
};
window.dynOffAll=function(){document.querySelectorAll('.p-card[data-card]').forEach(c=>dynOff(c));closeDynModal();};
window.injectDynBtn=function(card){
  const pal=card.querySelector('.pal');
  if(!pal)return;
  const info=specDe(card.dataset.card);
  if(!info||!info.spec.dyn)return;
  const stale=pal.querySelector('.mini.dyn'); if(stale) stale.remove();
  const b=document.createElement('button');b.className='mini dyn';
  b.title='Modo dinâmico: zoom, tooltip, linha↔barra, dados, tela cheia, CSV';b.textContent='⚡';
  b.onclick=async()=>{
    const ch=card.querySelector('.chart');
    if(ch.classList.contains('dynon')){dynOff(card);return;}
    b.textContent='…';
    let holder=null;
    try{holder=await renderDyn(card);}catch(err){b.textContent='⚡';toast('Dinâmico indisponível: '+err.message);return;}
    b.textContent='⚡';
    if(!holder)return;
    DYNSTATIC.set(card,ch.innerHTML);
    ch.classList.add('dynon');
    ch.innerHTML='';ch.appendChild(holder);
    const inst=ECHM.get(card);if(inst)requestAnimationFrame(()=>inst.chart.resize());
    b.classList.add('on');
  };
  pal.insertBefore(b,pal.querySelector('.png'));
};
function openDynModal(card){
  let m=document.getElementById('dynmodal');
  if(!m){
    m=document.createElement('div');m.id='dynmodal';
    m.innerHTML='<div class="dm-box"><div class="dm-head"><b id="dm-title"></b><button id="dm-close">✕</button></div><div class="dm-body" id="dm-body"></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)closeDynModal();});
    m.querySelector('#dm-close').onclick=closeDynModal;
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDynModal();});
  }
  m.querySelector('#dm-title').textContent=card.querySelector('.p-card-t').textContent;
  m.style.display='flex';
  const body=m.querySelector('#dm-body');body.innerHTML='';
  try{
    const ch=echarts.init(body,null,{renderer:'canvas'});
    const optB=buildOption(card,true);
    ch.setOption(optB,true);
    m._chart=ch;m._src=card;
    ch.on('legendselectchanged',ev=>{
      const off=new Set(Object.keys(ev.selected).filter(k=>ev.selected[k]===false));
      card._hidden=off.size?off:null;
      const inst=ECHM.get(card);
      if(inst)Object.entries(ev.selected).forEach(([k,v])=>inst.chart.dispatchAction({type:v?'legendSelect':'legendUnSelect',name:k}));
    });
    m._ro=new ResizeObserver(()=>ch.resize());m._ro.observe(body);
    requestAnimationFrame(()=>ch.resize());
  }catch(err){
    body.innerHTML='<div style="padding:22px;font:600 13px var(--font);color:#b3564d">Falha ao ampliar: '+err.message+'</div>';
  }
}
function closeDynModal(){
  const m=document.getElementById('dynmodal');
  if(!m||m.style.display==='none')return;
  if(m._chart){m._chart.dispose();m._chart=null;}
  if(m._ro){m._ro.disconnect();m._ro=null;}
  m.style.display='none';
}

