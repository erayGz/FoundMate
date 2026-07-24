import { ExternalLink } from "lucide-react";
import type { MockProject } from "../../data/projects";
import { commitmentLabels, compensationPreferenceLabels } from "../../features/applications/applicationOptions";
import type { ApplicationFormValues } from "../../types/application";

export function ApplicationReview({ project, values }: { project: MockProject; values: ApplicationFormValues }) {
  const rows = [
    ["Proje", project.name],
    ["Seçilen rol", values.selectedRole],
    ["Haftalık uygunluk", values.weeklyAvailability],
    ["Bağlılık tercihi", commitmentLabels[values.commitmentPreference]],
    ["Katkı modeli tercihleri", values.compensationPreferences.map((item) => compensationPreferenceLabels[item]).join(", ")],
  ];

  return <div className="min-w-0 space-y-5">
    <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => <div key={label} className="min-w-0 max-w-full rounded-2xl bg-[#f8f8fa] p-4">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a91a0]">{label}</dt>
        <dd className="mt-2 max-w-full whitespace-normal text-sm font-semibold leading-6 text-[#344057] [overflow-wrap:anywhere]">{value}</dd>
      </div>)}
    </dl>
    {[
      ["Motivasyon", values.motivation],
      ["Sağlayabileceğin katkı", values.contribution],
      ["İlk sprint önerisi", values.firstSprintProposal],
    ].map(([label, value]) => <section key={label} className="min-w-0 max-w-full rounded-2xl border border-[#e1e2e8] p-5">
      <h2 className="text-sm font-semibold text-[#344057]">{label}</h2>
      <p className="mt-2 max-w-full whitespace-pre-wrap text-sm leading-6 text-[#657084] [overflow-wrap:anywhere]">{value}</p>
    </section>)}
    {values.portfolioUrl && <section className="min-w-0 max-w-full rounded-2xl border border-[#e1e2e8] p-5">
      <h2 className="text-sm font-semibold text-[#344057]">Portfolyo veya çalışma bağlantısı</h2>
      <a href={values.portfolioUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-start gap-1.5 text-sm font-semibold text-[#5148c7] [overflow-wrap:anywhere] hover:underline">
        <span className="min-w-0 [overflow-wrap:anywhere]">{values.portfolioUrl}</span>
        <ExternalLink className="mt-1 size-3.5 shrink-0" />
      </a>
    </section>}
  </div>;
}
