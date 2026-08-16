import { ArrowLeft, Check, Pencil, Trash2, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProject, type Project } from "../api/projects";
import { getProjectMembers, type ProjectMember } from "../api/members";
import { getApiErrorMessage } from "../api/client";
import { ProjectNotFoundState } from "../components/app/ProjectNotFoundState";
import { useAuth } from "../features/auth/AuthContext";
import { usePageTitle } from "../utils/usePageTitle";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export default function ProjectDetailPage() {
  usePageTitle("Proje");
  const { projectId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);
    getProject(projectId ?? "")
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) {
          setNotFound(true);
        } else {
          setError(getApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setMembersLoading(true);
    getProjectMembers(projectId)
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch(() => {
        if (!cancelled) setMembers([]);
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (notFound) return <ProjectNotFoundState />;

  if (loading) {
    return <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12"><section className="rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Proje yükleniyor…</h2></section></div>;
  }

  if (error || !project) {
    return <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12"><section className="rounded-3xl border border-dashed border-[#e3c8c8] bg-[#fbf7f7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#7a3030]">Proje yüklenemedi.</h2><p className="mt-2 text-sm text-[#8a5a63]">{error ?? "Bilinmeyen bir hata oluştu."}</p><Link to="/discover" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white">Projeleri keşfet</Link></section></div>;
  }

  const from = (location.state as { from?: string } | null)?.from ?? "/discover";
  const isOwner = user !== null && project.ownerId === user.id;

  const handleDelete = async () => {
    if (!window.confirm(`"${project.title}" projesini silmek istediğinden emin misin?`)) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      navigate("/my-project", { replace: true });
    } catch (err) {
      window.alert(getApiErrorMessage(err));
      setDeleting(false);
    }
  };

  return <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
    <Link to={from} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />Geri dön</Link>

    <header className="mt-5 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_14px_40px_rgba(37,44,72,0.05)] sm:p-9">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0] [overflow-wrap:anywhere]">{project.category || "Kategorisiz"}</p>
          <h1 className="mt-2 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-none tracking-[-0.05em] text-[#17233e] [overflow-wrap:anywhere]">{project.title}</h1>
        </div>
        {isOwner && <div className="flex shrink-0 flex-wrap gap-2">
          <Link to={`/projects/${project.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7] hover:bg-[#f7f6ff]"><Pencil className="size-4" />Düzenle</Link>
          <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8d6d6] bg-white px-4 text-sm font-semibold text-[#a52f43] transition hover:bg-[#fff1f3] disabled:cursor-wait disabled:opacity-50"><Trash2 className="size-4" />{deleting ? "Siliniyor…" : "Sil"}</button>
        </div>}
      </div>
      <p className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-7 text-[#5f697c] [overflow-wrap:anywhere]">{project.description}</p>
      <div className="mt-7 flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#ececf0] pt-6 text-sm text-[#687184]">
        <span>Oluşturulma: {dateFormatter.format(new Date(project.createdAt))}</span>
        {isOwner && <span className="inline-flex items-center gap-1.5 font-semibold text-[#3f7a56]"><Check className="size-4" />Bu senin projen</span>}
      </div>
    </header>

    <section className="mt-8 rounded-3xl border border-[#e1e2e8] bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#675fd0]">Takım</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#26334f]">Proje Üyeleri</h2>
        </div>
        {members.length > 0 && <span className="rounded-full bg-[#f2f1fb] px-2.5 py-1 text-xs font-semibold text-[#5148c7]">{members.length}</span>}
      </div>
      {membersLoading ? <div className="mt-5 grid gap-3"><div className="rounded-2xl bg-[#f7f7f9] px-4 py-4 text-sm text-[#8a91a0]">Üyeler yükleniyor…</div></div>
        : members.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <article key={member.userId} className="flex min-w-0 max-w-full items-center gap-3 rounded-2xl border border-[#e7e6ee] bg-white p-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8dff5] text-xs font-bold text-[#5f3f8a]">{member.userName.split(" ").filter(Boolean).map((part) => part[0]?.toUpperCase()).slice(0, 2).join("") || "?"}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#26334f] [overflow-wrap:anywhere]">{member.userName}</p>
                <p className="truncate text-xs text-[#758094]">{member.userHeadline || "Proje üyesi"}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-8 text-center">
          <UsersRound className="mx-auto size-5 text-[#8a91a0]" />
          <p className="mt-2 text-sm text-[#758094]">Henüz üye yok. Onaylanan başvurular ekibe eklenir.</p>
        </div>
      )}
    </section>
  </div>;
}