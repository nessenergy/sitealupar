---
name: sanity-alupar
description: PROJETO DE CMS NÃO IMPLANTADO. O sitealupar não tem Sanity — o conteúdo vive em arquivos versionados. Esta skill descreve o desenho de 2026 (cinco tipos, tradução por documento, migração de 99 notícias) e só vale se a D11 for retomada. Use apenas ao planejar essa retomada; nunca para afirmar onde o conteúdo está hoje. Trigger em Sanity, GROQ, Studio, CMS.
---

# Sanity — sitealupar

> **Estado em 21/09/2026: nada disto existe.** Não há conta, schema, Studio nem
> integração no código; `cms.alupar.com.br` não tem sequer registro de DNS. O
> conteúdo do site vem de `acervo/conteudo-pronto.jsonl` e de
> `src/i18n/textos.ts`, e os documentos pesados ficam no R2.
>
> A trajetória: em 10/09/2026 o Sanity saiu do caminho crítico e foi adiado para
> a manutenção, só para **banner e notícia** (`docs/plano-virada.md`). Os dois
> deixaram de existir depois — o topo da home virou vídeo (#94) e a área de
> notícias foi desativada (D16). Páginas institucionais e jurídicas nunca
> estiveram no escopo do CMS. A D11 está em revisão com a Alupar.
>
> O que segue é o desenho original, mantido como referência para a retomada.

A conta fica **em nome da Alupar**, não da agência. É o que torna a saída de
qualquer fornecedor futuro indolor — inclusive a nossa. Studio em
`cms.alupar.com.br`, publicado no mesmo Cloudflare Pages.

## Cinco tipos

| Tipo | O que guarda |
|---|---|
| `pagina` | As sete páginas institucionais |
| `noticia` | Acervo de 99 registros — ver a regra de corte abaixo |
| `banner` | Rotativo da home |
| `video` | Três registros |
| `empresa` | As 42 fichas de `/empresas/`, hoje HTML mantido à mão |

O `empresa` é o ganho silencioso: hoje alterar um ativo significa editar
marcação. Depois, é preencher campo.

## Idiomas

Tradução **por documento** (`@sanity/document-internationalization`): cada
notícia e cada página existe como três documentos ligados — PT-BR, EN, ES.

O motivo de não ser por campo: permite publicar em português sem travar por
falta do inglês, e **torna a falta de paridade visível no editor**. Hoje o site
tem menu meio traduzido e hashtag em português na versão inglesa, e ninguém
percebe até alguém reclamar.

No site, as rotas são `/`, `/en/` e `/es/` — nunca `?lang=`.

## Migração do acervo

**99 notícias e 3 vídeos, por script pela API.** Não à mão.

Regras que não se negociam:

- **URL, data e idioma preservados.** Nenhuma das 183 URLs pode responder 404;
  são conteúdo indexado desde 2017
- **O corte de 24 meses é um campo, não uma exclusão.** As recentes vão para a
  listagem principal; as demais para `/noticias/arquivo/`, paginado e
  indexável, fora da navegação de destaque. Nada é apagado
- **Amostre 20 registros antes de estimar o script.** Metadado inconsistente no
  acervo é o risco que transforma 56 h em 96 h

## Publicação

Webhook do Sanity dispara o build no Cloudflare Pages. Publicar uma notícia é
um clique; o site sai atualizado em cerca de um minuto e **continua estático**.

Consequência que importa: se o Sanity cair, o site permanece no ar — o build já
aconteceu, as páginas são arquivos. Com a plataforma anterior, o site *era* o
fornecedor.

## Operação

- Perfis de **editor** e **administrador** separados: trocar um banner não pode
  exigir quem saiba mexer no modelo
- Treinamento da Comunicação Alupar no M3
- **Exportação periódica do dataset em JSON, versionada no repositório.** É a
  apólice contra a dependência que estamos criando
