const crypto = require('crypto');
const { chromium } = require('playwright-core');

const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const LAUNCH_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--disable-background-networking',
  '--disable-extensions',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--blink-settings=imagesEnabled=false',
  '--lang=pt-BR',
  ...(process.env.PLAYWRIGHT_NO_SANDBOX === '1'
    ? ['--no-sandbox', '--disable-dev-shm-usage']
    : []),
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const slug = (value) =>
  clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'lead';

const parseRating = (text) => {
  const match = clean(text).match(/(\d[.,]\d)\s*\(([\d.]+)\)/);
  if (!match) return { rating: 0, reviews: 0 };
  return {
    rating: Number(match[1].replace(',', '.')),
    reviews: Number(match[2].replace(/\./g, '')),
  };
};

const parseSummary = (text) => {
  const lines = String(text || '')
    .split('\n')
    .map((line) => clean(line))
    .filter(Boolean);
  const categoryLine = lines.find(
    (line) => line.includes('·') && !/(\d[.,]\d)\s*\(([\d.]+)\)/.test(line),
  );
  const parts = categoryLine ? categoryLine.split('·').map((part) => clean(part)) : [];
  return {
    category: parts[0] || 'Negócio local',
    address: parts[parts.length - 1] || '',
  };
};

const parseLocation = (address, locationQuery) => {
  const match = clean(address).match(/-\s*([^,]+),\s*([^,]+?)\s*-\s*([A-Z]{2})\b/);
  if (match) {
    return {
      neighborhood: clean(match[1]),
      city: clean(match[2]),
      state: clean(match[3]),
    };
  }
  const parts = String(locationQuery || '')
    .split(',')
    .map((part) => clean(part))
    .filter(Boolean);
  const stateMatch = String(locationQuery || '').match(/\b([A-Z]{2})\b/);
  return {
    neighborhood: '',
    city: parts[0] || '',
    state: stateMatch ? stateMatch[1] : '',
  };
};

const parsePhone = (value) => {
  let digits = clean(value).replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 10) digits = digits.slice(2);
  if (digits.length < 10) return { whatsapp: '', phoneLabel: '' };
  const normalized = `55${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const label =
    rest.length === 9
      ? `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
      : `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return { whatsapp: normalized, phoneLabel: label, digits };
};

async function collectCards(page, limit) {
  const feed = page.locator('div[role="feed"]').first();
  let idleRounds = 0;
  let previousCount = 0;

  for (let round = 0; round < 12; round += 1) {
    const count = await page.locator('div[role="article"] a[href*="/maps/place/"]').count();
    if (count >= limit) break;
    if (count === previousCount) idleRounds += 1;
    else idleRounds = 0;
    if (idleRounds >= 3) break;
    previousCount = count;
    await feed.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await sleep(900);
  }

  return page.evaluate(() => {
    const tidy = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const seen = new Set();
    return Array.from(document.querySelectorAll('div[role="article"]'))
      .map((card) => {
        const link = card.querySelector('a[href*="/maps/place/"]');
        if (!link) return null;
        const name = tidy(link.getAttribute('aria-label') || link.innerText);
        const href = link.href;
        if (!name || !href || seen.has(href)) return null;
        seen.add(href);
        return { name, href, text: card.innerText || '' };
      })
      .filter(Boolean);
  });
}

async function readDetails(page, card) {
  await page.goto(card.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('[data-item-id="address"]', { timeout: 6000 }).catch(() => {});
  await sleep(300);

  return page.evaluate(() => {
    const tidy = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const website = document.querySelector('a[data-item-id="authority"]');
    const phone = document.querySelector('[data-item-id^="phone"]');
    const address = document.querySelector('[data-item-id="address"]');
    const websiteHref = website ? tidy(website.getAttribute('href') || website.innerText) : '';
    return {
      website: websiteHref,
      phone: phone ? tidy(phone.getAttribute('aria-label') || phone.innerText) : '',
      address: address ? tidy(address.getAttribute('aria-label') || address.innerText) : '',
      instagram: /instagram\.com/i.test(websiteHref) ? websiteHref : '',
    };
  });
}

const makeNote = (lead) => {
  if (lead.hasSite) return 'Site identificado no perfil do Google Maps.';
  if (!lead.whatsapp) return 'Sem site e sem telefone visível no perfil do Google Maps.';
  return 'Sem site no perfil do Google Maps. Telefone visível para abordagem direta.';
};

function normalizeLead(card, details, niche, location) {
  const summary = parseSummary(card.text);
  const ratingInfo = parseRating(card.text);
  const address = details.address || summary.address;
  const place = parseLocation(address, location);
  const phone = parsePhone(details.phone);
  const socialWebsite = /instagram\.com|facebook\.com|linkedin\.com|youtube\.com/i.test(
    details.website,
  );
  const website = socialWebsite ? '' : details.website;
  const hasSite = Boolean(website);
  const instagramUrl = details.instagram || (socialWebsite ? details.website : '');
  const id = `${slug(card.name)}-${crypto
    .createHash('sha1')
    .update(card.href)
    .digest('hex')
    .slice(0, 8)}`;

  const score =
    (hasSite ? 0 : 2) +
    (instagramUrl ? 0 : 1) +
    (phone.digits ? 1 : 0) +
    (ratingInfo.reviews >= 100 ? 1 : 0);
  const opportunity = score >= 3 ? 'Alta' : 'Média';

  const lead = {
    id,
    name: card.name,
    category: summary.category,
    niche: clean(`${niche} ${summary.category} ${location}`),
    city: place.city,
    state: place.state,
    neighborhood: place.neighborhood,
    rating: ratingInfo.rating,
    reviews: ratingInfo.reviews,
    hasSite,
    instagram: instagramUrl ? 'active' : 'none',
    instagramHandle: instagramUrl ? clean(instagramUrl.split('?')[0].split('/').pop()) : undefined,
    whatsapp: phone.whatsapp,
    phoneLabel: phone.phoneLabel,
    opportunity,
    newlyOpened: false,
    monthsOpen: 0,
    note: '',
    sourceUrl: card.href,
    website,
  };
  lead.note = makeNote(lead);
  return lead;
}

async function searchGoogleLeads({ niche, location, limit = 24, timeoutMs = 75000 }) {
  const query = clean(`${niche} ${location}`);
  if (!query) throw new Error('Informe nicho ou localização.');

  let browser = null;
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Google Maps demorou para responder. Tente novamente.')),
      timeoutMs,
    );
  });

  const work = (async () => {
    browser = await chromium.launch({
      executablePath: CHROME,
      headless: true,
      args: LAUNCH_ARGS,
    });

    const context = await browser.newContext({
      locale: 'pt-BR',
      viewport: { width: 1024, height: 768 },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    await page.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (['image', 'font', 'media'].includes(type)) return route.abort();
      return route.continue();
    });
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);

    await page.goto(
      `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=pt-BR&gl=br`,
      {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      },
    );

    const consent = page.getByRole('button', { name: /aceitar tudo|accept all/i });
    if (await consent.count()) await consent.first().click().catch(() => {});

    await page.waitForSelector('div[role="article"] a[href*="/maps/place/"]', { timeout: 20000 });
    await sleep(1800);

    const cards = await collectCards(page, limit);
    const leads = [];

    for (const card of cards.slice(0, limit)) {
      const details = await readDetails(page, card);
      leads.push(normalizeLead(card, details, niche, location));
    }

    return {
      leads,
      source: 'google-maps',
      fetchedAt: new Date().toISOString(),
      warning: leads.length === 0 ? 'Google Maps não retornou estabelecimentos para esta busca.' : null,
    };
  })();

  try {
    return await Promise.race([work, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
    if (browser) await browser.close().catch(() => {});
  }
}

module.exports = { searchGoogleLeads };
