# O que a Comunicação precisa revisar

Gerado por `scripts/relatorio-revisao.mjs` a partir de `acervo/auditoria.json`.

A auditoria separa o que é reescrita mecânica do que exige decisão de gente.
Este documento é a segunda pilha, e só ela.

## O tamanho

Dos 387 itens com conteúdo, **47 exigem revisão**. Destes, **3 já estão
aposentados** por redirecionamento e não precisam ser revistos — sobram **44**.

Por tipo: noticia (25), faq (8), group (8), pagina (3).

### Uma armadilha da contagem

Nem todo item com redirecionamento está aposentado. Os 125 permalinks que o
WPML traduziu têm regra no `_redirects` apontando **para a própria página** —
ela continua existindo, só muda de endereço. Contá-los como dispensados faria
este relatório esconder trabalho real. Aposentado é o caminho cujo destino é
outra página.

## Já aposentados — não revisar

| Item | Vai para |
|---|---|
| `pt/alupar-e-a-covid-19/acoes-sociais-em-prol-de-comunidades-vulneraveis` | `/sustentabilidade/` |
| `pt/alupar-e-a-covid-19/iniciativas-direcionadas-aos-nossos-colaboradores` | `/sustentabilidade/` |
| `pt/pagina/alupar-e-a-covid-19` | `/sustentabilidade/` |

Os três de `alupar-e-a-covid-19` são também **os únicos três itens do acervo
inteiro com imagem sem descrição**. Como já vão para `/sustentabilidade/`, o
bloqueio de acessibilidade para a migração é **zero** — não há texto
alternativo a escrever.

## Para revisar

Todos pelo mesmo motivo: **tabela no corpo**. Uma tabela pode ser dado, e aí
continua tabela; ou pode ser layout de 2017, e aí vira grade de CSS. Só quem
olha decide, e é por isso que isto não é trabalho de script.

| Item | Palavras | Tabelas | Endereço atual |
|---|---:|---:|---|
| `en/faq/as-transmissoras-alupar` | 297 | 1 | `/faq/as-transmissoras-alupar/` |
| `en/faq/generation` | 155 | 1 | `/faq/generation/` |
| `en/faq/geracao` | 64 | 1 | `/faq/geracao/` |
| `en/group/area-de-atuacao` | 297 | 1 | `/group/area-de-atuacao/` |
| `en/group/area-de-atuacao-geracao` | 64 | 1 | `/group/area-de-atuacao-geracao/` |
| `en/group/business-segment` | 155 | 1 | `/group/business-segment/` |
| `en/noticia/1q20-earnings-release-2` | 62 | 1 | `/noticia/1q20-earnings-release-2/` |
| `en/noticia/divulgacao-de-resultados-1t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-1t18/` |
| `en/noticia/divulgacao-de-resultados-1t20` | 62 | 1 | `/noticia/divulgacao-de-resultados-1t20/` |
| `en/noticia/divulgacao-de-resultados-2t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-2t18/` |
| `en/noticia/divulgacao-de-resultados-2t20` | 89 | 1 | `/noticia/divulgacao-de-resultados-2t20/` |
| `en/noticia/divulgacao-de-resultados-3t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-3t18/` |
| `en/noticia/divulgacao-de-resultados-4t17` | 111 | 1 | `/noticia/divulgacao-de-resultados-4t17/` |
| `en/noticia/divulgacao-de-resultados-4t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-4t18/` |
| `en/noticia/divulgacao-de-resultados-do-3t17` | 115 | 1 | `/noticia/divulgacao-de-resultados-do-3t17/` |
| `en/pagina/area-de-atuacao` | 636 | 2 | `/area-de-atuacao/` |
| `es/faq/as-transmissoras-alupar` | 298 | 1 | `/faq/as-transmissoras-alupar/` |
| `es/faq/geracao` | 63 | 1 | `/faq/geracao/` |
| `es/faq/los-transmisores-alupar-2` | 161 | 1 | `/faq/los-transmisores-alupar-2/` |
| `es/group/area-de-atuacao` | 298 | 1 | `/group/area-de-atuacao/` |
| `es/group/area-de-atuacao-geracao` | 63 | 1 | `/group/area-de-atuacao-geracao/` |
| `es/group/segmento-de-negocio` | 161 | 1 | `/group/segmento-de-negocio/` |
| `es/noticia/1q20-earnings-release-solo-ingles-y-portugues` | 62 | 1 | `/noticia/1q20-earnings-release-solo-ingles-y-portugues/` |
| `es/noticia/divulgacao-de-resultados-1t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-1t18/` |
| `es/noticia/divulgacao-de-resultados-1t20` | 62 | 1 | `/noticia/divulgacao-de-resultados-1t20/` |
| `es/noticia/divulgacao-de-resultados-2t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-2t18/` |
| `es/noticia/divulgacao-de-resultados-2t20` | 89 | 1 | `/noticia/divulgacao-de-resultados-2t20/` |
| `es/noticia/divulgacao-de-resultados-3t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-3t18/` |
| `es/noticia/divulgacao-de-resultados-4t17` | 111 | 1 | `/noticia/divulgacao-de-resultados-4t17/` |
| `es/noticia/divulgacao-de-resultados-4t18` | 111 | 1 | `/noticia/divulgacao-de-resultados-4t18/` |
| `es/pagina/area-de-atuacao` | 531 | 2 | `/area-de-atuacao/` |
| `pt/faq/as-transmissoras-alupar` | 297 | 1 | `/faq/as-transmissoras-alupar/` |
| `pt/faq/geracao` | 63 | 1 | `/faq/geracao/` |
| `pt/group/area-de-atuacao` | 297 | 1 | `/group/area-de-atuacao/` |
| `pt/group/area-de-atuacao-geracao` | 63 | 1 | `/group/area-de-atuacao-geracao/` |
| `pt/noticia/divulgacao-de-resultados-1t18` | 119 | 1 | `/noticia/divulgacao-de-resultados-1t18/` |
| `pt/noticia/divulgacao-de-resultados-1t20` | 61 | 1 | `/noticia/divulgacao-de-resultados-1t20/` |
| `pt/noticia/divulgacao-de-resultados-2t18` | 119 | 1 | `/noticia/divulgacao-de-resultados-2t18/` |
| `pt/noticia/divulgacao-de-resultados-2t20` | 93 | 1 | `/noticia/divulgacao-de-resultados-2t20/` |
| `pt/noticia/divulgacao-de-resultados-3t18` | 119 | 1 | `/noticia/divulgacao-de-resultados-3t18/` |
| `pt/noticia/divulgacao-de-resultados-4t17` | 119 | 1 | `/noticia/divulgacao-de-resultados-4t17/` |
| `pt/noticia/divulgacao-de-resultados-4t18` | 119 | 1 | `/noticia/divulgacao-de-resultados-4t18/` |
| `pt/noticia/divulgacao-de-resultados-do-3t17` | 123 | 1 | `/noticia/divulgacao-de-resultados-do-3t17/` |
| `pt/pagina/area-de-atuacao` | 647 | 2 | `/area-de-atuacao/` |

## Como decidir

Para cada linha, uma pergunta: **a tabela existe porque os dados têm linhas e
colunas, ou porque em 2017 era assim que se alinhava conteúdo?**

- **Dado** — continua tabela, ganha cabeçalho de verdade (`<th>`) e legenda.
- **Layout** — vira grade de CSS, e o conteúdo passa a se reorganizar no celular
  em vez de rolar para o lado.

O acervo tem o HTML de cada uma em `acervo/conteudo.jsonl`, campo `corpo`.

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
