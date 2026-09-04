#!/usr/bin/env node
/**
 * Descobre, de fora, os redirecionamentos configurados na origem.
 *
 * O plugin Redirection está ativo no WordPress do institucional — aparece nos
 * namespaces do `wp-json`. As regras dele vivem no banco, ao qual não temos
 * acesso, e o fornecedor atual não as entrega. Mas toda regra ativa é
 * observável: basta pedir a URL e **não seguir** o redirecionamento.
 *
 * É essa a diferença para o `extrair-acervo.mjs`, que segue a cadeia e só
 * registra o destino final. Um 301 seguido some do inventário; aqui ele é o
 * dado.
 *
 * Sem isto, toda regra que a Alupar configurou nos últimos anos morre na
 * virada, silenciosamente — e o sintoma aparece semanas depois, como tráfego
 * que sumiu.
 *
 * Uso: node scripts/descobrir-redirects.mjs [--saida ARQ]
 */

import { writeFile } from 'node:fs/promises';

const BASE = 'https://www.alupar.com.br';
const CONCORRENCIA = 5;
const UA = 'Mozilla/5.0 (compatible; extracao-acervo-alupar/1.0)';
const args = process.argv.slice(2);
const saida = args.includes('--saida') ? args[args.indexOf('--saida') + 1] : 'acervo/redirects-origem.json';

/**
 * Candidatos. As URLs do sitemap cobrem o que o site publica; estas cobrem o
 * que ele *lembra* — endereços antigos que só existem numa regra de
 * redirecionamento e em links de terceiros.
 */
const CANDIDATOS = [
  // padrões do WordPress que costumam ter regra
  '/feed/', '/rss/', '/sitemap.xml', '/wp-sitemap.xml',
  '/index.php', '/home/', '/inicio/', '/pt/', '/br/',
  // as duplicatas que o diagnóstico apontou
  '/trabalhe-conosco-2/', '/faq-new/', '/sustentabilidade-2/',
  '/pesquisa-e-desenvolvimento/', '/inovacao-pesquisa-e-desenvolvimento/',
  // a galeria, hoje tratada por script embutido na página
  '/fotos', '/fotos/', '/galeria/', '/galeria-de-fotos/',
  // seções que podem ter mudado de nome
  '/noticias/', '/news/', '/noticias-2/', '/imprensa/', '/sala-de-imprensa/',
  '/a-companhia/', '/quem-somos/', '/sobre/', '/sobre-a-alupar/',
  '/contato/', '/contact/', '/fale-conosco/',
  '/investidores/', '/ri/', '/relacoes-com-investidores/',
  '/sustentabilidade/', '/sustainability/', '/meio-ambiente/',
  '/empresas/', '/nossas-empresas/', '/companies/',
  '/area-de-atuacao/', '/atuacao/', '/transmissao/', '/geracao/',
  '/compliance/', '/etica/', '/codigo-de-conduta/', '/canal-de-denuncias/',
  '/politica-de-privacidade/', '/privacidade/', '/termos-de-uso/',
  '/videos/', '/video/', '/midia/',
  // idiomas como caminho, que é o destino do site novo
  '/en/', '/es/', '/en', '/es',
];

const buscar = (caminho) =>
  fetch(BASE + caminho, {
    method: 'GET',
    redirect: 'manual',
    headers: { 'user-agent': UA, 'accept-language': 'pt-BR' },
  });

async function sondar(caminho) {
  try {
    const r = await buscar(caminho);
    const destino = r.headers.get('location');
    return {
      caminho,
      status: r.status,
      destino: destino ?? null,
      redireciona: r.status >= 300 && r.status < 400,
    };
  } catch (e) {
    return { caminho, status: 0, erro: String(e.message ?? e), redireciona: false };
  }
}

async function emLote(itens, tarefa) {
  const fila = [...itens];
  const saida = [];
  const trabalhar = async () => {
    while (fila.length) saida.push(await tarefa(fila.shift()));
  };
  await Promise.all(Array.from({ length: CONCORRENCIA }, trabalhar));
  return saida;
}

console.error(`Sondando ${CANDIDATOS.length} endereços, sem seguir redirecionamento...`);
const resultados = (await emLote(CANDIDATOS, sondar)).sort((a, b) =>
  a.caminho.localeCompare(b.caminho),
);

const redirecionam = resultados.filter((r) => r.redireciona);
const vivos = resultados.filter((r) => r.status === 200);
const mortos = resultados.filter((r) => r.status === 404);

await writeFile(
  saida,
  `${JSON.stringify(
    {
      sondadoEm: new Date().toISOString(),
      base: BASE,
      metodo: 'GET com redirect: manual — o 301 é o dado, não o obstáculo',
      total: resultados.length,
      redirecionam: redirecionam.length,
      resultados,
    },
    null,
    2,
  )}\n`,
);

console.log(`\n${redirecionam.length} redirecionam, ${vivos.length} respondem 200, ${mortos.length} não existem\n`);
for (const r of redirecionam) console.log(`  ${r.status}  ${r.caminho}  →  ${r.destino}`);
console.log(`\n→ ${saida}`);
