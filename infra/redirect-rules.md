# Redirect Rules — o que o `_redirects` não alcança

Gerado por `scripts/gerar-redirecionamentos.mjs`. Não edite à mão.

O `_redirects` do Cloudflare Pages **não casa query string** — está na tabela
de suporte avançado da própria documentação. O site atual expressa idioma em
`?lang=`, então esses endereços só podem ser tratados na borda.

São **265 endereços vivos** hoje (132 em inglês, 133 em espanhol) onde a
tradução mora no mesmo caminho do português e só o parâmetro distingue. Não
viram 265 regras: viram **duas**, porque a transformação é a mesma para todas.

## Regra 0 — apex (aplicada em 11/09/2026)

Nome "apex para www", primeira regra da fase `http_request_dynamic_redirect`
da zona. O registro `A alupar.com.br 34.230.121.250` está com proxy ligado, então
o TLS do apex é da Cloudflare e o 301 sai da borda, sem chegar ao servidor antigo.

```
(http.host eq "alupar.com.br")
```

Destino, expressão dinâmica, **301 permanente**, preservando a query **ligado**
(aqui a query ainda vai ser lida pelas regras 1 e 2, já no `www`):

```
concat("https://www.alupar.com.br", http.request.uri.path)
```

O servidor `34.230.121.250` só pode ser desligado depois da virada.

## Regra 1 — inglês

```
(http.host eq "www.alupar.com.br" and http.request.uri.query contains "lang=en")
```

Destino, expressão dinâmica, **301 permanente**, preservando a query desligado:

```
concat("https://www.alupar.com.br/en", http.request.uri.path)
```

## Regra 2 — espanhol

```
(http.host eq "www.alupar.com.br" and http.request.uri.query contains "lang=es")
```

```
concat("https://www.alupar.com.br/es", http.request.uri.path)
```

## Por que 301 e por que preservar o caminho

O caminho é idêntico nos três idiomas nestes casos, então `concat` basta e
nenhuma tabela precisa ser mantida. O 301 transfere o histórico de indexação
para o endereço novo — com 302 o Google mantém o antigo, e o `?lang=` sobrevive
para sempre nos resultados de busca.

Desligar a preservação da query é deliberado: `/en/a-companhia/?lang=en` seria
uma segunda URL para a mesma página, exatamente o tipo de duplicata que o
diagnóstico apontou.

## Ordem

Estas duas regras vêm **depois** da regra do apex (`alupar.com.br` → `www`) e
**antes** de qualquer regra de página. Uma requisição para
`alupar.com.br/a-companhia/?lang=en` precisa primeiro virar `www`, e só então
ganhar o prefixo de idioma.

## Verificação

Depois de publicar, cada linha abaixo tem de responder 301 para o destino
indicado:

```bash
curl -sI "https://www.alupar.com.br/?lang=en" | grep -i "^location"
# esperado: /en/
curl -sI "https://www.alupar.com.br/?lang=es" | grep -i "^location"
# esperado: /es/
curl -sI "https://www.alupar.com.br/videos/?lang=en" | grep -i "^location"
# esperado: /en/videos/
curl -sI "https://www.alupar.com.br/videos/?lang=es" | grep -i "^location"
# esperado: /es/videos/
```
