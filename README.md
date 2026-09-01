# sitealupar

Site institucional da Alupar — `alupar.com.br`.

Substitui o WordPress hospedado pela MZ Group por um site estático publicado
em CDN. **Restauro fiel**: a linguagem visual atual é preservada; o que muda é
o que resolve um problema medido.

O portal de RI (`ri.alupar.com.br`) **não faz parte deste projeto**.

## Stack

| Camada | Escolha |
|---|---|
| Site | Astro, saída estática |
| Estilo | CSS com custom properties — os tokens de marca são as variáveis |
| Conteúdo | Sanity (Studio em `cms.alupar.com.br`) |
| Notícias | Feed do portal de RI |
| Hospedagem | Cloudflare Pages |
| Borda | Proxy Cloudflare, Redirect Rules, cabeçalhos em `public/_headers` |
| Formulário | Cloudflare Worker + Turnstile |
| CI | GitHub Actions com Lighthouse CI e verificador de links |

## Rodar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
```

## Critérios de aceite

Aplicados pelo CI, não pela boa vontade de quem publica:

- Peso da home ≤ 600 KB, imagens ≤ 400 KB
- LCP < 2,5 s · CLS < 0,1 · Lighthouse ≥ 90
- Acessibilidade 100 no Lighthouse, WCAG 2.2 AA sem violação crítica
- 100% das imagens de conteúdo com `alt`
- Paridade PT/EN/ES com `lang` e `hreflang` corretos por rota
- Zero 404 nas 20 URLs antigas e nas 225 notícias

Estado de partida, medido em 01/09/2026: home com **2,19 MB** (84% imagens),
**zero** imagens com `lazy`, `srcset` ou formato moderno, `alt` vazio em todos
os banners.

## Documentos

- [`docs/prd.md`](docs/prd.md) — o que o site precisa ser e por quê; começa aqui
- [`docs/decisoes.md`](docs/decisoes.md) — as doze decisões e seus motivos
- [`docs/marco-0-runbook.md`](docs/marco-0-runbook.md) — as sete ações emergenciais, com verificação

O PRD tem duas seções deliberadamente incompletas (público e métricas de
produto) e uma lista de perguntas em aberto no fim. Preenchê-las é o próximo
passo do documento.

## Estrutura

```
src/
  layouts/Base.astro     # head, i18n, JSON-LD, pular para o conteúdo
  pages/index.astro      # home — ordem das seções + faixa institucional
  styles/tokens.css      # tokens de marca (MIV 2018) e correções de contraste
public/
  _headers               # CSP, HSTS, Referrer-Policy, Permissions-Policy
  _redirects             # mapa de 301 do acervo
```
