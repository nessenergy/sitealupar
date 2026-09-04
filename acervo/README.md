# Acervo do site institucional

Aquisição executada em **03/09/2026** por `scripts/extrair-acervo.mjs`,
percorrendo os dez sitemaps do índice do Yoast. Tudo o que está aqui é público
e é da Alupar.

## O que foi adquirido

| | |
|---|---:|
| URLs no índice de sitemaps | 407 |
| Páginas tentadas | 971 |
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

Os **305 endereços com HTTP 404** não são perda de acervo:

- **289** são variantes `?lang=en` e `?lang=es` de conteúdo que só existe em
  português. É a mesma falha de paridade de idiomas registrada no diagnóstico —
  o site responde erro em vez de servir o português. Por idioma: 145 faltam em
  inglês, 144 em espanhol.
- **16** são permalinks `?attachment_id=NNNN` que o próprio sitemap de anexos
  publica e que o site não resolve — estes sim, em português.

**Nota sobre o número anterior.** A primeira execução relatou 1.221 tentativas e
555 erros. Aquele total estava inflado por um defeito do próprio extrator, que
anexava `?lang=` a URLs que o sitemap já publica com idioma declarado, gerando
`?lang=en?lang=en`. Nenhum conteúdo se perdeu — a forma correta também era
buscada — mas 250 requisições inválidas entravam no inventário como 404. O
extrator foi corrigido e as 666 páginas capturadas são exatamente as mesmas.

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

## O que existe de fato para migrar

`conteudo.jsonl` é o HTML adquirido convertido em conteúdo estruturado por
`scripts/extrair-conteudo.mjs` — um item por linha, com idioma, tipo, slug,
título, data, corpo, texto simples e os arquivos referenciados. São 648 dos
651 arquivos; as três exceções são as páginas iniciais, que são rotativo e
blocos montados, não texto corrido.

O número que importa para o cronograma **não é 903 URLs**. É este:

| | itens |
|---|---:|
| **Conteúdo real a migrar** | **387** |
| Páginas de anexo — endereço a aposentar | 196 |
| Sem texto e sem arquivo | 65 |

Os 387 somam **91.338 palavras** e se distribuem assim: 210 notícias, 101
perguntas frequentes, 36 páginas, 23 blocos `group`, 7 vídeos e 6 de política
de privacidade. As datas vão de **07/07/2008 a 02/03/2023** — quinze anos de
arquivo, e a confirmação independente de que a última publicação é de março
de 2023.

### As 196 páginas de anexo

O WordPress dá URL própria a cada arquivo enviado, e o Yoast as publica no
sitemap. São páginas cujo conteúdo é só a imagem: sem texto, com título igual
ao nome do arquivo — `img-a-companhia`, `mapa_icone_eolico_rn_2021`. Não são
conteúdo a migrar; são endereços a aposentar, e entram no mapa de
redirecionamentos apontando para a página que usa o arquivo.

### As 65 sem texto e sem arquivo

Em maioria banners do rotativo, onde o texto é o título e a imagem vem do CSS,
e cascas de `group` e `category` que nunca receberam conteúdo.

### Uma armadilha do tema

A trilha de navegação é impressa **dentro** da seção de texto, e em português
mesmo nas páginas em inglês e espanhol. Sem removê-la, todos os 648 itens
começariam com "Você está em:" e qualquer busca no acervo casaria com tudo. O
extrator a remove; se alguém reescrever essa parte, o teste é simples — nenhum
item deve começar com aquela frase.

## Quanto custa limpar antes de migrar

`auditoria.json`, de `scripts/auditar-conteudo.mjs`, mede item a item o que
impede a migração direta. Dos 387 com conteúdo:

| | itens |
|---|---:|
| Prontos como estão | **201** |
| Só limpeza automática | 139 |
| **Exigem revisão humana** | **47** |

| Achado | Custo | Itens | Ocorrências |
|---|---|---:|---:|
| Aponta para host da MZ | automático | 139 | 513 |
| Estilo embutido no corpo | automático | 132 | 1.099 |
| Link em `http://` | automático | 40 | 80 |
| Tabela no corpo | revisão | 47 | 50 |
| Imagem sem descrição | revisão | 3 | 12 |

O primeiro é o que mais importa: **139 itens carregam link para o host do
fornecedor atual**, e dois desses hosts já não resolvem em DNS. É a dependência
da MZ embutida no próprio conteúdo — migrar sem reescrever esses caminhos é
trocar de plataforma levando o defeito junto.

Os 47 que exigem revisão são os que consomem hora de gente: tabela pode ser
dado ou pode ser layout, e só quem olha decide; texto alternativo de imagem é
redação, não reescrita mecânica.

## O que a limpeza automática resolve, e o que não

`scripts/limpar-conteudo.mjs` produz `conteudo-limpo.jsonl` e
`pendencias-fornecedor.json`.

### Removido

**391 blocos de `<script>`, em todas as 387 páginas.** É sempre o mesmo: compara
`window.location.href` com `/fotos` e manda para o NAS. Um comentário no
próprio código se explica — *"solicitado pelo ferramenta redirect WP ñ suporta
o link por conta disso foi feita a inserção no código"*. É redirecionamento
feito no navegador porque o plugin não dava conta; no site novo já é uma linha
do `_redirects`, que serve antes de qualquer HTML chegar.

Ele também era o que inflava a primeira contagem: as 387 ocorrências de `http://`
no domínio próprio e as 387 de host externo eram todas dele, não do conteúdo.

### Reescrito

| | ocorrências | itens |
|---|---:|---:|
| Arquivo no CDN do fornecedor → host próprio | 608 | 96 |
| Host morto (`inst.`/`ri.alupar.mziq.com`) → host próprio | 7 | 7 |
| `http://` → `https://` no domínio da Alupar | 41 | 24 |

**Verificado**: dos 139 destinos únicos, **138 respondem** no host próprio. O
único que não responde é `ENG-Alupar_Release-2Q17-ENG.pdf`, que também dá 404
no CDN — o arquivo sumiu da origem e o link já estava quebrado antes de
encostarmos nele. Vira pendência, não 404 silencioso.

### Não tocado, porque não é trabalho de script

**51 itens dependem de serviços da MZ**, 128 ocorrências: `api.mziq.com`,
`webcastlite.mziq.com`, `apicatalog.mziq.com`, `cms-backend.mziq.com`. Isso
**não é arquivo, é funcionalidade** — player de webcast, API de catálogo. Não
há para onde reescrever: quando o contrato com a MZ acabar, some.

A primeira auditoria classificou tudo isso como "limpeza automática". Estava
errado, e a correção importa: a dependência da MZ não é só de arquivo, é
funcional, e essas 51 páginas precisam de decisão antes da virada.

**19 itens têm `http://` para terceiros** — `engage-x.com`, `aneel.gov.br`,
`workr.com.br`. Trocar para `https://` exige confirmar host a host que ele
serve https. O script não adivinha.

### Ainda não é injetável — e por quê

Depois da limpeza, o corpo melhorou muito: tags de fechamento órfãs caíram de
**387 para 7**. Mas **211 dos 387 itens ainda têm tag não fechada**.

Não é defeito da limpeza. É inerente a extrair um fragmento do meio de um
documento: o tema abre `<div>` antes da seção de texto e fecha depois dela, e o
recorte fica com metade do par.

Balancear isso exige **parser de HTML**, não expressão regular. Uma tentativa
por regex já foi feita e piorou: removia a `<div>` de abertura pela classe, mas
a de fechamento não tem classe, então sobravam órfãs em 386 itens. Está
registrado no comentário do script para ninguém repetir.

**Consequência prática:** gerar as páginas em Astro injetando `corpo` com
`set:html` produziria HTML inválido em 211 páginas. A geração espera o
balanceamento; o passo anterior — o conteúdo estruturado e limpo — está pronto.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `inventario.json` | URL, status, bytes, título e data de cada uma das 1.221 tentativas |
| `midia.json` | manifesto de mídia com origem, status e tamanho |
| `conteudo.jsonl` | os 648 itens estruturados: título, data, corpo, texto e arquivos |
| `auditoria.json` | o que impede cada item de ser migrado como está, e a que custo |
| `conteudo-limpo.jsonl` | o conteúdo com os caminhos reescritos e o script embutido removido |
| `pendencias-fornecedor.json` | o que exige decisão antes da migração |
| `microsites/` | conteúdo de `rs`, `pdi` e `ma` pela API REST |

O HTML e os binários **não** ficam no git — 283 MB. Para reproduzir:

```bash
node scripts/extrair-acervo.mjs --midia      # institucional
node scripts/extrair-microsites.mjs --midia  # rs, pdi e ma
node scripts/extrair-conteudo.mjs            # HTML → conteudo.jsonl
node scripts/auditar-conteudo.mjs            # conteudo.jsonl → auditoria.json
node scripts/limpar-conteudo.mjs --verificar # reescreve e confere cada destino
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
