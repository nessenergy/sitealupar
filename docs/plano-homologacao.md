# Plano de homologação — conferência visual, P9 pronta e limpeza

**Objetivo:** chegar à aprovação do Marketing com o site novo conferido lado a
lado contra o atual, deixar a P9 pronta para entrar no dia em que for decidida
e limpar o que sobrou da implantação.

**Arquitetura:** a conferência usa o Chrome instalado, dirigido pelo protocolo
de depuração com o WebSocket nativo do Node — nenhuma dependência nova. As
capturas ficam fora do git; o que se versiona é o script, o relatório de
divergências e as correções. A P9 no padrão (Cloudflare Web Analytics) entra
como PR em rascunho, com o snippet ligado por variável do GitHub e a CSP
aberta no mesmo commit. A limpeza corre por último, do checkout principal.

**Stack:** Astro 5.18 estático · Node 24 (`node --test`, `WebSocket` nativo) ·
Chrome 152 headless (CDP) · Cloudflare Pages · GitHub Actions · `gh`.

**Base:** itens 4 a 6 da conversa de 11/09/2026; decisão P9 e Tarefa 12 em
[`plano-virada.md`](plano-virada.md).

## Restrições globais

Valem para toda tarefa. As sete primeiras vêm de [`AGENTS.md`](../AGENTS.md),
como em `plano-virada.md`:

- Linguagem visual imutável; composição muda só com problema medido (`restauro-fiel`)
- Nada neste repositório altera o comportamento de `ri.alupar.com.br`. HSTS sem `includeSubDomains` e sem `preload`
- Nenhuma URL do acervo responde 404; toda remoção vira 301 no mesmo commit
- Número não se inventa: dado ausente fica marcado como pendente
- Limites do CI (`lighthouserc.json`) nunca são afrouxados
- Nada de atribuição a ferramenta em commit, corpo de PR, comentário, documento ou nome de branch. Branches `feat/`, `fix/`, `docs/`, `chore/`. Conferir antes de publicar: `git log -1 --format=%B | grep -ciE 'co-authored|generated|session'` → `0`
- PR verde é PR mergeado — sempre com `gh pr merge --squash --subject … --body …` explícitos. **Exceção:** o PR da P9 (Tarefa 5) fica em rascunho até a decisão
- Recurso externo novo → CSP de `public/_headers` ajustada no mesmo commit
- Texto novo de interface depende de aprovação da Comunicação antes da virada
- `capturas/` nunca entra no git

## Ordem

Tarefa 1 antes da 2 (as capturas precisam do logotipo certo). A 5 é
independente. A 6 é a última, e roda do checkout principal, porque remove a
cópia de trabalho (a segunda linha de `git worktree list`).

```
CP="C:/Users/resper/OneDrive/Área de Trabalho/DESENVOLVIMENTO/site Alupar/sitealupar"   # checkout principal
WT=$(git -C "$CP" worktree list --porcelain | sed -n 's/^worktree //p' | sed -n 2p)      # cópia de trabalho
```

---

### Tarefa 1: o logotipo do PR #54 vai para um branch próprio

O PR #54 corrige um defeito real — o logotipo azul sobre o box azul do
cabeçalho, ilegível nas 400 páginas — e o CI dele passou. Mas o nome do
branch, os trailers do commit e o rodapé do corpo violam a regra de
atribuição. O conteúdo vem para um branch próprio, com mensagem limpa; o #54
fecha sem rastro de ferramenta.

**Files:**
- Create: `public/logo-alupar-negativo.svg` (trazido do #54, sem mudança)
- Modify: `src/components/Cabecalho.astro` (trazido do #54, sem mudança)

- [ ] **Passo 1:** branch novo a partir da main

```bash
cd "$WT" && git fetch origin && git switch -c fix/logotipo-negativo origin/main
RAMO=$(gh pr view 54 --json headRefName --jq .headRefName)   # o branch do #54
```

- [ ] **Passo 2:** trazer os dois arquivos do #54

```bash
git checkout "origin/$RAMO" -- public/logo-alupar-negativo.svg src/components/Cabecalho.astro
git diff --cached --stat
# esperado: 2 files changed, 20 insertions(+), 3 deletions(-)
```

- [ ] **Passo 3:** conferir

```bash
npm test                          # esperado: pass 52, fail 0
npm run build                     # esperado: 400 page(s) built
node scripts/verificar-csp.mjs    # esperado: aprovado
grep -c 'logo-alupar-negativo.svg' dist/index.html dist/en/index.html dist/contato/index.html
# esperado: 1 em cada
grep -o 'fill="#FFFFFF"' public/logo-alupar-negativo.svg | wc -l
# esperado: 6 (os seis traçados do lettering); o traço verde continua fill="#079541"
```

- [ ] **Passo 4:** commit com mensagem limpa

```bash
git commit -F - <<'EOF'
fix: logotipo em negativo sobre o box azul do cabeçalho

O box do cabeçalho (bg-logo.png e bg-logo-mobile.png) é azul #004F9D
sólido, e em cima dele estava a versão principal do logotipo, com o
lettering no mesmo azul: ilegível nas 400 páginas. O tema atual pareia o
box com img/logo-alupar.png, branco e verde sobre transparente.

public/logo-alupar-negativo.svg tem os mesmos traçados e o mesmo viewBox
da versão principal, com o lettering em branco e o traço verde igual. A
versão principal continua no JSON-LD.

No celular, background-size: contain deixava uma tira azul de 18 px sob o
logotipo de 36 px; cover preenche o box.
EOF
git log -1 --format=%B | grep -ciE 'co-authored|generated|session'
# esperado: 0
```

- [ ] **Passo 5:** PR, CI e merge

```bash
git push -u origin fix/logotipo-negativo
gh pr create --base main --head fix/logotipo-negativo \
  --title "fix: logotipo em negativo sobre o box azul do cabeçalho" \
  --body "O box do cabeçalho é azul #004F9D sólido e o logotipo servido era a versão principal, com o lettering no mesmo azul — ilegível nas 400 páginas. Passa a servir a versão em negativo (public/logo-alupar-negativo.svg: mesmos traçados, lettering branco), como o tema atual faz com img/logo-alupar.png. No celular, o box passa de contain para cover. Substitui o #54, com o mesmo conteúdo."
gh pr checks --watch
gh pr merge fix/logotipo-negativo --squash \
  --subject "fix: logotipo em negativo sobre o box azul do cabeçalho" \
  --body "Versão em negativo do logotipo sobre o box azul do tema; box do celular em cover. Substitui o #54."
```

- [ ] **Passo 6:** fechar o #54 sem rastro de ferramenta. Primeiro o branch
  dele passa a apontar para o commit limpo (a lista de commits do PR fechado
  mostra o último head), depois o corpo é trocado, o PR fecha e o branch sai

```bash
gh pr view 54 --comments --json comments --jq '.comments | length'
# esperado: 0 — se houver comentário com rodapé, editar com gh api antes de seguir
LIMPO=$(git rev-parse fix/logotipo-negativo)
git push --force-with-lease="$RAMO:2d88833" origin "$LIMPO:refs/heads/$RAMO"
gh pr edit 54 --body "Substituído pelo PR do branch fix/logotipo-negativo, com o mesmo conteúdo."
gh pr close 54
git push origin --delete "$RAMO"
gh pr view 54 --json body,commits --jq '.body, (.commits[].messageBody)' | grep -ciE 'co-authored|generated|session'
# esperado: 0
```

---

### Tarefa 2: capturas lado a lado, site atual × site novo

**Files:**
- Create: `scripts/lib/capturas.mjs` — páginas, larguras, pares e o HTML do relatório
- Create: `scripts/lib/capturas.test.mjs`
- Create: `scripts/capturar-telas.mjs` — dirige o Chrome e grava as capturas
- Modify: `.gitignore` — `capturas/`

**Interfaces:**
- Produz: `PAGINAS: [nome, caminhoAtual, caminhoNovo][]`, `LARGURAS: number[]`,
  `pares(paginas?, larguras?) → { nome, largura, antigo: { url, arquivo }, novo: { url, arquivo } }[]`,
  `relatorio(pares) → string` (HTML). Arquivos: `capturas/<nome>-<largura>-{antigo,novo}.png` e `capturas/index.html`

- [ ] **Passo 1:** branch

```bash
cd "$WT" && git fetch origin && git switch -c feat/conferencia-visual origin/main
```

- [ ] **Passo 2:** teste que falha — `scripts/lib/capturas.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGINAS, LARGURAS, pares, relatorio } from './capturas.mjs';

test('um par por página e largura', () =>
  assert.equal(pares().length, PAGINAS.length * LARGURAS.length));

test('o site atual põe idioma em ?lang=; o novo, no prefixo', () => {
  const [p] = pares([['home-en', '/?lang=en', '/en/']], [390]);
  assert.equal(p.antigo.url, 'https://www.alupar.com.br/?lang=en');
  assert.equal(p.novo.url, 'https://sitealupar.pages.dev/en/');
  assert.equal(p.antigo.arquivo, 'home-en-390-antigo.png');
  assert.equal(p.novo.arquivo, 'home-en-390-novo.png');
});

test('o relatório põe os dois lados de cada par', () => {
  const html = relatorio(pares([['contato', '/contato/', '/contato/']], [1280]));
  assert.match(html, /contato-1280-antigo\.png/);
  assert.match(html, /contato-1280-novo\.png/);
});
```

- [ ] **Passo 3:** rodar e ver falhar

```bash
node --test scripts/lib/capturas.test.mjs
# esperado: FAIL — Cannot find module '.../scripts/lib/capturas.mjs'
```

- [ ] **Passo 4:** `scripts/lib/capturas.mjs`

Superado pela D16 em 16/09/2026: a área de notícias foi desativada e as
entradas `noticias` e `noticia` saíram de `PAGINAS`. A cópia abaixo é o
retrato do Passo 4 no momento em que este plano foi escrito — quem manda é
o código; ver `scripts/lib/capturas.mjs` para a lista real.

```js
/**
 * Páginas e larguras da conferência visual (scripts/capturar-telas.mjs) e o
 * relatório que põe o site atual e o site novo lado a lado.
 */
export const ANTIGO = 'https://www.alupar.com.br';
// NOVO=http://localhost:8788 confere uma correção no build local antes do deploy.
export const NOVO = process.env.NOVO ?? 'https://sitealupar.pages.dev';
export const LARGURAS = [390, 768, 1280];

/* [nome, caminho no site atual, caminho no site novo] — um de cada modelo de
   página que o Marketing vai ver. O site atual põe o idioma em ?lang=.
   'noticias' e 'noticia' saíram com a área de notícias em 16/09/2026. */
export const PAGINAS = [
  ['home', '/', '/'],
  ['home-en', '/?lang=en', '/en/'],
  ['home-es', '/?lang=es', '/es/'],
  ['empresas', '/empresas/', '/empresas/'],
  ['pesquisa', '/group/pesquisa-e-desenvolvimento/', '/group/pesquisa-e-desenvolvimento/'],
  ['faq', '/faq/projetos-de-pd-em-andamento/', '/faq/projetos-de-pd-em-andamento/'],
  ['condicoes-de-uso', '/politica-de-privacidade/condicoes-de-uso/', '/politica-de-privacidade/condicoes-de-uso/'],
  ['videos', '/video/video-institucional/', '/videos/'],
  ['contato', '/contato/', '/contato/'],
];

/** Um par por página e largura, com a URL e o arquivo de cada lado. */
export function pares(paginas = PAGINAS, larguras = LARGURAS) {
  return paginas.flatMap(([nome, antigo, novo]) =>
    larguras.map((largura) => ({
      nome,
      largura,
      antigo: { url: `${ANTIGO}${antigo}`, arquivo: `${nome}-${largura}-antigo.png` },
      novo: { url: `${NOVO}${novo}`, arquivo: `${nome}-${largura}-novo.png` },
    })),
  );
}

/** HTML com cada par lado a lado, na ordem da lista. */
export function relatorio(lista) {
  const blocos = lista.map((p) => `<section id="${p.nome}-${p.largura}">
<h2>${p.nome} · ${p.largura} px</h2>
<div class="par">
<figure><figcaption><a href="${p.antigo.url}">site atual</a></figcaption><img src="${p.antigo.arquivo}" alt="" loading="lazy"></figure>
<figure><figcaption><a href="${p.novo.url}">site novo</a></figcaption><img src="${p.novo.arquivo}" alt="" loading="lazy"></figure>
</div>
</section>`);
  return `<!doctype html><meta charset="utf-8"><title>Conferência visual</title>
<style>body{font:14px system-ui;margin:16px}.par{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}figure{margin:0}img{width:100%;border:1px solid #ccc}</style>
${blocos.join('\n')}
`;
}
```

- [ ] **Passo 5:** rodar e ver passar

```bash
node --test scripts/lib/capturas.test.mjs   # esperado: pass 3, fail 0
npm test                                    # esperado: pass 55, fail 0
```

- [ ] **Passo 6:** `scripts/capturar-telas.mjs`

```js
/**
 * Captura o site atual e o site novo, página inteira, em 390, 768 e 1280 px,
 * para a conferência visual antes da aprovação do Marketing.
 *
 * Sem dependência: dirige o Chrome instalado pelo protocolo de depuração
 * (CDP), com o WebSocket nativo do Node 22+. Página inteira pela métrica de
 * layout, não por janela alta — janela alta estica o que usa 100vh.
 *
 * O banner de cookies do site atual sai antes da captura: ele cobre o
 * rodapé, e o site novo não tem banner (P9).
 *
 *   node scripts/capturar-telas.mjs                  # 11 páginas × 3 larguras
 *   node scripts/capturar-telas.mjs --pagina contato # só uma página
 *   NOVO=http://localhost:8788 node scripts/capturar-telas.mjs --pagina contato
 *   CHROME=/caminho/do/chrome node scripts/capturar-telas.mjs
 *
 * Saída em capturas/ (fora do git): <página>-<largura>-{antigo,novo}.png e
 * capturas/index.html com cada par lado a lado.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PAGINAS, pares, relatorio } from './lib/capturas.mjs';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9333;
const SAIDA = 'capturas';

const i = process.argv.indexOf('--pagina');
const filtro = i > 0 ? process.argv[i + 1] : null;
const lista = pares(filtro ? PAGINAS.filter(([nome]) => nome === filtro) : PAGINAS);
if (!lista.length) {
  console.error(`página desconhecida: ${filtro} — as válidas estão em scripts/lib/capturas.mjs`);
  process.exit(1);
}

mkdirSync(SAIDA, { recursive: true });
// ponytail: o perfil temporário fica no %TEMP%; o Chrome ainda o trava ao sair.
const perfil = mkdtempSync(join(tmpdir(), 'capturas-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
let alvo;
for (let n = 0; n < 50 && !alvo; n++) {
  await espera(200);
  alvo = await fetch(`http://127.0.0.1:${PORTA}/json/list`)
    .then((r) => r.json())
    .then((l) => l.find((t) => t.type === 'page'))
    .catch(() => undefined);
}
if (!alvo) {
  chrome.kill();
  console.error(`o Chrome não abriu a porta ${PORTA} — confira o caminho em CHROME`);
  process.exit(1);
}

const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
let seq = 0;
const respostas = new Map();
const ouvintes = new Set();
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) { respostas.get(m.id)?.(m); respostas.delete(m.id); } else for (const f of ouvintes) f(m);
};
const cdp = (method, params = {}) => new Promise((ok, erro) => {
  const id = ++seq;
  respostas.set(id, (m) => (m.error ? erro(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const carregou = () => new Promise((ok) => {
  const f = (m) => { if (m.method === 'Page.loadEventFired') { ouvintes.delete(f); ok(); } };
  ouvintes.add(f);
});

async function capturar(url, largura, arquivo) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: 900, deviceScaleFactor: 1, mobile: largura < 768 });
  const pronto = carregou();
  await cdp('Page.navigate', { url });
  await Promise.race([pronto, espera(30_000)]);
  // Rolar até o fim dispara o carregamento preguiçoso; depois volta ao topo e tira o banner de cookies.
  await cdp('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
  await espera(1500);
  await cdp('Runtime.evaluate', {
    expression: `window.scrollTo(0, 0); document.querySelectorAll('[id^="cookiescript"]').forEach((e) => e.remove())`,
  });
  await espera(500);
  const { cssContentSize } = await cdp('Page.getLayoutMetrics');
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: largura, height: Math.ceil(cssContentSize.height), scale: 1 },
  });
  writeFileSync(join(SAIDA, arquivo), Buffer.from(data, 'base64'));
}

try {
  await cdp('Page.enable');
  for (const p of lista) {
    for (const lado of [p.antigo, p.novo]) {
      await capturar(lado.url, p.largura, lado.arquivo);
      console.log(lado.arquivo);
    }
  }
} finally {
  ws.close();
  chrome.kill();
}
// O relatório lista sempre todos os pares; com --pagina, só aquela foi refeita.
writeFileSync(join(SAIDA, 'index.html'), relatorio(pares()));
console.log(`\n${lista.length} pares em ${SAIDA}/ — abrir ${SAIDA}/index.html`);
```

- [ ] **Passo 7:** `.gitignore`, ao fim do arquivo

```
# capturas da conferência visual (scripts/capturar-telas.mjs) — binário, fora do git
capturas/
```

- [ ] **Passo 8:** rodar e conferir

```bash
node scripts/capturar-telas.mjs
# esperado: 66 linhas .png e "33 pares em capturas/"
ls capturas/*.png | wc -l          # esperado: 66
git status --short                 # esperado: só os três scripts e o .gitignore; nada de capturas/
```

  Abrir `capturas/index.html` no navegador: cada página com os dois lados, e
  o site atual sem o banner de cookies.

Se alguma captura do site atual vier com o banner, o id dele mudou: abrir a
página no navegador, inspecionar o banner e ajustar o seletor
`[id^="cookiescript"]` no Passo 6.

- [ ] **Passo 9:** commit, PR, CI e merge

```bash
git add scripts/lib/capturas.mjs scripts/lib/capturas.test.mjs scripts/capturar-telas.mjs .gitignore
git commit -m "feat: capturas do site atual e do novo para a conferência visual"
git push -u origin feat/conferencia-visual
gh pr create --base main --head feat/conferencia-visual \
  --title "feat: capturas do site atual e do novo para a conferência visual" \
  --body "scripts/capturar-telas.mjs captura 11 páginas do site atual e do novo em 390, 768 e 1280 px, página inteira, dirigindo o Chrome instalado pelo protocolo de depuração — sem dependência nova. Saída em capturas/ (fora do git), com capturas/index.html pondo cada par lado a lado. Base da conferência antes da aprovação do Marketing."
gh pr checks --watch
gh pr merge feat/conferencia-visual --squash \
  --subject "feat: capturas do site atual e do novo para a conferência visual" \
  --body "Script de capturas lado a lado (11 páginas × 390/768/1280 px) para a conferência visual."
```

---

### Tarefa 3: conferência e registro das divergências

Cada diferença entre os dois lados vira uma linha, com um tipo que decide o
destino dela. O que já foi decidido não é defeito: está na primeira tabela do
relatório, para quem conferir não reabrir.

**Files:**
- Create: `docs/conferencia-visual.md`

- [ ] **Passo 1:** branch

```bash
cd "$WT" && git fetch origin && git switch -c docs/conferencia-visual origin/main
```

- [ ] **Passo 2:** criar `docs/conferencia-visual.md` com o cabeçalho e a tabela de mudanças deliberadas

```markdown
# Conferência visual — site atual × site novo

Capturas de `node scripts/capturar-telas.mjs` (11 páginas × 390, 768 e
1280 px), comparadas em `capturas/index.html`, capturadas em <data do Passo 8 da Tarefa 2>.

## Mudanças deliberadas — não são defeito

| O que muda no site novo | Por quê |
|---|---|
| Idiomas em sigla PT · EN · ES, sem bandeiras | Decisão P4 |
| Sem busca no cabeçalho | Decisão P3 |
| Vídeo da home com capa local; o player só carrega no clique | Decisão P8 |
| Hover e página atual do menu no verde de texto `#079541`; cinzas mais escuros | Contraste AA — ver o comentário de `src/components/Cabecalho.astro` |
| Links de idioma com área clicável de 24×24 px | WCAG 2.5.8 |
| Logotipo em negativo sobre o box azul | O tema faz o mesmo (`img/logo-alupar.png`) — Tarefa 1 |
| Sem banner de cookies | Decisão P9 |
| Listagem de notícias e arquivo paginado | Decisão P2 |
| Formulário de contato com rótulo por campo, consentimento e Turnstile | Critérios C1 a C4 do PRD |
| Página de erro própria para endereço inexistente | Tarefa 11b de `plano-virada.md` |

## Divergências

Tipos: **D** defeito do restauro → Tarefa 4 · **C** conteúdo ou texto →
Comunicação/Marketing decide, vai para a pauta · **A** aceitável (diferença
de renderização sem efeito visível para quem usa, como suavização de fonte).

| # | Página | Largura | Zona | Site atual | Site novo | Tipo | Destino |
|---|---|---|---|---|---|---|---|
```

- [ ] **Passo 3:** conferir par a par em `capturas/index.html`, na ordem do
  relatório, zona por zona: barra superior, cabeçalho e menu, faixa ou
  banner, corpo (títulos, parágrafos, listas, tabelas, imagens), rodapé.
  Para cada diferença que não esteja na tabela de mudanças deliberadas,
  acrescentar uma linha — por exemplo:

```markdown
| 1 | contato | 390 | rodapé | endereço em duas colunas | endereço em uma coluna | D | Tarefa 4 |
```

  Descrever o que se vê nos dois lados, em termos que outra pessoa ache na
  captura. Sem diferença numa página inteira: não escrever linha.

- [ ] **Passo 4:** fechar o relatório com a contagem

```markdown
## Resumo

N divergências: X do tipo D (corrigidas na Tarefa 4), Y do tipo C (na pauta),
Z do tipo A.
```

  com N, X, Y e Z contados da tabela.

- [ ] **Passo 5:** commit, PR, CI e merge

```bash
git add docs/conferencia-visual.md
git commit -m "docs: conferência visual do site atual e do novo"
git push -u origin docs/conferencia-visual
gh pr create --base main --head docs/conferencia-visual \
  --title "docs: conferência visual do site atual e do novo" \
  --body "Registro par a par (11 páginas × 390/768/1280 px): mudanças deliberadas separadas das divergências, cada divergência com tipo e destino. As do tipo D são corrigidas no PR seguinte."
gh pr checks --watch
gh pr merge docs/conferencia-visual --squash \
  --subject "docs: conferência visual do site atual e do novo" \
  --body "Divergências entre o site atual e o novo, com tipo e destino de cada uma."
```

---

### Tarefa 4: correção das divergências do tipo D

Sem linha do tipo D na Tarefa 3, esta tarefa não roda: registrar "nenhum
defeito de restauro" no resumo do relatório e seguir.

O conteúdo de cada correção sai da linha da tabela. A fonte do valor certo é
o CSS do tema atual, não o olho: restauro fiel copia o valor.

**Files (conforme a linha):**
- Modify: `src/components/*.astro` (bloco `<style>` do componente da zona) ou `src/styles/tokens.css`
- Modify: `docs/conferencia-visual.md` (coluna Destino de cada linha corrigida)

- [ ] **Passo 1:** branch

```bash
cd "$WT" && git fetch origin && git switch -c fix/conferencia-visual origin/main
```

- [ ] **Passo 2:** achar a regra do tema para a zona da linha

```bash
curl -sS -A 'Mozilla/5.0' https://www.alupar.com.br/ | grep -oE 'https://cdn-sites-assets\.mziq\.com/[^"]+\.css[^"]*' | sort -u
# lista as folhas do tema; baixar a que tiver o seletor da zona e procurar por ele:
curl -sS "<url da folha>" | tr '}' '\n' | grep -n "<seletor>"
```

- [ ] **Passo 3:** aplicar o mesmo valor no componente da zona (cabeçalho →
  `src/components/Cabecalho.astro`; rodapé → `Rodape.astro`; home →
  `Home.astro`; notícias → `ListaNoticias.astro`; vídeos → `ListaVideos.astro`;
  contato → `Contato.astro`; corpo das páginas do acervo e faixa interna →
  `src/layouts/Base.astro` e `src/styles/tokens.css`). Medidas em `rem` ou nos
  tokens `--e*` quando o tema usa um valor que já tem token

- [ ] **Passo 4:** refazer só a página da linha e conferir que o par ficou igual

```bash
npm run build
npx --yes wrangler@4 pages dev dist --port 8788 --compatibility-date=2026-06-02 &
# o --compatibility-date é o do workerd local; sem ele o pages dev recusa subir
NOVO=http://localhost:8788 node scripts/capturar-telas.mjs --pagina <página>
kill %1
```

  Abrir `capturas/index.html` no navegador e conferir o par da página: a
  zona da linha tem de estar igual nos dois lados, nas três larguras.

- [ ] **Passo 5:** commit por linha corrigida, com a zona e a página no assunto

```bash
npm test && node scripts/verificar-csp.mjs
git add src/ docs/conferencia-visual.md
git commit -m "fix: <zona> de <página> como no tema (conferência visual, linha <#>)"
```

  e na linha da tabela, coluna Destino: `corrigida — <hash curto>`.

- [ ] **Passo 6:** depois da última linha, PR, CI e merge. O Lighthouse do CI
  tem de continuar verde — se uma correção reprovar contraste ou tamanho de
  alvo, ela é mudança deliberada (volta para a primeira tabela do relatório
  com o motivo), não se afrouxa o limite

```bash
git push -u origin fix/conferencia-visual
gh pr create --base main --head fix/conferencia-visual \
  --title "fix: divergências de restauro da conferência visual" \
  --body "Uma correção por linha do tipo D de docs/conferencia-visual.md, cada uma com o valor copiado do CSS do tema atual."
gh pr checks --watch
gh pr merge fix/conferencia-visual --squash \
  --subject "fix: divergências de restauro da conferência visual" \
  --body "Correções das linhas do tipo D de docs/conferencia-visual.md, com os valores do tema atual."
node scripts/capturar-telas.mjs    # depois do deploy da main: capturas finais para o Marketing
```

---

### Tarefa 5: P9 no padrão, pronta em rascunho

Se a Alupar decidir pelo padrão da P9 (ou o prazo vencer), a medição entra
com dois passos: pôr o token numa variável do GitHub e mergear este PR. Se
decidir manter o GA4, o PR fecha sem merge.

Snippet manual, não a injeção automática do Pages: o snippet vai para o HTML
do build, e o gate de CSP confere o que está no build. A injeção automática
nasceria na borda, fora do gate — o mesmo ponto cego que o `verificar-csp.mjs`
já declara para os iframes.

**Files:**
- Modify: `scripts/lib/csp.test.mjs` — teste contra o `_headers` real
- Modify: `public/_headers` — `script-src` e `connect-src`
- Modify: `src/layouts/Base.astro` — snippet quando a variável existe
- Modify: `.github/workflows/ci.yml` — variável nos dois `npm run build`
- Modify: `docs/plano-virada.md` — pré-condição da P9 na Tarefa 12

**Interfaces:**
- Consome: `lerCsp`, `diretivas`, `fontesPara`, `permitido` de `scripts/lib/csp.mjs`
- Produz: variável de build `PUBLIC_CF_BEACON_TOKEN` ← `vars.CF_BEACON_TOKEN`

- [ ] **Passo 1:** branch

```bash
cd "$WT" && git fetch origin && git switch -c feat/medicao-web-analytics origin/main
```

- [ ] **Passo 2:** teste que falha — ao fim de `scripts/lib/csp.test.mjs`, e
  `import { readFileSync } from 'node:fs';` junto dos outros imports

```js
test('o _headers do site libera o beacon do Web Analytics (P9)', () => {
  const d = diretivas(lerCsp(readFileSync('public/_headers', 'utf8')));
  const opcoes = { origem: 'https://www.alupar.com.br' };
  assert.equal(permitido('https://static.cloudflareinsights.com/beacon.min.js', fontesPara(d, 'script-src'), opcoes), true);
  assert.equal(permitido('https://cloudflareinsights.com/cdn-cgi/rum', fontesPara(d, 'connect-src'), opcoes), true);
  assert.equal(permitido('https://www.alupar.com.br/api/contato', fontesPara(d, 'connect-src'), opcoes), true);
});
```

- [ ] **Passo 3:** rodar e ver falhar

```bash
node --test scripts/lib/csp.test.mjs
# esperado: FAIL no teste novo — "Expected values to be strictly equal: false !== true"
```

- [ ] **Passo 4:** `public/_headers`, na linha do `Content-Security-Policy`:
  acrescentar `https://static.cloudflareinsights.com` ao fim do `script-src`
  e uma diretiva nova `connect-src 'self' https://cloudflareinsights.com;`
  logo depois do `script-src`. Conferir as entradas contra a pergunta "What do
  I need to add to my Content Security Policy" em
  https://developers.cloudflare.com/web-analytics/faq/ — se a documentação
  pedir mais, acrescentar e cobrir no teste do Passo 2

```
script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com;
```

- [ ] **Passo 5:** rodar e ver passar

```bash
npm test    # esperado: fail 0, com o teste novo entre os que passam
```

- [ ] **Passo 6:** `src/layouts/Base.astro` — no frontmatter, depois de `const padrao = …`

```ts
/* Medição (P9, padrão): Cloudflare Web Analytics, sem cookie e sem banner.
   Só entra com o token em PUBLIC_CF_BEACON_TOKEN (vars.CF_BEACON_TOKEN no CI);
   sem ele, nenhum byte a mais. Snippet no HTML, e não a injeção automática do
   Pages, para passar pelo gate de CSP (scripts/verificar-csp.mjs). */
const beacon = import.meta.env.PUBLIC_CF_BEACON_TOKEN;
```

  e no `<body>`, logo antes de `<script is:inline src="/js/site.js" defer></script>`:

```astro
{beacon && <script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: beacon })}></script>}
```

- [ ] **Passo 7:** `.github/workflows/ci.yml` — nos dois passos `npm run build`
  (jobs `build` e `qualidade`), no `env:` que já tem `PUBLIC_TURNSTILE_SITE_KEY`

```yaml
          PUBLIC_CF_BEACON_TOKEN: ${{ vars.CF_BEACON_TOKEN }}
```

- [ ] **Passo 8:** conferir sem e com o token

```bash
npm run build && grep -rl cloudflareinsights dist | wc -l
# esperado: 0 — sem variável, nada muda
PUBLIC_CF_BEACON_TOKEN=teste npm run build && grep -rl cloudflareinsights dist --include='*.html' | wc -l
# esperado: 400 (as 399 index.html e a 404.html)
node scripts/verificar-csp.mjs
# esperado: "script-src static.cloudflareinsights.com" na lista e "aprovado"
grep -o 'data-cf-beacon="[^"]*"' dist/index.html
# esperado: data-cf-beacon="{&quot;token&quot;:&quot;teste&quot;}"
npm run build    # de novo sem a variável, para o dist não ficar com o token de teste
```

- [ ] **Passo 9:** `docs/plano-virada.md`, na Tarefa 12, trocar a linha da
  pré-condição da P9 por

```markdown
- [ ] P9 no padrão: Cloudflare → Web Analytics → Add a site → `www.alupar.com.br`, **sem** ligar a injeção automática no projeto do Pages; copiar o token do snippet; `gh variable set CF_BEACON_TOKEN --body <token>`; marcar o PR `feat/medicao-web-analytics` como pronto e mergear. Se a P9 for pelo GA4, fechar esse PR sem merge
```

- [ ] **Passo 10:** commit e PR em **rascunho** — não mergear

```bash
git add scripts/lib/csp.test.mjs public/_headers src/layouts/Base.astro .github/workflows/ci.yml docs/plano-virada.md
git commit -m "feat: medição pelo Cloudflare Web Analytics, ligada por variável (P9)"
git push -u origin feat/medicao-web-analytics
gh pr create --draft --base main --head feat/medicao-web-analytics \
  --title "feat: medição pelo Cloudflare Web Analytics, ligada por variável (P9)" \
  --body "Padrão da decisão P9: medição sem cookie e sem banner. O snippet só entra no build com vars.CF_BEACON_TOKEN definida; a CSP libera static.cloudflareinsights.com (script-src) e cloudflareinsights.com (connect-src), com teste contra o _headers real. Fica em rascunho até a P9: no padrão, definir a variável e mergear; pelo GA4, fechar."
gh pr checks --watch    # esperado: verde — sem a variável o build é idêntico ao da main
```

---

### Tarefa 6: limpeza

Por último, do checkout principal: esta tarefa remove a cópia de trabalho de
onde as anteriores rodaram.

- [ ] **Passo 1:** sobras do checkout principal. Conferir que não há nada novo
  nelas antes de descartar

```bash
cd "$CP" && git fetch --prune origin
git diff --ignore-blank-lines --quiet origin/main -- .github/workflows/ci.yml && echo "ci.yml: só linha em branco"
# esperado: a mensagem — senão, parar e mostrar o diff ao usuário
git show origin/main:docs/plano-virada.md | tr -d '\r' > /tmp/plano-main.md
tr -d '\r' < docs/plano-virada.md | diff - /tmp/plano-main.md | grep '^<'
# esperado: só linhas que a main já substituiu (ex.: "P1 a P8 respondidas") — senão, parar e mostrar
git checkout -- .github/workflows/ci.yml && rm docs/plano-virada.md
git switch main && git pull --ff-only
git status --short    # esperado: vazio
```

- [ ] **Passo 2:** remover a cópia de trabalho. A junction `acervo/midia`
  aponta para a mídia do checkout principal (734 MB, fora do git) e sai
  primeiro, com `rmdir`, que remove só o link

```bash
ls "$CP/acervo/midia" | wc -l                       # anotar o número antes
cmd //c rmdir "$(cygpath -w "$WT/acervo/midia")"
ls "$CP/acervo/midia" | wc -l                       # esperado: o mesmo número — a mídia continua lá
git worktree remove "$WT"
git worktree prune && git worktree list             # esperado: só o checkout principal
```

  Se `git worktree remove` recusar por arquivo não versionado, listar com
  `git -C "$WT" status --porcelain -uall --ignored` e perguntar ao usuário
  antes de usar `--force`.

- [ ] **Passo 3:** branches locais já mergeados — só apaga o que tem PR
  mergeado com o mesmo commit na ponta

```bash
for b in $(git branch --format='%(refname:short)' | grep -v '^main$'); do
  pr=$(gh pr list --state merged --head "$b" --json headRefOid --jq '.[0].headRefOid')
  if [ -n "$pr" ] && [ "$pr" = "$(git rev-parse "$b")" ]; then git branch -D "$b"; else echo "fica: $b"; fi
done
git branch    # esperado: main e, se houver, os "fica" (a conferir um a um)
```

- [ ] **Passo 4:** branches remotos já mergeados — listar primeiro, apagar depois

```bash
for b in $(git branch -r --format='%(refname:lstrip=3)' | grep -vE '^(main|HEAD)$'); do
  pr=$(gh pr list --state merged --head "$b" --json headRefOid --jq '.[0].headRefOid')
  [ -n "$pr" ] && [ "$pr" = "$(git rev-parse "origin/$b")" ] && echo "$b"
done > /tmp/remotos-mergeados.txt
cat /tmp/remotos-mergeados.txt    # conferir: nenhum branch de PR aberto (o da P9 fica)
xargs -r -n1 git push origin --delete < /tmp/remotos-mergeados.txt
git fetch --prune origin && git branch -r
# esperado: origin/main e origin/feat/medicao-web-analytics (rascunho da P9)
```

---

## Conferência final

```bash
gh pr list --state open --json number,headRefName,isDraft --jq '.[] | "#\(.number) \(.headRefName) rascunho=\(.isDraft)"'
# esperado: só o da P9, em rascunho
git -C "$CP" ls-remote --heads origin "$(gh pr view 54 --json headRefName --jq .headRefName)" | wc -l
# esperado: 0 — o branch do #54 não existe mais
node "$CP/scripts/verificar-no-ar.mjs" https://sitealupar.pages.dev   # esperado: aprovado
```
