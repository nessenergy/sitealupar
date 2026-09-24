/**
 * Decide se uma mudança pode alterar o HTML que o visitante recebe — ou seja,
 * se o Lighthouse precisa rodar.
 *
 * **Por que existe.** O job `qualidade` custa ~12 minutos (12 URLs × 3
 * execuções no desktop, mais 6 × 2 no celular); o resto do CI custa 40
 * segundos. Em 24/09/2026, seis execuções rodaram o gate inteiro sobre
 * mudanças em `docs/`, que não entram no build: ~78 minutos medindo um
 * `dist/` idêntico ao anterior.
 *
 * **Por que com teste.** Errar para o lado do "pula" é muito pior que o
 * desperdício: a regressão de SEO daquele mesmo dia nasceu em
 * `public/robots.txt`. Uma lista dessas escondida numa condição de YAML
 * envelhece sem ninguém ver; aqui ela tem nome, motivo e teste.
 *
 * Na dúvida, roda: o padrão é medir.
 */

/** Caminhos cujo conteúdo chega ao visitante, ou que decidem como ele chega. */
const AFETAM = [
  /^src\//,            // páginas, componentes, layout, estilos
  /^public\//,         // servido como está: robots, headers, redirects, fontes
  /^acervo\//,         // o conteúdo e o mapa de rotas de onde as páginas saem
  /^astro\.config\./,  // o que o build gera, e como
  /^package(-lock)?\.json$/, // versão de dependência muda o que é servido
  /^lighthouserc.*\.json$/,  // quem mexe no portão é medido pelo portão
  /^\.github\/workflows\//,  // idem: mudar o CI exige o CI
];

/**
 * @param {string[] | null | undefined} arquivos caminhos relativos à raiz.
 * @returns {boolean} `true` quando o gate deve rodar. Lista vazia ou ausente
 *   devolve `true` de propósito: sem saber o que mudou, medir é o seguro.
 */
export function afetaOSite(arquivos) {
  if (!arquivos?.length) return true;
  return arquivos.some((a) => AFETAM.some((padrao) => padrao.test(a.trim())));
}
