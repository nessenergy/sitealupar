/**
 * A regra que decide se o Lighthouse precisa rodar.
 *
 * Ela existe porque o gate custa 12 minutos e o resto do CI custa 40 segundos:
 * em 24/09/2026 seis execuções rodaram o Lighthouse inteiro sobre mudanças que
 * não alteravam uma linha do `dist/`. Mas errar para o lado do "pula" é pior
 * que o desperdício — a regressão de SEO daquele mesmo dia nasceu em
 * `public/robots.txt` —, e por isso a lista tem teste em vez de viver escondida
 * numa condição de YAML.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { afetaOSite } from './afeta-o-site.mjs';

test('o que entra no build gerado faz o Lighthouse rodar', () => {
  for (const arquivo of [
    'src/pages/index.astro',
    'src/components/Rodape.astro',
    'src/styles/tokens.css',
    'public/robots.txt',
    'public/_headers',
    'public/_redirects',
    'acervo/revisado/pt/a-companhia.html',
    'acervo/mapa-de-rotas.json',
    'astro.config.mjs',
    'package.json',
    'package-lock.json',
  ]) {
    assert.equal(afetaOSite([arquivo]), true, arquivo);
  }
});

test('o que não chega ao visitante não faz o Lighthouse rodar', () => {
  for (const arquivo of [
    'docs/status.md',
    'docs/superpowers/plans/2026-09-24-seo-e-geo.md',
    'AGENTS.md',
    'README.md',
    'CLAUDE.md',
    'infra/arquivos.md',
    '.claude/skills/restauro-fiel/SKILL.md',
    '.gitignore',
  ]) {
    assert.equal(afetaOSite([arquivo]), false, arquivo);
  }
});

/* Os scripts não entram no `dist/`, mas os testes deles rodam no job `build`,
   que é de 40 segundos e continua rodando sempre. */
test('script de operação não faz o Lighthouse rodar: quem o cobre é o build', () => {
  assert.equal(afetaOSite(['scripts/verificar-links.mjs', 'scripts/lib/llms.mjs']), false);
});

/* Quem muda o próprio portão tem de ser medido pelo portão. */
test('mexer no gate faz o gate rodar', () => {
  assert.equal(afetaOSite(['lighthouserc.json']), true);
  assert.equal(afetaOSite(['lighthouserc.mobile.json']), true);
  assert.equal(afetaOSite(['.github/workflows/ci.yml']), true);
});

test('basta um arquivo do site no meio de vinte de documentação', () => {
  assert.equal(afetaOSite(['docs/a.md', 'docs/b.md', 'src/pages/404.astro']), true);
});

/* Falha para o lado seguro: sem lista de arquivos não há como decidir, e rodar
   12 minutos à toa custa menos que publicar uma regressão sem medir. */
test('sem lista de arquivos, roda', () => {
  assert.equal(afetaOSite([]), true);
  assert.equal(afetaOSite(null), true);
});
