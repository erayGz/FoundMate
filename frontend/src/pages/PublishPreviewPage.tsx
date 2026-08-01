import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Target, Users, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { stageLabels } from "../utils/projectHelpers";
import type { ProjectDraft, RequiredRole } from "../types/projectDraft";
import { loadProjectDraft } from "../utils/projectDraftStorage";
import { loadRequiredRoles } from "../utils/requiredRoleStorage";
import { useProfile } from "../features/onboarding/ProfileContext";
import { usePageTitle } from "../utils/usePageTitle";
import { compensationLabels, workingPreferenceLabels } from "../data/projects";

function getInitials(name: string): string {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toLocaleUpperCase("tr-TR");
}

export default function PublishPreviewPage() {
  usePageTitle("Yayın önizleme");
  const { profile } = useProfile();
  const draft = loadProjectDraft();
  const roles = loadRequiredRoles();

  if (!draft) {
    return (
      <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
        <Link to="/my-project" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]">
          <ArrowLeft className="size-4" />Projeme dön
        </Link>
        <section className="mt-10 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
          <h2 className="text-xl font-semibold text-[#344057]">Önizlenecek proje taslağı bulunamadı.</h2>
          <p className="mt-2 text-sm text-[#758094]">Önce bir proje taslağı oluşturmalısın.</p>
          <Link to="/projects/new" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Proje oluştur</Link>
        </section>
      </div>
    );
  }

  const initials = profile ? getInitials(profile.name) : "FM";
  const founderName = profile?.name ?? "Ben";

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
      <Link to="/my-project" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]">
        <ArrowLeft className="size-4" />Projeme dön
      </Link>

      <header className="mt-5 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_14px_40px_rgba(37,44,72,0.05)] sm:p-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">{draft.category || "Kategori"}</p>
            <h1 className="mt-2 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-none tracking-[-0.05em] text-[#17233e]">{draft.name}</h1>
          </div>
          <span className="w-fit rounded-full bg-[#f3f2ff] px-3 py-1.5 text-xs font-semibold text-[#5750be]">{stageLabels[draft.stage]}</span>
        </div>
        <p className="mt-6 max-w-3xl text-base leading-7 text-[#5f697c] [overflow-wrap:anywhere]">{draft.shortDescription}</p>
        <div className="mt-6 rounded-2xl bg-[#f8f8fa] px-4 py-3 text-sm font-medium text-[#4f586b]"><span className="mr-2 text-[#685fd4]">↗</span>{draft.successMetric}</div>
        <div className="mt-7 grid gap-4 border-t border-[#ececf0] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#e6e2ff] text-xs font-bold text-[#4d43c2]">{initials}</span>
            <div>
              <p className="text-[11px] text-[#8a91a0]">Proje sahibi</p>
              <p className="text-sm font-semibold text-[#344057]">{founderName}</p>
            </div>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] text-[#8a91a0]"><Clock3 className="size-3.5" />Haftalık beklenti</p>
            <p className="mt-1 text-sm font-semibold text-[#344057]">Esnek</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] text-[#8a91a0]"><MapPin className="size-3.5" />Konum</p>
            <p className="mt-1 text-sm font-semibold text-[#344057]">Yerel</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] text-[#8a91a0]"><Users className="size-3.5" />Çalışma biçimi</p>
            <p className="mt-1 text-sm font-semibold text-[#344057]">{workingPreferenceLabels["remote"]}</p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Aranan katkılar</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Gerekli roller</h2>
            {roles.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {roles.map((role) => {
                  const matches = profile?.skills.some((s) => role.skills.includes(s) || role.title.includes(s)) ?? false;
                  return (
                    <article key={role.id} className={`rounded-2xl border p-4 ${matches ? "border-[#cfcaf5] bg-[#f5f3ff]" : "border-[#e2e2e8] bg-[#fcfcfb]"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#2f3a52]">{role.title}</h3>
                        {matches && <Check className="size-4 text-[#5750be]" />}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[#657084] [overflow-wrap:anywhere]">{role.responsibility}</p>
                      <p className={`mt-2 text-xs font-semibold ${matches ? "text-[#5750be]" : "text-[#7b8392]"}`}>
                        {matches ? "Profilinle eşleşiyor" : "Yeni bir alan"}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#8a91a0]">Henüz rol eklenmedi.</p>
            )}
          </section>

          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Problem</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Hangi problem çözülüyor?</h2>
            <p className="mt-5 text-sm leading-6 text-[#657084] whitespace-pre-wrap [overflow-wrap:anywhere]">{draft.problemDescription}</p>
          </section>

          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Hedef kitle</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Kimin için?</h2>
            <p className="mt-5 text-sm leading-6 text-[#657084] whitespace-pre-wrap [overflow-wrap:anywhere]">{draft.targetUsers}</p>
          </section>

          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Mevcut durum</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Bugün nasıl çözülüyor?</h2>
            <p className="mt-5 text-sm leading-6 text-[#657084] whitespace-pre-wrap [overflow-wrap:anywhere]">{draft.currentSolution}</p>
            <div className="mt-6 rounded-2xl bg-[#f8f8fa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a91a0]">Neden yetersiz?</p>
              <p className="mt-2 text-sm leading-6 text-[#344057] whitespace-pre-wrap [overflow-wrap:anywhere]">{draft.insufficientSolutions}</p>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl bg-[#1d2944] p-6 text-white sm:p-8">
            <Target className="size-6 text-[#b7b2ff]" />
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">İlk sprint planı</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#cbd1de]">7–14 gün içinde tamamlanacak ölçülebilir hedef.</p>
            <div className="relative z-10 mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="mt-2 text-sm leading-6 text-white">{draft.plannedFirstSprint}</p>
            </div>
            <span className="pointer-events-none absolute -bottom-16 -right-12 size-52 rounded-full border-[24px] border-[#4b478c]" />
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6">
            <h2 className="text-lg font-semibold tracking-[-0.025em]">Çalışma beklentileri</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 text-[#6259cf]" />
                <div>
                  <dt className="text-xs text-[#8a91a0]">Haftalık zaman</dt>
                  <dd className="mt-1 font-semibold text-[#344057]">Esnek</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-[#6259cf]" />
                <div>
                  <dt className="text-xs text-[#8a91a0]">Çalışma biçimi</dt>
                  <dd className="mt-1 font-semibold text-[#344057]">{workingPreferenceLabels["remote"]}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 text-[#6259cf]" />
                <div>
                  <dt className="text-xs text-[#8a91a0]">Deneme sprinti</dt>
                  <dd className="mt-1 font-semibold text-[#344057]">Uygun</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 size-4 text-[#6259cf]" />
                <div>
                  <dt className="text-xs text-[#8a91a0]">Katkı modeli</dt>
                  <dd className="mt-1 font-semibold text-[#344057]">{compensationLabels["open-to-discussion"]}</dd>
                </div>
              </div>
            </dl>
          </section>

          <Link
            to="/my-project"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.18)]"
          >
            Projeme dön <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
