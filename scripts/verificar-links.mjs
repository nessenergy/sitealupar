/**
 * Confere que todo link interno do build resolve.
 *
 * Substitui o passo de `linkinator` do CI, que **não estava verificando nada**.
 * Ele rasteja a partir de `dist/index.html`, e a home ainda não tem navegação:
 * escaneava 1 link e passava. Um gate que não alcança o conteúdo é pior que
 * gate nenhum, porque produz confiança falsa — e passou despercebido enquanto
 * o site tinha três páginas.
 *
 * Aqui não há rastejo: lê todo HTML gerado e classifica cada `href`/`src`.
 *
 *   interno       caminho que este build tem de servir  → tem de resolver
 *   redirecionado coberto por regra do `public/_redirects` → aceito
 *   mídia         /wp-content/uploads/… → do acervo de mídia, não deste build
 *   externo       outro host → fora do nosso alcance, contado e não checado
 *
 * Externo não é verificado de propósito: reprovar o merge porque um servidor
 * de terceiro caiu é a receita de gate instável, que a equipe aprende a
 * ignorar. A dependência desses serviços é acompanhada na issue #43.
 *
 *   node scripts/verificar-links.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { lerRegras, regraPara, servido as servidoEm } from './lib/redirects.mjs';

const DIST = 'dist';
const PROPRIO = /^https?:\/\/www\.alupar\.com\.br/;

function html(dir, saida = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) html(p, saida);
    else if (e.name.endsWith('.html')) saida.push(p);
  }
  return saida;
}

const regras = lerRegras(readFileSync('public/_redirects', 'utf8'));
const redirecionado = (caminho) => Boolean(regraPara(regras, caminho));
const servido = (caminho) => servidoEm(DIST, caminho);

/*
 * Links mortos herdados do conteúdo, declarados um a um.
 *
 * `Download.aspx` é o manipulador de download de uma plataforma anterior à
 * atual: os links estão dentro do texto de notícias antigas e **já não
 * funcionam no site de hoje**. Não são regressão da migração, e apagá-los
 * jogaria fora a única referência que resta a esses documentos.
 *
 * Ficam declarados, contados e impressos a cada execução — não silenciados.
 * O gate reprova qualquer link quebrado que NÃO esteja nesta lista, que é o
 * que o torna capaz de pegar regressão nova.
 */
const HERDADOS = [
  { teste: /\/Download\.aspx/i, porque: 'download de plataforma anterior; já morto no site atual' },
];

const paginas = html(DIST);
const conta = { interno: 0, redirecionado: 0, midia: 0, externo: 0, ancora: 0 };
const herdados = [];
const quebrados = [];

for (const f of paginas) {
  const doc = readFileSync(f, 'utf8');
  for (const m of doc.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const bruto = m[1];
    if (bruto.startsWith('#') || bruto.startsWith('data:') || bruto.startsWith('mailto:') || bruto.startsWith('tel:')) {
      conta.ancora += 1;
      continue;
    }

    /* Relativo resolve contra o DIRETÓRIO da página, não contra a raiz —
       `./x` dentro de `/noticia/y/` é `/noticia/y/x`. Tratar como `/x` inventa
       link quebrado que não existe. */
    const base = `/${f.replace(`${DIST}/`, '').replace(/index\.html$/, '')}`;

    let caminho = null;
    if (PROPRIO.test(bruto)) caminho = new URL(bruto).pathname;
    else if (/^https?:\/\//.test(bruto)) { conta.externo += 1; continue; }
    else caminho = new URL(bruto, `https://x${base}`).pathname;

    /* `pathname` sai percent-encoded (nome de arquivo com acento vira %C3%A3).
       `servido`, da lib, já decodifica antes de olhar o disco — decodificar
       aqui de novo estouraria em nome com `%` literal. Os outros dois testes
       são ASCII (slug de página, regra de _redirects), então não precisam. */
    if (caminho.startsWith('/wp-content/uploads/')) { conta.midia += 1; continue; }
    if (servido(caminho)) { conta.interno += 1; continue; }
    if (redirecionado(caminho)) { conta.redirecionado += 1; continue; }
    const herdado = HERDADOS.find((h) => h.teste.test(caminho));
    if (herdado) { herdados.push({ link: bruto, caminho, porque: herdado.porque }); continue; }
    quebrados.push({ pagina: f.replace(`${DIST}/`, ''), link: bruto });
  }
}

console.log(`páginas: ${paginas.length}`);
console.log(`  ${String(conta.interno).padStart(5)} internos, servidos por este build`);
console.log(`  ${String(conta.redirecionado).padStart(5)} cobertos por regra de 301`);
console.log(`  ${String(conta.midia).padStart(5)} de mídia (/wp-content/uploads/), fora deste build`);
console.log(`  ${String(conta.externo).padStart(5)} externos, não verificados de propósito`);
console.log(`  ${String(conta.ancora).padStart(5)} âncoras e esquemas não navegáveis`);

if (herdados.length) {
  console.log(`\n${herdados.length} links mortos herdados do conteúdo, declarados e não reprovados:`);
  for (const h of HERDADOS) {
    const n = herdados.filter((x) => h.teste.test(x.caminho)).length;
    if (n) console.log(`  ${String(n).padStart(4)}× ${h.teste.source} — ${h.porque}`);
  }
}

if (quebrados.length) {
  console.error(`\nreprovado: ${quebrados.length} links internos não resolvem`);
  const porLink = new Map();
  for (const q of quebrados) porLink.set(q.link, (porLink.get(q.link) ?? 0) + 1);
  for (const [link, n] of [...porLink].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.error(`  ${String(n).padStart(4)}× ${link}`);
  }
  process.exit(1);
}
console.log('\naprovado: todo link interno resolve, por página gerada ou por regra de 301.');
