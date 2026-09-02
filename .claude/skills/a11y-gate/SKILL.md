---
name: a11y-gate
description: Portão de acessibilidade do sitealupar — o que o CI cobra, o que a ferramenta automática não pega, e os defeitos concretos do site atual que não podem se repetir. Use ao escrever marcação, componente interativo, formulário, imagem ou estado de foco, e antes de abrir qualquer PR de front-end. Trigger em acessibilidade, a11y, WCAG, alt, label, foco, contraste, leitor de tela, aria, teclado, axe, Lighthouse.
---

# Portão de acessibilidade

**WCAG 2.2 AA é critério de aceite, não aspiração.** O CI reprova o merge:
`lighthouserc.json` exige categoria de acessibilidade em 1.0, mais `image-alt`,
`label`, `color-contrast` e `html-has-lang` como erro.

## Os defeitos do site atual, para não repetir

Medidos em 01/09/2026. Cada um tem um requisito correspondente:

| Defeito | Regra que passa a valer |
|---|---|
| `alt=""` em todos os seis banners da home e em 30 de 42 imagens em `/empresas/` | Imagem de conteúdo sem `alt` não passa no build. Decorativa leva `alt=""` **deliberado**, não por omissão |
| O `<h1>` é um logotipo com `font: 0/0 a` — nenhum texto chega ao leitor de tela | Todo `<h1>` carrega texto real. Se ele precisa ficar invisível, use `.sr-only`, nunca supressão por fonte de tamanho zero |
| Hierarquia salta de `h1` para `h3` | Sem pular nível |
| Cinco campos e **um** `<label>` no formulário | Todo campo tem rótulo associado. `placeholder` não é rótulo |
| Erros de validação soltos no DOM | Mensagem associada ao campo, e anunciada |
| Sem indicação de foco | `:focus-visible` visível em tudo que recebe foco |
| Verde `#079541` em texto: 3,90:1 | Texto usa `--verde-texto` (4,51:1). Cinzas `#9B9B9B` e `#D2D2D2` não servem para texto |
| EN e ES dentro de `<html lang="pt-br">` | `lang` correto por rota |
| Carrossel com autoplay sem controle | Pausa, navegação por teclado, altura reservada |

## O que a ferramenta automática não pega

Ferramenta cobre cerca de um terço. O resto exige teste real, e é por isso que
há 32 h de especialista no plano:

- Se a ordem de leitura faz sentido, e não só se existe
- Se o texto alternativo **descreve** ou apenas preenche
- Se o foco é visível **e** segue uma ordem lógica
- Se o erro do formulário é anunciado no momento certo
- Se o carrossel é operável só com teclado, sem armadilha de foco
- Se a página é utilizável com zoom de 200% e em 320 px de largura

## Antes de abrir PR

```bash
npm run build
npx --yes @lhci/cli@0.14.x autorun      # o mesmo que o CI roda
```

E uma passada de teclado: `Tab` da primeira à última interação, sem mouse. Se
você se perdeu, o visitante também se perde.

## A regra que fecha

**Nunca relaxe um limite para o CI passar.** Se o portão reprova, ou o código
melhora, ou o problema é real e vira conversa — não configuração.
