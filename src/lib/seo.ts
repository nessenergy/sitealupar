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

/** Objeto JSON-LD já pronto para serialização. */
export type Parte = Record<string, unknown> & { '@type': string };

export function organizacao(origem: string): Parte {
  return {
    '@type': 'Organization',
    name: 'Alupar',
    url: origem,
    logo: `${origem}/logo-alupar.svg`,
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
    isPartOf: { '@type': 'WebSite', url: `${origem}/` },
  };
}

/**
 * O institucional da home. O `embedUrl` usa o domínio sem cookies, que é o que
 * o site carrega e o que a CSP permite; a miniatura é a do próprio YouTube, e
 * não a nossa capa local, porque é ela que o buscador consegue casar com o
 * vídeo.
 */
export function video(
  { id, nome, descricao, origem }: { id: string; nome: string; descricao: string; origem: string },
): Parte {
  return {
    '@type': 'VideoObject',
    name: nome,
    description: descricao,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    publisher: { '@type': 'Organization', name: 'Alupar', url: origem },
  };
}
