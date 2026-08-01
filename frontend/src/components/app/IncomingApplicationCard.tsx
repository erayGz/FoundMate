import { Check, ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import { mockApplicants } from "../../data/mockApplicants";
import type { IncomingApplication } from "../../types/projectDraft";

export function IncomingApplicationCard({
  application,
  onAccept,
  onReject,
}: {
  application: IncomingApplication;
  onAccept: () => void;
  onReject: () => void;
}) {
  const applicant = mockApplicants.find(
    (a) => a.id === application.applicantId,
  );

  if (!applicant) return null;

  const statusColors = {
    pending: "border-[#e1e2e8] bg-white",
    accepted: "border-[#cde7d6] bg-[#eef8f1]",
    rejected: "border-[#e8d6d6] bg-[#fef6f6]",
  };

  const statusLabel = {
    pending: "Bekliyor",
    accepted: "Kabul edildi",
    rejected: "Reddedildi",
  };

  const statusBadgeColors = {
    pending: "bg-[#fef6e6] text-[#9a6d1a]",
    accepted: "bg-[#eef8f1] text-[#2e704b]",
    rejected: "bg-[#fef0f0] text-[#a52f43]",
  };

  return (
    <article
      className={`flex min-w-0 max-w-full flex-col rounded-2xl border p-5 ${statusColors[application.status]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${applicant.color}`}
          >
            {applicant.initials}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#26334f] [overflow-wrap:anywhere]">
              {applicant.name}
            </h3>
            <p className="text-xs text-[#687184] [overflow-wrap:anywhere]">
              {application.roleTitle}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusBadgeColors[application.status]}`}
        >
          {statusLabel[application.status]}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#5f697c] [overflow-wrap:anywhere]">
        "{application.motivation}"
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {application.skills.map((skill) => (
          <span
            key={skill}
            className="max-w-full rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2 py-0.5 text-[10px] font-medium text-[#4e576b] [overflow-wrap:anywhere]"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-[#8a91a0]">
        {application.availability}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ececf0] pt-4">
        <Link
          to={`/applicant/${applicant.id}`}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#d8d6e8] bg-white px-3 text-xs font-semibold text-[#5148c7]"
        >
          Profili gör <ExternalLink className="size-3" />
        </Link>
        {application.status === "pending" && (
          <>
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#397354] px-3 text-xs font-semibold text-white"
            >
              <Check className="size-3.5" />
              Kabul et
            </button>
            <button
              type="button"
              onClick={onReject}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#d8d6e8] bg-white px-3 text-xs font-semibold text-[#a52f43]"
            >
              <X className="size-3.5" />
              Reddet
            </button>
          </>
        )}
      </div>
    </article>
  );
}
