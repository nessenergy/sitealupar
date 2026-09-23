import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanfona, documentosDaMz, itens, idsNosTitulos, semH2Vazio, titulosDeEmpresa, centralizarMapas, semLinksQuebrados } from './acervo.ts';

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
    /* A Companhia recebeu texto novo em 22/09/2026: é narrativa, sem número de
       operação. Os números continuam na Área de atuação — aqui, o que se
       verifica é que nenhum dos antigos sobreviveu. */
    const companhia = corpo(`${pre}/a-companhia/`);
    assert.doesNotMatch(companhia, /8[.,]805|7\.964|798[,.]|821,5|10 mil km|10,000 km/, `${pre}/a-companhia/`);
  }
});

test('h2 sem id ganha âncora pelo texto; repetido, vazio ou já com id fica como está', () => {
  assert.equal(
    idsNosTitulos('<h2>Geradoras</h2><h2>Comercialização</h2><h2>Geradoras</h2><h2></h2><h2 id="x">Y</h2>'),
    '<h2 id="geradoras">Geradoras</h2><h2 id="comercializacao">Comercialização</h2><h2>Geradoras</h2><h2></h2><h2 id="x">Y</h2>',
  );
});

test('A Companhia tem a mesma estrutura nos três idiomas: abertura de 2007 e, depois do texto, missão e visão', () => {
  for (const pre of ['', '/en', '/es']) {
    const c = itens().find((i) => i.rota === `${pre}/a-companhia/`)?.corpo ?? '';
    assert.match(c, /2007/, `${pre}/a-companhia/ sem a abertura`);
    /* O mapa de ativos saiu em 23/09/2026, a pedido da Alupar: ele continua na
       Área de atuação, que é a página que fala dos ativos. */
    assert.doesNotMatch(c, /mapa-ativos|class="mapa"/, `${pre}/a-companhia/ com o mapa de volta`);
    /* Sem `text-justify`: o português não usa, e o texto justificado é ruim de ler em coluna estreita. */
    assert.doesNotMatch(c, /text-justify/, `${pre}/a-companhia/`);
  }
});

/* A arte MISSAO-VALORES trazia a missão antiga desenhada na imagem e saiu com o
   texto de 22/09/2026, que traz missão e visão novas. Os sete valores saíram a
   pedido da Alupar em 23/09/2026: a página fica com missão e visão, em texto. */
test('missão e visão são texto de verdade nos três idiomas, e os valores não voltaram', () => {
  for (const [pre, missao, visao] of [
    ['', 'Missão', 'Visão'], ['/en', 'Mission', 'Vision'], ['/es', 'Misión', 'Visión'],
  ] as const) {
    const c = itens().find((i) => i.rota === `${pre}/a-companhia/`)?.corpo ?? '';
    for (const titulo of [missao, visao]) {
      assert.match(c, new RegExp(`<h3[^>]*>${titulo}</h3>`), `${pre}/a-companhia/ sem o subtítulo ${titulo}`);
    }
    /* Nem a arte antiga, nem o bloco de leitor de tela que existia por causa
       dela, nem os valores por qualquer caminho. */
    assert.doesNotMatch(c, /MISSAO-VALORES|sr-only|Planejamento|Planning|Planificación/, `${pre}/a-companhia/`);
  }
});

test('o mapa de ativos traz a legenda em HTML, traduzida, na Área de atuação', () => {
  const subestacao = { '': 'Subestação', '/en': 'Substation', '/es': 'Subestación' } as const;
  for (const pre of ['', '/en', '/es'] as const) {
    for (const rota of ['area-de-atuacao']) {
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

test('h2 vazio sai: o leitor de tela anunciaria um título sem texto', () => {
  assert.equal(semH2Vazio('<p>a</p><h2></h2><h2> </h2><h2>Título</h2><p>b</p>'), '<p>a</p><h2>Título</h2><p>b</p>');
});

/*
 * A página Empresas (só ela): o nome de cada transmissora/geradora é o
 * primeiro filho de um <p> ou <div>, em <strong>, e nunca foi título de
 * verdade — 41 <strong>, nenhum <h3> (medido em 22/09/2026).
 */
test('nome de empresa com texto no mesmo parágrafo: vira <h3>, o <br> que só separava sai', () => {
  const entrada = '<p class="text-justify"><strong>ETEM</strong><br>\nA ETEM atua...</p>';
  assert.equal(titulosDeEmpresa(entrada), '<h3>ETEM</h3><p class="text-justify">A ETEM atua...</p>');
});

test('nome de empresa sozinho no parágrafo: o parágrafo inteiro vira <h3>', () => {
  assert.equal(titulosDeEmpresa('<p><strong>TPE</strong></p>'), '<h3>TPE</h3>');
});

test('nome de empresa num <div> sozinho: o <div> vira <h3>, o <div> seguinte não muda', () => {
  const entrada = '<div><strong>TCE</strong></div><div>Em 22 de novembro...</div>';
  assert.equal(titulosDeEmpresa(entrada), '<h3>TCE</h3><div>Em 22 de novembro...</div>');
});

test('nome em <strong><em>…</em></strong> seguido de imagem: o <h3> sai só com o texto, a imagem fica', () => {
  const entrada = '<p><strong><em>UHE São José</em>&nbsp;</strong> <img src="x.png"></p>';
  assert.equal(titulosDeEmpresa(entrada), '<h3>UHE São José</h3><p><img src="x.png"></p>');
});

/* ETB (pt) e ETB/EDTE (en, es) vêm em <b>, não em <strong> — a única exceção
   do acervo (medido em 22/09/2026: ETB ficava para trás, sem virar título). */
test('nome de empresa em <b>, não <strong>, também vira <h3> — é o caso do ETB', () => {
  const entrada = '<div><b>ETB</b></div><div>É uma SPE composta...</div>';
  assert.equal(titulosDeEmpresa(entrada), '<h3>ETB</h3><div>É uma SPE composta...</div>');
});

test('parágrafo sem <strong> na frente não muda', () => {
  const entrada = '<p class="text-justify">Texto comum, sem nome de empresa no início.</p>';
  assert.equal(titulosDeEmpresa(entrada), entrada);
});

test('<strong> que não é o primeiro filho não vira título', () => {
  const entrada = '<p>Prefácio <strong>ETEM</strong> resto.</p>';
  assert.equal(titulosDeEmpresa(entrada), entrada);
});

test('mapa com classe alignnone (WordPress) centraliza: vira aligncenter, o resto do atributo não muda', () => {
  const entrada = '<img fetchpriority="high" decoding="async" class="alignnone wp-image-1040 size-full" alt="" src="x.png">';
  const saida = '<img fetchpriority="high" decoding="async" class="aligncenter wp-image-1040 size-full" alt="" src="x.png">';
  assert.equal(centralizarMapas(entrada), saida);
});

test('centralizarMapas só troca a palavra alignnone, preservando as outras classes e a ordem', () => {
  assert.equal(
    centralizarMapas('<img class="alignnone wp-image-9 size-full" src="x.png">'),
    '<img class="aligncenter wp-image-9 size-full" src="x.png">',
  );
});

test('imagem já aligncenter, ou sem classe de alinhamento, não muda', () => {
  assert.equal(centralizarMapas('<img class="aligncenter wp-image-1" src="a.png">'), '<img class="aligncenter wp-image-1" src="a.png">');
  assert.equal(centralizarMapas('<img src="a.png">'), '<img src="a.png">');
});

test('links da PCH Antônio Dias para o RI (RIMA e EIA partes 1 a 3) saem: quebrados, o RI redireciona para a home dele', () => {
  const entrada = [
    '<p>Texto antes.</p>',
    '<p><a href="https://ri.alupar.com.br/wp-content/uploads/sites/4/2018/12/alp_pch_ant_dias_rima_RAZ00_menor.pdf">RIMA</a></p>',
    '<p><a href="https://ri.alupar.com.br/wp-content/uploads/sites/4/2018/12/alp_pch_ant_dias_eia_RAZ00_pt01.pdf">EIA (Parte 1)</a></p>',
    '<p><a href="https://ri.alupar.com.br/wp-content/uploads/sites/4/2018/12/alp_pch_ant_dias_eia_RAZ00_pt02.pdf">EIA (Parte 2)</a></p>',
    '<p><a href="https://ri.alupar.com.br/wp-content/uploads/sites/4/2018/12/alp_pch_ant_dias_eia_RAZ00_pt03.pdf">EIA (Parte 3)</a></p>',
    '<p>Texto depois.</p>',
  ].join('\n');
  assert.equal(semLinksQuebrados(entrada), '<p>Texto antes.</p>\n<p>Texto depois.</p>');
});

test('semLinksQuebrados não mexe em nenhum outro link', () => {
  const entrada = '<p><a href="https://ri.alupar.com.br/outra-coisa.pdf">Outro</a></p>';
  assert.equal(semLinksQuebrados(entrada), entrada);
});

test('a página Empresas de verdade, nos três idiomas: nomes de empresa viram h3, mapas centralizados, sem <strong> sobrando, sem os links quebrados do RI', () => {
  for (const pre of ['', '/en', '/es']) {
    const empresas = itens().find((i) => i.rota === `${pre}/empresas/`)?.corpo ?? '';
    assert.ok(/<h3>/.test(empresas), `${pre}/empresas/ sem h3`);
    assert.doesNotMatch(empresas, /<strong>[A-ZÀ-Ú]/, `${pre}/empresas/ ainda tem <strong> de nome de empresa`);
    assert.doesNotMatch(empresas, /<b>[A-ZÀ-Ú]/, `${pre}/empresas/ ainda tem <b> de nome de empresa (caso ETB)`);
    assert.doesNotMatch(empresas, /class="alignnone/, `${pre}/empresas/ ainda tem mapa alignnone`);
    assert.doesNotMatch(empresas, /ant_dias/, `${pre}/empresas/ ainda tem os links quebrados`);
  }
});
