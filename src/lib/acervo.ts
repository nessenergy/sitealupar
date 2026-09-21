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
/* `with { type: 'json' }` não é enfeite: sem o atributo, `node --test` recusa
   o módulo e as transformações daqui ficariam sem teste. O Astro lê igual. */
import mapa from '../../acervo/mapa-de-rotas.json' with { type: 'json' };
import imagens from '../../acervo/imagens.json' with { type: 'json' };
import documentosMz from '../../acervo/mz-arquivos.json' with { type: 'json' };
/* Com a extensão, como em `imagens.test.ts`: sem ela o `node --test` não
   resolve o módulo. O Astro lê dos dois jeitos. */
import { responsivas, videosSobDemanda, type Manifesto } from './imagens.ts';

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
 * O formato e o dimensionamento vêm de `responsivas()`, em `imagens.ts`.
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

/*
 * O que não é imagem — MP4, PDF, DOCX — sai do origin antigo para o R2
 * (arquivos.alupar.com.br): 18 vídeos passam de 25 MiB, o limite por arquivo
 * do Pages. As imagens já foram reescritas por `responsivas()`, antes daqui.
 */
const arquivosNoR2 = (corpo: string) =>
  corpo.replaceAll('https://www.alupar.com.br/wp-content/uploads/', 'https://arquivos.alupar.com.br/');

/*
 * Os documentos do gerenciador de arquivos da MZ (`api.mziq.com`), que somem
 * com o contrato: 59 PDFs sustentando 51 páginas — releases de resultados, mas
 * também as políticas institucionais de Sustentabilidade, Integridade, Meio
 * Ambiente, Recursos Humanos e Segurança do Trabalho, e o parecer da debênture
 * verde. A issue #43 supunha que fossem só conteúdo de RI, e por isso propunha
 * apontar ao portal deles; política institucional não é, e ficaria sem casa.
 *
 * A URL de origem não tem caminho, só UUID, então não dá para derivar o destino
 * dela: o par vem de `acervo/mz-arquivos.json`, gravado pelo resgate a partir
 * do nome que a própria origem declara no cabeçalho da resposta.
 *
 * Link sem par no mapa fica como está, apontando para a MZ. É deliberado — vai
 * quebrar no dia do desligamento, e é melhor que quebre visível do que virar um
 * endereço nosso que responde 404 e parece defeito de migração. `--verificar`
 * do resgate é quem acusa a falta.
 */
export function documentosDaMz(corpo: string, mapa: Record<string, { chave: string }>): string {
  /*
   * As chaves do mapa vêm do texto cru do JSONL, onde a URL é seguida da barra
   * invertida que escapa a aspa; o corpo aqui já veio desescapado. Sem
   * normalizar os dois lados, 63 das 124 chaves nunca casariam — e o link
   * ficaria apontando para a MZ em silêncio, que é o pior desfecho possível.
   */
  const limpar = (u: string) => u.replace(/\\+$/, '').replaceAll('&amp;', '&');
  const porUrl = new Map(Object.entries(mapa).map(([u, v]) => [limpar(u), v]));

  return corpo.replaceAll(
    /https:\/\/(?:api\.mziq\.com\/mzfilemanager|apicatalog\.mziq\.com\/filemanager)\/[^"'<>\\ )]+/g,
    (url) => {
      const par = porUrl.get(limpar(url));
      return par ? `https://arquivos.alupar.com.br/${par.chave.split('/').map(encodeURIComponent).join('/')}` : url;
    },
  );
}


/*
 * Sanfona do tema (`.arconix-faq-*`), fechada já no HTML.
 *
 * O tema entrega três `<div>` — embrulho, título e conteúdo — e fecha tudo
 * por JavaScript, depois da pintura. Isso desloca a página inteira depois que
 * ela já apareceu: o Lighthouse mediu **CLS 0,2972** em condicoes-de-uso, com
 * o gate em 0,1, e derrubou o desempenho para 0,85.
 *
 * Quem já sabe fechar sozinho, sem script e sem deslocar nada, é o
 * `<details>`: nasce fechado no próprio HTML, recebe foco e responde a Enter e
 * Espaço por conta própria. O embrulho vira `<details>`, o título vira
 * `<summary>` — as classes do tema ficam de pé, e com elas o desenho.
 *
 * Fechar aqui, e não no navegador, também é o que faz a página funcionar sem
 * JavaScript: antes, sem script, o texto inteiro ficava à mostra.
 */
const temClasse = (n: No, c: string) => (atributo(n, 'class') ?? '').split(/\s+/).includes(c);

function renomear(n: No, tag: string) {
  (n as { nodeName: string; tagName?: string }).nodeName = tag;
  (n as { nodeName: string; tagName?: string }).tagName = tag;
}

export function sanfona(corpo: string): string {
  if (!corpo.includes('arconix-faq-wrap')) return corpo;

  const arvore = parseFragment(corpo) as unknown as No;
  for (const no of achatar(arvore)) {
    if (no.nodeName !== 'div' || !temClasse(no, 'arconix-faq-wrap')) continue;
    const titulo = (no.childNodes ?? []).find((c) => temClasse(c, 'arconix-faq-title'));
    /* Sem título não há o que dobrar: `<details>` sem `<summary>` ganharia do
       navegador um "Detalhes" que ninguém escreveu. Fica como está. */
    if (!titulo) continue;
    renomear(no, 'details');
    renomear(titulo, 'summary');
  }

  return serialize(arvore as never);
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
      corpo: documentosDaMz(
        arquivosNoR2(
          videosSobDemanda(
            carregarImagens(
              responsivas(tabelaRolavel(avisarNovaAba(sanfona(ancorasInternas(achado.corpo)), idioma), idioma), imagens as Manifesto),
            ),
          ),
        ),
        documentosMz as Record<string, { chave: string }>,
      ),
    } as Item;
  });

  return cache;
}

/**
 * Rotas do acervo que ganham página própria em `src/pages/` e por isso não
 * são geradas por `[...rota].astro` — senão as duas disputariam o caminho.
 * O mapa de rotas continua listando-as: o endereço existe, só muda quem o gera.
 */
export const SUBSTITUIDAS = new Set([
  '/contato/', '/en/contato/', '/es/contato/',
]);

/** O contato do acervo traz o formulário antigo, que postava para a MZ: sai, ficam os dados. */
export const semFormulario = (corpo: string) =>
  serialize(parseFragment(corpo.split('<div id="formFaleComRi"')[0]) as never);
