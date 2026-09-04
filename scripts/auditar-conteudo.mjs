#!/usr/bin/env node
/**
 * Audita o que impede cada item do acervo de ser migrado como está.
 *
 * A tentação, com 387 itens de conteúdo estruturado em mãos, é gerar as
 * páginas e seguir. Mas o corpo desses itens é HTML do tema de 2017, e ele
 * carrega problemas que o site novo existe para não ter: link para o host do
 * fornecedor atual, estilo embutido que briga com o sistema visual, imagem
 * sem descrição, link em http:// dentro de página https.
 *
 * Migrar sem limpar é mudar de plataforma levando o defeito junto. Este script
 * mede o tamanho da limpeza, item a item, para que ela seja planejada em vez
 * de descoberta no meio.
 *
 * Uso: node scripts/auditar-conteudo.mjs [--saida ARQ]
 */

import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const saida = args.includes('--saida') ? args[args.indexOf('--saida') + 1] : 'acervo/auditoria.json';

const itens = (await readFile('acervo/conteudo.jsonl', 'utf8'))
  .trim()
  .split('\n')
  .map((l) => JSON.parse(l));

/**
 * Cada achado tem um custo de correção diferente, e é isso que separa "limpeza
 * automática" de "alguém precisa olhar".
 *
 *   automatico  — reescrita mecânica, sem decisão editorial
 *   revisao     — precisa de gente: escrever texto, escolher layout
 */
const REGRAS = [
  {
    id: 'host-do-fornecedor',
    custo: 'automatico',
    gravidade: 'alta',
    descricao: 'aponta para um host da MZ; dois deles já não resolvem em DNS',
    detecta: (b) => [...b.matchAll(/(?:src|href)="(https?:\/\/[^"]*mziq\.com[^"]*)"/gi)].map((m) => m[1]),
  },
  {
    id: 'http-em-pagina-https',
    custo: 'automatico',
    gravidade: 'alta',
    descricao: 'link ou recurso em http:// dentro de página https — conteúdo misto',
    detecta: (b) => [...b.matchAll(/(?:src|href)="(http:\/\/[^"]+)"/gi)].map((m) => m[1]),
  },
  {
    id: 'imagem-sem-alt',
    custo: 'revisao',
    gravidade: 'alta',
    descricao: 'imagem sem descrição — reprova o portão de acessibilidade',
    detecta: (b) => (b.match(/<img(?![^>]*\salt=)[^>]*>/gi) ?? []),
  },
  {
    id: 'estilo-embutido',
    custo: 'automatico',
    gravidade: 'media',
    descricao: 'atributo style no corpo — briga com o sistema visual',
    detecta: (b) => (b.match(/\sstyle="[^"]*"/gi) ?? []),
  },
  {
    id: 'tabela-de-layout',
    custo: 'revisao',
    gravidade: 'media',
    descricao: 'tabela no corpo — pode ser dado ou pode ser layout; alguém precisa olhar',
    detecta: (b) => (b.match(/<table[^>]*>/gi) ?? []),
  },
  {
    id: 'tag-obsoleta',
    custo: 'automatico',
    gravidade: 'baixa',
    descricao: 'font, center ou marquee — HTML anterior ao CSS',
    detecta: (b) => (b.match(/<\/?(?:font|center|marquee|big|tt)\b[^>]*>/gi) ?? []),
  },
];

const auditados = itens
  .filter((i) => !i.vazio)
  .map((i) => {
    const achados = REGRAS.map((r) => {
      const ocorrencias = r.detecta(i.corpo);
      return ocorrencias.length ? { regra: r.id, custo: r.custo, gravidade: r.gravidade, quantidade: ocorrencias.length, exemplos: [...new Set(ocorrencias)].slice(0, 3) } : null;
    }).filter(Boolean);
    return {
      idioma: i.idioma, tipo: i.tipo, slug: i.slug, caminho: i.caminho,
      palavras: i.palavras, achados,
      limpo: achados.length === 0,
      exigeRevisao: achados.some((a) => a.custo === 'revisao'),
    };
  });

const conta = (p) => auditados.filter(p).length;
const porRegra = REGRAS.map((r) => ({
  regra: r.id, custo: r.custo, gravidade: r.gravidade, descricao: r.descricao,
  itens: conta((a) => a.achados.some((x) => x.regra === r.id)),
  ocorrencias: auditados.reduce((t, a) => t + (a.achados.find((x) => x.regra === r.id)?.quantidade ?? 0), 0),
})).filter((r) => r.itens > 0);

const resumo = {
  auditadoEm: new Date().toISOString(),
  itensComConteudo: auditados.length,
  limpos: conta((a) => a.limpo),
  soLimpezaAutomatica: conta((a) => !a.limpo && !a.exigeRevisao),
  exigemRevisao: conta((a) => a.exigeRevisao),
  porRegra,
};

await writeFile(saida, `${JSON.stringify({ resumo, itens: auditados }, null, 2)}\n`);

console.log(`${resumo.itensComConteudo} itens com conteúdo auditados\n`);
console.log(`  prontos como estão:        ${resumo.limpos}`);
console.log(`  só limpeza automática:     ${resumo.soLimpezaAutomatica}`);
console.log(`  exigem revisão humana:     ${resumo.exigemRevisao}\n`);
for (const r of porRegra) {
  console.log(`  ${r.gravidade.padEnd(5)} ${r.custo.padEnd(11)} ${String(r.itens).padStart(3)} itens · ${String(r.ocorrencias).padStart(4)} ocorrências · ${r.regra}`);
}
console.log(`\n→ ${saida}`);
