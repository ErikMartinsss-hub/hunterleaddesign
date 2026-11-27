# Design Hunter Lead

Dark futuristic SaaS interface for finding local business leads from Google Maps.
The app searches a niche and location, collects real business profiles, then helps
create a WhatsApp pitch for businesses without a website or active Instagram link.

## Structure

- `backend/` — Express API, SQLite legacy endpoints, and live Google Maps scraper.
- `hunter-lead/` — React + TypeScript + Tailwind + Vite frontend.

## Run locally

Requires Node.js 18+ and Google Chrome installed.

```bash
cd backend
npm install
node index.js
```

In another terminal:

```bash
cd hunter-lead
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` to `http://localhost:4000`.

## Live search

`POST /api/search/live` searches Google Maps through `playwright-core`.
No paid API key is required. Chrome is auto-detected at the default Windows path.
Set `CHROME_PATH` if Chrome is installed elsewhere:

```bash
CHROME_PATH="/path/to/chrome" node index.js
```

On Windows PowerShell:

```powershell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
node index.js
```

Results are cached in memory for 10 minutes. One live scrape runs at a time.
Google Maps scraping can violate Google's terms. Use this project responsibly and
respect applicable laws, rate limits, and website terms.

## Frontend scripts

```bash
cd hunter-lead
npm run dev
npm run build
npm run lint
```

## AI assets

Generated local cinematic assets are documented in `hunter-lead/AI_ASSETS.md`
and stored in `hunter-lead/public/assets/`.
