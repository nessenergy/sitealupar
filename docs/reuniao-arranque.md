# Arranque — o que falta e como estruturar a reunião

O código está pronto para começar. **Nada do que falta é código.**

Este documento lista os pendentes por quem consegue destravá-los, propõe a
estrutura das reuniões e traz as mensagens prontas para enviar.

---

## 1. O que falta

### Decisões da Bekaa — não dependem de ninguém de fora

| # | Decisão | Impacto | Prazo |
|---|---|---|---|
| B1 | Quem faz o design (52 h) | Sem isso não há M2. Freelancer, alguém do Marketing da Alupar, ou absorver internamente | Antes da S1 |
| B2 | Quem faz acessibilidade (32 h) | Critério de aceite; o CI reprova o merge sem isso. Não é cortável | Antes da S5 |
| B3 | Quem traduz EN/ES (20 h) | Pode ser fornecedor da própria Alupar — perguntar antes de contratar | Antes da S4 |
| B4 | Segundo dev a 30% (84 h, R$ 10.080) — ou aceitar o risco por escrito | Lucas fica a 73% por sete semanas, sozinho na função técnica. Não é sobrecarga, é ponto único de falha | Antes da S2 |

As três primeiras somam 104 h e **já estão dentro dos R$ 60.000** — falta quem
execute, não verba. Só o B4 é acréscimo.

### Nomes que a Alupar precisa dar — nenhum custa hora

Eram seis; A1 saiu porque a ness. administra o domínio.

| # | Papel | O que trava |
|---|---|---|
| ~~A1~~ | ~~Quem administra a zona Cloudflare~~ | **Resolvido: é a ness.** A correção do domínio não depende de mais ninguém |
| A2 | Interlocutor da equipe do RI | #5 e o feed de notícias, no caminho crítico |
| A3 | Interlocutor da MZ | #4, #6, #7 e o prazo de desligamento |
| A4 | Aprovador de marca no Marketing | O portão do M2. O manual de 2018 nomeia pessoas que podem não estar mais lá |
| A5 | **Dono do conteúdo, com nome próprio** | O go-live. É condição de aceite |
| A6 | Padrinho executivo | Impasses entre Comunicação, Marketing, RI e TI |

### Dados que a Alupar precisa fornecer

| # | Dado | Prazo | Observação |
|---|---|---|---|
| D1 | km de linhas de transmissão | M2 | Faixa institucional |
| D2 | MW de capacidade instalada | M2 | Faixa institucional |
| D3 | Acesso ao GA4 `G-HH1N2K084G` | **Antes do go-live** | Irreversível: sem a linha de base, não há com o que comparar depois |
| D4 | Arquivos vetoriais oficiais do logotipo | S1 | Temos um extraído do manual, pendente de conferência |
| D5 | Valor do contrato com a MZ e custo do servidor `34.230.121.250` | Quando houver | Sem eles não dá para calcular o retorno |

### Autorizações

| # | O quê | Por quê |
|---|---|---|
| Z1 | Executar o Marco 0 esta semana | R$ 1.920–2.880. Corrige um problema que está no ar agora |
| Z2 | Criar a conta do Sanity **em nome da Alupar** | É o que torna a saída de qualquer fornecedor futuro indolor |
| ~~Z3~~ | ~~Acesso de administrador à zona Cloudflare~~ | **Já temos.** A ness. administra a zona |

---

## 2. São duas reuniões, não uma

As decisões têm donos diferentes. Misturar as duas faz a pauta interna
atrapalhar a conversa com o cliente, e vice-versa.

### Reunião A — interna, Bekaa · 30 min

**Participantes:** Boss, Marcela, Camila, Lucas.

**Objetivo:** fechar B1 a B4 antes de falar com o cliente. Chegar na reunião com
a Alupar sem saber quem faz o design enfraquece tudo o que vem depois.

| Tempo | Assunto |
|---|---|
| 0–10 | As três lacunas: design, acessibilidade, tradução. Contratar, pedir à Alupar ou absorver |
| 10–20 | O risco de ponto único em Lucas. Segundo dev ou aceitação formal |
| 20–30 | Quem conduz a reunião com a Alupar e quem mais entra |

**Saída:** B1–B4 decididos e registrados em `docs/equipe.md`.

### Reunião B — arranque com a Alupar · 60 min

**Conduz:** Camila. **Participam pela Bekaa:** Marcela e Lucas.

**Precisam estar do lado da Alupar** — e isto é o que determina se a reunião
serve para alguma coisa:

- Comunicação (dono do conteúdo — A5)
- Marketing (aprovação de marca — A4)
- TI, se houver decisão de infraestrutura do lado deles
- Alguém com poder de decidir quando as áreas divergirem (A6)

Se faltar Marketing, a reunião não resolve o portão do M2. Se faltar
Comunicação, não resolve o dono do conteúdo — que é o item mais importante.

**Enviar 48 h antes:** o diagnóstico e o plano, com o pedido explícito de que
cheguem lidos. A reunião não é para apresentar o diagnóstico — é para decidir
sobre ele.

| Tempo | Assunto | Objetivo |
|---|---|---|
| 0–10 | **O estado atual, com evidência.** O domínio sem `www` fora do ar há quatro meses; a última notícia com 1.280 dias; 2,19 MB de home | Alinhar que o problema é real e medido, não opinião |
| 10–20 | **O que já existe.** Repositório, plano de 500 h, custo, cronograma de 6–7 semanas, decisões fechadas | Mostrar que a conversa é sobre executar, não sobre estudar |
| 20–35 | **Os cinco nomes (A2–A6).** Sair com pessoa, não com área | O ponto mais importante da pauta |
| 35–50 | **Os dados (D1–D5)** e o alerta do GA4: a linha de base precisa ser extraída antes da virada, e isso não volta | Prazos com responsável |
| 50–60 | **Marco 0 (Z1).** Autorização para executar esta semana, com o custo declarado | Uma decisão, tomada na reunião |

**Saída mínima aceitável:** A5 (dono do conteúdo) e Z1 (autorização do Marco 0).
Sem esses dois, a reunião precisa de uma segunda rodada e o cronograma escorrega.

**A correção do domínio não é pauta de decisão.** A zona é administrada pela
ness., então a ação 0.1 pode — e deve — ser executada antes da reunião. Levá-la
como item a aprovar seria adiar por uma semana o que já pode ser feito hoje.

---

## 3. Mensagens prontas

### Para a ness. — os nomes

> Assunto: Site institucional da Alupar — cinco interlocutores que precisamos identificar
>
> Estamos com o diagnóstico e o plano do site institucional fechados, e o
> repositório já preparado para começar. Antes de arrancar, precisamos de seis
> interlocutores do lado da Alupar. Nenhum consome hora do projeto, e todos
> travam alguma coisa:
>
> 1. **Interlocutor da equipe do portal de RI** — o feed de notícias do
>    institucional passará a vir de lá, e há mais quatro pontos de fronteira a
>    combinar.
> 2. **Interlocutor da MZ Group** — três das ações emergenciais dependem deles,
>    e a saída da plataforma é também conversa contratual.
> 3. **Quem aprova uso de marca no Marketing** — o manual de identidade nomeia
>    duas pessoas, mas ele é de 2018.
> 4. **Dono do conteúdo institucional, com nome próprio.** O site tem a última
>    notícia de março de 2023; o portal de RI está em dia. A diferença entre os
>    dois não é técnica: é que um tem dono e o outro não.
> 5. **Um padrinho executivo** para quando Comunicação, Marketing, RI e TI
>    divergirem entre si.
>
> Podemos tratar tudo numa reunião de uma hora, desde que Comunicação,
> Marketing e TI estejam presentes. Sugiro enviar o diagnóstico antes para que
> cheguem lidos.

### Para a Alupar — os dados

> Assunto: Site institucional — quatro insumos para o arranque
>
> Precisamos de quatro coisas que só vocês têm. Duas têm prazo que não volta.
>
> **1. Dois números institucionais** — km de linhas de transmissão e MW de
> capacidade instalada. Vão para uma faixa na home, ao lado de dois dados que
> o próprio portal de RI já publica (presença em quatro países e rating AAA
> pela Fitch). Hoje a home não diz em lugar nenhum o que a Alupar é ou faz.
> Não vamos estimar esses valores. **Prazo: antes da terceira semana.**
>
> **2. Acesso ao Google Analytics** (propriedade `G-HH1N2K084G`, hoje
> compartilhada com o portal de RI). Precisamos extrair a linha de base — de
> onde vem o tráfego, quais páginas são mais vistas — **antes da virada do
> site**. Depois dela, não há mais com o que comparar, e isso não se recupera.
>
> **3. Arquivos vetoriais oficiais do logotipo.** O manual indica que ficam na
> Intranet, na pasta do Marketing. Recuperamos uma versão a partir do próprio
> PDF do manual, mas ela precisa ser conferida contra o arquivo oficial.
>
> **4. Valor do contrato atual de hospedagem e o custo do servidor auxiliar
> que hoje só faz redirecionamento.** Sem eles não conseguimos calcular em
> quanto tempo o investimento se paga — e não vamos estimar valores de
> contrato que não vimos.
>
> Um aviso técnico que não pode esperar pelo projeto: `alupar.com.br` sem
> `www` está fora do ar desde 05/05, servindo certificado vencido. A correção
> é de minutos e depende só de quem administra o domínio.

---

## 4. Depois da reunião

Registrar as respostas em `docs/decisoes.md` e fechar as issues #10 e #11 com
os nomes e os dados. O que não for respondido vira pendência com data, não
volta para a lista genérica.
