/**
 * Percurso de teclado do formulário de contato (Passo 13b da Tarefa 10).
 *
 * O Lighthouse confere se cada campo tem rótulo; não confere a **ordem** em que
 * o foco passa por eles, nem se o foco é visível, nem se alguma coisa o prende.
 * São defeitos que só aparecem usando, e que nenhum gate do projeto via.
 *
 * Dirige o Chrome instalado pelo protocolo de depuração, como
 * `capturar-telas.mjs` — sem dependência nova.
 *
 *   node scripts/verificar-teclado.mjs [url]
 *
 * Isto **não substitui** o leitor de tela. O que uma máquina confere é a ordem,
 * a visibilidade do foco e a existência de nome acessível; se o nome faz sentido
 * quando lido em voz alta, só ouvindo. Essa parte continua sendo de gente.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = Number(process.env.PORTA ?? 9460);
const ALVO = process.argv[2] ?? 'https://sitealupar.pages.dev/contato/';

/* A ordem em que o formulário deve receber o foco, de cima para baixo. O
   antispam entra no meio quando carrega, e por isso não está fixado aqui. */
const CAMPOS = ['nome', 'email', 'empresa', 'telefone', 'assunto', 'mensagem', 'consentimento'];

const perfil = mkdtempSync(join(tmpdir(), 'teclado-'));
const chrome = spawn(
  CHROME,
  ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, 'about:blank'],
  { stdio: 'ignore' },
);
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
const encerrar = () => {
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  else chrome.kill();
};

let alvo;
for (let n = 0; n < 60 && !alvo; n++) {
  await espera(200);
  alvo = await fetch(`http://127.0.0.1:${PORTA}/json/list`)
    .then((r) => r.json())
    .then((l) => l.find((t) => t.type === 'page'))
    .catch(() => undefined);
}
if (!alvo) { encerrar(); console.error(`o Chrome não abriu a porta ${PORTA}`); process.exit(1); }

let seq = 0;
const respostas = new Map();
const ws = new WebSocket(alvo.webSocketDebuggerUrl);
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  const p = respostas.get(m.id);
  if (p) { respostas.delete(m.id); p(m); }
};
await new Promise((ok) => { ws.onopen = ok; });
const cdp = (method, params = {}) => new Promise((ok, erro) => {
  const id = ++seq;
  respostas.set(id, (m) => (m.error ? erro(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const js = async (expression) =>
  (await cdp('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

/** Uma tecla Tab de verdade, não `.focus()`: é o percurso que está sob teste. */
const tab = async () => {
  for (const type of ['rawKeyDown', 'char', 'keyUp']) {
    await cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  }
  await espera(90);
};

/* O que o leitor de tela anunciaria: nome acessível, papel e se o foco se vê. */
const focado = () => js(`(() => {
  const e = document.activeElement;
  if (!e || e === document.body) return null;
  const rotulo = e.labels?.[0]?.textContent?.trim()
    || e.getAttribute('aria-label')
    || (e.getAttribute('aria-labelledby') && document.getElementById(e.getAttribute('aria-labelledby'))?.textContent?.trim())
    || e.textContent?.trim()
    || '';
  const s = getComputedStyle(e);
  const anel = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  return JSON.stringify({
    tag: e.tagName.toLowerCase(), nome: e.getAttribute('name') || '', rotulo: rotulo.slice(0, 60),
    tipo: e.getAttribute('type') || '', anel, sombra: s.boxShadow !== 'none',
  });
})()`);

const achados = [];
try {
  await cdp('Page.enable');
  await cdp('Page.navigate', { url: ALVO });
  await espera(4500);

  const percurso = [];
  // 40 tabulações cobrem cabeçalho, menu e formulário inteiro com folga.
  for (let n = 0; n < 40; n++) {
    await tab();
    const bruto = await focado();
    if (!bruto) continue;
    const e = JSON.parse(bruto);
    percurso.push(e);
  }

  const doFormulario = percurso.filter((e) => CAMPOS.includes(e.nome));
  const ordem = doFormulario.map((e) => e.nome);

  // 1. Todo campo é alcançável pelo Tab.
  for (const campo of CAMPOS) {
    if (!ordem.includes(campo)) achados.push(`o campo "${campo}" não foi alcançado por tabulação`);
  }

  // 2. A ordem do foco é a ordem visual. Foco que salta confunde quem não vê a tela.
  const esperada = CAMPOS.filter((c) => ordem.includes(c));
  if (ordem.join() !== esperada.join()) {
    achados.push(`a ordem do foco é ${ordem.join(' → ')}, e deveria ser ${esperada.join(' → ')}`);
  }

  // 3. Todo elemento focado anuncia alguma coisa. Campo sem nome é campo mudo.
  for (const e of doFormulario) {
    if (!e.rotulo) achados.push(`o campo "${e.nome}" recebe foco sem nome acessível`);
  }

  // 4. O foco tem de ser visível — WCAG 2.4.7. Sem isso ninguém sabe onde está.
  for (const e of doFormulario) {
    if (!e.anel && !e.sombra) achados.push(`o foco em "${e.nome}" não é visível`);
  }

  // 5. Armadilha de foco: o percurso tem de sair do formulário.
  const ultimoCampo = percurso.findLastIndex((e) => CAMPOS.includes(e.nome));
  if (ultimoCampo >= 0 && ultimoCampo === percurso.length - 1) {
    achados.push('o foco não saiu do formulário em 40 tabulações — possível armadilha');
  }

  console.log(`percurso: ${percurso.length} paradas · ${doFormulario.length} no formulário`);
  console.log(`ordem no formulário: ${ordem.join(' → ') || '(nenhum campo alcançado)'}`);
} finally {
  encerrar();
}

if (achados.length) {
  console.error(`\nreprovado: ${achados.length} achado(s)`);
  for (const a of achados) console.error(`  ${a}`);
  process.exit(1);
}
console.log('\naprovado: todo campo alcançável, na ordem visual, com nome e foco visível.');
console.log('Falta a parte que máquina nenhuma faz: ouvir com leitor de tela se os nomes fazem sentido.');
