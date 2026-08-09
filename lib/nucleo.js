// Endodirect — leitura do NÚCLEO (`CLINICAL_GUIDELINES` do index.html) e o selo
// que permite detectar quando um texto que o restitui envelheceu.
//
// ── POR QUE ISTO EXISTE (09/08/2026) ─────────────────────────────────────────
// Corrigi o núcleo numa recomendação de prescrição da ATA 2026 (hipotiroxinemia
// isolada e o marco do PTU, que é 16 SEMANAS e não o fim do 1º trimestre). O
// `confere-ressalvas.js` continuou verde — e estava certo, porque ele confere
// `conflito` e `nucleo_citado`, que são campos DO EXTRATO.
//
// Só que 36 fatos, em 11 extratos, RESTITUEM o núcleo por escrito dentro de
// `fatos[].afirmacao` — e nenhuma peneira olhava ali. Um deles dizia "o núcleo
// manda propiltiouracil no 1º trimestre e metimazol depois". Depois da correção
// isso virou mentira: a ATA 2026 declara DESCONHECIDA a escolha após o marco.
// O fato mandava trocar a gestante de volta para metimazol exatamente onde a
// diretriz se recusa a recomendar. Ficou assim por três dias, com o cabeçalho
// do extrato certo e o fato entregue errado.
//
// A lição é a mesma do `cit_sha`: **texto que copia outro texto precisa de um
// selo do que copiou**, senão ninguém percebe quando a fonte muda. Aqui a fonte
// é o próprio núcleo.
//
// ⚠️ NÃO fatie o index.html na mão para achar o bloco. Eu tentei, cortando de
// `CLINICAL_GUIDELINES` até o próximo "`;", e trouxe 934 mil caracteres de
// código JavaScript junto — com 62 falsos positivos de "DASH". O bloco é uma
// concatenação de literais e só existe DEPOIS de avaliado.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const INDEX = path.join(__dirname, '..', 'index.html');

// Avalia `var CLINICAL_GUIDELINES='…'+'…';` num sandbox e devolve a string real.
function nucleoTexto(htmlOpcional) {
  const html = htmlOpcional != null ? htmlOpcional : fs.readFileSync(INDEX, 'utf8');
  const i = html.indexOf('var CLINICAL_GUIDELINES=');
  if (i < 0) throw new Error('var CLINICAL_GUIDELINES não encontrada no index.html');
  const fim = html.indexOf("';", i);
  if (fim < 0) throw new Error('não achei o fim de CLINICAL_GUIDELINES');
  const src = html.slice(i, fim + 2).replace('var CLINICAL_GUIDELINES=', 'RESULTADO=');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { timeout: 2000 });
  const out = sandbox.RESULTADO;
  if (typeof out !== 'string' || out.length < 1000) throw new Error('CLINICAL_GUIDELINES não avaliou para string');
  return out;
}

// Selo curto do núcleo de HOJE. Curto de propósito: vai dentro de milhares de
// fatos, e 12 hex já separam qualquer par de versões que este projeto verá.
function nucleoSha(texto) {
  return crypto.createHash('sha256').update(texto != null ? texto : nucleoTexto(), 'utf8').digest('hex').slice(0, 12);
}

// Um fato "restitui o núcleo" quando fala dele por escrito. A peneira é larga de
// propósito — falso positivo custa uma releitura, falso negativo custa uma
// prescrição errada entregue por três dias —, mas larga não é cega.
//
// ⚠️ A FRONTEIRA DE PALAVRA NÃO É DETALHE: sem ela, `/n[úu]cleo/` casa com
// **nucleo**tídeo. Na primeira rodada isso trouxe 36 fatos, e boa parte era
// "polimorfismo de nucleotídeo único", "oligonucleotídeo antissenso" e
// "mononucleotídeo" — genética e lípides, nada a ver com o núcleo clínico.
// Peneira que grita demais ensina a ignorar o grito, e aí ela não protege mais
// nada: diluir o sinal é a forma silenciosa de desligar a guarda.
// ⚠️ E "núcleo" também é ANATOMIA. O núcleo paraventricular hipotalâmico
// aparece na fisiopatologia do eutireoidiano doente e não restitui coisa
// nenhuma do bloco clínico. Sem esta exclusão, dois fatos de anatomia
// reprovariam PARA SEMPRE, a cada mudança do núcleo — ruído que nunca resolve é
// o jeito mais rápido de um alarme virar paisagem.
const ANATOMIA = /n[úu]cleo\s+(paraventricular|arqueado|supra[óo]ptico|supraquiasm[áa]tico|caudado|accumbens|amb[íi]guo|do\s+trato\s+solit[áa]rio|denteado|lentiforme|rubro)/i;

function restituiONucleo(fato) {
  const a = String((fato && fato.afirmacao) || '');
  if (!/n[úu]cleo\b/i.test(a)) return false;
  // só é anatomia se TODA menção for anatômica
  return a.replace(new RegExp(ANATOMIA.source, 'gi'), '').match(/n[úu]cleo\b/i) !== null;
}

module.exports = { nucleoTexto, nucleoSha, restituiONucleo, INDEX };
