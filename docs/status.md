# Estado do projeto — 23/09/2026

Onde o site novo está, o que falta para a virada e quem destrava cada coisa.
Uma página; o porquê de cada decisão fica em [`decisoes.md`](decisoes.md) e o
roteiro da troca, em [`plano-virada.md`](plano-virada.md).

## No ar

**https://www.alupar.com.br/** — o site novo desde **23/09/2026, 20h20** (D27).
172 páginas em três idiomas, geradas do acervo versionado, servidas pelo
Cloudflare Pages. O preview segue em https://sitealupar.pages.dev/ .

Conferido na virada: 666 endereços do acervo pedidos ao `www`, todos em 200;
`/en/` sem o sequestro do WordPress; `?lang=` redirecionando; apex indo para
`www`; e `ri.alupar.com.br` intocado. O retorno é um comando —
`node scripts/virada.mjs voltar --confirmar` — enquanto a MZ não for desligada.

O CI reprova o merge por peso, acessibilidade, SEO, link quebrado e 404 do
acervo. Nenhum limite foi afrouxado para fazer PR passar.

## O que mudou em setembro, e por quê

| Quando | O que | Decisão |
|---|---|---|
| 16/09 | Vídeo institucional no lugar do rotativo, no topo da home | pedido da Alupar |
| 16/09 | Área de notícias desativada; 186 endereços por 301 para o portal de RI | D16 |
| 21/09 | Área de atuação e A Companhia com o texto revisado pela Alupar; mapa de ativos novo | D19 |
| 21/09 | Correções medidas de interface, piso de texto, menu do celular | D20, D21, D23 |
| 22/09 | A Companhia com o texto final, nos três idiomas | texto da Alupar |
| 23/09 | Home enxuta: só vídeo e selos. Logotipo em placa, Sustentabilidade e P&D viram portais próprios no menu | D24 |
| 23/09 | Cabeçalho fixo na rolagem, com a placa avançando sobre o conteúdo | pedido da Alupar |
| 23/09 | A Companhia sem os valores e sem o mapa | pedido da Alupar |
| 23/09 | Rodapé em #10328F, com a marca à esquerda e texto branco | D26 |
| 23/09 | Redes sociais no rodapé, como no rs.alupar.com.br | pedido da Alupar |
| 23/09 | **Virada: `www.alupar.com.br` passa a ser o site novo** | D27 |
| 24/09 | SEO técnico e GEO: robots.txt, JSON-LD em grafo, llms.txt e números com data | D28 |

O balanço da entrega contra a proposta — e o que foi entregue além dela — está em
[`relatorio-de-entrega.md`](relatorio-de-entrega.md).

## O que falta para a virada

**Depende da Alupar** — sem isso a troca não acontece, e nada aqui custa hora
de projeto:

1. ~~**Certificado `*.alupar.com.br`**~~ — **fora do nosso radar desde
   24/09/2026.** Com a virada, o `www` passou a ter certificado da Cloudflare e
   o curinga serve só ao portal de RI, que é de outra equipe (regra 2). O
   sentinela deixou de reprovar por ele: alarme que este repositório não pode
   atender é alarme que se aprende a ignorar. O que continua medido todo dia é
   a **disponibilidade** daquele host — 186 endereços nossos dependem do
   `/noticias/` dele (D16).
2. **Validação dos textos em inglês e espanhol** de A Companhia e Área de
   atuação, traduzidos pela ness. ([`pedido-a-alupar-2026-09-21.md`](pedido-a-alupar-2026-09-21.md)).
3. **Arquivos que faltam:** mapa de ativos em EN e ES (os nomes de país estão
   desenhados em português) e o MP4 original do institucional de 2026, que hoje
   toca do YouTube.
4. **Cinco papéis sem nome** do lado da Alupar (issue #10) e os insumos da
   issue #11.

**Do nosso lado:**

- Retirar a área de vídeos (3 listagens, 7 fichas do acervo e os 301) — pedido
  de 23/09, ainda não executado.
- Apagar a regra da origem que sequestra `/en/` antes do go-live (issue #38).
- Fechar as 70 pendências de mídia da MZ (issue #43): os documentos já estão no
  R2, o resto não.
- QA, homologação e go-live (issue #22).

## O que não está no escopo, e por quê

- **CMS.** A D11 previa Sanity; nunca foi implantado, e o conteúdo vive em
  arquivos versionados. Banner e notícia, que eram o motivo dele, deixaram de
  existir com o vídeo no topo e a D16. Autonomia de publicação entra como
  primeira entrega da mensalidade, não da implantação.
- **Portal de RI.** `ri.alupar.com.br` é de outra equipe. Nada neste
  repositório altera o comportamento daquele host.
- **Sustentabilidade e P&D.** Desde a D24 são portais próprios da Alupar
  (`rs.` e `pdi.`), ligados pelo menu. As páginas internas respondem por 301.
