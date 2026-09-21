#!/usr/bin/env node
/**
 * Gera o mapa de redirecionamentos a partir do acervo medido.
 *
 * A regra 3 do AGENTS.md diz que nenhuma URL do acervo pode responder 404
 * depois da virada. Este script transforma essa regra em arquivo: lê o
 * `inventario.json`, separa o que o site tem hoje e emite o destino de cada
 * endereço no site novo.
 *
 * São dois artefatos, e a divisão não é estética — é imposta pela plataforma.
 * O `_redirects` do Cloudflare Pages **não casa query string** (documentado em
 * developers.cloudflare.com/pages/configuration/redirects/, tabela de suporte
 * avançado). Como o site atual expressa idioma em `?lang=`, esses endereços
 * precisam de Redirect Rules, que avaliam expressão.
 *
 *   public/_redirects            caminhos — inclui os slugs traduzidos do WPML
 *   infra/redirect-rules.md      as regras de borda para `?lang=`
 *
 * Uso: node scripts/gerar-redirecionamentos.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const INVENTARIO = 'acervo/inventario.json';
const MARCA = '# ─── gerado por scripts/gerar-redirecionamentos.mjs ───';
// As duas regras com splat ficam num bloco fixo no fim do arquivo (limite de
// dinâmicas do Pages, ver scripts/lib/redirects.mjs). Este script reescreve
// tudo que vem depois de MARCA — sem isto, apagaria esse bloco a cada geração.
const MARCA_CAUDA = '# ─── dinâmicas: sempre por último — limite do Pages (100 dinâmicas; a primeira dinâmica desliga as estáticas) ───';

const inv = JSON.parse(await readFile(INVENTARIO, 'utf8'));

/** Separa caminho e idioma. Devolve null para URL que não é do site. */
function partes(url) {
  const m = /^https?:\/\/www\.alupar\.com\.br(\/[^?]*)(?:\?lang=(en|es))?$/.exec(url);
  return m ? { caminho: m[1], idioma: m[2] ?? 'pt' } : null;
}

const vivos = inv.filter((i) => i.status === 200).map((i) => ({ ...partes(i.url), url: i.url }))
  .filter((i) => i.caminho);

const caminhosPt = new Set(vivos.filter((i) => i.idioma === 'pt').map((i) => i.caminho));

/**
 * O WPML traduz o permalink. Onde o slug traduzido é próprio, o caminho não
 * existe em português — e é ele que vira `/en/…` ou `/es/…` no site novo.
 * Onde o caminho é o mesmo do português, quem distingue é o `?lang=`, e o
 * caso é da borda, não deste arquivo.
 *
 * `/noticia/…` fica de fora desde 16/09/2026 (D16): a área de notícias foi
 * desativada e não tem mais página nenhuma, traduzida ou não. Sem este
 * filtro, este script emitiria de novo as traduções e o "sem corpo quer ir
 * para a home" para um endereço que já era `/noticia/…` na origem — os dois
 * casos que a Task 4 reviu. As seis regras com curinga no bloco dinâmico de
 * `public/_redirects` (`/noticia/*`, `/noticias/*`, com e sem prefixo de
 * idioma) já cobrem esse espaço inteiro num salto só, direto para o RI —
 * então não há o que este bloco precise gerar para ele.
 */
const slugsTraduzidos = vivos
  .filter((i) => i.idioma !== 'pt' && !caminhosPt.has(i.caminho) && !/^\/noticias?\//.test(i.caminho))
  .sort((a, b) => a.caminho.localeCompare(b.caminho));

const porIdioma = (l) => slugsTraduzidos.filter((i) => i.idioma === l);

/*
 * O endereço responder 200 hoje não garante que ele vira página no site novo:
 * banner e anexo respondem 200 e não têm corpo. Mandar um 301 para uma página
 * que não será gerada é **pior que o 404** — o desvio some do verificador de
 * links, e o erro só aparece para quem clica.
 *
 * Então o destino só é a tradução quando o item tem corpo no acervo. Sem
 * corpo, o destino é a home do idioma: continua sem 404 (regra 3), e a linha
 * fica marcada para receber destino melhor quando houver índice de seção.
 */
const comCorpo = new Set(
  (await readFile('acervo/conteudo-pronto.jsonl', 'utf8'))
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l))
    .filter((i) => !i.vazio)
    .map((i) => `${i.idioma}${i.caminho}`),
);
const temPagina = (i) => comCorpo.has(`${i.idioma}${i.caminho}`);
const semPagina = slugsTraduzidos.filter((i) => !temPagina(i));

/* ── public/_redirects ── */
const atual = await readFile('public/_redirects', 'utf8');
const preservado = atual.split(MARCA)[0].trimEnd();
const indiceCauda = atual.indexOf(MARCA_CAUDA);
if (indiceCauda === -1) {
  throw new Error(
    'marca do bloco de regras dinâmicas não encontrada no _redirects — o gerador não reescreve o arquivo para não perder as regras dinâmicas',
  );
}
const cauda = atual.slice(indiceCauda).trimEnd();

const linhas = [
  preservado,
  '',
  MARCA,
  `# ${slugsTraduzidos.length} permalinks traduzidos pelo WPML. O slug é próprio — o`,
  '# caminho não existe em português — então o destino é a versão com prefixo de',
  '# idioma. Sem estas linhas, todo link externo para uma tradução morre na virada.',
  '',
  // O `_redirects` só aceita comentário em linha inteira — um `#` no fim da
  // linha faria a regra ser ignorada em silêncio. Por isso os provisórios vão
  // num bloco próprio, e não anotados linha a linha.
  ...['en', 'es'].flatMap((l) => [
    `# ${l.toUpperCase()} — ${porIdioma(l).filter(temPagina).length} endereços`,
    ...porIdioma(l).filter(temPagina).map((i) => `${i.caminho}  /${l}${i.caminho}  301`),
    '',
  ]),
  ...(semPagina.length
    ? [
        `# ── ${semPagina.length} traduções sem corpo no acervo ──`,
        '# Respondem 200 hoje, mas não viram página: são banner ou anexo. O destino',
        '# é a home do idioma, para não deixar 404 (regra 3). Quando houver índice',
        '# de seção, é para lá que devem apontar.',
        ...semPagina.map((i) => `${i.caminho}  /${i.idioma}/  301`),
        '',
      ]
    : []),
];
const corpo = linhas.join('\n').trimEnd();
await writeFile('public/_redirects', cauda ? `${corpo}\n\n${cauda}\n` : `${corpo}\n`);

/* ── infra/redirect-rules.md ── */
const contagem = (l) => vivos.filter((i) => i.idioma === l && caminhosPt.has(i.caminho)).length;

await writeFile(
  'infra/redirect-rules.md',
  `# Redirect Rules — o que o \`_redirects\` não alcança

Gerado por \`scripts/gerar-redirecionamentos.mjs\`. Não edite à mão.

O \`_redirects\` do Cloudflare Pages **não casa query string** — está na tabela
de suporte avançado da própria documentação. O site atual expressa idioma em
\`?lang=\`, então esses endereços só podem ser tratados na borda.

São **${contagem('en') + contagem('es')} endereços vivos** hoje (${contagem('en')} em inglês, ${contagem('es')} em espanhol) onde a
tradução mora no mesmo caminho do português e só o parâmetro distingue. Não
viram ${contagem('en') + contagem('es')} regras: viram **duas**, porque a transformação é a mesma para todas.

## Regra 0 — apex (aplicada em 11/09/2026)

Nome "apex para www", primeira regra da fase \`http_request_dynamic_redirect\`
da zona. O registro \`A alupar.com.br 34.230.121.250\` está com proxy ligado, então
o TLS do apex é da Cloudflare e o 301 sai da borda, sem chegar ao servidor antigo.

\`\`\`
(http.host eq "alupar.com.br")
\`\`\`

Destino, expressão dinâmica, **301 permanente**, preservando a query **ligado**
(aqui a query ainda vai ser lida pelas regras 1 e 2, já no \`www\`):

\`\`\`
concat("https://www.alupar.com.br", http.request.uri.path)
\`\`\`

O servidor \`34.230.121.250\` só pode ser desligado depois da virada.

## Regra 1 — inglês

\`\`\`
(http.host eq "www.alupar.com.br" and http.request.uri.query contains "lang=en")
\`\`\`

Destino, expressão dinâmica, **301 permanente**, preservando a query desligado:

\`\`\`
concat("https://www.alupar.com.br/en", http.request.uri.path)
\`\`\`

## Regra 2 — espanhol

\`\`\`
(http.host eq "www.alupar.com.br" and http.request.uri.query contains "lang=es")
\`\`\`

\`\`\`
concat("https://www.alupar.com.br/es", http.request.uri.path)
\`\`\`

## Por que 301 e por que preservar o caminho

O caminho é idêntico nos três idiomas nestes casos, então \`concat\` basta e
nenhuma tabela precisa ser mantida. O 301 transfere o histórico de indexação
para o endereço novo — com 302 o Google mantém o antigo, e o \`?lang=\` sobrevive
para sempre nos resultados de busca.

Desligar a preservação da query é deliberado: \`/en/a-companhia/?lang=en\` seria
uma segunda URL para a mesma página, exatamente o tipo de duplicata que o
diagnóstico apontou.

## Ordem

Estas duas regras vêm **depois** da regra do apex (\`alupar.com.br\` → \`www\`) e
**antes** de qualquer regra de página. Uma requisição para
\`alupar.com.br/a-companhia/?lang=en\` precisa primeiro virar \`www\`, e só então
ganhar o prefixo de idioma.

## Verificação

Depois de publicar, cada linha abaixo tem de responder 301 para o destino
indicado:

\`\`\`bash
${vivos
  .filter((i) => i.idioma !== 'pt' && caminhosPt.has(i.caminho))
  .slice(0, 4)
  .map(
    (i) =>
      `curl -sI "https://www.alupar.com.br${i.caminho}?lang=${i.idioma}" | grep -i "^location"\n# esperado: /${i.idioma}${i.caminho}`,
  )
  .join('\n')}
\`\`\`
`,
);

console.log(`_redirects: ${slugsTraduzidos.length} slugs traduzidos ` +
  `(${porIdioma('en').length} en, ${porIdioma('es').length} es)`);
console.log(`redirect-rules.md: 2 regras cobrindo ${contagem('en') + contagem('es')} endereços`);
