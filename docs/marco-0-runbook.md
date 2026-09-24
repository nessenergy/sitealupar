# Marco 0 — runbook

> **Registro histórico.** Das sete ações emergenciais, seis estão resolvidas
> ou perderam objeto com a virada de 23/09/2026. A sétima — dono do
> certificado curinga — **perdeu objeto em 24/09**: medido, o `www` tem
> certificado da Cloudflare até 22/12/2026 e o portal de RI serve um válido
> até 03/04/2027; o curinga que vencia em 21/10 era o da MZ no `www` e nunca
> cobriu aquele host.

Sete ações, 16–24 h de esforço, executáveis em 48–72 h. **Independem da
replataforma** e não devem esperar por ela. Cada ação traz o comando de
verificação: a ação só está feita quando o comando responde o esperado.

Estado de partida medido em 01/09/2026.

---

## 0.1 — Domínio raiz quebrado em HTTPS

**Problema.** `https://alupar.com.br` serve certificado vencido em 05/05/2026.
O redirecionamento para `www` **existe, mas só na porta 80**:

```
http://alupar.com.br/   → 301 → http://www  → 301 → https://www  → 200
https://alupar.com.br/  → certificado expirado
```

Na maioria dos casos o visitante não percebe: o navegador tenta HTTPS, falha e
volta para HTTP sozinho, e o 301 o leva ao site. O erro aparece de fato para:

- quem tem HSTS gravado do `www` — o navegador **proíbe** o retorno a HTTP;
- quem usa modo "somente HTTPS" no Chrome ou Firefox;
- todo link escrito como `https://alupar.com.br` — e-mail, PDF, assinatura,
  material impresso, QR code;
- ferramentas sem *fallback*: `curl`, robôs de busca, verificadores de link,
  scanners de segurança e de conformidade.

**Não descreva isto como "o site está fora do ar".** É verificável em segundos
que não está, e a afirmação errada custa credibilidade na primeira contestação.
A formulação correta é: *o endereço sem `www` quebra em HTTPS, e o navegador
mascara a falha na maior parte dos acessos.*

**Causa.** O apex não é o mesmo servidor do resto:

```
alupar.com.br.       A      34.230.121.250              ← origem própria, cert vencido
www.alupar.com.br.   CNAME  sites-clients-03.mziq.com.  → 52.204.44.81
ri.alupar.com.br.    CNAME  sites-clients-03.mziq.com.  → 52.204.44.81
```

É uma segunda instância WordPress cuja única função é responder 301 para `www`.

**Ação.** A zona está na Cloudflare e é **administrada pela ness.** Nenhum host
tem proxy ligado. Portanto — e sem depender de terceiros:

1. Ligar o proxy (nuvem laranja) no registro do apex.
2. Criar uma *Redirect Rule*: `alupar.com.br/*` → `https://www.alupar.com.br/$1`,
   301, preservando path e query.
3. Confirmar que o TLS do apex passa a ser emitido pela Cloudflare.
4. Só então desligar o servidor `34.230.121.250` — não antes de (3) validar.

**Verificação.**

```bash
curl -sSI https://alupar.com.br/ | head -3
# esperado: HTTP/2 301 · location: https://www.alupar.com.br/ · cf-ray presente

curl -sSv https://alupar.com.br/ 2>&1 | grep -E "issuer:|expire date"
# esperado: emissor Cloudflare/Google Trust Services, validade futura

curl -sS -o /dev/null -w "%{http_code}\n" https://alupar.com.br/a-companhia/
# esperado: 200 após seguir o redirecionamento
```

**Responsável.** ness. — administra a zona. **Nada externo bloqueia esta ação.**

---

## 0.2 — Banners obsoletos no rotativo

Estão no ar: banner de **COVID-19 de 2021**, selo **Atmosfera FIA 2021** e três
telas de **agosto de 2017** (`tela-01/02/03.jpg`).

**Verificação.** Nenhuma imagem do rotativo com data anterior a 2024 no HTML da
home.

**Responsável.** Marketing, com a MZ.

---

## 0.3 — Notícias paradas há três anos e meio

**Superado pela D16 em 16/09/2026**: a área de notícias foi desativada, e não
há mais feed a combinar nem publicação a fazer. Os endereços vivos redirecionam
para `https://ri.alupar.com.br/noticias/`.

Última notícia do institucional: **02/03/2023**. No mesmo instante o portal de
RI exibe **06/08/2026**. Por D5, a fonte passa a ser a base do RI.

**Ação.** ~~Combinar o acesso ao feed do RI e publicar 03/2023 → 09/2026. Sem o
acesso a tempo, carga manual provisória.~~

**Verificação.**

```bash
curl -sS https://www.alupar.com.br/ | grep -oE '[0-9]{2}/[0-9]{2}/[0-9]{4}' | head -1
# esperado: data com no máximo 90 dias
```

**Responsável.** Comunicação Alupar + equipe do RI.

---

## 0.4 — CSS 404, links em http:// e `lang` errado

- `css/owl.carousel.css` referenciado no HTML e inexistente (404).
- Links internos em `http://`: `ri.alupar.com.br`, `/fotos`,
  `/alupar-e-a-covid-19/...` — um salto extra de redirecionamento por clique.
- `?lang=en` e `?lang=es` servem conteúdo traduzido dentro de
  `<html lang="pt-br">`.

**Verificação.**

```bash
curl -sS https://www.alupar.com.br/ | grep -oE 'href="http://[^"]+"'      # esperado: vazio
curl -sS -o /dev/null -w "%{http_code}\n" https://cdn-sites-assets.mziq.com/wp-content/themes/mziq_alupar_inst/css/owl.carousel.css  # esperado: 200 ou referência removida
curl -sS "https://www.alupar.com.br/?lang=en" | grep -oE '<html lang="[^"]*"'  # esperado: lang="en"
```

**Responsável.** MZ.

---

## 0.5 — Cabeçalhos de segurança

O institucional não envia CSP, `Referrer-Policy` nem `Permissions-Policy` — o
portal de RI envia os três. Nenhum dos hosts envia HSTS.

**Atenção ao escopo.** HSTS com `includeSubDomains` atinge
`ri.alupar.com.br`, que é de outra equipe. Aplicar **sem** `includeSubDomains`
até haver acordo — ver `public/_headers` neste repositório.

**Verificação.**

```bash
curl -sSI https://www.alupar.com.br/ | grep -iE "content-security|referrer|permissions|strict-transport"
# esperado: os quatro presentes
```

**Responsável.** MZ, ou borda da Cloudflare após 0.1.

---

## 0.6 — Dono do certificado curinga

`*.alupar.com.br` vence em **21/10/2026** e continua necessário para `www` e
`ri` enquanto servidos pela MZ. Após o go-live do institucional, resta ao RI.

**Ação.** Nomear responsável e ligar alerta em 30/14/7 dias.

**Verificação.**

```bash
for h in alupar.com.br www.alupar.com.br ri.alupar.com.br; do
  echo -n "$h "
  curl -sSv "https://$h/" 2>&1 | grep "expire date"
done
```

**Responsável.** Alupar + equipe do RI.

---

## 0.7 — Verificação sintética

Ligar checagem diária de `alupar.com.br` **e** `www.alupar.com.br` — o caso sem
`www` é justamente o que ninguém testava — mais a galeria no NAS (D4), com
alerta de expiração de certificado.

**Responsável.** Quem administra a zona.
