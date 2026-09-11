/**
 * Conferência da CSP de `public/_headers` contra o HTML do build.
 *
 * Funções puras: ler a política, separar diretivas, decidir se uma URL passa
 * numa lista de fontes e colher do HTML cada recurso externo com a diretiva
 * que o governa. Quem anda por `dist/` é scripts/verificar-csp.mjs.
 *
 * O casamento segue a CSP nível 3 no que o site usa: `'self'`, `'none'`,
 * `*`, fonte só de esquema (`https:`, `data:`) e fonte de host com curinga de
 * subdomínio, porta e caminho. `'unsafe-inline'`, nonce e hash não se aplicam
 * a URL e não casam com nada aqui.
 */
import { parse } from 'parse5';

/** Valor do `Content-Security-Policy` da regra `/*`, ou null. */
export function lerCsp(texto) {
  let regra = null;
  for (const linha of texto.split('\n')) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue;
    if (!/^\s/.test(linha)) { regra = limpa; continue; }
    const m = limpa.match(/^Content-Security-Policy:\s*(.+)$/i);
    if (regra === '/*' && m) return m[1].trim();
  }
  return null;
}

/** `{ diretiva: [fontes] }`. Diretiva repetida: vale a primeira, como no navegador. */
export function diretivas(csp) {
  return csp
    .split(';')
    .map((p) => p.trim().split(/\s+/))
    .filter(([nome]) => nome)
    .reduce((a, [nome, ...fontes]) => (nome.toLowerCase() in a ? a : { ...a, [nome.toLowerCase()]: fontes }), {});
}

/*
 * Diretiva ausente cai em `default-src`. Para `form-action` o navegador NÃO
 * faz esse recuo (não é diretiva de busca) — aqui faz, e o gate fica mais
 * estrito que o navegador, nunca mais frouxo. null = sem restrição nenhuma.
 */
export const fontesPara = (d, diretiva) => d[diretiva] ?? d['default-src'] ?? null;

const ESQUEMA = /^[a-z][a-z0-9+.-]*:$/i;
const HOST = /^(?:([a-z][a-z0-9+.-]*):\/\/)?(\*\.)?([^/:]+|\*)(?::(\d+|\*))?(\/.*)?$/i;

/* `http:` na fonte também aceita `https:` (CSP 3, "scheme-part match"). */
const esquemaCasa = (fonte, url) => url === fonte || (fonte === 'http:' && url === 'https:');

function casa(fonte, u, origem) {
  const f = fonte.toLowerCase();
  if (f === "'self'") return u.host === origem.host && esquemaCasa(origem.protocol, u.protocol);
  if (f.startsWith("'")) return false; // 'none', 'unsafe-inline', nonce, hash
  if (f === '*') return u.protocol === 'http:' || u.protocol === 'https:';
  if (ESQUEMA.test(f)) return esquemaCasa(f, u.protocol);
  const m = f.match(HOST);
  if (!m) return false;
  const [, esquema, curinga, host, porta, caminho] = m;
  if (!esquemaCasa(esquema ? `${esquema}:` : origem.protocol, u.protocol)) return false;
  if (host !== '*' && (curinga ? !u.hostname.endsWith(`.${host}`) : u.hostname !== host)) return false;
  if (porta !== '*' && (porta ?? '') !== u.port) return false;
  if (caminho) return caminho.endsWith('/') ? u.pathname.startsWith(caminho) : u.pathname === caminho;
  return true;
}

/**
 * A URL passa na lista de fontes? `origem` é a do site (para `'self'` e para
 * resolver caminho relativo); `upgrade` liga `upgrade-insecure-requests`, que
 * troca `http:` por `https:` ANTES da checagem — como o navegador faz.
 */
export function permitido(url, fontes, { origem, upgrade = false }) {
  if (!fontes) return true;
  if (url.startsWith('data:')) return fontes.some((f) => f.toLowerCase() === 'data:');
  const u = new URL(url, origem);
  if (upgrade && u.protocol === 'http:') u.protocol = 'https:';
  return fontes.some((f) => casa(f, u, new URL(origem)));
}

/** URLs de um `srcset`, sem os descritores — o algoritmo de candidatos do HTML. */
export function candidatos(srcset) {
  const urls = [];
  let resto = srcset;
  for (;;) {
    resto = resto.replace(/^[\s,]+/, '');
    if (!resto) return urls;
    const url = resto.match(/^\S+/)[0];
    resto = resto.slice(url.length);
    if (/,+$/.test(url)) { urls.push(url.replace(/,+$/, '')); continue; }
    urls.push(url);
    const virgula = resto.indexOf(',');
    resto = virgula < 0 ? '' : resto.slice(virgula + 1);
  }
}

/* Elemento, atributo e a diretiva que decide se o navegador carrega. */
const ATRIBUTOS = [
  ['img', 'src', 'img-src'],
  ['img', 'srcset', 'img-src'],
  ['source', 'srcset', 'img-src'], // dentro de <picture>
  ['source', 'src', 'media-src'], // dentro de <video>
  ['video', 'src', 'media-src'],
  ['iframe', 'src', 'frame-src'],
  ['script', 'src', 'script-src'],
  ['form', 'action', 'form-action'],
];

/** `[{ diretiva, url }]`, na ordem do documento, com a URL como está no HTML. */
export function recursos(html) {
  const saida = [];
  (function andar(no) {
    const attrs = Object.fromEntries((no.attrs ?? []).map((a) => [a.name, a.value]));
    if (no.nodeName === 'link' && /(^|\s)stylesheet(\s|$)/i.test(attrs.rel ?? '') && attrs.href) {
      saida.push({ diretiva: 'style-src', url: attrs.href.trim() });
    }
    for (const [tag, atributo, diretiva] of ATRIBUTOS) {
      const valor = no.nodeName === tag ? attrs[atributo]?.trim() : '';
      if (!valor) continue;
      for (const url of atributo === 'srcset' ? candidatos(valor) : [valor]) saida.push({ diretiva, url });
    }
    for (const filho of no.childNodes ?? []) andar(filho);
  })(parse(html));
  return saida;
}
