
/* ═══════════ BRZ SAFRA s31 · Ampliar nos painéis do quadro de estimativas ═══════════
   O cartão abre em tela cheia no próprio lugar (sem sair do DOM), então ordenação, filtros, CSV e PNG
   continuam funcionando. Esc, clique fora ou o botão Fechar devolvem o cartão. O estado sobrevive
   ao redesenho do quadro (troca de UF, métrica, idioma). */
(function(){
'use strict';
let EXP=null,raf=0;
const en=()=>document.documentElement.lang==='en';
const LB=()=>en()?'Expand':'Ampliar',LC=()=>en()?'Close':'Fechar';
function bd(){let b=document.getElementById('q-zoom-bd');if(!b){b=document.createElement('div');b.id='q-zoom-bd';b.setAttribute('data-noi18n','');document.body.appendChild(b);b.addEventListener('click',collapse);}return b;}
function keyOf(card){const k=['q-maincard','q-ufcard','q-trajcard'].find(c=>card.classList.contains(c));if(k)return k;const all=[...card.parentElement.querySelectorAll(':scope > .q-card')];return 'idx'+all.indexOf(card);}
function find(){if(!EXP)return null;const root=document.querySelector('[data-q-root="'+EXP.root+'"]');if(!root)return null;
  return EXP.key.indexOf('idx')===0?[...root.querySelectorAll(':scope > .q-card')][+EXP.key.slice(3)]||null:root.querySelector(':scope > .q-card.'+EXP.key);}
function addBtns(){
  document.querySelectorAll('.q26 .q-card > .q-card-h .q-tools[data-noexport]').forEach(t=>{
    let b=t.querySelector('[data-q-zoom]');
    if(!b){b=document.createElement('button');b.type='button';b.className='q-btn q-zoom-btn';b.setAttribute('data-q-zoom','');t.appendChild(b);}
    const on=b.closest('.q-card').classList.contains('q-expanded'),txt=on?LC():LB();if(b.textContent!==txt)b.textContent=txt;
  });
}
function apply(){const card=find();if(!card){if(EXP)collapse();return;}
  if(!card.classList.contains('q-expanded'))card.classList.add('q-expanded');bd().classList.add('on');document.body.classList.add('q-zoom-open');addBtns();}
function expand(card){collapse();const root=card.closest('[data-q-root]');if(!root)return;EXP={root:root.dataset.qRoot,key:keyOf(card)};apply();}
function collapse(){document.querySelectorAll('.q-card.q-expanded').forEach(c=>c.classList.remove('q-expanded'));const b=document.getElementById('q-zoom-bd');if(b)b.classList.remove('on');document.body.classList.remove('q-zoom-open');EXP=null;addBtns();}
/* PNG de um cartão ampliado: exporta no tamanho normal (captura antes do quadro tratar o clique) */
document.addEventListener('click',e=>{
  const pb=e.target.closest('[data-q-png]');const card=pb&&pb.closest('.q-card.q-expanded');
  if(card){card.classList.remove('q-expanded');setTimeout(()=>{if(EXP)apply();},0);}
},true);
document.addEventListener('click',e=>{
  const z=e.target.closest('[data-q-zoom]');
  if(z){const card=z.closest('.q-card');if(card.classList.contains('q-expanded'))collapse();else expand(card);return;}
  if(EXP&&e.target.closest('[data-go]'))collapse();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&EXP)collapse();});
new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;addBtns();if(EXP)apply();});}).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addBtns);else addBtns();
window.BRZQZOOM={expand,collapse,state:()=>EXP};
})();
