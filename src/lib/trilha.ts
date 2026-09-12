/**
 * Os degraus da trilha de navegação, do lado do build.
 *
 * Mora aqui, e não dentro de `Trilha.astro`, porque é a única regra de
 * negócio do componente — e a regra tem um caso que só um teste segura: o
 * nível intermediário **só entra quando existe página-mãe publicada**. Das
 * 344 rotas de dois níveis ou mais do acervo, só 26 têm: `/faq/` não é
 * página, por exemplo. É o que o site atual faz, e é o oposto de montar a
 * trilha a partir dos pedaços do endereço, que inventaria níveis mortos.
 */
/* `with { type: 'json' }` não é enfeite: sem o atributo, `node --test` recusa
   o módulo e esta regra ficaria sem teste. O Astro lê igual. */
import mapa from '../../acervo/mapa-de-rotas.json' with { type: 'json' };
/* Com a extensão, como em `acervo.ts`: sem ela o `node --test` não resolve. */
import { prefixo, HOME, textos, type Idioma } from '../i18n/textos.ts';

export interface Degrau {
  titulo: string;
  /** Ausente no degrau da página atual: ela não é link para si mesma. */
  rota?: string;
}

const TITULOS = new Map(mapa.rotas.map((r) => [r.rota, r.titulo]));

/** Home, as mães publicadas e a página atual — nesta ordem. */
export function degraus(caminho: string, idioma: Idioma, titulo: string): Degrau[] {
  const pre = prefixo[idioma];
  const segmentos = caminho.slice(pre.length).split('/').filter(Boolean);

  const maes = segmentos
    .slice(0, -1)
    .map((_, n) => `${pre}/${segmentos.slice(0, n + 1).join('/')}/`)
    .filter((rota) => TITULOS.has(rota))
    .map((rota) => ({ rota, titulo: TITULOS.get(rota) as string }));

  return [{ rota: HOME[idioma], titulo: textos[idioma].inicio }, ...maes, { titulo }];
}
