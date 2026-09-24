# A sentinela volta a enxergar o site

> **Para quem executa:** SUB-SKILL OBRIGATÓRIA: use superpowers:executing-plans
> para implementar tarefa a tarefa. Os passos usam caixas (`- [ ]`).

**Objetivo:** devolver ao monitoramento diário a capacidade de distinguir "a
borda desafiou a sonda" de "o site caiu", e reconquistar a medição do conteúdo
publicado, sem afrouxar o alarme.

**Arquitetura:** o julgamento continua numa função pura
(`scripts/lib/sentinela.mjs`), testada; quem fala com a rede
(`scripts/verificar-hosts.mjs`) passa a ler o cabeçalho `cf-mitigated` e a
entregar esse fato ao julgamento. Enquanto a borda desafiar, a varredura do
acervo mede a **origem** (`sitealupar.pages.dev`), que serve exatamente o mesmo
build — o conteúdo continua vigiado todo dia. A cegueira que sobra é nomeada,
não escondida, e a Tarefa 4 a elimina se o plano da zona permitir.

**Tech Stack:** Node 22, `node --test`, GitHub Actions, Cloudflare (WAF /
Bot Fight Mode).

**Spec:** este documento. A investigação que o originou está registrada em
`docs/decisoes.md` (D29, criada na Tarefa 5).

## Fatos medidos em 24/09/2026 (a base do plano)

| Fato | Como foi medido |
|---|---|
| `www.alupar.com.br` devolve **403** a runner do GitHub, com `curl` **e** com `fetch` | execuções 36013693002 e 36013867857 |
| A resposta traz **`cf-mitigated: challenge`** e CSP de `challenges.cloudflare.com` | execução 36014135255, cabeçalhos completos |
| Dar User-Agent próprio ao `curl` **não** resolve | execução 36013693002 |
| O site está no ar e correto | pedido de outra rede devolveu a home com o menu certo |
| `sitealupar.pages.dev` responde normalmente ao runner | job `verificar` do CI, 666 endereços, verde |
| **Bot Fight Mode (grátis) não pode ser dispensado** por regra de WAF; só o Super Bot Fight Mode (Pro+) aceita *Skip* | documentação da Cloudflare, `/waf/feature-interoperability/` |

## Restrições globais

- Código em inglês; comentários, docs e commits em **português**.
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.
- TDD: teste antes do código. Toda lógica de julgamento é função pura testada.
- **Nenhuma atribuição de IA** em commit, PR, issue ou documento. Branches pelo
  assunto (`fix/…`, `docs/…`, `ci/…`).
- Segredo nunca no código nem em log — só em `secrets` do GitHub.
- **Alarme que não pode ser atendido é alarme que se aprende a ignorar.** É a
  razão de existir deste plano; nenhuma tarefa pode deixar vermelho permanente.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/lib/sentinela.mjs` (modificar) | julgar um host, agora sabendo o que é desafio de borda |
| `scripts/lib/sentinela.test.mjs` (modificar) | fixar esse julgamento |
| `scripts/verificar-hosts.mjs` (modificar) | pedir com `fetch`, ler `cf-mitigated`, entregar ao julgamento |
| `.github/workflows/sentinela.yml` (modificar) | apontar a varredura do acervo para a origem |
| `infra/borda-desafia-a-sonda.md` (criar) | o que olhar no painel e o que fazer em cada caso |
| `docs/decisoes.md` (modificar) | D29, a decisão e o que ela custa |

---

### Tarefa 1: o julgamento aprende a diferença entre desafio e queda

**Arquivos:**
- Modificar: `scripts/lib/sentinela.mjs`
- Modificar: `scripts/verificar-hosts.mjs`
- Teste: `scripts/lib/sentinela.test.mjs`

**Interfaces:**
- Consome: nada de tarefas anteriores.
- Produz: `avaliar({ host, caminho, codigo, saidaCurl, fim, agora, virada, desafiado })`
  — novo campo booleano `desafiado`; novo `estado` possível `'borda-desafiou'`;
  `ok === true` quando desafiado.

- [ ] **Passo 1: escrever os testes que falham**

Acrescentar ao fim de `scripts/lib/sentinela.test.mjs`:

```js
/* A borda desafia a sonda desde a virada: cliente automatizado de datacenter
   recebe 403 com `cf-mitigated: challenge`, enquanto o navegador entra. Ler
   isso como queda do site foi o que deixou o alarme vermelho sobre coisa
   nenhuma em 24/09/2026 — e alarme assim ninguém lê. */
test('desafio da borda não é queda do site: relata e não reprova', () => {
  const r = avaliar({
    host: 'www.alupar.com.br', codigo: '403', saidaCurl: 0, desafiado: true,
    fim: 'Dec 22 23:23:53 2026 GMT', agora: new Date('2026-09-24'),
  });
  assert.equal(r.estado, 'borda-desafiou');
  assert.equal(r.ok, true);
  assert.match(r.mensagem, /desafiou a sonda/);
});

test('403 sem desafio continua reprovando: aí é recusa de verdade', () => {
  const r = avaliar({
    host: 'www.alupar.com.br', codigo: '403', saidaCurl: 0, desafiado: false,
    fim: 'Dec 22 23:23:53 2026 GMT', agora: new Date('2026-09-24'),
  });
  assert.equal(r.estado, 'sem-resposta');
  assert.equal(r.ok, false);
});

/* O desafio não pode virar um guarda-chuva: o que a sonda ainda enxerga
   daquele host é o certificado, e é o vencimento que este alarme existe para
   dar. Perdê-lo seria trocar um ruído por um silêncio pior. */
test('desafio não esconde certificado perto de vencer', () => {
  const r = avaliar({
    host: 'www.alupar.com.br', codigo: '403', saidaCurl: 0, desafiado: true,
    fim: 'Oct 1 00:00:00 2026 GMT', agora: new Date('2026-09-24'),
  });
  assert.equal(r.estado, 'certificado-vencendo');
  assert.equal(r.ok, false);
});
```

- [ ] **Passo 2: rodar e ver falhar**

Rodar: `node --test scripts/lib/sentinela.test.mjs`
Esperado: FALHA nos três — `estado` vem `'sem-resposta'` e `ok` vem `false`,
porque `avaliar` ainda não conhece o campo `desafiado`.

- [ ] **Passo 3: implementar o julgamento**

Em `scripts/lib/sentinela.mjs`, na assinatura de `avaliar`, acrescentar
`desafiado = false` aos parâmetros com valor padrão, e documentá-lo no JSDoc:

```js
 * @param {boolean} [e.desafiado] a borda respondeu com desafio (`cf-mitigated`)
```

Depois do cálculo de `respondeu`, antes do `let estado`, acrescentar o bloco
com o porquê:

```js
/*
 * Desde a virada, a Cloudflare aplica desafio gerenciado a cliente
 * automatizado vindo de datacenter: o runner recebe 403 com
 * `cf-mitigated: challenge`, e o navegador entra normalmente. Isso não é o
 * site fora do ar — em 24/09/2026 custou um alarme vermelho enquanto a home
 * respondia certo de outra rede. O que a sonda perde é a medição do
 * conteúdo daquele host; quem a cobre é a varredura do acervo contra a
 * origem, que serve o mesmo build (ver .github/workflows/sentinela.yml).
 */
```

Na cadeia de `estado`, inserir o caso **antes** de `!respondeu`:

```js
  if (dias === null) estado = 'sem-certificado';
  else if (cadeiaIncompleta) estado = 'cadeia-incompleta';
  else if (desafiado) estado = 'borda-desafiou';
  else if (!respondeu) estado = 'sem-resposta';
  else estado = 'ok';
```

Na condição de `ok`, acrescentar o novo estado:

```js
  const ok =
    estado === 'ok'
    || estado === 'borda-desafiou'
    || estado === 'certificado-de-terceiro'
    || (estado === 'cadeia-incompleta' && toleraCadeia);
```

Na montagem de `nota`, acrescentar o primeiro ramo:

```js
  const nota = estado === 'borda-desafiou' ? ' · a borda desafiou a sonda, o conteúdo é medido na origem'
    : estado === 'cadeia-incompleta' && toleraCadeia ? ' · conhecido, sai na virada'
    : estado === 'certificado-de-terceiro' ? ' · certificado de outra equipe, informativo'
    : '';
```

O teste do certificado já passa sem mais nada: o bloco de vencimento roda
**depois** desta cadeia e sobrepõe o estado, que é exatamente o desejado.

- [ ] **Passo 4: rodar e ver passar**

Rodar: `node --test scripts/lib/sentinela.test.mjs`
Esperado: PASS, sem falha nos testes que já existiam.

- [ ] **Passo 5: a sonda passa a ler o cabeçalho**

Em `scripts/verificar-hosts.mjs`, trocar o import e a função `pedir`:

```js
import { spawnSync } from 'node:child_process';
```
(remover `import { devNull } from 'node:os';` — o `curl` sai do caminho HTTP)

```js
/*
 * A sonda pede com `fetch`, não com `curl`.
 *
 * Não é preferência: em 24/09/2026 os dois levaram 403 da borda, e o
 * cabeçalho `cf-mitigated` — que é o que distingue desafio de queda — só é
 * legível aqui sem reprocessar texto de `curl -D`. O certificado continua
 * vindo do `openssl`, que é quem enxerga o que foi servido.
 */
async function pedir(host, caminho) {
  try {
    // 'manual': o apex responde 301 para o www, e seguir apagaria o que se mede.
    const r = await fetch(`https://${host}${caminho}`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(ESPERA * 1000),
    });
    await r.body?.cancel();
    return { codigo: String(r.status), saidaCurl: 0, desafiado: r.headers.has('cf-mitigated') };
  } catch (e) {
    /* O nome do erro entra no lugar do código: foi a falta desse detalhe que
       fez o 403 de hoje parecer queda do site. */
    const causa = e?.cause?.code ?? e?.code ?? e?.name ?? 'erro';
    return { codigo: `erro:${causa}`, saidaCurl: 1, desafiado: false };
  }
}
```

E no laço, propagar o campo novo e esperar a promessa:

```js
  const { codigo, saidaCurl, desafiado } = await pedir(host, caminho);
  const r = avaliar({ host, caminho, codigo, saidaCurl, desafiado, fim: vencimento(host), virada });
```

- [ ] **Passo 6: rodar a sonda de verdade e a suíte inteira**

Rodar: `node scripts/verificar-hosts.mjs && npm test`
Esperado: os cinco hosts com `ok`, e `pass 219 / fail 0` (216 antes + 3 novos).

Observação honesta para quem executa: **daqui de dentro o `www` responde 200**,
porque a rede de quem roda não é datacenter. O caso `borda-desafiou` só aparece
no runner — quem prova é a Tarefa 3.

- [ ] **Passo 7: commit**

```bash
git add scripts/lib/sentinela.mjs scripts/lib/sentinela.test.mjs scripts/verificar-hosts.mjs
git commit -m "fix: a sentinela distingue desafio da borda de queda do site"
```

---

### Tarefa 2: a varredura do acervo mede a origem enquanto a borda desafiar

**Arquivos:**
- Modificar: `.github/workflows/sentinela.yml`

**Interfaces:**
- Consome: o estado `'borda-desafiou'` da Tarefa 1 (só como justificativa; não
  há dependência de código).
- Produz: nada que tarefas seguintes consumam.

Sem isto a Tarefa 1 não fecha nada: o passo "Todo endereço vivo do acervo
termina em 200" chama `verificar-no-ar.mjs` sem argumento, e o padrão dele é
`https://www.alupar.com.br` — os 666 endereços batem no mesmo desafio e o job
segue vermelho.

- [ ] **Passo 1: apontar a varredura para a origem**

Em `.github/workflows/sentinela.yml`, no passo
`Todo endereço vivo do acervo termina em 200`, substituir por:

```yaml
      # Depois da virada (variável VIRADA=sim): a continuidade inteira, todo dia.
      #
      # Contra a origem, e não contra o www: desde a virada a borda aplica
      # desafio gerenciado a cliente automatizado de datacenter, e os 666
      # endereços voltariam 403 sem que nada estivesse errado (24/09/2026).
      # A origem serve exatamente o mesmo build — o que se perde é a medição
      # da borda, não a do conteúdo. Some assim que a regra de Skip existir
      # (infra/borda-desafia-a-sonda.md).
      - name: Todo endereço vivo do acervo termina em 200
        if: vars.VIRADA == 'sim'
        run: node scripts/verificar-no-ar.mjs https://sitealupar.pages.dev
```

- [ ] **Passo 2: validar o YAML**

Rodar:
```bash
python -c "import yaml,io;d=yaml.safe_load(io.open('.github/workflows/sentinela.yml',encoding='utf-8'));print([s.get('name','uses') for s in d['jobs']['checar']['steps']])"
```
Esperado: imprime os 6 passos, sem exceção de parse. (Um YAML quebrado faz o
`workflow_dispatch` responder HTTP 422 — foi o que aconteceu em 24/09.)

- [ ] **Passo 3: commit**

```bash
git add .github/workflows/sentinela.yml
git commit -m "ci: a varredura diária mede a origem enquanto a borda desafia a sonda"
```

---

### Tarefa 3: provar no runner, que é o único lugar onde o defeito existe

**Arquivos:** nenhum. É verificação.

**Interfaces:**
- Consome: as Tarefas 1 e 2, já commitadas e empurradas numa branch.
- Produz: a prova de que a sentinela fica verde sem mentir.

- [ ] **Passo 1: empurrar a branch**

```bash
git push -u origin fix/sentinela-enxerga-a-borda
```

- [ ] **Passo 2: disparar a sentinela naquela branch**

```bash
gh workflow run sentinela.yml --ref fix/sentinela-enxerga-a-borda
```

Esperado: imprime a URL da execução. Se responder
`HTTP 422: Workflow does not have 'workflow_dispatch' trigger`, **o YAML está
quebrado** — voltar ao Passo 2 da Tarefa 2 antes de qualquer outra coisa.

- [ ] **Passo 3: ler o resultado**

```bash
id=$(gh run list --workflow=sentinela.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch $id --exit-status --compact >/dev/null 2>&1
gh run view $id --json conclusion -q .conclusion
gh run view $id --log | sed 's/\x1b\[[0-9;]*m//g' | grep -E "(ok  |FALHA|endereços|aprovado)" | sed 's/.*Z //'
```

Esperado:
- conclusão `success`;
- linha `ok   www.alupar.com.br → HTTP 403 · borda-desafiou · … · a borda desafiou a sonda, o conteúdo é medido na origem`;
- linha `aprovado: todos terminam em 200.` da varredura contra a origem.

Se `www` ainda aparecer como `sem-resposta`, o cabeçalho não está sendo lido:
conferir se `pedir` devolve `desafiado` e se o laço o propaga (Tarefa 1,
Passo 5).

- [ ] **Passo 4: abrir o PR**

```bash
gh pr create --base main --head fix/sentinela-enxerga-a-borda \
  --title "A sentinela distingue desafio da borda de queda do site"
```

No corpo, os fatos medidos da tabela no topo deste plano, o que a mudança
**não** cobre (a Tarefa 5 registra), e o link da execução do Passo 3.

---

### Tarefa 4: decidir na Cloudflare — só com quem tem o painel

**Arquivos:**
- Criar: `infra/borda-desafia-a-sonda.md`

**Interfaces:**
- Consome: nada.
- Produz: a decisão que remove a cegueira, quando houver quem a tome.

Esta tarefa **não é executável por um agente**: depende de credencial e de uma
escolha de postura de segurança num site em produção. O entregável é o
documento que põe a decisão na mesa com as opções já apuradas.

- [ ] **Passo 1: escrever `infra/borda-desafia-a-sonda.md`**

Conteúdo, na íntegra:

```markdown
# A borda desafia a sonda do monitoramento

Desde a virada (23/09/2026), `www.alupar.com.br` responde **403** a cliente
automatizado vindo de datacenter, com `cf-mitigated: challenge`. Navegador
entra normalmente — o site não tem defeito. Quem perde é o monitoramento:
a sentinela diária e qualquer verificação nossa rodando no GitHub Actions.

Medido em 24/09/2026 (execução 36014135255): 403, `cf-mitigated: challenge`,
CSP apontando para `challenges.cloudflare.com`.

## O que olhar no painel

**Segurança → Configurações → filtrar por "Tráfego de bots"**, e ver qual
está ligado:

| Se estiver ligado | O que dá para fazer |
|---|---|
| **Bot Fight Mode** (plano grátis) | **Não aceita exceção.** Não roda no Ruleset Engine: regra de WAF com *Skip* não tem efeito nenhum. As saídas são desligá-lo ou subir para um plano com Super Bot Fight Mode. |
| **Super Bot Fight Mode** (Pro+) | Aceita exceção. Criar regra personalizada com ação *Skip* → *All Super Bot Fight Mode rules*, casando um cabeçalho secreto que a sonda envia. |

Fonte: documentação da Cloudflare, `/waf/feature-interoperability/` e
`/bots/get-started/bot-fight-mode/` (seção Limitations).

## Se for Super Bot Fight Mode

1. Gerar um segredo e guardá-lo em `secrets.SENTINELA_TOKEN` no repositório.
2. **Segurança → Regras de segurança → Criar regra → Regras personalizadas.**
3. Expressão: `http.request.headers["x-sentinela"][0] eq "<o segredo>"`
4. Ação: *Skip* → marcar **All Super Bot Fight Mode rules**.
5. Ordem: *First*.
6. Fazer a sonda enviar o cabeçalho em `scripts/verificar-hosts.mjs` e em
   `scripts/verificar-no-ar.mjs`, lendo de `process.env.SENTINELA_TOKEN`, e
   passar o segredo no `sentinela.yml`.
7. Reverter a Tarefa 2: a varredura volta a medir `www`, que é o que o
   visitante usa.

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
```

- [ ] **Passo 2: commit**

```bash
git add infra/borda-desafia-a-sonda.md
git commit -m "docs: o que fazer sobre a borda desafiar a sonda do monitoramento"
```

---

### Tarefa 5: registrar a decisão e o que ela custa

**Arquivos:**
- Modificar: `docs/decisoes.md`

**Interfaces:**
- Consome: as Tarefas 1, 2 e 4.
- Produz: o registro; nada de código.

- [ ] **Passo 1: acrescentar D29 ao fim de `docs/decisoes.md`**

Seguir o formato das decisões vizinhas do arquivo. Conteúdo:

```markdown
## D29 — desafio da borda não reprova a sentinela; o conteúdo passa a ser medido na origem

**24/09/2026.** Desde a virada, `www.alupar.com.br` responde 403 com
`cf-mitigated: challenge` a cliente automatizado vindo de datacenter. O site
está correto: de outra rede a home responde 200 com o conteúdo certo. Quem
adoeceu foi o monitoramento.

Duas hipóteses foram descartadas medindo, não discutindo: dar User-Agent
próprio ao `curl` manteve o 403, e trocar `curl` por `fetch` também. Não é o
nome do cliente nem o cliente — é a borda.

**Decidido:** desafio de borda vira estado próprio (`borda-desafiou`), relatado
e não reprovado, e a varredura diária dos 666 endereços passa a medir
`sitealupar.pages.dev`, que serve o mesmo build.

**O que isso custa:** a borda do `www` fica sem vigia diária. Uma troca de DNS,
uma regra errada ou um projeto Pages trocado naquele host passariam
despercebidos até alguém abrir o site no navegador. Aceitamos porque a
alternativa era um alarme vermelho todo dia sobre coisa nenhuma — e alarme
assim se aprende a ignorar, justamente antes do primeiro verdadeiro.

**Como sai:** `infra/borda-desafia-a-sonda.md`. Se a zona tiver Super Bot Fight
Mode, uma regra de *Skip* com cabeçalho secreto devolve a medição da borda e
esta decisão é revertida. Com Bot Fight Mode (grátis) não há exceção possível:
aí a escolha é desligá-lo ou conviver com a cegueira.
```

- [ ] **Passo 2: commit**

```bash
git add docs/decisoes.md
git commit -m "docs: D29 — desafio da borda, o que decidimos e o que custa"
```

---

## Auto-revisão

**Cobertura:** os seis fatos medidos viram tarefa — o 403 com os dois clientes
e o `cf-mitigated` (T1), a varredura bloqueada (T2), a impossibilidade de
provar localmente (T3), o limite do Bot Fight Mode (T4), o custo da decisão
(T5). A pergunta sobre crawler está em T4 porque também é do painel.

**Placeholders:** nenhum. Todo passo traz o código ou o comando exato, e cada
`Esperado:` é verificável.

**Consistência de tipos:** `avaliar` recebe `desafiado` (booleano) em T1 e é a
única assinatura tocada; `pedir` devolve `{codigo, saidaCurl, desafiado}` e o
laço desestrutura os três. O estado `'borda-desafiou'` tem a mesma grafia nos
testes, na implementação, na nota e no que T3 procura no log.

**Lacuna conhecida, de propósito:** T3 prova no runner, não localmente — o
defeito não existe na rede de quem desenvolve. É a única verificação deste
plano que depende do CI, e por isso é uma tarefa, não uma nota de rodapé.
