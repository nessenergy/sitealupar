# Conteúdo extraído de rs, pdi e ma

Extraído em 02/09/2026 por `scripts/extrair-microsites.mjs`, pela API REST
pública de cada ambiente.

| Ambiente | Páginas | Posts | Mídia | Bytes declarados |
|---|---:|---:|---:|---:|
| `rs.alupar.com.br` | 2 | 1 | 185 | 45,9 MB |
| `pdi.alupar.com.br` | 2 | 0 | 99 | 28,5 MB |
| `ma.alupar.com.br` | 1 | 1 | 161 | 20,4 MB |
| **Total** | **5** | **2** | **445** | **94,7 MB** |

## O que estes números dizem

Nenhum dos três é um portal. Cada um é **uma página construída no Elementor**.
O resto é resíduo: `rs` tem uma página "em breve…" de 07/05/2025 e `pdi` uma
"emcontrucao" de 04/07/2024, ambas públicas; `rs` e `ma` ainda têm o post
**"Hello world!"** padrão do WordPress, nunca apagado.

O trabalho real de migração são os **445 arquivos de mídia**, não as cinco
páginas.

## Por que foi extraído agora

Estes três expõem `wp-json`; o institucional não — lá o iThemes Security
removeu as rotas `wp/v2`, e sobra o crawling de HTML. Enquanto a API responde,
a cópia é fiel. Os três resolvem para `185.162.55.134`, que **não** é a
infraestrutura do fornecedor atual — é a Hostinger, na conta da ness.
(confirmado em 10/09/2026).

Isso tirou a urgência que motivou a extração: com o host sob controle da ness.,
não há troca de provedor que feche o acesso. Os três também saíram do escopo
deste projeto — ficam na ness. até a proposta de portal de 2027 (ver
`docs/escopo-ness-correlacao.md` § 2.2). A cópia fica como referência.

## O que está versionado

Só o conteúdo e os manifestos — `pages.json`, `posts.json`, `media.json` e o
resumo `microsites.json`, cerca de 2,9 MB. Os binários ficam de fora do git
(`.gitignore`); para baixá-los:

```bash
node scripts/extrair-microsites.mjs --midia
```

Reexecutar é seguro: arquivos com o tamanho esperado são pulados. Itens sem
`media_details.filesize` — SVG, ZIP e outros não-imagem, para os quais o
WordPress não calcula o tamanho — são rebaixados a cada execução, porque não há
como verificar se a cópia local está íntegra. Foram 9 dos 99 arquivos em `pdi`.
