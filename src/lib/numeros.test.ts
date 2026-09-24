import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NUMEROS, OBSERVADO_EM } from './numeros.ts';

test('os quatro números do texto de 21/09/2026, e nenhum a mais', () => {
  assert.deepEqual(NUMEROS.map((n) => n.chave), ['sistemas', 'linhas', 'capacidade', 'paises']);
});

test('cada número tem valor, rótulo e o tipo de limite que a fonte declara', () => {
  for (const n of NUMEROS) {
    assert.equal(typeof n.valor, 'number', `${n.chave} sem valor numérico`);
    assert.ok(n.rotulo.length > 0, `${n.chave} sem rótulo`);
    assert.ok(['exato', 'minimo', 'maximo'].includes(n.tipo), `${n.chave} com tipo inválido`);
  }
});

/* O texto da Alupar diz "mais de 10 mil km" e "quase 800 MW": são limites, não
   valores. Publicar 10000 e 800 como exatos é inventar precisão — e para cima. */
test('os dois números que a fonte dá como limite não são exatos', () => {
  assert.equal(NUMEROS.find((n) => n.chave === 'linhas')?.tipo, 'minimo');
  assert.equal(NUMEROS.find((n) => n.chave === 'capacidade')?.tipo, 'maximo');
});

test('contagem não tem unidade de medida; km e MW têm', () => {
  assert.equal(NUMEROS.find((n) => n.chave === 'sistemas')?.unidade, '');
  assert.equal(NUMEROS.find((n) => n.chave === 'paises')?.unidade, '');
  assert.equal(NUMEROS.find((n) => n.chave === 'linhas')?.unidade, 'km');
  assert.equal(NUMEROS.find((n) => n.chave === 'capacidade')?.unidade, 'MW');
});

test('a data de observação é a do texto que a Alupar enviou, em ISO', () => {
  assert.equal(OBSERVADO_EM, '2026-09-21');
});
