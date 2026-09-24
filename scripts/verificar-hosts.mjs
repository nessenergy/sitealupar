/**
 * Sentinela: cada host responde no caminho que importa e tem certificado
 * longe do vencimento.
 *
 * Roda todo dia pelo `.github/workflows/sentinela.yml`. O julgamento de cada
 * host é de scripts/lib/sentinela.mjs, que é testado; aqui só se fala com a
 * rede e se imprime o relato.
 *
 *   node scripts/verificar-hosts.mjs            # os hosts do site
 *   VIRADA=sim node scripts/verificar-hosts.mjs # depois da virada: sem tolerância
 */
import { spawnSync } from 'node:child_process';
import { devNull } from 'node:os';
import { avaliar } from './lib/sentinela.mjs';
import { listagemDoRi } from './lib/continuidade.mjs';

/* [host, caminho]. O caminho importa em um caso: o portal de RI é o destino
   dos 301 de notícia (D16) e é mantido por outra equipe — a raiz dele pode
   responder com /noticias/ fora do ar, e aí 186 endereços nossos viram 404.
   O endereço vem de continuidade.mjs para que vigiar e redirecionar não
   possam divergir. */
/* Os dois destinos reais dos 301 de notícia, um por idioma (o espanhol cai no
   português). Vigiar só um deixaria o outro quebrar em silêncio. */
const DESTINOS_DAS_NOTICIAS = ['pt', 'en'].map((i) => new URL(listagemDoRi(i)));
const HOSTS = [
  ['alupar.com.br', '/'],
  ['www.alupar.com.br', '/'],
  ['alupar.us6.quickconnect.to', '/'], // galeria de fotos no NAS (D4)
  ...DESTINOS_DAS_NOTICIAS.map((u) => [u.host, u.pathname]),
];
const ESPERA = 20;

/** Código HTTP e exit code do curl. */
function pedir(host, caminho) {
  const r = spawnSync(
    'curl',
    // devNull, e não '/dev/null': quem roda isto à mão está no Windows.
    ['-sS', '-o', devNull, '-w', '%{http_code}', '--max-time', String(ESPERA), `https://${host}${caminho}`],
    { encoding: 'utf8' },
  );
  return { codigo: r.status === 0 ? r.stdout.trim() : 'erro', saidaCurl: r.status ?? 1 };
}

/** Data de validade do certificado servido, ou '' se não deu para ler. */
function vencimento(host) {
  // openssl s_client não verifica a cadeia por padrão: lê o certificado mesmo
  // quando o cliente estrito recusaria a conexão — que é o caso do `www`.
  const s = spawnSync(
    'sh',
    [
      '-c',
      `echo | openssl s_client -servername ${host} -connect ${host}:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null`,
    ],
    { encoding: 'utf8', timeout: ESPERA * 1000 },
  );
  return (s.stdout ?? '').trim().replace(/^notAfter=/, '');
}

const virada = process.env.VIRADA === 'sim';
let falhou = false;

for (const [host, caminho] of HOSTS) {
  const { codigo, saidaCurl } = pedir(host, caminho);
  const r = avaliar({ host, caminho, codigo, saidaCurl, fim: vencimento(host), virada });
  console.log(r.mensagem);
  if (!r.ok) falhou = true;
}

process.exit(falhou ? 1 : 0);
