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
 *
 * **Por idioma, desde 24/09/2026.** Até então os três idiomas caíam na mesma
 * listagem em português, e quem lia em inglês chegava num texto que não lê.
 * Medido no portal naquele dia:
 *
 * - `/pt/noticias/` → 200. É o caminho canônico: `/noticias/` sem idioma
 *   responde 302 para ele, e apontar direto corta um salto em 186 endereços.
 * - `/en/noticias/` → 200.
 * - `/es/noticias/` → 302 → `/pt/es/noticias/` → 302 → **`/pt/not-found`**.
 *   A listagem em espanhol não existe, então o espanhol vai para a portuguesa:
 *   trocar uma página em outro idioma por uma página de erro seria piorar. No
 *   dia em que eles a publicarem, muda-se uma linha.
 */
const LISTAGENS = { pt: 'https://ri.alupar.com.br/pt/noticias/', en: 'https://ri.alupar.com.br/en/noticias/' };

/** Listagem do portal de RI no idioma pedido; espanhol cai na portuguesa. */
export function listagemDoRi(idioma) {
  return LISTAGENS[idioma] ?? LISTAGENS.pt;
}

/** O destino em português, que é o canônico. Mantido para quem só precisa de um. */
export const LISTAGEM_DO_RI = LISTAGENS.pt;

export function destino(caminho, tipo, resolve) {
  /* Regra 1: notícia sai do site e vai para o portal de RI. Sem passar por
     `resolve`: o destino é externo e não é servido pelo nosso build. */
  if (tipo === 'noticia') return listagemDoRi(/^\/(en|es)(?=\/)/.exec(caminho)?.[1] ?? 'pt');

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
