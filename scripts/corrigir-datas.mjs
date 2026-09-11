/**
 * Corrige as datas de notícia em inglês e espanhol, trocadas na extração.
 *
 * O WPML imprime a data no formato de cada idioma: `dd/mm/aaaa` em português,
 * `mm/dd/aaaa` em inglês e espanhol. O rótulo é "Postado em:" nos três — não
 * foi traduzido —, então nada no HTML avisava que a ordem virava. A primeira
 * extração leu os três como `dd/mm` e transpôs dia e mês em 126 notícias.
 *
 * Metade delas ficou com mês 13 ou mais, e quebra na hora de virar data. **A
 * outra metade virou data válida e errada**, que passa em qualquer validação e
 * só está errada para quem conhece o fato. É o tipo de defeito que nasce
 * silencioso e envelhece: em dezembro ninguém lembra de conferir.
 *
 * `extrair-conteudo.mjs` já foi corrigido. Este script existe porque o HTML
 * bruto — 283 MB — vive fora do git: re-extrair exigiria varrer o site de novo,
 * e a transposição é reversível sem isso.
 *
 * **Idempotência.** Rodar duas vezes desfaria a correção, então a decisão vem
 * dos pares pt/en do próprio acervo: a mesma notícia nos dois idiomas tem de
 * ter a mesma data.
 *
 * A regra é de **maioria**, não de presença. "Existe algum par transposto"
 * não serve — sobra um par cujas duas datas são transpostas uma da outra por
 * coincidência, e com esse critério o script se inverteria a cada execução
 * (foi o que aconteceu na primeira tentativa). Vale o estado em que mais pares
 * concordam: 19 contra 1, nos dois sentidos.
 *
 *   node scripts/corrigir-datas.mjs
 *   node scripts/corrigir-datas.mjs --verificar
 */
import { readFile, writeFile } from 'node:fs/promises';

const ARQUIVO = 'acervo/conteudo.jsonl';
const TROCA_ORDEM = new Set(['en', 'es']);

const trocar = (d) => {
  const [a, m, dia] = d.split('-');
  return `${a}-${dia}-${m}`;
};

/**
 * Compara a mesma notícia em português e em inglês. Devolve quantos pares
 * batem e quantos aparecem com dia e mês trocados entre si.
 *
 * Pares em que dia e mês são iguais (05/05) não distinguem nada — a
 * transposição é invisível neles — e ficam de fora da conta.
 */
function pares(itens) {
  const porSlug = new Map();
  for (const i of itens) {
    if (i.tipo !== 'noticia' || !i.data) continue;
    porSlug.set(`${i.slug}|${i.idioma}`, i.data);
  }
  let batem = 0;
  let transpostos = 0;
  let divergem = 0;
  for (const chave of porSlug.keys()) {
    if (!chave.endsWith('|pt')) continue;
    const slug = chave.slice(0, -3);
    const pt = porSlug.get(chave);
    const en = porSlug.get(`${slug}|en`);
    if (!en) continue;
    const [, mpt, dpt] = pt.split('-');
    if (mpt === dpt) continue;
    if (pt === en) batem += 1;
    else if (trocar(en) === pt) transpostos += 1;
    else divergem += 1;
  }
  return { batem, transpostos, divergem };
}

const linhas = (await readFile(ARQUIVO, 'utf8')).trim().split('\n');
const itens = linhas.map((l) => JSON.parse(l));

const antes = pares(itens);
const alvo = itens.filter((i) => i.data && TROCA_ORDEM.has(i.idioma));
const impossiveis = alvo.filter((i) => Number(i.data.split('-')[1]) > 12);

console.log(`datas em ${[...TROCA_ORDEM].join('/')}: ${alvo.length} · com mês > 12: ${impossiveis.length}`);
console.log(`pares pt/en comparáveis — batem: ${antes.batem} · transpostos: ${antes.transpostos} · divergem: ${antes.divergem}`);

if (antes.divergem) {
  console.error(`\nreprovado: ${antes.divergem} pares pt/en não são nem iguais nem transpostos — a hipótese não explica o dado.`);
  process.exit(1);
}

const precisa = antes.transpostos > antes.batem;

if (process.argv.includes('--verificar')) {
  if (precisa) {
    console.error(`\nreprovado: ${antes.transpostos} de ${antes.transpostos + antes.batem} pares pt/en estão com dia e mês trocados. Rode sem --verificar.`);
    process.exit(1);
  }
  if (impossiveis.length) {
    console.error(`\nreprovado: ${impossiveis.length} datas com mês > 12 sobraram.`);
    process.exit(1);
  }
  console.log('\naprovado: datas de en/es batem com as de pt, e nenhuma tem mês > 12.');
} else if (!precisa) {
  console.log('\nnada a fazer: a maioria dos pares pt/en já bate.');
} else {
  for (const i of itens) if (i.data && TROCA_ORDEM.has(i.idioma)) i.data = trocar(i.data);
  await writeFile(ARQUIVO, `${itens.map((i) => JSON.stringify(i)).join('\n')}\n`);
  const depois = pares(itens);
  console.log(`\ncorrigidas ${alvo.length} datas → ${ARQUIVO}`);
  console.log(`pares pt/en agora — batem: ${depois.batem} · transpostos: ${depois.transpostos}`);
}
