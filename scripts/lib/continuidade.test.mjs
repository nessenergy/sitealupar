import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destino } from './continuidade.mjs';

const existe = new Set(['/', '/en/', '/a-companhia/', '/noticias/', '/en/noticias/', '/videos/']);
const resolve = (c) => existe.has(c);

test('anexo vai para a página-mãe', () =>
  assert.equal(destino('/a-companhia/img-a-companhia/', 'anexo', resolve), '/a-companhia/'));

test('sobe até o ancestral que resolve', () =>
  assert.equal(destino('/a-companhia/x/y/', undefined, resolve), '/a-companhia/'));

test('sem ancestral que resolva, home do idioma', () =>
  assert.equal(destino('/en/company/img-a-companhia-eng/', 'anexo', resolve), '/en/'));

test('notícia sem corpo vai para a listagem do idioma', () =>
  assert.equal(destino('/en/noticia/2q22-earnings-release/', 'noticia', resolve), '/en/noticias/'));

test('qualquer coisa sob /video/ vai para a listagem de vídeos', () =>
  assert.equal(destino('/video/video-institucional/institucionalalupar-1/', 'anexo', resolve), '/videos/'));

test('nunca aponta para si mesmo', () =>
  assert.equal(destino('/videos/', 'pagina', (c) => c === '/' || c === '/videos/'), '/'));
