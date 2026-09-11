/**
 * Para onde vai um endereço vivo do site atual que não virou página.
 *
 * Três regras, em ordem, e nenhuma inventa conteúdo:
 *   1. notícia sem corpo → listagem de notícias do idioma
 *   2. qualquer coisa sob /video/ ou /videos/ → listagem de vídeos do idioma
 *   3. o resto (anexo, casca vazia) → o ancestral mais próximo que resolve;
 *      sem nenhum, a home do idioma — que sempre existe
 */
export function destino(caminho, tipo, resolve) {
  const pre = /^\/(en|es)(?=\/)/.exec(caminho)?.[0] ?? '';
  const resto = caminho.slice(pre.length);
  const candidatos = [];
  if (tipo === 'noticia') candidatos.push(`${pre}/noticias/`);
  if (/^\/videos?\//.test(resto)) candidatos.push(`${pre}/videos/`);
  const segs = resto.split('/').filter(Boolean);
  for (let n = segs.length - 1; n > 0; n--) candidatos.push(`${pre}/${segs.slice(0, n).join('/')}/`);
  candidatos.push(`${pre}/`);

  const achado = candidatos.find((c) => c !== caminho && resolve(c));
  if (!achado) throw new Error(`sem destino para ${caminho}`);
  return achado;
}
