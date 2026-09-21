# Medição no ar antes da virada — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pôr a medição de acessos do site institucional no ar antes da virada do domínio, para que o primeiro dia de `www.alupar.com.br` servido pelo site novo já seja medido.

**Architecture:** O código já está pronto no PR #61: o `Base.astro` injeta o beacon do Cloudflare Web Analytics só quando existe a variável `PUBLIC_CF_BEACON_TOKEN`, a CSP já libera o beacon e há teste para isso. O que falta é operação e prova: criar o site no Web Analytics, gravar o token como variável do repositório, fazer o CI rodar de novo com ela, conferir que o beacon sai no HTML e é aceito pela CSP, e só então mesclar. Tudo na véspera da virada, para o tráfego de homologação sujar o menos possível a linha de base.

**Tech Stack:** Astro 5 estático, Cloudflare Pages, Cloudflare Web Analytics (beacon manual), GitHub Actions, `gh` CLI.

**Spec:** `docs/plano-virada.md`, Tarefa 12, pré-condição "P9 no padrão"; a linha P9 da tabela de pendências do mesmo arquivo; e a resposta 4 da Alupar, de 16/09/2026, transcrita abaixo.

## Restrições globais

- **Resposta 4 da Alupar, literal:** "Não teremos isso, pois até a minha chegada isso não existia (histórico e controle do Google Analytics). Vamos estabelecer daqui para frente." Não existe linha de base anterior: os primeiros dias do site novo **são** a linha de base.
- **P9, padrão registrado:** Cloudflare Web Analytics, sem cookie e sem banner. O GA4 volta, com banner de consentimento, se a Alupar pedir.
- **Regra 5 do `AGENTS.md`:** nunca relaxar um limite do CI para fazê-lo passar. Se o beacon derrubar Lighthouse ou CSP, o problema é real e vira conversa.
- **Regra 6 do `AGENTS.md`:** nenhuma atribuição de IA em commit, corpo de PR ou documento. Conferir antes de cada commit: `git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'` tem de devolver `0`.
- **Regra 7 do `AGENTS.md`:** PR verde, sem conflito e sem revisão pendente sai de rascunho e vai para `main`.
- **Injeção automática do Pages: nunca.** O snippet vai no HTML (já está no #61) para passar pelo portão de CSP. Ligar a injeção automática duplicaria o beacon e o tiraria da CSP conferida.
- **O token do beacon não é segredo.** Ele fica visível no HTML de toda página. Vai como *variável* do repositório (`vars.CF_BEACON_TOKEN`), não como *secret*.
- **Quando:** na véspera da virada. Mesclado antes, o `sitealupar.pages.dev` passa a mandar beacons de homologação para o mesmo site e suja a linha de base.

## Pré-condição — não é tarefa de agente

**A Alupar confirma que quer o Cloudflare Web Analytics, e não o GA4.** A resposta 4 fala em "controle do Google Analytics". O padrão P9 é outro produto, sem cookie. Se a escolha for o GA4, **este plano não se aplica**: o #61 se fecha sem merge e o trabalho passa a ser GA4 com banner de consentimento, que precisa de spec própria. Registrar a resposta, com data e nome de quem respondeu, antes da Task 1.

> **Resolvida em 21/09/2026: Cloudflare Web Analytics.** Decisão tomada pela
> ness. na condução do projeto, seguindo o padrão P9. A resposta 4 da Alupar
> citou o Google Analytics; se ela pedir o GA4 depois, o caminho é o descrito
> acima — o Web Analytics sai e o GA4 entra com banner de consentimento.

## Arquivos

| Arquivo | Papel | Tarefa |
|---|---|---|
| `src/layouts/Base.astro` | Injeta o beacon quando há token | já no #61 |
| `public/_headers` | CSP com `static.cloudflareinsights.com` e `cloudflareinsights.com` | já no #61 |
| `scripts/lib/csp.test.mjs` | Prova que o `_headers` libera o beacon | já no #61 |
| `.github/workflows/ci.yml` | Passa `vars.CF_BEACON_TOKEN` ao build | já no #61 |
| `docs/decisoes.md`, `docs/plano-virada.md` | Registro da P9 em vigor | Task 3 |

---

### Task 1: Criar o site no Web Analytics e gravar o token

Operação no painel da Cloudflare e no GitHub. Não há código. O token de API usado nesta sessão **não tem permissão de Web Analytics** — a chamada `GET /accounts/{id}/rum/site_info/list` devolveu `Authentication error` em 21/09/2026 — então o passo 1 é pelo painel.

**Files:** nenhum.

**Interfaces:**
- Produz: a variável de repositório `CF_BEACON_TOKEN`, lida pelo CI como `vars.CF_BEACON_TOKEN` e repassada ao build como `PUBLIC_CF_BEACON_TOKEN`.

- [ ] **Passo 1: Criar o site no painel**

Cloudflare → conta **NESS** (`0a6c490dd5fe9051422c15c9e133138e`) → **Web Analytics** → **Add a site** → hostname `www.alupar.com.br`. **Não** ativar a injeção automática. Na tela seguinte, copiar o valor de `token` do snippet exibido — é uma sequência de 32 caracteres hexadecimais.

- [ ] **Passo 2: Gravar o token como variável do repositório**

```bash
gh variable set CF_BEACON_TOKEN --repo nessenergy/sitealupar --body "<token copiado no passo 1>"
```

- [ ] **Passo 3: Conferir**

```bash
gh variable list --repo nessenergy/sitealupar | grep CF_BEACON_TOKEN
```

Expected: uma linha com `CF_BEACON_TOKEN` e a data de hoje.

---

### Task 2: Fazer o CI rodar com o token e provar o beacon no preview

O verde que o #61 já tem é de um build **sem** a variável: com ele, o site sairia sem medição e nada acusaria. É preciso uma execução nova, iniciada depois da Task 1.

**Files:** nenhum.

**Interfaces:**
- Consome: `vars.CF_BEACON_TOKEN` da Task 1.
- Produz: o #61 verde numa execução iniciada depois da variável, com o preview servindo o beacon.

- [ ] **Passo 1: Trazer o #61 para a `main` atual**

```bash
git fetch origin
git merge-tree --write-tree origin/main origin/feat/medicao-web-analytics >/dev/null && echo limpo || echo CONFLITO
```

Expected: `limpo`. Se vier `CONFLITO`, fazer `git merge origin/main` na branch, resolver, rodar `npm test` e `npm run build`, e empurrar antes de seguir.

- [ ] **Passo 2: Tirar de rascunho — isso dispara o CI de novo**

```bash
gh pr ready 61
```

`ready_for_review` está entre os `types:` do gatilho em `.github/workflows/ci.yml`, então esta execução é nova e já vê a variável.

- [ ] **Passo 3: Esperar o CI terminar**

```bash
gh pr checks 61 --watch
```

Expected: `build`, `publicar-preview` e `qualidade` em `pass`. Um `fail` em `qualidade` é o Lighthouse reprovando com o beacon: não afrouxar limite (regra 5); ler o relatório e trazer o número.

- [ ] **Passo 4: Provar que o preview serve o beacon com o token**

```bash
curl -sS https://feat-medicao-web-analytics.sitealupar.pages.dev/ | grep -o 'data-cf-beacon=[^>]*'
```

Expected: `data-cf-beacon="{&quot;token&quot;:&quot;<o mesmo token da Task 1>&quot;}"`. Vazio significa que o build rodou sem a variável — voltar ao passo 2.

- [ ] **Passo 5: Provar que a CSP publicada libera o beacon**

```bash
curl -sSI https://feat-medicao-web-analytics.sitealupar.pages.dev/ | grep -i '^content-security-policy' | grep -o 'script-src[^;]*\|connect-src[^;]*'
```

Expected: `script-src` contendo `https://static.cloudflareinsights.com` e `connect-src` contendo `https://cloudflareinsights.com`.

---

### Task 3: Mesclar, conferir em produção e registrar a P9 em vigor

**Files:**
- Modify: `docs/decisoes.md` — pendência sobre medição
- Modify: `docs/plano-virada.md` — linha P9 da tabela e o item "P9 no padrão" da Tarefa 12

**Interfaces:**
- Consome: o #61 verde da Task 2.

- [ ] **Passo 1: Mesclar**

```bash
gh pr merge 61 --squash --subject "feat: medicao pelo Cloudflare Web Analytics (#61)"
git fetch origin main && git log -1 --format=%B origin/main | grep -ciE 'co-authored|generated|claude'
```

Expected: o merge conclui; o `grep` devolve `0`.

- [ ] **Passo 2: Esperar a publicação da `main` e conferir em produção**

```bash
gh run watch "$(gh run list --branch main --limit 1 --json databaseId -q '.[0].databaseId')"
curl -sS https://sitealupar.pages.dev/ | grep -c 'data-cf-beacon'
```

Expected: a execução termina em sucesso e o `grep` devolve `1`.

- [ ] **Passo 3: Registrar**

Em `docs/plano-virada.md`, marcar como feito o item "P9 no padrão" da Tarefa 12, com a data, e acrescentar à linha P9 da tabela: `Em vigor desde <data>: Cloudflare Web Analytics, site www.alupar.com.br, beacon manual (PR #61). Confirmado pela Alupar em <data>, por <nome>.`

Em `docs/decisoes.md`, nas pendências operacionais, acrescentar:

```markdown
- Medição (P9) em vigor desde <data>, pelo Cloudflare Web Analytics, sem cookie
  e sem banner. Os acessos anteriores à virada são tráfego de homologação em
  `sitealupar.pages.dev`: ao ler os números, filtrar pelo host
  `www.alupar.com.br`. Se a Alupar passar a querer o GA4, o banner de
  consentimento volta a ser obrigatório.
```

- [ ] **Passo 4: Commitar por PR**

```bash
git checkout -b docs/p9-em-vigor
git add docs/decisoes.md docs/plano-virada.md
git commit -m "docs: medicao P9 em vigor"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
git push -u origin docs/p9-em-vigor
gh pr create --base main --head docs/p9-em-vigor --title "docs: medicao P9 em vigor" --body "Registra a P9 em vigor: Cloudflare Web Analytics desde <data>, pelo #61."
```

Mesclar quando o CI ficar verde (regra 7).

---

### Task 4: Conferir, depois da virada, que os dados chegam

Um dia depois de `www.alupar.com.br` passar a apontar para o Pages.

**Files:** nenhum.

- [ ] **Passo 1: Ler o painel**

Cloudflare → **Web Analytics** → site `www.alupar.com.br` → últimas 24 horas, filtro de host `www.alupar.com.br`.

Expected: visitas e pageviews diferentes de zero. Zero com o site no ar significa beacon bloqueado ou token trocado: repetir os passos 4 e 5 da Task 2 contra `https://www.alupar.com.br/`.

- [ ] **Passo 2: Avisar a Alupar**

Uma linha para a Comunicação: a medição começou em `<data da virada>`, e esse é o marco zero da série — não há histórico anterior para comparar, como ela mesma informou.
