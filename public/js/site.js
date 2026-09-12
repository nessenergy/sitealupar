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

// A sanfona das páginas de conteúdo não está mais aqui: ela nasce fechada no
// próprio HTML, em `<details>`/`<summary>` (src/lib/acervo.ts). Fechar por
// script, depois da pintura, deslocava a página já mostrada — CLS 0,2972 em
// condicoes-de-uso, contra o gate de 0,1.

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
