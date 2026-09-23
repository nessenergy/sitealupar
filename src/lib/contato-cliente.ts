/**
 * Regras do formulário de contato no navegador. É a MESMA `validar` que a
 * Function usa (src/lib/contato.ts), mais a verificação antispam: o navegador
 * mostra a mensagem junto do campo, e o servidor continua sendo quem decide.
 */
import { validar, tokenValido, type Campo } from './contato.ts';

export type CampoComErro = Campo | 'verificacao';
export type Mensagens = Record<CampoComErro, string>;
export interface Erro { campo: CampoComErro; mensagem: string }

export function errosDoFormulario(d: Record<string, string | undefined>, m: Mensagens): Erro[] {
  const campos: CampoComErro[] = validar(d);
  // O widget do Turnstile só carrega na primeira interação; enviar antes de ele
  // responder posta sem token, e o servidor recusa.
  if (!tokenValido(d['cf-turnstile-response'])) campos.push('verificacao');
  return campos.map((campo) => ({ campo, mensagem: m[campo] }));
}
