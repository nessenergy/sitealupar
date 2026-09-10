import { test } from 'node:test';
import assert from 'node:assert/strict';
import { responsivas, type Manifesto } from './imagens.ts';

const U = 'https://www.alupar.com.br/wp-content/uploads/';
const manifesto: Manifesto = {
  'sites/7/2017/08/mapa.png': { largura: 1600, altura: 900, variantes: [480, 960, 1440, 1600] },
  'sites/7/2019/05/Aves-de-São-Paulo.png': { largura: 400, altura: 300, variantes: [400] },
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
  assert.match(saida, /sizes="292px"/);
  assert.match(saida, /width="292" height="300"/);
  assert.doesNotMatch(saida, /x-150\.png/);
  assert.equal(saida.match(/\ssrcset=/g)?.length, 1);
});

test('caminho percentualmente codificado casa com o manifesto', () => {
  const saida = responsivas(`<img src="${U}sites/7/2019/05/Aves-de-S%C3%A3o-Paulo.png" alt="Aves">`, manifesto);
  assert.match(saida, /src="\/midia\/sites\/7\/2019\/05\/Aves-de-S%C3%A3o-Paulo-400\.webp"/);
});

test('imagem de terceiro passa intacta', () => {
  const html = '<img src="https://files.workr.com.br/logo.png" alt="Workr">';
  assert.equal(responsivas(html, manifesto), html);
});

test('imagem do acervo sem versão otimizada reprova o build', () => {
  assert.throws(() => responsivas(`<img src="${U}sites/7/nada.png" alt="">`, manifesto), /sem versão otimizada: sites\/7\/nada\.png/);
});
