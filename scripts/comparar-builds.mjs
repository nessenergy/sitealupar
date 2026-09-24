/**
 * Compara dois builds pela estrutura, não pelos bytes.
 *
 *   node scripts/comparar-builds.mjs <dist-antigo> <dist-novo>
 *
 * Nasceu no upgrade do Astro 5 para o 7 (D30), onde "o site não mudou" não
 * podia ser opinião. Um upgrade de framework muda o HTML de propósito — o
 * Astro 6 troca estilo embutido por `data-*` em imagem responsiva, o 7 muda o
 * compressHTML para 'jsx' —, e comparar bytes só produz ruído.
 *
 * Aqui compara-se a árvore de tags com seus atributos e o texto que o
 * visitante lê. Três diferenças são normalizadas porque foram apuradas e
 * explicadas, e só essas: o hash de escopo do compilador
 * (`data-astro-cid-…`), o nome do arquivo de bundle, e o `fetchpriority="auto"`
 * que o Astro 7 deixou de escrever por ser o valor padrão. Qualquer outra
 * diferença aparece — que é o ponto.
 */
import { parse } from 'parse5';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [a, b] = process.argv.slice(2);
const HASH = /\.[A-Za-z0-9_-]{8,}\.(js|css|jpg|png|webp|avif)/g;
const BUNDLE = /\/_astro\/[^"']*\.HASH\.(css|js)/g;

function paginas(raiz, base = raiz) {
  return readdirSync(raiz).flatMap((n) => {
    const p = join(raiz, n);
    return statSync(p).isDirectory() ? paginas(p, base) : (n.endsWith('.html') ? [relative(base, p)] : []);
  });
}

/** Assinatura da página: sequência de tags+atributos e o texto visível. */
function assinatura(html) {
  const tags = [];
  const texto = [];
  (function anda(no) {
    if (no.nodeName === '#text') {
      if (no.parentNode?.tagName === 'style' || no.parentNode?.tagName === 'script') return; const t = no.value.replace(/\s+/g, ' ').replace(/data-astro-cid-[a-z0-9]+/g, 'cid').trim(); if (t) texto.push(t); return; }
    if (no.tagName) {
      const attrs = (no.attrs ?? [])
        .filter((x) => x.name !== 'style' && !(x.name === 'fetchpriority' && x.value === 'auto'))                      // v6: estilo embutido vira data-*
        .map((x) => `${x.name}=${x.value.replace(HASH, '.HASH.$1').replace(BUNDLE, '/_astro/BUNDLE.$1')}`)
        .sort().join(' ');
      if (no.tagName !== 'style') tags.push(`${no.tagName}[${attrs.replace(/data-astro-cid-[a-z0-9]+=/g,'cid=')}]`);
    }
    for (const f of no.childNodes ?? []) anda(f);
  })(parse(html));
  return { tags, texto };
}

let iguais = 0; const difere = [];
for (const p of paginas(a)) {
  const x = assinatura(readFileSync(join(a, p), 'utf8'));
  let y; try { y = assinatura(readFileSync(join(b, p), 'utf8')); } catch { difere.push(`${p}: NÃO EXISTE no build novo`); continue; }
  const dTexto = JSON.stringify(x.texto) !== JSON.stringify(y.texto);
  const dTags = JSON.stringify(x.tags) !== JSON.stringify(y.tags);
  if (!dTexto && !dTags) { iguais++; continue; }
  difere.push(`${p}: ${dTexto ? 'TEXTO' : ''}${dTexto && dTags ? ' e ' : ''}${dTags ? `tags ${x.tags.length}→${y.tags.length}` : ''}`);
}
console.log(`${iguais} páginas idênticas em estrutura e texto`);
if (difere.length) { console.log(`${difere.length} diferem:`); for (const d of difere.slice(0, 15)) console.log('  ' + d); }
