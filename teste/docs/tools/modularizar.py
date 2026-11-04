# BRZ SAFRA . modularizar.py
# Separa o HTML de arquivo unico na estrutura modular (css/, js/, data/, assets/images/).
# Extracao byte a byte: nenhum conteudo e alterado. Gera tambem js/core/export-adapter.js.
# Se a versao nova tiver bloco <style>/<script> com id nao mapeado, o script para com erro:
# acrescente o id em STYLE_MAP ou SCRIPT_MAP e rode de novo.
import re, os, json, base64, hashlib, shutil
ADAPTER_TPL=r'''/* ═══════════ BRZ SAFRA · adaptador de exportação (modularização GitHub Pages, 04/11/2026) ═══════════
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
var M=__MANIFEST__;
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
'''
import sys
if len(sys.argv)!=3:
    sys.exit('uso: python3 modularizar.py <BRZ_SAFRA_arquivo_unico.html> <pasta_saida>')
SRC,OUT=sys.argv[1],sys.argv[2]
raw=open(SRC,'rb').read()
s=raw.decode('utf-8')
assert s.encode('utf-8')==raw

# ---- tokenizer de topo (mesma regra do parser HTML para raw text) ----
blocks=[];i=0
while True:
    m=re.compile(r'<!--|<(script|style)\b',re.I).search(s,i)
    if not m: break
    if m.group(0)=='<!--':
        i=s.find('-->',m.end())+3; continue
    tag=m.group(1).lower(); te=s.find('>',m.end())
    close=re.compile(r'</'+tag+r'[\s/>]',re.I).search(s,te+1); ce=s.find('>',close.start())
    blocks.append(dict(tag=tag,start=m.start(),end=ce+1,open=s[m.start():te+1],cs=te+1,ce=close.start(),close=s[close.start():ce+1]))
    i=ce+1
assert all(b['close'] in ('</style>','</script>') for b in blocks)

STYLE_MAP={None:'css/01-base.css','deral-pr-style':'css/02-deral-pr.css','brz-refinement-s23':'css/03-refinement-s23.css',
 'brz-institutional-s24':'css/04-institutional-s24.css','brz-institutional-s24-mobile-charts':'css/05-institutional-s24-mobile-charts.css',
 'brz-s27-bal-style':'css/06-s27-balanco.css','brz-s28-dyn-style':'css/07-s28-dinamico.css','brz-s28-home-style':'css/08-s28-home.css',
 'brz-s29-bal-style':'css/09-s29-balanco.css','brz-s29-imea-style':'css/10-s29-imea.css','brz-s30-ind-style':'css/11-s30-indicadores.css',
 'brz-s31-zoom-style':'css/12-s31-zoom.css','brz-q26-style':'INLINE','brz-s33-cen-style':'css/14-s33-cenarios.css'}
SCRIPT_MAP={'safra-data':'data/safra-data.js','brz-balance-data':'data/balance-data.js','brz-balance-state':'INLINE','safra-state':'INLINE',
 None:'js/core/app.js','brz-dyn-native':'js/charts/dyn-native.js','brz-i18n':'js/core/i18n.js','brz-safra-revisions':'js/modules/safra-revisions.js',
 'deral-pr-module':'js/modules/deral-pr.js','brz-xlsx':'js/utils/xlsx-writer.js','brz-imea-module':'js/modules/imea.js','brz-base-export':'js/modules/base-export.js',
 'brz-indicadores':'js/modules/indicadores.js','brz-q-zoom':'js/charts/q-zoom.js','brz-balance-module':'js/modules/balanco.js',
 'brz-cen-data':'data/cen-data.js','brz-cen-state':'INLINE','brz-cen-module':'js/modules/cenarios.js','__HISTORY__':'INLINE'}
ADAPTER='js/core/export-adapter.js'
for p in list(STYLE_MAP.values())+list(SCRIPT_MAP.values())+[ADAPTER]:
    assert 'echarts' not in p.lower()

if os.path.exists(OUT): sys.exit('pasta de saida ja existe: '+OUT)
manifest={'styles':[],'scripts':[],'images':[],'self':'<script src="%s"></script>'%ADAPTER}
files={}
pieces=[];pos=0
for b in blocks:
    idm=re.search(r'id="([^"]+)"',b['open']); bid=idm.group(1) if idm else None
    content=s[b['cs']:b['ce']]
    pieces.append(s[pos:b['start']]); pos=b['end']
    if b['tag']=='style':
        if bid not in STYLE_MAP: sys.exit('bloco <style> sem destino no mapa: id=%r'%bid)
        dest=STYLE_MAP[bid]
        if dest=='INLINE': pieces.append(s[b['start']:b['end']]); continue
        tagtxt='<link rel="stylesheet" href="%s">'%dest
        manifest['styles'].append({'tag':tagtxt,'open':b['open'],'path':dest})
        files[dest]=content; pieces.append(tagtxt)
    else:
        if bid not in SCRIPT_MAP: sys.exit('bloco <script> sem destino no mapa: id=%r'%bid)
        dest=SCRIPT_MAP[bid]
        if dest=='INLINE': pieces.append(s[b['start']:b['end']]); continue
        attrs=b['open'][len('<script'):-1]  # ex: ' id="safra-data"'
        tagopen='<script%s src="%s">'%(attrs,dest)
        manifest['scripts'].append({'open_mod':tagopen,'open':b['open'],'path':dest})
        files[dest]=content
        extra='<script src="%s"></script>'%ADAPTER if bid is None else ''
        pieces.append(tagopen+'</script>'+extra)
pieces.append(s[pos:])
html=''.join(pieces)

# ---- imagens dos cartões da tela inicial ----
NAMES={'scr-soja':'card-soja','scr-milho':'card-milho','scr-sorgo':'card-sorgo','scr-trigo':'card-trigo','scr-algodao':'card-algodao',
 'scr-arroz':'card-arroz','scr-feijao':'card-feijao','scr-safras':'card-safras','scr-ind':'card-indicadores','scr-balanco':'card-oferta-demanda',
 'scr-cen':'card-cenarios','scr-deral':'card-deral-pr','scr-imea':'card-imea-mt','scr-base':'card-base'}
EXT={'image/jpeg':'jpg','image/svg+xml':'svg'}
imgbytes={}
def rep(m):
    go,mime,b64=m.group(1),m.group(2),m.group(3)
    data=base64.b64decode(b64,validate=True)
    assert base64.b64encode(data).decode()==b64, 'base64 nao canonico'
    path='assets/images/%s.%s'%(NAMES[go],EXT[mime])
    imgbytes[path]=data
    manifest['images'].append({'path':path,'mime':mime})
    return m.group(0).replace('url(data:%s;base64,%s)'%(mime,b64),'url(%s)'%path)
html,nimg=re.subn(r'<div class="newscard[^"]*" data-go="([a-z\-]+)" style="background-image:url\(data:([a-z/+]+);base64,([A-Za-z0-9+/=]+)\)">',rep,html)
if nimg!=14: print('AVISO: %d imagens de cartao convertidas (esperado 14 no s33)'%nimg)

# ---- grava ----
def w(path,data):
    full=os.path.join(OUT,path); os.makedirs(os.path.dirname(full),exist_ok=True)
    tmp=full+'.tmp'; open(tmp,'wb').write(data); os.replace(tmp,full)
for p,c in files.items(): w(p,c.encode('utf-8'))
for p,d in imgbytes.items(): w(p,d)
w('index.html',html.encode('utf-8'))
w('original/'+os.path.basename(SRC),raw)
w('docs/tools/manifest.json',json.dumps(manifest,ensure_ascii=False,indent=1).encode('utf-8'))
w(ADAPTER,ADAPTER_TPL.replace('__MANIFEST__',json.dumps(manifest,ensure_ascii=False)).encode('utf-8'))
print('styles ext',len(manifest['styles']),'scripts ext',len(manifest['scripts']),'imgs',len(manifest['images']))
print('index bytes',len(html.encode('utf-8')))

print('ok:',OUT)
