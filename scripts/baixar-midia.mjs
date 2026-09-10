/**
 * Baixa a mídia que as páginas publicadas referenciam, do origin antigo.
 *
 * **Precisa rodar numa máquina com acesso à internet aberta.** O contêiner do
 * agente não alcança `www.alupar.com.br` (cadeia TLS incompleta e 503
 * intermitente), e é por isso que este passo é local. É o que destrava o PR
 * #49: as três páginas Empresas reprovam o orçamento de peso porque servem
 * PNG em tamanho cheio direto do WordPress antigo.
 *
 * E é urgente por um motivo maior que o gate: **depois da virada esse origin
 * some, e a mídia vai com ele** (issue #26).
 *
 * A lista não é fixa — sai das próprias páginas que o mapa de rotas publica,
 * então acompanha o acervo em vez de envelhecer à parte.
 *
 *   node scripts/baixar-midia.mjs             # baixa o que falta
 *   node scripts/baixar-midia.mjs --listar    # só mostra o que baixaria
 *   node scripts/baixar-midia.mjs --verificar # confere o que já está aqui
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const DESTINO = 'acervo/midia';
const PREFIXO = { pt: '', en: '/en', es: '/es' };
const RAIZ = 'https://www.alupar.com.br/wp-content/uploads/';

/** O que é imagem entra no pipeline do Astro; o resto é arquivo a hospedar. */
const IMAGEM = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

const mapa = JSON.parse(await readFile('acervo/mapa-de-rotas.json', 'utf8'));
const publicadas = new Set(mapa.rotas.map((r) => r.rota));
const remapa = Object.fromEntries(mapa.remapados.map((r) => [r.de, r.para]));

const itens = (await readFile('acervo/conteudo-pronto.jsonl', 'utf8'))
  .trim().split('\n').map((l) => JSON.parse(l)).filter((i) => !i.vazio);

const urls = new Set();
for (const i of itens) {
  const bruta = `${PREFIXO[i.idioma] ?? ''}${i.caminho}`;
  if (!publicadas.has(remapa[bruta] ?? bruta)) continue;
  for (const m of i.corpo.matchAll(/(?:src|href)="(https:\/\/www\.alupar\.com\.br\/wp-content\/uploads\/[^"]+)"/gi)) {
    urls.add(m[1].split('?')[0]);
  }
}

const alvos = [...urls].sort().map((url) => ({
  url,
  caminho: join(DESTINO, decodeURIComponent(url.slice(RAIZ.length))),
  imagem: IMAGEM.test(url),
}));

const existe = async (p) => { try { return (await stat(p)).size; } catch { return 0; } };

if (process.argv.includes('--listar')) {
  for (const a of alvos) console.log(`${a.imagem ? 'imagem  ' : 'arquivo '} ${a.url}`);
  console.log(`\n${alvos.length} arquivos · ${alvos.filter((a) => a.imagem).length} imagens`);
  process.exit(0);
}

if (process.argv.includes('--verificar')) {
  const faltando = [];
  for (const a of alvos) if (!(await existe(a.caminho))) faltando.push(a.url);
  console.log(`referenciados: ${alvos.length} · presentes: ${alvos.length - faltando.length} · faltando: ${faltando.length}`);
  if (faltando.length) {
    console.error(`\nreprovado: ${faltando.length} arquivos ainda não foram baixados`);
    for (const u of faltando.slice(0, 10)) console.error(`  ${u}`);
    process.exit(1);
  }
  console.log('\naprovado: toda a mídia referenciada está no acervo.');
  process.exit(0);
}

let baixados = 0;
let pulados = 0;
const falhas = [];
let bytes = 0;

for (const [n, a] of alvos.entries()) {
  const rotulo = `[${String(n + 1).padStart(3)}/${alvos.length}]`;
  const ja = await existe(a.caminho);
  if (ja) { pulados += 1; bytes += ja; continue; }

  try {
    const r = await fetch(a.url);
    if (!r.ok) { falhas.push({ url: a.url, motivo: `HTTP ${r.status}` }); console.error(`${rotulo} ✘ ${r.status} ${a.url}`); continue; }
    const dados = Buffer.from(await r.arrayBuffer());
    await mkdir(dirname(a.caminho), { recursive: true });
    await writeFile(a.caminho, dados);
    baixados += 1;
    bytes += dados.length;
    console.log(`${rotulo} ✔ ${(dados.length / 1024).toFixed(0).padStart(6)} KB  ${a.caminho.replace(`${DESTINO}/`, '')}`);
  } catch (e) {
    falhas.push({ url: a.url, motivo: e.cause?.code ?? e.message });
    console.error(`${rotulo} ✘ ${e.cause?.code ?? e.message} ${a.url}`);
  }
}

console.log(`\nbaixados: ${baixados} · já presentes: ${pulados} · falhas: ${falhas.length}`);
console.log(`total no acervo: ${(bytes / 1024 / 1024).toFixed(1)} MB`);
if (falhas.length) {
  console.error('\nfalhas — rode de novo para tentar só o que faltou:');
  for (const f of falhas) console.error(`  ${f.motivo}  ${f.url}`);
  process.exit(1);
}
