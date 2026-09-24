/**
 * Diz ao CI se o Lighthouse precisa rodar nesta mudança.
 *
 *   git diff --name-only <base>..<topo> | node scripts/afeta-o-site.mjs
 *
 * Imprime `true` ou `false` e sai com 0 nos dois casos — quem decide é o
 * workflow, lendo a saída. A regra, com o porquê de cada caminho, está em
 * `scripts/lib/afeta-o-site.mjs`, que tem teste.
 *
 * Sem entrada, imprime `true`: não saber o que mudou é motivo para medir, não
 * para pular.
 */
import { afetaOSite } from './lib/afeta-o-site.mjs';

const entrada = await new Promise((ok) => {
  let texto = '';
  if (process.stdin.isTTY) return ok('');
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { texto += d; });
  process.stdin.on('end', () => ok(texto));
});

const arquivos = entrada.split('\n').map((l) => l.trim()).filter(Boolean);
const roda = afetaOSite(arquivos);

console.error(
  arquivos.length
    ? `${arquivos.length} arquivo(s) mudaram; Lighthouse ${roda ? 'roda' : 'não roda'}`
    : 'sem lista de arquivos; Lighthouse roda',
);
console.log(String(roda));
