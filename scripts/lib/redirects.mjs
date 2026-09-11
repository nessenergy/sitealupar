/**
 * Casamento de caminho contra `public/_redirects`, do jeito que o Pages faz:
 * `/x/*` cobre `/x` e tudo abaixo; o resto casa exato, com ou sem barra final.
 * Query string não entra — o Pages não a casa (ver infra/redirect-rules.md).
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const normal = (p) => p.replace(/\/+$/, '') || '/';

export function lerRegras(texto) {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [origem, destino] = l.split(/\s+/);
      return { origem, destino, prefixo: origem.endsWith('*') ? normal(origem.slice(0, -1)) : null };
    });
}

export function regraPara(regras, caminho) {
  const n = normal(caminho);
  return regras.find((r) => (r.prefixo ? n === r.prefixo || n.startsWith(`${r.prefixo}/`) : normal(r.origem) === n));
}

/* Limite documentado do `_redirects` do Pages: 2.000 regras estáticas e 100
   dinâmicas, processadas em ordem (developers.cloudflare.com/pages/
   configuration/redirects/). O parser do wrangler (wrangler-dist/cli.js)
   classifica cada linha pela SOURCE: tem splat (`*`) ou placeholder (`:nome`)
   → dinâmica. E a partir da PRIMEIRA dinâmica, toda linha seguinte — mesmo
   sem splat/placeholder — também conta como dinâmica; é por isso que regra
   dinâmica no meio do arquivo pode estourar o limite e descartar o resto. */
const SPLAT = /\*/;
const PLACEHOLDER = /:[A-Za-z0-9_]+/;
export const MAX_ESTATICAS = 2000;
export const MAX_DINAMICAS = 100;

export function limitesDoPages(texto) {
  let estaticas = 0;
  let dinamicas = 0;
  let primeiraDinamica = null;
  let podeSerEstatica = true;
  let indice = 0;
  for (const linha of texto.split('\n')) {
    const l = linha.trim();
    if (!l || l.startsWith('#')) continue;
    indice += 1;
    const [origem] = l.split(/\s+/);
    const ehDinamica = !podeSerEstatica || SPLAT.test(origem) || PLACEHOLDER.test(origem);
    if (ehDinamica) {
      dinamicas += 1;
      podeSerEstatica = false;
      if (primeiraDinamica === null) primeiraDinamica = indice;
    } else {
      estaticas += 1;
    }
  }
  return { estaticas, dinamicas, primeiraDinamica, estouro: estaticas > MAX_ESTATICAS || dinamicas > MAX_DINAMICAS };
}

/**
 * O build serve `x/` como `x/index.html`, e arquivos soltos como estão.
 *
 * `existsSync(join(dist, p))` sozinho combina com um DIRETÓRIO, não só com
 * arquivo — e `x/` que só existe porque `x/sub/` existe (ex.: `/group/`, casca
 * do WordPress sem conteúdo próprio) não tem `index.html` e não é servido:
 * vira 404 no Pages. Por isso o segundo teste exige arquivo, não diretório.
 */
export function servido(dist, caminho) {
  const p = decodeURIComponent(caminho).replace(/^\//, '');
  if (p === '' || existsSync(join(dist, p, 'index.html'))) return true;
  /* O Astro sempre grava a página de erro em `404.html`, plano, mesmo com
     `build.format: 'directory'` — é o único arquivo que foge da convenção
     `rota/index.html`. `/404` e `/404/` (o `Astro.url.pathname` que o
     próprio canonical da página usa) apontam para ele. */
  if (p === '404' || p === '404/') return existsSync(join(dist, '404.html'));
  const arquivo = join(dist, p);
  return existsSync(arquivo) && statSync(arquivo).isFile();
}
