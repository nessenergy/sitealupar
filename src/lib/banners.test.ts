import { test } from 'node:test';
import assert from 'node:assert/strict';
import { telas } from './banners.ts';

const texto = (n: string) => ({ legenda: `#${n}`, alt: `alt ${n}`, href: null });

test('uma tela: sai uma, com imagem e texto casados', () => {
  const r = telas(['img-a'], [texto('A')], 'pt-br');
  assert.equal(r.length, 1);
  assert.deepEqual(r[0], { imagem: 'img-a', legenda: '#A', alt: 'alt A', href: null });
});

test('várias telas: a ordem das listas é a ordem das telas', () => {
  const r = telas(['img-a', 'img-b', 'img-c'], [texto('A'), texto('B'), texto('C')], 'pt-br');
  assert.deepEqual(r.map((t) => [t.imagem, t.alt]), [
    ['img-a', 'alt A'],
    ['img-b', 'alt B'],
    ['img-c', 'alt C'],
  ]);
});

/*
 * O caso que este arquivo existe para impedir: alguém acrescenta a imagem e
 * esquece o texto. Sem a checagem, o `map` casaria a segunda imagem com
 * `undefined` e a home publicaria um banner sem alt — acessibilidade quebrada
 * por uma peça que nenhum teste de página vê, porque a imagem está lá.
 */
test('mais imagens que textos: o build para, e a mensagem diz o que falta', () => {
  assert.throws(() => telas(['a', 'b'], [texto('A')], 'en'), (e: Error) => {
    assert.match(e.message, /rotativo de en/);
    assert.match(e.message, /2 imagem/);
    assert.match(e.message, /1 texto/);
    return true;
  });
});

test('mais textos que imagens: também para', () =>
  assert.throws(() => telas(['a'], [texto('A'), texto('B')], 'es'), /rotativo de es/));

test('nenhuma tela: para, porque a home ficaria sem banner', () =>
  assert.throws(() => telas([], [], 'pt-br'), /nenhuma tela/));
