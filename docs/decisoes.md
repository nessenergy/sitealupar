# Decisões

Registro das decisões que definem este projeto. A pergunta daqui a seis meses
não vai ser o que se decidiu, e sim por quê.

Base: diagnóstico de `alupar.com.br` em 01/09/2026 e Manual de Identidade
Visual de 2018.

| # | Decisão | Escolha | Por quê |
|---|---|---|---|
| D1 | Rota | **Replataforma** (não reforma) | 7 páginas não justificam PHP, Redis e cache de página. Encerra a dependência da MZ, que é a causa estrutural, não o sintoma |
| D2 | Direção visual | **Restauro fiel** | Linguagem visual imutável; a composição melhora só onde há problema medido |
| D3 | Hospedagem | **Cloudflare Pages** | TLS renovado automaticamente: o incidente que originou o projeto deixa de ser possível. A zona já estava na Cloudflare |
| D4 | Galeria `/fotos` | **Mantém no NAS** | TLS Let's Encrypt válido e com renovação automática; fora do escopo do site, dentro do monitoramento |
| D5 | Feed de notícias | **Vem do RI** | Uma fonte só, mantida por quem já a alimenta. Elimina o feed que parou sozinho por 3,5 anos |
| D6 | Dono do conteúdo | **Comunicação Alupar** | Área sem responsável nomeado foi o que deixou o site parar em 2023. Pessoa nomeada na D17 |
| D8 | Identidade | **MIV 2018** | Fixa paleta, tipografia, versões, campo de proteção e proibições |
| D9 | Corte das notícias | **24 meses na listagem** | Arquivo indexável mantém as 183 URLs vivas; corte é editorial, não técnico. Superada pela D16 em 16/09/2026: não há mais listagem |
| D10 | Faixa institucional | **Entra** (+16 h) | Única adição de estrutura: a home não diz em lugar nenhum o que a Alupar é |
| D11 | CMS | **Sanity** | Editor maduro, i18n nativo, conta em nome da Alupar. O site estático sobrevive à queda do CMS |
| D12 | Tipografia | **Manual ganha fonte de web** | Segoe UI não se licencia para web; Open Sans passa a ser oficial para tela, Segoe UI segue no impresso |
| D13 | Plataforma, em definitivo | **Astro estático — confirmado** | O escopo preliminar da ness. previa WordPress. A API REST do site atual está bloqueada, então a recuperação é por crawling para qualquer destino: a migração custa o mesmo nos dois caminhos, e só o custo de operação difere |
| D14 | Idiomas na URL | **Prefixo `/en/` e `/es/`** | O `?lang=` produz duplicata indexável e não é expressável no `_redirects` do Pages. Prefixo de caminho é a forma nativa de i18n do Astro |
| D15 | Modelo comercial | **Entrada de R$ 12.500 e mensalidade de R$ 1.500, por 12 meses renováveis por 12** | A Alupar já paga R$ 1.500/mês à MZ, só pelo institucional. A mensalidade substitui essa linha; a implantação é paga na entrada, e não diluída num contrato longo |
| D16 | Área de notícias | **Desativada; 301 para o portal de RI** | A Alupar decidiu em 16/09/2026: "as notícias estão antigas… desativar mesmo". Fecha a D5 pelo caminho mais simples — em vez de importar um feed, o site deixa de ter a área e manda os 186 endereços vivos para quem já os mantém. Nenhum 404 (regra 3) |
| D17 | Dono do conteúdo, com nome | **Fabiana Carneiro Pinho** | A D6 nomeou a área; faltava a pessoa. Foi a ausência de dono que deixou o site parar em 2023, e área não assina nada — pessoa assina |

## Por que a plataforma deixou de ser pergunta (D13)

O *Escopo Técnico Preliminar* da ness. definia WordPress, e o argumento era
razoável: origem em WordPress, destino em WordPress, migração mais barata.

A medição de 02/09/2026 derrubou o argumento. A API REST do institucional está
bloqueada — o iThemes Security removeu as rotas `wp/v2` e as coleções respondem
403. Não existe exportação. A recuperação é página por página, **para qualquer
destino**. Com o custo de migração igual nos dois caminhos, o que resta é o
custo de operação: WordPress cobra patch de núcleo, tema, plugin e PHP todo mês,
mais backup e superfície de invasão; o site estático cobra nada disso.

A causa do estado atual não é o WordPress — é a ausência de dono. Mas o
WordPress pune essa ausência todo mês, e foi exatamente essa punição que
produziu um site parado por 1.280 dias com o certificado vencido.

## Por que o idioma sai da query (D14)

Hoje o site usa `?lang=en`. Três problemas: cada página passa a ter duas URLs
para o mesmo conteúdo, o que o diagnóstico já apontou como duplicata
indexável; o Cloudflare Pages **não casa query string** no `_redirects`, então
todo tratamento vira regra de borda; e o WPML ainda traduz o permalink em 125
casos, criando um terceiro caminho para a mesma coisa.

O prefixo `/en/` e `/es/` resolve os três de uma vez, e é a forma nativa de i18n
do Astro. O mapa de compatibilidade está em `public/_redirects` e
`infra/redirect-rules.md`, gerados de `acervo/inventario.json` — não escritos à
mão, para que ninguém precise confiar na memória de quem os escreveu.

## Por que mensalidade (D15)

Decidido em 11/09/2026. A Alupar já paga R$ 1.500 por mês à MZ — só pelo
institucional. A proposta é uma entrada única mais uma mensalidade, que
substitui essa linha.

- **Entrada de R$ 12.500** na assinatura; **R$ 1.500 por mês** a partir da
  assinatura; vigência de **12 meses, renovável por mais 12**; IPCA anual
- Cobre implantação, hospedagem, monitoramento, atualizações e um banco de
  48 h/ano de manutenção, não cumulativas; o excedente sai a R$ 120/h
- Sem cláusula de rescisão. Titularidade de código, conteúdo e contas em nome
  da Alupar desde o primeiro dia
- A carta está em `apresentacao/proposta.html`
- Escopo: só o institucional. `rs`, `pdi` e `ma` seguem na ness. e, como os
  demais sites, entram depois por acréscimo na mensalidade — é a saída do
  WordPress em etapas, sem verba de projeto

A proposta não apresenta equipe nem horas: vende o que está coberto.

## A regra que separa melhoria de desvio (D2)

A **linguagem visual é imutável**: paleta, tipografia, grade, densidade e
vocabulário de componentes. A **composição pode melhorar onde houver problema
medido**. Melhoria que não aponta para um problema medido não entra — é assim
que restauro vira redesign por acúmulo, uma decisão razoável de cada vez.

Nenhuma tela é aprovada sozinha: cada uma é conferida contra a página atual
**e** contra o portal de RI, que permanece como está. Se alguém que conhece o
site notar a mudança sem ser avisado, passou do ponto.

## Fora de escopo

O portal `ri.alupar.com.br` **não será refeito** — está a cargo de outra
equipe. Ele aparece aqui em dois papéis: referência de comparação e mapa de
fronteira. Nenhuma ação deste projeto incide sobre ele.

## Pendências operacionais

- Dois valores da faixa institucional (km de linhas, MW instalados) — Alupar, até o M2.
- ~~Acesso ao feed de notícias do RI~~ — sem objeto desde a D16.
- Prazo de guarda dos dados do formulário — a frente de LGPD está sendo redefinida com Bárbara, da ness. A Alupar respondeu as outras duas partes da P5 em 16/09/2026 e deixou esta em aberto.
- Divulgações de resultados apontando ao portal de RI — a Comunicação pediu ao RI em 16/09/2026 e compartilhará quando houver.
