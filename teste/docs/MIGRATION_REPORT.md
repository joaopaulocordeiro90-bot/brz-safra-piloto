# MIGRATION_REPORT · BRZ SAFRA s33 → estrutura modular

Data: 04/11/2026. Escopo: reorganização estrutural para GitHub Pages. Não houve alteração de dados, cálculos, layout ou comportamento.

## 1. Resumo

| Item | Antes | Depois |
|---|---|---|
| index.html | 3.437.512 bytes (arquivo único) | 146.527 bytes (−95,7%) |
| Blocos CSS | 14 inline | 13 em `css/`, 1 inline |
| Blocos script | 19 inline | 12 de código em `js/`, 3 de dados em `data/`, 4 inline |
| Imagens dos cartões | 14 em base64 inline | 14 em `assets/images/` (9 jpg, 5 svg) |
| Logo `brzlogo` | base64 inline | mantida inline |
| Arquivos novos de código | n/a | 1 (`js/core/export-adapter.js`) |

## 2. Método

1. Inventário com tokenizador que segue a regra do parser HTML para `<style>` e `<script>` (o conteúdo termina no primeiro `</style>` ou `</script>`).
2. **Extração byte a byte.** O conteúdo entre as tags foi gravado sem alteração: nenhuma quebra de linha, espaço ou caractere mudou. Cada bloco virou `<link rel="stylesheet">` ou `<script src>`, na mesma posição do original.
3. Os scripts continuam **clássicos e síncronos**: sem ES Modules, sem `defer` e sem `async`. Isso preserva o escopo global compartilhado (`const`/`let` de topo), a ordem de execução, a disponibilidade do DOM parcial em cada script e o momento do `DOMContentLoaded`.
4. Imagens: o base64 foi decodificado e gravado como arquivo. A recodificação reproduz exatamente o base64 original, o que foi verificado.
5. **Prova de reversibilidade:** `docs/tools/remontar_arquivo_unico.py` reconstrói o arquivo único a partir dos módulos. O resultado é **idêntico byte a byte** ao original, com o mesmo SHA-256.

## 3. O que ficou inline no index.html e por quê

| Bloco | Motivo |
|---|---|
| `brz-q26-style` (CSS) | `safra-revisions.js` lê `getElementById('brz-q26-style').textContent` para embutir o estilo no PNG do quadro. Como `<link>`, o texto viria vazio e o PNG sairia sem estilo |
| `safra-state`, `brz-balance-state`, `brz-cen-state` | O app regrava o texto desses blocos (SALVAR, persistência do balanço e dos cenários) para que o EXPORTAR HTML leve o estado. Em arquivo externo, a regravação não teria efeito |
| `__HISTORY__` | Bloco JSON de continuidade (não executável), mantido junto ao index como no padrão BRZ |
| Logo `brzlogo` | Os PNG dos cartões montam um SVG-imagem com a marca d'água. Imagem SVG não carrega arquivos externos; a logo precisa estar em base64 no DOM (`LOGO_HREF_get`) |

## 4. Dados agrícolas

- `data/safra-data.js` (904.672 bytes): `window.C` com `meta`, `hist`, `prog`, `vintageSchema`, `vintages`, `deralPR` e `imeaMT`.
- `data/balance-data.js`: `window.__BAL_OFFICIAL__`.
- `data/cen-data.js`: `window.__CEN_DATA__`.
- **Decisão:** os dados ficam em `.js` (atribuição a `window.*`), não em `.json` com `fetch`. Motivos: (a) funciona em GitHub Pages e em file:// sem mudar a lógica de carga; (b) carga síncrona, sem condição de corrida; (c) o conteúdo é o mesmo bloco do arquivo único.
- **Decisão:** não dividi em `conab/`, `deral/` e `historical/`. `window.C` é um objeto único, consumido inteiro pelo motor, e o EXPORTAR HTML regrava ele inteiro. Dividir exigiria alterar a lógica de montagem, o que está fora do escopo desta etapa.
- Verificação: os hashes de `JSON.stringify` de `C`, `__BAL_OFFICIAL__`, `__CEN_DATA__` e dos três estados são idênticos entre original e modular no navegador (ver TEST_REPORT).

## 5. Único código novo: `js/core/export-adapter.js`

**Problema:** o EXPORTAR HTML (`exportarHTML`) serializa `document.documentElement.outerHTML`. Na versão modular, essa serialização traria `<link>`, `<script src>` e `url(assets/...)`, gerando um HTML que só funciona dentro da pasta. Isso seria uma regressão do snapshot offline.

**Solução:** o adaptador envolve `window.dl` e atua apenas quando o nome é `BRZ_SAFRA_*.html`, o tipo é `text/html` e o conteúdo contém a tag do próprio adaptador. Nesse caso, lê os arquivos do próprio site (`fetch`, mesma origem) e devolve cada `<link>` a `<style>`, cada `<script src>` a `<script>` (preservando o conteúdo gravado em tempo de execução, como `window.C`) e cada imagem a base64. Por fim, remove a própria tag. Todas as demais chamadas de `dl()` (CSV, XLSX) passam direto, sem alteração.

**Resultado testado:** o arquivo exportado pela versão modular é **byte-idêntico** ao exportado pelo original (SHA-256 `5b911aa66c267f21ca6643baca864e34f14bb3df20b2c5e8faf361cda03b441c`, 4.147.944 bytes, mesmo estado e mesmo relógio).

**Limitação:** em file://, o navegador bloqueia o `fetch`. O adaptador então cancela a exportação com aviso (PT/EN) e não gera arquivo incompleto.

Nenhuma outra linha de código foi escrita ou alterada.

## 6. Preservado

Os 16 cartões e as 16 telas; todos os gráficos, filtros, seletores, tabelas, KPIs e o modo dinâmico nativo; os botões de PNG, CSV, Excel e EXPORTAR HTML; o modo edição, SALVAR e Limpar; o idioma PT/EN; as chaves de localStorage; o título "BRZ · Safras Brasil · s33"; e o BUILD `s33 · 03Nov`.

## 7. Problemas preexistentes e observações (não corrigidos)

- Nenhum erro de console, nenhum ID duplicado e nenhum recurso quebrado foram encontrados no original.
- O EXPORTAR HTML gera um arquivo de cerca de 4,1 MB, maior que o original (3,4 MB), porque serializa o DOM já renderizado. É comportamento do s33, idêntico nas duas versões.
- O texto do aviso de limpeza ("Limpar edições salvas nesta máquina?") e os demais diálogos são os originais.

## 8. Riscos remanescentes

1. **Origem do navegador:** o que foi salvo no arquivo local (file://) não aparece no Pages, porque o localStorage é separado por origem. O domínio `joaopaulocordeiro90-bot.github.io` é compartilhado por todos os repositórios da conta; as chaves têm prefixo `brz_safra_`, então o risco de colisão é baixo.
2. **Repositório público:** a base de dados e o HTML original ficam acessíveis a qualquer pessoa.
3. **Cache:** depois de uma atualização, o navegador pode misturar arquivos antigos e novos até recarregar sem cache.
4. Não testado em Firefox/Safari nem no Pages real (ver TEST_REPORT).

## 9. Hashes SHA-256 (principais arquivos)

| Arquivo | Bytes | SHA-256 |
|---|---|---|
| `original/BRZ_SAFRA_s33_original.html` | 3.437.512 | `8d685730c40da6b7c6443cc11cbd5d3b35320a634f0dcfd9a16db05ea71610c1` |
| `index.html` | 146.527 | `03ce1cd36862f8abc75ae40e1a0681910a76308c9864cf8f8c95ca3807f97282` |
| `data/safra-data.js` | 904.672 | `2ac7e1b7f56c47e330a0278685317fe3c0c55adc370ae71a1abaf6a7b020ff32` |
| `data/balance-data.js` | 5.649 | `535383cb7bbc061f82f239ac7dc1c9a6677b78ff23eb0a201ffc66232e702c34` |
| `data/cen-data.js` | 87.712 | `4568d86f0ca4b581521545ac86d24e394cff4d26d15dd324baf133bd9c938151` |
| `js/core/app.js` | 86.832 | `371cd27d4e257a79feee354ded8fa15dd101ab973d4b47c401e683981776dc0c` |
| `js/core/export-adapter.js` | 8.944 | `93de38e84a4b3c5b1a290c4f3d968f70f15ebe72c69b8c6dfd7160f40f5f92b6` |
| `js/core/i18n.js` | 28.999 | `0e56007ffbb7bc7e987d8ce3ec0be4cac704934de1869a7f99e2b4849ef6d026` |
| `js/charts/dyn-native.js` | 21.814 | `59c7d4f3746bbf974e1518933d9cba7ad996a6869aafec0d0b682821d48ec00e` |
| `js/charts/q-zoom.js` | 3.354 | `172e61d2fedf3231ae86456d29b186cef1b482f18c5918eca7d2a5dd49238b21` |
| `js/modules/safra-revisions.js` | 33.877 | `6b3e5b2705883f5dee31d739d6c1d32d693ebfbfc2551c10d0bf2eb7fba0eb86` |
| `js/modules/deral-pr.js` | 14.614 | `f4191baae8d9b19d69ec6221a61e8d9c53218065f565bc18d10beab1be563f6c` |
| `js/modules/imea.js` | 21.010 | `5ffb8b37a2f846f38f4e3f062ffcadf7dbb4cecc50c6a027f141d6bf90babaa0` |
| `js/modules/base-export.js` | 6.475 | `ff862c9c1ec7758d4b0bd040dae9c177e3c50534560c088833a63e77d7578bef` |
| `js/modules/indicadores.js` | 53.362 | `3fa1b3ae1cce4c81048dc13d01c1baba4968db986669929b5f88ec3c0f7c9295` |
| `js/modules/balanco.js` | 60.272 | `544609dbe2f865a1f036bec9daf9814a1babff2b34b3c3d470be2fa004c57618` |
| `js/modules/cenarios.js` | 95.850 | `349a40bdc9c23bc73ddb2ad6fb588dd10ccd789a39e805bb9ca6cde960bb183b` |
| `js/utils/xlsx-writer.js` | 10.895 | `a6f7b88c1a00d661cb937f89a16b004dfe556074a582109f7ad31c85b54d536f` |
| `css/01-base.css` | 26.976 | `53b066d91efe45b5c8c861c15b0b3cb5f411820204c4c679a6a984e219a3b404` |

Lista completa: `docs/SHA256SUMS.txt`.
