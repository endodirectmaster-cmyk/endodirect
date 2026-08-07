#!/usr/bin/env node
/* Cruza a triagem do acervo com o que o NÚCLEO clínico já sabe.
 *
 * POR QUE (07/08/2026): a triagem por conteúdo revelou que, em vários temas, o
 * `CLINICAL_GUIDELINES` da plataforma é MAIS NOVO que o PDF guardado no Drive:
 *   • incidentaloma adrenal — núcleo cita ESE/ENSAT 2023; o acervo só tem 2016;
 *   • SOP — núcleo cita a Diretriz Internacional 2023; o acervo tem Endocrine
 *     Society 2013.
 * Extrair desses PDFs sem olhar o núcleo REBAIXARIA o que a IA sabe hoje. O
 * professor pediu o contrário: "se já tiver alguma informação mais atualizada,
 * desconsiderar a antiga".
 *
 * Este script classifica cada artigo triado em:
 *   LACUNA   — o núcleo não fala do tema  → maior valor, extrair
 *   NOVO     — o artigo é mais recente que a fonte citada no núcleo → extrair
 *   IGUAL    — mesma fonte/ano do núcleo  → extrair só o detalhe que o núcleo não cabe
 *   ANTIGO   — o núcleo já cita fonte MAIS NOVA → ⚠️ NÃO deixar sobrescrever
 *
 * A detecção do ano citado no núcleo é por texto e é APROXIMADA — por isso a
 * saída é uma lista de trabalho para conferência, não uma decisão automática.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

function nucleo() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = html.indexOf('var CLINICAL_GUIDELINES=');
  const fim = html.indexOf("';", i);
  const sb = {};
  vm.createContext(sb);
  vm.runInContext('var R;' + html.slice(i, fim + 2).replace('var CLINICAL_GUIDELINES=', 'R=') + ';', sb);
  return sb.R;
}

function deacc(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
// ⚠️ Palavras que aparecem no MEU rótulo de tema, não no conteúdo clínico. Sem
// esta lista, "craniofaringioma — visão geral" casava com a palavra "visão" em
// qualquer entrada do núcleo e o item era classificado como ANTIGO por engano.
// Foi o primeiro resultado do script e mostrou que ele estava inflando ANTIGO.
const GENERICAS = new Set(['diagnostico','tratamento','manejo','clinica','clinico','doenca','sindrome','paciente','terapia',
  'visao','geral','abordagem','atualizacao','revisao','epidemiologia','patogenese','fisiopatologia','avaliacao',
  'conduta','seguimento','prognostico','complicacoes','historia','natural','aspectos','estudo','analise','impacto',
  'efeitos','resultados','desfechos','populacao','adultos','criancas','mulheres','homens','idosos','induzida','induzido']);

// Palavras-chave do tema que valem busca no núcleo (descarta conectivos).
function chaves(tema) {
  return deacc(tema)
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !GENERICAS.has(w));
}

function main() {
  const N = nucleo();
  const Ndeacc = deacc(N);
  const dir = path.join(RAIZ, 'scratchpad', 'acervo', 'triagem');
  const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const itens = [];
  for (const f of arquivos) itens.push(...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

  const saida = [];
  for (const it of itens) {
    const ks = chaves(it.tema || it.titulo_real || it.titulo);
    // trecho do núcleo que fala do tema: a frase que contém a palavra-chave mais longa
    let trecho = '', achou = '';
    for (const k of ks.sort((a, b) => b.length - a.length)) {
      const p = Ndeacc.indexOf(k);
      if (p >= 0) {
        const ini = Ndeacc.lastIndexOf('•', p);
        const fim = Ndeacc.indexOf('•', p);
        trecho = N.slice(ini < 0 ? 0 : ini, fim < 0 ? N.length : fim);
        achou = k;
        break;
      }
    }
    let classe, anoNucleo = null;
    if (!trecho) classe = 'LACUNA';
    else {
      const anos = (trecho.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
      anoNucleo = anos.length ? Math.max(...anos) : null;
      const anoArt = Number(it.ano) || null;
      if (!anoArt || !anoNucleo) classe = 'IGUAL';
      else if (anoArt > anoNucleo) classe = 'NOVO';
      else if (anoArt < anoNucleo) classe = 'ANTIGO';
      else classe = 'IGUAL';
    }
    saida.push({ ...it, classe, palavra: achou, anoNucleo, trechoNucleo: trecho.slice(0, 160) });
  }

  const cont = {};
  saida.forEach((s) => { cont[s.classe] = (cont[s.classe] || 0) + 1; });
  console.log('CRUZAMENTO ACERVO × NÚCLEO CLÍNICO\n');
  console.log('  LACUNA (núcleo não fala do tema) :', cont.LACUNA || 0);
  console.log('  NOVO   (artigo mais recente)     :', cont.NOVO || 0);
  console.log('  IGUAL  (mesma época)             :', cont.IGUAL || 0);
  console.log('  ⚠️ ANTIGO (núcleo já tem mais novo):', cont.ANTIGO || 0);

  const altos = saida.filter((s) => s.valor_ancoragem === 'alto');
  console.log('\nEntre os de ancoragem ALTA (' + altos.length + '):');
  ['LACUNA', 'NOVO', 'IGUAL', 'ANTIGO'].forEach((c) => {
    const n = altos.filter((s) => s.classe === c).length;
    console.log(`  ${c.padEnd(7)} ${n}`);
  });

  console.log('\n⚠️ ALTA ancoragem mas ANTIGO — extrair só com cuidado, sem sobrescrever o núcleo:');
  altos.filter((s) => s.classe === 'ANTIGO').slice(0, 12).forEach((s) => {
    console.log(`  · [${s.area}] ${String(s.tema).slice(0, 46)} (${s.ano}) — núcleo tem ${s.anoNucleo} em "${s.palavra}"`);
  });

  fs.writeFileSync(path.join(RAIZ, 'scratchpad', 'acervo', 'cruzamento.json'), JSON.stringify(saida, null, 1));
  console.log('\n✓ gravado scratchpad/acervo/cruzamento.json (' + saida.length + ' itens)');
  console.log('\n⚠️ Esta classificação é APROXIMADA — casamento por palavra-chave e ano máximo do');
  console.log('   parágrafo do núcleo. Serve como LISTA DE TRABALHO, não como veredito: a');
  console.log('   comparação real acontece na extração, com o artigo e a entrada do núcleo lado a lado.');
}
main();
