import type { ApplicationStatus } from "../../types/application";

const statusStyles: Record<ApplicationStatus, string> = {
  draft: "border-[#ded9f5] bg-[#f2f0ff] text-[#5750be]",
  submitted: "border-[#cdd8f0] bg-[#eef2fb] text-[#2f538e]",
  withdrawn: "border-[#e3e1de] bg-[#f3f2ef] text-[#6d7280]",
  accepted: "border-[#cde7d6] bg-[#eef8f1] text-[#2e704b]",
  rejected: "border-[#e8d6d6] bg-[#fef6f6] text-[#a52f43]",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  draft: "Taslak", submitted: "Gönderildi", withdrawn: "Geri çekildi", accepted: "Kabul edildi", rejected: "Reddedildi",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-[10px] font-semibold [overflow-wrap:anywhere] ${statusStyles[status]}`}>{applicationStatusLabels[status]}</span>;
}