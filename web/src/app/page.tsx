"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import portfolios from "@/data/portfolios.json";

type Portfolio = (typeof portfolios)[number];
type Lang = "zh" | "en";

const translations = {
  zh: {
    siteTitle: "设计案例库",
    heroTitle1: "设计案例",
    heroTitle2: "学习库",
    subtitle: "收集全球优秀设计师作品集，建筑 · 室内 · UX/UI · 产品 · Design Engineering",
    searchPlaceholder: "搜索设计师、标签...",
    portfolios: "portfolios",
    cases: "个案例",
    emptyState: "没有找到匹配的案例",
    clearFilter: "清除筛选",
    footer: "个人设计案例学习库",
    casesCount: "个案例",
    disciplines: "个领域",
  },
  en: {
    siteTitle: "Design Case Studies",
    heroTitle1: "Design Case",
    heroTitle2: "Studies",
    subtitle: "Curating exceptional designer portfolios worldwide — Architecture · Interior · UX/UI · Product · Design Engineering",
    searchPlaceholder: "Search designers, tags...",
    portfolios: "portfolios",
    cases: "portfolios",
    emptyState: "No matching portfolios found",
    clearFilter: "Clear filters",
    footer: "Personal Design Case Study Library",
    casesCount: "portfolios",
    disciplines: "disciplines",
  },
};

const disciplines = ["All", "Architecture", "UX-UI", "Product", "Interior", "Design Engineering"];
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const disciplineColors: Record<string, { border: string; badge: string }> = {
  "Architecture":       { border: "#3b82f6", badge: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  "UX-UI":              { border: "#ec4899", badge: "bg-pink-500/15 text-pink-400 border-pink-500/25" },
  "Product":            { border: "#f59e0b", badge: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  "Interior":           { border: "#10b981", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  "Design Engineering": { border: "#8b5cf6", badge: "bg-violet-500/15 text-violet-400 border-violet-500/25" },
};

export default function Home() {
  const [selectedDiscipline, setSelectedDiscipline] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "zh" || saved === "en") setLang(saved);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    localStorage.setItem("lang", next);
  }, [lang]);

  const t = translations[lang];

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const matchesDiscipline = selectedDiscipline === "All" || p.discipline === selectedDiscipline;
      const matchesLetter = !selectedLetter || p.name[0].toUpperCase() === selectedLetter;
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDiscipline && matchesLetter && matchesSearch;
    });
  }, [selectedDiscipline, selectedLetter, searchQuery]);

  const disciplineCounts = useMemo(() => {
    const counts: Record<string, number> = { All: portfolios.length };
    portfolios.forEach(p => {
      counts[p.discipline] = (counts[p.discipline] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <>
      <div className="mesh-gradient" />
      <div className="noise-overlay" />

      <div className="relative z-10 min-h-screen">
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#050510]/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                D
              </div>
              <span className="text-sm font-medium text-zinc-300 tracking-wide">{t.siteTitle}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">{portfolios.length} {t.portfolios}</span>
              <a
                href="https://github.com/Jorgut/designer-portfolios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <button
                onClick={toggleLang}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded border border-white/[0.08] hover:border-white/[0.15] cursor-pointer"
              >
                {lang === "zh" ? "EN" : "中文"}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6">
          <section className="relative py-24 text-center overflow-hidden">
            <div className="hero-glow bg-violet-600" style={{ top: "-200px", left: "20%" }} />
            <div className="hero-glow bg-pink-600" style={{ top: "-100px", right: "10%", animationDelay: "3s" }} />

            <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="glow-text">{t.heroTitle1}</span>
              <span className="text-zinc-100"> {t.heroTitle2}</span>
            </h1>
            <p className={`text-lg text-zinc-400 max-w-xl mx-auto mb-10 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {t.subtitle}
            </p>

            <div className={`max-w-md mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {disciplines.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDiscipline(d)}
                  className={`glass-pill px-4 py-2 text-sm font-medium cursor-pointer ${selectedDiscipline === d ? 'active' : 'text-zinc-400'}`}
                >
                  {d}
                  <span className="ml-1.5 text-xs opacity-50">{disciplineCounts[d] || 0}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <div className="flex flex-wrap gap-1 justify-center">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`letter-btn ${!selectedLetter ? 'active' : ''}`}
              >
                All
              </button>
              {letters.map((l) => {
                const hasPortfolios = portfolios.some(p => p.name[0].toUpperCase() === l);
                return (
                  <button
                    key={l}
                    onClick={() => setSelectedLetter(l)}
                    className={`letter-btn ${selectedLetter === l ? 'active' : ''} ${!hasPortfolios ? 'opacity-20 cursor-default' : ''}`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="section-divider" />

          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500">
                {filteredPortfolios.length} {t.cases}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPortfolios.map((portfolio, index) => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} index={index} />
              ))}
            </div>

            {filteredPortfolios.length === 0 && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4 opacity-30">∅</div>
                <p className="text-zinc-500 text-sm">{t.emptyState}</p>
                <button
                  onClick={() => { setSelectedDiscipline("All"); setSelectedLetter(null); setSearchQuery(""); }}
                  className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                >
                  {t.clearFilter}
                </button>
              </div>
            )}
          </section>
        </main>

        <footer className="border-t border-white/[0.04] py-12 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs text-zinc-600">
              {t.footer} · {portfolios.length} {t.casesCount} · 5 {t.disciplines}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

function PortfolioCard({ portfolio, index }: { portfolio: Portfolio; index: number }) {
  const colors = disciplineColors[portfolio.discipline] || disciplineColors["Design Engineering"];

  return (
    <a
      href={portfolio.website}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card block group animate-in"
      style={{
        animationDelay: `${Math.min(index * 60, 360)}ms`,
        borderTop: `2px solid ${colors.border}`,
      }}
    >
      <div className="relative h-64 w-full overflow-hidden rounded-t-[11px]">
        <img
          src={`https://image.thum.io/get/width/800/height/600/${portfolio.website}`}
          alt={`${portfolio.name} portfolio screenshot`}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent opacity-80 pointer-events-none" />
        <div
          className="absolute inset-0 hidden"
          style={{ background: portfolio.avatar }}
        />
      </div>

      <div className="p-5 pt-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors leading-tight">
            {portfolio.name}
          </h3>
          <svg className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>

        <p className="text-xs text-zinc-500 mb-3">{portfolio.location}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${colors.badge}`}>
            {portfolio.discipline}
          </span>
          {portfolio.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ★
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
          {portfolio.bio}
        </p>

        <div className="flex flex-wrap gap-1.5">
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
