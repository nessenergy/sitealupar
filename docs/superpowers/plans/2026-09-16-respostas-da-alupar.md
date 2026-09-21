# Respostas da Alupar — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar, no código e nos documentos, as nove definições que a Alupar respondeu em 16/09/2026 — o formulário passa a escrever para a Comunicação com o texto de consentimento do site atual, a área de notícias sai do ar com 301 para o portal de RI, e as decisões ficam registradas onde a próxima pessoa as encontra.

**Architecture:** Três frentes, em sequência por dependência de segredo. (1) O envio do formulário precisa de remetente em domínio verificado antes de poder escrever para fora — hoje o remetente é a caixa de areia do Resend, que só entrega ao dono da conta. (2) A desativação das notícias não mexe no gerador de rotas: `scripts/gerar-mapa-de-rotas.mjs` já descarta todo item do acervo coberto por uma regra do `public/_redirects`, com o motivo `coberto-por-301` — então seis regras com curinga apagam as 210 páginas de notícia e as seis listagens de uma vez, e o resto é remoção de código morto. (3) O destino dos 301 fica num domínio que não é nosso, então entra no sentinela diário.

**Tech Stack:** Astro 5 estático, Cloudflare Pages + Pages Functions, Cloudflare R2, Resend, `node --test`, GitHub Actions.

**Spec:** As respostas da Alupar de 16/09/2026 ("Definições Portal Alupar"), transcritas na íntegra em *Restrições globais* abaixo, respondendo às perguntas de `apresentacao/pauta-comunicacao.html` e às pendências P1–P9 de `docs/plano-virada.md`. Contexto de decisão em `docs/decisoes.md`.

## Restrições globais

Valem para todas as tarefas. Os valores são literais e não devem ser reinterpretados.

**As nove respostas, como vieram:**

1. **Dono do conteúdo:** "A Fabiana Carneiro Pinho é a responsável".
2. **Formulário:** "O e-mail para o formulário deve ser comunicacao@alupar.com.br". Sobre o texto: "manteremos exatamente como está no site hoje (abaixo do formulário uma caixinha para ser marcada de lí e aceite a Política de Privacidade, com o texto deste link (https://www.alupar.com.br/politica-de-privacidade/). Este conteúdo só será alterado no futuro." Prazo de guarda: **não respondido** — a frente de LGPD está sendo redefinida com Bárbara, da ness.
3. **Leitura dos textos nos três idiomas:** "Disponibilizar link para validação pela equipe de comunicação".
4. **Histórico do Google Analytics:** "Não teremos isso, pois até a minha chegada isso não existia (histórico e controle do Google Analytics). Vamos estabelecer daqui para frente."
5. **Notícias na home:** "Vamos retirar esta parte do site temporário, porque as notícias estão antigas. Vamos desativar mesmo."
6. **Notícias de 2023 a 2026:** "Desativar a conteúdo de notícias".
7. **Divulgações de resultados:** "Já pedi para o RI e assim que estiver disponível compartilharemos com vcs." — **pendente**, nada a construir agora.
8. **Menu EN/ES:** "Manter os termos: Careers em inglês e Trabaje con nosotros em espanhol" — já é o que está no ar; só registrar.
9. **Busca do cabeçalho:** "Desativar nesta primeira versão." — já é o que está no ar; só registrar.

**Regras do repositório que nenhuma tarefa pode afrouxar** (`AGENTS.md`):

- Regra 1 / D2: a linguagem visual é imutável; a composição só muda diante de problema medido. A única mudança de composição autorizada aqui é a home passar de três caixas para duas, porque a terceira deixou de existir por decisão da cliente.
- Regra 3: **nenhum endereço do acervo pode devolver 404.** Todo endereço vivo hoje continua respondendo depois da virada, por página ou por 301.
- Regra 5: **nunca relaxar um limite de CI para fazer passar.** Se `lighthouserc.json`, `fechar-continuidade.mjs --verificar` ou `gerar-mapa-de-rotas.mjs --verificar` reprovarem, corrija a causa.
- Regra 6: **nenhuma atribuição de IA** em commit, corpo de PR, comentário de issue ou documento entregue. Sem rodapé `Co-Authored-By`, sem "Generated with", sem branch `claude/*`. Conferir antes de cada commit: `git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'` tem de devolver `0`.
- Commits em português, no padrão *conventional commits*. Branches `feat/`, `fix/`, `docs/`, `chore/`, `ci/`.

**Segredos:** nenhuma chave, token ou senha entra em arquivo versionado, em log, em mensagem de commit ou na conversa. Chave nova vai direto do prompt do `wrangler pages secret put` para o cofre. A chave do Resend, quando uma tarefa precisar dela, é exportada pelo operador na própria sessão de terminal e nunca impressa.

**Estado medido em 16/09/2026,** para que nenhuma tarefa precise adivinhar:

| Medida | Valor |
|---|---|
| Itens de notícia no acervo | 227 (101 pt, 102 en, 24 es) |
| Páginas de notícia construídas | 210 (94 pt, 97 en, 19 es) |
| Endereços vivos sob `/noticia/` e `/noticias/` no inventário | 186 |
| Regras do `public/_redirects` | 405 estáticas, 2 dinâmicas |
| Limite do Cloudflare Pages | 2.000 estáticas, 100 dinâmicas |
| Testes que `npm test` roda hoje | 114 |

Três fatos do levantamento que as tarefas assumem como verdadeiros, e que vale reconferir se algo não bater: todo item de tipo `noticia` vive sob `/noticia/`, sem exceção; sob `/noticias/` só existem as três listagens; e `https://ri.alupar.com.br/noticias/` responde 200.

---

### Task 1: Remetente em domínio verificado (`msg.alupar.com.br`)

O `CONTATO_DESTINO` só pode virar um endereço da Alupar depois disto. Hoje o remetente é a caixa de areia do Resend, que entrega apenas ao dono da conta — trocar o destino antes faria todo envio falhar com 403, em silêncio para quem preenche o formulário.

`envio.alupar.com.br` **não serve**: já existe, com CNAME para `smtplw.com` (Locaweb). Por isso `msg`.

**Files:**
- Nenhum arquivo do repositório muda. A tarefa mexe em DNS (zona `alupar.com.br` na Cloudflare), no Resend e nos segredos do Pages.
- Modify: `docs/plano-virada.md` (Tarefa 10), só para registrar o resultado

**Interfaces:**
- Consome: nada.
- Produz: o domínio `msg.alupar.com.br` verificado no Resend, e um endereço `contato@msg.alupar.com.br` apto a enviar para qualquer destinatário. A Task 2 depende disso.

**Pré-requisito do operador:** a chave do Resend precisa estar na sessão de terminal. O operador a exporta por conta própria, sem colá-la em lugar que fique registrado:

```bash
read -rs RESEND_API_KEY && export RESEND_API_KEY
```

- [ ] **Passo 1: Confirmar que o subdomínio está livre**

```bash
for n in msg.alupar.com.br resend._domainkey.msg.alupar.com.br; do
  printf '%-45s ' "$n"
  curl -sS -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=$n&type=TXT" \
    | grep -o '"data":"[^"]*"' || echo '—'
done
```

Expected: nenhuma resposta para os dois. Se vier alguma, **pare** — alguém já usa o subdomínio, e escolher outro nome é decisão a tomar antes de seguir.

- [ ] **Passo 2: Criar o domínio no Resend**

```bash
curl -sS -X POST https://api.resend.com/domains \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"name":"msg.alupar.com.br","region":"sa-east-1"}' \
  > "$TMPDIR/resend-dominio.json"
node -e "const d=require(process.env.TMPDIR+'/resend-dominio.json'); console.log(d.id, d.status); console.table(d.records.map(({record,name,type,value,priority})=>({record,name,type,value:String(value).slice(0,60),priority})))"
```

Expected: um `id`, `status: "not_started"` e três a quatro registros (SPF em TXT, DKIM em TXT, MX de retorno).

`region: sa-east-1` é São Paulo: remetente e destinatário são brasileiros, e a região do Resend define onde a mensagem é processada.

- [ ] **Passo 3: Publicar os registros na zona da Cloudflare**

Um `POST` por registro devolvido no passo anterior. O script lê o JSON salvo e não reescreve nada à mão:

```bash
ZONA=$(npx wrangler zones list --json 2>/dev/null | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const z=JSON.parse(d).find(z=>z.name==='alupar.com.br');console.log(z.id)})")
node -e "
const d = require(process.env.TMPDIR + '/resend-dominio.json');
for (const r of d.records) {
  const corpo = { type: r.type, name: r.name, content: r.value, ttl: 1, proxied: false };
  if (r.type === 'MX') corpo.priority = r.priority;
  console.log(JSON.stringify(corpo));
}
" > "$TMPDIR/registros.jsonl"
while read -r linha; do
  curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$ZONA/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H 'Content-Type: application/json' -d "$linha" \
    | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.success?'ok   '+j.result.name:'FALHA '+JSON.stringify(j.errors))})"
done < "$TMPDIR/registros.jsonl"
```

Expected: uma linha `ok` por registro.

- [ ] **Passo 4: Pedir a verificação e conferir**

```bash
ID=$(node -e "console.log(require(process.env.TMPDIR+'/resend-dominio.json').id)")
curl -sS -X POST "https://api.resend.com/domains/$ID/verify" -H "Authorization: Bearer $RESEND_API_KEY"
curl -sS "https://api.resend.com/domains/$ID" -H "Authorization: Bearer $RESEND_API_KEY" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.name,j.status);console.table(j.records.map(({record,status})=>({record,status})))})"
```

Expected: `status: "verified"`, com todos os registros em `verified`. A propagação pode levar alguns minutos; repita a consulta antes de concluir que falhou. Se um registro ficar em `failed`, compare o valor publicado na zona com o que o Resend espera — quase sempre é aspa a mais, ou o sufixo do domínio duplicado no `name`.

- [ ] **Passo 5: Provar o envio real, para um endereço de simulação**

Não use endereço de terceiro nem endereço inventado. `delivered@resend.dev` é o simulador do próprio Resend.

```bash
curl -sS -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" -H 'Content-Type: application/json' \
  -d '{"from":"Alupar <contato@msg.alupar.com.br>","to":["delivered@resend.dev"],"subject":"Verificacao do remetente","text":"Envio de verificacao do dominio msg.alupar.com.br."}'
```

Expected: um objeto com `id`. Um 403 significa que o domínio não está verificado — volte ao passo 4.

- [ ] **Passo 6: Gravar o remetente nos segredos de produção**

```bash
printf 'Alupar <contato@msg.alupar.com.br>' | npx wrangler pages secret put CONTATO_REMETENTE --project-name sitealupar
npx wrangler pages secret list --project-name sitealupar
```

Expected: `CONTATO_REMETENTE` continua na lista, ao lado dos outros quatro. O comando substitui o valor anterior sem apagar os demais segredos.

- [ ] **Passo 7: Registrar e commitar**

Em `docs/plano-virada.md`, na Tarefa 10, acrescente uma linha datada dizendo que o remetente passou a ser `contato@msg.alupar.com.br`, em domínio verificado na região de São Paulo, e que `envio.alupar.com.br` foi descartado por já apontar para a Locaweb.

```bash
git checkout -b chore/remetente-verificado
git add docs/plano-virada.md
git commit -m "chore: remetente do formulario em dominio verificado (msg.alupar.com.br)"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
```

---

### Task 2: Formulário — destino e texto de consentimento

**Files:**
- Modify: `src/i18n/textos.ts` (as três chaves `consentimento`, hoje marcadas `// provisório — P5`, nas linhas 164, 237 e 304)
- Segredo: `CONTATO_DESTINO`, no ambiente de produção do Pages
- Test: conferência sobre o build, no passo 3 — não há arquivo de teste novo

**Interfaces:**
- Consome: o remetente verificado da Task 1.
- Produz: a etiqueta do consentimento com a redação do site atual nos três idiomas. Nenhuma outra tarefa depende disto.

O rótulo em `src/components/Contato.astro:46` já monta a frase como `{f.consentimento} <a>{t.rodape.privacidade}</a>. *`, e o link já aponta para `/politica-de-privacidade/` no idioma certo — as três páginas existem no build. **Só as três frases mudam**; o componente, o link e a caixa de marcação obrigatória ficam como estão.

Redação de origem, medida em `acervo/conteudo-pronto.jsonl`:

| Idioma | Origem | O que passa a valer |
|---|---|---|
| pt | `Li e aceito a <a>Política de Privacidade</a>.` | `Li e aceito a` |
| en | `I read and agree with the <a>Privacy Policy.</a>` | `I read and agree with the` |
| es | `I read and agree with the <a>Privacy Policy.</a>` — **em inglês na origem** | `Leí y acepto la` |

O espanhol é o único ponto em que este plano se afasta do "exatamente como está no site hoje". A página `/contato/?lang=es` da origem nunca traduziu a frase: serve inglês a quem escolheu espanhol. Copiar isso seria reproduzir um defeito, e a resposta 3 da Alupar pede justamente uma leitura dos três idiomas pela Comunicação. Então vai em espanhol, e a divergência entra na pauta de validação na Task 5. Se a Comunicação preferir o inglês, é uma linha para reverter.

- [ ] **Passo 1: Trocar as três frases**

Em `src/i18n/textos.ts`, linha 164 (pt):

```ts
      consentimento: 'Li e aceito a',
```

Linha 237 (en):

```ts
      consentimento: 'I read and agree with the',
```

Linha 304 (es):

```ts
      consentimento: 'Leí y acepto la',
```

Os comentários `// provisório — P5` saem junto: a pendência P5 deixou de existir.

- [ ] **Passo 2: Construir**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Passo 3: Conferir a frase montada nas três páginas de contato**

```bash
for p in contato en/contato es/contato; do
  printf '%-12s ' "$p"
  grep -o '<label for="consentimento"[^>]*>[^<]*<a[^>]*>[^<]*</a>[^<]*' "dist/$p/index.html" \
    | sed -E 's/<[^>]*>//g' | tr -s ' '
done
```

Expected, exatamente:

```
contato      Li e aceito a Política de Privacidade. *
en/contato   I read and agree with the Privacy Policy. *
es/contato   Leí y acepto la Política de privacidad. *
```

Se alguma linha vier vazia, o seletor mudou — leia o HTML gerado antes de ajustar o comando.

- [ ] **Passo 4: Conferir que o link do consentimento resolve nos três idiomas**

Run: `node scripts/verificar-links.mjs`
Expected: aprovado, sem link interno quebrado.

- [ ] **Passo 5: Gravar o destino**

```bash
printf 'comunicacao@alupar.com.br' | npx wrangler pages secret put CONTATO_DESTINO --project-name sitealupar
```

Expected: o segredo é substituído; `npx wrangler pages secret list --project-name sitealupar` segue mostrando os cinco.

- [ ] **Passo 6: Provar o caminho inteiro, em produção**

O endereço de saúde é somente leitura e responde 404 sem o token. O sentinela já o chama todo dia; aqui é para confirmar na hora.

```bash
read -rs SAUDE_TOKEN && export SAUDE_TOKEN
curl -sS -o resposta.json -w '%{http_code}\n' "https://sitealupar.pages.dev/api/saude?t=$SAUDE_TOKEN"
cat resposta.json
```

Expected: `200`, e corpo `ok`. Um `503` traz as razões no corpo — a mais provável é o domínio do remetente ainda não estar verificado, o que significa voltar à Task 1.

- [ ] **Passo 7: Commitar**

```bash
git checkout -b feat/consentimento-do-formulario
git add src/i18n/textos.ts
git commit -m "feat: texto de consentimento do formulario nos tres idiomas, como o site atual"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
```

---

### Task 3: O destino de 301 de notícia deixa de apontar para uma página que vai sumir

Tarefa pequena e puramente local: muda uma regra e o teste dela, sem build e sem rede. Vem antes da remoção porque, depois dela, `scripts/lib/continuidade.mjs` estaria mandando endereços para uma listagem que não existe mais.

**Files:**
- Modify: `scripts/lib/continuidade.mjs`
- Test: `scripts/lib/continuidade.test.mjs`

**Interfaces:**
- Consome: nada.
- Produz: `destino(caminho, tipo, resolve)` continua com a mesma assinatura e passa a devolver `LISTAGEM_DO_RI` — a constante `'https://ri.alupar.com.br/noticias/'`, exportada do mesmo módulo — quando `tipo === 'noticia'`, sem consultar `resolve`. As tarefas 4 e 6 dependem dessa constante estar exportada.

- [ ] **Passo 1: Escrever o teste que falha**

Em `scripts/lib/continuidade.test.mjs`, substitua o teste da regra 1 (hoje na linha 18, esperando `/en/noticias/`) por:

```js
test('notícia vai para a listagem do portal de RI, não para uma página nossa', () => {
  const resolve = () => {
    throw new Error('não deve consultar o build para uma notícia');
  };
  assert.equal(destino('/noticia/ata-da-assembleia/', 'noticia', resolve), LISTAGEM_DO_RI);
  assert.equal(destino('/en/noticia/2q22-earnings-release/', 'noticia', resolve), LISTAGEM_DO_RI);
  assert.equal(destino('/es/noticia/3q17-earnings-release/', 'noticia', resolve), LISTAGEM_DO_RI);
});

test('a listagem do RI é absoluta: o destino sai do nosso domínio', () => {
  assert.match(LISTAGEM_DO_RI, /^https:\/\/ri\.alupar\.com\.br\//);
});
```

Mais duas edições no mesmo arquivo: a linha 3 passa a ser `import { destino, LISTAGEM_DO_RI } from './continuidade.mjs';`, e o conjunto `existe` da linha 5 perde as duas entradas que só o teste substituído usava:

```js
const existe = new Set(['/', '/en/', '/a-companhia/', '/videos/']);
```

Os outros cinco testes do arquivo não tocam em notícia e devem continuar passando sem alteração.

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test scripts/lib/continuidade.test.mjs`
Expected: FALHA com `SyntaxError` ou `LISTAGEM_DO_RI is not defined` — a constante ainda não existe.

- [ ] **Passo 3: Implementar**

Em `scripts/lib/continuidade.mjs`, acrescente a constante antes da função:

```js
/**
 * Notícia não vira mais página: a Alupar desativou a área em 16/09/2026
 * ("as notícias estão antigas… desativar mesmo") e o feed já era para vir do
 * RI desde a D5. O destino é absoluto e fica num domínio que não é nosso —
 * por isso ele é conferido todo dia pelo sentinela.
 */
export const LISTAGEM_DO_RI = 'https://ri.alupar.com.br/noticias/';
```

E troque a primeira regra de `destino()`:

```js
export function destino(caminho, tipo, resolve) {
  /* Regra 1: notícia sai do site e vai para o portal de RI. Sem passar por
     `resolve`: o destino é externo e não é servido pelo nosso build. */
  if (tipo === 'noticia') return LISTAGEM_DO_RI;

  const pre = /^\/(en|es)(?=\/)/.exec(caminho)?.[0] ?? '';
  const resto = caminho.slice(pre.length);
  const candidatos = [];
  if (/^\/videos?\//.test(resto)) candidatos.push(`${pre}/videos/`);
  const segs = resto.split('/').filter(Boolean);
  for (let n = segs.length - 1; n > 0; n--) candidatos.push(`${pre}/${segs.slice(0, n).join('/')}/`);
  candidatos.push(`${pre}/`);

  const achado = candidatos.find((c) => c !== caminho && resolve(c));
  if (!achado) throw new Error(`sem destino para ${caminho}`);
  return achado;
}
```

Atualize também o comentário de cabeçalho do arquivo, cuja lista de três regras passa a ser:

```
 *   1. notícia → listagem do portal de RI (externa; a área saiu do ar)
 *   2. qualquer coisa sob /video/ ou /videos/ → listagem de vídeos do idioma
 *   3. o resto (anexo, casca vazia) → o ancestral mais próximo que resolve;
 *      sem nenhum, a home do idioma — que sempre existe
```

- [ ] **Passo 4: Rodar e ver passar**

Run: `node --test scripts/lib/continuidade.test.mjs`
Expected: todos os testes passam.

- [ ] **Passo 5: Rodar a bateria inteira**

Run: `npm test`
Expected: todos passam. Se algum teste de outro arquivo reclamar de `/noticias/`, ele pertence à Task 4 — anote e siga.

- [ ] **Passo 6: Commitar**

```bash
git checkout -b feat/desativar-noticias
git add scripts/lib/continuidade.mjs scripts/lib/continuidade.test.mjs
git commit -m "feat: 301 de noticia aponta para a listagem do portal de RI"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
```

---

### Task 4: Retirar a área de notícias do ar

Tarefa grande porque é atômica: não existe meio-caminho em que o CI fique verde. Ou as 210 páginas somem junto com as listagens, o bloco da home, o código que as alimentava e as URLs do Lighthouse, ou o build reprova.

O mecanismo que faz o trabalho pesado já existe e não precisa de alteração: `scripts/gerar-mapa-de-rotas.mjs` descarta com o motivo `coberto-por-301` **todo** item do acervo que casa com uma regra do `public/_redirects`. Seis regras com curinga bastam.

**Files:**
- Modify: `public/_redirects` (bloco dinâmico final)
- Modify: `src/components/Home.astro` (caixa de notícias, importes, `formato`, grade de três para duas colunas)
- Modify: `src/lib/acervo.ts` (`noticiasDe`, `POR_PAGINA`, `paginasDoArquivo`, três entradas de `SUBSTITUIDAS`)
- Modify: `src/layouts/Base.astro:7,58` (o `hreflang` deixa de considerar as páginas do arquivo)
- Modify: `src/lib/rotas-proprias.mjs` (comentário que cita a exceção que deixou de existir)
- Modify: `src/i18n/textos.ts` (cinco chaves órfãs, nos três idiomas e na interface)
- Modify: `lighthouserc.json:16-20` (quatro URLs que deixam de existir)
- Modify: `scripts/lib/capturas.mjs:15-16` (dois alvos de conferência visual)
- Delete: `src/pages/noticias/index.astro`, `src/pages/noticias/arquivo/[...page].astro`
- Delete: `src/pages/en/noticias/index.astro`, `src/pages/en/noticias/arquivo/[...page].astro`
- Delete: `src/pages/es/noticias/index.astro`, `src/pages/es/noticias/arquivo/[...page].astro`
- Delete: `src/components/ListaNoticias.astro`, `src/lib/noticias.ts`, `src/lib/noticias.test.ts`
- Regenerate: `acervo/mapa-de-rotas.json`

**Interfaces:**
- Consome: `LISTAGEM_DO_RI` da Task 3.
- Produz: nenhuma exportação nova. Deixam de existir, para todo o resto do código: `noticiasDe`, `POR_PAGINA` e `paginasDoArquivo`, de `src/lib/acervo.ts`; `recentes`, de `src/lib/noticias.ts`; e as chaves `noticias`, `verMaisNoticias`, `arquivo`, `anterior` e `proxima`, de `src/i18n/textos.ts`. Atenção: `rotativo.anterior` e `rotativo.proxima`, do carrossel, são chaves **aninhadas e diferentes** — ficam.

- [ ] **Passo 1: Medir o ponto de partida**

```bash
npm run build
echo "paginas de noticia: $(( $(ls dist/noticia | wc -l) + $(ls dist/en/noticia | wc -l) + $(ls dist/es/noticia | wc -l) ))"
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const { limitesDoPages } = await import('./scripts/lib/redirects.mjs');
console.log(limitesDoPages(readFileSync('public/_redirects','utf8')));
"
```

Expected: 210 páginas; `{ estaticas: 405, dinamicas: 2, estouro: false }`. Guarde os números — o passo 11 os compara.

- [ ] **Passo 2: Escrever as seis regras com curinga**

No fim de `public/_redirects`, **dentro** do bloco dinâmico que já existe (o que começa com `# ─── dinâmicas: sempre por último`), depois da regra do `/wp-content/uploads/*`:

```
# Área de notícias desativada a pedido da Alupar em 16/09/2026: "as notícias
# estão antigas… desativar mesmo". O feed sempre foi para vir do RI (D5), e é
# para lá que vão os 186 endereços vivos — 210 páginas e as seis listagens.
# Curinga, e não uma regra por endereço: é o que faz o gerador de mapa
# descartá-las em bloco (`coberto-por-301`), e cabe em 6 das 100 dinâmicas.
/noticia/*                                         https://ri.alupar.com.br/noticias/   301
/en/noticia/*                                      https://ri.alupar.com.br/noticias/   301
/es/noticia/*                                      https://ri.alupar.com.br/noticias/   301
/noticias/*                                        https://ri.alupar.com.br/noticias/   301
/en/noticias/*                                     https://ri.alupar.com.br/noticias/   301
/es/noticias/*                                     https://ri.alupar.com.br/noticias/   301
```

Os três idiomas vão para o mesmo endereço de propósito: o portal de RI serve `lang="pt-br"` seja qual for o `?linguagem=`, então mandar `/en/noticia/…` para `?linguagem=en` prometeria uma tradução que não existe. O portal é de outra equipe, e nada neste projeto incide sobre ele.

`/noticia/*` e `/noticias/*` não se sobrepõem: o casamento é por prefixo de segmento, e `/noticias` não começa com `/noticia/`.

- [ ] **Passo 3: Apagar as páginas e o componente**

```bash
git rm -r src/pages/noticias src/pages/en/noticias src/pages/es/noticias
git rm src/components/ListaNoticias.astro src/lib/noticias.ts src/lib/noticias.test.ts
```

- [ ] **Passo 4: Tirar a caixa de notícias da home**

Em `src/components/Home.astro`, remova a `<section class="caixa" aria-labelledby="h-noticias">` inteira (linhas 114–125, do `<section>` ao `</section>` que fecha depois do link `.mais`).

Remova também, do bloco de script, as três linhas que só ela usava:

```ts
import { noticiasDe } from '../lib/acervo';
const formato = new Intl.DateTimeFormat(lang[idioma], { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const noticias = noticiasDe(CODIGO[idioma]).slice(0, 6);
```

Com elas saem `lang` e `CODIGO` do `import` de `../i18n/textos`, que passa a ser:

```ts
import { textos, prefixo, type Idioma } from '../i18n/textos';
```

No `<style>`, apague as cinco regras de `.noticias` (linhas 226–230). E a grade das caixas passa de três colunas para duas:

```css
  @media (min-width: 768px) { .caixas { grid-template-columns: repeat(2, 1fr); } }
```

Ajuste o comentário de cabeçalho do arquivo: "as três caixas — notícias, vídeo, sustentabilidade" passa a "as duas caixas — vídeo e sustentabilidade", com a razão:

```
 * Eram três caixas até 16/09/2026; a de notícias saiu com a área (D16). Duas
 * colunas, e não três com um buraco: é a única mudança de composição que a
 * decisão da cliente autoriza (D2).
```

- [ ] **Passo 5: Tirar o código que alimentava as notícias**

Em `src/lib/acervo.ts`, apague `noticiasDe` (linhas 323–328), `POR_PAGINA` (330–331) e `paginasDoArquivo` (333–342, com o comentário). Em `SUBSTITUIDAS`, apague a linha das três listagens, deixando:

```ts
export const SUBSTITUIDAS = new Set([
  '/contato/', '/en/contato/', '/es/contato/',
]);
```

Em `src/layouts/Base.astro`, apague o `import { paginasDoArquivo } from '../lib/acervo';` (linha 7) e a linha 58 do conjunto `existe`:

```ts
  ...IDIOMAS.flatMap((i) => paginasDoArquivo(CODIGO[i])),
```

Confira se `CODIGO` ainda é usado em `Base.astro` antes de mexer no `import` da linha 4; `IDIOMAS` continua em uso, logo abaixo, no `alternativas`.

Em `src/lib/rotas-proprias.mjs`, o comentário cita as páginas do arquivo de notícias como exceção deliberada da lista. Atualize-o: essa exceção deixou de existir, e só a 404 continua de fora.

- [ ] **Passo 6: Tirar as cinco chaves órfãs dos textos**

Em `src/i18n/textos.ts`, apague da interface os campos `noticias` (linha 48), `verMaisNoticias` (79), `arquivo` (83), `anterior` (84) e `proxima` (85); e os cinco valores correspondentes nos três blocos de idioma. **Não toque** em `rotativo: { anterior, proxima, pausar, retomar }` (linha 76): é o carrossel.

- [ ] **Passo 7: Trocar as URLs do Lighthouse**

Em `lighthouserc.json`, as quatro URLs de notícia (linhas 16–20) deixam de existir. O conjunto perde duas famílias de página — uma listagem paginada e uma página de corpo longo em dois idiomas — e as duas precisam de substituta, ou a cobertura encolhe em silêncio. A listagem de vídeos tem o mesmo feitio da de notícias, e `sustentabilidade` tem corpo comparável (1.315 palavras em português, 1.317 em inglês) ao das páginas de notícia que saem:

```json
        "http://localhost/videos/index.html",
        "http://localhost/en/videos/index.html",

        "http://localhost/sustentabilidade/index.html",
        "http://localhost/en/group/sustainability/index.html",
```

As quatro foram conferidas contra o build de 16/09/2026 e existem. Confirme mesmo assim antes de commitar, porque o mapa de rotas foi regerado no passo 9:

```bash
for p in videos en/videos sustentabilidade en/group/sustainability; do
  printf '%-22s ' "$p"; test -f "dist/$p/index.html" && echo ok || echo AUSENTE
done
```

Se alguma vier `AUSENTE`, escolha outra do mesmo feitio — o que importa é manter doze URLs cobrindo home, listagem, conteúdo longo, FAQ, vídeo e contato nos idiomas.

- [ ] **Passo 8: Tirar os alvos de conferência visual que sumiram**

Em `scripts/lib/capturas.mjs`, apague as duas linhas de `PAGINAS`:

```js
  ['noticias', '/noticias/', '/noticias/'],
  ['noticia', '/noticia/ata-da-assembleia-geral-ordinaria-e-extraordinaria/', '/noticia/ata-da-assembleia-geral-ordinaria-e-extraordinaria/'],
```

Acrescente ao comentário que abre a lista: os dois modelos saíram com a área de notícias, em 16/09/2026.

- [ ] **Passo 9: Regerar o mapa de rotas e conferir o descarte**

```bash
node scripts/gerar-mapa-de-rotas.mjs
node -e "
const m = require('./acervo/mapa-de-rotas.json');
console.log('total de rotas:', m.total);
console.log('por tipo:', JSON.stringify(m.porTipo));
console.log('descartes por motivo:', JSON.stringify(m.descartados.reduce((a,d)=>({...a,[d.motivo]:(a[d.motivo]??0)+1}),{})));
console.log('sobrou alguma noticia?', m.rotas.filter(r => r.tipo === 'noticia').length);
"
```

Expected: `porTipo` sem a chave `noticia`; `coberto-por-301` cresce em cerca de 227; a última linha imprime `0`. Se sobrar alguma, uma regra do passo 2 está com o caminho errado.

- [ ] **Passo 10: Construir e conferir que as páginas sumiram**

```bash
npm run build
for d in dist/noticia dist/en/noticia dist/es/noticia dist/noticias dist/en/noticias dist/es/noticias; do
  printf '%-22s ' "$d"; test -e "$d" && echo "AINDA EXISTE" || echo removido
done
```

Expected: seis vezes `removido`.

- [ ] **Passo 11: Regerar a continuidade e conferir os limites**

```bash
node scripts/fechar-continuidade.mjs
node scripts/fechar-continuidade.mjs --verificar
```

Expected: o bloco de continuidade **encolhe** — os endereços de notícia que antes tinham linha estática própria passam a ser cobertos pelo curinga. O `--verificar` aprova, e as dinâmicas ficam em 8, longe das 100.

Se `--verificar` reprovar dizendo que endereços deixariam de responder, leia quais: é a prova de que uma regra do passo 2 não cobre o que devia. **Não** relaxe a verificação (regra 5).

- [ ] **Passo 12: Rodar os portões do CI, na ordem em que ele roda**

```bash
npm test
npm run check
node scripts/gerar-mapa-de-rotas.mjs --verificar
npm run build
node scripts/fechar-continuidade.mjs --verificar
node scripts/verificar-csp.mjs
node scripts/verificar-links.mjs
```

Expected: todos aprovam. A contagem de testes sai de 114 para 112: os três de `src/lib/noticias.test.ts` saem, e a Task 3 trocou um teste por dois. Confira o número; uma queda maior significa que um arquivo de teste foi apagado sem querer.

- [ ] **Passo 13: Provar os 301 no preview, contra o Pages de verdade**

O casamento de curinga do Pages não é o mesmo do nosso `regraPara`, e a única prova é a máquina dele. Abra o PR, espere o `publicar-preview` e cheque seis endereços no domínio do preview:

```bash
PREVIEW=https://feat-desativar-noticias.sitealupar.pages.dev
for p in /noticia/ata-da-assembleia-geral-ordinaria-e-extraordinaria/ /en/noticia/2q22-earnings-release/ /noticias/ /noticias/arquivo/3/ /en/noticias/ /es/noticias/; do
  printf '%-62s ' "$p"
  curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}\n' --max-time 25 "$PREVIEW$p"
done
```

Expected: `301 -> https://ri.alupar.com.br/noticias/` nas seis linhas. Um `200` significa que o Pages serviu um arquivo que devia ter sumido; um `404`, que a regra não casou — e 404 é violação da regra 3.

- [ ] **Passo 14: Commitar**

```bash
git add -A
git commit -m "feat: desativa a area de noticias e redireciona ao portal de RI"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
```

---

### Task 5: Registrar as nove decisões

Sem isto, daqui a seis meses ninguém sabe por que a área de notícias sumiu, nem quem autorizou. A regra do `docs/decisoes.md` é essa: a pergunta não vai ser o que se decidiu, e sim por quê.

**Files:**
- Modify: `docs/decisoes.md` (duas decisões novas; duas existentes ganham nota de fechamento; pendências operacionais)
- Modify: `docs/plano-virada.md` (tabela de pendências P1–P9; precondições da Tarefa 12)
- Modify: `docs/revisao-de-conteudo.md` (o link de validação e a divergência do espanhol)

**Interfaces:**
- Consome: as decisões implementadas nas tarefas 2 e 4.
- Produz: nada que o código leia.

- [ ] **Passo 1: Duas decisões novas em `docs/decisoes.md`**

Na tabela, depois de D15:

```markdown
| D16 | Área de notícias | **Desativada; 301 para o portal de RI** | A Alupar decidiu em 16/09/2026: "as notícias estão antigas… desativar mesmo". Fecha a D5 pelo caminho mais simples — em vez de importar um feed, o site deixa de ter a área e manda os 186 endereços vivos para quem já os mantém. Nenhum 404 (regra 3) |
| D17 | Dono do conteúdo, com nome | **Fabiana Carneiro Pinho** | A D6 nomeou a área; faltava a pessoa. Foi a ausência de dono que deixou o site parar em 2023, e área não assina nada — pessoa assina |
```

Na linha da D9 ("Corte das notícias — 24 meses na listagem"), acrescente ao fim da coluna *Por quê*: `Superada pela D16 em 16/09/2026: não há mais listagem`. Na D6, acrescente: `Pessoa nomeada na D17`.

Em **Pendências operacionais**, no fim do arquivo:

```markdown
- Dois valores da faixa institucional (km de linhas, MW instalados) — Alupar, até o M2.
- ~~Acesso ao feed de notícias do RI~~ — sem objeto desde a D16.
- Prazo de guarda dos dados do formulário — a frente de LGPD está sendo redefinida com Bárbara, da ness. A Alupar respondeu as outras duas partes da P5 em 16/09/2026 e deixou esta em aberto.
- Divulgações de resultados apontando ao portal de RI — a Comunicação pediu ao RI em 16/09/2026 e compartilhará quando houver.
```

- [ ] **Passo 2: Fechar as pendências na tabela do `docs/plano-virada.md`**

Cinco das nove linhas P1–P9 foram respondidas. Troque o conteúdo da coluna *Padrão* pelo que foi decidido, prefixado por **Respondido em 16/09/2026:**

| # | O que escrever |
|---|---|
| P2 | `Respondido em 16/09/2026: a área de notícias sai inteira (D16). A listagem de 24 meses deixou de existir` |
| P3 | `Respondido em 16/09/2026: "Desativar nesta primeira versão" — confirma o padrão; a busca volta na manutenção se houver demanda` |
| P5 | `Respondido em 16/09/2026: destino comunicacao@alupar.com.br e o texto de consentimento do site atual. Prazo de guarda segue em aberto, com a frente de LGPD da ness.` |
| P7 | `Respondido em 16/09/2026: "Careers" e "Trabaje con nosotros" — confirma o padrão já no ar` |
| P9 | `Respondido em 16/09/2026: não existe histórico de GA4 — "até a minha chegada isso não existia". A medição começa agora, pelo Cloudflare Web Analytics, sem cookie e sem banner` |

P1, P4, P6 e P8 ficam como estão.

- [ ] **Passo 3: Tirar a linha de base do GA4 das precondições da Tarefa 12**

Na Tarefa 12 (`### Tarefa 12: a virada`), a comparação de acessos antes e depois da virada não tem como acontecer: não há histórico com que comparar. Substitua essa precondição por:

```markdown
- ~~Linha de base de acessos do GA4, para comparar antes e depois~~ — **cai em 16/09/2026**: a Alupar confirmou que não existe histórico ("até a minha chegada isso não existia"). Não há linha de base a levantar, e esperar por uma seguraria a virada por um dado que ninguém tem. A medição do site novo começa na virada, pelo Cloudflare Web Analytics.
```

Na linha P6 da tabela de pendências, que remete à Tarefa 12, acrescente que a resposta 7 da Alupar — as divulgações de resultados — chega depois e não bloqueia a virada.

- [ ] **Passo 4: Registrar o link de validação e a divergência do espanhol**

Em `docs/revisao-de-conteudo.md`, acrescente uma seção:

```markdown
## Validação pela Comunicação (resposta 3, 16/09/2026)

A Alupar pediu "link para validação pela equipe de comunicação". O endereço é
`https://sitealupar.pages.dev` — o mesmo que o CI publica a cada merge na
`main`, nos três idiomas.

Dois avisos para quem abrir o link:

- **O formulário de contato não envia no preview.** Os segredos de envio estão
  só no ambiente de produção do Pages; o de preview tem apenas o token de
  saúde. Quem quiser testar o envio faz isso em produção.
- **Um ponto para a Comunicação decidir, no espanhol.** A página de contato da
  origem serve a frase de consentimento **em inglês** para quem escolhe
  espanhol. A Alupar pediu "exatamente como está no site hoje"; o site novo
  traz "Leí y acepto la Política de privacidad", em espanhol, por entender que
  copiar a frase em inglês seria reproduzir um defeito. Se a Comunicação
  preferir a redação literal da origem, é uma linha em `src/i18n/textos.ts`.
```

- [ ] **Passo 5: Conferir que nenhum documento ainda descreve o que sumiu**

```bash
grep -rn "noticias/arquivo\|listagem de notícias\|feed do RI" docs/ --include=*.md | grep -v superpowers/plans
```

Expected: só ocorrências já marcadas como superadas. Qualquer documento que ainda descreva a listagem como existente precisa da mesma anotação.

- [ ] **Passo 6: Commitar**

```bash
git add docs/decisoes.md docs/plano-virada.md docs/revisao-de-conteudo.md
git commit -m "docs: registra as nove definicoes da Alupar de 16/09/2026"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
```

---

### Task 6: O sentinela passa a vigiar o destino dos 301

186 endereços nossos agora terminam num domínio que não é nosso, mantido por outra equipe. Se `https://ri.alupar.com.br/noticias/` mudar de caminho ou sair do ar, 186 endereços do acervo viram 404 em cadeia e ninguém fica sabendo — exatamente o silêncio que originou este projeto.

**Files:**
- Modify: `scripts/lib/sentinela.mjs`
- Modify: `scripts/lib/sentinela.test.mjs`
- Modify: `scripts/verificar-hosts.mjs`

**Interfaces:**
- Consome: `LISTAGEM_DO_RI` da Task 3, para que o endereço vigiado e o endereço de destino não possam divergir.
- Produz: `avaliar()` aceita um campo opcional `caminho` (padrão `'/'`), que entra na mensagem. A assinatura e o valor de retorno não mudam para quem já a chama.

- [ ] **Passo 1: Escrever o teste que falha**

Em `scripts/lib/sentinela.test.mjs`:

```js
test('o caminho aparece na mensagem, para o host que é vigiado numa página', () => {
  const r = avaliar({
    host: 'ri.alupar.com.br',
    caminho: '/noticias/',
    codigo: '200',
    saidaCurl: 0,
    fim: 'Dec 31 23:59:59 2026 GMT',
    agora: new Date('2026-09-16T12:00:00Z'),
  });
  assert.equal(r.ok, true);
  assert.match(r.mensagem, /ri\.alupar\.com\.br\/noticias\//);
});

test('sem caminho, a mensagem continua a do host — nada muda para quem já chamava', () => {
  const r = avaliar({
    host: 'alupar.com.br',
    codigo: '200',
    saidaCurl: 0,
    fim: 'Dec 31 23:59:59 2026 GMT',
    agora: new Date('2026-09-16T12:00:00Z'),
  });
  assert.match(r.mensagem, /ok {2}alupar\.com\.br → HTTP 200/);
});

test('a página do RI fora do ar reprova o dia', () => {
  const r = avaliar({
    host: 'ri.alupar.com.br',
    caminho: '/noticias/',
    codigo: '404',
    saidaCurl: 0,
    fim: 'Dec 31 23:59:59 2026 GMT',
    agora: new Date('2026-09-16T12:00:00Z'),
  });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'sem-resposta');
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `node --test scripts/lib/sentinela.test.mjs`
Expected: FALHA no primeiro teste — a mensagem traz só `ri.alupar.com.br`, sem o caminho.

- [ ] **Passo 3: Implementar**

Em `scripts/lib/sentinela.mjs`, acrescente o parâmetro e use-o só na mensagem. A assinatura passa a ser:

```js
export function avaliar({ host, caminho = '/', codigo, saidaCurl, fim, agora = new Date(), virada = false }) {
```

E a linha da mensagem, no fim da função:

```js
  /* O caminho entra no relato porque há host cuja saúde se mede numa página,
     não na raiz: o destino dos 301 de notícia (D16) é /noticias/ do portal de
     RI, e a raiz dele pode estar de pé com aquela página fora do ar. */
  const alvo = caminho === '/' ? host : `${host}${caminho}`;
  const mensagem = `${ok ? 'ok  ' : 'FALHA'} ${alvo} → HTTP ${codigo} · ${estado} · ${prazo}${nota}`;
```

Acrescente a linha do `@param` no bloco de documentação, junto dos demais:

```js
 * @param {string} [e.caminho]   caminho a pedir; '/' por padrão
```

- [ ] **Passo 4: Rodar e ver passar**

Run: `node --test scripts/lib/sentinela.test.mjs`
Expected: todos passam, inclusive os onze que já existiam.

- [ ] **Passo 5: Acrescentar o host à lista do verificador**

Em `scripts/verificar-hosts.mjs`, a lista passa a levar caminho. Substitua os importes e a constante:

```js
import { avaliar } from './lib/sentinela.mjs';
import { LISTAGEM_DO_RI } from './lib/continuidade.mjs';

/* [host, caminho]. O caminho importa em um caso: o portal de RI é o destino
   dos 301 de notícia (D16) e é mantido por outra equipe — a raiz dele pode
   responder com /noticias/ fora do ar, e aí 186 endereços nossos viram 404.
   O endereço vem de continuidade.mjs para que vigiar e redirecionar não
   possam divergir. */
const DESTINO_DAS_NOTICIAS = new URL(LISTAGEM_DO_RI);
const HOSTS = [
  ['alupar.com.br', '/'],
  ['www.alupar.com.br', '/'],
  ['alupar.us6.quickconnect.to', '/'], // galeria de fotos no NAS (D4)
  [DESTINO_DAS_NOTICIAS.host, DESTINO_DAS_NOTICIAS.pathname],
];
```

`pedir` recebe o caminho:

```js
function pedir(host, caminho) {
  const r = spawnSync(
    'curl',
    // devNull, e não '/dev/null': quem roda isto à mão está no Windows.
    ['-sS', '-o', devNull, '-w', '%{http_code}', '--max-time', String(ESPERA), `https://${host}${caminho}`],
    { encoding: 'utf8' },
  );
  return { codigo: r.status === 0 ? r.stdout.trim() : 'erro', saidaCurl: r.status ?? 1 };
}
```

E o laço:

```js
for (const [host, caminho] of HOSTS) {
  const { codigo, saidaCurl } = pedir(host, caminho);
  const r = avaliar({ host, caminho, codigo, saidaCurl, fim: vencimento(host), virada });
  console.log(r.mensagem);
  if (!r.ok) falhou = true;
}
```

Atualize o comentário de cabeçalho do arquivo, que hoje diz "cada host responde": passa a "cada host responde no caminho que importa".

- [ ] **Passo 6: Rodar contra a rede de verdade**

Run: `node scripts/verificar-hosts.mjs`
Expected: quatro linhas. A quarta é `ok   ri.alupar.com.br/noticias/ → HTTP 200 · ok · certificado vence em N dias`. A do `www.alupar.com.br` segue com `cadeia-incompleta · conhecido, sai na virada` e não reprova — é o defeito conhecido da origem, que morre na virada.

Se a linha do RI vier `FALHA`, confirme no navegador antes de mexer no código: pode ser que o portal tenha mudado de caminho, e aí o destino dos 301 da Task 4 precisa mudar junto.

- [ ] **Passo 7: Rodar a bateria inteira**

Run: `npm test`
Expected: todos passam.

- [ ] **Passo 8: Commitar**

```bash
git add scripts/lib/sentinela.mjs scripts/lib/sentinela.test.mjs scripts/verificar-hosts.mjs
git commit -m "feat: sentinela vigia a pagina de noticias do portal de RI"
git log -1 --format=%B | grep -ciE 'co-authored|generated|claude'   # tem de devolver 0
```

---

## Depois das seis tarefas

Abra um PR por frente — `chore/remetente-verificado`, `feat/consentimento-do-formulario` e `feat/desativar-noticias` (que carrega as tarefas 3, 4, 5 e 6) — e confira o corpo de cada um contra a regra 6 antes de publicar.

Continua precisando de gente, e nenhuma destas tarefas resolve:

- A leitura dos três idiomas pela Comunicação, com a decisão sobre o espanhol do consentimento.
- A escolha das peças do rotativo pelo Marketing (PR #85).
- O prazo de guarda dos dados do formulário, com a frente de LGPD da ness.
- As divulgações de resultados que o RI vai compartilhar.
- A leitura com leitor de tela (Passo 13c da Tarefa 13) e a data da virada.

O prazo duro não mudou: o curinga `*.alupar.com.br` vence em **21/10/2026**.
