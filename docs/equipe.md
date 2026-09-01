# Equipe

Dimensionamento derivado dos pacotes de trabalho do plano — 500 h em 6 a 7
semanas, a R$ 120/hora. Não é estimativa por analogia: cada hora abaixo sai de
um pacote nomeado.

**Média de 1,8 FTE**, com pico na Semana 4. O projeto não comporta uma pessoa
só nem justifica seis em tempo integral.

---

## Alocação sobre a equipe atual

| Pessoa | Papel no projeto | Horas | Carga em 7 semanas | Pacotes |
|---|---|---:|---:|---|
| **Lucas** | Dev — front-end e infraestrutura | 204 | 73% | Front-end (112), Infra e observabilidade (40), Faixa institucional (16), Formulário técnico (16), QA de regressão (20) |
| **Sofia** | Modelagem de conteúdo e dados estruturados | 80 | 29% | CMS e migração do acervo (56), SEO técnico (24) |
| **Marcela** | Coordenação e governança | 52 | 19% | Coordenação (32), homologação e evidências (20) |
| **Camila** | Estratégia e interface com a Alupar | 32 | 11% | Descoberta e arquitetura de informação (32) |
| **Juliana** | Conteúdo em português | 28 | 10% | Revisão e redação PT (28) |
| — | **Design** | 52 | 19% | Captura de identidade (16), Design (36) |
| — | **Acessibilidade** | 32 | 11% | Auditoria e correção WCAG 2.2 AA (32) |
| — | **Tradução EN/ES** | 20 | 7% | Paridade de idiomas (20) |

**104 h — 21% do projeto, R$ 12.480 — não têm dono na equipe atual.**

### Por que cada encaixe

- **Lucas** é o único desenvolvedor da lista e sua função já une infraestrutura e
  sites, que é exatamente a combinação deste projeto: Cloudflare, DNS e Pages de
  um lado, Astro e CSS do outro.
- **Sofia** cuida de grafo de conhecimento, e é disso que se trata modelar cinco
  tipos no Sanity, migrar 225 notícias com metadados coerentes e estruturar o
  JSON-LD. É a pessoa certa para a parte que normalmente vira improviso.
- **Marcela** assume a coordenação e as evidências de homologação; **Gabi** entra
  como escalonamento executivo, não como alocação horária.
- **Camila** é quem tem interface com o cliente, e a Descoberta é justamente
  onde o projeto precisa arrancar respostas da Alupar — inclusive as duas
  seções em aberto do PRD (público e métricas).
- **Juliana** escreve o conteúdo em português. Tradução para inglês e espanhol é
  outra competência e está separada de propósito.
- **Clarice** revisa a política de privacidade, as condições de uso e o
  consentimento LGPD do formulário. Não entra nas 500 h porque é parecer, não
  execução — mas **é bloqueante do M4** e precisa receber os textos na Semana 4,
  não na Semana 7.
- **Fernanda** e **Beatriz** atuam em medição, contrato e faturamento, fora das
  horas de execução.

---

## As três lacunas

### 1. Design — 52 h · sem dono

Ninguém na equipe tem função de design. As 52 h já são o número **reduzido** pelo
restauro fiel: não há concepção de layout, só adaptação responsiva dos seis
templates existentes, direção de arte dos banners por breakpoint e estados de
foco. Um redesenho custaria 116 h.

Saídas, em ordem de preferência:

1. Freelancer de UI por 52 h (R$ 6.240). Precisa entender que o trabalho é
   restauro, não criação — designer que queira redesenhar é risco, não ajuda.
2. Designer do Marketing da Alupar. Como o Marketing é a instância que aprova
   qualquer uso da marca, ter alguém de lá dentro do time encurta o M2.
3. Lucas absorve com apoio do guia de estilo. **Não recomendado**: leva a carga
   dele a 92% e concentra ainda mais risco numa pessoa só.

### 2. Acessibilidade — 32 h · sem dono

Auditoria WCAG 2.2 AA, correção e teste com leitor de tela e navegação por
teclado. **Não é cortável**: é critério de aceite, o CI reprova o merge, e o site
atual reprova hoje em imagens sem `alt`, formulário sem rótulo e `<h1>` sem
texto. Ferramenta automática pega parte; leitor de tela real, não.

Saídas: consultor especializado por 32 h (R$ 3.840), ou capacitar Lucas — que
serve para o projeto seguinte, mas não para este prazo.

### 3. Tradução EN/ES — 20 h · sem dono

Juliana escreve em português. As versões em inglês e espanhol precisam de
paridade verificada no build, e hoje o site tem o menu meio traduzido e uma
hashtag em português na versão inglesa. Pode ser fornecedor da própria Alupar —
vale perguntar antes de contratar.

---

## O risco que o quadro revela

**Lucas a 73% por sete semanas seguidas, sozinho na função técnica.** Não é
sobrecarga — é ponto único de falha. Férias, doença ou outro projeto e o
cronograma para inteiro, porque não há segunda pessoa que conheça o código.

Duas formas de tratar:

- **Segundo dev a 30%** (84 h, R$ 10.080) trabalhando em pareamento nas semanas
  2 a 5. Não acelera o projeto — reduz o risco e deixa conhecimento distribuído.
- **Aceitar o risco explicitamente**, com o combinado de que qualquer ausência
  de Lucas empurra o go-live, e registrar isso antes de assinar prazo.

A segunda é legítima se o custo pesar. A que não é legítima é não decidir.

---

## Custo das lacunas

| Item | Horas | Custo |
|---|---:|---:|
| Design | 52 | R$ 6.240 |
| Acessibilidade | 32 | R$ 3.840 |
| Tradução EN/ES | 20 | R$ 2.400 |
| **Subtotal — dentro das 500 h já orçadas** | **104** | **R$ 12.480** |
| Segundo dev (opcional, mitigação de risco) | 84 | R$ 10.080 |

As 104 h **já estão dentro do orçamento de R$ 60.000** — o que falta é quem as
executa, não verba. O segundo dev é o único acréscimo real.

---

## Competências necessárias

Por papel, o que a pessoa precisa efetivamente saber fazer:

| Papel | Competências |
|---|---|
| Dev front-end | Astro ou outro gerador estático; CSS moderno com custom properties, flex e grid, **sem framework de UI**; otimização de imagem responsiva; Core Web Vitals na prática, não na teoria |
| Dev infraestrutura | Cloudflare — Pages, DNS, Redirect Rules, Workers, Turnstile; cabeçalhos de segurança e o que cada um faz; GitHub Actions com Lighthouse CI |
| Modelagem de conteúdo | Sanity e GROQ; internacionalização por documento; migração por script com preservação de URL e data; JSON-LD e dados estruturados |
| Design | Trabalhar **dentro** de um sistema existente; direção de arte responsiva por breakpoint; estados de foco e contraste como parte do desenho, não como correção posterior |
| Acessibilidade | WCAG 2.2 AA; teste real com leitor de tela e teclado; formulários acessíveis; saber o que a ferramenta automática **não** pega |
| Conteúdo | Redação institucional; revisão de paridade entre três idiomas; disciplina de texto alternativo |
| Coordenação | Governança de marcos e evidências; interface com duas equipes externas (RI e MZ) e três áreas da Alupar |

---

## Skills de repositório a criar

A ness. já opera com skills versionadas no repositório do AlupData. As
equivalentes aqui, em ordem de retorno:

| Skill | O que codifica |
|---|---|
| `restauro-fiel` | A regra do D2 aplicada template a template: o que pode mudar, o que não pode, e a conferência lado a lado contra o site atual e o portal de RI |
| `marca-alupar` | MIV 2018, tokens, as duas correções documentadas (`#00A0E3` e o verde de texto), versões do logotipo e o que exige aprovação do Marketing |
| `cloudflare-alupar` | Convenções de `_headers` e `_redirects`, Redirect Rules, e as armadilhas — HSTS com `includeSubDomains` atinge o portal de RI, que é de outra equipe |
| `sanity-alupar` | Modelo de conteúdo, i18n por documento, migração com preservação de URL, webhook de build |
| `a11y-gate` | O checklist WCAG que o CI cobra, com o que a ferramenta automática não pega |

As três primeiras pagam o custo já na Semana 2. As duas últimas, na Semana 3.
