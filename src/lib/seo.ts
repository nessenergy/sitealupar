/**
 * Os dados estruturados do site, como função pura.
 *
 * Ficavam num objeto literal dentro do `Base.astro`, com um tipo só
 * (`Organization`). Schema é regra, não marcação: aqui tem teste, e o template
 * só serializa o que esta biblioteca devolve.
 *
 * Tudo em `@graph`, e não em vários `<script>`: um grafo declara que as partes
 * descrevem a mesma página, que é o que elas fazem.
 */
import { lang, prefixo, type Idioma } from '../i18n/textos.ts';
import { NUMEROS, OBSERVADO_EM } from './numeros.ts';

/** Objeto JSON-LD já pronto para serialização. */
export type Parte = Record<string, unknown> & { '@type': string };

export function organizacao(origem: string): Parte {
  return {
    '@type': 'Organization',
    name: 'Alupar',
    url: origem,
    logo: `${origem}/logo-alupar.svg`,
    /* Os números do texto institucional, legíveis por máquina e com a data de
       referência — em prosa eles não são citáveis sem risco de envelhecer.
       `minValue`/`maxValue` onde a fonte dá limite, e não valor exato; a data
       vai em `description` porque `observationDate` só existe em `Observation`
       e num `PropertyValue` seria descartada por quem valida. */
    additionalProperty: NUMEROS.map((n) => ({
      '@type': 'PropertyValue',
      name: n.rotulo,
      value: {
        '@type': 'QuantitativeValue',
        ...(n.tipo === 'minimo' ? { minValue: n.valor }
          : n.tipo === 'maximo' ? { maxValue: n.valor }
          : { value: n.valor }),
        ...(n.unidade ? { unitText: n.unidade } : {}),
      },
      description: `Posição em ${OBSERVADO_EM.split('-').reverse().join('/')}`,
    })),
  };
}

export function siteWeb(origem: string, idioma: Idioma): Parte {
  return {
    '@type': 'WebSite',
    name: 'Alupar',
    url: `${origem}${prefixo[idioma]}/`,
    inLanguage: lang[idioma],
    publisher: { '@type': 'Organization', name: 'Alupar', url: origem },
  };
}

/**
 * A trilha da tela, em schema. O último degrau é a página atual: ele aparece
 * com nome e **sem** `item`, porque não é link — é onde a pessoa já está.
 *
 * Com um degrau só não há caminho a descrever, e um BreadcrumbList de um item
 * é ruído para o buscador: devolve `null`, que o `grafo` descarta.
 */
export function trilhaLd(passos: { rota?: string; titulo: string }[], origem: string): Parte | null {
  if (passos.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: passos.map((passo, n) => ({
      '@type': 'ListItem',
      position: n + 1,
      name: passo.titulo,
      ...(passo.rota ? { item: `${origem}${passo.rota}` } : {}),
    })),
  };
}

export function grafo(...partes: (Parte | null)[]): Record<string, unknown> {
  return { '@context': 'https://schema.org', '@graph': partes.filter(Boolean) };
}

/**
 * O nó da página. Existe para o BreadcrumbList ter a que se referir e para o
 * idioma da página ficar declarado também no grafo, não só no `<html lang>`.
 */
export function paginaWeb(
  { origem, url, titulo, descricao, idioma }:
  { origem: string; url: string; titulo: string; descricao: string; idioma: Idioma },
): Parte {
  return {
    '@type': 'WebPage',
    url,
    name: titulo,
    description: descricao,
    inLanguage: lang[idioma],
    /* O site do idioma da própria página: em inglês, /en/ — senão a página
       declara pertencer a um WebSite que não é o declarado ao lado dela. */
    isPartOf: { '@type': 'WebSite', url: `${origem}${prefixo[idioma]}/` },
  };
}

/**
 * O institucional da home. O `embedUrl` usa o domínio sem cookies, que é o que
 * o site carrega e o que a CSP permite; a miniatura é a do próprio YouTube, e
 * não a nossa capa local, porque é ela que o buscador consegue casar com o
 * vídeo.
 */
export function video(
  { id, nome, descricao, origem, publicadoEm }:
  { id: string; nome: string; descricao: string; origem: string; publicadoEm: string },
): Parte {
  return {
    '@type': 'VideoObject',
    name: nome,
    description: descricao,
    /* Obrigatória para o Google: sem ela a marcação não rende resultado de
       vídeo nenhum, e o trabalho da marcação se perde. */
    uploadDate: publicadoEm,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    publisher: { '@type': 'Organization', name: 'Alupar', url: origem },
  };
}
