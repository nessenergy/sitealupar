/**
 * Os números institucionais, como dado.
 *
 * Eles existiam só em prosa, na Área de atuação. Em prosa, um modelo os cita
 * sem data e um buscador não os entende — e "quase 800 MW" sem referência
 * temporal envelhece sem que ninguém perceba.
 *
 * **A data.** `OBSERVADO_EM` é o dia em que a Alupar enviou o texto revisado
 * (D19), e não a data de apuração: essa é a pergunta aberta no item 4 do
 * `docs/pedido-a-alupar-2026-09-21.md`. Declarar o que se sabe é honesto;
 * declarar uma apuração que ninguém confirmou seria inventar. Quando a
 * Comunicação responder, muda-se uma linha.
 *
 * **Limite não é valor.** O texto diz "mais de 10 mil km" e "quase 800 MW":
 * publicar 10000 e 800 como exatos inventa precisão que a fonte não dá, e
 * inventa para cima. Cada número carrega o tipo de limite que a fonte declara,
 * e o schema usa `minValue`/`maxValue` no lugar de `value` nesses dois.
 */
export const OBSERVADO_EM = '2026-09-21';

export const NUMEROS = [
  { chave: 'sistemas', valor: 45, unidade: '', tipo: 'exato', rotulo: 'Sistemas de transmissão' },
  { chave: 'linhas', valor: 10000, unidade: 'km', tipo: 'minimo', rotulo: 'Linhas de transmissão' },
  { chave: 'capacidade', valor: 800, unidade: 'MW', tipo: 'maximo', rotulo: 'Capacidade instalada' },
  { chave: 'paises', valor: 4, unidade: '', tipo: 'exato', rotulo: 'Países de atuação' },
] as const;
