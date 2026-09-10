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
 *   node scripts/publicar-arquivos.mjs              # envia o que falta
 *   node scripts/publicar-arquivos.mjs --verificar  # só confere, pela URL pública
 */
import { readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const ORIGEM = 'acervo/midia';
const BUCKET = 'alupar-arquivos';
const PUBLICO = 'https://arquivos.alupar.com.br';
const TIPOS = {
  pdf: 'application/pdf', mp4: 'video/mp4', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const WIN = process.platform === 'win32';
const verificar = process.argv.includes('--verificar');

async function arquivos(dir) {
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...(await arquivos(p)));
    else saida.push(p);
  }
  return saida;
}

const pendentes = [];
for (const p of await arquivos(ORIGEM)) {
  const chave = relative(ORIGEM, p).split(sep).join('/');

  /*
   * Antes de o bucket existir, arquivos.alupar.com.br não resolve, e o fetch
   * rejeita em vez de responder — sem o try/catch, `--verificar` quebraria
   * com uma exceção em vez de listar os 120 arquivos pendentes. Erro de rede
   * conta como "não servido", igual a uma resposta não-ok.
   */
  let r, erroDeRede;
  try {
    r = await fetch(`${PUBLICO}/${encodeURI(chave)}`, { method: 'HEAD' });
  } catch (e) {
    erroDeRede = e.cause?.code ?? e.code ?? e.message;
  }

  if (r?.ok && Number(r.headers.get('content-length')) === (await stat(p)).size) continue;
  if (verificar) { pendentes.push(`${erroDeRede ?? r.status} ${chave}`); continue; }

  const tipo = TIPOS[chave.split('.').pop().toLowerCase()] ?? 'application/octet-stream';
  const args = ['wrangler@4', 'r2', 'object', 'put', `${BUCKET}/${chave}`, '--file', p, '--content-type', tipo, '--remote'];
  // No Windows o npx é um .cmd, que só roda por shell — e o shell precisa das aspas.
  const s = spawnSync(WIN ? 'npx.cmd' : 'npx', WIN ? args.map((a) => `"${a}"`) : args, { stdio: 'inherit', shell: WIN });
  if (s.status !== 0) pendentes.push(`falhou o envio ${chave}`);
}

if (pendentes.length) {
  console.error(`reprovado: ${pendentes.length} arquivos não estão servidos como deviam`);
  for (const x of pendentes.slice(0, 20)) console.error(`  ${x}`);
  process.exit(1);
}
console.log(`aprovado: toda a mídia de ${ORIGEM} está servida em ${PUBLICO}.`);
