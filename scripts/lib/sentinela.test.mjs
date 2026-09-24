import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALERTA_DIAS, ORIGEM_SEM_CADEIA, CERTIFICADO_DE_TERCEIRO, avaliar } from './sentinela.mjs';

const AGORA = new Date('2026-09-14T12:00:00Z');
const LONGE = 'Dec  4 20:16:27 2026 GMT'; // 81 dias
const PERTO = 'Oct  7 13:06:28 2026 GMT'; // 23 dias

const base = { host: 'alupar.com.br', codigo: '200', saidaCurl: 0, fim: LONGE, agora: AGORA, virada: false };

test('host que responde com certificado longe do vencimento passa', () => {
  const r = avaliar(base);
  assert.equal(r.ok, true);
  assert.equal(r.estado, 'ok');
  assert.equal(r.dias, 81);
});

test('301 e 302 contam como resposta boa — o apex redireciona para o www', () => {
  assert.equal(avaliar({ ...base, codigo: '301' }).ok, true);
  assert.equal(avaliar({ ...base, codigo: '302' }).ok, true);
});

test('erro 5xx reprova', () => {
  const r = avaliar({ ...base, codigo: '503' });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'sem-resposta');
});

test('sem certificado legível reprova, mesmo com HTTP 200', () => {
  const r = avaliar({ ...base, fim: '' });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'sem-certificado');
  assert.equal(r.dias, null);
});

test(`certificado a menos de ${ALERTA_DIAS} dias reprova`, () => {
  const r = avaliar({ ...base, fim: PERTO });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'certificado-vencendo');
  assert.equal(r.dias, 23);
});

/*
 * A origem da MZ manda o certificado folha duas vezes e nunca o intermediário
 * da GoDaddy, então cliente estrito reprova com "unable to get local issuer
 * certificate" (curl 60) enquanto navegador e curl com repositório do sistema
 * abrem o site normalmente. É defeito conhecido do fornecedor que está
 * saindo, e morre na virada — daí a tolerância ser só deste host e só antes
 * dela. Sem isso o sentinela nasce vermelho todo dia e deixa de ser lido.
 */
test('cadeia incompleta no www da origem é tolerada antes da virada', () => {
  const r = avaliar({ ...base, host: ORIGEM_SEM_CADEIA, codigo: 'erro', saidaCurl: 60 });
  assert.equal(r.ok, true);
  assert.equal(r.estado, 'cadeia-incompleta');
});

test('depois da virada a mesma cadeia incompleta reprova — ali já seria nossa', () => {
  const r = avaliar({ ...base, host: ORIGEM_SEM_CADEIA, codigo: 'erro', saidaCurl: 60, virada: true });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'cadeia-incompleta');
});

test('a tolerância não se estende a outro host', () => {
  const r = avaliar({ ...base, host: 'alupar.us6.quickconnect.to', codigo: 'erro', saidaCurl: 60 });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'cadeia-incompleta');
});

test('cadeia incompleta não esconde o vencimento — é justamente o sinal que precisa passar', () => {
  const r = avaliar({ ...base, host: ORIGEM_SEM_CADEIA, codigo: 'erro', saidaCurl: 60, fim: PERTO });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'certificado-vencendo');
  assert.equal(r.dias, 23);
});

test('falha de rede que não é de certificado reprova, mesmo no www', () => {
  const r = avaliar({ ...base, host: ORIGEM_SEM_CADEIA, codigo: 'erro', saidaCurl: 28 });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'sem-resposta');
});

test('a mensagem diz o host, o estado e os dias', () => {
  const m = avaliar(base).mensagem;
  assert.match(m, /alupar\.com\.br/);
  assert.match(m, /81 dias/);
});

test('o caminho aparece na mensagem, para o host que é vigiado numa página', () => {
  const r = avaliar({
    host: 'ri.alupar.com.br',
    caminho: '/noticias/',
    codigo: '200',
    saidaCurl: 0,
    fim: 'Dec 31 23:59:59 2026 GMT',
    agora: new Date('2026-09-16T12:00:00Z'),
  });
  assert.equal(r.ok, true);
  assert.match(r.mensagem, /ri\.alupar\.com\.br\/noticias\//);
});

test('sem caminho, a mensagem continua a do host — nada muda para quem já chamava', () => {
  const r = avaliar({
    host: 'alupar.com.br',
    codigo: '200',
    saidaCurl: 0,
    fim: 'Dec 31 23:59:59 2026 GMT',
    agora: new Date('2026-09-16T12:00:00Z'),
  });
  // Três espaços é o formato que já existia (2 de 'ok  ' + 1 do template);
  // este teste existe para provar que o parâmetro `caminho` não mexeu nisso.
  assert.match(r.mensagem, /ok {3}alupar\.com\.br → HTTP 200/);
});

test('a página do RI fora do ar reprova o dia', () => {
  const r = avaliar({
    host: 'ri.alupar.com.br',
    caminho: '/noticias/',
    codigo: '404',
    saidaCurl: 0,
    fim: 'Dec 31 23:59:59 2026 GMT',
    agora: new Date('2026-09-16T12:00:00Z'),
  });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'sem-resposta');
});

/*
 * Depois da virada, o certificado curinga serve só ao portal de RI, que é de
 * outra equipe: não há o que fazer com o alarme além de repassá-lo. O que
 * continua sendo nosso é a **disponibilidade** daquele host — 186 endereços
 * nossos dependem do /noticias/ dele (D16) —, e isso o sentinela segue medindo.
 */
test('certificado de host de terceiro perto de vencer não reprova: não é nosso', () => {
  const host = [...CERTIFICADO_DE_TERCEIRO][0];
  const r = avaliar({ ...base, host, fim: PERTO });
  assert.equal(r.ok, true);
  assert.equal(r.estado, 'certificado-de-terceiro');
  assert.equal(r.dias, 23);
});

test('mas host de terceiro fora do ar continua reprovando: a continuidade é nossa', () => {
  const host = [...CERTIFICADO_DE_TERCEIRO][0];
  const r = avaliar({ ...base, host, codigo: '503', fim: PERTO });
  assert.equal(r.ok, false);
  assert.equal(r.estado, 'sem-resposta');
});
