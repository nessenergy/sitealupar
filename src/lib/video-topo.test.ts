import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { terminou } from './video-topo.ts';

// public/js/site.js é um script clássico e não importa módulo: leva uma cópia
// de `terminou`. Aqui a cópia sai do arquivo e roda contra os mesmos casos do
// export tipado, para uma divergência silenciosa não deixar o iframe sem sair.
const site = readFileSync('public/js/site.js', 'utf8');
const trecho = site.match(/const terminou = \(data\) => \{[\s\S]*?\r?\n {2}\};/);
assert.ok(trecho, 'bloco `const terminou` não encontrado em public/js/site.js');
const doSite = new Function(`return (${trecho[0].replace(/^const terminou = /, '').replace(/;$/, '')});`)() as (data: unknown) => boolean;

const casos: [string, unknown, boolean][] = [
  ['infoDelivery com playerState 0 é o fim do vídeo', '{"event":"infoDelivery","info":{"playerState":0,"currentTime":152.9}}', true],
  ['onStateChange com info 0 é o fim do vídeo', '{"event":"onStateChange","info":0}', true],
  ['infoDelivery com playerState 1 (tocando) não é o fim', '{"event":"infoDelivery","info":{"playerState":1}}', false],
  ['onStateChange com info 2 (pausado) não é o fim', '{"event":"onStateChange","info":2}', false],
  ['infoDelivery sem playerState (só o relógio andando) não é o fim', '{"event":"infoDelivery","info":{"currentTime":7.3}}', false],
  ['outro evento com info 0 (onReady) não é o fim', '{"event":"onReady","info":0}', false],
  ['onStateChange com "0" em texto não é o fim', '{"event":"onStateChange","info":"0"}', false],
  ['texto que não é JSON não estoura', 'isso não é json', false],
  ['objeto (não string) não estoura', { event: 'onStateChange', info: 0 }, false],
  ['nulo não estoura', null, false],
];

for (const [nome, dado, esperado] of casos) {
  test(`terminou (módulo): ${nome}`, () => assert.equal(terminou(dado), esperado));
  test(`terminou (public/js/site.js): ${nome}`, () => assert.equal(doSite(dado), esperado));
}
