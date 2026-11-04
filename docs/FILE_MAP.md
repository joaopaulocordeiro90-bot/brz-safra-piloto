# FILE_MAP · BRZ SAFRA modular (s33)

Todos os scripts são **clássicos** (sem `type="module"`, sem `defer`/`async`), carregados de forma síncrona na mesma posição do bloco original. Assim, escopo global, ordem de execução e momento do `DOMContentLoaded` ficam iguais ao arquivo único.

## Ordem de carregamento no index.html

**`<head>`** (cascata do CSS, na ordem original)

| # | Arquivo | Bloco original | Conteúdo |
|---|---|---|---|
| 1 | `css/01-base.css` | `<style>` sem id | Base: tokens, topo, telas, cartões, gráficos |
| 2 | `css/02-deral-pr.css` | `deral-pr-style` | Aba DERAL · PR |
| 3 | `css/03-refinement-s23.css` | `brz-refinement-s23` | Refinamentos s23 |
| 4 | `css/04-institutional-s24.css` | `brz-institutional-s24` | Padrão institucional s24 |
| 5 | `css/05-institutional-s24-mobile-charts.css` | `brz-institutional-s24-mobile-charts` | Gráficos no mobile |
| 6 | `css/06-s27-balanco.css` | `brz-s27-bal-style` | Oferta & Demanda s27 |
| 7 | `css/07-s28-dinamico.css` | `brz-s28-dyn-style` | Modo dinâmico |
| 8 | `css/08-s28-home.css` | `brz-s28-home-style` | Tela inicial |
| 9 | `css/09-s29-balanco.css` | `brz-s29-bal-style` | Oferta & Demanda s29 |
| 10 | `css/10-s29-imea.css` | `brz-s29-imea-style` | Aba IMEA · MT |
| 11 | `css/11-s30-indicadores.css` | `brz-s30-ind-style` | Indicadores |
| 12 | `css/12-s31-zoom.css` | `brz-s31-zoom-style` | Ampliar painéis |
| 13 | **inline** no index.html | `brz-q26-style` | Quadro de estimativas. Fica inline porque `js/modules/safra-revisions.js` lê o texto deste bloco (`getElementById('brz-q26-style').textContent`) para montar o PNG |
| 14 | `css/14-s33-cenarios.css` | `brz-s33-cen-style` | Cenários & Estatísticas, Farelo e Óleo |

A numeração segue a posição original. Não existe `css/13-*` porque o bloco 13 continua inline.

**`<body>`** (marcação das 16 telas e, em seguida, os scripts)

| # | Arquivo | Bloco original | Responsabilidade | Globais publicadas / usadas (busca no código) |
|---|---|---|---|---|
| 1 | `data/safra-data.js` | `safra-data` | `window.C`: meta, série histórica, progresso semanal, publicações Conab (vintages), DERAL PR, IMEA MT | publica `C` |
| 2 | `data/balance-data.js` | `brz-balance-data` | Balanço oficial Conab (1º lev. 2026/27) | publica `__BAL_OFFICIAL__` |
| 3 | inline | `brz-balance-state` | Cenário Agrinvest salvo. Inline porque `balanco.js` regrava este bloco | publica `__AGR_BALANCE__` |
| 4 | inline | `safra-state` | Edições salvas. Inline porque SALVAR e EXPORTAR HTML regravam este bloco | publica `__SAVED__` |
| 5 | `js/core/app.js` | `<script>` sem id | Motor principal: BUILD, gráficos SVG, cartões, navegação, modo edição, SALVAR, EXPORTAR HTML, `dl()`, PNG dos cartões | usa `C`, `__SAVED__`, `BRZBAL`, `BRZIMEA`; publica as funções globais do app |
| 6 | `js/core/export-adapter.js` | **novo** | Intercepta só o `dl()` do EXPORTAR HTML e remonta o arquivo único | envolve `dl` |
| 7 | `js/charts/dyn-native.js` | `brz-dyn-native` | Modo dinâmico nativo (API compatível, sem CDN) | publica `echarts` |
| 8 | `js/core/i18n.js` | `brz-i18n` | Seletor PT-BR / EN | envolve `alert`, `confirm`, `prompt` e `exportarHTML` |
| 9 | `js/modules/safra-revisions.js` | `brz-safra-revisions` | Quadro de estimativas Conab, publicações, CSV/PNG do quadro | publica `BRZREV`; lê o CSS inline `brz-q26-style` |
| 10 | `js/modules/deral-pr.js` | `deral-pr-module` | Aba DERAL · PR | publica `BRZDERAL`; usa `C.deralPR` |
| 11 | `js/utils/xlsx-writer.js` | `brz-xlsx` | Gerador .xlsx nativo | publica `BRZXLSX` |
| 12 | `js/modules/imea.js` | `brz-imea-module` | Aba IMEA · MT | publica `BRZIMEA`; usa `C.imeaMT`, `BRZXLSX` |
| 13 | `js/modules/base-export.js` | `brz-base-export` | Base de Dados → Excel completo | publica `BRZBASEXLSX`; usa `C`, `__BAL_OFFICIAL__`, `BRZBAL`, `BRZIMEA`, `BRZXLSX` |
| 14 | `js/modules/indicadores.js` | `brz-indicadores` | Aba Indicadores | publica `BRZIND`; usa `C`, `__BAL_OFFICIAL__` |
| 15 | `js/charts/q-zoom.js` | `brz-q-zoom` | Ampliar painéis do quadro | publica `BRZQZOOM` |
| 16 | `js/modules/balanco.js` | `brz-balance-module` | Oferta & Demanda: Conab oficial e cenário Agrinvest | publica `BRZBAL`; envolve `exportarHTML`; usa `__BAL_OFFICIAL__`, `__AGR_BALANCE__`, `BRZXLSX` |
| 17 | `data/cen-data.js` | `brz-cen-data` | Edições, casa, Conab O&D, Abiove, WASDE, MDIC | publica `__CEN_DATA__` |
| 18 | inline | `brz-cen-state` | Premissas e simulador. Inline porque `cenarios.js` regrava este bloco | publica `__CEN_STATE__` |
| 19 | `js/modules/cenarios.js` | `brz-cen-module` | Cenários & Estatísticas; Soja: Farelo, Óleo, Esmagamento | publica `BRZCEN`; usa `__CEN_DATA__`, `__CEN_STATE__`, `__BAL_OFFICIAL__` |
| 20 | inline | `__HISTORY__` | Histórico de versões (JSON não executável), bloco de continuidade | nenhum |

Como `i18n.js` e `balanco.js` envolvem `exportarHTML`, o adaptador atua em `dl()`, o último passo da exportação. Assim, ele funciona com qualquer camada que envolva a função.

## Outros arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura das telas, logo `brzlogo` (base64 inline, usada na marca d'água dos PNG), blocos inline acima e referências aos arquivos |
| `assets/images/card-*.jpg` (9) | Fotos dos cartões da tela inicial: soja, milho, sorgo, trigo, algodão, arroz, feijão, safras, base |
| `assets/images/card-*.svg` (5) | Ilustrações dos cartões: indicadores, oferta-demanda, cenários, deral-pr, imea-mt |
| `original/BRZ_SAFRA_s33_original.html` | HTML de arquivo único recebido, sem alteração (referência e uso offline) |
| `.nojekyll` | Desliga o Jekyll no GitHub Pages |
| `docs/tools/modularizar.py` | Arquivo único → estrutura modular |
| `docs/tools/remontar_arquivo_unico.py` | Estrutura modular → arquivo único (inverso exato) |
| `docs/tools/manifest.json` | Mapa tag modular ↔ bloco original (usado pelos scripts e embutido no adaptador) |
| `docs/SHA256SUMS.txt` | Hash de cada arquivo |

## Persistência (localStorage)

Chaves usadas, sem alteração: `brz_safra_state`, `brz_safra_dataC`, `brz_safra_agrinvest_bal_v1`, `brz_safra_cen_v1`, `brz_safra_language`.

## Rede

Nenhuma requisição externa. Links para Conab e notícias são apenas âncoras. O único `fetch` existe no adaptador, para os arquivos do próprio site, e só ao clicar em EXPORTAR HTML.
