/**
 * `<img>` do acervo → WebP responsivo, a partir de `acervo/imagens.json`.
 *
 * O corpo herdado aponta para o original em tamanho cheio no WordPress antigo.
 * Aqui o `src` passa a ser a maior variante WebP, o `srcset` oferece as
 * outras, e a largura e a altura intrínsecas entram quando o conteúdo não as
 * declara — sem elas, o layout salta quando a imagem chega (CLS).
 *
 * Imagem do acervo sem variante não passa em silêncio: reprova o build. Foi
 * servindo original do origin antigo que as páginas Empresas chegaram a 4,6 MB.
 */
export interface Imagem { largura: number; altura: number; variantes: number[] }
export type Manifesto = Record<string, Imagem>;

const UPLOADS = /^https:\/\/www\.alupar\.com\.br\/wp-content\/uploads\//;
const LARGURA_DO_TEXTO = '(max-width: 760px) 100vw, 720px';

const url = (chave: string, w: number) => encodeURI(`/midia/${chave.replace(/\.[^.]+$/, '')}-${w}.webp`);

export function responsivas(corpo: string, manifesto: Manifesto): string {
  return corpo.replace(/<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (inteiro, attrs: string) => {
    const src = /\ssrc="([^"]+)"/i.exec(attrs)?.[1];
    if (!src || !UPLOADS.test(src)) return inteiro;

    const chave = decodeURIComponent(src.replace(UPLOADS, '').split('?')[0]);
    const img = manifesto[chave];
    if (!img) throw new Error(`imagem sem versão otimizada: ${chave} — rode node scripts/otimizar-imagens.mjs`);

    const declarada = /\swidth="(\d+)"/i.exec(attrs)?.[1];
    const resto = attrs.replace(/\s(src|srcset|sizes)="[^"]*"/gi, '');
    const maior = img.variantes[img.variantes.length - 1];
    const srcset = img.variantes.map((w) => `${url(chave, w)} ${w}w`).join(', ');
    const sizes = declarada ? `${declarada}px` : LARGURA_DO_TEXTO;
    const dimensoes = /\swidth=/i.test(attrs) ? '' : ` width="${img.largura}" height="${img.altura}"`;
    return `<img${resto} src="${url(chave, maior)}" srcset="${srcset}" sizes="${sizes}"${dimensoes}>`;
  });
}
