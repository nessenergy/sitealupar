import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliar, SEGREDOS } from './saude.ts';

const todos = Object.fromEntries(SEGREDOS.map((n) => [n, true]));

test('com os quatro segredos e a Resend respondendo, está saudável', () => {
  const d = avaliar(todos, 200);
  assert.equal(d.ok, true);
  assert.deepEqual(d.motivos, []);
});

test('segredo apagado por engano é acusado pelo nome', () => {
  const d = avaliar({ ...todos, CONTATO_DESTINO: false }, 200);
  assert.equal(d.ok, false);
  assert.match(d.motivos[0], /CONTATO_DESTINO/);
});

test('mais de um segredo faltando: todos são listados, não só o primeiro', () => {
  const d = avaliar({ ...todos, RESEND_API_KEY: false, CONTATO_REMETENTE: false }, 200);
  assert.equal(d.motivos.length, 2);
});

/*
 * O caso que este verificador existe para pegar: a chave gira, alguém esquece
 * de atualizar deste lado, e o formulário passa a recusar tudo em silêncio.
 */
test('chave revogada é acusada', () => {
  for (const status of [401, 403]) {
    const d = avaliar(todos, status);
    assert.equal(d.ok, false);
    assert.match(d.motivos[0], /recusou a chave/);
  }
});

test('cota estourada é acusada antes de o envio parar', () => {
  const d = avaliar(todos, 429);
  assert.equal(d.ok, false);
  assert.match(d.motivos[0], /cota/);
});

test('erro do lado da Resend é acusado', () => {
  assert.equal(avaliar(todos, 503).ok, false);
});

/* Quem não consegue perguntar não pode afirmar que está bom. */
test('sem resposta da Resend, reprova em vez de se calar', () => {
  const d = avaliar(todos, null);
  assert.equal(d.ok, false);
  assert.match(d.motivos[0], /não respondeu/);
});

test('os motivos somam segredo ausente e falha da Resend', () => {
  const d = avaliar({ ...todos, TURNSTILE_SECRET: false }, 401);
  assert.equal(d.motivos.length, 2);
});
