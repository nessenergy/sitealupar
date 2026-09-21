/**
 * O vídeo do topo da home não faz laço: ao terminar, o player sai e a capa
 * fica, com o botão de reproduzir. Sem isso o navegador baixa o vídeo para
 * sempre (8,4 MB medidos numa leitura longa, contra o teto de 3 MB da D18).
 *
 * O YouTube avisa o fim pela API de postMessage: `onStateChange` traz o estado
 * em `info`; `infoDelivery` traz em `info.playerState`. Estado 0 é "encerrado".
 * `public/js/site.js` espelha esta função (é um script clássico, não importa
 * módulo): mudou aqui, muda lá.
 */
export function terminou(data: unknown): boolean {
  if (typeof data !== 'string') return false;
  try {
    const m = JSON.parse(data);
    if (m?.event === 'onStateChange') return m.info === 0;
    return m?.event === 'infoDelivery' && m.info?.playerState === 0;
  } catch {
    return false;
  }
}
