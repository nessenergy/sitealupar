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
/*
 * 640 cobre a coluna de texto do corpo (525–600px de largura exibida, medido
 * no Lighthouse das páginas Empresas): sem ele, o degrau ia de 480 — menor
 * que a coluna — direto para 960, quase o dobro do necessário, e
 * `uses-responsive-images` reprovava com 60-70% de desperdício.
 */
const LARGURAS = [480, 640, 960, 1440];
const TETO = 1920;
const IMAGEM = /\.(png|jpe?g|gif)$/i;

const variantesPara = (largura) => [...LARGURAS.filter((w) => w < largura), Math.min(largura, TETO)];
const saidaDe = (chave, w) => join(DESTINO, `${chave.replace(/\.[^.]+$/, '')}-${w}.webp`);
/** Miniatura do WordPress: `…-300x243.jpg` → `….jpg`. */
const semSufixo = (chave) => chave.replace(/-\d+x\d+(\.\w+)$/, '$1');
/** De onde saem os arquivos de uma entrada: a própria chave, ou o original. */
const arquivoDe = (chave, e) => e.original ?? chave;

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
    .flatMap(([chave, e]) => e.variantes.map((w) => saidaDe(arquivoDe(chave, e), w)))
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
const arquivos = new Map();
for (const p of await imagens(ORIGEM)) {
  const chave = relative(ORIGEM, p).split(sep).join('/');
  const { width, height } = await sharp(p).metadata();
  manifesto[chave] = { largura: width, altura: height, variantes: variantesPara(width) };
  arquivos.set(chave, p);
}

/*
 * O corpo herdado pede a miniatura (`…-300x243.jpg`) e a exibe a `width="674"`.
 * Servir os 300 px ali é a imagem esticada 2,25× que o revisor da Alup viu como
 * borrada. Quando o original está no acervo e é maior, a entrada da miniatura
 * passa a ser a do original — mesma proporção, mesmas variantes, e `original`
 * diz de qual arquivo elas saem. Assim o apelido vive no manifesto, e quem
 * reescreve o `<img>` continua fazendo uma busca só.
 */
for (const chave of Object.keys(manifesto)) {
  const original = semSufixo(chave);
  if (original === chave || !manifesto[original]) continue;
  if (manifesto[original].largura <= manifesto[chave].largura) continue;
  manifesto[chave] = { ...manifesto[original], original };
}

/*
 * Gera só o que o manifesto serve: a miniatura apelidada não tem arquivo
 * próprio. Gerando por arquivo de origem, sobravam 33 WebP de 300 px que
 * nenhuma página cita mais — peso versionado e publicado à toa.
 */
let bytes = 0;
for (const [chave, e] of Object.entries(manifesto)) {
  if (arquivoDe(chave, e) !== chave) continue;
  for (const w of e.variantes) {
    const alvo = saidaDe(chave, w);
    if (!existsSync(alvo)) {
      await mkdir(dirname(alvo), { recursive: true });
      await sharp(arquivos.get(chave)).resize({ width: w }).webp({ quality: 78 }).toFile(alvo);
    }
    bytes += (await stat(alvo)).size;
  }
}

const ordenado = Object.fromEntries(Object.entries(manifesto).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFESTO, `${JSON.stringify(ordenado, null, 1)}\n`);
console.log(`${Object.keys(manifesto).length} imagens · ${(bytes / 1024 / 1024).toFixed(1)} MB em ${DESTINO}`);
