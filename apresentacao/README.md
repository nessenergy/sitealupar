# Apresentação e dossiê

Os dois documentos que saem deste projeto para fora dele: o deck que vai à
mesa da Alupar e o dossiê que registra o estado do site.

## Por que o `.pptx` e o `.pdf` não estão aqui

Porque são gerados. O que se versiona é a fonte — `deck.js` e `dossie.html` —
e quem quiser o arquivo o produz em segundos. Binário no git envelhece sem
avisar: em duas semanas ninguém sabe se o `.pptx` da pasta corresponde ao
`deck.js` ao lado dele.

```bash
cd apresentacao
npm install
npm run build      # gera apresentacao-alupar.pptx, 26 slides
npm run qa         # confere geometria e contenção
```

## O deck

`deck.js` desenha os 26 slides em código, com um sistema visual explícito no
topo do arquivo: paleta, grade de 12 colunas, cabeçalho padrão, cartão com
barra de acento, tabela sem grade, divisor de ato. Alterar a paleta ali muda o
deck inteiro — é para isso que as constantes existem.

Três atos, com divisores escuros de página inteira entre eles: o diagnóstico,
o plano, a proposta. Fecha nos próximos passos.

## O portão de qualidade

Este ambiente **não consegue abrir `.pptx`** — o LibreOffice falha ao carregar
qualquer arquivo, verificado com um arquivo mínimo gerado por `python-pptx`.
Sem renderização, a conferência visual é impossível daqui.

O que os dois scripts fazem no lugar disso:

| Script | Verifica |
|---|---|
| `qa/geometria.py` | caixa fora da página, texto que transborda a própria caixa, sobreposição entre blocos de texto |
| `qa/contencao.py` | texto que vaza a base ou a lateral do cartão que o contém, e a margem inferior segura |

Ambos devem terminar em zero achados. A única exceção esperada é a palavra
`ALUPAR` na capa, que é um fantasma de página inteira e sangra de propósito.

**Isto não substitui abrir o arquivo.** Abra uma vez antes de apresentar.

## O dossiê

`dossie.html` é o documento de compartilhamento com a Alupar.
`dossie-impressao.html` é a mesma coisa com a folha de estilo de impressão,
para virar PDF:

```bash
/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  --headless --disable-gpu --no-sandbox \
  --print-to-pdf=dossie-alupar.pdf --no-pdf-header-footer \
  apresentacao/dossie-impressao.html
```

## Ao alterar números

O deck e o dossiê citam medições — dias fora do ar, peso da home, contagem de
notícias, itens a migrar. Elas vêm do diagnóstico e do acervo, não da memória
de quem escreve. Ao mexer num número, confira contra `acervo/inventario.json`,
`acervo/conteudo.jsonl` e `docs/prd.md`, e corrija nos dois documentos: eles
são lidos por pessoas diferentes e divergir entre si custa mais que estar
desatualizado.
