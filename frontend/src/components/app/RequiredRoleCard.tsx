import { Pencil, Trash2, X } from "lucide-react";
import type { RequiredRole } from "../../types/projectDraft";

export function RequiredRoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: RequiredRole;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex min-w-0 max-w-full flex-col rounded-2xl border border-[#e1e2e8] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#26334f] [overflow-wrap:anywhere]">
            {role.title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#687184] [overflow-wrap:anywhere]">
            {role.responsibility}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`${role.title} rolünü düzenle`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-[#8a91a0] hover:bg-[#f5f3ff] hover:text-[#5148c7]"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`${role.title} rolünü sil`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-[#8a91a0] hover:bg-[#fff1f3] hover:text-[#a52f43]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {role.experienceLevel && (
        <div className="mt-3">
          <span className="max-w-full rounded-lg border border-[#cfcaf5] bg-[#f0eeff] px-2 py-0.5 text-[10px] font-medium text-[#4f46bd] [overflow-wrap:anywhere]">
            {role.experienceLevel}
          </span>
        </div>
      )}
      {role.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {role.skills.map((skill) => (
            <span
              key={skill}
              className="max-w-full rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2 py-0.5 text-[10px] font-medium text-[#4e576b] [overflow-wrap:anywhere]"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
