// src/lib/casca.mjs
/**
 * Página-casca: anexo do WordPress (um vídeo ou um PDF) que virou página só
 * para o endereço antigo continuar respondendo. O título é o nome do arquivo e
 * o corpo tem menos de 10 palavras. O endereço fica vivo, mas fora do índice:
 * nem `noindex`-ada precisa aparecer no sitemap.
 *
 * `.mjs` e sem dependência de propósito: o `astro.config.mjs` importa este
 * arquivo para montar o filtro do sitemap, e os testes o importam também.
 */
export const TIPOS_CASCA = new Set(['faq', 'pagina', 'video']);

export const ehCasca = (r) => TIPOS_CASCA.has(r.tipo) && r.palavras < 10;
