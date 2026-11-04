/* ═══════════ BRZ SAFRA · adaptador de exportação (modularização GitHub Pages, 04/11/2026) ═══════════
   Única peça nova da migração. Não altera dados, cálculos, layout nem comportamento.
   Função: o botão EXPORTAR HTML (exportarHTML em js/core/app.js) serializa document.documentElement
   e chama dl(). Na versão modular, essa serialização traria <link>/<script src> e imagens em arquivo,
   gerando um HTML dependente das pastas. Este adaptador intercepta apenas essa chamada de dl()
   (nome BRZ_SAFRA_*.html, tipo text/html) e devolve os conteúdos ao formato original de arquivo único:
   <style>, <script> e imagens base64, nas mesmas posições. Resultado igual ao EXPORTAR HTML do original.
   Requer HTTP (GitHub Pages ou servidor local). Em file:// o navegador bloqueia a leitura dos arquivos;
   nesse caso a exportação é interrompida com aviso, sem gerar arquivo incompleto.
   Demais chamadas de dl() (CSV, XLSX etc.) passam direto, sem alteração. */
(function(){
'use strict';
var M={"styles": [{"tag": "<link rel=\"stylesheet\" href=\"css/01-base.css\">", "open": "<style>", "path": "css/01-base.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/02-deral-pr.css\">", "open": "<style id=\"deral-pr-style\">", "path": "css/02-deral-pr.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/03-refinement-s23.css\">", "open": "<style id=\"brz-refinement-s23\">", "path": "css/03-refinement-s23.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/04-institutional-s24.css\">", "open": "<style id=\"brz-institutional-s24\">", "path": "css/04-institutional-s24.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/05-institutional-s24-mobile-charts.css\">", "open": "<style id=\"brz-institutional-s24-mobile-charts\">", "path": "css/05-institutional-s24-mobile-charts.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/06-s27-balanco.css\">", "open": "<style id=\"brz-s27-bal-style\">", "path": "css/06-s27-balanco.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/07-s28-dinamico.css\">", "open": "<style id=\"brz-s28-dyn-style\">", "path": "css/07-s28-dinamico.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/08-s28-home.css\">", "open": "<style id=\"brz-s28-home-style\">", "path": "css/08-s28-home.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/09-s29-balanco.css\">", "open": "<style id=\"brz-s29-bal-style\">", "path": "css/09-s29-balanco.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/10-s29-imea.css\">", "open": "<style id=\"brz-s29-imea-style\">", "path": "css/10-s29-imea.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/11-s30-indicadores.css\">", "open": "<style id=\"brz-s30-ind-style\">", "path": "css/11-s30-indicadores.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/12-s31-zoom.css\">", "open": "<style id=\"brz-s31-zoom-style\">", "path": "css/12-s31-zoom.css"}, {"tag": "<link rel=\"stylesheet\" href=\"css/14-s33-cenarios.css\">", "open": "<style id=\"brz-s33-cen-style\">", "path": "css/14-s33-cenarios.css"}], "scripts": [{"open_mod": "<script id=\"safra-data\" src=\"data/safra-data.js\">", "open": "<script id=\"safra-data\">", "path": "data/safra-data.js"}, {"open_mod": "<script id=\"brz-balance-data\" src=\"data/balance-data.js\">", "open": "<script id=\"brz-balance-data\">", "path": "data/balance-data.js"}, {"open_mod": "<script src=\"js/core/app.js\">", "open": "<script>", "path": "js/core/app.js"}, {"open_mod": "<script id=\"brz-dyn-native\" src=\"js/charts/dyn-native.js\">", "open": "<script id=\"brz-dyn-native\">", "path": "js/charts/dyn-native.js"}, {"open_mod": "<script id=\"brz-i18n\" src=\"js/core/i18n.js\">", "open": "<script id=\"brz-i18n\">", "path": "js/core/i18n.js"}, {"open_mod": "<script id=\"brz-safra-revisions\" src=\"js/modules/safra-revisions.js\">", "open": "<script id=\"brz-safra-revisions\">", "path": "js/modules/safra-revisions.js"}, {"open_mod": "<script id=\"deral-pr-module\" src=\"js/modules/deral-pr.js\">", "open": "<script id=\"deral-pr-module\">", "path": "js/modules/deral-pr.js"}, {"open_mod": "<script id=\"brz-xlsx\" src=\"js/utils/xlsx-writer.js\">", "open": "<script id=\"brz-xlsx\">", "path": "js/utils/xlsx-writer.js"}, {"open_mod": "<script id=\"brz-imea-module\" src=\"js/modules/imea.js\">", "open": "<script id=\"brz-imea-module\">", "path": "js/modules/imea.js"}, {"open_mod": "<script id=\"brz-base-export\" src=\"js/modules/base-export.js\">", "open": "<script id=\"brz-base-export\">", "path": "js/modules/base-export.js"}, {"open_mod": "<script id=\"brz-indicadores\" src=\"js/modules/indicadores.js\">", "open": "<script id=\"brz-indicadores\">", "path": "js/modules/indicadores.js"}, {"open_mod": "<script id=\"brz-q-zoom\" src=\"js/charts/q-zoom.js\">", "open": "<script id=\"brz-q-zoom\">", "path": "js/charts/q-zoom.js"}, {"open_mod": "<script id=\"brz-balance-module\" src=\"js/modules/balanco.js\">", "open": "<script id=\"brz-balance-module\">", "path": "js/modules/balanco.js"}, {"open_mod": "<script id=\"brz-cen-data\" src=\"data/cen-data.js\">", "open": "<script id=\"brz-cen-data\">", "path": "data/cen-data.js"}, {"open_mod": "<script id=\"brz-cen-module\" src=\"js/modules/cenarios.js\">", "open": "<script id=\"brz-cen-module\">", "path": "js/modules/cenarios.js"}], "images": [{"path": "assets/images/card-soja.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-milho.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-sorgo.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-trigo.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-algodao.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-arroz.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-feijao.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-safras.jpg", "mime": "image/jpeg"}, {"path": "assets/images/card-indicadores.svg", "mime": "image/svg+xml"}, {"path": "assets/images/card-oferta-demanda.svg", "mime": "image/svg+xml"}, {"path": "assets/images/card-cenarios.svg", "mime": "image/svg+xml"}, {"path": "assets/images/card-deral-pr.svg", "mime": "image/svg+xml"}, {"path": "assets/images/card-imea-mt.svg", "mime": "image/svg+xml"}, {"path": "assets/images/card-base.jpg", "mime": "image/jpeg"}], "self": "<script src=\"js/core/export-adapter.js\"></script>"};
var origDl=window.dl;
if(typeof origDl!=='function')return;
function isEN(){return document.documentElement.lang==='en';}
function getText(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(u+' HTTP '+r.status);return r.text();});}
function getB64(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(u+' HTTP '+r.status);return r.arrayBuffer();}).then(function(buf){
  var a=new Uint8Array(buf),bin='';for(var i=0;i<a.length;i+=0x8000)bin+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(bin);});}
function once(h,t){var i=h.indexOf(t);if(i<0||h.indexOf(t,i+1)>=0)throw new Error('marcador ausente ou repetido: '+t.slice(0,80));return i;}
function spliceAt(h,i,len,rep){return h.slice(0,i)+rep+h.slice(i+len);}
function inlineAll(html){
  if(location.protocol==='file:')return Promise.reject(new Error('file://'));
  var jobs=[];
  M.styles.forEach(function(x){jobs.push(getText(x.path).then(function(c){x.c=c;}));});
  M.scripts.forEach(function(x){jobs.push(getText(x.path).then(function(c){x.c=c;}));});
  M.images.forEach(function(x){jobs.push(getB64(x.path).then(function(c){x.c=c;}));});
  return Promise.all(jobs).then(function(){
    var h=html,i;
    i=once(h,M.self);h=spliceAt(h,i,M.self.length,'');
    M.styles.forEach(function(x){i=once(h,x.tag);h=spliceAt(h,i,x.tag.length,x.open+x.c+'</style>');});
    M.scripts.forEach(function(x){
      i=once(h,x.open_mod);var after=i+x.open_mod.length;
      if(h.substr(after,9)==='</script>')h=spliceAt(h,i,x.open_mod.length,x.open+x.c);  /* conteúdo estático do arquivo */
      else h=spliceAt(h,i,x.open_mod.length,x.open);                                     /* conteúdo gravado em tempo de execução (ex.: safra-data) */
    });
    M.images.forEach(function(x){var t='url('+x.path+')';i=once(h,t);h=spliceAt(h,i,t.length,'url(data:'+x.mime+';base64,'+x.c+')');});
    return h;
  });
}
window.dl=function(nome,conteudo,mime){
  var isSnap=/^BRZ_SAFRA_.*\.html$/.test(String(nome))&&/^text\/html/.test(String(mime||''))&&typeof conteudo==='string'&&conteudo.indexOf(M.self)>=0;
  if(!isSnap)return origDl.apply(this,arguments);
  inlineAll(conteudo).then(function(h){origDl(nome,h,mime);},function(e){
    console.error('[BRZ export-adapter]',e);
    alert(isEN()?'EXPORT HTML needs the platform opened over HTTP (GitHub Pages or a local server). Export cancelled; nothing was generated. ('+e.message+')'
               :'EXPORTAR HTML exige a plataforma aberta por HTTP (GitHub Pages ou servidor local). Exportação cancelada, nenhum arquivo gerado. ('+e.message+')');
  });
};
window.dl.__brzAdapter=true;
})();
