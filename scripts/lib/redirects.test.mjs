import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lerRegras, regraPara, servido } from './redirects.mjs';

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
