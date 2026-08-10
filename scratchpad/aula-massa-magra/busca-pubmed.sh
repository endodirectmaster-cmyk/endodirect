#!/usr/bin/env bash
# Busca no PubMed as referências da aula de massa magra × AR GLP-1.
# E-utilities, mesmo caminho que o radar do Endodirect já usa.
set -u
E="https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

busca () {
  local rotulo="$1"; local termo="$2"; local n="${3:-8}"
  echo "═══ $rotulo"
  ids=$(curl -s "$E/esearch.fcgi?db=pubmed&retmax=$n&sort=relevance&term=$(printf %s "$termo" | jq -sRr @uri)" \
        | grep -o '<Id>[0-9]*</Id>' | grep -o '[0-9]*' | tr '\n' ',' | sed 's/,$//')
  [ -z "$ids" ] && { echo "  (nada)"; return; }
  curl -s "$E/esummary.fcgi?db=pubmed&retmode=json&id=$ids" | jq -r '
    .result as $r | $r.uids[] as $u | $r[$u] |
    "  [\(.uid)] \(.pubdate[0:4]) · \(.source)\n      \(.title)"'
  echo
}

busca "1. Massa magra com AR GLP-1 (revisões e metanálises)" \
  "(GLP-1 receptor agonist[tiab] OR semaglutide[tiab] OR tirzepatide[tiab]) AND (lean mass[tiab] OR fat-free mass[tiab] OR muscle mass[tiab]) AND (2023:2026[dp])" 10

busca "2. Composição corporal em ensaios de semaglutida/tirzepatida" \
  "(semaglutide[tiab] OR tirzepatide[tiab]) AND (body composition[tiab] OR DXA[tiab] OR MRI[tiab]) AND (randomized[pt] OR clinical trial[pt])" 8

busca "3. Exercício resistido para preservar massa magra no emagrecimento" \
  "(resistance training[tiab] OR resistance exercise[tiab]) AND (weight loss[tiab] OR caloric restriction[tiab]) AND (lean mass[tiab] OR fat-free mass[tiab] OR muscle[tiab]) AND (randomized controlled trial[pt])" 8

busca "4. Exercício + AR GLP-1 (combinação)" \
  "(liraglutide[tiab] OR semaglutide[tiab] OR GLP-1[tiab]) AND (exercise[tiab] OR training[tiab]) AND (randomized controlled trial[pt])" 8

busca "5. Proteína durante restrição calórica" \
  "(protein intake[tiab] OR high-protein[tiab]) AND (weight loss[tiab] OR energy restriction[tiab]) AND (lean mass[tiab] OR fat-free mass[tiab] OR muscle[tiab]) AND (randomized controlled trial[pt] OR meta-analysis[pt])" 8

busca "6. Obesidade sarcopênica — definição e diagnóstico" \
  "sarcopenic obesity[tiab] AND (definition[tiab] OR diagnosis[tiab] OR consensus[tiab]) AND (2022:2026[dp])" 6

busca "7. Bloqueio de miostatina/ativina (bimagrumabe)" \
  "(bimagrumab[tiab] OR myostatin[tiab] OR activin[tiab]) AND (obesity[tiab] OR lean mass[tiab] OR body composition[tiab])" 6

busca "8. Massa magra, função e desfechos (o que a massa magra prediz)" \
  "(muscle mass[tiab] OR lean mass[tiab] OR grip strength[tiab]) AND (mortality[tiab] OR outcomes[tiab]) AND (older adults[tiab] OR obesity[tiab]) AND (2020:2026[dp])" 8
