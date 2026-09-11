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
