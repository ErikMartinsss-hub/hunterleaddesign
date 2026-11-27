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

O frontend pode ser publicado na Vercel. O backend precisa de um host com
processo contínuo e Chrome instalado, como Railway, Render ou VPS. Vercel não
roda o scraper do Google Maps de forma confiável.

Para apontar o frontend publicado para um backend externo, defina:

```bash
VITE_API_URL=https://seu-backend.exemplo.com
```

No Vercel, adicione `VITE_API_URL` em Project Settings → Environment Variables.
Sem essa variável, o frontend usa `/api`, que funciona só com o proxy local.

Endpoint de saúde do backend:

```text
GET /health
```

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
