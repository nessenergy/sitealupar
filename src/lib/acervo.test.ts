import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanfona, documentosDaMz, itens, idsNosTitulos } from './acervo.ts';

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

/*
 * O segundo host do fornecedor. A primeira versão só olhava `api.mziq.com` e
 * deixou três PDFs para trás — entre eles agendas de divulgação de resultados.
 */
test('o gerenciador tem dois endereços, e os dois são reescritos', () => {
  const mapa = { 'https://apicatalog.mziq.com/filemanager/v2/d/a/b?origin=1': { chave: 'documentos-mz/Agenda.pdf' } };
  const saida = documentosDaMz('<a href="https://apicatalog.mziq.com/filemanager/v2/d/a/b?origin=1">x</a>', mapa);
  assert.match(saida, /documentos-mz\/Agenda\.pdf/);
});

/*
 * A armadilha que custou uma tarde: as chaves do mapa saem do texto cru do
 * JSONL, onde a URL é seguida da barra invertida que escapa a aspa; o corpo
 * chega aqui já desescapado. Sem normalizar os dois lados, 63 das 124 chaves
 * nunca casavam — e o link ficava apontando para a MZ em silêncio.
 */
test('chave do mapa com barra invertida no fim ainda casa com a URL limpa', () => {
  const chaveSuja = `https://api.mziq.com/mzfilemanager/v2/d/a/b?origin=2${String.fromCharCode(92)}`;
  const mapa = { [chaveSuja]: { chave: 'documentos-mz/Release.pdf' } };
  const saida = documentosDaMz('<a href="https://api.mziq.com/mzfilemanager/v2/d/a/b?origin=2">x</a>', mapa);
  assert.match(saida, /documentos-mz\/Release\.pdf/);
});

test('a URL casada não arrasta a barra invertida para o destino', () => {
  const mapa = { 'https://api.mziq.com/mzfilemanager/v2/d/c/d?origin=2': { chave: 'documentos-mz/N.pdf' } };
  const saida = documentosDaMz('<a href="https://api.mziq.com/mzfilemanager/v2/d/c/d?origin=2">x</a>', mapa);
  assert.ok(!saida.includes(String.fromCharCode(92)), 'o destino não deveria conter barra invertida');
});

/* Texto revisado pela Alupar em 21/09/2026 (02_Conteudo_Pag_AreasDeAtuacao):
   `acervo/revisado/` vence o corpo migrado, nos três idiomas. */
test('Área de atuação e A Companhia saem do texto revisado, com os números de 2026', () => {
  const corpo = (rota: string) => itens().find((i) => i.rota === rota)?.corpo ?? '';
  for (const pre of ['', '/en', '/es']) {
    const area = corpo(`${pre}/area-de-atuacao/`);
    assert.match(area, /45/, `${pre}/area-de-atuacao/`);
    assert.match(area, /href="https:\/\/alup\.io\/"/);
    assert.match(area, /\/midia\/sites\/alupar\/2026\/09\/mapa-ativos-\d+\.webp/);
    assert.doesNotMatch(area, /\b(35|29) (empresas|electricity|empresas transmisoras)/);
    const companhia = corpo(`${pre}/a-companhia/`);
    assert.match(companhia, /45/, `${pre}/a-companhia/`);
    assert.doesNotMatch(companhia, /8[.,]805|7\.964|798[,.]|821,5/);
  }
});

test('h2 sem id ganha âncora pelo texto; repetido, vazio ou já com id fica como está', () => {
  assert.equal(
    idsNosTitulos('<h2>Geradoras</h2><h2>Comercialização</h2><h2>Geradoras</h2><h2></h2><h2 id="x">Y</h2>'),
    '<h2 id="geradoras">Geradoras</h2><h2 id="comercializacao">Comercialização</h2><h2>Geradoras</h2><h2></h2><h2 id="x">Y</h2>',
  );
});

test('A Companhia tem a mesma estrutura nos três idiomas: abertura de 2007, mapa antes de Missão, Visão e Valores', () => {
  for (const pre of ['', '/en', '/es']) {
    const c = itens().find((i) => i.rota === `${pre}/a-companhia/`)?.corpo ?? '';
    assert.match(c, /2007/, `${pre}/a-companhia/ sem a abertura`);
    assert.match(c, /mapa-ativos[\s\S]*<h2/, `${pre}/a-companhia/ com o mapa fora do lugar`);
    /* Sem `text-justify`: o português não usa, e o texto justificado é ruim de ler em coluna estreita. */
    assert.doesNotMatch(c, /text-justify/, `${pre}/a-companhia/`);
  }
});

test('a imagem de Missão, Visão e Valores do português e do inglês traz o texto por extenso para o leitor de tela', () => {
  for (const [pre, palavra] of [['', 'Planejamento'], ['/en', 'Planning']] as const) {
    const c = itens().find((i) => i.rota === `${pre}/a-companhia/`)?.corpo ?? '';
    assert.ok(c.slice(c.indexOf('class="sr-only"')).includes(palavra), `${pre}/a-companhia/`);
  }
});

test('o mapa de ativos traz a legenda em HTML, traduzida, na Área de atuação e em A Companhia', () => {
  const subestacao = { '': 'Subestação', '/en': 'Substation', '/es': 'Subestación' } as const;
  for (const pre of ['', '/en', '/es'] as const) {
    for (const rota of ['area-de-atuacao', 'a-companhia']) {
      const c = itens().find((i) => i.rota === `${pre}/${rota}/`)?.corpo ?? '';
      const onde = `${pre}/${rota}/`;
      assert.match(c, /<figure class="mapa">/, onde);
      assert.match(c, /<ul class="legenda"/, onde);
      assert.ok(c.includes(subestacao[pre]), `${onde}: legenda sem "${subestacao[pre]}"`);
      /* A legenda deixou de estar desenhada na imagem: o texto alternativo descreve o mapa, não a legenda. */
      assert.doesNotMatch(c, /Legenda:|Legend \(|Leyenda \(/, onde);
    }
  }
});

test('os quatro links de ação da Área de atuação são o botão do tema', () => {
  for (const pre of ['', '/en', '/es']) {
    const c = itens().find((i) => i.rota === `${pre}/area-de-atuacao/`)?.corpo ?? '';
    assert.equal((c.match(/<a class="btn btn-azul"/g) ?? []).length, 4, `${pre}/area-de-atuacao/`);
  }
});
