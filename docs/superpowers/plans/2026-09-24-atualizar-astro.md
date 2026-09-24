# Astro 5 → 7, e o fim das quinze vulnerabilidades

> **Para quem executa:** SUB-SKILL OBRIGATÓRIA: use superpowers:executing-plans
> para implementar tarefa a tarefa. Os passos usam caixas (`- [ ]`).

**Objetivo:** subir o Astro de 5.18.2 para ≥ 7.2.8 e o sharp para ≥ 0.35.4,
fechando 14 dos 15 alertas abertos, sem mudar uma vírgula do que o visitante vê.

**Arquitetura:** o site é estático — HTML gerado no build e servido pelo
Cloudflare Pages, sem Astro rodando para o visitante. Por isso o upgrade é um
problema de **build**, não de produção, e a prova de que deu certo é
comparar o `dist/` gerado antes e depois: mesmo conjunto de arquivos, mesmo
HTML. Os portões que já existem (testes, continuidade, CSP, Lighthouse, 666
endereços no preview) fazem o resto.

**Tech Stack:** Astro, Vite, sharp, Node 22, GitHub Actions, Cloudflare Pages.

**Spec:** este documento. Os alertas são os do Dependabot do repositório,
apurados em 24/09/2026 e transcritos abaixo.

## O estado apurado em 24/09/2026

Instalado: `astro` **5.18.2** · `@astrojs/sitemap` ^3.2.0 · `sharp` ^0.33.0 ·
`parse5` ^7.3.0. Último Astro publicado: **7.3.5**.

| Gravidade | Pacote | Corrigido em |
|---|---|---|
| crítica | astro — RCE na otimização de imagem AVIF | 7.2.8 |
| alta | astro — SSRF de Host header em página de erro pré-renderizada | 6.4.6 |
| alta | astro — XSS refletido por nome de slot sem escape | 6.3.3 |
| alta ×2 | sharp — libvips e libheif | 0.35.4 |
| alta ×2 | image-size — laço infinito em ICNS, JXL e HEIF | **sem correção** |
| média ×4 | astro — XSS em `define:vars`, spread props, View Transitions | 7.0.6 |
| média | astro — bypass de autorização ao remover o `base` | 7.2.4 |
| baixa ×2 | astro — XSS em `transition:*`, replay de server island | 7.0.4 |
| baixa | esbuild — leitura de arquivo no dev server em Windows | 0.28.1 |

**O que isto realmente expõe, dito com honestidade:** quase nada ao visitante.
Praticamente todos os avisos do Astro valem para renderização sob demanda —
endpoint de imagem, página de erro, ilhas, `define:vars` com entrada de quem
pede. Neste site a renderização acontece **no build**, com o nosso próprio
conteúdo, e o que vai para a Cloudflare é HTML pronto. A exposição real é o
pipeline de build sobre material confiável.

Isso muda a **urgência**, não a decisão. Dois majors de atraso só encarecem, e
quinze alertas permanentes ensinam todo mundo a não olhar para o painel de
segurança — o mesmo vício que este repositório combate em alarme de CI.

`image-size` não tem correção publicada e entra como dependência transitiva do
Astro; a Tarefa 4 registra em vez de fingir que fechou.

## Restrições globais

- **Node ≥ 22.12.0**: exigência do Astro 6 em diante (o v6 tirou Node 18 e 20,
  e o v7 não mexeu nisso). Hoje o repositório declara `engines.node: ">=20"` e
  `.nvmrc` com `22` — os dois precisam subir, ou o CI quebra de um jeito que
  parece defeito do upgrade e não é.
- Código em inglês; comentários, docs e commits em **português**.
- Conventional commits; branches pelo assunto. **Nenhuma atribuição de IA.**
- **A linguagem visual não muda.** Se o `dist/` sair diferente, o upgrade está
  errado até prova em contrário — não é oportunidade de melhorar nada.
- Os limites do Lighthouse no CI **não se afrouxam** para acomodar o upgrade.
- **Não mergear sem aprovação de quem responde pelo site.** O merge em `main`
  publica em produção; o site entrou no ar há um dia.

## Estrutura de arquivos

| Arquivo | O que muda |
|---|---|
| `package.json` | versões de `astro`, `@astrojs/sitemap`, `sharp`; `engines.node` |
| `package-lock.json` | consequência |
| `.nvmrc` | `22` → `22.12.0` |
| `astro.config.mjs` | só se o upgrade exigir |
| `docs/decisoes.md` | D30 |
| `docs/status.md` | estado das dependências |

---

### Tarefa 1: o piso do Node, antes de qualquer upgrade

**Arquivos:**
- Modificar: `package.json` (campo `engines.node`)
- Modificar: `.nvmrc`

**Interfaces:**
- Consome: nada.
- Produz: `engines.node: ">=22.12.0"` e `.nvmrc` com `22.12.0` — o Astro 7 do
  qual a Tarefa 2 depende recusa instalar abaixo disso.

Esta tarefa é separada de propósito: se ela quebrar alguma coisa, a causa é o
Node, e não o Astro. Juntar as duas é como se perde uma tarde.

- [ ] **Passo 1: conferir o Node local**

Rodar: `node --version`
Esperado: `v22.12.0` ou maior. Se for menor, instalar antes de seguir — o
build do Astro 7 não roda, e o erro não vai falar de Node.

- [ ] **Passo 2: subir o piso**

Em `package.json`:

```json
  "engines": {
    "node": ">=22.12.0"
  },
```

Em `.nvmrc`, o arquivo inteiro passa a ser:

```
22.12.0
```

- [ ] **Passo 3: reinstalar e provar que nada se mexeu ainda**

Rodar: `npm ci && npm test && npm run build`
Esperado: `pass 216 / fail 0` e build concluído. Ainda é o Astro 5 — este passo
existe para separar o efeito do Node do efeito do upgrade.

- [ ] **Passo 4: commit**

```bash
git add package.json package-lock.json .nvmrc
git commit -m "chore: piso de Node 22.12.0, exigido pelo Astro 6 em diante"
```

---

### Tarefa 2: guardar o `dist/` de hoje, que é a única régua confiável

**Arquivos:**
- Nenhum no repositório. O artefato vai para fora dele.

**Interfaces:**
- Consome: a Tarefa 1.
- Produz: `../dist-astro5/` — a cópia do build atual, que a Tarefa 4 compara.

Sem esta tarefa não existe critério de "o site não mudou": existiria só a
impressão de quem olha. Ela vem antes do upgrade porque depois é tarde.

- [ ] **Passo 1: build limpo e cópia**

```bash
rm -rf dist && npm run build
cp -r dist ../dist-astro5
ls ../dist-astro5 | head -5
```
Esperado: a listagem mostra o conteúdo do build (`index.html`, pastas de
idioma, `_astro/`).

- [ ] **Passo 2: registrar o tamanho do inventário**

```bash
find dist -type f | wc -l
```
Esperado: um número. **Anotá-lo** — a Tarefa 4 exige o mesmo número.

---

### Tarefa 3: o upgrade

**Arquivos:**
- Modificar: `package.json`, `package-lock.json`
- Modificar: `astro.config.mjs` (somente se o upgrade exigir)

**Interfaces:**
- Consome: Tarefas 1 e 2.
- Produz: `astro` ≥ 7.2.8, `@astrojs/sitemap` compatível, `sharp` ≥ 0.35.4.

- [ ] **Passo 1: ler os guias oficiais antes de rodar qualquer coisa**

Ler, nesta ordem, as seções de *Breaking Changes*:
- https://docs.astro.build/en/guides/upgrade-to/v6/
- https://docs.astro.build/en/guides/upgrade-to/v7/

Procurar especificamente o que este projeto usa, porque é o que pode quebrar:
`i18n.routing.prefixDefaultLocale`, `build.format: 'directory'`,
`image.responsiveStyles`, `vite.build.assetsInlineLimit` na forma de função,
e o `filter` do `@astrojs/sitemap`. Anotar o que mudar **antes** de o build
falhar — ler o guia depois do erro é fazer duas vezes.

- [ ] **Passo 2: rodar o upgrade oficial**

```bash
npx @astrojs/upgrade
```
Esperado: propõe `astro` na 7.x e `@astrojs/sitemap` na versão compatível;
aceitar. Se ele não subir o `sharp`, o passo seguinte resolve.

- [ ] **Passo 3: subir o sharp**

```bash
npm install sharp@^0.35.4
node -p "require('./node_modules/astro/package.json').version + ' / sharp ' + require('./node_modules/sharp/package.json').version"
```
Esperado: astro `7.2.8` ou maior, sharp `0.35.4` ou maior. Se o astro vier
abaixo de 7.2.8, o alerta crítico **continua aberto** — subir à mão com
`npm install astro@^7.3.5` antes de seguir.

- [ ] **Passo 4: checagem de tipos e build**

```bash
npx astro check
npm run build
```
Esperado: `astro check` sem erro; build concluído.

Se o build falhar, **não contornar**: achar em qual opção de
`astro.config.mjs` o guia do Passo 1 mexeu e corrigir ali. Cada linha daquele
arquivo tem um comentário dizendo por que existe — a correção precisa preservar
o motivo, não só fazer compilar. Em particular,
`vite.build.assetsInlineLimit` existe para que a CSP `script-src 'self'` não
bloqueie script embutido: se ela mudar de forma, o efeito tem de ser o mesmo, e
quem prova isso é o `verificar-csp.mjs` do Passo 5.

- [ ] **Passo 5: rodar todos os portões do job `build`, na ordem do CI**

```bash
npm test
node scripts/corrigir-datas.mjs --verificar
node scripts/balancear-conteudo.mjs --verificar
node scripts/otimizar-imagens.mjs --verificar
node scripts/gerar-mapa-de-rotas.mjs --verificar
node scripts/gerar-llms.mjs --verificar
node scripts/fechar-continuidade.mjs --verificar
node scripts/verificar-csp.mjs
```
Esperado: `pass 216 / fail 0` e todos os demais sem erro. O `verificar-csp.mjs`
é o mais importante da lista: é ele que pega script embutido que a CSP
bloquearia — a regressão mais provável deste upgrade.

- [ ] **Passo 6: commit**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "chore: Astro 7 e sharp 0.35.4, fechando 14 dos 15 alertas"
```

---

### Tarefa 4: provar que o site não mudou

**Arquivos:** nenhum. É verificação, e é o coração do plano.

**Interfaces:**
- Consome: `../dist-astro5/` da Tarefa 2 e o build da Tarefa 3.
- Produz: a prova, ou a lista do que mudou.

- [ ] **Passo 1: mesmo número de arquivos**

```bash
find dist -type f | wc -l
```
Esperado: o mesmo número anotado na Tarefa 2, Passo 2. Diferença aqui é grave —
alguma página deixou de ser gerada, ou surgiu arquivo novo.

- [ ] **Passo 2: mesmo conjunto de caminhos**

```bash
(cd ../dist-astro5 && find . -type f | sort) > /tmp/antes.txt
(cd dist && find . -type f | sort) > /tmp/depois.txt
diff /tmp/antes.txt /tmp/depois.txt && echo "mesmos caminhos"
```
Esperado: `mesmos caminhos`. Nomes com hash em `_astro/` **podem** mudar se o
conteúdo do bundle mudou; se só eles diferirem, seguir e explicar no PR.

- [ ] **Passo 3: o HTML é o mesmo**

```bash
for f in index.html en/index.html es/index.html a-companhia/index.html; do
  diff -q "../dist-astro5/$f" "dist/$f" || echo "DIFERE: $f"
done
```
Esperado: nenhuma linha `DIFERE`. Se alguma diferir, rodar `diff` completo
naquele arquivo e julgar: mudança de atributo gerado pelo framework é
aceitável e vai no PR; texto, estrutura ou classe mudada **não é**.

- [ ] **Passo 4: os alertas fecharam**

```bash
npm audit --omit=dev
```
Esperado: nada de `astro`, nada de `sharp`. `image-size` pode permanecer — é a
lacuna conhecida, registrada na Tarefa 5.

- [ ] **Passo 5: abrir o PR e deixar o CI medir**

```bash
git push -u origin chore/astro-7
gh pr create --base main --head chore/astro-7 --title "Astro 7 e sharp 0.35.4"
```

No corpo: a tabela de alertas do topo deste plano, o resultado dos Passos 1 a 4,
a frase honesta sobre a exposição real ser o build e não o visitante, e o que
`image-size` deixa em aberto.

- [ ] **Passo 6: esperar o CI inteiro e ler o Lighthouse**

```bash
gh pr checks --watch
```
Esperado: `build`, `qualidade` e `publicar-preview` verdes. O `qualidade` roda
por completo — `package.json` está na lista do que faz o Lighthouse medir
(`scripts/lib/afeta-o-site.mjs`), e é exatamente para um caso destes que ele
está lá.

- [ ] **Passo 7: os 666 endereços, contra o preview**

```bash
node scripts/verificar-no-ar.mjs <url do preview que o PR publicou>
```
Esperado: `aprovado: todos terminam em 200.`

- [ ] **Passo 8: parar**

**Não mergear.** Levar o PR a quem responde pelo site, com os números dos
Passos 1 a 7. O merge publica em produção, e o site entrou no ar há um dia.

---

### Tarefa 5: registrar o que fechou e o que não fechou

**Arquivos:**
- Modificar: `docs/decisoes.md`
- Modificar: `docs/status.md`

**Interfaces:**
- Consome: Tarefas 3 e 4.
- Produz: o registro.

- [ ] **Passo 1: D30 em `docs/decisoes.md`**

Seguindo o formato das decisões vizinhas:

```markdown
## D30 — Astro 7, e o alerta que fica aberto

**24/09/2026.** O Dependabot apontava 15 vulnerabilidades, uma crítica (RCE na
otimização de imagem AVIF do Astro). Subimos o Astro de 5.18.2 para a série 7 e
o sharp para 0.35.4, o que fecha 14.

**O que essas falhas realmente expunham:** quase nada ao visitante. Elas valem
para renderização sob demanda — endpoint de imagem, página de erro, ilhas,
`define:vars` com entrada de quem pede. Aqui a renderização acontece no build,
sobre o nosso próprio conteúdo, e o que a Cloudflare serve é HTML pronto. A
exposição real era o pipeline de build.

Subimos assim mesmo por dois motivos: dois majors de atraso só encarecem, e
quinze alertas permanentes ensinam a não olhar para o painel de segurança — o
mesmo vício que combatemos em alarme de CI.

**O que não fechou:** `image-size` (duas altas, laço infinito em ICNS, JXL e
HEIF) **não tem correção publicada**. Entra como dependência transitiva do
Astro e é exercitado no build, sobre imagens nossas. Fica aberto e sabido, não
silenciado.

**Como sabemos que o site não mudou:** o `dist/` anterior foi guardado antes do
upgrade e comparado depois — mesmo número de arquivos, mesmo conjunto de
caminhos, mesmo HTML nas páginas conferidas —, mais o CI inteiro e os 666
endereços contra o preview.
```

- [ ] **Passo 2: atualizar `docs/status.md`**

Na seção de dependências (ou criar uma, ao lado das existentes), registrar:
Astro na série 7, sharp 0.35.4, piso de Node 22.12.0, e `image-size` como
pendência sem correção a montante.

- [ ] **Passo 3: commit**

```bash
git add docs/decisoes.md docs/status.md
git commit -m "docs: D30 — Astro 7, e o alerta que continua aberto"
```

---

## Auto-revisão

**Cobertura:** cada linha da tabela de alertas tem destino — astro e sharp nas
Tarefas 1–3, `image-size` declarado em aberto na Tarefa 5, `esbuild` fechado de
carona pelo Vite que o Astro 7 traz (o Passo 4 da Tarefa 4 confirma; se não
confirmar, entra no mesmo registro da Tarefa 5). O piso de Node virou tarefa
própria porque é pré-requisito, não detalhe.

**Placeholders:** nenhum. Cada passo tem comando e `Esperado:`. As duas únicas
coisas que este plano não pode escrever antecipadamente são a URL do preview
(Tarefa 4, Passo 7) e o que o guia de upgrade vai exigir do
`astro.config.mjs` — e essa segunda é um passo de leitura com URLs exatas, não
um "ajustar o que for preciso".

**Consistência:** a versão-alvo é a mesma em todo o plano — astro ≥ 7.2.8
(abaixo disso o alerta crítico fica aberto), sharp ≥ 0.35.4, Node ≥ 22.12.0.

**A tarefa mais fácil de pular, e a que não se pula:** a Tarefa 2. Sem guardar
o `dist/` antes, "o site não mudou" vira opinião. Ela leva um minuto e é a
única régua que este plano tem.
