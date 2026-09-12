import { test } from 'node:test';
import assert from 'node:assert/strict';
import { responsivas, videosSobDemanda, type Manifesto } from './imagens.ts';

const U = 'https://www.alupar.com.br/wp-content/uploads/';
const manifesto: Manifesto = {
  'sites/7/2017/08/mapa.png': { largura: 1600, altura: 900, variantes: [480, 960, 1440, 1600] },
  'sites/7/2019/05/Aves-de-São-Paulo.png': { largura: 400, altura: 300, variantes: [400] },
  'sites/7/2024/03/missao-300x243.jpg': {
    largura: 971, altura: 788, variantes: [480, 640, 960, 971], original: 'sites/7/2024/03/missao.jpg',
  },
};

test('troca o original por WebP com srcset e dimensões intrínsecas', () => {
  const saida = responsivas(`<p><img src="${U}sites/7/2017/08/mapa.png" alt="Mapa"></p>`, manifesto);
  assert.match(saida, /src="\/midia\/sites\/7\/2017\/08\/mapa-1600\.webp"/);
  assert.match(saida, /srcset="\/midia\/sites\/7\/2017\/08\/mapa-480\.webp 480w, .*mapa-1600\.webp 1600w"/);
  assert.match(saida, /width="1600" height="900"/);
  assert.match(saida, /alt="Mapa"/);
});

test('largura declarada no conteúdo vira sizes, e o srcset antigo sai', () => {
  const saida = responsivas(
    `<img width="292" height="300" src="${U}sites/7/2017/08/mapa.png" srcset="${U}x-150.png 150w" sizes="(max-width: 292px) 100vw, 292px" alt="">`,
    manifesto,
  );
  assert.match(saida, /sizes="\(max-width: 292px\) 100vw, 292px"/);
  assert.match(saida, /width="292" height="300"/);
  assert.doesNotMatch(saida, /x-150\.png/);
  assert.equal(saida.match(/\ssrcset=/g)?.length, 1);
});

test('caminho percentualmente codificado casa com o manifesto', () => {
  const saida = responsivas(`<img src="${U}sites/7/2019/05/Aves-de-S%C3%A3o-Paulo.png" alt="Aves">`, manifesto);
  assert.match(saida, /src="\/midia\/sites\/7\/2019\/05\/Aves-de-S%C3%A3o-Paulo-400\.webp"/);
});

test('miniatura com original no manifesto serve o arquivo original', () => {
  const saida = responsivas(
    `<img width="674" height="547" src="${U}sites/7/2024/03/missao-300x243.jpg" alt="Missão">`,
    manifesto,
  );
  assert.match(saida, /src="\/midia\/sites\/7\/2024\/03\/missao-971\.webp"/);
  assert.match(saida, /srcset="\/midia\/sites\/7\/2024\/03\/missao-480\.webp 480w, .*missao-971\.webp 971w"/);
  assert.doesNotMatch(saida, /missao-300x243/);
  assert.match(saida, /sizes="\(max-width: 674px\) 100vw, 674px"/);
});

test('imagem de terceiro passa intacta', () => {
  const html = '<img src="https://files.workr.com.br/logo.png" alt="Workr">';
  assert.equal(responsivas(html, manifesto), html);
});

test('imagem do acervo sem versão otimizada reprova o build', () => {
  assert.throws(() => responsivas(`<img src="${U}sites/7/nada.png" alt="">`, manifesto), /sem versão otimizada: sites\/7\/nada\.png/);
});

test('vídeo com preload="metadata" vira preload="none"', () => {
  const saida = videosSobDemanda(
    '<video class="wp-video-shortcode" id="video-1349-2" width="1280" height="720" preload="metadata" controls="controls"><source type="video/mp4" src="x.mp4"></video>',
  );
  assert.match(saida, /preload="none"/);
  assert.doesNotMatch(saida, /preload="metadata"/);
  assert.match(saida, /id="video-1349-2"/);
  assert.match(saida, /width="1280" height="720"/);
  assert.match(saida, /controls="controls"/);
  assert.match(saida, /<source type="video\/mp4" src="x\.mp4">/);
  assert.match(saida, /<\/video>/);
});

test('vídeo sem preload ganha preload="none"', () => {
  const saida = videosSobDemanda('<video id="v1" controls><source src="y.mp4"></video>');
  assert.match(saida, /<video id="v1" controls preload="none">/);
});

test('conteúdo sem vídeo passa intacto', () => {
  const html = '<p>sem vídeo aqui</p>';
  assert.equal(videosSobDemanda(html), html);
});
