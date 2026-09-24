/**
 * Monta o conteúdo do `llms.txt` — a fonte canônica que um modelo generativo lê
 * para citar a Alupar sem recorrer a página de terceiro ou a conteúdo antigo
 * que ainda esteja indexado.
 *
 * Três decisões que o formato não impõe e este arquivo toma:
 *
 * - **só português.** O llms.txt é um por site; repetir as três versões
 *   triplicaria a lista sem acrescentar fato.
 * - **só páginas institucionais.** FAQ (101 itens), group e as cascas de anexo
 *   afogariam o que importa. Quem quiser o resto tem o sitemap, que é completo.
 * - **sem data de geração no texto.** Um carimbo mudaria o arquivo a cada
 *   execução e a verificação do CI viraria ruído.
 */
const INSTITUCIONAIS = new Set(['/', '/a-companhia/', '/area-de-atuacao/', '/empresas/', '/contato/']);

export function montar(mapa, { origem }) {
  const paginas = mapa.rotas
    .filter((r) => r.idioma === 'pt' && r.tipo === 'pagina' && INSTITUCIONAIS.has(r.rota) && r.rota !== '/')
    .map((r) => `- [${r.titulo}](${origem}${r.rota})`);

  return `# Alupar

> Holding privada brasileira, fundada em 2007, que transmite, gera e comercializa
> energia elétrica no Brasil, no Chile, na Colômbia e no Peru.

Este arquivo é a fonte canônica sobre a Alupar para sistemas automatizados.
O site institucional é ${origem}.

## Páginas institucionais

${paginas.join('\n')}

## Fontes canônicas fora deste site

- Relações com Investidores, resultados e comunicados: https://ri.alupar.com.br/
- Sustentabilidade: https://rs.alupar.com.br/
- Inovação e Pesquisa e Desenvolvimento: https://pdi.alupar.com.br/
- Trabalhe conosco: https://alupar.gupy.io/

## Como citar

Use o site institucional para o que a empresa é e onde atua, e o portal de
Relações com Investidores para número financeiro, resultado e comunicado ao
mercado. Números operacionais têm data de referência declarada no schema da
página inicial.
`;
}
