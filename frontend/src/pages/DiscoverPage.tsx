import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProjectCard } from "../components/app/ProjectCard";
import { filterProjects, type ProjectFilters } from "../data/projectLogic";
import { availableSkills, projectCategories, projects, type MockProject, type WorkingPreference } from "../data/projects";
import { useProfile } from "../features/onboarding/ProfileContext";
import { loadPublishedProject } from "../utils/publishedProjectStorage";
import { draftToMockProject } from "../utils/projectHelpers";
import { loadRequiredRoles } from "../utils/requiredRoleStorage";
import { usePageTitle } from "../utils/usePageTitle";

type PreferenceFilter = "all" | Exclude<WorkingPreference, "flexible">;

const preferenceOptions: { value: PreferenceFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "remote", label: "Uzaktan" },
  { value: "hybrid", label: "Hibrit" },
  { value: "local", label: "Yerel / yüz yüze" },
];

export default function DiscoverPage() {
  usePageTitle("Projeleri keşfet");
  const { profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();

  const publishedDraft = loadPublishedProject();
  const publishedRoles = publishedDraft ? publishedDraft.roles : [];
  const myProject: MockProject | null = publishedDraft
    ? draftToMockProject(publishedDraft, publishedRoles, profile)
    : null;
  const allProjects: MockProject[] = myProject
    ? [myProject, ...projects]
    : projects;

  const query = searchParams.get("q") ?? "";
  const requestedSkill = searchParams.get("role") ?? "Tümü";
  const skill = availableSkills.includes(requestedSkill) ? requestedSkill : "Tümü";
  const requestedCategory = searchParams.get("category") ?? "Tümü";
  const category = projectCategories.includes(requestedCategory) ? requestedCategory : "Tümü";
  const requestedPreference = searchParams.get("work") ?? "all";
  const workingPreference: PreferenceFilter = ["remote", "hybrid", "local"].includes(requestedPreference) ? requestedPreference as PreferenceFilter : "all";

  const filteredProjects = useMemo(() => filterProjects(allProjects, { query, skill, category, workingPreference } satisfies ProjectFilters), [allProjects, category, query, skill, workingPreference]);

  const hasActiveFilters = Boolean(query || skill !== "Tümü" || category !== "Tümü" || workingPreference !== "all");
  const setFilter = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key); else next.set(key, value);
    setSearchParams(next, { replace: key === "q" });
  };
  const clearFilters = () => setSearchParams({});

  return <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:py-10">
    <header><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Proje keşfi</p><h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold tracking-[-0.045em]">Somut adım atan projeleri keşfet.</h1><p className="mt-3 max-w-[690px] text-sm leading-6 text-[#687184]">Altı örnek projeyi incele, filtrelerini URL’de koru ve katkını yerel prototip başvurusunda netleştir.</p></header>

    <section className="mt-8 rounded-2xl border border-[#e1e2e8] bg-white p-4 sm:p-5" aria-label="Proje filtreleri">
      <div className="flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#344057]"><SlidersHorizontal className="size-4 text-[#6259cf]" />Filtreler</span><button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#5b53c4] transition hover:bg-[#f3f1ff] disabled:cursor-default disabled:opacity-35"><X className="size-3.5" />Filtreleri temizle</button></div>
      <label className="relative mt-4 block"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#8a91a0]" /><span className="sr-only">Projelerde ara</span><input value={query} onChange={(event) => setFilter("q", event.target.value, "")} type="search" placeholder="Proje, kategori veya rol ara" className="min-h-12 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] pl-11 pr-4 text-sm outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" /></label>

      <fieldset className="mt-5"><legend className="text-xs font-semibold text-[#687184]">Rol</legend><div className="mt-2 flex flex-wrap gap-2">{["Tümü", ...availableSkills].map((item) => <button key={item} type="button" onClick={() => setFilter("role", item, "Tümü")} aria-pressed={skill === item} className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${skill === item ? "border-[#6259cf] bg-[#eeecff] text-[#4f46bd]" : "border-[#e1e2e8] text-[#687184] hover:border-[#bbb7e9]"}`}>{item}</button>)}</div></fieldset>

      <div className="mt-5 grid gap-4 border-t border-[#ececf0] pt-5 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[#687184]">Kategori<select value={category} onChange={(event) => setFilter("category", event.target.value, "Tümü")} className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#344057] outline-none focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"><option>Tümü</option>{projectCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#687184]">Çalışma tercihi<select value={workingPreference} onChange={(event) => setFilter("work", event.target.value, "all")} className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#344057] outline-none focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15">{preferenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </div>
    </section>

    <div className="mt-7 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#344057]">{filteredProjects.length} proje</h2><p className="text-xs text-[#8a91a0]">Mock veri · Yerel prototip</p></div>
    {filteredProjects.length ? <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredProjects.map((project) => {
      const isOwnProject = project.id === "my-published-project";
      return <div key={project.name} className="relative">
        {isOwnProject && <span className="absolute -top-2 left-4 z-10 rounded-full bg-[#5448d8] px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_2px_8px_rgba(84,72,216,0.3)]">Benim projem</span>}
        <ProjectCard project={project} />
      </div>;
    })}</section> : <section className="mt-4 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Bu filtrelerle eşleşen proje yok.</h2><p className="mt-2 text-sm text-[#758094]">Arama metnini veya seçili filtreleri değiştirmeyi dene.</p><button type="button" onClick={clearFilters} className="mt-5 min-h-10 rounded-xl bg-[#eeecff] px-4 text-sm font-semibold text-[#5148c7]">Filtreleri temizle</button></section>}
  </div>;
}
