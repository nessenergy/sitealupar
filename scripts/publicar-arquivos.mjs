/**
 * Publica `acervo/midia/` no R2 (`alupar-arquivos`, em arquivos.alupar.com.br).
 *
 * O Pages não serve arquivo acima de 25 MiB, e 18 vídeos do acervo passam
 * disso. O bucket guarda a mídia inteira com a MESMA chave que ela tinha sob
 * /wp-content/uploads/ — é o que permite o 301 com :splat no _redirects.
 *
 * Idempotente: só envia o que a URL pública ainda não serve com o mesmo
 * tamanho. Rodar numa máquina com a mídia baixada e o wrangler autenticado.
 *
 *   node scripts/publicar-arquivos.mjs              # envia o que falta e grava o manifesto
 *   node scripts/publicar-arquivos.mjs --verificar  # confere contra o disco
 *   node scripts/publicar-arquivos.mjs --manifesto  # confere contra acervo/r2.json
 *
 * O modo `--manifesto` existe porque os outros dois precisam dos 734 MB de
 * mídia, que não pertencem ao git e só existem na máquina de quem publica —
 * o CI não tinha como conferir o bucket, e oito arquivos ficaram fora dele
 * por dois dias sem ninguém notar. Quem publica commita `acervo/r2.json`,
 * como já se faz com `imagens.json` e `mapa-de-rotas.json`.
 */
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const ORIGEM = 'acervo/midia';
const MANIFESTO = 'acervo/r2.json';
const BUCKET = 'alupar-arquivos';
const PUBLICO = 'https://arquivos.alupar.com.br';
const TIPOS = {
  pdf: 'application/pdf', mp4: 'video/mp4', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const WIN = process.platform === 'win32';
const verificar = process.argv.includes('--verificar');
const soManifesto = process.argv.includes('--manifesto');

async function arquivos(dir) {
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...(await arquivos(p)));
    else saida.push(p);
  }
  return saida;
}

/**
 * A URL pública serve esta chave com este tamanho?
 * Devolve '' quando sim, ou o motivo quando não.
 *
 * Antes de o bucket existir, arquivos.alupar.com.br não resolvia, e o fetch
 * rejeitava em vez de responder — sem o try/catch, a conferência quebraria
 * com uma exceção em vez de listar os pendentes. Erro de rede conta como
 * "não servido", igual a uma resposta não-ok.
 */
async function servido(chave, bytes) {
  let r, erroDeRede;
  try {
    r = await fetch(`${PUBLICO}/${encodeURI(chave)}`, { method: 'HEAD' });
  } catch (e) {
    erroDeRede = e.cause?.code ?? e.code ?? e.message;
  }
  if (r?.ok && Number(r.headers.get('content-length')) === bytes) return '';
  return String(erroDeRede ?? r.status);
}

function fim(pendentes, quantos, onde) {
  if (pendentes.length) {
    console.error(`reprovado: ${pendentes.length} arquivos não estão servidos como deviam`);
    for (const x of pendentes.slice(0, 20)) console.error(`  ${x}`);
    process.exit(1);
  }
  console.log(`aprovado: ${quantos} arquivos de ${onde} estão servidos em ${PUBLICO}.`);
  process.exit(0);
}

if (soManifesto) {
  const manifesto = JSON.parse(await readFile(MANIFESTO, 'utf8'));
  const chaves = Object.entries(manifesto);
  const pendentes = [];
  // Em série, como no outro modo: 128 requisições de cabeçalho não pedem
  // paralelismo, e uma rajada contra o próprio domínio do cliente pede.
  for (const [chave, bytes] of chaves) {
    const motivo = await servido(chave, bytes);
    if (motivo) pendentes.push(`${motivo} ${chave}`);
  }
  fim(pendentes, chaves.length, MANIFESTO);
}

const pendentes = [];
const publicado = {};
for (const p of await arquivos(ORIGEM)) {
  const chave = relative(ORIGEM, p).split(sep).join('/');
  const bytes = (await stat(p)).size;
  publicado[chave] = bytes;

  const motivo = await servido(chave, bytes);
  if (!motivo) continue;
  if (verificar) { pendentes.push(`${motivo} ${chave}`); continue; }

  const tipo = TIPOS[chave.split('.').pop().toLowerCase()] ?? 'application/octet-stream';
  const args = ['wrangler@4', 'r2', 'object', 'put', `${BUCKET}/${chave}`, '--file', p, '--content-type', tipo, '--remote'];
  // No Windows o npx é um .cmd, que só roda por shell — e o shell precisa das aspas.
  const s = spawnSync(WIN ? 'npx.cmd' : 'npx', WIN ? args.map((a) => `"${a}"`) : args, { stdio: 'inherit', shell: WIN });
  if (s.status !== 0) pendentes.push(`falhou o envio ${chave}`);
}

// Só depois de tudo servido: manifesto que promete arquivo ausente reprovaria
// o CI para sempre, e a correção seria publicar, não reescrever o manifesto.
if (!verificar && pendentes.length === 0) {
  const ordenado = Object.fromEntries(Object.keys(publicado).sort().map((k) => [k, publicado[k]]));
  await writeFile(MANIFESTO, `${JSON.stringify(ordenado, null, 1)}\n`);
  console.log(`manifesto gravado: ${MANIFESTO} (${Object.keys(ordenado).length} chaves)`);
}

fim(pendentes, Object.keys(publicado).length, ORIGEM);
