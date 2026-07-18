"use client";

import { useState, useEffect } from "react";
import portfolios from "@/data/portfolios.json";

type Portfolio = (typeof portfolios)[0];

const disciplines = ["All", ...new Set(portfolios.map((p) => p.discipline))];
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Home() {
  const [selectedDiscipline, setSelectedDiscipline] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesDiscipline =
      selectedDiscipline === "All" || p.discipline === selectedDiscipline;
    const matchesLetter = !selectedLetter || p.name[0].toUpperCase() === selectedLetter;
    return matchesDiscipline && matchesLetter;
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            设计案例学习库
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDiscipline(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDiscipline === d
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                !selectedLetter
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              All
            </button>
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLetter(l)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  selectedLetter === l
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>

        {filteredPortfolios.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            没有找到匹配的案例
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-zinc-500">
          个人设计案例学习库 · {portfolios.length} 个案例
        </div>
      </footer>
    </div>
  );
}

function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <a
      href={portfolio.website}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div
        className="h-32 w-full"
        style={{ background: portfolio.avatar }}
      />

      <div className="p-5">
        <h2 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {portfolio.name}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {portfolio.location}
        </p>

        <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 rounded-full">
          {portfolio.discipline}
        </span>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
          {portfolio.bio}
        </p>

        <div className="mt-4 flex flex-wrap gap-1">
          {portfolio.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-zinc-50 dark:bg-zinc-700/50 rounded text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
