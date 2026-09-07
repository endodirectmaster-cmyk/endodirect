// O AVISO DE FEED MUDO NÃO PODE VIRAR E-MAIL DIÁRIO — NEM SUMIR.
//
// ⚠️ 07/09/2026. O alerta de 28/08 fazia o certo: um feed oficial que não
// entrega nada vira e-mail, porque foi o silêncio que deixou a Lilly fora de
// 1.019 itens. Só que ele repetia o MESMO e-mail toda manhã às 07:30. Pedido do
// professor: *"não precisa ficar enviando diariamente um email, informando
// desse erro."*
//
// 🧨 AS DUAS MANEIRAS DE ERRAR ISTO SÃO OPOSTAS: continuar mandando todo dia, ou
// calar de vez e repetir o defeito que o alerta existe para pegar. A regra é
// avisar por MUDANÇA — conjunto novo, recuperação, e um lembrete por mês.
const path = require('path');
const alerta = require(path.join(__dirname, '..', 'lib', 'alert.js'));
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const DIA = 24 * 60 * 60 * 1000;
const MUDO_A = [{ nome: 'ANVISA oficial', ok: false, status: 404, url: 'u1' }];
const MUDO_B = [{ nome: 'ANVISA oficial', ok: false, status: 404, url: 'u1' },
                { nome: 'FDA Drugs', ok: true, status: 200, url: 'u2' }];

// Banco e Resend de mentira: guardam o payload e contam os e-mails.
function montarAmbiente(payloadInicial) {
  const estado = { payload: Object.assign({}, payloadInicial), enviados: [] };
  process.env.RESEND_API_KEY = 'fake';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake';
  process.env.ALERT_TO = 'prof@exemplo.com';
  global.fetch = async (url, opts) => {
    const u = String(url);
    if (u.indexOf('/rest/v1/endodirect_global_state') >= 0) {
      if (!opts || !opts.method || opts.method === 'GET') {
        return { ok: true, json: async () => [{ payload: estado.payload }] };
      }
      estado.payload = JSON.parse(opts.body).payload;         // grava
      return { ok: true, text: async () => '' };
    }
    if (u.indexOf('api.resend.com') >= 0) {
      estado.enviados.push(JSON.parse(opts.body)[0].subject);
      return { ok: true, text: async () => '' };
    }
    return { ok: true, json: async () => [], text: async () => '' };
  };
  return estado;
}

(async () => {
  // ── 1. Primeira rodada muda: avisa ─────────────────────────────────────
  {
    const e = montarAmbiente({});
    const r = await alerta.alertarFeedsMudos(MUDO_A);
    ok(r.sent === true && r.reason === 'novo', '🧨 o primeiro aviso de feed mudo não saiu (' + JSON.stringify(r) + ')');
    ok(e.enviados.length === 1, 'esperava 1 e-mail, saíram ' + e.enviados.length);
    ok(e.payload[alerta.AVISO_KEY] && e.payload[alerta.AVISO_KEY].sig,
      '🧨 a trava não foi gravada no payload — sem ela o e-mail volta amanhã');
  }

  // ── 2. Mesmo conjunto no dia seguinte: NÃO avisa ───────────────────────
  // É este o pedido do professor.
  {
    const e = montarAmbiente({});
    await alerta.alertarFeedsMudos(MUDO_A);
    const r2 = await alerta.alertarFeedsMudos(MUDO_A);
    ok(r2.sent === false && r2.reason === 'ja_avisado',
      '🧨 o mesmo problema gerou um segundo e-mail — é exatamente o e-mail diário que o professor mandou parar');
    ok(e.enviados.length === 1, 'saíram ' + e.enviados.length + ' e-mails para o mesmo problema');
  }

  // ── 3. O conjunto muda: avisa de novo ─────────────────────────────────
  // Feed novo quebrado é notícia nova; calar aqui repetiria o caso da Lilly.
  {
    const e = montarAmbiente({});
    await alerta.alertarFeedsMudos(MUDO_A);
    const r = await alerta.alertarFeedsMudos(MUDO_B);
    ok(r.sent === true && r.reason === 'novo',
      '🧨 um feed NOVO ficou mudo e ninguém foi avisado — o alerta virou cego para o que ele existe para pegar');
    ok(e.enviados.length === 2, 'esperava 2 e-mails (um por conjunto), saíram ' + e.enviados.length);
  }
  // Mudar só o HTTP do mesmo feed também é mudança.
  {
    const e = montarAmbiente({});
    await alerta.alertarFeedsMudos(MUDO_A);
    await alerta.alertarFeedsMudos([{ nome: 'ANVISA oficial', ok: false, status: 500, url: 'u1' }]);
    ok(e.enviados.length === 2, '⚠️ o mesmo feed passou de 404 para 500 e o aviso não voltou');
  }

  // ── 4. Recuperação: avisa uma vez e limpa a trava ──────────────────────
  {
    const e = montarAmbiente({});
    await alerta.alertarFeedsMudos(MUDO_A);
    const r = await alerta.alertarFeedsMudos([]);
    ok(r.sent === true && r.reason === 'recuperado',
      '🧨 os feeds voltaram ao ar e ninguém soube — a volta é a informação mais útil do ciclo');
    ok(!e.payload[alerta.AVISO_KEY],
      '⚠️ a trava não foi limpa na recuperação: a próxima queda ficaria muda');
    const r2 = await alerta.alertarFeedsMudos([]);
    ok(r2.sent === false && r2.reason === 'nada_mudo', '⚠️ "tudo certo" virou e-mail recorrente');
  }

  // ── 5. Lembrete mensal: o problema não some de vista ──────────────────
  {
    const e = montarAmbiente({});
    e.payload[alerta.AVISO_KEY] = { sig: alerta.assinaturaMudos(MUDO_A), em: Date.now() - 31 * DIA, desde: Date.now() - 31 * DIA };
    const r = await alerta.alertarFeedsMudos(MUDO_A);
    ok(r.sent === true && r.reason === 'lembrete_mensal',
      '🧨 um feed quebrado há mais de um mês parou de ser lembrado — silêncio permanente é o defeito de 28/08 de volta');
    ok(alerta.LEMBRETE_MS >= 28 * DIA, '⚠️ o lembrete voltou a ser frequente demais (' + Math.round(alerta.LEMBRETE_MS / DIA) + ' dias)');
    // ...e 29 dias ainda não é hora.
    const e2 = montarAmbiente({});
    e2.payload[alerta.AVISO_KEY] = { sig: alerta.assinaturaMudos(MUDO_A), em: Date.now() - 29 * DIA, desde: Date.now() - 29 * DIA };
    const r2 = await alerta.alertarFeedsMudos(MUDO_A);
    ok(r2.sent === false, '⚠️ o lembrete saiu antes do prazo (' + JSON.stringify(r2) + ')');
  }

  // ── 6. Fail-safe: banco fora do ar não derruba o cron ─────────────────
  {
    montarAmbiente({});
    global.fetch = async () => { throw new Error('banco fora'); };
    for (const entrada of [MUDO_A, null, 'lixo', [null, {}]]) {
      let r;
      try { r = await alerta.alertarFeedsMudos(entrada); }
      catch (e) { falhas.push('🧨 `alertarFeedsMudos` LANÇOU com ' + JSON.stringify(entrada) + ': derrubaria o cron do radar inteiro — ' + e.message); }
      ok(r && r.sent === false, '⚠️ com o banco fora, a função devia devolver não-enviado sem lançar (entrada ' + JSON.stringify(entrada) + ')');
    }
  }

  // ── 6b. Item malformado na lista não pode engolir o e-mail ───────────
  // 🧨 Achado por mutação: o `.map` que monta o corpo era o único ponto sem
  // guarda. Um `null` na lista lançava, a guarda externa engolia, e o aviso NÃO
  // saía — falha silenciosa dentro do mecanismo criado para acabar com falha
  // silenciosa.
  {
    const e = montarAmbiente({});
    const r = await alerta.alertarFeedsMudos([null, { nome: 'ANVISA oficial', ok: false, status: 404 }]);
    ok(r.sent === true,
      '🧨 um item malformado na lista impediu o e-mail de sair (' + JSON.stringify(r) + ')');
    ok(e.enviados.length === 1, 'esperava 1 e-mail mesmo com item malformado, saíram ' + e.enviados.length);
  }

  // ── 7. A assinatura é estável e não depende da ordem ──────────────────
  {
    ok(alerta.assinaturaMudos(MUDO_B) === alerta.assinaturaMudos(MUDO_B.slice().reverse()),
      '🧨 a assinatura muda com a ordem dos feeds — o e-mail voltaria a cada rodada em que a ordem oscilasse');
    ok(alerta.assinaturaMudos([]) === '', '⚠️ conjunto vazio tem de dar assinatura vazia (é o gatilho da recuperação)');
  }

  if (falhas.length) { console.error('✗ ' + falhas.length + ' falha(s):\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('✓ aviso de feed mudo: avisa na mudança, na recuperação e uma vez por mês — nunca todo dia, e nunca em silêncio');
})().catch((e) => { console.error('✗ erro inesperado: ' + ((e && e.stack) || e)); process.exit(1); });
