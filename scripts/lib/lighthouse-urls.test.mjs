/**
 * As URLs do Lighthouse existem como página.
 *
 * Uma delas (`/sustentabilidade/`) virou 301 em 23/09/2026 e deixou de ser
 * gerada. O `lhci collect` não avisa que uma URL da lista sumiu: ele falha a
 * execução inteira com "unable to reliably load the page (Status code: 404)",
 * seis minutos depois do início, e nenhuma das outras quinze chega a ser
 * medida. Aqui a mesma falha custa dois segundos, antes do build.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const rotas = new Set(
  JSON.parse(readFileSync('acervo/mapa-de-rotas.json', 'utf8')).rotas.map((r) => r.rota),
);

/** Página própria em src/pages: `/en/videos/` → src/pages/en/videos/index.astro. */
const temPaginaPropria = (rota) => existsSync(`src/pages${rota}index.astro`);

for (const arquivo of ['lighthouserc.json', 'lighthouserc.mobile.json']) {
  test(`toda URL de ${arquivo} é uma página gerada`, () => {
    const urls = JSON.parse(readFileSync(arquivo, 'utf8')).ci.collect.url;
    assert.ok(urls.length > 0, `${arquivo} sem URL nenhuma`);
    for (const url of urls) {
      const rota = new URL(url).pathname.replace(/index\.html$/, '');
      assert.ok(
        rotas.has(rota) || temPaginaPropria(rota),
        `${arquivo}: ${rota} não é rota do acervo nem página própria — o lhci vai parar em 404`,
      );
    }
  });
}
