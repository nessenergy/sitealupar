import { test } from 'node:test';
import assert from 'node:assert/strict';
import { organizacao, siteWeb, trilhaLd, grafo, paginaWeb, video } from './seo.ts';

const ORIGEM = 'https://www.alupar.com.br';

test('a organização mantém o que já era servido, com o domínio absoluto', () => {
  const o = organizacao(ORIGEM);
  assert.equal(o['@type'], 'Organization');
  assert.equal(o.name, 'Alupar');
  assert.equal(o.url, ORIGEM);
  assert.equal(o.logo, `${ORIGEM}/logo-alupar.svg`);
});

test('o site declara idioma por rota: o português é o padrão, sem prefixo', () => {
  assert.equal(siteWeb(ORIGEM, 'pt-br').url, `${ORIGEM}/`);
  assert.equal(siteWeb(ORIGEM, 'pt-br').inLanguage, 'pt-BR');
  assert.equal(siteWeb(ORIGEM, 'en').url, `${ORIGEM}/en/`);
  assert.equal(siteWeb(ORIGEM, 'en').inLanguage, 'en');
  assert.equal(siteWeb(ORIGEM, 'es').inLanguage, 'es');
});

test('a trilha vira BreadcrumbList com posição de 1 em diante', () => {
  const l = trilhaLd([{ rota: '/', titulo: 'Início' }, { titulo: 'A Companhia' }], ORIGEM);
  assert.equal(l?.['@type'], 'BreadcrumbList');
  const itens = l?.itemListElement as Record<string, unknown>[];
  assert.deepEqual(itens.map((i) => i.position), [1, 2]);
  assert.equal(itens[0].name, 'Início');
  assert.equal(itens[0].item, `${ORIGEM}/`);
});

test('o último degrau é a página atual e não leva item: ele não é link', () => {
  const l = trilhaLd([{ rota: '/', titulo: 'Início' }, { titulo: 'A Companhia' }], ORIGEM);
  const itens = l?.itemListElement as Record<string, unknown>[];
  assert.equal(itens[1].item, undefined);
  assert.equal(itens[1].name, 'A Companhia');
});

test('trilha com um degrau só não vira breadcrumb: não há caminho a descrever', () => {
  assert.equal(trilhaLd([{ titulo: 'Início' }], ORIGEM), null);
});

test('o grafo junta as partes e descarta o que for nulo', () => {
  const g = grafo(organizacao(ORIGEM), null, siteWeb(ORIGEM, 'pt-br'));
  assert.equal(g['@context'], 'https://schema.org');
  const partes = g['@graph'] as Record<string, unknown>[];
  assert.deepEqual(partes.map((p) => p['@type']), ['Organization', 'WebSite']);
});

test('a página web declara url, idioma e o site a que pertence', () => {
  const p = paginaWeb({
    origem: ORIGEM, url: `${ORIGEM}/a-companhia/`,
    titulo: 'A Companhia — Alupar', descricao: 'Texto da descrição', idioma: 'pt-br',
  });
  assert.equal(p['@type'], 'WebPage');
  assert.equal(p.url, `${ORIGEM}/a-companhia/`);
  assert.equal(p.inLanguage, 'pt-BR');
  assert.equal(p.name, 'A Companhia — Alupar');
  assert.equal(p.description, 'Texto da descrição');
  assert.deepEqual(p.isPartOf, { '@type': 'WebSite', url: `${ORIGEM}/` });
});

test('o vídeo aponta a página de reprodução e a miniatura do YouTube', () => {
  const v = video({ id: 'oqjwsKfpYZ4', nome: 'Vídeo institucional', descricao: 'Alupar', origem: ORIGEM });
  assert.equal(v['@type'], 'VideoObject');
  assert.equal(v.embedUrl, 'https://www.youtube-nocookie.com/embed/oqjwsKfpYZ4');
  assert.equal(v.thumbnailUrl, 'https://i.ytimg.com/vi/oqjwsKfpYZ4/maxresdefault.jpg');
  assert.equal(v.name, 'Vídeo institucional');
});

test('a organização publica os quatro números como PropertyValue', () => {
  const props = organizacao(ORIGEM).additionalProperty as Record<string, unknown>[];
  assert.equal(props.length, 4);
  assert.ok(props.every((p) => p['@type'] === 'PropertyValue'));
});

/* "mais de 10 mil km" é piso, "quase 800 MW" é teto. O vocabulário tem
   `minValue` e `maxValue` justamente para isso — `value` afirmaria exatidão. */
test('o piso vira minValue e o teto vira maxValue; nenhum dos dois vira value', () => {
  const props = organizacao(ORIGEM).additionalProperty as Record<string, unknown>[];
  const linhas = props.find((p) => p.name === 'Linhas de transmissão')?.value as Record<string, unknown>;
  assert.deepEqual(linhas, { '@type': 'QuantitativeValue', minValue: 10000, unitText: 'km' });
  const mw = props.find((p) => p.name === 'Capacidade instalada')?.value as Record<string, unknown>;
  assert.deepEqual(mw, { '@type': 'QuantitativeValue', maxValue: 800, unitText: 'MW' });
});

test('contagem exata vira value, sem unitText: sistema e país não são unidade de medida', () => {
  const props = organizacao(ORIGEM).additionalProperty as Record<string, unknown>[];
  const sistemas = props.find((p) => p.name === 'Sistemas de transmissão')?.value as Record<string, unknown>;
  assert.deepEqual(sistemas, { '@type': 'QuantitativeValue', value: 45 });
});

/* `observationDate` só existe em `Observation`; num `PropertyValue` ele é
   descartado por quem valida, e a data — que é o ponto — se perde. */
test('a data de referência viaja em description, que é propriedade válida de PropertyValue', () => {
  const props = organizacao(ORIGEM).additionalProperty as Record<string, unknown>[];
  assert.ok(props.every((p) => p.observationDate === undefined));
  assert.match(String(props[0].description), /21\/09\/2026/);
});

test('a página em inglês pertence ao site em inglês, não ao português', () => {
  const p = paginaWeb({
    origem: ORIGEM, url: `${ORIGEM}/en/a-companhia/`,
    titulo: 'Company', descricao: 'x', idioma: 'en',
  });
  assert.deepEqual(p.isPartOf, { '@type': 'WebSite', url: `${ORIGEM}/en/` });
});

/* `uploadDate` é obrigatória no VideoObject para o Google; sem ela a marcação
   não rende resultado de vídeo nenhum. 2025-12-17 é o que o próprio YouTube
   publica para este vídeo. */
test('o vídeo declara a data de publicação', () => {
  const v = video({ id: 'oqjwsKfpYZ4', nome: 'n', descricao: 'd', origem: ORIGEM, publicadoEm: '2025-12-17' });
  assert.equal(v.uploadDate, '2025-12-17');
});
