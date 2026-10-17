---
tags: [cofre, bulario, ferramentas]
atualizado: 2026-10-16
---

# Bulário

## 💊 O BULÁRIO DA PLATAFORMA (2026-10-16)

Pedido do professor: *"Programa também para ter uma ferramenta de 'Bulário'
atualizada na plataforma. Se possível, de todas a medicações disponíveis no Brasil.
Se não for possível, de pelo menos das medicações ligadas a endocrinologia."*

**⚠️ Só professores, por enquanto (17/10/2026).** Pedido do professor: *"não libera o
bulário para os alunos; apenas por enquanto para os professores"*. A chave
`BULARIO_ALUNOS=false` (index.html, junto do `var BULA`) esconde o item do menu do
aluno e faz o `goPanel` desviar para o início quem chegar por link ou pelo último
painel salvo; o painel do professor (`adm-nav` "bula") segue igual. Para liberar:
trocar para `true`, e o teste `scripts/test-bulario.js` precisa ser ajustado junto
(ele prende a chave em `false` de propósito).

**O que é.** Painel **💊 Bulário** na seção Clínica (aluno, logo abaixo de
Calculadoras, hoje oculto; no painel do professor; e na degustação, com o mesmo
acesso das calculadoras, quando liberado). Busca por nome comercial, princípio ativo ou fabricante, sem
acento e sem caixa; filtro por área da endocrinologia; ficha de cada medicamento
com princípio ativo, detentor, registro e validade, categoria, classe terapêutica,
apresentações com preço máximo ao consumidor e situação, e o botão **"📄 Bula
oficial na ANVISA ↗"**.

**As fontes (ambas públicas e oficiais):**
- **ANVISA, dados abertos** (`dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv`,
  ~46 MB, Windows-1252, `;`): todos os registros, com situação. Em 16/10: 228.870 linhas,
  85.092 ativas, **12.390 produtos** com registro ativo (um por número de registro;
  sem número, por nome + detentor), 2.473 princípios ativos.
- **CMED, lista de preços (PMC)** (`www.gov.br/anvisa/.../cmed/precos`, o arquivo
  `lista_pmc__<data>.xlsx` mais recente da página): 26.635 apresentações, com preço
  por alíquota de ICMS, tarja, restrição hospitalar e a coluna "COMERCIALIZAÇÃO
  <ano>". Ligação pelo registro: os 9 primeiros dígitos do código de 13 da CMED.
  **25.271 apresentações ligadas**; 1.364 sem registro ativo na ANVISA ficam de fora.
- **Preço exibido:** PMC com ICMS de 18% (a nota da ficha diz que varia por estado).
  Uso hospitalar não tem PMC.
- **Áreas** pela classe ATC (EphMRA) da CMED: Diabetes (A10, H4B), Obesidade (A8A),
  Lípides (C10), Tireoide (H3), Adrenal e corticoides (H2), Hipófise (H1C, H4C, H4D,
  H4X), Osso e cálcio (A11C2, A11C3, A12A, H4A, H4E, H4F, M5B), Hormônios sexuais
  (G3, G03H). Sem apresentação na CMED, vale a classe da ANVISA por extenso. Em 16/10:
  1.225 produtos de endocrinologia. Tireoide tem só 9 produtos, e está certo: poucas
  marcas de levotiroxina e antitireoidianos, cada uma com 14 a 23 apresentações.

**O texto da bula NÃO entra.** Pertence ao fabricante, e o **Bulário Eletrônico
(`consultas.anvisa.gov.br`) recusa os nossos IPs** (403 do firewall da ANVISA, com ou
sem cabeçalhos de navegador; testado em 16/10 depois de o professor liberar a rede
do ambiente). O botão leva à busca do Bulário Eletrônico pelo nome
(`https://consultas.anvisa.gov.br/#/bulario/q/?nomeProduto=<NOME EM MAIÚSCULAS>`),
que abre no navegador do aluno, no Brasil, sempre na versão vigente. ⚠️ O formato
desse link não tem documentação pública e não pôde ser aberto daqui: **pedir ao
professor que toque o botão uma vez**; se cair só na página inicial do Bulário,
trocar para o link da página inicial.

**Como se atualiza.** `scripts/bulario/construir.js` (sem dependências; usa o
`unzip` do sistema para o .xlsx) baixa as duas fontes, monta `bulario.json` na raiz
(~2,5 MB, ~0,5 MB comprimido; uma linha por produto, tabelas de valores repetidos)
e o app o carrega sob demanda ao abrir o painel. **`.github/workflows/bulario.yml`**
refaz o arquivo toda segunda-feira às 09h17 UTC, roda `scripts/test-bulario.js` e
só então grava na main (a Vercel publica). Se a ANVISA ou a CMED mudarem o formato
e o teste falhar, nada é gravado e os alunos seguem com a semana anterior.
Disparo manual: `workflow_dispatch` no Actions. O `sw.js` serve o `bulario.json` em
stale-while-revalidate: a semana nova aparece a partir da segunda abertura do painel,
sem precisar subir a versão do service worker a cada atualização.

**1ª execução (16/10, disparada à mão):** baixou as duas fontes a partir do GitHub
sem bloqueio, passou no teste e gravou na main pelo `github-actions[bot]`, sem erro
de permissão; mas estragou 5 nomes (lição abaixo). Corrigido no mesmo dia. A próxima
execução programada é a de segunda, 19/10, às 09h17 UTC.

**Prova:** `scripts/test-bulario.js` (17c-undecies-j no `ci-validate`; 9 de 9
mutações mortas: lista vazia sem busca, normalização de acento, link, ordenação,
degustação, leitura do CSV, caractere de controle no arquivo…) e `scratchpad/bulario-navegador/check.js` (aluno no celular e no
notebook e professor: busca, ficha, preço, link, área, sem rolagem horizontal).

**Lições da construção:**
- **Codificação do CSV da ANVISA (Windows-1252).** O `TextDecoder('latin1')` do
  Node 22 (o daqui) lê 0x96 e 0x92 como travessão e apóstrofo; o do Node 20 (o do
  GitHub) os leu como caracteres de controle invisíveis, e a 1ª atualização gravou
  "Dorto" no lugar de "D’orto" e tirou o travessão de "Clonazepam (Port. 344/98 –
  Lista B1)" (5 nomes). A leitura passou a usar tabela própria (`decodificar1252`,
  conferida byte a byte contra o Windows-1252) e o teste barra o arquivo com
  caractere de U+0080 a U+009F. Script que roda em outra máquina precisa de teste
  que rode lá também: o CI usa o Node 20 e agora exercita essa leitura.
- A tabela de três colunas escondia a situação à direita no celular; virou lista
  (apresentação em cima, preço e situação embaixo), com as sem venda recolhidas.
- Capitalização: "GLIFAGE XR" virava "Glifage Xr" e "S/A" virava "S/a". A regra:
  sigla de até 3 letras fica em maiúsculas, letra única junto de "/" também, e
  preposição fica minúscula.
- O `presc-catalogo.json` do Consultório (1,3 MB, gerado em 09/06/2026) usa as
  mesmas fontes num formato antigo e não se atualiza; pode passar a sair do mesmo
  construtor (pendência).

**Fase 2 (pendente):** fichas próprias das medicações de endocrinologia (indicação,
apresentações no Brasil, posologia e titulação, ajuste renal e hepático,
contraindicações, interações, monitorização, gestação, SUS), escritas a partir de
fontes oficiais acessíveis e do acervo, com o link para a bula oficial. A conferência
contra a bula brasileira depende de o professor enviar os PDFs.
