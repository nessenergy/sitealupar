import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destino, LISTAGEM_DO_RI, listagemDoRi } from './continuidade.mjs';

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
  /* Cada idioma vai para a listagem do seu idioma: até 24/09 os três caíam na
     listagem em português, e quem lia em inglês chegava num texto que não lê. */
  assert.equal(destino('/en/noticia/2q22-earnings-release/', 'noticia', resolve), listagemDoRi('en'));
  assert.equal(listagemDoRi('en'), 'https://ri.alupar.com.br/en/noticias/');
});

test('a listagem do RI é absoluta: o destino sai do nosso domínio', () => {
  assert.match(LISTAGEM_DO_RI, /^https:\/\/ri\.alupar\.com\.br\//);
});

test('qualquer coisa sob /video/ vai para a listagem de vídeos', () =>
  assert.equal(destino('/video/video-institucional/institucionalalupar-1/', 'anexo', resolve), '/videos/'));

test('nunca aponta para si mesmo', () =>
  assert.equal(destino('/videos/', 'pagina', (c) => c === '/' || c === '/videos/'), '/'));

/* A listagem em espanhol do portal de RI termina em `/pt/not-found` (medido em
   24/09/2026): mandar para lá seria trocar uma página em português por uma
   página de erro. Espanhol vai para a portuguesa até eles consertarem. */
test('espanhol vai para a listagem em português, porque a em espanhol não existe', () => {
  const resolve = () => true;
  assert.equal(destino('/es/noticia/3q17-earnings-release/', 'noticia', resolve), listagemDoRi('pt'));
  assert.equal(listagemDoRi('es'), listagemDoRi('pt'));
});

/* O destino canônico responde 200 direto; `/noticias/` sem idioma responde 302
   para ele. Um salto a menos em 186 endereços. */
test('o destino em português é o caminho canônico, sem o salto de idioma', () => {
  assert.equal(listagemDoRi('pt'), 'https://ri.alupar.com.br/pt/noticias/');
  assert.equal(LISTAGEM_DO_RI, listagemDoRi('pt'));
});
