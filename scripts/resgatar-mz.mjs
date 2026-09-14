/**
 * Resgata tudo o que ainda vive na infraestrutura do fornecedor que está saindo.
 *
 * `baixar-midia.mjs` traz só o que as páginas publicadas referenciam — 123
 * arquivos. O site antigo serve mais: 201 endereços sob `/wp-content/uploads/`,
 * e **110 deles respondem 404 no site novo**, porque o 301 para o R2 promete o
 * que o bucket não tem. Some a isso os 61 documentos do gerenciador de arquivos
 * da MZ, que não têm endereço nosso nenhum e sustentam 51 páginas.
 *
 * Não é tarefa de implementação: é apólice, e ela vence sozinha no dia em que o
 * contrato com a MZ encerrar. Depois disso não há de onde baixar.
 *
 *   node scripts/resgatar-mz.mjs             # baixa o que falta
 *   node scripts/resgatar-mz.mjs --listar    # só mostra o que baixaria
 *   node scripts/resgatar-mz.mjs --verificar # confere o que já está em disco
 *
 * Idempotente: só baixa o que ainda não está em disco com o tamanho certo.
 * Rodar numa máquina com a mídia montada e internet aberta.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const DESTINO = 'acervo/midia';
/* Os documentos do gerenciador têm URL de UUID, sem caminho que sirva de chave.
   Ficam num prefixo próprio, com o nome que a própria origem declara. */
const PASTA_MZ = 'documentos-mz';
const MAPA = 'acervo/mz-arquivos.json';
const UPLOADS = '/wp-content/uploads/';
const AGENTE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';

const listar = process.argv.includes('--listar');
const verificar = process.argv.includes('--verificar');

/** Nome de arquivo seguro, preservando o que a origem chamou o documento. */
function nomeSeguro(bruto) {
  return decodeURIComponent(bruto)
    .replace(/["']/g, '')
    .replace(/[\\/:*?<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ── 1. Tudo o que o site antigo serve sob /wp-content/uploads/ ─────────── */
const inventario = JSON.parse(await readFile('acervo/midia.json', 'utf8'));
const alvos = new Map();
for (const item of inventario) {
  if (!item.url.includes(UPLOADS) || item.status !== 200 || !item.bytes) continue;
  const chave = decodeURIComponent(item.url.split(UPLOADS)[1]);
  // O mesmo arquivo aparece com e sem codificação percentual: a chave é o
  // caminho em disco, já decodificado, como em baixar-midia.mjs.
  if (!alvos.has(chave)) alvos.set(chave, { chave, url: item.url, bytes: item.bytes, origem: 'uploads' });
}

/* ── 2. Os documentos do gerenciador de arquivos da MZ ──────────────────── */
const corpo = await readFile('acervo/conteudo.jsonl', 'utf8');
const doGerenciador = new Set();
for (const m of corpo.matchAll(/https:\/\/api\.mziq\.com\/mzfilemanager\/[^"'<>\\ )]+/g)) {
  doGerenciador.add(m[0].replace(/&amp;/g, '&'));
}

/* O nome só aparece no cabeçalho da resposta, então precisa de uma ida à rede
   antes de saber onde gravar. Sem isso o resgate viraria um monte de UUID. */
const mzConhecidos = await readFile(MAPA, 'utf8').then(JSON.parse).catch(() => ({}));
for (const url of doGerenciador) {
  const ja = mzConhecidos[url];
  if (ja) { alvos.set(ja.chave, { chave: ja.chave, url, bytes: ja.bytes, origem: 'gerenciador', nome: ja.nome }); continue; }
  if (verificar) continue; // sem cabeçalho ainda: não dá para conferir o que nunca foi nomeado
  const r = await fetch(url, { method: 'HEAD', headers: { 'user-agent': AGENTE } }).catch(() => null);
  if (!r?.ok) { console.error(`  sem resposta ${r?.status ?? 'rede'} ${url.slice(-38)}`); continue; }
  const disp = r.headers.get('content-disposition') ?? '';
  const nome = nomeSeguro(disp.match(/filename\*?=(?:UTF-8'')?(.+)$/)?.[1] ?? `${url.split('/').pop()}.pdf`);
  const chave = `${PASTA_MZ}/${nome}`;
  mzConhecidos[url] = { chave, nome, bytes: Number(r.headers.get('content-length') ?? 0) };
  alvos.set(chave, { chave, url, bytes: mzConhecidos[url].bytes, origem: 'gerenciador', nome });
}
if (!verificar && !listar) await writeFile(MAPA, `${JSON.stringify(mzConhecidos, null, 1)}\n`);

/* ── 3. O que falta em disco ────────────────────────────────────────────── */
const tamanho = async (p) => { try { return (await stat(p)).size; } catch { return 0; } };
const MB = (b) => `${(b / 1048576).toFixed(1)} MB`;

const lista = [...alvos.values()].sort((a, b) => a.chave.localeCompare(b.chave));
const faltando = [];
for (const a of lista) {
  const local = await tamanho(join(DESTINO, a.chave));
  // Tamanho diferente conta como faltando: download truncado é pior que ausente.
  if (local !== a.bytes) faltando.push(a);
}

const total = faltando.reduce((s, a) => s + a.bytes, 0);
console.log(`${lista.length} arquivos no alvo · ${lista.length - faltando.length} já em disco · ${faltando.length} a baixar (${MB(total)})`);

if (listar) {
  for (const a of faltando) console.log(`  ${a.origem === 'uploads' ? 'uploads    ' : 'gerenciador'} ${a.chave}`);
  process.exit(0);
}
if (verificar) process.exit(faltando.length ? 1 : 0);

/* ── 4. Baixar ──────────────────────────────────────────────────────────── */
let feitos = 0;
const erros = [];
for (const a of faltando) {
  const destino = join(DESTINO, a.chave);
  await mkdir(dirname(destino), { recursive: true });
  let salvou = false;
  // Duas tentativas: a origem é um WordPress antigo e devolve 503 de vez em quando.
  for (let n = 0; n < 2 && !salvou; n++) {
    try {
      const r = await fetch(a.url, { headers: { 'user-agent': AGENTE }, signal: AbortSignal.timeout(180_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await writeFile(destino, Buffer.from(await r.arrayBuffer()));
      salvou = true;
    } catch (e) {
      if (n) erros.push(`${a.chave}: ${e.message}`);
    }
  }
  if (salvou && ++feitos % 10 === 0) console.log(`  ${feitos}/${faltando.length}`);
}

console.log(`\nbaixados: ${feitos} · falharam: ${erros.length}`);
for (const e of erros.slice(0, 20)) console.error(`  ${e}`);
process.exit(erros.length ? 1 : 0);
