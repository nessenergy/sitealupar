# Conferência visual — site atual × site novo

Capturas de `node scripts/capturar-telas.mjs` (11 páginas × 390, 768 e
1280 px), comparadas em `capturas/index.html`, capturadas em 11/09/2026.

## O que esta conferência não cobre

As 11 páginas capturadas são **modelos** de página, um de cada tipo, e só em
português — a exceção é a home, comparada nos três idiomas. Ficaram de fora da
comparação visual: **toda página interna em EN e ES**, a **página de erro
(404)**, o **arquivo paginado de notícias** (a listagem foi comparada só na
primeira página), os **dois avisos do formulário de contato** (envio aceito e
envio recusado) e **`/sustentabilidade/`**. O aceite do Marketing sobre este
documento, portanto, cobre 11 modelos de página, não o site inteiro. O que
está fora aqui continua coberto pelos gates automáticos do CI (links, CSP,
continuidade, Lighthouse), que rodam sobre todas as páginas do build.

## Mudanças deliberadas — não são defeito

| O que muda no site novo | Por quê |
|---|---|
| Idiomas em sigla PT · EN · ES, sem bandeiras | Decisão P4 |
| Sem busca no cabeçalho | Decisão P3 |
| Vídeo da home com capa local; o player só carrega no clique | Decisão P8 |
| Hover e página atual do menu no verde de texto `#079541`; cinzas mais escuros | Contraste AA — ver o comentário de `src/components/Cabecalho.astro` |
| Links de idioma com área clicável de 24×24 px | WCAG 2.5.8 |
| No celular, "Relações com Investidores" sai da barra, como no site atual, e entra no fim do menu | O site atual esconde o link no celular (`li.hidden-xs`) e não o oferece em outro lugar; o RI não pode ficar inalcançável — comentário de `src/components/Cabecalho.astro` |
| Botão de menu do celular continua branco quando o menu está aberto (o tema passa as barras e "MENU" a verde `#079541`) | 2,07:1 do verde sobre o azul da faixa (`#004F9D`); AA pede 4,5:1 no texto de 8 px e 3:1 no ícone. Branco dá 8,06:1 — comentário de `src/components/Cabecalho.astro` |
| Logotipo em negativo sobre o box azul | O tema faz o mesmo (`img/logo-alupar.png`) — Tarefa 1 |
| Sem banner de cookies | Decisão P9 |
| Listagem de notícias e arquivo paginado | Decisão P2 |
| Formulário de contato com rótulo por campo, consentimento e Turnstile | Critérios C1 a C4 do PRD |
| Página de erro própria para endereço inexistente | Tarefa 11b de `plano-virada.md` |
| Um banner só na home, sem rotativo nem pontos de navegação | Regra 0.2 do Marco 0 — `docs/marco-0-runbook.md` |
| Faixa "A Alupar em números" entre o banner e as caixas da home; km de linhas e MW instalados aparecem como "—": valores pendentes da Alupar, marcados no site | Decisão D10 — `docs/decisoes.md` |
| Círculo de "voltar ao topo" com contorno claro e a seta "︿" dentro | Comentário de `src/components/Rodape.astro` (WCAG 1.4.11) |
| Links do rodapé com linha de 24 px: onde a lista quebra (390 e 768), as linhas ficam a 24 px uma da outra, não a ~16 px | Com 16 px entre as linhas, o espaço livre em volta de cada link mede 15,8 px; target-size (WCAG 2.5.8) pede 24 px — comentário de `src/components/Rodape.astro` |
| Links do texto das internas continuam sublinhados, em azul | Sem sublinhado, o azul do link e o preto do texto ficam a 1,59:1 um do outro — a WCAG 1.4.1 pede 3:1 para distinguir link só pela cor |
| Todo verde de texto é `#06893C` (--verde-texto), não o `#079541` do tema | 3,90:1 sobre branco reprova o critério AA que o CI cobra; 4,51:1 passa. Em texto grande (≥ 24 px, como o h1 de 48 px das internas) o verde do tema passaria com 3:1: ali a escolha é de consistência de cor, não exigência de contraste. O verde de marca continua em fios, marcadores e superfícies |
| Caixas da home sem a sobreposição de ~50 px sobre a base do banner | Entre o banner e as caixas está a faixa institucional (D10), acréscimo deliberado — o tema não tem nada ali |
| Seta da sanfona das condições de uso é um chevron de texto (⌄ e ⌃) | O tema pede os glifos `f106`/`f107` do Font Awesome com `font-family: "Open Sans"`, que não os tem: o que o site atual exibe ali é o quadrado de caractere ausente. Restauro é da linguagem visual, não de um defeito de fonte |
| Sanfona das condições de uso em `<details>`/`<summary>`, fechada já no HTML — o tema a fecha por script, depois de a página aparecer | Fechar depois da pintura desloca a página inteira: o Lighthouse do CI mediu **CLS 0,2972** (teto 0,1) e **desempenho 0,85** (piso 0,9) nessa página, e reprovou. Fechada já no HTML, a mesma página mede **CLS 0** e **desempenho 1,00**. O estado fechado, as cores, o recheio e o fio são os do tema; o que muda é quem fecha — e o `<summary>` ainda recebe foco, responde ao teclado e funciona sem JavaScript, que o `<div>` do tema não faz — 0b1eb26 |
| Campos do formulário de contato sem o `text-transform: uppercase` do `.form-control` | A regra do tema põe em caixa alta o que a pessoa digita, inclusive na hora em que ela revê o que vai enviar. O que se digita é dado, não desenho |
| `h4` do corpo em 20 px e cinza, e a 404 na mesma caixa branca das internas | Entraram junto com as linhas 24 a 33 e 12/23/25 por serem a mesma folha: o `h4` é `.txt-show h4` do tema, e com o fundo da página no cinza a 404 seria a única com texto solto sobre o cinza |
| Coluna de texto das internas na largura da caixa (~1070 px em 1280) | É o tema, e é a linha 25. Passa dos 80 caracteres por linha que a WCAG 1.4.8 recomenda — critério AAA, fora do gate AA que o CI cobra |
| Rótulo da trilha de navegação traduzido nos três idiomas | O site atual imprime "Você está em:" também nas versões EN e ES: é o mesmo defeito de conteúdo do "Trabalhe Conosco" da linha 9, e a decisão P7 mandou traduzir. Aprovação da Comunicação pendente, como em todo texto marcado `// novo` |
| Trilha de navegação some abaixo de 768 px | É o `hidden-xs` do tema: o site atual também não a mostra no celular |
| Sem a linha "Powered by MZ" no rodapé | Comentário de `src/components/Rodape.astro` — o fornecedor sai com o contrato |
| Faixa de foto das internas gerada com `quality={40}`, abaixo do padrão do Astro (AVIF 50, WebP 80) | O peso de `/contato/` passou do teto do CI (620.380 B contra 614.400). A origem da faixa tem 2600×185 px e ela nunca mostra mais que 185 px de altura: a variante de 1920 sai com 137 px e o `object-fit: cover` já a amplia 1,35× — o que se vê nunca é a resolução plena. Em recortes de 760 px lado a lado, 40 e 50 não se distinguem; a variante que o navegador baixa cai de 38.375 para 23.249 B — comentário de `src/layouts/Base.astro` |
| Open Sans variável com eixo de peso 400–700, e não os 300–800 do arquivo do Google: 26.680 B no lugar de 48.320 | Mesma reprovação de peso. O site pede 400, 600 e 700 — os dois seletores de peso 300 do tema (`.lead` do Bootstrap e `.radio-inline`/`.checkbox-inline`, do formulário antigo, que não voltou) não aparecem em nenhuma das 400 páginas do build, e 800 não aparece em lugar nenhum. Quase metade do arquivo é a tabela `gvar`, as deltas que desenham os pesos. Contornos, `hinting`, kerning e a faixa latina de caracteres continuam idênticos aos do arquivo do Google — comentário de `src/styles/tokens.css` |

## Divergências

Tipos: **D** defeito do restauro → Tarefa 4, ou `pendente — manutenção` quando
a correção não cabe na Tarefa 4 · **C** conteúdo ou texto →
Comunicação/Marketing decide, vai para a pauta · **A** aceitável (diferença
de renderização sem efeito visível para quem usa, como suavização de fonte).

Na coluna Página, "todas" são as 11 capturadas e "internas" são as oito que
não são home (empresas, noticias, noticia, pesquisa, faq, condicoes-de-uso,
videos, contato). Medidas marcadas com "~" são aproximadas, lidas na captura.

| # | Página | Largura | Zona | Site atual | Site novo | Tipo | Destino |
|---|---|---|---|---|---|---|---|
| 1 | todas | 390 | barra superior | só as bandeiras, à esquerda; sem o link do RI | "RELAÇÕES COM INVESTIDORES" e as siglas, à direita | D | corrigida — c3ffdc9 |
| 2 | home-es | todas | barra superior | "RELACION CON INVERSORES", sem acento | "RELACIÓN CON INVERSORES" | C | pauta |
| 3 | todas | 390 | cabeçalho e menu | faixa azul do logotipo na largura toda da tela, com 83 px de altura (`h1.logo` com `width: 100%` e `bg-logo-mobile.png` centralizado); logotipo (~112 px) à esquerda e botão de menu à direita, os dois brancos sobre o azul | box azul só atrás do logotipo (~150 × 83 px, à esquerda); o resto da faixa é branco | D | corrigida — 806a6ca |
| 4 | todas | 390 | cabeçalho e menu | botão de menu com três barras brancas e "MENU" em ~8 px embaixo | só a palavra "MENU" (~11 px), escura, sem as barras | D | corrigida com ajuste de acessibilidade — 806a6ca |
| 5 | todas | 768 | cabeçalho e menu | box do logotipo (~150 × 130 px) a partir do topo da página, sobre a barra cinza; menu numa linha abaixo do box, numa faixa branca que avança sobre o banner | box começa abaixo da barra cinza; menu à direita do box, na altura do logotipo | D | corrigida — c0443d8 |
| 6 | home, home-es e internas | 768 | cabeçalho e menu | os seis itens do menu visíveis | o primeiro item fica atrás do box azul: "A COMPANHIA" some (em home-es sobra "MPAÑÍA"); em home-en o menu cabe | D | corrigida — c0443d8 |
| 7 | todas | 1280 | cabeçalho e menu | box do logotipo (293 × 200 px) a partir do topo, sobre a barra cinza; faixa branca do menu com ~117 px (y 33–150), menu em y ≈ 88 | box começa abaixo da barra (y 33–233); faixa branca com ~61 px (y 33–94), menu em y ≈ 68; o banner começa ~56 px mais acima | D | corrigida — c0443d8 |
| 8 | todas | 1280 | cabeçalho e menu | cabeçalho entre x ≈ 70 e 1210 (box do logotipo em x 70) | entre x ≈ 86 e 1194 (box em x 86; menu termina em x ≈ 1182) | D | corrigida — c0443d8 |
| 9 | home-en, home-es | todas | cabeçalho e menu | item "TRABALHE CONOSCO" em português nas versões EN e ES | "CAREERS" e "TRABAJE CON NOSOTROS" | C | pauta |
| 10 | home, home-en, home-es | todas | faixa ou banner | altura fixa de 447 px, imagem recortada para preencher a largura | altura da proporção da imagem, sem recorte: no PT, ~213 px em 1280, ~128 px em 768 e ~65 px em 390 (a arte do relatório fica pequena, centrada em fundo cinza) | D | corrigida — 8772422 |
| 11 | home, home-en, home-es | todas | faixa ou banner | legenda ("#SUSTENTABILIDADE", "Mais Energia"…) numa caixa branca translúcida com fio verde embaixo, no alto à esquerda | legenda em texto branco, negrito, sobre a base da imagem, sem caixa | D | corrigida — 6d0245b, 7fc8688 |
| 12 | home, home-en, home-es | todas | corpo | caixas sobre fundo cinza-claro; em 768 e 1280 elas sobem ~50 px sobre a base do banner | caixas sobre fundo branco, abaixo da faixa de números, sem sobreposição | D | corrigida — 03ad6bf |
| 13 | home, home-en, home-es | todas | corpo | títulos das caixas ("NOTÍCIAS", "VÍDEO INSTITUCIONAL", "SUSTENTABILIDADE") em verde, peso regular, ~20 px | em azul, negrito | D | corrigida — c8f3940 |
| 14 | home, home-en, home-es | todas | corpo | notícias com marcador (bolinha), data em peso regular e título em azul, sem sublinhado | sem marcador; data em negrito; título em cinza-escuro, sublinhado; mais espaço entre os itens | D | corrigida — f5572e6 |
| 15 | home, home-en, home-es, noticias | todas | corpo | lista começa em 02/03/2023 (4T22) e traz as notícias de 2022; no bloco da home, os títulos terminam em hífen ("4T22-") | lista começa em 09/11/2021 (3T21): as notícias de 2022 e 2023 não aparecem; no bloco da home, títulos sem o hífen | C | pauta — o feed vem do RI (D5), acesso pendente |
| 16 | home-es | todas | corpo | datas das notícias em mês/dia ("02/24/2022") | em dia/mês ("09/11/2021") | C | pauta |
| 17 | home, home-en, home-es | 768, 1280 | corpo | vídeo numa caixa 4:3 (~320 × 240 px em 1280; ~180 × 135 px em 768) | capa mais alta que larga (~310 × 400 px em 1280; ~184 × 330 px em 768) | D | corrigida — bb29712 |
| 18 | home-en | todas | corpo | vídeo em player próprio, com capa do logotipo (1:55) | capa do vídeo em português ("INVESTIREMOS R$ 9 BILHÕES") | C | pauta |
| 19 | home, home-en, home-es | todas | corpo | itens de sustentabilidade ("Meio Ambiente", "Água", "Fauna e Flora") em peso regular, sem sublinhado | em negrito e sublinhados | D | corrigida — bb29712 |
| 20 | home | 768 | corpo | a caixa de notícias passa da área e "VEJA MAIS NOTÍCIAS" fica cortado pelo rodapé | caixa inteira, link visível | A | nenhum — o novo não repete o corte |
| 21 | todas | todas | todas | texto em Open Sans, carregada do Google Fonts | nenhuma fonte de web carregada (sem `@font-face` nem link de fonte): o texto cai para Segoe UI no Windows da captura e para Arial/Helvetica nos outros sistemas, com letras mais estreitas | D | corrigida — 794dd01 |
| 22 | internas | todas | corpo | breadcrumb "Você está em: > …" em azul acima do título | sem breadcrumb | D | corrigida — fa3795f |
| 23 | internas | 768, 1280 | corpo | conteúdo numa caixa branca com sombra, sobre fundo cinza-claro, colada à base do banner | página branca, sem caixa nem sombra | D | corrigida — 03ad6bf |
| 24 | internas, menos videos (ver 39) | todas | corpo | título da página em verde, peso regular (~48 px em 1280, ~26 px em 390) | em azul, negrito (~36 px em 1280), com fio cinza embaixo | D | corrigida — a525253 |
| 25 | internas | 1280 | corpo | coluna de texto na largura da caixa (~1070 px, x 105–1175) | coluna de ~620 px (x 330–950), centrada | D | corrigida — 03ad6bf |
| 26 | faq, pesquisa, empresas, noticia, contato | todas | corpo | trechos marcados como negrito aparecem em peso regular — o tema zera o negrito (`strong { font-weight: normal }` no `style.css`) | em negrito: rótulos da FAQ e da pesquisa ("Código ANEEL:"…), parágrafos das empresas participantes, nomes das empresas (ETEM, ECTE…), cabeçalhos da ata, "Alupar Investimento S.A." | D | corrigida — a525253 |
| 27 | faq, pesquisa | todas | corpo | marcadores de lista verdes; subnível com bolinha verde; terceiro nível "I. •" | marcadores pretos; subnível com círculo vazado; terceiro nível "1." | D | corrigida — a525253 |
| 28 | pesquisa, empresas | todas | corpo | títulos de seção grandes, em peso regular: "Projetos de P&D Concluídos", "Saldo da Conta de P&D" em verde (~28 px); "Transmissoras" em azul (~34 px) | ~20 px, azul, negrito | D | corrigida — a525253 |
| 29 | noticia, empresas | todas | corpo | parágrafos justificados; na ata, a abertura e o fecho ("São Paulo…", "Certifico…") centralizados; em empresas, mapas centralizados | tudo alinhado à esquerda — as classes `text-justify` e `text-center` chegam ao HTML novo, mas nada as estiliza; o centro dos mapas (estilo inline) se perde | D | corrigida — a525253 |
| 30 | noticia, pesquisa, contato | todas | corpo | links do texto em azul, sem sublinhado ("clique aqui", smisse@alupar.com.br, e-mail da assessoria) | em verde, sublinhados | D | corrigida com ajuste de acessibilidade — a525253 |
| 31 | noticia | todas | corpo | sem data abaixo do título | data "16 de abril de 2014" abaixo do título | C | pauta |
| 32 | pesquisa | todas | corpo | "FORMULÁRIO CADASTRAL" como botão azul, texto branco em caixa alta | link verde sublinhado "formulário cadastral" | D | corrigida — a525253 |
| 33 | pesquisa | todas | corpo | "Segundo arcabouço…" e "Os interessados…" com recuo de ~10 px à esquerda | sem recuo | D | corrigida — a525253 |
| 34 | condicoes-de-uso | todas | corpo | três seções em sanfona, fechadas, títulos em verde com ícone quadrado | seções abertas, título em texto comum, o texto inteiro à mostra | D | corrigida com ajuste de desempenho — 90c1c74, 0b1eb26 |
| 35 | contato | 768, 1280 | corpo | endereço à esquerda e "Assessoria de Imprensa" (título em verde) à direita, em duas colunas | endereço e assessoria em uma coluna, título comum | D | corrigida — db7fe7c |
| 36 | contato | todas | corpo | campos com fundo cinza em degradê, sem borda; "Assunto" na largura toda; botão "Enviar" centralizado | campos brancos com borda; "Assunto" em meia largura; botão alinhado à esquerda, azul mais escuro | D | corrigida — db7fe7c |
| 37 | noticias | todas | corpo | uma linha por notícia (data + título), linhas alternadas em cinza-claro, na largura da caixa | data por extenso acima do título, título em negrito sublinhado, fio entre os itens; em 1280 a lista fica numa coluna de ~226 px no meio da página | D | corrigida — 39fe5df |
| 38 | videos | todas | corpo | `/video/video-institucional/`: título "Vídeo Institucional" e o corpo em branco (o vídeo não aparece na captura) | `/videos/`: título "Vídeos" e três links, dois com o mesmo nome "ALUPAR INSTITUCIONAL 2017_edit" e um "institucional" | C | pauta |
| 39 | videos | todas | corpo | título em verde, peso regular | título em preto, negrito (as outras internas usam azul) | D | corrigida — a60529d |
| 40 | todas | todas | rodapé | links sem sublinhado; separadores "\|" com ~12 px de cada lado | links sublinhados; separadores com ~6 px; na quebra, o "\|" abre a linha de baixo ("\| CANAL DE DENÚNCIAS") | D | corrigida com ajuste de acessibilidade — 8106a3c, e4c7b06 |
| 42 | todas | 768, 1280 | cabeçalho e menu | faixa do menu branca, de ponta a ponta da tela, da base da barra cinza até a base do box do logotipo | faixa no cinza da página (#ECECEC); além da cor, o item da página atual, em verde, fica a 3,82:1 sobre esse cinza e reprova o AA nas internas | D | corrigida — 793444a |
| 41 | internas | todas | corpo | texto corrido em 14 px, com 10 px entre parágrafos (`body` do `style.css` e `p` do bootstrap) | 16 px, com 16 px entre parágrafos (`body` de `src/styles/tokens.css`) — as páginas ficam mais altas: empresas mede 21 947 px contra 20 226 px do atual em 1280 | D | pendente — manutenção |

Na página empresas, a parte abaixo de 16 384 px (altura máxima de captura do
Chrome) foi capturada à parte, com `node scripts/capturar-telas.mjs --pagina
empresas --de 16384`, e conferida visualmente nos dois lados em 11/09/2026.

## Pares com leitura limitada

- **empresas (390, 768 e 1280):** a página passa de 16 384 px, o limite de
  altura da captura do Chrome. O que fica abaixo disso foi capturado à parte
  (`--pagina empresas --de 16384`) e conferido nos dois lados em 11/09/2026: o
  fim de "Transmissoras", as seções "Geradoras" e "Comercialização" — as duas
  em sanfona, fechadas, com os mesmos itens (UHEs, PCHs, Eólicas, Solar; ALUP)
  — e o rodapé conferem. Sobra uma leitura limitada só nos mapas: na captura
  do site atual a maior parte não carregou. Medido no DOM em 1280 px, os dois
  lados têm 30 mapas, com altura média de 429 px no atual e 433 px no novo
  (descontados, no novo, o logotipo e a faixa de foto, que também são
  imagens) — a falta é da captura, não do site.
- **home, home-en, home-es (390):** no atual, a caixa do vídeo saiu em branco;
  o vídeo só foi comparado em 768 e 1280 (linha 17).
- **videos (todas):** no atual, o corpo da página saiu em branco; não dá para
  dizer se há um vídeo ali (linha 38).
- **Rotativo da home:** a captura do atual mostra o banner que estava no ar
  naquele segundo ("Mais Energia" em home). A legenda (linha 11) foi
  comparada no mesmo banner em home-en 768, onde o atual mostra
  "#SUSTAINABILITY", o mesmo do novo.

## Resumo

42 divergências: 34 do tipo D (33 corrigidas — 32 na Tarefa 4 e 1 na rodada de
correções da conferência —, 1 pendente de manutenção), 7 do tipo C (na pauta),
1 do tipo A.
