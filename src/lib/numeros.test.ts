import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NUMEROS, OBSERVADO_EM } from './numeros.ts';

test('os quatro números do texto de 21/09/2026, e nenhum a mais', () => {
  assert.deepEqual(NUMEROS.map((n) => n.chave), ['sistemas', 'linhas', 'capacidade', 'paises']);
});

test('cada número tem valor, unidade e rótulo legível', () => {
  for (const n of NUMEROS) {
    assert.equal(typeof n.valor, 'number', `${n.chave} sem valor numérico`);
    assert.ok(n.unidade.length > 0, `${n.chave} sem unidade`);
    assert.ok(n.rotulo.length > 0, `${n.chave} sem rótulo`);
  }
});

test('a data de observação é a do texto que a Alupar enviou, em ISO', () => {
  assert.equal(OBSERVADO_EM, '2026-09-21');
});
