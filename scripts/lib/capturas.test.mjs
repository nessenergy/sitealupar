import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGINAS, LARGURAS, pares, relatorio } from './capturas.mjs';

test('um par por página e largura', () =>
  assert.equal(pares().length, PAGINAS.length * LARGURAS.length));

test('o site atual põe idioma em ?lang=; o novo, no prefixo', () => {
  const [p] = pares([['home-en', '/?lang=en', '/en/']], [390]);
  assert.equal(p.antigo.url, 'https://www.alupar.com.br/?lang=en');
  assert.equal(p.novo.url, 'https://sitealupar.pages.dev/en/');
  assert.equal(p.antigo.arquivo, 'home-en-390-antigo.png');
  assert.equal(p.novo.arquivo, 'home-en-390-novo.png');
});

test('o relatório põe os dois lados de cada par', () => {
  const html = relatorio(pares([['contato', '/contato/', '/contato/']], [1280]));
  assert.match(html, /contato-1280-antigo\.png/);
  assert.match(html, /contato-1280-novo\.png/);
});
