---
name: restauro-fiel
description: Regra de restauro fiel do site institucional da Alupar — o que pode mudar num template e o que não pode, com a conferência lado a lado obrigatória. Use ao desenhar ou implementar qualquer página, componente ou estado do sitealupar, ao avaliar um pedido de "melhoria", ao escolher cor, tipografia, espaçamento ou estrutura, e antes de aprovar qualquer tela. Trigger também em "posso mudar", "ficaria melhor se", "aproveitando que", redesenho, novo componente, nova seção.
---

# Restauro fiel

A decisão D2 deste projeto: **a linguagem visual é imutável; a composição
melhora só onde há problema medido.**

Isto não é preferência estética. É o que separa um projeto de 500 h de um
projeto de 900 h, e é a regra que o cliente aprovou.

## O teste, antes de qualquer coisa

Nenhuma tela é aprovada sozinha. Cada uma é conferida em duas comparações:

1. Contra **a página atual** em `www.alupar.com.br`
2. Contra **o portal de RI** em `ri.alupar.com.br`, que **não será refeito** e
   vai conviver com o site novo — o visitante alterna entre os dois por um link
   no topo

**Se alguém que conhece o site notar a mudança sem ser avisado, passou do
ponto.** Divergência visual entre o institucional novo e o RI é defeito, não
escolha.

## A pergunta que autoriza uma mudança

> Qual problema medido esta mudança resolve?

Se a resposta não citar um número, uma norma ou uma linha do diagnóstico, a
mudança não entra. "Ficaria melhor", "é mais moderno", "aproveitando que
estamos mexendo" não são respostas.

É assim que restauro vira redesign por acúmulo: uma decisão razoável de cada
vez.

## O que pode mudar — e só isto

| Mudança | Problema medido que a autoriza |
|---|---|
| Verde `#06893C` em texto e links | `#079541` entrega 3,90:1 sobre branco; AA exige 4,5:1 |
| Cinzas de texto escurecidos | `#9B9B9B` entrega 2,78:1; `#D2D2D2`, 1,51:1 |
| Recorte de banner por breakpoint | Proporção 5,82:1 vira faixa de 67 px num celular de 390 px |
| Carrossel com pausa, teclado e altura reservada | Autoplay sem controle e salto de layout |
| Rótulos visíveis no formulário | Cinco campos, um `<label>` |
| Anel de foco no teclado | Não existe indicação de foco |
| Escala tipográfica regularizada | Hierarquia salta de `h1` para `h3` |
| Cartões de notícia com data e título legíveis | Listagem sem hierarquia |
| Faixa institucional na home | A home não diz em lugar nenhum o que a Alupar é. **Única alteração de estrutura de todo o projeto** |

Tudo o mais do diagnóstico — imagens, JavaScript, cabeçalhos, `alt`, `h1`,
JSON-LD, redirecionamentos — é invisível e não precisa de autorização.

## O que não muda

- **Paleta.** Azul `#004F9D`, verde `#079541`, cinza `#6F7273`, preto `#373435`.
  Vêm do Manual de Identidade Visual 2018. Ver `src/styles/tokens.css`
- **Tipografia.** Open Sans. Sem família nova, sem par tipográfico de display
- **Header, menu, rodapé e grade de 1140 px.** Mesma estrutura, mesma altura
- **Ordem das seções da home.** Rotativo, faixa, notícias, vídeo, sustentabilidade
- **Vocabulário de componentes.** Nenhum gradiente, sombra elaborada, ilustração
  ou família de ícones que o site não tenha hoje

Qualquer um destes vira nova conversa com o cliente, não ajuste de rota.

## Regras do manual de marca que valem sempre

- Versão principal do logotipo: **azul sobre fundo branco**. A invertida (branco
  e verde) é só para fundo azul
- Sobre foto ou textura, o logotipo **precisa de box** — o site atual já cumpre,
  com `bg-logo.png`. Não "limpe" isso achando que é sobra
- Proibido esticar, distorcer, girar, contornar, sombrear, recolorir ou sobrepor
- Campo de proteção: altura da letra "A"
- **O Marketing da Alupar aprova qualquer uso da marca.** É instância formal, e
  é portão do M2 — não revisão no fim

## Quando a dúvida for legítima

Há casos em que preservar e corrigir entram em conflito de verdade. Nesses,
não decida sozinho: leve as duas opções renderizadas lado a lado, com o
problema medido de um lado e o custo visual do outro. O cliente decide.

O único caso conhecido hoje é o formulário de contato: rótulos visíveis são a
correção certa e são **a única mudança realmente perceptível** do projeto.
