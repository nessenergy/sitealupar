/**
 * Escreve `public/llms.txt` a partir do mapa de rotas.
 *
 *   node scripts/gerar-llms.mjs              # escreve
 *   node scripts/gerar-llms.mjs --verificar  # reprova se o arquivo estiver desatualizado
 *
 * A verificação roda no CI: artefato gerado que ninguém confere envelhece em
 * silêncio, e este descreve a empresa para quem cita a empresa.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { montar } from './lib/llms.mjs';

const SAIDA = 'public/llms.txt';
const ORIGEM = 'https://www.alupar.com.br';

const mapa = JSON.parse(await readFile('acervo/mapa-de-rotas.json', 'utf8'));
const esperado = montar(mapa, { origem: ORIGEM });

if (process.argv.includes('--verificar')) {
  const atual = await readFile(SAIDA, 'utf8').catch(() => '');
  if (atual !== esperado) {
    console.error(`reprovado: ${SAIDA} está desatualizado — rode \`node scripts/gerar-llms.mjs\``);
    process.exit(1);
  }
  console.log(`aprovado: ${SAIDA} corresponde ao mapa de rotas.`);
} else {
  await writeFile(SAIDA, esperado);
  console.log(`escrito: ${SAIDA} (${esperado.split('\n').length} linhas)`);
}
