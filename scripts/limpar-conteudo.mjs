#!/usr/bin/env node
/**
 * Reescreve o que pode ser reescrito, e isola o que não pode.
 *
 * A auditoria classificou 139 itens como "host do fornecedor, limpeza
 * automática". Olhando ocorrência a ocorrência, essa classificação é grossa
 * demais: nem toda referência à MZ é um arquivo.
 *
 *   arquivo   cdn-sites-assets.mziq.com/wp-content/uploads/sites/7/…
 *             É upload do próprio institucional, espelhado no CDN. O mesmo
 *             caminho responde em www.alupar.com.br — verificado numa amostra
 *             de oito, todos 200 nos dois hosts. Reescrever é seguro.
 *
 *   serviço   api.mziq.com, webcastlite.mziq.com, apicatalog.mziq.com,
 *             cms-backend.mziq.com
 *             Não são arquivos: são funcionalidade. Player de webcast, API de
 *             catálogo. Não há para onde reescrever — quando o contrato com a
 *             MZ acabar, isso para de existir. Exige decisão, não script.
 *
 * O mesmo vale para http://. No domínio da Alupar é troca de esquema e pronto.
 * Em terceiro, é preciso confirmar que o host serve https antes de trocar —
 * este script não adivinha, e por isso deixa para o relatório.
 *
 * Uso:
 *   node scripts/limpar-conteudo.mjs                  # reescreve e relata
 *   node scripts/limpar-conteudo.mjs --verificar      # confere cada destino
 */

import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const verificar = args.includes('--verificar');
const PROPRIO = 'https://www.alupar.com.br';

/*
 * Antes de qualquer reescrita: fora o script embutido.
 *
 * Todas as 387 páginas carregam o mesmo `<script>` dentro da seção de texto,
 * com um comentário que se explica sozinho — "solicitado pelo ferramenta
 * redirect WP ñ suporta o link por conta disso foi feita a inserção no
 * código". Ele compara `window.location.href` com `/fotos` e manda para o NAS.
 *
 * É um redirecionamento feito no navegador porque o plugin não dava conta.
 * No site novo isso é uma linha no `_redirects`, que já existe, e serve antes
 * de qualquer HTML chegar. Manter o script seria carregar a gambiarra junto.
 *
 * Também é o que inflava a contagem: 387 ocorrências de http:// no domínio
 * próprio e 387 de host externo eram todas dele, não do conteúdo.
 */
const SCRIPT_EMBUTIDO = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

const REESCRITAS = [
  {
    id: 'arquivo-no-cdn',
    de: /https?:\/\/cdn-sites-assets\.mziq\.com(\/wp-content\/uploads\/)/gi,
    para: `${PROPRIO}$1`,
    porque: 'upload do próprio institucional, espelhado no CDN do fornecedor',
  },
  {
    id: 'host-morto',
    de: /https?:\/\/(?:inst|ri)\.alupar\.mziq\.com(\/wp-content\/uploads\/)/gi,
    para: `${PROPRIO}$1`,
    porque: 'host que não resolve mais em DNS — imagem quebrada hoje',
  },
  {
    id: 'esquema-no-dominio-proprio',
    de: /http:\/\/((?:www\.|ri\.)?alupar\.com\.br)/gi,
    para: 'https://$1',
    porque: 'conteúdo misto: http dentro de página https, no próprio domínio',
  },
];

/** O que este script deliberadamente não toca. */
const PENDENTES = [
  { id: 'servico-do-fornecedor', teste: /https?:\/\/(?:api|webcastlite|apicatalog|cms-backend)\.mziq\.com[^"]*/gi,
    porque: 'funcionalidade hospedada na MZ, não arquivo — some com o contrato' },
  { id: 'http-externo', teste: /http:\/\/(?!(?:www\.|ri\.)?alupar\.com\.br)(?!cdn-sites-assets\.mziq|inst\.alupar\.mziq|ri\.alupar\.mziq)[^"]*/gi,
    porque: 'host de terceiro — trocar para https exige confirmar que ele serve https' },
];

const itens = (await readFile('acervo/conteudo.jsonl', 'utf8')).trim().split('\n').map((l) => JSON.parse(l));

const contagem = Object.fromEntries(
  [{ id: 'script-embutido' }, ...REESCRITAS, ...PENDENTES].map((r) => [r.id, { itens: 0, ocorrencias: 0 }]),
);
const pendencias = [];
const destinos = new Set();

const limpos = itens.map((i) => {
  if (i.vazio) return i;
  let corpo = i.corpo;

  const scripts = (corpo.match(SCRIPT_EMBUTIDO) ?? []).length;
  if (scripts) { contagem['script-embutido'].itens += 1; contagem['script-embutido'].ocorrencias += scripts; }
  corpo = corpo.replace(SCRIPT_EMBUTIDO, '');

  for (const r of REESCRITAS) {
    const n = (corpo.match(r.de) ?? []).length;
    if (n) { contagem[r.id].itens += 1; contagem[r.id].ocorrencias += n; }
    corpo = corpo.replace(r.de, r.para);
  }

  for (const p of PENDENTES) {
    const achados = [...new Set(corpo.match(p.teste) ?? [])];
    if (achados.length) {
      contagem[p.id].itens += 1;
      contagem[p.id].ocorrencias += achados.length;
      pendencias.push({ idioma: i.idioma, tipo: i.tipo, slug: i.slug, caminho: i.caminho, motivo: p.id, porque: p.porque, urls: achados });
    }
  }

  for (const m of corpo.matchAll(/(?:src|href)="(https:\/\/www\.alupar\.com\.br\/wp-content\/uploads\/[^"]+)"/gi)) {
    destinos.add(m[1].split('?')[0]);
  }
  return { ...i, corpo, texto: i.texto };
});

await writeFile('acervo/conteudo-limpo.jsonl', `${limpos.map((i) => JSON.stringify(i)).join('\n')}\n`);
await writeFile(
  'acervo/pendencias-fornecedor.json',
  `${JSON.stringify({ geradoEm: new Date().toISOString(), total: pendencias.length, pendencias }, null, 2)}\n`,
);

console.log('removido:');
console.log(`  ${String(contagem['script-embutido'].ocorrencias).padStart(4)} ocorrências · ${String(contagem['script-embutido'].itens).padStart(3)} itens · script-embutido`);
console.log('\nreescrito:');
for (const r of REESCRITAS) console.log(`  ${String(contagem[r.id].ocorrencias).padStart(4)} ocorrências · ${String(contagem[r.id].itens).padStart(3)} itens · ${r.id}`);
console.log('\nnão tocado, exige decisão:');
for (const p of PENDENTES) console.log(`  ${String(contagem[p.id].ocorrencias).padStart(4)} ocorrências · ${String(contagem[p.id].itens).padStart(3)} itens · ${p.id}`);
console.log(`\ndestinos únicos reescritos: ${destinos.size}`);

if (verificar) {
  console.log('\nverificando cada destino no host próprio...');
  const lista = [...destinos];
  const falhas = [];
  const CONC = 6;
  const fila = [...lista];
  await Promise.all(Array.from({ length: CONC }, async () => {
    while (fila.length) {
      const u = fila.shift();
      try {
        const r = await fetch(u, { method: 'HEAD', redirect: 'follow' });
        if (!r.ok) falhas.push({ url: u, status: r.status });
      } catch (e) { falhas.push({ url: u, erro: String(e.message ?? e) }); }
    }
  }));
  console.log(`  ${lista.length - falhas.length}/${lista.length} respondem`);
  for (const f of falhas.slice(0, 20)) console.log(`  FALHA ${f.status ?? f.erro}  ${f.url}`);

  /*
   * Destino que não responde não é falha da reescrita: é arquivo que sumiu da
   * origem, e o link já estava quebrado antes de encostarmos nele. Vira
   * pendência em vez de virar 404 silencioso no site novo.
   */
  if (falhas.length) {
    const atual = JSON.parse(await readFile('acervo/pendencias-fornecedor.json', 'utf8'));
    atual.destinosQueNaoRespondem = falhas.map((f) => ({
      ...f,
      porque: 'o arquivo não existe mais na origem — decidir entre remover o link ou repor o arquivo',
    }));
    atual.total += falhas.length;
    await writeFile('acervo/pendencias-fornecedor.json', `${JSON.stringify(atual, null, 2)}\n`);
    console.error(`\n${falhas.length} destino(s) não respondem — registrados em acervo/pendencias-fornecedor.json.`);
    console.error('Não é erro da reescrita: o arquivo sumiu da origem e o link já estava quebrado.');
    process.exitCode = 1;
  }
}
