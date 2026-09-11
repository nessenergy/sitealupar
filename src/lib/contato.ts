/**
 * Validação do formulário de contato. O navegador aplica a mesma regra pelos
 * atributos do HTML, mas é esta que vale: a do navegador se contorna.
 */
export type Campo = 'nome' | 'email' | 'assunto' | 'mensagem' | 'consentimento';

export function validar(d: Record<string, string | undefined>): Campo[] {
  const erros: Campo[] = [];
  if (!d.nome?.trim()) erros.push('nome');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email?.trim() ?? '')) erros.push('email');
  if (!d.assunto?.trim()) erros.push('assunto');
  if ((d.mensagem ?? '').length > 5000) erros.push('mensagem');
  if (d.consentimento !== 'sim') erros.push('consentimento');
  return erros;
}

/** Ação do widget no formulário de contato — o backend exige a mesma. */
export const ACAO_CONTATO = 'contato';

export interface RespostaTurnstile { success: boolean; action?: string; hostname?: string }

/** Token do widget: texto não vazio de até 2.048 caracteres. */
export function tokenValido(token: unknown): token is string {
  return typeof token === 'string' && token.length > 0 && token.length <= 2048;
}

/**
 * Hostnames aceitos: a lista em TURNSTILE_HOSTNAMES, quando definida; senão, o
 * hostname do próprio pedido. Os previews do Pages mudam de endereço a cada
 * branch, e o formulário é enviado para a mesma origem onde o widget foi
 * resolvido — no Pages esse host é o roteado, não pode ser forjado.
 */
export function hostnamesAutorizados(lista: string | undefined, hostDoPedido: string): Set<string> {
  const definidos = (lista ?? '').split(',').map((h) => h.trim()).filter(Boolean);
  return new Set(definidos.length ? definidos : [hostDoPedido]);
}

/** Aprovado só com sucesso, a ação esperada e um hostname autorizado. */
export function turnstileAprovado(r: RespostaTurnstile, acao: string, hostnames: Set<string>): boolean {
  return r.success === true && r.action === acao && typeof r.hostname === 'string' && hostnames.has(r.hostname);
}
