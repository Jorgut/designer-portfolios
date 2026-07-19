"use client";

import { useState, useEffect, useMemo } from "react";
import portfolios from "@/data/portfolios.json";

type Portfolio = (typeof portfolios)[number];

const disciplines = ["All", "Architecture", "UX-UI", "Product", "Interior", "Design Engineering"];
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const [selectedDiscipline, setSelectedDiscipline] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const matchesDiscipline = selectedDiscipline === "All" || p.discipline === selectedDiscipline;
      const matchesLetter = !selectedLetter || p.name[0].toUpperCase() === selectedLetter;
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
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
              <span className="text-sm font-medium text-zinc-300 tracking-wide">设计案例库</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">{portfolios.length} portfolios</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6">
          <section className="relative py-24 text-center overflow-hidden">
            <div className="hero-glow bg-violet-600" style={{ top: "-200px", left: "20%" }} />
            <div className="hero-glow bg-pink-600" style={{ top: "-100px", right: "10%", animationDelay: "3s" }} />

            <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="glow-text">设计案例</span>
              <span className="text-zinc-100"> 学习库</span>
            </h1>
            <p className={`text-lg text-zinc-400 max-w-xl mx-auto mb-10 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              收集全球优秀设计师作品集，建筑 · 室内 · UX/UI · 产品 · Design Engineering
            </p>

            <div className={`max-w-md mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索设计师、标签..."
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
                {filteredPortfolios.length} 个案例
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
                <p className="text-zinc-500 text-sm">没有找到匹配的案例</p>
                <button
                  onClick={() => { setSelectedDiscipline("All"); setSelectedLetter(null); setSearchQuery(""); }}
                  className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                >
                  清除筛选
                </button>
              </div>
            )}
          </section>
        </main>

        <footer className="border-t border-white/[0.04] py-12 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs text-zinc-600">
              个人设计案例学习库 · {portfolios.length} 个案例 · 5 个领域
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

function PortfolioCard({ portfolio, index }: { portfolio: Portfolio; index: number }) {
  return (
    <a
      href={portfolio.website}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card block group animate-in"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img 
          src={`https://image.thum.io/get/width/600/height/400/${portfolio.website}`}
          alt={`${portfolio.name} portfolio screenshot`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <div 
          className="absolute inset-0 hidden"
          style={{ background: portfolio.avatar }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-violet-400 transition-colors leading-tight">
            {portfolio.name}
          </h3>
          <svg className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>

        <p className="text-xs text-zinc-500 mb-3">{portfolio.location}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {portfolio.discipline}
          </span>
          {portfolio.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
