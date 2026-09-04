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
  sustentabilidade: string;
  indicadores: { paises: string; rating: string; linhas: string; capacidade: string };
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
    sustentabilidade: 'Sustentabilidade',
    indicadores: {
      linhas: 'km de linhas de transmissão',
      paises: 'países: Brasil, Colômbia, Peru e Chile',
      capacidade: 'MW de capacidade instalada',
      rating: 'rating em escala nacional, Fitch',
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
    sustentabilidade: 'Sustainability',
    indicadores: {
      linhas: 'km of transmission lines',
      paises: 'countries: Brazil, Colombia, Peru and Chile',
      capacidade: 'MW of installed capacity',
      rating: 'national scale rating, Fitch',
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
    sustentabilidade: 'Sostenibilidad',
    indicadores: {
      linhas: 'km de líneas de transmisión',
      paises: 'países: Brasil, Colombia, Perú y Chile',
      capacidade: 'MW de capacidad instalada',
      rating: 'calificación en escala nacional, Fitch',
    },
  },
};
