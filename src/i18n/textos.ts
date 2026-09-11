/**
 * Textos da interface nos três idiomas.
 *
 * **Procedência.** Os títulos de seção e o `<title>` foram lidos do site atual,
 * nas três versões, e estão em `acervo/` — não são tradução nossa. O site
 * imprime `NOTÍCIAS` / `NEWS` / `NOTICIAS` em caixa alta por CSS; aqui ficam em
 * caixa normal, e a caixa alta volta na folha de estilo, para que o leitor de
 * tela não soletre a palavra.
 *
 * **O que é novo.** A `descricao` não existe em nenhum dos três idiomas no site
 * atual — nenhuma página tem `meta description`. As três abaixo são redação
 * nova e **dependem de aprovação da Comunicação** antes do go-live, como todo
 * texto novo (o escopo não inclui redação de conteúdo).
 */

export const IDIOMAS = ['pt-br', 'en', 'es'] as const;
export type Idioma = (typeof IDIOMAS)[number];

/** Prefixo de rota. O padrão não leva prefixo, para preservar as URLs atuais. */
export const prefixo: Record<Idioma, string> = {
  'pt-br': '',
  en: '/en',
  es: '/es',
};

/** `lang` do documento. Hoje o site serve os três dentro de `pt-br`. */
export const lang: Record<Idioma, string> = {
  'pt-br': 'pt-BR',
  en: 'en',
  es: 'es',
};

interface Textos {
  titulo: string;
  descricao: string;
  pularParaConteudo: string;
  destaques: string;
  emNumeros: string;
  noticias: string;
  videoInstitucional: string;
  videos: string;
  sustentabilidade: string;
  indicadores: { paises: string; rating: string; linhas: string; capacidade: string };
  idioma: string;
  logo: string;
  menu: { rotulo: string; itens: { rotulo: string; href: string }[] };
  ri: string;
  novaAba: string;
  rodape: {
    direitos: string; privacidade: string; privacidadeHref: string;
    conduta: string; condutaHref: string; terceiros: string; denuncias: string; topo: string;
  };
}

export const textos: Record<Idioma, Textos> = {
  'pt-br': {
    titulo: 'Alupar — Institucional',
    descricao:
      'A Alupar atua em transmissão e geração de energia no Brasil, na Colômbia, no Peru e no Chile.',
    pularParaConteudo: 'Pular para o conteúdo',
    destaques: 'Destaques',
    emNumeros: 'A Alupar em números',
    noticias: 'Notícias',
    videoInstitucional: 'Vídeo institucional',
    videos: 'Vídeos',
    sustentabilidade: 'Sustentabilidade',
    indicadores: {
      linhas: 'km de linhas de transmissão',
      paises: 'países: Brasil, Colômbia, Peru e Chile',
      capacidade: 'MW de capacidade instalada',
      rating: 'rating em escala nacional, Fitch',
    },
    idioma: 'Idioma',
    logo: 'Alupar — página inicial', // novo
    menu: {
      rotulo: 'Menu',
      itens: [
        { rotulo: 'A Companhia', href: '/a-companhia/' },
        { rotulo: 'Área de atuação', href: '/area-de-atuacao/' },
        { rotulo: 'Empresas', href: '/empresas/' },
        { rotulo: 'Inovação e P&D', href: '/inovacao-pesquisa-e-desenvolvimento/' },
        { rotulo: 'Trabalhe Conosco', href: 'https://alupar.gupy.io/' },
        { rotulo: 'Contato', href: '/contato/' },
      ],
    },
    ri: 'Relações com Investidores',
    novaAba: 'abre em nova aba',
    rodape: {
      direitos: 'Todos os direitos reservados',
      privacidade: 'Política de Privacidade', privacidadeHref: '/politica-de-privacidade/',
      conduta: 'Código de Conduta', condutaHref: 'https://arquivos.alupar.com.br/documentos/codigo-de-conduta.pdf',
      terceiros: 'Código de Conduta de Terceiros', denuncias: 'Canal de Denúncias',
      topo: 'Voltar ao topo', // novo
    },
  },
  en: {
    titulo: 'Alupar — Institutional',
    descricao:
      'Alupar operates in power transmission and generation in Brazil, Colombia, Peru and Chile.',
    pularParaConteudo: 'Skip to content',
    destaques: 'Highlights',
    emNumeros: 'Alupar in numbers',
    noticias: 'News',
    videoInstitucional: 'Institutional video',
    videos: 'Videos',
    sustentabilidade: 'Sustainability',
    indicadores: {
      linhas: 'km of transmission lines',
      paises: 'countries: Brazil, Colombia, Peru and Chile',
      capacidade: 'MW of installed capacity',
      rating: 'national scale rating, Fitch',
    },
    idioma: 'Language',
    logo: 'Alupar — home', // novo
    menu: {
      rotulo: 'Menu',
      itens: [
        { rotulo: 'Company', href: '/en/a-companhia/' },
        { rotulo: 'Business Segment', href: '/en/area-de-atuacao/' },
        { rotulo: 'Companies', href: '/en/empresas/' },
        { rotulo: 'Careers', href: 'https://alupar.gupy.io/' }, // novo — decisão P7
        { rotulo: 'Contact Us', href: '/en/contato/' },
      ],
    },
    ri: 'Investor Relations',
    novaAba: 'opens in a new tab',
    rodape: {
      direitos: 'All rights reserved',
      privacidade: 'Privacy Policy', privacidadeHref: '/en/politica-de-privacidade/',
      conduta: 'Code of Ethics', condutaHref: 'https://arquivos.alupar.com.br/documentos/code-of-ethics.pdf',
      terceiros: 'Third Parties Code of Conduct', denuncias: 'Reporting Channel',
      topo: 'Back to top', // novo
    },
  },
  es: {
    titulo: 'Alupar — Institucional',
    descricao:
      'Alupar actúa en transmisión y generación de energía en Brasil, Colombia, Perú y Chile.',
    pularParaConteudo: 'Saltar al contenido',
    destaques: 'Destacados',
    emNumeros: 'Alupar en números',
    noticias: 'Noticias',
    videoInstitucional: 'Video institucional',
    videos: 'Videos',
    sustentabilidade: 'Sostenibilidad',
    indicadores: {
      linhas: 'km de líneas de transmisión',
      paises: 'países: Brasil, Colombia, Perú y Chile',
      capacidade: 'MW de capacidad instalada',
      rating: 'calificación en escala nacional, Fitch',
    },
    idioma: 'Idioma',
    logo: 'Alupar — inicio', // novo
    menu: {
      rotulo: 'Menú',
      itens: [
        { rotulo: 'Compañía', href: '/es/a-companhia/' },
        { rotulo: 'Segmento de Negocio', href: '/es/area-de-atuacao/' },
        { rotulo: 'Empresas', href: '/es/empresas/' },
        { rotulo: 'Trabaje con nosotros', href: 'https://alupar.gupy.io/' }, // novo — decisão P7
        { rotulo: 'Contacto', href: '/es/contato/' },
      ],
    },
    ri: 'Relación con Inversores',
    novaAba: 'abre en una pestaña nueva',
    rodape: {
      direitos: 'Todos los derechos reservados',
      privacidade: 'Política de privacidad', privacidadeHref: '/es/politica-de-privacidade/',
      conduta: 'Código de conducta', condutaHref: 'https://arquivos.alupar.com.br/documentos/code-of-ethics.pdf',
      terceiros: 'Código de Conducta de Terceros', denuncias: 'Canal de Denuncias',
      topo: 'Volver arriba', // novo
    },
  },
};
