/**
 * Confere que a CSP de `public/_headers` permite todo recurso que o build usa.
 *
 * O Lighthouse do CI roda num servidor estático que NÃO aplica `_headers`:
 * uma imagem, vídeo, script ou iframe bloqueado pela CSP passa por todos os
 * gates e só aparece quebrado no site no ar. Aqui cada `img`, `srcset`,
 * `video`, `source`, `iframe`, `script`, folha de estilo e `form action` de
 * cada página de `dist/` é conferido contra a diretiva que o governa.
 *
 * O que este gate NÃO vê: o que nasce em tempo de execução. O iframe do
 * vídeo institucional é criado por public/js/site.js no clique, e o do
 * Turnstile pelo api.js da Cloudflare — nenhum dos dois está no HTML. Por
 * isso o `frame-src` precisa manter https://www.youtube-nocookie.com e
 * https://challenges.cloudflare.com mesmo que esta conferência passe sem eles.
 *
 *   npm run build && node scripts/verificar-csp.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { lerCsp, diretivas, fontesPara, permitido, recursos } from './lib/csp.mjs';

const DIST = 'dist';
const ORIGEM = 'https://www.alupar.com.br';

const csp = lerCsp(readFileSync('public/_headers', 'utf8'));
if (!csp) {
  console.error('reprovado: public/_headers não tem Content-Security-Policy na regra /*');
  process.exit(1);
}
const d = diretivas(csp);
const upgrade = 'upgrade-insecure-requests' in d;

const paginas = readdirSync(DIST, { recursive: true })
  .map((f) => f.replaceAll('\\', '/'))
  .filter((f) => f.endsWith('.html'));

let total = 0;
const externos = new Map(); // "diretiva host" → vezes, só para o relatório
const bloqueios = new Map(); // "diretiva host" → { diretiva, host, pagina, vezes }

for (const f of paginas) {
  const pagina = `/${f.replace(/index\.html$/, '')}`;
  for (const { diretiva, url } of recursos(readFileSync(join(DIST, f), 'utf8'))) {
    if (!URL.canParse(url, `${ORIGEM}${pagina}`)) continue; // o navegador também não carrega
    const u = new URL(url, `${ORIGEM}${pagina}`);
    const host = u.protocol === 'data:' ? 'data:' : u.host;
    const chave = `${diretiva} ${host}`;
    total += 1;
    if (permitido(u.href, fontesPara(d, diretiva), { origem: ORIGEM, upgrade })) {
      if (u.origin !== ORIGEM) externos.set(chave, (externos.get(chave) ?? 0) + 1);
      continue;
    }
    const b = bloqueios.get(chave) ?? { diretiva, host, pagina, vezes: 0 };
    b.vezes += 1;
    bloqueios.set(chave, b);
  }
}

console.log(`páginas: ${paginas.length} · recursos conferidos: ${total}`);
for (const [chave, n] of [...externos].sort()) console.log(`  ${String(n).padStart(5)}× ${chave}`);

if (bloqueios.size) {
  console.error(`\nreprovado: ${bloqueios.size} ${bloqueios.size === 1 ? 'origem bloqueada' : 'origens bloqueadas'} pela CSP de public/_headers`);
  for (const b of bloqueios.values()) {
    console.error(`  ${b.diretiva}: ${b.host} — ${b.vezes}×, por exemplo em ${b.pagina}`);
  }
  console.error('\ncorrige com: incluir a origem na diretiva certa em public/_headers, ou tirar o recurso do conteúdo');
  process.exit(1);
}
console.log('\naprovado: todo recurso do build é permitido pela CSP.');
