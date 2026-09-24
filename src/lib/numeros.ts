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
 * Os valores são exatamente os do texto enviado. Nenhum é arredondado aqui.
 */
export const OBSERVADO_EM = '2026-09-21';

export const NUMEROS = [
  { chave: 'sistemas', valor: 45, unidade: 'sistemas de transmissão', rotulo: 'Sistemas de transmissão' },
  { chave: 'linhas', valor: 10000, unidade: 'km', rotulo: 'Linhas de transmissão' },
  { chave: 'capacidade', valor: 800, unidade: 'MW', rotulo: 'Capacidade instalada' },
  { chave: 'paises', valor: 4, unidade: 'países', rotulo: 'Países de atuação' },
] as const;
