// src/lib/videos.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { semTituloRepetido } from './videos.ts';

test('mantém a ordem e a primeira ocorrência de cada título', () =>
  assert.deepEqual(
    semTituloRepetido([
      { titulo: 'ALUPAR INSTITUCIONAL 2017_edit', rota: '/a/' },
      { titulo: 'institucional', rota: '/b/' },
      { titulo: 'ALUPAR INSTITUCIONAL 2017_edit', rota: '/c/' },
    ]),
    [{ titulo: 'ALUPAR INSTITUCIONAL 2017_edit', rota: '/a/' }, { titulo: 'institucional', rota: '/b/' }],
  ));

test('espaço nas pontas e caixa não criam título novo', () =>
  assert.equal(semTituloRepetido([{ titulo: 'Vídeo' }, { titulo: ' vídeo ' }]).length, 1));

test('lista vazia passa', () => assert.deepEqual(semTituloRepetido([]), []));
