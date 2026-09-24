/**
 * O robots.txt é o único arquivo do site que um buscador lê antes de tudo, e
 * era o que faltava: até 23/09/2026 o endereço servia só o preâmbulo dos
 * content signals da Cloudflare — vocabulário, sem nenhum sinal, sem agente e
 * sem o ponteiro do sitemap, que existe e responde 200.
 *
 * Estes testes olham o arquivo do repositório, não a rede: o que a borda serve
 * é conferido depois do deploy.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const robots = readFileSync('public/robots.txt', 'utf8');
const config = readFileSync('astro.config.mjs', 'utf8');
const site = /site:\s*'([^']+)'/.exec(config)?.[1];

test('o robots aponta o sitemap que o Astro gera, no domínio configurado', () => {
  assert.ok(site, 'astro.config.mjs sem `site` — o sitemap não teria domínio');
  assert.match(robots, new RegExp(`^Sitemap: ${site}/sitemap-index\\.xml$`, 'm'));
});

test('o robots declara um agente e libera o site', () => {
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
});

/* A linha `Content-Signal:` saiu em 24/09: o Lighthouse a reporta como erro de
   sintaxe, e o portão de SEO do CI reprovava em toda página. O preâmbulo de
   reserva de direitos fica; a diretiva, não. */
test('o robots não traz diretiva que o validador reporte como erro', () => {
  assert.doesNotMatch(robots, /^Content-Signal:/m);
});

test('o preâmbulo de reserva de direitos continua no arquivo', () => {
  assert.match(robots, /ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019\/790/);
});
