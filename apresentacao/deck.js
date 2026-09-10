const pptxgen = require('pptxgenjs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';                      // 13.33 x 7.5
p.author = 'ness.'; p.company = 'ness.'; p.title = 'Site institucional Alupar';

/* ───────────────────────── sistema visual ───────────────────────── */
const AZUL='004F9D', AZUL_ESC='002E5F', AZUL_MED='003872',
      VERDE='079541', VERDE_CLR='7FD4A1',
      TINTA='0F1B2A', GRAFITE='2B2F33', CINZA='6F7273', CINZA_CLR='9AA0A6',
      BRANCO='FFFFFF', PAPEL='F4F6F5', BORDA='E2E7E4',
      VERM='A82F27', AMBAR='8A6410',
      AZUL_LUZ='CFE0F2', AZUL_TIN='EAF1F9', VERDE_TIN='E7F4EC', AMBAR_TIN='F8F0DE', VERM_TIN='FAEAE8';

const F='Arial';
const W=13.33, H=7.5, M=0.78, LARG=W-2*M;          // 11.77
const COL=(n)=>LARG*n/12, GAP=0.28;                 // grade de 12 colunas

const _=(o)=>Object.assign({fontFace:F,isTextBox:true},o);

/* ── fundos ── */
function claro(s){ s.background={color:BRANCO}; }
function papel(s){ s.background={color:PAPEL}; }
function escuro(s){
  s.background={color:AZUL_ESC};
  s.addShape(p.ShapeType.rect,{x:W-4.6,y:0,w:4.6,h:H,fill:{color:AZUL_MED}});
}

/* ── cabeçalho padrão: filete verde + kicker + título + subtítulo + régua ── */
function cabec(s,kicker,txt,sub){
  s.addShape(p.ShapeType.rect,{x:M,y:0.52,w:0.30,h:0.075,fill:{color:VERDE}});
  if(kicker) s.addText(kicker.toUpperCase(),_({x:M+0.44,y:0.44,w:LARG-0.44,h:0.26,
    fontSize:10.5,bold:true,color:VERDE,charSpacing:1.6,margin:0}));
  s.addText(txt,_({x:M,y:0.78,w:LARG,h:0.58,fontSize:30,bold:true,color:TINTA,margin:0}));
  if(sub) s.addText(sub,_({x:M,y:1.36,w:LARG*0.86,h:0.34,fontSize:13.5,color:CINZA,margin:0}));
  s.addShape(p.ShapeType.rect,{x:M,y:sub?1.80:1.52,w:LARG,h:0.012,fill:{color:BORDA}});
}
const TOPO = 2.08;   // primeira linha de conteúdo quando há subtítulo

/* ── marca ness.: caixa baixa, Montserrat Medium, sem negrito nem itálico, ponto sempre BlueDot ── */
const BLUEDOT='00ADE8';
const ness=(escuroBg)=>{const b={fontFace:'Montserrat Medium',bold:false,italic:false};
  return [{text:'ness',options:Object.assign({color:escuroBg?BRANCO:'000000'},b)},
          {text:'.',options:Object.assign({color:BLUEDOT},b)}];};

let _pag=0;
function rodape(s,escuroBg){
  _pag++;
  s.addText([{text:'Site institucional Alupar  ·  ',options:{color:CINZA_CLR,charSpacing:0.4}},...ness(escuroBg)],
    _({x:M,y:6.98,w:7,h:0.28,fontSize:8.5,margin:0}));
  s.addText(String(_pag),_({x:W-M-0.7,y:6.98,w:0.7,h:0.28,fontSize:8.5,bold:true,color:CINZA_CLR,align:'right',margin:0}));
}

/* ── cartão liso, sem contorno, com barra de acento à esquerda ── */
function cartao(s,x,y,w,h,tint,acento){
  s.addShape(p.ShapeType.rect,{x,y,w,h,fill:{color:tint||PAPEL}});
  if(acento) s.addShape(p.ShapeType.rect,{x,y,w:0.055,h,fill:{color:acento}});
}
/* ── faixa de destaque de largura total ── */
function faixa(s,y,h,tint,acento,tit,txt,corTit){
  cartao(s,M,y,LARG,h,tint,acento);
  let yy=y+0.20;
  if(tit){ s.addText(tit,_({x:M+0.38,y:yy,w:LARG-0.76,h:0.30,fontSize:14.5,bold:true,color:corTit||acento,margin:0})); yy+=0.36; }
  s.addText(txt,_({x:M+0.38,y:yy,w:LARG-0.76,h:h-(yy-y)-0.14,fontSize:13,color:GRAFITE,margin:0}));
}
/* ── marcador quadrado, no lugar de bullet redondo ── */
function lista(s,x,y,w,itens,cor,fs,passo){
  fs=fs||12.5; passo=passo||0.44;
  itens.forEach((l,i)=>{
    s.addShape(p.ShapeType.rect,{x,y:y+i*passo+fs/220,w:0.085,h:0.085,fill:{color:cor||VERDE}});
    s.addText(l,_({x:x+0.26,y:y+i*passo-0.06,w:w-0.26,h:passo,fontSize:fs,color:GRAFITE,margin:0}));
  });
}
/* ── tabela: sem grade, só filete inferior e cabeçalho azul ── */
function tabela(s,rows,opt){
  const o=Object.assign({x:M,w:LARG,fontFace:F,fontSize:11.5,color:GRAFITE,valign:'middle',
    border:[{type:'none'},{type:'none'},{type:'solid',color:BORDA,pt:0.75},{type:'none'}],
    fill:{color:BRANCO},margin:[7,10,7,10]},opt);
  s.addTable(rows,o);
}
const th=(t,al)=>({text:t,options:Object.assign({bold:true,color:BRANCO,fill:{color:AZUL},
  border:[{type:'none'},{type:'none'},{type:'none'},{type:'none'}]},al?{align:al}:{})});

/* ── divisor de ato ── */
function divisor(n,tit,linha){
  const s=p.addSlide(); escuro(s);
  s.addText(n,_({x:W-4.6,y:1.05,w:4.6,h:4.6,fontSize:200,bold:true,color:AZUL,align:'center',valign:'middle',margin:0}));
  s.addShape(p.ShapeType.rect,{x:M,y:3.05,w:1.5,h:0.10,fill:{color:VERDE}});
  s.addText(tit,_({x:M,y:3.32,w:7.6,h:0.85,fontSize:40,bold:true,color:BRANCO,margin:0}));
  s.addText(linha,_({x:M,y:4.30,w:7.4,h:0.9,fontSize:15,color:AZUL_LUZ,margin:0}));
  rodape(s,true);
}

/* ═════════════════════════ 1 · capa ═════════════════════════ */
{const s=p.addSlide(); escuro(s);
 s.addText('ALUPAR',_({x:W-4.6,y:0,w:4.6,h:H,fontSize:120,bold:true,color:AZUL,align:'center',valign:'middle',charSpacing:6,margin:0}));
 s.addShape(p.ShapeType.rect,{x:M,y:2.20,w:2.3,h:0.13,fill:{color:VERDE}});
 s.addText('Site institucional',_({x:M,y:2.50,w:7.6,h:0.9,fontSize:46,bold:true,color:BRANCO,margin:0}));
 s.addText('Diagnóstico, plano\ne proposta',_({x:M,y:3.48,w:7.6,h:1.0,fontSize:19,color:AZUL_LUZ,lineSpacingMultiple:1.2,margin:0}));
 s.addText('alupar.com.br',_({x:M,y:4.62,w:6,h:0.4,fontSize:15,color:VERDE_CLR,bold:true,charSpacing:0.8,margin:0}));
 s.addShape(p.ShapeType.rect,{x:M,y:6.28,w:7.8,h:0.012,fill:{color:AZUL}});
 s.addText([{text:'Apresentado pela ',options:{color:BRANCO}},...ness(true),
            {text:'   ·   Setembro de 2026',options:{color:'8FB4DA'}}],
   _({x:M,y:6.46,w:8,h:0.35,fontSize:12,margin:0}));
 s.addNotes('Abertura. O objetivo é sair com decisões, não com informação: cinco nomes, cinco dados e a autorização do Marco 0.');}

/* ═════════════════════════ ato 1 ═════════════════════════ */
divisor('01','O diagnóstico','O que foi medido no site público, em 01 e 02 de setembro de 2026. Nenhum número aqui foi estimado — todos são reproduzíveis.');

/* 3 — onde estamos */
{const s=p.addSlide(); claro(s);
 cabec(s,'Diagnóstico · números','Onde o site está hoje','Quatro medições que resumem o estado do institucional');
 const d=[['120','dias com o endereço sem “www” quebrado em HTTPS',VERM],
          ['1.280','dias desde a última notícia publicada',VERM],
          ['2,19 MB','de peso na página inicial — 84% em imagens',AMBAR],
          ['13','endereços duplicados, públicos e indexáveis',AMBAR]];
 const cw=(LARG-3*GAP)/4;
 d.forEach((c,i)=>{const x=M+i*(cw+GAP);
  cartao(s,x,TOPO,cw,1.85,PAPEL,c[2]);
  s.addText(c[0],_({x:x+0.30,y:TOPO+0.22,w:cw-0.5,h:0.78,fontSize:42,bold:true,color:c[2],margin:0}));
  s.addShape(p.ShapeType.rect,{x:x+0.30,y:TOPO+1.02,w:0.55,h:0.012,fill:{color:BORDA}});
  s.addText(c[1],_({x:x+0.30,y:TOPO+1.14,w:cw-0.5,h:0.62,fontSize:12,color:GRAFITE,margin:0}));});
 faixa(s,4.28,1.42,VERM_TIN,VERM,'O mais barato de corrigir — e o mais fácil de não enxergar',
  'O endereço sem “www” funciona em http, mas quebra em https: o certificado venceu em 05/05/2026. O navegador tenta https, desiste e volta para http sozinho, então quase ninguém vê o erro. Veem quem usa modo “somente https”, e todo link escrito como https://alupar.com.br em e-mail, PDF ou material impresso.');
 s.addText('Todos os números são reproduzíveis. Nenhum foi estimado.',
   _({x:M,y:5.92,w:LARG,h:0.3,fontSize:11,italic:true,color:CINZA,margin:0}));
 rodape(s); s.addNotes('Abrir pelo que dói. O item do domínio já tem dono e pode ser executado antes mesmo desta apresentação.');}

/* 4 — o que o visitante encontra */
{const s=p.addSlide(); claro(s);
 cabec(s,'Diagnóstico · experiência','O que um visitante encontra','Cinco problemas que qualquer pessoa percebe, sem abrir o código');
 const it=[['Conteúdo parado em março de 2023','A última notícia tem 1.280 dias. No rotativo ainda giram um banner de COVID-19 de 2021 e três imagens de 2017.'],
   ['A home não diz o que a Alupar faz','Banners, notícias, vídeo e três ícones. Em nenhum lugar está escrito o que a empresa é ou onde atua.'],
   ['O site pesa quatro vezes o que deveria','2,19 MB na página inicial. Duas fotos de 2017 somam 1,28 MB. Nada é otimizado para celular.'],
   ['Pessoas com deficiência não conseguem usar','Nenhuma imagem da home tem descrição. O formulário tem cinco campos e um único rótulo.'],
   ['Inglês e espanhol quebram','Seis páginas não existem nesses idiomas — e o site responde com erro em vez de mostrar o português.']];
 it.forEach((c,i)=>{const y=TOPO+0.06+i*0.96;
  s.addText(String(i+1).padStart(2,'0'),_({x:M,y:y-0.02,w:0.7,h:0.42,fontSize:22,bold:true,color:AZUL_LUZ,margin:0}));
  s.addText(c[0],_({x:M+0.82,y:y-0.02,w:LARG-0.9,h:0.32,fontSize:15,bold:true,color:AZUL,margin:0}));
  s.addText(c[1],_({x:M+0.82,y:y+0.30,w:LARG-0.9,h:0.5,fontSize:12.5,color:GRAFITE,margin:0}));
  if(i<4) s.addShape(p.ShapeType.rect,{x:M,y:y+0.84,w:LARG,h:0.008,fill:{color:BORDA}});});
 rodape(s);}

/* 4b — o tamanho real do site */
{const s=p.addSlide(); claro(s);
 cabec(s,'Diagnóstico · inventário','O tamanho real do site','Medido no índice do próprio site — e bem maior do que o menu deixa ver');
 const linhas=[['Páginas','45','o menu mostra 12'],
  ['Notícias','99','mais 84 traduções para inglês e espanhol'],
  ['Perguntas frequentes','76','o maior tipo de conteúdo do site, e fora do menu'],
  ['Arquivos de mídia','261','imagens, documentos e PDFs indexados'],
  ['Banners do rotativo','18','inclui o banner de COVID-19 de 2021'],
  ['Blocos de empresas e temas','17','alimentam as páginas internas'],
  ['Vídeos','3','']];
 const rows=[[th('Tipo de conteúdo'),th('Itens','right'),th('Observação')],
  ...linhas.map((l,i)=>{const f={color:i%2?PAPEL:BRANCO};
   return [{text:l[0],options:{bold:true,color:AZUL,fill:f}},
           {text:l[1],options:{align:'right',bold:true,fill:f}},
           {text:l[2],options:{fill:f}}];})];
 tabela(s,rows,{y:TOPO,colW:[3.65,1.35,6.77],rowH:0.46,fontSize:11.5});
 faixa(s,5.62,1.10,AZUL_TIN,AZUL,null,
  'Um levantamento feito pelo menu encontra 12 páginas. O site tem cinco tipos de conteúdo, e três deles não aparecem na navegação. É a diferença entre um projeto que cabe no prazo e um que descobre o resto no meio do caminho.',AZUL);
 rodape(s); s.addNotes('Este slide existe para justificar o dimensionamento. Nenhum número é estimado.');}

/* 4c — os quatro ambientes */
{const s=p.addSlide(); claro(s);
 cabec(s,'Diagnóstico · ambientes','Quatro ambientes, um único portal','Os outros três são páginas únicas, hospedadas pela ness.');
 const linhas=[['www','Portal completo: 45 páginas e cinco tipos de conteúdo','261','fornecedor atual'],
  ['rs','Uma página, mais uma “em breve…” esquecida de 2025','185','ness.'],
  ['pdi','Uma página, mais uma “em construção” de 2024','99','ness.'],
  ['ma','Uma página única','161','ness.']];
 const rows=[[th('Ambiente'),th('O que é de fato'),th('Mídia','right'),th('Onde está')],
  ...linhas.map((l,i)=>{const f={color:i%2?PAPEL:BRANCO};
   return [{text:l[0],options:{bold:true,color:AZUL,fill:f}},
           {text:l[1],options:{fill:f}},
           {text:l[2],options:{align:'right',bold:true,fill:f}},
           {text:l[3],options:{fill:f}}];})];
 tabela(s,rows,{y:TOPO,colW:[1.35,6.30,1.25,2.87],rowH:0.50,fontSize:11.5});
 faixa(s,4.32,1.24,VERDE_TIN,VERDE,'Nesta proposta, só o institucional',
  'rs, pdi e ma seguem na ness. Quando a Alupar decidir trazê-los, entram na mesma base do institucional, por acréscimo à mensalidade — sem projeto novo e sem verba à parte. É a saída do WordPress em etapas.',VERDE);
 faixa(s,5.76,0.86,AMBAR_TIN,AMBAR,null,
  'O portal de RI está fora do escopo, mas divide a mesma máquina do institucional. A virada do RI mexe na hospedagem daqui — as duas precisam ser coordenadas.',AMBAR);
 rodape(s);}

/* 5 — a causa */
{const s=p.addSlide(); claro(s);
 cabec(s,'Diagnóstico · causa raiz','A causa não é técnica','Dois sites, mesma empresa, mesma infraestrutura, mesmo fornecedor');
 const cw=(LARG-GAP)/2;
 const col=(x,tit,cor,tint,linhas)=>{
   cartao(s,x,TOPO,cw,3.35,tint,cor);
   s.addText(tit,_({x:x+0.36,y:TOPO+0.22,w:cw-0.7,h:0.4,fontSize:19,bold:true,color:cor,margin:0}));
   s.addShape(p.ShapeType.rect,{x:x+0.36,y:TOPO+0.70,w:0.7,h:0.012,fill:{color:cor}});
   lista(s,x+0.36,TOPO+0.92,cw-0.72,linhas,cor,12.5,0.56);};
 col(M,'Portal de RI · em dia',VERDE,VERDE_TIN,['Última publicação de agosto de 2026','Tem responsável nomeado','Tem calendário e obrigação regulatória','Recebeu cabeçalhos de segurança']);
 col(M+cw+GAP,'Institucional · parado',VERM,VERM_TIN,['Última publicação de março de 2023','Não tem responsável nomeado','Não tem calendário','Não recebeu as mesmas configurações']);
 faixa(s,5.70,1.02,AZUL_TIN,AZUL,null,
  'Um tem dono, o outro não. Um site novo sem dono repete esta história em dois ou três anos — por isso “dono do conteúdo, com nome próprio” é condição de entrega, e não recomendação.',AZUL);
 rodape(s);}

/* ═════════════════════════ ato 2 ═════════════════════════ */
divisor('02','O plano','Restauro fiel da identidade, sete semanas de execução, marcos com porta de saída objetiva e responsabilidades com nome próprio.');

/* 7 — restauro fiel */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · abordagem','Restauro fiel','A identidade visual é preservada. Muda o que resolve um problema medido');
 const cw=(LARG-GAP)/2;
 const bloco=(x,tit,cor,tint,linhas)=>{
   cartao(s,x,TOPO,cw,3.05,tint,cor);
   s.addText(tit,_({x:x+0.36,y:TOPO+0.20,w:cw-0.7,h:0.36,fontSize:17,bold:true,color:cor,margin:0}));
   lista(s,x+0.36,TOPO+0.72,cw-0.72,linhas,cor,12.5,0.40);};
 bloco(M,'O que muda',VERDE,VERDE_TIN,['Contraste de cor onde reprova a norma','Recorte dos banners no celular','Rótulos no formulário de contato','Indicação de foco para teclado','Peso, velocidade e imagens modernas','Uma faixa de indicadores na home']);
 bloco(M+cw+GAP,'O que não muda',AZUL,AZUL_TIN,['A paleta da marca','A tipografia','Cabeçalho, menu, rodapé e grade','A ordem das seções','O vocabulário visual do site']);
 faixa(s,5.42,1.20,PAPEL,AZUL,null,
  'Toda tela é conferida lado a lado contra a página atual e contra o portal de RI. Se alguém que conhece o site notar a mudança sem ser avisado, passou do ponto.',AZUL);
 rodape(s); s.addNotes('Não é redesenho — e é isso que permite que o site novo caiba na mensalidade que a Alupar já paga.');}

/* 7b — por que não WordPress */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · plataforma','Por que não seguir no WordPress','A pergunta foi levantada, e merece resposta com número — não com preferência');
 const cw=(LARG-GAP)/2;
 cartao(s,M,TOPO,cw,1.62,PAPEL,CINZA);
 s.addText('O argumento a favor',_({x:M+0.36,y:TOPO+0.18,w:cw-0.7,h:0.32,fontSize:14.5,bold:true,color:CINZA,margin:0}));
 s.addText('O site de origem é WordPress. Manter o destino em WordPress tornaria a migração mais barata, porque o conteúdo passaria de um para o outro.',
   _({x:M+0.36,y:TOPO+0.56,w:cw-0.72,h:0.96,fontSize:12.5,color:GRAFITE,margin:0}));
 cartao(s,M+cw+GAP,TOPO,cw,1.62,VERM_TIN,VERM);
 s.addText('O que a medição mostrou',_({x:M+cw+GAP+0.36,y:TOPO+0.18,w:cw-0.7,h:0.32,fontSize:14.5,bold:true,color:VERM,margin:0}));
 s.addText('O acesso programático ao conteúdo do site atual está bloqueado. Não existe exportação. A recuperação é página por página — para qualquer destino.',
   _({x:M+cw+GAP+0.36,y:TOPO+0.56,w:cw-0.72,h:0.96,fontSize:12.5,color:GRAFITE,margin:0}));
 s.addText('Ou seja: a migração custa o mesmo nos dois caminhos. O que muda é o depois.',
   _({x:M,y:TOPO+1.82,w:LARG,h:0.34,fontSize:14.5,bold:true,color:TINTA,margin:0}));
 const L=(a,b,c)=>[a,b,c];
 const dados=[L('Custo mensal','hospedagem, licenças e plugins','R$ 0 a 150'),
  L('Manutenção obrigatória','núcleo, tema, plugins e versão do PHP','nenhuma'),
  L('Superfície de invasão','permanente, e cresce com cada plugin','não há o que invadir'),
  L('Se ficar sem dono de novo','é exatamente o que aconteceu','o site continua no ar')];
 const rows=[[th(''),th('WordPress','center'),th('Site estático','center')],
  ...dados.map((r,i)=>{const f={color:i%2?PAPEL:BRANCO};
   return [{text:r[0],options:{bold:true,color:AZUL,fill:f}},
           {text:r[1],options:{align:'center',fill:f}},
           {text:r[2],options:{align:'center',bold:true,color:VERDE,fill:f}}];})];
 tabela(s,rows,{y:TOPO+2.28,colW:[4.25,4.06,3.46],rowH:0.46,fontSize:11.5});
 faixa(s,6.02,0.80,AZUL_TIN,AZUL,null,
  'A causa do estado atual não é o WordPress — é a ausência de dono. Mas o WordPress pune essa ausência todo mês, e o site estático não.',AZUL);
 rodape(s);
 s.addNotes('Se a decisão for WordPress por outra razão, ela é legítima — mas o custo de operação em 24 meses precisa entrar na conta antes da assinatura.');}

/* 8 — a stack */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · arquitetura','Como o site novo funciona','Três peças, cada uma resolvendo um problema do arranjo atual');
 const c=[['Astro','Site estático','A página vira arquivo pronto, servido por rede de distribuição global. Sem servidor para cair, sem banco para consultar.'],
   ['Cloudflare','Publicação e domínio','Certificado renovado automaticamente — o incidente atual deixa de ser possível. A zona já é administrada pela ness.'],
   ['Sanity','Gerenciador de conteúdo','A Comunicação publica notícia e troca banner sozinha, em três idiomas. Conta em nome da Alupar.']];
 const cw=(LARG-2*GAP)/3;
 c.forEach((k,i)=>{const x=M+i*(cw+GAP);
  cartao(s,x,TOPO,cw,2.95,PAPEL,VERDE);
  s.addText(k[0].toUpperCase(),_({x:x+0.34,y:TOPO+0.22,w:cw-0.66,h:0.3,fontSize:11,bold:true,color:VERDE,charSpacing:1.4,margin:0}));
  s.addText(k[1],_({x:x+0.34,y:TOPO+0.58,w:cw-0.66,h:0.5,fontSize:18,bold:true,color:AZUL,margin:0}));
  s.addText(k[2],_({x:x+0.34,y:TOPO+1.16,w:cw-0.66,h:1.6,fontSize:12.5,color:GRAFITE,margin:0}));});
 s.addText([{text:'O que sai:  ',options:{bold:true,color:TINTA}},
   {text:'WordPress, o tema de 2017, 21 arquivos de JavaScript, três bibliotecas de carrossel simultâneas e o suporte a Internet Explorer 8.',options:{color:GRAFITE}}],
   _({x:M,y:5.22,w:LARG,h:0.42,fontSize:13,margin:0}));
 faixa(s,5.76,0.86,VERDE_TIN,VERDE,null,
  'Sem licença e sem servidor para manter. É o que permite que hospedagem, certificados, monitoramento e evolução caibam numa única mensalidade.',VERDE);
 rodape(s);}

/* 9 — cronograma */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · cronograma','Sete semanas','A partir do início — mais as correções emergenciais, que já podem começar');
 const x0=M+3.05, larg=LARG-3.05, cw=larg/7, y0=TOPO+0.36;
 for(let i=0;i<7;i++){
   s.addShape(p.ShapeType.rect,{x:x0+i*cw,y:TOPO-0.06,w:cw,h:0.34,fill:{color:i%2?PAPEL:BRANCO}});
   s.addText('S'+(i+1),_({x:x0+i*cw,y:TOPO,w:cw,h:0.26,fontSize:11,bold:true,color:CINZA,align:'center',margin:0}));}
 const tr=[['Descoberta e inventário',[1],VERDE],['Captura de identidade',[1,2],AZUL],['Design dos templates',[1,2],AZUL],
  ['Desenvolvimento',[2,3,4,5],VERDE],['Conteúdo e migração',[3,4,5],AZUL],['Traduções PT / EN / ES',[3,4,5],AZUL],
  ['Acessibilidade, SEO e GEO',[5,6],VERDE],['Publicação e infraestrutura',[2,5,6],AZUL],['Homologação e virada',[6,7],VERDE]];
 tr.forEach((r,i)=>{const y=y0+i*0.42;
  s.addText(r[0],_({x:M,y:y-0.04,w:2.9,h:0.3,fontSize:11.5,color:GRAFITE,margin:0}));
  for(let k=1;k<=7;k++){
    const on=r[1].includes(k);
    s.addShape(p.ShapeType.roundRect,{x:x0+(k-1)*cw+0.05,y,w:cw-0.10,h:0.29,rectRadius:0.04,
      fill:{color:on?r[2]:'F0F2F1'}});}});
 const yM=y0+9*0.42+0.14;
 s.addShape(p.ShapeType.rect,{x:M,y:yM-0.10,w:LARG,h:0.012,fill:{color:BORDA}});
 s.addText('Marcos',_({x:M,y:yM,w:2.9,h:0.3,fontSize:11,bold:true,color:CINZA,margin:0}));
 const mk={1:'M1',2:'M2',5:'M3',6:'M4',7:'M5'};
 Object.entries(mk).forEach(([k,v])=>s.addText(v,_({x:x0+(k-1)*cw,y:yM,w:cw,h:0.3,fontSize:11.5,bold:true,color:VERDE,align:'center',margin:0})));
 s.addText('As datas de calendário dependem da data de início — por isso o cronograma é apresentado em semanas.',
   _({x:M,y:yM+0.36,w:LARG,h:0.28,fontSize:11,italic:true,color:CINZA,margin:0}));
 rodape(s);}

/* 10 — marcos */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · marcos','Marcos e portas de saída','Cada marco tem um critério objetivo — passa ou não passa');
 const rows=[[th('Marco'),th('Quando'),th('Entrega'),th('Porta de saída')],
  ['Marco 0','48–72 h','Domínio corrigido, cabeçalhos aplicados, monitoramento ligado','O endereço sem “www” responde normalmente'],
  ['M1','Semana 1','Inventário fechado, arquitetura e identidade extraída','Destino definido para as 20 páginas'],
  ['M2','Semana 2','Design aprovado, primeiras telas navegáveis','Aprovação formal do Marketing'],
  ['M3','Semana 5','Conteúdo migrado e equipe publicando sozinha','A Comunicação publica sem apoio técnico'],
  ['M4','Semana 6','Site completo em homologação','Todos os critérios de aceite medidos e verdes'],
  ['M5','Semana 7','Virada, redirecionamentos ativos, monitoramento','Nenhum endereço antigo quebrado por 7 dias']];
 const corpo=rows.map((r,i)=> i===0?r : r.map((c,k)=>({text:c,options:Object.assign(
    {fill:{color:i%2?PAPEL:BRANCO}}, k===0?{bold:true,color:AZUL}:{})})));
 tabela(s,corpo,{y:TOPO,colW:[1.15,1.25,5.05,4.32],rowH:0.56,fontSize:11.5,valign:'top'});
 rodape(s);}

/* 11 — aprovações */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · responsabilidades','Quem aprova o quê','A execução é da contratada. A coluna de aprovação precisa de pessoa, não de área');
 const linhas=[['Correção do domínio em https','ness.','TI Alupar','Comunicação'],
  ['Descoberta e inventário','Contratada','Comunicação, TI','Marketing'],
  ['Identidade e design dos templates','Marketing Alupar · marca','Comunicação','—'],
  ['Conteúdo e revisão em português','Comunicação Alupar','Marketing','—'],
  ['Traduções inglês e espanhol','Comunicação Alupar','—','Marketing'],
  ['Integração do feed de notícias','Contratada','Equipe de RI','Comunicação'],
  ['Políticas de privacidade e LGPD','Jurídico Alupar','—','Comunicação'],
  ['Infraestrutura e publicação','ness.','TI Alupar','Marketing'],
  ['Homologação e virada','Comunicação Alupar','Todos','Diretoria'],
  ['Operação depois da entrega','Comunicação Alupar','Contratada','Marketing']];
 const rows=[[th('Frente de trabalho'),th('Aprova (A)'),th('Consultado (C)'),th('Informado (I)')],
  ...linhas.map((r,i)=>{const f={color:i%2?PAPEL:BRANCO};
   return r.map((c,k)=>({text:c,options:Object.assign({fill:f},k===0?{bold:true,color:AZUL}:{},k===1?{color:TINTA,bold:true}:{})}));})];
 tabela(s,rows,{y:TOPO,colW:[4.05,2.95,2.60,2.17],rowH:0.40,fontSize:10.5});
 rodape(s);}

/* 14 — o que precisamos */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · dependências','O que precisamos da Alupar','Nenhum destes tem custo. Todos travam algum início');
 const cw=(LARG-GAP)/2;
 const bloco=(x,num,tit,linhas)=>{
   cartao(s,x,TOPO,cw,2.90,PAPEL,AZUL);
   s.addText(num,_({x:x+0.36,y:TOPO+0.18,w:0.58,h:0.5,fontSize:30,bold:true,color:AZUL_LUZ,margin:0}));
   s.addText(tit,_({x:x+1.00,y:TOPO+0.28,w:cw-1.35,h:0.38,fontSize:17,bold:true,color:AZUL,margin:0}));
   lista(s,x+0.36,TOPO+0.92,cw-0.72,linhas,AZUL,12.5,0.40);};
 bloco(M,'5','Pessoas',['Interlocutor da equipe do portal de RI','Interlocutor do fornecedor atual','Quem aprova uso da marca no Marketing','Dono do conteúdo institucional','Um padrinho executivo para impasses']);
 bloco(M+cw+GAP,'5','Informações',['Km de linhas de transmissão','MW de capacidade instalada','Acesso ao Google Analytics do site','Arquivos originais do logotipo','Aviso prévio do contrato de hospedagem atual']);
 cartao(s,M,5.28,LARG,1.34,VERDE_TIN,VERDE);
 s.addText('3',_({x:M+0.36,y:5.46,w:0.58,h:0.5,fontSize:30,bold:true,color:VERDE,margin:0}));
 s.addText('Autorizações',_({x:M+1.00,y:5.56,w:3.0,h:0.36,fontSize:17,bold:true,color:VERDE,margin:0}));
 s.addText('Executar as correções emergenciais esta semana   ·   Guardar cópia do conteúdo público do site   ·   Abrir a conta do gerenciador de conteúdo em nome da Alupar',
   _({x:M+0.36,y:6.06,w:LARG-0.72,h:0.5,fontSize:12.5,color:GRAFITE,margin:0}));
 rodape(s);}

/* 15 — prazos próprios */
{const s=p.addSlide(); claro(s);
 cabec(s,'Plano · relógios','Três coisas com prazo próprio','Não esperam pelo cronograma do projeto');
 const c=[['Antes da virada','Histórico do Google Analytics','Precisamos extrair a linha de base antes de o site novo entrar no ar. Depois disso não há como comparar o antes e o depois, e o dado não se recupera.'],
   ['Concluída','Cópia dos arquivos do site','Dos 118 arquivos que as páginas publicadas usam, 117 foram copiados em 10/09/2026. O que falta já não existia na origem: o release do 2T17 em inglês.'],
   ['21/10/2026','Próximo vencimento de certificado','É o mesmo certificado do institucional e do portal de RI. Sem responsável nomeado e alerta configurado, a situação atual se repete.']];
 c.forEach((k,i)=>{const y=TOPO+0.04+i*1.52;
  cartao(s,M,y,LARG,1.36,AMBAR_TIN,AMBAR);
  s.addText(k[0],_({x:M+0.36,y:y+0.20,w:2.5,h:0.32,fontSize:13,bold:true,color:AMBAR,charSpacing:0.4,margin:0}));
  s.addShape(p.ShapeType.rect,{x:M+3.05,y:y+0.18,w:0.012,h:1.0,fill:{color:'D8C79A'}});
  s.addText(k[1],_({x:M+3.32,y:y+0.18,w:LARG-3.7,h:0.36,fontSize:16,bold:true,color:AZUL,margin:0}));
  s.addText(k[2],_({x:M+3.32,y:y+0.58,w:LARG-3.7,h:0.7,fontSize:12.5,color:GRAFITE,margin:0}));});
 rodape(s);}

/* ═════════════════════════ ato 3 · proposta ═════════════════════════ */
divisor('03','A proposta','Uma mensalidade, sem entrada, no lugar da que a Alupar já paga hoje. A implantação, a operação e a evolução do site cabem dentro dela.');

/* 17 — a proposta, resumo */
{const s=p.addSlide(); claro(s);
 cabec(s,'Proposta · resumo','A proposta','Uma mensalidade no lugar da que a Alupar já paga — sem entrada e sem projeto a aprovar');
 const d=[['R$ 1.500','por mês — o mesmo que a Alupar paga hoje',AZUL],
          ['R$ 0','de entrada',AZUL],
          ['48','meses de contrato',AZUL],
          ['6 a 7','semanas até o site no ar',VERDE]];
 const cw=(LARG-3*GAP)/4;
 d.forEach((c,i)=>{const x=M+i*(cw+GAP);
  cartao(s,x,TOPO,cw,1.62,PAPEL,c[2]);
  s.addText(c[0],_({x:x+0.30,y:TOPO+0.20,w:cw-0.5,h:0.62,fontSize:29,bold:true,color:c[2],margin:0}));
  s.addText(c[1],_({x:x+0.30,y:TOPO+0.86,w:cw-0.5,h:0.6,fontSize:12,color:GRAFITE,margin:0}));});
 faixa(s,3.92,1.06,VERDE_TIN,VERDE,null,
  'A cobrança começa na virada, quando o contrato com o fornecedor atual é encerrado. A Alupar nunca paga os dois ao mesmo tempo: o custo adicional é zero.',VERDE);
 s.addText('O que a mesma linha de orçamento passa a pagar',_({x:M,y:5.22,w:LARG,h:0.32,fontSize:15,bold:true,color:TINTA,margin:0}));
 lista(s,M,5.66,LARG,[
  'Um site novo, em três idiomas, no lugar do WordPress de 2017',
  'A Comunicação publica sozinha, sem abrir chamado e sem esperar por ninguém',
  'Manutenção, segurança e evolução do site durante todo o contrato'],VERDE,12.5,0.40);
 rodape(s);}

/* 18 — o que está coberto */
{const s=p.addSlide(); claro(s);
 cabec(s,'Proposta · cobertura','O que a mensalidade cobre','Da implantação à evolução — nada nesta página é cobrado à parte');
 const cols=[
  ['Na implantação',VERDE,VERDE_TIN,
   ['Site novo em três idiomas, com a identidade visual atual','Migração de páginas, notícias, traduções e arquivos','Redirecionamento de todos os endereços antigos','Acessibilidade WCAG 2.2 AA, SEO técnico e GEO','Formulário de contato com antispam e LGPD','Correções emergenciais, treinamento e documentação']],
  ['Todo mês',AZUL,AZUL_TIN,
   ['Hospedagem em rede global de distribuição','Domínio, DNS e certificados com renovação automática','Monitoramento com alerta, com e sem “www”','Cópia de segurança do conteúdo','Atualizações de segurança e de versão da plataforma','Verificação automática de qualidade a cada publicação']],
  ['Ao longo do ano',AMBAR,AMBAR_TIN,
   ['48 horas por ano para evolução e ajustes','Novas páginas e seções sob demanda','Ajustes de conteúdo e de layout','Publicação assistida sempre que precisar','Relatório semestral de desempenho']]];
 const cw=(LARG-2*GAP)/3;
 cols.forEach((c,i)=>{const x=M+i*(cw+GAP);
  cartao(s,x,TOPO,cw,3.72,c[2],c[1]);
  s.addText(c[0],_({x:x+0.34,y:TOPO+0.20,w:cw-0.66,h:0.62,fontSize:15,bold:true,color:c[1],margin:0}));
  lista(s,x+0.34,TOPO+0.94,cw-0.68,c[3],c[1],11.5,0.44);});
 faixa(s,6.02,0.78,PAPEL,AZUL,null,
  'A implantação não tem entrada: está dentro da mensalidade. Código, conteúdo e contas ficam em nome da Alupar desde o primeiro dia.',AZUL);
 rodape(s);}

/* 19 — mesma mensalidade, outro site */
{const s=p.addSlide(); claro(s);
 cabec(s,'Proposta · comparação','Mesma mensalidade, outro site','O que os mesmos R$ 1.500 pagam hoje, e o que passam a pagar');
 const VERDE_TXT='06893C';   // verde de texto AA (4,51:1), ver src/styles/tokens.css
 const L=(a,b,c)=>[a,b,c];
 const dados=[
  L('Mensalidade','R$ 1.500','R$ 1.500'),
  L('Plataforma','WordPress com tema de 2017','site estático, sem servidor para manter'),
  L('Publicação de conteúdo','última notícia em março de 2023','a Comunicação publica sozinha'),
  L('Domínio sem “www” em https','certificado vencido desde 05/05/2026','renovação automática'),
  L('Peso da página inicial','2,19 MB','até 600 KB, verificado a cada publicação'),
  L('Inglês e espanhol','seis páginas respondem com erro','paridade verificada a cada publicação'),
  L('Acessibilidade','imagens sem descrição, formulário sem rótulo','WCAG 2.2 AA'),
  L('Na saída do contrato','sem exportação do conteúdo','código, conteúdo e contas em nome da Alupar')];
 const rows=[[th(''),th('Hoje','center'),th('Com a proposta','center')],
  ...dados.map((r,i)=>{const f={color:i%2?PAPEL:BRANCO};
   return [{text:r[0],options:{bold:true,color:AZUL,fill:f}},
           {text:r[1],options:{align:'center',fill:f}},
           {text:r[2],options:{align:'center',bold:true,color:VERDE_TXT,fill:f}}];})];
 tabela(s,rows,{y:TOPO,colW:[3.40,4.05,4.32],rowH:0.435,fontSize:11.5});
 faixa(s,6.10,0.74,AZUL_TIN,AZUL,null,
  'A linha de orçamento é a mesma. O que muda é o que ela paga.',AZUL);
 rodape(s);}

/* 20 — condições */
{const s=p.addSlide(); claro(s);
 cabec(s,'Proposta · condições','Condições e premissas','Proposta válida por 30 dias');
 const cw=(LARG-GAP)/2;
 const bloco=(x,y,tit,cor,tint,h,linhas,fs,passo)=>{
   cartao(s,x,y,cw,h,tint,cor);
   s.addText(tit,_({x:x+0.34,y:y+0.18,w:cw-0.66,h:0.32,fontSize:15,bold:true,color:cor,margin:0}));
   lista(s,x+0.34,y+(passo&&passo<0.34?0.58:0.68),cw-0.68,linhas,cor,fs||12,passo||0.40);};
 bloco(M,TOPO,'Preço e prazo',VERDE,VERDE_TIN,3.02,['R$ 1.500 por mês, por 48 meses','Sem entrada','Cobrança a partir da virada do site','Reajuste anual pelo IPCA','Horas além do banco anual: R$ 120 por hora']);
 bloco(M+cw+GAP,TOPO,'Não coberto',AZUL,AZUL_TIN,3.02,['O portal de Relações com Investidores','Os sites rs, pdi e ma, até entrarem por acréscimo','Redesenho da identidade visual','Produção de fotografia ou vídeo','Redação e tradução de conteúdo novo, fora do banco']);
 bloco(M,TOPO+3.16,'Rescisão e saída',AZUL,PAPEL,1.72,['Antes de 36 meses, quita-se o saldo da implantação','Saldo inicial de R$ 49.800, que cai 1/36 por mensalidade','Na saída, código, conteúdo e contas ficam com a Alupar','Novos sites entram por acréscimo na mensalidade'],11,0.28);
 bloco(M+cw+GAP,TOPO+3.16,'Premissas de prazo',AMBAR,AMBAR_TIN,1.72,['Aprovações em até 3 dias úteis','Dados e acessos entregues até o Marco 2','Um interlocutor por frente, nomeado','Texto em português congelado no Marco 2'],11,0.28);
 rodape(s);}

/* 23 — próximos passos */
{const s=p.addSlide(); escuro(s);
 s.addText('04',_({x:W-4.6,y:0.5,w:4.6,h:5.6,fontSize:190,bold:true,color:AZUL,align:'center',valign:'middle',margin:0}));
 s.addShape(p.ShapeType.rect,{x:M,y:0.86,w:1.7,h:0.11,fill:{color:VERDE}});
 s.addText('Próximos passos',_({x:M,y:1.10,w:8,h:0.75,fontSize:36,bold:true,color:BRANCO,margin:0}));
 const passos=[['Esta semana','Corrigir o endereço sem “www” em https — já podemos executar'],
   ['Nesta reunião','Os cinco nomes e as três autorizações'],
   ['Na assinatura','Início da implantação — a mensalidade só começa na virada'],
   ['Até a Semana 2','Os dois números institucionais e o acesso ao Analytics']];
 passos.forEach((k,i)=>{const y=2.32+i*0.98;
  s.addShape(p.ShapeType.rect,{x:M,y,w:7.9,h:0.80,fill:{color:i===0?VERDE:AZUL_MED}});
  s.addShape(p.ShapeType.rect,{x:M,y,w:0.055,h:0.80,fill:{color:i===0?BRANCO:VERDE}});
  s.addText(k[0],_({x:M+0.34,y:y+0.21,w:2.3,h:0.4,fontSize:13,bold:true,color:i===0?BRANCO:VERDE_CLR,margin:0}));
  s.addText(k[1],_({x:M+2.72,y:y+0.19,w:5.0,h:0.46,fontSize:13.5,bold:i===0,color:BRANCO,margin:0}));});
 s.addShape(p.ShapeType.rect,{x:M,y:6.42,w:7.9,h:0.012,fill:{color:AZUL}});
 s.addText('O mínimo para hoje: o dono do conteúdo e a autorização das correções emergenciais.',
   _({x:M,y:6.58,w:7.9,h:0.4,fontSize:12.5,italic:true,color:AZUL_LUZ,margin:0}));
 rodape(s,true);
 s.addNotes('Fechar pedindo as duas coisas que não podem sair da reunião em aberto.');}

p.writeFile({fileName:'apresentacao-alupar.pptx'}).then(f=>console.log('gerado:',f));
