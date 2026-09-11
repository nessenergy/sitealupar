import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lerRegras, regraPara, servido, limitesDoPages } from './redirects.mjs';

const regras = lerRegras(`# comentário
/sustentabilidade-2/     /sustentabilidade/   301

/alupar-e-a-covid-19/*   /sustentabilidade/   301
`);

test('comentário e linha vazia não viram regra', () => assert.equal(regras.length, 2));

test('casa exato com e sem barra final', () => {
  assert.equal(regraPara(regras, '/sustentabilidade-2')?.destino, '/sustentabilidade/');
  assert.equal(regraPara(regras, '/sustentabilidade-2/')?.destino, '/sustentabilidade/');
});

test('curinga cobre a raiz e o que está abaixo, e só isso', () => {
  assert.ok(regraPara(regras, '/alupar-e-a-covid-19/'));
  assert.ok(regraPara(regras, '/alupar-e-a-covid-19/acoes/'));
  assert.equal(regraPara(regras, '/alupar-e-a-covid-19-outra/'), undefined);
});

test('diretório que só existe porque tem subpágina não conta como servido', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-'));
  mkdirSync(join(dist, 'grupo', 'sub'), { recursive: true });
  writeFileSync(join(dist, 'grupo', 'sub', 'index.html'), '');
  assert.equal(servido(dist, '/grupo/sub/'), true);
  assert.equal(servido(dist, '/grupo/'), false);
});

test('arquivo solto (sem index.html) conta como servido', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-'));
  writeFileSync(join(dist, 'robots.txt'), '');
  assert.equal(servido(dist, '/robots.txt'), true);
});

test('/404/ é servido por 404.html, que o Astro grava plano', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-'));
  writeFileSync(join(dist, '404.html'), '');
  assert.equal(servido(dist, '/404/'), true);
  assert.equal(servido(dist, '/404'), true);
});

const estatica = (i) => `/a${i}  /b${i}  301`;
const linhas = (n) => Array.from({ length: n }, (_, i) => estatica(i)).join('\n');

test('só regras estáticas: dinamicas 0, sem estouro', () => {
  const r = limitesDoPages(`# comentário\n\n${linhas(5)}\n`);
  assert.deepEqual(r, { estaticas: 5, dinamicas: 0, primeiraDinamica: null, estouro: false });
});

test('curinga no meio: tudo depois dele conta como dinâmica, mesmo sendo estático', () => {
  const texto = `${linhas(3)}\n/x/*  /y/  301\n${linhas(2)}`;
  const r = limitesDoPages(texto);
  assert.equal(r.estaticas, 3);
  assert.equal(r.dinamicas, 3);
  assert.equal(r.primeiraDinamica, 4);
  assert.equal(r.estouro, false);
});

test('placeholder também conta como dinâmica', () => {
  const texto = `${linhas(2)}\n/x/:nome  /y/:nome  301`;
  const r = limitesDoPages(texto);
  assert.equal(r.dinamicas, 1);
  assert.equal(r.primeiraDinamica, 3);
});

test('101 regras depois da primeira dinâmica: estoura o limite de dinâmicas', () => {
  const texto = `/x/*  /y/  301\n${linhas(100)}`;
  const r = limitesDoPages(texto);
  assert.equal(r.dinamicas, 101);
  assert.equal(r.estouro, true);
});

test('curingas só no fim: apenas eles contam como dinâmica', () => {
  const texto = `${linhas(400)}\n/x/*  /y/  301\n/z/*  /w/  301`;
  const r = limitesDoPages(texto);
  assert.equal(r.estaticas, 400);
  assert.equal(r.dinamicas, 2);
  assert.equal(r.primeiraDinamica, 401);
  assert.equal(r.estouro, false);
});

test('limite de estáticas: 2000 não estoura, 2001 estoura', () => {
  assert.equal(limitesDoPages(linhas(2000)).estouro, false);
  assert.equal(limitesDoPages(linhas(2001)).estouro, true);
});
