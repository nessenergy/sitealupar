---
name: marca-alupar
description: Identidade visual da Alupar segundo o Manual de Identidade Visual 2018 — paleta oficial com as correções documentadas, tipografia, versões e proibições do logotipo, e quem aprova. Use ao escolher ou aplicar cor, ao mexer em tipografia, ao usar o logotipo em qualquer contexto, e antes de submeter qualquer peça à Alupar. Trigger em hex, Pantone, CMYK, contraste, fonte, Open Sans, Segoe UI, logo, logotipo, marca, assinatura visual.
---

# Marca Alupar

Fonte: Manual de Identidade Visual 2018, conferido contra a arte vetorial do
próprio PDF e contra os temas do site. Os valores vivem em
`src/styles/tokens.css` — este arquivo explica **por quê** eles são esses.

## Paleta

| Papel | Token | Valor | Origem |
|---|---|---|---|
| Azul primário | `--azul` | `#004F9D` | Pantone 661 C · CMYK 100/75/0/6 |
| Verde primário | `--verde` | `#079541` | Pantone 7482 C · CMYK 90/0/93/0 |
| Cinza de apoio | `--cinza` | `#6F7273` | Cool Gray 10 C · CMYK 0/0/0/70 |
| Preto de texto | `--preto` | `#373435` | MIV, "preto" |

### Duas correções, e elas são deliberadas

**O `#00A0E3` impresso no manual é erro de digitação.** Contradiz as outras
três especificações da mesma linha: Pantone 661 C e CMYK 100/75/0/6 são
azul-marinho, e o RGB que o próprio manual lista (0 53 148) equivale a
`#003594`. `#00A0E3` é um ciano claro. Não use, mesmo que alguém cite o manual.

**O verde de marca reprova contraste em texto.** `#079541` entrega **3,90:1**
sobre branco; AA exige 4,5:1. Em texto e links use `--verde-texto` (`#06893C`,
4,51:1). Em barras, botões e superfícies o `#079541` **fica intacto** — lá o
critério é 3:1 e ele passa. A diferença é imperceptível lado a lado.

Cuidado também com os cinzas herdados do site: `#9B9B9B` entrega 2,78:1 e
`#D2D2D2`, 1,51:1. Servem para borda e divisor, nunca para texto.

## Tipografia

O manual determina **Segoe UI** (Light, Regular, Itálico, Bold), com **Arial**
como alternativa declarada.

Segoe UI é fonte de sistema da Microsoft e **não se licencia para incorporação
em web**. Por isso a decisão D12: **Open Sans é a fonte oficial para tela**,
Segoe UI permanece no impresso e no escritório. O manual ganha um adendo; o
site não muda.

Auto-hospedada, sem requisição ao Google Fonts.

Regras do manual que seguem valendo: sem sombra, brilho, contorno ou degradê
nas letras; o nome da marca nunca em caixa alta em texto corrido.

## Logotipo

- **Versão principal:** marca azul sobre fundo branco, com a barra verde acima
- **Versão invertida** (branco e verde): só sobre fundo azul
- **Monocromáticas:** meio-tom e traço, quando não houver cor
- **Campo de proteção:** a altura da letra "A" em volta
- **Redução máxima:** 2,5 cm — regra de impressão; o equivalente em tela ainda
  precisa ser definido no guia de estilo

O arquivo está em `public/logo-alupar.svg`, extraído da arte vetorial do manual
(p.6) com as cores normalizadas para os tokens. **Pendente de conferência do
Marketing** contra o arquivo oficial da Intranet.

### Proibido

Esticar, distorcer, girar, contornar, sombrear, recolorir, sobrepor qualquer
coisa, usar a versão colorida sobre fundo colorido, foto ou preto.

**Sobre foto ou textura o logotipo exige box.** O site atual já cumpre, com
`bg-logo.png` — não "limpe" isso achando que é sobra.

## Quem aprova

**O Marketing da Alupar aprova qualquer uso da marca.** É o que o manual
determina, e é instância formal — portão do M2, não revisão no fim.

O manual de 2018 nomeia André Schneider Prietsch (gerente) e Jacqueline Araujo
(analista). São nomes de oito anos atrás: confirme quem responde hoje antes de
submeter qualquer peça.
