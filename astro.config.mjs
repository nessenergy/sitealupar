// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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

  // As páginas de aviso do formulário (obrigado / não enviado) não entram no sitemap.
  integrations: [sitemap({ filter: (pagina) => !/\/contato\/(obrigado|nao-enviado)\/$/.test(pagina) })],
  build: { format: 'directory' },

  // A CSP (public/_headers) só aceita `script-src 'self'`: sem isto o Astro
  // embute no HTML o script de componente que for pequeno, e o navegador o bloqueia.
  // Só `.js`: com um número (0) o Astro deixaria de embutir também o CSS pequeno
  // (`style-src` aceita 'unsafe-inline') e passaria a servi-lo em arquivo, +1 requisição por página.
  // `undefined` mantém a regra padrão (4 KB) para o resto.
  vite: { build: { assetsInlineLimit: (arquivo) => (arquivo.endsWith('.js') ? false : undefined) } },

  image: {
    // AVIF/WebP e srcset saem do build, não da disciplina de quem publica.
    responsiveStyles: true,
  },
});
