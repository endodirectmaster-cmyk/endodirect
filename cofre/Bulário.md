---
tags: [cofre, bulario, ferramentas]
atualizado: 2026-10-17
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
apresentações com a **faixa de preço** (do preço de fábrica ao máximo ao consumidor)
e situação, e o botão **"📄 Bula do profissional e do paciente ↗"** (até 17/10, "Bula
oficial na ANVISA").

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
- **Preço exibido (desde 17/10/2026): a faixa** "R$ PF a R$ PMC", do preço de fábrica
  (coluna "PF 18 %") ao preço máximo ao consumidor ("PMC 18 %"), ambos com ICMS de 18%
  (as colunas "ALC", de área de livre comércio, ficam fora). No `bulario.json`, o PF é o
  6º campo de cada apresentação: `[apresentação, pmc18, tarja, hospitalar,
  comercializado, pf18]`. Na lista de 09/10: PF em todas as 26.635 apresentações; PMC
  em 22.674; as 3.961 só com PF são todas de uso hospitalar, que aparecem como "R$ X de
  fábrica". O PMC sai do PF por um fator fixo por lista do PIS/Cofins: 1,340 a 1,342
  (negativa), 1,351 (neutra), 1,377 a 1,380 (positiva); o PF nunca passa do PMC. Arquivo
  antigo, sem o 6º campo (cache do navegador): "até R$ PMC". Até 17/10 a tela mostrava
  só o PMC.
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
que abre no navegador do aluno, no Brasil, sempre na versão vigente. O formato desse
link não tem documentação pública e não pode ser aberto daqui; **o professor conferiu
em 17/10**: abre a busca já com o medicamento, e na linha dele ficam os ícones da bula
do paciente e da do profissional. A dica embaixo do botão diz isso.

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
degustação, leitura do CSV, caractere de controle no arquivo…; e, desde 17/10, o bloco
(6) da faixa de preço, com 10 de 10 mutações barradas: faixa invertida, sem o "até" do
arquivo antigo, hospitalar sem PF, tela de volta ao só teto, nota sem explicação, botão
antigo, arquivo sem o 6º campo, PF e PMC trocados, PF de outra alíquota, PF zerado) e
`scratchpad/bulario-navegador/check.js` (aluno no celular e no notebook sem o Bulário;
professor no notebook e no celular: busca, ficha, faixa do Glifage XR e do Ozivy 3 mL
"R$ 979,80 a R$ 1.314,37", Acezo hospitalar "de fábrica", botão e dicas, área, sem
rolagem horizontal; A/B em 17/10: a main falhou nos 6 itens novos nas duas larguras).

**17/10: "os valores estão bem diferentes das farmácias" e "bula profissional".**
- **Os preços batem com a CMED, centavo a centavo.** Conferido na planilha original
  (Ozivy e Ozempic, colunas "PF 18 %" e "PMC 18 %"). A diferença para o balcão é de
  natureza: o **PMC é o teto legal** de venda, e a farmácia costuma vender abaixo dele.
  Exemplo: Ozempic, PMC R$ 1.314,37 e preço de fábrica (PF 18 %) R$ 979,80. A própria
  lista da CMED põe o Ozivy 2 × 1,5 mL pelo mesmo preço do 2 × 3 mL (R$ 2.628,75), o
  que parece erro dela.
- **A ANVISA recusa qualquer servidor de nuvem, não só os de fora do Brasil.** Função
  temporária no Supabase com `x-region: sa-east-1` (IP da AWS em São Paulo): 403, igual
  aos EUA e a este ambiente. Logo, não dá para baixar nem guardar a bula pelo servidor;
  o PDF só abre no navegador de quem usa (rede residencial ou celular no Brasil). A
  função `teste-anvisa-bulario` virou stub 410.
- **Decisão do professor (17/10):** preço como **faixa de fábrica a teto** (opção
  recomendada), e o link continua sendo a busca da ANVISA com o remédio, que ele
  conferiu. Feito no mesmo dia: faixa por apresentação, título "do preço de fábrica ao
  máximo ao consumidor", nota que explica os dois valores (o balcão costuma ficar na
  faixa; o genérico pode sair abaixo), botão "Bula do profissional e do paciente" com a
  dica de onde fica o PDF do profissional.
- **Referência de estilo (17/10):** depois disso o professor mandou o print da página de
  bula da Consulta Remédios (Biomag, sibutramina): barra de seções no topo (Para que
  serve, Como funciona, Contraindicação, Como usar, Superdose, Esquecimento,
  Precauções, Reações adversas, População especial, Interações) e cada seção com
  título em pergunta. Ver "Fase 2" abaixo.

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
