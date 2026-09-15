/**
 * O rotativo da home, em `public/js/site.js`.
 *
 * Mesma técnica do `site-js.test.mjs` ao lado: aquele arquivo é servido cru ao
 * navegador e não exporta nada, então o teste lê o TEXTO e o executa com
 * `node:vm` contra um DOM de mentira. Sem jsdom, sem dependência nova.
 *
 * O que está sob teste é a promessa que sustenta a decisão: **com uma tela, o
 * rotativo não existe** — nem temporizador, nem ouvinte, nem peso. Hoje a home
 * tem uma peça por idioma (regra 0.2 do Marco 0), e é por isso que o carrossel
 * pôde ser construído sem custo para a virada. Se alguém quebrar essa condição,
 * a home passa a rodar script à toa e ninguém veria pela tela.
 *
 * Sob teste também a parte que a WCAG 2.2.2 exige: dá para parar o movimento, o
 * estado do botão é anunciado, e quem pede menos movimento não começa girando.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const CODIGO = readFileSync(new URL('../../public/js/site.js', import.meta.url), 'utf8');

/** Monta o DOM de mentira com `telas` telas e roda o script nele. */
function montar({ telas = 2, menosMovimento = false } = {}) {
  const ouvintes = [];
  const registrar = (alvo) => ({
    addEventListener(tipo, fn) { ouvintes.push({ alvo, tipo, fn }); },
  });

  const slides = Array.from({ length: telas }, (_, i) => ({ hidden: i > 0, indice: i }));

  const elemento = (nome, extra = {}) => ({
    nome,
    atributos: { ...extra },
    setAttribute(k, v) { this.atributos[k] = v; },
    getAttribute(k) { return this.atributos[k] ?? null; },
    removeAttribute(k) { delete this.atributos[k]; },
    ...registrar(nome),
  });

  /* Um ponto por tela, como na marcação: o primeiro já nasce com `aria-current`,
     porque o HTML entrega a primeira tela à vista. */
  const pontos = Array.from({ length: telas }, (_, i) =>
    elemento(`ponto-${i}`, i === 0 ? { 'aria-current': 'true' } : {}),
  );

  const pausar = elemento('pausar', { 'aria-pressed': 'false', 'aria-label': 'Pausar o rotativo' });
  pausar.dataset = { pausar: 'Pausar o rotativo', retomar: 'Retomar o rotativo' };
  pausar.textContent = '❚❚';
  const botoes = { pausar };

  const secao = {
    // Despacha por seletor: telas e pontos são listas diferentes, e devolver a
    // mesma para as duas escondia erro em vez de revelar.
    querySelectorAll: (sel) => (sel.includes('data-ponto') ? pontos : slides),
    querySelector: (sel) => botoes[sel.match(/data-rot="(\w+)"/)?.[1]] ?? null,
    ...registrar('secao'),
  };

  const document = {
    querySelector: (sel) => (sel === '[data-rotativo]' && telas > 1 ? secao : null),
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({}),
    head: { append() {} },
  };

  /* Relógio de mentira: em vez de esperar 7 s, o teste chama `avancar()`. */
  let tique = null;
  const contexto = {
    document,
    matchMedia: () => ({ matches: menosMovimento }),
    setInterval: (fn) => { tique = fn; return 1; },
    clearInterval: () => { tique = null; },
  };
  runInContext(CODIGO, createContext(contexto), { filename: 'public/js/site.js' });

  return {
    slides,
    botoes,
    pontos,
    ativo: () => pontos.findIndex((p) => p.getAttribute('aria-current') === 'true'),
    girando: () => tique !== null,
    avancar: () => tique?.(),
    clicar: (nome) => ouvintes.filter((o) => o.alvo === nome && o.tipo === 'click').forEach((o) => o.fn()),
    disparar: (tipo) => ouvintes.filter((o) => o.alvo === 'secao' && o.tipo === tipo).forEach((o) => o.fn()),
    visivel: () => slides.findIndex((s) => !s.hidden),
  };
}

test('uma tela só: o rotativo não roda — é a home de hoje', () => {
  const r = montar({ telas: 1 });
  assert.equal(r.girando(), false, 'nenhum temporizador deveria existir');
});

test('duas telas: começa girando, com a primeira à vista', () => {
  const r = montar();
  assert.equal(r.girando(), true);
  assert.equal(r.visivel(), 0);
  assert.equal(r.botoes.pausar.getAttribute('aria-pressed'), 'false');
});

test('o tempo passa e a tela muda; depois da última, volta à primeira', () => {
  const r = montar({ telas: 2 });
  r.avancar();
  assert.equal(r.visivel(), 1);
  r.avancar();
  assert.equal(r.visivel(), 0);
});

test('só uma tela fica visível de cada vez', () => {
  const r = montar({ telas: 3 });
  r.avancar();
  assert.equal(r.slides.filter((s) => !s.hidden).length, 1);
});

/* WCAG 2.2.2: conteúdo que se move sozinho precisa de um jeito de parar. */
test('pausar interrompe o giro e o botão anuncia o novo estado', () => {
  const r = montar();
  r.clicar('pausar');
  assert.equal(r.girando(), false);
  assert.equal(r.botoes.pausar.getAttribute('aria-pressed'), 'true');
  assert.equal(r.botoes.pausar.getAttribute('aria-label'), 'Retomar o rotativo');
});

test('clicar de novo retoma, e o rótulo volta', () => {
  const r = montar();
  r.clicar('pausar');
  r.clicar('pausar');
  assert.equal(r.girando(), true);
  assert.equal(r.botoes.pausar.getAttribute('aria-pressed'), 'false');
  assert.equal(r.botoes.pausar.getAttribute('aria-label'), 'Pausar o rotativo');
});

/* Quem escolheu uma tela no ponto não quer que ela troque debaixo do dedo três
   segundos depois — clicar num ponto pausa, e retomar volta a ser escolha. */
test('clicar num ponto vai àquela tela e pausa', () => {
  const r = montar({ telas: 3 });
  r.clicar('ponto-2');
  assert.equal(r.visivel(), 2);
  assert.equal(r.girando(), false);
  assert.equal(r.botoes.pausar.getAttribute('aria-pressed'), 'true');
});

/* O ponto aceso e a tela à vista saem do mesmo atributo: se divergirem, o CSS
   pinta um ponto e o leitor de tela anuncia outro. */
test('o ponto aceso acompanha a tela, e é sempre um só', () => {
  const r = montar({ telas: 3 });
  assert.equal(r.ativo(), 0);
  r.avancar();
  assert.equal(r.ativo(), 1);
  assert.equal(r.visivel(), 1);
  assert.equal(r.pontos.filter((p) => p.getAttribute('aria-current') === 'true').length, 1);
});

test('o ponteiro ou o foco na seção segura o giro', () => {
  const r = montar();
  r.disparar('mouseenter');
  assert.equal(r.girando(), false);
  r.disparar('mouseleave');
  assert.equal(r.girando(), true, 'sair deveria retomar, porque ninguém pausou de propósito');
});

test('depois de pausado à mão, sair com o ponteiro não retoma sozinho', () => {
  const r = montar();
  r.clicar('pausar');
  r.disparar('mouseleave');
  assert.equal(r.girando(), false);
});

test('quem prefere menos movimento não recebe movimento nenhum', () => {
  const r = montar({ menosMovimento: true });
  assert.equal(r.girando(), false);
  assert.equal(r.botoes.pausar.getAttribute('aria-pressed'), 'true');
});
