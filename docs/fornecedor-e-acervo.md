# Fornecedor atual e a recuperação do acervo

**A MZ Group é o fornecedor que está sendo substituído e não colabora — não
entrega o conteúdo atual.** A gestão de DNS é da Alupar/ness.

Essas duas frases juntas mudam mais coisas do que parece. Este documento
registra o que muda e o que já foi feito a respeito.

---

## 1. A posição é boa, e é preciso entender por quê

**O domínio é nosso.** A zona `alupar.com.br` está na Cloudflare, administrada
pela Alupar/ness, e nenhum host tem o proxy ligado. Isso significa que:

- A virada do site é uma decisão nossa, não uma negociação. Apontamos o DNS
  para o Cloudflare Pages quando estivermos prontos
- **O fornecedor não tem como reter o domínio**
- Podemos corrigir na borda coisas que ele se recusa a corrigir na origem

O que ele controla é a **origem** — o WordPress, o conteúdo dentro dele e o CDN
`cdn-sites-assets.mziq.com`, onde vivem as imagens e os PDFs.

## 2. O Marco 0 muda

Três das sete ações tinham a MZ como responsável. Elas não vão acontecer.

| Ação | Situação nova |
|---|---|
| 0.1 apex quebrado em HTTPS | **Inalterada.** É borda, é nossa. Segue como a mais urgente |
| 0.2 banners obsoletos | **Não vai acontecer.** Depende de editar o WordPress deles |
| 0.4 CSS 404, links `http://`, `lang` errado | **Não vai acontecer** pela origem |
| 0.5 cabeçalhos de segurança | **Vira nossa.** Com o proxy ligado, aplicam-se por Transform Rules na Cloudflare, sem tocar na origem |
| 0.6 dono do certificado | Inalterada |
| 0.7 verificação sintética | Inalterada |

**A conclusão que importa:** com a MZ fora, o caminho mais curto para corrigir o
que está visivelmente errado deixa de ser negociar consertos no site velho e
passa a ser **entregar o site novo mais cedo**. O Marco 0 encolhe para o que
controlamos, e o resto some no go-live.

## 3. O acervo se recupera, e já foi recuperado

Tudo o que está no ar é público e é da Alupar. O script
[`scripts/extrair-acervo.mjs`](../scripts/extrair-acervo.mjs) percorre os
sitemaps do próprio site e guarda o que existe.

Executado em 02/09/2026:

| | |
|---|---|
| Páginas capturadas | **276** de 612 tentadas (as demais são 404 legítimos — ver §4) |
| HTML | 13 MB |
| Mídia referenciada | **160 arquivos, 247,6 MB** |
| Onde a mídia está hoje | 120 no CDN da MZ · 19 na S3 · 16 no portal de RI · 5 em bucket da MZ |
| Composição | 86 PNG, 30 JPG, **44 PDF** |

Os inventários estão versionados em [`acervo/inventario.json`](../acervo/inventario.json)
e [`acervo/midia.json`](../acervo/midia.json).

### Urgência real

**120 dos 160 arquivos de mídia estão em infraestrutura da MZ.** Enquanto o
site atual está no ar eles são públicos; depois da virada, se não tivermos
cópia, quebram. E nada garante que o acesso continue igual quando ficar claro
que o fornecedor está sendo trocado.

```bash
node scripts/extrair-acervo.mjs --midia --saida acervo-completo
```

**Rodar isso hoje, e guardar fora deste repositório** — 247 MB não pertencem ao
git. O destino natural é o *asset store* do Sanity, mas a cópia bruta deve
existir antes disso.

Os quatro maiores são EIA/RIMA de PCH, somando 138 MB. São documentos de
licenciamento ambiental: verificar com a Alupar se ainda precisam estar
publicados, e em que forma.

## 4. O que a extração revelou

### Correção — são 99 notícias, não 225

O `noticia-sitemap.xml` traz **225 entradas `<loc>`**, mas:

- **183 são URLs únicas**
- **84 delas já vêm com `?lang=`** — são variantes de idioma listadas como
  entradas próprias
- Sobram **99 notícias distintas em português**
- E há duplicação literal: a mesma URL aparece três vezes seguidas no arquivo

Todos os documentos anteriores citavam 225. **O número correto de itens a
migrar é 99**; o número de URLs que precisam continuar respondendo é 183.

Isso reduz o esforço de migração e **não muda a regra**: nenhuma das 183 URLs
pode passar a responder 404.

### A paridade de idiomas é pior do que parecia

Páginas que não têm tradução respondem **404**, não caem para o português:

| | PT | EN | ES |
|---|---|---|---|
| Páginas institucionais | 19 | 13 | 13 |
| Vídeos | 2 | 2 | 2 |

Seis páginas institucionais não existem em inglês nem em espanhol. Quem chega
por um link em EN ou ES para uma delas encontra erro, não conteúdo.

### O certificado de `www` não encadeia para clientes estritos

Além do apex vencido, o `www` apresenta um intermediário que **não valida em
clientes que não fazem busca automática de emissor**. Navegador funciona;
`curl`, integrações e monitoramento externo falham com
`unable to get local issuer certificate`.

Foi preciso acrescentar o intermediário atual da GoDaddy à cadeia de confiança
para a extração funcionar. Vale conferir com quem administra o certificado —
some no go-live, quando o TLS passa a ser da Cloudflare, mas afeta hoje
qualquer integração automatizada com o site.

## 5. Duas decisões a revisitar

### D5 — o feed de notícias vindo do portal de RI · mantida

**O portal de RI também troca de fornecedor e seguirá funcionando.** A
dependência que parecia frágil não é: o feed não fica preso à plataforma que
está saindo.

Fica só um cuidado de implementação, que não muda a decisão:

- **Combinar o formato, não acoplar à plataforma.** A integração deve consumir
  um contrato acordado — campos, formato de data, idioma, URL canônica — e não
  o que a plataforma atual expõe. Se for acoplada, é reescrita quando o RI
  migrar
- **Perguntar quando o RI migra.** Se a troca deles cair dentro das nossas 6–7
  semanas, a integração precisa ser construída contra o fornecedor novo, não
  contra o antigo. É pergunta para o interlocutor do RI, na Descoberta
- **Guardar cópia local do que for consumido.** Se a fonte cair num dia de
  publicação, o site continua com o que já tinha

### GA4 — de quem é a propriedade?

A propriedade `G-HH1N2K084G` está instalada nos dois sites. **Se ela estiver na
conta da MZ, o histórico está no mesmo risco do conteúdo.** Confirmar quem é o
proprietário antes de qualquer outra coisa — e, se for a MZ, extrair a linha de
base agora, não antes do go-live.

## 6. Postura recomendada

- **Não anunciar cronograma de virada ao fornecedor.** Ele não precisa saber a
  data para nada, e saber pode degradar a colaboração que ainda existe
- **Manter o site atual no ar até a virada.** Não é conservadorismo: é que ele
  ainda é a única cópia viva de coisas que talvez não estejam no acervo
- **Registrar por escrito com a Alupar** a autorização para extrair o conteúdo
  do site — é conteúdo dela, mas a formalização protege todos
- **Revalidar o acervo antes do go-live.** A extração de 02/09 é uma foto; o
  que mudar até lá precisa entrar
