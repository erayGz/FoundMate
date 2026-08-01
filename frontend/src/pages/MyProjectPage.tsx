import { ArrowRight, CheckCircle2, Eye, FolderKanban, Pencil, Plus, Send, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mockIncomingApplications } from "../data/mockApplicants";
import { PublishChecklist, canPublish } from "../components/app/PublishChecklist";
import { RequiredRoleCard } from "../components/app/RequiredRoleCard";
import { RoleForm } from "../components/app/RoleForm";
import { useProfile } from "../features/onboarding/ProfileContext";
import type { ProjectDraft, RequiredRole } from "../types/projectDraft";
import { ProjectDraftReview } from "../components/app/ProjectDraftReview";
import { loadProjectDraft, clearProjectDraft } from "../utils/projectDraftStorage";
import { createRequiredRole, loadRequiredRoles, saveRequiredRoles } from "../utils/requiredRoleStorage";
import { savePublishedProject } from "../utils/publishedProjectStorage";
import { usePageTitle } from "../utils/usePageTitle";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function MyProjectEmptyState() {
  return (
    <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]">
        <FolderKanban className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#344057]">
        Henüz bir proje taslağın yok.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758094]">
        Projeni tanımlamak için temel bilgileri girebilir ve taslak olarak kaydedebilirsin.
      </p>
      <Link
        to="/projects/new"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white"
      >
        Proje oluşturmaya başla <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

export default function MyProjectPage() {
  usePageTitle("Projem");
  const { profile } = useProfile();
  const [draft, setDraft] = useState<ProjectDraft | null>(() => loadProjectDraft());
  const [roles, setRoles] = useState<RequiredRole[]>(() => loadRequiredRoles());
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<RequiredRole | null>(null);
  const [published, setPublished] = useState(false);

  const pendingApplicationCount = useMemo(
    () => mockIncomingApplications.filter((a) => a.status === "pending").length,
    [],
  );

  const clearProject = () => {
    if (!window.confirm("Bu proje taslağını temizlemek istediğinden emin misin?")) return;
    clearProjectDraft();
    saveRequiredRoles([]);
    setDraft(null);
    setRoles([]);
    setShowRoleForm(false);
    setEditingRole(null);
    setPublished(false);
  };

  const clearRoles = () => {
    if (!window.confirm("Tüm rolleri silmek istediğinden emin misin?")) return;
    saveRequiredRoles([]);
    setRoles([]);
    setShowRoleForm(false);
    setEditingRole(null);
  };

  const addRole = (title: string, responsibility: string, experienceLevel: string, skills: string[]) => {
    const newRole = createRequiredRole(title, responsibility, experienceLevel, skills);
    const next = [...roles, newRole];
    setRoles(next);
    saveRequiredRoles(next);
    setShowRoleForm(false);
  };

  const updateRole = (title: string, responsibility: string, experienceLevel: string, skills: string[]) => {
    if (!editingRole) return;
    const next = roles.map((r) =>
      r.id === editingRole.id ? { ...r, title, responsibility, experienceLevel, skills } : r,
    );
    setRoles(next);
    saveRequiredRoles(next);
    setEditingRole(null);
  };

  const deleteRole = (roleId: string) => {
    const next = roles.filter((r) => r.id !== roleId);
    setRoles(next);
    saveRequiredRoles(next);
  };

  const handlePublish = () => {
    if (!draft || !canPublish(draft, roles)) return;
    const now = new Date().toISOString();
    savePublishedProject({
      ...draft,
      roles,
      ownerName: profile?.name ?? "Ben",
      ownerHeadline: profile?.headline ?? "",
      publishedAt: now,
    });
    setPublished(true);
  };

  if (!draft) {
    return (
      <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Yerel proje taslağı</p>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em] text-[#17233e]">
            Henüz bir proje taslağın yok.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">
            İlk projenin temel bilgilerini eklemek için aşağıdaki butonu kullanabilirsin.
          </p>
        </header>
        <MyProjectEmptyState />
      </div>
    );
  }

  if (published) {
    return (
      <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
        <section className="rounded-3xl border border-[#cde7d6] bg-[#eef8f1] px-5 py-16 text-center">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-white text-[#32704c]">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,4rem)] font-semibold tracking-[-0.045em] text-[#17233e]">
            Projen yayında!
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#687184]">
            "{draft.name}" artık Discover sayfasında görünüyor. Gelen başvuruları
            takip edebilirsin.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/discover"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white"
            >
              <Eye className="size-4" />
              Discover'da gör
            </Link>
            <Link
              to="/my-project/applications"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7]"
            >
              <UsersRound className="size-4" />
              Başvuruları gör
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
      <header className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">
            Yerel proje taslağı
          </p>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em] text-[#17233e]">
            {draft.name}
          </h1>
          <p className="mt-2 text-sm text-[#687184] [overflow-wrap:anywhere]">
            {draft.category}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            to="/projects/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7]"
          >
            <Pencil className="size-4" />
            Düzenle
          </Link>
          <button
            type="button"
            onClick={clearProject}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8d6d6] bg-white px-4 text-sm font-semibold text-[#a52f43] hover:bg-[#fff1f3]"
          >
            <Trash2 className="size-4" />
            Taslağı temizle
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/my-project/preview"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7]"
        >
          <Eye className="size-4" />
          Yayın önizleme
        </Link>
        <Link
          to="/my-project/applications"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7]"
        >
          <UsersRound className="size-4" />
          Gelen başvurular
          {pendingApplicationCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#a52f43] text-[10px] font-bold text-white">
              {pendingApplicationCount}
            </span>
          )}
        </Link>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-6 text-[#687184]">
        Taslak bilgilerini buradan görüntüleyebilir, gerekli rolleri ekleyebilir ve
        yayına hazır hale getirebilirsin.
      </p>

      <div className="mt-7 min-w-0 space-y-8">
        <section className="min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 shadow-[0_14px_40px_rgba(37,44,72,0.04)] sm:p-8">
          <ProjectDraftReview draft={draft} />
          <div className="mt-7 border-t border-[#e6e6eb] pt-6 text-xs text-[#8a91a0]">
            <p>Oluşturulma: {dateFormatter.format(new Date(draft.createdAt))}</p>
            <p className="mt-1">Son güncelleme: {dateFormatter.format(new Date(draft.updatedAt))}</p>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 shadow-[0_14px_40px_rgba(37,44,72,0.04)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Ekip</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#26334f]">
                Gerekli roller
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#687184]">
                Projen için aradığın rolleri tanımla.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRole(null);
                setShowRoleForm(true);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white"
            >
              <Plus className="size-4" />
              Rol ekle
            </button>
            <button
              type="button"
              onClick={clearRoles}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8d6d6] bg-white px-4 text-sm font-semibold text-[#a52f43] hover:bg-[#fff1f3]"
            >
              <Trash2 className="size-4" />
              Hepsini sil
            </button>
          </div>

          {showRoleForm && (
            <div className="mt-6">
              <RoleForm
                initialRole={editingRole ?? undefined}
                onSave={editingRole ? updateRole : addRole}
                onCancel={() => {
                  setShowRoleForm(false);
                  setEditingRole(null);
                }}
              />
            </div>
          )}

          {roles.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {roles.map((role) => (
                <RequiredRoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => {
                    setEditingRole(role);
                    setShowRoleForm(true);
                  }}
                  onDelete={() => deleteRole(role.id)}
                />
              ))}
            </div>
          ) : (
            !showRoleForm && (
              <div className="mt-6 rounded-2xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-10 text-center">
                <p className="text-sm text-[#758094]">
                  Henüz bir rol eklemedin. Projen için aradığın rolleri yukarıdaki
                  butonla ekleyebilirsin.
                </p>
              </div>
            )
          )}
        </section>

        <section className="min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 shadow-[0_14px_40px_rgba(37,44,72,0.04)] sm:p-8">
          <PublishChecklist draft={draft} roles={roles} />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish(draft, roles)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.16)] disabled:cursor-not-allowed disabled:bg-[#8d88d8] disabled:shadow-none"
            >
              <Send className="size-4" />
              Projeyi yayınla
            </button>
            <p className="text-xs text-[#8a91a0]">
              Yayınlama işlemi yereldir ve yalnızca bu tarayıcıda saklanır.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
