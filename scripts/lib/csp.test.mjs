import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerCsp, diretivas, fontesPara, permitido, candidatos, recursos } from './csp.mjs';

const HEADERS = `# comentário
/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://files.workr.com.br; frame-src https://www.youtube-nocookie.com; upgrade-insecure-requests
  X-Frame-Options: SAMEORIGIN

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;

const ORIGEM = 'https://www.alupar.com.br';

test('lê a CSP da regra /* do _headers', () =>
  assert.equal(
    lerCsp(HEADERS),
    "default-src 'self'; img-src 'self' data: https://files.workr.com.br; frame-src https://www.youtube-nocookie.com; upgrade-insecure-requests",
  ));

test('sem regra /* com CSP, lerCsp devolve null', () =>
  assert.equal(lerCsp('/_astro/*\n  Content-Security-Policy: default-src *\n'), null));

test('separa diretivas e fontes; diretiva sem fonte fica com lista vazia', () => {
  const d = diretivas(lerCsp(HEADERS));
  assert.deepEqual(d['img-src'], ["'self'", 'data:', 'https://files.workr.com.br']);
  assert.deepEqual(d['upgrade-insecure-requests'], []);
});

test('diretiva ausente cai em default-src', () => {
  const d = diretivas(lerCsp(HEADERS));
  assert.deepEqual(fontesPara(d, 'script-src'), ["'self'"]);
  assert.deepEqual(fontesPara(d, 'img-src'), ["'self'", 'data:', 'https://files.workr.com.br']);
});

test('host listado passa; host fora da lista reprova', () => {
  const fontes = ["'self'", 'https://files.workr.com.br'];
  assert.equal(permitido('https://files.workr.com.br/a.jpg', fontes, { origem: ORIGEM }), true);
  assert.equal(permitido('https://outro.com.br/a.jpg', fontes, { origem: ORIGEM }), false);
});

test("'self' cobre a própria origem; sem 'self', nem ela passa", () => {
  assert.equal(permitido(`${ORIGEM}/midia/a.webp`, ["'self'"], { origem: ORIGEM }), true);
  assert.equal(permitido(`${ORIGEM}/midia/a.webp`, ['https://files.workr.com.br'], { origem: ORIGEM }), false);
});

test('data: só onde está listado', () => {
  assert.equal(permitido('data:image/png;base64,AAAA', ["'self'", 'data:'], { origem: ORIGEM }), true);
  assert.equal(permitido('data:image/png;base64,AAAA', ["'self'"], { origem: ORIGEM }), false);
});

test('curinga de subdomínio e fonte só com esquema', () => {
  assert.equal(permitido('https://a.workr.com.br/x', ['https://*.workr.com.br'], { origem: ORIGEM }), true);
  assert.equal(permitido('https://workr.com.br/x', ['https://*.workr.com.br'], { origem: ORIGEM }), false);
  assert.equal(permitido('https://qualquer.com/x', ['https:'], { origem: ORIGEM }), true);
});

test("'none' não deixa passar nada", () =>
  assert.equal(permitido(`${ORIGEM}/x`, ["'none'"], { origem: ORIGEM }), false));

test('upgrade-insecure-requests: http vira https antes da checagem', () => {
  const fontes = ['https://files.workr.com.br'];
  assert.equal(permitido('http://files.workr.com.br/a.jpg', fontes, { origem: ORIGEM, upgrade: true }), true);
  assert.equal(permitido('http://files.workr.com.br/a.jpg', fontes, { origem: ORIGEM, upgrade: false }), false);
  assert.equal(permitido('http://www.alupar.com.br/a.jpg', ["'self'"], { origem: ORIGEM, upgrade: true }), true);
});

test('candidatos do srcset: URL por candidato, sem descritor', () => {
  assert.deepEqual(candidatos('/a.webp 640w, https://files.workr.com.br/b.webp 1350w'), ['/a.webp', 'https://files.workr.com.br/b.webp']);
  assert.deepEqual(candidatos('/a.webp 1x,/b.webp 2x'), ['/a.webp', '/b.webp']);
  assert.deepEqual(candidatos('/a.webp, /b.webp'), ['/a.webp', '/b.webp']);
  assert.deepEqual(candidatos('  /so.webp  '), ['/so.webp']);
  /* Vírgula sem espaço DENTRO da URL é parte dela, como no navegador. */
  assert.deepEqual(candidatos('/a.webp,/b.webp 2x'), ['/a.webp,/b.webp']);
});

test('recursos do HTML mapeados para a diretiva de cada um', () => {
  const html = `<!doctype html><html><head>
    <link rel="stylesheet" href="https://fonts.exemplo/a.css"><link rel="canonical" href="https://x/">
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
    <script type="application/ld+json">{}</script>
  </head><body>
    <img src="/a.jpg" srcset="/a.webp 640w, https://files.workr.com.br/b.webp 1350w">
    <picture><source srcset="https://cdn.exemplo/c.avif 1x" type="image/avif"><img src="/c.jpg"></picture>
    <video src="https://arquivos.alupar.com.br/v.mp4"><source src="https://arquivos.alupar.com.br/w.mp4"></video>
    <iframe src="https://www.youtube-nocookie.com/embed/x"></iframe>
    <form action="/api/contato"></form>
  </body></html>`;
  assert.deepEqual(recursos(html), [
    { diretiva: 'style-src', url: 'https://fonts.exemplo/a.css' },
    { diretiva: 'script-src', url: 'https://challenges.cloudflare.com/turnstile/v0/api.js' },
    { diretiva: 'img-src', url: '/a.jpg' },
    { diretiva: 'img-src', url: '/a.webp' },
    { diretiva: 'img-src', url: 'https://files.workr.com.br/b.webp' },
    { diretiva: 'img-src', url: 'https://cdn.exemplo/c.avif' },
    { diretiva: 'img-src', url: '/c.jpg' },
    { diretiva: 'media-src', url: 'https://arquivos.alupar.com.br/v.mp4' },
    { diretiva: 'media-src', url: 'https://arquivos.alupar.com.br/w.mp4' },
    { diretiva: 'frame-src', url: 'https://www.youtube-nocookie.com/embed/x' },
    { diretiva: 'form-action', url: '/api/contato' },
  ]);
});
