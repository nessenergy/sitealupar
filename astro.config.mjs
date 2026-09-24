// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import { ehCasca } from './src/lib/casca.mjs';

// Páginas-casca (anexos do WordPress) respondem 200, mas não entram no sitemap.
const cascas = new Set(
  JSON.parse(readFileSync(new URL('./acervo/mapa-de-rotas.json', import.meta.url), 'utf8')).rotas.filter(ehCasca).map((r) => r.rota),
);

export default defineConfig({
  site: 'https://www.alupar.com.br',

  // PT-BR sem prefixo (mantém as URLs atuais); EN e ES ganham rota própria,
  // no lugar do ?lang= do WPML — que hoje serve conteúdo traduzido dentro de
  // <html lang="pt-br">.
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en', 'es'],
    routing: { prefixDefaultLocale: false },
  },

  // As páginas de aviso do formulário (obrigado / não enviado) e as páginas-casca não entram no sitemap.
  integrations: [sitemap({
    filter: (pagina) => !/\/contato\/(obrigado|nao-enviado)\/$/.test(pagina) && !cascas.has(new URL(pagina).pathname),
  })],
  build: { format: 'directory' },

  // A CSP (public/_headers) só aceita `script-src 'self'`: sem isto o Astro
  // embute no HTML o script de componente que for pequeno, e o navegador o bloqueia.
  // Só `.js`: com um número (0) o Astro deixaria de embutir também o CSS pequeno
  // (`style-src` aceita 'unsafe-inline') e passaria a servi-lo em arquivo, +1 requisição por página.
  // `undefined` mantém a regra padrão (4 KB) para o resto.
  vite: {
    build: {
      assetsInlineLimit: (arquivo) => (arquivo.endsWith('.js') ? false : undefined),

      // Sem isto, o minificador do Astro 7 reescreve `@media (min-width: 768px)`
      // como `@media (width >= 768px)` — sintaxe de intervalo que Safari abaixo
      // de 16.4, Chrome abaixo de 104 e Firefox abaixo de 102 simplesmente
      // ignoram. Medido no upgrade: 205 das 377 consultas do build mudariam de
      // forma, ou seja, mais da metade do layout responsivo deixaria de valer
      // nesses navegadores, em silêncio. O alvo fica logo abaixo dessas versões.
      cssTarget: ['chrome100', 'safari15.4', 'firefox100', 'edge100'],
    },
  },

  image: {
    // AVIF/WebP e srcset saem do build, não da disciplina de quem publica.
    responsiveStyles: true,
  },
});
