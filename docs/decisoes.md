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
| D6 | Dono do conteúdo | **Comunicação Alupar** | Área sem responsável nomeado foi o que deixou o site parar em 2023 |
| D8 | Identidade | **MIV 2018** | Fixa paleta, tipografia, versões, campo de proteção e proibições |
| D9 | Corte das notícias | **24 meses na listagem** | Arquivo indexável mantém as 183 URLs vivas; corte é editorial, não técnico |
| D10 | Faixa institucional | **Entra** (+16 h) | Única adição de estrutura: a home não diz em lugar nenhum o que a Alupar é |
| D11 | CMS | **Sanity** | Editor maduro, i18n nativo, conta em nome da Alupar. O site estático sobrevive à queda do CMS |
| D12 | Tipografia | **Manual ganha fonte de web** | Segoe UI não se licencia para web; Open Sans passa a ser oficial para tela, Segoe UI segue no impresso |

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
- Acesso ao feed de notícias do RI — acordo entre as duas equipes, até a S3.
