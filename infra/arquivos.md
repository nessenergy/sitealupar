# Arquivos — bucket R2 para mídia pesada e documentos da MZ

**Status: executado em 11/09/2026.** Bucket criado na região ENAM, domínio
`arquivos.alupar.com.br` ativo (CNAME com proxy para `public.r2.dev`, TLS
mínimo 1.2) e 120 objetos enviados (740 MB). O `r2.dev` público continua
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
