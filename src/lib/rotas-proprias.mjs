/**
 * Rotas que `src/pages/` gera fora de `acervo/mapa-de-rotas.json`: a listagem
 * de vídeos e os dois avisos do contato, nos três idiomas.
 *
 * Uma lista só, lida por quem precisa saber que a página existe — o seletor de
 * idioma e o `hreflang` (src/layouts/Base.astro) e o gate de 301
 * (scripts/gerar-mapa-de-rotas.mjs). Duas listas divergiram uma vez: o
 * seletor mandava para a home páginas que tinham irmã no outro idioma.
 *
 * Fora daqui, de propósito: as páginas do arquivo de notícias, que dependem da
 * contagem do acervo (`paginasDoArquivo` em src/lib/acervo.ts), e a 404, que
 * não é versão de página nenhuma e não entra em `hreflang`.
 *
 * `.mjs` e não `.ts`: os scripts de Node importam sem passo de build.
 */
export const ROTAS_PROPRIAS = ['', '/en', '/es'].flatMap((prefixo) =>
  ['/videos/', '/contato/obrigado/', '/contato/nao-enviado/'].map((rota) => `${prefixo}${rota}`),
);
