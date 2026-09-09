/**
 * O acervo, do lado do build.
 *
 * Junta `acervo/mapa-de-rotas.json` (o que vira página, decidido no #47) com
 * `acervo/conteudo-pronto.jsonl` (o corpo balanceado por parser, do #46), e
 * aplica as correções de acessibilidade que são **do template** — as que uma
 * mudança única resolve para todas as páginas de uma vez.
 *
 * O que NÃO está aqui é tão importante quanto o que está: nada de inventar
 * `alt`, nada de adivinhar cabeçalho de tabela. Essas correções dependem de
 * quem escreve o conteúdo, e `acervo/acessibilidade-do-conteudo.json` diz
 * exatamente quais são e quantas.
 */
import { readFileSync } from 'node:fs';
import { parseFragment, serialize } from 'parse5';
import mapa from '../../acervo/mapa-de-rotas.json';

export interface Item {
  rota: string;
  idioma: 'pt' | 'en' | 'es';
  tipo: string;
  slug: string;
  titulo: string;
  data: string | null;
  palavras: number;
  corpo: string;
}

/** O acervo grava `pt`; o resto do projeto usa `pt-br` (i18n do Astro). */
export const IDIOMA_ASTRO = { pt: 'pt-br', en: 'en', es: 'es' } as const;

const PREFIXO = { pt: '', en: '/en', es: '/es' } as const;

/*
 * Aviso de nova aba. `target="_blank"` sem aviso reprova o critério 3.2.5 da
 * WCAG: a aba nova surpreende quem não vê a tela. São 160 ocorrências em 134
 * páginas — uma por uma seria trabalho de conteúdo; aqui é uma linha.
 *
 * O texto entra como `.sr-only`: quem enxerga não vê diferença nenhuma, quem
 * usa leitor de tela passa a ouvir para onde vai. `rel` fecha de passagem a
 * brecha de `window.opener` que todo `target="_blank"` sem ele deixa aberta.
 */
const AVISO = { pt: 'abre em nova aba', en: 'opens in a new tab', es: 'abre en una pestaña nueva' } as const;

function avisarNovaAba(corpo: string, idioma: Item['idioma']): string {
  return corpo.replace(
    /<a\b([^>]*\btarget="_blank"[^>]*)>([\s\S]*?)<\/a>/gi,
    (inteiro, attrs: string, dentro: string) => {
      /* Já tem rel? Respeita o que está lá em vez de duplicar o atributo. */
      const comRel = /\brel=/i.test(attrs) ? attrs : `${attrs} rel="noopener noreferrer"`;
      return `<a${comRel}>${dentro}<span class="sr-only"> (${AVISO[idioma]})</span></a>`;
    },
  );
}

/*
 * Tabela larga precisa rolar, e o que rola precisa ser alcançável pelo teclado
 * — senão quem não usa mouse não chega ao fim da linha. `role="region"` com
 * `tabindex="0"` e um nome acessível é o padrão para isso.
 *
 * Isto NÃO resolve a falta de `<th>` em 25 tabelas: cabeçalho de tabela não se
 * adivinha sem ler o conteúdo, e chutar errado é pior que não ter. Fica
 * registrado em `acervo/acessibilidade-do-conteudo.json`.
 */
const ROLAGEM = { pt: 'Tabela', en: 'Table', es: 'Tabla' } as const;

function tabelaRolavel(corpo: string, idioma: Item['idioma']): string {
  return corpo.replace(
    /<table\b/gi,
    `<div class="rolagem" role="region" tabindex="0" aria-label="${ROLAGEM[idioma]}"><table`,
  ).replace(/<\/table>/gi, '</table></div>');
}

/*
 * Âncoras internas — as quatro que existem no acervo inteiro, todas na página
 * Empresas, todas sem texto nenhum dentro. Reprovam o critério 2.4.4 da WCAG:
 * o leitor de tela anuncia "link" e para aí.
 *
 * Ao olhar de perto o defeito é maior que a acessibilidade: **três das quatro
 * apontam para uma âncora que não existe no documento**. Não levam a lugar
 * nenhum, para ninguém, com ou sem leitor de tela.
 *
 * Daí as duas regras, e nenhuma delas inventa texto:
 *
 * 1. Sem destino no documento → não é link. Desembrulha, mantendo o conteúdo.
 *    Um link que não vai a lugar algum é pior que texto comum: promete e falha.
 * 2. Com destino → o nome sai do **título da própria seção de destino**. São as
 *    palavras que já estão na página, não redação nova.
 *
 * O que sobra de decisão de conteúdo — se esses atalhos deviam existir e para
 * onde deviam apontar — é da Comunicação, e está registrado.
 */
const TITULOS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

type No = { nodeName: string; attrs?: { name: string; value: string }[]; childNodes?: No[]; value?: string; parentNode?: No };

const atributo = (n: No, k: string) => n.attrs?.find((a) => a.name === k)?.value;

function achatar(n: No, saida: No[] = []): No[] {
  saida.push(n);
  for (const c of n.childNodes ?? []) achatar(c, saida);
  return saida;
}

function textoDe(n: No): string {
  const partes: string[] = [];
  (function anda(x: No) {
    if (x.nodeName === '#text') partes.push(x.value ?? '');
    for (const c of x.childNodes ?? []) anda(c);
  })(n);
  return partes.join(' ').replace(/\s+/g, ' ').trim();
}

function ancorasInternas(corpo: string): string {
  if (!/href="#/.test(corpo)) return corpo;

  const arvore = parseFragment(corpo) as unknown as No;
  const todos = achatar(arvore);
  const alvos = new Map<string, number>();
  todos.forEach((n, i) => {
    for (const k of ['id', 'name']) {
      const v = atributo(n, k);
      if (v && !alvos.has(v)) alvos.set(v, i);
    }
  });

  for (const [i, no] of todos.entries()) {
    if (no.nodeName !== 'a') continue;
    const href = atributo(no, 'href');
    if (!href?.startsWith('#')) continue;
    const alvo = alvos.get(href.slice(1));

    if (alvo === undefined) {
      /* Sem destino: deixa de ser link, continua sendo conteúdo. */
      const pai = todos.find((p) => p.childNodes?.includes(no));
      if (!pai?.childNodes) continue;
      pai.childNodes.splice(pai.childNodes.indexOf(no), 1, ...(no.childNodes ?? []));
      continue;
    }

    if (textoDe(no) || atributo(no, 'aria-label')) continue;

    /*
     * O título pode ESTAR ACIMA do alvo, não abaixo: `<h2><a name="X"></a>
     * Transmissoras</h2>` põe a âncora dentro do próprio título. Como o pai
     * precede o filho na varredura, procurar só para a frente pega o título da
     * seção SEGUINTE — e rotula o link com o nome errado, que é pior que não
     * ter nome. Por isso os ancestrais vêm primeiro.
     */
    const noAlvo = todos[alvo];
    const acima = (function subir(n?: No): No | undefined {
      if (!n) return undefined;
      return TITULOS.has(n.nodeName) ? n : subir(todos.find((p) => p.childNodes?.includes(n)));
    })(noAlvo);

    const titulo = acima ?? todos.slice(alvo).find((n) => TITULOS.has(n.nodeName) && textoDe(n));
    if (!titulo || !textoDe(titulo)) continue;
    (no.attrs ??= []).push({ name: 'aria-label', value: textoDe(titulo) });
    void i;
  }

  return serialize(arvore as never);
}

/*
 * Carregamento das imagens do corpo.
 *
 * O conteúdo herdado traz `<img>` cru, sem `loading` e sem `srcset`, apontando
 * para o original em tamanho cheio no WordPress antigo. A página Empresas tem
 * **41 imagens assim**, e o CI mediu o que isso custa: **4,3 a 4,6 MB por
 * página**, contra um orçamento de 600 KB.
 *
 * `loading="lazy"` da segunda imagem em diante é a correção certa e padrão:
 * quem abre a página baixa o que vê, não as 41. A PRIMEIRA fica `eager` de
 * propósito — adiar a imagem que provavelmente é o maior elemento visível
 * pioraria o LCP, que é justamente o oposto do que se quer.
 *
 * Isto reduz o que se baixa; **não** resolve o formato nem o dimensionamento.
 * Servir AVIF/WebP com `srcset` exige ter os arquivos no build, e eles estão
 * no origin antigo — é a esteira de mídia da issue #26, pré-requisito de
 * go-live por si só, já que depois da virada esse origin some.
 */
function carregarImagens(corpo: string): string {
  let primeira = true;
  return corpo.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (inteiro, attrs: string) => {
    if (/\bloading=/i.test(attrs)) return inteiro;
    const modo = primeira ? 'eager' : 'lazy';
    primeira = false;
    const decodificar = /\bdecoding=/i.test(attrs) ? '' : ' decoding="async"';
    return `<img${attrs} loading="${modo}"${decodificar}>`;
  });
}

let cache: Item[] | null = null;

export function itens(): Item[] {
  if (cache) return cache;

  const corpos = new Map<string, { corpo: string; idioma: Item['idioma'] }>();
  for (const linha of readFileSync('acervo/conteudo-pronto.jsonl', 'utf8').trim().split('\n')) {
    const i = JSON.parse(linha);
    if (i.vazio) continue;
    corpos.set(`${PREFIXO[i.idioma as Item['idioma']]}${i.caminho}`, { corpo: i.corpo, idioma: i.idioma });
  }

  /* O remapa publica um item em caminho diferente do de origem (#47). */
  for (const r of mapa.remapados) {
    const origem = corpos.get(r.de);
    if (origem) corpos.set(r.para, origem);
  }

  cache = mapa.rotas.map((r) => {
    const achado = corpos.get(r.rota);
    if (!achado) throw new Error(`rota sem corpo no acervo: ${r.rota}`);
    const idioma = r.idioma as Item['idioma'];
    return {
      ...r,
      idioma,
      corpo: carregarImagens(tabelaRolavel(avisarNovaAba(ancorasInternas(achado.corpo), idioma), idioma)),
    } as Item;
  });

  return cache;
}
