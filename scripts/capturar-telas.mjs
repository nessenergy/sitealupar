/**
 * Captura o site atual e o site novo, página inteira, em 390, 768 e 1280 px,
 * para a conferência visual antes da aprovação do Marketing.
 *
 * Sem dependência: dirige o Chrome instalado pelo protocolo de depuração
 * (CDP), com o WebSocket nativo do Node 22+. Página inteira pela métrica de
 * layout, não por janela alta — janela alta estica o que usa 100vh.
 *
 * O banner de cookies do site atual sai antes da captura: ele cobre o
 * rodapé, e o site novo não tem banner (P9).
 *
 *   node scripts/capturar-telas.mjs                  # 11 páginas × 3 larguras
 *   node scripts/capturar-telas.mjs --pagina contato # só uma página
 *   NOVO=http://localhost:8788 node scripts/capturar-telas.mjs --pagina contato
 *   CHROME=/caminho/do/chrome node scripts/capturar-telas.mjs
 *
 * Saída em capturas/ (fora do git): <página>-<largura>-{antigo,novo}.png e
 * capturas/index.html com cada par lado a lado.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PAGINAS, pares, relatorio } from './lib/capturas.mjs';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9333;
const SAIDA = 'capturas';

const i = process.argv.indexOf('--pagina');
const filtro = i > 0 ? process.argv[i + 1] : null;
const lista = pares(filtro ? PAGINAS.filter(([nome]) => nome === filtro) : PAGINAS);
if (!lista.length) {
  console.error(`página desconhecida: ${filtro} — as válidas estão em scripts/lib/capturas.mjs`);
  process.exit(1);
}

mkdirSync(SAIDA, { recursive: true });
// ponytail: o perfil temporário fica no %TEMP%; o Chrome ainda o trava ao sair.
const perfil = mkdtempSync(join(tmpdir(), 'capturas-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
let alvo;
for (let n = 0; n < 50 && !alvo; n++) {
  await espera(200);
  alvo = await fetch(`http://127.0.0.1:${PORTA}/json/list`)
    .then((r) => r.json())
    .then((l) => l.find((t) => t.type === 'page'))
    .catch(() => undefined);
}
if (!alvo) {
  chrome.kill();
  console.error(`o Chrome não abriu a porta ${PORTA} — confira o caminho em CHROME`);
  process.exit(1);
}

const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
let seq = 0;
const respostas = new Map();
const ouvintes = new Set();
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) { respostas.get(m.id)?.(m); respostas.delete(m.id); } else for (const f of ouvintes) f(m);
};
const cdp = (method, params = {}) => new Promise((ok, erro) => {
  const id = ++seq;
  respostas.set(id, (m) => (m.error ? erro(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const carregou = () => new Promise((ok) => {
  const f = (m) => { if (m.method === 'Page.loadEventFired') { ouvintes.delete(f); ok(); } };
  ouvintes.add(f);
});

async function capturar(url, largura, arquivo) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: 900, deviceScaleFactor: 1, mobile: largura < 768 });
  const pronto = carregou();
  await cdp('Page.navigate', { url });
  await Promise.race([pronto, espera(30_000)]);
  // Rolar até o fim dispara o carregamento preguiçoso; depois volta ao topo e tira o banner de cookies.
  await cdp('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
  await espera(1500);
  await cdp('Runtime.evaluate', {
    expression: `window.scrollTo(0, 0); document.querySelectorAll('[id^="cookiescript"]').forEach((e) => e.remove())`,
  });
  await espera(500);
  const { cssContentSize } = await cdp('Page.getLayoutMetrics');
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: largura, height: Math.ceil(cssContentSize.height), scale: 1 },
  });
  writeFileSync(join(SAIDA, arquivo), Buffer.from(data, 'base64'));
}

try {
  await cdp('Page.enable');
  for (const p of lista) {
    for (const lado of [p.antigo, p.novo]) {
      await capturar(lado.url, p.largura, lado.arquivo);
      console.log(lado.arquivo);
    }
  }
} finally {
  ws.close();
  chrome.kill();
}
// O relatório lista sempre todos os pares; com --pagina, só aquela foi refeita.
writeFileSync(join(SAIDA, 'index.html'), relatorio(pares()));
console.log(`\n${lista.length} pares em ${SAIDA}/ — abrir ${SAIDA}/index.html`);
