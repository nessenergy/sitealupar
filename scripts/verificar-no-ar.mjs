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
const baseHost = new URL(base).host;
const comBorda = baseHost === 'www.alupar.com.br';
const urls = JSON.parse(readFileSync('acervo/inventario.json', 'utf8'))
  .filter((e) => e.status === 200)
  .map((e) => new URL(e.url))
  .filter((u) => u.host === 'www.alupar.com.br' && (comBorda || !u.searchParams.has('lang')))
  .map((u) => `${base}${u.pathname}${u.search}`);

// 20 s por pedido: servidor que aceita a conexão e não responde vira falha
// reportada, em vez de pendurar o laço (e o job da sentinela) indefinidamente.
async function pedir(url, metodo) {
  return fetch(url, { method: metodo, redirect: 'manual', signal: AbortSignal.timeout(20_000) });
}

async function umHop(url) {
  let r = await pedir(url, 'HEAD');
  if (r.status === 405 || r.status === 403) {
    r = await pedir(url, 'GET'); // servidor que não aceita HEAD
    await r.body?.cancel();
  }
  return r;
}

/*
 * Segue os redirecionamentos à mão (redirect: 'manual'), hop a hop, em vez de
 * redirect: 'follow'. É o que permite parar assim que um hop sai do host
 * pedido — sem chegar a pedir nada ao terceiro. Desde a desativação da área
 * de notícias (D16), 301 de notícia manda para ri.alupar.com.br/noticias/,
 * portal de outra equipe, fora do nosso controle. Reprovar o merge porque o
 * servidor deles está fora do ar é o gate instável que este repositório já
 * recusa para link externo (.github/workflows/ci.yml, linhas ~130-132) — a
 * verificação daquele host é diária, em scripts/verificar-hosts.mjs.
 */
async function status(urlInicial) {
  let url = urlInicial;
  for (let hop = 0; hop < 10; hop++) {
    const r = await umHop(url);
    const local = r.headers.get('location');
    if (r.status >= 300 && r.status < 400 && local) {
      const destino = new URL(local, url);
      if (destino.host !== baseHost) return { externo: destino.href };
      url = destino.href;
      continue;
    }
    return { status: r.status, url };
  }
  throw new Error('excesso de redirecionamentos');
}

const falhas = [];
let externos = 0;
const fila = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let url = fila.shift(); url; url = fila.shift()) {
    try {
      const r = await status(url);
      if (r.externo) { externos++; continue; }
      if (r.status !== 200) falhas.push(`${r.status} ${url} → ${r.url}`);
    } catch (e) {
      falhas.push(`${e.cause?.code ?? e.message} ${url}`);
    }
  }
}));

/* Os dois arquivos da raiz que a borda pode sobrepor. O robots.txt do projeto
   só existe porque a Cloudflare servia o dela, e essa funcionalidade pode ser
   religada na zona a qualquer momento: sem esta conferência, o repositório
   ficaria verde para sempre com o buscador sem o ponteiro do sitemap e o
   llms.txt em 404 — que é exatamente o estado que este trabalho corrigiu. */
for (const [caminho, exige] of [['/robots.txt', 'Sitemap:'], ['/llms.txt', '# Alupar']]) {
  try {
    const r = await fetch(`${base}${caminho}`, { redirect: 'follow' });
    const corpo = r.ok ? await r.text() : '';
    if (!r.ok) falhas.push(`${r.status} ${base}${caminho}`);
    else if (!corpo.includes(exige)) falhas.push(`servido sem "${exige}": ${base}${caminho} — a borda está sobrepondo o arquivo do projeto`);
  } catch (e) {
    falhas.push(`${e.cause?.code ?? e.message} ${base}${caminho}`);
  }
}

console.log(`${urls.length} endereços pedidos a ${base}, mais /robots.txt e /llms.txt`);
if (externos) {
  console.log(`${externos} terminam fora de ${baseHost} (RI, D16) — informativo, não reprova; vigiado todo dia por scripts/verificar-hosts.mjs`);
}
if (falhas.length) {
  console.error(`reprovado: ${falhas.length} não terminam em 200`);
  for (const f of falhas.slice(0, 30)) console.error(`  ${f}`);
  process.exit(1);
}
console.log('aprovado: todos terminam em 200.');
