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

/** Idioma como o acervo grava (`pt`, não `pt-br`) — o que `Item.idioma` espera. */
export const CODIGO = { 'pt-br': 'pt', en: 'en', es: 'es' } as const satisfies Record<Idioma, string>;

interface Textos {
  titulo: string;
  descricao: string;
  pularParaConteudo: string;
  destaques: string;
  videoInstitucional: string;
  videos: string;
  videosAnteriores: string;
  /** `aria-label` da faixa de selos da home: ela não tem título à vista. */
  reconhecimentos: string;
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
  /* Lista, não peça única: a home é um rotativo desde sempre. Hoje sobra um
     por idioma porque a regra 0.2 do Marco 0 tira o que é anterior a 2024 —
     com um, o componente serve um banner estático, sem script e sem controles.
     Acrescentar uma peça aqui e a imagem correspondente em Home.astro liga o
     rotativo. A ordem das duas listas é a ordem das telas. */
  banner: { legenda: string; alt: string; href: string | null }[];
  /* Rótulos dos controles do rotativo. Só aparecem na página quando há duas
     telas ou mais — com uma, o banner é estático e não há o que controlar. */
  rotativo: { anterior: string; proxima: string; pausar: string; retomar: string };
  /* Botão do vídeo do topo da home: pausa quando toca, reproduz quando parado. */
  videoTopo: { pausar: string; retomar: string };
  assistirVideo: string;
  formulario: {
    obrigatorios: string; nome: string; email: string; empresa: string; telefone: string;
    assunto: string; mensagem: string; consentimento: string; enviar: string;
    obrigado: string; naoEnviado: string; semJavascript: string;
    /* Mensagem de cada campo, no navegador. */
    erros: { nome: string; email: string; assunto: string; mensagem: string; consentimento: string; verificacao: string };
    resumo: string; enviando: string; falhaEnvio: string;
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
    videoInstitucional: 'Vídeo institucional',
    videos: 'Vídeos',
    videosAnteriores: 'Vídeos anteriores',
    reconhecimentos: 'Reconhecimentos',
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
        { rotulo: 'Sustentabilidade', href: 'https://rs.alupar.com.br/' }, // portal próprio, pedido de 23/09/2026
        { rotulo: 'Inovação e P&D', href: 'https://pdi.alupar.com.br/' }, // era a página interna; portal próprio desde 23/09/2026
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
    rotativo: { anterior: 'Tela anterior', proxima: 'Próxima tela', pausar: 'Pausar o rotativo', retomar: 'Retomar o rotativo' }, // novo
    videoTopo: { pausar: 'Pausar vídeo', retomar: 'Reproduzir vídeo' },
    banner: [
      {
        legenda: '#SUSTENTABILIDADE',
        alt: 'Relatório de Sustentabilidade 2025', // novo — o site atual tem alt=""
        href: 'https://arquivos.alupar.com.br/documentos/relatorio-de-sustentabilidade-2025.pdf',
      },
    ],
    assistirVideo: 'Assistir ao vídeo institucional no YouTube', // novo
    formulario: {
      obrigatorios: '* Campos obrigatórios', // novo
      nome: 'Nome', email: 'E-mail', empresa: 'Empresa', telefone: 'Telefone', assunto: 'Assunto', mensagem: 'Mensagem',
      consentimento: 'Li e aceito a',
      enviar: 'Enviar mensagem',
      obrigado: 'Mensagem enviada. Obrigado pelo contato.', // novo
      naoEnviado: 'Não foi possível enviar a mensagem. Confira os campos e tente de novo.', // novo
      semJavascript: 'Com o JavaScript desativado, a verificação antispam não carrega e a mensagem não pode ser enviada por este formulário. Use o telefone ou o e-mail no início desta página.', // novo
      erros: {
        nome: 'Informe seu nome.',
        email: 'Informe um e-mail válido, como nome@empresa.com.br.',
        assunto: 'Informe o assunto.',
        mensagem: 'A mensagem passa de 5.000 caracteres; resuma um pouco.',
        consentimento: 'Marque a caixa para aceitar a Política de Privacidade.',
        verificacao: 'Aguarde a verificação antispam terminar e envie de novo.',
      },
      resumo: 'Corrija os campos indicados e envie de novo.',
      enviando: 'Enviando…',
      falhaEnvio: 'Não foi possível enviar agora. Sua mensagem continua no formulário: tente de novo em instantes ou use o telefone ou o e-mail no início desta página.',
    },
    naoEncontrada: { titulo: 'Página não encontrada', texto: 'O endereço que você procurou não existe ou mudou de lugar.', voltar: 'Ir para a página inicial' }, // novo
  },
  en: {
    titulo: 'Alupar — Institutional',
    descricao:
      'Alupar operates in power transmission and generation in Brazil, Colombia, Peru and Chile.',
    pularParaConteudo: 'Skip to content',
    destaques: 'Highlights',
    videoInstitucional: 'Institutional video',
    videos: 'Videos',
    videosAnteriores: 'Previous videos',
    reconhecimentos: 'Recognitions',
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
        { rotulo: 'Sustainability', href: 'https://rs.alupar.com.br/' }, // portal próprio (em português), pedido de 23/09/2026
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
    rotativo: { anterior: 'Previous slide', proxima: 'Next slide', pausar: 'Pause the carousel', retomar: 'Resume the carousel' }, // novo
    videoTopo: { pausar: 'Pause video', retomar: 'Play video' },
    banner: [
      {
        legenda: '#SUSTAINABILITY',
        alt: 'Sustainability Report 2025', // novo
        href: 'https://arquivos.alupar.com.br/documentos/sustainability-report-2025.pdf',
      },
    ],
    assistirVideo: 'Watch the institutional video on YouTube', // novo
    formulario: {
      obrigatorios: '* Required fields',
      nome: 'Name', email: 'Email', empresa: 'Company', telefone: 'Phone', assunto: 'Subject', mensagem: 'Message',
      consentimento: 'I read and agree with the',
      enviar: 'Send message',
      obrigado: 'Message sent. Thank you for getting in touch.',
      naoEnviado: 'The message could not be sent. Please check the fields and try again.',
      semJavascript: 'With JavaScript disabled, the anti-spam check does not load and this form cannot send your message. Please use the phone number or the e-mail address at the top of this page.', // novo
      erros: {
        nome: 'Enter your name.',
        email: 'Enter a valid email address, such as name@company.com.',
        assunto: 'Enter the subject.',
        mensagem: 'The message is over 5,000 characters; please shorten it.',
        consentimento: 'Tick the box to accept the Privacy Policy.',
        verificacao: 'Wait for the anti-spam check to finish and send again.',
      },
      resumo: 'Fix the fields below and send again.',
      enviando: 'Sending…',
      falhaEnvio: 'We could not send your message right now. It is still in the form: try again shortly, or use the phone or email at the top of this page.',
    },
    naoEncontrada: { titulo: 'Page not found', texto: 'The address you are looking for does not exist or has moved.', voltar: 'Go to the home page' }, // novo
  },
  es: {
    titulo: 'Alupar — Institucional',
    descricao:
      'Alupar actúa en transmisión y generación de energía en Brasil, Colombia, Perú y Chile.',
    pularParaConteudo: 'Saltar al contenido',
    destaques: 'Destacados',
    videoInstitucional: 'Video institucional',
    videos: 'Videos',
    videosAnteriores: 'Videos anteriores',
    reconhecimentos: 'Reconocimientos',
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
        { rotulo: 'Sostenibilidad', href: 'https://rs.alupar.com.br/' }, // portal propio (en portugués), pedido de 23/09/2026
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
    rotativo: { anterior: 'Pantalla anterior', proxima: 'Pantalla siguiente', pausar: 'Pausar el carrusel', retomar: 'Reanudar el carrusel' }, // novo
    videoTopo: { pausar: 'Pausar vídeo', retomar: 'Reproducir vídeo' },
    banner: [{ legenda: 'Energía que impulsa la vida', alt: 'Energía que impulsa la vida', href: null }], // decisão P1
    assistirVideo: 'Ver el video institucional en YouTube', // novo
    formulario: {
      obrigatorios: '* Campos obligatorios',
      nome: 'Nombre', email: 'Correo electrónico', empresa: 'Empresa', telefone: 'Teléfono', assunto: 'Asunto', mensagem: 'Mensaje',
      consentimento: 'Leí y acepto la',
      enviar: 'Enviar mensaje',
      obrigado: 'Mensaje enviado. Gracias por contactarnos.',
      naoEnviado: 'No fue posible enviar el mensaje. Revise los campos e intente de nuevo.',
      semJavascript: 'Con JavaScript desactivado, la verificación antispam no carga y este formulario no puede enviar su mensaje. Use el teléfono o el correo electrónico al inicio de esta página.', // novo
      erros: {
        nome: 'Escriba su nombre.',
        email: 'Escriba un correo electrónico válido, como nombre@empresa.com.',
        assunto: 'Escriba el asunto.',
        mensagem: 'El mensaje supera los 5.000 caracteres; acórtelo un poco.',
        consentimento: 'Marque la casilla para aceptar la Política de Privacidad.',
        verificacao: 'Espere a que termine la verificación antispam y vuelva a enviar.',
      },
      resumo: 'Corrija los campos indicados y envíe de nuevo.',
      enviando: 'Enviando…',
      falhaEnvio: 'No fue posible enviar su mensaje ahora. Sigue en el formulario: inténtelo de nuevo en unos instantes, o use el teléfono o el correo electrónico al inicio de esta página.',
    },
    naoEncontrada: { titulo: 'Página no encontrada', texto: 'La dirección que busca no existe o cambió de lugar.', voltar: 'Ir a la página de inicio' }, // novo
  },
};
