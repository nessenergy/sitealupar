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

// Sanfona das páginas de conteúdo (.arconix-faq-wrap, do tema): as seções
// nascem fechadas, como no site atual. O título do tema é um <div>, que não
// recebe foco nem responde ao teclado — aqui o texto dele passa para um
// <button> de verdade, com aria-expanded e aria-controls.
//
// Sem JS nada se fecha e o texto inteiro fica à mostra: é o estado de hoje do
// site novo, e continua legível.
for (const [n, sanfona] of document.querySelectorAll('.arconix-faq-wrap').entries()) {
  const titulo = sanfona.querySelector('.arconix-faq-title');
  const conteudo = sanfona.querySelector('.arconix-faq-content');
  if (!titulo || !conteudo) continue;

  if (!conteudo.id) conteudo.id = `sanfona-${n + 1}`;
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'sanfona-botao';
  botao.setAttribute('aria-expanded', 'false');
  botao.setAttribute('aria-controls', conteudo.id);
  botao.append(...titulo.childNodes);
  titulo.append(botao);
  conteudo.hidden = true;

  botao.addEventListener('click', () => {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
    conteudo.hidden = aberto;
    titulo.classList.toggle('faq-open', !aberto);
    titulo.classList.toggle('faq-closed', aberto);
  });
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
