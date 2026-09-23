/**
 * Para onde vai um endereço vivo do site atual que não virou página.
 *
 * Três regras, em ordem, e nenhuma inventa conteúdo:
 *   1. notícia → listagem do portal de RI (externa; a área saiu do ar)
 *   2. qualquer coisa sob /video/ ou /videos/ → listagem de vídeos do idioma
 *   3. o resto (anexo, casca vazia) → o ancestral mais próximo que resolve;
 *      sem nenhum, a home do idioma — que sempre existe
 */

/**
 * Notícia não vira mais página: a Alupar desativou a área em 16/09/2026
 * ("as notícias estão antigas… desativar mesmo") e o feed já era para vir do
 * RI desde a D5. O destino é absoluto e fica num domínio que não é nosso —
 * por isso ele é conferido todo dia pelo sentinela.
 */
export const LISTAGEM_DO_RI = 'https://ri.alupar.com.br/noticias/';

export function destino(caminho, tipo, resolve) {
  /* Regra 1: notícia sai do site e vai para o portal de RI. Sem passar por
     `resolve`: o destino é externo e não é servido pelo nosso build. */
  if (tipo === 'noticia') return LISTAGEM_DO_RI;

  const pre = /^\/(en|es)(?=\/)/.exec(caminho)?.[0] ?? '';
  const resto = caminho.slice(pre.length);
  const candidatos = [];
  if (/^\/videos?\//.test(resto)) candidatos.push(`${pre}/videos/`);
  const segs = resto.split('/').filter(Boolean);
  for (let n = segs.length - 1; n > 0; n--) candidatos.push(`${pre}/${segs.slice(0, n).join('/')}/`);
  candidatos.push(`${pre}/`);

  const achado = candidatos.find((c) => c !== caminho && resolve(c));
  if (!achado) throw new Error(`sem destino para ${caminho}`);
  return achado;
}
