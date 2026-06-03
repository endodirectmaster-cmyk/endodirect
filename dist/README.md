# Endodirect — Artefato publicável

Build standalone de **arquivo único** do app Endodirect, pronto para publicar.

## Como gerar

```bash
node dist/build.js
```

Isso lê o `index.html` da raiz, embute o `logo.png.png` como data-URI base64 e
gera `dist/endodirect.html` — um único arquivo HTML **sem dependências de
arquivos locais**.

> O arquivo gerado `dist/endodirect.html` não é versionado (ver `.gitignore`),
> pois é um artefato derivado. Rode o build para recriá-lo.

## Como publicar

O `endodirect.html` é autocontido (CSS e logo embutidos). A única dependência
de rede é o SDK do Supabase via CDN, que carrega normalmente quando hospedado
online. Opções de publicação:

- **Abrir local:** dê duplo clique no arquivo — abre direto no navegador.
- **GitHub Pages / Netlify / S3:** suba o arquivo como `index.html`.
- **Vercel (projeto completo, com API serverless):** este repositório já tem
  `vercel.json` com a função `api/ai.js` e o cron `api/cron/endocrine-radar`.
  Publique a raiz do projeto (não apenas este arquivo) para manter os recursos
  de IA. Lembre de configurar as variáveis de ambiente no painel da Vercel:
  - `ANTHROPIC_API_KEY` (e opcionalmente `ANTHROPIC_MODEL`)

## Observação sobre as funções de IA

O arquivo único contém apenas o front-end. As chamadas a `/api/ai` dependem das
funções serverless deste repositório — para tê-las ativas, publique o projeto
completo na Vercel (ou outra plataforma com funções), não apenas o HTML.
