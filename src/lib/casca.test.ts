// src/lib/casca.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import mapa from '../../acervo/mapa-de-rotas.json' with { type: 'json' };
import { ehCasca } from './casca.mjs';

test('anexo de vídeo ou PDF com poucas palavras é casca', () => {
  assert.equal(ehCasca({ tipo: 'faq', palavras: 1 }), true);
  assert.equal(ehCasca({ tipo: 'pagina', palavras: 1 }), true);
  assert.equal(ehCasca({ tipo: 'video', palavras: 1 }), true);
});

test('página curta de verdade não é casca: Compliance tem 17 palavras', () =>
  assert.equal(ehCasca({ tipo: 'pagina', palavras: 17 }), false));

test('outros tipos nunca são casca, mesmo curtos', () => {
  assert.equal(ehCasca({ tipo: 'noticia', palavras: 3 }), false);
  assert.equal(ehCasca({ tipo: 'politica-de-privacidade', palavras: 3 }), false);
});

test('no acervo real são 33 cascas, nenhuma de página institucional', () => {
  const cascas = mapa.rotas.filter(ehCasca).map((r) => r.rota);
  assert.equal(cascas.length, 33);
  for (const r of cascas) assert.doesNotMatch(r, /compliance|contato|sustentabilidade\/$|a-companhia|empresas\/$/, r);
});
