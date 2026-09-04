# O que a origem redireciona hoje

Levantado em 04/09/2026 por `scripts/descobrir-redirects.mjs`, e guardado em
`acervo/redirects-origem.json`.

## Por que isto precisou de um script próprio

O plugin **Redirection** está ativo no WordPress do institucional — aparece nos
namespaces do `wp-json`. As regras dele vivem no banco de dados, ao qual não
temos acesso, e o fornecedor atual não as entrega.

Mas toda regra ativa é observável de fora: basta pedir a URL e **não seguir** o
redirecionamento. É a única diferença entre este script e o extrator do acervo,
que segue a cadeia e registra só o destino final — um 301 seguido desaparece do
inventário. Aqui o 301 é o dado.

Sem este levantamento, cada regra configurada pela Alupar ao longo dos anos
morreria na virada em silêncio, e o sintoma apareceria semanas depois como
tráfego que sumiu sem explicação.

## As catorze regras vivas

| Endereço | Destino na origem |
|---|---|
| `/companies/` | `/empresas/` |
| `/contact/` | `/contato/` |
| `/news/` | `/noticias/` |
| `/geracao/` | `/faq/geracao/` |
| `/video/` | `/faq/videos-dos-projetos-sociais-apoiados-pela-alupar/` |
| `/sustainability/` | `/faq/sustainability/?lang=en` |
| `/sustentabilidade/` | `/faq/sustentabilidade-2/` |
| `/index.php` | `/` |
| `/rss/` | `/feed/` |
| `/sitemap.xml` | `/sitemap_index.xml` |
| `/wp-sitemap.xml` | `/sitemap_index.xml` |
| `/fotos` | a galeria no NAS |
| **`/en`** | **uma notícia de 2014** |
| **`/en/`** | **uma notícia de 2014** |

## O achado que muda uma decisão

**`/en/` já está ocupado, e aponta para o lugar errado.**

Hoje, `https://www.alupar.com.br/en/` responde 301 para
`/noticia/entrada-em-operacao-comercial-de-reforco-autorizado-da-erte/` — um
comunicado de 2014.

A decisão D14 adota `/en/` e `/es/` como prefixo de idioma do site novo. Se
essa regra sobreviver à virada, **todo visitante de língua inglesa cai num
comunicado de doze anos atrás** em vez da home em inglês. É o tipo de defeito
que não aparece em teste de página, porque ninguém testa a raiz de um idioma —
testa-se `/en/a-companhia/`, que funcionaria.

A regra não é da Alupar: é resíduo de alguma tentativa antiga de versão em
inglês. **Ela precisa ser removida antes do go-live**, e a verificação entra
nos critérios de aceite do M5:

```bash
curl -sI https://www.alupar.com.br/en/ | grep -iE "^(HTTP|location)"
# esperado depois da virada: HTTP/2 200, sem location
```

## Uma dependência criada, não um defeito

A origem manda `/sustentabilidade/` para `/faq/sustentabilidade-2/`. No site
novo a página canônica passa a ser `/sustentabilidade/`, e é
`/sustentabilidade-2/` que redireciona — o inverso.

Isso é deliberado: `sustentabilidade-2` é cicatriz de edição do WordPress, não
um endereço que alguém escolheu. Mas cria uma dependência: **a página precisa
existir em `/sustentabilidade/`**. Se ela não for criada com esse caminho, o
redirecionamento aponta para um 404 e viola a regra 3.

## O que não foi encontrado

Sondei 57 endereços candidatos: padrões do WordPress, seções que poderiam ter
mudado de nome, variações de idioma, e as duplicatas que o diagnóstico apontou.
Vinte e nove não existem — entre eles `/quem-somos/`, `/sobre/`, `/imprensa/`,
`/canal-de-denuncias/` e `/termos-de-uso/`.

Isto é uma amostra, não um censo: só o banco do WordPress tem a lista completa.
Se em algum momento houver acesso ao painel do Redirection, exporte as regras e
confronte com este arquivo — o que aparecer lá e não aqui é tráfego que este
levantamento não alcançou.
