#!/usr/bin/env node
// LEITOR DE JARGÃO — roda em TODO texto que vai para a plataforma antes de publicar.
//
// ⚠️ POR QUE EXISTE (02/09/2026). O professor: *"evite jargão de IA. Você está
// sempre escrevendo com jargão. Deixe sempre conteúdo estritamente técnico e
// formal."* A correção não foi sobre uma frase: foi sobre um hábito. O resumo
// da primeira aula de EMC saiu com "POR QUE O TEMA IMPORTA", "Leitura Prática",
// "a balança sozinha não responde à pergunta" e "a proteína precisa vir
// primeiro no prato" — registro de blog num material clínico.
//
// Uso:  node scripts/checa-jargao.js <arquivo>...   (ou por stdin)
// Sai com código 1 se achar marca de registro não-técnico.
'use strict';
const fs = require('fs');

// Cada marca é um HÁBITO observado, não uma proibição de vocabulário.
const MARCAS = [
  [/\bna prática\b/i,            'moldura de blog'],
  [/\bvale (lembrar|notar|dizer)\b/i, 'moldura de blog'],
  [/\bem resumo\b/i,             'moldura de blog'],
  [/\bo segredo\b/i,             'moldura de blog'],
  [/\bleitura prática\b/i,       'moldura de blog'],
  [/\bpor que .{0,30}importa\b/i,'título retórico'],
  [/\ba ordem importa\b/i,       'intensificador retórico'],
  [/\bnão é sinônimo de\b/i,     'título por negação'],
  [/\b(quem|o que) (merece|precisa de) \w+/i, 'título conversacional'],
  [/\bmergulh(ar|e|o)\b/i,       'metáfora'],
  [/\b(crucial|essencial|fundamental|poderoso|robusto|revolucionário)\b/i, 'adjetivo de ênfase vazia'],
  [/\bvocê\b/i,                  'segunda pessoa (exceto em enunciado de questão)'],
  [/\bnão responde à pergunta\b/i, 'retórica'],
  [/\b(no prato|na balança|custa músculo)\b/i, 'metáfora'],
  [/\bé importante (que|ressaltar|notar)\b/i, 'preenchimento'],
];
// Sigla e convenção do banco de questões do professor não são ênfase.
const SIGLAS = new Set(['DXA','GLP','GIP','ESPEN','EASO','IMC','BIA','SURMOUNT','CORRETA','INCORRETA',
  'HDL','LDL','TSH','ACTH','GnRH','TOTG','DRC','SUS','ANVISA','FDA','EMA','ADA','SBD','SBEM','PCR','TC','RM','US']);

function analisar(texto, origem) {
  const achados = [];
  const linhas = texto.split('\n');
  linhas.forEach((linha, i) => {
    MARCAS.forEach(([re, motivo]) => {
      const m = re.exec(linha);
      if (m) achados.push({ origem, linha: i + 1, trecho: m[0], motivo });
    });
    // Ênfase em CAIXA ALTA no meio da frase. Linha inteiramente maiúscula é
    // cabeçalho de seção (é assim que `resumoBlocksHTML` monta o <h3>).
    const letras = linha.replace(/[^A-Za-zÀ-ÿ]/g, '');
    if (letras && linha === linha.toUpperCase()) return;
    for (const m of linha.matchAll(/\b[A-ZÀ-Ý]{3,}\b/g)) {
      if (!SIGLAS.has(m[0])) achados.push({ origem, linha: i + 1, trecho: m[0], motivo: 'ênfase em caixa alta' });
    }
    // Pictogramas não entram em material clínico do aluno.
    for (const m of linha.matchAll(/\p{Extended_Pictographic}/gu)) {
      achados.push({ origem, linha: i + 1, trecho: m[0], motivo: 'pictograma' });
    }
  });
  return achados;
}
module.exports = { analisar, MARCAS };

if (require.main === module) {
  const alvos = process.argv.slice(2);
  let achados = [];
  if (alvos.length) alvos.forEach(f => { achados = achados.concat(analisar(fs.readFileSync(f, 'utf8'), f)); });
  else achados = analisar(fs.readFileSync(0, 'utf8'), '(stdin)');
  if (!achados.length) { console.log('✓ sem marcas de jargão (' + (alvos.join(', ') || 'stdin') + ')'); process.exit(0); }
  console.error('✗ ' + achados.length + ' marca(s) de registro não-técnico:');
  achados.forEach(a => console.error('  ' + a.origem + ':' + a.linha + '  ' + JSON.stringify(a.trecho) + '  — ' + a.motivo));
  process.exit(1);
}
