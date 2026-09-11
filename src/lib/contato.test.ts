import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar, tokenValido, hostnamesAutorizados, turnstileAprovado } from './contato.ts';

const valido = { nome: 'Ana', email: 'ana@exemplo.com', assunto: 'Visita', mensagem: 'Olá', consentimento: 'sim' };

test('formulário completo passa', () => assert.deepEqual(validar(valido), []));

test('obrigatórios em branco reprovam, só espaço conta como branco', () =>
  assert.deepEqual(validar({ ...valido, nome: '  ', assunto: undefined }), ['nome', 'assunto']));

test('e-mail sem domínio reprova', () => assert.deepEqual(validar({ ...valido, email: 'ana@' }), ['email']));

test('mensagem acima de 5.000 caracteres reprova', () =>
  assert.deepEqual(validar({ ...valido, mensagem: 'x'.repeat(5001) }), ['mensagem']));

test('sem consentimento não envia (LGPD)', () =>
  assert.deepEqual(validar({ ...valido, consentimento: undefined }), ['consentimento']));

test('tokenValido reprova ausente, tipo errado e vazio', () => {
  assert.equal(tokenValido(undefined), false);
  assert.equal(tokenValido(123), false);
  assert.equal(tokenValido(''), false);
});

test('tokenValido reprova acima de 2.048 caracteres, aprova no limite e no comum', () => {
  assert.equal(tokenValido('x'.repeat(2049)), false);
  assert.equal(tokenValido('x'.repeat(2048)), true);
  assert.equal(tokenValido('token-comum'), true);
});

test('hostnamesAutorizados: lista com espaços e vazios fica só com os hosts válidos', () =>
  assert.deepEqual(hostnamesAutorizados(' alupar.com.br , , www.alupar.com.br ,', 'preview.pages.dev'), new Set(['alupar.com.br', 'www.alupar.com.br'])));

test('hostnamesAutorizados: sem lista definida usa o host do pedido', () => {
  assert.deepEqual(hostnamesAutorizados(undefined, 'preview.pages.dev'), new Set(['preview.pages.dev']));
  assert.deepEqual(hostnamesAutorizados('', 'preview.pages.dev'), new Set(['preview.pages.dev']));
});

test('hostnamesAutorizados: lista definida ignora o host do pedido', () =>
  assert.deepEqual(hostnamesAutorizados('alupar.com.br', 'preview.pages.dev'), new Set(['alupar.com.br'])));

test('turnstileAprovado exige success, ação e hostname autorizado', () => {
  const hostnames = new Set(['alupar.com.br']);
  assert.equal(turnstileAprovado({ success: false, action: 'contato', hostname: 'alupar.com.br' }, 'contato', hostnames), false);
  assert.equal(turnstileAprovado({ success: true, action: 'outra', hostname: 'alupar.com.br' }, 'contato', hostnames), false);
  assert.equal(turnstileAprovado({ success: true, action: 'contato' }, 'contato', hostnames), false);
  assert.equal(turnstileAprovado({ success: true, action: 'contato', hostname: 'fora.com.br' }, 'contato', hostnames), false);
  assert.equal(turnstileAprovado({ success: true, action: 'contato', hostname: 'alupar.com.br' }, 'contato', hostnames), true);
});
