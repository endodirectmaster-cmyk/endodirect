# Acervo — extração dos artigos do Drive para a base clínica

Pipeline da varredura pedida em 07/08/2026 ("leia todos os artigos da plataforma
para atualizar suas diretrizes… risco extremamente baixo de alucinar").

```
manifest.json          árvore completa do Drive (agente enumerador)
textos/<fileId>.txt    texto integral do PDF, como veio do Drive
extratos/<fileId>.json fatos extraídos, cada um COM CITAÇÃO LITERAL
```

## A regra que sustenta tudo

**Nenhuma afirmação entra na base clínica sem uma citação literal do artigo.**
`scripts/verifica-extracao.js` confere isso por texto:

1. a citação tem de existir no PDF (espaços normalizados);
2. citação com menos de 25 caracteres não vale como prova;
3. **todo número da afirmação tem de aparecer na citação** — é onde a alucinação
   entra (trocar 264 por 300, 6,5 por 6,0);
4. sem `fonte`, não entra.

Provado por construção: o verificador foi testado contra citação inventada,
número trocado e fato sem citação — reprova os três.

## Por que existe a camada PROFUNDA

O núcleo (`CLINICAL_GUIDELINES`, no index.html) vai em TODA chamada de IA e é
cortado em 60.000 caracteres. Em 07/08 ele estava a **341 caracteres** do corte.
O detalhe extraído dos artigos vai para `lib/clinical-deep.js`, anexado só quando
o gerador é daquela subespecialidade. Ver `scripts/test-teto-diretrizes.js`.
