import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recentes } from './noticias.ts';

const n = (data: string | null) => ({ data });
const hoje = new Date('2026-09-10T12:00:00Z');

test('corta em 24 meses quando há notícias suficientes (D9)', () => {
  const lista = ['2026-09-01', '2026-06-01', '2026-01-01', '2025-06-01', '2025-01-01', '2024-10-01', '2024-01-01'].map(n);
  assert.deepEqual(
    recentes(lista, hoje).map((i) => i.data),
    ['2026-09-01', '2026-06-01', '2026-01-01', '2025-06-01', '2025-01-01', '2024-10-01'],
  );
});

test('abaixo do mínimo, completa com as mais recentes (decisão P2)', () => {
  const lista = ['2021-11-09', '2023-03-02', '2022-11-09', '2022-08-09', '2022-05-10', '2022-02-24', '2020-01-01'].map(n);
  assert.deepEqual(
    recentes(lista, hoje).map((i) => i.data),
    ['2023-03-02', '2022-11-09', '2022-08-09', '2022-05-10', '2022-02-24', '2021-11-09'],
  );
});

test('item sem data não entra', () => {
  assert.deepEqual(recentes([n('2026-01-01'), n(null)], hoje, 24, 1).map((i) => i.data), ['2026-01-01']);
});
