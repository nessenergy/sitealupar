# A borda desafia a sonda do monitoramento

Desde a virada (23/09/2026), `www.alupar.com.br` responde **403** a cliente
automatizado vindo de datacenter, com `cf-mitigated: challenge`. Navegador
entra normalmente — o site não tem defeito. Quem perde é o monitoramento: a
sentinela diária e qualquer verificação nossa rodando no GitHub Actions.

Medido em 24/09/2026 (execução 36014135255): HTTP 403,
`cf-mitigated: challenge`, CSP da resposta apontando para
`challenges.cloudflare.com`. Antes disso, duas hipóteses foram descartadas
medindo: dar User-Agent próprio ao `curl` manteve o 403, e trocar `curl` por
`fetch` também. Não é o nome do cliente nem o cliente.

## O que olhar no painel

**Segurança → Configurações → filtrar por "Tráfego de bots"**, e ver qual está
ligado:

| Se estiver ligado | O que dá para fazer |
|---|---|
| **Bot Fight Mode** (plano grátis) | **Não aceita exceção.** Não roda no Ruleset Engine: regra de WAF com *Skip* não tem efeito nenhum. As saídas são desligá-lo ou subir para um plano com Super Bot Fight Mode. |
| **Super Bot Fight Mode** (Pro+) | Aceita exceção. Regra personalizada com ação *Skip* → *All Super Bot Fight Mode rules*, casando um cabeçalho secreto que a sonda envia. |

Fonte: documentação da Cloudflare, `/waf/feature-interoperability/` e
`/bots/get-started/bot-fight-mode/`, seção *Limitations*.

## Se for Super Bot Fight Mode

1. Gerar um segredo e guardá-lo em `secrets.SENTINELA_TOKEN` no repositório.
2. **Segurança → Regras de segurança → Criar regra → Regras personalizadas.**
3. Expressão: `http.request.headers["x-sentinela"][0] eq "<o segredo>"`
4. Ação: *Skip* → marcar **All Super Bot Fight Mode rules**.
5. Ordem: *First*.
6. Fazer a sonda enviar o cabeçalho em `scripts/verificar-hosts.mjs` e em
   `scripts/verificar-no-ar.mjs`, lendo de `process.env.SENTINELA_TOKEN`, e
   passar o segredo no `sentinela.yml`.
7. Reverter a mudança de `sentinela.yml`: a varredura volta a medir o `www`,
   que é o que o visitante usa.

## Se for Bot Fight Mode

Não há exceção. Duas escolhas, e as duas são de quem responde pelo site:

- **Desligar.** Devolve a medição da borda, e tira uma camada de proteção
  contra bot que hoje está ativa.
- **Deixar ligado.** O monitoramento continua medindo o conteúdo pela origem
  (`sitealupar.pages.dev`), que serve o mesmo build. O que fica sem vigia é a
  **borda**: uma troca de DNS, uma regra errada ou um projeto Pages trocado no
  `www` passariam despercebidos até alguém abrir o site no navegador.

## A pergunta que vale mais que o monitoramento

Se o desafio alcança a sonda, **alcança crawler de buscador e de IA?** O
projeto investiu em SEO e publicou `llms.txt` justamente para ser lido por
essas máquinas. No mesmo painel, conferir se *Verified bots* está em **Allow**
— e, em Segurança → Análises → Eventos, procurar Googlebot e Bingbot entre o
tráfego desafiado. Uma indexação perdida custa mais que um alarme vermelho.
