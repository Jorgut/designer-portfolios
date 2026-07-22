const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { evaluatePortfolio, normalizeUrl } = require('./evaluate-portfolio');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'portfolios.json');
const WEB_DATA_FILE = path.join(ROOT_DIR, 'web', 'src', 'data', 'portfolios.json');
const CANDIDATES_FILE = path.join(ROOT_DIR, 'docs', 'candidates.md');
const RESULT_FILE = path.join(
  process.env.RUNNER_TEMP || os.tmpdir(),
  'designer-portfolios-discovery-result.json'
);
const PR_TEMPLATE_FILE = path.join(
  ROOT_DIR,
  '.github',
  'PULL_REQUEST_TEMPLATE',
  'discover-portfolios.md'
);

const SOURCE_CONFIGS = [
  {
    name: 'awwwards',
    listingUrl: 'https://www.awwwards.com/websites/portfolio/',
    detailPattern: /https:\/\/www\.awwwards\.com\/sites\/[a-z0-9-/%]+/gi,
    externalLinkPatterns: [
      /href=["'](https?:\/\/(?!www\.awwwards\.com)[^"'#]+)["']/gi,
      /data-url=["'](https?:\/\/(?!www\.awwwards\.com)[^"'#]+)["']/gi,
    ],
  },
  {
    name: 'siteinspire',
    listingUrl: 'https://www.siteinspire.com/websites?categories=portfolio',
    detailPattern: /https:\/\/www\.siteinspire\.com\/websites\/[a-z0-9-/%]+/gi,
    externalLinkPatterns: [
      /href=["'](https?:\/\/(?!www\.siteinspire\.com)[^"'#]+)["']/gi,
      /data-website=["'](https?:\/\/(?!www\.siteinspire\.com)[^"'#]+)["']/gi,
    ],
  },
  {
    name: 'css-design-awards',
    listingUrl: 'https://www.cssdesignawards.com/winners/',
    detailPattern: /https:\/\/www\.cssdesignawards\.com\/sites\/[a-z0-9-/%]+/gi,
    externalLinkPatterns: [
      /href=["'](https?:\/\/(?!www\.cssdesignawards\.com)[^"'#]+)["']/gi,
      /data-href=["'](https?:\/\/(?!www\.cssdesignawards\.com)[^"'#]+)["']/gi,
    ],
  },
];

const BLOCKED_HOST_PATTERNS = [
  /facebook\.com$/i,
  /instagram\.com$/i,
  /twitter\.com$/i,
  /x\.com$/i,
  /linkedin\.com$/i,
  /behance\.net$/i,
  /dribbble\.com$/i,
  /pinterest\.com$/i,
  /youtube\.com$/i,
  /vimeo\.com$/i,
  /github\.com$/i,
];

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  return {
    createPr: flags.has('--create-pr'),
    dryRun: flags.has('--dry-run'),
  };
}

function unique(items) {
  return [...new Set(items)];
}

function extractMatches(input, pattern) {
  const results = [];
  let match;
  while ((match = pattern.exec(input)) !== null) {
    results.push(match[1] || match[0]);
  }
  pattern.lastIndex = 0;
  return results;
}

function toAbsoluteUrl(maybeUrl, baseUrl) {
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

function getHostname(input) {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isLikelyPortfolioUrl(input, sourceName) {
  try {
    const url = new URL(input);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === sourceName || hostname.endsWith(`.${sourceName}`)) {
      return false;
    }

    if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
      return false;
    }

    const pathname = url.pathname.toLowerCase();
    if (pathname.endsWith('.jpg') || pathname.endsWith('.png') || pathname.endsWith('.svg')) {
      return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  const response = await fetch(url, {
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

async function loadExistingPortfolios() {
  const [rootJson, webJson] = await Promise.all([
    fs.readFile(DATA_FILE, 'utf8'),
    fs.readFile(WEB_DATA_FILE, 'utf8'),
  ]);

  const rootPortfolios = JSON.parse(rootJson);
  const webPortfolios = JSON.parse(webJson);
  const websites = new Set();

  for (const entry of [...rootPortfolios, ...webPortfolios]) {
    if (entry.website) {
      websites.add(normalizeUrl(entry.website));
    }
  }

  return {
    count: rootPortfolios.length,
    websites,
  };
}

async function discoverSourceCandidates(config, maxDetailPages = 6) {
  const warnings = [];

  try {
    const listingHtml = await fetchHtml(config.listingUrl);
    const detailUrls = unique(extractMatches(listingHtml, config.detailPattern)).slice(0, maxDetailPages);
    const portfolioUrls = [];

    for (const detailUrl of detailUrls) {
      try {
        await sleep(1200);
        const detailHtml = await fetchHtml(detailUrl);
        const rawUrls = config.externalLinkPatterns.flatMap((pattern) => extractMatches(detailHtml, pattern));
        const normalized = rawUrls
          .map((url) => toAbsoluteUrl(url, detailUrl))
          .filter(Boolean)
          .filter((url) => isLikelyPortfolioUrl(url, getHostname(config.listingUrl)));

        if (normalized.length > 0) {
          portfolioUrls.push(normalized[0]);
        }
      } catch (error) {
        warnings.push(`Skipped ${detailUrl}: ${error.message}`);
      }
    }

    return {
      source: config.name,
      urls: unique(portfolioUrls).map((url) => normalizeUrl(url)),
      warnings,
    };
  } catch (error) {
    return {
      source: config.name,
      urls: [],
      warnings: [`Failed to fetch ${config.listingUrl}: ${error.message}`],
    };
  }
}

function summarizeCandidate(candidate) {
  return {
    name: candidate.name,
    website: candidate.website,
    discipline: candidate.discipline,
    qualityScore: candidate.qualityScore,
    source: candidate.source,
    notes: candidate.notes,
  };
}

function buildCandidatesMarkdown(candidates, warnings) {
  const lines = [
    '# Portfolio Discovery Candidates',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  if (candidates.length === 0) {
    lines.push('No new candidates met the quality threshold in this run.');
  } else {
    lines.push('| Name | Website | Discipline | Quality Score | Source | Notes |');
    lines.push('| --- | --- | --- | ---: | --- | --- |');
    for (const candidate of candidates) {
      lines.push(
        `| ${escapePipes(candidate.name)} | ${escapePipes(candidate.website)} | ${candidate.discipline} | ${candidate.qualityScore} | ${candidate.source} | ${escapePipes(candidate.notes)} |`
      );
    }
  }

  if (warnings.length > 0) {
    lines.push('', '## Scrape warnings', '');
    for (const warning of warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function escapePipes(value) {
  return String(value || '').replace(/\|/g, '\\|');
}

async function writeGitHubOutput(entries) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const content = Object.entries(entries)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  await fs.appendFile(process.env.GITHUB_OUTPUT, `${content}\n`, 'utf8');
}

async function runDiscovery() {
  const existing = await loadExistingPortfolios();
  const warnings = [];
  const sources = [];
  const seen = new Set(existing.websites);
  const candidates = [];

  for (const config of SOURCE_CONFIGS) {
    const result = await discoverSourceCandidates(config);
    sources.push({ source: config.name, discovered: result.urls.length });
    warnings.push(...result.warnings);

    for (const url of result.urls) {
      if (seen.has(url)) {
        continue;
      }

      try {
        await sleep(1200);
        const evaluated = await evaluatePortfolio(url, { source: config.name, fetchImpl: fetch });
        seen.add(evaluated.website);

        if (!evaluated.isPersonalPortfolio) {
          warnings.push(`Rejected ${evaluated.website}: appears to be agency/studio work`);
          continue;
        }

        if (evaluated.qualityScore < 60) {
          warnings.push(`Rejected ${evaluated.website}: quality score ${evaluated.qualityScore} below threshold`);
          continue;
        }

        candidates.push(summarizeCandidate(evaluated));
      } catch (error) {
        warnings.push(`Failed to evaluate ${url}: ${error.message}`);
      }
    }
  }

  candidates.sort((left, right) => right.qualityScore - left.qualityScore || left.name.localeCompare(right.name));
  const markdown = buildCandidatesMarkdown(candidates, warnings);
  await fs.writeFile(CANDIDATES_FILE, markdown, 'utf8');

  const branchName = `automation/discover-portfolios-${new Date().toISOString().slice(0, 10)}`;
  const prTitle = candidates.length > 0
    ? `chore: review ${candidates.length} discovered portfolio candidate${candidates.length === 1 ? '' : 's'}`
    : 'chore: discovery run with no new portfolio candidates';

  const result = {
    branchName,
    prTitle,
    candidateCount: candidates.length,
    candidates,
    warnings,
    sources,
    shouldCreatePr: candidates.length > 0,
    existingPortfolioCount: existing.count,
  };

  await fs.writeFile(RESULT_FILE, JSON.stringify(result, null, 2), 'utf8');
  await writeGitHubOutput({
    should_create_pr: result.shouldCreatePr ? 'true' : 'false',
    candidate_count: String(result.candidateCount),
    branch_name: result.branchName,
    candidates_file: CANDIDATES_FILE,
  });

  console.log(`Discovery complete. Existing portfolios: ${existing.count}. New candidates: ${candidates.length}.`);
  if (warnings.length > 0) {
    console.log(`Warnings: ${warnings.length}`);
  }
}

async function buildPrBody(result) {
  const template = await fs.readFile(PR_TEMPLATE_FILE, 'utf8');
  const rows = result.candidates
    .map(
      (candidate) =>
        `| ${escapePipes(candidate.name)} | ${escapePipes(candidate.website)} | ${candidate.discipline} | ${candidate.qualityScore} | ${escapePipes(candidate.notes)} |`
    )
    .join('\n');
  const checklist = result.candidates
    .map((candidate) => `- [ ] ${candidate.name} — approve\n- [ ] ${candidate.name} — reject`)
    .join('\n');
  const warningSection = result.warnings.length > 0
    ? result.warnings.map((warning) => `- ${warning}`).join('\n')
    : '- None';

  return template
    .replace('{{candidate_count}}', String(result.candidateCount))
    .replace('{{generated_at}}', new Date().toISOString())
    .replace('{{candidate_rows}}', rows)
    .replace('{{candidate_checklist}}', checklist)
    .replace('{{warnings}}', warningSection);
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function runGh(args) {
  return execFileSync('gh', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  }).trim();
}

async function createPullRequest({ dryRun }) {
  const raw = await fs.readFile(RESULT_FILE, 'utf8');
  const result = JSON.parse(raw);

  if (!result.shouldCreatePr) {
    console.log('No candidates to submit. Skipping branch and PR creation.');
    return;
  }

  const body = await buildPrBody(result);
  const bodyFile = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'designer-portfolios-pr-body.md');
  await fs.writeFile(bodyFile, body, 'utf8');

  if (dryRun) {
    console.log(`Dry run: would create branch ${result.branchName} and open PR.`);
    return;
  }

  if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required to create a pull request');
  }

  const status = runGit(['status', '--short']);
  const allowedChanges = new Set(['docs/candidates.md']);
  const changedFiles = status
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3));

  if (changedFiles.some((file) => !allowedChanges.has(file))) {
    throw new Error(`Working tree contains unexpected changes: ${changedFiles.join(', ')}`);
  }

  let existingPr = '[]';
  try {
    existingPr = runGh(['pr', 'list', '--head', result.branchName, '--json', 'number,url']);
  } catch {
    existingPr = '[]';
  }

  const parsedExistingPr = JSON.parse(existingPr);
  if (parsedExistingPr.length > 0) {
    console.log(`PR already exists: ${parsedExistingPr[0].url}`);
    return;
  }

  const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  runGit(['checkout', '-b', result.branchName]);
  runGit(['add', 'docs/candidates.md']);

  const stagedDiff = runGit(['diff', '--cached', '--name-only']);
  if (!stagedDiff) {
    console.log('No staged changes after discovery. Skipping PR creation.');
    runGit(['checkout', currentBranch]);
    runGit(['branch', '-D', result.branchName]);
    return;
  }

  runGit(['commit', '-m', result.prTitle]);
  runGit(['push', '--set-upstream', 'origin', result.branchName]);

  const prUrl = runGh([
    'pr',
    'create',
    '--title',
    result.prTitle,
    '--body-file',
    bodyFile,
    '--base',
    'main',
    '--head',
    result.branchName,
  ]);

  console.log(`Created PR: ${prUrl}`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.createPr) {
    await createPullRequest({ dryRun: args.dryRun });
    return;
  }

  await runDiscovery();
}

main().catch((error) => {
  console.error(`Portfolio discovery failed: ${error.message}`);
  process.exit(1);
});
