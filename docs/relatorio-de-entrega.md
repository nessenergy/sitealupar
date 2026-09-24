# Relatório de entrega — site institucional da Alupar

**Data:** 23/09/2026 · **Situação:** `www.alupar.com.br` no ar pelo site novo desde as
20h20 de 23/09/2026 (D27).

**Base de comparação:** *Escopo Técnico Preliminar — Reconstrução e consolidação dos
portais digitais Alupar*, v1.0, 02/09/2026, elaborado pela ness., confrontado em
[`escopo-ness-correlacao.md`](escopo-ness-correlacao.md); e os critérios de aceite do
[`prd.md`](prd.md).

---

## 1. Sumário executivo

O institucional foi reconstruído e está no ar. O que a proposta previa foi entregue, com
duas exceções declaradas na seção 7. O que este relatório documenta, e que é o seu motivo
de existir, é o **conjunto de entregas que não estavam na proposta** — nem no escopo
preliminar da ness., nem nos critérios de aceite originais — e que respondem por parte
relevante do resultado.

Em números medidos hoje:

| | |
|---|---:|
| Páginas geradas, em três idiomas | **172** |
| Endereços do acervo que resolvem em 200 no site no ar | **666** |
| Regras de redirecionamento permanente publicadas | **319** estáticas + 11 dinâmicas |
| Decisões estruturais registradas, com motivo | **27** |
| *Pull requests* revisados e integrados | **84** |
| Testes automatizados | **177** |
| Scripts de operação e medição | **25**, mais 5 bibliotecas |
| Documentos de projeto | **14** |
| Objetos de mídia migrados para infraestrutura própria | **299** |

A diferença entre este projeto e a proposta que o originou não está no volume de páginas:
está em **quantas decisões passaram a ter número, prova e reversibilidade**. A proposta
pedia paridade funcional; a entrega instalou um portão de qualidade que reprova o próprio
time quando um limite é violado, e já reprovou — duas vezes em 23/09, as duas corrigidas
na origem do problema em vez de no limite.

---

## 2. Método e fontes

Nenhuma afirmação deste relatório é estimativa. Cada uma remete a uma das quatro fontes
abaixo, e as medições são reproduzíveis pelos comandos do anexo B.

1. **Decisões** — [`decisoes.md`](decisoes.md), D1 a D27, cada uma com data, escolha e o
   motivo que a sustenta.
2. **Histórico versionado** — 84 *pull requests* integrados, cada um com o problema medido
   no corpo e o portão de qualidade verde antes do merge.
3. **Medições automatizadas** — os scripts em `scripts/`, executados no CI a cada merge e
   reproduzíveis na máquina de qualquer pessoa da equipe.
4. **Verificação no ar** — as medições finais desta entrega foram feitas contra
   `https://www.alupar.com.br`, já em produção, e não contra o ambiente de conferência.

---

## 3. A linha de base: o que a proposta previa

O escopo preliminar da ness. (02/09/2026) definia a reconstrução do institucional em
**500 h / 6 a 7 semanas**, sobre WordPress, com recuperação do conteúdo público, três
idiomas, homologação antes da produção e autonomia de publicação para a Comunicação.

Os critérios de aceite do § 14 daquele documento eram de **paridade funcional**:
"navegação funcionando", "responsivo validado". Nenhum era numérico.

Essa é a distinção central deste relatório. Um site pode passar em todos os critérios de
paridade funcional e nascer com os mesmos defeitos do anterior — 2,19 MB de home, nenhuma
imagem com descrição, certificado vencido. Foi o que o diagnóstico de 01/09 mediu no site
então no ar, e é o que os critérios de paridade não impedem.

---

## 4. Os critérios de aceite, um a um

A tabela abaixo é a do PRD (§ 5), com a coluna do estado medido em 23/09/2026 no site em
produção.

| Dimensão | Critério | Entregue | Evidência |
|---|---|---|---|
| Peso da home | ≤ 600 KB; revisto para ≤ 3 MB pela D18 | **Dentro**, com o teto revisto | `total-byte-weight` ≤ 3.145.728 B, asserção do CI |
| Performance | LCP < 2,5 s · CLS < 0,1 · Lighthouse ≥ 90 | **Dentro** | asserções do CI em 16 URLs, 3 execuções |
| Imagens | 100% AVIF/WebP com `srcset`, `lazy` abaixo da dobra | **Entregue** | pipeline do Astro; `otimizar-imagens.mjs --verificar` no CI |
| Acessibilidade | WCAG 2.2 AA sem violação crítica | **Entregue, e como portão**: o CI exige nota **1,0**, não 0,9 | `lighthouserc.json`; auditoria axe-core de 21/09 com zero violações |
| Idiomas | Paridade 100% PT/EN/ES | **Entregue** | 172 páginas nos três idiomas |
| SEO | Título e descrição únicos; um `<h1>`; JSON-LD | **Entregue** | asserção `categories:seo ≥ 0,9` no CI |
| Continuidade | Zero 404 no acervo | **Entregue e provado no ar** | 666 endereços pedidos a `www`, todos 200 |
| Segurança | CSP, HSTS, Referrer-Policy, Permissions-Policy | **Entregue** | `public/_headers`; `verificar-csp.mjs` no CI |
| Operação | A Comunicação publica sem chamado a fornecedor | **Não entregue nesta fase** — ver seção 7 | D11 |

**Sobre o peso da home.** O critério original era 600 KB. A Alupar pediu, em 16/09, o
vídeo institucional tocando na abertura da home; medido o custo (2,39 MB com o player
carregado), o teto foi revisto para 3 MB e a decisão registrada na D18 **com o número na
mesa**. Não é um limite afrouxado para fazer o CI passar: é o preço declarado de um pedido
da cliente, com a alternativa — hospedar o MP4 e dispensar o JavaScript do YouTube —
mantida em aberto e dependente apenas do arquivo original.

---

## 5. O que foi entregue além da proposta

Esta é a seção que motiva o relatório. Cada item abaixo **não constava** do escopo
preliminar nem dos critérios de aceite originais.

### 5.1 Marco 0 — estancamento antes da reconstrução

O escopo preliminar começava pela reconstrução. O diagnóstico de 01/09 encontrou problemas
**no ar naquele momento**, que a reconstrução só resolveria semanas depois: apex sem HTTPS
válido havia 120 dias, cabeçalhos de segurança ausentes, CSS inexistente referenciado no
HTML, links internos em `http://`, banners de 2021 no rotativo e conteúdo parado desde
02/03/2023.

Foi criada uma etapa independente, de 16 a 24 h, com sete ações executáveis em 48–72 h e
verificação própria ([`marco-0-runbook.md`](marco-0-runbook.md)). Seis das sete estão
resolvidas ou perderam objeto com a virada; a sétima — o dono do certificado curinga —
depende da Alupar e é o risco da seção 8.

**Por que importa:** sem esta etapa, os defeitos que estavam no ar permaneceriam no ar
durante todo o projeto, e o único que a ness. podia corrigir sozinha (o apex) esperaria
sete semanas por um motivo que não era técnico.

### 5.2 Portão de qualidade que reprova merge

O escopo preliminar não tinha critério numérico. Este repositório instalou um portão que
roda a cada *pull request* e a cada merge na `main`, e que **reprova a integração** quando:

- a nota de acessibilidade não é **1,0** (não 0,9 — acessibilidade não tem meio-termo);
- performance, SEO ou boas práticas ficam abaixo de 0,9;
- o LCP passa de 2,5 s ou o CLS de 0,1;
- a página passa de 3 MB;
- qualquer link interno não resolve;
- qualquer endereço do acervo deixa de responder;
- qualquer recurso do build não é permitido pela CSP;
- qualquer imagem publicada está sem variante otimizada;
- qualquer teste falha (177 hoje).

O portão foi acionado de verdade duas vezes em 23/09, e nas duas o limite **não** foi
afrouxado: na primeira, uma URL da lista do Lighthouse apontava para uma página aposentada
(corrigida na lista, e com teste novo que detecta o caso em dois segundos em vez de doze
minutos); na segunda, a marca do rodapé era servida em 300 px para aparecer em 150
(corrigida no pipeline de imagem).

**Por que importa:** é a diferença entre um site que nasce bom e um site que continua bom.
A causa documentada da degradação do site anterior foi a ausência de dono; o portão é o
dono automático do que é mensurável.

### 5.3 Acessibilidade tratada como duas dívidas separadas

O escopo preliminar não cita WCAG. A entrega separou o que é do template do que é do
conteúdo migrado, porque a correção tem donos diferentes:

- **Do template** — corrigido no código e coberto pelo portão: contraste (o verde de marca
  reprova AA em texto e foi substituído por `--verde-texto`, documentado), foco visível,
  alvos de toque de 44 px, menu do celular que nasce recolhido sem esperar o JavaScript,
  aviso de nova aba injetado no build, ordem de teclado conferida por script.
- **Do conteúdo** — medido por `auditar-acessibilidade.mjs` e endereçado à Comunicação, com
  o estado de hoje nas páginas publicadas: **zero** imagens sem descrição, zero saltos de
  nível de cabeçalho, zero tabelas sem cabeçalho, zero iframes sem título.

Duas decisões registradas nasceram de medição e não de opinião: a **D20**, com auditoria
axe-core nas 175 páginas em duas larguras, e a **D23**, que eliminou um CLS de 0,367
reproduzido em 12 de 12 cargas — a nota de acessibilidade do celular na home saiu de
0,66–0,79 para 1,0.

### 5.4 Continuidade provada, não presumida

O escopo previa recuperação de conteúdo. Não previa **prova de que nenhum endereço
antigo morre**. A entrega tem três camadas:

1. **Aquisição medida** — 387 itens de conteúdo recuperados por extração dos dez sitemas
   públicos, com o inventário versionado.
2. **Mapa de 301 gerado, não escrito à mão** — 319 regras estáticas e 11 dinâmicas,
   derivadas do inventário, incluindo 265 endereços `?lang=` que o `_redirects` do
   Cloudflare Pages não alcança e que viraram duas regras de borda.
3. **Verificação automática** — `gerar-mapa-de-rotas.mjs --verificar` reprova rota
   duplicada e 301 que caia em página inexistente; `fechar-continuidade.mjs --verificar`
   exige que todo endereço vivo resolva. Desde a virada, o sentinela repete a medição
   **todo dia**.

O resultado foi medido no ar, depois da virada: **666 endereços, todos em 200**.

### 5.5 Observabilidade diária, com alarme que abre e fecha sozinho

Não estava na proposta. Um *workflow* diário (07:00 de Brasília) confere endereço e
validade de certificado de `alupar.com.br` com e sem `www`, do NAS da galeria e do portal
de RI, alerta a 30 dias do vencimento e **abre uma issue quando reprova, fechando-a quando
volta ao normal**. O julgamento de cada host vive em biblioteca testada, porque em shell
ele não distinguia origem fora do ar de cadeia de certificado incompleta.

É esse mecanismo que hoje mantém visível o único risco com data marcada do projeto (seção
8).

### 5.6 Infraestrutura de arquivos própria

O diagnóstico encontrou 51 páginas dependentes de serviços do fornecedor anterior e dois
hosts (`inst.alupar.mziq.com`, `ri.alupar.mziq.com`) que **não resolvem mais em DNS** —
imagens quebradas para qualquer visitante, em sete páginas, naquele momento.

A entrega criou `arquivos.alupar.com.br` sobre R2, com **299 objetos** migrados, manifesto
versionado e conferência automática a cada merge. Nenhum link do site novo aponta para
infraestrutura de terceiro que desapareça com o contrato.

### 5.7 Formulário de contato com caminho de envio próprio

O formulário anterior postava para a infraestrutura do fornecedor. A entrega tem função
própria na borda, proteção antiabuso por Turnstile, rótulos visíveis, validação com
mensagem por campo, e verificação de percurso de teclado por script — 34 paradas, os sete
campos na ordem visual, com nome e foco visível, conferido em produção.

A entrega de e-mail, porém, **ainda não foi provada de ponta a ponta**: falta a Comunicação
enviar uma mensagem de teste e confirmar o recebimento fora do spam. Está na seção 8.

### 5.8 Decisões de produto tomadas durante a execução

Oito decisões mudaram o produto depois do escopo preliminar, todas a pedido da Alupar e
todas registradas com data e motivo:

| Decisão | O que mudou |
|---|---|
| D16 | Área de notícias desativada; 186 endereços por 301 para o portal de RI |
| D18 | Vídeo institucional na abertura da home, com o orçamento de peso revisto |
| D19 | Texto institucional novo em Área de atuação e A Companhia, nos três idiomas |
| D24 | Home enxuta; Sustentabilidade e P&D viram portais próprios no menu; selos de reconhecimento |
| D25 | Cabeçalho fixo na rolagem; A Companhia sem valores e sem mapa |
| D26 | Rodapé em #10328F com a marca enviada pela Alupar |
| D27 | A virada |
| — | Redes sociais no rodapé, replicadas do `rs.alupar.com.br` |

Nenhuma delas constava da proposta. Todas foram implementadas, medidas e publicadas dentro
do mesmo dia do pedido, no caso das cinco últimas.

### 5.9 Ferramental de operação versionado

Vinte e cinco scripts, com cinco bibliotecas testadas, que transformam operações de
plantão em comandos verificáveis. Os que não existiam em proposta alguma:

- `virada.mjs` — os quatro passos da troca de servidor, **incluindo o retorno**, com
  confirmação explícita nos dois comandos destrutivos. O defeito que o próprio uso revelou
  (a API da Cloudflare não troca o CNAME sozinha, ao contrário do painel) está corrigido e
  documentado;
- `capturar-telas.mjs` — conferência visual lado a lado com o site anterior, em três
  larguras;
- `auditar-acessibilidade.mjs`, `verificar-teclado.mjs`, `verificar-no-ar.mjs`,
  `verificar-csp.mjs`, `verificar-links.mjs`, `verificar-hosts.mjs` — cada um mede uma
  dimensão que nenhum gate de mercado cobre sozinho.

### 5.10 Documentação como parte da entrega

Catorze documentos, entre os quais o plano de virada com 2.515 linhas — roteiro,
verificação e retorno —, o plano de homologação com 774, a correlação ponto a ponto com o
escopo preliminar da ness., o pedido formal de material endereçado à Comunicação e este
relatório.

O critério aplicado em todos: **quem ler daqui a seis meses precisa entender por que cada
decisão foi tomada**, não apenas qual foi. É o que impede a repetição do ciclo que deixou
o site anterior parado por 1.280 dias.

---

## 6. O que saiu do escopo, e por quê

| Item | Situação | Decisão |
|---|---|---|
| Três ambientes secundários (`rs`, `pdi`, `ma`) | Fora. Migração prevista para o orçamento de 2027 | 10/09/2026 |
| Área de notícias | Desativada; endereços redirecionados ao portal de RI | D16 |
| Páginas de Sustentabilidade e P&D | Substituídas pelos portais próprios da Alupar, ligados pelo menu | D24 |
| Rotativo de banners | Substituído pelo vídeo institucional | D18 |

Todas são reduções de escopo **decididas pela cliente**, com o conteúdo preservado por
redirecionamento permanente. Nenhuma é omissão.

---

## 7. O que esta entrega não cobre

Dois itens da proposta original não foram entregues nesta fase, e é importante que estejam
escritos:

1. **Autonomia de publicação da Comunicação (CMS).** A D11 previa Sanity; ele nunca foi
   implantado. O conteúdo vive em arquivos versionados. Os dois tipos que motivavam o CMS —
   banner e notícia — deixaram de existir com o vídeo no topo e a D16. A autonomia passa a
   ser critério do **tempo de manutenção**, não da implantação, e é a primeira entrega
   prevista da mensalidade.
2. **Prova de entrega do formulário.** Ver 5.7.

---

## 8. Riscos abertos, com prazo

| Risco | Prazo | Dono |
|---|---|---|
| Certificado curinga `*.alupar.com.br` vence, e passa a servir só ao portal de RI | **21/10/2026** | Alupar / RI |
| Textos em inglês e espanhol sem validação da Comunicação | antes de divulgar | Comunicação |
| 70 pendências de mídia do fornecedor anterior | antes do desligamento | ness. |
| Entrega do formulário não provada | imediato | Comunicação |
| Sitemap não enviado ao Search Console | primeira semana | ness. |

O sentinela mede o primeiro item todo dia e mantém a issue aberta enquanto durar.

---

## Anexo A — Índice de decisões

D1 rota · D2 direção visual · D3 hospedagem · D4 galeria · D5 feed de notícias · D6 dono do
conteúdo · D8 identidade · D9 corte de notícias · D10 faixa institucional · D11 CMS ·
D12 tipografia · D13 plataforma · D14 idiomas na URL · D15 modelo comercial · D16 notícias ·
D17 dono nomeado · D18 orçamento de peso · D19 texto institucional · D20 interface por
medição · D21 piso de texto · D22 páginas-casca · D23 menu do celular · D24 home enxuta ·
D25 cabeçalho fixo · D26 rodapé · D27 virada.

Íntegra, com motivos, em [`decisoes.md`](decisoes.md).

## Anexo B — Como reproduzir as medições

```bash
node scripts/verificar-no-ar.mjs                    # 666 endereços do acervo, no ar
node scripts/gerar-mapa-de-rotas.mjs --verificar    # mapa de rotas fecha com o de 301
node scripts/fechar-continuidade.mjs --verificar    # todo endereço vivo resolve
node scripts/verificar-links.mjs                    # todo link interno resolve
node scripts/verificar-csp.mjs                      # todo recurso cabe na CSP
node scripts/auditar-acessibilidade.mjs             # dívida de acessibilidade do conteúdo
node scripts/verificar-teclado.mjs <url>            # percurso de teclado do formulário
node scripts/virada.mjs estado                      # estado da virada (só lê)
npm test                                            # 177 testes
```
