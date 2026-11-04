# BRZ SAFRA · versão modular para GitHub Pages

Build da plataforma: **s33 · 03Nov** (mesmo conteúdo do HTML de arquivo único `original/BRZ_SAFRA_s33_original.html`).
Repositório de destino: `joaopaulocordeiro90-bot/brz-safra-piloto`, branch `main`.

Esta versão é uma reorganização estrutural. Dados, cálculos, layout e comportamento são os do s33.

## 1. Publicação

1. Extrair o ZIP e enviar **todo o conteúdo extraído** (index.html, `.nojekyll` e as pastas) para a raiz do repositório (o `index.html` precisa ficar na raiz).
2. Incluir o arquivo oculto `.nojekyll` (desliga o processamento Jekyll do GitHub Pages). No upload pelo navegador, arquivos que começam com ponto podem ficar escondidos no Explorer/Finder: conferir se ele foi enviado.
3. GitHub: Settings > Pages > Source: *Deploy from a branch*, branch `main`, pasta `/ (root)`. Não usar a opção `/docs`: ela publicaria apenas a documentação.
4. Endereço esperado: `https://joaopaulocordeiro90-bot.github.io/brz-safra-piloto/`
5. Após cada atualização, o Pages leva alguns minutos para publicar. Se a página mostrar versão antiga, recarregar sem cache (Ctrl+F5).

## 2. Execução local

- **Com servidor HTTP (recomendado, igual ao Pages):** na pasta do projeto, `python3 -m http.server 8000` e abrir `http://localhost:8000/`.
- **Duplo clique (file://):** a plataforma abre e funciona, com uma exceção: o botão **EXPORTAR HTML** fica bloqueado com aviso, porque o navegador não permite ler os módulos em file://. Para uso offline com exportação, usar o arquivo único em `original/` ou um arquivo gerado pelo EXPORTAR HTML no Pages.

## 3. Manutenção

| Tarefa | Como fazer |
|---|---|
| Atualizar a base Conab/DERAL/IMEA (window.C) | Editar `data/safra-data.js`. Formato idêntico ao bloco `safra-data` do arquivo único: `window.C={...}` |
| Atualizar oferta e demanda oficial | `data/balance-data.js` (`window.__BAL_OFFICIAL__=...;`) |
| Atualizar Cenários & Estatísticas | `data/cen-data.js` (`window.__CEN_DATA__=...;`) |
| Recebeu nova versão em arquivo único | `python3 docs/tools/modularizar.py <arquivo.html> <pasta_nova>`. Se houver bloco novo, o script para e indica o id a mapear |
| Gerar arquivo único a partir da pasta modular | `python3 docs/tools/remontar_arquivo_unico.py <pasta_modular> <saida.html>` (ou EXPORTAR HTML no Pages, que inclui as edições salvas) |

Regras para não quebrar a versão modular:

- **Não renomear nem mover** arquivos de `css/`, `js/`, `data/` e `assets/images/`. O `index.html` e o adaptador de exportação (`docs/tools/manifest.json` embutido em `js/core/export-adapter.js`) referenciam esses caminhos exatos. Se mudar, rodar de novo o `modularizar.py`.
- **Não usar a palavra "echarts" em nome de arquivo:** o EXPORTAR HTML remove qualquer `<script src>` que contenha esse termo (comportamento herdado do s27).
- Manter a **ordem das tags** no `index.html`: a cascata do CSS e a ordem de execução do JS dependem dela.
- Nomes de arquivo diferenciam maiúsculas e minúsculas no Pages.

## 4. Documentos

- `FILE_MAP.md`: inventário, responsabilidade e dependências de cada arquivo.
- `MIGRATION_REPORT.md`: decisões estruturais, o que foi preservado, limitações e hashes.
- `TEST_REPORT.md`: testes executados, evidências e testes não executados.
- `SHA256SUMS.txt`: hash de todos os arquivos publicados (`sha256sum -c docs/SHA256SUMS.txt` na raiz).
