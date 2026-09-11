/**
 * Recebe o formulário de contato: valida, confere o Turnstile e envia por
 * e-mail. Segredos só no ambiente do Pages — nunca no repositório.
 * Responde sempre com 303 para uma página estática: funciona sem JavaScript.
 */
import { validar } from '../../src/lib/contato';

interface Env {
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  CONTATO_DESTINO: string;
  CONTATO_REMETENTE: string;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const d = Object.fromEntries([...(await request.formData())].map(([k, v]) => [k, String(v)]));
  const prefixo = ['/', '/en/', '/es/'].includes(d.prefixo) ? d.prefixo : '/';
  const volta = (aviso: 'obrigado' | 'nao-enviado') =>
    Response.redirect(new URL(`${prefixo}contato/${aviso}/`, request.url).toString(), 303);

  if (validar(d).length) return volta('nao-enviado');

  const verificacao = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET,
      response: d['cf-turnstile-response'] ?? '',
      remoteip: request.headers.get('CF-Connecting-IP') ?? '',
    }),
  });
  if (!((await verificacao.json()) as { success: boolean }).success) return volta('nao-enviado');

  const envio = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTATO_REMETENTE,
      to: env.CONTATO_DESTINO,
      reply_to: d.email.trim(),
      subject: `[alupar.com.br] ${d.assunto.trim()}`,
      text: ['nome', 'email', 'empresa', 'telefone', 'assunto', 'mensagem'].map((k) => `${k}: ${d[k] ?? ''}`).join('\n'),
    }),
  });
  return volta(envio.ok ? 'obrigado' : 'nao-enviado');
}
