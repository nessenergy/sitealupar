import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destino, LISTAGEM_DO_RI } from './continuidade.mjs';

const existe = new Set(['/', '/en/', '/a-companhia/', '/videos/']);
const resolve = (c) => existe.has(c);

test('anexo vai para a página-mãe', () =>
  assert.equal(destino('/a-companhia/img-a-companhia/', 'anexo', resolve), '/a-companhia/'));

test('sobe até o ancestral que resolve', () =>
  assert.equal(destino('/a-companhia/x/y/', undefined, resolve), '/a-companhia/'));

test('sem ancestral que resolva, home do idioma', () =>
  assert.equal(destino('/en/company/img-a-companhia-eng/', 'anexo', resolve), '/en/'));

test('notícia vai para a listagem do portal de RI, não para uma página nossa', () => {
  const resolve = () => {
    throw new Error('não deve consultar o build para uma notícia');
  };
  assert.equal(destino('/noticia/ata-da-assembleia/', 'noticia', resolve), LISTAGEM_DO_RI);
  assert.equal(destino('/en/noticia/2q22-earnings-release/', 'noticia', resolve), LISTAGEM_DO_RI);
  assert.equal(destino('/es/noticia/3q17-earnings-release/', 'noticia', resolve), LISTAGEM_DO_RI);
});

test('a listagem do RI é absoluta: o destino sai do nosso domínio', () => {
  assert.match(LISTAGEM_DO_RI, /^https:\/\/ri\.alupar\.com\.br\//);
});

test('qualquer coisa sob /video/ vai para a listagem de vídeos', () =>
  assert.equal(destino('/video/video-institucional/institucionalalupar-1/', 'anexo', resolve), '/videos/'));

test('nunca aponta para si mesmo', () =>
  assert.equal(destino('/videos/', 'pagina', (c) => c === '/' || c === '/videos/'), '/'));
