#!/usr/bin/env node
/**
 * Converte o HTML adquirido em conteúdo estruturado.
 *
 * O acervo bruto são 651 páginas e 283 MB que vivem fora do git e desaparecem
 * com o ambiente. O que precisa sobreviver não é o HTML do tema de 2017 — é o
 * texto, a data, o título e a lista de arquivos de cada item. Este script
 * extrai exatamente isso, e o resultado cabe no repositório.
 *
 * É também o insumo da migração: o modelo de conteúdo do CMS se desenha a
 * partir do que existe de fato, não do que o menu sugere.
 *
 * Todo o conteúdo do site mora em `<section id="texto">`, com ou sem `class`.
 * As três páginas iniciais são a exceção — são rotativo e blocos montados, não
 * texto corrido — e ficam registradas como tal.
 *
 * Uso:
 *   node scripts/extrair-conteudo.mjs [--html DIR] [--saida ARQ]
 *
 * Saída: JSONL, um item por linha, com idioma, tipo, slug, título, data,
 * corpo em HTML, texto simples e os arquivos referenciados.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative, basename } from 'node:path';

const args = process.argv.slice(2);
const opc = (n, padrao) => (args.includes(n) ? args[args.indexOf(n) + 1] : padrao);
const dirHtml = opc('--html', 'acervo/html');
const saida = opc('--saida', 'acervo/conteudo.jsonl');

async function arquivos(dir) {
  const achados = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) achados.push(...(await arquivos(p)));
    else if (e.name.endsWith('.html')) achados.push(p);
  }
  return achados;
}

const semTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();

/** Data de publicação: o tema a esconde num parágrafo com "Postado em:". */
function dataDe(html) {
  const m = /Postado em:\s*<\/strong>\s*([\d]{2}\/[\d]{2}\/[\d]{4})/.exec(html)
    ?? /Postado em:[\s\S]{0,80}?([\d]{2}\/[\d]{2}\/[\d]{4})/.exec(html);
  if (!m) return null;
  const [d, mes, a] = m[1].split('/');
  return `${a}-${mes}-${d}`;
}

const ARQUIVO = /(?:src|href)="((?:https?:)?\/\/[^"]+?\.(?:jpe?g|png|gif|svg|webp|avif|pdf|docx?|xlsx?))[^"]*"/gi;

function arquivosDe(html) {
  return [
    ...new Set(
      [...html.matchAll(ARQUIVO)].map((m) => (m[1].startsWith('//') ? `https:${m[1]}` : m[1])),
    ),
  ];
}

const lidos = await arquivos(dirHtml);
const itens = [];
const semSecao = [];

for (const f of lidos) {
  const html = await readFile(f, 'utf8');
  const rel = relative(dirHtml, f);
  const partes = rel.split('/');
  const idioma = partes[0];
  const tipo = partes.length > 2 ? partes[1] : 'pagina';
  const slug = basename(f, '.html');

  const secao = /<section id="texto"[^>]*>([\s\S]*?)<\/section>/.exec(html)?.[1];
  if (!secao) {
    semSecao.push({ idioma, tipo, slug, caminho: rel, motivo: 'sem <section id="texto">' });
    continue;
  }

  const titulo = semTags(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(secao)?.[1] ?? '') || null;

  /*
   * O corpo é a seção menos quatro coisas que não são conteúdo: o título, o
   * parágrafo escondido com a data, os comentários do tema, e a trilha de
   * navegação — que o tema imprime dentro da seção de texto e em português
   * mesmo nas páginas em inglês e espanhol. Sem removê-la, os 648 itens
   * começariam com "Você está em:", e qualquer busca no acervo casaria tudo.
   */
  const corpo = secao
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')
    .replace(/<p style="display: ?none;">[\s\S]*?<\/p>/, '')
    .replace(/<ul id="breadcrumbs"[\s\S]*?<\/ul>/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const texto = semTags(corpo);
  const arquivos = arquivosDe(secao);

  /*
   * O WordPress dá URL própria a cada anexo, e o Yoast as publica no sitemap.
   * São páginas cujo conteúdo é só o arquivo: sem texto, com título igual ao
   * nome do arquivo. Não são conteúdo a migrar — são endereços a aposentar.
   */
  const anexo = texto.length < 40 && arquivos.length > 0;

  itens.push({
    idioma,
    tipo,
    slug,
    caminho: `/${rel.replace(/\.html$/, '/').replace(/^[a-z]{2}\//, '')}`,
    titulo,
    data: dataDe(secao),
    palavras: texto ? texto.split(' ').length : 0,
    vazio: texto.length < 40,
    anexo,
    arquivos,
    texto,
    corpo,
  });
}

itens.sort((a, b) =>
  `${a.idioma}/${a.tipo}/${a.slug}`.localeCompare(`${b.idioma}/${b.tipo}/${b.slug}`),
);

await writeFile(saida, `${itens.map((i) => JSON.stringify(i)).join('\n')}\n`);

/* ── relatório ── */
const conta = (f) => itens.reduce((m, i) => ((m[f(i)] = (m[f(i)] ?? 0) + 1), m), {});
console.log(`${itens.length} itens extraídos de ${lidos.length} páginas → ${saida}`);
console.log('por idioma:', conta((i) => i.idioma));
console.log('sem <section id="texto">:', semSecao.length, semSecao.map((s) => s.caminho).join(', '));
const vazios = itens.filter((i) => i.vazio);
const anexos = itens.filter((i) => i.anexo);
console.log(`páginas de anexo (endereço a aposentar, não conteúdo): ${anexos.length}`);
console.log(`sem texto e sem arquivo: ${vazios.length - anexos.length}`);
const semData = itens.filter((i) => i.tipo === 'noticia' && !i.data && !i.anexo);
console.log(`notícias reais sem data: ${semData.length}`);
const datas = itens.filter((i) => i.data).map((i) => i.data).sort();
console.log(`itens datados: ${datas.length}, de ${datas[0]} a ${datas.at(-1)}`);
const palavras = itens.reduce((t, i) => t + i.palavras, 0);
console.log(`palavras no acervo: ${palavras.toLocaleString('pt-BR')}`);
