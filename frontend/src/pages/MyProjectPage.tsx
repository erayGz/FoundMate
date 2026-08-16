import { ArrowRight, FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteProject, getMyProjects, type Project } from "../api/projects";
import { getApiErrorMessage } from "../api/client";
import { usePageTitle } from "../utils/usePageTitle";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

function MyProjectEmptyState() {
  return (
    <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]">
        <FolderKanban className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#344057]">
        Henüz bir projen yok.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758094]">
        Projeni tanımlamak için temel bilgileri gir ve yayınla.
      </p>
      <Link
        to="/projects/new"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white"
      >
        Proje oluştur <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

export default function MyProjectPage() {
  usePageTitle("Projem");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyProjects({ pageSize: 100 })
      .then((response) => {
        if (!cancelled) setProjects(response.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`"${project.title}" projesini silmek istediğinden emin misin?`)) return;
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
    <header className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Projelerim</p>
        <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em] text-[#17233e]">Projelerin.</h1>
        <p className="mt-2 text-sm text-[#687184]">Oluşturduğun projeleri buradan yönetebilirsin.</p>
      </div>
      <Link to="/projects/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.16)] hover:bg-[#463ac8]"><Plus className="size-4" />Yeni proje</Link>
    </header>

    {loading ? <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Projeler yükleniyor…</h2></section>
      : error ? <section className="mt-8 rounded-3xl border border-dashed border-[#e3c8c8] bg-[#fbf7f7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#7a3030]">Projeler yüklenemedi.</h2><p className="mt-2 text-sm text-[#8a5a63]">{error}</p></section>
      : projects.length ? <section className="mt-7 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="min-w-0 rounded-2xl border border-[#e1e2e8] bg-white p-5 shadow-[0_5px_16px_rgba(37,44,72,0.035)]">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#757e90] [overflow-wrap:anywhere]">{project.category || "Kategorisiz"}</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[#1e2a45] [overflow-wrap:anywhere]">{project.title}</h2>
                <p className="mt-3 text-[13px] leading-5 text-[#636d80] [overflow-wrap:anywhere]">{project.description}</p>
              </div>
              <p className="mt-4 text-[11px] text-[#747e91]">Oluşturulma: {dateFormatter.format(new Date(project.createdAt))}</p>
              <div className="mt-4 flex min-w-0 flex-wrap gap-2 border-t border-[#ededf1] pt-4">
                <Link to={`/projects/${project.id}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7] hover:bg-[#f7f6ff]">İncele</Link>
                <Link to={`/projects/${project.id}/edit`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7] hover:bg-[#f7f6ff]"><Pencil className="size-4" />Düzenle</Link>
                <button type="button" onClick={() => handleDelete(project)} disabled={deletingId === project.id} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e8d6d6] bg-white px-4 text-sm font-semibold text-[#a52f43] transition hover:bg-[#fff1f3] disabled:cursor-wait disabled:opacity-50"><Trash2 className="size-4" />{deletingId === project.id ? "Siliniyor…" : "Sil"}</button>
              </div>
            </article>
          ))}
        </section>
      : <MyProjectEmptyState />}
  </div>;
}