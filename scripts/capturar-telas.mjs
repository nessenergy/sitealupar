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
 * O Chrome não captura além de 16 384 px de altura: numa página mais alta que
 * isso, tudo o que passa do limite sai como repetição do topo. A captura para
 * no limite e avisa quanto sobrou. Para ver o que sobrou, `--de <y>` desloca a
 * origem do recorte:
 *
 *   node scripts/capturar-telas.mjs --pagina empresas --de 16384
 *
 * O deslocamento entra no nome do arquivo (empresas-1280-novo-de16384.png),
 * então a captura de baixo não sobrescreve a de cima e as duas podem ser
 * comparadas lado a lado. Com `--de`, o relatório não muda: ele lista sempre
 * os pares do topo.
 *
 * Saída em capturas/ (fora do git): <página>-<largura>-{antigo,novo}.png e
 * capturas/index.html com cada par lado a lado.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PAGINAS, pares, relatorio } from './lib/capturas.mjs';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9333;
const SAIDA = 'capturas';
/* Teto de altura de `Page.captureScreenshot`. Acima dele o Chrome não recusa:
   preenche o excedente repetindo o topo da página, e a imagem passa por boa. */
const LIMITE = 16_384;

const i = process.argv.indexOf('--pagina');
const filtro = i > 0 ? process.argv[i + 1] : null;
const lista = pares(filtro ? PAGINAS.filter(([nome]) => nome === filtro) : PAGINAS);
if (!lista.length) {
  console.error(`página desconhecida: ${filtro} — as válidas estão em scripts/lib/capturas.mjs`);
  process.exit(1);
}

const j = process.argv.indexOf('--de');
const DE = j > 0 ? Number(process.argv[j + 1]) : 0;
if (!Number.isFinite(DE) || DE < 0) {
  console.error(`--de espera uma altura em pixels, não ${process.argv[j + 1]}`);
  process.exit(1);
}

mkdirSync(SAIDA, { recursive: true });
// ponytail: o perfil temporário fica no %TEMP%; o Chrome ainda o trava ao sair.
const perfil = mkdtempSync(join(tmpdir(), 'capturas-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
/* Espera com cancelamento: um temporizador que perde a corrida e não é
   cancelado segura o processo vivo até disparar — 30 s depois do último log. */
const prazo = (ms, valor) => {
  let t;
  return { promessa: new Promise((ok) => { t = setTimeout(() => ok(valor), ms); }), cancelar: () => clearTimeout(t) };
};

/* chrome.kill() no Windows mata só o processo pai; os filhos (renderer, GPU)
   ficam vivos e seguram o perfil temporário. */
const encerrarChrome = () => {
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  else chrome.kill();
};

let alvo;
for (let n = 0; n < 50 && !alvo; n++) {
  await espera(200);
  alvo = await fetch(`http://127.0.0.1:${PORTA}/json/list`)
    .then((r) => r.json())
    .then((l) => l.find((t) => t.type === 'page'))
    .catch(() => undefined);
}
if (!alvo) {
  encerrarChrome();
  console.error(`o Chrome não abriu a porta ${PORTA} — confira o caminho em CHROME`);
  process.exit(1);
}

let ws;
let seq = 0;
const respostas = new Map();
const ouvintes = new Set();
const cdp = (method, params = {}) => new Promise((ok, erro) => {
  const id = ++seq;
  respostas.set(id, {
    resolver: (m) => (m.error ? erro(new Error(`${method}: ${m.error.message}`)) : ok(m.result)),
    rejeitar: erro,
  });
  ws.send(JSON.stringify({ id, method, params }));
});
/* Um comando pendente só é resolvido pelo `onmessage`. Se o socket cair antes
   da resposta, ninguém o resolve: o `await` fica pendurado para sempre, o
   `finally` não roda e o Chrome sobrevive ao processo. */
const abortar = (motivo) => {
  const erro = new Error(motivo);
  for (const pendente of respostas.values()) pendente.rejeitar(erro);
  respostas.clear();
};
const carregou = () => {
  let f;
  const promessa = new Promise((ok) => {
    f = (m) => { if (m.method === 'Page.loadEventFired') { ouvintes.delete(f); ok('carregou'); } };
    ouvintes.add(f);
  });
  // Quem desiste de esperar tira o ouvinte: sem isso a página seguinte
  // resolveria a espera da anterior.
  return { promessa, descartar: () => ouvintes.delete(f) };
};

async function capturar(url, largura, arquivo, de = 0) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: 900, deviceScaleFactor: 1, mobile: largura < 768 });
  const carga = carregou();
  const limite = prazo(30_000, 'estourou');
  await cdp('Page.navigate', { url });
  const desfecho = await Promise.race([carga.promessa, limite.promessa]);
  limite.cancelar();
  carga.descartar();
  // A captura continua mesmo sem o `load`: imagem parcial com aviso serve para
  // alguma coisa. O que o aviso proíbe é tomar essa imagem por conferência —
  // as "leituras limitadas" de docs/conferencia-visual.md nasceram assim,
  // caladas.
  if (desfecho === 'estourou') {
    console.warn(`AVISO: ${arquivo} — a página não disparou "load" em 30 s (${url}); a captura pode sair incompleta`);
  }
  // Rolar até o fim dispara o carregamento preguiçoso; depois volta ao topo e tira o banner de cookies.
  await cdp('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
  await espera(1500);
  await cdp('Runtime.evaluate', {
    expression: `window.scrollTo(0, 0); document.querySelectorAll('[id^="cookiescript"]').forEach((e) => e.remove())`,
  });
  await espera(500);
  const { cssContentSize } = await cdp('Page.getLayoutMetrics');
  const altura = Math.ceil(cssContentSize.height);
  const restante = altura - de;
  if (restante <= 0) {
    console.warn(`AVISO: ${arquivo} — a página tem ${altura} px e "--de ${de}" começa depois do fim dela; nada capturado`);
    return;
  }
  const recorte = Math.min(restante, LIMITE);
  if (recorte < restante) {
    console.warn(`AVISO: ${arquivo} — a página tem ${altura} px e a captura para em ${de + recorte} px (limite do Chrome); o resto sai com "--de ${de + recorte}"`);
  }
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: de, width: largura, height: recorte, scale: 1 },
  });
  writeFileSync(join(SAIDA, arquivo), Buffer.from(data, 'base64'));
  // Quem grava é quem anuncia: fora daqui não dá para saber se o arquivo saiu,
  // e um nome impresso à toa é o mesmo silêncio que o aviso de carga eliminou.
  console.log(arquivo);
}

try {
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((ok, erro) => {
    const temporizador = setTimeout(() => erro(new Error('o Chrome não aceitou a conexão de depuração em 10 s')), 10_000);
    ws.onopen = () => { clearTimeout(temporizador); ok(); };
    ws.onerror = (e) => { clearTimeout(temporizador); erro(e); };
  });
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.id) { respostas.get(m.id)?.resolver(m); respostas.delete(m.id); } else for (const f of ouvintes) f(m);
  };
  // Só depois do `open`: até aqui o `onerror` é o que recusa a conexão.
  ws.onclose = () => abortar('a conexão de depuração com o Chrome fechou antes da resposta ao comando');
  ws.onerror = (e) => abortar(`a conexão de depuração com o Chrome falhou: ${e?.message ?? e?.type ?? 'motivo não informado'}`);
  await cdp('Page.enable');
  for (const p of lista) {
    for (const lado of [p.antigo, p.novo]) {
      const arquivo = DE ? lado.arquivo.replace(/\.png$/, `-de${DE}.png`) : lado.arquivo;
      await capturar(lado.url, p.largura, arquivo, DE);
    }
  }
} finally {
  ws?.close();
  encerrarChrome();
}
// O relatório lista sempre todos os pares; com --pagina, só aquela foi refeita.
writeFileSync(join(SAIDA, 'index.html'), relatorio(pares()));
console.log(`\n${lista.length} pares em ${SAIDA}/ — abrir ${SAIDA}/index.html`);
