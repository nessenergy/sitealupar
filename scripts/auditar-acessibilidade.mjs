/**
 * Mede a dívida de acessibilidade que vem DENTRO do conteúdo migrado.
 *
 * O gate do Lighthouse cobre o que o template faz — contraste, `lang`, ordem de
 * cabeçalho da página. Não cobre o que vem no corpo: uma imagem sem `alt` no
 * meio de uma notícia de 2018 reprova o critério, e a correção não é do
 * template, é do conteúdo.
 *
 * Esta medição existe para separar as duas dívidas antes de gerar as páginas.
 * Sem ela, o gate reprova na virada e a discussão vira "afrouxa o critério" em
 * vez de "corrige estes 40 itens".
 *
 * Nada aqui é corrigido automaticamente, e é deliberado: `alt=""` num logotipo
 * é certo, na foto de uma usina é apagar informação. Quem decide é quem escreve.
 *
 *   node scripts/auditar-acessibilidade.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { parseFragment } from 'parse5';

const PREFIXO = { pt: '', en: '/en', es: '/es' };
const atr = (n, k) => n.attrs?.find((a) => a.name === k)?.value;
const texto = (n, s = []) => {
  if (n.nodeName === '#text') s.push(n.value);
  for (const c of n.childNodes ?? []) texto(c, s);
  return s.join('').trim();
};
const temDescendente = (n, teste) => {
  for (const c of n.childNodes ?? []) if (teste(c) || temDescendente(c, teste)) return true;
  return false;
};

/*
 * Cada regra diz o critério do WCAG que ela reprova e quem corrige. A segunda
 * coluna é a que faz o relatório servir para alguma coisa: sem ela, a lista vai
 * para o time errado e volta.
 */
const REGRAS = [
  { id: 'imagem-sem-alt', criterio: 'WCAG 1.1.1', quem: 'Comunicação',
    porque: 'imagem sem atributo alt: o leitor de tela anuncia o nome do arquivo',
    casa: (n) => n.nodeName === 'img' && atr(n, 'alt') === undefined },
  { id: 'link-sem-texto', criterio: 'WCAG 2.4.4', quem: 'Comunicação',
    porque: 'link sem texto, sem aria-label e sem imagem com alt: não há como saber para onde vai',
    casa: (n) => n.nodeName === 'a' && !texto(n) && !atr(n, 'aria-label')
      && !temDescendente(n, (c) => c.nodeName === 'img' && atr(c, 'alt')) },
  { id: 'tabela-sem-cabecalho', criterio: 'WCAG 1.3.1', quem: 'front-end',
    porque: 'tabela sem <th>: o leitor de tela lê os números sem dizer de que coluna são',
    casa: (n) => n.nodeName === 'table' && !temDescendente(n, (c) => c.nodeName === 'th') },
  { id: 'iframe-sem-titulo', criterio: 'WCAG 4.1.2', quem: 'front-end',
    porque: 'iframe sem title: o conteúdo embutido não é anunciado',
    casa: (n) => n.nodeName === 'iframe' && !atr(n, 'title') },
  { id: 'nova-aba-sem-aviso', criterio: 'WCAG 3.2.5', quem: 'front-end',
    porque: 'target="_blank" sem aviso no texto: a nova aba surpreende quem não vê a tela',
    casa: (n) => n.nodeName === 'a' && atr(n, 'target') === '_blank' },
];

const itens = (await readFile('acervo/conteudo-pronto.jsonl', 'utf8'))
  .trim().split('\n').map((l) => JSON.parse(l)).filter((i) => !i.vazio);

/*
 * O acervo tem itens que não viram página: aposentados por 301, arquivo de
 * data, taxonomia. Contar o achado deles infla o número e manda a Comunicação
 * corrigir o que ninguém vai ver — foi exatamente o erro cometido na primeira
 * leitura desta medição, e é por isso que o cruzamento mora aqui dentro e não
 * na cabeça de quem lê o relatório.
 */
const mapa = JSON.parse(await readFile('acervo/mapa-de-rotas.json', 'utf8'));
const publicadas = new Set(mapa.rotas.map((r) => r.rota));
const remapa = Object.fromEntries(mapa.remapados.map((r) => [r.de, r.para]));

const achados = [];
for (const i of itens) {
  const bruta = `${PREFIXO[i.idioma] ?? ''}${i.caminho}`;
  const rota = remapa[bruta] ?? bruta;
  const publicada = publicadas.has(rota);
  const conta = {};
  (function anda(n) {
    for (const r of REGRAS) if (r.casa(n)) conta[r.id] = (conta[r.id] ?? 0) + 1;
    /* Salto de nível: a página dá o h1, então o corpo começa em h2. */
    for (const c of n.childNodes ?? []) anda(c);
  })(parseFragment(i.corpo));

  const niveis = [];
  (function h(n) {
    if (/^h[1-6]$/.test(n.nodeName)) niveis.push(Number(n.nodeName[1]));
    for (const c of n.childNodes ?? []) h(c);
  })(parseFragment(i.corpo));
  let anterior = 1;
  for (const n of niveis) {
    if (n > anterior + 1) { conta['salto-de-nivel'] = (conta['salto-de-nivel'] ?? 0) + 1; break; }
    anterior = n;
  }

  if (Object.keys(conta).length) achados.push({ rota, publicada, idioma: i.idioma, tipo: i.tipo, titulo: i.titulo, ocorrencias: conta });
}

const TODAS = [...REGRAS, { id: 'salto-de-nivel', criterio: 'WCAG 1.3.1', quem: 'Comunicação',
  porque: 'cabeçalho pula nível (h2 direto para h4): quebra a navegação por estrutura' }];

const publicados = achados.filter((a) => a.publicada);
const resume = (lista) => TODAS.map((r) => ({
  ...r,
  ocorrencias: lista.reduce((a, x) => a + (x.ocorrencias[r.id] ?? 0), 0),
  itens: lista.filter((x) => x.ocorrencias[r.id]).length,
})).sort((a, b) => b.itens - a.itens);
const resumo = resume(publicados);

await writeFile('acervo/acessibilidade-do-conteudo.json',
  `${JSON.stringify({
    geradoEm: new Date().toISOString(),
    itensAnalisados: itens.length,
    itensComAchado: achados.length,
    itensPublicadosComAchado: publicados.length,
    resumo,
    resumoIncluindoAposentados: resume(achados),
    achados,
  }, null, 2)}\n`);

const pendentes = publicados.filter((a) => TODAS.some((r) => r.quem === 'Comunicação' && a.ocorrencias[r.id]));

console.log(`itens analisados: ${itens.length} · com achado: ${achados.length} · que viram página: ${publicados.length}`);
console.log('\nnas páginas publicadas (o que de fato precisa de correção):');
for (const r of resumo) console.log(`  ${String(r.ocorrencias).padStart(4)} ocorrências · ${String(r.itens).padStart(3)} itens · ${r.id} (${r.criterio}, ${r.quem})`);
console.log(`\ndependem da Comunicação: ${pendentes.length} páginas`);
for (const p of pendentes) console.log(`  ${p.rota}`);
