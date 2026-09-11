/**
 * Decide quais itens do acervo viram rota, em que caminho, e prova que o mapa
 * fecha com o mapa de 301. Produz `acervo/mapa-de-rotas.json`.
 *
 * Existe porque "gerar as páginas" esconde decisões que não são do template: o
 * que é conteúdo e o que é resto do WordPress, qual o caminho de cada idioma, e
 * o que já foi aposentado por 301.
 *
 * A regra que manda aqui está na documentação da Cloudflare: **"redirects are
 * always followed, regardless of whether or not an asset matches the incoming
 * request"**. Duas consequências, e as duas são checadas:
 *
 * 1. Rota que também é fonte de 301 nunca chega a ser servida. Não é defeito —
 *    é o item aposentado de propósito. Então ela não vira página, e o motivo
 *    fica registrado em vez de a página nascer publicada e invisível.
 * 2. 301 com destino interno que não existe como rota vira **404 com desvio**:
 *    pior que o 404 direto, porque some do relatório de links quebrados. Isso
 *    reprova.
 *
 *   node scripts/gerar-mapa-de-rotas.mjs
 *   node scripts/gerar-mapa-de-rotas.mjs --verificar
 */
import { readFile, writeFile } from 'node:fs/promises';
import { ROTAS_PROPRIAS } from '../src/lib/rotas-proprias.mjs';

const ENTRADA = 'acervo/conteudo-pronto.jsonl';
const SAIDA = 'acervo/mapa-de-rotas.json';

/** `idioma` no acervo vem como `pt`; a rota padrão não leva prefixo (D14). */
const PREFIXO = { pt: '', en: '/en', es: '/es' };

/*
 * O que não vira página, e por quê. São restos do WordPress, não conteúdo:
 * publicá-los daria ao site novo as mesmas URLs indexáveis sem valor que o
 * atual tem.
 */
const DESCARTES = [
  { id: 'arquivo-por-data', porque: 'arquivo de data do WordPress, não página de conteúdo', teste: (i) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(i.caminho) },
  { id: 'taxonomia', porque: 'página de categoria gerada pelo WordPress', teste: (i) => i.tipo === 'category' },
];

/*
 * Item publicado em caminho diferente do de origem.
 *
 * O comentário no `public/_redirects` já avisava: `/sustentabilidade-2/` passa
 * a redirecionar e a página canônica passa a ser `/sustentabilidade/` — "isso
 * **exige** que a página exista com esse caminho; se ela não for criada, o
 * redirecionamento acima aponta para um 404". É este remapa que a cria.
 *
 * A origem é o mais completo dos três candidatos em português:
 * `/sustentabilidade-2/` tem 1.315 palavras, contra 1.146 em
 * `/group/sustentabilidade/` e 123 em `/faq/sustentabilidade-2/`.
 */
const REMAPA = [
  { idioma: 'pt', de: '/sustentabilidade-2/', para: '/sustentabilidade/', porque: 'canônica exigida pelo mapa de 301' },
];

/*
 * Destinos de 301 que existem, mas não como página de conteúdo. Ficam
 * declarados para que o gate continue reprovando qualquer destino quebrado NOVO
 * em vez de ser afrouxado até não pegar mais nada.
 */
const NAO_SAO_PAGINAS = {
  '/feed': 'feed RSS, gerado pelo build e não pelo mapa de rotas',
  '/sitemap-index.xml': 'índice de sitemap, gerado por @astrojs/sitemap',
};

const normal = (p) => p.replace(/\/+$/, '') || '/';

/** Regras do `_redirects`, com curinga — `/x/*` cobre tudo abaixo de `/x/`. */
const regras = (await readFile('public/_redirects', 'utf8'))
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [origem, destino] = l.split(/\s+/);
    return { origem, destino, prefixo: origem.endsWith('*') ? normal(origem.slice(0, -1)) : null };
  });

const regraQueCobre = (rota) => {
  const n = normal(rota);
  return regras.find((r) => (r.prefixo ? n === r.prefixo || n.startsWith(`${r.prefixo}/`) : normal(r.origem) === n));
};

const itens = (await readFile(ENTRADA, 'utf8')).trim().split('\n').map((l) => JSON.parse(l)).filter((i) => !i.vazio);

const rotas = [];
const descartados = [];
const remapados = [];
for (const i of itens) {
  const rm = REMAPA.find((r) => r.idioma === i.idioma && r.de === i.caminho);
  const rota = `${PREFIXO[i.idioma] ?? ''}${rm ? rm.para : i.caminho}`;
  if (rm) remapados.push({ de: `${PREFIXO[i.idioma] ?? ''}${rm.de}`, para: rota, porque: rm.porque });
  const motivo = DESCARTES.find((d) => d.teste(i));
  if (motivo) {
    descartados.push({ rota, motivo: motivo.id, porque: motivo.porque });
    continue;
  }
  const r = regraQueCobre(rota);
  if (r) {
    descartados.push({ rota, motivo: 'coberto-por-301', porque: `aposentado: ${r.origem} → ${r.destino}` });
    continue;
  }
  rotas.push({ rota, idioma: i.idioma, tipo: i.tipo, slug: i.slug, titulo: i.titulo, data: i.data, palavras: i.palavras });
}

/* Duas rotas idênticas: a segunda sobrescreveria a primeira sem aviso. */
const porRota = new Map();
for (const r of rotas) porRota.set(r.rota, [...(porRota.get(r.rota) ?? []), r]);
const colisoes = [...porRota].filter(([, v]) => v.length > 1).map(([rota, v]) => ({ rota, itens: v.map((r) => `${r.idioma}:${r.slug}`) }));

/* 301 interno cujo destino não existe: 404 com desvio, que some do relatório. */
/* As três homes e as páginas de `src/pages/` existem fora do mapa — mas são
   destino válido. A lista é a mesma que o Base.astro usa para o hreflang. */
const existe = new Set([
  ...[...porRota.keys()].map(normal),
  ...Object.values(PREFIXO).map((p) => normal(p || '/')),
  ...ROTAS_PROPRIAS.map(normal),
]);
const destinosQuebrados = regras
  .filter((r) => r.destino.startsWith('/'))
  .map((r) => ({ ...r, alvo: normal(r.destino.replace(/:splat.*$/, '')) }))
  .filter((r) => r.alvo !== '/' && !existe.has(r.alvo) && !(r.alvo in NAO_SAO_PAGINAS))
  .map((r) => ({ origem: r.origem, destino: r.destino }));

const conta = (campo) => rotas.reduce((a, r) => ({ ...a, [r[campo]]: (a[r[campo]] ?? 0) + 1 }), {});
const porMotivo = descartados.reduce((a, d) => ({ ...a, [d.motivo]: (a[d.motivo] ?? 0) + 1 }), {});

console.log(`itens com corpo: ${itens.length}`);
console.log(`rotas: ${rotas.length} · descartadas: ${descartados.length} ${JSON.stringify(porMotivo)}`);
console.log(`por idioma: ${JSON.stringify(conta('idioma'))}`);
console.log(`por tipo: ${JSON.stringify(conta('tipo'))}`);
console.log(`colisões: ${colisoes.length} · 301 com destino inexistente: ${destinosQuebrados.length}`);

if (process.argv.includes('--verificar')) {
  const falhas = [];
  if (colisoes.length) falhas.push(`${colisoes.length} rotas duplicadas: ${colisoes.slice(0, 5).map((c) => c.rota).join(', ')}`);
  if (destinosQuebrados.length) falhas.push(`${destinosQuebrados.length} ${destinosQuebrados.length === 1 ? 'regra de 301 aponta' : 'regras de 301 apontam'} para rota que não existe:${destinosQuebrados.slice(0, 5).map((d) => `${d.origem} → ${d.destino}`).join(', ')}`);
  if (falhas.length) {
    console.error(`\nreprovado:\n${falhas.map((f) => `  - ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('\naprovado: sem rota duplicada e todo 301 interno cai em rota existente.');
} else {
  await writeFile(SAIDA, `${JSON.stringify({ geradoEm: new Date().toISOString(), total: rotas.length, porIdioma: conta('idioma'), porTipo: conta('tipo'), colisoes, destinosQuebrados, remapados, descartados, rotas }, null, 2)}\n`);
  console.log(`\nescrito: ${SAIDA}`);
}
