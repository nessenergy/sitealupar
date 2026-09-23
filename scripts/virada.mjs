/**
 * Os passos da virada, executáveis e reversíveis — Tarefa 12 do
 * `docs/plano-virada.md`, que até aqui era uma lista de cliques no painel.
 *
 * Existe porque a virada é a operação mais arriscada do projeto e a mais
 * simples de errar no meio: o que troca o site de servidor é um registro de
 * DNS e um domínio no Pages, e o que desfaz é o mesmo par na ordem inversa.
 * Em código, cada passo diz o que vai fazer antes de fazer, confere depois, e
 * o retorno é um comando em vez de memória de plantão.
 *
 *   node scripts/virada.mjs estado      # o que está valendo agora (só lê)
 *   node scripts/virada.mjs preparo     # véspera: TTL de 60 s e as regras de ?lang=
 *   node scripts/virada.mjs virar --confirmar
 *   node scripts/virada.mjs voltar --confirmar
 *
 * `preparo` é idempotente e não muda nada para quem acessa: as regras de
 * `?lang=` ficam inertes enquanto o `www` não tiver proxy, e o TTL só encurta
 * o tempo de propagação de um retorno. `virar` e `voltar` exigem
 * `--confirmar` porque trocam o site institucional de servidor.
 *
 * Precisa de `CLOUDFLARE_API_TOKEN` no ambiente, com escrita em DNS, em Rules
 * e no Pages.
 */
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONA = 'alupar.com.br';
const HOST = 'www.alupar.com.br';
const PROJETO = 'sitealupar';
/* Para onde o `www` volta: o host da MZ, sem proxy, que é como ele está hoje.
   Está escrito aqui, e não lido do estado, de propósito — na hora de voltar o
   estado já é o novo, e é justamente o antigo que se precisa saber. */
const ORIGEM_MZ = 'sites-clients-03.mziq.com';
/* Para onde o `www` passa a apontar. Pelo painel a Cloudflare oferece trocar o
   registro sozinha; pela API não — ela acrescenta o domínio ao projeto e o deixa
   "pending" enquanto o CNAME apontar para outro lugar. A troca do registro é a
   virada de fato, e é este script que a faz. */
const DESTINO_PAGES = `${PROJETO}.pages.dev`;

/* As duas regras que o `_redirects` do Pages não alcança: ele não casa query
   string, e o site atual expressa idioma em `?lang=`. Detalhe e motivo em
   `infra/redirect-rules.md`; aqui ficam na forma que a API aceita. */
const REGRAS_LANG = ['en', 'es'].map((idioma) => ({
  action: 'redirect',
  description: `lang=${idioma} para /${idioma}`,
  expression: `(http.host eq "${HOST}" and http.request.uri.query contains "lang=${idioma}")`,
  action_parameters: {
    from_value: {
      status_code: 301,
      target_url: { expression: `concat("https://${HOST}/${idioma}", http.request.uri.path)` },
      preserve_query_string: false,
    },
  },
}));

if (!TOKEN) {
  console.error('CLOUDFLARE_API_TOKEN não está no ambiente.');
  process.exit(1);
}

async function api(caminho, opcoes = {}) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${caminho}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(opcoes.headers ?? {}),
    },
  });
  const corpo = await r.json();
  if (!corpo.success) {
    const motivo = (corpo.errors ?? []).map((e) => `${e.code}: ${e.message}`).join('; ');
    throw new Error(`${opcoes.method ?? 'GET'} ${caminho} → ${motivo || r.status}`);
  }
  return corpo.result;
}

const umaZona = async () => (await api(`/zones?name=${ZONA}`))[0];
const umaConta = async () => (await api('/accounts'))[0];
const registroWww = async (zona) => (await api(`/zones/${zona.id}/dns_records?name=${HOST}`))[0];
const conjuntoDeRegras = (zona) => api(`/zones/${zona.id}/rulesets/phases/http_request_dynamic_redirect/entrypoint`);
const dominiosDoPages = (conta) => api(`/accounts/${conta.id}/pages/projects/${PROJETO}/domains`);

async function estado() {
  const [zona, conta] = [await umaZona(), await umaConta()];
  const www = await registroWww(zona);
  const regras = await conjuntoDeRegras(zona);
  const dominios = await dominiosDoPages(conta);

  console.log(`zona      ${zona.name} (${zona.status})`);
  console.log(`${HOST}   ${www.type} → ${www.content} · proxy ${www.proxied ? 'ligado' : 'desligado'} · TTL ${www.ttl === 1 ? 'automático' : `${www.ttl} s`}`);
  console.log(`regras    ${(regras.rules ?? []).map((r) => r.description).join(' | ') || '(nenhuma)'}`);
  console.log(`Pages     ${dominios.length ? dominios.map((d) => `${d.name} (${d.status})`).join(', ') : '(sem domínio próprio)'}`);
  /* Quem decide é o registro de DNS, não a presença do domínio no projeto: com
     o domínio acrescentado e o CNAME ainda na MZ, o site no ar é o antigo. */
  const virado = www.content === DESTINO_PAGES;
  console.log(`\n${virado ? 'O www aponta para o site novo.' : 'O www ainda é servido pela MZ.'}`);
}

async function preparo() {
  const zona = await umaZona();

  const www = await registroWww(zona);
  if (www.ttl === 60) {
    console.log(`TTL       já está em 60 s`);
  } else {
    await api(`/zones/${zona.id}/dns_records/${www.id}`, { method: 'PATCH', body: JSON.stringify({ ttl: 60 }) });
    console.log(`TTL       ${www.ttl === 1 ? 'automático' : `${www.ttl} s`} → 60 s`);
  }

  /* `POST` de regra, nunca `PUT` do conjunto: um `PUT` no entrypoint da fase
     substitui a lista inteira e apagaria a regra do apex, que é o que mantém
     `alupar.com.br` respondendo. */
  const regras = await conjuntoDeRegras(zona);
  const existentes = new Set((regras.rules ?? []).map((r) => r.description));
  for (const regra of REGRAS_LANG) {
    if (existentes.has(regra.description)) {
      console.log(`regra     "${regra.description}" já existe`);
      continue;
    }
    await api(`/zones/${zona.id}/rulesets/${regras.id}/rules`, { method: 'POST', body: JSON.stringify(regra) });
    console.log(`regra     "${regra.description}" criada`);
  }

  console.log('\npreparo pronto. Nada mudou para quem acessa: as regras só valem com o www na Cloudflare.');
}

async function virar() {
  const [zona, conta] = [await umaZona(), await umaConta()];

  const dominios = await dominiosDoPages(conta);
  if (dominios.some((d) => d.name === HOST)) {
    console.log(`Pages     ${HOST} já está no projeto ${PROJETO}`);
  } else {
    const d = await api(`/accounts/${conta.id}/pages/projects/${PROJETO}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: HOST }),
    });
    console.log(`Pages     ${HOST} acrescentado — estado: ${d.status}`);
  }

  /* A virada. Com proxy ligado: é ele que põe o TLS e os cabeçalhos da borda na
     frente do Pages, e é o que a regra do apex e as de `?lang=` esperam. */
  const www = await registroWww(zona);
  if (www.content === DESTINO_PAGES && www.proxied) {
    console.log(`DNS       ${HOST} já aponta para ${DESTINO_PAGES}`);
  } else {
    console.log(`DNS       ${HOST}: ${www.content} → ${DESTINO_PAGES}, com proxy`);
    await api(`/zones/${zona.id}/dns_records/${www.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ type: 'CNAME', name: HOST, content: DESTINO_PAGES, proxied: true, ttl: 60 }),
    });
  }

  console.log('\nO certificado da borda pode levar alguns minutos para ficar pronto.');
  console.log('Confira com: node scripts/virada.mjs estado  e  node scripts/verificar-no-ar.mjs');
  console.log('Se reprovar e a correção não sair em 30 min: node scripts/virada.mjs voltar --confirmar');
}

async function voltar() {
  const [zona, conta] = [await umaZona(), await umaConta()];

  const dominios = await dominiosDoPages(conta);
  if (dominios.some((d) => d.name === HOST)) {
    await api(`/accounts/${conta.id}/pages/projects/${PROJETO}/domains/${HOST}`, { method: 'DELETE' });
    console.log(`${HOST} removido do Pages`);
  } else {
    console.log(`${HOST} não estava no Pages`);
  }

  const www = await registroWww(zona);
  if (www.content === ORIGEM_MZ && www.proxied === false) {
    console.log(`${HOST} já aponta para ${ORIGEM_MZ}, sem proxy`);
  } else {
    await api(`/zones/${zona.id}/dns_records/${www.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ type: 'CNAME', name: HOST, content: ORIGEM_MZ, proxied: false, ttl: 60 }),
    });
    console.log(`${HOST} → ${ORIGEM_MZ}, sem proxy`);
  }

  console.log('\nO site voltou para a MZ. Com TTL de 60 s, a propagação é de cerca de um minuto.');
}

const COMANDOS = { estado, preparo, virar, voltar };
const [comando] = process.argv.slice(2);
const confirmado = process.argv.includes('--confirmar');

if (!COMANDOS[comando]) {
  console.error(`uso: node scripts/virada.mjs ${Object.keys(COMANDOS).join('|')} [--confirmar]`);
  process.exit(1);
}
if ((comando === 'virar' || comando === 'voltar') && !confirmado) {
  console.error(`"${comando}" troca o site institucional de servidor. Repita com --confirmar.`);
  process.exit(1);
}

await COMANDOS[comando]().catch((erro) => {
  console.error(`falhou: ${erro.message}`);
  process.exit(1);
});
