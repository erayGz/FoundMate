import type { ApplicationStatus } from "../../types/application";

const statusStyles: Record<ApplicationStatus, string> = {
  draft: "border-[#ded9f5] bg-[#f2f0ff] text-[#5750be]",
  submitted: "border-[#cde7d6] bg-[#eef8f1] text-[#2e704b]",
  withdrawn: "border-[#e3e1de] bg-[#f3f2ef] text-[#6d7280]",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  draft: "Taslak", submitted: "Gönderildi", withdrawn: "Geri çekildi",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-[10px] font-semibold [overflow-wrap:anywhere] ${statusStyles[status]}`}>{applicationStatusLabels[status]}</span>;
}
