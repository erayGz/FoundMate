import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listProjects, type Project } from "../api/projects";
import { getApiErrorMessage } from "../api/client";
import { ProjectCard } from "../components/app/ProjectCard";
import { usePageTitle } from "../utils/usePageTitle";

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function DiscoverPage() {
  usePageTitle("Projeleri keşfet");
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const rawQuery = searchParams.get("q") ?? "";
  const requestedCategory = searchParams.get("category") ?? "";
  const query = useDebouncedValue(rawQuery, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProjects({
      search: query.trim() || undefined,
      category: requestedCategory || undefined,
      pageSize: 100,
    })
      .then((response) => {
        if (cancelled) return;
        setProjects(response.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, requestedCategory, reloadToken]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(projects.map((project) => project.category).filter((category): category is string => Boolean(category)))).sort((a, b) => a.localeCompare(b, "tr")),
    [projects],
  );

  const hasActiveFilters = Boolean(rawQuery || requestedCategory);
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key); else next.set(key, value);
    setSearchParams(next, { replace: key === "q" });
  };
  const clearFilters = () => setSearchParams({});

  return <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:py-10">
    <header><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Proje keşfi</p><h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold tracking-[-0.045em]">Somut adım atan projeleri keşfet.</h1><p className="mt-3 max-w-[690px] text-sm leading-6 text-[#687184]">Projeleri incele, filtrelerini URL’de koru ve sana uyan projeye başvur.</p></header>

    <section className="mt-8 rounded-2xl border border-[#e1e2e8] bg-white p-4 sm:p-5" aria-label="Proje filtreleri">
      <div className="flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#344057]"><SlidersHorizontal className="size-4 text-[#6259cf]" />Filtreler</span><button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#5b53c4] transition hover:bg-[#f3f1ff] disabled:cursor-default disabled:opacity-35"><X className="size-3.5" />Filtreleri temizle</button></div>
      <label className="relative mt-4 block"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#8a91a0]" /><span className="sr-only">Projelerde ara</span><input value={rawQuery} onChange={(event) => setFilter("q", event.target.value)} type="search" placeholder="Proje veya açıklamada ara" className="min-h-12 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] pl-11 pr-4 text-sm outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" /></label>

      <div className="mt-5 grid gap-4 border-t border-[#ececf0] pt-5 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[#687184]">Kategori<select value={requestedCategory} onChange={(event) => setFilter("category", event.target.value)} className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#344057] outline-none focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"><option value="">Tümü</option>{categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
    </section>

    <div className="mt-7 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#344057]">{loading ? "Projeler yükleniyor…" : `${projects.length} proje`}</h2></div>

    {loading ? <section className="mt-4 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Projeler yükleniyor…</h2><p className="mt-2 text-sm text-[#758094]">Bir saniye, projeleri getiriyoruz.</p></section>
      : error ? <section className="mt-4 rounded-3xl border border-dashed border-[#e3c8c8] bg-[#fbf7f7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#7a3030]">Projeler yüklenemedi.</h2><p className="mt-2 text-sm text-[#8a5a63]">{error}</p><button type="button" onClick={() => setReloadToken((token) => token + 1)} className="mt-5 min-h-10 rounded-xl bg-[#eeecff] px-4 text-sm font-semibold text-[#5148c7]">Tekrar dene</button></section>
      : projects.length ? <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</section>
        : <section className="mt-4 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Bu filtrelerle eşleşen proje yok.</h2><p className="mt-2 text-sm text-[#758094]">Arama metnini veya seçili filtreleri değiştirmeyi dene.</p><button type="button" onClick={clearFilters} className="mt-5 min-h-10 rounded-xl bg-[#eeecff] px-4 text-sm font-semibold text-[#5148c7]">Filtreleri temizle</button></section>}
  </div>;
}