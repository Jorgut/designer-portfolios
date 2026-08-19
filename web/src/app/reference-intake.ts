export const DISCIPLINES = [
  "Architecture",
  "UX-UI",
  "Product",
  "Interior",
  "Design Engineering",
] as const;

export type DisciplineValue = (typeof DISCIPLINES)[number];

export type MainPortfolio = {
  name: string;
  website: string;
  discipline: string;
};

export type EidosCandidate = {
  title: string;
  url: string;
  host: string;
  sourceGroup: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  refcaseCategory: string;
};

export type DeveloperPortfolioCandidate = {
  name: string;
  slug: string;
  website: string;
  host: string;
  note: string;
  source: string;
  sourceUrl: string;
  refcaseCategory: string;
};

export type DuplicateMatch = {
  kind: "main";
  name: string;
  website: string;
  discipline: DisciplineValue;
};

export type EnrichedEidosCandidate = EidosCandidate & {
  discipline: DisciplineValue;
  canonicalKey: string;
  duplicateOfMain: DuplicateMatch | null;
};

export type EnrichedDeveloperPortfolioCandidate = DeveloperPortfolioCandidate & {
  discipline: DisciplineValue;
  canonicalKey: string;
  duplicateOfMain: DuplicateMatch | null;
};

const ARCHITECTURE_HINTS = [
  "architecture",
  "architect",
  "building",
  "urban",
  "masterplan",
  "spatial",
  "space planning",
  "residential architecture",
  "villa",
  "pavilion",
];

const INTERIOR_HINTS = [
  "interior",
  "interiors",
  "interior design",
  "space planning",
  "hospitality",
  "workplace",
  "residential interiors",
  "furniture",
  "lighting",
  "material palette",
  "room",
  "apartment",
  "home",
];

const PRODUCT_HINTS = [
  "product design",
  "product designer",
  "product manager",
  "industrial design",
  "consumer product",
  "physical product",
  "device",
  "hardware",
  "commerce",
  "e-commerce",
  "checkout",
  "startup",
  "saas",
];

const DESIGN_ENGINEERING_HINTS = [
  "design engineering",
  "frontend",
  "front-end",
  "full stack",
  "software engineer",
  "web developer",
  "developer",
  "engineer",
  "react",
  "next.js",
  "javascript",
  "typescript",
  "html",
  "css",
  "design system",
  "design systems",
  "creative coding",
  "open source",
  "github",
  "tool",
  "component",
  "components",
  "interactive",
  "motion",
  "animation",
  "webgl",
  "three.js",
  "documentation",
  "docs",
  "system",
  "cli",
  "game",
  "3d",
  "code",
];

const UX_UI_HINTS = [
  "ux",
  "ui",
  "user experience",
  "interaction design",
  "interface design",
  "case study",
  "case studies",
  "portfolio",
  "selected work",
  "selected works",
  "visual",
  "layout",
  "typography",
  "branding",
  "website",
  "web design",
  "prototype",
  "wireframe",
  "research",
  "editorial",
  "magazine",
];

function normalizeText(...parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function countMatches(text: string, hints: string[]) {
  return hints.reduce((count, hint) => count + (text.includes(hint) ? 1 : 0), 0);
}

function canonicalKey(input: string) {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    let path = url.pathname.replace(/\/+$/, "");
    if (!path) path = "/";
    return `${host}${path}`.toLowerCase();
  } catch {
    return "";
  }
}

function inferDisciplineFromText(text: string): DisciplineValue {
  if (countMatches(text, INTERIOR_HINTS) > 0) return "Interior";
  if (countMatches(text, ARCHITECTURE_HINTS) > 0) return "Architecture";
  if (countMatches(text, PRODUCT_HINTS) > 0) return "Product";
  if (countMatches(text, DESIGN_ENGINEERING_HINTS) > 0) return "Design Engineering";
  if (countMatches(text, UX_UI_HINTS) > 0) return "UX-UI";
  return "UX-UI";
}

function buildCounts() {
  return {
    Architecture: 0,
    "UX-UI": 0,
    Product: 0,
    Interior: 0,
    "Design Engineering": 0,
  } satisfies Record<DisciplineValue, number>;
}

function countByDiscipline<T extends { discipline: DisciplineValue }>(items: T[]) {
  const counts = buildCounts();
  for (const item of items) {
    counts[item.discipline] += 1;
  }
  return counts;
}

export function inferEidosDiscipline(candidate: EidosCandidate): DisciplineValue {
  return inferDisciplineFromText(
    normalizeText(candidate.title, candidate.url, candidate.host, candidate.sourceGroup, candidate.refcaseCategory, ...(candidate.tags || []))
  );
}

export function inferDeveloperDiscipline(candidate: DeveloperPortfolioCandidate): DisciplineValue {
  return inferDisciplineFromText(normalizeText(candidate.name, candidate.website, candidate.host, candidate.note, candidate.refcaseCategory));
}

function enrichEidosCandidates(candidates: EidosCandidate[], mainByCanonicalKey: Map<string, MainPortfolio>) {
  const seen = new Map<string, number>();
  const items: EnrichedEidosCandidate[] = candidates.map((candidate) => {
    const key = canonicalKey(candidate.url);
    seen.set(key, (seen.get(key) || 0) + 1);
    const main = mainByCanonicalKey.get(key);
    return {
      ...candidate,
      discipline: inferEidosDiscipline(candidate),
      canonicalKey: key,
      duplicateOfMain: main
        ? {
            kind: "main",
            name: main.name,
            website: main.website,
            discipline: normalizeDiscipline(main.discipline),
          }
        : null,
    };
  });

  return {
    items,
    countsByDiscipline: countByDiscipline(items),
    mainDuplicates: items.filter((item) => item.duplicateOfMain),
    internalDuplicateCount: [...seen.values()].reduce((count, value) => count + (value > 1 ? value - 1 : 0), 0),
  };
}

function enrichDeveloperCandidates(
  candidates: DeveloperPortfolioCandidate[],
  mainByCanonicalKey: Map<string, MainPortfolio>
) {
  const seen = new Map<string, number>();
  const items: EnrichedDeveloperPortfolioCandidate[] = candidates.map((candidate) => {
    const key = canonicalKey(candidate.website);
    seen.set(key, (seen.get(key) || 0) + 1);
    const main = mainByCanonicalKey.get(key);
    return {
      ...candidate,
      discipline: inferDeveloperDiscipline(candidate),
      canonicalKey: key,
      duplicateOfMain: main
        ? {
            kind: "main",
            name: main.name,
            website: main.website,
            discipline: normalizeDiscipline(main.discipline),
          }
        : null,
    };
  });

  return {
    items,
    countsByDiscipline: countByDiscipline(items),
    mainDuplicates: items.filter((item) => item.duplicateOfMain),
    internalDuplicateCount: [...seen.values()].reduce((count, value) => count + (value > 1 ? value - 1 : 0), 0),
  };
}

export function analyzeReferenceIntake(options: {
  portfolios: MainPortfolio[];
  eidosCandidates: EidosCandidate[];
  developerPortfoliosCandidates: DeveloperPortfolioCandidate[];
}) {
  const mainByCanonicalKey = new Map<string, MainPortfolio>();
  for (const portfolio of options.portfolios) {
    mainByCanonicalKey.set(canonicalKey(portfolio.website), portfolio);
  }

  const eidos = enrichEidosCandidates(options.eidosCandidates, mainByCanonicalKey);
  const developer = enrichDeveloperCandidates(options.developerPortfoliosCandidates, mainByCanonicalKey);

  const eidosKeySet = new Set(eidos.items.map((item) => item.canonicalKey));
  const developerKeySet = new Set(developer.items.map((item) => item.canonicalKey));
  const crossPoolKeys = [...eidosKeySet].filter((key) => key && developerKeySet.has(key));

  return {
    eidos,
    developer,
    crossPool: {
      count: crossPoolKeys.length,
      keys: crossPoolKeys,
    },
  };
}

function normalizeDiscipline(value: string): DisciplineValue {
  return DISCIPLINES.includes(value as DisciplineValue) ? (value as DisciplineValue) : "UX-UI";
}
