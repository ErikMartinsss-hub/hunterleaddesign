const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { searchGoogleLeads } = require('./googleLeads');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
bodyParser.urlencoded({ extended: true });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'leads.db'), (err) => {
  if (err) {
    console.error('Database error:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// Create table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      telefone TEXT,
      instagram TEXT,
      site TEXT,
      cidade TEXT,
      estado TEXT,
      bairro TEXT,
      segmento TEXT,
      has_website INTEGER DEFAULT 0
    )
  `);
});

// API: Create lead
app.post('/api/leads', (req, res) => {
  const { nome, email, telefone, instagram, site, cidade, estado, bairro, segmento } = req.body;
  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, site ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ...req.body, has_website: site ? 1 : 0 });
    }
  );
});

// API: Search leads
app.get('/api/search', (req, res) => {
  const { cidade, estado, bairro, segmento } = req.query;
  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (cidade) {
    query += ' AND LOWER(cidade) LIKE ?';
    params.push(`%${cidade.toLowerCase()}%`);
  }
  if (estado) {
    query += ' AND LOWER(estado) LIKE ?';
    params.push(`%${estado.toLowerCase()}%`);
  }
  if (bairro) {
    query += ' AND LOWER(bairro) LIKE ?';
    params.push(`%${bairro.toLowerCase()}%`);
  }
  if (segmento) {
    query += ' AND LOWER(segmento) LIKE ?';
    params.push(`%${segmento.toLowerCase()}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Site status comes from the site field. Never trust a stale flag.
    res.json(rows.map((row) => ({ ...row, has_website: row.site ? 1 : 0 })));
  });
});

// API: Get single lead
app.get('/api/leads/:id', (req, res) => {
  db.get('SELECT * FROM leads WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// API: Live Google Maps search. Cached briefly to avoid repeated scrapes.
const liveCache = new Map();
const LIVE_TTL = 10 * 60 * 1000;
let liveInFlight = null;

app.post('/api/search/live', async (req, res) => {
  const niche = String(req.body?.niche || '').trim();
  const location = String(req.body?.location || '').trim();
  const limit = Math.min(48, Math.max(1, Number(req.body?.limit) || 24));
  const key = `${niche.toLowerCase()}|${location.toLowerCase()}|${limit}`;

  if (!niche && !location) {
    return res.status(400).json({ error: 'Informe nicho ou localização.' });
  }

  const cached = liveCache.get(key);
  if (cached && Date.now() - cached.at < LIVE_TTL) {
    return res.json({ ...cached.data, cached: true });
  }
  if (liveInFlight) {
    return res.status(429).json({ error: 'Uma busca real já está em andamento. Tente novamente em instantes.' });
  }

  liveInFlight = key;
  try {
    const data = await searchGoogleLeads({ niche, location, limit });
    liveCache.set(key, { at: Date.now(), data });
    return res.json({ ...data, cached: false });
  } catch (error) {
    console.error('Live search failed:', error.message);
    return res.status(502).json({ error: error.message || 'Falha ao consultar o Google Maps.' });
  } finally {
    liveInFlight = null;
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '../hunter-lead/dist')));

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});