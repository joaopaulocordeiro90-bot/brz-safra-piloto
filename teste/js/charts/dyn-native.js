
/* ═══════════ BRZ SAFRA s28 · modo dinâmico nativo ═══════════
   Substitui o ECharts via CDN. Implementa em SVG, sem biblioteca externa, o subconjunto da API
   que o app usa: init, setOption, getOption, resize, dispose, on('legendselectchanged') e
   dispatchAction(legendSelect/legendUnSelect). Recursos: dica com mira, legenda clicável,
   zoom por arraste nas séries semanais, linha ↔ barra, tabela de dados, PNG 3×, CSV e tela cheia.
   O arquivo segue 100% offline. */
(function(){
'use strict';
if(window.echarts&&!window.echarts.__brzNative)return;
const NS='http://www.w3.org/2000/svg';
const FF="'Arial Nova Cond','Arial Nova Condensed','Arial Narrow',Arial,sans-serif";
const isEN=()=>document.documentElement.lang==='en';
const L=(pt,en)=>isEN()?en:pt;
const loc=()=>isEN()?'en-US':'pt-BR';
const S=(tag,a,p)=>{const e=document.createElementNS(NS,tag);if(a)for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const E=(tag,cls,p)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(p)p.appendChild(e);return e;};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function nice(lo,hi,target){
  if(!isFinite(lo)||!isFinite(hi)){lo=0;hi=1;}
  if(hi<=lo)hi=lo+(Math.abs(lo)||1);
  const raw=(hi-lo)/(target||5),p=Math.pow(10,Math.floor(Math.log10(raw))),n=raw/p;
  const step=(n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p;
  const a=Math.floor(lo/step+1e-9)*step,b=Math.ceil(hi/step-1e-9)*step,t=[];
  for(let v=a;v<=b+step*1e-6;v+=step)t.push(+v.toFixed(10));
  return {lo:a,hi:b,step,ticks:t};
}
const fnum=(v,step)=>{const d=!isFinite(step)||step>=1?0:Math.min(3,Math.ceil(-Math.log10(step)-1e-9));return Number(v).toLocaleString(loc(),{minimumFractionDigits:d,maximumFractionDigits:d});};
function axLabel(ax,v,step){const f=ax&&ax.axisLabel&&ax.axisLabel.formatter;if(typeof f==='function')return String(f(v));const s=fnum(v,step);return typeof f==='string'?f.replace('{value}',s):s;}
function norm(s){return (s.data||[]).map((it,i)=>{
  if(it==null)return {i,x:i,y:null,item:it};
  if(Array.isArray(it))return {i,x:it[0],y:it[1],item:it};
  if(typeof it==='object'&&Array.isArray(it.value))return {i,x:it.value[0],y:it.value[1],item:it};
  if(typeof it==='object'&&'value' in it)return {i,x:i,y:it.value,item:it};
  return {i,x:i,y:it,item:it};});}
const mk=c=>`<span style="display:inline-block;margin-right:5px;border-radius:2px;width:8px;height:8px;background:${c}"></span>`;
function tipEl(){let t=document.getElementById('dyntip');if(!t){t=E('div','',document.body);t.id='dyntip';}t.setAttribute('data-noi18n','');return t;}
function textW(s,fs){return String(s).length*fs*0.5;}

class NChart{
  constructor(dom){
    this.dom=dom;this.opt=null;this.sel={};this.zoom=null;this.magic=false;this.h={};this.dead=false;this._init=false;
    dom.innerHTML='';
    this.root=E('div','ndyn',dom);this.root.setAttribute('data-noi18n','');
    this.top=E('div','ndyn-top',this.root);this.leg=E('div','ndyn-leg',this.top);this.tools=E('div','ndyn-tools',this.top);
    this.box=E('div','ndyn-svg',this.root);
  }
  on(ev,fn){(this.h[ev]=this.h[ev]||[]).push(fn);}
  emit(ev,a){(this.h[ev]||[]).forEach(f=>{try{f(a);}catch(e){}});}
  getOption(){return {legend:[{selected:Object.assign({},this.sel)}]};}
  dispatchAction(a){if(!a||a.name==null)return;if(a.type==='legendSelect')this.sel[a.name]=true;else if(a.type==='legendUnSelect')this.sel[a.name]=false;else return;this.render();}
  setOption(opt,notMerge){
    this.opt=opt||{};const ls=(this.opt.legend&&this.opt.legend.selected)||{};
    if(notMerge||!this._init){this.sel={};(this.opt.series||[]).forEach(s=>{this.sel[s.name]=ls[s.name]!==false;});this._init=true;}
    else (this.opt.series||[]).forEach(s=>{if(!(s.name in this.sel))this.sel[s.name]=ls[s.name]!==false;});
    const xa=Array.isArray(this.opt.xAxis)?this.opt.xAxis[0]:this.opt.xAxis;
    this.big=(((xa&&xa.axisLabel&&xa.axisLabel.fontSize)||9)>=11);
    this.root.classList.toggle('big',this.big);
    this.render();
  }
  resize(){this.render();}
  dispose(){this.dead=true;this.hideTip();this.dom.innerHTML='';}
  hideTip(){const t=document.getElementById('dyntip');if(t)t.style.display='none';if(this.ui)this.ui.innerHTML='';}
  feat(){return (this.opt&&this.opt.toolbox&&this.opt.toolbox.feature)||{};}
  /* legenda clicável */
  drawLegend(){
    this.leg.innerHTML='';
    (this.opt.series||[]).forEach(s=>{
      const b=E('button',this.sel[s.name]===false?'off':'',this.leg);b.type='button';
      b.innerHTML=`<i style="background:${s.color||'#94A3B8'}"></i>${esc(s.name)}`;
      b.title=L('Clique para ocultar ou mostrar a série','Click to hide or show the series');
      b.onclick=()=>{this.sel[s.name]=this.sel[s.name]===false;
        const card=this.dom.closest&&this.dom.closest('.p-card');if(card){const off=Object.keys(this.sel).filter(k=>this.sel[k]===false);card._hidden=off.length?new Set(off):null;}
        this.emit('legendselectchanged',{name:s.name,selected:Object.assign({},this.sel)});this.render();};
    });
  }
  /* barra de ferramentas */
  drawTools(){
    this.tools.innerHTML='';const F=this.feat(),add=(txt,title,fn,on,dis)=>{const b=E('button',on?'on':'',this.tools);b.type='button';b.textContent=txt;b.title=title;if(dis)b.disabled=true;b.onclick=fn;return b;};
    if(this.opt.dataZoom&&this.valueX)add('↺',L('Desfazer zoom (arraste no gráfico para dar zoom)','Reset zoom (drag on the chart to zoom)'),()=>{this.zoom=null;this.render();},false,!this.zoom);
    if(F.magicType)add('⇄',L('Linha ↔ barra','Line ↔ bar'),()=>{this.magic=!this.magic;this.render();},this.magic);
    if(F.dataView)add(L('dados','data'),L('Tabela com os valores das séries','Table with series values'),()=>this.dataView());
    if(F.saveAsImage)add('PNG',L('Salvar PNG 3×','Save PNG 3×'),()=>this.png());
    if(F.myCSV)add('CSV',L('Baixar CSV','Download CSV'),()=>{try{F.myCSV.onclick();}catch(e){}});
    if(F.myFull)add('⤢',L('Tela cheia','Full screen'),()=>{try{F.myFull.onclick();}catch(e){}});
  }
  render(){
    if(this.dead||!this.opt)return;
    const o=this.opt,xa=(Array.isArray(o.xAxis)?o.xAxis[0]:o.xAxis)||{},yas=Array.isArray(o.yAxis)?o.yAxis:[o.yAxis||{}];
    const horiz=yas[0].type==='category',catX=!horiz&&xa.type==='category';
    this.valueX=!catX&&!horiz;
    this.drawLegend();this.drawTools();
    if(this.viewEl){this.viewEl.remove();this.viewEl=null;}
    this.box.innerHTML='';this.svg=null;
    const W=Math.floor(this.box.clientWidth),HH=Math.floor(this.box.clientHeight);
    if(W<60||HH<50)return;
    const big=this.big,fs=big?11:8.5,two=yas.length>1;
    const series=(o.series||[]).map(s=>{let type=s.type;if(this.magic&&!horiz){if(type==='line')type='bar';else if(type==='bar')type='line';}return Object.assign({},s,{type,_p:norm(s)});});
    const vis=series.filter(s=>this.sel[s.name]!==false);
    /* margens: rótulo do eixo Y à esquerda cresce com o texto */
    const catY=horiz?(yas[0].data||[]):null;
    const padL=horiz?Math.max(28,Math.min(110,Math.max(...catY.map(c=>textW(c,fs)),10)+12)):(big?50:34);
    const named=yas.some(a=>a&&a.name); /* s30: nome de eixo único também ganha margem no topo */
    const pad={l:padL,r:two?(big?46:32):(big?18:12),t:(two||named)?(big?22:16):(big?10:7),b:big?26:17};
    const pw=W-pad.l-pad.r,ph=HH-pad.t-pad.b;if(pw<30||ph<24)return;
    const svg=S('svg',{viewBox:`0 0 ${W} ${HH}`,width:W,height:HH,'font-family':FF},this.box);this.svg=svg;this.W=W;this.H=HH;
    const defs=S('defs',null,svg),cid='ndc'+Math.random().toString(36).slice(2,9);
    S('rect',{x:pad.l,y:pad.t-8,width:pw,height:ph+8},S('clipPath',{id:cid},defs));
    /* eixo X */
    let X,xInv,nC=0,band=0,xlo=0,xhi=1;
    if(catX){nC=(xa.data||[]).length||Math.max(1,...series.map(s=>s._p.length));band=pw/nC;X=i=>pad.l+band*(i+0.5);xInv=px=>Math.max(0,Math.min(nC-1,Math.floor((px-pad.l)/band)));}
    else{
      let lo=xa.min!=null?xa.min:Infinity,hi=xa.max!=null?xa.max:-Infinity;
      if(xa.min==null||xa.max==null)vis.forEach(s=>s._p.forEach(p=>{if(p.x==null||p.y==null||typeof p.x!=='number')return;if(xa.min==null)lo=Math.min(lo,p.x);if(xa.max==null)hi=Math.max(hi,p.x);}));
      if(xa.min==null&&horiz)lo=Math.min(0,lo);
      if(!isFinite(lo))lo=0;if(!isFinite(hi))hi=lo+1;
      if(xa.min==null||xa.max==null){const nt=nice(lo,hi,big?8:5);if(xa.min==null)lo=nt.lo;if(xa.max==null)hi=nt.hi;}
      if(this.zoom&&this.valueX){lo=this.zoom[0];hi=this.zoom[1];}
      xlo=lo;xhi=hi;X=v=>pad.l+(v-lo)/(hi-lo)*pw;xInv=px=>lo+(px-pad.l)/pw*(hi-lo);
    }
    const inWin=x=>catX||horiz||(x>=xlo-1e-9&&x<=xhi+1e-9);
    /* eixos Y (valores) */
    const yDom=yas.map((ya,ai)=>{
      if(ya.type==='category')return null;
      let lo=ya.scale?Infinity:0,hi=-Infinity;const acc={},accN={}; /* s30: scale:true não força o zero */
      vis.filter(s=>(s.yAxisIndex||0)===ai).forEach(s=>{
        const stk=s.type==='bar'&&s.stack&&!this.magic?s.stack:null;
        s._p.forEach(p=>{if(p.y==null||typeof p.y!=='number'||!inWin(p.x))return;
          if(stk){const k=stk+'|'+p.i;if(p.y>=0){acc[k]=(acc[k]||0)+p.y;hi=Math.max(hi,acc[k]);}else{accN[k]=(accN[k]||0)+p.y;lo=Math.min(lo,accN[k]);}}
          else{hi=Math.max(hi,p.y);lo=Math.min(lo,p.y);}});
      });
      if(!isFinite(hi))hi=1;if(!isFinite(lo))lo=0;
      if(ya.scale){const sp=(hi-lo)||Math.abs(hi)||1;lo-=sp*0.18;hi+=sp*0.12;}
      const L=ya.min!=null?ya.min:lo,H=ya.max!=null?ya.max:hi,nt=nice(L,H,big?6:4),dl=ya.min!=null?ya.min:nt.lo,dh=ya.max!=null?ya.max:nt.hi;
      return {lo:dl,hi:dh,ticks:nt.ticks.filter(t=>t>=dl-1e-9&&t<=dh+1e-9),step:nt.step};
    });
    const Y=(v,ai)=>{const d=yDom[ai||0];return pad.t+ph-(v-d.lo)/(d.hi-d.lo)*ph;};
    const nCY=horiz?catY.length:0,bandY=horiz?ph/Math.max(1,nCY):0,YC=i=>pad.t+bandY*(i+0.5);
    /* desenho dos eixos */
    const axis=S('g',{fill:'#000','font-size':fs,'font-weight':700},svg);
    S('line',{x1:pad.l,y1:pad.t+ph,x2:pad.l+pw,y2:pad.t+ph,stroke:'#000','stroke-width':1},axis);
    S('line',{x1:pad.l,y1:pad.t,x2:pad.l,y2:pad.t+ph,stroke:'#000','stroke-width':1},axis);
    if(catX){
      const lab=xa.data||[],maxW=Math.max(...lab.map(s=>textW(s,fs)),8),every=Math.max(1,Math.ceil((maxW+6)/band));
      lab.forEach((s,i)=>{if(i%every)return;const t=S('text',{x:X(i),y:pad.t+ph+fs+4,'text-anchor':'middle'},axis);t.textContent=s;});
    }else{
      const f=xa.axisLabel&&xa.axisLabel.formatter;let ticks=[];
      if(typeof f==='function'&&!horiz){let prev=null;for(let w=Math.ceil(xlo);w<=Math.floor(xhi);w++){const lb=String(f(w));if(lb!==prev){ticks.push({v:w,l:lb});prev=lb;}}}
      else{const nt=nice(xlo,xhi,big?8:5);ticks=nt.ticks.filter(v=>v>=xlo-1e-9&&v<=xhi+1e-9).map(v=>({v,l:axLabel(xa,v,nt.step)}));}
      const minGap=big?42:26;let lastX=-1e9;
      ticks.forEach(tk=>{const x=X(tk.v);if(x-lastX<minGap)return;lastX=x;const t=S('text',{x,y:pad.t+ph+fs+4,'text-anchor':'middle'},axis);t.textContent=tk.l;});
    }
    yas.forEach((ya,ai)=>{
      if(ya.type==='category'){catY.forEach((c,i)=>{const t=S('text',{x:pad.l-5,y:YC(i)+fs*0.35,'text-anchor':'end'},axis);t.textContent=c;});return;}
      const d=yDom[ai],right=ai===1,xA=right?pad.l+pw:pad.l;
      if(right)S('line',{x1:xA,y1:pad.t,x2:xA,y2:pad.t+ph,stroke:'#000','stroke-width':1},axis);
      d.ticks.forEach(v=>{if(v<d.lo-1e-9||v>d.hi+1e-9)return;const t=S('text',{x:right?xA+5:xA-5,y:Y(v,ai)+fs*0.35,'text-anchor':right?'start':'end'},axis);t.textContent=axLabel(ya,v,d.step);});
      if(ya.name){const t=S('text',{x:right?xA:xA,y:pad.t-6,'text-anchor':right?'end':'start','font-weight':600},axis);t.textContent=ya.name;}
    });
    /* séries */
    const g=S('g',{'clip-path':`url(#${cid})`},svg);
    const barSeries=vis.filter(s=>s.type==='bar');
    const groups=[];barSeries.forEach(s=>{const k=s.stack&&!this.magic?'st:'+s.stack:'se:'+s.name;if(!groups.includes(k))groups.push(k);});
    const acc={},accN={};this.hit=[];
    vis.forEach(s=>{
      const col=s.color||'#64748B',ai=s.yAxisIndex||0,pts=s._p;
      if(s.type==='bar'&&!horiz){
        const gk=s.stack&&!this.magic?'st:'+s.stack:'se:'+s.name,gi=groups.indexOf(gk),nG=Math.max(1,groups.length);
        let bw;if(catX)bw=Math.min(s.barWidth||Infinity,band*0.64/nG);else bw=s.barWidth?s.barWidth*(big?1.3:1):Math.max(2,pw/((xhi-xlo)||1)*0.62);
        pts.forEach(p=>{if(p.y==null||typeof p.y!=='number'||!inWin(p.x))return;
          const cx=(catX?X(p.i):X(p.x))+(catX?(gi-(nG-1)/2)*bw*1.06:0);
          let y0=0,y1=p.y;if(s.stack&&!this.magic){const k=s.stack+'|'+p.i;if(p.y>=0){y0=acc[k]||0;y1=y0+p.y;acc[k]=y1;}else{y0=accN[k]||0;y1=y0+p.y;accN[k]=y1;}}
          const a=Y(y0,ai),b=Y(y1,ai);S('rect',{x:(cx-bw/2).toFixed(2),y:Math.min(a,b).toFixed(2),width:Math.max(1,bw).toFixed(2),height:Math.max(0.5,Math.abs(a-b)).toFixed(2),rx:1.5,fill:col},g);
          this.hit.push({s,p,px:cx,py:b});});
      }else if(s.type==='line'&&!horiz){
        let q=pts.filter(p=>p.y!=null&&typeof p.y==='number').map(p=>({p,x:catX?X(p.i):X(p.x),y:Y(p.y,ai)})).sort((a,b)=>a.x-b.x);
        if(!catX){const i0=q.findIndex(r=>r.p.x>=xlo),i1=q.length-1-[...q].reverse().findIndex(r=>r.p.x<=xhi);if(i0>=0&&i1>=i0)q=q.slice(Math.max(0,i0-1),Math.min(q.length,i1+2));else q=[];} /* s29: só o trecho da janela visível */
        if(q.length>1){const dash=s.lineStyle&&s.lineStyle.type==='dashed'?'5 3':null,w=((s.lineStyle&&s.lineStyle.width)||1.8)*(big?1.25:1);
          const at={d:q.map((r,i)=>(i?'L':'M')+r.x.toFixed(1)+' '+r.y.toFixed(1)).join(''),fill:'none',stroke:col,'stroke-width':w,'stroke-linejoin':'round','stroke-linecap':'round'};if(dash)at['stroke-dasharray']=dash;S('path',at,g);}
        if(s.showSymbol!==false&&(s.showSymbol||catX))q.forEach(r=>{if(!catX&&!inWin(r.p.x))return;S('circle',{cx:r.x.toFixed(1),cy:r.y.toFixed(1),r:((s.symbolSize||6)/2)*(big?1.1:0.85),fill:col,stroke:'#fff','stroke-width':1},g);});
        q.forEach(r=>this.hit.push({s,p:r.p,px:r.x,py:r.y}));
      }else if(s.type==='scatter'||horiz){
        pts.forEach(p=>{if(p.x==null||p.y==null)return;const ci=horiz?catY.indexOf(p.y):p.i;if(ci<0)return;const cx=X(p.x),cy=horiz?YC(ci):Y(p.y,ai);
          S('circle',{cx:cx.toFixed(1),cy:cy.toFixed(1),r:((s.symbolSize||10)/2)*(big?0.95:0.6),fill:col,stroke:'#fff','stroke-width':1},g);this.hit.push({s,p,px:cx,py:cy,cat:horiz?p.y:null});});
      }
    });
    /* camada de interação */
    this.ui=S('g',{'data-ui':'1','pointer-events':'none'},svg);
    const ov=S('rect',{x:pad.l,y:pad.t,width:pw,height:ph,fill:'transparent','data-ui':'1',style:'touch-action:pan-y;cursor:'+(o.dataZoom&&this.valueX?'crosshair':'default')},svg);
    const loc0=ev=>{const r=svg.getBoundingClientRect();return {x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*HH/r.height};};
    const tip=tipEl();
    const vf=(o.tooltip&&o.tooltip.valueFormatter)||(v=>fnum(v,0.1));
    const show=(html,ev)=>{if(!html){tip.style.display='none';return;}tip.innerHTML=html;tip.style.display='block';
      const tw=tip.offsetWidth,th=tip.offsetHeight;let x=ev.clientX+14,y=ev.clientY+14;if(x+tw>innerWidth-6)x=ev.clientX-tw-14;if(y+th>innerHeight-6)y=ev.clientY-th-14;tip.style.left=Math.max(4,x)+'px';tip.style.top=Math.max(4,y)+'px';};
    const cross=(x,y)=>{this.ui.innerHTML='';if(x!=null)S('line',{x1:x,y1:pad.t,x2:x,y2:pad.t+ph,stroke:'#94A3B8','stroke-dasharray':'3 3'},this.ui);if(y!=null)S('line',{x1:pad.l,y1:y,x2:pad.l+pw,y2:y,stroke:'#CBD5E1','stroke-dasharray':'3 3'},this.ui);};
    const trig=(o.tooltip&&o.tooltip.trigger)||'axis',fmt=o.tooltip&&o.tooltip.formatter;
    const param=(h)=>({seriesName:h.s.name,color:h.s.color,marker:mk(h.s.color||'#64748B'),value:h.p.item&&typeof h.p.item==='object'&&Array.isArray(h.p.item.value)?h.p.item.value:(Array.isArray(h.p.item)?h.p.item:h.p.y),data:h.p.item,name:h.cat!=null?h.cat:(catX?(xa.data||[])[h.p.i]:''),dataIndex:h.p.i});
    const hover=ev=>{
      const m=loc0(ev);
      if(this.drag){const x0=Math.min(this.drag.x,m.x),x1=Math.max(this.drag.x,m.x);this.ui.innerHTML='';S('rect',{x:x0,y:pad.t,width:Math.max(1,x1-x0),height:ph,fill:'rgba(13,148,136,.15)',stroke:'#0D9488'},this.ui);tip.style.display='none';return;}
      if(trig==='item'||horiz){
        let best=null,bd=(big?16:11)**2;this.hit.forEach(h=>{const d=(h.px-m.x)**2+(h.py-m.y)**2;if(d<bd){bd=d;best=h;}});
        cross(best?best.px:null,best?best.py:null);
        if(!best){tip.style.display='none';return;}
        const p=param(best);show(typeof fmt==='function'?fmt(p):`${p.marker}${esc(p.name||'')} · ${esc(p.seriesName)}: <b>${esc(vf(Array.isArray(p.value)?p.value[0]:p.value))}</b>`,ev);return;
      }
      let ps=[],cx=m.x,head='';
      if(catX){const i=xInv(m.x);cx=X(i);head=(xa.data||[])[i];
        ps=vis.map(s=>{const h=this.hit.find(h=>h.s===s&&h.p.i===i);return h?param(h):null;}).filter(Boolean);}
      else{const xv=xInv(m.x),tol=Math.max(1.5,(xhi-xlo)/60);
        vis.forEach(s=>{let best=null,bd=Infinity;this.hit.forEach(h=>{if(h.s!==s)return;const d=Math.abs(h.p.x-xv);if(d<bd){bd=d;best=h;}});if(best&&bd<=tol)ps.push(param(best));});
        if(ps.length){const h0=this.hit.find(h=>h.p.item===ps[0].data);if(h0)cx=h0.px;}
        const d0=ps.find(p=>p.data&&p.data.d);head=axLabel(xa,Math.round(xv),1)+(d0&&typeof fmtData==='function'?' · '+fmtData(d0.data.d):'');}
      cross(cx,null);
      if(!ps.length){tip.style.display='none';return;}
      const html=typeof fmt==='function'?fmt(ps):`<b>${esc(head)}</b><br>`+ps.map(p=>`<div class="row">${p.marker}${esc(p.seriesName)}: <b>${esc(vf(Array.isArray(p.value)?p.value[1]:p.value))}</b></div>`).join('');
      show(html,ev);
    };
    /* eventos de ponteiro: mouse, toque e caneta; arraste horizontal dá zoom, toque mostra a dica */
    ov.addEventListener('pointermove',hover);
    ov.addEventListener('pointerleave',ev=>{if(!this.drag&&ev.pointerType==='mouse'){this.ui.innerHTML='';tip.style.display='none';}});
    const dz=o.dataZoom&&this.valueX;
    ov.addEventListener('pointerdown',ev=>{if(ev.button>0)return;if(dz){this.drag={x:loc0(ev).x};try{ov.setPointerCapture(ev.pointerId);}catch(e){}}hover(ev);});
    ov.addEventListener('pointerup',ev=>{if(!this.drag)return;const m=loc0(ev),a=Math.min(this.drag.x,m.x),b=Math.max(this.drag.x,m.x);this.drag=null;this.ui.innerHTML='';
      if(b-a>6){const z0=Math.max(xlo,xInv(a)),z1=Math.min(xhi,xInv(b));if(z1-z0>0.5){this.zoom=[z0,z1];tip.style.display='none';this.render();return;}}hover(ev);});
    ov.addEventListener('pointercancel',()=>{this.drag=null;this.ui.innerHTML='';});
    if(dz)ov.addEventListener('dblclick',()=>{if(this.zoom){this.zoom=null;this.render();}});
  }
  /* tabela de dados */
  dataView(){
    if(this.viewEl){this.viewEl.remove();this.viewEl=null;return;}
    const o=this.opt,xa=(Array.isArray(o.xAxis)?o.xAxis[0]:o.xAxis)||{},yas=Array.isArray(o.yAxis)?o.yAxis:[o.yAxis||{}];
    const horiz=yas[0].type==='category',catX=!horiz&&xa.type==='category',ss=(o.series||[]).filter(s=>this.sel[s.name]!==false);
    const vf=(o.tooltip&&o.tooltip.valueFormatter)||(v=>fnum(v,0.1));
    const rows=new Map();
    ss.forEach((s,si)=>norm(s).forEach(p=>{if(p.y==null)return;
      const key=horiz?p.y:catX?(xa.data||[])[p.i]:p.x;const lab=horiz?p.y:catX?key:(L('sem. ','wk ')+p.x+' · '+axLabel(xa,p.x,1));
      if(!rows.has(key))rows.set(key,{lab,ord:horiz||catX?p.i:p.x,v:{}});rows.get(key).v[si]=horiz?p.x:p.y;}));
    const list=[...rows.values()].sort((a,b)=>a.ord-b.ord);
    const v=E('div','ndyn-view',this.root);this.viewEl=v;
    v.innerHTML=`<div class="ndyn-vh"><b>${esc(L('Dados da série','Series data'))}</b><button type="button">✕</button></div><table><thead><tr><th></th>${ss.map(s=>`<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>`+
      list.map(r=>`<tr><td>${esc(r.lab)}</td>${ss.map((s,si)=>`<td>${r.v[si]==null?'':esc(vf(r.v[si]))}</td>`).join('')}</tr>`).join('')+`</tbody></table>`;
    v.querySelector('button').onclick=()=>{v.remove();this.viewEl=null;};
  }
  /* PNG 3× com legenda e marca d'água da casa */
  png(){
    if(!this.svg)return;
    const W=this.W,LH=this.big?26:18,HT=this.H+LH,fsL=this.big?11:9;
    const out=S('svg',{xmlns:NS,width:W,height:HT,viewBox:`0 0 ${W} ${HT}`,'font-family':FF});
    S('rect',{x:0,y:0,width:W,height:HT,fill:'#fff'},out);
    let x=6;(this.opt.series||[]).forEach(s=>{if(this.sel[s.name]===false)return;S('rect',{x,y:LH/2-5,width:9,height:9,rx:2,fill:s.color||'#94A3B8'},out);
      const t=S('text',{x:x+13,y:LH/2+3,'font-size':fsL,'font-weight':700,fill:'#000'},out);t.textContent=s.name;x+=13+textW(s.name,fsL)+14;});
    const g=S('g',{transform:`translate(0,${LH})`},out);
    [...this.svg.childNodes].forEach(n=>{if(n.getAttribute&&n.getAttribute('data-ui'))return;g.appendChild(n.cloneNode(true));});
    const logo=typeof LOGO_HREF_get==='function'?LOGO_HREF_get():'';
    if(logo){const im=S('image',{x:W/2-70,y:LH+this.H/2-57,width:140,height:115,opacity:.25,preserveAspectRatio:'xMidYMid meet'},out);im.setAttribute('href',logo);}
    const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(out)),img=new Image(),K=3;
    const nm=((this.feat().saveAsImage||{}).name||'grafico').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_');
    img.onload=()=>{const c=document.createElement('canvas');c.width=W*K;c.height=HT*K;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
      const a=document.createElement('a');a.download='BRZ_SAFRA_'+nm+'_dinamico.png';a.href=c.toDataURL('image/png');a.click();};
    img.src=url;
  }
}
window.echarts={__brzNative:true,version:'brz-nativo-s28',init:dom=>new NChart(dom)};
})();
