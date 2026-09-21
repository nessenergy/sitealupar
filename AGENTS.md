# sitealupar — contexto para agentes

Arquivo canônico de contexto deste repositório. Vale para qualquer agente;
`CLAUDE.md` só aponta para cá. Se você é humano, comece pelo `README.md` e por
[`docs/prd.md`](docs/prd.md).

## O projeto em cinco linhas

Replataforma do site institucional da Alupar (`alupar.com.br`), hoje um
WordPress hospedado pela MZ Group. Sai um site estático em Astro publicado no
Cloudflare Pages. **Não há CMS:** o conteúdo vive em arquivos versionados neste
repositório, e o Sanity previsto na D11 nunca foi implantado (ver
`docs/decisoes.md`). **Restauro fiel:** a linguagem visual atual é
preservada; muda o que resolve um problema medido. 500 h em 6–7 semanas.

Contrato com a Alupar é da **ness.**; execução é da **Bekaa**, empresa parceira.

Base factual: diagnóstico de 01/09/2026 e Manual de Identidade Visual de 2018.

## As sete regras que não se negociam

1. **A linguagem visual é imutável; a composição melhora só onde há problema
   medido.** A pergunta que autoriza qualquer mudança visual: *qual problema
   medido isto resolve?* Se a resposta não citar um número, uma norma ou uma
   linha do diagnóstico, não entra. Detalhe em
   `.claude/skills/restauro-fiel/SKILL.md`.
2. **O portal de RI não é nosso.** `ri.alupar.com.br` está a cargo de outra
   equipe e vai conviver com o site novo — o visitante alterna entre os dois
   por um link no topo. Divergência visual entre eles é defeito. Nada neste
   repositório pode alterar o comportamento daquele host, e isso inclui
   cabeçalhos que se propagam por subdomínio.
3. **Nenhuma URL do acervo pode responder 404.** São 20 páginas e 99 notícias
   indexadas desde 2017. O corte editorial de notícias é um campo, não uma
   exclusão. Toda remoção vira 301 em `public/_redirects`. Desde a D16
   (16/09/2026) a área de notícias inteira saiu do ar: as notícias respondem
   por 301 para a listagem do portal de RI, e continuam sem nenhum 404.
4. **Número não se inventa.** Onde faltar dado da Alupar — km de linhas, MW
   instalados, valor de contrato — o lugar fica marcado como pendente. Um valor
   plausível é pior que um espaço vazio, porque ninguém o corrige depois.
5. **Os critérios de aceite são condição de merge, não boa vontade.** O CI
   reprova orçamento de peso, acessibilidade, SEO e links quebrados. Nunca
   relaxe um limite para fazer o CI passar: ou o código melhora, ou o problema
   é real e vira conversa.
6. **Nada de atribuição a IA no que fica registrado.** Sem trailer
   `Co-Authored-By` de ferramenta, sem assinatura do tipo "Generated with", sem
   branch `claude/*`, sem menção a IA em commit, corpo de PR ou documento
   entregue. Mesma convenção do repositório AlupData, pelo mesmo motivo:
   titularidade. Nomeie branches pelo assunto (`feat/…`, `docs/…`, `fix/…`).
7. **PR verde é PR mergeado.** Passou no CI, sem conflito e sem revisão
   pendente? Sai de rascunho e vai para `main`, na hora — não fica esperando
   uma segunda opinião que ninguém pediu. O portão de qualidade da regra 5 é
   quem decide se o trabalho entra; se ele aprovou, a decisão está tomada.
   Rascunho é para trabalho inacabado, não para trabalho pronto.

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/ — rode antes de todo PR
```

O CI roda `build`, Lighthouse CI (`lighthouserc.json`) e verificador de links.

## Onde as coisas estão

| Caminho | O que é |
|---|---|
| `docs/prd.md` | O que o site precisa ser e por quê. Começa aqui |
| `docs/decisoes.md` | As decisões e seus motivos |
| `docs/marco-0-runbook.md` | Sete ações emergenciais, com verificação |
| `docs/equipe.md` | Dimensionamento, alocação e lacunas |
| `src/styles/tokens.css` | Tokens de marca, com as correções documentadas |
| `public/_headers` | CSP, HSTS, Referrer-Policy, Permissions-Policy |
| `public/_redirects` | Mapa de 301 do acervo |
| `.claude/skills/` | Regras operacionais por área |

## Skills deste repositório

| Skill | Quando carrega |
|---|---|
| `restauro-fiel` | Qualquer decisão visual, e todo pedido de "melhoria" |
| `marca-alupar` | Cor, tipografia, logotipo, aprovação de marca |
| `cloudflare-alupar` | Borda, DNS, cabeçalhos, redirecionamentos, deploy |
| `sanity-alupar` | Só se a D11 for retomada. Descreve um CMS que **não existe** neste repositório |
| `a11y-gate` | Marcação, formulário, contraste, foco, leitor de tela |

## O fornecedor atual não colabora

A MZ Group está sendo substituída e não entrega o conteúdo. A gestão de DNS é
da Alupar e da ness. — o domínio é nosso, a origem é dela. Consequências práticas em
[`docs/fornecedor-e-acervo.md`](docs/fornecedor-e-acervo.md); em resumo:

- Nada que dependa de editar o WordPress atual vai acontecer. O caminho curto
  para corrigir o que está errado é **entregar o site novo mais cedo**
- O que dá para corrigir na borda, corrige-se na borda — cabeçalhos, redirecionamentos
- O acervo foi recuperado por extração dos sitemaps públicos
  (`scripts/extrair-acervo.mjs`). **160 arquivos de mídia, 247,6 MB, dos quais
  120 vivem na infraestrutura da MZ** — copiar antes da virada não é opcional

## Três armadilhas que já custaram tempo

**O apex não está "fora do ar" — ele quebra em HTTPS.** O redirecionamento para
`www` funciona na porta 80 (`http://alupar.com.br` → 301 → `https://www` → 200);
só `https://alupar.com.br` falha, por certificado vencido. Como o navegador
tenta HTTPS, desiste e volta para HTTP sozinho, a maior parte dos acessos chega
ao site sem que ninguém veja erro. Quem vê: quem tem HSTS gravado, quem usa
modo "somente HTTPS", todo link escrito como `https://alupar.com.br`, e
qualquer ferramenta sem *fallback*. Escrever "o site está fora do ar" é
falsificável em cinco segundos por qualquer pessoa com um navegador — e já foi
contestado. Teste sempre os dois esquemas antes de afirmar qualquer coisa sobre
o apex.

**O apex é outro servidor.** `alupar.com.br` é um registro `A` para
`34.230.121.250`, uma segunda instância WordPress que só redireciona para
`www` — e é ela que serve o certificado vencido. `www` e `ri` são `CNAME` para
o host da MZ. Diagnosticar o apex olhando o `www` leva à conclusão errada.

**O PDF do manual converte o mesmo Pantone em RGB diferentes.** A arte do
logotipo na p.6 usa `#174891`; o swatch da página de padrões cromáticos usa
`#004F9D`. O HEX impresso no manual (`#00A0E3`) é erro de digitação e
contradiz o Pantone, o CMYK e o RGB da própria linha. Adotamos `#004F9D`.
