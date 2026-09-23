/**
 * O vídeo do topo da home não faz laço: ao terminar, o player sai e a capa
 * fica, com o botão de reproduzir. Com `loop=1` o navegador baixava outra
 * passada do vídeo a cada volta (medido a 390 px: 10,1 MB até 120 s, 20,0 MB
 * até 260 s e ainda subindo; a crítica registrou 8,4 MB numa leitura longa).
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
