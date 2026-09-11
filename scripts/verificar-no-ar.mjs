/**
 * Continuidade medida no ar: cada endereço vivo do acervo, pedido ao domínio
 * de verdade, termina em 200 depois de seguir os 301. É a verificação da
 * virada e o critério do M5 — nenhum endereço antigo quebrado por 7 dias.
 *
 * Diferente de fechar-continuidade.mjs, que confere o build: aqui entram as
 * regras de borda (apex, ?lang=), que só existem em www.alupar.com.br. Contra
 * o pages.dev, os endereços com ?lang= ficam de fora — lá não há borda.
 *
 *   node scripts/verificar-no-ar.mjs                                # www.alupar.com.br
 *   node scripts/verificar-no-ar.mjs https://sitealupar.pages.dev   # antes da virada
 */
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'https://www.alupar.com.br';
const comBorda = new URL(base).host === 'www.alupar.com.br';
const urls = JSON.parse(readFileSync('acervo/inventario.json', 'utf8'))
  .filter((e) => e.status === 200)
  .map((e) => new URL(e.url))
  .filter((u) => u.host === 'www.alupar.com.br' && (comBorda || !u.searchParams.has('lang')))
  .map((u) => `${base}${u.pathname}${u.search}`);

// 20 s por pedido: servidor que aceita a conexão e não responde vira falha
// reportada, em vez de pendurar o laço (e o job da sentinela) indefinidamente.
async function status(url) {
  const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(20_000) });
  if (r.status !== 405 && r.status !== 403) return r;
  const g = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) }); // servidor que não aceita HEAD
  await g.body?.cancel();
  return g;
}

const falhas = [];
const fila = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let url = fila.shift(); url; url = fila.shift()) {
    try {
      const r = await status(url);
      if (r.status !== 200) falhas.push(`${r.status} ${url} → ${r.url}`);
    } catch (e) {
      falhas.push(`${e.cause?.code ?? e.message} ${url}`);
    }
  }
}));

console.log(`${urls.length} endereços pedidos a ${base}`);
if (falhas.length) {
  console.error(`reprovado: ${falhas.length} não terminam em 200`);
  for (const f of falhas.slice(0, 30)) console.error(`  ${f}`);
  process.exit(1);
}
console.log('aprovado: todos terminam em 200.');
