# BRZ SAFRA — site piloto GitHub Pages | Soja / Plantio

## Objetivo

Site **fixo**, com dados **independentes**. A interface utiliza o padrão de cards e Chart Studio V2 aprovado; o arquivo operacional `BRZ_SAFRA_s25_03Nov_CONAB.html` não foi alterado.

Os dados de semeadura foram extraídos fielmente da s25 (Conab, até **31/10/2026**), com todas as 8 safras e localidades existentes, sem imputar observações ausentes. O conteúdo preserva a classificação de "Semeadura" da fonte. O valor de 54,3% Brasil na última semana é oficial do histórico da s25; estatísticas e média histórica exibidas pelo site são cálculos derivados.

## Estrutura

```
BRZ_SAFRA_SITE_PILOTO_GITHUB/
  index.html                      <- site FIXO
  assets/styles.css              <- visual aprovado
  assets/bootstrap.js            <- leitor e validador JSON
  assets/app.js                  <- gráficos e Chart Studio
  dados/soja/plantio.json        <- ÚNICO ARQUIVO A SUBSTITUIR nas atualizações
  exemplos/atualizacao_31out_2026.json
  scripts/atualizar_plantio.py   <- mesclagem segura de leituras, opcional
  scripts/validar_base.py        <- auditoria antes de publicar
  testes/plantio_24out.json      <- versão da semana anterior para teste
```

Em produção, podem ser publicados somente `index.html`, `assets/` e `dados/`. A pasta `testes/` é para auditoria; a pasta `exemplos/` é didática. Cada cultura/indicador adicional seguirá seu próprio JSON estável (por exemplo, `dados/milho/plantio.json`).

## Publicação inicial no GitHub Pages

1. Crie um **repositório de teste**, inicialmente público e **sem qualquer dado privado da Agrinvest**.
2. Publique os arquivos preservando as pastas `assets` e `dados` e o `index.html` na raiz.
3. Nas configurações do repositório, habilite **GitHub Pages** para publicar a raiz da branch escolhida (ou use um workflow de Pages).
4. Acesse o endereço informado pelo GitHub Pages. O navegador busca `dados/soja/plantio.json` e constrói os gráficos. Aguarde a publicação de cada commit.
5. Para atualizar posteriormente, substitua **apenas** `dados/soja/plantio.json` no GitHub. O endereço e os arquivos da interface permanecem iguais. Recarregue o site ou clique em **Atualizar dados**.

**Importante:** GitHub Pages serve conteúdo estático publicamente, não é um paywall nem garante sigilo de dados. Dados proprietários, cenários privados ou assinaturas pagas exigirão autenticação e API protegida em infraestrutura própria. A pasta JSON no Pages é pública.

## Rotina semanal pretendida

1. Envie ao ChatGPT a planilha oficial Conab de plantio e colheita, acompanhada do JSON atual `dados/soja/plantio.json` (ou disponibilize ambos pela integração com arquivos).
2. Peça: **"Atualize o JSON de plantio da soja. Preserve todas as safras, identifique revisões históricas e valide as observações. Entregue SOMENTE o arquivo JSON atualizado e a auditoria."**
3. O ChatGPT fará a extração da nova leitura, comparará datas/localidades e conferirá sobreposições. Divergências retroativas exigem justificativa e fonte oficial. A base mantém safras anteriores e acrescenta registro de atualizações, sem converter ausência em zero.
4. Baixe o JSON atualizado e faça upload/substituição no mesmo caminho do repositório. **Não altere `index.html`**.
5. Reabra/recarregue o endereço. O site lerá o novo JSON automaticamente. O parâmetro de consulta e `cache: no-store` evitam cache desatualizado na maioria dos navegadores; a publicação do Pages pode levar algum tempo.

Este piloto **não** lê arquivos Excel diretamente no navegador. O fluxo de processamento de arquivos brutos continua no ChatGPT; o site recebe apenas a base normalizada.

## Atualização via script (para reproduzir localmente, opcional)

A pasta `exemplos` contém a leitura real de 31/10/2026, derivada da s25. Para demonstrar a atualização a partir da base anterior:

```bash
python scripts/atualizar_plantio.py --base testes/plantio_24out.json --novos exemplos/atualizacao_31out_2026.json --saida teste-atualizado.json
python scripts/validar_base.py teste-atualizado.json
```

A base de 24/10 registra Brasil em **42,8%**; após mesclar apenas a leitura de 31/10, passa a **54,3%**. O teste de regressão confere que todo o histórico permanece idêntico à s25. No uso semanal, o ChatGPT faz essa mesclagem e entrega o JSON pronto, sem necessidade de executar Python.

## Contrato de dados

`dados/soja/plantio.json`:

- `schema`: `brz.safra.plantio.v1`
- `meta`: cultura, operação, unidade, versão, data da última leitura, fonte, hash da s25
- `series` → safra → localidade (`BR`, `Mato Grosso`, `Paraná`...) → `[["AAAA-MM-DD", porcentagem], ...]`
- `updateLog`: sequência de atualizações realizadas
- `revisions`: correções oficiais de leituras anteriores, com valor anterior e valor novo

O site valida datas crescentes, percentuais entre 0 e 100 e metadados antes de renderizar. O script de mesclagem requer `revisaoOficial=true` no arquivo da nova leitura para substituir um valor antigo diferente, preservando o registro da correção.

Se um arquivo estiver inválido ou indisponível, o site **apresenta erro** em vez de inventar ou usar dados silenciosamente desatualizados.

## Abrir localmente

Por segurança, o navegador normalmente bloqueia `fetch()` do JSON quando você dá duplo clique em `index.html` (`file://`). Use um servidor local:

```bash
cd BRZ_SAFRA_SITE_PILOTO_GITHUB
python -m http.server 8000
```

Abra `http://localhost:8000` no navegador. No GitHub Pages não precisa executar servidor manualmente.

## Limitações do piloto

- Inicialmente, apenas **soja / plantio**. Outros indicadores virão após homologação.
- Interface e Chart Studio preservam o padrão da demonstração V2, mas ainda não há autenticação, contas de usuários nem infraestrutura comercial.
- A base completa do projeto s25 (produção, colheita, DERAL/PR, Oferta & Demanda, revisões mensais) não foi migrada: será realizada em etapas independentes após validação deste fluxo.
- Sem commit automático: o usuário substitui o JSON manualmente no GitHub; automatizar publicação é uma fase posterior.