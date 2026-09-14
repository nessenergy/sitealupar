import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanfona, documentosDaMz } from './acervo.ts';

const WRAP = `<div class="arconix-faq-wrap">
  <div class="arconix-faq-title faq-closed">Garantias</div>
  <div class="arconix-faq-content faq-closed"><p>Texto</p></div>
</div>`;

test('o embrulho vira <details> e o título vira <summary>, com as classes do tema', () => {
  const saida = sanfona(WRAP);
  assert.match(saida, /<details class="arconix-faq-wrap">/);
  assert.match(saida, /<summary class="arconix-faq-title faq-closed">Garantias<\/summary>/);
  /* O conteúdo continua um <div> irmão: é o que o <details> dobra. */
  assert.match(saida, /<div class="arconix-faq-content faq-closed"><p>Texto<\/p><\/div>/);
  /* Nada de `open`: fechado já no HTML é o que não desloca a página. */
  assert.doesNotMatch(saida, /<details[^>]*\bopen\b/);
});

test('embrulho sem título fica como está — <details> sem <summary> ganharia rótulo do navegador', () => {
  const orfao = '<div class="arconix-faq-wrap"><div class="arconix-faq-content"><p>Texto</p></div></div>';
  assert.equal(sanfona(orfao), orfao);
});

test('corpo sem sanfona nenhuma passa intacto', () => {
  const comum = '<p>Um parágrafo só.</p>';
  assert.equal(sanfona(comum), comum);
});

/*
 * Os documentos do gerenciador da MZ. A URL de origem é só UUID, sem caminho
 * que sirva de destino, então o par vem do mapa gravado pelo resgate — e é por
 * isso que isto precisa de teste: um par errado troca o release de um trimestre
 * pelo de outro, e a página continua parecendo certa.
 */
const MAPA = {
  'https://api.mziq.com/mzfilemanager/v2/d/aaa/bbb?origin=2': { chave: 'documentos-mz/Release de Resultados do 3T21.pdf' },
  'https://api.mziq.com/mzfilemanager/v2/d/ccc/ddd?origin=2': { chave: 'documentos-mz/Integrity Policy.pdf' },
};

test('o link do gerenciador vira endereço nosso, com o nome que a origem declarou', () => {
  const saida = documentosDaMz('<a href="https://api.mziq.com/mzfilemanager/v2/d/aaa/bbb?origin=2">Release</a>', MAPA);
  assert.match(saida, /arquivos\.alupar\.com\.br\/documentos-mz\//);
  assert.doesNotMatch(saida, /api\.mziq\.com/);
});

test('espaço e acento no nome saem codificados, e a barra do caminho sobrevive', () => {
  const saida = documentosDaMz('<a href="https://api.mziq.com/mzfilemanager/v2/d/aaa/bbb?origin=2">x</a>', MAPA);
  assert.match(saida, /documentos-mz\/Release%20de%20Resultados%20do%203T21\.pdf/);
});

test('dois links diferentes vão para destinos diferentes', () => {
  const saida = documentosDaMz(
    '<a href="https://api.mziq.com/mzfilemanager/v2/d/aaa/bbb?origin=2">a</a><a href="https://api.mziq.com/mzfilemanager/v2/d/ccc/ddd?origin=2">b</a>',
    MAPA,
  );
  assert.match(saida, /Release%20de%20Resultados/);
  assert.match(saida, /Integrity%20Policy/);
});

test('a URL com &amp; do HTML casa com a do mapa', () => {
  const mapa = { 'https://api.mziq.com/mzfilemanager/v2/d/e/f?origin=2&x=1': { chave: 'documentos-mz/n.pdf' } };
  const saida = documentosDaMz('<a href="https://api.mziq.com/mzfilemanager/v2/d/e/f?origin=2&amp;x=1">n</a>', mapa);
  assert.match(saida, /documentos-mz\/n\.pdf/);
});

/*
 * Sem par, o link fica apontando para a MZ de propósito: vai quebrar no
 * desligamento, e é melhor que quebre visível do que virar endereço nosso
 * respondendo 404, que pareceria defeito de migração.
 */
test('link sem par no mapa fica como está', () => {
  const original = '<a href="https://api.mziq.com/mzfilemanager/v2/d/zzz/yyy?origin=2">sem par</a>';
  assert.equal(documentosDaMz(original, MAPA), original);
});

test('o que não é do gerenciador não é tocado', () => {
  const original = '<a href="https://webcastlite.mziq.com/x">webcast</a><img src="https://arquivos.alupar.com.br/a.png">';
  assert.equal(documentosDaMz(original, MAPA), original);
});
