# TEST_REPORT · BRZ SAFRA modular s33

## Ambiente

- Chromium 153 headless (Playwright 1.63), Linux.
- Servidor HTTP estático local, com a versão modular servida em subdiretório `/brz-safra-piloto/` (simula o GitHub Pages) e o original em `/orig/`.
- Os dois lados rodaram com o **mesmo relógio fixo** (04/11/2026 12:00) e a **mesma semente** de `Math.random`, em contextos de navegador isolados.
- Método: cada ação foi executada nas duas versões, e os resultados foram comparados por hash (texto da tela, número de nós, SVG, downloads) e pixel a pixel (capturas).

## Resultados

| # | Teste | Resultado | Evidência |
|---|---|---|---|
| 1 | Reversão estrutural | **APROVADO** | Arquivo remontado dos módulos = original byte a byte (SHA `8d685730…10c1`) |
| 2 | Sintaxe dos 16 arquivos JS | **APROVADO** | `node --check` sem erro |
| 3 | Carga sem erros | **APROVADO** | 0 erros de console, 0 `pageerror`, 0 requisições com falha, 0 HTTP 4xx/5xx |
| 4 | Referências | **APROVADO** | 43 referências relativas, 0 ausentes; nenhum caminho absoluto, `localhost` ou `file:///` |
| 5 | Dados em memória | **APROVADO** | Hash idêntico de `C` (808.334 caracteres em JSON), `__BAL_OFFICIAL__`, `__CEN_DATA__`, `__AGR_BALANCE__`, `__CEN_STATE__`, `__SAVED__`, `BUILD` |
| 6 | Escopo global | **APROVADO** | 353 globais nas duas versões, mesma lista |
| 7 | Inicialização duplicada | **APROVADO** | 0 IDs duplicados no DOM; texto da página idêntico após a carga |
| 8 | Navegação das 16 telas, desktop 1440×900 | **APROVADO** | 16 capturas de página inteira com 0 pixel de diferença |
| 9 | Navegação das 16 telas, mobile 390×844 | **APROVADO** | 16 capturas com 0 pixel de diferença |
| 10 | Idioma EN nas 16 telas | **APROVADO** | Estado idêntico; 16 capturas com 0 pixel de diferença |
| 11 | Varredura de controles (botões, abas, seletores, cartões com `data-go`) | **APROVADO** | 667 passos (desktop e mobile) com estado idêntico passo a passo. Ver nota |
| 12 | Downloads gerados durante a varredura (PNG 3×, PNG do modo dinâmico, CSV, XLSX) | **APROVADO** | 155 arquivos, todos byte-idênticos |
| 13 | Diálogos | **APROVADO** | Mesmos diálogos nos dois lados ("Gravar a simulação como cenário…", "Limpar edições salvas…") |
| 14 | Persistência: modo edição, SALVAR e recarregar | **APROVADO** | Mesmas 4 chaves de localStorage, conteúdo idêntico, estado restaurado após recarga |
| 15 | EXPORTAR HTML (via HTTP) | **APROVADO** | Arquivo byte-idêntico ao do original: SHA `5b911aa6…441c`, 4.147.944 bytes |
| 16 | HTML exportado pela versão modular, aberto isolado | **APROVADO** | Carrega `C`, 0 `<script src>`/`<link>`, 0 erros |
| 17 | Versão modular via file:// | **APROVADO COM LIMITAÇÃO** | Abre, 16 telas e dados OK; EXPORTAR HTML bloqueado com aviso, sem arquivo gerado (esperado) |
| 18 | ZIP extraído e retestado | **APROVADO** | `unzip -t` sem erro; a partir do ZIP extraído, repetidos os testes 3, 5, 6, 10, 14 e 15 (resultados iguais) e a reversão ao original (SHA `8d685730…10c1`) |

**Nota do teste 11:** na primeira rodada, com espera de 120 ms entre cliques, a aba Base divergiu em 1 passo logo após gerar o Excel completo: a lista de botões ainda estava sendo redesenhada. Com espera de 600 ms, os 14 passos da aba ficaram idênticos. Trata-se de tempo do teste, não de regressão.

## Não executado / PENDENTE DE VALIDAÇÃO

- Publicação real no GitHub Pages: **PENDENTE DE VALIDAÇÃO** (simulado com servidor estático local em subdiretório).
- Firefox, Safari e navegadores móveis reais: **PENDENTE DE VALIDAÇÃO**.
- Arraste de zoom nos gráficos dinâmicos, arraste de elementos e edição de texto no modo edição: não automatizados (o código é o mesmo arquivo, byte a byte).
- Importação de arquivos (seletor de arquivo): não automatizada.

## Checklist pós-publicação sugerido

1. Abrir `https://joaopaulocordeiro90-bot.github.io/brz-safra-piloto/` e conferir a tela inicial com as 14 fotos.
2. F12 > Console: nenhum erro vermelho. Aba Rede: nenhum 404.
3. Percorrer Soja, Oferta & Demanda, Cenários, DERAL e IMEA; baixar 1 PNG e 1 CSV.
4. Opções > EXPORTAR HTML: o arquivo baixado deve abrir sozinho, fora do site.
