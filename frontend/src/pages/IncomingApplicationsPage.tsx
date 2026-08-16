import { ArrowLeft, ArrowRight, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProjects, type Project } from "../api/projects";
import { acceptApplication, getProjectApplications, rejectApplication } from "../api/applications";
import { getApiErrorMessage } from "../api/client";
import { IncomingApplicationCard } from "../components/app/IncomingApplicationCard";
import { fromBackendApplication } from "../features/applications/applicationMapping";
import type { ProjectApplication } from "../types/application";
import { usePageTitle } from "../utils/usePageTitle";

export default function IncomingApplicationsPage() {
  usePageTitle("Gelen başvurular");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProjects({ pageSize: 100 })
      .then((response) => {
        if (cancelled) return;
        setProjects(response.items);
        if (response.items.length && selectedProjectId === null) {
          const first = response.items[0];
          setSelectedProjectId(first.id);
          setSelectedProject(first);
        }
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
  }, []);

  useEffect(() => {
    if (selectedProjectId === null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProjectApplications(selectedProjectId, { pageSize: 100 })
      .then((response) => {
        if (cancelled) return;
        setApplications(response.items.map(fromBackendApplication));
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
  }, [selectedProjectId]);

  const changeProject = (id: number) => {
    const project = projects.find((item) => item.id === id) ?? null;
    setSelectedProject(project);
    setSelectedProjectId(id);
  };

  const review = async (id: number, action: (applicationId: number) => Promise<unknown>) => {
    setActionId(id);
    try {
      await action(id);
      const response = await getProjectApplications(selectedProjectId!, { pageSize: 100 });
      setApplications(response.items.map(fromBackendApplication));
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = applications.filter((application) => application.status === "submitted").length;

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
      <Link to="/my-project" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]">
        <ArrowLeft className="size-4" />Projeme dön
      </Link>

      <header className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Başvuru gelen kutusu</p>
        <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em] text-[#17233e]">
          Gelen başvurular
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">
          Projene gelen başvuruları incele ve karar ver.
        </p>
      </header>

      {projects.length > 1 && (
        <div className="mt-6">
          <label className="text-xs font-semibold text-[#687184]">Proje<select value={selectedProjectId ?? ""} onChange={(event) => changeProject(Number(event.target.value))} className="mt-2 block min-h-11 w-full max-w-sm rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#344057] outline-none focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15">{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
        </div>
      )}

      {error && <div className="mt-6 rounded-2xl bg-[#fbf3f3] px-4 py-3 text-sm font-semibold text-[#a52f43]">{error}</div>}

      {pendingCount > 0 && (
        <div className="mt-6 rounded-2xl bg-[#fef6e6] px-4 py-3 text-sm font-semibold text-[#9a6d1a]">
          {pendingCount} bekleyen başvuru
        </div>
      )}

      {loading ? <section className="mt-6 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Başvurular yükleniyor…</h2></section>
        : applications.length > 0 ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {applications.map((application) => (
            <IncomingApplicationCard
              key={application.id}
              application={application}
              working={actionId === application.id}
              onAccept={() => review(application.id, acceptApplication)}
              onReject={() => review(application.id, rejectApplication)}
            />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]">
            <UsersRound className="size-5" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#344057]">
            {projects.length ? `${selectedProject?.title ?? "Bu proje"} için henüz başvuru yok.` : "Henüz bir projen yok."}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758094]">
            {projects.length ? "Başvuru geldiğinde burada görünecek." : "Bir proje oluşturduktan sonra başvurular burada görünecek."}
          </p>
          <Link to={projects.length ? "/my-project" : "/projects/new"} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">
            {projects.length ? "Projeme dön" : "Proje oluştur"} <ArrowRight className="size-4" />
          </Link>
        </section>
      )}
    </div>
  );
}