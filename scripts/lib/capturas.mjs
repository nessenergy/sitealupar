/**
 * Páginas e larguras da conferência visual (scripts/capturar-telas.mjs) e o
 * relatório que põe o site atual e o site novo lado a lado.
 */
export const ANTIGO = 'https://www.alupar.com.br';
// NOVO=http://localhost:8788 confere uma correção no build local antes do deploy.
export const NOVO = process.env.NOVO ?? 'https://sitealupar.pages.dev';
export const LARGURAS = [390, 768, 1280];

/* [nome, caminho no site atual, caminho no site novo] — um de cada modelo de
   página que o Marketing vai ver. O site atual põe o idioma em ?lang=. */
export const PAGINAS = [
  ['home', '/', '/'],
  ['home-en', '/?lang=en', '/en/'],
  ['home-es', '/?lang=es', '/es/'],
  ['empresas', '/empresas/', '/empresas/'],
  ['noticias', '/noticias/', '/noticias/'],
  ['noticia', '/noticia/ata-da-assembleia-geral-ordinaria-e-extraordinaria/', '/noticia/ata-da-assembleia-geral-ordinaria-e-extraordinaria/'],
  ['pesquisa', '/group/pesquisa-e-desenvolvimento/', '/group/pesquisa-e-desenvolvimento/'],
  ['faq', '/faq/projetos-de-pd-em-andamento/', '/faq/projetos-de-pd-em-andamento/'],
  ['condicoes-de-uso', '/politica-de-privacidade/condicoes-de-uso/', '/politica-de-privacidade/condicoes-de-uso/'],
  ['videos', '/video/video-institucional/', '/videos/'],
  ['contato', '/contato/', '/contato/'],
];

/** Um par por página e largura, com a URL e o arquivo de cada lado. */
export function pares(paginas = PAGINAS, larguras = LARGURAS) {
  return paginas.flatMap(([nome, antigo, novo]) =>
    larguras.map((largura) => ({
      nome,
      largura,
      antigo: { url: `${ANTIGO}${antigo}`, arquivo: `${nome}-${largura}-antigo.png` },
      novo: { url: `${NOVO}${novo}`, arquivo: `${nome}-${largura}-novo.png` },
    })),
  );
}

/** HTML com cada par lado a lado, na ordem da lista. */
export function relatorio(lista) {
  const blocos = lista.map((p) => `<section id="${p.nome}-${p.largura}">
<h2>${p.nome} · ${p.largura} px</h2>
<div class="par">
<figure><figcaption><a href="${p.antigo.url}">site atual</a></figcaption><img src="${p.antigo.arquivo}" alt="" loading="lazy"></figure>
<figure><figcaption><a href="${p.novo.url}">site novo</a></figcaption><img src="${p.novo.arquivo}" alt="" loading="lazy"></figure>
</div>
</section>`);
  return `<!doctype html><meta charset="utf-8"><title>Conferência visual</title>
<style>body{font:14px system-ui;margin:16px}.par{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}figure{margin:0}img{width:100%;border:1px solid #ccc}</style>
${blocos.join('\n')}
`;
}
