import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar } from './contato.ts';

const valido = { nome: 'Ana', email: 'ana@exemplo.com', assunto: 'Visita', mensagem: 'Olá', consentimento: 'sim' };

test('formulário completo passa', () => assert.deepEqual(validar(valido), []));

test('obrigatórios em branco reprovam, só espaço conta como branco', () =>
  assert.deepEqual(validar({ ...valido, nome: '  ', assunto: undefined }), ['nome', 'assunto']));

test('e-mail sem domínio reprova', () => assert.deepEqual(validar({ ...valido, email: 'ana@' }), ['email']));

test('mensagem acima de 5.000 caracteres reprova', () =>
  assert.deepEqual(validar({ ...valido, mensagem: 'x'.repeat(5001) }), ['mensagem']));

test('sem consentimento não envia (LGPD)', () =>
  assert.deepEqual(validar({ ...valido, consentimento: undefined }), ['consentimento']));
