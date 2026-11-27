# Design Hunter Lead

Interface SaaS dark futurista para encontrar leads locais no Google Maps.
Backend e frontend ficam juntos neste repositório.

## Estrutura

- `backend/` — API Express, endpoints SQLite legados e scraper real do Google Maps.
- `hunter-lead/` — frontend React + TypeScript + Tailwind + Vite.

## Rodar tudo junto

Requisitos: Node.js 18+ e Google Chrome instalado.

Na raiz do repositório:

```bash
npm install
npm run dev
```

`npm install` instala dependências da raiz, do backend e do frontend.
`npm run dev` inicia os dois processos:

- API: `http://localhost:4000`
- Frontend: `http://localhost:5173`

O Vite usa proxy de `/api` para `http://localhost:4000`.

## Deploy

Erro `404` no deploy significa que o frontend está chamando `/api` sem backend.
No local isso funciona porque o Vite faz proxy para `http://localhost:4000`.
Na Vercel, `/api` não existe.

Use esta divisão:

1. Publicar `hunter-lead/` na Vercel como projeto Vite.
2. Publicar o backend em Railway, Render ou VPS com o `Dockerfile` da raiz.
3. Definir `VITE_API_URL` no Vercel com a URL do backend.
4. Fazer redeploy do frontend.

No Railway:

```text
New Project → Deploy from GitHub repo
Root Directory: .
Builder: Dockerfile
Healthcheck: /health
```

O `Dockerfile` instala Node, Chromium e dependências do Playwright.
Ele também define `CHROME_PATH=/usr/bin/chromium` e
`PLAYWRIGHT_NO_SANDBOX=1`.

No Vercel, adicione em Project Settings → Environment Variables:

```text
VITE_API_URL=https://seu-backend.exemplo.com
```

Use a URL real do backend, sem barra no final.
Endpoint de saúde do backend: `GET /health`.


## Comandos da raiz

```bash
npm run dev      # backend + frontend
npm start        # só backend
npm run build    # build do frontend
npm run lint     # lint do frontend
```

## Busca real

`POST /api/search/live` consulta o Google Maps via `playwright-core`.
Não usa API key paga. O Chrome é detectado no caminho padrão do Windows.
Se estiver em outro caminho, defina `CHROME_PATH`.

Windows PowerShell:

```powershell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run dev
```

Linux/macOS:

```bash
CHROME_PATH="/path/to/chrome" npm run dev
```

Resultados ficam em cache por 10 minutos. Apenas uma busca real rola por vez.
Scraping do Google Maps pode violar termos de uso. Use com responsabilidade.

## Assets de IA

Assets cinematográficos gerados localmente estão documentados em
`hunter-lead/AI_ASSETS.md` e salvos em `hunter-lead/public/assets/`.
