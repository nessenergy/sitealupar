# Conferência visual — site atual × site novo

Capturas de `node scripts/capturar-telas.mjs` (11 páginas × 390, 768 e
1280 px), comparadas em `capturas/index.html`, capturadas em 11/09/2026.

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
| Um banner só na home, sem rotativo nem pontos de navegação | Regra 0.2 do Marco 0 — `docs/marco-0-runbook.md` |
| Faixa "A Alupar em números" entre o banner e as caixas da home; km de linhas e MW instalados aparecem como "—": valores pendentes da Alupar, marcados no site | Decisão D10 — `docs/decisoes.md` |
| Círculo de "voltar ao topo" com contorno claro e a seta "︿" dentro | Comentário de `src/components/Rodape.astro` (WCAG 1.4.11) |
| Sem a linha "Powered by MZ" no rodapé | Comentário de `src/components/Rodape.astro` — o fornecedor sai com o contrato |

## Divergências

Tipos: **D** defeito do restauro → Tarefa 4 · **C** conteúdo ou texto →
Comunicação/Marketing decide, vai para a pauta · **A** aceitável (diferença
de renderização sem efeito visível para quem usa, como suavização de fonte).

Na coluna Página, "todas" são as 11 capturadas e "internas" são as oito que
não são home (empresas, noticias, noticia, pesquisa, faq, condicoes-de-uso,
videos, contato). Medidas marcadas com "~" são aproximadas, lidas na captura.

| # | Página | Largura | Zona | Site atual | Site novo | Tipo | Destino |
|---|---|---|---|---|---|---|---|
| 1 | todas | 390 | barra superior | só as bandeiras, à esquerda; sem o link do RI | "RELAÇÕES COM INVESTIDORES" e as siglas, à direita | D | Tarefa 4 |
| 2 | home-es | todas | barra superior | "RELACION CON INVERSORES", sem acento | "RELACIÓN CON INVERSORES" | C | pauta |
| 3 | todas | 390 | cabeçalho e menu | faixa azul do logotipo na largura toda da tela, com 83 px de altura (`h1.logo` com `width: 100%` e `bg-logo-mobile.png` centralizado); logotipo (~112 px) à esquerda e botão de menu à direita, os dois brancos sobre o azul | box azul só atrás do logotipo (~150 × 83 px, à esquerda); o resto da faixa é branco | D | Tarefa 4 |
| 4 | todas | 390 | cabeçalho e menu | botão de menu com três barras brancas e "MENU" em ~8 px embaixo | só a palavra "MENU" (~11 px), escura, sem as barras | D | Tarefa 4 |
| 5 | todas | 768 | cabeçalho e menu | box do logotipo (~150 × 130 px) a partir do topo da página, sobre a barra cinza; menu numa linha abaixo do box, numa faixa branca que avança sobre o banner | box começa abaixo da barra cinza; menu à direita do box, na altura do logotipo | D | Tarefa 4 |
| 6 | home, home-es e internas | 768 | cabeçalho e menu | os seis itens do menu visíveis | o primeiro item fica atrás do box azul: "A COMPANHIA" some (em home-es sobra "MPAÑÍA"); em home-en o menu cabe | D | Tarefa 4 |
| 7 | todas | 1280 | cabeçalho e menu | box do logotipo (293 × 200 px) a partir do topo, sobre a barra cinza; faixa branca do menu com ~117 px (y 33–150), menu em y ≈ 88 | box começa abaixo da barra (y 33–233); faixa branca com ~61 px (y 33–94), menu em y ≈ 68; o banner começa ~56 px mais acima | D | Tarefa 4 |
| 8 | todas | 1280 | cabeçalho e menu | cabeçalho entre x ≈ 70 e 1210 (box do logotipo em x 70) | entre x ≈ 86 e 1194 (box em x 86; menu termina em x ≈ 1182) | D | Tarefa 4 |
| 9 | home-en, home-es | todas | cabeçalho e menu | item "TRABALHE CONOSCO" em português nas versões EN e ES | "CAREERS" e "TRABAJE CON NOSOTROS" | C | pauta |
| 10 | home, home-en, home-es | todas | faixa ou banner | altura fixa de 447 px, imagem recortada para preencher a largura | altura da proporção da imagem, sem recorte: no PT, ~213 px em 1280, ~128 px em 768 e ~65 px em 390 (a arte do relatório fica pequena, centrada em fundo cinza) | D | Tarefa 4 |
| 11 | home, home-en, home-es | todas | faixa ou banner | legenda ("#SUSTENTABILIDADE", "Mais Energia"…) numa caixa branca translúcida com fio verde embaixo, no alto à esquerda | legenda em texto branco, negrito, sobre a base da imagem, sem caixa | D | Tarefa 4 |
| 12 | home, home-en, home-es | todas | corpo | caixas sobre fundo cinza-claro; em 768 e 1280 elas sobem ~50 px sobre a base do banner | caixas sobre fundo branco, abaixo da faixa de números, sem sobreposição | D | Tarefa 4 |
| 13 | home, home-en, home-es | todas | corpo | títulos das caixas ("NOTÍCIAS", "VÍDEO INSTITUCIONAL", "SUSTENTABILIDADE") em verde, peso regular, ~20 px | em azul, negrito | D | Tarefa 4 |
| 14 | home, home-en, home-es | todas | corpo | notícias com marcador (bolinha), data em peso regular e título em azul, sem sublinhado | sem marcador; data em negrito; título em cinza-escuro, sublinhado; mais espaço entre os itens | D | Tarefa 4 |
| 15 | home, home-en, home-es, noticias | todas | corpo | lista começa em 02/03/2023 (4T22) e traz as notícias de 2022; no bloco da home, os títulos terminam em hífen ("4T22-") | lista começa em 09/11/2021 (3T21): as notícias de 2022 e 2023 não aparecem; no bloco da home, títulos sem o hífen | C | pauta — o feed vem do RI (D5), acesso pendente |
| 16 | home-es | todas | corpo | datas das notícias em mês/dia ("02/24/2022") | em dia/mês ("09/11/2021") | C | pauta |
| 17 | home, home-en, home-es | 768, 1280 | corpo | vídeo numa caixa 4:3 (~320 × 240 px em 1280; ~180 × 135 px em 768) | capa mais alta que larga (~310 × 400 px em 1280; ~184 × 330 px em 768) | D | Tarefa 4 |
| 18 | home-en | todas | corpo | vídeo em player próprio, com capa do logotipo (1:55) | capa do vídeo em português ("INVESTIREMOS R$ 9 BILHÕES") | C | pauta |
| 19 | home, home-en, home-es | todas | corpo | itens de sustentabilidade ("Meio Ambiente", "Água", "Fauna e Flora") em peso regular, sem sublinhado | em negrito e sublinhados | D | Tarefa 4 |
| 20 | home | 768 | corpo | a caixa de notícias passa da área e "VEJA MAIS NOTÍCIAS" fica cortado pelo rodapé | caixa inteira, link visível | A | nenhum — o novo não repete o corte |
| 21 | todas | todas | todas | texto em Open Sans, carregada do Google Fonts | nenhuma fonte de web carregada (sem `@font-face` nem link de fonte): o texto cai para Segoe UI no Windows da captura e para Arial/Helvetica nos outros sistemas, com letras mais estreitas | D | corrigida — 794dd01 |
| 22 | internas | todas | corpo | breadcrumb "Você está em: > …" em azul acima do título | sem breadcrumb | D | Tarefa 4 |
| 23 | internas | 768, 1280 | corpo | conteúdo numa caixa branca com sombra, sobre fundo cinza-claro, colada à base do banner | página branca, sem caixa nem sombra | D | Tarefa 4 |
| 24 | internas, menos videos (ver 39) | todas | corpo | título da página em verde, peso regular (~48 px em 1280, ~26 px em 390) | em azul, negrito (~36 px em 1280), com fio cinza embaixo | D | Tarefa 4 |
| 25 | internas | 1280 | corpo | coluna de texto na largura da caixa (~1070 px, x 105–1175) | coluna de ~620 px (x 330–950), centrada | D | Tarefa 4 |
| 26 | faq, pesquisa, empresas, noticia, contato | todas | corpo | trechos marcados como negrito aparecem em peso regular — o tema zera o negrito (`strong { font-weight: normal }` no `style.css`) | em negrito: rótulos da FAQ e da pesquisa ("Código ANEEL:"…), parágrafos das empresas participantes, nomes das empresas (ETEM, ECTE…), cabeçalhos da ata, "Alupar Investimento S.A." | D | Tarefa 4 |
| 27 | faq, pesquisa | todas | corpo | marcadores de lista verdes; subnível com bolinha verde; terceiro nível "I. •" | marcadores pretos; subnível com círculo vazado; terceiro nível "1." | D | Tarefa 4 |
| 28 | pesquisa, empresas | todas | corpo | títulos de seção grandes, em peso regular: "Projetos de P&D Concluídos", "Saldo da Conta de P&D" em verde (~28 px); "Transmissoras" em azul (~34 px) | ~20 px, azul, negrito | D | Tarefa 4 |
| 29 | noticia, empresas | todas | corpo | parágrafos justificados; na ata, a abertura e o fecho ("São Paulo…", "Certifico…") centralizados; em empresas, mapas centralizados | tudo alinhado à esquerda — as classes `text-justify` e `text-center` chegam ao HTML novo, mas nada as estiliza; o centro dos mapas (estilo inline) se perde | D | Tarefa 4 |
| 30 | noticia, pesquisa, contato | todas | corpo | links do texto em azul, sem sublinhado ("clique aqui", smisse@alupar.com.br, e-mail da assessoria) | em verde, sublinhados | D | Tarefa 4 |
| 31 | noticia | todas | corpo | sem data abaixo do título | data "16 de abril de 2014" abaixo do título | C | pauta |
| 32 | pesquisa | todas | corpo | "FORMULÁRIO CADASTRAL" como botão azul, texto branco em caixa alta | link verde sublinhado "formulário cadastral" | D | Tarefa 4 |
| 33 | pesquisa | todas | corpo | "Segundo arcabouço…" e "Os interessados…" com recuo de ~10 px à esquerda | sem recuo | D | Tarefa 4 |
| 34 | condicoes-de-uso | todas | corpo | três seções em sanfona, fechadas, títulos em verde com ícone quadrado | seções abertas, título em texto comum, o texto inteiro à mostra | D | Tarefa 4 |
| 35 | contato | 768, 1280 | corpo | endereço à esquerda e "Assessoria de Imprensa" (título em verde) à direita, em duas colunas | endereço e assessoria em uma coluna, título comum | D | Tarefa 4 |
| 36 | contato | todas | corpo | campos com fundo cinza em degradê, sem borda; "Assunto" na largura toda; botão "Enviar" centralizado | campos brancos com borda; "Assunto" em meia largura; botão alinhado à esquerda, azul mais escuro | D | Tarefa 4 |
| 37 | noticias | todas | corpo | uma linha por notícia (data + título), linhas alternadas em cinza-claro, na largura da caixa | data por extenso acima do título, título em negrito sublinhado, fio entre os itens; em 1280 a lista fica numa coluna de ~226 px no meio da página | D | Tarefa 4 |
| 38 | videos | todas | corpo | `/video/video-institucional/`: título "Vídeo Institucional" e o corpo em branco (o vídeo não aparece na captura) | `/videos/`: título "Vídeos" e três links, dois com o mesmo nome "ALUPAR INSTITUCIONAL 2017_edit" e um "institucional" | C | pauta |
| 39 | videos | todas | corpo | título em verde, peso regular | título em preto, negrito (as outras internas usam azul) | D | Tarefa 4 |
| 40 | todas | todas | rodapé | links sem sublinhado; separadores "\|" com ~12 px de cada lado | links sublinhados; separadores com ~6 px; na quebra, o "\|" abre a linha de baixo ("\| CANAL DE DENÚNCIAS") | D | Tarefa 4 |

Na página empresas, abaixo de ~16.384 px (altura máxima de captura do Chrome) a captura repete o topo da página, nos dois lados: essa parte foi conferida pela estrutura do HTML (mesmas seções, 30 mapas), não visualmente.

## Pares com leitura limitada

- **empresas (390, 768 e 1280):** a página passa de 16 384 px, o limite de
  altura da captura do Chrome; dali para baixo a imagem repete o topo da
  página, nos dois lados. O fim de "Transmissoras", as seções "Geradoras" e
  "Comercialização" e o rodapé não foram conferidos nessa página — o rodapé é
  o mesmo das outras. A maior parte dos mapas não carregou na captura (três a
  cinco no atual, dois no novo); o HTML dos dois lados tem os mesmos 30 mapas,
  então a falta é da captura, não do site.
- **home, home-en, home-es (390):** no atual, a caixa do vídeo saiu em branco;
  o vídeo só foi comparado em 768 e 1280 (linha 17).
- **videos (todas):** no atual, o corpo da página saiu em branco; não dá para
  dizer se há um vídeo ali (linha 38).
- **Rotativo da home:** a captura do atual mostra o banner que estava no ar
  naquele segundo ("Mais Energia" em home). A legenda (linha 11) foi
  comparada no mesmo banner em home-en 768, onde o atual mostra
  "#SUSTAINABILITY", o mesmo do novo.

## Resumo

40 divergências: 32 do tipo D (corrigidas na Tarefa 4), 7 do tipo C (na pauta),
1 do tipo A.
