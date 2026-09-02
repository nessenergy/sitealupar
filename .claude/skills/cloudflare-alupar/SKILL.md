---
name: cloudflare-alupar
description: Convenções de borda e infraestrutura do sitealupar na Cloudflare — DNS da zona, proxy, Redirect Rules, cabeçalhos de segurança, Pages e Workers, com as armadilhas específicas deste domínio. Use ao mexer em _headers, _redirects, DNS, TLS, deploy, cabeçalho de segurança, formulário ou monitoramento. Trigger em Cloudflare, DNS, apex, certificado, HSTS, CSP, 301, redirect, Pages, Worker, Turnstile, deploy.
---

# Cloudflare — sitealupar

## O mapa do domínio, medido em 01/09/2026

```
NS  alupar.com.br    carol.ns.cloudflare.com / jaime.ns.cloudflare.com
A   alupar.com.br    34.230.121.250              ← origem própria, cert vencido em 05/05/2026
CN  www              sites-clients-03.mziq.com.  → 52.204.44.81  (MZ)
CN  ri               sites-clients-03.mziq.com.  → 52.204.44.81  (MZ, outra equipe)
MX  alupar.com.br    Google Workspace
```

**A zona está na Cloudflare, administrada pela ness., usada só como DNS.** Nenhum host tem proxy
ligado — não há `cf-ray` em resposta alguma. Toda a camada de borda está
disponível e desligada.

**O apex é outro servidor.** É uma segunda instância WordPress cuja única
função é responder 301 para `www`, e é ela que serve o certificado vencido.
Diagnosticar o apex olhando o `www` leva à conclusão errada.

## A armadilha que mais custa caro

**`ri.alupar.com.br` é de outra equipe e vive na mesma zona.** Antes de
qualquer mudança, pergunte se ela se propaga para lá:

- **HSTS com `includeSubDomains` atinge o RI.** Por isso `public/_headers`
  aplica HSTS **sem** `includeSubDomains` e **sem** `preload`, com o motivo
  comentado no arquivo. Estender é decisão conjunta, e `preload` é
  praticamente irreversível
- Regras de borda com padrão `*.alupar.com.br` atingem o RI
- O certificado curinga `*.alupar.com.br` é compartilhado e vence em
  **21/10/2026**. Depois que o apex e o `www` passarem para a Cloudflare, ele
  resta ao RI — mas até lá, é de todos

## Cabeçalhos

`public/_headers` é a fonte da verdade. O institucional hoje não envia CSP,
`Referrer-Policy` nem `Permissions-Policy`; o portal de RI envia os três — a
plataforma suporta, só não chegou deste lado.

Ao acrescentar um recurso externo, ajuste a CSP no mesmo commit. Se a CSP
precisar de `unsafe-inline` em `script-src`, o problema é o código, não a
política.

## Redirecionamentos

`public/_redirects` é o mapa de 301 do acervo. **Nenhuma URL antiga pode
responder 404** — são 20 páginas e 99 notícias indexadas desde 2017.

O redirecionamento de `/fotos` para o NAS (`alupar.us6.quickconnect.to`) sai do
WordPress e vira regra de borda: a instância que o faz hoje vai ser desligada.

Ao remover uma página, o 301 entra no mesmo commit.

## Formulário

Cloudflare Worker + **Turnstile**, no lugar do reCAPTCHA — menos rastreamento
do visitante e uma dependência a menos do Google. Consentimento LGPD explícito
e política de retenção declarada; o texto passa pela revisão jurídica da
Clarice, que precisa recebê-lo na Semana 4.

## Monitoramento

Verificação sintética diária de `alupar.com.br` **com e sem `www`** — o caso
sem `www` é o que ninguém testava, e é onde o site ficou quebrado por quatro
meses. Mais a galeria no NAS, que está fora do site e dentro da experiência.

Alerta de expiração de certificado em 30/14/7 dias.

## Verificação

```bash
curl -sSI https://alupar.com.br/ | head -3          # 301 + cf-ray
curl -sSv https://alupar.com.br/ 2>&1 | grep -E "issuer:|expire date"
curl -sSI https://www.alupar.com.br/ | grep -iE "content-security|referrer|permissions|strict-transport"
```
