import { Check, ExternalLink, Loader2, X } from "lucide-react";
import type { ProjectApplication } from "../../types/application";

export function IncomingApplicationCard({
  application,
  working,
  onAccept,
  onReject,
}: {
  application: ProjectApplication;
  working: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const statusColors = {
    draft: "border-[#e1e2e8] bg-white",
    submitted: "border-[#dfe2ee] bg-white",
    accepted: "border-[#cde7d6] bg-[#eef8f1]",
    rejected: "border-[#e8d6d6] bg-[#fef6f6]",
    withdrawn: "border-[#e1e2e8] bg-[#f6f6f8]",
  };

  const statusLabel = {
    draft: "Taslak",
    submitted: "Bekliyor",
    accepted: "Kabul edildi",
    rejected: "Reddedildi",
    withdrawn: "Çekildi",
  };

  const statusBadgeColors = {
    draft: "bg-[#f2f2f5] text-[#6a7284]",
    submitted: "bg-[#fef6e6] text-[#9a6d1a]",
    accepted: "bg-[#eef8f1] text-[#2e704b]",
    rejected: "bg-[#fef0f0] text-[#a52f43]",
    withdrawn: "bg-[#f2f2f5] text-[#6a7284]",
  };

  const initials = application.applicantName.split(" ").filter(Boolean).map((part) => part[0]?.toUpperCase()).slice(0, 2).join("") || "?";

  return (
    <article className={`flex min-w-0 max-w-full flex-col rounded-2xl border p-5 ${statusColors[application.status]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8dff5] text-xs font-bold text-[#5f3f8a]">{initials}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#26334f] [overflow-wrap:anywhere]">{application.applicantName}</h3>
            <p className="text-xs text-[#687184] [overflow-wrap:anywhere]">{application.applicantEmail || application.selectedRole || "Rol seçilmedi"}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusBadgeColors[application.status]}`}>{statusLabel[application.status]}</span>
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#5f697c] [overflow-wrap:anywhere]">{application.motivation ? `"${application.motivation}"` : "Motivasyon yazılmadı."}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="max-w-full rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2 py-0.5 text-[10px] font-medium text-[#4e576b] [overflow-wrap:anywhere]">{application.selectedRole || "Rol seçilmedi"}</span>
        {application.commitmentPreference && (
          <span className="max-w-full rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2 py-0.5 text-[10px] font-medium text-[#4e576b] [overflow-wrap:anywhere]">{`${application.weeklyAvailability}h/hafta`}</span>
        )}
        {application.portfolioUrl && (
          <a href={application.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 rounded-lg border border-[#d8d6e8] bg-white px-2 py-0.5 text-[10px] font-medium text-[#5148c7] [overflow-wrap:anywhere]">Portfolyo <ExternalLink className="size-3" /></a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ececf0] pt-4">
        {working && (
          <span className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#687184]">
            <Loader2 className="size-3.5 animate-spin" /> İşleniyor…
          </span>
        )}
        {!working && application.status === "submitted" && (
          <>
            <button type="button" onClick={onAccept} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#397354] px-3 text-xs font-semibold text-white">
              <Check className="size-3.5" />Kabul et
            </button>
            <button type="button" onClick={onReject} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#d8d6e8] bg-white px-3 text-xs font-semibold text-[#a52f43]">
              <X className="size-3.5" />Reddet
            </button>
          </>
        )}
        {!working && application.status !== "submitted" && (
          <span className="text-[11px] text-[#8a91a0]">Bu başvuru {statusLabel[application.status].toLocaleLowerCase("tr")}.</span>
        )}
      </div>
    </article>
  );
}