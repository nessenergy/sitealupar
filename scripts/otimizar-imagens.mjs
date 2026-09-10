/**
 * Gera as versões WebP das imagens do acervo, nas larguras que o `srcset` usa.
 *
 * As imagens do corpo são PNG e JPG em tamanho cheio — é o que reprova o
 * orçamento de peso nas páginas Empresas (#49). O pipeline do Astro não
 * enxerga `<img>` dentro de `set:html`, então a otimização acontece aqui, uma
 * vez, e o resultado vai versionado em `public/midia/`. Os originais continuam
 * fora do git.
 *
 *   node scripts/otimizar-imagens.mjs              # gera o que falta
 *   node scripts/otimizar-imagens.mjs --verificar  # manifesto ⇄ arquivos (CI)
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import sharp from 'sharp';

const ORIGEM = 'acervo/midia';
const DESTINO = 'public/midia';
const MANIFESTO = 'acervo/imagens.json';
const LARGURAS = [480, 960, 1440];
const TETO = 1920;
const IMAGEM = /\.(png|jpe?g|gif)$/i;

const variantesPara = (largura) => [...LARGURAS.filter((w) => w < largura), Math.min(largura, TETO)];
const saidaDe = (chave, w) => join(DESTINO, `${chave.replace(/\.[^.]+$/, '')}-${w}.webp`);

async function imagens(dir) {
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...(await imagens(p)));
    else if (IMAGEM.test(e.name)) saida.push(p);
  }
  return saida;
}

if (process.argv.includes('--verificar')) {
  const manifesto = JSON.parse(await readFile(MANIFESTO, 'utf8'));
  const faltando = Object.entries(manifesto)
    .flatMap(([chave, e]) => e.variantes.map((w) => saidaDe(chave, w)))
    .filter((p) => !existsSync(p));
  if (faltando.length) {
    console.error(`reprovado: ${faltando.length} variantes do manifesto não estão em ${DESTINO}`);
    for (const p of faltando.slice(0, 10)) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`aprovado: ${Object.keys(manifesto).length} imagens, todas as variantes presentes.`);
  process.exit(0);
}

const manifesto = {};
let bytes = 0;
for (const p of await imagens(ORIGEM)) {
  const chave = relative(ORIGEM, p).split(sep).join('/');
  const { width, height } = await sharp(p).metadata();
  const variantes = variantesPara(width);
  for (const w of variantes) {
    const alvo = saidaDe(chave, w);
    if (!existsSync(alvo)) {
      await mkdir(dirname(alvo), { recursive: true });
      await sharp(p).resize({ width: w }).webp({ quality: 78 }).toFile(alvo);
    }
    bytes += (await stat(alvo)).size;
  }
  manifesto[chave] = { largura: width, altura: height, variantes };
}

const ordenado = Object.fromEntries(Object.entries(manifesto).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFESTO, `${JSON.stringify(ordenado, null, 1)}\n`);
console.log(`${Object.keys(manifesto).length} imagens · ${(bytes / 1024 / 1024).toFixed(1)} MB em ${DESTINO}`);
