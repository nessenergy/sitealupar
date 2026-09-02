#!/usr/bin/env node
/**
 * Extrai o conteúdo público de rs, pdi e ma pela API REST do WordPress.
 *
 * Existe porque estes três ambientes ainda expõem `wp-json` — ao contrário do
 * institucional, onde o iThemes Security removeu as rotas `wp/v2` e sobrou o
 * crawling de HTML. Enquanto a API responde, a cópia é fiel e barata: texto,
 * metadados e a URL de cada arquivo, sem adivinhar nada a partir do HTML.
 *
 * É uma janela que se fecha sozinha. Os três resolvem para 185.162.55.134, que
 * não é a infraestrutura do fornecedor atual — uma troca de provedor, ou
 * simplesmente alguém fechando a API, transforma horas de trabalho em semanas.
 *
 * Tudo o que este script busca é público e é da Alupar.
 *
 * Uso:
 *   node scripts/extrair-microsites.mjs                # conteúdo + manifesto
 *   node scripts/extrair-microsites.mjs --midia        # baixa também os arquivos
 *   node scripts/extrair-microsites.mjs --saida DIR
 *   node scripts/extrair-microsites.mjs --host rs      # um ambiente só
 *
 * Saída:
 *   DIR/<host>/pages.json      páginas com conteúdo renderizado
 *   DIR/<host>/posts.json      posts
 *   DIR/<host>/media.json      manifesto de mídia
 *   DIR/<host>/midia/<arq>     arquivos, com --midia
 *   DIR/microsites.json        resumo por ambiente
 *
 * Reexecutar é seguro: arquivos de mídia já baixados com o tamanho esperado
 * são pulados, então a extração retoma de onde parou.
 */

import { writeFile, mkdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const HOSTS = ['rs', 'pdi', 'ma'];
const TIPOS = ['pages', 'posts', 'media'];
const POR_PAGINA = 100;
const CONCORRENCIA = 4;
const UA = 'Mozilla/5.0 (compatible; extracao-acervo-alupar/1.0)';

const args = process.argv.slice(2);
const baixarMidia = args.includes('--midia');
const saida = args.includes('--saida') ? args[args.indexOf('--saida') + 1] : 'acervo';
const soHost = args.includes('--host') ? args[args.indexOf('--host') + 1] : null;
const hosts = soHost ? HOSTS.filter((h) => h === soHost) : HOSTS;

if (soHost && hosts.length === 0) {
  console.error(`host desconhecido: ${soHost} (esperado: ${HOSTS.join(', ')})`);
  process.exit(1);
}

const buscar = (url) => fetch(url, { headers: { 'user-agent': UA } });

/** Percorre uma coleção da API paginando por X-WP-TotalPages. */
async function colecao(host, tipo) {
  const base = `https://${host}.alupar.com.br/wp-json/wp/v2/${tipo}`;
  const itens = [];
  let pagina = 1;
  let total = 1;

  do {
    const r = await buscar(`${base}?per_page=${POR_PAGINA}&page=${pagina}`);
    if (!r.ok) {
      // 400 em página além do fim é a resposta normal do WordPress ao esgotar
      if (r.status === 400 && pagina > 1) break;
      throw new Error(`${host}/${tipo} página ${pagina}: HTTP ${r.status}`);
    }
    if (pagina === 1) total = Number(r.headers.get('x-wp-totalpages') || 1);
    itens.push(...(await r.json()));
    pagina += 1;
  } while (pagina <= total);

  return itens;
}

/** Executa `tarefa` sobre `itens` com concorrência limitada. */
async function emLote(itens, tarefa) {
  const fila = [...itens];
  const trabalhar = async () => {
    while (fila.length) await tarefa(fila.shift());
  };
  await Promise.all(Array.from({ length: CONCORRENCIA }, trabalhar));
}

/** Nome de arquivo estável e sem colisão entre ambientes. */
function nomeLocal(item) {
  const url = item.source_url || '';
  const ext = extname(new URL(url).pathname) || '';
  const base = basename(new URL(url).pathname, ext).slice(0, 80);
  return `${item.id}-${base}${ext}`;
}

async function baixarArquivo(host, item, dir, relatorio) {
  const destino = join(dir, nomeLocal(item));
  const esperado = item.media_details?.filesize;

  if (esperado) {
    try {
      const s = await stat(destino);
      if (s.size === esperado) {
        relatorio.pulados += 1;
        return;
      }
    } catch {
      // ainda não existe — segue para o download
    }
  }

  const r = await buscar(item.source_url);
  if (!r.ok) {
    relatorio.falhas.push({ url: item.source_url, status: r.status });
    return;
  }
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(destino, buf);
  relatorio.baixados += 1;
  relatorio.bytes += buf.length;
}

async function extrairHost(host) {
  const dir = join(saida, host);
  await mkdir(dir, { recursive: true });

  const resumo = { host, url: `https://${host}.alupar.com.br` };

  for (const tipo of TIPOS) {
    const itens = await colecao(host, tipo);
    await writeFile(join(dir, `${tipo}.json`), JSON.stringify(itens, null, 2));
    resumo[tipo] = itens.length;
    console.log(`  ${host}/${tipo}: ${itens.length}`);

    if (tipo === 'media') {
      resumo.bytesDeclarados = itens.reduce(
        (t, i) => t + (i.media_details?.filesize || 0),
        0,
      );
      if (baixarMidia) {
        const dirMidia = join(dir, 'midia');
        await mkdir(dirMidia, { recursive: true });
        const relatorio = { baixados: 0, pulados: 0, bytes: 0, falhas: [] };
        await emLote(itens, (i) => baixarArquivo(host, i, dirMidia, relatorio));
        resumo.download = relatorio;
        console.log(
          `  ${host}/midia: ${relatorio.baixados} baixados, ` +
            `${relatorio.pulados} já existiam, ${relatorio.falhas.length} falhas`,
        );
      }
    }
  }

  return resumo;
}

const resumos = [];
for (const host of hosts) {
  console.log(`\n${host}.alupar.com.br`);
  try {
    resumos.push(await extrairHost(host));
  } catch (e) {
    console.error(`  falhou: ${e.message}`);
    resumos.push({ host, erro: e.message });
  }
}

await mkdir(saida, { recursive: true });
await writeFile(
  join(saida, 'microsites.json'),
  JSON.stringify({ extraidoEm: new Date().toISOString(), ambientes: resumos }, null, 2),
);

console.log(`\nresumo em ${join(saida, 'microsites.json')}`);
if (!baixarMidia) console.log('mídia não baixada — repita com --midia');
