/**
 * Abre e fecha a issue de alarme de uma verificação automática.
 *
 * O e-mail que o GitHub manda quando um workflow agendado falha não bastou: o
 * sentinela ficou vermelho dois dias sem ninguém ver. Uma issue aberta fica na
 * lista até o problema sair, e some sozinha quando a verificação volta ao verde.
 *
 *   ESTADO=failure node scripts/alarme.mjs <rotulo> "<título>"
 *
 * ESTADO vem de `job.status` num passo com `if: always()`. Uma issue por
 * rótulo: falhando de novo com a issue já aberta, não faz nada — alarme que
 * comenta todo dia vira enxurrada e deixa de ser lido, que é o defeito que
 * este script existe para corrigir.
 */
import { spawnSync } from 'node:child_process';

const [rotulo, titulo] = process.argv.slice(2);
if (!rotulo || !titulo) {
  console.error('uso: ESTADO=<success|failure> node scripts/alarme.mjs <rotulo> "<título>"');
  process.exit(2);
}

const falhou = process.env.ESTADO === 'failure';
const execucao = process.env.EXECUCAO ?? '';

/** `gh` com saída em texto; lança se o comando falhar. */
function gh(...args) {
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`gh ${args[0]} ${args[1] ?? ''}: ${(r.stderr || '').trim()}`);
  return r.stdout.trim();
}

// O rótulo pode não existir ainda; criar é idempotente no efeito que interessa.
try {
  gh('label', 'create', rotulo, '--description', 'Verificação automática reprovada', '--color', 'B60205');
} catch {
  /* já existe */
}

/*
 * Pela API REST, e não por `gh issue list --label`: aquela consulta passa pelo
 * índice de pesquisa do GitHub, que leva segundos a indexar uma issue recém
 * aberta — duas execuções seguidas abriam duas issues para o mesmo alarme.
 * O endpoint de issues devolve pull requests junto, daí o descarte.
 */
const abertas = JSON.parse(
  gh('api', `repos/{owner}/{repo}/issues?labels=${rotulo}&state=open&per_page=100`, '--jq',
     '[.[] | select(.pull_request == null) | .number]') || '[]',
);

if (falhou && abertas.length === 0) {
  const corpo = [
    `A verificação automática **${rotulo}** reprovou.`,
    '',
    execucao ? `O que ela viu está no registro da execução: ${execucao}` : '',
    '',
    'Esta issue foi aberta pela própria verificação e fecha sozinha quando ela voltar a passar.',
  ]
    .filter(Boolean)
    .join('\n');
  const url = gh('issue', 'create', '--title', titulo, '--label', rotulo, '--body', corpo);
  console.log(`alarme aberto: ${url}`);
} else if (falhou) {
  console.log(`alarme já aberto (#${abertas[0]}) — sem comentário novo`);
} else if (abertas.length > 0) {
  for (const number of abertas) {
    gh('issue', 'close', String(number), '--comment', `A verificação **${rotulo}** voltou a passar${execucao ? `: ${execucao}` : '.'}`);
    console.log(`alarme fechado: #${number}`);
  }
} else {
  console.log(`${rotulo}: verde, sem alarme aberto`);
}
