# PRD — Site institucional da Alupar

**Status:** rascunho em construção · **Base:** diagnóstico de 01/09/2026 · **Repositório:** `nessenergy/sitealupar` · **Contrato:** ness. · **Execução:** Bekaa

Este documento é o registro de produto da replataforma do `alupar.com.br`. Ele
convive com dois outros: [`decisoes.md`](decisoes.md) guarda as decisões e seus
motivos, [`marco-0-runbook.md`](marco-0-runbook.md) guarda as ações emergenciais.
Aqui fica o que o site precisa ser e por quê.

> **Como continuar.** As seções 2 e 7 estão incompletas de propósito — dependem
> de respostas que só a Alupar tem. Elas estão marcadas com `EM ABERTO` e a
> seção 9 lista as perguntas. Preencher essas duas seções é o próximo passo do
> documento; o resto está fechado.

---

## 1. Problema e evidência

O site institucional está tecnicamente congelado em 2017 e editorialmente
parado em 2023. Tudo abaixo foi medido em 01/09/2026 por requisição HTTP
direta, não estimado.

| O que | Estado medido |
|---|---|
| Domínio raiz | `https://alupar.com.br` serve certificado **vencido em 05/05/2026**. Quem digita o endereço sem `www` vê tela de erro, não o site |
| Última notícia | **02/03/2023** — 3,5 anos. No mesmo instante o portal de RI exibe 06/08/2026 |
| Banners no ar | COVID-19 de 2021, selo FIA 2021 e três telas de agosto de 2017 |
| Peso da home | **2,19 MB** em 41 recursos; 84% em imagens; dois JPEGs de 2017 somam metade da página |
| Imagens | **Zero** com `loading="lazy"`, `srcset`, WebP ou AVIF |
| JavaScript | 21 arquivos, incluindo polyfills de Internet Explorer 8 e **três** bibliotecas de carrossel simultâneas |
| Acessibilidade | `alt=""` em todos os banners; 30 de 42 imagens em `/empresas`; o formulário de contato tem **um** `<label>` para cinco campos; o `<h1>` é um logotipo sem texto algum |
| SEO | Sem `meta description`; hierarquia salta de `h1` para `h3`; JSON-LD injetado por JavaScript |
| Idiomas | EN e ES servidos dentro de `<html lang="pt-br">`, com tradução incompleta no menu |
| Segurança | Institucional sem CSP, `Referrer-Policy` nem `Permissions-Policy` — que o portal de RI já envia. Nenhum host com HSTS |
| Acervo | 20 URLs no ar e indexáveis, das quais 7 no menu. As outras 13 são duplicatas e restos de edição |

**A causa não é o WordPress.** O portal de RI roda na mesma infraestrutura, com
o mesmo tema e o mesmo fornecedor, e está em dia — porque tem dono, calendário
e obrigação regulatória. O institucional herdou a plataforma e não herdou o
dono. Um certificado que vence sem ninguém notar por quatro meses é sintoma
disso, não causa.

Refatorar só o código repõe o site em 2026 e o deixa envelhecer de novo pelo
mesmo motivo. Por isso este PRD trata das duas coisas: o que construir e quem
opera depois.

---

## 2. Público e jornadas · `EM ABERTO`

**Esta é a maior lacuna do documento, e ela é anterior ao projeto:** a home
atual não declara para quem fala. Não há persona definida em lugar nenhum, e
sem isso a pergunta "a home cumpre sua função?" não tem resposta possível.

### Hipóteses a validar

Levantadas a partir dos links de saída do site e do que ele oferece — são
**hipóteses**, não personas validadas:

| Candidato | Evidência no site atual | O que precisaria encontrar |
|---|---|---|
| Investidor que entrou pelo endereço errado | Link "Relações com Investidores" em posição de destaque no topo | Caminho imediato e visível para o portal de RI |
| Candidato a vaga | Link para `alupar.gupy.io` no menu principal | Quem é a empresa, onde atua, cultura — antes de decidir se aplica |
| Jornalista ou analista | Página de contato com assessoria de imprensa nominal | Dados institucionais, releases, contato de imprensa |
| Comunidade e poder público de municípios com ativos | Seção de sustentabilidade com meio ambiente, água, fauna e flora | Quais ativos existem na região e o que a empresa faz ali |
| Fornecedor | Canal de denúncias, código de conduta de terceiros | Compliance, como se cadastrar |

### O que resolve

Duas fontes, nesta ordem:

1. **GA4 `G-HH1N2K084G`** — a propriedade existe e está instalada há anos.
   Volume, origem de tráfego, páginas mais vistas e caminhos de saída
   responderiam isso com dado real em vez de suposição. A propriedade é
   compartilhada com o portal de RI (ver `decisoes.md`, tabela de fronteira).
2. **Conversa com Comunicação e Marketing** — para quem eles entendem que o
   site fala hoje, e para quem deveria falar.

**Enquanto esta seção estiver aberta**, a implementação segue pelo restauro
fiel: preservar a estrutura atual é a decisão segura justamente porque não
sabemos ainda o que priorizar. A faixa institucional (seção 4) é a única
aposta feita sem esse dado, e é deliberadamente pequena e reversível.

---

## 3. Escopo

### Entra

- As 7 páginas ativas: home, A Companhia, Área de Atuação, Empresas, Inovação e
  P&D, Contato, Política de Privacidade
- Acervo de notícias (99 registros) e vídeos (3), com corte editorial de 24
  meses na listagem e arquivo indexável
- Três idiomas: PT-BR, EN, ES — com paridade de conteúdo verificada no build
- Faixa de indicadores institucionais na home
- Publicação pela própria equipe da Alupar, sem chamado a fornecedor
- Saída da infraestrutura da MZ Group

### Não entra

- **O portal `ri.alupar.com.br`** — está a cargo de outra equipe e não será
  refeito. Aparece aqui como fronteira e como referência de comparação
- **A galeria de fotos** — permanece no NAS Synology (`/fotos`), fora dos
  critérios de performance e acessibilidade, dentro do monitoramento
- **Redesenho visual** — a linguagem visual atual é preservada; ver a regra em
  `decisoes.md`
- **Nova arquitetura de informação** — a ordem e a estrutura das seções são as
  de hoje. Mudá-las depende da seção 2 deste documento

---

## 4. Requisitos por página

### Home

| # | Requisito |
|---|---|
| H1 | Rotativo de destaques com controle de pausa, navegação por teclado e altura reservada. Recorte próprio por breakpoint — a proporção atual de 5,82:1 vira uma faixa de 67 px num celular de 390 px |
| H2 | Faixa de quatro indicadores institucionais entre o rotativo e as notícias. Único acréscimo de estrutura do projeto |
| H3 | Listagem de notícias vinda do feed do portal de RI, com data legível e link para o arquivo |
| H4 | Vídeo institucional carregado sob demanda, sem custo de banda antes do clique |
| H5 | Bloco de sustentabilidade com os três eixos atuais |
| H6 | `<h1>` com texto real. O atual é um logotipo com `font: 0/0 a` e não entrega nada ao leitor de tela |

**Sobre a faixa (H2).** A home hoje não diz em lugar nenhum o que a Alupar é ou
faz. Quatro números, na paleta e tipografia existentes, sem deslocar seção
alguma. Dois valores já se sabem — 4 países e rating AAA (bra) pela Fitch, ambos
publicados pelo próprio RI. Os outros dois — **km de linhas de transmissão** e
**MW de capacidade instalada** — precisam vir da Alupar e não serão estimados.

### Contato

| # | Requisito |
|---|---|
| C1 | Cada campo com `<label>` associado. Hoje são cinco campos e um único rótulo |
| C2 | Erros de validação associados programaticamente ao campo que descrevem |
| C3 | Consentimento LGPD explícito, com política de retenção declarada |
| C4 | Antispam por Turnstile, no lugar do reCAPTCHA |
| C5 | Revisar os dados publicados: a página ainda oferece **fax** como canal |

### Empresas

| # | Requisito |
|---|---|
| E1 | As 42 fichas passam a ser registros no CMS, não HTML mantido à mão — *Nota de 21/09/2026: não cumprido; não há CMS (D11 em revisão). As fichas saem do acervo versionado* |
| E2 | Texto alternativo obrigatório por validação — hoje 30 das 42 imagens têm `alt=""` |

### Notícias

Superado pela D16 em 16/09/2026: a área de notícias foi desativada, e os
endereços vivos redirecionam para o portal de RI. N1 a N3 não se aplicam mais.

| # | Requisito |
|---|---|
| N1 | ~~As 183 URLs continuam vivas. O corte é editorial, não técnico~~ |
| N2 | ~~Listagem principal com os últimos 24 meses~~ |
| N3 | ~~Arquivo em `/noticias/arquivo/`, paginado e indexável, fora da navegação de destaque~~ |

### Todas as páginas

| # | Requisito |
|---|---|
| G1 | `lang` correto por idioma e `hreflang` por rota — sem `?lang=` |
| G2 | Título e `meta description` únicos |
| G3 | Um `<h1>` de conteúdo, hierarquia sem saltos |
| G4 | Imagens em AVIF/WebP com `srcset`; `lazy` abaixo da dobra |
| G5 | Foco visível na navegação por teclado |

---

## 5. Requisitos não-funcionais

Aplicados pelo CI (`lighthouserc.json`), não pela disciplina de quem publica.
Um PR que os viole não entra.

> **Estado em 24/09/2026.** A coluna "Estado atual" desta tabela é a medição de
> **01/09/2026**, antes da reconstrução — está mantida porque é a linha de base
> que justifica cada critério. O estado de hoje, medido em produção, está em
> [`relatorio-de-entrega.md`](relatorio-de-entrega.md): todos os critérios
> técnicos são cumpridos e vigiados a cada merge; o único não entregue nesta
> fase é a autonomia de publicação (CMS), pelo motivo registrado na D11.

| Dimensão | Critério | Estado em 01/09/2026 |
|---|---|---|
| Peso da home | ≤ 600 KB transferidos, imagens ≤ 400 KB | 2,19 MB |
| Performance | LCP < 2,5 s · CLS < 0,1 · Lighthouse ≥ 90 | não medido em navegador |
| Imagens | 100% em AVIF/WebP com `srcset`, `lazy` abaixo da dobra | 0% |
| Acessibilidade | WCAG 2.2 AA sem violação crítica; 100% das imagens com `alt`; formulário navegável só por teclado | reprova |
| Idiomas | Paridade 100% PT/EN/ES | reprova |
| SEO | Título e descrição únicos; um `<h1>`; JSON-LD no HTML servido | reprova |
| Continuidade | Zero 404 nos 387 itens do acervo, nas 265 URLs com `?lang=` e nos 125 permalinks traduzidos; `/en/` e `/es/` respondem 200 sem redirecionamento | — |
| Segurança | CSP, HSTS, Referrer-Policy, Permissions-Policy; certificado com renovação automatizada | reprova |
| Operação | A Comunicação publica notícia e troca banner sem chamado a fornecedor | não |

**Nota sobre continuidade.** O critério antigo dizia "20 URLs antigas e 99
notícias", números do primeiro levantamento pelo menu. A aquisição do acervo
mediu o que existe de fato: 387 itens de conteúdo, 265 endereços com `?lang=`
e 125 permalinks que o WPML traduziu. O mapa está em `public/_redirects` e
`infra/redirect-rules.md`, gerado de `acervo/inventario.json`.

A checagem de `/en/` e `/es/` **não é redundante** com a paridade de idiomas.
Hoje `https://www.alupar.com.br/en/` responde 301 para um comunicado de 2014 —
uma regra do plugin Redirection que sobrevive à virada se ninguém a apagar. É
um defeito que teste de página não pega, porque ninguém testa a raiz de um
idioma: testa-se `/en/a-companhia/`, que funcionaria. Detalhe em
`docs/redirects-da-origem.md`.

```bash
curl -sI https://www.alupar.com.br/en/ | grep -iE "^(HTTP|location)"
curl -sI https://www.alupar.com.br/es/ | grep -iE "^(HTTP|location)"
# esperado: HTTP/2 200, sem location
```

**Nota sobre contraste.** O verde de marca `#079541` entrega 3,90:1 sobre
branco e reprova o critério AA para texto. Ele permanece intacto em barras,
botões e superfícies, onde o critério é 3:1 e ele passa; para texto e links
usa-se `#06893C` (4,51:1). Ver `src/styles/tokens.css`.

---

## 6. Decisões e restrições

As doze decisões estão em [`decisoes.md`](decisoes.md) com sua justificativa.
Aqui ficam apenas as restrições que limitam o desenho do produto:

- **A linguagem visual é imutável.** Paleta, tipografia, grade e vocabulário de
  componentes vêm do Manual de Identidade Visual 2018 e do site atual. A
  composição melhora só onde há problema medido
- **O portal de RI convive com o site novo.** O visitante alterna entre os dois
  por um link no topo. Divergência visual entre eles é defeito, não escolha
- **O Marketing aprova qualquer uso da marca** — é o que o manual determina.
  Isso é portão do M2, não revisão no fim
- **A conta do Sanity fica em nome da Alupar**, não da agência. É o que torna a
  saída de qualquer fornecedor futuro indolor. *Nota de 21/09/2026: vale se a D11 for
  retomada; o Sanity não foi implantado*
- **O feed de notícias depende da equipe do RI.** É a única dependência externa
  no caminho crítico

---

## 7. Métricas de sucesso · `PARCIALMENTE EM ABERTO`

### Fechadas — técnicas

São os critérios da seção 5, medidos em homologação e de novo 7 dias após o
go-live.

### Em aberto — de produto

Os critérios técnicos dizem que o site está bem construído. **Não dizem que ele
cumpre sua função.** Para isso faltam duas coisas:

1. **Linha de base.** Sem os números atuais do GA4 não há com o que comparar
   depois. Extrair antes do go-live é irreversível — depois da virada, a
   comparação fica comprometida
2. **Definição de sucesso.** Depende da seção 2. Se o público prioritário for
   candidato a vaga, a métrica é ida ao Gupy. Se for investidor perdido, é
   travessia para o portal de RI. São coisas diferentes

Uma métrica **independe do público e pode ser fixada agora**: a distância entre
a última publicação e hoje. Se voltar a passar de 90 dias, o projeto falhou no
que tinha de mais estrutural — e nenhuma nota de Lighthouse compensa isso.

---

## 8. Plano, custo e riscos

**500 h · R$ 60.000 · 6 a 7 semanas**, a R$ 120/hora. O detalhamento por pacote,
o cronograma e os marcos estão no plano de execução.

O **Marco 0** (16–24 h, R$ 1.920–2.880) é independente e não deve esperar pelo
resto: ele tira do ar a tela de erro que qualquer pessoa vê hoje ao digitar
`alupar.com.br`. Ver [`marco-0-runbook.md`](marco-0-runbook.md).

### Riscos principais

| Risco | Mitigação |
|---|---|
| Restauro vira redesign por acúmulo de pequenas melhorias | Toda melhoria aponta para um problema medido; conferência lado a lado a cada template |
| Tradução EN/ES não acompanha o PT | Congelar o texto PT no M2; tradução como trilha paralela desde a S4 |
| Novo site sem dono depois da entrega | Condição de aceite do go-live, não recomendação |
| Feed do RI não é liberado a tempo | Carga manual provisória; não bloqueia o go-live |
| Marketing reprova por divergência de marca | Aprovação formal como portão do M2, não revisão no fim |

---

## 9. Perguntas em aberto

Ordenadas por quanto mudam o documento.

- [ ] **P1 — Para quem o site fala, em ordem de prioridade?** Sem isso a seção 2
      fica hipotética e a 7 fica pela metade
- [ ] **P2 — Há acesso ao GA4 `G-HH1N2K084G`?** Volume, origem e páginas mais
      vistas transformariam a seção 2 de hipótese em fato
- [ ] **P3 — km de linhas de transmissão e MW de capacidade instalada.**
      Necessários até o M2 para a faixa institucional
- [ ] **P4 — Quem é a pessoa responsável pelo conteúdo?** A decisão D6 nomeou a
      Comunicação, que é uma área. Foi exatamente uma área sem pessoa nomeada
      que deixou o site parar em 2023
- [ ] **P5 — Qual o valor do contrato atual com a MZ e o custo do servidor
      `34.230.121.250`?** Sem os dois não dá para calcular em quanto tempo o
      investimento se paga
- [ ] **P6 — Existe modelo de PRD da Bekaa a seguir?** Se sim, este documento se
      adapta à estrutura dele
- [ ] **P7 — O público deste documento é a diretoria da Alupar, a equipe de
      implementação, ou os dois?** Muda a profundidade técnica das seções 4 e 5

---

## Apêndice — como as medições foram feitas

Todos os números da seção 1 vêm de requisição HTTP direta em 01/09/2026, sem
navegador. Reproduzíveis:

```bash
# Certificado do domínio raiz
curl -sSv https://alupar.com.br/ 2>&1 | grep -E "subject:|expire date"

# Origem do apex (é outro servidor, não o mesmo host do www)
curl -sS -H "accept: application/dns-json" \
  "https://cloudflare-dns.com/dns-query?name=alupar.com.br&type=A"

# Peso da home: somar o transferido de cada recurso do HTML
curl -sS https://www.alupar.com.br/ | grep -oE '(src|href)="[^"]+\.(js|css|jpg|png)[^"]*"'

# Cabeçalhos de segurança, institucional contra RI
curl -sSI https://www.alupar.com.br/ | grep -iE "content-security|referrer|permissions|strict"
curl -sSI https://ri.alupar.com.br/  | grep -iE "content-security|referrer|permissions|strict"

# Inventário do acervo
curl -sS https://www.alupar.com.br/page-sitemap.xml    | grep -c "<loc>"
curl -sS https://www.alupar.com.br/noticia-sitemap.xml | grep -c "<loc>"
```

**O que não foi medido:** LCP, INP, CLS e qualquer métrica de renderização em
navegador real. As afirmações sobre desempenho referem-se a bytes transferidos
e à composição do front-end, não a tempo percebido. Um Lighthouse em rede móvel
e um teste com leitor de tela são o próximo passo antes de fechar escopo.
