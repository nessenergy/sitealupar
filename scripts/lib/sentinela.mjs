/**
 * Julgamento de cada host do sentinela diário (`.github/workflows/sentinela.yml`).
 *
 * Função pura: recebe o que `curl` e `openssl` devolveram sobre um host e diz
 * se aquilo reprova o dia. Quem fala com a rede é scripts/verificar-hosts.mjs.
 *
 * Existe porque o sentinela nasceu vermelho: o `www` da origem responde 200
 * no navegador e reprova em cliente estrito, e um alarme que soa todo dia
 * deixa de ser lido — justamente antes de o curinga `*.alupar.com.br` vencer.
 */

/** Dias de antecedência do alerta de vencimento de certificado. */
export const ALERTA_DIAS = 30;

/**
 * A origem servida pela MZ manda o certificado folha duas vezes e nunca o
 * intermediário da GoDaddy. Cliente estrito reprova com "unable to get local
 * issuer certificate" (curl 60); navegador e curl com o repositório do
 * sistema abrem normalmente. Não temos acesso àquele servidor para corrigir,
 * e o defeito morre na virada, quando o host passa ao Cloudflare — por isso a
 * tolerância é só deste host e só antes dela.
 */
export const ORIGEM_SEM_CADEIA = 'www.alupar.com.br';

/** Exit code do curl para problema de certificado do par. */
const CURL_CERTIFICADO = 60;

const DIA = 86_400_000;

/**
 * @param {object} e
 * @param {string} e.host
 * @param {string} [e.caminho]   caminho a pedir; '/' por padrão
 * @param {string} e.codigo      código HTTP, ou 'erro' quando o curl falhou
 * @param {number} e.saidaCurl   exit code do curl
 * @param {string} e.fim         data de `openssl x509 -enddate`, ou '' se não veio
 * @param {Date}   [e.agora]
 * @param {boolean} [e.virada]   o domínio já aponta para o site novo
 * @returns {{ok: boolean, estado: string, dias: number|null, mensagem: string}}
 */
export function avaliar({ host, caminho = '/', codigo, saidaCurl, fim, agora = new Date(), virada = false }) {
  const vencimento = fim ? new Date(fim) : null;
  const dias =
    vencimento && !Number.isNaN(vencimento.getTime())
      ? Math.floor((vencimento.getTime() - agora.getTime()) / DIA)
      : null;

  const cadeiaIncompleta = saidaCurl === CURL_CERTIFICADO;
  const respondeu = saidaCurl === 0 && ['200', '301', '302'].includes(String(codigo));
  // Só o host conhecido, e só enquanto o servidor for do fornecedor que sai.
  const toleraCadeia = cadeiaIncompleta && host === ORIGEM_SEM_CADEIA && !virada;

  let estado;
  if (dias === null) estado = 'sem-certificado';
  else if (cadeiaIncompleta) estado = 'cadeia-incompleta';
  else if (!respondeu) estado = 'sem-resposta';
  else estado = 'ok';

  /*
   * O vencimento vale mesmo com a cadeia quebrada: é o sinal que o alarme
   * existe para dar, e perdê-lo por causa de um defeito conhecido da origem
   * seria trocar um ruído por um silêncio pior.
   */
  if (dias !== null && dias < ALERTA_DIAS) estado = 'certificado-vencendo';

  const ok =
    estado === 'ok' || (estado === 'cadeia-incompleta' && toleraCadeia);

  const prazo = dias === null ? 'sem certificado legível' : `certificado vence em ${dias} dias (${fim})`;
  const nota = estado === 'cadeia-incompleta' && toleraCadeia ? ' · conhecido, sai na virada' : '';
  /* O caminho entra no relato porque há host cuja saúde se mede numa página,
     não na raiz: o destino dos 301 de notícia (D16) é /noticias/ do portal de
     RI, e a raiz dele pode estar de pé com aquela página fora do ar. */
  const alvo = caminho === '/' ? host : `${host}${caminho}`;
  const mensagem = `${ok ? 'ok  ' : 'FALHA'} ${alvo} → HTTP ${codigo} · ${estado} · ${prazo}${nota}`;

  return { ok, estado, dias, mensagem };
}
