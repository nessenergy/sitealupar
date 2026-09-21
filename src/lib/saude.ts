/**
 * Saúde do caminho de envio do formulário de contato.
 *
 * O formulário falha em silêncio: quem preenche vê "não foi possível enviar" e
 * vai embora, e do nosso lado não acontece nada. Chave revogada, domínio de
 * envio desverificado, cota estourada ou um segredo apagado por engano
 * produzem exatamente essa tela, e ninguém do projeto fica sabendo.
 *
 * Isto é o julgamento, puro e testável. Quem fala com a rede é
 * `functions/api/saude.ts`, e quem pergunta todo dia é o sentinela.
 *
 * O que NÃO está aqui, de propósito: enviar e-mail de teste. Um envio por dia a
 * uma caixa de verdade vira ruído que alguém desliga, e a caixa de destino é da
 * Alupar. A consulta de leitura pega as falhas que importam sem escrever nada.
 */

/** Nome dos segredos sem os quais o envio não acontece. */
export const SEGREDOS = ['TURNSTILE_SECRET', 'RESEND_API_KEY', 'CONTATO_REMETENTE', 'CONTATO_DESTINO'] as const;

export interface Diagnostico {
  ok: boolean;
  motivos: string[];
}

/**
 * @param segredos  presença de cada segredo no ambiente, por nome
 * @param resend    status HTTP da consulta de leitura à Resend, ou null se a
 *                  chamada nem chegou a responder
 */
export function avaliar(segredos: Record<string, boolean>, resend: number | null): Diagnostico {
  const motivos: string[] = [];

  for (const nome of SEGREDOS) {
    if (!segredos[nome]) motivos.push(`segredo ausente: ${nome}`);
  }

  /*
   * 401 e 403 são chave revogada ou sem permissão — o caso que mais importa,
   * porque acontece sozinho quando alguém gira a chave e esquece deste lado.
   * 429 é cota: o envio ainda funciona, mas está prestes a parar. Rede caída
   * conta como falha: se não dá para perguntar, não dá para afirmar que está
   * bom, e um verificador que se cala na dúvida é pior que nenhum.
   */
  if (resend === null) motivos.push('a Resend não respondeu');
  else if (resend === 401 || resend === 403) motivos.push(`a Resend recusou a chave (HTTP ${resend})`);
  else if (resend === 429) motivos.push('a Resend está limitando por cota (HTTP 429)');
  else if (resend >= 500) motivos.push(`a Resend está com problema (HTTP ${resend})`);
  else if (resend >= 400) motivos.push(`a Resend respondeu HTTP ${resend}`);

  return { ok: motivos.length === 0, motivos };
}
