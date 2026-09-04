/**
 * Balanceia o HTML do corpo com parser, e não com expressão regular.
 *
 * O recorte do tema pega metade de um par: a `<div>` abre antes da seção de
 * texto e fecha depois dela. Sobra tag não fechada de um lado e tag órfã do
 * outro — HTML que o `set:html` do Astro injetaria inválido.
 *
 * A tentativa anterior, por regex casando a classe do invólucro, piorou o
 * conteúdo: as `</div>` de fechamento não têm classe (ver comentário em
 * `limpar-conteudo.mjs`). Casar abertura com fechamento é trabalho de parser.
 *
 * `parseFragment` monta a árvore aplicando as regras de recuperação do HTML5 —
 * fecha o que ficou aberto, descarta o que fecha sem ter aberto — e `serialize`
 * devolve marcação bem formada. A prova de que nada se perde está em
 * `--verificar`: o texto visível antes e depois tem de ser idêntico.
 *
 *   node scripts/balancear-conteudo.mjs
 *   node scripts/balancear-conteudo.mjs --verificar
 */
import { readFile, writeFile } from 'node:fs/promises';
import { parseFragment, serialize } from 'parse5';

const ENTRADA = 'acervo/conteudo-limpo.jsonl';
const SAIDA = 'acervo/conteudo-pronto.jsonl';

/** Texto visível da árvore, com espaço normalizado — a régua do que não pode sumir. */
function textoDe(no, saida = []) {
  if (no.nodeName === '#text') saida.push(no.value);
  for (const filho of no.childNodes ?? []) textoDe(filho, saida);
  return saida.join(' ').replace(/\s+/g, ' ').trim();
}

/** Parágrafo e div que ficaram sem nada dentro depois do rebalanceamento. */
const VAZIOS = /<(p|div)\b[^>]*>\s*<\/\1>/gi;

function balancear(html) {
  let saida = serialize(parseFragment(html));
  let anterior;
  do {
    anterior = saida;
    saida = saida.replace(VAZIOS, '');
  } while (saida !== anterior);
  return saida.replace(/\s{2,}/g, ' ').trim();
}

/** Conta o desequilíbrio bruto, sem parser — é o número que queremos ver zerar. */
function desequilibrio(html) {
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const pilha = [];
  let orfas = 0;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g)) {
    const [, fecha, tag, autofecha] = m;
    const nome = tag.toLowerCase();
    if (VOID.has(nome) || autofecha) continue;
    if (fecha) {
      const i = pilha.lastIndexOf(nome);
      if (i === -1) orfas += 1;
      else pilha.length = i;
    } else pilha.push(nome);
  }
  return { orfas, abertas: pilha.length };
}

const verificar = process.argv.includes('--verificar');
const itens = (await readFile(ENTRADA, 'utf8')).trim().split('\n').map((l) => JSON.parse(l));

const antes = { orfas: 0, abertas: 0, itens: 0 };
const depois = { orfas: 0, abertas: 0, itens: 0 };
const perdas = [];
let instaveis = 0;

const prontos = itens.map((i) => {
  if (i.vazio) return i;
  const d0 = desequilibrio(i.corpo);
  if (d0.orfas || d0.abertas) antes.itens += 1;
  antes.orfas += d0.orfas;
  antes.abertas += d0.abertas;

  const corpo = balancear(i.corpo);

  const d1 = desequilibrio(corpo);
  if (d1.orfas || d1.abertas) depois.itens += 1;
  depois.orfas += d1.orfas;
  depois.abertas += d1.abertas;

  const t0 = textoDe(parseFragment(i.corpo));
  const t1 = textoDe(parseFragment(corpo));
  if (t0 !== t1) perdas.push({ caminho: i.caminho, antes: t0.length, depois: t1.length });
  if (balancear(corpo) !== corpo) instaveis += 1;

  return { ...i, corpo };
});

const linha = (r) => `${String(r.orfas).padStart(4)} órfãs · ${String(r.abertas).padStart(4)} não fechadas · ${String(r.itens).padStart(3)} itens afetados`;
console.log(`itens com corpo: ${prontos.filter((i) => !i.vazio).length}`);
console.log(`antes:  ${linha(antes)}`);
console.log(`depois: ${linha(depois)}`);
console.log(`texto alterado em ${perdas.length} itens · serialização instável em ${instaveis}`);

if (verificar) {
  const falhas = [];
  if (depois.orfas || depois.abertas) falhas.push(`sobrou desequilíbrio: ${linha(depois)}`);
  if (perdas.length) falhas.push(`texto visível mudou em ${perdas.length} itens: ${perdas.slice(0, 5).map((p) => p.caminho).join(', ')}`);
  if (instaveis) falhas.push(`serialização não é idempotente em ${instaveis} itens`);
  if (falhas.length) {
    console.error(`\nreprovado:\n${falhas.map((f) => `  - ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('\naprovado: HTML balanceado, texto visível intacto, serialização estável.');
} else {
  await writeFile(SAIDA, `${prontos.map((i) => JSON.stringify(i)).join('\n')}\n`);
  console.log(`\nescrito: ${SAIDA}`);
}
