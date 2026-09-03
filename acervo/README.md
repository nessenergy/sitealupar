# Acervo do site institucional

Aquisição executada em **03/09/2026** por `scripts/extrair-acervo.mjs`,
percorrendo os dez sitemaps do índice do Yoast. Tudo o que está aqui é público
e é da Alupar.

## O que foi adquirido

| | |
|---|---:|
| URLs no índice de sitemaps | 407 |
| Páginas tentadas (× 3 idiomas) | 1.221 |
| Páginas capturadas (HTTP 200) | 666 |
| HTML em disco | 30 MB |
| Arquivos de mídia | 237 |
| Mídia em disco | 253 MB |

Por idioma: **266 em português**, 239 em inglês, 161 em espanhol.

Por tipo, em português: 101 notícias, 41 FAQs, 24 páginas, 21 banners do
rotativo, 17 blocos `group`, 5 vídeos, mais as páginas internas de
`a-companhia`, `area-de-atuacao`, `empresas` e `pesquisa-e-desenvolvimento`.

Mídia por formato: 136 PNG, 51 JPG, 49 PDF. O maior arquivo é um EIA de PCH com
**43,75 MB** — sozinho, vinte vezes o peso da página inicial inteira.

## O que não veio, e por quê

Os **555 endereços com HTTP 404** não são perda de acervo:

- **539** são variantes `?lang=en` e `?lang=es` de conteúdo que só existe em
  português. É a mesma falha de paridade de idiomas registrada no diagnóstico —
  o site responde erro em vez de servir o português.
- **16** são permalinks `?attachment_id=NNNN` que o próprio sitemap de anexos
  publica e que o site não resolve.

Três arquivos de mídia não são da Alupar e ficaram de fora: dois PDFs da ANEEL
(HTTP 403) e um release de 2017 já removido da origem (HTTP 404).

## Achado: dois hosts referenciados no site não existem mais

O HTML ao vivo aponta imagens para `inst.alupar.mziq.com` (18 ocorrências) e
`ri.alupar.mziq.com` (5 ocorrências). **Nenhum dos dois resolve em DNS.** São
imagens quebradas para qualquer visitante, agora, em sete páginas:

```
pt/group/pesquisa-e-desenvolvimento
pt/faq/programa-de-pesquisa-e-desenvolvimento
pt/noticia/licenca-ambiental-previa-da-pch-agua-limpa
en/group/research-and-evelopment            (o slug tem erro de digitação na origem)
en/faq/research-and-development-program
es/group/pesquisa-e-desarollo               (idem)
es/faq/research-and-development-program-2
```

Os arquivos em si sobreviveram: os mesmos caminhos respondem em
`cdn-sites-assets.mziq.com` e em `www.alupar.com.br`. Foram recuperados por ali
e estão no acervo. **No site novo, a referência é reescrita para o host próprio**
— manter um domínio de terceiro no HTML é o que produziu este defeito.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `inventario.json` | URL, status, bytes, título e data de cada uma das 1.221 tentativas |
| `midia.json` | manifesto de mídia com origem, status e tamanho |
| `microsites/` | conteúdo de `rs`, `pdi` e `ma` pela API REST |

O HTML e os binários **não** ficam no git — 283 MB. Para reproduzir:

```bash
node scripts/extrair-acervo.mjs --midia      # institucional
node scripts/extrair-microsites.mjs --midia  # rs, pdi e ma
```

## Armadilha de ambiente

Este host serve uma cadeia TLS incompleta: falta o intermediário da GoDaddy, e
qualquer cliente sem ele falha com *unable to get local issuer certificate*.
Nunca desligue a verificação — acrescente o intermediário:

```bash
curl -sSo gdig2.pem https://certs.godaddy.com/repository/gdig2.crt.pem
cat /root/.ccr/ca-bundle.crt gdig2.pem > alupar-ca.crt
NODE_EXTRA_CA_CERTS=alupar-ca.crt node scripts/extrair-acervo.mjs --midia
```
