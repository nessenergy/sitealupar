// Menu no celular. Quem recolhe o menu é o CSS (Cabecalho.astro), desde a
// primeira pintura; aqui só se revela o botão e se liga o clique. Sem JS, o
// `<noscript><style>` do <head> (Base.astro) mantém o menu aberto.
const botao = document.querySelector('.alternar');
const menu = document.getElementById('menu-principal');
if (botao && menu) {
  botao.hidden = false;
  botao.addEventListener('click', () => {
    botao.setAttribute('aria-expanded', String(botao.getAttribute('aria-expanded') !== 'true'));
  });
}

// A sanfona das páginas de conteúdo não passa por aqui: o `<div>` do tema
// vira `<details>`/`<summary>` no build (src/lib/acervo.ts), e o navegador
// abre e fecha sozinho. Se um dia ela precisar de script, o lugar é lá —
// fechar por script depois da pintura desloca a página já mostrada.

// Turnstile sob demanda, pelo mesmo motivo do vídeo abaixo: o api.js da
// Cloudflare puxa por dentro de si ~580 KB depois de rodar — peso que o
// Lighthouse conta na página sem listar (629.754 / 656.918 / 674.678 B em três
// execuções de /contato/, contra o teto de 614.400 B do CI). Carregado na
// primeira interação com o formulário, esse pacote sai da carga da página e
// continua chegando antes de a pessoa terminar de preencher os campos.
//
// O contrato antispam não muda: quem recusa envio sem token válido, com ação e
// hostname conferidos, é functions/api/contato.ts. Sem JS não há widget nem
// token, o envio é recusado como sempre, e o <noscript> do formulário aponta o
// telefone e o e-mail da página.
const turnstile = document.querySelector('.cf-turnstile')?.closest('form');
if (turnstile) {
  // `focusin` cobre teclado e clique no campo; `pointerdown`/`touchstart`
  // cobrem o toque na área do botão, que não passa por foco em todo navegador.
  const gatilhos = ['focusin', 'pointerdown', 'touchstart'];
  const carregar = () => {
    // Idempotente: os três gatilhos saem no primeiro que disparar, então o
    // script é pedido uma vez só.
    for (const e of gatilhos) turnstile.removeEventListener(e, carregar);
    const api = document.createElement('script');
    api.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    api.async = true;
    api.defer = true;
    // No <head>, como era no HTML. O widget nasce no .cf-turnstile que já está
    // na página, pela classe (render implícito) — nada aqui mexe no foco nem na
    // ordem de tabulação.
    document.head.append(api);
  };
  for (const e of gatilhos) turnstile.addEventListener(e, carregar, { passive: true });
}

// Vídeo sob demanda: a capa é local e o player do YouTube (~1 MB) só carrega
// no clique. Sem JS, o link leva ao vídeo no YouTube.
for (const a of document.querySelectorAll('a[data-video]')) {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${a.dataset.video}?autoplay=1`;
    player.title = a.dataset.titulo;
    player.allow = 'autoplay; encrypted-media; picture-in-picture';
    player.allowFullscreen = true;
    player.className = 'video';
    a.replaceWith(player);
    player.focus();
  });
}

// Rotativo da home. Só existe quando a seção traz `data-rotativo`, o que só
// acontece com duas telas ou mais — com uma, a home serve um banner estático e
// nada aqui roda. É o mesmo princípio do Turnstile e do vídeo acima: peso e
// comportamento só entram quando há motivo.
//
// A pausa não é enfeite: a WCAG 2.2.2 exige um jeito de parar conteúdo que se
// move sozinho por mais de cinco segundos. Quem prefere menos movimento
// (prefers-reduced-motion) nem começa girando.
const rotativo = document.querySelector('[data-rotativo]');
if (rotativo) {
  const telas = [...rotativo.querySelectorAll('[data-tela]')];
  const botao = (nome) => rotativo.querySelector(`[data-rot="${nome}"]`);
  const pausar = botao('pausar');
  const INTERVALO = 7000;
  let atual = 0;
  let relogio = null;

  const mostrar = (i) => {
    atual = (i + telas.length) % telas.length;
    // `hidden` e não display:none no CSS: some do leitor de tela junto, e é o
    // mesmo estado que o HTML já entrega na primeira pintura.
    telas.forEach((t, n) => { t.hidden = n !== atual; });
  };

  const parar = () => { clearInterval(relogio); relogio = null; };
  const girar = () => { parar(); relogio = setInterval(() => mostrar(atual + 1), INTERVALO); };

  const anunciarPausa = (parado) => {
    pausar.setAttribute('aria-pressed', String(parado));
    pausar.setAttribute('aria-label', parado ? pausar.dataset.retomar : pausar.dataset.pausar);
    pausar.textContent = parado ? '▶' : '❚❚';
  };

  botao('anterior').addEventListener('click', () => { parar(); anunciarPausa(true); mostrar(atual - 1); });
  botao('proxima').addEventListener('click', () => { parar(); anunciarPausa(true); mostrar(atual + 1); });
  pausar.addEventListener('click', () => {
    if (relogio) { parar(); anunciarPausa(true); } else { girar(); anunciarPausa(false); }
  });

  // Quem está lendo ou navegando com teclado não perde a tela debaixo do dedo.
  for (const evento of ['mouseenter', 'focusin']) rotativo.addEventListener(evento, parar);
  for (const evento of ['mouseleave', 'focusout']) {
    rotativo.addEventListener(evento, () => { if (pausar.getAttribute('aria-pressed') === 'false') girar(); });
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) anunciarPausa(true);
  else { girar(); anunciarPausa(false); }
}

// Vídeo do topo da home. A capa é local e já está na página; o player do
// YouTube entra por aqui, tocando e mudo, para quem não pediu economia — e
// só no clique de quem pediu (prefers-reduced-motion ou modo de economia de
// dados), porque conteúdo que se move sozinho é justamente o que essas duas
// preferências recusam. Sem JS não há player nem botão: sobra a capa e o link
// para o YouTube que a página traz num <noscript>.
//
// O player nasce transparente e só aparece depois de responder ao aperto de
// mão da API (`listening`): rede que bloqueia o YouTube devolve, dentro do
// iframe, a página de erro do navegador — e ela cobriria a capa. Sem resposta
// em 8 s o iframe sai e a capa fica, com o botão voltando a "Reproduzir".
// (Teto conhecido: se o YouTube mudar o protocolo, o player fica invisível e a
// capa segue valendo; o `pauseVideo` abaixo depende do mesmo protocolo.)
//
// Sem laço: quando o vídeo termina o iframe sai, como na desistência acima. É
// o teto do peso da página — com `loop=1` o navegador baixava outra passada a
// cada volta (medido a 390 px: 10,1 MB até 120 s, 20,0 MB até 260 s, ainda
// subindo). `terminou` espelha src/lib/video-topo.ts, e o teste dele confere
// que as duas cópias respondem igual.
//
// O botão é o controle de pausa que a WCAG 2.2.2 exige para conteúdo em
// movimento por mais de cinco segundos. Os controles nativos estão desligados
// (`controls=0`) porque o recorte da faixa cortaria a barra deles. O estado
// vive no rótulo do botão ("Pausar vídeo" / "Reproduzir vídeo"): sem
// `aria-pressed` por cima, que faria o leitor de tela dizer o estado duas vezes.
const faixaVideo = document.querySelector('[data-video-topo]');
const botaoVideo = faixaVideo?.querySelector('button[data-pausar-video]');
if (faixaVideo && botaoVideo) {
  const { videoTopo: id, titulo } = faixaVideo.dataset;
  const YT = 'https://www.youtube-nocookie.com';
  const economiza = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
  let player = null;
  let tocando = !economiza;

  const terminou = (data) => {
    if (typeof data !== 'string') return false;
    try {
      const m = JSON.parse(data);
      if (m?.event === 'onStateChange') return m.info === 0;
      return m?.event === 'infoDelivery' && m.info?.playerState === 0;
    } catch { return false; }
  };
  const rotular = () => {
    botaoVideo.setAttribute('aria-label', tocando ? botaoVideo.dataset.pausar : botaoVideo.dataset.retomar);
    botaoVideo.textContent = tocando ? '❚❚' : '▶';
  };
  const comando = (func) => player?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), YT);
  const carregar = () => {
    const p = document.createElement('iframe');
    player = p;
    p.className = 'video video-topo';
    p.title = titulo;
    p.allow = 'autoplay; encrypted-media; picture-in-picture';
    p.allowFullscreen = true;
    p.src = `${YT}/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1`;
    botaoVideo.before(p);

    let pronto = false;
    const tentar = setInterval(() => p.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', YT), 400);
    const encerrar = () => {
      clearInterval(tentar);
      clearTimeout(desistir);
      removeEventListener('message', ouvir);
      p.remove();
      if (player === p) { player = null; tocando = false; rotular(); }
    };
    const desistir = setTimeout(encerrar, 8000);
    const ouvir = (e) => {
      if (e.source !== p.contentWindow) return;
      if (!pronto) {
        pronto = true;
        clearInterval(tentar);
        clearTimeout(desistir);
        p.classList.add('pronto');
        if (!tocando) comando('pauseVideo'); // pausou antes de o player responder
      }
      if (terminou(e.data)) encerrar();
    };
    addEventListener('message', ouvir);
  };

  botaoVideo.addEventListener('click', () => {
    tocando = !tocando;
    if (!player) carregar();
    else comando(tocando ? 'playVideo' : 'pauseVideo');
    rotular();
  });

  botaoVideo.hidden = false;
  rotular();
  if (!economiza) carregar();
}
