# BRZ SAFRA · Implantação privada no Cloudflare Workers

**Worker existente:** `brz-safras` (protegido pelo Cloudflare Access).
**GitHub:** repositório privado `joaopaulocordeiro90-bot/brz-safra-piloto`, branch `main`.

## Preparação realizada

Foram incluídos apenas arquivos de implantação: `wrangler.jsonc`, `package.json`, `.gitignore` e `scripts/build-cloudflare.mjs`. O HTML, os estilos, scripts e dados da plataforma permanecem inalterados.

O build gera `dist/` contendo **somente** `index.html`, `assets/`, `css/`, `data/`, `js/` e o arquivo gerado `_headers`. Documentação e scripts de migração não são enviados ao site.

## Conectar o Worker existente ao GitHub

1. Na Cloudflare, abra **Workers e Pages → brz-safras**.
2. Vá a **Configurações → Builds** (ou Compilações) e clique **Conectar**.
3. Selecione GitHub e **somente** o repositório privado `joaopaulocordeiro90-bot/brz-safra-piloto`.
4. Configure a branch de produção `main` e diretório raiz `/`.
5. **Comando da build:** `npm run build`.
6. **Comando de implantação:** `npx wrangler deploy`.
7. Salve. Caso seja preciso um commit adicional para iniciar o primeiro deploy, execute-o somente após conferir a política de acesso; não altere a política.
8. Depois do deploy, teste o endereço do Worker em janela anônima, inclusive recursos diretos: `/data/safra-data.js`, `/js/core/app.js` e `/assets/images/card-soja.jpg`. **Todos** devem exigir login.
9. Após autenticar, valide gráficos, filtros, dados e **EXPORTAR HTML**.

## Segurança

- O Cloudflare Access **não** é configurado por este repositório: ele fica no painel Zero Trust.
- Confirme que a única política de autorização utiliza `Include → Emails → endereço individual`, sem `Everyone`, domínio inteiro ou outra política permissiva.
- Garanta que o escopo seja **Todo o tráfego**, incluindo produção e previews.
- O endereço da plataforma não é uma senha. A proteção deve funcionar mesmo que alguém conheça a URL.
- Arquivos HTML, JS e dados carregados no navegador são visíveis ao usuário autenticado; o Access limita quem pode recebê-los.
- O GitHub deve continuar privado e a publicação antiga do GitHub Pages deve permanecer desligada.

## Manutenção

Alterações na branch `main` poderão disparar um novo build e deploy automaticamente. O processo apenas copia o conteúdo modular vigente, sem alterar seus bytes.

Em caso de falha, verifique **Workers e Pages → brz-safras → Implantações/Builds**. Não desligue o Access para corrigir problemas de carregamento.

## Acionamento da primeira compilação (04/11/2026)

Este commit documental foi realizado para iniciar a compilação automática já conectada ao Worker `brz-safras`. Nenhum arquivo operacional (`index.html`, `css/`, `js/`, `data/`, `assets/`) foi alterado. A proteção do Cloudflare Access deve permanecer ativa para todo o tráfego.
