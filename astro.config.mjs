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
  vite: { build: { assetsInlineLimit: 0 } },

  image: {
    // AVIF/WebP e srcset saem do build, não da disciplina de quem publica.
    responsiveStyles: true,
  },
});
