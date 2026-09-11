/**
 * Toda URL viva do site atual resolve no site novo — por página ou por 301.
 *
 * O mapa de rotas (#47) confere que cada 301 cai numa página; o verificador de
 * links, que cada link do build resolve. Nenhum dos dois pergunta o contrário:
 * cada endereço que responde 200 hoje continua respondendo depois da virada?
 * Na primeira medição, 254 dos 666 não continuavam.
 *
 * `?lang=en|es` segue o que as regras de borda farão (infra/redirect-rules.md):
 * vira `/en` ou `/es` + o mesmo caminho, e é esse caminho que precisa resolver.
 *
 * Os 301 vão num bloco próprio do `_redirects`, ACIMA da marca do
 * gerar-redirecionamentos.mjs — ele preserva tudo o que está acima dela.
 *
 *   npm run build && node scripts/fechar-continuidade.mjs   # reescreve o bloco
 *   node scripts/fechar-continuidade.mjs --verificar         # CI, depois do build
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { lerRegras, regraPara, servido, limitesDoPages } from './lib/redirects.mjs';
import { destino } from './lib/continuidade.mjs';

const INICIO = '# ─── continuidade: gerado por scripts/fechar-continuidade.mjs ───';
const FIM = '# ─── continuidade: fim ───';
const MARCA = '# ─── gerado por scripts/gerar-redirecionamentos.mjs ───';
const verificar = process.argv.includes('--verificar');

const atual = readFileSync('public/_redirects', 'utf8');
const semBloco = atual.replace(new RegExp(`${INICIO}[\\s\\S]*?${FIM}\\n*`), '');
const regras = lerRegras(verificar ? atual : semBloco);
const resolve = (c) => servido('dist', c) || Boolean(regraPara(regras, c));

const PREFIXO = { pt: '', en: '/en', es: '/es' };
const tipos = new Map(
  readFileSync('acervo/conteudo.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l))
    .map((i) => [`${PREFIXO[i.idioma]}${i.caminho}`, i.anexo ? 'anexo' : i.tipo]),
);

const faltam = new Map();
for (const { url, status } of JSON.parse(readFileSync('acervo/inventario.json', 'utf8'))) {
  if (status !== 200) continue;
  const u = new URL(url);
  if (u.host !== 'www.alupar.com.br') continue;
  const lang = u.searchParams.get('lang');
  const caminho = lang === 'en' || lang === 'es' ? `/${lang}${u.pathname}` : u.pathname;
  if (!resolve(caminho)) faltam.set(caminho, tipos.get(caminho));
}

const limites = limitesDoPages(atual);

if (verificar) {
  if (limites.estouro) {
    console.error(
      `reprovado: _redirects estoura o limite do Pages ` +
        `(${limites.estaticas} estáticas, ${limites.dinamicas} dinâmicas; ` +
        `primeira dinâmica na regra ${limites.primeiraDinamica})`,
    );
    console.error('dica: regras dinâmicas vão no bloco final do _redirects');
    process.exit(1);
  }
  if (faltam.size) {
    console.error(`reprovado: ${faltam.size} endereços vivos hoje deixariam de responder`);
    for (const c of [...faltam.keys()].slice(0, 20)) console.error(`  ${c}`);
    console.error('\ncorrige com: npm run build && node scripts/fechar-continuidade.mjs');
    process.exit(1);
  }
  console.log(
    `aprovado: todo endereço vivo do acervo resolve, por página ou por 301 ` +
      `(${limites.estaticas} estáticas, ${limites.dinamicas} dinâmicas).`,
  );
  process.exit(0);
}

// O destino tem de ser página servida, não outro 301: gerar-mapa-de-rotas.mjs
// --verificar reprova 301 cujo destino não é rota, e cadeia de 301 é salto a mais.
const servida = (c) => servido('dist', c);
const linhas = [...faltam]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([c, tipo]) => `${c}  ${destino(c, tipo, servida)}  301`);
const bloco = [
  INICIO,
  `# ${linhas.length} endereços vivos sem página no site novo, medidos contra o build.`,
  '# Anexo e casca vazia → ancestral que resolve; notícia → listagem; vídeo → /videos/.',
  ...linhas,
  FIM,
].join('\n');

const [antes, depois] = semBloco.split(MARCA);
if (depois === undefined) throw new Error('marca do gerar-redirecionamentos.mjs não encontrada no _redirects');
const final = `${antes.trimEnd()}\n\n${bloco}\n\n${MARCA}${depois}`;
writeFileSync('public/_redirects', final);
const limitesFinais = limitesDoPages(final);
console.log(`escrito: ${linhas.length} regras de continuidade`);
console.log(`_redirects: ${limitesFinais.estaticas} estáticas, ${limitesFinais.dinamicas} dinâmicas.`);
