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
| D11 | CMS | **Sanity** — *nunca implantado; em revisão* | Editor maduro, i18n nativo, conta em nome da Alupar. O site estático sobrevive à queda do CMS. **Estado em 21/09/2026:** adiado para a manutenção em 10/09/2026, só para banner e notícia; os dois deixaram de existir com o vídeo no topo (#94) e a D16. Não há conta, schema nem integração, e o conteúdo vive em arquivos versionados. Páginas institucionais e jurídicas nunca estiveram no escopo do CMS |
| D12 | Tipografia | **Manual ganha fonte de web** | Segoe UI não se licencia para web; Open Sans passa a ser oficial para tela, Segoe UI segue no impresso |
| D13 | Plataforma, em definitivo | **Astro estático — confirmado** | O escopo preliminar da ness. previa WordPress. A API REST do site atual está bloqueada, então a recuperação é por crawling para qualquer destino: a migração custa o mesmo nos dois caminhos, e só o custo de operação difere |
| D14 | Idiomas na URL | **Prefixo `/en/` e `/es/`** | O `?lang=` produz duplicata indexável e não é expressável no `_redirects` do Pages. Prefixo de caminho é a forma nativa de i18n do Astro |
| D15 | Modelo comercial | **Entrada de R$ 12.500 e mensalidade de R$ 1.500, por 12 meses renováveis por 12** | A Alupar já paga R$ 1.500/mês à MZ, só pelo institucional. A mensalidade substitui essa linha; a implantação é paga na entrada, e não diluída num contrato longo |
| D16 | Área de notícias | **Desativada; 301 para o portal de RI** | A Alupar decidiu em 16/09/2026: "as notícias estão antigas… desativar mesmo". Fecha a D5 pelo caminho mais simples — em vez de importar um feed, o site deixa de ter a área e manda os 186 endereços vivos para quem já os mantém. Nenhum 404 (regra 3) |
| D17 | Dono do conteúdo, com nome | **Fabiana Carneiro Pinho** | A D6 nomeou a área; faltava a pessoa. Foi a ausência de dono que deixou o site parar em 2023, e área não assina nada — pessoa assina |
| D18 | Orçamento de peso da home | **600 KB → 3 MB**, para o vídeo do topo tocar sozinho | A Alupar pediu o institucional no lugar do rotativo, tocando ao abrir. Medido: com o player carregado o peso vai a 2,39 MB — 1,19 MB de vídeo e ~850 KB do JS do YouTube. O limite antigo reprovava por quatro vezes. **Não é afrouxar um portão para fazer passar** (regra 5): é o preço declarado de um pedido da cliente, decidido por ela em 16/09/2026 depois de ver o número. A alternativa aberta continua sendo hospedar um laço curto em MP4, que dispensa o JS do YouTube e devolveria a maior parte do orçamento — falta o arquivo de vídeo |
| D19 | Área de atuação e números institucionais | **Texto revisado pela Alupar substitui o migrado**, em `acervo/revisado/`; mapa novo de ativos | A Alupar enviou em 21/09/2026 o texto novo da Área de atuação (`02_Conteudo_Pag_AreasDeAtuacao.docx`) e o `Mapa_Ativos.png`: 45 sistemas, mais de 10 mil km, 16 empreendimentos, quase 800 MW, Chile/Colômbia/Peru. Os mesmos números passam a valer em A Companhia e na faixa da home, que estavam em 35 sistemas / 8.805 km / 798,5 MW (o espanhol ainda em 30 sistemas / 7.964 km). As tabelas de sistemas e geradoras da página antiga saem com o texto. EN e ES traduzidos pela ness., a validar pela Comunicação no preview (resposta 3 de 16/09). Empresas não tem aba LATAM: o link do documento aponta para a página Empresas. A legenda do mapa (UHE, PCH, EOL, UFV, LT, SE) saiu da imagem e virou lista em HTML nos três idiomas: desenhada, caía a ~6 px no celular e só existia em português. Os nomes de país dentro do mapa (COLÔMBIA, PERU, CHILE) continuam em português até a Alupar mandar as versões em EN e ES |
| D20 | Adequação da interface por medição | Três correções globais, todas com problema medido (D2), e o resto da lista fica para decisão | Auditoria de 21/09/2026 nas 175 páginas, em 390 e 1280 px (axe-core WCAG 2.2 AA + medição de layout): **zero violações do axe** (uma: `<h2>` vazio em /en/empresas/), **53 medições com rolagem lateral** (até +930 px) e Lighthouse celular 100 na home e 98 em Empresas, CLS 0,015 e 0. Corrigido: (1) `<video width="1280">` do WordPress sem teto — 12 tipos de página-casca; (2) nome de arquivo sem espaço como título e link (+354 px); (3) texto justificado no celular, com espaço médio entre palavras de 8,4–9,2 px contra 3,4–3,9 px, e o vão vazio do banner de Empresas, que também deixava um link focável invisível em EN. O CLS de 0,375 da crítica não se reproduz mais |

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

- ~~Dois valores da faixa institucional (km de linhas, MW instalados)~~ — respondidos em 21/09/2026 (D19).
- Validação das traduções EN/ES da Área de atuação e de A Companhia (D19) — Comunicação, pelo preview.
- **Revisar a D11 com a Alupar.** O motivo do CMS era a Comunicação publicar notícia e trocar banner sozinha; as duas coisas deixaram de existir. O que sobrou muda raramente e cabe no banco de manutenção. Pesa na decisão o compromisso de "autonomia de publicação" escrito na proposta comercial (`apresentacao/proposta.html`).
- ~~Acesso ao feed de notícias do RI~~ — sem objeto desde a D16.
- Formulário de contato (P5) — destino e remetente em vigor desde 16/09/2026:
  o formulário envia de `comunicacao@alupar.com.br` para
  `comunicacao@alupar.com.br`. O domínio verificado no Resend é a raiz
  `alupar.com.br`, região `sa-east-1`, e não o `msg.alupar.com.br` que o plano
  previa; DKIM e caminho de retorno (`send.alupar.com.br`) conferidos no DNS.
  A entrega ainda não foi provada: falta a Comunicação enviar uma mensagem de
  teste e confirmar que ela chega fora do spam — remetente igual ao
  destinatário, por serviço externo, pode ser tratado como falsificação pelo
  e-mail corporativo. O texto de consentimento já foi trocado nos três idiomas (#92).
- ~~Prazo de guarda dos dados do formulário~~ — **respondido em 16/09/2026:
  30 dias.** O formulário não tem banco: o caminho é navegador, Worker em
  memória, Resend, caixa de correio. Então o prazo vale nos **dois** lugares
  onde a mensagem de fato persiste, e é preciso valer nos dois para a promessa
  ser verdadeira: a caixa `comunicacao@alupar.com.br`, no Google Workspace da
  Alupar, e o histórico de mensagens enviadas no painel do Resend, que guarda
  corpo e destinatário. Quem opera cada um dos dois é diferente, e nenhum dos
  dois expurga sozinho — a regra de retenção precisa ser configurada em cada.
- **Decisões da auditoria de 21/09/2026 (D20)**, nenhuma tomada ainda:
  - Texto abaixo de 12 px em todas as páginas: 10 px no seletor de idioma e em "Relações com Investidores", 11 px no rodapé, 8 px no rótulo "Menu" do celular. É do tema (D2); subir para 12 px é mudança que dá para notar.
  - As páginas-casca de arquivo ("Aqualuz_baixa2", "MUNDOTECA-2019_baixa", os PDFs de política) são indexáveis, estão no sitemap e têm o nome do arquivo como título. Manter o endereço vivo e tirá-las do índice (noindex e fora do sitemap) ou não?
  - /videos/ lista só os vídeos de 2017, dois deles com o mesmo título, enquanto a home mostra o de 2026. A Comunicação quer o de 2026 na lista?
  - As 22 páginas "faq" e "group" sem link de entrada repetem conteúdo que já está em Empresas e Sustentabilidade, e entram no sitemap.
- Divulgações de resultados apontando ao portal de RI — a Comunicação pediu ao RI em 16/09/2026 e compartilhará quando houver.
