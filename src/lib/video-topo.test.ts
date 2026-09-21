import { test } from 'node:test';
import assert from 'node:assert/strict';
import { terminou } from './video-topo.ts';

test('infoDelivery com playerState 0 é o fim do vídeo', () =>
  assert.equal(terminou('{"event":"infoDelivery","info":{"playerState":0,"currentTime":152.9}}'), true));

test('onStateChange com info 0 é o fim do vídeo', () =>
  assert.equal(terminou('{"event":"onStateChange","info":0}'), true));

test('tocando (1) e pausado (2) não são o fim', () => {
  assert.equal(terminou('{"event":"infoDelivery","info":{"playerState":1}}'), false);
  assert.equal(terminou('{"event":"onStateChange","info":2}'), false);
});

test('infoDelivery sem playerState (só o relógio andando) não é o fim', () =>
  assert.equal(terminou('{"event":"infoDelivery","info":{"currentTime":7.3}}'), false));

test('lixo não estoura: texto que não é JSON, objeto e nulo dão false', () => {
  assert.equal(terminou('isso não é json'), false);
  assert.equal(terminou({ event: 'onStateChange', info: 0 }), false);
  assert.equal(terminou(null), false);
});
