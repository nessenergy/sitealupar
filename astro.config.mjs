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

  integrations: [sitemap()],
  build: { format: 'directory' },

  image: {
    // AVIF/WebP e srcset saem do build, não da disciplina de quem publica.
    responsiveStyles: true,
  },
});
