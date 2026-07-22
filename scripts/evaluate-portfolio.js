const { URL } = require('node:url');

const DISCIPLINES = [
  'Architecture',
  'UX-UI',
  'Product',
  'Interior',
  'Design Engineering',
];

const PERSONAL_NEGATIVE_PATTERNS = [
  /\bagency\b/i,
  /\bstudio\b/i,
  /\bteam\b/i,
  /\bcollective\b/i,
  /\bpartners\b/i,
  /\bassociates\b/i,
  /\bfirm\b/i,
  /\bcompany\b/i,
  /\bour services\b/i,
  /\bcontact us\b/i,
  /\bwe are\b/i,
  /\bour work\b/i,
];

const PERSONAL_POSITIVE_PATTERNS = [
  /\bi am\b/i,
  /\bmy work\b/i,
  /\babout me\b/i,
  /\bdesigner\b/i,
  /\bportfolio\b/i,
  /\bcase stud/i,
  /\bresume\b/i,
  /\bselected work\b/i,
];

const DISCIPLINE_KEYWORDS = {
  'Design Engineering': [
    'design engineering',
    'frontend',
    'front-end',
    'design systems',
    'react',
    'code',
    'developer',
    'creative coding',
    'interaction engineer',
  ],
  'UX-UI': [
    'ux',
    'ui',
    'product designer',
    'interaction designer',
    'user experience',
    'interface design',
    'prototype',
    'wireframe',
  ],
  Product: [
    'product design',
    'industrial design',
    'furniture',
    'consumer product',
    'physical product',
    'cmf',
    'prototype',
  ],
  Architecture: [
    'architecture',
    'architect',
    'urban design',
    'residential',
    'commercial',
    'masterplan',
    'building',
  ],
  Interior: [
    'interior',
    'landscape',
    'space planning',
    'hospitality',
    'residential interiors',
    'workplace design',
  ],
};

const QUALITY_SIGNALS = [
  { pattern: /\bcase stud/i, points: 20, note: 'case studies present' },
  { pattern: /\bselected work\b/i, points: 8, note: 'selected works section' },
  { pattern: /\baward/i, points: 10, note: 'awards mentioned' },
  { pattern: /\bawwwards\b/i, points: 12, note: 'Awwwards mention' },
  { pattern: /\bsiteinspire\b/i, points: 8, note: 'Siteinspire mention' },
  { pattern: /\bcss design awards\b/i, points: 8, note: 'CSS Design Awards mention' },
  { pattern: /\bprocess\b/i, points: 8, note: 'process explained' },
  { pattern: /\bprototype\b/i, points: 6, note: 'prototype/process artifacts' },
  { pattern: /\bfigma\b/i, points: 4, note: 'tooling detail' },
  { pattern: /\bstoryboard\b|\bjourney\b|\bresearch\b/i, points: 6, note: 'research/process language' },
  { pattern: /\bfeatured\b|\bwinner\b|\bsotd\b|\bnominee\b/i, points: 10, note: 'recognition indicators' },
  { pattern: /\babout\b/i, points: 4, note: 'about section available' },
  { pattern: /\bcontact\b/i, points: 4, note: 'contact section available' },
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(input) {
  try {
    const url = new URL(input);
    url.hash = '';
    if (url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1) || '/';
    }
    return url.toString();
  } catch {
    return input;
  }
}

async function fetchPage(url, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(url, {
    headers: {
      'user-agent': 'designer-portfolios-discovery/1.0 (+https://github.com/Jorgut/designer-portfolios)',
      accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.text();
}

function guessDiscipline(text) {
  const haystack = text.toLowerCase();
  let bestDiscipline = 'UX-UI';
  let bestScore = -1;

  for (const [discipline, keywords] of Object.entries(DISCIPLINE_KEYWORDS)) {
    const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestDiscipline = discipline;
    }
  }

  return DISCIPLINES.includes(bestDiscipline) ? bestDiscipline : 'UX-UI';
}

function detectName(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  const candidates = [
    titleMatch ? stripTags(titleMatch[1]) : null,
    ogMatch ? stripTags(ogMatch[1]) : null,
    h1Match ? stripTags(h1Match[1]) : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const cleaned = candidate
      .split('|')[0]
      .split('—')[0]
      .split('-')[0]
      .trim();

    if (cleaned.length >= 3 && cleaned.length <= 80) {
      return cleaned;
    }
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function evaluatePersonalSite(text, name) {
  let score = 0;

  for (const pattern of PERSONAL_POSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      score += 1;
    }
  }

  for (const pattern of PERSONAL_NEGATIVE_PATTERNS) {
    if (pattern.test(text)) {
      score -= 2;
    }
  }

  if (/\s/.test(name) && !/[&+]/.test(name)) {
    score += 1;
  }

  return score > 0;
}

function scoreQuality(text, source) {
  let score = 35;
  const notes = [];

  for (const signal of QUALITY_SIGNALS) {
    if (signal.pattern.test(text)) {
      score += signal.points;
      notes.push(signal.note);
    }
  }

  if (source === 'awwwards') {
    score += 10;
    notes.push('featured on Awwwards');
  }
  if (source === 'siteinspire') {
    score += 8;
    notes.push('featured on Siteinspire');
  }
  if (source === 'css-design-awards') {
    score += 8;
    notes.push('featured on CSS Design Awards');
  }

  return {
    qualityScore: Math.max(0, Math.min(100, score)),
    notes,
  };
}

async function evaluatePortfolio(url, options = {}) {
  const source = options.source || 'unknown';
  const html = options.html || (await fetchPage(url, options.fetchImpl));
  const text = stripTags(html);
  const normalizedUrl = normalizeUrl(url);
  const name = detectName(html, normalizedUrl);
  const discipline = guessDiscipline(`${name} ${text}`);
  const isPersonalPortfolio = evaluatePersonalSite(text, name);
  const { qualityScore, notes } = scoreQuality(text, source);
  const finalNotes = [...notes];

  if (!isPersonalPortfolio) {
    finalNotes.push('appears to be an agency or studio');
  }

  return {
    name,
    website: normalizedUrl,
    discipline,
    qualityScore,
    source,
    isPersonalPortfolio,
    notes: finalNotes.join(', '),
  };
}

module.exports = {
  DISCIPLINES,
  evaluatePortfolio,
  fetchPage,
  normalizeUrl,
  stripTags,
};

if (require.main === module) {
  const [, , inputUrl] = process.argv;

  if (!inputUrl) {
    console.error('Usage: node scripts/evaluate-portfolio.js <url>');
    process.exit(1);
  }

  evaluatePortfolio(inputUrl)
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      console.error(`Failed to evaluate portfolio: ${error.message}`);
      process.exit(1);
    });
}
