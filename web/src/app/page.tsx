"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import portfolios from "@/data/portfolios.json";
import eidosReferences from "@/data/eidos-references.json";
import developerPortfoliosReferences from "@/data/developer-portfolios-references.json";
import {
  analyzeReferenceIntake,
  type DisciplineValue,
  type EnrichedDeveloperPortfolioCandidate,
  type EnrichedEidosCandidate,
} from "./reference-intake";

type Portfolio = (typeof portfolios)[number];
type Lang = "zh" | "en";
type FilterValue = "All" | DisciplineValue;

const translations = {
  zh: {
    siteTitle: "Refcases",
    heroKicker: "Designer portfolios case library",
    heroTitle1: "设计师",
    heroTitle2: "作品集案例库",
    subtitle: "只收高质量设计师个人网站，聚焦版式、交互、信息结构和视觉语言的拆解。",
    searchPlaceholder: "搜索设计师、标签、风格...",
    portfolios: "portfolios",
    cases: "个案例",
    emptyState: "没有找到匹配的案例",
    clearFilter: "清除筛选",
    footer: "设计师作品集案例库",
    casesCount: "个案例",
    disciplines: "个领域",
    featured: "精选",
    lenses: "观察维度",
    eidosTitle: "EIDOS 全量来源库",
    eidosSubtitle: "EIDOS 的公开条目已全量导入，并按 Refcases 的五个领域重新归类；进入主库前仍要人工拆解。",
    eidosSource: "来源",
    developerTitle: "Developer Portfolios 全量来源库",
    developerSubtitle: "GitHub developer-portfolios 的网站已全量导入，统一映射到 Refcases 分类，并标出已被主库收录的重复项。",
    developerSource: "来源",
    duplicateOfMain: "已在主库",
    duplicatesSummary: "重复检测",
    internalDuplicates: "内部重复",
    crossPoolDuplicates: "跨来源重复",
  },
  en: {
    siteTitle: "Refcases",
    heroKicker: "Designer portfolios case library",
    heroTitle1: "Designer",
    heroTitle2: "Portfolios",
    subtitle: "A curated library of designer portfolios with visual, interaction, and information-structure analysis.",
    searchPlaceholder: "Search designers, tags, styles...",
    portfolios: "portfolios",
    cases: "portfolios",
    emptyState: "No matching portfolios found",
    clearFilter: "Clear filters",
    footer: "Designer portfolios case library",
    casesCount: "portfolios",
    disciplines: "disciplines",
    featured: "featured",
    lenses: "lenses",
    eidosTitle: "EIDOS Full Source Library",
    eidosSubtitle: "All public EIDOS entries are imported and reclassified into the five Refcases disciplines. They still need manual analysis before entering the main library.",
    eidosSource: "Source",
    developerTitle: "Developer Portfolios Full Source Library",
    developerSubtitle: "All developer-portfolios websites are imported, mapped into the Refcases taxonomy, and checked against the main library.",
    developerSource: "Source",
    duplicateOfMain: "Already in main library",
    duplicatesSummary: "Duplicate check",
    internalDuplicates: "internal duplicates",
    crossPoolDuplicates: "cross-source duplicates",
  },
};

const disciplineFilters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "All" },
  { label: "Architecture", value: "Architecture" },
  { label: "Interior", value: "Interior" },
  { label: "UX/UI", value: "UX-UI" },
  { label: "Product", value: "Product" },
  { label: "Design Engineering", value: "Design Engineering" },
];

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const lensCards = [
  {
    title: "Visual language",
    text: "Typography, spacing, rhythm, color, and page-level hierarchy.",
  },
  {
    title: "Interaction",
    text: "Motion, hover states, navigation, scroll behavior, and feedback.",
  },
  {
    title: "Information structure",
    text: "Case-study sequencing, page organization, and content density.",
  },
];

const disciplineColors: Record<string, { border: string; glow: string; badge: string; focus: string }> = {
  Architecture: {
    border: "#38bdf8",
    glow: "rgba(56,189,248,0.45)",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    focus: "Editorial grid, spatial hierarchy, and image pacing.",
  },
  "UX-UI": {
    border: "#f59e0b",
    glow: "rgba(245,158,11,0.45)",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    focus: "Case-study storytelling, flow clarity, and navigation logic.",
  },
  Product: {
    border: "#14b8a6",
    glow: "rgba(20,184,166,0.45)",
    badge: "bg-teal-500/15 text-teal-300 border-teal-500/25",
    focus: "Problem framing, sequencing, and product-level clarity.",
  },
  Interior: {
    border: "#10b981",
    glow: "rgba(16,185,129,0.45)",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    focus: "Image pairing, spacing systems, and atmospheric presentation.",
  },
  "Design Engineering": {
    border: "#a78bfa",
    glow: "rgba(167,139,250,0.45)",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    focus: "Design systems, front-end precision, and accessibility.",
  },
};

export default function Home() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<FilterValue>("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<Lang>("zh");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
  }, [lang]);

  const t = translations[lang];

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const matchesDiscipline = selectedDiscipline === "All" || p.discipline === selectedDiscipline;
      const matchesLetter = !selectedLetter || p.name[0].toUpperCase() === selectedLetter;
      const haystack = `${p.name} ${p.bio} ${p.tags.join(" ")}`.toLowerCase();
      const matchesSearch = !searchQuery || haystack.includes(searchQuery.toLowerCase());
      return matchesDiscipline && matchesLetter && matchesSearch;
    });
  }, [selectedDiscipline, selectedLetter, searchQuery]);

  const disciplineCounts = useMemo(() => {
    const counts: Record<string, number> = { All: portfolios.length };
    portfolios.forEach((p) => {
      counts[p.discipline] = (counts[p.discipline] || 0) + 1;
    });
    return counts;
  }, []);

  const featuredCount = useMemo(() => portfolios.filter((p) => p.featured).length, []);
  const intakeAnalysis = useMemo(
    () =>
      analyzeReferenceIntake({
        portfolios,
        eidosCandidates: eidosReferences,
        developerPortfoliosCandidates: developerPortfoliosReferences,
      }),
    []
  );
  const filteredEidosCandidates = useMemo(() => {
    return intakeAnalysis.eidos.items.filter((candidate) => {
      return selectedDiscipline === "All" || candidate.discipline === selectedDiscipline;
    });
  }, [intakeAnalysis, selectedDiscipline]);
  const filteredDeveloperCandidates = useMemo(() => {
    return intakeAnalysis.developer.items.filter((candidate) => {
      return selectedDiscipline === "All" || candidate.discipline === selectedDiscipline;
    });
  }, [intakeAnalysis, selectedDiscipline]);

  return (
    <>
      <div className="mesh-gradient" />
      <div className="noise-overlay" />
      <div className="stars-layer" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
      <div className="particle-field" />
      <div className="particle-drift" style={{ transform: `translateY(${scrollY * -0.04}px)` }} />
      <div className="aura-grid" />

      <div className="relative z-10 min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#03030a]/72 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="logo-mark flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-teal-400 to-amber-300 text-sm font-bold text-white shadow-lg shadow-sky-500/20">
                R
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-zinc-100">{t.siteTitle}</div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{t.heroKicker}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">
                {portfolios.length} {t.portfolios}
              </span>
              <a
                href="https://github.com/Jorgut/designer-portfolios"
                target="_blank"
                rel="noopener noreferrer"
                className="github-link text-zinc-500 transition-all hover:text-zinc-200"
                title="GitHub"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <button
                onClick={toggleLang}
                className="lang-btn cursor-pointer rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-all hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-zinc-200"
              >
                {lang === "zh" ? "EN" : "中文"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6">
          <section className="pt-36 pb-12 lg:pt-40">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="translate-y-0 opacity-100 transition-all duration-[1200ms]">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                  {t.heroKicker}
                </div>
                <h1 className="mt-7 text-5xl font-semibold tracking-tight text-white md:text-7xl lg:text-8xl">
                  <span className="block text-zinc-400">{t.heroTitle1}</span>
                  <span className="block glow-text">{t.heroTitle2}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                  {t.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <StatPill label={t.portfolios} value={portfolios.length.toString()} />
                  <StatPill label={t.disciplines} value="5" />
                  <StatPill label={t.featured} value={featuredCount.toString()} />
                </div>
              </div>

              <div className="grid gap-3">
                {lensCards.map((lens, index) => (
                  <div
                    key={lens.title}
                    className="translate-y-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 opacity-100 backdrop-blur-xl transition-all duration-500"
                    style={{ transitionDelay: `${140 + index * 90}ms` }}
                  >
                    <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">{t.lenses}</div>
                    <div className="mt-2 text-lg font-medium text-zinc-100">{lens.title}</div>
                    <div className="mt-2 text-sm leading-6 text-zinc-400">{lens.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 max-w-2xl translate-y-0 opacity-100 transition-all delay-300 duration-1000">
              <div className="search-container group relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 via-teal-500 to-amber-400 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20 group-focus-within:opacity-30" />
                <div className="relative flex items-center">
                  <svg className="absolute left-5 h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] py-4 pl-13 pr-6 text-sm text-zinc-200 transition-all duration-300 placeholder:text-zinc-500 focus:bg-white/[0.08] focus:outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {disciplineFilters.map((filter, index) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedDiscipline(filter.value)}
                  className={`glass-pill cursor-pointer px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    selectedDiscipline === filter.value
                      ? "active border-white/20 bg-white/10 text-white shadow-lg shadow-white/5"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {filter.label}
                  <span className="ml-2 text-xs opacity-60">{disciplineCounts[filter.value] || 0}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="flex flex-wrap justify-center gap-1.5">
              <button onClick={() => setSelectedLetter(null)} className={`letter-btn ${!selectedLetter ? "active" : ""}`}>
                All
              </button>
              {letters.map((letter) => {
                const hasPortfolios = portfolios.some((p) => p.name[0].toUpperCase() === letter);
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`letter-btn ${selectedLetter === letter ? "active" : ""} ${!hasPortfolios ? "cursor-default opacity-20" : ""}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="section-divider" />

          <section className="py-12">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {filteredPortfolios.length} {t.cases}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPortfolios.map((portfolio, index) => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} index={index} />
              ))}
            </div>

            {filteredPortfolios.length === 0 && (
              <div className="py-24 text-center">
                <div className="mb-6 text-6xl opacity-20">∅</div>
                <p className="text-lg text-zinc-500">{t.emptyState}</p>
                <button
                  onClick={() => {
                    setSelectedDiscipline("All");
                    setSelectedLetter(null);
                    setSearchQuery("");
                  }}
                  className="mt-6 cursor-pointer text-sm text-sky-300 underline underline-offset-4 transition-colors hover:text-sky-200"
                >
                  {t.clearFilter}
                </button>
              </div>
            )}
          </section>

          <section className="py-12">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Reference intake</p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-100">{t.eidosTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{t.eidosSubtitle}</p>
              </div>
              <div className="text-sm text-zinc-500">
                {filteredEidosCandidates.length} shown · {eidosReferences.length} total
              </div>
            </div>
            <IntakeSummary
              counts={intakeAnalysis.eidos.countsByDiscipline}
              duplicateCount={intakeAnalysis.eidos.mainDuplicates.length}
              internalDuplicateCount={intakeAnalysis.eidos.internalDuplicateCount}
              crossPoolDuplicateCount={intakeAnalysis.crossPool.count}
              labels={t}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEidosCandidates.map((candidate, index) => (
                <EidosCandidateCard
                  key={`${candidate.url}-${candidate.title}-${index}`}
                  candidate={candidate}
                  sourceLabel={t.eidosSource}
                  duplicateLabel={t.duplicateOfMain}
                />
              ))}
            </div>
          </section>

          <section className="py-12">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Reference intake</p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-100">{t.developerTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{t.developerSubtitle}</p>
              </div>
              <div className="text-sm text-zinc-500">
                {filteredDeveloperCandidates.length} shown · {developerPortfoliosReferences.length} total
              </div>
            </div>
            <IntakeSummary
              counts={intakeAnalysis.developer.countsByDiscipline}
              duplicateCount={intakeAnalysis.developer.mainDuplicates.length}
              internalDuplicateCount={intakeAnalysis.developer.internalDuplicateCount}
              crossPoolDuplicateCount={intakeAnalysis.crossPool.count}
              labels={t}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDeveloperCandidates.map((candidate, index) => (
                <DeveloperPortfolioCandidateCard
                  key={`${candidate.website}-${candidate.name}-${index}`}
                  candidate={candidate}
                  sourceLabel={t.developerSource}
                  duplicateLabel={t.duplicateOfMain}
                />
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-16 border-t border-white/[0.06] py-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-xs text-zinc-600">
              {t.footer} · {portfolios.length} {t.casesCount} · 5 {t.disciplines}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

function IntakeSummary({
  counts,
  duplicateCount,
  internalDuplicateCount,
  crossPoolDuplicateCount,
  labels,
}: {
  counts: Record<DisciplineValue, number>;
  duplicateCount: number;
  internalDuplicateCount: number;
  crossPoolDuplicateCount: number;
  labels: {
    duplicatesSummary: string;
    internalDuplicates: string;
    crossPoolDuplicates: string;
  };
}) {
  return (
    <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex flex-wrap gap-2">
        {disciplineFilters
          .filter((filter): filter is { label: string; value: DisciplineValue } => filter.value !== "All")
          .map((filter) => (
            <span key={filter.value} className="tag">
              {filter.label}: {counts[filter.value]}
            </span>
          ))}
      </div>
      <div className="mt-3 text-xs leading-5 text-zinc-500">
        {labels.duplicatesSummary}: {duplicateCount} main-library duplicates · {internalDuplicateCount} {labels.internalDuplicates} ·{" "}
        {crossPoolDuplicateCount} {labels.crossPoolDuplicates}
      </div>
    </div>
  );
}

function EidosCandidateCard({
  candidate,
  sourceLabel,
  duplicateLabel,
}: {
  candidate: EnrichedEidosCandidate;
  sourceLabel: string;
  duplicateLabel: string;
}) {
  return (
    <a
      href={candidate.url}
      target="_blank"
      rel="noopener noreferrer"
      className="reference-card group block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/30 hover:bg-white/[0.055]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-teal-300/80">{candidate.discipline}</div>
          <h3 className="mt-3 text-base font-semibold leading-snug text-zinc-100 group-hover:text-white">{candidate.title}</h3>
        </div>
        <svg className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>

      <div className="mt-4 text-xs text-zinc-500">{candidate.host}</div>
      {candidate.duplicateOfMain ? (
        <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          {duplicateLabel}: {candidate.duplicateOfMain.name}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="tag">{candidate.refcaseCategory || "Source reference"}</span>
        {candidate.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-3 text-xs text-zinc-600">
        {sourceLabel}: {candidate.source}
      </div>
    </a>
  );
}

function DeveloperPortfolioCandidateCard({
  candidate,
  sourceLabel,
  duplicateLabel,
}: {
  candidate: EnrichedDeveloperPortfolioCandidate;
  sourceLabel: string;
  duplicateLabel: string;
}) {
  return (
    <a
      href={candidate.website}
      target="_blank"
      rel="noopener noreferrer"
      className="reference-card group block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/[0.055]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-sky-300/80">{candidate.discipline}</div>
          <h3 className="mt-3 text-base font-semibold leading-snug text-zinc-100 group-hover:text-white">{candidate.name}</h3>
        </div>
        <svg className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>

      <div className="mt-4 text-xs text-zinc-500">{candidate.host}</div>
      {candidate.duplicateOfMain ? (
        <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          {duplicateLabel}: {candidate.duplicateOfMain.name}
        </div>
      ) : null}
      {candidate.note ? <div className="mt-3 text-sm leading-6 text-zinc-300">{candidate.note}</div> : null}

      <div className="mt-5 border-t border-white/[0.06] pt-3 text-xs text-zinc-600">
        {sourceLabel}: {candidate.source}
      </div>
    </a>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

function PortfolioCard({ portfolio, index }: { portfolio: Portfolio; index: number }) {
  const colors = disciplineColors[portfolio.discipline] || disciplineColors["Design Engineering"];
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -15,
      y: (x - 0.5) * 15,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <a
      ref={cardRef}
      href={portfolio.website}
      target="_blank"
      rel="noopener noreferrer"
      className="portfolio-card block group"
      style={{
        animationDelay: `${Math.min(index * 80, 400)}ms`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="card-glow"
        style={{
          background: `radial-gradient(circle at ${(tilt.y / 15 + 0.5) * 100}% ${(tilt.x / -15 + 0.5) * 100}%, ${colors.glow}, transparent 70%)`,
          opacity: isHovered ? 0.42 : 0,
        }}
      />

      <div className="card-border" style={{ borderColor: isHovered ? colors.border : "rgba(255,255,255,0.08)" }} />

      <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
        <img
          src={`https://image.thum.io/get/width/800/height/600/${portfolio.website}`}
          alt={`${portfolio.name} portfolio screenshot`}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08081a] via-[#08081a]/20 to-transparent opacity-90" />
        <div className="absolute inset-0 hidden" style={{ background: portfolio.avatar }} />

        <div
          className="card-shine"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
            transform: `translateX(${(tilt.y / 15) * 100}%)`,
          }}
        />
      </div>

      <div className="relative p-6 pt-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-zinc-100 transition-colors group-hover:text-white">
            {portfolio.name}
          </h3>
          <svg
            className="mt-1 h-5 w-5 flex-shrink-0 text-zinc-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-sky-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>

        <p className="mb-4 text-xs text-zinc-500">{portfolio.location}</p>

        <div className="mb-4 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-[11px] font-semibold ${colors.badge}`}>
            {portfolio.discipline.replace("UX-UI", "UX/UI")}
          </span>
          {portfolio.featured && (
            <span className="inline-flex items-center rounded-lg border border-amber-500/25 bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-300">
              ★
            </span>
          )}
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-400">{portfolio.bio}</p>

        <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">What to study</div>
          <div className="mt-2 text-sm leading-6 text-zinc-300">{colors.focus}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {portfolio.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
