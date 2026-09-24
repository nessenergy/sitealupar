/**
 * O llms.txt é a fonte canônica que um modelo lê para citar a Alupar. Escrito à
 * mão, envelhece no primeiro menu que mudar — daí ser gerado do mapa de rotas e
 * conferido no CI.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montar } from './llms.mjs';

const MAPA = {
  rotas: [
    { rota: '/', idioma: 'pt', tipo: 'pagina', titulo: 'Início' },
    { rota: '/a-companhia/', idioma: 'pt', tipo: 'pagina', titulo: 'A Companhia' },
    { rota: '/area-de-atuacao/', idioma: 'pt', tipo: 'pagina', titulo: 'Área de atuação' },
    { rota: '/faq/algo/', idioma: 'pt', tipo: 'faq', titulo: 'Algo' },
    { rota: '/en/a-companhia/', idioma: 'en', tipo: 'pagina', titulo: 'Company' },
  ],
};

test('abre com o nome e uma frase do que a Alupar é', () => {
  const txt = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  assert.match(txt, /^# Alupar$/m);
  /* O resumo tem de dizer o negócio nas palavras da própria Alupar — o texto
     final de 22/09/2026 diz "transmite, gera e comercializa". */
  assert.match(txt, /transmite, gera e comercializa/);
});

test('lista as páginas em português, com URL absoluta', () => {
  const txt = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  assert.match(txt, /- \[A Companhia\]\(https:\/\/www\.alupar\.com\.br\/a-companhia\/\)/);
});

test('não lista as versões em inglês e espanhol: o llms.txt é um, em português', () => {
  const txt = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  assert.doesNotMatch(txt, /\/en\/a-companhia\//);
});

test('não lista FAQ: são 101 itens e afogariam as páginas institucionais', () => {
  const txt = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  assert.doesNotMatch(txt, /\/faq\/algo\//);
});

test('aponta as fontes canônicas que não são deste site', () => {
  const txt = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  for (const host of ['ri.alupar.com.br', 'rs.alupar.com.br', 'pdi.alupar.com.br']) {
    assert.ok(txt.includes(host), `llms.txt sem ${host}`);
  }
});

test('o mesmo mapa gera o mesmo texto: sem data de geração, o arquivo não muda à toa', () => {
  const a = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  const b = montar(MAPA, { origem: 'https://www.alupar.com.br' });
  assert.equal(a, b);
});
