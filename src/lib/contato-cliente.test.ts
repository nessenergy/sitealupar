import { test } from 'node:test';
import assert from 'node:assert/strict';
import { errosDoFormulario, type Mensagens } from './contato-cliente.ts';

const m: Mensagens = { nome: 'N', email: 'E', assunto: 'A', mensagem: 'M', consentimento: 'C', verificacao: 'V' };
const ok = { nome: 'Ana', email: 'ana@exemplo.com', assunto: 'Visita', mensagem: 'Olá', consentimento: 'sim', 'cf-turnstile-response': 'tok' };

test('formulário completo, com token, não tem erro', () => assert.deepEqual(errosDoFormulario(ok, m), []));

test('cada erro traz a mensagem do seu campo, na ordem da tela', () =>
  assert.deepEqual(
    errosDoFormulario({ ...ok, nome: ' ', assunto: '', consentimento: undefined }, m),
    [{ campo: 'nome', mensagem: 'N' }, { campo: 'assunto', mensagem: 'A' }, { campo: 'consentimento', mensagem: 'C' }],
  ));

test('e-mail sem domínio e mensagem acima de 5.000 caracteres reprovam', () =>
  assert.deepEqual(
    errosDoFormulario({ ...ok, email: 'ana@', mensagem: 'x'.repeat(5001) }, m),
    [{ campo: 'email', mensagem: 'E' }, { campo: 'mensagem', mensagem: 'M' }],
  ));

test('sem token do Turnstile pede para aguardar a verificação, por último', () =>
  assert.deepEqual(
    errosDoFormulario({ ...ok, nome: '', 'cf-turnstile-response': '' }, m),
    [{ campo: 'nome', mensagem: 'N' }, { campo: 'verificacao', mensagem: 'V' }],
  ));
