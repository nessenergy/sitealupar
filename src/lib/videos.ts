// src/lib/videos.ts

// Vídeo institucional de 2026 no YouTube: a home e a lista de vídeos mostram o mesmo.
export const VIDEO_INSTITUCIONAL = 'oqjwsKfpYZ4';

/**
 * A listagem de vídeos sai dos itens do acervo, e o acervo traz o mesmo vídeo
 * em dois endereços (`…2017_edit` e `…2017_edit-3`, cada um com o título do
 * arquivo). Na lista basta um. Os dois endereços continuam existindo.
 */
export function semTituloRepetido<T extends { titulo: string }>(lista: T[]): T[] {
  const vistos = new Set<string>();
  return lista.filter((v) => {
    const chave = v.titulo.trim().toLowerCase();
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}
