/**
 * Adiamento do Turnstile em `public/js/site.js`.
 *
 * Esse arquivo é servido cru ao navegador: não é módulo, não exporta nada e
 * não passa pelo build — então não há como importá-lo. O teste lê o TEXTO do
 * arquivo e o executa com `node:vm` contra um DOM de mentira escrito aqui, com
 * o mínimo que o script toca. Sem dependência nova: nada de jsdom.
 *
 * Mora em `scripts/lib/` porque é onde o `npm test` já procura teste em JS
 * puro (`scripts/lib/*.test.mjs`); o que ele testa é `public/js/site.js`, que
 * não pode hospedar o próprio teste — tudo em `public/` é copiado para `dist/`
 * e iria publicado.
 *
 * O que está sob teste é QUANDO o widget começa a carregar: o api.js da
 * Cloudflare não pode ser pedido na carga da página (ele puxa por dentro de si
 * ~580 KB que estouravam o teto de peso do CI) e tem de ser pedido uma única
 * vez na primeira interação com o formulário. Quem garante o antispam de
 * verdade é `functions/api/contato.ts`, que recusa envio sem token válido —
 * este arquivo decide só o momento. Ainda assim é caminho de segurança: uma
 * limpeza distraída aqui (no bloco do vídeo logo abaixo, por exemplo) deixaria
 * o formulário sem widget, e sem isto no CI ninguém veria.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const CODIGO = readFileSync(new URL('../../public/js/site.js', import.meta.url), 'utf8');
const URL_TURNSTILE = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const GATILHOS = ['focusin', 'pointerdown', 'touchstart'];

/**
 * Monta o DOM de mentira e roda `site.js` nele.
 *
 * Devolve o que o navegador observaria de fora: os scripts que foram
 * acrescentados ao `<head>`, os ouvintes que ficaram registrados no formulário
 * e um `disparar` que chama os ouvintes de um tipo, como um evento de verdade.
 */
function montar({ comWidget = true } = {}) {
  const scripts = [];
  const ouvintes = [];
  const form = {
    addEventListener(tipo, fn) {
      ouvintes.push({ tipo, fn });
    },
    removeEventListener(tipo, fn) {
      const i = ouvintes.findIndex((o) => o.tipo === tipo && o.fn === fn);
      if (i >= 0) ouvintes.splice(i, 1);
    },
  };
  const container = { closest: (seletor) => (seletor === 'form' ? form : null) };
  const document = {
    // Só o container do widget é encontrado; o resto do site.js (botão do menu,
    // links de vídeo) não acha nada e fica quieto, que é o caso desta página.
    querySelector: (seletor) => (seletor === '.cf-turnstile' && comWidget ? container : null),
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({}),
    head: { append: (elemento) => scripts.push(elemento) },
  };
  runInContext(CODIGO, createContext({ document }), { filename: 'public/js/site.js' });
  const disparar = (tipo) => {
    // Cópia da lista: o ouvinte se desregistra enquanto ela é percorrida.
    for (const o of [...ouvintes]) if (o.tipo === tipo) o.fn();
  };
  return { scripts, ouvintes, disparar };
}

test('na carga da página, nenhum script de terceiro é acrescentado', () => {
  const { scripts, ouvintes } = montar();
  assert.deepEqual(scripts, [], 'o api.js não pode ser pedido antes da interação');
  assert.deepEqual(
    ouvintes.map((o) => o.tipo).sort(),
    [...GATILHOS].sort(),
    'os três gatilhos ficam armados no formulário',
  );
});

for (const gatilho of GATILHOS) {
  test(`${gatilho} no formulário carrega o api.js uma vez`, () => {
    const { scripts, disparar } = montar();
    disparar(gatilho);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, URL_TURNSTILE);
    assert.equal(scripts[0].async, true);
    assert.equal(scripts[0].defer, true);
  });
}

test('o mesmo gatilho repetido não acrescenta um segundo script', () => {
  const { scripts, disparar } = montar();
  disparar('focusin');
  disparar('focusin');
  disparar('focusin');
  assert.equal(scripts.length, 1);
});

test('pointerdown seguido de focusin acrescenta um script só', () => {
  const { scripts, ouvintes, disparar } = montar();
  disparar('pointerdown');
  disparar('focusin');
  for (const g of GATILHOS) disparar(g);
  assert.equal(scripts.length, 1, 'o toque no botão e o foco no campo não pedem o script duas vezes');
  assert.equal(ouvintes.length, 0, 'o formulário não fica com ouvintes pendurados depois de carregar');
});

test('página sem o container do widget não registra nada e não quebra', () => {
  const { scripts, ouvintes } = montar({ comWidget: false });
  assert.deepEqual(ouvintes, [], 'nas outras 399 páginas nada é armado');
  assert.deepEqual(scripts, []);
});
