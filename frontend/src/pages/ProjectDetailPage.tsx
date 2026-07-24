import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Target, Users, WalletCards } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApplicationStatusBadge } from "../components/applications/ApplicationStatusBadge";
import { ProjectNotFoundState } from "../components/app/ProjectNotFoundState";
import { compensationLabels, findProjectById, workingPreferenceLabels } from "../data/projects";
import { useApplications } from "../features/applications/ApplicationContext";
import { useProfile } from "../features/onboarding/ProfileContext";
import { usePageTitle } from "../utils/usePageTitle";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = findProjectById(projectId);
  const { profile } = useProfile();
  const { getByProject, deleteApplication } = useApplications();
  const location = useLocation();
  const navigate = useNavigate();
  const application = project ? getByProject(project.id) : undefined;
  usePageTitle(project?.name ?? "Proje bulunamadı");

  if (!project) return <ProjectNotFoundState />;

  const from = (location.state as { from?: string } | null)?.from ?? "/discover";
  const deleteDraft = () => {
    if (application?.status === "draft" && window.confirm("Bu başvuru taslağını silmek istediğinden emin misin?")) deleteApplication(application.id);
  };
  const startNew = () => {
    navigate(`/projects/${project.id}/apply?mode=new`);
  };

  return <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
    <Link to={from} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />Geri dön</Link>

    <header className="mt-5 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_14px_40px_rgba(37,44,72,0.05)] sm:p-9">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">{project.category}</p><h1 className="mt-2 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-none tracking-[-0.05em] text-[#17233e]">{project.name}</h1></div><span className="w-fit rounded-full bg-[#f3f2ff] px-3 py-1.5 text-xs font-semibold text-[#5750be]">{project.stage}</span></div>
      <p className="mt-6 max-w-3xl text-base leading-7 text-[#5f697c] [overflow-wrap:anywhere]">{project.desc}</p>
      <div className="mt-6 rounded-2xl bg-[#f8f8fa] px-4 py-3 text-sm font-medium text-[#4f586b]"><span className="mr-2 text-[#685fd4]">↗</span>{project.proof}</div>
      <div className="mt-7 grid gap-4 border-t border-[#ececf0] pt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3"><span className={`inline-flex size-10 items-center justify-center rounded-full text-xs font-bold ${project.color}`}>{project.person}</span><div><p className="text-[11px] text-[#8a91a0]">Proje sahibi</p><p className="text-sm font-semibold text-[#344057]">{project.founder}</p></div></div>
        <div><p className="flex items-center gap-1.5 text-[11px] text-[#8a91a0]"><Clock3 className="size-3.5" />Haftalık beklenti</p><p className="mt-1 text-sm font-semibold text-[#344057]">{project.time}</p></div>
        <div><p className="flex items-center gap-1.5 text-[11px] text-[#8a91a0]"><MapPin className="size-3.5" />Konum</p><p className="mt-1 text-sm font-semibold text-[#344057]">{project.location}</p></div>
        <div><p className="flex items-center gap-1.5 text-[11px] text-[#8a91a0]"><Users className="size-3.5" />Çalışma biçimi</p><p className="mt-1 text-sm font-semibold text-[#344057]">{workingPreferenceLabels[project.workingPreference]}</p></div>
      </div>
    </header>

    <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Aranan katkılar</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Gerekli roller</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{project.roles.map((role) => { const matches = profile?.skills.includes(role) ?? false; return <article key={role} className={`rounded-2xl border p-4 ${matches ? "border-[#cfcaf5] bg-[#f5f3ff]" : "border-[#e2e2e8] bg-[#fcfcfb]"}`}><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#2f3a52]">{role}</h3>{matches && <Check className="size-4 text-[#5750be]" />}</div><p className={`mt-2 text-xs font-semibold ${matches ? "text-[#5750be]" : "text-[#7b8392]"}`}>{matches ? "Profilinle eşleşiyor" : "Yeni bir alan"}</p></article>; })}</div></section>

        <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">İlerleme</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Proje nerede?</h2><div className="mt-6 space-y-6"><div><h3 className="text-sm font-semibold text-[#344057]">Tamamlanan işler</h3><ul className="mt-3 space-y-2">{project.progress.completed.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-6 text-[#657084]"><Check className="mt-1 size-4 shrink-0 text-[#397354]" />{item}</li>)}</ul></div><div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl bg-[#f8f8fa] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a91a0]">Şimdiki öncelik</p><p className="mt-2 text-sm leading-6 text-[#344057]">{project.progress.currentFocus}</p></article><article className="rounded-2xl bg-[#f3f1ff] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7169d2]">Sonraki kilometre taşı</p><p className="mt-2 text-sm leading-6 text-[#403b70]">{project.progress.nextMilestone}</p></article></div></div></section>

        <section className="relative overflow-hidden rounded-3xl bg-[#1d2944] p-6 text-white sm:p-8"><Target className="size-6 text-[#b7b2ff]" /><h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">Önce birlikte üretin.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#cbd1de]">Uzun vadeli bir karar vermeden önce 7–14 günlük küçük ve ölçülebilir bir deneme sprinti planlayın.</p><div className="relative z-10 mt-6 rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#bdb9ff]">Örnek sprint çıktısı</p><p className="mt-2 text-sm leading-6 text-white">{project.trialSprintTask}</p></div><span className="pointer-events-none absolute -bottom-16 -right-12 size-52 rounded-full border-[24px] border-[#4b478c]" /></section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6"><h2 className="text-lg font-semibold tracking-[-0.025em]">Çalışma beklentileri</h2><dl className="mt-5 space-y-4 text-sm"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-4 text-[#6259cf]" /><div><dt className="text-xs text-[#8a91a0]">Haftalık zaman</dt><dd className="mt-1 font-semibold text-[#344057]">{project.time}</dd></div></div><div className="flex items-start gap-3"><Users className="mt-0.5 size-4 text-[#6259cf]" /><div><dt className="text-xs text-[#8a91a0]">Çalışma biçimi</dt><dd className="mt-1 font-semibold text-[#344057]">{workingPreferenceLabels[project.workingPreference]}</dd></div></div><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 text-[#6259cf]" /><div><dt className="text-xs text-[#8a91a0]">Deneme sprinti</dt><dd className="mt-1 font-semibold text-[#344057]">{project.trialSprintAvailable ? "Uygun" : "Planlanmıyor"}</dd></div></div><div className="flex items-start gap-3"><WalletCards className="mt-0.5 size-4 text-[#6259cf]" /><div><dt className="text-xs text-[#8a91a0]">Katkı modeli</dt><dd className="mt-1 font-semibold text-[#344057]">{compensationLabels[project.compensationModel]}</dd></div></div></dl></section>

        {application?.status === "draft" && <section className="rounded-2xl border border-[#d9d5f4] bg-[#f4f2ff] p-4"><ApplicationStatusBadge status="draft" /><p className="mt-3 text-sm font-semibold text-[#403b70]">Bu proje için tamamlanmamış bir başvurun var.</p><div className="mt-4 flex flex-col gap-2"><Link to={`/projects/${project.id}/apply`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white">Başvuruya devam et</Link><button type="button" onClick={deleteDraft} className="min-h-10 rounded-xl text-sm font-semibold text-[#6c628e] hover:bg-white/60">Taslağı sil</button></div></section>}
        {application?.status === "submitted" && <section className="rounded-2xl border border-[#cde7d6] bg-[#eef8f1] p-4"><ApplicationStatusBadge status="submitted" /><p className="mt-3 text-sm font-semibold text-[#315f45]">Bu proje için gönderilmiş bir başvurun var.</p></section>}
        {application?.status === "withdrawn" && <section className="rounded-2xl border border-[#e1dfdc] bg-[#f4f3f0] p-4"><ApplicationStatusBadge status="withdrawn" /><p className="mt-3 text-sm font-semibold text-[#555c68]">Bu başvuruyu geri çektin.</p><div className="mt-4 flex flex-col gap-2"><Link to={`/projects/${project.id}/apply`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d2cfe8] bg-white px-4 text-sm font-semibold text-[#5148c7]">Başvuruyu yeniden düzenle</Link><button type="button" onClick={startNew} className="min-h-10 rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white">Yeni başvuru başlat</button></div></section>}

        {!profile ? <section className="rounded-3xl border border-[#ddd9f4] bg-[#f5f3ff] p-5"><h2 className="text-base font-semibold text-[#403b70]">Başvuru için profilini tamamla.</h2><p className="mt-2 text-xs leading-5 text-[#6c6890]">Rol eşleşmelerini ve başvuru bilgilerini kullanabilmemiz için tamamlanmış bir yerel profil gerekiyor.</p><Link to={`/onboarding?returnTo=${encodeURIComponent(`/projects/${project.id}`)}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white">Profilini tamamla <ArrowRight className="size-4" /></Link></section>
          : application?.status === "submitted" ? <Link to={`/projects/${project.id}/apply`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Başvuruyu görüntüle <ArrowRight className="size-4" /></Link>
          : application?.status === "draft" ? null
          : application?.status === "withdrawn" ? null
          : <Link to={`/projects/${project.id}/apply`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.18)]">Projeye katılmak için başvur <ArrowRight className="size-4" /></Link>}
      </aside>
    </div>
  </div>;
}
