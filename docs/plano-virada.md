# Plano de virada — o institucional no ar em três semanas

**Objetivo:** pôr `www.alupar.com.br` no ar pelo Cloudflare Pages em ~3 semanas,
com o acervo que já está no repositório, sem esperar pelo CMS.

**Arquitetura:** a implantação entrega o site estático gerado do acervo
(`acervo/conteudo-pronto.jsonl` → 378 páginas, PR #49). Mídia leve (imagens)
vai otimizada para `public/midia/`; mídia pesada (MP4, PDF) vai para um bucket
R2 servido em `arquivos.alupar.com.br`. O Sanity sai do caminho crítico: a
autonomia de publicação da Comunicação é critério do **tempo de manutenção**,
não da implantação (decidido em 10/09/2026), e entra como primeira entrega da
mensalidade.

**Stack:** Astro 5.18 estático · sharp 0.33 · parse5 · Cloudflare Pages, Pages
Functions, R2, Turnstile · GitHub Actions · testes com `node --test` (Node 22,
que roda `.ts` sem compilador).

**Base:** D15 em [`decisoes.md`](decisoes.md) — a cobrança começa na virada,
então cada semana antes dela é custo sem receita e a Alupar segue pagando a MZ.

## Restrições globais

Valem para toda tarefa. Copiadas de [`AGENTS.md`](../AGENTS.md):

- Linguagem visual imutável; composição muda só com problema medido (`restauro-fiel`)
- Nada neste repositório altera o comportamento de `ri.alupar.com.br`. HSTS sem `includeSubDomains` e sem `preload`
- Nenhuma URL do acervo responde 404; toda remoção vira 301 no mesmo commit
- Número não se inventa: dado ausente fica marcado como pendente
- Limites do CI (`lighthouserc.json`) nunca são afrouxados
- Nada de atribuição a ferramenta em commit, corpo de PR, comentário ou documento. Branches `feat/`, `fix/`, `docs/`, `chore/`
- PR verde é PR mergeado — sempre com `gh pr merge --squash --subject … --body …` explícitos, para a mensagem do squash não herdar texto de commit
- Recurso externo novo → CSP de `public/_headers` ajustada no mesmo commit
- Texto novo de interface depende de aprovação da Comunicação antes da virada

## O que muda em relação ao plano de 7 semanas

| Antes | Agora |
|---|---|
| Sanity com 5 tipos e migração integral antes da virada | Acervo em arquivo; Sanity (banner + notícia) na manutenção |
| Fase de design de 52 h, com telas aprovadas antes do código | Captura do tema atual pelo dev; o Marketing aprova **no preview** |
| Rotativo com carrossel | Um banner por idioma (regra 0.2: nada anterior a 2024) — sem carrossel na virada |
| Paridade EN/ES completa | Vai a tradução que existe; paridade na manutenção |
| Feed do RI no caminho crítico | Fora; a listagem usa o acervo |
| Marco 0 com sete ações | 0.1 hoje; 0.5 e 0.7 chegam com o site; 0.2, 0.3 e 0.4 somem na virada |

## Decisões pendentes — com o padrão adotado se ninguém responder

| # | Decisão | De quem | Padrão | Prazo |
|---|---|---|---|---|
| P1 | Banner em espanhol: nenhum é de 2024 em diante | Marketing | `tela-03.jpg` ("Energía que impulsa la vida"), a peça genérica que o ES já mostra | Tarefa 8 |
| P2 | Listagem de notícias de 24 meses (D9) nasce vazia: a última notícia é de 02/03/2023 | Comunicação | 24 meses; se sobrarem menos de 6, completa com as 6 mais recentes | Tarefa 9 |
| P3 | Busca do cabeçalho: site estático não tem busca do WordPress | Comunicação | Sai na virada; volta na manutenção se o GA4 mostrar uso | Tarefa 7 |
| P4 | Seletor de idioma: bandeiras do tema ou siglas em texto | Marketing | Siglas `PT · EN · ES` — o sprite do tema não está no CSS público, e bandeira não é rótulo acessível | Tarefa 7 |
| P5 | Formulário: e-mail de destino, texto LGPD (Clarice) e prazo de retenção | Alupar + jurídico | Sem os três até a homologação, a página vai com dados de contato e sem formulário | Tarefa 10 |
| P6 | 51 páginas que dependem de serviços da MZ (#43) | Comunicação | Vão como estão; o player/API da MZ some com o contrato e o texto fica | Tarefa 12 |
| P7 | Menu EN/ES traz "Trabalhe Conosco" em português | Comunicação | "Careers" / "Trabaje con nosotros" | Tarefa 7 |
| P8 | Vídeo da home: incorporado já no carregamento pesa ~1 MB de YouTube | — | Capa local; o player só carrega no clique | Tarefa 8 |
| P9 | Medição e cookies: o site atual carrega o GA4 `G-HH1N2K084G` (propriedade compartilhada com o RI) e o banner do CookieScript; o novo não tem nenhum dos dois. Saber também de quem é a conta do CookieScript | Marketing + jurídico | Cloudflare Web Analytics, sem cookie e sem banner. O GA4 volta, com banner de consentimento, se a Alupar pedir — sem isso, os relatórios dela perdem o institucional na data da virada | Tarefa 12 |

## Mapa de arquivos

| Arquivo | Responsabilidade | Tarefa |
|---|---|---|
| `scripts/otimizar-imagens.mjs` | Originais de `acervo/midia/` → WebP em `public/midia/` + `acervo/imagens.json` | 2 |
| `src/lib/imagens.ts` + `.test.ts` | `<img>` do corpo → `srcset` WebP | 3 |
| `scripts/lib/redirects.mjs` + `.test.mjs` | Casamento de caminho contra `_redirects` (hoje copiado em dois scripts) | 4 |
| `scripts/lib/continuidade.mjs` + `.test.mjs` | Destino de 301 para endereço vivo que não virou página | 4 |
| `scripts/fechar-continuidade.mjs` | Escreve os 301 que faltam; `--verificar` no CI | 4 |
| `src/pages/videos/…`, `en/videos/…`, `es/videos/…` | Listagem de vídeos (`/videos/` responde 200 hoje) | 4 |
| `scripts/publicar-arquivos.mjs` | `acervo/midia/` → R2, com verificação pela URL pública | 5 |
| `.github/workflows/ci.yml` | Testes, verificações novas, deploy no Pages | 3–6 |
| `src/components/Cabecalho.astro`, `Rodape.astro`, `public/js/site.js` | Casca restaurada do tema | 7 |
| `src/components/Home.astro` | Banner, faixa, notícias, vídeo, sustentabilidade | 8 |
| `src/lib/noticias.ts` + `.test.ts`, `src/components/ListaNoticias.astro` | Listagem e arquivo paginado | 9 |
| `src/lib/contato.ts` + `.test.ts`, `functions/api/contato.ts`, `src/components/Contato.astro` | Formulário acessível com Turnstile | 10 |
| `.github/workflows/sentinela.yml` | Checagem diária de apex, `www` e certificados | 11 |

---

## Fase 0 — hoje

### Tarefa 0: domínio sem `www` em HTTPS (Marco 0.1)

Operação na Cloudflare, sem código. Só depende da ness. Verificado ainda
quebrado em 10/09/2026: `SEC_E_CERT_EXPIRED`.

- [ ] **Passo 1:** DNS → registro `A alupar.com.br 34.230.121.250` → ligar o proxy (nuvem laranja). Não mexer em `www` nem em `ri`
- [ ] **Passo 2:** Rules → Redirect Rules → nova regra "apex para www":
  - expressão: `(http.host eq "alupar.com.br")`
  - destino dinâmico: `concat("https://www.alupar.com.br", http.request.uri.path)`, **301**, preservar query string ligado
- [ ] **Passo 3:** verificar

```bash
curl -sSI https://alupar.com.br/ | grep -iE "^(HTTP|location|cf-ray)"
# esperado: HTTP/2 301 · location: https://www.alupar.com.br/ · cf-ray presente
curl -sSv https://alupar.com.br/ 2>&1 | grep -E "issuer:|expire date"
# esperado: emissor Google Trust Services ou Let's Encrypt, validade futura
curl -sS -o /dev/null -w "%{http_code} %{url_effective}\n" -L "https://alupar.com.br/a-companhia/?lang=en"
# esperado: 200 https://www.alupar.com.br/a-companhia/?lang=en
```

- [ ] **Passo 4:** registrar em `infra/redirect-rules.md`, seção nova "Regra 0 — apex", com a expressão acima. Fechar a issue #3. **Não** desligar `34.230.121.250` nesta tarefa: fica para depois da virada
- [ ] **Passo 5:** commit

```bash
git switch -c docs/regra-apex
git add infra/redirect-rules.md
git commit -m "docs: regra de borda do apex, aplicada"
```

### Tarefa 1: levar as decisões P1 a P8 à Alupar

Sem código. As oito decisões pendentes têm prazo dentro das próximas duas
semanas, e cada uma que chegar tarde vira o padrão por omissão — o que é
aceitável só se estiver escrito.

- [ ] **Passo 1:** enviar à Alupar, pelo canal da ness., a tabela "Decisões pendentes" deste documento, com o padrão de cada linha e o pedido de resposta até o fim da semana 2. Junto, os dois dados que já estavam pendentes: km de linhas e MW instalados (faixa institucional) e o acesso ao GA4
- [ ] **Passo 2:** a cada resposta, registrar em `docs/decisoes.md` e atualizar a linha correspondente aqui
- [ ] **Passo 3:** commit

```bash
git switch -c docs/decisoes-virada
git add docs/decisoes.md docs/plano-virada.md
git commit -m "docs: decisões pendentes da virada, com prazo e padrão"
```

---

## Fase 1 — conteúdo destravado (semana 1)

### Tarefa 2: imagens do acervo em WebP responsivo

O PR #49 reprova em 4 páginas só porque as imagens do corpo são PNG em tamanho
cheio. O pipeline do Astro não enxerga `<img>` dentro de `set:html`; a
otimização acontece uma vez, por script, e o resultado vai versionado. Os
originais (6,6 MB de imagem, já baixados por `baixar-midia.mjs`) seguem fora
do git.

**Files:**
- Create: `scripts/otimizar-imagens.mjs`
- Create (gerado): `acervo/imagens.json`, `public/midia/**`
- Modify: `.github/workflows/ci.yml` (passo novo no job `build`)

**Interfaces:**
- Produz: `acervo/imagens.json` com o formato `{ "<caminho sob wp-content/uploads, decodificado>": { "largura": number, "altura": number, "variantes": number[] } }` e os arquivos `public/midia/<caminho sem extensão>-<largura>.webp`

- [ ] **Passo 1:** trabalhar no próprio branch do PR #49, atualizado — as Tarefas 2 e 3 são o que o deixa verde

```bash
git fetch origin
git switch feat/gerar-paginas
git rebase origin/main        # conflitos esperados só em docs; o acervo não mudou na main
```

- [ ] **Passo 2:** conferir que a mídia está no disco

```bash
node scripts/baixar-midia.mjs --verificar
# esperado: "aprovado: toda a mídia que a origem ainda serve está no acervo."
```

- [ ] **Passo 3:** escrever `scripts/otimizar-imagens.mjs`

```js
/**
 * Gera as versões WebP das imagens do acervo, nas larguras que o `srcset` usa.
 *
 * As imagens do corpo são PNG e JPG em tamanho cheio — é o que reprova o
 * orçamento de peso nas páginas Empresas (#49). O pipeline do Astro não
 * enxerga `<img>` dentro de `set:html`, então a otimização acontece aqui, uma
 * vez, e o resultado vai versionado em `public/midia/`. Os originais continuam
 * fora do git.
 *
 *   node scripts/otimizar-imagens.mjs              # gera o que falta
 *   node scripts/otimizar-imagens.mjs --verificar  # manifesto ⇄ arquivos (CI)
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import sharp from 'sharp';

const ORIGEM = 'acervo/midia';
const DESTINO = 'public/midia';
const MANIFESTO = 'acervo/imagens.json';
const LARGURAS = [480, 960, 1440];
const TETO = 1920;
const IMAGEM = /\.(png|jpe?g|gif)$/i;

const variantesPara = (largura) => [...LARGURAS.filter((w) => w < largura), Math.min(largura, TETO)];
const saidaDe = (chave, w) => join(DESTINO, `${chave.replace(/\.[^.]+$/, '')}-${w}.webp`);

async function imagens(dir) {
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...(await imagens(p)));
    else if (IMAGEM.test(e.name)) saida.push(p);
  }
  return saida;
}

if (process.argv.includes('--verificar')) {
  const manifesto = JSON.parse(await readFile(MANIFESTO, 'utf8'));
  const faltando = Object.entries(manifesto)
    .flatMap(([chave, e]) => e.variantes.map((w) => saidaDe(chave, w)))
    .filter((p) => !existsSync(p));
  if (faltando.length) {
    console.error(`reprovado: ${faltando.length} variantes do manifesto não estão em ${DESTINO}`);
    for (const p of faltando.slice(0, 10)) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`aprovado: ${Object.keys(manifesto).length} imagens, todas as variantes presentes.`);
  process.exit(0);
}

const manifesto = {};
let bytes = 0;
for (const p of await imagens(ORIGEM)) {
  const chave = relative(ORIGEM, p).split(sep).join('/');
  const { width, height } = await sharp(p).metadata();
  const variantes = variantesPara(width);
  for (const w of variantes) {
    const alvo = saidaDe(chave, w);
    if (!existsSync(alvo)) {
      await mkdir(dirname(alvo), { recursive: true });
      await sharp(p).resize({ width: w }).webp({ quality: 78 }).toFile(alvo);
    }
    bytes += (await stat(alvo)).size;
  }
  manifesto[chave] = { largura: width, altura: height, variantes };
}

const ordenado = Object.fromEntries(Object.entries(manifesto).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFESTO, `${JSON.stringify(ordenado, null, 1)}\n`);
console.log(`${Object.keys(manifesto).length} imagens · ${(bytes / 1024 / 1024).toFixed(1)} MB em ${DESTINO}`);
```

- [ ] **Passo 4:** rodar e conferir

```bash
node scripts/otimizar-imagens.mjs
# esperado: "87 imagens · N MB em public/midia" — N bem abaixo dos 6,6 MB dos originais
node scripts/otimizar-imagens.mjs --verificar
# esperado: "aprovado: 87 imagens, todas as variantes presentes."
rm public/midia/$(node -p "Object.keys(require('./acervo/imagens.json'))[0].replace(/\.[^.]+$/,'')")-*.webp
node scripts/otimizar-imagens.mjs --verificar; echo "saída: $?"
# esperado: "reprovado: …" e saída 1 — o gate reprova de verdade
node scripts/otimizar-imagens.mjs   # regenera o que foi apagado
```

- [ ] **Passo 5:** no `ci.yml`, job `build`, depois de "Corpo do acervo balanceado"

```yaml
      # As imagens do corpo são servidas das variantes WebP versionadas em
      # public/midia/. Variante faltando = <img> quebrada em produção.
      - name: Imagens otimizadas presentes
        run: node scripts/otimizar-imagens.mjs --verificar
```

- [ ] **Passo 6:** commit

```bash
git add scripts/otimizar-imagens.mjs acervo/imagens.json public/midia .github/workflows/ci.yml
git commit -m "feat: variantes WebP das imagens do acervo, versionadas"
```

### Tarefa 3: `<img>` do corpo com `srcset` — e o merge do #49

**Files:**
- Create: `src/lib/imagens.ts`, `src/lib/imagens.test.ts`
- Modify: `src/lib/acervo.ts` (imports e a cadeia de `corpo:` em `itens()`)
- Modify: `package.json` (script `test`), `.github/workflows/ci.yml` (passo `npm test`)

**Interfaces:**
- Consome: `acervo/imagens.json` (Tarefa 2)
- Produz: `responsivas(corpo: string, manifesto: Manifesto): string` e o tipo `Manifesto = Record<string, { largura: number; altura: number; variantes: number[] }>`

- [ ] **Passo 1:** escrever o teste `src/lib/imagens.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { responsivas, type Manifesto } from './imagens.ts';

const U = 'https://www.alupar.com.br/wp-content/uploads/';
const manifesto: Manifesto = {
  'sites/7/2017/08/mapa.png': { largura: 1600, altura: 900, variantes: [480, 960, 1440, 1600] },
  'sites/7/2019/05/Aves-de-São-Paulo.png': { largura: 400, altura: 300, variantes: [400] },
};

test('troca o original por WebP com srcset e dimensões intrínsecas', () => {
  const saida = responsivas(`<p><img src="${U}sites/7/2017/08/mapa.png" alt="Mapa"></p>`, manifesto);
  assert.match(saida, /src="\/midia\/sites\/7\/2017\/08\/mapa-1600\.webp"/);
  assert.match(saida, /srcset="\/midia\/sites\/7\/2017\/08\/mapa-480\.webp 480w, .*mapa-1600\.webp 1600w"/);
  assert.match(saida, /width="1600" height="900"/);
  assert.match(saida, /alt="Mapa"/);
});

test('largura declarada no conteúdo vira sizes, e o srcset antigo sai', () => {
  const saida = responsivas(
    `<img width="292" height="300" src="${U}sites/7/2017/08/mapa.png" srcset="${U}x-150.png 150w" sizes="(max-width: 292px) 100vw, 292px" alt="">`,
    manifesto,
  );
  assert.match(saida, /sizes="292px"/);
  assert.match(saida, /width="292" height="300"/);
  assert.doesNotMatch(saida, /x-150\.png/);
  assert.equal(saida.match(/\ssrcset=/g)?.length, 1);
});

test('caminho percentualmente codificado casa com o manifesto', () => {
  const saida = responsivas(`<img src="${U}sites/7/2019/05/Aves-de-S%C3%A3o-Paulo.png" alt="Aves">`, manifesto);
  assert.match(saida, /src="\/midia\/sites\/7\/2019\/05\/Aves-de-S%C3%A3o-Paulo-400\.webp"/);
});

test('imagem de terceiro passa intacta', () => {
  const html = '<img src="https://files.workr.com.br/logo.png" alt="Workr">';
  assert.equal(responsivas(html, manifesto), html);
});

test('imagem do acervo sem versão otimizada reprova o build', () => {
  assert.throws(() => responsivas(`<img src="${U}sites/7/nada.png" alt="">`, manifesto), /sem versão otimizada: sites\/7\/nada\.png/);
});
```

- [ ] **Passo 2:** no `package.json`, em `scripts`: `"test": "node --test \"src/lib/*.test.ts\""`. Rodar `npm test` — esperado: FAIL, `Cannot find module './imagens.ts'`

- [ ] **Passo 3:** escrever `src/lib/imagens.ts`

```ts
/**
 * `<img>` do acervo → WebP responsivo, a partir de `acervo/imagens.json`.
 *
 * O corpo herdado aponta para o original em tamanho cheio no WordPress antigo.
 * Aqui o `src` passa a ser a maior variante WebP, o `srcset` oferece as
 * outras, e a largura e a altura intrínsecas entram quando o conteúdo não as
 * declara — sem elas, o layout salta quando a imagem chega (CLS).
 *
 * Imagem do acervo sem variante não passa em silêncio: reprova o build. Foi
 * servindo original do origin antigo que as páginas Empresas chegaram a 4,6 MB.
 */
export interface Imagem { largura: number; altura: number; variantes: number[] }
export type Manifesto = Record<string, Imagem>;

const UPLOADS = /^https:\/\/www\.alupar\.com\.br\/wp-content\/uploads\//;
const LARGURA_DO_TEXTO = '(max-width: 760px) 100vw, 720px';

const url = (chave: string, w: number) => encodeURI(`/midia/${chave.replace(/\.[^.]+$/, '')}-${w}.webp`);

export function responsivas(corpo: string, manifesto: Manifesto): string {
  return corpo.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (inteiro, attrs: string) => {
    const src = /\ssrc="([^"]+)"/i.exec(attrs)?.[1];
    if (!src || !UPLOADS.test(src)) return inteiro;

    const chave = decodeURIComponent(src.replace(UPLOADS, '').split('?')[0]);
    const img = manifesto[chave];
    if (!img) throw new Error(`imagem sem versão otimizada: ${chave} — rode node scripts/otimizar-imagens.mjs`);

    const declarada = /\swidth="(\d+)"/i.exec(attrs)?.[1];
    const resto = attrs.replace(/\s(src|srcset|sizes)="[^"]*"/gi, '');
    const maior = img.variantes[img.variantes.length - 1];
    const srcset = img.variantes.map((w) => `${url(chave, w)} ${w}w`).join(', ');
    const sizes = declarada ? `${declarada}px` : LARGURA_DO_TEXTO;
    const dimensoes = /\swidth=/i.test(attrs) ? '' : ` width="${img.largura}" height="${img.altura}"`;
    return `<img${resto} src="${url(chave, maior)}" srcset="${srcset}" sizes="${sizes}"${dimensoes}>`;
  });
}
```

- [ ] **Passo 4:** `npm test` — esperado: 5 testes, todos PASS

- [ ] **Passo 5:** ligar em `src/lib/acervo.ts`. Nos imports:

```ts
import imagens from '../../acervo/imagens.json';
import { responsivas, type Manifesto } from './imagens';
```

e, em `itens()`, a linha de `corpo:` passa a ser — `responsivas` antes de `carregarImagens`, que só acrescenta `loading`/`decoding`:

```ts
      corpo: carregarImagens(
        responsivas(tabelaRolavel(avisarNovaAba(ancorasInternas(achado.corpo), idioma), idioma), imagens as Manifesto),
      ),
```

No comentário de `carregarImagens`, trocar o parágrafo que começa em "Isto reduz o que se baixa" por: *"O formato e o dimensionamento vêm de `responsivas()`, em `imagens.ts`."*

- [ ] **Passo 6:** no `ci.yml`, job `build`, logo depois de `- run: npm ci`: `- run: npm test`

- [ ] **Passo 7:** medir localmente

```bash
npm run build
node scripts/verificar-links.mjs
# esperado: "aprovado: todo link interno resolve…"
npx --yes @lhci/cli@0.14.x collect && npx --yes @lhci/cli@0.14.x assert
# esperado: 12 de 12 URLs passam — as três Empresas abaixo de 614.400 B,
# modern-image-formats e uses-responsive-images aprovados
```

Se uma asserção reprovar, **o limite não muda**: abrir o relatório em `.lighthouseci/`, ver qual recurso pesa e tratar (em geral, uma variante grande demais para o `sizes` declarado).

- [ ] **Passo 8:** commit, push e merge do #49 quando o CI estiver verde

```bash
git add src/lib/imagens.ts src/lib/imagens.test.ts src/lib/acervo.ts package.json .github/workflows/ci.yml
git commit -m "feat: imagens do corpo servidas em WebP responsivo"
git push --force-with-lease origin feat/gerar-paginas
gh pr checks 49 --watch
gh pr ready 49
gh pr merge 49 --squash --delete-branch \
  --subject "feat: gerar as 378 páginas de conteúdo (#49)" \
  --body "Páginas do acervo geradas a partir do mapa de rotas, com datas en/es corrigidas, hreflang só para alternativas existentes, verificador de links próprio e imagens do corpo em WebP responsivo."
```

### Tarefa 4: continuidade — todo endereço vivo resolve

Medido em 10/09/2026 contra o build do #49: **254 dos 666 endereços que
respondem 200 hoje deixariam de responder** — 188 páginas de anexo do
WordPress, 17 notícias sem corpo, `/videos/` nos três idiomas e cascas vazias
(`group`, `banner_rotativo`, `category`, `hello-world`). O README do acervo
previa 301 para os anexos; eles nunca entraram no `_redirects`. A correção é
uma regra, não 254 decisões.

**Files:**
- Create: `scripts/lib/redirects.mjs`, `scripts/lib/redirects.test.mjs`
- Create: `scripts/lib/continuidade.mjs`, `scripts/lib/continuidade.test.mjs`
- Create: `scripts/fechar-continuidade.mjs`
- Create: `src/components/ListaVideos.astro`, `src/pages/videos/index.astro`, `src/pages/en/videos/index.astro`, `src/pages/es/videos/index.astro`
- Modify: `scripts/verificar-links.mjs` (usa a lib), `scripts/gerar-mapa-de-rotas.mjs:113`, `src/i18n/textos.ts`, `public/_redirects` (bloco gerado), `package.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Produz: `lerRegras(texto: string): { origem, destino, prefixo: string | null }[]`, `regraPara(regras, caminho): regra | undefined`, `servido(dist: string, caminho: string): boolean`, `normal(caminho): string` — em `scripts/lib/redirects.mjs`
- Produz: `destino(caminho: string, tipo: string | undefined, resolve: (c: string) => boolean): string` — em `scripts/lib/continuidade.mjs`
- Produz: `textos[idioma].videos: string`

- [ ] **Passo 1:** branch e teste da lib de redirecionamentos — `scripts/lib/redirects.test.mjs`

```bash
git switch main && git pull && git switch -c feat/continuidade
```

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerRegras, regraPara } from './redirects.mjs';

const regras = lerRegras(`# comentário
/sustentabilidade-2/     /sustentabilidade/   301

/alupar-e-a-covid-19/*   /sustentabilidade/   301
`);

test('comentário e linha vazia não viram regra', () => assert.equal(regras.length, 2));

test('casa exato com e sem barra final', () => {
  assert.equal(regraPara(regras, '/sustentabilidade-2')?.destino, '/sustentabilidade/');
  assert.equal(regraPara(regras, '/sustentabilidade-2/')?.destino, '/sustentabilidade/');
});

test('curinga cobre a raiz e o que está abaixo, e só isso', () => {
  assert.ok(regraPara(regras, '/alupar-e-a-covid-19/'));
  assert.ok(regraPara(regras, '/alupar-e-a-covid-19/acoes/'));
  assert.equal(regraPara(regras, '/alupar-e-a-covid-19-outra/'), undefined);
});
```

- [ ] **Passo 2:** `package.json` → `"test": "node --test \"src/lib/*.test.ts\" \"scripts/lib/*.test.mjs\""`. `npm test` — esperado: FAIL, módulo `./redirects.mjs` inexistente

- [ ] **Passo 3:** `scripts/lib/redirects.mjs` — hoje o mesmo casamento está copiado em `verificar-links.mjs` e `gerar-mapa-de-rotas.mjs`; o terceiro uso justifica o módulo

```js
/**
 * Casamento de caminho contra `public/_redirects`, do jeito que o Pages faz:
 * `/x/*` cobre `/x` e tudo abaixo; o resto casa exato, com ou sem barra final.
 * Query string não entra — o Pages não a casa (ver infra/redirect-rules.md).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const normal = (p) => p.replace(/\/+$/, '') || '/';

export function lerRegras(texto) {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [origem, destino] = l.split(/\s+/);
      return { origem, destino, prefixo: origem.endsWith('*') ? normal(origem.slice(0, -1)) : null };
    });
}

export function regraPara(regras, caminho) {
  const n = normal(caminho);
  return regras.find((r) => (r.prefixo ? n === r.prefixo || n.startsWith(`${r.prefixo}/`) : normal(r.origem) === n));
}

/** O build serve `x/` como `x/index.html`, e arquivos soltos como estão. */
export function servido(dist, caminho) {
  const p = decodeURIComponent(caminho).replace(/^\//, '');
  return p === '' || existsSync(join(dist, p, 'index.html')) || existsSync(join(dist, p));
}
```

- [ ] **Passo 4:** `npm test` — esperado: PASS. Em `scripts/verificar-links.mjs`, trocar o bloco que vai de `const normal = …` até o fim de `const servido = …` por:

```js
import { lerRegras, regraPara, servido as servidoEm } from './lib/redirects.mjs';

const regras = lerRegras(readFileSync('public/_redirects', 'utf8'));
const redirecionado = (caminho) => Boolean(regraPara(regras, caminho));
const servido = (caminho) => servidoEm(DIST, caminho);
```

(o `import` sobe para junto dos outros). Conferir que nada mudou:

```bash
npm run build && node scripts/verificar-links.mjs
# esperado: as mesmas contagens de antes da troca, e "aprovado"
```

- [ ] **Passo 5:** teste do destino — `scripts/lib/continuidade.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destino } from './continuidade.mjs';

const existe = new Set(['/', '/en/', '/a-companhia/', '/noticias/', '/en/noticias/', '/videos/']);
const resolve = (c) => existe.has(c);

test('anexo vai para a página-mãe', () =>
  assert.equal(destino('/a-companhia/img-a-companhia/', 'anexo', resolve), '/a-companhia/'));

test('sobe até o ancestral que resolve', () =>
  assert.equal(destino('/a-companhia/x/y/', undefined, resolve), '/a-companhia/'));

test('sem ancestral que resolva, home do idioma', () =>
  assert.equal(destino('/en/company/img-a-companhia-eng/', 'anexo', resolve), '/en/'));

test('notícia sem corpo vai para a listagem do idioma', () =>
  assert.equal(destino('/en/noticia/2q22-earnings-release/', 'noticia', resolve), '/en/noticias/'));

test('qualquer coisa sob /video/ vai para a listagem de vídeos', () =>
  assert.equal(destino('/video/video-institucional/institucionalalupar-1/', 'anexo', resolve), '/videos/'));

test('nunca aponta para si mesmo', () =>
  assert.equal(destino('/videos/', 'pagina', (c) => c === '/' || c === '/videos/'), '/'));
```

- [ ] **Passo 6:** `npm test` — FAIL (módulo inexistente). Escrever `scripts/lib/continuidade.mjs`:

```js
/**
 * Para onde vai um endereço vivo do site atual que não virou página.
 *
 * Três regras, em ordem, e nenhuma inventa conteúdo:
 *   1. notícia sem corpo → listagem de notícias do idioma
 *   2. qualquer coisa sob /video/ ou /videos/ → listagem de vídeos do idioma
 *   3. o resto (anexo, casca vazia) → o ancestral mais próximo que resolve;
 *      sem nenhum, a home do idioma — que sempre existe
 */
export function destino(caminho, tipo, resolve) {
  const pre = /^\/(en|es)(?=\/)/.exec(caminho)?.[0] ?? '';
  const resto = caminho.slice(pre.length);
  const candidatos = [];
  if (tipo === 'noticia') candidatos.push(`${pre}/noticias/`);
  if (/^\/videos?\//.test(resto)) candidatos.push(`${pre}/videos/`);
  const segs = resto.split('/').filter(Boolean);
  for (let n = segs.length - 1; n > 0; n--) candidatos.push(`${pre}/${segs.slice(0, n).join('/')}/`);
  candidatos.push(`${pre}/`);

  const achado = candidatos.find((c) => c !== caminho && resolve(c));
  if (!achado) throw new Error(`sem destino para ${caminho}`);
  return achado;
}
```

`npm test` — esperado: todos PASS.

- [ ] **Passo 7:** a listagem de vídeos. Em `src/i18n/textos.ts`, acrescentar `videos: string;` à interface `Textos` e o valor em cada idioma: `'Vídeos'`, `'Videos'`, `'Videos'`. Criar `src/components/ListaVideos.astro`:

```astro
---
/**
 * `/videos/` responde 200 no site atual e é o destino do "Veja mais vídeos"
 * da home — sem esta página, viraria 404 na virada (regra 3).
 */
import Base from '../layouts/Base.astro';
import { itens } from '../lib/acervo';
import { textos, type Idioma } from '../i18n/textos';

interface Props { idioma: Idioma }
const { idioma } = Astro.props;
const t = textos[idioma];
const codigo = { 'pt-br': 'pt', en: 'en', es: 'es' }[idioma];
const videos = itens().filter((i) => i.tipo === 'video' && i.idioma === codigo);
---
<Base titulo={`${t.videos} — Alupar`} descricao={t.descricao} idioma={idioma}>
  <main id="conteudo" class="container pagina">
    <h1>{t.videos}</h1>
    <ul>{videos.map((v) => <li><a href={v.rota}>{v.titulo}</a></li>)}</ul>
  </main>
</Base>
```

e as três páginas, no padrão das homes — `src/pages/videos/index.astro`:

```astro
---
import ListaVideos from '../../components/ListaVideos.astro';
---
<ListaVideos idioma="pt-br" />
```

`src/pages/en/videos/index.astro` e `src/pages/es/videos/index.astro`: o mesmo, com `import ListaVideos from '../../../components/ListaVideos.astro';` e `idioma="en"` / `idioma="es"`.

- [ ] **Passo 8:** `scripts/gerar-mapa-de-rotas.mjs`, linha 113 — as páginas próprias passam a ser destino válido de 301:

```js
/* As três homes e as listagens existem em `src/pages/`, fora do mapa — mas são destino válido. */
const PAGINAS_PROPRIAS = ['/videos', '/en/videos', '/es/videos'];
const existe = new Set([
  ...[...porRota.keys()].map(normal),
  ...Object.values(PREFIXO).map((p) => normal(p || '/')),
  ...PAGINAS_PROPRIAS,
]);
```

- [ ] **Passo 9:** escrever `scripts/fechar-continuidade.mjs`

```js
/**
 * Toda URL viva do site atual resolve no site novo — por página ou por 301.
 *
 * O mapa de rotas (#47) confere que cada 301 cai numa página; o verificador de
 * links, que cada link do build resolve. Nenhum dos dois pergunta o contrário:
 * cada endereço que responde 200 hoje continua respondendo depois da virada?
 * Na primeira medição, 254 dos 666 não continuavam.
 *
 * `?lang=en|es` segue o que as regras de borda farão (infra/redirect-rules.md):
 * vira `/en` ou `/es` + o mesmo caminho, e é esse caminho que precisa resolver.
 *
 * Os 301 vão num bloco próprio do `_redirects`, ACIMA da marca do
 * gerar-redirecionamentos.mjs — ele preserva tudo o que está acima dela.
 *
 *   npm run build && node scripts/fechar-continuidade.mjs   # reescreve o bloco
 *   node scripts/fechar-continuidade.mjs --verificar         # CI, depois do build
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { lerRegras, regraPara, servido } from './lib/redirects.mjs';
import { destino } from './lib/continuidade.mjs';

const INICIO = '# ─── continuidade: gerado por scripts/fechar-continuidade.mjs ───';
const FIM = '# ─── continuidade: fim ───';
const MARCA = '# ─── gerado por scripts/gerar-redirecionamentos.mjs ───';
const verificar = process.argv.includes('--verificar');

const atual = readFileSync('public/_redirects', 'utf8');
const semBloco = atual.replace(new RegExp(`${INICIO}[\\s\\S]*?${FIM}\\n*`), '');
const regras = lerRegras(verificar ? atual : semBloco);
const resolve = (c) => servido('dist', c) || Boolean(regraPara(regras, c));

const PREFIXO = { pt: '', en: '/en', es: '/es' };
const tipos = new Map(
  readFileSync('acervo/conteudo.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l))
    .map((i) => [`${PREFIXO[i.idioma]}${i.caminho}`, i.anexo ? 'anexo' : i.tipo]),
);

const faltam = new Map();
for (const { url, status } of JSON.parse(readFileSync('acervo/inventario.json', 'utf8'))) {
  if (status !== 200) continue;
  const u = new URL(url);
  if (u.host !== 'www.alupar.com.br') continue;
  const lang = u.searchParams.get('lang');
  const caminho = lang === 'en' || lang === 'es' ? `/${lang}${u.pathname}` : u.pathname;
  if (!resolve(caminho)) faltam.set(caminho, tipos.get(caminho));
}

if (verificar) {
  if (faltam.size) {
    console.error(`reprovado: ${faltam.size} endereços vivos hoje deixariam de responder`);
    for (const c of [...faltam.keys()].slice(0, 20)) console.error(`  ${c}`);
    console.error('\ncorrige com: npm run build && node scripts/fechar-continuidade.mjs');
    process.exit(1);
  }
  console.log('aprovado: todo endereço vivo do acervo resolve, por página ou por 301.');
  process.exit(0);
}

// O destino tem de ser página servida, não outro 301: gerar-mapa-de-rotas.mjs
// --verificar reprova 301 cujo destino não é rota, e cadeia de 301 é salto a mais.
const servida = (c) => servido('dist', c);
const linhas = [...faltam]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([c, tipo]) => `${c}  ${destino(c, tipo, servida)}  301`);
const bloco = [
  INICIO,
  `# ${linhas.length} endereços vivos sem página no site novo, medidos contra o build.`,
  '# Anexo e casca vazia → ancestral que resolve; notícia → listagem; vídeo → /videos/.',
  ...linhas,
  FIM,
].join('\n');

const [antes, depois] = semBloco.split(MARCA);
if (depois === undefined) throw new Error('marca do gerar-redirecionamentos.mjs não encontrada no _redirects');
writeFileSync('public/_redirects', `${antes.trimEnd()}\n\n${bloco}\n\n${MARCA}${depois}`);
console.log(`escrito: ${linhas.length} regras de continuidade`);
```

- [ ] **Passo 10:** rodar nos dois sentidos

```bash
npm run build
node scripts/fechar-continuidade.mjs --verificar; echo "saída: $?"
# esperado: "reprovado: ~251 endereços…" e saída 1 (254 menos /videos/, /en/videos/ e /es/videos/, que agora existem)
node scripts/fechar-continuidade.mjs
# esperado: "escrito: ~251 regras de continuidade"
node scripts/gerar-mapa-de-rotas.mjs --verificar
# esperado: "aprovado: sem rota duplicada e todo 301 interno cai em rota existente."
npm run build && node scripts/fechar-continuidade.mjs --verificar
# esperado: "aprovado: todo endereço vivo do acervo resolve…"
grep -cvE '^\s*(#|$)' public/_redirects
# esperado: ~420 regras — abaixo do limite de 2.000 estáticas do Pages
```

Conferir à mão uma amostra do bloco gerado: um anexo (`/a-companhia/img-a-companhia/` → `/a-companhia/`), uma notícia sem corpo (→ `/noticias/`), um vídeo (→ `/videos/`).

- [ ] **Passo 11:** no `ci.yml`, job `build`, logo depois de `- run: npm run build`:

```yaml
      # Regra 3 de ponta a ponta: cada endereço que responde 200 no site atual
      # tem de resolver no build novo, por página ou por 301.
      - name: Continuidade do acervo
        run: node scripts/fechar-continuidade.mjs --verificar
```

- [ ] **Passo 12:** commit, PR e merge

```bash
git add scripts/lib scripts/fechar-continuidade.mjs scripts/verificar-links.mjs scripts/gerar-mapa-de-rotas.mjs \
  src/components/ListaVideos.astro src/pages/videos src/pages/en/videos src/pages/es/videos src/i18n/textos.ts \
  public/_redirects package.json .github/workflows/ci.yml
git commit -m "feat: todo endereço vivo do acervo resolve no site novo"
git push -u origin feat/continuidade
gh pr create --fill --base main
gh pr checks --watch && gh pr merge --squash --delete-branch \
  --subject "feat: todo endereço vivo do acervo resolve no site novo" \
  --body "254 dos 666 endereços vivos não resolviam no build do #49. Listagem de vídeos criada; o restante recebe 301 gerado por regra, verificado no CI."
```

### Tarefa 5: arquivos pesados no R2 — e os documentos que moram na MZ

Os 18 MP4 (651 MB) passam do limite de 25 MiB por arquivo do Pages, e nenhum
binário pesado pertence ao git. Vão para um bucket R2 servido em
`arquivos.alupar.com.br`. Junto vão cinco documentos que o site de hoje serve
por `api.mziq.com` — os dois códigos de conduta do rodapé e os relatórios de
sustentabilidade dos banners — e que **somem com o contrato da MZ**.

A ordem importa: o bucket fica cheio **antes** de o corpo passar a apontar
para ele, senão o Lighthouse da página de vídeo mede 404 no console.

**Files:**
- Create: `scripts/publicar-arquivos.mjs`, `infra/arquivos.md`
- Create (fora do git): `acervo/midia/documentos/*.pdf`
- Modify: `src/lib/acervo.ts`, `public/_headers`, `public/_redirects` (área manual, acima dos blocos gerados)

**Interfaces:**
- Produz: `https://arquivos.alupar.com.br/<caminho sob wp-content/uploads>` para toda a mídia do acervo, e `https://arquivos.alupar.com.br/documentos/<nome>.pdf` para os cinco documentos abaixo — as Tarefas 7 e 8 usam estes nomes

- [ ] **Passo 1:** resgatar os documentos da MZ

```bash
git switch main && git pull && git switch -c feat/arquivos-r2
mkdir -p acervo/midia/documentos
B=https://api.mziq.com/mzfilemanager/v2/d/7055e766-fc6d-42b3-9911-c19f8e89875a
curl -fsSL "$B/24fd856d-ece2-cd91-7f36-4010d5260736?origin=2" -o acervo/midia/documentos/codigo-de-conduta.pdf
curl -fsSL "$B/6e631206-9075-e582-ae7f-77ef422b3203?origin=2" -o acervo/midia/documentos/code-of-ethics.pdf
curl -fsSL "$B/175462ee-57f2-3eb4-edbd-b7a855ded091?origin=2" -o acervo/midia/documentos/codigo-de-conduta-de-terceiros.pdf
curl -fsSL "$B/377511cc-11f1-9e38-f081-982271efbd7f?origin=2" -o acervo/midia/documentos/relatorio-de-sustentabilidade-2025.pdf
curl -fsSL "$B/c201ef41-16f5-cd32-8395-c0fbb0db49fc?origin=2" -o acervo/midia/documentos/sustainability-report-2025.pdf
file acervo/midia/documentos/*
# esperado: "PDF document" nos cinco. Se algum vier como HTML, o link da MZ
# já não entrega o arquivo: registrar em acervo/README.md e pedir à Comunicação
```

- [ ] **Passo 2:** criar o bucket e o domínio (conta Cloudflare da ness., a mesma da zona)

```bash
npx --yes wrangler@4 r2 bucket create alupar-arquivos
npx --yes wrangler@4 r2 bucket domain add alupar-arquivos \
  --domain arquivos.alupar.com.br --zone-id "$ZONA"
# ZONA = Zone ID em Cloudflare → alupar.com.br → Overview, coluna da direita
```

Registrar em `infra/arquivos.md`: nome do bucket, domínio, conta, e que o
conteúdo sai de `acervo/midia/` por `scripts/publicar-arquivos.mjs`.

- [ ] **Passo 3:** escrever `scripts/publicar-arquivos.mjs`

```js
/**
 * Publica `acervo/midia/` no R2 (`alupar-arquivos`, em arquivos.alupar.com.br).
 *
 * O Pages não serve arquivo acima de 25 MiB, e 18 vídeos do acervo passam
 * disso. O bucket guarda a mídia inteira com a MESMA chave que ela tinha sob
 * /wp-content/uploads/ — é o que permite o 301 com :splat no _redirects.
 *
 * Idempotente: só envia o que a URL pública ainda não serve com o mesmo
 * tamanho. Rodar numa máquina com a mídia baixada e o wrangler autenticado.
 *
 *   node scripts/publicar-arquivos.mjs              # envia o que falta
 *   node scripts/publicar-arquivos.mjs --verificar  # só confere, pela URL pública
 */
import { readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const ORIGEM = 'acervo/midia';
const BUCKET = 'alupar-arquivos';
const PUBLICO = 'https://arquivos.alupar.com.br';
const TIPOS = {
  pdf: 'application/pdf', mp4: 'video/mp4', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const WIN = process.platform === 'win32';
const verificar = process.argv.includes('--verificar');

async function arquivos(dir) {
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...(await arquivos(p)));
    else saida.push(p);
  }
  return saida;
}

const pendentes = [];
for (const p of await arquivos(ORIGEM)) {
  const chave = relative(ORIGEM, p).split(sep).join('/');
  const r = await fetch(`${PUBLICO}/${encodeURI(chave)}`, { method: 'HEAD' });
  if (r.ok && Number(r.headers.get('content-length')) === (await stat(p)).size) continue;
  if (verificar) { pendentes.push(`${r.status} ${chave}`); continue; }

  const tipo = TIPOS[chave.split('.').pop().toLowerCase()] ?? 'application/octet-stream';
  const args = ['wrangler@4', 'r2', 'object', 'put', `${BUCKET}/${chave}`, '--file', p, '--content-type', tipo, '--remote'];
  // No Windows o npx é um .cmd, que só roda por shell — e o shell precisa das aspas.
  const s = spawnSync(WIN ? 'npx.cmd' : 'npx', WIN ? args.map((a) => `"${a}"`) : args, { stdio: 'inherit', shell: WIN });
  if (s.status !== 0) pendentes.push(`falhou o envio ${chave}`);
}

if (pendentes.length) {
  console.error(`reprovado: ${pendentes.length} arquivos não estão servidos como deviam`);
  for (const x of pendentes.slice(0, 20)) console.error(`  ${x}`);
  process.exit(1);
}
console.log(`aprovado: toda a mídia de ${ORIGEM} está servida em ${PUBLICO}.`);
```

- [ ] **Passo 4:** enviar e conferir

```bash
node scripts/publicar-arquivos.mjs --verificar; echo "saída: $?"
# esperado: reprovado, com os 120 arquivos (115 do acervo + 5 documentos) e saída 1
node scripts/publicar-arquivos.mjs
node scripts/publicar-arquivos.mjs --verificar
# esperado: "aprovado: toda a mídia de acervo/midia está servida…"
curl -sI https://arquivos.alupar.com.br/documentos/codigo-de-conduta.pdf | grep -iE "^(HTTP|content-type)"
# esperado: HTTP/2 200 · content-type: application/pdf
```

- [ ] **Passo 5:** o corpo passa a apontar para o R2. Em `src/lib/acervo.ts`, antes de `let cache`:

```ts
/*
 * O que não é imagem — MP4, PDF, DOCX — sai do origin antigo para o R2
 * (arquivos.alupar.com.br): 18 vídeos passam de 25 MiB, o limite por arquivo
 * do Pages. As imagens já foram reescritas por `responsivas()`, antes daqui.
 */
const arquivosNoR2 = (corpo: string) =>
  corpo.replaceAll('https://www.alupar.com.br/wp-content/uploads/', 'https://arquivos.alupar.com.br/');
```

e, na cadeia de `corpo:`, envolver tudo: `corpo: arquivosNoR2(carregarImagens(responsivas(…))),`.

- [ ] **Passo 6:** `public/_redirects`, na área manual (logo depois do bloco "Galeria de fotos"), para quem chega por link antigo de fora — e-mail, PDF, busca:

```
# Mídia do WordPress antigo: mesma chave, agora no R2 (infra/arquivos.md).
/wp-content/uploads/*                              https://arquivos.alupar.com.br/:splat   301
```

- [ ] **Passo 7:** `public/_headers`, na linha da CSP: `img-src 'self' data: https://files.workr.com.br;` (a única imagem de terceiro no corpo publicado) e, antes de `frame-ancestors`, `media-src https://arquivos.alupar.com.br;` (os 33 `<video>` do acervo)

- [ ] **Passo 8:** verificar e commitar

```bash
npm test && npm run build
node scripts/fechar-continuidade.mjs --verificar && node scripts/gerar-mapa-de-rotas.mjs --verificar
grep -c "arquivos.alupar.com.br" dist/video/video-institucional/institucional/index.html
# esperado: ≥ 1
grep -rl "www.alupar.com.br/wp-content/uploads" dist | wc -l
# esperado: 0
git add scripts/publicar-arquivos.mjs infra/arquivos.md src/lib/acervo.ts public/_headers public/_redirects
git commit -m "feat: mídia pesada e documentos da MZ servidos pelo R2"
git push -u origin feat/arquivos-r2 && gh pr create --fill --base main
```

Merge com `--subject`/`--body` explícitos quando verde. Fechar a **#26**: a
mídia saiu da infraestrutura da MZ.

### Tarefa 6: Cloudflare Pages — produção e preview por PR

**Files:**
- Modify: `.github/workflows/ci.yml` (job novo `publicar`), `public/_headers`

- [ ] **Passo 1:** criar o projeto e os segredos (uma vez)

```bash
npx --yes wrangler@4 pages project create sitealupar --production-branch main
# Token: Cloudflare → My Profile → API Tokens → "Cloudflare Pages: Edit" na conta da ness.
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

- [ ] **Passo 2:** `ci.yml`, job novo ao fim do arquivo. Depende só do `build`: o preview de um PR vermelho é justamente o que ajuda a diagnosticá-lo, e produção só recebe o que já passou pelo gate, porque só a `main` publica em produção

```yaml
  # Todo PR ganha um endereço de preview; a main publica em sitealupar.pages.dev.
  # www.alupar.com.br só aponta para cá na virada (Tarefa 12).
  publicar:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Publicar no Cloudflare Pages
        run: npx --yes wrangler@4 pages deploy dist --project-name sitealupar --branch "${{ github.head_ref || github.ref_name }}" | tee -a "$GITHUB_STEP_SUMMARY"
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- [ ] **Passo 3:** `public/_headers`, ao fim — o endereço `pages.dev` de produção é indexável e duplicaria o site inteiro no Google antes da virada (os previews já recebem `noindex` da própria Cloudflare):

```
# sitealupar.pages.dev é endereço técnico: não pode concorrer com o domínio.
https://:project.pages.dev/*
  X-Robots-Tag: noindex
```

- [ ] **Passo 4:** commit, PR, e conferir o preview que o próprio PR gera

```bash
git switch main && git pull && git switch -c ci/pages
git add .github/workflows/ci.yml public/_headers
git commit -m "ci: publicar no Cloudflare Pages, com preview por PR"
git push -u origin ci/pages && gh pr create --fill --base main
gh pr checks --watch
# o resumo do job "publicar" traz a URL do preview
curl -sSI https://<alias do preview>.sitealupar.pages.dev/ | grep -iE "^(HTTP|content-security|strict-transport|x-robots)"
# esperado: 200, CSP e HSTS presentes, X-Robots-Tag: noindex
```

- [ ] **Passo 5:** merge; conferir produção

```bash
curl -sSI https://sitealupar.pages.dev/ | grep -iE "^(HTTP|x-robots)"
# esperado: HTTP/2 200 · X-Robots-Tag: noindex
curl -sSI https://sitealupar.pages.dev/sustentabilidade-2/ | grep -iE "^(HTTP|location)"
# esperado: 301 · location: /sustentabilidade/ — o _redirects vale no Pages
```

A partir daqui, **toda aprovação da Alupar é feita num link**, não em imagem.

---

## Fase 2 — a casca do site (semana 2)

As Tarefas 7 a 10 são independentes entre si depois da 7 — podem correr em
paralelo, cada uma no seu branch.

### Tarefa 7: cabeçalho, menu e rodapé restaurados

Captura do tema atual (`mziq_alupar_inst/style.css`), com os valores medidos
em 10/09/2026. Onde o tema reprova critério, a mudança cita o número.

**Files:**
- Create: `src/components/Cabecalho.astro`, `src/components/Rodape.astro`, `public/js/site.js`
- Create (baixados do tema): `public/img/tema/bg-logo.png`, `public/img/tema/bg-logo-mobile.png`, `src/assets/tema/bg-interna-01.jpg`
- Modify: `src/i18n/textos.ts`, `src/layouts/Base.astro`, `src/components/Home.astro`, `src/styles/tokens.css`

**Interfaces:**
- Consome: `alternativas` já calculadas em `Base.astro` (`{ idioma, caminho, hreflang, href }[]`)
- Produz: `Base` aceita `interna?: boolean` (padrão `true`; a home passa `false`); `textos[idioma]` ganha `idioma`, `logo`, `menu`, `ri`, `novaAba`, `rodape`; `public/js/site.js` existe e é carregado em toda página — a Tarefa 8 acrescenta a ele

- [ ] **Passo 1:** branch e imagens do tema

```bash
git switch main && git pull && git switch -c feat/cabecalho-rodape
T=https://cdn-sites-assets.mziq.com/wp-content/themes/mziq_alupar_inst/img
mkdir -p public/img/tema src/assets/tema
curl -fsSL $T/bg-logo.png -o public/img/tema/bg-logo.png              # 4,7 KB — o box do logotipo
curl -fsSL $T/bg-logo-mobile.png -o public/img/tema/bg-logo-mobile.png  # 8,8 KB
curl -fsSL $T/bgs/bg-interna-01.jpg -o src/assets/tema/bg-interna-01.jpg  # 183 KB — o Astro otimiza
```

- [ ] **Passo 2:** `src/i18n/textos.ts` — na interface `Textos`:

```ts
  idioma: string;
  logo: string;
  menu: { rotulo: string; itens: { rotulo: string; href: string }[] };
  ri: string;
  novaAba: string;
  rodape: {
    direitos: string; privacidade: string; privacidadeHref: string;
    conduta: string; condutaHref: string; terceiros: string; denuncias: string; topo: string;
  };
```

e os valores. Rótulos lidos do site atual nos três idiomas; os marcados com
`// novo` são redação nossa e entram na lista de aprovação da Comunicação:

```ts
// 'pt-br'
    idioma: 'Idioma',
    logo: 'Alupar — página inicial', // novo
    menu: {
      rotulo: 'Menu',
      itens: [
        { rotulo: 'A Companhia', href: '/a-companhia/' },
        { rotulo: 'Área de atuação', href: '/area-de-atuacao/' },
        { rotulo: 'Empresas', href: '/empresas/' },
        { rotulo: 'Inovação e P&D', href: '/inovacao-pesquisa-e-desenvolvimento/' },
        { rotulo: 'Trabalhe Conosco', href: 'https://alupar.gupy.io/' },
        { rotulo: 'Contato', href: '/contato/' },
      ],
    },
    ri: 'Relações com Investidores',
    novaAba: 'abre em nova aba',
    rodape: {
      direitos: 'Todos os direitos reservados',
      privacidade: 'Política de Privacidade', privacidadeHref: '/politica-de-privacidade/',
      conduta: 'Código de Conduta', condutaHref: 'https://arquivos.alupar.com.br/documentos/codigo-de-conduta.pdf',
      terceiros: 'Código de Conduta de Terceiros', denuncias: 'Canal de Denúncias',
      topo: 'Voltar ao topo', // novo
    },
// en
    idioma: 'Language',
    logo: 'Alupar — home', // novo
    menu: {
      rotulo: 'Menu',
      itens: [
        { rotulo: 'Company', href: '/en/a-companhia/' },
        { rotulo: 'Business Segment', href: '/en/area-de-atuacao/' },
        { rotulo: 'Companies', href: '/en/empresas/' },
        { rotulo: 'Careers', href: 'https://alupar.gupy.io/' }, // novo — decisão P7
        { rotulo: 'Contact Us', href: '/en/contato/' },
      ],
    },
    ri: 'Investor Relations',
    novaAba: 'opens in a new tab',
    rodape: {
      direitos: 'All rights reserved',
      privacidade: 'Privacy Policy', privacidadeHref: '/en/politica-de-privacidade/',
      conduta: 'Code of Ethics', condutaHref: 'https://arquivos.alupar.com.br/documentos/code-of-ethics.pdf',
      terceiros: 'Third Parties Code of Conduct', denuncias: 'Reporting Channel',
      topo: 'Back to top', // novo
    },
// es
    idioma: 'Idioma',
    logo: 'Alupar — inicio', // novo
    menu: {
      rotulo: 'Menú',
      itens: [
        { rotulo: 'Compañía', href: '/es/a-companhia/' },
        { rotulo: 'Segmento de Negocio', href: '/es/area-de-atuacao/' },
        { rotulo: 'Empresas', href: '/es/empresas/' },
        { rotulo: 'Trabaje con nosotros', href: 'https://alupar.gupy.io/' }, // novo — decisão P7
        { rotulo: 'Contacto', href: '/es/contato/' },
      ],
    },
    ri: 'Relación con Inversores',
    novaAba: 'abre en una pestaña nueva',
    rodape: {
      direitos: 'Todos los derechos reservados',
      privacidade: 'Política de privacidad', privacidadeHref: '/es/politica-de-privacidade/',
      conduta: 'Código de conducta', condutaHref: 'https://arquivos.alupar.com.br/documentos/code-of-ethics.pdf',
      terceiros: 'Código de Conducta de Terceros', denuncias: 'Canal de Denuncias',
      topo: 'Volver arriba', // novo
    },
```

(O ES do site atual aponta "Código de conducta" para o mesmo documento do EN — mantido.)

- [ ] **Passo 3:** `src/styles/tokens.css`, depois das "Derivadas para tela":

```css
  /* Rodapé do tema atual — não estão no MIV, estão no site */
  --rodape-fundo:    #231F20;
  --rodape-texto:    #B0AFAF;   /* 7,4:1 sobre o fundo */
```

e, ao fim do arquivo, o rodapé colado ao pé em página curta:

```css
body { min-height: 100vh; display: flex; flex-direction: column; }
body > main { flex: 1; }
```

- [ ] **Passo 4:** `src/components/Cabecalho.astro`

```astro
---
/**
 * Cabeçalho restaurado do tema atual (mziq_alupar_inst): barra cinza com o
 * link do RI e os idiomas, logotipo sobre o box branco (bg-logo.png — o box
 * que o manual exige sobre foto; não é sobra), menu em caixa alta à direita.
 *
 * O que muda, e o problema que autoriza:
 * - texto da barra em branco, não #E2E2E2: 3,74:1 sobre #6F7273 reprova AA;
 *   branco dá 4,85:1
 * - hover e página atual em --verde-texto: #079541 entrega 3,90:1
 * - logotipo é <img> com alt; o <h1> da home é outro elemento
 * - idiomas em sigla (decisão P4) e sem busca (decisão P3)
 */
import { textos, type Idioma } from '../i18n/textos';

interface Props { idioma: Idioma; alternativas: { idioma: Idioma; caminho: string }[] }
const { idioma, alternativas } = Astro.props;
const t = textos[idioma];
const HOME = { 'pt-br': '/', en: '/en/', es: '/es/' } as const;
const SIGLA = { 'pt-br': 'PT', en: 'EN', es: 'ES' } as const;
const LANG = { 'pt-br': 'pt-BR', en: 'en', es: 'es' } as const;
const atual = Astro.url.pathname;
---
<header class="cabecalho-site" id="topo">
  <div class="barra">
    <div class="container barra-itens">
      <a href="https://ri.alupar.com.br/">{t.ri}</a>
      <ul class="idiomas" aria-label={t.idioma}>
        {(Object.keys(HOME) as Idioma[]).map((i) => (
          <li>
            <a
              href={alternativas.find((a) => a.idioma === i)?.caminho ?? HOME[i]}
              lang={LANG[i]} hreflang={LANG[i]}
              aria-current={i === idioma ? 'true' : undefined}
            >{SIGLA[i]}</a>
          </li>
        ))}
      </ul>
    </div>
  </div>
  <div class="container principal">
    <a class="logo" href={HOME[idioma]}>
      <img src="/logo-alupar.svg" alt={t.logo} width="175" height="57" />
    </a>
    <button class="alternar" type="button" aria-expanded="false" aria-controls="menu-principal" hidden>{t.menu.rotulo}</button>
    <nav id="menu-principal" aria-label={t.menu.rotulo}>
      <ul>
        {t.menu.itens.map((m) => (
          <li><a href={m.href} aria-current={atual.startsWith(m.href) ? 'page' : undefined}>{m.rotulo}</a></li>
        ))}
      </ul>
    </nav>
  </div>
</header>

<style>
  /* Valores do style.css do tema, medidos em 10/09/2026 */
  .barra { background: var(--cinza); }
  .barra-itens { display: flex; justify-content: flex-end; align-items: center; gap: var(--e3); min-height: 33px; }
  .barra a { color: var(--branco); font-size: 10px; text-transform: uppercase; text-decoration: none; }
  .idiomas { display: flex; gap: var(--e2); list-style: none; margin: 0; padding: 0; }
  .idiomas a[aria-current] { font-weight: 700; text-decoration: underline; }

  .principal { position: relative; display: flex; justify-content: flex-end; align-items: center; min-height: 60px; }
  .logo {
    position: absolute; left: var(--e3); top: 0; z-index: 10;
    display: grid; place-items: center; width: 150px; height: 83px;
    background: url('/img/tema/bg-logo-mobile.png') no-repeat center / contain;
  }
  .logo img { width: 112px; height: auto; }

  nav ul { display: flex; flex-wrap: wrap; list-style: none; margin: 0; padding: 0; }
  nav a {
    display: block; padding: 15px 4px; margin-inline: var(--e2);
    font-size: 13px; text-transform: uppercase; color: var(--preto); text-decoration: none;
  }
  nav a:hover, nav a[aria-current] { color: var(--verde-texto); }

  @media (max-width: 767px) {
    .principal { flex-wrap: wrap; min-height: 83px; }
    .alternar {
      margin-top: 20px; background: none; border: 0; padding: var(--e2);
      font: inherit; font-size: 11px; text-transform: uppercase; color: var(--preto);
    }
    nav { width: 100%; }
    nav ul { flex-direction: column; }
    nav a { border-bottom: 1px solid var(--cinza-borda); margin: 0; }
    /* Com JS (site.js), o menu recolhe atrás do botão. Sem JS, fica aberto. */
    nav[data-recolhivel] { display: none; }
    .alternar[aria-expanded='true'] + nav { display: block; }
  }
  @media (min-width: 768px) {
    .logo { width: 150px; height: 130px; background-image: url('/img/tema/bg-logo.png'); }
    .logo img { width: 120px; }
    nav { margin-top: 10px; }
  }
  @media (min-width: 992px) {
    .logo { width: 293px; height: 200px; }
    .logo img { width: 175px; }
  }
</style>
```

(`57` = 175 × 39,5 / 121,8, do `viewBox` do SVG — reserva o espaço e evita CLS.)

- [ ] **Passo 5:** `src/components/Rodape.astro`

```astro
---
/**
 * Rodapé do tema: fundo #231F20, caixa alta 11px, links separados por "|".
 * Sai o "Powered by MZ". Os códigos de conduta passam a vir do R2 — hoje
 * moram em api.mziq.com e sumiriam com o contrato (Tarefa 5).
 *
 * O círculo de "voltar ao topo" usa --rodape-texto e não o #535252 do tema:
 * 2,2:1 sobre o fundo reprova o 3:1 de componente de interface (WCAG 1.4.11).
 */
import { textos, type Idioma } from '../i18n/textos';

interface Props { idioma: Idioma }
const t = textos[Astro.props.idioma];
const r = t.rodape;
const externos = [
  { rotulo: r.conduta, href: r.condutaHref },
  { rotulo: r.terceiros, href: 'https://arquivos.alupar.com.br/documentos/codigo-de-conduta-de-terceiros.pdf' },
  { rotulo: r.denuncias, href: 'https://contatoseguro.com.br/pt/alupar/' },
];
---
<footer class="rodape">
  <div class="container">
    <a class="topo" href="#topo"><span aria-hidden="true">︿</span><span class="sr-only">{r.topo}</span></a>
    <ul>
      <li>© {new Date().getFullYear()} ALUPAR - {r.direitos} ::</li>
      <li><a href={r.privacidadeHref}>{r.privacidade}</a></li>
      {externos.map((e) => (
        <li><a href={e.href} target="_blank" rel="noopener noreferrer">{e.rotulo}<span class="sr-only"> ({t.novaAba})</span></a></li>
      ))}
    </ul>
  </div>
</footer>

<style>
  .rodape { background: var(--rodape-fundo); padding-top: 10px; text-align: center; }
  .topo {
    display: inline-grid; place-items: center; width: 23px; height: 23px;
    border: 2px solid var(--rodape-texto); border-radius: 50%;
    color: var(--rodape-texto); text-decoration: none; line-height: 1;
  }
  ul {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 0 6px;
    list-style: none; margin: 8px 0 5px; padding: 0 0 8px;
    border-bottom: 1px solid #2E2A2B;
    font-size: 11px; text-transform: uppercase; color: var(--rodape-texto);
  }
  li:nth-child(n + 3)::before { content: '|' / ''; margin-right: 6px; }
  a { color: var(--rodape-texto); }
</style>
```

- [ ] **Passo 6:** `public/js/site.js` — arquivo em `public/` porque a CSP (`script-src 'self'`) não admite script embutido, e `is:inline` com `src` o serve como está:

```js
// Menu no celular. Sem JS o menu fica aberto e empilhado — nada se perde;
// com JS, recolhe atrás do botão.
const botao = document.querySelector('.alternar');
const menu = document.getElementById('menu-principal');
if (botao && menu) {
  botao.hidden = false;
  menu.dataset.recolhivel = '';
  botao.addEventListener('click', () => {
    botao.setAttribute('aria-expanded', String(botao.getAttribute('aria-expanded') !== 'true'));
  });
}
```

- [ ] **Passo 7:** `src/layouts/Base.astro`

Nos imports do frontmatter:

```ts
import { Picture } from 'astro:assets';
import Cabecalho from '../components/Cabecalho.astro';
import Rodape from '../components/Rodape.astro';
import faixaInterna from '../assets/tema/bg-interna-01.jpg';
```

`Props` ganha `interna?: boolean`, e a desestruturação passa a ser
`const { titulo, descricao, idioma = 'pt-br', interna = true } = Astro.props;`.
No `<body>`, entre o link "pular" e o `<slot />`, e depois dele:

```astro
    <a class="pular" href="#conteudo">{textos[idioma].pularParaConteudo}</a>
    <Cabecalho idioma={idioma} alternativas={alternativas} />
    {interna && (
      /* A faixa de foto das páginas internas do tema (.img-materia): 85/135/185 px. */
      <Picture src={faixaInterna} alt="" formats={['avif', 'webp']} widths={[768, 1280, 1920]}
        sizes="100vw" loading="eager" class="faixa-interna" />
    )}
    <slot />
    <Rodape idioma={idioma} />
    <script is:inline src="/js/site.js" defer></script>
```

e, no `<style>` do Base:

```css
      .faixa-interna { display: block; width: 100%; height: 85px; object-fit: cover; }
      @media (min-width: 768px) { .faixa-interna { height: 135px; } }
      @media (min-width: 1200px) { .faixa-interna { height: 185px; } }
```

- [ ] **Passo 8:** `src/components/Home.astro` — apagar o bloco `<header class="topo">…</header>` inteiro (o cabeçalho agora vem do Base), pôr `<h1 class="sr-only">Alupar</h1>` como primeiro filho de `<main id="conteudo">` e passar `interna={false}` ao `<Base>`

- [ ] **Passo 9:** verificar

```bash
npm test && npm run build
node scripts/verificar-links.mjs          # o menu e o rodapé entram na contagem de internos
node scripts/fechar-continuidade.mjs --verificar
npx --yes @lhci/cli@0.14.x collect && npx --yes @lhci/cli@0.14.x assert
# esperado: 12 de 12; acessibilidade 1,0 — o link do RI, os idiomas e o
# rodapé passam por color-contrast
```

- [ ] **Passo 10:** a conferência do `restauro-fiel`, no preview do PR. Abrir lado a lado, em 390, 768 e 1280 px de largura: o preview, `www.alupar.com.br` e `ri.alupar.com.br`. Ajustar só espaçamento e altura até que ninguém que conhece o site note a diferença sem ser avisado. Testar só com teclado: pular para o conteúdo → RI → idiomas → logotipo → menu → rodapé, com foco visível em todos. **Portão M2:** o Marketing aprova o cabeçalho e o rodapé **neste link**

- [ ] **Passo 11:** commit, PR, merge quando verde

```bash
git add public/img/tema src/assets/tema public/js/site.js src/components/Cabecalho.astro src/components/Rodape.astro \
  src/components/Home.astro src/layouts/Base.astro src/i18n/textos.ts src/styles/tokens.css
git commit -m "feat: cabeçalho, menu e rodapé restaurados do tema"
git push -u origin feat/cabecalho-rodape && gh pr create --fill --base main
```

### Tarefa 8: a home completa

Ordem do site atual: rotativo → faixa institucional (D10) → três caixas
(notícias, vídeo, sustentabilidade). **Um banner por idioma**: a regra 0.2 do
Marco 0 tira tudo o que é anterior a 2024, e sobra um. Um banner não precisa de
carrossel; pausa, teclado e altura reservada (H1) voltam a ser requisito quando
houver dois, já na manutenção.

**Files:**
- Create (baixados): `src/assets/banners/sustentabilidade-2025-pt.png`, `src/assets/banners/sustentabilidade-2025-en.png`, `src/assets/banners/energia-que-impulsa-la-vida.jpg`, `src/assets/video-institucional.jpg`, `public/img/tema/icone-meio-ambiente.png`, `public/img/tema/icone-agua.png`, `public/img/tema/icone-fauna-e-flora.png`
- Modify: `src/components/Home.astro` (reescrito), `src/i18n/textos.ts`, `public/js/site.js`

**Interfaces:**
- Consome: `itens()` de `src/lib/acervo.ts`; `Base` com `interna={false}` (Tarefa 7); `/noticias/` (existe no acervo, a Tarefa 9 a substitui) e `/videos/` (Tarefa 4)
- Produz: `textos[idioma]` ganha `banner`, `eixos`, `sustentabilidadeHref`, `verMaisNoticias`, `verMaisVideos`, `saibaMais`, `assistirVideo`

- [ ] **Passo 1:** branch e arquivos

```bash
git switch main && git pull && git switch -c feat/home
U=https://cdn-sites-assets.mziq.com/wp-content/uploads/sites/7
T=https://cdn-sites-assets.mziq.com/wp-content/themes/mziq_alupar_inst/img/icones
mkdir -p src/assets/banners
curl -fsSL "$U/2024/06/Banner-site-holding-Relatorio-de-Sustentabilidade-2025-PT-scaled.png" -o src/assets/banners/sustentabilidade-2025-pt.png
curl -fsSL "$U/2026/04/Banner-site-holding-Relatorio-de-Sustentabilidade-2025-ING-scaled.png" -o src/assets/banners/sustentabilidade-2025-en.png
curl -fsSL "$U/2017/08/tela-03.jpg" -o src/assets/banners/energia-que-impulsa-la-vida.jpg   # decisão P1
curl -fsSL "https://i.ytimg.com/vi/oqjwsKfpYZ4/maxresdefault.jpg" -o src/assets/video-institucional.jpg
for n in meio-ambiente agua fauna-e-flora; do curl -fsSL "$T/img-$n.png" -o "public/img/tema/icone-$n.png"; done   # 29×38, 3,5 KB cada
```

- [ ] **Passo 2:** `src/i18n/textos.ts` — na interface:

```ts
  banner: { legenda: string; alt: string; href: string | null };
  eixos: { titulo: string; texto: string }[];
  sustentabilidadeHref: string;
  verMaisNoticias: string;
  verMaisVideos: string;
  saibaMais: string;
  assistirVideo: string;
```

e os valores (lidos do site atual; `// novo` vai para aprovação):

```ts
// 'pt-br'
    banner: {
      legenda: '#SUSTENTABILIDADE',
      alt: 'Relatório de Sustentabilidade 2025', // novo — o site atual tem alt=""
      href: 'https://arquivos.alupar.com.br/documentos/relatorio-de-sustentabilidade-2025.pdf',
    },
    eixos: [
      { titulo: 'Meio Ambiente', texto: 'Reposição e recuperação de vegetação florestal nativa' },
      { titulo: 'Água', texto: 'Manutenção da qualidade da água dos corpos hídricos' },
      { titulo: 'Fauna e Flora', texto: 'Manutenção da biodiversidade' },
    ],
    sustentabilidadeHref: '/sustentabilidade/',
    verMaisNoticias: 'Veja mais notícias',
    verMaisVideos: 'Veja mais vídeos',
    saibaMais: 'Saiba mais do programa',
    assistirVideo: 'Assistir ao vídeo institucional no YouTube', // novo
// en
    banner: {
      legenda: '#SUSTAINABILITY',
      alt: 'Sustainability Report 2025', // novo
      href: 'https://arquivos.alupar.com.br/documentos/sustainability-report-2025.pdf',
    },
    eixos: [
      { titulo: 'Environment', texto: 'Replacement and recovery of native forests' },
      { titulo: 'Water', texto: 'Maintenance of the quality of the water bodies' },
      { titulo: 'Fauna and Flora', texto: 'Maintenance of biodiversity' },
    ],
    sustentabilidadeHref: '/en/sustentabilidade-2/',
    verMaisNoticias: 'See more news',
    verMaisVideos: 'See more videos',
    saibaMais: 'Learn more about the program',
    assistirVideo: 'Watch the institutional video on YouTube', // novo
// es
    banner: { legenda: 'Energía que impulsa la vida', alt: 'Energía que impulsa la vida', href: null }, // decisão P1
    eixos: [
      { titulo: 'Medio Ambiente', texto: 'Reposición y recuperación de vegetación forestal nativa' },
      { titulo: 'Agua', texto: 'Mantenimiento de la calidad del agua de los cuerpos hídricos' },
      { titulo: 'Fauna y Flora', texto: 'Mantenimiento de la biodiversidad' },
    ],
    sustentabilidadeHref: '/es/sustentabilidade-2/',
    verMaisNoticias: 'Más noticias',
    verMaisVideos: 'Más vídeos',
    saibaMais: 'Más información del programa',
    assistirVideo: 'Ver el video institucional en YouTube', // novo
```

- [ ] **Passo 3:** reescrever `src/components/Home.astro`

```astro
---
/**
 * A home, uma vez, nos três idiomas. A ordem é a do site atual: rotativo,
 * faixa institucional (D10) e as três caixas — notícias, vídeo, sustentabilidade.
 *
 * Rotativo com um banner só: a regra 0.2 do Marco 0 tira o que é anterior a
 * 2024 e sobra um por idioma. Carrossel volta a ser requisito (H1) com dois.
 *
 * Vídeo sob demanda (H4): a capa é local e o player do YouTube — ~1 MB, o
 * orçamento inteiro da página — só carrega no clique (public/js/site.js).
 * Sem JS, o link leva ao vídeo no YouTube.
 */
import { Picture } from 'astro:assets';
import Base from '../layouts/Base.astro';
import { itens } from '../lib/acervo';
import { textos, prefixo, lang, type Idioma } from '../i18n/textos';
import bannerPt from '../assets/banners/sustentabilidade-2025-pt.png';
import bannerEn from '../assets/banners/sustentabilidade-2025-en.png';
import bannerEs from '../assets/banners/energia-que-impulsa-la-vida.jpg';
import capaVideo from '../assets/video-institucional.jpg';

interface Props { idioma: Idioma }
const { idioma } = Astro.props;
const t = textos[idioma];
const pre = prefixo[idioma];
const BANNER = { 'pt-br': bannerPt, en: bannerEn, es: bannerEs };
const ICONES = ['meio-ambiente', 'agua', 'fauna-e-flora'].map((n) => `/img/tema/icone-${n}.png`);
const Destaque = t.banner.href ? 'a' : 'div';

// Os dois valores nulos são pendências da Alupar. A regra 4 do AGENTS.md: um
// número plausível é pior que um espaço vazio, porque ninguém o corrige depois.
const indicadores = [
  { valor: null,  rotulo: t.indicadores.linhas },
  { valor: '4',   rotulo: t.indicadores.paises },
  { valor: null,  rotulo: t.indicadores.capacidade },
  { valor: 'AAA', rotulo: t.indicadores.rating },
];

const codigo = { 'pt-br': 'pt', en: 'en', es: 'es' }[idioma];
const formato = new Intl.DateTimeFormat(lang[idioma], { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const noticias = itens()
  .filter((i) => i.tipo === 'noticia' && i.idioma === codigo && i.data)
  .sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''))
  .slice(0, 6);
---
<Base titulo={t.titulo} descricao={t.descricao} idioma={idioma} interna={false}>
  <main id="conteudo">
    <!-- O h1 do site atual é o logotipo com `font: 0/0 a`: nenhum texto chega
         ao leitor de tela. Aqui é texto real, oculto visualmente. -->
    <h1 class="sr-only">Alupar</h1>

    <section aria-label={t.destaques}>
      <Destaque href={t.banner.href ?? undefined} class="banner">
        <Picture src={BANNER[idioma]} alt={t.banner.alt} formats={['avif', 'webp']}
          widths={[640, 1280, 1920]} sizes="100vw" loading="eager" fetchpriority="high" />
        <span class="legenda">{t.banner.legenda}</span>
      </Destaque>
    </section>

    <section class="faixa" aria-label={t.emNumeros}>
      <div class="container">
        <ul>
          {indicadores.map((i) => (
            <li>
              <span class="valor" data-pendente={i.valor === null}>{i.valor ?? '—'}</span>
              <span class="rotulo">{i.rotulo}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <div class="container caixas">
      <section class="caixa" aria-labelledby="h-noticias">
        <h2 id="h-noticias">{t.noticias}</h2>
        <ul class="noticias">
          {noticias.map((n) => (
            <li>
              <time datetime={n.data}>{formato.format(new Date(`${n.data}T00:00:00Z`))}</time>
              <a href={n.rota}>{n.titulo}</a>
            </li>
          ))}
        </ul>
        <a class="mais" href={`${pre}/noticias/`}><span class="circulo" aria-hidden="true">+</span> {t.verMaisNoticias}</a>
      </section>

      <section class="caixa" aria-labelledby="h-video">
        <h2 id="h-video">{t.videoInstitucional}</h2>
        <a class="video" href="https://www.youtube.com/watch?v=oqjwsKfpYZ4" data-video="oqjwsKfpYZ4" data-titulo={t.videoInstitucional}>
          <Picture src={capaVideo} alt="" formats={['avif', 'webp']} widths={[360, 720]} sizes="(min-width: 768px) 360px, 100vw" />
          <span class="sr-only">{t.assistirVideo}</span>
        </a>
        <a class="mais" href={`${pre}/videos/`}><span class="circulo" aria-hidden="true">+</span> {t.verMaisVideos}</a>
      </section>

      <section class="caixa" aria-labelledby="h-sustentabilidade">
        <h2 id="h-sustentabilidade">{t.sustentabilidade}</h2>
        <ul class="eixos">
          {t.eixos.map((e, n) => (
            <li>
              <img src={ICONES[n]} alt="" width="29" height="38" />
              <div>
                <h3><a href={t.sustentabilidadeHref}>{e.titulo}</a></h3>
                <p>{e.texto}</p>
              </div>
            </li>
          ))}
        </ul>
        <a class="mais" href={t.sustentabilidadeHref}><span class="circulo" aria-hidden="true">+</span> {t.saibaMais}</a>
      </section>
    </div>
  </main>
</Base>

<style>
  .banner { position: relative; display: block; }
  .banner :global(img) { display: block; width: 100%; height: auto; }
  .legenda {
    position: absolute; left: 50%; bottom: 12%; transform: translateX(-50%);
    color: var(--branco); font-size: clamp(1rem, 0.6rem + 1.6vw, 1.75rem); font-weight: 700;
  }

  .faixa { border-block: 1px solid var(--cinza-borda); background: var(--cinza-fundo); }
  .faixa ul {
    list-style: none; margin: 0; padding: var(--e5) 0;
    display: grid; gap: var(--e4);
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  .faixa li { display: flex; flex-direction: column; gap: var(--e1); }
  .valor { font-size: 2rem; font-weight: 700; line-height: 1.1; color: var(--verde-texto); }
  .valor[data-pendente='true'] { color: var(--cinza); }
  .rotulo { font-size: .875rem; color: var(--preto); }

  /* .box-home do tema: branca, sombra 3px 3px 5px, título azul 20px */
  .caixas { display: grid; gap: 30px; padding-block: var(--e5) 50px; }
  @media (min-width: 768px) { .caixas { grid-template-columns: repeat(3, 1fr); } }
  .caixa {
    display: flex; flex-direction: column; background: var(--branco);
    padding: 1px 20px 8px; box-shadow: 3px 3px 5px 0 rgba(0, 0, 0, .2);
  }
  .caixa h2 { color: var(--azul); font-size: 20px; text-transform: uppercase; margin: 20px 0; }

  .noticias { list-style: none; margin: 0; padding: 0; flex: 1; }
  .noticias li { margin-bottom: var(--e3); }
  .noticias time { display: block; font-weight: 700; }
  .noticias a { color: var(--preto); }

  .video { position: relative; display: block; aspect-ratio: 4 / 3; flex: 1; }
  .video :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .video::after {
    content: '▶' / ''; position: absolute; inset: 0; display: grid; place-items: center;
    font-size: 3rem; color: var(--branco);
  }

  .eixos { list-style: none; margin: 0; padding: 0; flex: 1; }
  .eixos li { display: flex; gap: 20px; padding-block: var(--e3); border-bottom: 1px solid #EFEEEF; }
  .eixos li:last-child { border-bottom: none; }
  .eixos h3 { font-size: 1rem; margin: 0 0 var(--e1); }
  .eixos h3 a { color: var(--preto); }
  .eixos p { margin: 0; line-height: 24px; }

  /* a.btn-link-mais do tema: caixa alta 12px, sublinhado verde de 4px */
  .mais {
    align-self: flex-end; margin: 9px -20px 0 0; padding: 0 5px 12px;
    position: relative; color: var(--preto); font-size: 12px; text-transform: uppercase; text-decoration: none;
  }
  .mais::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; border-bottom: 4px solid var(--verde); }
  .circulo {
    display: inline-block; width: 15px; height: 15px; margin-right: 3px;
    border: 1px solid #5F5D5E; border-radius: 50%; line-height: 12px; text-align: center;
  }
</style>
```

- [ ] **Passo 4:** acrescentar ao fim de `public/js/site.js`

```js
// Vídeo sob demanda: a capa é local e o player do YouTube (~1 MB) só carrega
// no clique. Sem JS, o link leva ao vídeo no YouTube.
for (const a of document.querySelectorAll('a[data-video]')) {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${a.dataset.video}?autoplay=1`;
    player.title = a.dataset.titulo;
    player.allow = 'autoplay; encrypted-media; picture-in-picture';
    player.allowFullscreen = true;
    player.className = 'video';
    a.replaceWith(player);
    player.focus();
  });
}
```

A CSP já admite `frame-src https://www.youtube-nocookie.com` — nada muda em `_headers`.

- [ ] **Passo 5:** verificar

```bash
npm test && npm run build
node scripts/verificar-links.mjs && node scripts/fechar-continuidade.mjs --verificar
npx --yes @lhci/cli@0.14.x collect && npx --yes @lhci/cli@0.14.x assert
# esperado: as três homes abaixo de 614.400 B, LCP < 2,5 s (o banner, com
# fetchpriority), CLS < 0,1, acessibilidade 1,0
```

- [ ] **Passo 6:** no preview: conferência lado a lado com `www.alupar.com.br` em 390/768/1280 px; clicar a capa do vídeo e confirmar que o player abre e recebe o foco; navegar a home só com teclado. Levar ao Marketing, **no link**, as decisões P1 (banner ES) e P8 (vídeo no clique)

- [ ] **Passo 7:** commit, PR, merge quando verde

```bash
git add src/assets/banners src/assets/video-institucional.jpg public/img/tema src/components/Home.astro src/i18n/textos.ts public/js/site.js
git commit -m "feat: home completa — banner, notícias, vídeo sob demanda e sustentabilidade"
git push -u origin feat/home && gh pr create --fill --base main
```

### Tarefa 9: listagem de notícias e arquivo paginado

`/noticias/` existe hoje como página do acervo com 33 palavras de casca. Passa
a ser a listagem gerada (N2), e nasce o arquivo paginado (N3) — que mantém as
notícias alcançáveis por link, não só por 301.

**Files:**
- Create: `src/lib/noticias.ts`, `src/lib/noticias.test.ts`, `src/components/ListaNoticias.astro`
- Create: `src/pages/noticias/index.astro`, `src/pages/en/noticias/index.astro`, `src/pages/es/noticias/index.astro`
- Create: `src/pages/noticias/arquivo/[...pagina].astro`, `src/pages/en/noticias/arquivo/[...pagina].astro`, `src/pages/es/noticias/arquivo/[...pagina].astro`
- Modify: `src/lib/acervo.ts`, `src/pages/[...rota].astro`, `src/components/Home.astro`, `src/i18n/textos.ts`, `lighthouserc.json`

**Interfaces:**
- Produz: `recentes<T extends { data: string | null }>(lista: T[], hoje: Date, meses = 24, minimo = 6): T[]` em `src/lib/noticias.ts`
- Produz: `noticiasDe(idioma: 'pt' | 'en' | 'es'): Item[]` (mais recente primeiro) e `SUBSTITUIDAS: Set<string>` em `src/lib/acervo.ts` — a Tarefa 10 acrescenta rotas a esse conjunto
- Produz: `textos[idioma].arquivo`, `.anterior`, `.proxima`

- [ ] **Passo 1:** branch e teste — `src/lib/noticias.test.ts`

```bash
git switch main && git pull && git switch -c feat/noticias
```

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recentes } from './noticias.ts';

const n = (data: string | null) => ({ data });
const hoje = new Date('2026-09-10T12:00:00Z');

test('corta em 24 meses quando há notícias suficientes (D9)', () => {
  const lista = ['2026-09-01', '2026-06-01', '2026-01-01', '2025-06-01', '2025-01-01', '2024-10-01', '2024-01-01'].map(n);
  assert.deepEqual(
    recentes(lista, hoje).map((i) => i.data),
    ['2026-09-01', '2026-06-01', '2026-01-01', '2025-06-01', '2025-01-01', '2024-10-01'],
  );
});

test('abaixo do mínimo, completa com as mais recentes (decisão P2)', () => {
  const lista = ['2021-11-09', '2023-03-02', '2022-11-09', '2022-08-09', '2022-05-10', '2022-02-24', '2020-01-01'].map(n);
  assert.deepEqual(
    recentes(lista, hoje).map((i) => i.data),
    ['2023-03-02', '2022-11-09', '2022-08-09', '2022-05-10', '2022-02-24', '2021-11-09'],
  );
});

test('item sem data não entra', () => {
  assert.deepEqual(recentes([n('2026-01-01'), n(null)], hoje, 24, 1).map((i) => i.data), ['2026-01-01']);
});
```

- [ ] **Passo 2:** `npm test` — esperado: FAIL, `Cannot find module './noticias.ts'`

- [ ] **Passo 3:** `src/lib/noticias.ts`

```ts
/**
 * A listagem principal mostra os últimos 24 meses (D9). A última notícia do
 * acervo é de 02/03/2023, então a regra pura deixaria a página vazia na
 * virada: abaixo de `minimo`, completa com as mais recentes (decisão P2).
 * Quando a publicação voltar, o corte volta a ser o de D9 sem mudar uma linha.
 */
export function recentes<T extends { data: string | null }>(lista: T[], hoje: Date, meses = 24, minimo = 6): T[] {
  const ordenada = lista
    .filter((i) => i.data)
    .sort((a, b) => (b.data as string).localeCompare(a.data as string));
  const corte = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - meses, hoje.getUTCDate()));
  const dentro = ordenada.filter((i) => new Date(`${i.data}T00:00:00Z`) >= corte);
  return dentro.length >= minimo ? dentro : ordenada.slice(0, minimo);
}
```

- [ ] **Passo 4:** `npm test` — esperado: PASS

- [ ] **Passo 5:** `src/lib/acervo.ts`, depois de `itens()`:

```ts
/** Notícias de um idioma, da mais recente para a mais antiga. */
export function noticiasDe(idioma: Item['idioma']): Item[] {
  return itens()
    .filter((i) => i.tipo === 'noticia' && i.idioma === idioma && i.data)
    .sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''));
}

/**
 * Rotas do acervo que ganham página própria em `src/pages/` e por isso não
 * são geradas por `[...rota].astro` — senão as duas disputariam o caminho.
 * O mapa de rotas continua listando-as: o endereço existe, só muda quem o gera.
 */
export const SUBSTITUIDAS = new Set(['/noticias/', '/en/noticias/', '/es/noticias/']);
```

Em `src/pages/[...rota].astro`, `getStaticPaths` passa a filtrar:
`return itens().filter((i) => !SUBSTITUIDAS.has(i.rota)).map((i) => ({ … }));`
(e `SUBSTITUIDAS` entra no import de `../lib/acervo`).

Em `src/components/Home.astro`, trocar o cálculo de `noticias` por
`const noticias = noticiasDe(codigo).slice(0, 6);` e o import de `itens` por `noticiasDe`.

- [ ] **Passo 6:** `src/i18n/textos.ts` — `arquivo: string; anterior: string; proxima: string;` na interface, e (todos `// novo`):

```ts
// 'pt-br'
    arquivo: 'Arquivo de notícias', anterior: 'Página anterior', proxima: 'Próxima página',
// en
    arquivo: 'News archive', anterior: 'Previous page', proxima: 'Next page',
// es
    arquivo: 'Archivo de noticias', anterior: 'Página anterior', proxima: 'Página siguiente',
```

- [ ] **Passo 7:** `src/components/ListaNoticias.astro`

```astro
---
/**
 * Listagem de notícias (N2) e arquivo paginado (N3), nos três idiomas.
 * Com `pagina`, é o arquivo; sem, é a listagem, que aponta para o arquivo.
 */
import type { Page } from 'astro';
import Base from '../layouts/Base.astro';
import type { Item } from '../lib/acervo';
import { textos, prefixo, lang, type Idioma } from '../i18n/textos';

interface Props { idioma: Idioma; lista: Item[]; pagina?: Page<Item> }
const { idioma, lista, pagina } = Astro.props;
const t = textos[idioma];
const formato = new Intl.DateTimeFormat(lang[idioma], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const titulo = pagina
  ? `${t.arquivo}${pagina.currentPage > 1 ? ` — ${pagina.currentPage}` : ''}`
  : t.noticias;
---
<Base titulo={`${titulo} — Alupar`} descricao={t.descricao} idioma={idioma}>
  <main id="conteudo" class="container pagina">
    <h1>{titulo}</h1>
    <ul class="lista">
      {lista.map((n) => (
        <li>
          <time datetime={n.data}>{formato.format(new Date(`${n.data}T00:00:00Z`))}</time>
          <a href={n.rota}>{n.titulo}</a>
        </li>
      ))}
    </ul>
    {pagina ? (
      <nav class="paginas" aria-label={t.arquivo}>
        {pagina.url.prev && <a href={pagina.url.prev} rel="prev">{t.anterior}</a>}
        {pagina.url.next && <a href={pagina.url.next} rel="next">{t.proxima}</a>}
      </nav>
    ) : (
      <p><a href={`${prefixo[idioma]}/noticias/arquivo/`}>{t.arquivo}</a></p>
    )}
  </main>
</Base>

<style>
  .pagina { padding-block: var(--e6) var(--e7); }
  h1 { color: var(--azul); }
  .lista { list-style: none; margin: 0 0 var(--e5); padding: 0; }
  .lista li { padding-block: var(--e3); border-bottom: 1px solid var(--cinza-borda); }
  .lista time { display: block; font-size: .875rem; color: var(--cinza); }
  .lista a { color: var(--preto); font-weight: 600; }
  .paginas { display: flex; justify-content: space-between; gap: var(--e4); }
</style>
```

- [ ] **Passo 8:** as seis páginas. `src/pages/noticias/index.astro`:

```astro
---
import ListaNoticias from '../../components/ListaNoticias.astro';
import { noticiasDe } from '../../lib/acervo';
import { recentes } from '../../lib/noticias';
---
<ListaNoticias idioma="pt-br" lista={recentes(noticiasDe('pt'), new Date())} />
```

`src/pages/noticias/arquivo/[...pagina].astro`:

```astro
---
import type { GetStaticPaths } from 'astro';
import ListaNoticias from '../../../components/ListaNoticias.astro';
import { noticiasDe } from '../../../lib/acervo';

export const getStaticPaths = (({ paginate }) => paginate(noticiasDe('pt'), { pageSize: 20 })) satisfies GetStaticPaths;
const { page } = Astro.props;
---
<ListaNoticias idioma="pt-br" lista={page.data} pagina={page} />
```

Em `src/pages/en/…` e `src/pages/es/…`: os mesmos dois arquivos, com um `../`
a mais em cada import, `idioma="en"`/`"es"` e `noticiasDe('en')`/`('es')`.

- [ ] **Passo 9:** `lighthouserc.json` — acrescentar à lista `collect.url` (mais cobertura, nenhum limite tocado):

```json
        "http://localhost/noticias/index.html",
        "http://localhost/noticias/arquivo/index.html",
```

- [ ] **Passo 10:** verificar

```bash
npm test && npm run build
ls dist/noticias/arquivo/ dist/en/noticias/arquivo/
# esperado: index.html e as pastas 2/, 3/… (20 notícias por página)
grep -c "<li>" dist/noticias/index.html
# esperado: ≥ 6 — a listagem não nasce vazia
node scripts/verificar-links.mjs && node scripts/fechar-continuidade.mjs --verificar && node scripts/gerar-mapa-de-rotas.mjs --verificar
npx --yes @lhci/cli@0.14.x collect && npx --yes @lhci/cli@0.14.x assert
```

- [ ] **Passo 11:** commit, PR, merge quando verde

```bash
git add src/lib/noticias.ts src/lib/noticias.test.ts src/lib/acervo.ts src/components/ListaNoticias.astro src/components/Home.astro \
  src/pages/noticias src/pages/en/noticias src/pages/es/noticias "src/pages/[...rota].astro" src/i18n/textos.ts lighthouserc.json
git commit -m "feat: listagem de notícias e arquivo paginado nos três idiomas"
git push -u origin feat/noticias && gh pr create --fill --base main
```

### Tarefa 10: contato — dados de hoje e formulário acessível

O corpo de `/contato/` no acervo traz o formulário antigo, que postava para a
MZ: cinco campos e um `<label>`. Os dados publicados (endereço, telefones,
assessoria de imprensa) ficam como estão — revisá-los, fax incluído, é da
Comunicação (C5). O formulário é refeito: rótulo visível por campo (C1),
validação no servidor, Turnstile (C4) e consentimento explícito (C3).

**Depende de P5** (destino, texto LGPD, retenção). O código fica pronto sem
eles; sem os três até a homologação, a Tarefa 12 remove o `<form>` e a página
vai com os dados de contato.

**Files:**
- Create: `src/lib/contato.ts`, `src/lib/contato.test.ts`, `functions/api/contato.ts`, `src/components/Contato.astro`
- Create: `src/pages/contato/index.astro`, `src/pages/contato/[aviso].astro` e os mesmos dois em `src/pages/en/contato/` e `src/pages/es/contato/`
- Modify: `src/lib/acervo.ts`, `src/i18n/textos.ts`, `public/_headers`, `astro.config.mjs`, `lighthouserc.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Consome: `SUBSTITUIDAS` (Tarefa 9)
- Produz: `validar(d: Record<string, string | undefined>): Campo[]`, com `Campo = 'nome' | 'email' | 'assunto' | 'mensagem' | 'consentimento'`; `semFormulario(corpo: string): string` em `acervo.ts`; `POST /api/contato` → 303 para `<prefixo>contato/obrigado/` ou `<prefixo>contato/nao-enviado/`

- [ ] **Passo 1:** branch e teste — `src/lib/contato.test.ts`

```bash
git switch main && git pull && git switch -c feat/contato
```

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar } from './contato.ts';

const valido = { nome: 'Ana', email: 'ana@exemplo.com', assunto: 'Visita', mensagem: 'Olá', consentimento: 'sim' };

test('formulário completo passa', () => assert.deepEqual(validar(valido), []));

test('obrigatórios em branco reprovam, só espaço conta como branco', () =>
  assert.deepEqual(validar({ ...valido, nome: '  ', assunto: undefined }), ['nome', 'assunto']));

test('e-mail sem domínio reprova', () => assert.deepEqual(validar({ ...valido, email: 'ana@' }), ['email']));

test('mensagem acima de 5.000 caracteres reprova', () =>
  assert.deepEqual(validar({ ...valido, mensagem: 'x'.repeat(5001) }), ['mensagem']));

test('sem consentimento não envia (LGPD)', () =>
  assert.deepEqual(validar({ ...valido, consentimento: undefined }), ['consentimento']));
```

- [ ] **Passo 2:** `npm test` — esperado: FAIL, `Cannot find module './contato.ts'`

- [ ] **Passo 3:** `src/lib/contato.ts`

```ts
/**
 * Validação do formulário de contato. O navegador aplica a mesma regra pelos
 * atributos do HTML, mas é esta que vale: a do navegador se contorna.
 */
export type Campo = 'nome' | 'email' | 'assunto' | 'mensagem' | 'consentimento';

export function validar(d: Record<string, string | undefined>): Campo[] {
  const erros: Campo[] = [];
  if (!d.nome?.trim()) erros.push('nome');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email?.trim() ?? '')) erros.push('email');
  if (!d.assunto?.trim()) erros.push('assunto');
  if ((d.mensagem ?? '').length > 5000) erros.push('mensagem');
  if (d.consentimento !== 'sim') erros.push('consentimento');
  return erros;
}
```

`npm test` — esperado: PASS.

- [ ] **Passo 4:** `functions/api/contato.ts` — Pages Function, publicada junto pelo `wrangler pages deploy` da Tarefa 6

```ts
/**
 * Recebe o formulário de contato: valida, confere o Turnstile e envia por
 * e-mail. Segredos só no ambiente do Pages — nunca no repositório.
 * Responde sempre com 303 para uma página estática: funciona sem JavaScript.
 */
import { validar } from '../../src/lib/contato';

interface Env {
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  CONTATO_DESTINO: string;
  CONTATO_REMETENTE: string;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const d = Object.fromEntries([...(await request.formData())].map(([k, v]) => [k, String(v)]));
  const prefixo = ['/', '/en/', '/es/'].includes(d.prefixo) ? d.prefixo : '/';
  const volta = (aviso: 'obrigado' | 'nao-enviado') =>
    Response.redirect(new URL(`${prefixo}contato/${aviso}/`, request.url).toString(), 303);

  if (validar(d).length) return volta('nao-enviado');

  const verificacao = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET,
      response: d['cf-turnstile-response'] ?? '',
      remoteip: request.headers.get('CF-Connecting-IP') ?? '',
    }),
  });
  if (!((await verificacao.json()) as { success: boolean }).success) return volta('nao-enviado');

  const envio = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTATO_REMETENTE,
      to: env.CONTATO_DESTINO,
      reply_to: d.email.trim(),
      subject: `[alupar.com.br] ${d.assunto.trim()}`,
      text: ['nome', 'email', 'empresa', 'telefone', 'assunto', 'mensagem'].map((k) => `${k}: ${d[k] ?? ''}`).join('\n'),
    }),
  });
  return volta(envio.ok ? 'obrigado' : 'nao-enviado');
}
```

- [ ] **Passo 5:** `src/lib/acervo.ts` — acrescentar ao `SUBSTITUIDAS` as rotas `'/contato/', '/en/contato/', '/es/contato/'`, e depois dele:

```ts
/** O contato do acervo traz o formulário antigo, que postava para a MZ: sai, ficam os dados. */
export const semFormulario = (corpo: string) =>
  serialize(parseFragment(corpo.split('<div id="formFaleComRi"')[0]) as never);
```

(`parseFragment` e `serialize` já estão importados; o parser fecha as tags que o corte deixa abertas.)

- [ ] **Passo 6:** `src/i18n/textos.ts` — `formulario: { obrigatorios, nome, email, empresa, telefone, assunto, mensagem, consentimento, enviar, obrigado, naoEnviado: string }` na interface. Rótulos em PT lidos do formulário atual; o resto é `// novo`, e o `consentimento` é **provisório até o parecer da Clarice (P5)**:

```ts
// 'pt-br'
    formulario: {
      obrigatorios: '* Campos obrigatórios', // novo
      nome: 'Nome', email: 'E-mail', empresa: 'Empresa', telefone: 'Telefone', assunto: 'Assunto', mensagem: 'Mensagem',
      consentimento: 'Concordo com o uso dos meus dados para a resposta a este contato, conforme a', // provisório — P5
      enviar: 'Enviar mensagem',
      obrigado: 'Mensagem enviada. Obrigado pelo contato.', // novo
      naoEnviado: 'Não foi possível enviar a mensagem. Confira os campos e tente de novo.', // novo
    },
// en
    formulario: {
      obrigatorios: '* Required fields',
      nome: 'Name', email: 'Email', empresa: 'Company', telefone: 'Phone', assunto: 'Subject', mensagem: 'Message',
      consentimento: 'I agree to the use of my data to answer this message, as described in the', // provisório — P5
      enviar: 'Send message',
      obrigado: 'Message sent. Thank you for getting in touch.',
      naoEnviado: 'The message could not be sent. Please check the fields and try again.',
    },
// es
    formulario: {
      obrigatorios: '* Campos obligatorios',
      nome: 'Nombre', email: 'Correo electrónico', empresa: 'Empresa', telefone: 'Teléfono', assunto: 'Asunto', mensagem: 'Mensaje',
      consentimento: 'Acepto el uso de mis datos para responder a este contacto, conforme la', // provisório — P5
      enviar: 'Enviar mensaje',
      obrigado: 'Mensaje enviado. Gracias por contactarnos.',
      naoEnviado: 'No fue posible enviar el mensaje. Revise los campos e intente de nuevo.',
    },
```

- [ ] **Passo 7:** `src/components/Contato.astro`

```astro
---
/**
 * Contato: os dados publicados hoje, vindos do acervo sem o formulário antigo,
 * e o formulário novo — rótulo visível em cada campo (C1), a única mudança
 * realmente perceptível do projeto, já prevista em restauro-fiel.
 *
 * Sem `PUBLIC_TURNSTILE_SITE_KEY` no build (máquina local), usa a chave de
 * teste da Cloudflare, que sempre aprova. Em produção a chave vem do CI.
 */
import Base from '../layouts/Base.astro';
import { itens, semFormulario } from '../lib/acervo';
import { textos, prefixo, type Idioma } from '../i18n/textos';

interface Props { idioma: Idioma; aviso?: 'obrigado' | 'nao-enviado' }
const { idioma, aviso } = Astro.props;
const t = textos[idioma];
const f = t.formulario;
const pre = prefixo[idioma];
const item = itens().find((i) => i.rota === `${pre}/contato/`);
if (!item) throw new Error(`acervo sem ${pre}/contato/`);
// `||`, não `??`: variável de repositório ausente chega ao build como string vazia.
const CHAVE = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
---
<Base titulo={`${item.titulo} — Alupar`} descricao={t.descricao} idioma={idioma}>
  <main id="conteudo" class="container pagina">
    <h1>{item.titulo}</h1>
    {aviso && <p class="aviso" role="status">{aviso === 'obrigado' ? f.obrigado : f.naoEnviado}</p>}
    <div class="dados" set:html={semFormulario(item.corpo)} />

    {aviso !== 'obrigado' && (
      <form method="post" action="/api/contato" aria-describedby="obrigatorios">
        <input type="hidden" name="prefixo" value={`${pre}/`} />
        <p id="obrigatorios">{f.obrigatorios}</p>
        <div class="campo"><label for="nome">{f.nome} *</label><input id="nome" name="nome" required autocomplete="name" /></div>
        <div class="campo"><label for="email">{f.email} *</label><input id="email" name="email" type="email" required autocomplete="email" /></div>
        <div class="campo"><label for="empresa">{f.empresa}</label><input id="empresa" name="empresa" autocomplete="organization" /></div>
        <div class="campo"><label for="telefone">{f.telefone}</label><input id="telefone" name="telefone" type="tel" autocomplete="tel" /></div>
        <div class="campo"><label for="assunto">{f.assunto} *</label><input id="assunto" name="assunto" required /></div>
        <div class="campo largo"><label for="mensagem">{f.mensagem}</label><textarea id="mensagem" name="mensagem" rows="8" maxlength="5000"></textarea></div>
        <div class="consentimento">
          <input id="consentimento" name="consentimento" type="checkbox" value="sim" required />
          <label for="consentimento">{f.consentimento} <a href={t.rodape.privacidadeHref}>{t.rodape.privacidade}</a>. *</label>
        </div>
        <div class="cf-turnstile" data-sitekey={CHAVE} data-language={idioma}></div>
        <button type="submit">{f.enviar}</button>
      </form>
    )}
  </main>
  <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</Base>

<style>
  .pagina { padding-block: var(--e6) var(--e7); }
  h1 { color: var(--azul); }
  .aviso { padding: var(--e3); border-left: 4px solid var(--verde); background: var(--cinza-fundo); }
  form { display: grid; gap: var(--e3); max-width: 760px; margin-top: var(--e5); }
  @media (min-width: 768px) { form { grid-template-columns: 1fr 1fr; } .largo, .consentimento, #obrigatorios, .cf-turnstile, button { grid-column: 1 / -1; } }
  .campo { display: flex; flex-direction: column; gap: var(--e1); }
  label { font-weight: 600; }
  input:not([type='checkbox']), textarea { font: inherit; padding: var(--e2); border: 1px solid var(--cinza); }
  .consentimento { display: flex; gap: var(--e2); align-items: flex-start; }
  button {
    justify-self: start; font: inherit; text-transform: uppercase; cursor: pointer;
    padding: var(--e2) var(--e4); border: 0; background: var(--azul); color: var(--branco);
  }
</style>
```

- [ ] **Passo 8:** as páginas. `src/pages/contato/index.astro`:

```astro
---
import Contato from '../../components/Contato.astro';
---
<Contato idioma="pt-br" />
```

`src/pages/contato/[aviso].astro`:

```astro
---
import Contato from '../../components/Contato.astro';
export const getStaticPaths = () => [{ params: { aviso: 'obrigado' } }, { params: { aviso: 'nao-enviado' } }];
---
<Contato idioma="pt-br" aviso={Astro.params.aviso as 'obrigado' | 'nao-enviado'} />
```

Em `src/pages/en/contato/` e `src/pages/es/contato/`: os mesmos dois, com um
`../` a mais e `idioma="en"`/`"es"`.

- [ ] **Passo 9:** `astro.config.mjs` — as páginas de aviso não entram no sitemap:

```js
  integrations: [sitemap({ filter: (pagina) => !/\/contato\/(obrigado|nao-enviado)\/$/.test(pagina) })],
```

- [ ] **Passo 10:** `public/_headers`, na CSP: `script-src 'self' https://challenges.cloudflare.com;` e `frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com;`. `lighthouserc.json`: acrescentar `"http://localhost/contato/index.html"`. `ci.yml`: nos dois passos `npm run build` (jobs `build` e `qualidade`), acrescentar

```yaml
        env:
          PUBLIC_TURNSTILE_SITE_KEY: ${{ vars.TURNSTILE_SITE_KEY }}
```

- [ ] **Passo 11:** verificar local

```bash
npm test && npm run build
grep -c "<label" dist/contato/index.html dist/en/contato/index.html
# esperado: 7 em cada — um por campo, mais o consentimento
grep -c "formFaleComRi" dist/contato/index.html
# esperado: 0 — o formulário antigo saiu
node scripts/verificar-links.mjs && node scripts/fechar-continuidade.mjs --verificar
npx --yes @lhci/cli@0.14.x collect && npx --yes @lhci/cli@0.14.x assert
```

Se o Turnstile derrubar `best-practices` de `/contato/`, o limite fica: é conversa sobre o provedor antiespam, não sobre o critério.

- [ ] **Passo 12:** configurar os serviços (uma vez, conta da ness.)
  - Turnstile → novo widget, hostnames `www.alupar.com.br` e `sitealupar.pages.dev`; `gh variable set TURNSTILE_SITE_KEY` com a chave pública
  - Resend → domínio de envio `envio.alupar.com.br`, registros de DNS **só nesse subdomínio** — o MX do apex é do Google Workspace e não pode ser tocado
  - Segredos do Pages, um por vez (o valor é digitado, não fica em arquivo):

```bash
for s in TURNSTILE_SECRET RESEND_API_KEY CONTATO_DESTINO CONTATO_REMETENTE; do
  npx --yes wrangler@4 pages secret put $s --project-name sitealupar
done
```

  `CONTATO_DESTINO`, até a Alupar responder P5: uma caixa de teste da ness.

- [ ] **Passo 13:** no preview do PR: enviar o formulário preenchido e confirmar que chega a `/contato/obrigado/` e que o e-mail chega; enviar sem consentimento com o JavaScript desligado e confirmar `/contato/nao-enviado/`; fazer o percurso inteiro só com teclado e com leitor de tela (NVDA): cada campo anuncia o rótulo

- [ ] **Passo 14:** commit, PR, merge quando verde

```bash
git add src/lib/contato.ts src/lib/contato.test.ts functions src/components/Contato.astro src/pages/contato src/pages/en/contato \
  src/pages/es/contato src/lib/acervo.ts src/i18n/textos.ts public/_headers astro.config.mjs lighthouserc.json .github/workflows/ci.yml
git commit -m "feat: contato com formulário acessível, Turnstile e envio pelo Pages"
git push -u origin feat/contato && gh pr create --fill --base main
```

---

## Fase 3 — homologação e virada (semana 3)

### Tarefa 11: verificação no ar e sentinela diária (Marco 0.7)

`fechar-continuidade.mjs` confere o **build**. As regras de borda — apex e
`?lang=` — só existem no domínio, e o critério do M5 ("nenhum endereço antigo
quebrado por 7 dias") é medido no ar. Daí um verificador que pede cada
endereço ao domínio de verdade, e uma checagem diária que o GitHub avisa por
e-mail quando falha.

**Files:**
- Create: `scripts/verificar-no-ar.mjs`, `.github/workflows/sentinela.yml`

- [ ] **Passo 1:** `scripts/verificar-no-ar.mjs`

```bash
git switch main && git pull && git switch -c feat/sentinela
```

```js
/**
 * Continuidade medida no ar: cada endereço vivo do acervo, pedido ao domínio
 * de verdade, termina em 200 depois de seguir os 301. É a verificação da
 * virada e o critério do M5 — nenhum endereço antigo quebrado por 7 dias.
 *
 * Diferente de fechar-continuidade.mjs, que confere o build: aqui entram as
 * regras de borda (apex, ?lang=), que só existem em www.alupar.com.br. Contra
 * o pages.dev, os endereços com ?lang= ficam de fora — lá não há borda.
 *
 *   node scripts/verificar-no-ar.mjs                                # www.alupar.com.br
 *   node scripts/verificar-no-ar.mjs https://sitealupar.pages.dev   # antes da virada
 */
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'https://www.alupar.com.br';
const comBorda = new URL(base).host === 'www.alupar.com.br';
const urls = JSON.parse(readFileSync('acervo/inventario.json', 'utf8'))
  .filter((e) => e.status === 200)
  .map((e) => new URL(e.url))
  .filter((u) => u.host === 'www.alupar.com.br' && (comBorda || !u.searchParams.has('lang')))
  .map((u) => `${base}${u.pathname}${u.search}`);

async function status(url) {
  const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  if (r.status !== 405 && r.status !== 403) return r;
  const g = await fetch(url, { redirect: 'follow' }); // servidor que não aceita HEAD
  await g.body?.cancel();
  return g;
}

const falhas = [];
const fila = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let url = fila.shift(); url; url = fila.shift()) {
    try {
      const r = await status(url);
      if (r.status !== 200) falhas.push(`${r.status} ${url} → ${r.url}`);
    } catch (e) {
      falhas.push(`${e.cause?.code ?? e.message} ${url}`);
    }
  }
}));

console.log(`${urls.length} endereços pedidos a ${base}`);
if (falhas.length) {
  console.error(`reprovado: ${falhas.length} não terminam em 200`);
  for (const f of falhas.slice(0, 30)) console.error(`  ${f}`);
  process.exit(1);
}
console.log('aprovado: todos terminam em 200.');
```

- [ ] **Passo 2:** rodar contra o Pages, nos dois sentidos

```bash
node scripts/verificar-no-ar.mjs https://sitealupar.pages.dev
# esperado: os endereços sem ?lang= pedidos, e "aprovado"
node scripts/verificar-no-ar.mjs https://sitealupar.pages.dev/inexistente; echo "saída: $?"
# esperado: reprovado e saída 1 — o verificador reprova de verdade
```

- [ ] **Passo 3:** `.github/workflows/sentinela.yml`

```yaml
name: Sentinela

# Checagem diária do que ficou quebrado por quatro meses sem ninguém ver:
# o endereço sem www, os certificados e a galeria no NAS (D4). Workflow
# agendado que falha manda e-mail para quem administra o repositório.
on:
  schedule:
    - cron: '0 10 * * *'   # 07:00 em Brasília
  workflow_dispatch:

jobs:
  checar:
    runs-on: ubuntu-latest
    steps:
      - name: Endereços respondem e certificados longe do vencimento (alerta a 30 dias)
        run: |
          falhou=0
          for h in alupar.com.br www.alupar.com.br alupar.us6.quickconnect.to; do
            codigo=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "https://$h/") || codigo=erro
            fim=$(echo | openssl s_client -servername "$h" -connect "$h:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
            dias=$(( ( $(date -d "$fim" +%s) - $(date +%s) ) / 86400 ))
            echo "$h → HTTP $codigo · certificado vence em $dias dias ($fim)"
            case "$codigo" in 200|301|302) ;; *) falhou=1 ;; esac
            [ "$dias" -ge 30 ] || falhou=1
          done
          exit $falhou

      # Depois da virada (variável VIRADA=sim): a continuidade inteira, todo dia.
      - uses: actions/checkout@v4
        if: vars.VIRADA == 'sim'
      - uses: actions/setup-node@v4
        if: vars.VIRADA == 'sim'
        with:
          node-version-file: .nvmrc
      - name: Todo endereço vivo do acervo termina em 200
        if: vars.VIRADA == 'sim'
        run: node scripts/verificar-no-ar.mjs
```

- [ ] **Passo 4:** disparar à mão e ler o resultado

```bash
git add scripts/verificar-no-ar.mjs .github/workflows/sentinela.yml
git commit -m "feat: sentinela diária e verificação de continuidade no ar"
git push -u origin feat/sentinela && gh pr create --fill --base main
# depois do merge:
gh workflow run sentinela.yml && gh run watch
# esperado: verde se a Tarefa 0 foi feita; vermelho, com "alupar.com.br → HTTP erro", se não
```

Fechar a issue #9.

### Tarefa 12: a virada

Operação, sem código novo. A MZ continua no ar até o fim do aviso prévio:
voltar atrás é trocar um registro de DNS.

**Pré-condições — todas, antes de marcar a data:**

- [ ] `main` verde, com as Tarefas 2 a 11 mergeadas
- [ ] P1 a P9 respondidas, ou os padrões aceitos **por escrito** — registrar em `docs/decisoes.md`
- [ ] Sem P5: remover o `<form>` e o `<script>` do Turnstile de `src/components/Contato.astro` num PR próprio
- [ ] P9 no padrão, num PR próprio e **nesta ordem** — o CI é que precisa ver a variável, e ele só a vê numa execução iniciada depois dela:
  1. Cloudflare → Web Analytics → Add a site → `www.alupar.com.br`, **sem** a injeção automática no projeto do Pages; copiar o token do snippet
  2. `gh variable set CF_BEACON_TOKEN --body <token>`, e abrir a CSP para ele (`static.cloudflareinsights.com` no `script-src`, `cloudflareinsights.com` num `connect-src`) — o gate de CSP reprova sem isso
  3. marcar o PR `feat/medicao-web-analytics` como pronto (*Ready for review*), o que **reexecuta o CI**: `ready_for_review` está na lista `types:` de `.github/workflows/ci.yml`
  4. conferir o verde **dessa execução nova**. O verde que já estava no PR é de um build feito sem a variável — o site sairia sem medição nenhuma, e nada acusaria
  5. só então mergear. Se a P9 for pelo GA4, fechar o PR sem merge
- [x] Mídia no R2 (11/09/2026): bucket `alupar-arquivos`, domínio `arquivos.alupar.com.br` ativo, 120 objetos. Conferir de novo com `node scripts/publicar-arquivos.mjs --verificar`
- [x] Turnstile (11/09/2026): widget com `alupar.com.br` e `sitealupar.pages.dev` nos hostnames — o `alupar.com.br` já cobre o `www`
- [ ] Marketing aprovou cabeçalho, rodapé e home **no preview** (portão M2); Comunicação aprovou cada texto marcado `// novo` — `grep -n "// novo\|provisório" src/i18n/textos.ts` dá a lista
- [ ] **Linha de base do GA4 extraída** (páginas mais vistas, origem de tráfego, últimos 12 meses). Depois da virada ela não se recupera
- [ ] Acervo sem novidade desde a extração: `curl -sS https://www.alupar.com.br/noticia-sitemap.xml | grep -c "<loc>"` → 225. Se mudou, rodar a esteira do `acervo/README.md` antes
- [ ] `node scripts/verificar-no-ar.mjs https://sitealupar.pages.dev` aprovado
- [ ] Interlocutor do RI (A2) avisado da data: o RI divide a máquina da MZ com o institucional, e nada muda para `ri.alupar.com.br`

**Na véspera:**

- [ ] DNS → CNAME `www` → TTL de 60 s
- [ ] Rules → Redirect Rules → criar as duas regras de `?lang=` exatamente como em `infra/redirect-rules.md` (depois da regra do apex). Ficam inertes enquanto `www` não tem proxy. Pela API, **acrescentar** (`POST …/rulesets/{id}/rules`); um `PUT` no entrypoint da fase substitui a lista e apaga a regra do apex
- [x] SSL/TLS → Edge Certificates → HSTS → **desligar o HSTS da zona** — feito em 11/09/2026, adiantado da véspera; conferido: apex e `arquivos` sem `Strict-Transport-Security`, `ri` inalterado, `nosniff` mantido. Antes estava ligado com `max-age=0; includeSubDomains; preload`. Com proxy no `www`, esse cabeçalho de zona cobre o `Strict-Transport-Security` do `_headers`, e o `includeSubDomains` na zona é justamente o que não pode existir por causa do `ri.alupar.com.br`. O HSTS do site fica só no `_headers`, por host
- [ ] Opcional: SSL/TLS → Edge Certificates → Minimum TLS → 1.2 (hoje 1.0). Vale só para os hosts com proxy (apex, `www` e `arquivos`); o `ri` está sem proxy e não muda

**No dia:**

- [ ] **Passo 1:** Pages → `sitealupar` → Custom domains → `www.alupar.com.br`. A Cloudflare troca o CNAME para `sitealupar.pages.dev`, com proxy. Esperar o status "Active"
- [ ] **Passo 2:** verificar

```bash
curl -sSI https://www.alupar.com.br/ | grep -iE "^(HTTP|server|content-security|strict-transport)"
# esperado: 200 · server: cloudflare · CSP · HSTS sem includeSubDomains
curl -sSI https://www.alupar.com.br/en/ | grep -iE "^(HTTP|location)"
# esperado: 200, sem location — a regra que sequestrava /en/ morreu com o WordPress (#38)
curl -sSI "https://www.alupar.com.br/a-companhia/?lang=en" | grep -i "^location"
# esperado: https://www.alupar.com.br/en/a-companhia/
curl -sSI https://alupar.com.br/empresas/ | grep -i "^location"
# esperado: https://www.alupar.com.br/empresas/
curl -sSI https://ri.alupar.com.br/ | grep -iE "^(HTTP|server)"
# esperado: igual a ontem — o RI não foi tocado
node scripts/verificar-no-ar.mjs
# esperado: "666 endereços pedidos a https://www.alupar.com.br" e "aprovado"
```

- [ ] **Passo 3:** se o passo 2 reprovar e a correção não sair em 30 minutos, **voltar**: Pages → Custom domains → remover `www`; DNS → CNAME `www` → `sites-clients-03.mziq.com`, proxy desligado. Corrigir com calma e remarcar
- [ ] **Passo 4:** `gh variable set VIRADA --body sim` — a sentinela passa a medir a continuidade todo dia; o M5 conta sete dias verdes

**Depois:**

- [ ] Registrar em `docs/decisoes.md` a data da virada — é o início da cobrança (D15) e o marco para o aviso prévio à MZ
- [ ] Search Console: enviar `https://www.alupar.com.br/sitemap-index.xml`
- [ ] Avisar o RI (A2) de que o certificado curinga `*.alupar.com.br`, que vence em **21/10/2026**, passa a servir só a eles (Marco 0.6)
- [ ] Após sete dias verdes: desligar `34.230.121.250` (a instância que só redirecionava o apex) e fechar as issues #2, #4, #5, #6, #7, #8 e #38

## Tarefas acrescentadas na execução

Duas tarefas que o plano não previa. As duas apareceram ao rodar o Passo 2 da
Tarefa 11 contra o Pages, e nenhuma aparecia no build local: são
comportamentos da borda. Ficam registradas aqui para que o plano continue a
ser o retrato do que foi feito.

### Tarefa 11b: página 404 — o que desliga o modo SPA do Pages

Sem um `404.html` na raiz do build, o Pages trata o site como SPA e serve a
home **com status 200** para qualquer endereço ("Not Found behavior",
developers.cloudflare.com/pages/configuration/serving-pages). Link quebrado
fica invisível, o Google indexa *soft 404* — e o `verificar-no-ar.mjs` nunca
reprova: o teste negativo do Passo 2 da Tarefa 11 passava por isso.

**Files:**
- Create: `src/pages/404.astro` — uma página só, com o texto nos três idiomas: o Astro só gera `404.html` para `src/pages/404.astro`, e o Pages sobe a árvore até o `404.html` mais próximo
- Modify: `src/i18n/textos.ts` (`naoEncontrada`, marcado `// novo`), `scripts/lib/redirects.mjs` (`servido()` reconhece o `404.html` plano, com teste)

```bash
npx --yes wrangler@4 pages dev dist
# esperado: /inexistente, /en/inexistente e /es/inexistente → 404; / → 200
node scripts/verificar-no-ar.mjs http://localhost:8788/inexistente; echo "saída: $?"
# esperado: reprovado e saída 1
```

### Tarefa 11c: regras dinâmicas do `_redirects` por último

Com o modo SPA desligado, o verificador no ar mostrou 31 endereços do acervo
em 404, e o wrangler dizia por quê: *"Maximum number of dynamic rules
supported is 100. Skipping remaining 318 lines of file"*. O parser dele — o
mesmo do Pages — conta como dinâmica toda regra com `*` ou `:nome` na origem
**e toda linha depois da primeira dinâmica**, mesmo sem curinga. As duas
regras com curinga (`/alupar-e-a-covid-19/*` e `/wp-content/uploads/*`)
estavam no meio do arquivo e arrastavam o resto para o limite de 100.

**Files:**
- Modify: `public/_redirects` — bloco final "dinâmicas: sempre por último"
- Modify: `scripts/gerar-redirecionamentos.mjs` — preserva o bloco em vez de reescrever tudo abaixo da marca
- Modify: `scripts/lib/redirects.mjs` — `limitesDoPages()` reproduz a contagem do wrangler (2.000 estáticas, 100 dinâmicas), com teste
- Modify: `scripts/fechar-continuidade.mjs` — `--verificar` reprova quando o arquivo estoura

Semântica preservada: nenhuma regra estática divide prefixo com os curingas,
então a ordem nova não muda o destino de endereço nenhum.

```bash
node scripts/fechar-continuidade.mjs --verificar
# esperado: "aprovado: … (N estáticas, 2 dinâmicas)"
```

---

## Manutenção — as primeiras entregas da mensalidade

Fora deste plano, na ordem em que entram depois da virada. Cada uma ganha seu
próprio plano quando chegar a vez.

1. **Sanity com banner e notícia**, conta em nome da Alupar (D11, Z2), webhook de build. É aqui que se cumpre "a Comunicação publica sem chamado a fornecedor"
2. **Notícias de 03/2023 até hoje** — pelo feed do RI (D5) ou por carga manual (Marco 0.3). Com elas, a listagem volta ao corte puro de D9
3. **Faixa institucional completa**, quando a Alupar enviar km de linhas e MW instalados
4. **Carrossel** (H1) e recorte de banner por breakpoint, quando houver dois ou mais banners
5. **Paridade EN/ES**: as 44 revisões de `docs/revisao-de-conteudo.md` e as 25 tabelas sem `<th>`
6. **Busca** (P3), se o GA4 mostrar uso
7. `rs`, `pdi` e `ma`, por acréscimo na mensalidade (D15)
