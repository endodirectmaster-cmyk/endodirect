# Figuras didáticas dos Resumos — como escrever a especificação

Cada capítulo dos Resumos ganha UMA figura didática, gerada por `render.js` a partir
de um JSON. Quem escreve o JSON decide **o que** mostrar; o gerador decide posição,
quebra de linha, cor e tamanho, iguais para todas as figuras. Nunca escreva SVG à mão.

## Regras de conteúdo (as que mais importam)

1. **Tudo o que a figura afirma tem de estar no texto do capítulo** (`resumo`, `pts`,
   tabelas). Mesmos números, mesmos pontos de corte, mesmos nomes de fármacos, mesma
   direção causal. Se o capítulo não traz um número, a figura não traz. Nada de
   conhecimento externo, por mais correto que pareça.
2. **Escolha a figura que mais ensina**, nesta ordem de preferência: (a) o mecanismo
   ou eixo fisiopatológico que o capítulo explica; (b) o algoritmo diagnóstico;
   (c) a escada terapêutica; (d) uma classificação ou espectro; (e) uma evolução no
   tempo; (f) um ciclo. Se o capítulo já tem um `fluxogramas` sobre um assunto, a
   figura cobre OUTRO ângulo (por exemplo, a fisiopatologia em vez do algoritmo).
3. **Português, curto, sem jargão de redação.** Primeira linha de cada caixa é o
   título (até 4 palavras); as linhas seguintes são o detalhe (até 9 palavras cada);
   no máximo 3 linhas por caixa. Separe título e detalhe com `\n`.
4. **Tamanho:** `fluxo` com 6 a 12 nós e no máximo 4 nós por camada; `painel` com 2 a
   4 colunas e 3 a 5 itens por coluna; `escada` com 3 a 5 degraus; `espectro` com 3 a
   6 segmentos; `linha_tempo` com 4 a 6 marcos; `ciclo` com 4 a 6 etapas; `curvas`
   com 1 a 3 séries e 4 a 7 pontos. Orientação `horizontal` só com até 4 nós.
5. **Sem arte copiada.** A figura é um esquema original dos fatos do capítulo; não
   reproduza figura de livro, diretriz ou artigo.
6. **`lastro`:** 3 a 8 trechos curtos, copiados literalmente do capítulo, que
   sustentam as afirmações centrais da figura. É o que o revisor confere.

## Formato comum

```json
{
  "i": 57, "sub": "Tireoide", "tema": "Hipotireoidismo",
  "titulo": "Eixo hipotálamo-hipófise-tireoide no hipotireoidismo primário",
  "subtitulo": "opcional, até 90 caracteres",
  "tipo": "fluxo",
  "fluxo": { … },
  "lastro": ["trecho literal 1", "trecho literal 2"],
  "justificativa": "Uma frase: por que esta é a figura que mais ensina neste capítulo."
}
```

`titulo` até 70 caracteres, sem ponto final. Só um dos blocos de tipo (`fluxo`,
`painel`, `escada`, `curvas`, `linha_tempo`, `espectro`, `ciclo`).

## Tipos

### `fluxo` — eixos, cascatas, mecanismos e algoritmos

```json
"fluxo": {
  "orientacao": "vertical",
  "rotulos_camadas": ["Hipotálamo", "Hipófise", "Tireoide"],
  "nos": [
    {"id": "h", "texto": "Hipotálamo\nTRH", "tipo": "orgao"},
    {"id": "p", "texto": "Hipófise\nTSH", "tipo": "orgao"},
    {"id": "d", "texto": "TSH alto e T4L baixo?", "tipo": "decisao"},
    {"id": "f", "texto": "Hipotireoidismo primário", "tipo": "fim"}
  ],
  "setas": [
    {"de": "h", "para": "p", "rotulo": "TRH"},
    {"de": "p", "para": "d"},
    {"de": "d", "para": "f", "rotulo": "Sim"},
    {"de": "f", "para": "p", "tipo": "feedback", "rotulo": "feedback −"}
  ],
  "notas": [{"no": "p", "texto": "Hashimoto: causa mais comum", "lado": "direita"}],
  "legenda": "Setas douradas: estímulo. Tracejado vermelho: retroalimentação negativa."
}
```

- `tipo` do nó: `orgao` (glândula, órgão, estrutura; caixa azul-marinho), `hormonio`
  (pílula dourada), `passo` (ação, exame, conduta; caixa branca), `decisao` (pergunta
  com resposta Sim/Não; hexágono âmbar), `inicio` (ponto de partida), `fim` (desfecho,
  diagnóstico, conclusão; verde), `alerta` (urgência, perigo; vermelho), `grupo`
  (lista curta, alinhada à esquerda; escreva as linhas com "• ").
- `tipo` da seta: ausente = estímulo/sequência (dourada); `estimula` (verde);
  `inibe` (vermelha, termina em barra ⊣); `feedback` (tracejada vermelha, desenhada
  pelo lado de fora, use para retroalimentação); `fraca` (cinza tracejada, caminho
  secundário). `rotulo` curto (até 4 palavras). Para decisões, rotule `Sim` e `Não`.
- `rotulos_camadas` (opcional): nome de cada camada, de cima para baixo. Não
  repita o que já está no nome dos nós.
- `notas` (opcional, até 3): observação ao lado de um nó, até 20 palavras.
- `camada` (opcional no nó): força a camada quando a ordem automática não serve.
- A seta `feedback` sempre sai pelo lado direito; não use mais de 3.

### `painel` — colunas comparativas ou agrupamentos

```json
"painel": {
  "colunas": [
    {"titulo": "PTH alto ou inapropriado", "cor": "navy", "itens": ["Hiperparatireoidismo primário", "HHF (CaSR)"]},
    {"titulo": "PTH suprimido", "cor": "red", "itens": ["Malignidade (PTHrP)", "Granulomatoses"]}
  ],
  "rodape": "frase opcional de síntese"
}
```
Cores: `navy`, `gold`, `red`, `green`, `blue`, `amber`, `purple`, `slate`.

### `escada` — intensificação em degraus

```json
"escada": {
  "degraus": [
    {"titulo": "Base", "detalhe": "dieta, atividade física, apoio comportamental"},
    {"titulo": "Farmacoterapia", "detalhe": "IMC ≥ 30 ou ≥ 27 com comorbidade"}
  ],
  "eixo": "intensidade do tratamento"
}
```

### `curvas` — tendências conceituais ao longo de um eixo

```json
"curvas": {
  "x": {"rotulo": "minutos após a refeição", "categorias": ["0", "30", "60", "120"]},
  "y": {"rotulo": "nível relativo", "min": 0, "max": 100, "marcas": [{"v": 0}, {"v": 100, "rotulo": "pico"}]},
  "faixas_y": [{"de": 20, "ate": 40, "rotulo": "faixa basal", "cor": "green"}],
  "series": [{"nome": "Insulina", "valores": [25, 90, 75, 55], "cor": "red", "tracejada": false}],
  "anotacoes": [{"serie": 0, "indice": 1, "texto": "1ª fase"}],
  "legenda": "Tendência conceitual, não dados de um estudo."
}
```
Use valores relativos (0–100) a menos que o capítulo dê os números. Sempre diga no
`subtitulo` ou na `legenda` que a curva é conceitual, quando for.

### `linha_tempo` — marcos e fases

```json
"linha_tempo": {
  "eixo": "semanas de gestação",
  "faixas": [{"de": 0, "ate": 33, "rotulo": "1º trimestre", "cor": "gold"}],
  "marcos": [{"pos": 25, "rotulo": "Pico de hCG", "detalhe": "TSH cai", "cor": "navy"}]
}
```
`pos` de 0 a 100. Até 6 marcos.

### `espectro` — classificação em faixa contínua

```json
"espectro": {
  "segmentos": [{"rotulo": "II Benigna", "cor": "green", "detalhe": "seguimento", "peso": 1}],
  "marcadores": [{"pos": 25, "rotulo": "0–3%"}],
  "eixo": "risco de malignidade crescente →"
}
```

### `ciclo` — processo cíclico

```json
"ciclo": {"etapas": [{"texto": "Ativação\nRANKL recruta precursores"}, {"texto": "Reabsorção\nosteoclastos"}], "centro": "texto opcional no centro"}
```

## Como conferir o que escreveu

```
SAIDA=<sua pasta temporária> node scratchpad/figuras-resumos/render.js <spec.json>
PLAYWRIGHT_CORE=/opt/node22/lib/node_modules/playwright node scratchpad/figuras-resumos/confere.js --png <sua pasta temporária> <sua pasta temporária>/<slug>.svg
```
O primeiro gera o SVG e avisa de tamanho e de nós sem caminho; o segundo mede o
texto no Chromium (sobreposição, texto cortado, texto fora da área) e grava um PNG.
Abra o PNG e olhe: a figura precisa ser lida de cima para baixo sem esforço, sem
caixa apertada, sem seta cruzando texto. Corrija a especificação (não o gerador)
até os dois passarem sem aviso.
