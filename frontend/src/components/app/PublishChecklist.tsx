import { Check, X } from "lucide-react";
import type { ProjectDraft, RequiredRole } from "../../types/projectDraft";

interface ChecklistItem {
  label: string;
  isComplete: boolean;
}

function rolesEvery(roles: RequiredRole[], predicate: (r: RequiredRole) => boolean): boolean {
  return roles.length > 0 && roles.every(predicate);
}

export function getPublishChecklist(
  draft: ProjectDraft,
  roles: RequiredRole[],
): ChecklistItem[] {
  return [
    {
      label: "Proje adı",
      isComplete: draft.name.trim().length >= 3,
    },
    {
      label: "Kısa açıklama",
      isComplete: draft.shortDescription.trim().length >= 30,
    },
    {
      label: "Problem açıklaması",
      isComplete: draft.problemDescription.trim().length >= 80,
    },
    {
      label: "Hedef kullanıcılar",
      isComplete: draft.targetUsers.trim().length >= 20,
    },
    {
      label: "Mevcut çözüm açıklaması",
      isComplete: draft.currentSolution.trim().length >= 30,
    },
    {
      label: "Başarı metriği",
      isComplete: draft.successMetric.trim().length >= 15,
    },
    {
      label: "İlk sprint planı",
      isComplete: draft.plannedFirstSprint.trim().length >= 30,
    },
    {
      label: "En az bir rol tanımlanmış",
      isComplete: roles.length > 0,
    },
    {
      label: "Tüm rollerin başlığı dolu",
      isComplete: rolesEvery(roles, (r) => r.title.trim().length > 0),
    },
    {
      label: "Tüm rollerin sorumluluğu dolu",
      isComplete: rolesEvery(roles, (r) => r.responsibility.trim().length > 0),
    },
    {
      label: "Tüm rollerin deneyim seviyesi seçilmiş",
      isComplete: rolesEvery(roles, (r) => r.experienceLevel.length > 0),
    },
    {
      label: "Tüm rollerde en az 2 yetenek",
      isComplete: rolesEvery(roles, (r) => r.skills.length >= 2),
    },
    {
      label: "Proje logosu",
      isComplete: false,
    },
    {
      label: "Banner görseli",
      isComplete: false,
    },
  ];
}

export function canPublish(draft: ProjectDraft, roles: RequiredRole[]): boolean {
  return getPublishChecklist(draft, roles).every((item) => item.isComplete);
}

export function PublishChecklist({
  draft,
  roles,
}: {
  draft: ProjectDraft;
  roles: RequiredRole[];
}) {
  const items = getPublishChecklist(draft, roles);
  const completedCount = items.filter((item) => item.isComplete).length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isReady = completedCount === totalCount;

  return (
    <div className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#26334f]">
          Yayın kontrol listesi
        </h2>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            isReady
              ? "bg-[#eef8f1] text-[#2e704b]"
              : "bg-[#fef6e6] text-[#9a6d1a]"
          }`}
        >
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-[#ececf0]">
        <div
          className={`h-full rounded-full transition-all ${
            isReady ? "bg-[#397354]" : "bg-[#c4a052]"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-[#8a91a0]">
        %{progressPercent} tamamlandı
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            {item.isComplete ? (
              <Check className="size-4 shrink-0 text-[#397354]" />
            ) : (
              <X className="size-4 shrink-0 text-[#b7354b]" />
            )}
            <span
              className={`text-xs ${
                item.isComplete
                  ? "font-medium text-[#344057]"
                  : "text-[#8a91a0]"
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
