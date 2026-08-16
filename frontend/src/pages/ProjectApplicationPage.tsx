import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getProject, type Project } from "../api/projects";
import { getApiErrorMessage } from "../api/client";
import { ProjectNotFoundState } from "../components/app/ProjectNotFoundState";
import { ApplicationForm } from "../components/applications/ApplicationForm";
import { ApplicationReview } from "../components/applications/ApplicationReview";
import { ApplicationStatusBadge } from "../components/applications/ApplicationStatusBadge";
import { availableSkills, type MockProject } from "../data/projects";
import { normalizeWeeklyAvailability } from "../features/applications/applicationOptions";
import { useApplications } from "../features/applications/ApplicationContext";
import { useProfile } from "../features/onboarding/ProfileContext";
import type { ApplicationFormValues, ProjectApplication } from "../types/application";
import { usePageTitle } from "../utils/usePageTitle";

type PageMode = "form" | "review" | "submitted-view" | "success" | "withdrawn";

function toFormProject(project: Project): MockProject {
  return {
    id: String(project.id),
    name: project.title,
    category: project.category ?? "Kategorisiz",
    stage: "Yayında",
    desc: project.description,
    roles: availableSkills,
    person: "",
    founder: "Proje sahibi",
    color: "bg-[#e4e4ff] text-[#5348c1]",
    proof: "",
    progress: { completed: [], currentFocus: "", nextMilestone: "" },
    time: "",
    minWeeklyHours: 0,
    maxWeeklyHours: 0,
    location: "",
    workingPreference: "flexible",
    trialSprintAvailable: false,
    trialSprintTask: "",
    compensationModel: "open-to-discussion",
  };
}

function valuesFromApplication(application: ProjectApplication | undefined, projectTask: string, profileAvailability: string): ApplicationFormValues {
  return application ? {
    selectedRole: application.selectedRole,
    motivation: application.motivation,
    contribution: application.contribution,
    firstSprintProposal: application.firstSprintProposal,
    weeklyAvailability: application.weeklyAvailability,
    commitmentPreference: application.commitmentPreference,
    compensationPreferences: application.compensationPreferences,
    portfolioUrl: application.portfolioUrl,
  } : {
    selectedRole: "",
    motivation: "",
    contribution: "",
    firstSprintProposal: projectTask,
    weeklyAvailability: normalizeWeeklyAvailability(profileAvailability),
    commitmentPreference: "trial-sprint",
    compensationPreferences: ["open-to-discussion"],
    portfolioUrl: "",
  };
}

export default function ProjectApplicationPage() {
  const { projectId } = useParams();
  const numericProjectId = Number(projectId);
  const { profile } = useProfile();
  const { getByProject, saveApplication, withdrawApplication, loading: applicationsLoading } = useApplications();
  const [searchParams] = useSearchParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formProject = useMemo(() => project ? toFormProject(project) : null, [project]);
  const existing = formProject ? getByProject(Number(formProject.id)) : undefined;
  const sourceApplication = searchParams.get("mode") === "new" && existing?.status === "withdrawn" ? undefined : existing;

  const initialValues = useMemo(
    () => valuesFromApplication(sourceApplication, formProject?.trialSprintTask ?? "", profile?.availability ?? ""),
    [sourceApplication?.id, formProject?.trialSprintTask, profile?.availability],
  );
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [mode, setMode] = useState<PageMode>("form");
  const [consent, setConsent] = useState(false);
  const modeSyncedRef = useRef(false);

  usePageTitle(project ? `${project.title} başvurusu` : "Proje bulunamadı");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);
    if (!Number.isFinite(numericProjectId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    getProject(numericProjectId)
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) {
          setNotFound(true);
        } else {
          setError(getApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [numericProjectId]);

  useEffect(() => {
    if (modeSyncedRef.current || !formProject || applicationsLoading) return;
    modeSyncedRef.current = true;
    setMode(existing?.status === "submitted" ? "submitted-view" : "form");
  }, [formProject, applicationsLoading, existing]);

  if (notFound) return <ProjectNotFoundState />;

  if (loading || !formProject) {
    return <div className="mx-auto max-w-[980px] px-5 py-8 sm:px-8 lg:py-12"><section className="rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Proje yükleniyor…</h2></section></div>;
  }

  if (error || !project) {
    return <div className="mx-auto max-w-[980px] px-5 py-8 sm:px-8 lg:py-12"><section className="rounded-3xl border border-dashed border-[#e3c8c8] bg-[#fbf7f7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#7a3030]">Proje yüklenemedi.</h2><p className="mt-2 text-sm text-[#8a5a63]">{error ?? "Bilinmeyen bir hata oluştu."}</p><Link to="/discover" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white">Projeleri keşfet</Link></section></div>;
  }

  if (!profile) return <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]"><CheckCircle2 className="size-6" /></span>
    <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.045em] text-[#17233e]">Başvuru için profilini tamamla.</h1>
    <p className="mt-3 text-sm leading-6 text-[#687184]">Boş bir başvuru oluşturmadan önce yerel Foundmate profilini tamamlamalısın.</p>
    <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      <Link to={`/onboarding?returnTo=${encodeURIComponent(`/projects/${project.id}/apply`)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Profilini tamamla</Link>
      <Link to={`/projects/${project.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7]">Projeye dön</Link>
    </div>
  </section>;

  const projectIdForApply = Number(formProject.id);

  const saveDraft = async (nextValues: ApplicationFormValues) => {
    const shouldSubmitSave = existing?.status === "submitted";
    const savedApplication = await saveApplication(projectIdForApply, nextValues, shouldSubmitSave);
    setValues(nextValues);
    return savedApplication;
  };

  const review = async (nextValues: ApplicationFormValues) => {
    await saveApplication(projectIdForApply, nextValues, false);
    setValues(nextValues);
    setConsent(false);
    setMode("review");
  };

  const submit = async () => {
    if (!consent) return;
    try {
      await saveApplication(projectIdForApply, values, true);
      setMode("success");
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    }
  };

  const withdraw = async () => {
    if (existing && window.confirm("Bu başvuruyu geri çekmek istediğinden emin misin?")) {
      try {
        await withdrawApplication(existing.id);
        setMode("withdrawn");
      } catch (err) {
        window.alert(getApiErrorMessage(err));
      }
    }
  };

  if (mode === "success") return <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-[#e9f5ed] text-[#32704c]"><CheckCircle2 className="size-8" /></span>
    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[#397354]">Başvuru gönderildi</p>
    <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,4rem)] font-semibold tracking-[-0.045em]">Başvurun kaydedildi.</h1>
    <p className="mt-4 max-w-lg text-sm leading-6 text-[#687184]">Başvurun proje sahibine iletildi. Sonucu başvuruların sayfasından takip edebilirsin.</p>
    <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
      <Link to="/applications" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Başvurularımı gör</Link>
      <Link to={`/projects/${project.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7]">Projeye dön</Link>
    </div>
  </section>;

  if (mode === "withdrawn") return <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#f0efec] text-[#667084]"><RotateCcw className="size-6" /></span>
    <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.045em]">Başvuru geri çekildi.</h1>
    <p className="mt-3 text-sm leading-6 text-[#687184]">Kayıt durumu güncellendi. İstersen proje sayfasından yeniden düzenleyebilirsin.</p>
    <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <Link to="/applications" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Başvurularımı gör</Link>
      <Link to={`/projects/${project.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7]">Projeye dön</Link>
    </div>
  </section>;

  if (mode === "submitted-view" && existing) return <div className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
    <Link to={`/projects/${project.id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />Projeye dön</Link>
    <header className="mt-5 flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="min-w-0">
        <ApplicationStatusBadge status={existing.status} />
        <h1 className="mt-3 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em]">Başvurun</h1>
        <p className="mt-2 text-sm text-[#687184] [overflow-wrap:anywhere]">{project.title} · {existing.selectedRole || "Rol henüz seçilmedi"}</p>
      </div>
      {existing.status === "submitted" && <button type="button" onClick={() => setMode("form")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7]"><Pencil className="size-4" />Düzenle</button>}
    </header>
    <div className="mt-7 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 sm:p-8">
      <ApplicationReview project={formProject} values={values} />
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e6e6eb] pt-6 sm:flex-row sm:justify-between">
        {existing.status === "submitted" && <>
          <button type="button" onClick={withdraw} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[#a52f43] hover:bg-[#fff1f3]">Başvuruyu geri çek</button>
          <button type="button" onClick={() => setMode("form")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white"><Pencil className="size-4" />Başvuruyu düzenle</button>
        </>}
        {existing.status !== "submitted" && <Link to={`/projects/${project.id}/apply?mode=new`} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[#5148c7]">Yeni başvuru oluştur</Link>}
      </div>
    </div>
  </div>;

  if (mode === "review") return <div className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
    <button type="button" onClick={() => setMode("form")} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />Düzenlemeye dön</button>
    <header className="mt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Son kontrol</p>
      <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em]">Başvurunu kontrol et.</h1>
      <p className="mt-3 text-sm leading-6 text-[#687184]">Bilgiler proje sahibine gönderilecek.</p>
    </header>
    <div className="mt-7 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 sm:p-8">
      <ApplicationReview project={formProject} values={values} />
      <label className="mt-7 flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-[#d8d5ed] bg-[#f5f3ff] p-4 text-sm leading-6 text-[#49446f]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 size-4 shrink-0 accent-[#5448d8]" /><span className="min-w-0 [overflow-wrap:anywhere]">Paylaştığım bilgilerin proje sahibi tarafından görülebileceğini anlıyorum.</span></label>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={() => setMode("form")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7]"><ArrowLeft className="size-4" />Düzenlemeye dön</button>
        <button type="button" disabled={!consent} onClick={submit} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{existing?.status === "submitted" ? "Değişiklikleri kaydet" : "Başvuruyu gönder"}<ArrowRight className="size-4" /></button>
      </div>
    </div>
  </div>;

  return <div className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
    <Link to={`/projects/${project.id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />Projeye dön</Link>
    <header className="mt-5 min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0] [overflow-wrap:anywhere]">{project.title} · Başvuru</p>
      <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em]">Projeye katkını netleştir.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">Kurucuya yalnızca ilgilendiğini değil, ne sağlayabileceğini ve nasıl çalışmak istediğini göster.</p>
    </header>
    <div className="mt-7 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 shadow-[0_14px_40px_rgba(37,44,72,0.04)] sm:p-8">
      <ApplicationForm
        project={formProject}
        profile={profile}
        values={values}
        onChange={setValues}
        onSaveDraft={saveDraft}
        onReview={review}
        saveLabel={existing?.status === "submitted" ? "Değişiklikleri kaydet" : "Taslak olarak kaydet"}
        saveMode={existing?.status === "submitted" ? "submitted" : "draft"}
      />
    </div>
  </div>;
}