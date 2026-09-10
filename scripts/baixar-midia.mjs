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

/*
 * O mesmo arquivo aparece duas vezes quando o conteúdo o referencia uma vez com
 * o caminho percentualmente codificado e outra sem — `Aves-de-S%C3%A3o…` e
 * `Aves-de-São…`. São endereços diferentes e **o mesmo arquivo**, então contar
 * por URL inflava o total: 118 endereços, 116 arquivos.
 *
 * A chave passa a ser o caminho em disco, já decodificado. Não é cosmético —
 * era ele que fazia o relatório prometer mais do que existe.
 */
const porCaminho = new Map();
for (const url of [...urls].sort()) {
  const caminho = join(DESTINO, decodeURIComponent(url.slice(RAIZ.length)));
  if (!porCaminho.has(caminho)) porCaminho.set(caminho, { url, caminho, imagem: IMAGEM.test(url) });
}
const alvos = [...porCaminho.values()];

/*
 * Arquivo que a origem já não tem.
 *
 * Não é falha do download nem regressão da migração: o link **já está quebrado
 * no site de hoje**, e isso ficou registrado na verificação do #42. Sem
 * declarar, `--verificar` reprovaria para sempre por algo que nenhuma
 * reexecução resolve — e gate que não pode passar é gate que se aprende a
 * ignorar.
 */
const AUSENTES = [
  {
    url: `${RAIZ}sites/7/2017/08/ENG-Alupar_Release-2Q17-ENG.pdf`,
    porque: 'HTTP 404 na origem e no CDN, sem captura no Wayback',
    onde: '/noticia/divulgacao-de-resultados-do-2t17/ em inglês e espanhol',
    decisao: 'pedir o arquivo ao RI, ou remover o link — pendência de conteúdo, não de migração',
  },
];
const ausente = (url) => AUSENTES.find((a) => a.url === url);

const existe = async (p) => { try { return (await stat(p)).size; } catch { return 0; } };

const MB = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const tipoDe = (p) => (p.match(/\.([a-z0-9]+)$/i)?.[1] ?? '?').toLowerCase();

if (process.argv.includes('--listar')) {
  for (const a of alvos) console.log(`${a.imagem ? 'imagem  ' : 'arquivo '} ${a.url}`);
  console.log(`\n${alvos.length} arquivos · ${alvos.filter((a) => a.imagem).length} imagens`);
  process.exit(0);
}

if (process.argv.includes('--verificar')) {
  const faltando = [];
  const declarados = [];
  const porTipo = {};

  for (const a of alvos) {
    const tam = await existe(a.caminho);
    if (!tam) { (ausente(a.url) ? declarados : faltando).push(a.url); continue; }
    const t = tipoDe(a.caminho);
    porTipo[t] ??= { n: 0, bytes: 0 };
    porTipo[t].n += 1;
    porTipo[t].bytes += tam;
  }

  const total = Object.values(porTipo).reduce((s, x) => s + x.bytes, 0);
  const presentes = Object.values(porTipo).reduce((s, x) => s + x.n, 0);

  console.log(`referenciados: ${alvos.length} · presentes: ${presentes} · declarados ausentes: ${declarados.length} · faltando: ${faltando.length}`);
  console.log(`\npeso no acervo — é o que decide onde cada tipo vai morar no build:`);
  for (const [t, x] of Object.entries(porTipo).sort((a, b) => b[1].bytes - a[1].bytes)) {
    console.log(`  ${String(x.n).padStart(3)} × .${t.padEnd(4)} ${MB(x.bytes).padStart(9)}`);
  }
  console.log(`  ${String(presentes).padStart(3)} × total  ${MB(total).padStart(9)}`);

  if (declarados.length) {
    console.log(`\nausentes na origem, declarados e não reprovados:`);
    for (const a of AUSENTES.filter((x) => declarados.includes(x.url))) {
      console.log(`  ${a.url.slice(RAIZ.length)}`);
      console.log(`    ${a.porque}`);
      console.log(`    em ${a.onde}`);
      console.log(`    ${a.decisao}`);
    }
  }

  if (faltando.length) {
    console.error(`\nreprovado: ${faltando.length} arquivos ainda não foram baixados`);
    for (const u of faltando.slice(0, 10)) console.error(`  ${u}`);
    process.exit(1);
  }
  console.log('\naprovado: toda a mídia que a origem ainda serve está no acervo.');
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
