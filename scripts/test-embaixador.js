// EMBAIXADOR ENDODIRECT (23/11/2026).
//
// Professor: "como embaixador ... ter algum tipo de acesso na plataforma, por exemplo, para fazer propagandas
// de congressos ... no mural de avisos"; "A ideia de degustação estendida pelo link dele para 14 dias foi muito
// boa"; "Esse selo de embaixador Endodirect no perfil dele seria na nossa plataforma, certo?".
//
// 🧨 O QUE ESTE TESTE PRENDE (funções DE VERDADE do index.html, num vm):
// (1) degustação: 7 dias por padrão, 14 só com deg_trials.__dias, nunca fora de 7..14;
// (2) o link de embaixador só estende a degustação que AINDA NÃO venceu, uma vez, e só se o banco disser 14;
// (3) congresso no mural: período bem escrito, some depois do fim, link só https, crédito visível;
// (4) item "Congressos" e selo escondidos para quem não é embaixador; tudo liga pela chave do cupom;
// (5) e-mail da degustação sem "7 dias" fixo (vale também para a de 14).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
function corpo(nome) {
  const re = new RegExp('function ' + nome + '\\([^)]*\\)\\{[\\s\\S]*?\\n\\}|function ' + nome + '\\([^)]*\\)\\{[^\\n]*\\}');
  const m = re.exec(html); if (!m) throw new Error('função não encontrada: ' + nome); return m[0];
}
const DIA = 86400000;

// (1) e (2) degustação
{
  const c = { DEG_DIAS: 7, degTrials: {}, chamadas: { rpc: 0, salvou: 0, notify: 0 }, agoraRpc: null };
  c.Date = Date;
  c.lsSet = () => {}; c.queueRemoteStateSave = () => { c.chamadas.salvou++; }; c.renderDegustacaoBar = () => {}; c.markLockedNavItems = () => {};
  c.notify = () => { c.chamadas.notify++; };
  c.isDegustacao = () => true; c.acessosPendentes = () => false;
  c.ckCupomLink = () => 'ENDONEWS26';
  c.getSupabaseClient = () => ({ rpc: (n, a) => { c.chamadas.rpc++; c.ultimo = [n, a]; return Promise.resolve({ data: c.resposta }); } });
  vm.createContext(c);
  vm.runInContext([corpo('degDias'), corpo('degStart'), corpo('aplicaDegustacaoDoLink')].join('\n'), c);
  const dias = (v) => { c.degTrials = { __start: Date.now(), __dias: v }; return vm.runInContext('degDias()', c); };
  ok(dias(undefined) === 7 && dias(14) === 14 && dias(10) === 10 && dias(30) === 7 && dias(3) === 7 && dias('x') === 7, 'degustação: 7 por padrão, 14 com o link, nada fora de 7..14');

  const roda = async (start, resposta, extra) => {
    c.degTrials = { __start: start }; Object.assign(c.degTrials, extra || {}); c.resposta = resposta; c.chamadas = { rpc: 0, salvou: 0, notify: 0 };
    vm.runInContext('aplicaDegustacaoDoLink()', c); await new Promise((r) => setTimeout(r, 5));
    return { dias: c.degTrials.__dias, rpc: c.chamadas.rpc, salvou: c.chamadas.salvou };
  };
  (async () => {
    let r = await roda(Date.now() - 2 * DIA, { codigo: 'ENDONEWS26', degustacao_dias: 14 });
    ok(r.dias === 14 && r.salvou === 1 && c.ultimo[0] === 'endodirect_cupom_publico' && c.ultimo[1].p_codigo === 'ENDONEWS26', 'link de embaixador no 2º dia: degustação vai a 14 dias e fica gravada');
    r = await roda(Date.now() - 8 * DIA, { codigo: 'ENDONEWS26', degustacao_dias: 14 });
    ok(r.dias === undefined && r.rpc === 0, 'degustação já vencida (8º dia): o link NÃO reabre');
    r = await roda(Date.now() - 1 * DIA, { codigo: 'OUTRO', desconto_pct: 10 });
    ok(r.dias === undefined && r.salvou === 0, 'cupom comum (sem embaixador): continua 7 dias');
    r = await roda(Date.now() - 1 * DIA, { codigo: 'ENDONEWS26', degustacao_dias: 60 });
    ok(r.dias === undefined, 'banco devolvendo um número fora de 8..14: ignora');
    r = await roda(Date.now() - 1 * DIA, { codigo: 'ENDONEWS26', degustacao_dias: 14 }, { __dias: 10 });
    ok(r.rpc === 0 && r.dias === 10, 'já estendida antes: não mexe de novo');
    c.isDegustacao = () => false;
    r = await roda(Date.now() - 1 * DIA, { codigo: 'ENDONEWS26', degustacao_dias: 14 });
    ok(r.rpc === 0, 'assinante: nada a estender');
    fim();
  })().catch((e) => { falhas.push('erro: ' + (e && e.stack || e)); fim(); });
}

// (3) congresso no mural
{
  const c = { esc: (s) => String(s) };
  vm.createContext(c);
  vm.runInContext([corpo('avisoLinkSeguro'), corpo('hojeBR'), corpo('congressoPeriodo'), corpo('congressoParaMural')].join('\n'), c);
  const per = (a, b) => vm.runInContext('congressoPeriodo(' + JSON.stringify(a) + ',' + JSON.stringify(b) + ')', c);
  ok(per('2027-03-10', '2027-03-12') === '10 a 12/03/2027', 'período no mesmo mês (veio ' + per('2027-03-10', '2027-03-12') + ')');
  ok(per('2027-02-28', '2027-03-02') === '28/02 a 02/03/2027', 'período em meses diferentes');
  ok(per('2027-12-30', '2028-01-02') === '30/12/2027 a 02/01/2028', 'período na virada do ano');
  ok(per('2027-03-10', '2027-03-10') === '10/03/2027', 'evento de um dia');
  const agora = Date.parse('2027-03-11T12:00:00-03:00');
  const item = (o) => JSON.parse(vm.runInContext('JSON.stringify(congressoParaMural(' + JSON.stringify(o) + ',' + agora + '))', c));
  const a = item({ titulo: 'Congresso X', inicio: '2027-03-10', fim: '2027-03-12', local: 'São Paulo', texto: 'Inscrições abertas', link: 'https://exemplo.org/x', credito: 'Embaixador EndoNews', criado_em: '2027-01-02T10:00:00Z' });
  ok(a && a.tipo === 'congresso' && a.quando === '10 a 12/03/2027' && a.credito === 'Embaixador EndoNews' && a.link === 'https://exemplo.org/x' && /São Paulo/.test(a.texto) && /Inscrições/.test(a.texto), 'congresso vira item do mural com período, local, texto, link e crédito');
  ok(item({ titulo: 'Acabou', inicio: '2027-03-01', fim: '2027-03-10' }) === null, 'congresso que já acabou não aparece');
  ok(item({ titulo: 'Hoje é o último dia', inicio: '2027-03-09', fim: '2027-03-11' }) !== null, 'no último dia do evento ainda aparece');
  ok(item({ titulo: 'Link ruim', inicio: '2027-03-10', fim: '2027-03-12', link: 'javascript:alert(1)' }).link === '', 'link que não é http(s) não vira botão');
  ok(/manuais\.sort\(porData\)\.concat\(congs,autos\.sort\(porData\)\)/.test(corpo('avisosDoMural')), 'mural: avisos do professor primeiro, depois congressos, depois videoaulas e aulas');
  ok(/a\.credito\?'<div class="dav-cred">Divulgação: '\+esc\(a\.credito\)/.test(corpo('renderDashAvisos')) && /var data=a\.quando\|\|/.test(corpo('renderDashAvisos')), 'mural mostra o período do evento e "Divulgação: …"');
}

// (4) ligações na tela
ok(/<button class="sb-item" data-p="congressos" id="sb-congressos" style="display:none">📅 Congressos<\/button>/.test(html), 'item "Congressos" nasce escondido');
ok(/<span class="tb-selo" id="tb-selo" style="display:none"/.test(html) && /🏅 Embaixador Endodirect/.test(html), 'selo nasce escondido (topo) e aparece no perfil');
ok(/client\.rpc\('endodirect_meu_embaixador'\)/.test(html) && /b\.style\.display=meuEmbaixador\?'':'none'/.test(html), 'item e selo só para quem o banco diz que é embaixador');
ok(/client\.rpc\('endodirect_congresso_salvar',\{p:p\}\)/.test(html) && /client\.rpc\('endodirect_congressos_mural'\)/.test(html), 'publicação e mural pelas RPCs (o banco confere quem publica)');
ok(/try\{carregaEmbaixador\(\);\}catch\(e\)\{\}/.test(html) && /try\{carregaCongressosMural\(\);\}catch\(e\)\{\}/.test(html) && /try\{carregaCongressosAdmin\(\);\}catch\(e\)\{\}/.test(html), 'carrega no login (aluno e professor)');
ok(/id="parc-emb"/.test(html) && /embaixador:pemb,embaixador_credito:pcred/.test(html), 'professor liga o embaixador no cupom (Parcerias)');
ok(/try\{aplicaDegustacaoDoLink\(\);\}catch\(e\)\{\}/.test(corpo('definirAcessos')), 'degustação estendida conferida quando os acessos chegam');
ok(/teste grátis por <b>'\+\(\+i\.degustacao_dias\)\+' dias<\/b>/.test(html), 'barra da landing anuncia os 14 dias do convite');
ok(!/'\+DEG_DIAS\+'/.test(html) && !/DEG_DIAS\*86400000-\(Date\.now/.test(html), 'textos e prazos da degustação usam degDias()');

// (5) e-mails
const emails = fs.readFileSync(path.join(RAIZ, 'lib', 'trial-emails.js'), 'utf8');
ok(!/7 dias de degustação|degustação de 7 dias/.test(emails.replace(/^\/\/.*$/mg, '')), 'e-mail da degustação sem "7 dias" fixo');

function fim() {
  if (falhas.length) { console.error('test-embaixador: ' + falhas.length + ' falha(s):\n- ' + falhas.join('\n- ')); process.exit(1); }
  console.log('ok: embaixador (degustação de 14 dias pelo link, congressos no mural, selo e item só para o embaixador)');
}
