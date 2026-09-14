# Arquivos — bucket R2 para mídia pesada e documentos da MZ

**Status: executado em 11/09/2026.** Bucket criado na região ENAM, domínio
`arquivos.alupar.com.br` ativo (CNAME com proxy para `public.r2.dev`, TLS
mínimo 1.2) e 120 objetos enviados (740 MB); em 13/09/2026 entraram os 8
originais resgatados no PR #66, e o bucket tem 128 objetos. O `r2.dev` público continua
desligado: o único acesso é pelo domínio, que passa pelo cache da Cloudflare
(`cf-cache-status: HIT` a partir da segunda requisição).

## O que é

Os 18 vídeos MP4 do acervo (até 55 MB cada) passam do limite de 25 MiB por
arquivo do Cloudflare Pages, e nenhum binário pesado pertence ao git. Servem
também os cinco documentos hoje hospedados pelo fornecedor MZ
(`api.mziq.com`) — dois códigos de conduta do rodapé e dois relatórios de
sustentabilidade (PT/EN) dos banners — resgatados para sair da dependência da
MZ quando o contrato com ela encerrar.

## Bucket e domínio

| | |
|---|---|
| Bucket | `alupar-arquivos` |
| Domínio público | `arquivos.alupar.com.br` |
| Conta Cloudflare | conta da ness., a mesma que já hospeda a zona `alupar.com.br` |
| Zona | `alupar.com.br` (Zone ID em Cloudflare → alupar.com.br → Overview) |

## Conteúdo

Todo o conteúdo do bucket vem de `acervo/midia/` (diretório fora do git, uma
junction local) e é publicado por `scripts/publicar-arquivos.mjs`. A chave de
cada objeto no bucket é o caminho relativo a `acervo/midia/`, preservado — é o
que permite o redirecionamento 301 com `:splat` em `public/_redirects`
(`/wp-content/uploads/*` → `https://arquivos.alupar.com.br/:splat`).

Os cinco documentos da MZ entram como `acervo/midia/documentos/*.pdf` e ficam
publicados em `https://arquivos.alupar.com.br/documentos/<nome>.pdf`.

## Comandos de criação — como foi feito

Idempotentes: servem para refazer o bucket em outra conta, se precisar.

```bash
npx --yes wrangler@4 r2 bucket create alupar-arquivos
npx --yes wrangler@4 r2 bucket domain add alupar-arquivos \
  --domain arquivos.alupar.com.br --zone-id "$ZONA"
# ZONA = Zone ID em Cloudflare → alupar.com.br → Overview, coluna da direita
```

Depois de criado o bucket e o domínio, enviar o conteúdo com
`node scripts/publicar-arquivos.mjs` (requer `acervo/midia/` presente e o
wrangler autenticado na conta certa) e conferir com
`node scripts/publicar-arquivos.mjs --verificar`.

## O manifesto, e como o CI confere sem a mídia

Publicar grava `acervo/r2.json` com a chave e o tamanho de cada objeto — 128
hoje. **Quem publica commita o manifesto**, como já se faz com `imagens.json`
e `mapa-de-rotas.json`: é ele que permite ao CI conferir o bucket a cada merge
na main, por requisição de cabeçalho, sem os 734 MB que não pertencem ao git.

```bash
node scripts/publicar-arquivos.mjs --manifesto   # o que o CI roda
```

O manifesto só é gravado quando tudo está servido. Um manifesto que promete
arquivo ausente reprovaria o CI para sempre, e a correção seria publicar o
arquivo, não reescrever o manifesto.

### A armadilha do agente

A zona tem verificação de integridade de navegador ligada. O `fetch` do Node
se anuncia como `node`, e com isso os 18 vídeos do acervo voltavam **403** do
runner do CI — só os vídeos, com um PDF de 33 MB passando ao lado, então não
era tamanho. O verificador manda um agente bem formado desde 14/09. Se este
403 reaparecer, confira o agente antes de suspeitar do bucket.
