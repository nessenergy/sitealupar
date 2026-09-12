// Menu no celular. Sem JS o menu fica aberto e empilhado — nada se perde;
// com JS, recolhe atrás do botão.
const botao = document.querySelector('.alternar');
const menu = document.getElementById('menu-principal');
if (botao && menu) {
  botao.hidden = false;
  menu.dataset.recolhivel = '';
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
