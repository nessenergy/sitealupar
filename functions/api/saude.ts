/**
 * Diz se o caminho de envio do formulário de contato está de pé.
 *
 * Existe porque esse caminho falha em silêncio: chave revogada, domínio
 * desverificado, cota estourada ou um segredo apagado produzem a mesma tela de
 * "não foi possível enviar", e do nosso lado não acontece nada. O sentinela
 * pergunta aqui todo dia e abre issue quando a resposta é ruim.
 *
 * Fica atrás de um segredo, e sem ele responde 404 — não 401. Um 401 confirmaria
 * a quem varre a internet que existe algo aqui; o 404 não conta nada. O segredo
 * não protege dado nenhum (a resposta é só "bom" ou "ruim"), protege contra
 * alguém usar este endereço para disparar consultas à Resend em nosso nome.
 *
 * Só lê. Não envia e-mail de teste de propósito: um envio por dia a uma caixa
 * de verdade vira ruído que alguém desliga, e a caixa é da Alupar.
 */
import { avaliar, SEGREDOS } from '../../src/lib/saude';

interface Env {
  SAUDE_TOKEN?: string;
  TURNSTILE_SECRET?: string;
  RESEND_API_KEY?: string;
  CONTATO_REMETENTE?: string;
  CONTATO_DESTINO?: string;
}

/** Comparação de tempo constante: um `===` vaza o prefixo certo pelo relógio. */
function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const token = new URL(request.url).searchParams.get('t') ?? '';
  if (!env.SAUDE_TOKEN || !iguais(token, env.SAUDE_TOKEN)) {
    return new Response('Not found', { status: 404 });
  }

  const segredos = Object.fromEntries(SEGREDOS.map((n) => [n, Boolean(env[n])]));

  // Consulta de leitura: confirma que a chave vale sem escrever nada.
  let status: number | null = null;
  try {
    const r = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY ?? ''}` },
      signal: AbortSignal.timeout(10_000),
    });
    status = r.status;
  } catch {
    // segue como `null`, que `avaliar` trata como falha
  }

  const { ok, motivos } = avaliar(segredos, status);
  return new Response(ok ? 'ok\n' : `falha\n${motivos.join('\n')}\n`, {
    status: ok ? 200 : 503,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
