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
apresentações e situação de venda (**sem preço**, desde 17/10), e o botão **"📄 Bula do
profissional e do paciente ↗"** (até 17/10, "Bula oficial na ANVISA").

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
- **⚠️ A TELA NÃO MOSTRA PREÇO (decisão do professor, 17/10/2026).** Caminho até aqui,
  no mesmo dia: a tela mostrava o PMC 18 %; o professor achou "bem diferente das
  farmácias", e o preço virou a faixa "R$ PF a R$ PMC" (opção dele, com a minha descrição
  de que o balcão "costuma cair nessa faixa"); em seguida ele mandou o print da Drogasil:
  Ozivy 3 mL a **R$ 464,81** com desconto de laboratório ("preço normal sugerido" R$
  664,02), contra PF **R$ 979,80** e PMC **R$ 1.314,37** na CMED. Ou seja, o balcão ficou
  abaixo até do preço de fábrica, e a minha descrição estava errada. **A CMED só publica
  tetos**; o desconto de laboratório (vinculado ao CPF) derruba o preço abaixo deles.
  Entre só o teto bem explicado, tirar os preços ou manter a faixa, o professor escolheu
  **tirar**. A tela mostra a apresentação e a situação ("À venda", "Sem venda em 2025",
  "Uso hospitalar"); o título é "Apresentações (N)"; a linha do topo diz "CMED, lista de
  <data> (apresentações e situação de venda)".
- **Os preços continuam no arquivo, sem uso na tela:** cada apresentação é
  `[apresentação, pmc18, tarja, hospitalar, comercializado, pf18]`. Servem de **alarme do
  formato da planilha**: o `test-bulario` (bloco 6) barra arquivo sem PF, com PF e PMC
  trocados ou com a razão PMC/PF fora de 1,2 a 1,6 (na lista de 09/10: PF em todas as
  26.635 apresentações; PMC em 22.674; as 3.961 só com PF são de uso hospitalar; razão
  1,340 a 1,342 na lista negativa do PIS/Cofins, 1,351 na neutra, 1,377 a 1,380 na
  positiva). Se um dia o preço voltar, os dados estão lá.
- **Ozivy "Sem venda em 2025":** é o dado da CMED (coluna "COMERCIALIZAÇÃO 2025"); o
  registro vale até 05/2036, isto é, é de 2026, e o produto não podia ter venda em 2025.
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
link não tem documentação pública e não pode ser aberto daqui. De manhã, em 17/10, o
professor disse que abria a busca já com o medicamento; à tarde, mandou o print da
página **com a busca vazia** (`#/bulario/`, sem o nome), aberta pelo botão. Por isso o
botão passou a **copiar o nome** ao ser tocado (`bulaCopia`: a API de área de
transferência, e o `execCommand('copy')` quando ela falta), com o aviso "Nome copiado:
<nome>" ao lado, e a dica diz para colar no campo "Medicamento" e tocar em "Consultar".
O link continua o mesmo; se a busca vier preenchida, melhor.
**Teste do professor (17/10, 09h55):** a busca feita à mão por "Glifage XR" gera
`#/bulario/q/?nomeProduto=Glifage%20XR`, o mesmo formato do nosso link (a busca não
diferencia maiúsculas), e mostra o expediente 0953618269 de 14/09/2026, igual aos dados
abertos. Logo, o formato não é o problema; a hipótese é que a ANVISA não abre o resultado
quando o endereço é carregado direto numa aba nova (o resultado depende da consulta feita
na própria página). A cópia do nome cobre esse caso. Na linha do resultado ficam os
ícones PDF de "Bula do Paciente" e "Bula do Profissional" e o "Histórico de Bulas".
**O PDF não tem endereço fixo (17/10, 10h02):** o ícone não é link (o clique direito só
oferece opções de imagem), e o clique esquerdo baixa direto um arquivo chamado
`bula_<milissegundos do clique>` (`bula_1792242123977`): a página busca o PDF e o gera na
hora. Logo, **não dá para o nosso botão levar direto ao PDF**; fica a busca com o nome
copiado. O link antigo (`datavisa/fila_bula/frmVisualizarBula.asp`) não foi testado, e
pelo jeito do sistema atual dificilmente ainda responde.

**Portal de APIs e dados abertos da ANVISA (17/10).** O professor apontou os dois links do
rodapé do Bulário Eletrônico. (1) **Portal de APIs** (api.anvisa.gov.br): credenciais
(Client ID e Client Secret) só com login Gov.br; os serviços listados publicamente
(filas, listas, UDI, GMDN, nomes técnicos, assuntos de petição) não incluem o bulário;
daqui o endereço nem abre (rede do ambiente). O cliente público `anvisa` 0.5.0 (PyPI, repositório
vasfvitor/anvisa-api; lido sem executar) confirma: gateway
`https://api-gateway.prd.apps.anvisa.gov.br/consultas-externas-api`, token por OpenID
Connect em `https://acesso.prd.apps.anvisa.gov.br/auth/realms/externo/protocol/openid-connect/token`
(Client ID e Client Secret), e só as famílias `/api/v1/fila`, `/api/v1/lista`,
`/api/v1/nomeTecnico`, `/api/v1/udi` e `/api/v1/assunto`; nada de bula nem de
medicamento. Em 17/10 o professor entrou no portal (login Gov.br) e perguntou se a API dá
acesso ao bulário: pedido a ele que veja o catálogo de APIs do portal; se houver bulário,
são preciso as credenciais dele guardadas como segredo do ambiente e a liberação dos dois
endereços acima na rede (e ainda testar se o gateway aceita servidor de nuvem). (2) **Dados abertos**
(dados.anvisa.gov.br/dados/CONSULTAS/DOCUMENTOS/, abre daqui): `TA_CONSULTA_BULA_PRODUTO.CSV`
(8.824 produtos com a bula vigente: id, nome, registro, processo, CNPJ, empresa, id do
documento, expediente, data, número da transação; sem cabeçalho, Windows-1252) e
`TA_CONSULTA_BULA_DOCUMENTO.CSV` (85.949 documentos com a situação), ambos de 13/10/2026.
**São metadados: nem texto nem PDF da bula.** Glifage XR, por exemplo: registro
100890340, expediente 0953618269, documento 35552862, transação 12366362026, de
14/09/2026. Uso possível: a data da bula vigente na ficha; e um link direto ao PDF, se o
formato antigo da ANVISA (`www.anvisa.gov.br/datavisa/fila_bula/frmVisualizarBula.asp?
pNuTransacao=<transação>&pIdAnexo=<documento>`) ainda funcionar no navegador. Daqui não dá
para testar (www.anvisa.gov.br fora da rede do ambiente): **pedido ao professor**.

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
degustação, leitura do CSV, caractere de controle no arquivo…; desde 17/10, o bloco (6),
tela sem preço e preços do arquivo como alarme, com 8 de 8 mutações barradas: preço de
volta na apresentação, "R$" escrito à mão, título com preço, nota de preço, atalho
"Apresentações e preços", descrição do painel com "faixa de preço", PF e PMC trocados,
arquivo sem PF; a saída montada de Ozivy, Acezo, Biomag e Glifage XR sem "R$") e
`scratchpad/bulario-navegador/check.js` (aluno no celular e no notebook sem o Bulário;
professor no notebook e no celular: busca, ficha, Glifage XR, Ozivy, Acezo hospitalar e
Biomag sem "R$", topo sem preço, botão e dica, área, sem rolagem horizontal; A/B da tela
sem preço em 17/10: a main, ainda com a faixa, falhou nos 6 itens nas duas larguras).

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
  recomendada; **revogada no mesmo dia**, ver "A tela não mostra preço" acima), e o link
  continua sendo a busca da ANVISA com o remédio, que ele conferiu. Feito no mesmo dia: faixa por apresentação, título "do preço de fábrica ao
  máximo ao consumidor", nota que explica os dois valores (o balcão costuma ficar na
  faixa; o genérico pode sair abaixo), botão "Bula do profissional e do paciente" com a
  dica de onde fica o PDF do profissional.
- **Referência de estilo (17/10):** depois disso o professor mandou o print da página de
  bula da Consulta Remédios (Biomag, sibutramina): barra de seções no topo (Para que
  serve, Como funciona, Contraindicação, Como usar, Superdose, Esquecimento,
  Precauções, Reações adversas, População especial, Interações) e cada seção com
  título em pergunta. Ver "Fichas por princípio ativo" abaixo.

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

## 📑 Fichas por princípio ativo, no estilo de bula por seções (protótipo, 17/10/2026)

Depois da faixa de preço, o professor mandou o print da bula do Biomag na Consulta
Remédios: *"pensei em deixar o bulário nesse estilo"*. O estilo: barra de seções no topo
(Para que serve, Como funciona, Contraindicação, Como usar, Superdose, Precauções,
Reações adversas, População especial, Interações) e cada seção com título em pergunta.

**O que existe (protótipo no ar, só professores veem o Bulário):**
- `bulario-fichas.json` na raiz, carregado junto com o `bulario.json`; se faltar ou
  falhar, o Bulário segue com a ficha técnica de sempre.
- **Uma ficha por princípio ativo**, sem sal nem hidratação (`bulaBases`: "cloridrato de
  sibutramina monoidratado" → "sibutramina"). Vale para todos os produtos daquele
  princípio ativo: a da sibutramina cobre 14 (Biomag, Sibus, Vazy, Nolipo, Sigran,
  Slenfig e genéricos). **Associação** (dois princípios ativos) não herda ficha; o
  detalhe só aponta a ficha de cada componente que exista.
- Campos: `nome`; `artigo` (a/o, para o título em pergunta concordar: "Quando a
  sibutramina é contraindicada?", "do orlistate"); `status` (`rascunho` mostra o aviso
  amarelo, `aprovada` tira); `fonte`; `secoes` em markdown, passado pelo `mdToHtml`
  do app (que escapa). Seções, sempre nesta ordem e só as preenchidas: indicacao,
  mecanismo, resultados, uso, contraindicacoes, precaucoes, adversas, interacoes,
  populacoes, superdose. Depois delas, Apresentações e preços, Registro na ANVISA e
  Bula oficial, também na barra.
- **Barra que acompanha a leitura.** No notebook, `position: sticky` (o painel rola por
  dentro), em duas linhas. No celular a página é que rola, e os contêineres do app
  (`.adm-content`, `.workspace`, `#app-screen`) têm `overflow: hidden`, que prende o
  sticky; `bulaNavSegue()` deixa a barra `fixed` no topo enquanto a ficha está na tela,
  com uma vaga que guarda a altura (o texto não pula). A margem da rolagem do atalho
  acompanha a altura real da barra. Atalho é botão, não âncora: o app usa o `#` nas rotas.

**Conteúdo do protótipo (sibutramina):** escrito só com o Resumo "Tratamento farmacológico
da obesidade" (aula EndoTEEM 2026 e posicionamento ABESO/SBEM 2024), o de obesidade
pediátrica e a indicação da bula que aparece no print (IMC ≥ 30). Superdose e esquecimento
de dose ficaram de fora: os Resumos não tratam. Conferência: os 29 números da ficha estão
na fonte; revisor independente (76 afirmações): 68 fiéis, 8
inferidas (4 aceitáveis; 4 duvidosas, corrigidas: "autoriza" virou "aprova"; a síndrome
serotoninérgica voltou a ter as duas causas da fonte, interação "ou" envenenamento; "outros
serotoninérgicos" virou "ISRS e IMAO"; a fonte passou a nomear os dois Resumos e a bula),
nenhuma sem apoio ou em contradição; e 3 ajustes de adulto × criança (regra de parada
marcada "adultos"; ECG e PA "antes e durante"; a regra pediátrica de 6 meses).
**Divergências para o professor**, que a ficha não resolve sozinha: (1) a população do SCOUT
(074: ≥ 55 anos e alto risco cardiovascular; 146: "só em adultos com doença cardiovascular
estabelecida"; o artigo, NEJM 2010, doi 10.1056/NEJMoa1003114: doença cardiovascular prévia,
DM2 ou ambos); (2) o desfecho de 16% a mais é o composto (IAM não fatal, AVC não fatal,
ressuscitação após parada ou morte cardiovascular), e a morte cardiovascular isolada não
aumentou.

**Limites:** o texto da bula não entra (é do fabricante). Daqui não se alcança a ANVISA
(firewall) nem os sites dos fabricantes: a política de rede do ambiente recusou
ache.com.br, eurofarma.com.br, novonordisk.com.br e ems.com.br (17/10). Para conferir as
fichas contra a bula do profissional, o professor precisa liberar esses domínios no
ambiente (Network access → Allowed domains) ou mandar os PDFs.

**Consulta Remédios não serve de fonte (17/10).** O professor perguntou se dava para
"puxar" as bulas de consultaremedios.com.br. Não: os Termos de Uso deles
(consultaremedios.com.br/termos) proíbem a reprodução total ou parcial do conteúdo sem
autorização prévia e por escrito, e só permitem uso pessoal e não comercial; a Endodirect
é paga. O texto das bulas, além disso, é dos fabricantes. O site também está fora da rede
deste ambiente. Eles hospedam até o PDF da bula do profissional
(uploads.consultaremedios.com.br/drug_leaflet/pro/…), mas usar isso como fonte de um
produto comercial cai no mesmo veto. Caminhos legítimos: a bula no site do fabricante
(plano em curso), uma licença por escrito da Consulta Remédios (decisão comercial do
professor) ou só um link para a página deles, que não reproduz nada.

**Cobertura dos Resumos (233 capítulos, 17/10):** 76 dos 80 princípios ativos centrais
aparecem em pelo menos um capítulo; muitos com folga (testosterona 56, metformina 39,
levotiroxina 38, semaglutida 37, tirzepatida 28), outros em 1 ou 2 (pitavastatina,
tibolona, vildagliptina, glimepirida). Sinônimos contam: metimazol (10) é o tiamazol;
asparte (4); "GH recombinante" (3) é a somatropina; fibratos (11). Com 1 ou 2 menções,
a ficha sai curta, a menos que entre a bula como fonte. A limpeza do sal ainda precisa
de mais termos ao escalar (sódio, dissódico, benzoato, butanodiol, propanodiol,
pentaidratado, acetonida, micronizado).

**Provas:** `scripts/test-bulario.js` bloco (7), 15 de 15 mutações barradas (sal que não
sai, título sem concordância, seção ou fonte sem escape, ordem do arquivo, rascunho
sempre, associação que herda ficha, detalhe que ignora a ficha, falha das fichas
derrubando o Bulário, barra sem vaga, chave suja, HTML no texto, seção desconhecida, sem
fonte, ficha sem produto) e o harness `scratchpad/bulario-navegador/check.js` (ficha do
Biomag no notebook e no celular: 12 atalhos, títulos em pergunta, atalho que leva à
seção logo abaixo da barra, barra opaca e fixa; produto sem ficha no formato de antes).
A/B: a main falhou nos 5 itens da ficha nas duas larguras.

**Lições:**
- `var(--card)` não existe no CSS do app: o cartão do Bulário sempre foi transparente
  sobre o `--bg`. Na barra fixa isso deixou o texto aparecendo por trás dos botões; a
  barra usa `--bg`, e o harness exige fundo opaco.
- `overflow: hidden` em qualquer ancestral vira o contêiner do sticky, mesmo sem rolar;
  `overflow: clip` não vira (usado no `.bula-item`).
