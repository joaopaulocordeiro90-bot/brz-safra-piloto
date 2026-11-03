# BRZ SAFRA — piloto de arquitetura externa · Auditoria V1

**Data do protótipo:** 03/11/2026. **Fonte da base:** BRZ SAFRA s25 (`BRZ_SAFRA_s25_03Nov_CONAB.html`) intacta.

| Verificação | Resultado |
|---|---|
| SHA256 s25 original | `1a8ea5020ec13024e63f50a17f153eef41bd9aa22ed117e2cfa4aaeed87eedf0` — preservado |
| Safras de soja / semeadura importadas | 8 (2019/20 a 2026/27) |
| Localidades | 13 (12 estados + Brasil) |
| Registros em 24/10 | 3.534 |
| Registros em 31/10 | 3.547 |
| Diferença | 13 novas leituras estaduais/nacionais |
| Brasil 24/10 → 31/10 | 42,8% → 54,3% |
| Paraná 31/10 | 62,0% |
| Teste de mesclagem | Arquivo reconstruído a partir da base de 24/10 + atualização real de 31/10 reproduziu **exatamente** todas as séries da s25 |
| Histórico de 24/10 | Comparado integralmente à s25, sem perdas ou divergências |
| Mesclagem repetida | Idempotente (não duplica leituras) |
| Revisão retroativa divergente sem autorização | Rejeitada |
| Revisão oficial declarada | Preserva anterior e atual no log de correções |
| Navegação e Chart Studio | Aprovado em Chromium usando conteúdo inline injetado para contornar restrições de rede do ambiente de teste |
| Troca isolada de JSON | Base 24/10 mostra 42,8%; base 31/10 mostra 54,3%, sem alterar interface |
| Seleção Paraná | Mostrou 62,0%, consistente com a fonte |
| Visuais | Desktop 1440px; mobile 390px, sem overflow horizontal após ajuste |
| Erros JS nos cenários exercitados | Nenhum |
| Validação sintática de JS | `node --check` para bootstrap e app |

**Limite de teste:** o navegador deste ambiente bloqueia navegação a `localhost`. Assim, a auditoria de renderização foi feita inserindo no navegador o mesmo HTML/CSS/JS e resposta JSON, sem conexão HTTP real; isso não equivale a um teste de publicação no GitHub Pages. A leitura pela rota HTTP e o refresh deverão ser conferidos após publicação pelo usuário.

**Não foi feito:** autenticação real, infraestrutura comercial, atualização automatizada no GitHub, integração de milho ou balanços; permanecem fora do escopo do piloto.

**Próximo gate:** usuário testa publicação e abertura; depois adicionaremos `dados/milho/plantio.json` e módulos adicionais sem redesenhar os componentes aprovados.