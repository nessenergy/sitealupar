/**
 * A listagem principal mostra os últimos 24 meses (D9). A última notícia do
 * acervo é de 02/03/2023, então a regra pura deixaria a página vazia na
 * virada: abaixo de `minimo`, completa com as mais recentes (decisão P2).
 * Quando a publicação voltar, o corte volta a ser o de D9 sem mudar uma linha.
 */
export function recentes<T extends { data: string | null }>(lista: T[], hoje: Date, meses = 24, minimo = 6): T[] {
  const ordenada = lista
    .filter((i) => i.data)
    .sort((a, b) => (b.data as string).localeCompare(a.data as string));
  const corte = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - meses, hoje.getUTCDate()));
  const dentro = ordenada.filter((i) => new Date(`${i.data}T00:00:00Z`) >= corte);
  return dentro.length >= minimo ? dentro : ordenada.slice(0, minimo);
}
