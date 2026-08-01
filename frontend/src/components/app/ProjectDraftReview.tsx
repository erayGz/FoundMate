import { Check } from "lucide-react";
import type { ProjectDraft, ProjectDraftStage } from "../../types/projectDraft";

const stageLabels: Record<ProjectDraftStage, string> = {
  "idea": "Fikir aşaması",
  "research": "Araştırma",
  "prototype": "Prototip",
  "early-users": "İlk kullanıcılar",
  "first-version": "İlk sürüm",
};

const shortFields: [string, keyof ProjectDraft][] = [
  ["Proje adı", "name"],
  ["Kategori", "category"],
  ["Kısa açıklama", "shortDescription"],
];

const longFields: [string, keyof ProjectDraft][] = [
  ["Problem açıklaması", "problemDescription"],
  ["Hedef kullanıcılar", "targetUsers"],
  ["Mevcut çözüm", "currentSolution"],
  ["Mevcut çözüm neden yetersiz?", "insufficientSolutions"],
  ["Başarı metriği", "successMetric"],
  ["Planlanan ilk sprint", "plannedFirstSprint"],
];

export function ProjectDraftReview({ draft }: { draft: ProjectDraft }) {
  return (
    <div className="min-w-0 space-y-5">
      <fieldset className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
        <legend className="px-1 text-sm font-semibold text-[#344057]">Aşama</legend>
        <div className="mt-2 flex min-w-0 items-start gap-3 rounded-xl border border-[#d9d5f4] bg-[#f4f2ff] p-3.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5448d8] text-white">
            <Check className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#344057] [overflow-wrap:anywhere]">
              {stageLabels[draft.stage]}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#687184] [overflow-wrap:anywhere]">
              {draft.stage === "idea" && "Problem ve yön henüz netleşiyor."}
              {draft.stage === "research" && "Kullanıcı, pazar veya teknik keşif yapılıyor."}
              {draft.stage === "prototype" && "İlk denenebilir sürüm hazırlanıyor."}
              {draft.stage === "early-users" && "Erken geri bildirim toplanıyor."}
              {draft.stage === "first-version" && "Kullanıma açık ilk ürün şekilleniyor."}
            </p>
          </div>
        </div>
      </fieldset>

      <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
        {shortFields.map(([label, field]) => (
          <div key={field} className="min-w-0 max-w-full rounded-2xl bg-[#f8f8fa] p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a91a0]">
              {label}
            </dt>
            <dd className="mt-2 max-w-full whitespace-normal text-sm font-semibold leading-6 text-[#344057] [overflow-wrap:anywhere]">
              {String(draft[field])}
            </dd>
          </div>
        ))}
      </dl>

      {longFields.map(([label, field]) => (
        <section key={field} className="min-w-0 max-w-full rounded-2xl border border-[#e1e2e8] p-5">
          <h2 className="text-sm font-semibold text-[#344057]">{label}</h2>
          <p className="mt-2 max-w-full whitespace-pre-wrap text-sm leading-6 text-[#657084] [overflow-wrap:anywhere]">
            {String(draft[field])}
          </p>
        </section>
      ))}
    </div>
  );
}
