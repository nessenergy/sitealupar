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
  let prefixo = '/';
  const volta = (aviso: 'obrigado' | 'nao-enviado') =>
    Response.redirect(new URL(`${prefixo}contato/${aviso}/`, request.url).toString(), 303);

  // Corpo que não é formulário (POST cru, multipart truncado) volta para o
  // aviso como qualquer outra falha, em vez de estourar em erro 500.
  let d: Record<string, string>;
  try {
    d = Object.fromEntries([...(await request.formData())].map(([k, v]) => [k, String(v)]));
  } catch {
    return volta('nao-enviado');
  }
  if (['/', '/en/', '/es/'].includes(d.prefixo)) prefixo = d.prefixo;

  if (validar(d).length) return volta('nao-enviado');

  // Siteverify fora do ar ou respondendo algo que não é JSON: não confirmado.
  let confirmado = false;
  try {
    const verificacao = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: d['cf-turnstile-response'] ?? '',
        remoteip: request.headers.get('CF-Connecting-IP') ?? '',
      }),
    });
    confirmado = ((await verificacao.json()) as { success?: boolean }).success === true;
  } catch {
    // segue como não confirmado
  }
  if (!confirmado) return volta('nao-enviado');

  // Quebra de linha no assunto é o vetor clássico de injeção de cabeçalho de e-mail.
  const assunto = d.assunto.replace(/[\r\n\t]+/g, ' ').trim();

  const envio = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTATO_REMETENTE,
      to: env.CONTATO_DESTINO,
      reply_to: d.email.trim(),
      subject: `[alupar.com.br] ${assunto}`,
      text: ['nome', 'email', 'empresa', 'telefone', 'assunto', 'mensagem'].map((k) => `${k}: ${d[k] ?? ''}`).join('\n'),
    }),
  }).catch(() => null);
  return volta(envio?.ok ? 'obrigado' : 'nao-enviado');
}
