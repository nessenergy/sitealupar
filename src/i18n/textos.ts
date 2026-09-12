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

/** Home de cada idioma. */
export const HOME = { 'pt-br': '/', en: '/en/', es: '/es/' } as const satisfies Record<Idioma, string>;

/** Sigla do seletor de idioma (decisão P4). */
export const SIGLA = { 'pt-br': 'PT', en: 'EN', es: 'ES' } as const satisfies Record<Idioma, string>;

/** Idioma como o acervo grava (`pt`, não `pt-br`) — o que `noticiasDe()` e `Item.idioma` esperam. */
export const CODIGO = { 'pt-br': 'pt', en: 'en', es: 'es' } as const satisfies Record<Idioma, string>;

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
  /** Rótulo da trilha ("Você está em:"), texto solto — não é o nome de degrau nenhum. */
  trilha: string;
  /** `aria-label` do `<nav>` da trilha: nomeia a navegação, não a frase. */
  trilhaNav: string;
  /** Nome do primeiro degrau, a home. */
  inicio: string;
  logo: string;
  menu: { rotulo: string; itens: { rotulo: string; href: string }[] };
  ri: string;
  novaAba: string;
  rodape: {
    direitos: string; privacidade: string; privacidadeHref: string;
    conduta: string; condutaHref: string; terceiros: string; denuncias: string; topo: string;
  };
  banner: { legenda: string; alt: string; href: string | null };
  eixos: { titulo: string; texto: string }[];
  sustentabilidadeHref: string;
  verMaisNoticias: string;
  verMaisVideos: string;
  saibaMais: string;
  assistirVideo: string;
  arquivo: string;
  anterior: string;
  proxima: string;
  formulario: {
    obrigatorios: string; nome: string; email: string; empresa: string; telefone: string;
    assunto: string; mensagem: string; consentimento: string; enviar: string;
    obrigado: string; naoEnviado: string;
  };
  naoEncontrada: { titulo: string; texto: string; voltar: string };
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
    trilha: 'Você está em:',
    trilhaNav: 'Trilha de navegação', // novo
    /* O site atual chama o degrau da home de "Você está em:" — o rótulo no
       lugar do nome. O nome existe: o JSON-LD do Yoast, na mesma página,
       publica `{"position":1,"name":"Início"}`. É esse que volta aqui. */
    inicio: 'Início', // novo
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
    banner: {
      legenda: '#SUSTENTABILIDADE',
      alt: 'Relatório de Sustentabilidade 2025', // novo — o site atual tem alt=""
      href: 'https://arquivos.alupar.com.br/documentos/relatorio-de-sustentabilidade-2025.pdf',
    },
    eixos: [
      { titulo: 'Meio Ambiente', texto: 'Reposição e recuperação de vegetação florestal nativa' },
      { titulo: 'Água', texto: 'Manutenção da qualidade da água dos corpos hídricos' },
      { titulo: 'Fauna e Flora', texto: 'Manutenção da biodiversidade' },
    ],
    sustentabilidadeHref: '/sustentabilidade/',
    verMaisNoticias: 'Veja mais notícias',
    verMaisVideos: 'Veja mais vídeos',
    saibaMais: 'Saiba mais do programa',
    assistirVideo: 'Assistir ao vídeo institucional no YouTube', // novo
    arquivo: 'Arquivo de notícias', // novo
    anterior: 'Página anterior', // novo
    proxima: 'Próxima página', // novo
    formulario: {
      obrigatorios: '* Campos obrigatórios', // novo
      nome: 'Nome', email: 'E-mail', empresa: 'Empresa', telefone: 'Telefone', assunto: 'Assunto', mensagem: 'Mensagem',
      consentimento: 'Concordo com o uso dos meus dados para a resposta a este contato, conforme a', // provisório — P5
      enviar: 'Enviar mensagem',
      obrigado: 'Mensagem enviada. Obrigado pelo contato.', // novo
      naoEnviado: 'Não foi possível enviar a mensagem. Confira os campos e tente de novo.', // novo
    },
    naoEncontrada: { titulo: 'Página não encontrada', texto: 'O endereço que você procurou não existe ou mudou de lugar.', voltar: 'Ir para a página inicial' }, // novo
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
    trilha: 'You are here:', // novo — o site atual imprime o rótulo em português (P7)
    trilhaNav: 'Breadcrumb', // novo
    inicio: 'Home', // novo
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
    banner: {
      legenda: '#SUSTAINABILITY',
      alt: 'Sustainability Report 2025', // novo
      href: 'https://arquivos.alupar.com.br/documentos/sustainability-report-2025.pdf',
    },
    eixos: [
      { titulo: 'Environment', texto: 'Replacement and recovery of native forests' },
      { titulo: 'Water', texto: 'Maintenance of the quality of the water bodies' },
      { titulo: 'Fauna and Flora', texto: 'Maintenance of biodiversity' },
    ],
    sustentabilidadeHref: '/en/sustentabilidade-2/',
    verMaisNoticias: 'See more news',
    verMaisVideos: 'See more videos',
    saibaMais: 'Learn more about the program',
    assistirVideo: 'Watch the institutional video on YouTube', // novo
    arquivo: 'News archive', // novo
    anterior: 'Previous page', // novo
    proxima: 'Next page', // novo
    formulario: {
      obrigatorios: '* Required fields',
      nome: 'Name', email: 'Email', empresa: 'Company', telefone: 'Phone', assunto: 'Subject', mensagem: 'Message',
      consentimento: 'I agree to the use of my data to answer this message, as described in the', // provisório — P5
      enviar: 'Send message',
      obrigado: 'Message sent. Thank you for getting in touch.',
      naoEnviado: 'The message could not be sent. Please check the fields and try again.',
    },
    naoEncontrada: { titulo: 'Page not found', texto: 'The address you are looking for does not exist or has moved.', voltar: 'Go to the home page' }, // novo
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
    trilha: 'Usted está en:', // novo — o site atual imprime o rótulo em português (P7)
    trilhaNav: 'Ruta de navegación', // novo
    inicio: 'Inicio', // novo
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
    banner: { legenda: 'Energía que impulsa la vida', alt: 'Energía que impulsa la vida', href: null }, // decisão P1
    eixos: [
      { titulo: 'Medio Ambiente', texto: 'Reposición y recuperación de vegetación forestal nativa' },
      { titulo: 'Agua', texto: 'Mantenimiento de la calidad del agua de los cuerpos hídricos' },
      { titulo: 'Fauna y Flora', texto: 'Mantenimiento de la biodiversidad' },
    ],
    sustentabilidadeHref: '/es/sustentabilidade-2/',
    verMaisNoticias: 'Más noticias',
    verMaisVideos: 'Más vídeos',
    saibaMais: 'Más información del programa',
    assistirVideo: 'Ver el video institucional en YouTube', // novo
    arquivo: 'Archivo de noticias', // novo
    anterior: 'Página anterior', // novo
    proxima: 'Página siguiente', // novo
    formulario: {
      obrigatorios: '* Campos obligatorios',
      nome: 'Nombre', email: 'Correo electrónico', empresa: 'Empresa', telefone: 'Teléfono', assunto: 'Asunto', mensagem: 'Mensaje',
      consentimento: 'Acepto el uso de mis datos para responder a este contacto, conforme la', // provisório — P5
      enviar: 'Enviar mensaje',
      obrigado: 'Mensaje enviado. Gracias por contactarnos.',
      naoEnviado: 'No fue posible enviar el mensaje. Revise los campos e intente de nuevo.',
    },
    naoEncontrada: { titulo: 'Página no encontrada', texto: 'La dirección que busca no existe o cambió de lugar.', voltar: 'Ir a la página de inicio' }, // novo
  },
};
