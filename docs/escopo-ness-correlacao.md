# Escopo Técnico Preliminar da ness. — correlação com o diagnóstico

**Documento analisado:** *Escopo Técnico Preliminar — Reconstrução e consolidação dos
portais digitais Alupar*, v1.0, 02/09/2026, elaborado pela ness.

Aquele documento é anterior ao diagnóstico técnico deste repositório e circulou pelo time
de atendimento da ness. Este arquivo confronta os dois, ponto a ponto, e separa o que é
convergente do que exige decisão. **Todas as medições abaixo foram feitas em 02/09/2026 e
são reproduzíveis** — os comandos estão indicados.

---

## 1. Onde os dois documentos concordam

| Ponto | Escopo preliminar | Diagnóstico |
|---|---|---|
| RI fora do escopo | § 13 | D5 |
| Sem cópia técnica do ambiente da MZ | § 12 | `fornecedor-e-acervo.md` |
| Recuperação por conteúdo público | § 4 | `scripts/extrair-acervo.mjs` |
| Autonomia de publicação da Comunicação | § 9 | Critério de aceite do M3 |
| Homologação antes da produção | § 14 | M4 → M5 |
| Três idiomas, português como principal | § 6 | D3 |

A tese central é a mesma nos dois: o conteúdo é recuperável do que está público, e o
ambiente novo tem de devolver autonomia à Comunicação.

---

## 2. As três divergências que exigem decisão

### 2.1 A plataforma — WordPress (§ 2, § 9) contra Astro + Sanity + Cloudflare (D1–D4)

Esta é a decisão que governa todas as outras. Este repositório inteiro — o scaffold, os
tokens, as cinco skills, o portão de qualidade no CI — pressupõe saída estática.

O argumento honesto dos dois lados:

**A favor do WordPress.** A Comunicação já sabe operar. O conteúdo de origem é WordPress
com WPML, e importar WPML → WPML é mais direto do que WPML → qualquer outra coisa. Os três
ambientes secundários já são WordPress com Elementor. Se a ness. já vende sustentação de
WordPress, a operação encaixa no que existe.

**Contra.** O WordPress é a plataforma que produziu exatamente o estado atual: 2,19 MB na
home, 21 arquivos de JavaScript, tema de 2017, certificado vencido há 120 dias, conteúdo
parado há 1.280 dias. A causa é organizacional, não técnica — mas o WordPress **exige**
cuidado contínuo (patch de core, de tema, de plugin, PHP, backup, superfície de invasão),
e cuidado contínuo é precisamente o que faltou. Escolher WordPress é escolher uma
plataforma que pune a ausência de dono, para um site que ficou sem dono por três anos.

**O que mudou com a medição de hoje:** a API REST do institucional está **fechada**
(403 em `wp/v2`, ver § 4.1). A recuperação será por *crawling* do HTML público de qualquer
maneira, para qualquer destino. Ou seja, **o custo de importação é praticamente o mesmo
nos dois cenários** — o argumento de "importar WordPress para WordPress é mais barato"
perde quase toda a força. O critério de desempate passa a ser custo de operação em 24
meses e risco de repetir a história, e os dois favorecem o estático.

**Recomendação:** estático, salvo decisão comercial em contrário. Se a ness. optar por
WordPress, é uma escolha legítima — mas então este repositório precisa ser refeito, e o
custo dessa mudança tem de entrar na conta antes da assinatura, não depois.

### 2.2 O escopo — quatro ambientes (§ 3) contra um

A proposta de 500 h / R$ 49.800 / 6 a 7 semanas cobre **apenas o institucional**. Os três
ambientes adicionais são pequenos (ver § 4.2), mas não são gratuitos: somam 445 arquivos de
mídia e três reconstruções de página única em Elementor.

O documento acerta ao blindar o prazo do institucional (§ 1, diretriz central). O que falta
é dizer que os demais ambientes são **acréscimo de escopo e de valor**, não diluição do
mesmo pacote.

### 2.3 O que o escopo preliminar não menciona

Nenhum destes aparece no documento da ness., e todos estão medidos no diagnóstico:

- **O apex quebrado em HTTPS há 120 dias.** `https://alupar.com.br` (sem `www`) responde
  com certificado expirado desde 05/05/2026. Em `http://` o redirecionamento funciona, e o
  navegador mascara a falha ao voltar sozinho para HTTP — ver a armadilha no `AGENTS.md`.
  É o único problema que está no ar agora, e a correção depende só da ness., que administra
  a zona.
- **Acessibilidade.** Nenhuma imagem da home tem descrição; o formulário tem cinco campos e
  um rótulo. WCAG 2.2 AA não é citado no escopo nem nos critérios de aceite.
- **Desempenho.** 2,19 MB na home, 84% em imagens. Não há orçamento de peso no § 14.
- **SEO técnico e GEO.** Ausentes, embora o Yoast já esteja instalado na origem.
- **Marco 0.** O documento começa pela reconstrução; não há etapa de estancamento.

Os critérios de aceite do § 14 são todos de paridade funcional ("navegação funcionando",
"responsivo validado"). Nenhum é numérico. Sem número, não há porta de saída — e um site
que passa nesses critérios pode nascer com os mesmos defeitos do atual.

---

## 3. O que o escopo preliminar tem e o diagnóstico não tinha

Crédito onde é devido. O § 8 identificou os caminhos `/group/`, `/faq/` e `/video/` como
tipos de conteúdo personalizados — e estava certo. O inventário deste repositório tratava
essas URLs como páginas comuns. A correção está incorporada na § 4.1 abaixo.

O § 3 também trouxe os três ambientes secundários, que não estavam no radar.

---

## 4. Correções factuais, com medição

### 4.1 O modelo de conteúdo real do institucional

O índice de sitemap do Yoast expõe o modelo completo:

```
curl -s https://www.alupar.com.br/sitemap_index.xml
```

| Tipo | URLs | Observação |
|---|---:|---|
| `attachment` | 261 | mídia indexada |
| `noticia` | 225 | **entradas**, não itens — ver abaixo |
| `faq` | 76 | tipo personalizado, ausente do § 5 |
| `page` | 45 | o § 5 lista 12 |
| `banner_rotativo` | 18 | **ausente do § 8** — é o rotativo da home |
| `group` | 17 | tipo personalizado |
| `video` | 3 | tipo personalizado |
| `post` | 2 | praticamente não usado |
| `category` | 1 | |

Duas correções ao § 5 e ao § 8:

- **O § 5 lista 12 páginas; existem 45.** A relação do documento é a do menu, não a do site.
- **O § 8 identificou três tipos personalizados; existem cinco.** Falta o
  `banner_rotativo`, que é justamente onde vive o banner de COVID-19 de 2021 apontado no
  diagnóstico, e falta o `faq`, com 76 itens — o maior tipo personalizado do site.

**Sobre as 225 notícias.** O número do sitemap conta uma entrada por idioma. Descontando:
183 URLs distintas, das quais **99 em português** e **84 traduções** com slug traduzido
pelo WPML. O volume real de migração é 99 notícias mais 84 vínculos de tradução.

### 4.2 Os três ambientes secundários não são portais

```
curl -s https://rs.alupar.com.br/wp-json/wp/v2/pages?per_page=20
```

| Ambiente | Páginas | Posts | Mídia | O que é |
|---|---:|---:|---:|---|
| `rs` | 2 | 1 | 185 | uma home em Elementor + uma página "em breve…" de 07/05/2025 |
| `pdi` | 2 | 0 | 99 | uma home + uma página "emcontrucao" de 04/07/2024 |
| `ma` | 1 | 1 | 161 | uma home única |

Os posts em `rs` e `ma` são o **"Hello world!"** padrão do WordPress, nunca apagado. As
páginas "em breve" e "emcontrucao" são rascunhos esquecidos, publicamente acessíveis.

Chamá-los de "portais" (§ 3) superdimensiona o esforço e, ao mesmo tempo, esconde o que
realmente dá trabalho: **445 arquivos de mídia** distribuídos entre eles.

### 4.3 Eles não estão na infraestrutura da MZ

```
getent hosts www.alupar.com.br rs.alupar.com.br
```

| Host | IP | Infraestrutura |
|---|---|---|
| `www.alupar.com.br` | 52.202.5.191 / 52.204.44.81 | `sites-clients-03.mziq.com` — MZ |
| `ri.alupar.com.br` | 52.204.44.81 | **mesma máquina do institucional** — MZ |
| `alupar.com.br` (apex) | 34.230.121.250 | servidor isolado, só redireciona, certificado vencido |
| `rs` · `pdi` · `ma` | 185.162.55.134 | rede europeia (RIPE), **fora da MZ** |

Duas consequências práticas:

1. **O RI divide a mesma máquina do institucional.** Quando o novo fornecedor do RI mover
   aquele ambiente, isso mexe na hospedagem do institucional. Vale coordenar as duas
   viradas, ainda que os projetos sejam separados — é um risco que nenhum dos dois
   documentos registrava.
2. **Os três ambientes secundários estão com outro provedor.** A premissa do § 12
   ("indisponibilidade de acesso administrativo") pode não valer para eles. Vale perguntar
   à Alupar quem administra `185.162.55.134` antes de assumir que também é reconstrução às
   cegas.

### 4.4 A API do institucional está fechada — a dos outros, aberta

```
curl -sI https://www.alupar.com.br/wp-json/wp/v2/posts   →  403
curl -sI https://rs.alupar.com.br/wp-json/wp/v2/pages    →  200
```

No institucional o `wp/v2` sequer aparece nas rotas registradas: o iThemes Security o
removeu. A recuperação ali é mesmo por *crawling* — o § 4 do escopo está correto.

Nos três ambientes secundários a API está **aberta e íntegra**. O conteúdo e a mídia deles
podem ser extraídos hoje, programaticamente, com fidelidade total — sem depender de
fornecedor, de senha ou de reunião.

**Isto é perecível.** Basta uma troca de provedor ou o fechamento da API para virar
*crawling* de HTML como o institucional. Recomenda-se estender a issue #26 aos três
ambientes e executar agora.

### 4.5 O que os plugins da origem revelam

A raiz do `wp-json` do institucional continua pública e lista os namespaces registrados:

- **WPML** (`wpml/v1`, `wpml/st/v1`, `wpml/tm/v1`, `wpml/ate/v1`) — confirma D3
- **CPT UI** (`cptui/v1`) — confirma os cinco tipos personalizados
- **Redirection** (`redirection/v1`) — **há redirecionamentos já configurados na origem**
  que precisam entrar no mapa do § 11; ninguém os inventariou ainda
- **Yoast** (`yoast/v1`) — a base de SEO existente
- **MonsterInsights** (`monsterinsights/v1`) — é por aqui que o Google Analytics está
  ligado; relevante para a issue #11
- **iThemes Security**, **Simple History**, **OTGS Installer**

O **Simple History** guarda o log de edições. Se a Alupar conseguir uma leitura dele com a
MZ, ele responde de graça quem publicou o quê e quando — útil para nomear o dono do
conteúdo, que é a saída mínima da reunião de arranque.

---

## 5. Decisões que este documento força

1. **Plataforma.** WordPress ou estático. Enquanto não houver resposta, este repositório
   está construído sobre uma premissa que o escopo comercial contradiz.
2. **Escopo contratado.** Um ambiente ou quatro, e com que valor para os três adicionais.
3. **Marco 0.** Entra no escopo formal ou segue como ação separada da ness.?
4. **Critérios de aceite.** Os do § 14 são qualitativos. Os do diagnóstico são numéricos.
   Prevalece qual?
5. **Coordenação com o RI.** Mesma máquina, fornecedores diferentes, viradas próximas.

---

## 6. Ações que não dependem de nenhuma dessas decisões

- Corrigir o apex (issue #3). Depende só da ness.
- Extrair `rs`, `pdi` e `ma` pela API, enquanto ela está aberta.
- Inventariar as regras do plugin Redirection na origem, antes de perder o acesso.
- Extrair a linha de base do Google Analytics (issue #11).
