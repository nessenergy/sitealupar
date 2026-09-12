import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanfona } from './acervo.ts';

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
