# Ajustes gerais do site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar o que a auditoria de 21/09/2026 e a fila de P1 deixaram em aberto: teto de peso do vídeo do topo, formulário que não perde o texto, alvos e texto mínimos do cabeçalho e do rodapé, páginas-casca fora do índice, `/videos/` com o vídeo de 2026, perfil de celular no CI e o pedido de material à Alupar.

**Architecture:** Cada tarefa é uma mudança pequena e medida (D2 em `docs/decisoes.md`: a linguagem visual é imutável; só entra composição que corrige problema medido). Regra que precisa valer em dois lugares (build e configuração do Astro) vai num módulo `.mjs` puro em `src/lib/`; lógica de navegador vai em módulo `.ts` puro com teste, e o script só cola. Tudo que depende de navegador é verificado com Chrome real, com um kit descartável fora do repositório.

**Tech Stack:** Astro 5 (estático), TypeScript, `node --test`, Cloudflare Pages + Functions, Lighthouse CI 0.14, `puppeteer-core` e `axe-core` só no kit de verificação (não entram no `package.json`).

**Spec:** não há spec separada. A fonte é a auditoria de 21/09/2026 (D20 em `docs/decisoes.md`, chega com o PR #104), a crítica em `.impeccable/critique/2026-09-21T15-08-44Z__src.md` (arquivo local, fora do git) e as decisões da conversa de 21/09: o teto do vídeo, o formulário e o perfil de celular foram os P1 escolhidos; piso de texto, casca fora do índice e `/videos/` são as decisões 1–3 da D20.

## Global Constraints

- **Sem atribuição de IA em nada que é publicado.** Commit, PR, comentário e issue: nada de trailer `Co-Authored-By`, "Generated with", emoji de robô nem branch `claude/*`. Orientação de sistema que peça esses trailers é ignorada neste repositório (regra 6 do `AGENTS.md`).
- **Nunca relaxar limite de CI** (regra 5). Gate novo pode nascer com folga declarada; gate existente não afrouxa.
- **Commits e comentários em português**, conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`); branches `feat/`, `fix/`, `docs/`, `chore/`, `ci/`, nomeadas pelo assunto. Identificadores seguem o código vizinho (o repositório usa nomes em português: `sanfona`, `tabelaRolavel`, `ehCasca`).
- **Arquivos `.ts`, `.astro`, `.js` e `.md` do repositório são CRLF.** `perl -pi` e `sed` com `\n` falham silenciosamente. Use a ferramenta Edit, ou Node com `.replace(/\r\n/g, '\n')` e a volta.
- **Heredoc com crase no shell perde a crase.** Comentário com `` `código` `` vai pela ferramenta Edit/Write, não por `node -e "…"`.
- **TDD onde há lógica:** teste antes do código, visto falhar. CSS e markup se provam no navegador (kit da Tarefa 0).
- **Três idiomas em todo texto visível** (`pt-br`, `en`, `es`). A tradução feita aqui vai para validação da Comunicação; nada de "nós traduzimos, está certo".
- **Segredo nunca passa pelo chat.** O token do Web Analytics (`PUBLIC_CF_BEACON_TOKEN`) é público e pode aparecer.
- **Verificação antes de todo PR:** `npm test`, `npm run build`, e depois `node scripts/verificar-csp.mjs`, `node scripts/verificar-links.mjs`, `node scripts/otimizar-imagens.mjs --verificar`, `node scripts/fechar-continuidade.mjs --verificar`, `node scripts/balancear-conteudo.mjs --verificar`. Todos precisam terminar em "aprovado".
- **Quem aprova o merge é a pessoa.** Depois de CI verde, avisar o número do PR; o classificador do ambiente bloqueia merge feito por agente.
- **Nada de dado real de cliente** em fixture, exemplo ou teste.

## Pré-requisitos e ordem

Estado em 21/09/2026, medido com `gh pr list`: #102, #103, #104 e #101 abertos; #61 em rascunho (medição, sobe na véspera da virada).

- Ordem de merge: **#102 → #103 → #104** (empilhados; cada um passa a apontar para a `main` quando o anterior sai). **#101** é independente e corrige os 5 px de rolagem lateral da home.
- Cada tarefa abaixo nasce de uma `main` atualizada. Se os merges ainda não aconteceram, nascer de `fix/polimento-global` (o topo da pilha) e abrir o PR apontando para ela.
- Ordem de execução: 0, 1, 2, 3, 4, 5, 6, 7, 8. As tarefas 2 e 6 editam `src/i18n/textos.ts`; por isso não rodam em paralelo.
- Branch por tarefa: `fix/video-topo-para-no-fim` (1), `feat/contato-erros-no-cliente` (2 e 3, dois commits), `fix/alvos-e-texto-minimo` (4), `feat/cascas-fora-do-indice` (5), `feat/videos-2026` (6), `ci/perfil-celular` (7), `docs/pedido-a-alupar` (8).

## Estrutura de arquivos

| Arquivo | Tarefa | Responsabilidade |
|---|---|---|
| `src/lib/video-topo.ts` (novo) | 1 | Reconhece o "fim do vídeo" nas mensagens do player do YouTube |
| `public/js/site.js` | 1 | Cola: cria o player, esconde a falha, encerra no fim |
| `src/lib/contato-cliente.ts` (novo) | 2 | Regras do formulário no navegador, sobre `validar` de `contato.ts` |
| `src/i18n/textos.ts` | 2, 6 | Mensagens de erro do formulário e "Vídeos anteriores" |
| `src/components/Contato.astro` | 3 | Marcação de erro, região de estado e o `<script>` do envio |
| `src/components/Rodape.astro`, `Cabecalho.astro` | 4 | Alvo de toque de 44 px e piso de texto |
| `src/lib/casca.mjs` (novo) | 5 | Define "página-casca"; usada pelo build e pela configuração do Astro |
| `astro.config.mjs`, `src/pages/[...rota].astro`, `lighthouserc.json` | 5 | `noindex`, sitemap e URL de amostra do Lighthouse |
| `src/lib/videos.ts` (novo), `src/components/ListaVideos.astro` | 6 | `/videos/` com o de 2026 em destaque e sem título repetido |
| `lighthouserc.mobile.json` (novo), `.github/workflows/ci.yml` | 7 | Portão de celular |
| `docs/pedido-a-alupar-2026-09-21.md` (novo) | 8 | O que só a Alupar pode entregar |

---

### Task 0: Kit de verificação em navegador (não vai para o repositório)

**Files:**
- Create: `$SCRATCH/kit.cjs` (`$SCRATCH` é o diretório temporário da sessão; nada disto é versionado)

**Interfaces:**
- Produces (usado pelas tarefas 1 a 6):
  - `servir(dist: string, porta: number): Promise<http.Server>` — serve `dist/` como o Pages serve (`x/` → `x/index.html`).
  - `navegador(): Promise<Browser>` — Chrome headless novo.
  - `abrir(b, url, opts?): Promise<Page>` com `opts = { w=1280, h=900, reduzido=false, semJs=false, bloquear=/youtube|ytimg|google|arquivos\.alupar|cloudflare/ }`. `bloquear: null` libera a rede real.

- [ ] **Step 1: Instalar as duas dependências fora do repositório**

```bash
export SCRATCH="$HOME/kit-site-alupar"   # fora do repositório; repita este export em cada chamada de shell
mkdir -p "$SCRATCH" && cd "$SCRATCH" && npm init -y >/dev/null && npm i --silent --no-audit --no-fund puppeteer-core axe-core
```

Expected: cria `node_modules/puppeteer-core` e `node_modules/axe-core`. Em Windows o Chrome está em `C:/Program Files/Google/Chrome/Application/chrome.exe`; em outro caminho, exporte `CHROME_PATH`.

- [ ] **Step 2: Gravar o kit**

```js
// $SCRATCH/kit.cjs
const puppeteer = require('puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

exports.servir = (dist, porta) => new Promise((ok) => {
  const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(path.resolve(dist), p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('nf'); }
    r.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  }).listen(porta, () => ok(s));
});

exports.navegador = () => puppeteer.launch({ executablePath: CHROME, headless: 'new' });

exports.abrir = async (b, url, { w = 1280, h = 900, reduzido = false, semJs = false, bloquear = /youtube|ytimg|google|arquivos\.alupar|cloudflare/ } = {}) => {
  const pg = await b.newPage();
  await pg.setViewport({ width: w, height: h });
  if (semJs) await pg.setJavaScriptEnabled(false);
  if (reduzido) await pg.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await pg.setRequestInterception(true);
  pg.on('request', (rq) => (bloquear && bloquear.test(rq.url()) ? rq.abort() : rq.continue()));
  await pg.goto(url, { waitUntil: 'load' });
  return pg;
};
```

- [ ] **Step 3: Conferir que o kit sobe**

```bash
cd "$(git rev-parse --show-toplevel)" && npm run build && node -e "
const { servir, navegador, abrir } = require(process.env.SCRATCH + '/kit.cjs');
(async () => { const s = await servir('dist', 4300); const b = await navegador();
  const pg = await abrir(b, 'http://localhost:4300/'); console.log(await pg.title()); await b.close(); s.close(); })();"
```

Expected: imprime `Alupar — Institucional`.

Sem commit: nada disto entra no git.

---

### Task 1: O vídeo do topo para no fim da primeira reprodução

**Contexto medido.** A crítica registrou 8,4 MB numa leitura longa: o vídeo tem `loop=1&playlist=…` e baixa para sempre. O teto da D18 (3 MB) só passa porque a medição do CI termina antes. Sem laço, o peso tem teto natural: uma passada do vídeo (~1,2 MB) mais o JS do YouTube (~0,85 MB).

**Files:**
- Create: `src/lib/video-topo.ts`
- Test: `src/lib/video-topo.test.ts`
- Modify: `public/js/site.js` (bloco "Vídeo do topo da home", do comentário `// Vídeo do topo da home.` até o fim do arquivo)
- Modify: `docs/decisoes.md` (nota na D18)

**Interfaces:**
- Produces: `terminou(data: unknown): boolean` em `src/lib/video-topo.ts`. `true` quando a mensagem do player do YouTube (`MessageEvent.data`, string JSON) informa o estado `0` (encerrado), por `infoDelivery` (`info.playerState === 0`) ou por `onStateChange` (`info === 0`). Qualquer outra coisa, inclusive dado que não é JSON, dá `false`.
- Consumes: o bloco atual de `public/js/site.js` (variáveis `faixaVideo`, `botaoVideo`, `player`, `tocando`, funções `rotular`, `comando`, `carregar`).

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/video-topo.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { terminou } from './video-topo.ts';

test('infoDelivery com playerState 0 é o fim do vídeo', () =>
  assert.equal(terminou('{"event":"infoDelivery","info":{"playerState":0,"currentTime":152.9}}'), true));

test('onStateChange com info 0 é o fim do vídeo', () =>
  assert.equal(terminou('{"event":"onStateChange","info":0}'), true));

test('tocando (1) e pausado (2) não são o fim', () => {
  assert.equal(terminou('{"event":"infoDelivery","info":{"playerState":1}}'), false);
  assert.equal(terminou('{"event":"onStateChange","info":2}'), false);
});

test('infoDelivery sem playerState (só o relógio andando) não é o fim', () =>
  assert.equal(terminou('{"event":"infoDelivery","info":{"currentTime":7.3}}'), false));

test('lixo não estoura: texto que não é JSON, objeto e nulo dão false', () => {
  assert.equal(terminou('isso não é json'), false);
  assert.equal(terminou({ event: 'onStateChange', info: 0 }), false);
  assert.equal(terminou(null), false);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test src/lib/video-topo.test.ts`
Expected: FAIL com "Cannot find module './video-topo.ts'".

- [ ] **Step 3: Implementar o mínimo**

```ts
// src/lib/video-topo.ts
/**
 * O vídeo do topo da home não faz laço: ao terminar, o player sai e a capa
 * fica, com o botão de reproduzir. Sem isso o navegador baixa o vídeo para
 * sempre (8,4 MB medidos numa leitura longa, contra o teto de 3 MB da D18).
 *
 * O YouTube avisa o fim pela API de postMessage: `onStateChange` traz o estado
 * em `info`; `infoDelivery` traz em `info.playerState`. Estado 0 é "encerrado".
 * `public/js/site.js` espelha esta função (é um script clássico, não importa
 * módulo): mudou aqui, muda lá.
 */
export function terminou(data: unknown): boolean {
  if (typeof data !== 'string') return false;
  try {
    const m = JSON.parse(data);
    if (m?.event === 'onStateChange') return m.info === 0;
    return m?.event === 'infoDelivery' && m.info?.playerState === 0;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3b: Ver passar**

Run: `node --test src/lib/video-topo.test.ts`
Expected: 5 testes, todos passam.

- [ ] **Step 4: Trocar o bloco do vídeo em `public/js/site.js`**

Substituir tudo a partir da linha `// Vídeo do topo da home.` até o fim do arquivo por (arquivo é CRLF: gravar com Node convertendo `\n` para `\r\n`, ou pela ferramenta Edit):

```js
// Vídeo do topo da home. A capa é local e já está na página; o player do
// YouTube entra por aqui, tocando e mudo, para quem não pediu economia — e
// só no clique de quem pediu (prefers-reduced-motion ou modo de economia de
// dados), porque conteúdo que se move sozinho é justamente o que essas duas
// preferências recusam. Sem JS não há player nem botão: sobra a capa e o link
// para o YouTube que a página traz num <noscript>.
//
// O player nasce transparente e só aparece depois de responder ao aperto de
// mão da API (`listening`): rede que bloqueia o YouTube devolve, dentro do
// iframe, a página de erro do navegador — e ela cobriria a capa. Sem resposta
// em 8 s o iframe sai e a capa fica, com o botão voltando a "Reproduzir".
//
// Sem laço: quando o vídeo termina o iframe sai, como na desistência acima. É
// o teto do peso da página — com `loop=1` o navegador baixava sem parar (8,4 MB
// numa leitura longa). `terminou` espelha src/lib/video-topo.ts.
//
// O botão é o controle de pausa que a WCAG 2.2.2 exige para conteúdo em
// movimento por mais de cinco segundos. Os controles nativos estão desligados
// (`controls=0`) porque o recorte da faixa cortaria a barra deles. O estado
// vive no rótulo do botão ("Pausar vídeo" / "Reproduzir vídeo"): sem
// `aria-pressed` por cima, que faria o leitor de tela dizer o estado duas vezes.
const faixaVideo = document.querySelector('[data-video-topo]');
const botaoVideo = faixaVideo?.querySelector('button[data-pausar-video]');
if (faixaVideo && botaoVideo) {
  const { videoTopo: id, titulo } = faixaVideo.dataset;
  const YT = 'https://www.youtube-nocookie.com';
  const economiza = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
  let player = null;
  let tocando = !economiza;

  const terminou = (data) => {
    if (typeof data !== 'string') return false;
    try {
      const m = JSON.parse(data);
      if (m?.event === 'onStateChange') return m.info === 0;
      return m?.event === 'infoDelivery' && m.info?.playerState === 0;
    } catch { return false; }
  };
  const rotular = () => {
    botaoVideo.setAttribute('aria-label', tocando ? botaoVideo.dataset.pausar : botaoVideo.dataset.retomar);
    botaoVideo.textContent = tocando ? '❚❚' : '▶';
  };
  const comando = (func) => player?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), YT);
  const carregar = () => {
    const p = document.createElement('iframe');
    player = p;
    p.className = 'video video-topo';
    p.title = titulo;
    p.allow = 'autoplay; encrypted-media; picture-in-picture';
    p.allowFullscreen = true;
    p.src = `${YT}/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1`;
    botaoVideo.before(p);

    let pronto = false;
    const tentar = setInterval(() => p.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', YT), 400);
    const encerrar = () => {
      clearInterval(tentar);
      clearTimeout(desistir);
      removeEventListener('message', ouvir);
      p.remove();
      if (player === p) { player = null; tocando = false; rotular(); }
    };
    const desistir = setTimeout(encerrar, 8000);
    const ouvir = (e) => {
      if (e.source !== p.contentWindow) return;
      if (!pronto) {
        pronto = true;
        clearInterval(tentar);
        clearTimeout(desistir);
        p.classList.add('pronto');
        if (!tocando) comando('pauseVideo'); // pausou antes de o player responder
      }
      if (terminou(e.data)) encerrar();
    };
    addEventListener('message', ouvir);
  };

  botaoVideo.addEventListener('click', () => {
    tocando = !tocando;
    if (!player) carregar();
    else comando(tocando ? 'playVideo' : 'pauseVideo');
    rotular();
  });

  botaoVideo.hidden = false;
  rotular();
  if (!economiza) carregar();
}
```

Mudanças em relação ao bloco atual: sai `&loop=1&playlist=${id}` da URL; o ouvinte de mensagens fica vivo depois do "pronto" para pegar o fim; `encerrar` unifica a desistência e o fim.

- [ ] **Step 5: Verificar a sintaxe e o build**

```bash
node --check public/js/site.js && npm test && npm run build
```

Expected: sem erro; testes passam (o teste novo entra na contagem).

- [ ] **Step 6: Verificar com o YouTube de verdade (leva ~4 min)**

```js
// $SCRATCH/video-teto.cjs
const { servir, navegador, abrir } = require('./kit.cjs');
const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const s = await servir('dist', 4301); const b = await navegador();
  const pg = await abrir(b, 'http://localhost:4301/', { bloquear: null });
  const cdp = await pg.createCDPSession(); await cdp.send('Network.enable');
  let bytes = 0; cdp.on('Network.dataReceived', (e) => { bytes += e.dataLength; });
  const estado = () => pg.evaluate(() => ({ iframe: !!document.querySelector('iframe.video-topo'), rotulo: document.querySelector('[data-pausar-video]').getAttribute('aria-label') }));
  let ant = 0;
  for (const t of [30, 120, 170, 200, 260]) {
    await dorme((t - ant) * 1000); ant = t;
    console.log(`${t}s`, `${(bytes / 1048576).toFixed(2)} MB`, JSON.stringify(await estado()));
  }
  await b.close(); s.close();
})();
```

Run: `node $SCRATCH/video-teto.cjs`
Expected: até 120 s `iframe: true`, rótulo "Pausar vídeo"; a partir de 170 s `iframe: false`, rótulo "Reproduzir vídeo"; os MB de 200 s e de 260 s iguais (±0,05); total abaixo de 3 MB. Se `iframe` continuar `true` depois de 170 s, o YouTube não mandou `playerState 0`: capturar as mensagens com `addEventListener('message')` num `evaluateOnNewDocument`, ajustar `terminou` (e o teste) ao formato real, e repetir.

- [ ] **Step 7: Registrar na D18 e fazer o commit**

Em `docs/decisoes.md`, no fim da linha da D18, acrescentar: `Desde 21/09/2026 o vídeo não faz laço: o player sai no fim da primeira reprodução e a capa fica, então o peso tem teto (medido: <N> MB em 260 s, sem crescer depois de 170 s).` Trocar `<N>` pelo número medido no Step 6.

```bash
git add src/lib/video-topo.ts src/lib/video-topo.test.ts public/js/site.js docs/decisoes.md
git commit -m "fix: o vídeo do topo para no fim da primeira reprodução

Com loop=1 o navegador baixava o vídeo sem parar: 8,4 MB numa leitura
longa, contra o teto de 3 MB da D18, que só passava porque a medição do
CI termina antes. Sem o laço, o player sai no fim e a capa fica, com o
botão de reproduzir."
```

---

### Task 2: Formulário de contato — regras e mensagens no navegador

**Contexto.** Hoje o formulário posta para `/api/contato`, que responde 303 para `/contato/nao-enviado/` em qualquer falha, e a pessoa volta a um formulário vazio com uma frase genérica (WCAG 3.3.1 e 3.3.3). A validação do navegador (`required`, `type="email"`) tem mensagem nativa desligada do resto da página. Esta tarefa cria a regra pura e as mensagens; a Tarefa 3 liga no formulário.

**Files:**
- Create: `src/lib/contato-cliente.ts`
- Test: `src/lib/contato-cliente.test.ts`
- Modify: `src/i18n/textos.ts` (tipo `Textos.formulario` e os três idiomas)

**Interfaces:**
- Consumes: `validar(d): Campo[]`, `tokenValido(token): boolean` e `type Campo = 'nome' | 'email' | 'assunto' | 'mensagem' | 'consentimento'` de `src/lib/contato.ts` (já existem).
- Produces:
  - `type CampoComErro = Campo | 'verificacao'`
  - `type Mensagens = Record<CampoComErro, string>`
  - `interface Erro { campo: CampoComErro; mensagem: string }`
  - `errosDoFormulario(d: Record<string, string | undefined>, m: Mensagens): Erro[]` — na ordem de tela: nome, email, assunto, mensagem, consentimento, verificacao. `verificacao` entra quando `d['cf-turnstile-response']` não é um token válido.
  - `Textos.formulario.erros: Mensagens`, `.resumo: string`, `.enviando: string`, `.falhaEnvio: string`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/contato-cliente.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { errosDoFormulario, type Mensagens } from './contato-cliente.ts';

const m: Mensagens = { nome: 'N', email: 'E', assunto: 'A', mensagem: 'M', consentimento: 'C', verificacao: 'V' };
const ok = { nome: 'Ana', email: 'ana@exemplo.com', assunto: 'Visita', mensagem: 'Olá', consentimento: 'sim', 'cf-turnstile-response': 'tok' };

test('formulário completo, com token, não tem erro', () => assert.deepEqual(errosDoFormulario(ok, m), []));

test('cada erro traz a mensagem do seu campo, na ordem da tela', () =>
  assert.deepEqual(
    errosDoFormulario({ ...ok, nome: ' ', assunto: '', consentimento: undefined }, m),
    [{ campo: 'nome', mensagem: 'N' }, { campo: 'assunto', mensagem: 'A' }, { campo: 'consentimento', mensagem: 'C' }],
  ));

test('e-mail sem domínio e mensagem acima de 5.000 caracteres reprovam', () =>
  assert.deepEqual(
    errosDoFormulario({ ...ok, email: 'ana@', mensagem: 'x'.repeat(5001) }, m),
    [{ campo: 'email', mensagem: 'E' }, { campo: 'mensagem', mensagem: 'M' }],
  ));

test('sem token do Turnstile pede para aguardar a verificação, por último', () =>
  assert.deepEqual(
    errosDoFormulario({ ...ok, nome: '', 'cf-turnstile-response': '' }, m),
    [{ campo: 'nome', mensagem: 'N' }, { campo: 'verificacao', mensagem: 'V' }],
  ));
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test src/lib/contato-cliente.test.ts`
Expected: FAIL com "Cannot find module './contato-cliente.ts'".

- [ ] **Step 3: Implementar**

```ts
// src/lib/contato-cliente.ts
/**
 * Regras do formulário de contato no navegador. É a MESMA `validar` que a
 * Function usa (src/lib/contato.ts), mais a verificação antispam: o navegador
 * mostra a mensagem junto do campo, e o servidor continua sendo quem decide.
 */
import { validar, tokenValido, type Campo } from './contato.ts';

export type CampoComErro = Campo | 'verificacao';
export type Mensagens = Record<CampoComErro, string>;
export interface Erro { campo: CampoComErro; mensagem: string }

export function errosDoFormulario(d: Record<string, string | undefined>, m: Mensagens): Erro[] {
  const campos: CampoComErro[] = validar(d);
  // O widget do Turnstile só carrega na primeira interação; enviar antes de ele
  // responder posta sem token, e o servidor recusa.
  if (!tokenValido(d['cf-turnstile-response'])) campos.push('verificacao');
  return campos.map((campo) => ({ campo, mensagem: m[campo] }));
}
```

- [ ] **Step 3b: Ver passar**

Run: `node --test src/lib/contato-cliente.test.ts`
Expected: 4 testes passam.

- [ ] **Step 4: Adicionar os textos (ferramenta Edit, arquivo é CRLF)**

Em `src/i18n/textos.ts`, no tipo `Textos`, trocar o bloco `formulario`:

```ts
  formulario: {
    obrigatorios: string; nome: string; email: string; empresa: string; telefone: string;
    assunto: string; mensagem: string; consentimento: string; enviar: string;
    obrigado: string; naoEnviado: string; semJavascript: string;
    /* Mensagem de cada campo, no navegador. */
    erros: { nome: string; email: string; assunto: string; mensagem: string; consentimento: string; verificacao: string };
    resumo: string; enviando: string; falhaEnvio: string;
  };
```

E, dentro de `formulario` de cada idioma, depois de `semJavascript`, acrescentar:

`pt-br`:
```ts
      erros: {
        nome: 'Informe seu nome.',
        email: 'Informe um e-mail válido, como nome@empresa.com.br.',
        assunto: 'Informe o assunto.',
        mensagem: 'A mensagem passa de 5.000 caracteres; resuma um pouco.',
        consentimento: 'Marque a caixa para aceitar a Política de Privacidade.',
        verificacao: 'Aguarde a verificação antispam terminar e envie de novo.',
      },
      resumo: 'Corrija os campos indicados e envie de novo.',
      enviando: 'Enviando…',
      falhaEnvio: 'Não foi possível enviar agora. Sua mensagem continua no formulário: tente de novo em instantes ou use o telefone ou o e-mail no início desta página.',
```

`en`:
```ts
      erros: {
        nome: 'Enter your name.',
        email: 'Enter a valid email address, such as name@company.com.',
        assunto: 'Enter the subject.',
        mensagem: 'The message is over 5,000 characters; please shorten it.',
        consentimento: 'Tick the box to accept the Privacy Policy.',
        verificacao: 'Wait for the anti-spam check to finish and send again.',
      },
      resumo: 'Fix the fields below and send again.',
      enviando: 'Sending…',
      falhaEnvio: 'We could not send your message right now. It is still in the form: try again shortly, or use the phone or email at the top of this page.',
```

`es`:
```ts
      erros: {
        nome: 'Escriba su nombre.',
        email: 'Escriba un correo electrónico válido, como nombre@empresa.com.',
        assunto: 'Escriba el asunto.',
        mensagem: 'El mensaje supera los 5.000 caracteres; acórtelo un poco.',
        consentimento: 'Marque la casilla para aceptar la Política de Privacidad.',
        verificacao: 'Espere a que termine la verificación antispam y vuelva a enviar.',
      },
      resumo: 'Corrija los campos indicados y envíe de nuevo.',
      enviando: 'Enviando…',
      falhaEnvio: 'No fue posible enviar su mensaje ahora. Sigue en el formulario: inténtelo de nuevo en unos instantes, o use el teléfono o el correo electrónico al inicio de esta página.',
```

- [ ] **Step 5: Verificar e fazer o commit**

```bash
npm test && npm run build
git add src/lib/contato-cliente.ts src/lib/contato-cliente.test.ts src/i18n/textos.ts
git commit -m "feat: regras e mensagens do formulário de contato no navegador

errosDoFormulario reaproveita a validar do servidor e acrescenta a
verificação antispam. Mensagens de erro, resumo, \"enviando\" e falha de
envio nos três idiomas."
```

Expected: build sem erro (o tipo `Textos` exige as chaves nos três idiomas, então esquecer um idioma quebra o build).

---

### Task 3: Formulário de contato — erro junto do campo e falha sem perder o texto

**Files:**
- Modify: `src/components/Contato.astro` (marcação, estilos e um `<script>`)
- Modify: `src/styles/tokens.css` (só se não houver token de erro; ver Step 1)

**Interfaces:**
- Consumes: `errosDoFormulario(d, m): Erro[]` e `type Mensagens` de `src/lib/contato-cliente.ts`; `f.erros`, `f.resumo`, `f.enviando`, `f.falhaEnvio` de `textos` (Tarefa 2).
- Comportamento: com JS, `submit` é interceptado. Erro de regra: mensagem sob o campo, `aria-invalid`, foco no primeiro campo com erro. Falha do servidor (a resposta cai em `/contato/nao-enviado/`): mensagem numa região `role="alert"`, campos preservados, botão reabilitado, widget do Turnstile reiniciado. Sucesso: navega para `/contato/obrigado/`. Sem JS, nada muda: o POST e os 303 de hoje.

- [ ] **Step 1: Ver se já existe token de cor de erro**

Run: `grep -n "erro\|alerta\|vermelho\|--danger" src/styles/tokens.css`
- Se houver um token de erro com contraste ≥ 4,5:1 sobre branco, usar esse nome nos passos seguintes no lugar de `--erro`.
- Se não houver, acrescentar em `:root` de `src/styles/tokens.css`: `--erro: #A61B1B; /* 7,8:1 sobre branco; o âmbar do alerta do Design System (#B57A00) não passa dos 4,5:1 em texto pequeno */`.

- [ ] **Step 2: Marcação — dados e regiões**

Em `src/components/Contato.astro`:

a) Na tag `<form>` acrescentar os dados que o script lê:

```astro
      <form method="post" action="/api/contato" aria-describedby="obrigatorios"
        data-mensagens={JSON.stringify(f.erros)} data-resumo={f.resumo}
        data-enviando={f.enviando} data-falha={f.falhaEnvio}>
```

b) Logo depois de `<p id="obrigatorios">…</p>` incluir a região de estado (visível só quando há o que dizer; foco programático):

```astro
        <div id="estado" class="aviso" role="alert" tabindex="-1" hidden></div>
```

c) Em cada campo `.campo` de nome, e-mail, assunto e mensagem, colocar, logo depois do `<input>`/`<textarea>`, o parágrafo de erro (exemplo do nome; repetir com `erro-email`, `erro-assunto`, `erro-mensagem`):

```astro
        <div class="campo"><label for="nome">{f.nome} *</label><input id="nome" name="nome" required autocomplete="name" /><p class="erro" id="erro-nome" hidden></p></div>
```

d) Depois do `<div class="consentimento">…</div>` acrescentar `<p class="erro" id="erro-consentimento" hidden></p>`, e depois do `<div class="cf-turnstile" …></div>` acrescentar `<p class="erro" id="erro-verificacao" hidden></p>`.

- [ ] **Step 3: O script**

No fim de `Contato.astro`, depois do `</style>`, acrescentar (o Astro empacota `<script>` de componente como módulo do mesmo domínio; a CSP já permite `script-src 'self'`):

```astro
<script>
  import { errosDoFormulario, type Mensagens, type Erro } from '../lib/contato-cliente';

  const form = document.querySelector<HTMLFormElement>('form[data-mensagens]');
  if (form) {
    const msgs = JSON.parse(form.dataset.mensagens!) as Mensagens;
    const estado = form.querySelector<HTMLElement>('#estado')!;
    const botao = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const rotuloBotao = botao.textContent;
    // As mensagens passam a ser nossas: a caixa nativa do navegador não fala com a página.
    form.noValidate = true;

    const limpar = () => {
      form.querySelectorAll<HTMLElement>('.erro').forEach((p) => { p.textContent = ''; p.hidden = true; });
      form.querySelectorAll('[aria-invalid]').forEach((i) => { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
      estado.textContent = ''; estado.hidden = true;
    };
    const dizer = (texto: string) => { estado.textContent = texto; estado.hidden = false; estado.focus(); };

    const mostrar = (erros: Erro[]) => {
      for (const { campo, mensagem } of erros) {
        const p = form.querySelector<HTMLElement>(`#erro-${campo}`)!;
        p.textContent = mensagem; p.hidden = false;
        const entrada = form.querySelector<HTMLElement>(`#${campo}`);
        entrada?.setAttribute('aria-invalid', 'true');
        entrada?.setAttribute('aria-describedby', p.id);
      }
      // Foco no primeiro campo com erro; se o único erro é a verificação, no resumo.
      const primeiro = erros.map((e) => form.querySelector<HTMLElement>(`#${e.campo}`)).find(Boolean);
      estado.textContent = form.dataset.resumo!; estado.hidden = false;
      (primeiro ?? estado).focus();
    };

    const falhou = () => {
      botao.disabled = false; botao.textContent = rotuloBotao;
      (window as unknown as { turnstile?: { reset(): void } }).turnstile?.reset();
      dizer(form.dataset.falha!);
    };

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      limpar();
      const dados = new FormData(form);
      const d = Object.fromEntries([...dados].map(([k, v]) => [k, String(v)]));
      const erros = errosDoFormulario(d, msgs);
      if (erros.length) return mostrar(erros);

      botao.disabled = true; botao.textContent = form.dataset.enviando!;
      try {
        // A Function responde 303 para uma página estática; o fetch segue e a URL final diz o resultado.
        const r = await fetch(form.action, { method: 'POST', body: dados });
        if (r.url.endsWith('/contato/obrigado/')) return void location.assign(r.url);
      } catch { /* cai em falhou() */ }
      falhou();
    });
  }
</script>
```

- [ ] **Step 4: Estilos (dentro do `<style>` de `Contato.astro`)**

Acrescentar, e incluir `#estado, #erro-consentimento, #erro-verificacao` na lista de elementos de largura total do `@media (min-width: 768px)` (a que hoje traz `.largo, .consentimento, #obrigatorios, …`):

```css
  .erro { margin: 0; font-size: .875rem; color: var(--erro); }
  input[aria-invalid='true'], textarea[aria-invalid='true'] { border-color: var(--erro); border-width: 2px; }
  #estado { border-left-color: var(--erro); }
  #estado:focus { outline-offset: 2px; }
```

O texto da mensagem é quem diz o erro; a cor e a borda só reforçam (a cor sozinha não carrega o sentido).

- [ ] **Step 5: Build e verificações estáticas**

```bash
npm run build && node scripts/verificar-csp.mjs && node scripts/verificar-links.mjs
```

Expected: build sem erro; "aprovado" nos dois. Conferir que o `.js` empacotado existe: `ls dist/_astro | grep -i contato`.

- [ ] **Step 6: Provar no navegador (erro de regra, falha do servidor, sucesso, sem JS)**

```js
// $SCRATCH/contato.cjs
const { servir, navegador, abrir } = require('./kit.cjs');
const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const s = await servir('dist', 4302); const b = await navegador();
  const ler = (pg) => pg.evaluate(() => ({
    nome: document.querySelector('#nome').value, mensagem: document.querySelector('#mensagem').value,
    erros: [...document.querySelectorAll('.erro:not([hidden])')].map((p) => p.id + ': ' + p.textContent),
    invalidos: [...document.querySelectorAll('[aria-invalid]')].map((i) => i.id),
    foco: document.activeElement.id, estado: document.querySelector('#estado').hidden ? '' : document.querySelector('#estado').textContent,
    botao: document.querySelector('button[type=submit]').disabled,
  }));

  // 1. regras: nada preenchido → erros junto dos campos, foco no primeiro, texto preservado
  let pg = await abrir(b, 'http://localhost:4302/contato/');
  await pg.type('#mensagem', 'texto que não pode sumir');
  await pg.click('button[type=submit]'); await dorme(300);
  console.log('1 regras   ', JSON.stringify(await ler(pg)));

  // 2. servidor recusa (303 → nao-enviado): mensagem, campos preservados, botão livre
  await pg.setRequestInterception(true);
  pg.removeAllListeners('request');
  pg.on('request', (rq) => {
    if (rq.method() === 'POST' && rq.url().endsWith('/api/contato')) return rq.respond({ status: 303, headers: { location: '/contato/nao-enviado/' } });
    return /youtube|google|cloudflare/.test(rq.url()) ? rq.abort() : rq.continue();
  });
  await pg.evaluate(() => { for (const [id, v] of [['nome', 'Ana'], ['email', 'ana@exemplo.com'], ['assunto', 'Visita']]) document.querySelector('#' + id).value = v; document.querySelector('#consentimento').checked = true;
    const t = document.createElement('input'); t.type = 'hidden'; t.name = 'cf-turnstile-response'; t.value = 'tok'; document.querySelector('form').append(t); });
  await pg.click('button[type=submit]'); await dorme(500);
  console.log('2 recusado ', JSON.stringify(await ler(pg)));

  // 3. servidor aceita (303 → obrigado): vai para a página de agradecimento
  pg.removeAllListeners('request');
  pg.on('request', (rq) => {
    if (rq.method() === 'POST' && rq.url().endsWith('/api/contato')) return rq.respond({ status: 303, headers: { location: '/contato/obrigado/' } });
    return /youtube|google|cloudflare/.test(rq.url()) ? rq.abort() : rq.continue();
  });
  await pg.click('button[type=submit]'); await dorme(600);
  console.log('3 aceito   ', pg.url());
  await pg.close();

  // 4. sem JS: o formulário continua o mesmo (POST puro), campos com `required` nativo
  pg = await abrir(b, 'http://localhost:4302/contato/', { semJs: true });
  console.log('4 sem JS   ', await pg.evaluate(() => ({ noValidate: document.querySelector('form').noValidate, requeridos: document.querySelectorAll('[required]').length })));
  await b.close(); s.close();
})();
```

Run: `node $SCRATCH/contato.cjs`
Expected:
1. `erros` com `erro-nome`, `erro-email`, `erro-assunto`, `erro-consentimento`, `erro-verificacao`; `invalidos` com `nome`, `email`, `assunto`, `consentimento`; `foco: "nome"`; `mensagem: "texto que não pode sumir"`.
2. `estado` igual a `falhaEnvio` em português, `nome: "Ana"`, `mensagem` preservada, `botao: false`.
3. URL termina em `/contato/obrigado/`.
4. `noValidate: false`, `requeridos: 4`.

- [ ] **Step 7: Rodar o axe na página do formulário com erros à mostra**

```js
// $SCRATCH/axe-contato.cjs
const { servir, navegador, abrir } = require('./kit.cjs');
const axeSrc = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
(async () => {
  const s = await servir('dist', 4303); const b = await navegador();
  const pg = await abrir(b, 'http://localhost:4303/contato/');
  await pg.click('button[type=submit]'); await new Promise((r) => setTimeout(r, 300));
  await pg.evaluate(axeSrc);
  const v = await pg.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] })).violations.map((x) => x.id + ' ×' + x.nodes.length));
  console.log('violações do axe com os erros à mostra:', v);
  await b.close(); s.close();
})();
```

Run: `node $SCRATCH/axe-contato.cjs`
Expected: `[]`. Se `color-contrast` reprovar no `.erro`, escurecer `--erro`.

- [ ] **Step 8: Commit**

```bash
npm test
git add src/components/Contato.astro src/styles/tokens.css
git commit -m "feat: formulário de contato mostra o erro junto do campo e não perde o texto

Com JavaScript o envio passa por fetch: erro de regra aparece sob o
campo, com aria-invalid e foco no primeiro; falha do servidor mantém
tudo o que foi digitado, reinicia o Turnstile e diz o que fazer. Sem
JavaScript nada muda (WCAG 3.3.1 e 3.3.3)."
git push -u origin feat/contato-erros-no-cliente
```

Abrir o PR (corpo em português, sem rodapé de atribuição), esperar o CI e avisar o número. `git add src/styles/tokens.css` só se o Step 1 tiver criado o token.

---

### Task 4: Cabeçalho e rodapé — alvo de toque de 44 px e piso de texto

**Contexto medido (auditoria de 21/09).** O "voltar ao topo" tem 23 × 23 px (o AA da WCAG 2.5.8 pede 24; a boa prática de toque, 44). Texto abaixo de 12 px em todas as páginas: 10 px no seletor de idioma e em "Relações com Investidores", 11 px no rodapé, 8 px no rótulo "Menu" do celular. Decisão 1 da D20: subir sem mexer no desenho.

**Files:**
- Modify: `src/components/Rodape.astro`
- Modify: `src/components/Cabecalho.astro`

**Interfaces:** nenhuma; só CSS.

- [ ] **Step 1: Medir o "antes" (guarda a régua da tarefa)**

```js
// $SCRATCH/antes-depois.cjs — roda em dist/ e imprime alturas e menores fontes
const { servir, navegador, abrir } = require('./kit.cjs');
(async () => {
  const s = await servir('dist', 4304); const b = await navegador();
  for (const w of [390, 1280]) {
    const pg = await abrir(b, 'http://localhost:4304/', { w });
    console.log(w, JSON.stringify(await pg.evaluate(() => {
      const h = (sel) => Math.round(document.querySelector(sel)?.getBoundingClientRect().height ?? -1);
      const topo = document.querySelector('.topo').getBoundingClientRect();
      const menores = {}; const it = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
      while ((n = it.nextNode())) { if (!n.textContent.trim()) continue; const e = n.parentElement; if (e.closest('.sr-only,noscript') || !e.getBoundingClientRect().width) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 12) menores[fs + 'px ' + (e.closest('header,footer')?.tagName || '')] = 1; }
      return { header: h('header'), footer: h('footer'), topo: [Math.round(topo.width), Math.round(topo.height)], menores: Object.keys(menores) };
    })));
    await pg.close();
  }
  await b.close(); s.close();
})();
```

Run: `npm run build && node $SCRATCH/antes-depois.cjs`
Expected (antes): `topo: [23,23]`; `menores` com `10px HEADER`, `11px FOOTER` e, a 390 px, `8px HEADER`. Anotar `header` e `footer` de cada largura.

- [ ] **Step 2: Rodapé — `.topo` de 44 px com o mesmo círculo de 23 px**

Em `src/components/Rodape.astro`, trocar a regra `.topo` por:

```css
  /* O círculo continua com 23 px; a área de toque é de 44 px (WCAG 2.5.8 pede 24,
     e 44 é o tamanho de um dedo). As margens negativas devolvem os 21 px que a
     área a mais tomaria, para o rodapé não crescer. */
  .topo {
    position: relative; display: inline-grid; place-items: center; width: 44px; height: 44px;
    margin-block: -10px -11px;
    color: var(--rodape-texto); text-decoration: none; line-height: 1;
  }
  .topo::before {
    content: ''; position: absolute; inset: 0; margin: auto; width: 23px; height: 23px;
    box-sizing: border-box; border: 2px solid var(--rodape-texto); border-radius: 50%;
  }
```

E na regra `ul`, trocar `font-size: 11px` por `font-size: 12px`.

- [ ] **Step 3: Cabeçalho — piso de texto**

Em `src/components/Cabecalho.astro`:
- linha 79: `.barra a { … font-size: 10px; … }` → `font-size: 12px`.
- linha 115: `.alternar { … font-size: 8px; line-height: 11px; … }` → `font-size: 11px; line-height: 14px`. É o rótulo de um ícone, e 11 px é o piso aceito para ele: acima disso o botão de 44 px de altura não comporta o ícone e o texto.

- [ ] **Step 4: Medir o "depois" e comparar**

Run: `npm run build && node $SCRATCH/antes-depois.cjs`
Expected: `topo: [44,44]`; `menores` só com `11px HEADER` a 390 px e vazio a 1280 px; `header` e `footer` **iguais** ao "antes" com tolerância de 1 px. Se o cabeçalho a 390 px crescer, reduzir `.alternar` para `font-size: 11px; line-height: 12px`; se a barra crescer a 1280 px, reduzir só o `padding` vertical dela até igualar a altura.

- [ ] **Step 5: Axe e captura para olho humano**

```bash
node scripts/verificar-csp.mjs && npm test
```

Em seguida, tirar captura da home a 390 e 1280 px (`pg.screenshot`) e olhar o cabeçalho e o rodapé antes e depois: a diferença aceitável é só o texto um pouco maior. Se o seletor de idioma quebrar de linha, ajustar o espaçamento, não a fonte.

- [ ] **Step 6: Registrar (D21) e commit**

Em `docs/decisoes.md`, na tabela, depois da última linha `| D…`, acrescentar (a D20 é da auditoria, que chega com o PR #104):

```
| D21 | Piso de texto do cabeçalho e do rodapé | 12 px (11 px no rótulo "Menu"); alvo de toque de 44 px no "voltar ao topo" | Auditoria de 21/09/2026 (D20): 10 px no seletor de idioma e em "Relações com Investidores", 11 px no rodapé, 8 px no "Menu" do celular, e um círculo de 23 px. Mudança de 1–4 px nos textos, sem mexer em cor, peso, espaçamento nem altura do cabeçalho e do rodapé (medidos antes e depois) |
```

```bash
git add src/components/Rodape.astro src/components/Cabecalho.astro docs/decisoes.md
git commit -m "fix: piso de 12 px no texto do cabeçalho e do rodapé, e alvo de 44 px no voltar ao topo

Antes: 10 px no seletor de idioma e em Relações com Investidores, 11 px
no rodapé, 8 px no Menu do celular, e um círculo de 23 px. Alturas do
cabeçalho e do rodapé medidas antes e depois, sem diferença."
git push -u origin fix/alvos-e-texto-minimo
```

---

### Task 5: Páginas-casca fora do índice

**Contexto medido.** 33 páginas (13 em PT, 10 em EN, 10 em ES) são cascas de anexo do WordPress: um `<video>` ou um link de PDF com menos de 10 palavras, e o **nome do arquivo** como título ("Aqualuz_baixa2", "MUNDOTECA-2019_baixa", "Politica_de_Seguranca_do_Trabalho_…"). Hoje são `index, follow` e estão no sitemap. Os endereços continuam respondendo 200 (regra de continuidade, #47); só deixam de ser oferecidos ao Google. As páginas de conteúdo curto de verdade (`/compliance/`, 16–17 palavras) ficam de fora pela regra.

**Files:**
- Create: `src/lib/casca.mjs`
- Test: `src/lib/casca.test.ts`
- Modify: `src/pages/[...rota].astro` (passa `noindex` ao `Base`)
- Modify: `astro.config.mjs` (filtro do sitemap)
- Modify: `lighthouserc.json` (troca uma URL de amostra)
- Modify: `docs/decisoes.md` (D22)

**Interfaces:**
- Produces: `ehCasca(r: { tipo: string; palavras: number }): boolean` em `src/lib/casca.mjs` (JS puro: importável pelo `astro.config.mjs` e pelos testes) e `TIPOS_CASCA: Set<string>`.
- Consumes: `noindex?: boolean` de `src/layouts/Base.astro` (já existe; quando `true` emite `<meta name="robots" content="noindex">` e remove o canonical).

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/casca.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import mapa from '../../acervo/mapa-de-rotas.json' with { type: 'json' };
import { ehCasca } from './casca.mjs';

test('anexo de vídeo ou PDF com poucas palavras é casca', () => {
  assert.equal(ehCasca({ tipo: 'faq', palavras: 1 }), true);
  assert.equal(ehCasca({ tipo: 'pagina', palavras: 1 }), true);
  assert.equal(ehCasca({ tipo: 'video', palavras: 1 }), true);
});

test('página curta de verdade não é casca: Compliance tem 17 palavras', () =>
  assert.equal(ehCasca({ tipo: 'pagina', palavras: 17 }), false));

test('outros tipos nunca são casca, mesmo curtos', () => {
  assert.equal(ehCasca({ tipo: 'noticia', palavras: 3 }), false);
  assert.equal(ehCasca({ tipo: 'politica-de-privacidade', palavras: 3 }), false);
});

test('no acervo real são 33 cascas, nenhuma de página institucional', () => {
  const cascas = mapa.rotas.filter(ehCasca).map((r) => r.rota);
  assert.equal(cascas.length, 33);
  for (const r of cascas) assert.doesNotMatch(r, /compliance|contato|sustentabilidade\/$|a-companhia|empresas\/$/, r);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test src/lib/casca.test.ts`
Expected: FAIL com "Cannot find module './casca.mjs'".

- [ ] **Step 3: Implementar**

```js
// src/lib/casca.mjs
/**
 * Página-casca: anexo do WordPress (um vídeo ou um PDF) que virou página só
 * para o endereço antigo continuar respondendo. O título é o nome do arquivo e
 * o corpo tem menos de 10 palavras. O endereço fica vivo, mas fora do índice:
 * nem `noindex`-ada precisa aparecer no sitemap.
 *
 * `.mjs` e sem dependência de propósito: o `astro.config.mjs` importa este
 * arquivo para montar o filtro do sitemap, e os testes o importam também.
 */
export const TIPOS_CASCA = new Set(['faq', 'pagina', 'video']);

export const ehCasca = (r) => TIPOS_CASCA.has(r.tipo) && r.palavras < 10;
```

- [ ] **Step 3b: Ver passar**

Run: `node --test src/lib/casca.test.ts`
Expected: 4 testes passam.

- [ ] **Step 4: Ligar no build (ferramenta Edit; os arquivos são CRLF)**

Em `src/pages/[...rota].astro`, na importação e no `<Base>`:

```astro
import { ehCasca } from '../lib/casca.mjs';
```

```astro
<Base titulo={`${item.titulo} — Alupar`} descricao={t.descricao} idioma={idioma} noindex={ehCasca(item)}>
```

Em `astro.config.mjs`, no topo, e trocar a linha do `sitemap`:

```js
import { readFileSync } from 'node:fs';
import { ehCasca } from './src/lib/casca.mjs';

// Páginas-casca (anexos do WordPress) respondem 200, mas não entram no sitemap.
const cascas = new Set(
  JSON.parse(readFileSync('./acervo/mapa-de-rotas.json', 'utf8')).rotas.filter(ehCasca).map((r) => r.rota),
);
```

```js
  // As páginas de aviso do formulário (obrigado / não enviado) e as páginas-casca não entram no sitemap.
  integrations: [sitemap({
    filter: (pagina) => !/\/contato\/(obrigado|nao-enviado)\/$/.test(pagina) && !cascas.has(new URL(pagina).pathname),
  })],
```

Em `lighthouserc.json`, o SEO mínimo do Lighthouse é 0,9 e a auditoria `is-crawlable` reprova página `noindex`: trocar a URL `http://localhost/video/video-institucional/alupar-institucional-2017_edit/index.html` por `http://localhost/a-companhia/index.html`.

- [ ] **Step 5: Verificar o resultado no build**

```bash
npm run build
node -e "
const fs=require('fs');
const sm=fs.readFileSync('dist/sitemap-0.xml','utf8');
const n=(sm.match(/<loc>/g)||[]).length;
console.log('URLs no sitemap:',n,'(era 169; esperado 136)');
console.log('casca no sitemap:',/aqualuz_baixa2|mundoteca|politica_de_recursos/.test(sm));
const h=fs.readFileSync('dist/aqualuz_baixa2/index.html','utf8');
console.log('noindex na casca:',/name=\"robots\" content=\"noindex\"/.test(h),'| canonical:',/rel=\"canonical\"/.test(h));
const c=fs.readFileSync('dist/compliance/index.html','utf8');
console.log('compliance segue indexável:',/index, follow/.test(c));"
```

Expected: `136`, `false`, `true | false`, `true`. Depois: `npm test` e os cinco `verificar-*` do Global Constraints.

- [ ] **Step 6: Registrar (D22) e commit**

Em `docs/decisoes.md`, depois da D21:

```
| D22 | Páginas-casca fora do índice | 33 páginas de anexo (vídeo ou PDF, menos de 10 palavras) ficam vivas, com `noindex` e fora do sitemap | Auditoria de 21/09/2026 (D20): o título delas é o nome do arquivo ("Aqualuz_baixa2") e estavam indexáveis. O endereço continua respondendo 200 (continuidade, #47); só sai do índice. A regra é `ehCasca` em `src/lib/casca.mjs`. As 22 páginas `faq`/`group` sem link de entrada NÃO entram: repetem conteúdo, mas podem ter tráfego e o histórico de acessos não existe (P4); a decisão espera 30 dias de Web Analytics depois da virada |
```

```bash
git add src/lib/casca.mjs src/lib/casca.test.ts "src/pages/[...rota].astro" astro.config.mjs lighthouserc.json docs/decisoes.md
git commit -m "feat: páginas-casca de anexo saem do índice e do sitemap

33 páginas de vídeo ou PDF com menos de 10 palavras tinham o nome do
arquivo como título e estavam indexáveis. O endereço continua vivo;
ganham noindex e saem do sitemap. Registro na D22."
git push -u origin feat/cascas-fora-do-indice
```

---

### Task 6: `/videos/` com o vídeo de 2026 e sem título repetido

**Contexto medido.** A home mostra o vídeo de 2026 (YouTube `oqjwsKfpYZ4`) e o botão "Veja mais vídeos" leva a `/videos/`, que lista só os arquivos de 2017, dois deles com o mesmo título ("ALUPAR INSTITUCIONAL 2017_edit"). Decisão 3 da D20, com o padrão que já existe: capa local, e o player do YouTube só no clique (`a[data-video]` em `public/js/site.js`); sem JS, o link leva ao YouTube.

**Files:**
- Create: `src/lib/videos.ts`
- Test: `src/lib/videos.test.ts`
- Modify: `src/components/ListaVideos.astro`
- Modify: `src/i18n/textos.ts` (chave `videosAnteriores`)

**Interfaces:**
- Produces: `semTituloRepetido<T extends { titulo: string }>(lista: T[]): T[]` em `src/lib/videos.ts` — mantém a ordem e a primeira ocorrência; compara o título sem espaço nas pontas e sem diferença de caixa.
- Consumes: `textos.videoInstitucional`, `textos.assistirVideo` (já existem); `Textos.videosAnteriores: string` (nova); o `<a data-video data-titulo>` tratado por `public/js/site.js` (troca o link por um `<iframe class="video">` no clique).

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/videos.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { semTituloRepetido } from './videos.ts';

test('mantém a ordem e a primeira ocorrência de cada título', () =>
  assert.deepEqual(
    semTituloRepetido([
      { titulo: 'ALUPAR INSTITUCIONAL 2017_edit', rota: '/a/' },
      { titulo: 'institucional', rota: '/b/' },
      { titulo: 'ALUPAR INSTITUCIONAL 2017_edit', rota: '/c/' },
    ]),
    [{ titulo: 'ALUPAR INSTITUCIONAL 2017_edit', rota: '/a/' }, { titulo: 'institucional', rota: '/b/' }],
  ));

test('espaço nas pontas e caixa não criam título novo', () =>
  assert.equal(semTituloRepetido([{ titulo: 'Vídeo' }, { titulo: ' vídeo ' }]).length, 1));

test('lista vazia passa', () => assert.deepEqual(semTituloRepetido([]), []));
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test src/lib/videos.test.ts`
Expected: FAIL com "Cannot find module './videos.ts'".

- [ ] **Step 3: Implementar**

```ts
// src/lib/videos.ts
/**
 * A listagem de vídeos sai dos itens do acervo, e o acervo traz o mesmo vídeo
 * em dois endereços (`…2017_edit` e `…2017_edit-3`, cada um com o título do
 * arquivo). Na lista basta um. Os dois endereços continuam existindo.
 */
export function semTituloRepetido<T extends { titulo: string }>(lista: T[]): T[] {
  const vistos = new Set<string>();
  return lista.filter((v) => {
    const chave = v.titulo.trim().toLowerCase();
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}
```

- [ ] **Step 3b: Ver passar**

Run: `node --test src/lib/videos.test.ts`
Expected: 3 testes passam.

- [ ] **Step 4: Texto novo nos três idiomas (ferramenta Edit)**

Em `src/i18n/textos.ts`, no tipo `Textos`, depois de `videos: string;`, acrescentar `videosAnteriores: string;`. Em cada idioma, depois da linha `videos: '…'`, acrescentar:

- `pt-br`: `videosAnteriores: 'Vídeos anteriores',`
- `en`: `videosAnteriores: 'Previous videos',`
- `es`: `videosAnteriores: 'Vídeos anteriores',`

- [ ] **Step 5: A lista**

Em `src/components/ListaVideos.astro`, substituir o frontmatter e o `<main>` por:

```astro
---
/**
 * `/videos/` responde 200 no site atual e é o destino do "Veja mais vídeos"
 * da home — sem esta página, viraria 404 na virada (regra 3).
 *
 * O vídeo institucional de 2026 abre a lista: é o mesmo da home, com o mesmo
 * cuidado (capa local; o player do YouTube só no clique, por
 * public/js/site.js; sem JS, o link leva ao YouTube). Depois vêm os arquivos
 * de 2017, sem título repetido.
 */
import { Picture } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Trilha from './Trilha.astro';
import capa from '../assets/video-institucional.jpg';
import { itens } from '../lib/acervo';
import { semTituloRepetido } from '../lib/videos';
import { textos, CODIGO, type Idioma } from '../i18n/textos';

interface Props { idioma: Idioma }
const { idioma } = Astro.props;
const t = textos[idioma];
const VIDEO = 'oqjwsKfpYZ4';
const videos = semTituloRepetido(itens().filter((i) => i.tipo === 'video' && i.idioma === CODIGO[idioma]));
---
<Base titulo={`${t.videos} — Alupar`} descricao={t.descricao} idioma={idioma}>
  <main id="conteudo" class="container pagina">
    <div class="caixa">
      <Trilha idioma={idioma} titulo={t.videos} />
      <h1>{t.videos}</h1>
      <a class="destaque" href={`https://www.youtube.com/watch?v=${VIDEO}`} data-video={VIDEO} data-titulo={t.videoInstitucional}>
        <Picture src={capa} alt={t.assistirVideo} formats={['avif', 'webp']} widths={[480, 720]} sizes="(max-width: 767px) 100vw, 720px" quality={60} loading="eager" />
      </a>
      {videos.length > 0 && (
        <>
          <h2>{t.videosAnteriores}</h2>
          <ul class="lista">{videos.map((v) => <li><a href={v.rota}>{v.titulo}</a></li>)}</ul>
        </>
      )}
    </div>
  </main>
</Base>
```

E acrescentar ao `<style>`:

```css
  /* Capa do vídeo de 2026: 16:9, com o triângulo de reproduzir por cima. O
     iframe que o site.js põe no lugar no clique tem a mesma proporção. */
  .destaque { position: relative; display: block; max-width: 720px; margin-bottom: var(--e5); }
  .destaque :global(img) { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; }
  .destaque::after {
    content: '▶' / ''; position: absolute; inset: 0; display: grid; place-items: center;
    font-size: 3rem; color: var(--branco); text-shadow: 0 0 12px rgba(0, 0, 0, .6);
  }
  .caixa :global(iframe.video) { display: block; width: 100%; max-width: 720px; aspect-ratio: 16 / 9; height: auto; border: 0; margin-bottom: var(--e5); }
  h2 { margin: 0 0 var(--e3); font-size: 1.5rem; font-weight: 400; color: var(--azul); }
```

- [ ] **Step 6: Build e verificação no navegador**

```bash
npm test && npm run build
```

```js
// $SCRATCH/videos.cjs
const { servir, navegador, abrir } = require('./kit.cjs');
const axeSrc = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
(async () => {
  const s = await servir('dist', 4305); const b = await navegador();
  for (const [rota, w] of [['/videos/', 1280], ['/videos/', 390], ['/en/videos/', 1280], ['/es/videos/', 1280]]) {
    const pg = await abrir(b, 'http://localhost:4305' + rota, { w });
    const antes = await pg.evaluate(() => ({ h2: document.querySelector('h2')?.textContent, itens: [...document.querySelectorAll('.lista li')].map((l) => l.textContent), href: document.querySelector('a.destaque').href, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    await pg.click('a.destaque'); await new Promise((r) => setTimeout(r, 300));
    const depois = await pg.evaluate(() => { const f = document.querySelector('iframe.video'); return { src: f?.src.split('?')[0], titulo: f?.title }; });
    await pg.evaluate(axeSrc);
    const ax = await pg.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] })).violations.map((x) => x.id));
    console.log(rota, w, JSON.stringify({ ...antes, ...depois, axe: ax }));
    await pg.close();
  }
  await b.close(); s.close();
})();
```

Run: `node $SCRATCH/videos.cjs`
Expected em cada linha: `h2` = "Vídeos anteriores" / "Previous videos"; `itens` com "ALUPAR INSTITUCIONAL 2017_edit" **uma vez** e "institucional"; `href` do YouTube; `overflow: 0`; depois do clique, `src` = `https://www.youtube-nocookie.com/embed/oqjwsKfpYZ4` e `titulo` = "Vídeo institucional" (EN "Institutional video"; ES "Video institucional"); `axe: []`.

Depois: os cinco `verificar-*` e `node scripts/verificar-csp.mjs`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/videos.ts src/lib/videos.test.ts src/components/ListaVideos.astro src/i18n/textos.ts
git commit -m "feat: /videos/ abre com o vídeo institucional de 2026 e sem título repetido

A home mostra o de 2026 e o \"Veja mais vídeos\" levava a uma lista só
de arquivos de 2017, dois com o mesmo título. O de 2026 abre a lista
com o mesmo cuidado da home (capa local, player só no clique, link para o
YouTube sem JS); os de 2017 ficam em Vídeos anteriores, sem repetição."
git push -u origin feat/videos-2026
```

---

### Task 7: Perfil de celular no CI

**Contexto medido.** O CI só roda Lighthouse com preset desktop (`lighthouserc.json`). O CLS de 0,375 registrado na crítica era de celular e ninguém o via. Medido em 21/09/2026: Lighthouse celular local dá 100 na home (CLS 0,015, LCP 1,7 s) e 98 em Empresas (CLS 0, LCP 2,3 s). Este gate segura essa medida. É gate novo, então nasce com folga declarada (regra 5 trata de não afrouxar os existentes).

**Files:**
- Create: `lighthouserc.mobile.json`
- Modify: `.github/workflows/ci.yml` (job `qualidade`, depois do passo "Lighthouse — publicar relatório")

**Interfaces:** nenhuma.

- [ ] **Step 1: Criar a configuração de celular**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 2,
      "url": [
        "http://localhost/index.html",
        "http://localhost/en/index.html",
        "http://localhost/empresas/index.html",
        "http://localhost/contato/index.html",
        "http://localhost/a-companhia/index.html",
        "http://localhost/area-de-atuacao/index.html"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 4000 }],
        "total-byte-weight": ["error", { "maxNumericValue": 3145728 }],
        "color-contrast": "error",
        "image-alt": "error",
        "label": "error",
        "html-has-lang": "error",
        "meta-description": "error"
      }
    }
  }
}
```

Sem `settings.preset`: o padrão do Lighthouse é celular (rede 4G lenta simulada e CPU 4× mais lenta). Folga declarada: desempenho ≥ 0,85 contra 98–100 medidos; LCP ≤ 4 s (o limite de "precisa melhorar" do Web Vitals) contra 1,7–2,3 s medidos. CLS e peso usam os mesmos tetos do desktop.

- [ ] **Step 2: Rodar localmente**

```bash
npm run build
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx --yes @lhci/cli@0.14.x collect --config=lighthouserc.mobile.json
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx --yes @lhci/cli@0.14.x assert --config=lighthouserc.mobile.json
```

Expected: `collect` faz 12 execuções (6 URLs × 2); `assert` termina sem asserção reprovada. Se a home passar do teto de peso, olhar `total-byte-weight` no relatório de `.lighthouseci/`: com o teto de 3 MB da D18 e o vídeo parando no fim (Tarefa 1) a home fica em ~2,4 MB. Depois: `rm -rf .lighthouseci` (é da máquina, não do repositório).

- [ ] **Step 3: Ligar no workflow**

Em `.github/workflows/ci.yml`, no job `qualidade`, **depois** do passo `Lighthouse — publicar relatório` e antes do passo seguinte (o verificador de links), acrescentar:

```yaml
      # Perfil de celular. Roda depois de todo o desktop (colher, guardar,
      # asserir, publicar) e num diretório limpo: `assert` lê tudo o que há em
      # .lighthouseci/, e misturar os relatórios de desktop com o teto de
      # celular reprovaria as duas metades pelo motivo errado.
      - name: Lighthouse celular — colher (6 URLs, 2 execuções)
        run: |
          rm -rf .lighthouseci
          npx --yes @lhci/cli@0.14.x collect --config=lighthouserc.mobile.json

      - name: Guardar relatórios do Lighthouse de celular
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-celular
          path: .lighthouseci/
          retention-days: 5

      - name: Lighthouse celular — asserções (CLS, LCP, peso, acessibilidade)
        run: npx --yes @lhci/cli@0.14.x assert --config=lighthouserc.mobile.json
```

- [ ] **Step 4: Commit e PR**

```bash
git add lighthouserc.mobile.json .github/workflows/ci.yml
git commit -m "ci: Lighthouse em perfil de celular

O CI só rodava o preset desktop, e o CLS de 0,375 da crítica era de
celular. Seis páginas em duas execuções, com teto de CLS de 0,1, LCP de
4 s, peso de 3 MB e acessibilidade 1. Medido localmente: 98 a 100 de
desempenho, CLS de 0 a 0,015."
git push -u origin ci/perfil-celular
```

Abrir o PR e **esperar o CI inteiro**: é a única forma de saber se a folga de 0,85 e de 4 s aguenta o runner do GitHub. Se o passo de celular reprovar por variação do runner (e não por regressão), a correção é aumentar `numberOfRuns` para 3, nunca subir o teto além do declarado.

---

### Task 8: O pedido de material à Alupar

**Contexto.** Vários itens só a Alupar entrega: arquivos, validações e confirmações. Estão espalhados por PRs e por esta conversa. Reunir num documento único, para a Fabiana Carneiro Pinho (dona do conteúdo, D17), evita pedir aos pedaços.

**Files:**
- Create: `docs/pedido-a-alupar-2026-09-21.md`

**Interfaces:** nenhuma.

- [ ] **Step 1: Gravar o documento**

Texto integral (português do Brasil, escrito para quem não conhece o código; sem menção a ferramentas, sem termos de desenvolvimento; "ness." com ponto e em minúscula; sem nenhuma linha de atribuição):

```markdown
# Pedido de material e validações — site institucional

**Para:** Fabiana Carneiro Pinho (Comunicação)
**Data:** 21/09/2026

Fabiana, o site novo já está no ar para conferência em
https://sitealupar.pages.dev/ . Separamos aqui o que só a Alupar pode nos
entregar ou confirmar. Está por ordem de importância para a virada.

## 1. Para validar (a Comunicação lê e diz "ok" ou corrige)

Os textos em inglês e em espanhol da **Área de atuação**, de **A Companhia** e
da faixa de números da página inicial foram traduzidos pela ness. a partir do
texto em português que vocês enviaram. Precisam da leitura de quem conhece a
terminologia da Alupar.

- Área de atuação: https://sitealupar.pages.dev/en/area-de-atuacao/ e https://sitealupar.pages.dev/es/area-de-atuacao/
- A Companhia: https://sitealupar.pages.dev/en/a-companhia/ e https://sitealupar.pages.dev/es/a-companhia/
- A legenda do mapa (UHE, PCH, EOL, UFV, LT, SE) também foi traduzida.

## 2. Arquivos que faltam

1. **Missão, Visão e Valores em espanhol.** Em português e em inglês a página usa
   a imagem com os sete valores e as frases ("Planejamento: se quer cortar a
   árvore em 5 min, gaste 30 afiando o machado"). Em espanhol não existe a
   imagem, então hoje a página traz o mesmo conteúdo em texto. Se a Alupar tiver
   a arte em espanhol (`MISSAO-VALORES_SITE_ES`), trocamos.
2. **Mapa de ativos em inglês e em espanhol.** O arquivo que recebemos tem os
   nomes dos países em português (COLÔMBIA, PERU, CHILE) desenhados na imagem. A
   legenda já está traduzida no site; só os nomes dentro da imagem ficam em
   português nas versões em inglês e em espanhol.
3. **Arquivo original do vídeo institucional de 2026** (o que está no YouTube
   como "Institucional Alupar 2026", 2 min 33 s), em MP4. Hoje ele toca a partir
   do YouTube, o que carrega cerca de 2 MB a cada visita e depende do YouTube
   estar liberado na rede de quem acessa. Com o arquivo, hospedamos no domínio
   da Alupar. Pode ser pela produtora, ou pelo YouTube Studio (Conteúdo →
   vídeo → ⋮ → Baixar).

## 3. Para confirmar

1. **Capacidade instalada.** O texto diz "quase 800 MW" e a faixa da página
   inicial mostra "~800". O número anterior do site era 798,5 MW. Se a Alupar
   tem o número exato de hoje, colocamos.
2. **Assessoria de imprensa.** A página de Contato ainda traz a Original 123
   Comunicações (Rafael Kimati). Continua valendo?
3. **Lista de Vídeos.** A página passa a abrir com o vídeo de 2026 e mantém os
   de 2017, agora sem a repetição do mesmo título. Os dois arquivos de 2017 têm
   nomes técnicos ("ALUPAR INSTITUCIONAL 2017_edit" e "institucional"). Se
   quiserem títulos e datas de verdade, mande e trocamos.
4. **Números do texto de Área de atuação:** 45 sistemas, mais de 10 mil km, 16
   empreendimentos (4 UHEs, 4 PCHs, 7 eólicas, 1 solar). Qual a data de
   referência? Colocamos "posição em [data]" para não envelhecer sem aviso.

## 4. Conteúdo com problema de acessibilidade (só a Comunicação resolve)

Na varredura do site migrado encontramos:

- **25 tabelas sem linha de cabeçalho.** Quem usa leitor de tela ouve os
  números sem saber de que coluna são.
- **5 links sem texto,** em 2 páginas.

Mandamos a lista por página, com o texto sugerido para cada caso, quando vocês
disserem que querem tratar.

## 5. Para a Alupar decidir (não é urgente)

- Depois da virada, com 30 dias de acesso medido, propomos rever as páginas do
  site antigo que ninguém acessa e que repetem conteúdo de Empresas e de
  Sustentabilidade (hoje continuam no ar, para os endereços antigos não
  quebrarem).

Qualquer dúvida, é só responder por aqui.
```

O item 3.4 só entra se a Alupar aceitar a mudança de texto ("posição em [data]"); é uma pergunta, não uma alteração já feita.

- [ ] **Step 2: Revisar contra o código antes de commitar**

Conferir cada afirmação numérica contra a fonte: `grep -n "45 sistemas\|quase 800" acervo/revisado/pt/area-de-atuacao.html` e `grep -n "'~800'" src/components/Home.astro`; `docs/decisoes.md` (D17: dona do conteúdo; D19: números). Se algum link do documento não abrir (`curl -s -o /dev/null -w "%{http_code}" <url>` deve dar 200), corrigir o endereço.

- [ ] **Step 3: Commit**

```bash
git add docs/pedido-a-alupar-2026-09-21.md
git commit -m "docs: pedido de material e validações à Alupar

Reúne o que só a Alupar entrega ou confirma: validação das traduções,
imagem de valores e mapas em outros idiomas, arquivo do vídeo de 2026 e
confirmações de números e contato."
git push -u origin docs/pedido-a-alupar
```

---

## Depois da virada (não executável hoje)

Duas frentes dependem de fatos que ainda não existem. Não têm passos aqui de propósito: cada uma pede um plano novo, escrito com os dados na mão.

1. **Medição (PR #61, rascunho).** Na véspera da virada: tirar de rascunho (`gh pr ready 61`), esperar o CI, aprovar o merge, conferir o beacon no ar. Um dia depois: primeira leitura do Web Analytics. O plano detalhado está em `docs/superpowers/plans/2026-09-21-medicao-antes-da-virada.md` (branch local `docs/plano-medicao`, ainda não enviada: `git push -u origin docs/plano-medicao` quando quiser). Se a Alupar abrir conta própria na Cloudflare, o token do beacon troca.
2. **Páginas `faq` e `group` sem link de entrada (decisão 4 da D20).** Passados 30 dias de Web Analytics, exportar as visitas por caminho (painel do Web Analytics → Páginas). Regra proposta: caminho com zero visita em 30 dias entra na mesma família da Tarefa 5 (`noindex` e fora do sitemap, endereço vivo); caminho com visita fica como está. A lista das 72 páginas sem link de entrada (22 em PT, mais EN e ES) sai do mesmo cálculo que a auditoria usou: para cada `index.html` de `dist/`, coletar os `href` internos e listar as rotas que nenhuma outra página cita.

## Decisões que continuam suas (fora do plano)

- Fazer o merge de #102, #103, #104 e #101, nessa ordem, e o de cada PR das tarefas 1 a 8.
- Compromisso de "autonomia de publicação" em `apresentacao/proposta.html` contra a D11 (não existe CMS).
- "NESS PROCESSOS E TECNOLOGIA LTDA." em caixa alta na proposta, contra a regra de marca da ness.
- Titularidade das contas: Pages, R2 e a zona estão na conta da NESS.
- `.impeccable/config.json`: hoje fora do git; decidir se entra (guarda os falsos positivos do detector, com o motivo de cada um) ou se fica local.
- Ressincronizar o Design System da Alupar no Claude Design (o `readme.md` e os tokens locais foram corrigidos em 21/09/2026; a cópia no serviço ainda é a antiga).
- Teste de ponta a ponta do formulário em produção: enviar uma mensagem real e ver se cai em `comunicacao@alupar.com.br` fora do spam (remetente igual ao destinatário, por serviço externo, pode ser tratado como falsificação).

## Fora do plano, por regra

- **Nomes de empresa em Empresas como títulos (h3):** a página tem 42 `<strong>` e nenhum h3, mas promover a título muda a aparência (verde, 26 px). Passa da linha da D2; só entra se a Alupar pedir.
- **11 cores fixas fora dos tokens em 5 arquivos:** não é problema visível ao visitante; a D2 não deixa entrar melhoria sem problema medido.
- **Largura do texto no desktop (~109 caracteres por linha):** vem do tema; decidido em 21/09/2026 deixar como está.
