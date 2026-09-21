/**
 * As telas do rotativo da home: o casamento entre imagem e texto.
 *
 * A imagem é importada em `src/components/Home.astro`, porque só o build do
 * Astro sabe processar `src/assets`; o texto vive em `src/i18n/textos.ts`,
 * onde vive todo texto. A ordem das duas listas é a ordem das telas, e
 * `telas()` as casa por posição. Se alguém acrescentar a imagem e esquecer o
 * texto, o build para dizendo o que falta, em vez de publicar um banner com o
 * texto do vizinho.
 *
 * Este arquivo não importa imagem nenhuma de propósito: assim o `node --test`
 * consegue carregá-lo, e a regra que protege a acessibilidade fica sob teste.
 *
 * Hoje é uma tela por idioma: a regra 0.2 do Marco 0 tira do ar toda peça
 * anterior a 2024, e sobrou a do Relatório de Sustentabilidade. Com uma, a
 * home serve um banner estático — sem script, sem controles e sem peso novo.
 * Com duas ou mais, o rotativo liga sozinho.
 *
 * Quem escolhe as peças é o Marketing, que é quem aprova marca. Os originais
 * que o site atual gira estão resgatados em `acervo/midia/` — as três telas de
 * 2017, o banner de COVID-19 e o selo de 2021 — e podem voltar por decisão
 * deles; a regra 0.2 é o que hoje os mantém fora.
 */

export interface TextoDeBanner {
  legenda: string;
  alt: string;
  href: string | null;
}

export interface Tela<T> {
  imagem: T;
  legenda: string;
  alt: string;
  href: string | null;
}

/**
 * Casa imagens e textos por posição. Lança quando as listas divergem: publicar
 * o alt de uma peça sobre a imagem de outra é defeito de acessibilidade que
 * nenhum teste de página pega, porque as duas coisas existem.
 */
export function telas<T>(imagens: T[], textos: TextoDeBanner[], idioma: string): Tela<T>[] {
  if (imagens.length !== textos.length) {
    throw new Error(
      `rotativo de ${idioma}: ${imagens.length} imagem(ns) em Home.astro e ` +
        `${textos.length} texto(s) em src/i18n/textos.ts — as duas listas precisam ter o mesmo tamanho, na mesma ordem`,
    );
  }
  if (!imagens.length) throw new Error(`rotativo de ${idioma}: nenhuma tela — a home ficaria sem banner`);
  return imagens.map((imagem, i) => ({ imagem, ...textos[i] }));
}
