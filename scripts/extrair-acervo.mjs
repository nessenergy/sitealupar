#!/usr/bin/env node
/**
 * Extrai o acervo público do site institucional da Alupar.
 *
 * Existe porque o fornecedor atual não entrega o conteúdo. Tudo o que este
 * script busca é público e é da Alupar — ele apenas percorre os sitemaps do
 * próprio site e guarda o que já está no ar, antes que o acesso mude.
 *
 * Uso:
 *   node scripts/extrair-acervo.mjs                # HTML + manifesto de mídia
 *   node scripts/extrair-acervo.mjs --midia        # baixa também as imagens
 *   node scripts/extrair-acervo.mjs --saida DIR
 *
 * Saída:
 *   DIR/html/<host>/<caminho>.html   páginas, nos três idiomas
 *   DIR/midia/<arquivo>              imagens, com --midia
 *   DIR/inventario.json              URL, status, bytes, título, data
 *   DIR/midia.json                   manifesto de mídia com origem e tamanho
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BASE = 'https://www.alupar.com.br';
const IDIOMAS = ['', '?lang=en', '?lang=es'];
const CONCORRENCIA = 5;
const UA = 'Mozilla/5.0 (compatible; extracao-acervo-alupar/1.0)';

const args = process.argv.slice(2);
const baixarMidia = args.includes('--midia');
const saida = args.includes('--saida') ? args[args.indexOf('--saida') + 1] : 'acervo';

const buscar = (url) =>
  fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'pt-BR' } });

async function urlsDoSitemap(nome) {
  const r = await buscar(`${BASE}/${nome}`);
  if (!r.ok) return [];
  const xml = await r.text();
  return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))];
}

async function emLotes(itens, tamanho, tarefa) {
  const saida = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    saida.push(...(await Promise.all(itens.slice(i, i + tamanho).map(tarefa))));
    process.stderr.write(`\r  ${Math.min(i + tamanho, itens.length)}/${itens.length}`);
  }
  process.stderr.write('\n');
  return saida;
}

function caminhoLocal(url) {
  const u = new URL(url);
  const lang = u.searchParams.get('lang') ?? 'pt';
  const p = u.pathname.replace(/\/$/, '') || '/index';
  return join(saida, 'html', lang, `${p}.html`.replace(/^\//, ''));
}

const titulo = (h) => h.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? null;
const publicado = (h) =>
  h.match(/property="article:published_time" content="([^"]+)"/)?.[1] ??
  h.match(/>(\d{2}\/\d{2}\/\d{4})</)?.[1] ??
  null;

const midia = new Map();

function coletarMidia(html, origem) {
  const re = /(?:src|href)="((?:https?:)?\/\/[^"]+\.(?:jpe?g|png|gif|svg|webp|avif|pdf))[^"]*"/gi;
  for (const m of html.matchAll(re)) {
    const url = m[1].startsWith('//') ? `https:${m[1]}` : m[1];
    if (!midia.has(url)) midia.set(url, { url, origem, bytes: null });
  }
}

async function guardarPagina(url) {
  try {
    const r = await buscar(url);
    const html = r.ok ? await r.text() : '';
    if (html) {
      const destino = caminhoLocal(url);
      await mkdir(dirname(destino), { recursive: true });
      await writeFile(destino, html);
      coletarMidia(html, url);
    }
    return {
      url,
      status: r.status,
      bytes: html.length,
      titulo: html ? titulo(html) : null,
      publicado: html ? publicado(html) : null,
    };
  } catch (e) {
    return { url, status: 0, erro: String(e.message ?? e) };
  }
}

async function guardarMidia(item) {
  try {
    const r = await buscar(item.url);
    if (!r.ok) return { ...item, status: r.status };
    const buf = Buffer.from(await r.arrayBuffer());
    if (baixarMidia) {
      const nome = new URL(item.url).pathname.split('/').pop();
      const destino = join(saida, 'midia', nome);
      await mkdir(dirname(destino), { recursive: true });
      await writeFile(destino, buf);
    }
    return { ...item, status: r.status, bytes: buf.length };
  } catch (e) {
    return { ...item, status: 0, erro: String(e.message ?? e) };
  }
}

const SITEMAPS = ['page-sitemap.xml', 'noticia-sitemap.xml', 'video-sitemap.xml'];

console.error('Lendo sitemaps...');
const base = [...new Set((await Promise.all(SITEMAPS.map(urlsDoSitemap))).flat())];
const alvos = base.flatMap((u) => IDIOMAS.map((l) => u + l));
console.error(`${base.length} URLs × ${IDIOMAS.length} idiomas = ${alvos.length} páginas\n`);

console.error('Guardando páginas...');
const inventario = await emLotes(alvos, CONCORRENCIA, guardarPagina);

console.error(`\n${midia.size} arquivos de mídia referenciados.`);
console.error(baixarMidia ? 'Baixando...' : 'Medindo (use --midia para baixar)...');
const listaMidia = await emLotes([...midia.values()], CONCORRENCIA, guardarMidia);

await mkdir(saida, { recursive: true });
await writeFile(join(saida, 'inventario.json'), JSON.stringify(inventario, null, 2));
await writeFile(join(saida, 'midia.json'), JSON.stringify(listaMidia, null, 2));

const ok = inventario.filter((p) => p.status === 200).length;
const bytesMidia = listaMidia.reduce((s, m) => s + (m.bytes ?? 0), 0);
console.error(`\nPáginas 200: ${ok}/${inventario.length}`);
console.error(`Mídia: ${listaMidia.length} arquivos, ${(bytesMidia / 1048576).toFixed(1)} MB`);
console.error(`Saída em ${saida}/`);
