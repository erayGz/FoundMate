import { ArrowRight, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApplicationStatusBadge, applicationStatusLabels } from "../components/applications/ApplicationStatusBadge";
import { useApplications } from "../features/applications/ApplicationContext";
import type { ApplicationStatus } from "../types/application";
import { usePageTitle } from "../utils/usePageTitle";

type StatusFilter = "all" | ApplicationStatus;

const filters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "draft", label: "Taslak" },
  { value: "submitted", label: "Gönderildi" },
  { value: "withdrawn", label: "Geri çekildi" },
];

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function ApplicationsPage() {
  usePageTitle("Başvurularım");
  const { applications, loading } = useApplications();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const filtered = useMemo(
    () => applications.filter((application) => statusFilter === "all" || application.status === statusFilter).sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)),
    [applications, statusFilter],
  );

  return <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
    <header className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Başvuru kayıtları</p>
      <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em]">Başvurularım</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">Taslak ve gönderilmiş başvuruların durumunu buradan takip edebilirsin.</p>
    </header>

    <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Başvuru durumu filtresi">
      {filters.map((filter) => <button key={filter.value} type="button" aria-pressed={statusFilter === filter.value} onClick={() => setStatusFilter(filter.value)} className={`min-h-10 rounded-xl border px-4 text-sm font-semibold transition ${statusFilter === filter.value ? "border-[#6259cf] bg-[#eeecff] text-[#4f46bd]" : "border-[#e1e2e8] bg-white text-[#687184] hover:border-[#bbb7e9]"}`}>{filter.label}</button>)}
    </div>

    {loading ? <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Başvurular yükleniyor…</h2></section>
      : !applications.length ? <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]"><ClipboardList className="size-5" /></span>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#344057]">Henüz bir başvurun yok.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758094]">Katkı sağlayabileceğin projeleri keşfederek ilk başvurunu oluşturabilirsin.</p>
      <Link to="/discover" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Projeleri keşfet <ArrowRight className="size-4" /></Link>
    </section>
      : filtered.length ? <section className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
        {filtered.map((application) => {
          const cta = application.status === "draft" ? "Başvuruya devam et" : application.status === "submitted" ? "Başvuruyu görüntüle" : "Yeniden düzenle";
          return <article key={application.id} className="flex min-w-0 max-w-full flex-col rounded-2xl border border-[#e1e2e8] bg-white p-5 shadow-[0_5px_16px_rgba(37,44,72,0.03)]">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#757e90] [overflow-wrap:anywhere]">Proje</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.035em] text-[#26334f] [overflow-wrap:anywhere]">{application.projectTitle}</h2>
              </div>
              <div className="min-w-0 sm:justify-self-end"><ApplicationStatusBadge status={application.status} /></div>
            </div>
            <dl className="mt-5 grid min-w-0 grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-[#8a91a0]">Rol</dt>
                <dd className="mt-1 font-semibold text-[#4f596c] [overflow-wrap:anywhere]">{application.selectedRole || "Henüz seçilmedi"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[#8a91a0]">Haftalık uygunluk</dt>
                <dd className="mt-1 font-semibold text-[#4f596c] [overflow-wrap:anywhere]">{application.weeklyAvailability || "Belirtilmedi"}</dd>
              </div>
            </dl>
            <p className="mt-4 line-clamp-3 min-w-0 text-sm leading-6 text-[#687184] [overflow-wrap:anywhere]">{application.motivation || "Motivasyon açıklaması henüz tamamlanmadı."}</p>
            <div className="mt-auto min-w-0 border-t border-[#ececf0] pt-4">
              <p className="text-[11px] text-[#8a91a0] [overflow-wrap:anywhere]">{applicationStatusLabels[application.status]} · Son güncelleme {dateFormatter.format(new Date(application.updatedAt ?? application.createdAt))}</p>
              <Link to={`/projects/${application.projectId}/apply`} className="mt-4 inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#d8d6ec] bg-[#faf9ff] px-4 text-center text-sm font-semibold text-[#5148c7] hover:bg-[#f1efff]"><span className="min-w-0 [overflow-wrap:anywhere]">{cta}</span><ArrowRight className="size-4 shrink-0" /></Link>
            </div>
          </article>;
        })}
      </section>
      : <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-12 text-center">
        <h2 className="text-lg font-semibold text-[#344057]">Bu durumda başvuru yok.</h2>
        <p className="mt-2 text-sm text-[#758094]">Başka bir durum filtresi seçebilirsin.</p>
      </section>}
  </div>;
}