import { test } from 'node:test';
import assert from 'node:assert/strict';
import { degraus } from './trilha.ts';

/* Rotas reais do acervo, não inventadas: a regra depende do mapa, e um caso
   de mentira passaria sem dizer nada sobre o site. `/faq/…-2/aqualuz_baixa2/`
   é uma das 26 rotas com página-mãe publicada; `/faq/projetos-…/` é uma das
   340 sem — `/faq/` não é página. */
const COM_MAE = '/faq/respeito-com-a-comunidade-2/aqualuz_baixa2/';
const MAE = '/faq/respeito-com-a-comunidade-2/';
const SEM_MAE = '/faq/projetos-de-pd-em-andamento/';

test('a mãe publicada entra como degrau do meio, com o título do mapa', () => {
  const t = degraus(COM_MAE, 'pt-br', 'Aqualuz_baixa2');
  assert.deepEqual(t.map((d) => d.rota), ['/', MAE, undefined]);
  assert.equal(t[1].titulo, 'Respeito com a Comunidade / Projetos Sociais Apoiados pela Alupar');
});

test('mãe que não é página não vira degrau — a trilha pula de /faq/ à página', () => {
  const t = degraus(SEM_MAE, 'pt-br', 'Projetos de P&D em Andamento');
  assert.deepEqual(t.map((d) => d.rota), ['/', undefined]);
  assert.equal(t.at(-1)?.titulo, 'Projetos de P&D em Andamento');
});

test('a página atual não é link para si mesma', () => {
  for (const caminho of [COM_MAE, SEM_MAE]) {
    const ultimo = degraus(caminho, 'pt-br', 'Título').at(-1);
    assert.equal(ultimo?.rota, undefined);
    assert.equal(ultimo?.titulo, 'Título');
  }
});

test('cada idioma começa na sua home, com o nome dela, e mantém o prefixo', () => {
  const esperado = [
    ['pt-br', '', '/', 'Início'],
    ['en', '/en', '/en/', 'Home'],
    ['es', '/es', '/es/', 'Inicio'],
  ] as const;

  for (const [idioma, pre, home, nome] of esperado) {
    const t = degraus(`${pre}${COM_MAE}`, idioma, 'Aqualuz_baixa2');
    assert.deepEqual(t.map((d) => d.rota), [home, `${pre}${MAE}`, undefined]);
    assert.equal(t[0].titulo, nome);
  }
});
