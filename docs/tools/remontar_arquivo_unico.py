# BRZ SAFRA . remontar_arquivo_unico.py
# Reconstroi o HTML de arquivo unico a partir da pasta modular (inverso exato do modularizar.py).
# Uso: python3 remontar_arquivo_unico.py <pasta_modular> <saida.html>
import sys
# Reconstroi o HTML original a partir da estrutura modular (prova de reversibilidade byte a byte)
import json,base64,os,hashlib
OUT,DEST=sys.argv[1],sys.argv[2]
m=json.load(open(os.path.join(OUT,'docs/tools/manifest.json'),encoding='utf-8'))
h=open(os.path.join(OUT,'index.html'),encoding='utf-8').read()
h=h.replace(m['self'],'',1)
for st in m['styles']:
    c=open(os.path.join(OUT,st['path']),encoding='utf-8').read()
    assert h.count(st['tag'])==1; h=h.replace(st['tag'],st['open']+c+'</style>')
for sc in m['scripts']:
    c=open(os.path.join(OUT,sc['path']),encoding='utf-8').read()
    t=sc['open_mod']+'</script>'; assert h.count(t)==1; h=h.replace(t,sc['open']+c+'</script>')
for im in m['images']:
    d=open(os.path.join(OUT,im['path']),'rb').read()
    t='url(%s)'%im['path']; assert h.count(t)==1
    h=h.replace(t,'url(data:%s;base64,%s)'%(im['mime'],base64.b64encode(d).decode()))
rec=h.encode('utf-8')
open(DEST,'wb').write(rec)
print('gerado:',DEST,len(rec),'bytes  sha256',hashlib.sha256(rec).hexdigest())
