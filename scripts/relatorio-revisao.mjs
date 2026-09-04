#!/usr/bin/env node
/**
 * O que a Comunicação precisa olhar, item a item.
 *
 * A auditoria separa o que é reescrita mecânica do que exige gente. Este
 * script pega a segunda pilha e a transforma em documento de trabalho — não em
 * JSON, porque quem vai decidir não lê JSON.
 *
 * Um cuidado importante na conta: nem todo item com redirecionamento está
 * aposentado. Os 125 permalinks traduzidos pelo WPML têm regra no `_redirects`
 * que aponta **para a própria página** — ela continua existindo, só muda de
 * endereço. Confundir os dois casos faria o relatório dispensar trabalho que
 * ainda precisa ser feito.
 *
 * Aposentado é o caminho cujo destino é outra página.
 *
 * Uso: node scripts/relatorio-revisao.mjs [--saida ARQ]
 */

import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const saida = args.includes('--saida') ? args[args.indexOf('--saida') + 1] : 'docs/revisao-de-conteudo.md';

const aud = JSON.parse(await readFile('acervo/auditoria.json', 'utf8'));
const conteudo = new Map(
  (await readFile('acervo/conteudo.jsonl', 'utf8'))
    .trim().split('\n').map((l) => JSON.parse(l))
    .map((i) => [`${i.idioma}/${i.tipo}/${i.slug}`, i]),
);

const regras = (await readFile('public/_redirects', 'utf8'))
  .split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => l.trim().split(/\s+/));

/** Destino do redirecionamento, se houver — ou null. */
function destino(caminho) {
  for (const [de, para] of regras) {
    if (de.endsWith('*') && caminho.startsWith(de.slice(0, -1))) return para;
    if (de.replace(/\/$/, '') === caminho.replace(/\/$/, '')) return para;
  }
  return null;
}

/** Aposentado é o que redireciona para OUTRA página, não para si mesmo. */
const aposentado = (i) => {
  const d = destino(i.caminho);
  if (!d) return null;
  const alvo = d.replace(/^\/(en|es)(?=\/|$)/, '') || '/';
  return alvo.replace(/\/$/, '') === i.caminho.replace(/\/$/, '') ? null : d;
};

const revisao = aud.itens.filter((i) => i.exigeRevisao);
const retirados = revisao.map((i) => ({ i, para: aposentado(i) })).filter((x) => x.para);
const restam = revisao.filter((i) => !aposentado(i));

const porTipo = (l) => l.reduce((m, i) => ((m[i.tipo] = (m[i.tipo] ?? 0) + 1), m), {});
const tabela = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', ');

const linhas = [
  '# O que a Comunicação precisa revisar',
  '',
  `Gerado por \`scripts/relatorio-revisao.mjs\` a partir de \`acervo/auditoria.json\`.`,
  '',
  'A auditoria separa o que é reescrita mecânica do que exige decisão de gente.',
  'Este documento é a segunda pilha, e só ela.',
  '',
  '## O tamanho',
  '',
  `Dos 387 itens com conteúdo, **${revisao.length} exigem revisão**. Destes, **${retirados.length} já estão`,
  `aposentados** por redirecionamento e não precisam ser revistos — sobram **${restam.length}**.`,
  '',
  `Por tipo: ${tabela(porTipo(restam))}.`,
  '',
  '### Uma armadilha da contagem',
  '',
  'Nem todo item com redirecionamento está aposentado. Os 125 permalinks que o',
  'WPML traduziu têm regra no `_redirects` apontando **para a própria página** —',
  'ela continua existindo, só muda de endereço. Contá-los como dispensados faria',
  'este relatório esconder trabalho real. Aposentado é o caminho cujo destino é',
  'outra página.',
  '',
  '## Já aposentados — não revisar',
  '',
  '| Item | Vai para |',
  '|---|---|',
  ...retirados.map(({ i, para }) => `| \`${i.idioma}/${i.tipo}/${i.slug}\` | \`${para}\` |`),
  '',
  'Os três de `alupar-e-a-covid-19` são também **os únicos três itens do acervo',
  'inteiro com imagem sem descrição**. Como já vão para `/sustentabilidade/`, o',
  'bloqueio de acessibilidade para a migração é **zero** — não há texto',
  'alternativo a escrever.',
  '',
  '## Para revisar',
  '',
  'Todos pelo mesmo motivo: **tabela no corpo**. Uma tabela pode ser dado, e aí',
  'continua tabela; ou pode ser layout de 2017, e aí vira grade de CSS. Só quem',
  'olha decide, e é por isso que isto não é trabalho de script.',
  '',
  '| Item | Palavras | Tabelas | Endereço atual |',
  '|---|---:|---:|---|',
  ...restam
    .sort((a, b) => a.idioma.localeCompare(b.idioma) || a.tipo.localeCompare(b.tipo) || a.slug.localeCompare(b.slug))
    .map((i) => {
      const t = i.achados.find((a) => a.regra === 'tabela-de-layout')?.quantidade ?? 0;
      const c = conteudo.get(`${i.idioma}/${i.tipo}/${i.slug}`);
      return `| \`${i.idioma}/${i.tipo}/${i.slug}\` | ${c?.palavras ?? '—'} | ${t} | \`${i.caminho}\` |`;
    }),
  '',
  '## Como decidir',
  '',
  'Para cada linha, uma pergunta: **a tabela existe porque os dados têm linhas e',
  'colunas, ou porque em 2017 era assim que se alinhava conteúdo?**',
  '',
  '- **Dado** — continua tabela, ganha cabeçalho de verdade (`<th>`) e legenda.',
  '- **Layout** — vira grade de CSS, e o conteúdo passa a se reorganizar no celular',
  '  em vez de rolar para o lado.',
  '',
  'O acervo tem o HTML de cada uma em `acervo/conteudo.jsonl`, campo `corpo`.',
];

await writeFile(saida, `${linhas.join('\n')}\n`);
console.log(`${revisao.length} exigem revisão · ${retirados.length} aposentados · ${restam.length} para revisar`);
console.log(`→ ${saida}`);
